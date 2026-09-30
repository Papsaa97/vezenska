-- ============================================================================
-- 044  Upozornění do zařízení (Web Push)
-- ============================================================================
--
-- CO CHYBĚLO
-- Oznámení ve zvonečku uživatel uviděl, až když aplikaci sám otevřel. O zprávě
-- od správce, označení v diskuzi nebo novém hlášení ve třídě se tak mohl
-- dozvědět za několik dní (návrh z 30. 9. 2026). K tomu:
-- • nová anketa v diskuzi třídy nechodila do zvonečku vůbec,
-- • nové hlášení na nástěnce třídy také ne — 043 hlídala jen položky typu
--   „Událost“, jenže formulář na nástěnce ukládá každou položku jako typ
--   „custom“ (SectionModal.tsx) a na produkci je jen typ „notice“, takže
--   trigger z 043 nikdy nic neposlal.
--
-- JAK TO FUNGUJE
--   zápis do user_notifications
--     → trigger push_odeslat (jednou za příkaz, ne za řádek)
--     → pg_net pošle POST na https://akademie-vscr.app/api/push
--       se sdíleným tajemstvím z Vaultu a seznamem zařízení příjemců
--     → serverless funkce na Vercelu zprávy zašifruje klíčem VAPID a předá
--       push službě prohlížeče (Google, Mozilla, Apple, Microsoft).
--   Zvoneček zůstává jediným zdrojem pravdy: do zařízení jde přesně to, co
--   se zapíše do zvonku, nic navíc.
--
-- CO TENHLE SKRIPT DĚLÁ
-- 1. Zapne rozšíření pg_net a do Vaultu uloží náhodné tajemství
--    `push_webhook_secret` (hodnotu nikdo nemusí opisovat do SQL).
-- 2. Přidá do user_notifications sloupec `druh` (podle něj si uživatel
--    jednotlivé druhy vypíná).
-- 3. Tabulky push_odbery (zařízení) a push_predvolby (vypnuté druhy),
--    obě zavřené — přístup jen přes funkce níže.
-- 4. Funkce pro aplikaci: uložit / zrušit odběr, načíst / uložit předvolby.
--    Funkce pro server: odebrat zařízení, která push služba už nezná.
-- 5. Trigger, který po zápisu do zvonku odešle upozornění.
-- 6. Oznámení s druhem: zmínky, NOVÁ ANKETA, celoškolní oznámení, NOVÉ
--    HLÁŠENÍ NA NÁSTĚNCE TŘÍDY (jakéhokoli typu) a nový rozvrh.
--
-- PO SPUŠTĚNÍ (jednou): hodnotu tajemství zkopírovat do Vercelu jako
-- PUSH_WEBHOOK_SECRET — dotaz je v sekci Ověření dole.
--
-- Spouštět po 043. Idempotentní.
-- ============================================================================

BEGIN;

-- ─── 1. pg_net a tajemství ───────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'push_webhook_secret') THEN
    PERFORM vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'push_webhook_secret',
      'Sdílené tajemství mezi databází a /api/push (Vercel PUSH_WEBHOOK_SECRET).'
    );
  END IF;
END;
$$;

-- ─── 2. Druh oznámení ────────────────────────────────────────────────────────
--
-- zprava        zpráva od správce (UserManager vkládá bez druhu → výchozí)
-- zminka        někdo vás označil v diskuzi třídy
-- anketa        nová anketa v diskuzi třídy
-- nastenka      nové hlášení / událost / rozvrh na nástěnce třídy
-- celoskolni    celoškolní oznámení
-- zarazeni      žádosti, nominace a změny zařazení do třídy

ALTER TABLE public.user_notifications
  ADD COLUMN IF NOT EXISTS druh TEXT NOT NULL DEFAULT 'zprava';

ALTER TABLE public.user_notifications
  DROP CONSTRAINT IF EXISTS user_notifications_druh_check;
