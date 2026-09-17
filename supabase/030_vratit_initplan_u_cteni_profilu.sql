-- ============================================================================
-- 030  Vrátit InitPlan u čtení profilů (náprava vedlejšího účinku migrace 029)
-- ============================================================================
--
-- CO SE STALO
-- Migrace 019_vykon_politik_a_indexu.sql systematicky obalovala volání
-- pomocných funkcí v politikách do skalárního podselectu:
--
--   USING ((select auth.uid()) = id OR (select public.is_admin()))
--
-- Obal není kosmetika. Postgres z obaleného volání udělá InitPlan a vyhodnotí
-- ho JEDNOU za dotaz; bez obalu volá funkci NA KAŽDÝ ŘÁDEK, který politika
-- posuzuje. U SECURITY DEFINER funkce, která sama sahá do tabulky, je to
-- rozdíl mezi jedním a N dotazy.
--
-- Migrace 029 pak SELECT politiku nad public.profiles přepsala bez toho obalu
-- u is_admin(), takže se u té jedné politiky optimalizace z 019 zrušila.
-- Stalo se to mimoděk — 029 měla být bezpečnostní oprava, jenže opravovala
-- něco, co nebylo rozbité (viz rámeček v jejím záhlaví).
--
-- CO TENHLE SKRIPT DĚLÁ
-- Vrací SELECT politiku do tvaru, jaký zavedla 019. Na to, KDO data uvidí,
-- nemá žádný vliv — podmínka je logicky totožná:
--
--   před  ((( SELECT auth.uid() AS uid) = id) OR is_admin())
--   po    ((( SELECT auth.uid() AS uid) = id) OR ( SELECT is_admin() AS is_admin))
--
-- Po spuštění budou obě politiky nad profiles (SELECT i UPDATE) používat
-- stejný tvar, takže se příště nebude muset dohadovat, která migrace kterou
-- z nich napsala — právě tenhle rozdíl posloužil jako důkaz, že 029 na
-- produkci spuštěná byla, přestože ji ledger nevede.
--
-- Spouštět po: 019_vykon_politik_a_indexu.sql a 029 (pokud byla spuštěna).
-- Skript je idempotentní a lze ho spustit i tam, kde 029 nikdy neproběhla.
-- ============================================================================

-- ─── 1. Návrat k obalenému tvaru ────────────────────────────────────────────

DROP POLICY IF EXISTS "Čtení vlastního profilu, správce čte všechny" ON public.profiles;

CREATE POLICY "Čtení vlastního profilu, správce čte všechny"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = id
    OR (select public.is_admin())
  );

-- ─── 2. Kontrola ────────────────────────────────────────────────────────────
--
-- Oba tvary musí mít v katalogu obal u obou funkcí:
--
--   SELECT cmd, qual FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'SELECT';
--
--   očekáváno: ((( SELECT auth.uid() AS uid) = id) OR ( SELECT is_admin() AS is_admin))
--
-- Viditelnost se změnit NESMÍ. Zkouška (uvnitř transakce, vždy ROLLBACK):
--   BEGIN;
--   SELECT set_config('request.jwt.claims',
--                     '{"sub":"<uuid studenta>","role":"authenticated"}', true);
--   SET LOCAL ROLE authenticated;
--   SELECT count(*) FROM public.profiles;   -- musí vrátit 1
--   ROLLBACK;
--
-- Totéž pro správce musí vrátit počet všech účtů, pro anon nulu.
