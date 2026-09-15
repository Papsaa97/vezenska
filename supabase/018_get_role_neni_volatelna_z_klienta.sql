-- ═════════════════════════════════════════════════════════════════════════════
-- 018 — get_role(uuid) přestává být volatelná z klienta
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editor. Je idempotentní.
--
-- NÁLEZ
--   public.get_role(uuid) je SECURITY DEFINER, takže čte public.profiles mimo
--   RLS, a cizí UUID bere jako parametr. Role authenticated na ni měla EXECUTE,
--   takže si kterýkoli přihlášený uživatel zjistil roli libovolného účtu,
--   jehož ID zná:
--
--       POST /rest/v1/rpc/get_role   {"uid": "<cizí UUID>"}   ->   "admin"
--
--   Únik je omezený — vrací jen roli a je potřeba znát UUID — ale get_role je
--   interní pomocník pro RLS politiky, ne veřejné API.
--
-- PROČ JE JINÁ NEŽ OSTATNÍ POMOCNÉ FUNKCE
--   Migrace 015 uzavřela, že is_admin(), is_staff(), my_class(), get_role()
--   a can_manage_class() musí zůstat volatelné pro authenticated, protože je
--   používají RLS politiky. U get_role() to ale platí jen zdánlivě:
--
--     - is_admin(), is_staff(), my_class() — bez parametru, vracejí výhradně
--       údaj o volajícím (auth.uid()); cizí data z nich nedostaneš
--     - can_manage_class(text)            — bere jméno třídy, ale vrací jen
--       boolean o volajícím
--     - get_role(uuid)                    — jediná, která vrací údaj o KOMKOLI
--
--   A přímo v politice ji volá jediné místo v celé databázi (ověřeno dotazem
--   nad pg_policies): WITH CHECK u "Povolit úpravu vlastního jména bez změny
--   role" nad public.profiles. Tam je ale argument vždy auth.uid(), protože
--   politika vedle toho vyžaduje auth.uid() = id. Bezparametrová varianta tedy
--   stačí a EXECUTE pro klienta je zbytečný.
--
--   is_admin(), is_staff() a can_manage_class() volají get_role() uvnitř sebe,
--   jenže všechny tři jsou SECURITY DEFINER s vlastníkem postgres. Oprávnění
--   se uvnitř nich kontroluje proti postgres, ne proti volajícímu, takže je
--   odebrání práv roli authenticated nerozbije.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─── 1. Bezparametrová my_role() ─────────────────────────────────────────────
--
-- Stejný tvar jako my_class() z migrace 013. SECURITY DEFINER je tu podmínka,
-- ne pohodlí: politika, kterou funkce v kroku 2 obsluhuje, je sama nad
-- public.profiles, takže SECURITY INVOKER by znamenal návrat rekurze, kterou
-- řešila migrace 017 (42P17).
--
-- NULL se schválně nepřevádí na prázdný řetězec. Chybí-li profil, vyjde
-- porovnání `role = my_role()` jako NULL a WITH CHECK zápis zamítne.
-- Fail-closed — a přesně tak se chovala i původní get_role(id).

CREATE OR REPLACE FUNCTION public.my_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

REVOKE EXECUTE ON FUNCTION public.my_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.my_role() FROM anon;
GRANT  EXECUTE ON FUNCTION public.my_role() TO authenticated;
GRANT  EXECUTE ON FUNCTION public.my_role() TO service_role;

-- ─── 2. Politika nad profiles přestává volat get_role(id) ────────────────────
--
-- Jinak shodná s tvarem, který založila migrace 017 — mění se jediný výraz ve
-- WITH CHECK. Význam zůstává stejný, protože politika vedle toho vyžaduje
-- auth.uid() = id, takže get_role(id) byla vždycky rolí volajícího.
--
-- Obě varianty čtou starou hodnotu role: STABLE funkce vidí snímek z doby před
-- UPDATE, takže se dál porovnává nová role se starou a eskalace role neprojde.

DROP POLICY IF EXISTS "Povolit úpravu vlastního jména bez změny role" ON public.profiles;
CREATE POLICY "Povolit úpravu vlastního jména bez změny role"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = public.my_role());

-- ─── 3. Odebrání práv na get_role(uuid) ──────────────────────────────────────
--
-- Zůstávají postgres a service_role. service_role je serverový klíč, který RLS
-- obchází tak jako tak a do prohlížeče nepatří.

REVOKE EXECUTE ON FUNCTION public.get_role(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_role(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_role(uuid) FROM authenticated;

-- ─── 4. Ověření ──────────────────────────────────────────────────────────────
--
-- (a) Žádná politika už nesmí volat get_role. Musí vrátit prázdný výsledek:

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual LIKE '%get_role%' OR with_check LIKE '%get_role%');

-- (b) Práva. U get_role už nesmí být authenticated ani anon, u my_role být má:

SELECT p.proname AS funkce, CAST(p.proacl AS text) AS prava
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('get_role', 'my_role')
ORDER BY p.proname;

-- (c) Ruční zkouška v aplikaci: přihlášený uživatel si smí změnit jméno
--     v profilu, ale ne roli. Obojí se musí chovat jako dosud.

-- ─── Co se ZÁMĚRNĚ nemění ────────────────────────────────────────────────────
--
-- get_role(uuid) se nemaže ani nepřepisuje na SECURITY INVOKER. Volají ji
-- is_admin(), is_staff() a can_manage_class(), kterým SECURITY DEFINER dovoluje
-- číst profiles mimo RLS — bez toho se vrací rekurze z migrace 017.
--
-- Hlášení linteru „Signed-In Users Can Execute SECURITY DEFINER Function"
-- nezmizí úplně: is_admin(), is_staff(), my_class(), can_manage_class(), nově
-- my_role() a admin_delete_user() zůstávají pro authenticated volatelné,
-- protože je potřebují RLS politiky a administrátorská konzole. Všechny ale
-- pracují výhradně s auth.uid(), takže cizí údaj z nich nevypadne. Po tomhle
-- skriptu z hlášení ubude get_role() — jediná, která to o sobě říct nemohla.
