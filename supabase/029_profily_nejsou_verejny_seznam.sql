-- ============================================================================
-- 029  Profil si přečte jeho vlastník a správce, ne kdokoli přihlášený
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- Politika z profiles.sql zněla:
--
--   CREATE POLICY "Povolit čtení profilů pro přihlášené"
--     ON public.profiles FOR SELECT TO authenticated USING (true);
--
-- Tabulka `public.profiles` obsahuje `email`, `full_name`, `role` a
-- `user_class`. Anonymní klíč je veřejný (a má být — chrání ho právě RLS),
-- takže KAŽDÝ přihlášený student si mohl jedním dotazem na REST API vypsat
-- celý jmenný seznam Akademie se e-maily, rolemi a třídami. Správa uživatelů
-- je v rozhraní jen pro správce, ale data byla čitelná přes API pro všechny.
--
-- PROČ TO APLIKACE NEPOTŘEBUJE
-- Mimo správu uživatelů čte kód vždy jen vlastní profil:
--   src/context/AuthContext.tsx →  .from('profiles').select(...).eq('id', userId)
-- Jediný plošný dotaz je v src/components/UserManager.tsx, který je dostupný
-- výhradně roli 'admin'. Zúžení tedy nic v aplikaci nerozbije.
--
-- POZOR NA REKURZI
-- Role se NESMÍ zjišťovat dotazem do public.profiles uvnitř politiky nad
-- public.profiles — vznikne „infinite recursion detected in policy“ (42P17),
-- viz migrace 017. Používá se proto `public.is_admin()`, což je funkce
-- SECURITY DEFINER.
--
-- Spouštět po: profiles.sql, 013_harden_rls.sql, 017_oprava_rekurze_politik.sql,
-- 018_get_role_neni_volatelna_z_klienta.sql, 019_vykon_politik_a_indexu.sql.
-- Skript je idempotentní.
-- ============================================================================

-- ─── 1. Zúžení čtení profilů ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Povolit čtení profilů pro přihlášené" ON public.profiles;
DROP POLICY IF EXISTS "Čtení vlastního profilu, správce čte všechny"  ON public.profiles;

CREATE POLICY "Čtení vlastního profilu, správce čte všechny"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = id
    OR public.is_admin()
  );

-- ─── 2. Kontrola ────────────────────────────────────────────────────────────
--
-- Po spuštění by měl seznam politik nad public.profiles obsahovat právě:
--   - "Čtení vlastního profilu, správce čte všechny"  (SELECT)
--   - "Povolit vytvoření vlastního profilu"           (INSERT)
--   - "Povolit úpravu vlastního jména bez změny role" (UPDATE)
--   - "Pouze administrátor může měnit role"           (UPDATE)
--
-- Ověření:
--   SELECT policyname, cmd FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'profiles'
--   ORDER BY cmd, policyname;
--
-- Zkouška z pohledu studenta (přihlášený nesprávce):
--   SELECT count(*) FROM public.profiles;   -- musí vrátit 1, ne počet všech účtů
