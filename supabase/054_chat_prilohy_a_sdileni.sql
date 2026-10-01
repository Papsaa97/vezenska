-- ============================================================================
-- 054  Chat: přílohy a sdílení věcí z aplikace
-- ============================================================================
--
-- CO SE MĚNÍ PRO UŽIVATELE
-- 1. Ke zprávě jde přiložit soubor (PDF, Word, Excel, PowerPoint, obrázek,
--    text) do 10 MB. Zprávu tvoří jen příloha, nebo příloha s textem.
-- 2. Z aplikace jde do konverzace poslat soubor z Knihovny, otázku,
--    předpis nebo článek z Kompasu zákonů. Ve zprávě se ukáže jako karta.
-- 3. Přílohu otevře jen člen konverzace (a lektor či správce, pokud mu
--    zprávu s přílohou někdo nahlásil). Smazáním zprávy příloha zmizí
--    ostatním hned; dokud zprávu drží otevřené nahlášení, zůstane jen pro
--    moderátory, stejně jako text.
--
-- JAK
-- * Soukromý kbelík `chat-prilohy`, cesta `<id konverzace>/<náhodné id>.<přípona>`.
--   Nahrát smí jen člen té konverzace (nejvýš 40 souborů za 24 h), číst jen
--   ten, komu zpráva s tou cestou patří (viz _chat_smi_cist_prilohu).
--   Soubor bez zprávy (nepovedené odeslání) čte jen ten, kdo ho nahrál,
--   a ten ho smí i smazat. Soubor, na který zpráva odkazuje, smazat nejde.
-- * Zpráva dostává sloupce `priloha_*` a `sdileni` (JSONB, nejvýš 6000 znaků;
--   obsah ukazuje klient jako text, nikdy jako HTML).
-- * `chat_odeslat` přibírá nepovinné parametry; stará aplikace volá dál se
--   dvěma a funguje beze změny.
--
-- Spouštět po 052. Skript je idempotentní.
-- ============================================================================

-- ─── 1. Sloupce zprávy ───────────────────────────────────────────────────────

ALTER TABLE public.chat_zpravy ADD COLUMN IF NOT EXISTS priloha_cesta    TEXT;
ALTER TABLE public.chat_zpravy ADD COLUMN IF NOT EXISTS priloha_nazev    TEXT;
ALTER TABLE public.chat_zpravy ADD COLUMN IF NOT EXISTS priloha_typ      TEXT;
ALTER TABLE public.chat_zpravy ADD COLUMN IF NOT EXISTS priloha_velikost BIGINT;
ALTER TABLE public.chat_zpravy ADD COLUMN IF NOT EXISTS sdileni          JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_zpravy_priloha
  ON public.chat_zpravy (priloha_cesta) WHERE priloha_cesta IS NOT NULL;

-- Původní kontrola z 052 vyžadovala 1–2000 znaků textu. Zpráva teď může být
-- i jen příloha nebo sdílená věc.
DO $$
DECLARE
  v_nazev TEXT;
BEGIN
  FOR v_nazev IN
    SELECT con.conname FROM pg_constraint con
    WHERE con.conrelid = 'public.chat_zpravy'::regclass
      AND con.contype = 'c'
      AND con.conname <> 'chat_zpravy_obsah_check'
      AND pg_get_constraintdef(con.oid) LIKE '%char_length%'
  LOOP
    EXECUTE format('ALTER TABLE public.chat_zpravy DROP CONSTRAINT %I', v_nazev);
  END LOOP;
END;
$$;

ALTER TABLE public.chat_zpravy DROP CONSTRAINT IF EXISTS chat_zpravy_obsah_check;
ALTER TABLE public.chat_zpravy ADD CONSTRAINT chat_zpravy_obsah_check CHECK (
  smazano OR (
    char_length(trim(text)) <= 2000
    AND (char_length(trim(text)) >= 1 OR priloha_cesta IS NOT NULL OR sdileni IS NOT NULL)
  )
);