ALTER TABLE public.user_notifications
  ADD CONSTRAINT user_notifications_druh_check
  CHECK (druh IN ('zprava', 'zminka', 'anketa', 'nastenka', 'celoskolni', 'zarazeni'));

-- Příjemce smí měnit jen is_read — druh patří k obsahu zprávy.
CREATE OR REPLACE FUNCTION public.protect_notification_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.title := OLD.title;
  NEW.body := OLD.body;
  NEW.user_id := OLD.user_id;
  NEW.sender_id := OLD.sender_id;
  NEW.created_at := OLD.created_at;
  NEW.druh := OLD.druh;
  RETURN NEW;
END;
$$;

-- ─── 3. Zařízení a předvolby ─────────────────────────────────────────────────

-- Adresa push služby. Jen známé služby prohlížečů: jinak by si kdokoli mohl
-- zaregistrovat vlastní adresu a server by na ni posílal požadavky.
CREATE OR REPLACE FUNCTION public._push_adresa_je_platna(p_endpoint TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_endpoint IS NOT NULL
     AND char_length(p_endpoint) <= 1000
     AND p_endpoint ~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.notify\.windows\.com|web\.push\.apple\.com|[a-z0-9.-]+\.push\.apple\.com)/';
$$;

CREATE TABLE IF NOT EXISTS public.push_odbery (
  endpoint  TEXT PRIMARY KEY CHECK (public._push_adresa_je_platna(endpoint)),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  p256dh    TEXT NOT NULL CHECK (char_length(p256dh) BETWEEN 20 AND 200),
  auth      TEXT NOT NULL CHECK (char_length(auth) BETWEEN 8 AND 100),
  zarizeni  TEXT CHECK (char_length(zarizeni) <= 120),
  vytvoreno TIMESTAMPTZ NOT NULL DEFAULT now(),
  obnoveno  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_push_odbery_user ON public.push_odbery (user_id);
ALTER TABLE public.push_odbery ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_odbery FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.push_predvolby (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vypnute_druhy TEXT[] NOT NULL DEFAULT '{}',
  upraveno      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.push_predvolby ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_predvolby FROM anon, authenticated;

-- ─── 4. Funkce pro aplikaci a server ─────────────────────────────────────────

-- Uloží odběr tohoto zařízení přihlášenému uživateli. Stejné zařízení
-- (endpoint) po přihlášení jiného účtu přejde na nový účet — upozornění
-- předchozího uživatele na sdíleném počítači dál nechodí.
CREATE OR REPLACE FUNCTION public.push_ulozit_odber(
  p_endpoint TEXT,
  p_p256dh   TEXT,
  p_auth     TEXT,
  p_zarizeni TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.' USING ERRCODE = '42501';
  END IF;
  IF NOT public._push_adresa_je_platna(p_endpoint) THEN
    RAISE EXCEPTION 'Neznámá služba pro upozornění.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.push_odbery (endpoint, user_id, p256dh, auth, zarizeni)
  VALUES (p_endpoint, auth.uid(), p_p256dh, p_auth, left(p_zarizeni, 120))
  ON CONFLICT (endpoint) DO UPDATE
    SET user_id  = EXCLUDED.user_id,
        p256dh   = EXCLUDED.p256dh,
        auth     = EXCLUDED.auth,
        zarizeni = EXCLUDED.zarizeni,
        obnoveno = now();

  -- Nejvýš 10 zařízení na účet; nejdéle neobnovená odpadnou.
  DELETE FROM public.push_odbery
  WHERE user_id = auth.uid()
    AND endpoint IN (
      SELECT endpoint FROM public.push_odbery
      WHERE user_id = auth.uid()
      ORDER BY obnoveno DESC
      OFFSET 10
    );
END;
$$;

-- Zruší odběr tohoto zařízení (vypnutí v aplikaci, odhlášení).
CREATE OR REPLACE FUNCTION public.push_zrusit_odber(p_endpoint TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.push_odbery
  WHERE endpoint = p_endpoint AND user_id = auth.uid();
$$;

-- Vypnuté druhy upozornění přihlášeného uživatele.
CREATE OR REPLACE FUNCTION public.push_nacist_predvolby()
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT vypnute_druhy FROM public.push_predvolby WHERE user_id = auth.uid()),
    '{}'::TEXT[]
  );
$$;

CREATE OR REPLACE FUNCTION public.push_ulozit_predvolby(p_vypnute TEXT[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vypnute TEXT[];
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(array_agg(DISTINCT d), '{}') INTO v_vypnute
  FROM unnest(COALESCE(p_vypnute, '{}')) AS d
  WHERE d IN ('zprava', 'zminka', 'anketa', 'nastenka', 'celoskolni', 'zarazeni');

  INSERT INTO public.push_predvolby (user_id, vypnute_druhy)
  VALUES (auth.uid(), v_vypnute)
  ON CONFLICT (user_id) DO UPDATE
    SET vypnute_druhy = EXCLUDED.vypnute_druhy, upraveno = now();
END;
$$;

-- Server hlásí zařízení, která push služba odmítla jako neexistující
-- (HTTP 404/410 — uživatel zrušil povolení nebo odinstaloval prohlížeč).
-- Volá ho /api/push s veřejným klíčem Supabase, proto je otevřená i roli
-- anon; bez správného tajemství nesmaže nic.
CREATE OR REPLACE FUNCTION public.push_odebrat_neplatne(p_tajemstvi TEXT, p_endpointy TEXT[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tajemstvi TEXT;
  v_pocet     INTEGER;
BEGIN
  SELECT decrypted_secret INTO v_tajemstvi
  FROM vault.decrypted_secrets WHERE name = 'push_webhook_secret';
  IF v_tajemstvi IS NULL OR p_tajemstvi IS DISTINCT FROM v_tajemstvi THEN
    RAISE EXCEPTION 'Neplatné tajemství.' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.push_odbery WHERE endpoint = ANY (COALESCE(p_endpointy, '{}'));
  GET DIAGNOSTICS v_pocet = ROW_COUNT;
  RETURN v_pocet;
END;
$$;

REVOKE ALL ON FUNCTION public._push_adresa_je_platna(TEXT) FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.push_ulozit_odber(text,text,text,text)',
    'public.push_zrusit_odber(text)',
    'public.push_nacist_predvolby()',
    'public.push_ulozit_predvolby(text[])'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f);
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.push_odebrat_neplatne(TEXT, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.push_odebrat_neplatne(TEXT, TEXT[]) TO anon, authenticated;

-- ─── 5. Odeslání po zápisu do zvonku ─────────────────────────────────────────

-- Kam má klepnutí na upozornění aplikaci otevřít.
CREATE OR REPLACE FUNCTION public._push_cil(p_druh TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_druh
    WHEN 'zminka'     THEN '/#dashboard'
    WHEN 'anketa'     THEN '/#dashboard'
    WHEN 'nastenka'   THEN '/#dashboard'
    WHEN 'celoskolni' THEN '/#dashboard'
    WHEN 'zarazeni'   THEN '/#dashboard'
    ELSE '/'
  END;
$$;
REVOKE ALL ON FUNCTION public._push_cil(TEXT) FROM PUBLIC, anon, authenticated;

-- Jednou za příkaz INSERT: hromadné oznámení všem (celoškolní hlášení)
-- je jeden příkaz, a tedy jeden požadavek na server, ne stovka.
--
-- Selhání odeslání nesmí nikdy zabránit zápisu do zvonku — proto EXCEPTION
-- blok na konci. pg_net navíc požadavek jen zařadí do fronty a pošle ho až
-- po potvrzení transakce, takže pomalý server zápis nezdrží.
CREATE OR REPLACE FUNCTION public.push_odeslat()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tajemstvi TEXT;
  v_davka     JSONB;
BEGIN
  SELECT decrypted_secret INTO v_tajemstvi
  FROM vault.decrypted_secrets WHERE name = 'push_webhook_secret';
  IF v_tajemstvi IS NULL THEN
    RETURN NULL;
  END IF;

  -- Po dávkách nejvýš 200 zpráv, aby jeden požadavek nerostl donekonečna.
  FOR v_davka IN
    SELECT jsonb_agg(z)
    FROM (
      SELECT jsonb_build_object(
               'endpoint', o.endpoint,
               'p256dh',   o.p256dh,
               'auth',     o.auth,
               'title',    left(n.title, 200),
               'body',     left(n.body, 300),
               'tag',      n.id,
               'url',      public._push_cil(n.druh)
             ) AS z,
             (row_number() OVER () - 1) / 200 AS davka
      FROM nove n
      JOIN public.push_odbery o ON o.user_id = n.user_id
      LEFT JOIN public.push_predvolby p ON p.user_id = n.user_id
      WHERE NOT (n.druh = ANY (COALESCE(p.vypnute_druhy, '{}')))
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

  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Upozornění do zařízení se nepodařilo zařadit: %', SQLERRM;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.push_odeslat() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS push_odeslat ON public.user_notifications;
CREATE TRIGGER push_odeslat
  AFTER INSERT ON public.user_notifications
  REFERENCING NEW TABLE AS nove
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.push_odeslat();

-- ─── 6. Oznámení s druhem ────────────────────────────────────────────────────

-- _upozornit dostává čtvrtý parametr. Stávající volání se třemi parametry
-- (žádosti a nominace do třídy z 038 a 041) dostanou druh „zarazeni“.
DROP FUNCTION IF EXISTS public._upozornit(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public._upozornit(
  p_user  UUID,
  p_title TEXT,
  p_body  TEXT,
  p_druh  TEXT DEFAULT 'zarazeni'
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.user_notifications (user_id, sender_id, title, body, druh)
  SELECT p_user, auth.uid(), p_title, p_body, p_druh
  WHERE p_user IS NOT NULL AND p_user IS DISTINCT FROM auth.uid();
$$;
REVOKE ALL ON FUNCTION public._upozornit(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- Nový příspěvek: beze změny z 039 kromě oznámení na konci.
--   • označení dostanou „zminka“ (jako dosud, jen jedním příkazem),
--   • NOVÁ ANKETA jde všem členům třídy kromě autora a kromě označených
--     (ti už o příspěvku vědí ze zmínky).
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
  v_i       INTEGER;
  v_uryvek  TEXT;
  v_autor   TEXT;
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
  v_autor  := public._jmeno(auth.uid());

  IF cardinality(v_zminky) > 0 THEN
    INSERT INTO public.user_notifications (user_id, sender_id, title, body, druh)
    SELECT z, auth.uid(),
           left(format('%s vás označil(a) v diskuzi třídy %s', v_autor, v_nazev), 200),
           v_uryvek,
           'zminka'
    FROM unnest(v_zminky) AS z;
  END IF;

  IF p_moznosti IS NOT NULL THEN
    INSERT INTO public.user_notifications (user_id, sender_id, title, body, druh)
    SELECT pr.id, auth.uid(),
           left(format('%s – nová anketa od %s', v_nazev, v_autor), 200),
           v_uryvek,
           'anketa'
    FROM public.profiles pr
    WHERE lower(trim(pr.user_class)) = lower(trim(v_nazev))
      AND pr.role IN ('student', 'velitel_tridy')
      AND pr.id <> auth.uid()
      AND NOT (pr.id = ANY (v_zminky));
  END IF;

  RETURN v_id;
END;
$$;

-- Celoškolní oznámení: jako v 043, jen s druhem.
CREATE OR REPLACE FUNCTION public.oznamit_celoskolni_udalost()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, sender_id, title, body, druh)
  SELECT p.id,
         auth.uid(),
         left('Celoškolní oznámení: ' || coalesce(nullif(trim(NEW.title), ''), 'bez názvu'), 200),
         left(coalesce(NEW.content, ''), 500),
         'celoskolni'
  FROM public.profiles p
  WHERE p.id IS DISTINCT FROM auth.uid();
  RETURN NEW;
END;
$$;

-- Nástěnka třídy: KAŽDÁ nová položka (ne jen typ „event“, který formulář
-- vůbec nevytváří — viz úvod) a nový rozvrh → členům třídy kromě autora.
-- Úprava existující položky oznámení znovu neposílá (pozná se podle id).
CREATE OR REPLACE FUNCTION public.oznamit_udalost_tridy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_ids TEXT[];
  v_sekce   JSONB;
BEGIN
  SELECT coalesce(array_agg(s->>'id'), ARRAY[]::TEXT[])
  INTO v_old_ids
  FROM jsonb_array_elements(
    CASE WHEN TG_OP = 'UPDATE' AND jsonb_typeof(OLD.sections) = 'array'
         THEN OLD.sections ELSE '[]'::jsonb END
  ) AS s;

  IF jsonb_typeof(NEW.sections) = 'array' THEN
    FOR v_sekce IN
      SELECT s FROM jsonb_array_elements(NEW.sections) AS s
      WHERE (s->>'id') IS NOT NULL
        AND NOT ((s->>'id') = ANY (v_old_ids))
    LOOP
      INSERT INTO public.user_notifications (user_id, sender_id, title, body, druh)
      SELECT p.id,
             auth.uid(),
             left(NEW.class_name
                  || CASE WHEN v_sekce->>'type' = 'event' THEN ' – nová událost: '
                          ELSE ' – nové hlášení: ' END
                  || coalesce(nullif(trim(v_sekce->>'title'), ''), 'bez názvu'), 200),
             left(concat_ws(E'\n',
                    nullif(trim(v_sekce->>'date'), ''),
                    nullif(trim(v_sekce->>'content'), '')), 500),
             'nastenka'
      FROM public.profiles p
      WHERE lower(trim(p.user_class)) = lower(trim(NEW.class_name))
        AND p.id IS DISTINCT FROM auth.uid();
    END LOOP;
  END IF;

  IF NEW.schedule_url IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.schedule_url IS DISTINCT FROM OLD.schedule_url) THEN
    INSERT INTO public.user_notifications (user_id, sender_id, title, body, druh)
    SELECT p.id,
           auth.uid(),
           left(NEW.class_name || ' – nový rozvrh hodin', 200),
           'Na nástěnce třídy je nahraný nový rozvrh.',
           'nastenka'
    FROM public.profiles p
    WHERE lower(trim(p.user_class)) = lower(trim(NEW.class_name))
      AND p.id IS DISTINCT FROM auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

COMMIT;

-- ─── Ověření po spuštění (jen čtení) ─────────────────────────────────────────
--
-- SELECT extname FROM pg_extension WHERE extname = 'pg_net';
--   → pg_net
-- SELECT count(*) FROM vault.secrets WHERE name = 'push_webhook_secret';
--   → 1
-- SELECT tgname FROM pg_trigger WHERE tgname = 'push_odeslat';
--   → push_odeslat
-- SELECT column_default FROM information_schema.columns
--  WHERE table_name = 'user_notifications' AND column_name = 'druh';
--   → 'zprava'::text
--
-- Hodnota tajemství pro Vercel (PUSH_WEBHOOK_SECRET) — zkopírovat a NIKAM
-- jinam nevkládat:
-- SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'push_webhook_secret';
--
-- Poslední odeslání a odpovědi serveru (pg_net je drží 6 hodin):
-- SELECT id, status_code, left(content, 200), created FROM net._http_response
--  ORDER BY created DESC LIMIT 10;
