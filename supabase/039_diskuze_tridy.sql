-- 039: Diskuzní nástěnka třídy — příspěvky, ankety a označení členů.
--
-- Spusťte v Supabase SQL Editoru AŽ PO migraci 038 (používá _jmeno,
-- _upozornit, can_manage_class se zástupcem). Skript je idempotentní.
--
-- Pravidla:
--   * Číst a psát smějí jen členové třídy, lektoři a správci.
--   * Příspěvek se zveřejní hned. Velitel (i platný zástupce), lektor
--     a správce ho mohou připnout, skrýt nebo smazat — to je moderace.
--     Autor smí svůj příspěvek smazat a svou anketu ukončit.
--   * Skrytý příspěvek vidí jen moderátoři a jeho autor (s poznámkou).
--   * Anketa má 2–10 možností, hlasuje se jednou (hlas lze změnit, dokud
--     anketa běží). Výsledky vidí všichni, kdo nástěnku čtou.
--   * Označit lze jen členy téže třídy; označenému přijde oznámení do zvonku
--     s úryvkem zprávy.
--   * Tabulky jsou klientům zavřené, všechno jde přes funkce níže.
--   * Příspěvky visí na class_boards.id: přejmenování třídy je nerozbije
--     a smazání třídy je smaže s ní.

BEGIN;

-- ─── 1. Tabulky ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.trida_prispevky (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trida_id    TEXT NOT NULL REFERENCES public.class_boards(id) ON DELETE CASCADE,
  autor       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  text        TEXT NOT NULL CHECK (char_length(trim(text)) BETWEEN 1 AND 2000),
  zminky      UUID[] NOT NULL DEFAULT '{}',
  je_anketa   BOOLEAN NOT NULL DEFAULT false,
  anketa_do   TIMESTAMPTZ,
  anketa_ukoncena BOOLEAN NOT NULL DEFAULT false,
  pripnuto    BOOLEAN NOT NULL DEFAULT false,
  skryto      BOOLEAN NOT NULL DEFAULT false,
  skryl       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vytvoreno   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trida_prispevky_trida
  ON public.trida_prispevky (trida_id, vytvoreno DESC);
ALTER TABLE public.trida_prispevky ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.trida_prispevky FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.trida_anketa_moznosti (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prispevek_id UUID NOT NULL REFERENCES public.trida_prispevky(id) ON DELETE CASCADE,
  poradi      SMALLINT NOT NULL,
  text        TEXT NOT NULL CHECK (char_length(trim(text)) BETWEEN 1 AND 200),
  UNIQUE (prispevek_id, poradi)
);
ALTER TABLE public.trida_anketa_moznosti ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.trida_anketa_moznosti FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.trida_anketa_hlasy (
  prispevek_id UUID NOT NULL REFERENCES public.trida_prispevky(id) ON DELETE CASCADE,
  moznost_id  UUID NOT NULL REFERENCES public.trida_anketa_moznosti(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hlasovano   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (prispevek_id, user_id)
);
ALTER TABLE public.trida_anketa_hlasy ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.trida_anketa_hlasy FROM anon, authenticated;

-- ─── 2. Pomocné funkce (klientům zavřené) ────────────────────────────────────

-- id nástěnky podle názvu třídy (bez ohledu na velikost písmen a mezery).
CREATE OR REPLACE FUNCTION public._trida_id(p_class TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.class_boards
  WHERE lower(trim(class_name)) = lower(trim(p_class))
  ORDER BY created_at
  LIMIT 1;
$$;

-- Smí volající číst a psát v diskuzi této třídy?
CREATE OR REPLACE FUNCTION public._v_diskuzi(p_trida_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_staff() OR EXISTS (
    SELECT 1 FROM public.class_boards b
    WHERE b.id = p_trida_id
      AND lower(trim(b.class_name)) = lower(trim(public.my_class()))
  );
$$;

-- Smí volající diskuzi moderovat (velitel, platný zástupce, lektor, správce)?
CREATE OR REPLACE FUNCTION public._moderuje(p_trida_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT public.can_manage_class(b.class_name)
    FROM public.class_boards b WHERE b.id = p_trida_id
  ), false);
$$;

REVOKE ALL ON FUNCTION public._trida_id(TEXT)   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._v_diskuzi(TEXT)  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._moderuje(TEXT)   FROM PUBLIC, anon, authenticated;

-- ─── 3. Funkce pro aplikaci ──────────────────────────────────────────────────

-- Příspěvky třídy, nejdřív připnuté, pak nejnovější. Ankety a označení
-- přicházejí jako JSON, aby stačil jeden dotaz.
DROP FUNCTION IF EXISTS public.diskuze_tridy(TEXT, INTEGER);
CREATE OR REPLACE FUNCTION public.diskuze_tridy(p_class TEXT, p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  id              UUID,
  autor_id        UUID,
  autor_jmeno     TEXT,
  autor_role      TEXT,
  text            TEXT,
  zminky          JSONB,
  je_anketa       BOOLEAN,
  anketa_do       TIMESTAMPTZ,
  anketa_bezi     BOOLEAN,
  moznosti        JSONB,
  muj_hlas        UUID,
  pocet_hlasu     INTEGER,
  pripnuto        BOOLEAN,
  skryto          BOOLEAN,
  vytvoreno       TIMESTAMPTZ,
  smim_moderovat  BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  v_trida TEXT := public._trida_id(p_class);
  v_mod   BOOLEAN;
BEGIN
  IF v_trida IS NULL THEN
    RAISE EXCEPTION 'Třída „%“ neexistuje.', p_class USING ERRCODE = 'P0002';
  END IF;
  IF NOT public._v_diskuzi(v_trida) THEN
    RAISE EXCEPTION 'Diskuzi třídy čtou jen její členové, lektoři a správci.' USING ERRCODE = '42501';
  END IF;
  v_mod := public._moderuje(v_trida);

  RETURN QUERY
  SELECT
    p.id,
    p.autor,
    COALESCE(public._jmeno(p.autor), 'Smazaný účet'),
    (SELECT pr.role FROM public.profiles pr WHERE pr.id = p.autor),
    p.text,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', z.uid, 'jmeno', public._jmeno(z.uid)) ORDER BY z.ord)
      FROM unnest(p.zminky) WITH ORDINALITY AS z(uid, ord)
    ), '[]'::jsonb),
    p.je_anketa,
    p.anketa_do,
    p.je_anketa AND NOT p.anketa_ukoncena AND (p.anketa_do IS NULL OR p.anketa_do > now()),
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'id', m.id,
               'text', m.text,
               'hlasu', (SELECT count(*) FROM public.trida_anketa_hlasy h WHERE h.moznost_id = m.id)
             ) ORDER BY m.poradi)
      FROM public.trida_anketa_moznosti m WHERE m.prispevek_id = p.id
    ), '[]'::jsonb),
    (SELECT h.moznost_id FROM public.trida_anketa_hlasy h
      WHERE h.prispevek_id = p.id AND h.user_id = auth.uid()),
    (SELECT count(*)::INTEGER FROM public.trida_anketa_hlasy h WHERE h.prispevek_id = p.id),
    p.pripnuto,
    p.skryto,
    p.vytvoreno,
    v_mod
  FROM public.trida_prispevky p
  WHERE p.trida_id = v_trida
    AND (NOT p.skryto OR v_mod OR p.autor = auth.uid())
  ORDER BY p.pripnuto DESC, p.vytvoreno DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 300));
