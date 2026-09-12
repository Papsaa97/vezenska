-- OPRAVA: "infinite recursion detected in policy for relation profiles"
-- Spusťte tento skript JEDNOU v Supabase SQL Editoru (Dashboard -> SQL Editor).
-- Je bezpečné jej spustit i vícekrát (idempotentní), i pokud user_notifications
-- u vás ještě neexistuje – tato část se pak jen přeskočí.
--
-- Příčina: RLS politiky nad public.profiles (a nad user_notifications,
-- quiz_results) ověřovaly roli 'admin' přes "EXISTS (SELECT ... FROM
-- public.profiles ...)" přímo uvnitř politiky definované NA public.profiles.
-- Taková politika se odkazuje sama na sebe, takže Postgres při jejím
-- vyhodnocování skončí chybou "infinite recursion detected in policy for
-- relation profiles" – to postihlo i zcela běžné operace jako načtení
-- vlastního profilu nebo historie testů.
--
-- Oprava: role se čte přes SECURITY DEFINER funkce (get_role/is_admin), které
-- běží s právy vlastníka (v Supabase role s BYPASSRLS) a RLS na profiles tak
-- vůbec neaplikují – k rekurzi proto nemůže dojít.

-- 1. Pomocné funkce
CREATE OR REPLACE FUNCTION public.get_role(uid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

REVOKE ALL ON FUNCTION public.get_role(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_role(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.get_role(auth.uid()) = 'admin';
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. public.profiles – oprava obou politik s rekurzí (tabulka vždy existuje)
DROP POLICY IF EXISTS "Povolit úpravu vlastního jména bez změny role" ON public.profiles;
CREATE POLICY "Povolit úpravu vlastního jména bez změny role"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = public.get_role(id)
  );

DROP POLICY IF EXISTS "Pouze administrátor může měnit role" ON public.profiles;
CREATE POLICY "Pouze administrátor může měnit role"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. public.quiz_results – oprava admin politiky s rekurzí (pokud politika/tabulka existuje)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_results') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Správce může číst všechny výsledky testů" ON public.quiz_results';
    EXECUTE $p$CREATE POLICY "Správce může číst všechny výsledky testů"
      ON public.quiz_results
      FOR SELECT
      TO authenticated
      USING (public.is_admin())$p$;
  END IF;
END $$;

-- 4. public.user_notifications – oprava 3 politik s rekurzí (pokud tabulka existuje;
--    když ještě ne, tahle část se bez chyby přeskočí)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_notifications') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Uživatel čte vlastní zprávy, správce všechny" ON public.user_notifications';
    EXECUTE $p$CREATE POLICY "Uživatel čte vlastní zprávy, správce všechny"
      ON public.user_notifications
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id OR public.is_admin())$p$;

    EXECUTE 'DROP POLICY IF EXISTS "Pouze správce může odesílat zprávy" ON public.user_notifications';
    EXECUTE $p$CREATE POLICY "Pouze správce může odesílat zprávy"
      ON public.user_notifications
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_admin())$p$;

    EXECUTE 'DROP POLICY IF EXISTS "Pouze správce může mazat zprávy" ON public.user_notifications';
    EXECUTE $p$CREATE POLICY "Pouze správce může mazat zprávy"
      ON public.user_notifications
      FOR DELETE
      TO authenticated
      USING (public.is_admin())$p$;
  END IF;
END $$;

-- 5. admin_delete_user RPC – sjednoceno na is_admin(), beze změny chování navenek
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Pouze správce může mazat uživatelské účty.' USING ERRCODE = '42501';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Nelze smazat vlastní uživatelský účet.' USING ERRCODE = '42501';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
