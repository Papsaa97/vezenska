-- ============================================================================
-- 032  Velitel třídy si nesmí sám přepsat `user_class` (a nikdo svůj `email`)
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- Sloučená UPDATE politika nad public.profiles (migrace 019) hlídá ve
-- WITH CHECK jediný sloupec — `role`:
--
--   WITH CHECK ( is_admin()
--                OR (auth.uid() = id AND role = my_role()) )
--
-- Eskalaci role to uzavírá, jenže `user_class` je nad public.class_boards
-- rovněž autorizační údaj: can_manage_class() z migrace 013 pouští velitele
-- k nástěnce právě podle my_class() = profiles.user_class. Sloupec přitom má
-- role `authenticated` sloupcově povolený k zápisu a žádný trigger ho nehlídá
-- (jediný trigger nad profiles je chranit_posledniho_spravce, a ten reaguje
-- na UPDATE OF role). Velitel si tedy pod vlastním JWT mohl zapsat libovolnou
-- třídu a získat zápis do cizí nástěnky.
--
-- Ověřeno na produkci 18. 9. 2026 v transakci ukončené ROLLBACK, pod JWT
-- jediného účtu s rolí velitel_tridy:
--
--   před přepsáním  SELECT count(*) FROM class_boards
--                   WHERE can_manage_class(class_name)          → 0
--   UPDATE profiles SET user_class = 'ZOP A11' WHERE id = <on>  → 1 řádek
--   po přepsání     tentýž count                                → 1
--
-- Repozitář slibuje opak na třech místech: 013_harden_rls.sql:45–48
-- („Zařazení nastavuje správce ve správě uživatelů“), README.md:162–164
-- a README.md:200 („Velitel třídy smí upravovat výhradně nástěnku své
-- vlastní třídy“).
--
-- Stejná politika nehlídala ani `email`. Tentýž účet si ho ve zkoušce přepsal
-- na 'podvrh@example.com'. Tím se public.profiles.email rozejde s
-- auth.users.email, na který se váže set_admin i konzole správce.
--
-- CO TENHLE SKRIPT DĚLÁ
-- 1. Zavádí my_email() — protějšek my_role() a my_class(), jen nad auth.users.
-- 2. Přepisuje UPDATE politiku tak, aby nesprávci navíc platilo:
--      - je-li jeho rolí velitel_tridy, `user_class` se měnit nesmí,
--      - `email` musí souhlasit s auth.users.email.
--
-- PROČ JE ZÁMEK NA `user_class` VÁZANÝ NA ROLI, a ne plošný
-- Pro studenta a lektora je `user_class` pouhá předvolba: my_class() nemá
-- jiného konzumenta než can_manage_class(), a ta bere třídu v potaz výhradně
-- u role velitel_tridy. Plošný zámek by tedy nic dalšího neuzavřel, zato by
-- rozbil výběr „Moje třída“ (ClassBulletinBoard.tsx:186) jedenácti studentům
-- — a aplikace nemá pro správce žádné pole, kterým by ji místo nich vyplnil
-- (UserManager.tsx umí měnit jen jméno a roli). Autorizační význam má třída
-- jen u velitele, a jen tam se zamyká.
--
-- Důsledek pro správu účtů: třídu veliteli nastavuje správce (dnes v Supabase
-- SQL Editoru, viz README.md:162–164), protože si ji velitel sám nezapíše.
-- Přiděluje-li správce roli velitel_tridy účtu, který už nějakou třídu má,
-- musí ji ověřit — mohla si ji zvolit ta osoba sama, dokud byla studentem.
--
-- Spouštět po: 019_vykon_politik_a_indexu.sql. Skript je idempotentní.
-- ============================================================================