END;
$$;

-- Nový příspěvek, volitelně s anketou a označenými členy. Vrací id.
DROP FUNCTION IF EXISTS public.pridat_prispevek(TEXT, TEXT, UUID[], TEXT[], TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION public.pridat_prispevek(
  p_class     TEXT,
  p_text      TEXT,
  p_zminky    UUID[] DEFAULT '{}',
  p_moznosti  TEXT[] DEFAULT NULL,
  p_anketa_do TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trida   TEXT := public._trida_id(p_class);
  v_nazev   TEXT;
  v_text    TEXT := trim(COALESCE(p_text, ''));
  v_zminky  UUID[];
  v_moznosti TEXT[];
  v_id      UUID;
  v_uid     UUID;
  v_i       INTEGER;
  v_uryvek  TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.' USING ERRCODE = '42501';
  END IF;
  IF v_trida IS NULL THEN
    RAISE EXCEPTION 'Třída „%“ neexistuje.', p_class USING ERRCODE = 'P0002';
  END IF;
  IF NOT public._v_diskuzi(v_trida) THEN
    RAISE EXCEPTION 'Psát do diskuze smějí jen členové třídy, lektoři a správci.' USING ERRCODE = '42501';
  END IF;
  IF char_length(v_text) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION 'Příspěvek musí mít 1 až 2000 znaků.' USING ERRCODE = '22023';
  END IF;

  -- Brzda proti zahlcení: nejvýš 20 příspěvků za 10 minut.
  IF (SELECT count(*) FROM public.trida_prispevky
      WHERE autor = auth.uid() AND vytvoreno > now() - interval '10 minutes') >= 20 THEN
    RAISE EXCEPTION 'Příliš mnoho příspěvků za krátkou dobu. Zkuste to prosím za chvíli.' USING ERRCODE = '54000';
  END IF;

  SELECT class_name INTO v_nazev FROM public.class_boards WHERE id = v_trida;

  -- Označit lze jen členy téže třídy (studenty a velitele); sebe ne.
  SELECT COALESCE(array_agg(DISTINCT pr.id), '{}') INTO v_zminky
  FROM public.profiles pr
  WHERE pr.id = ANY (COALESCE(p_zminky, '{}'))
    AND pr.id <> auth.uid()
    AND lower(trim(pr.user_class)) = lower(trim(v_nazev))
    AND pr.role IN ('student', 'velitel_tridy');
  IF cardinality(v_zminky) > 30 THEN
    RAISE EXCEPTION 'Najednou lze označit nejvýš 30 lidí.' USING ERRCODE = '22023';
  END IF;

  IF p_moznosti IS NOT NULL THEN
    SELECT COALESCE(array_agg(trim(m) ORDER BY o), '{}') INTO v_moznosti
    FROM unnest(p_moznosti) WITH ORDINALITY AS t(m, o)
    WHERE trim(COALESCE(m, '')) <> '';
    IF cardinality(v_moznosti) NOT BETWEEN 2 AND 10 THEN
      RAISE EXCEPTION 'Anketa potřebuje 2 až 10 vyplněných možností.' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (SELECT 1 FROM unnest(v_moznosti) m WHERE char_length(m) > 200) THEN
      RAISE EXCEPTION 'Možnost ankety může mít nejvýš 200 znaků.' USING ERRCODE = '22023';
    END IF;
    IF p_anketa_do IS NOT NULL AND p_anketa_do <= now() THEN
      RAISE EXCEPTION 'Konec ankety musí být v budoucnosti.' USING ERRCODE = '22023';
    END IF;
  ELSIF p_anketa_do IS NOT NULL THEN
    RAISE EXCEPTION 'Konec lze nastavit jen anketě.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.trida_prispevky (trida_id, autor, text, zminky, je_anketa, anketa_do)
  VALUES (v_trida, auth.uid(), v_text, v_zminky, p_moznosti IS NOT NULL, p_anketa_do)
  RETURNING trida_prispevky.id INTO v_id;

  IF p_moznosti IS NOT NULL THEN
    FOR v_i IN 1 .. cardinality(v_moznosti) LOOP
      INSERT INTO public.trida_anketa_moznosti (prispevek_id, poradi, text)
      VALUES (v_id, v_i, v_moznosti[v_i]);
    END LOOP;
  END IF;

  v_uryvek := CASE WHEN char_length(v_text) > 160 THEN left(v_text, 157) || '…' ELSE v_text END;
  FOREACH v_uid IN ARRAY v_zminky LOOP
    PERFORM public._upozornit(
      v_uid,
      format('%s vás označil(a) v diskuzi třídy %s', public._jmeno(auth.uid()), v_nazev),
      v_uryvek
    );
  END LOOP;

  RETURN v_id;
END;
$$;

-- Hlas v anketě. Opakované volání hlas změní.
DROP FUNCTION IF EXISTS public.hlasovat_v_ankete(UUID, UUID);
CREATE OR REPLACE FUNCTION public.hlasovat_v_ankete(p_prispevek UUID, p_moznost UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_p public.trida_prispevky%ROWTYPE;
BEGIN
  SELECT * INTO v_p FROM public.trida_prispevky WHERE id = p_prispevek;
  IF NOT FOUND OR NOT public._v_diskuzi(v_p.trida_id) OR (v_p.skryto AND NOT public._moderuje(v_p.trida_id)) THEN
    RAISE EXCEPTION 'Anketa neexistuje nebo k ní nemáte přístup.' USING ERRCODE = '42501';
  END IF;
  IF NOT v_p.je_anketa THEN
    RAISE EXCEPTION 'Příspěvek není anketa.' USING ERRCODE = '22023';
  END IF;
  IF v_p.anketa_ukoncena OR (v_p.anketa_do IS NOT NULL AND v_p.anketa_do <= now()) THEN
    RAISE EXCEPTION 'Anketa už skončila.' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.trida_anketa_moznosti WHERE id = p_moznost AND prispevek_id = p_prispevek) THEN
    RAISE EXCEPTION 'Tato možnost k anketě nepatří.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.trida_anketa_hlasy (prispevek_id, moznost_id, user_id)
  VALUES (p_prispevek, p_moznost, auth.uid())
  ON CONFLICT (prispevek_id, user_id)
  DO UPDATE SET moznost_id = EXCLUDED.moznost_id, hlasovano = now();
END;
$$;

-- Ukončení ankety: autor nebo moderátor.
DROP FUNCTION IF EXISTS public.ukoncit_anketu(UUID);
CREATE OR REPLACE FUNCTION public.ukoncit_anketu(p_prispevek UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_p public.trida_prispevky%ROWTYPE;
BEGIN
  SELECT * INTO v_p FROM public.trida_prispevky WHERE id = p_prispevek;
  IF NOT FOUND OR NOT v_p.je_anketa THEN
    RAISE EXCEPTION 'Anketa neexistuje.' USING ERRCODE = 'P0002';
  END IF;
  IF NOT (public._moderuje(v_p.trida_id)
          OR (v_p.autor = auth.uid() AND public._v_diskuzi(v_p.trida_id))) THEN
    RAISE EXCEPTION 'Anketu může ukončit její autor nebo velitel třídy.' USING ERRCODE = '42501';
  END IF;
  UPDATE public.trida_prispevky SET anketa_ukoncena = true WHERE id = p_prispevek;
END;
$$;

-- Moderace: připnout / skrýt. NULL = beze změny.
DROP FUNCTION IF EXISTS public.moderovat_prispevek(UUID, BOOLEAN, BOOLEAN);
CREATE OR REPLACE FUNCTION public.moderovat_prispevek(
  p_prispevek UUID,
  p_pripnout  BOOLEAN DEFAULT NULL,
  p_skryt     BOOLEAN DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_p public.trida_prispevky%ROWTYPE;
BEGIN
  SELECT * INTO v_p FROM public.trida_prispevky WHERE id = p_prispevek;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Příspěvek neexistuje.' USING ERRCODE = 'P0002';
  END IF;
  IF NOT public._moderuje(v_p.trida_id) THEN
    RAISE EXCEPTION 'Diskuzi moderuje velitel třídy, jeho zástupce, lektor nebo správce.' USING ERRCODE = '42501';
  END IF;
  UPDATE public.trida_prispevky
  SET pripnuto = COALESCE(p_pripnout, pripnuto),
      skryto   = COALESCE(p_skryt, skryto),
      skryl    = CASE WHEN p_skryt IS TRUE THEN auth.uid()
                      WHEN p_skryt IS FALSE THEN NULL
                      ELSE skryl END
  WHERE id = p_prispevek;
END;
$$;

-- Smazání: autor svůj příspěvek, moderátor kterýkoli.
DROP FUNCTION IF EXISTS public.smazat_prispevek(UUID);
CREATE OR REPLACE FUNCTION public.smazat_prispevek(p_prispevek UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_p public.trida_prispevky%ROWTYPE;
BEGIN
  SELECT * INTO v_p FROM public.trida_prispevky WHERE id = p_prispevek;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Příspěvek neexistuje.' USING ERRCODE = 'P0002';
  END IF;
  IF NOT (public._moderuje(v_p.trida_id)
          OR (v_p.autor = auth.uid() AND public._v_diskuzi(v_p.trida_id))) THEN
    RAISE EXCEPTION 'Příspěvek může smazat jeho autor nebo velitel třídy.' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.trida_prispevky WHERE id = p_prispevek;
END;
$$;

-- Práva: jen přihlášení.
DO $$
DECLARE
  f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.diskuze_tridy(text,integer)',
    'public.pridat_prispevek(text,text,uuid[],text[],timestamptz)',
    'public.hlasovat_v_ankete(uuid,uuid)',
    'public.ukoncit_anketu(uuid)',
    'public.moderovat_prispevek(uuid,boolean,boolean)',
    'public.smazat_prispevek(uuid)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f);
  END LOOP;
END;
$$;

COMMIT;

-- ─── 4. Ověření (po spuštění, jen čtení) ─────────────────────────────────────
--
--   SELECT proname FROM pg_proc
--   WHERE proname IN ('diskuze_tridy','pridat_prispevek','hlasovat_v_ankete',
--                     'ukoncit_anketu','moderovat_prispevek','smazat_prispevek');
--     -- 6 řádků
--
--   SELECT tablename FROM pg_tables
--   WHERE tablename IN ('trida_prispevky','trida_anketa_moznosti','trida_anketa_hlasy');
--     -- 3 řádky
