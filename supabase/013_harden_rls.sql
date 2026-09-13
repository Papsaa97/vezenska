-- Migrace 013: Utažení RLS politik, které byly ve skutečnosti otevřené všem
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor).
-- Je bezpečné jej spustit vícekrát (idempotentní).
--
-- Tři problémy, které tato migrace řeší:
--
--   1. public.user_feedback — politiky byly popsané jako "pro lektory a správce",
--      ale podmínka u SELECT, UPDATE i DELETE byla doslova USING (true) pro roli
--      authenticated. Kterýkoli student si tedy mohl přečíst veškerou zpětnou
--      vazbu kolegů včetně jmen, změnit jí obsah nebo ji smazat. INSERT byl navíc
--      WITH CHECK (true) bez TO authenticated, takže zapisovat mohl i nepřihlášený.
--
--   2. public.profiles — SELECT byl USING (true), takže jediný dotaz z prohlížeče
--      vrátil kompletní jmenný seznam příslušníků a zaměstnanců s e-maily. Cizí
--      profily potřebuje číst jen administrátorská konzole.
--
--   3. public.class_boards — politiky přidělovaly roli velitel_tridy zápis ke
--      VŠEM třídám. Omezení na vlastní třídu existovalo jen v komponentě
--      ClassBulletinBoard, a to na základě hodnoty z localStorage.
--
-- Role se všude zjišťuje přes SECURITY DEFINER funkce, nikdy přes inline
-- "EXISTS (SELECT ... FROM public.profiles ...)" — viz varování v profiles.sql.
--
-- Předpoklady: 010_profiles_user_class.sql, 011_profiles_role_constraint.sql
-- a funkce get_role()/is_admin() z profiles.sql.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Pomocné funkce
-- ─────────────────────────────────────────────────────────────────────────────

/** True pro lektora i správce — tedy pro kohokoli, kdo spravuje obsah. */
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.get_role(auth.uid()) IN ('lektor', 'admin');
$$;

REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

/**
 * Třída přihlášeného uživatele. Vrací NULL, pokud zařazení není nastavené —
 * politiky pak selžou (fail-closed), což je úmysl: velitel bez vyplněné třídy
 * nesmí upravovat žádnou. Zařazení nastavuje správce ve správě uživatelů.
 */
CREATE OR REPLACE FUNCTION public.my_class()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT user_class FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.my_class() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_class() TO authenticated;

