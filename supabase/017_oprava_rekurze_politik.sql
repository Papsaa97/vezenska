-- ═════════════════════════════════════════════════════════════════════════════
-- 017 — Oprava "infinite recursion detected in policy for relation profiles"
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editor. Je idempotentní.
--
-- PŘÍZNAK
--   Aplikace hlásí: infinite recursion detected in policy for relation
--   "profiles" (42P17). Profil se nenačte, uživatel se tváří jako student,
--   nejde uložit nic — otázky, uživatelé ani nástěnka.
--
-- PŘÍČINA
--   Nad public.profiles existuje politika, která sama čte public.profiles:
--
--       USING (EXISTS (SELECT 1 FROM public.profiles p
--                      WHERE p.id = auth.uid() AND p.role = 'admin'))
--
--   Politika se odkazuje na tabulku, na které je definovaná. Postgres při
--   vyhodnocování skončí chybou 42P17. A protože PERMISSIVE politiky se slučují
--   přes OR, stačí JEDNA taková — shodí čtení profilu i všem správným politikám
--   vedle sebe.
--
--   Typicky vznikne ručním založením v dashboardu. Starší skript
--   fix_admin_rls_recursion.sql maže takové politiky podle PŘESNÝCH názvů,
--   takže politiku s jiným názvem mine. Tenhle skript je hledá podle DEFINICE.
--
--   ⚠️ fix_admin_rls_recursion.sql dnes už nespouštějte: přepsal by
--   admin_delete_user() a is_admin() zpět na verze bez pojistek z migrace 015.
--
-- PROČ TO NENAŠLA MIGRACE 016
--   Diagnostika v 016 běží v SQL Editoru jako role postgres, která RLS obchází.
--   Rekurzivní politika se tam vůbec nespustí, takže 016 vypsala „✅ smí
--   spravovat otázky", zatímco aplikace byla rozbitá. Krok 5 níže to řeší:
--   ověřuje se v roli authenticated, tedy tak, jak to vidí aplikace.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─── 1. Co je špatně (před opravou) ──────────────────────────────────────────
--
-- Politiky, jejichž podmínka čte public.profiles. U tabulky profiles je to
-- rekurze. U ostatních tabulek to rekurze není, ale dědí se: jakmile má
-- profiles rekurzivní politiku, spadne i jejich vyhodnocení.

SELECT
  tablename,
  cmd,
  policyname,
  CASE WHEN tablename = 'profiles'
       THEN '❌ REKURZE — politika nad profiles čte profiles'
       ELSE '⚠️ inline dotaz na profiles — nahradíme funkcí is_staff()'
  END AS problem
FROM pg_policies
WHERE schemaname = 'public'
  AND (coalesce(qual, '') || ' ' || coalesce(with_check, '')) ~ '\mprofiles\M'
ORDER BY tablename, cmd, policyname;

-- ─── 2. Shodit VŠECHNY sebe-odkazující politiky nad profiles ─────────────────
--
-- Podle definice, ne podle názvu — právě proto, že názvy se liší instalaci
-- od instalace. Správné politiky (auth.uid() = id, is_admin(), get_role(id))
-- se nehledají, protože profiles v podmínce nemají: roli čtou přes
-- SECURITY DEFINER funkce, které RLS obcházejí.

DO $$
DECLARE r record; n INT := 0;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND (coalesce(qual, '') || ' ' || coalesce(with_check, '')) ~ '\mprofiles\M'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
    RAISE NOTICE 'Odstraněna rekurzivní politika profiles.%', r.policyname;
    n := n + 1;
  END LOOP;

  IF n = 0 THEN
    RAISE NOTICE 'Žádná rekurzivní politika nad profiles nenalezena.';
  END IF;
END $$;

-- ─── 3. Doplnit správné politiky nad profiles ────────────────────────────────
--
-- Krok 2 mohl shodit jedinou politiku pro SELECT. Bez tohoto kroku by se
-- uživatel nedostal ani ke svému profilu — proto se sada zakládá znovu celá.

DROP POLICY IF EXISTS "Čtení vlastního profilu, správce čte všechny" ON public.profiles;
CREATE POLICY "Čtení vlastního profilu, správce čte všechny"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Povolit vytvoření vlastního profilu" ON public.profiles;
CREATE POLICY "Povolit vytvoření vlastního profilu"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'student');

DROP POLICY IF EXISTS "Povolit úpravu vlastního jména bez změny role" ON public.profiles;
CREATE POLICY "Povolit úpravu vlastního jména bez změny role"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = public.get_role(id));