ALTER TABLE public.chat_zpravy DROP CONSTRAINT IF EXISTS chat_zpravy_sdileni_check;
ALTER TABLE public.chat_zpravy ADD CONSTRAINT chat_zpravy_sdileni_check CHECK (
  sdileni IS NULL OR (jsonb_typeof(sdileni) = 'object' AND char_length(sdileni::text) <= 6000)
);

-- ─── 2. Kbelík ───────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-prilohy', 'chat-prilohy', false, 10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'text/plain', 'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─── 3. Kdo smí nahrát a kdo číst ────────────────────────────────────────────

-- Id konverzace z cesty `<uuid>/<soubor>`; nevalidní cesta = NULL (žádná
-- výjimka uvnitř politiky).
CREATE OR REPLACE FUNCTION public._chat_konverzace_z_cesty(p_cesta TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_cesta ~ '^[0-9a-fA-F-]{36}/[A-Za-z0-9._-]{1,120}$'
      THEN split_part(p_cesta, '/', 1)::UUID
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public._chat_smi_nahrat_prilohu(p_cesta TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_konv UUID := public._chat_konverzace_z_cesty(p_cesta);
BEGIN
  IF v_konv IS NULL OR auth.uid() IS NULL OR NOT public._chat_smi(auth.uid()) THEN
    RETURN false;
  END IF;
  IF NOT public._chat_je_clen(v_konv) THEN
    RETURN false;
  END IF;
  -- Brzda proti zaplnění úložiště: 40 souborů za 24 hodin na člověka.
  RETURN (
    SELECT count(*) FROM storage.objects o
    WHERE o.bucket_id = 'chat-prilohy'
      AND o.owner_id = auth.uid()::TEXT
      AND o.created_at > now() - interval '1 day'
  ) < 40;
END;
$$;

CREATE OR REPLACE FUNCTION public._chat_smi_cist_prilohu(p_cesta TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.chat_zpravy z
    WHERE z.priloha_cesta = p_cesta
      AND (
        (NOT z.smazano AND public._chat_smi(auth.uid()) AND public._chat_je_clen(z.konverzace_id))
        OR (public.is_staff() AND EXISTS (
              SELECT 1 FROM public.chat_nahlaseni n WHERE n.zprava_id = z.id))
      )
  );
$$;

-- Soubor, na který žádná zpráva neodkazuje (odeslání selhalo, nebo zpráva
-- byla smazaná a nahlášení vyřízené). Takový smí jeho autor smazat.
CREATE OR REPLACE FUNCTION public._chat_priloha_volna(p_cesta TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.chat_zpravy z WHERE z.priloha_cesta = p_cesta);
$$;

REVOKE ALL ON FUNCTION public._chat_konverzace_z_cesty(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public._chat_smi_nahrat_prilohu(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public._chat_smi_cist_prilohu(TEXT)   FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public._chat_priloha_volna(TEXT)      FROM PUBLIC, anon;
-- Politiky nad storage.objects běží jako volající, proto EXECUTE pro přihlášené.
GRANT EXECUTE ON FUNCTION public._chat_konverzace_z_cesty(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public._chat_smi_nahrat_prilohu(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public._chat_smi_cist_prilohu(TEXT)   TO authenticated;
GRANT EXECUTE ON FUNCTION public._chat_priloha_volna(TEXT)      TO authenticated;

DROP POLICY IF EXISTS "Chat: přílohu nahraje člen konverzace" ON storage.objects;
CREATE POLICY "Chat: přílohu nahraje člen konverzace"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-prilohy'
    AND public._chat_smi_nahrat_prilohu(name)
  );

DROP POLICY IF EXISTS "Chat: přílohu čte člen konverzace" ON storage.objects;
CREATE POLICY "Chat: přílohu čte člen konverzace"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-prilohy'
    AND (owner_id = auth.uid()::TEXT OR public._chat_smi_cist_prilohu(name))
  );

DROP POLICY IF EXISTS "Chat: nepoužitou přílohu smaže autor" ON storage.objects;
CREATE POLICY "Chat: nepoužitou přílohu smaže autor"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'chat-prilohy'
    AND owner_id = auth.uid()::TEXT
    AND public._chat_priloha_volna(name)
  );

-- ─── 4. Náhled zprávy (seznam konverzací, upozornění) ────────────────────────

CREATE OR REPLACE FUNCTION public._chat_nahled(p_text TEXT, p_priloha TEXT, p_sdileni JSONB)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN char_length(trim(COALESCE(p_text, ''))) > 0 THEN p_text
    WHEN p_priloha IS NOT NULL THEN 'Příloha: ' || p_priloha
    WHEN p_sdileni IS NOT NULL THEN 'Sdílí: ' || COALESCE(p_sdileni->>'nazev', 'odkaz z aplikace')
    ELSE ''
  END;
$$;
REVOKE ALL ON FUNCTION public._chat_nahled(TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public._chat_push(p_zprava UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tajemstvi TEXT;
  v_z         public.chat_zpravy%ROWTYPE;
  v_k         public.chat_konverzace%ROWTYPE;
  v_titulek   TEXT;
  v_text      TEXT;
  v_davka     JSONB;
BEGIN
  SELECT decrypted_secret INTO v_tajemstvi
  FROM vault.decrypted_secrets WHERE name = 'push_webhook_secret';
  IF v_tajemstvi IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO v_z FROM public.chat_zpravy WHERE id = p_zprava;
  SELECT * INTO v_k FROM public.chat_konverzace WHERE id = v_z.konverzace_id;

  v_titulek := CASE WHEN v_k.je_skupina
    THEN format('%s · %s', v_k.nazev, public._jmeno(v_z.autor))
    ELSE format('Zpráva od %s', public._jmeno(v_z.autor))
  END;
  v_text := public._chat_nahled(v_z.text, v_z.priloha_nazev, v_z.sdileni);
  v_text := CASE WHEN char_length(v_text) > 160 THEN left(v_text, 157) || '…' ELSE v_text END;

  FOR v_davka IN
    SELECT jsonb_agg(z)
    FROM (
      SELECT jsonb_build_object(
               'endpoint', o.endpoint,
               'p256dh',   o.p256dh,
               'auth',     o.auth,
               'title',    left(v_titulek, 200),
               'body',     v_text,
               'tag',      'chat-' || v_k.id,
               'url',      '/#chat/' || v_k.id
             ) AS z,
             (row_number() OVER () - 1) / 200 AS davka
      FROM public.chat_clenove c
      JOIN public.push_odbery o ON o.user_id = c.user_id
      LEFT JOIN public.push_predvolby p ON p.user_id = c.user_id
      WHERE c.konverzace_id = v_k.id
        AND c.user_id IS DISTINCT FROM v_z.autor
        AND NOT c.ztlumeno
        AND NOT ('chat' = ANY (COALESCE(p.vypnute_druhy, '{}')))
    ) s
    GROUP BY davka
  LOOP
    PERFORM net.http_post(
      url     := 'https://akademie-vscr.app/api/push',
      body    := jsonb_build_object('zpravy', v_davka),
      headers := jsonb_build_object(
                   'Content-Type', 'application/json',
                   'Authorization', 'Bearer ' || v_tajemstvi
                 ),
      timeout_milliseconds := 15000
    );
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Upozornění na zprávu v chatu se nepodařilo zařadit: %', SQLERRM;
END;
$$;
REVOKE ALL ON FUNCTION public._chat_push(UUID) FROM PUBLIC, anon, authenticated;

-- Seznam konverzací: náhled poslední zprávy počítá i s přílohou a sdílením.
CREATE OR REPLACE FUNCTION public.chat_konverzace_seznam()
RETURNS TABLE (
  id              UUID,
  je_skupina      BOOLEAN,
  nazev           TEXT,
  protistrana_id  UUID,
  protistrana_role TEXT,
  pocet_clenu     INTEGER,
  posledni_text   TEXT,
  posledni_autor  TEXT,
  posledni_moje   BOOLEAN,
  posledni_cas    TIMESTAMPTZ,
  neprectene      INTEGER,
  ztlumeno        BOOLEAN,
  spravuji        BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  PERFORM public._chat_overit();
  RETURN QUERY
  SELECT
    k.id,
    k.je_skupina,
    CASE WHEN k.je_skupina THEN k.nazev
         ELSE COALESCE(public._jmeno(o.user_id), 'Smazaný účet') END,
    o.user_id,
    (SELECT pr.role FROM public.profiles pr WHERE pr.id = o.user_id),
    (SELECT count(*)::INTEGER FROM public.chat_clenove c2 WHERE c2.konverzace_id = k.id),
    CASE WHEN p.smazano THEN 'Zpráva byla smazána.'
         ELSE public._chat_nahled(p.text, p.priloha_nazev, p.sdileni) END,
    CASE WHEN p.autor IS NULL THEN NULL ELSE COALESCE(public._jmeno(p.autor), 'Smazaný účet') END,
    p.autor = auth.uid(),
    COALESCE(p.vytvoreno, k.vytvoreno),
    (SELECT count(*)::INTEGER FROM public.chat_zpravy z
      WHERE z.konverzace_id = k.id AND z.vytvoreno > c.precteno_do
        AND z.autor IS DISTINCT FROM auth.uid() AND NOT z.smazano),
    c.ztlumeno,
    k.je_skupina AND k.zalozil = auth.uid()
  FROM public.chat_clenove c
  JOIN public.chat_konverzace k ON k.id = c.konverzace_id
  LEFT JOIN LATERAL (
    SELECT c3.user_id FROM public.chat_clenove c3
    WHERE c3.konverzace_id = k.id AND c3.user_id <> auth.uid()
    LIMIT 1
  ) o ON NOT k.je_skupina
  LEFT JOIN LATERAL (
    SELECT z.text, z.autor, z.vytvoreno, z.smazano, z.priloha_nazev, z.sdileni
    FROM public.chat_zpravy z
    WHERE z.konverzace_id = k.id
    ORDER BY z.vytvoreno DESC LIMIT 1
  ) p ON true
  WHERE c.user_id = auth.uid()
  ORDER BY k.posledni_zprava DESC
  LIMIT 300;
END;
$$;

-- ─── 5. Zprávy konverzace s přílohou a sdílením ──────────────────────────────

DROP FUNCTION IF EXISTS public.chat_zpravy_konverzace(UUID, TIMESTAMPTZ, INTEGER);
CREATE FUNCTION public.chat_zpravy_konverzace(
  p_konv  UUID,
  p_pred  TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 60
)
RETURNS TABLE (
  id               UUID,
  autor_id         UUID,
  autor_jmeno      TEXT,
  autor_role       TEXT,
  text             TEXT,
  vytvoreno        TIMESTAMPTZ,
  smazano          BOOLEAN,
  moje             BOOLEAN,
  nahlasil_jsem    BOOLEAN,
  priloha_cesta    TEXT,
  priloha_nazev    TEXT,
  priloha_typ      TEXT,
  priloha_velikost BIGINT,
  sdileni          JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  PERFORM public._chat_overit();
  IF NOT public._chat_je_clen(p_konv) THEN
    RAISE EXCEPTION 'Konverzace neexistuje nebo v ní nejste.' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT
    z.id,
    z.autor,
    COALESCE(public._jmeno(z.autor), 'Smazaný účet'),
    (SELECT pr.role FROM public.profiles pr WHERE pr.id = z.autor),
    CASE WHEN z.smazano THEN '' ELSE z.text END,
    z.vytvoreno,
    z.smazano,
    z.autor = auth.uid(),
    EXISTS (SELECT 1 FROM public.chat_nahlaseni n WHERE n.zprava_id = z.id AND n.nahlasil = auth.uid()),
    CASE WHEN z.smazano THEN NULL ELSE z.priloha_cesta END,
    CASE WHEN z.smazano THEN NULL ELSE z.priloha_nazev END,
    CASE WHEN z.smazano THEN NULL ELSE z.priloha_typ END,
    CASE WHEN z.smazano THEN NULL ELSE z.priloha_velikost END,
    CASE WHEN z.smazano THEN NULL ELSE z.sdileni END
  FROM public.chat_zpravy z
  WHERE z.konverzace_id = p_konv
    AND (p_pred IS NULL OR z.vytvoreno < p_pred)
  ORDER BY z.vytvoreno DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 60), 200));
END;
$$;
REVOKE ALL ON FUNCTION public.chat_zpravy_konverzace(UUID, TIMESTAMPTZ, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.chat_zpravy_konverzace(UUID, TIMESTAMPTZ, INTEGER) TO authenticated;

-- ─── 6. Odeslání s přílohou nebo sdílenou věcí ───────────────────────────────

DROP FUNCTION IF EXISTS public.chat_odeslat(UUID, TEXT);
DROP FUNCTION IF EXISTS public.chat_odeslat(UUID, TEXT, TEXT, TEXT, JSONB);
CREATE FUNCTION public.chat_odeslat(
  p_konv          UUID,
  p_text          TEXT,
  p_priloha       TEXT  DEFAULT NULL,
  p_priloha_nazev TEXT  DEFAULT NULL,
  p_sdileni       JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_text   TEXT := trim(COALESCE(p_text, ''));
  v_id     UUID;
  v_typ    TEXT;
  v_vel    BIGINT;
  v_nazev  TEXT;
  v_druh   TEXT;
BEGIN
  PERFORM public._chat_overit();
  IF NOT public._chat_je_clen(p_konv) THEN
    RAISE EXCEPTION 'Konverzace neexistuje nebo v ní nejste.' USING ERRCODE = '42501';
  END IF;
  IF char_length(v_text) > 2000 THEN
    RAISE EXCEPTION 'Zpráva může mít nejvýš 2000 znaků.' USING ERRCODE = '22023';
  END IF;
  IF char_length(v_text) = 0 AND p_priloha IS NULL AND p_sdileni IS NULL THEN
    RAISE EXCEPTION 'Napište zprávu nebo přiložte soubor.' USING ERRCODE = '22023';
  END IF;
  IF p_priloha IS NOT NULL AND p_sdileni IS NOT NULL THEN
    RAISE EXCEPTION 'Zpráva nese buď přílohu, nebo sdílenou věc, ne obojí.' USING ERRCODE = '22023';
  END IF;

  -- Příloha: soubor musí ležet ve složce této konverzace, nahrát ho musel
  -- odesílatel a nesmí ho už používat jiná zpráva. Typ a velikost se berou
  -- z úložiště, ne od klienta.
  IF p_priloha IS NOT NULL THEN
    IF public._chat_konverzace_z_cesty(p_priloha) IS DISTINCT FROM p_konv THEN
      RAISE EXCEPTION 'Příloha nepatří k této konverzaci.' USING ERRCODE = '22023';
    END IF;
    SELECT o.metadata->>'mimetype', (o.metadata->>'size')::BIGINT
    INTO v_typ, v_vel
    FROM storage.objects o
    WHERE o.bucket_id = 'chat-prilohy' AND o.name = p_priloha AND o.owner_id = auth.uid()::TEXT;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Příloha se nenahrála. Zkuste ji přiložit znovu.' USING ERRCODE = 'P0002';
    END IF;
    IF NOT public._chat_priloha_volna(p_priloha) THEN
      RAISE EXCEPTION 'Tahle příloha už byla odeslaná.' USING ERRCODE = '23505';
    END IF;
    v_nazev := left(regexp_replace(trim(COALESCE(p_priloha_nazev, '')), '[\r\n\t/\\]+', ' ', 'g'), 200);
    IF v_nazev = '' THEN
      v_nazev := split_part(p_priloha, '/', 2);
    END IF;
  END IF;

  -- Sdílená věc: jen známé druhy a rozumná velikost. Obsah zobrazuje klient
  -- jako prostý text.
  IF p_sdileni IS NOT NULL THEN
    IF jsonb_typeof(p_sdileni) <> 'object' OR char_length(p_sdileni::text) > 6000 THEN
      RAISE EXCEPTION 'Sdílená položka je příliš velká.' USING ERRCODE = '22023';
    END IF;
    v_druh := p_sdileni->>'druh';
    IF v_druh IS NULL OR v_druh NOT IN ('material', 'otazka', 'predpis', 'clanek') THEN
      RAISE EXCEPTION 'Tuhle věc nelze sdílet.' USING ERRCODE = '22023';
    END IF;
    IF char_length(trim(COALESCE(p_sdileni->>'nazev', ''))) NOT BETWEEN 1 AND 300 THEN
      RAISE EXCEPTION 'Sdílená položka nemá název.' USING ERRCODE = '22023';
    END IF;
  END IF;

  -- Přímá konverzace s někým, kdo chat ztratil (vyřazen ze třídy): nepsat.
  IF EXISTS (
    SELECT 1 FROM public.chat_konverzace k
    JOIN public.chat_clenove c ON c.konverzace_id = k.id
    WHERE k.id = p_konv AND NOT k.je_skupina
      AND c.user_id <> auth.uid() AND NOT public._chat_smi(c.user_id)
  ) THEN
    RAISE EXCEPTION 'Tomuto uživateli teď nelze psát (není zařazen do třídy).' USING ERRCODE = '42501';
  END IF;
  -- Brzda proti zahlcení: nejvýš 30 zpráv za minutu.
  IF (SELECT count(*) FROM public.chat_zpravy
      WHERE autor = auth.uid() AND vytvoreno > now() - interval '1 minute') >= 30 THEN
    RAISE EXCEPTION 'Příliš mnoho zpráv za krátkou dobu. Zkuste to prosím za chvíli.' USING ERRCODE = '54000';
  END IF;

  INSERT INTO public.chat_zpravy (
    konverzace_id, autor, text,
    priloha_cesta, priloha_nazev, priloha_typ, priloha_velikost, sdileni
  )
  VALUES (
    p_konv, auth.uid(), v_text,
    p_priloha, v_nazev,
    v_typ,
    v_vel,
    p_sdileni
  )
  RETURNING chat_zpravy.id INTO v_id;

  UPDATE public.chat_konverzace SET posledni_zprava = now() WHERE id = p_konv;
  UPDATE public.chat_clenove SET precteno_do = now()
  WHERE konverzace_id = p_konv AND user_id = auth.uid();

  PERFORM public._chat_push(v_id);
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.chat_odeslat(UUID, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.chat_odeslat(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- ─── 7. Mazání a moderace uvolní i přílohu ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.chat_smazat_zpravu(p_zprava UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_z      public.chat_zpravy%ROWTYPE;
  v_drzi   BOOLEAN;
BEGIN
  PERFORM public._chat_overit();
  SELECT * INTO v_z FROM public.chat_zpravy WHERE id = p_zprava;
  IF NOT FOUND OR v_z.autor IS DISTINCT FROM auth.uid() OR NOT public._chat_je_clen(v_z.konverzace_id) THEN
    RAISE EXCEPTION 'Smazat můžete jen svou zprávu.' USING ERRCODE = '42501';
  END IF;
  v_drzi := EXISTS (
    SELECT 1 FROM public.chat_nahlaseni n
    WHERE n.zprava_id = p_zprava AND n.vyrizeno IS NULL
  );
  UPDATE public.chat_zpravy
  SET smazano          = true,
      smazal           = auth.uid(),
      text             = CASE WHEN v_drzi THEN text ELSE '' END,
      priloha_cesta    = CASE WHEN v_drzi THEN priloha_cesta ELSE NULL END,
      priloha_nazev    = CASE WHEN v_drzi THEN priloha_nazev ELSE NULL END,
      priloha_typ      = CASE WHEN v_drzi THEN priloha_typ ELSE NULL END,
      priloha_velikost = CASE WHEN v_drzi THEN priloha_velikost ELSE NULL END,
      sdileni          = CASE WHEN v_drzi THEN sdileni ELSE NULL END
  WHERE id = p_zprava;
END;
$$;

DROP FUNCTION IF EXISTS public.chat_nahlaseni_seznam(BOOLEAN);
CREATE FUNCTION public.chat_nahlaseni_seznam(p_vcetne_vyrizenych BOOLEAN DEFAULT false)
RETURNS TABLE (
  id             UUID,
  zprava_id      UUID,
  text           TEXT,
  autor_jmeno    TEXT,
  zprava_cas     TIMESTAMPTZ,
  zprava_smazana BOOLEAN,
  konverzace     TEXT,
  nahlasil_jmeno TEXT,
  duvod          TEXT,
  vytvoreno      TIMESTAMPTZ,
  vyrizeno       TIMESTAMPTZ,
  vyridil_jmeno  TEXT,
  zprava_skryta  BOOLEAN,
  priloha_cesta    TEXT,
  priloha_nazev    TEXT,
  priloha_typ      TEXT,
  priloha_velikost BIGINT,
  sdileni          JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Nahlášení vyřizují lektoři a správci.' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT
    n.id,
    z.id,
    z.text,
    COALESCE(public._jmeno(z.autor), 'Smazaný účet'),
    z.vytvoreno,
    z.smazano,
    CASE WHEN k.je_skupina THEN 'Skupina „' || k.nazev || '“' ELSE 'Přímá konverzace' END,
    COALESCE(public._jmeno(n.nahlasil), 'Smazaný účet'),
    n.duvod,
    n.vytvoreno,
    n.vyrizeno,
    public._jmeno(n.vyridil),
    n.zprava_skryta,
    z.priloha_cesta,
    z.priloha_nazev,
    z.priloha_typ,
    z.priloha_velikost,
    z.sdileni
  FROM public.chat_nahlaseni n
  JOIN public.chat_zpravy z ON z.id = n.zprava_id
  JOIN public.chat_konverzace k ON k.id = z.konverzace_id
  WHERE p_vcetne_vyrizenych OR n.vyrizeno IS NULL
  ORDER BY (n.vyrizeno IS NULL) DESC, n.vytvoreno DESC
  LIMIT 200;
END;
$$;
REVOKE ALL ON FUNCTION public.chat_nahlaseni_seznam(BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.chat_nahlaseni_seznam(BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.chat_vyridit_nahlaseni(p_nahlaseni UUID, p_skryt BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_zprava UUID;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Nahlášení vyřizují lektoři a správci.' USING ERRCODE = '42501';
  END IF;
  SELECT zprava_id INTO v_zprava FROM public.chat_nahlaseni WHERE id = p_nahlaseni;
  IF v_zprava IS NULL THEN
    RAISE EXCEPTION 'Nahlášení neexistuje.' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.chat_nahlaseni
  SET vyrizeno = now(), vyridil = auth.uid(), zprava_skryta = COALESCE(p_skryt, false)
  WHERE zprava_id = v_zprava AND vyrizeno IS NULL;

  -- Skrytá zpráva, nebo zpráva, kterou autor mezitím smazal sám: text,
  -- příloha i sdílená věc už nic nedrží. Soubor v úložišti zůstane bez
  -- odkazu a nikdo ho nepřečte (politika čtení hledá živou zprávu).
  UPDATE public.chat_zpravy
  SET smazano = true,
      smazal  = CASE WHEN smazano THEN smazal ELSE auth.uid() END,
      text = '', priloha_cesta = NULL, priloha_nazev = NULL,
      priloha_typ = NULL, priloha_velikost = NULL, sdileni = NULL
  WHERE id = v_zprava AND (p_skryt OR smazano);
END;
$$;

-- ─── 8. Ověření ──────────────────────────────────────────────────────────────
--
--   SELECT id, public, file_size_limit FROM storage.buckets WHERE id = 'chat-prilohy';
--     -- public = false, 10485760
--   SELECT policyname, cmd FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE 'Chat:%';
--     -- 3 řádky: INSERT, SELECT, DELETE
--   SELECT pg_get_function_identity_arguments('public.chat_odeslat'::regproc);
--     -- p_konv uuid, p_text text, p_priloha text, p_priloha_nazev text, p_sdileni jsonb
