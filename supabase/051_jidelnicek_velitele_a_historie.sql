-- ============================================================================
-- 051  Jídelníček upravují i velitelé; každá změna se zapíše se jménem
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- Jídelníček na Nástěnce je jeden společný pro všechny (content_blocks,
-- řádek 'jidelnicek:aktualni', migrace 040), ale vyplnit ho směl jen lektor
-- nebo správce. Jídelníček přitom v praxi znají a hlídají velitelé tříd.
-- Zároveň nebylo nikde vidět, kdo ho naposledy změnil — sloupec updated_by
-- plní klient sám, takže se na něj spolehnout nedá.
--
-- CO TENHLE SKRIPT DĚLÁ
-- 1. Funkce public.smim_upravit_jidelnicek(): lektor, správce, velitel
--    kterékoli třídy a jeho platný zástupce (stejné pravidlo jako rozvrh
--    v migraci 042, public._velim_tride()).
-- 2. Dvě nové politiky nad content_blocks: tito uživatelé smějí vložit a
--    upravit JEN řádek druhu 'jidelnicek'. Mazat dál smí jen lektor a správce
--    (politiky z 027 se nemění).
-- 3. Tabulka public.jidelnicek_historie: každé vložení, úprava a smazání
--    jídelníčku — kdo (id, jméno a role v okamžiku změny), kdy, stav před
--    a po. Plní ji trigger v databázi, ne aplikace, takže změnu nejde
--    provést bez záznamu, ani když někdo pošle požadavek mimo aplikaci.
--    Číst ji smí každý přihlášený (proto je vidět, kdo co změnil); zapisovat,
--    upravovat ani mazat ji nesmí nikdo z aplikace, ani správce.
-- 4. Trigger zároveň přepíše updated_at na čas serveru a updated_by na id
--    autora, aby údaj na řádku nešel podvrhnout.
--
-- Aplikace bez této migrace funguje dál jako dřív (velitel tlačítko „Upravit“
-- uvidí, ale server jeho uložení odmítne; historie se ukáže prázdná).
--
-- Spouštět po 050. Idempotentní.
-- ============================================================================

BEGIN;

-- ─── 1. Kdo smí jídelníček upravit ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.smim_upravit_jidelnicek()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.is_staff() OR public._velim_tride() IS NOT NULL, false);
$$;

REVOKE ALL ON FUNCTION public.smim_upravit_jidelnicek() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.smim_upravit_jidelnicek() TO authenticated;

-- ─── 2. Politiky: velitel smí vložit a upravit jen jídelníček ────────────────
--
-- Politiky jsou permisivní, takže se sčítají s politikami „jen lektor a
-- správce“ z 027. Upsert z aplikace (INSERT … ON CONFLICT DO UPDATE)
-- potřebuje obě.

DROP POLICY IF EXISTS "Jídelníček vkládá i velitel" ON public.content_blocks;
CREATE POLICY "Jídelníček vkládá i velitel"
  ON public.content_blocks FOR INSERT TO authenticated
  WITH CHECK (
    kind = 'jidelnicek'
    AND id LIKE 'jidelnicek:%'
    AND (select public.smim_upravit_jidelnicek())
  );

DROP POLICY IF EXISTS "Jídelníček upravuje i velitel" ON public.content_blocks;
CREATE POLICY "Jídelníček upravuje i velitel"
  ON public.content_blocks FOR UPDATE TO authenticated
  USING (
    kind = 'jidelnicek'
    AND (select public.smim_upravit_jidelnicek())
  )
  WITH CHECK (
    kind = 'jidelnicek'
    AND id LIKE 'jidelnicek:%'
    AND (select public.smim_upravit_jidelnicek())
  );

-- ─── 3. Historie změn ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.jidelnicek_historie (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  block_id     TEXT        NOT NULL,
  zmeneno      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Bez cizího klíče schválně: smazáním účtu nesmí zmizet, kdo co změnil.
  autor_id     UUID,
  autor_jmeno  TEXT        NOT NULL,
  autor_role   TEXT,
  akce         TEXT        NOT NULL,
  pred         JSONB,
  po           JSONB
);

ALTER TABLE public.jidelnicek_historie DROP CONSTRAINT IF EXISTS jidelnicek_historie_akce_check;
ALTER TABLE public.jidelnicek_historie ADD CONSTRAINT jidelnicek_historie_akce_check
  CHECK (akce IN ('vlozeni', 'uprava', 'smazani'));

CREATE INDEX IF NOT EXISTS idx_jidelnicek_historie_zmeneno
  ON public.jidelnicek_historie (block_id, zmeneno DESC);

COMMENT ON TABLE public.jidelnicek_historie IS
  'Záznam každé změny jídelníčku (kdo, kdy, před a po). Plní ho jen trigger; z aplikace jde jen číst.';

