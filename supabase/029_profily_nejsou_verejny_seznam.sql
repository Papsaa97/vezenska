-- ============================================================================
-- 029  Přepis SELECT politiky nad profiles — NENÍ to bezpečnostní oprava
-- ============================================================================
--
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ POZOR: PŮVODNÍ POPIS TOHOHLE SKRIPTU BYL NEPRAVDIVÝ.                    │
-- │                                                                         │
-- │ Skript vznikl 16. 9. 2026 na základě nálezu auditu, že nad              │
-- │ public.profiles živě platí "FOR SELECT TO authenticated USING (true)",  │
-- │ takže si kterýkoli přihlášený student může přes REST API vypsat celý    │
-- │ jmenný seznam Akademie s e-maily, rolemi a třídami.                     │
-- │                                                                         │
-- │ TO NEPLATILO. Nález vycházel ze supabase/profiles.sql, což je ZAVÁDĚCÍ  │
-- │ skript prvního kroku, a jeho USING (true) byl vydán za živý stav.       │
-- │ Zúžení na vlastníka a správce zavedla už 013_harden_rls.sql a přepsaly  │
-- │ ho 017 a 019. Migrace drop_leftover_permissive_policies navíc nad       │
-- │ profiles smetla každou politiku s podmínkou true.                       │
-- │                                                                         │
-- │ Ověřeno dotazem do produkční databáze (počty řádků z celkových 23,      │
-- │ role simulovaná přes request.jwt.claims + set local role):              │
-- │   student     1  (jen vlastní profil)                                   │
-- │   lektor      1  (jen vlastní — is_staff() v politice není)             │
-- │   správce    23                                                         │
-- │   anon        0                                                         │
-- └─────────────────────────────────────────────────────────────────────────┘
--
-- CO TENHLE SKRIPT VE SKUTEČNOSTI UDĚLAL
--
-- Byl na produkci spuštěn (viz níže) a přepsal SELECT politiku ze tvaru, který
-- zavedla 019, na tvar bez obalu u is_admin():
--
--   019  USING ((select auth.uid()) = id OR (select public.is_admin()))
--   029  USING ((select auth.uid()) = id OR public.is_admin())
--                                          ^^^^^^^^^^^^^^^^^^^ bez (select …)
--
-- Bezpečnostně je to totéž. Výkonově ne: obal (select …) dělá z volání
-- InitPlan, který Postgres vyhodnotí JEDNOU za dotaz, kdežto bez obalu se
-- funkce volá NA KAŽDÝ ŘÁDEK. Přesně tuhle optimalizaci zaváděla migrace 019
-- (proto se jmenuje "výkon politik a indexů") a 029 ji u téhle jedné politiky
-- mimoděk zrušila. Nad 23 profily je to bezvýznamné; nekonzistentní to je.
--
-- JAK SE POZNALO, ŽE BYL SPUŠTĚN
-- V supabase_migrations.schema_migrations tenhle skript zaznamenaný NENÍ
-- (poslední záznam je 20260916061307 / 028) — ledger ale nevede ani 010–013,
-- 016, 017 a 027, takže z něj nasazení poznat nelze. Rozhoduje tvar politiky
-- v katalogu:
--
--   SELECT policyname, cmd, qual FROM pg_policies
--   WHERE schemaname='public' AND tablename='profiles';
--
-- SELECT politika má qual "((( SELECT auth.uid() AS uid) = id) OR is_admin())"
-- — auth.uid() obalený, is_admin() ne. Že Postgres obal sám nezahazuje,
-- dokazuje UPDATE politika ze stejné migrace 019, která si v katalogu obal
-- ponechala: "(( SELECT is_admin() AS is_admin) OR …)". Tvar SELECT politiky
-- tedy nemůže být výstup 019 a odpovídá jedině tomuhle skriptu.
--
-- PROČ SOUBOR ZŮSTÁVÁ V REPOZITÁŘI
-- Popisuje změnu, která v produkci opravdu je. Smazat ho by znamenalo, že
-- repozitář živý stav nepopisuje. Nespouštějte ho znovu — nic nepřidá.
-- Návrat k výkonnějšímu tvaru z 019 řeší 030_vratit_initplan_u_cteni_profilu.sql.
--
-- Spouštět po: profiles.sql, 013_harden_rls.sql, 017_oprava_rekurze_politik.sql,
-- 018_get_role_neni_volatelna_z_klienta.sql, 019_vykon_politik_a_indexu.sql.
-- Skript je idempotentní.
-- ============================================================================

-- ─── 1. Přepis SELECT politiky (ponecháno tak, jak bylo spuštěno) ───────────

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
--   - "Čtení vlastního profilu, správce čte všechny"        (SELECT)
--   - "Povolit vytvoření vlastního profilu"                 (INSERT)
--   - "Úprava profilu: správce vše, ostatní vlastní bez ro" (UPDATE, z 019)
--
-- POZOR na názvy: Postgres zkracuje identifikátory na 63 BAJTŮ, a české znaky
-- jsou v UTF-8 víceslabičné. Název UPDATE politiky z 019 je proto v katalogu
-- uříznutý na "Úprava profilu: správce vše, ostatní vlastní bez změny ro".
--
-- Ověření:
--   SELECT policyname, cmd FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'profiles'
--   ORDER BY cmd, policyname;
--
-- Zkouška z pohledu studenta (uvnitř transakce, vždy ROLLBACK):
--   BEGIN;
--   SELECT set_config('request.jwt.claims',
--                     '{"sub":"<uuid studenta>","role":"authenticated"}', true);
--   SET LOCAL ROLE authenticated;
--   SELECT count(*) FROM public.profiles;   -- musí vrátit 1, ne počet všech účtů
--   ROLLBACK;
