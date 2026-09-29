-- ============================================================================
-- 042  Historie poznávaček a série na serveru; rozvrh smí nahrát i zástupce;
--      upravitelný obsah Profesní etiky a Vězeňské administrativy
-- ============================================================================
--
-- Spouští se PO 041.
--
-- CO BYLO ŠPATNĚ
-- 1. Historie poznávaček/pexesa a denní série se ukládaly jen do localStorage.
--    Na jiném zařízení, v PWA na ploše telefonu nebo po smazání dat webu
--    začínal student od nuly: přišel o XP z pexesa, odznaky za vytrvalost
--    a s nimi i o hodnost, která na XP stojí.
-- 2. Zástupce velitele má od 038 práva velitele (can_manage_class), jen
--    obrázek rozvrhu nahrát nesměl — politika úložiště z 031 pouští podle
--    role, a zástupce má roli „student“.
-- 3. Studijní obsah Profesní etiky a Vězeňské administrativy byl natvrdo
--    v kódu, lektor ho nemohl upravit.
--
-- CO TENHLE SKRIPT DĚLÁ
-- 1. Tabulka public.studijni_zaznamy: jeden řádek = jeden záznam uživatele
--    (odehraná poznávačka, nebo jeho denní série). Každý čte a mění jen své.
-- 2. Funkce public.smim_nahrat_rozvrh() a dvě politiky nad storage.objects,
--    které platnému zástupci povolí nahrát a přepsat soubor ve složce
--    rozvrhy/ kbelíku studijni-materialy. Mazat dál smí jen lektor a správce.
-- 3. Rozšíří výčet druhů v public.content_blocks o 'ethics_dilemma',
--    'study_section', 'admin_template' a 'admin_exercise'. Zapisovat je smí
--    jako dosud jen lektor a správce (politiky z 027 se nemění).
--
-- Aplikace bez této migrace funguje dál jako dřív (záznamy jen v zařízení,
-- zástupci se rozvrh uloží přímo do řádku nástěnky, úpravy etiky
-- a administrativy skončí chybou kontroly content_blocks_kind_check).
-- Skript je idempotentní.
-- ============================================================================

BEGIN;

-- ─── 1. Záznamy uživatele ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.studijni_zaznamy (
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  druh       TEXT        NOT NULL,
  klic       TEXT        NOT NULL,
  data       JSONB       NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, druh, klic)
);

ALTER TABLE public.studijni_zaznamy DROP CONSTRAINT IF EXISTS studijni_zaznamy_druh_check;
ALTER TABLE public.studijni_zaznamy ADD CONSTRAINT studijni_zaznamy_druh_check
  CHECK (druh IN ('matching', 'streak'));

ALTER TABLE public.studijni_zaznamy DROP CONSTRAINT IF EXISTS studijni_zaznamy_klic_check;
ALTER TABLE public.studijni_zaznamy ADD CONSTRAINT studijni_zaznamy_klic_check
  CHECK (char_length(klic) BETWEEN 1 AND 120);

-- Záznam poznávačky má pár desítek bajtů; strop brání tomu, aby si někdo
-- tabulku použil jako neomezené úložiště.
ALTER TABLE public.studijni_zaznamy DROP CONSTRAINT IF EXISTS studijni_zaznamy_data_check;
ALTER TABLE public.studijni_zaznamy ADD CONSTRAINT studijni_zaznamy_data_check
  CHECK (jsonb_typeof(data) = 'object' AND pg_column_size(data) <= 2048);

COMMENT ON TABLE public.studijni_zaznamy IS
  'Historie poznávaček a denní série. Každý uživatel vidí a mění jen své řádky.';

ALTER TABLE public.studijni_zaznamy ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Své záznamy čte každý sám" ON public.studijni_zaznamy;
CREATE POLICY "Své záznamy čte každý sám"
  ON public.studijni_zaznamy FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Své záznamy zapisuje každý sám" ON public.studijni_zaznamy;
CREATE POLICY "Své záznamy zapisuje každý sám"
  ON public.studijni_zaznamy FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Série se přepisuje (upsert), proto na rozdíl od studijni_postup i UPDATE.
DROP POLICY IF EXISTS "Své záznamy mění každý sám" ON public.studijni_zaznamy;
CREATE POLICY "Své záznamy mění každý sám"
  ON public.studijni_zaznamy FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Své záznamy maže každý sám" ON public.studijni_zaznamy;
CREATE POLICY "Své záznamy maže každý sám"
  ON public.studijni_zaznamy FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

REVOKE ALL ON public.studijni_zaznamy FROM anon;
REVOKE ALL ON public.studijni_zaznamy FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studijni_zaznamy TO authenticated;

-- ─── 2. Rozvrh smí nahrát i zástupce velitele ────────────────────────────────
--
-- _velim_tride() klient volat nesmí (038), politika ale běží s právy
-- volajícího — proto obálka SECURITY DEFINER, která vrací jen ano/ne.

CREATE OR REPLACE FUNCTION public.smim_nahrat_rozvrh()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.is_staff() OR public._velim_tride() IS NOT NULL, false);
$$;

REVOKE ALL ON FUNCTION public.smim_nahrat_rozvrh() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.smim_nahrat_rozvrh() TO authenticated;

DROP POLICY IF EXISTS "Rozvrh nahrává i zástupce velitele" ON storage.objects;
CREATE POLICY "Rozvrh nahrává i zástupce velitele"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'studijni-materialy'
    AND name LIKE 'rozvrhy/%'
    AND (select public.smim_nahrat_rozvrh())
  );

DROP POLICY IF EXISTS "Rozvrh přepisuje i zástupce velitele" ON storage.objects;
CREATE POLICY "Rozvrh přepisuje i zástupce velitele"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'studijni-materialy'
    AND name LIKE 'rozvrhy/%'
    AND (select public.smim_nahrat_rozvrh())
  )
  WITH CHECK (
    bucket_id = 'studijni-materialy'
    AND name LIKE 'rozvrhy/%'
    AND (select public.smim_nahrat_rozvrh())
  );

-- ─── 3. Nové druhy editovatelného obsahu ─────────────────────────────────────

ALTER TABLE public.content_blocks DROP CONSTRAINT IF EXISTS content_blocks_kind_check;
ALTER TABLE public.content_blocks ADD CONSTRAINT content_blocks_kind_check
  CHECK (kind IN ('subject', 'matching_category', 'scenario', 'weapon', 'stoppage_drill', 'jidelnicek',
                  'regulation', 'ethics_dilemma', 'study_section', 'admin_template', 'admin_exercise'));

COMMIT;

-- ─── Ověření (spusťte zvlášť, má vrátit true, 4, true, 2, true) ─────────────
-- SELECT to_regclass('public.studijni_zaznamy') IS NOT NULL,
--        (SELECT count(*) FROM pg_policies WHERE tablename = 'studijni_zaznamy'),
--        to_regprocedure('public.smim_nahrat_rozvrh()') IS NOT NULL,
--        (SELECT count(*) FROM pg_policies WHERE tablename = 'objects'
--           AND policyname LIKE 'Rozvrh%zástupce velitele'),
--        (SELECT pg_get_constraintdef(oid) LIKE '%admin_exercise%'
--           FROM pg_constraint WHERE conname = 'content_blocks_kind_check');
