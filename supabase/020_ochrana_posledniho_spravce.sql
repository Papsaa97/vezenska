-- ═════════════════════════════════════════════════════════════════════════════
-- 020 — Poslednímu správci nelze odebrat roli ani ho smazat
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editor. Je idempotentní.
--
-- NÁLEZ
--   Správce si smí měnit roli komukoli včetně sebe, a nic nehlídalo, že tím
--   může být portál bez správce úplně. Stalo se to: jediný správce si v dialogu
--   „Upravit profil" přepnul roli na velitel_tridy, aby si otestoval chování
--   aplikace, a tím se odřízl. Zpátky už se nedostal, protože:
--
--     - roli smí měnit jen správce, a is_admin() byla nově nepravda pro všechny
--     - vlastní roli si změnit nelze, to blokuje `role = my_role()` z migrace 018
--
--   Obojí funguje správně — jen teď proti jedinému člověku, který to mohl
--   spravit. Jediná cesta zpět vedla přes SQL Editor.
--
--   admin_delete_user() přitom mazání sebe sama hlídá od migrace 015. Odebrání
--   role, které má stejný následek, nehlídalo nic.
--
-- ŘEŠENÍ
--   Trigger, ne politika. RLS se na service_role ani na postgres nevztahuje,
--   takže by díru nezavřela; trigger platí i pro ně. Povyšování zůstává vždy
--   dovolené, takže se tím nedá zamknout — zakázaný je jen poslední krok, po
--   kterém by nezbyl žádný správce.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─── 1. Strážní funkce ───────────────────────────────────────────────────────
--
-- SECURITY DEFINER kvůli spolehlivosti počtu: pod RLS by volající viděl jen
-- profily, na které má právo, a počet správců by vyšel špatně. Rekurze nehrozí,
-- protože jde o SELECT, který trigger nespouští.
--
-- Funkce vrací typ trigger, takže ji Postgres odmítne zavolat přes RPC
-- ("trigger functions can only be called as triggers") — v linteru se objeví
-- ve stejné skupině falešných poplachů jako handle_new_user(), viz migrace 015.

CREATE OR REPLACE FUNCTION public.chranit_posledniho_spravce()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  zbyva_spravcu integer;
BEGIN
  -- Účet, který správcem nebyl, neřešíme vůbec.
  IF OLD.role IS DISTINCT FROM 'admin' THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  -- Správcem zůstává — jen se mu mění něco jiného.
  IF TG_OP = 'UPDATE' AND NEW.role = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Sem se dostaneme jen tehdy, když účet o roli správce přichází.
  SELECT count(*) INTO zbyva_spravcu
  FROM public.profiles
  WHERE role = 'admin' AND id <> OLD.id;

  IF zbyva_spravcu = 0 THEN
    RAISE EXCEPTION
      'Účet % je posledním správcem portálu. Nejdřív povyšte na správce jiný účet, teprve pak lze tomuhle roli odebrat.',
      coalesce(OLD.email, OLD.id::text)
      USING ERRCODE = '42501';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$function$;

-- ─── 2. Trigger ──────────────────────────────────────────────────────────────
--
-- UPDATE OF role: na dotazy, které sloupec role vůbec nezmiňují, se trigger
-- nespustí, takže běžné úpravy profilu nic nestojí.
--
-- DELETE je tu proto, že profiles.id má cizí klíč na auth.users s ON DELETE
-- CASCADE. Smazání účtu tedy maže i profil a trigger to zachytí — včetně cesty
-- přes admin_delete_user().

DROP TRIGGER IF EXISTS chranit_posledniho_spravce ON public.profiles;
CREATE TRIGGER chranit_posledniho_spravce
  BEFORE UPDATE OF role OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.chranit_posledniho_spravce();

-- ─── 3. Ověření ──────────────────────────────────────────────────────────────
--
-- (a) Trigger existuje:

SELECT tgname AS trigger_name, pg_get_triggerdef(oid) AS definice
FROM pg_trigger
WHERE tgrelid = 'public.profiles'::regclass AND NOT tgisinternal;

-- (b) Kolik je správců. Je-li jich víc než jeden, pojistka se v běžném provozu
--     neprojeví vůbec:

SELECT role, count(*) AS pocet FROM public.profiles GROUP BY role ORDER BY role;

-- (c) Zkouška nasucho. Musí skončit chybou 42501, pokud je správce jediný:
--
--     BEGIN;
--       UPDATE public.profiles SET role = 'student'
--        WHERE id = (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1);
--     ROLLBACK;

-- ─── Nouzový východ ──────────────────────────────────────────────────────────
--
-- Trigger platí i pro postgres v SQL Editoru. Je-li ho potřeba obejít — třeba
-- při hromadném čištění databáze — vypne se a zase zapne takto:
--
--     ALTER TABLE public.profiles DISABLE TRIGGER chranit_posledniho_spravce;
--     -- … potřebné zásahy …
--     ALTER TABLE public.profiles ENABLE  TRIGGER chranit_posledniho_spravce;
--
-- Povýšení na správce pojistka nikdy neblokuje, takže se s ní nedá zamknout:
-- z každého stavu vede ven přes UPDATE … SET role = 'admin'.