DROP POLICY IF EXISTS "Pouze administrátor může měnit role" ON public.profiles;
CREATE POLICY "Pouze administrátor může měnit role"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── 4. quiz_questions: inline dotaz → is_staff() ────────────────────────────
--
-- quiz_questions.sql ověřuje roli přes EXISTS (SELECT ... FROM public.profiles).
-- To není rekurze, ale je to křehké: vyhodnocení podléhá RLS nad profiles,
-- takže jakákoli budoucí chyba v politikách profiles znovu shodí i úpravy
-- otázek. is_staff() je SECURITY DEFINER, RLS obchází a je na tom nezávislá.

DROP POLICY IF EXISTS "Povolit vkládání pro lektory a administrátory" ON public.quiz_questions;
CREATE POLICY "Povolit vkládání pro lektory a administrátory"
  ON public.quiz_questions FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Povolit úpravy pro lektory a administrátory" ON public.quiz_questions;
CREATE POLICY "Povolit úpravy pro lektory a administrátory"
  ON public.quiz_questions FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Povolit mazání pro lektory a administrátory" ON public.quiz_questions;
CREATE POLICY "Povolit mazání pro lektory a administrátory"
  ON public.quiz_questions FOR DELETE TO authenticated
  USING (public.is_staff());

-- ─── 5. Ověření V ROLI UŽIVATELE (to, co 016 neuměla) ────────────────────────
--
-- Všechno výše i celá diagnostika v 016 běží jako postgres, který RLS obchází.
-- Tenhle blok se přepne do role authenticated a podstrčí auth.uid() stejně
-- jako PostgREST, takže uvidí přesně to, co uvidí aplikace.

DO $$
DECLARE
  r          record;
  v_role     TEXT;
  v_staff    BOOLEAN;
  v_admin    BOOLEAN;
  can_switch BOOLEAN := TRUE;
BEGIN
  BEGIN
    EXECUTE 'SET LOCAL ROLE authenticated';
    EXECUTE 'RESET ROLE';
  EXCEPTION WHEN OTHERS THEN
    can_switch := FALSE;
  END;

  IF NOT can_switch THEN
    RAISE NOTICE 'Nelze se přepnout do role authenticated — ověření přeskočeno.';
    RAISE NOTICE 'Zkontrolujte to pak přímo v aplikaci (červený pruh nahoře).';
    RETURN;
  END IF;

  RAISE NOTICE '── Ověření v roli authenticated (tak to vidí aplikace) ──';

  FOR r IN SELECT id, email FROM public.profiles ORDER BY created_at LOOP
    BEGIN
      PERFORM set_config('request.jwt.claim.sub', r.id::text, true);
      EXECUTE 'SET LOCAL ROLE authenticated';

      SELECT role INTO v_role FROM public.profiles WHERE id = r.id;
      SELECT public.is_staff(), public.is_admin() INTO v_staff, v_admin;

      EXECUTE 'RESET ROLE';

      IF v_role IS NULL THEN
        RAISE NOTICE '❌ % — profil se nepodařilo přečíst (RLS nevrátila řádek)', r.email;
      ELSIF v_admin THEN
        RAISE NOTICE '✅ % — role %, smí spravovat otázky, uživatele i nástěnky', r.email, v_role;
      ELSIF v_staff THEN
        RAISE NOTICE '✅ % — role %, smí spravovat otázky a nástěnky', r.email, v_role;
      ELSE
        RAISE NOTICE '•  % — role %, běžný student', r.email, v_role;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ % — SELHALO: % (SQLSTATE %)', r.email, SQLERRM, SQLSTATE;
    END;
  END LOOP;

  BEGIN EXECUTE 'RESET ROLE'; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- ─── 6. Zbyla ještě někde politika s inline dotazem na profiles? ─────────────
--
-- Po opravě má tenhle dotaz vrátit PRÁZDNÝ výsledek (0 řádků).

SELECT tablename, cmd, policyname, coalesce(qual, with_check) AS podminka
FROM pg_policies
WHERE schemaname = 'public'
  AND (coalesce(qual, '') || ' ' || coalesce(with_check, '')) ~ '\mprofiles\M'
ORDER BY tablename, cmd, policyname;

-- ─── Co dělat, když krok 5 hlásí ❌ ──────────────────────────────────────────
--
--   „profil se nepodařilo přečíst"  → účet nemá řádek v public.profiles;
--                                     spusťte supabase/016_diagnostika_zapisu.sql
--   role je 'student', a nemá být    → tamtéž, krok 5 (nastavení správce)
--   jiná chyba se SQLSTATE           → pošlete ji celou, je v ní příčina
--
-- Po opravě se v aplikaci ODHLASTE A ZNOVU PŘIHLASTE — role se čte při načtení
-- profilu, takže stará relace ukazuje stará oprávnění.