ALTER TABLE public.jidelnicek_historie ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Historii jídelníčku čte každý přihlášený" ON public.jidelnicek_historie;
CREATE POLICY "Historii jídelníčku čte každý přihlášený"
  ON public.jidelnicek_historie FOR SELECT TO authenticated
  USING (true);

REVOKE ALL ON public.jidelnicek_historie FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.jidelnicek_historie TO authenticated;

-- Stav řádku, který se do historie ukládá. updated_at/updated_by se vynechávají,
-- ty jsou v historii vlastními sloupci.
CREATE OR REPLACE FUNCTION public._jidelnicek_stav(p_payload JSONB, p_skryto BOOLEAN, p_smazano BOOLEAN)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT jsonb_build_object('payload', p_payload, 'is_hidden', p_skryto, 'is_deleted', p_smazano);
$$;

REVOKE ALL ON FUNCTION public._jidelnicek_stav(JSONB, BOOLEAN, BOOLEAN) FROM PUBLIC, anon, authenticated;

-- Před zápisem: čas a autor podle serveru, ne podle klienta.
CREATE OR REPLACE FUNCTION public.jidelnicek_pred_zapisem()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.kind = 'jidelnicek' OR (TG_OP = 'UPDATE' AND OLD.kind = 'jidelnicek') THEN
    NEW.updated_at := now();
    NEW.updated_by := COALESCE(auth.uid()::text, 'sql');
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.jidelnicek_pred_zapisem() FROM PUBLIC, anon, authenticated;

-- Po zápisu: řádek do historie. Úprava, která nic nezměnila, se nezapisuje.
CREATE OR REPLACE FUNCTION public.jidelnicek_zapsat_historii()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   UUID := auth.uid();
  v_pred  JSONB;
  v_po    JSONB;
  v_akce  TEXT;
  v_block TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.kind <> 'jidelnicek' THEN RETURN NULL; END IF;
    v_akce := 'vlozeni';
    v_block := NEW.id;
    v_po := public._jidelnicek_stav(NEW.payload, NEW.is_hidden, NEW.is_deleted);
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.kind <> 'jidelnicek' AND OLD.kind <> 'jidelnicek' THEN RETURN NULL; END IF;
    v_akce := 'uprava';
    v_block := NEW.id;
    v_pred := public._jidelnicek_stav(OLD.payload, OLD.is_hidden, OLD.is_deleted);
    v_po := public._jidelnicek_stav(NEW.payload, NEW.is_hidden, NEW.is_deleted);
    IF v_pred = v_po AND NEW.kind = OLD.kind AND NEW.id = OLD.id THEN RETURN NULL; END IF;
  ELSE
    IF OLD.kind <> 'jidelnicek' THEN RETURN NULL; END IF;
    v_akce := 'smazani';
    v_block := OLD.id;
    v_pred := public._jidelnicek_stav(OLD.payload, OLD.is_hidden, OLD.is_deleted);
  END IF;

  INSERT INTO public.jidelnicek_historie (block_id, autor_id, autor_jmeno, autor_role, akce, pred, po)
  VALUES (
    v_block,
    v_uid,
    CASE WHEN v_uid IS NULL THEN 'Správa databáze (SQL)'
         ELSE COALESCE(public._jmeno(v_uid), 'Neznámý uživatel') END,
    CASE WHEN v_uid IS NULL THEN NULL
         ELSE (SELECT p.role FROM public.profiles p WHERE p.id = v_uid) END,
    v_akce,
    v_pred,
    v_po
  );
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.jidelnicek_zapsat_historii() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS jidelnicek_pred_zapisem ON public.content_blocks;
CREATE TRIGGER jidelnicek_pred_zapisem
  BEFORE INSERT OR UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.jidelnicek_pred_zapisem();

DROP TRIGGER IF EXISTS jidelnicek_zapsat_historii ON public.content_blocks;
CREATE TRIGGER jidelnicek_zapsat_historii
  AFTER INSERT OR UPDATE OR DELETE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.jidelnicek_zapsat_historii();

COMMIT;

-- ─── Ověření (spusťte zvlášť; má vrátit true, true, 2, 1, 2) ─────────────────
-- SELECT to_regprocedure('public.smim_upravit_jidelnicek()') IS NOT NULL,
--        to_regclass('public.jidelnicek_historie') IS NOT NULL,
--        (SELECT count(*) FROM pg_policies WHERE tablename = 'content_blocks'
--           AND policyname LIKE 'Jídelníček%'),
--        (SELECT count(*) FROM pg_policies WHERE tablename = 'jidelnicek_historie'),
--        (SELECT count(*) FROM pg_trigger WHERE tgrelid = 'public.content_blocks'::regclass
--           AND tgname LIKE 'jidelnicek_%');
--
-- Kdo a jak smí zapisovat, ověří supabase/overeni/kontrola_jidelnicku.sql.
