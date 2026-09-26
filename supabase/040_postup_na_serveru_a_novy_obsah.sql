-- ============================================================================
-- 040  Postup ve scénářích a drilech na serveru; editovatelné zbraně a jídelníček
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- 1. Splněné taktické scénáře a zbraňové drily se ukládaly jen do localStorage
--    prohlížeče (utils/gamification.ts). Na jiném zařízení, v PWA na ploše
--    telefonu (má vlastní úložiště, oddělené od Safari) nebo po tom, co Safari
--    po sedmi dnech bez návštěvy smaže data webu, ukazovala záložka Modelové
--    situace „0 / 12 vyřešeno“, i když uživatel scénáře prošel.
-- 2. Záložku Zbraně a střelba nemohl lektor ani správce upravit — data byla
--    natvrdo v komponentě (zpětná vazba z 18. 9. 2026).
-- 3. Na nástěnku chyběl jídelníček (návrh ze zpětné vazby 18. 9. 2026).
--
-- CO TENHLE SKRIPT DĚLÁ
-- 1. Tabulka public.studijni_postup: jeden řádek = jedna splněná položka
--    (scénář nebo dril) jednoho uživatele. Každý čte, zapisuje a maže jen
--    své řádky. Aplikace při přihlášení sloučí serverový a místní postup.
-- 2. Rozšíří výčet druhů v public.content_blocks o 'weapon', 'stoppage_drill'
--    a 'jidelnicek'. Zapisovat je smí jako dosud jen lektor a správce
--    (politiky z 027 se nemění).
--
-- Aplikace bez této migrace funguje dál jako dřív (postup jen v zařízení,
-- úpravy zbraní a jídelníčku skončí chybou kontroly `content_blocks_kind_check`).
--
-- Spouštět po 039_diskuze_tridy.sql. Idempotentní.
-- ============================================================================

BEGIN;

-- ─── 1. Postup uživatele ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.studijni_postup (
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  druh       TEXT        NOT NULL,
  polozka    TEXT        NOT NULL,
  dokonceno  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, druh, polozka)
);

ALTER TABLE public.studijni_postup DROP CONSTRAINT IF EXISTS studijni_postup_druh_check;
ALTER TABLE public.studijni_postup ADD CONSTRAINT studijni_postup_druh_check
  CHECK (druh IN ('scenario', 'drill'));

ALTER TABLE public.studijni_postup DROP CONSTRAINT IF EXISTS studijni_postup_polozka_check;
ALTER TABLE public.studijni_postup ADD CONSTRAINT studijni_postup_polozka_check
  CHECK (char_length(polozka) BETWEEN 1 AND 120);

COMMENT ON TABLE public.studijni_postup IS
  'Splněné taktické scénáře a zbraňové drily. Každý uživatel vidí a mění jen své řádky.';

ALTER TABLE public.studijni_postup ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Svůj postup čte každý sám" ON public.studijni_postup;
CREATE POLICY "Svůj postup čte každý sám"
  ON public.studijni_postup FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Svůj postup zapisuje každý sám" ON public.studijni_postup;
CREATE POLICY "Svůj postup zapisuje každý sám"
  ON public.studijni_postup FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Svůj postup maže každý sám" ON public.studijni_postup;
CREATE POLICY "Svůj postup maže každý sám"
  ON public.studijni_postup FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- UPDATE není potřeba (řádek se jen vloží nebo smaže); upsert s
-- ignoreDuplicates ho nepoužívá.
REVOKE ALL ON public.studijni_postup FROM anon;
REVOKE ALL ON public.studijni_postup FROM authenticated;
GRANT SELECT, INSERT, DELETE ON public.studijni_postup TO authenticated;

-- ─── 2. Nové druhy editovatelného obsahu ─────────────────────────────────────

ALTER TABLE public.content_blocks DROP CONSTRAINT IF EXISTS content_blocks_kind_check;
ALTER TABLE public.content_blocks ADD CONSTRAINT content_blocks_kind_check
  CHECK (kind IN ('subject', 'matching_category', 'scenario', 'weapon', 'stoppage_drill', 'jidelnicek'));

COMMIT;

-- ─── Ověření (spusťte zvlášť, má vrátit true, true, 3) ───────────────────────
-- SELECT to_regclass('public.studijni_postup') IS NOT NULL,
--        pg_get_constraintdef(oid) LIKE '%jidelnicek%'
--   FROM pg_constraint WHERE conname = 'content_blocks_kind_check';
-- SELECT count(*) FROM pg_policies WHERE tablename = 'studijni_postup';