/** True, smí-li přihlášený uživatel spravovat nástěnku dané třídy. */
CREATE OR REPLACE FUNCTION public.can_manage_class(target_class TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    public.is_staff()
    OR (
      public.get_role(auth.uid()) = 'velitel_tridy'
      AND public.my_class() IS NOT NULL
      AND lower(trim(target_class)) = lower(trim(public.my_class()))
    );
$$;

REVOKE ALL ON FUNCTION public.can_manage_class(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_class(TEXT) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. public.profiles — cizí profily čte jen správce
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Povolit čtení profilů pro přihlášené" ON public.profiles;
DROP POLICY IF EXISTS "Čtení vlastního profilu, správce čte všechny" ON public.profiles;
CREATE POLICY "Čtení vlastního profilu, správce čte všechny"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. public.user_feedback — čte a spravuje jen lektor a správce
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Povolit vkládání zpětné vazby pro všechny" ON public.user_feedback;
DROP POLICY IF EXISTS "Povolit vkládání zpětné vazby pro přihlášené uživatele" ON public.user_feedback;
DROP POLICY IF EXISTS "Vkládání vlastní zpětné vazby" ON public.user_feedback;
CREATE POLICY "Vkládání vlastní zpětné vazby"
  ON public.user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Povolit čtení zpětné vazby pro přihlášené uživatele" ON public.user_feedback;
DROP POLICY IF EXISTS "Čtení vlastní zpětné vazby, lektor a správce čtou vše" ON public.user_feedback;
CREATE POLICY "Čtení vlastní zpětné vazby, lektor a správce čtou vše"
  ON public.user_feedback
  FOR SELECT
  TO authenticated
  USING (public.is_staff() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Povolit úpravy zpětné vazby pro přihlášené uživatele" ON public.user_feedback;
DROP POLICY IF EXISTS "Stav zpětné vazby mědí jen lektor a správce" ON public.user_feedback;
DROP POLICY IF EXISTS "Stav zpětné vazby mění jen lektor a správce" ON public.user_feedback;
CREATE POLICY "Stav zpětné vazby mění jen lektor a správce"
  ON public.user_feedback
  FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Povolit mazání zpětné vazby pro přihlášené uživatele" ON public.user_feedback;
DROP POLICY IF EXISTS "Mazat zpětnou vazbu smí jen lektor a správce" ON public.user_feedback;
CREATE POLICY "Mazat zpětnou vazbu smí jen lektor a správce"
  ON public.user_feedback
  FOR DELETE
  TO authenticated
  USING (public.is_staff());

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. public.class_boards — velitel spravuje jen svou třídu
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'class_boards'
  ) THEN
    RAISE NOTICE 'public.class_boards neexistuje — část 4 přeskočena. Spusťte nejdřív class_boards.sql.';
    RETURN;
  END IF;

  -- Čtení: rozvrhy a služby jsou k vidění jen po přihlášení
  EXECUTE 'DROP POLICY IF EXISTS "Povolit čtení tříd pro všechny" ON public.class_boards';
  EXECUTE 'DROP POLICY IF EXISTS "Čtení tříd pro přihlášené" ON public.class_boards';
  EXECUTE $p$CREATE POLICY "Čtení tříd pro přihlášené"
    ON public.class_boards FOR SELECT TO authenticated USING (true)$p$;

  EXECUTE 'DROP POLICY IF EXISTS "Povolit vkládání tříd pro lektory a administrátory" ON public.class_boards';
  EXECUTE 'DROP POLICY IF EXISTS "Zakládat třídu smí lektor, správce a velitel vlastní třídy" ON public.class_boards';
  EXECUTE $p$CREATE POLICY "Zakládat třídu smí lektor, správce a velitel vlastní třídy"
    ON public.class_boards FOR INSERT TO authenticated
    WITH CHECK (public.can_manage_class(class_name))$p$;

  -- USING i WITH CHECK: velitel nesmí ani upravit cizí řádek, ani přepsat
  -- class_name svého řádku na jinou třídu.
  EXECUTE 'DROP POLICY IF EXISTS "Povolit úpravy tříd pro lektory a administrátory" ON public.class_boards';
  EXECUTE 'DROP POLICY IF EXISTS "Upravovat třídu smí lektor, správce a velitel vlastní třídy" ON public.class_boards';
  EXECUTE $p$CREATE POLICY "Upravovat třídu smí lektor, správce a velitel vlastní třídy"
    ON public.class_boards FOR UPDATE TO authenticated
    USING (public.can_manage_class(class_name))
    WITH CHECK (public.can_manage_class(class_name))$p$;

  EXECUTE 'DROP POLICY IF EXISTS "Povolit mazání tříd pro lektory a administrátory" ON public.class_boards';
  EXECUTE 'DROP POLICY IF EXISTS "Mazat třídu smí jen lektor a správce" ON public.class_boards';
  EXECUTE $p$CREATE POLICY "Mazat třídu smí jen lektor a správce"
    ON public.class_boards FOR DELETE TO authenticated
    USING (public.is_staff())$p$;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. public.global_announcements — celoškolní hlášení píše jen lektor a správce
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'global_announcements'
  ) THEN
    RAISE NOTICE 'public.global_announcements neexistuje — část 5 přeskočena.';
    RETURN;
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "Povolit čtení hlášení pro všechny" ON public.global_announcements';
  EXECUTE 'DROP POLICY IF EXISTS "Čtení hlášení pro přihlášené" ON public.global_announcements';
  EXECUTE $p$CREATE POLICY "Čtení hlášení pro přihlášené"
    ON public.global_announcements FOR SELECT TO authenticated USING (true)$p$;

  -- Původní politika byla FOR ALL bez WITH CHECK; doplněno explicitně.
  EXECUTE 'DROP POLICY IF EXISTS "Povolit zápis hlášení pro lektory a administrátory" ON public.global_announcements';
  EXECUTE 'DROP POLICY IF EXISTS "Zápis hlášení jen pro lektora a správce" ON public.global_announcements';
  EXECUTE $p$CREATE POLICY "Zápis hlášení jen pro lektora a správce"
    ON public.global_announcements FOR ALL TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff())$p$;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Ověření výsledku
-- ─────────────────────────────────────────────────────────────────────────────

SELECT tablename, policyname, cmd, qual IS NOT NULL AS ma_using, with_check IS NOT NULL AS ma_with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'user_feedback', 'class_boards', 'global_announcements')
ORDER BY tablename, cmd, policyname;