-- ─── 1. my_email() ───────────────────────────────────────────────────────────
--
-- SECURITY DEFINER je podmínka: do auth.users role `authenticated` nevidí.
-- STABLE znamená, že funkce v průběhu UPDATE vidí snímek z doby před ním —
-- stejně jako my_role() v podmínce `role = my_role()`. Pro e-mail na tom
-- nezáleží (auth.users se tímhle UPDATE nemění), ale tvar zůstává stejný.
--
-- NULL se nepřevádí na prázdný řetězec. Chybí-li účet v auth.users, vyjde
-- porovnání jako NULL a WITH CHECK zápis zamítne — fail-closed, jako u
-- my_role() (viz 018_get_role_neni_volatelna_z_klienta.sql).

CREATE OR REPLACE FUNCTION public.my_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid();
$$;

REVOKE ALL    ON FUNCTION public.my_email() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.my_email() FROM anon;
GRANT  EXECUTE ON FUNCTION public.my_email() TO authenticated;
GRANT  EXECUTE ON FUNCTION public.my_email() TO service_role;

COMMENT ON FUNCTION public.my_email() IS
  'E-mail přihlášeného účtu z auth.users. Slouží WITH CHECK politice nad '
  'public.profiles, aby se profilový e-mail nemohl rozejít s přihlašovacím.';

-- ─── 2. UPDATE politika nad profiles ─────────────────────────────────────────
--
-- USING se nemění (správce vše, ostatní vlastní řádek). Ve WITH CHECK
-- přibývají k dosavadní podmínce `role = my_role()` dvě další; správce jimi
-- dotčen není, ten má celou větev přes OR.
--
-- `IS NOT DISTINCT FROM` místo `=` schválně: obě strany mohou být NULL
-- (velitel bez zařazení) a `NULL = NULL` je NULL, což by WITH CHECK vyhodnotil
-- jako zamítnutí a takový účet by si nemohl uložit ani jméno.

DROP POLICY IF EXISTS "Úprava profilu: správce vše, ostatní vlastní bez změny role" ON public.profiles;

CREATE POLICY "Úprava profilu: správce vše, ostatní vlastní bez změny role"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((select public.is_admin()) OR (select auth.uid()) = id)
  WITH CHECK (
    (select public.is_admin())
    OR (
      (select auth.uid()) = id
      AND role = (select public.my_role())
      AND (
        (select public.my_role()) IS DISTINCT FROM 'velitel_tridy'
        OR user_class IS NOT DISTINCT FROM (select public.my_class())
      )
      AND email IS NOT DISTINCT FROM (select public.my_email())
    )
  );

-- ─── 3. Ověření ──────────────────────────────────────────────────────────────
--
-- (a) Tvar politiky:
--
--   SELECT cmd, with_check FROM pg_policies
--   WHERE schemaname='public' AND tablename='profiles' AND cmd='UPDATE';
--
-- POZOR na název: Postgres zkracuje identifikátory na 63 BAJTŮ a české znaky
-- jsou v UTF-8 víceslabičné, takže v katalogu stojí uříznuté
-- „Úprava profilu: správce vše, ostatní vlastní bez změny ro“.
--
-- (b) Zkouška pod JWT velitele (uvnitř transakce, vždy ROLLBACK):
--
--   BEGIN;
--   SELECT set_config('request.jwt.claims',
--                     '{"sub":"<uuid velitele>","role":"authenticated"}', true);
--   SET LOCAL ROLE authenticated;
--   UPDATE public.profiles SET user_class = 'ZOP A11' WHERE id = '<uuid>';
--     -- musí skončit 42501 „new row violates row-level security policy“
--   UPDATE public.profiles SET email = 'podvrh@example.com' WHERE id = '<uuid>';
--     -- rovněž 42501
--   UPDATE public.profiles SET full_name = 'Jiné jméno' WHERE id = '<uuid>';
--     -- MUSÍ projít: zámek se týká jen třídy a e-mailu
--   ROLLBACK;
--
-- (c) Student si třídu dál zvolit smí (tamtéž, pod JWT studenta):
--
--   UPDATE public.profiles SET user_class = 'ZOP A12' WHERE id = '<uuid>';
--     -- 1 řádek
--
-- (d) Správce smí obojí u kohokoli — nastavení třídy veliteli je jeho úloha.
