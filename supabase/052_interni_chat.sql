-- ============================================================================
-- 052  Interní chat: přímé zprávy a skupinové konverzace
-- ============================================================================
--
-- CO SE MĚNÍ PRO UŽIVATELE
-- 1. Nová záložka „Chat“. Psát si mohou jen přihlášení uživatelé, kteří do
--    akademie patří: studenti a velitelé zařazení do třídy, lektoři
--    a správci. Čerstvě registrovaný účet bez schválené třídy chat nevidí —
--    registrace je veřejná, takže tohle je hranice „bez lidí zvenčí“.
-- 2. Přímá konverzace 1:1 (mezi dvěma lidmi vždy jedna) a skupiny 3–50 lidí
--    s názvem. Skupinu spravuje ten, kdo ji založil: přejmenuje ji, přidá
--    a odebere členy. Kdokoli ze skupiny může odejít.
-- 3. Každý vidí jen konverzace, ve kterých je. Lektor ani správce cizí
--    konverzace nečtou — vidí jen zprávy, které jim někdo nahlásil, a mohou
--    je skrýt.
-- 4. Svou zprávu může autor smazat (text se smaže; má-li zpráva otevřené
--    nahlášení, zůstane text uložený jen pro moderátory, dokud ho nevyřídí).
-- 5. Upozornění do zařízení na novou zprávu (druh „chat“, jde vypnout
--    v profilu, konverzaci jde i ztlumit). Do zvonku chatové zprávy
--    nechodí — počet nepřečtených ukazuje ikona Chatu v hlavičce. Do zvonku
--    jde jen lektorům a správcům oznámení o nahlášené zprávě.
--
-- JAK
-- Tabulky jsou klientům zavřené (REVOKE ALL, RLS zapnuté bez politik), vše
-- jde přes SECURITY DEFINER funkce, které samy ověří, kdo volá — stejný
-- vzor jako diskuze třídy (039). Anonym nemá EXECUTE na žádnou z nich.
--
-- Spouštět po 044 (pg_net, push_odbery, push_predvolby, _push_cil, _jmeno).
-- Skript je idempotentní.
-- ============================================================================

BEGIN;

-- ─── 1. Tabulky ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_konverzace (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  je_skupina      BOOLEAN NOT NULL,
  nazev           TEXT CHECK (nazev IS NULL OR char_length(trim(nazev)) BETWEEN 1 AND 80),
  -- Přímá konverzace: „menší-uuid:větší-uuid“, aby mezi dvěma lidmi byla jen jedna.
  par_klic        TEXT,
  zalozil         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vytvoreno       TIMESTAMPTZ NOT NULL DEFAULT now(),
  posledni_zprava TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (je_skupina = (nazev IS NOT NULL)),
  CHECK (je_skupina = (par_klic IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_konverzace_par
  ON public.chat_konverzace (par_klic) WHERE par_klic IS NOT NULL;
ALTER TABLE public.chat_konverzace ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_konverzace FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.chat_clenove (
  konverzace_id UUID NOT NULL REFERENCES public.chat_konverzace(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pridan        TIMESTAMPTZ NOT NULL DEFAULT now(),
  precteno_do   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ztlumeno      BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (konverzace_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_chat_clenove_user ON public.chat_clenove (user_id);
ALTER TABLE public.chat_clenove ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_clenove FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.chat_zpravy (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  konverzace_id UUID NOT NULL REFERENCES public.chat_konverzace(id) ON DELETE CASCADE,
  autor         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  text          TEXT NOT NULL,
  vytvoreno     TIMESTAMPTZ NOT NULL DEFAULT now(),
  smazano       BOOLEAN NOT NULL DEFAULT false,
  smazal        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CHECK (smazano OR char_length(trim(text)) BETWEEN 1 AND 2000)
);
CREATE INDEX IF NOT EXISTS idx_chat_zpravy_konverzace
  ON public.chat_zpravy (konverzace_id, vytvoreno DESC);
CREATE INDEX IF NOT EXISTS idx_chat_zpravy_autor
  ON public.chat_zpravy (autor, vytvoreno DESC);
ALTER TABLE public.chat_zpravy ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_zpravy FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.chat_nahlaseni (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zprava_id   UUID NOT NULL REFERENCES public.chat_zpravy(id) ON DELETE CASCADE,
  nahlasil    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  duvod       TEXT NOT NULL CHECK (char_length(trim(duvod)) BETWEEN 1 AND 500),
  vytvoreno   TIMESTAMPTZ NOT NULL DEFAULT now(),
  vyrizeno    TIMESTAMPTZ,
  vyridil     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  zprava_skryta BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (zprava_id, nahlasil)
);
CREATE INDEX IF NOT EXISTS idx_chat_nahlaseni_otevrena
  ON public.chat_nahlaseni (vytvoreno DESC) WHERE vyrizeno IS NULL;
ALTER TABLE public.chat_nahlaseni ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_nahlaseni FROM anon, authenticated;

-- ─── 2. Druh „chat“ pro zvonek a upozornění do zařízení ──────────────────────

ALTER TABLE public.user_notifications
  DROP CONSTRAINT IF EXISTS user_notifications_druh_check;
ALTER TABLE public.user_notifications
  ADD CONSTRAINT user_notifications_druh_check
  CHECK (druh IN ('zprava', 'zminka', 'anketa', 'nastenka', 'celoskolni', 'zarazeni', 'chat'));

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
    WHEN 'chat'       THEN '/#chat'
    ELSE '/'
  END;
$$;
REVOKE ALL ON FUNCTION public._push_cil(TEXT) FROM PUBLIC, anon, authenticated;

-- Stejná funkce jako v 044, jen s „chat“ mezi povolenými druhy.
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
  WHERE d IN ('zprava', 'zminka', 'anketa', 'nastenka', 'celoskolni', 'zarazeni', 'chat');

  INSERT INTO public.push_predvolby (user_id, vypnute_druhy)
  VALUES (auth.uid(), v_vypnute)
  ON CONFLICT (user_id) DO UPDATE
    SET vypnute_druhy = EXCLUDED.vypnute_druhy, upraveno = now();
END;
$$;
REVOKE ALL ON FUNCTION public.push_ulozit_predvolby(TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.push_ulozit_predvolby(TEXT[]) TO authenticated;

-- ─── 3. Pomocné funkce (klientům zavřené) ────────────────────────────────────

-- Smí uživatel chat používat? Lektor a správce vždy; student a velitel jen
-- se schválenou třídou. Nový účet z veřejné registrace tak nikomu nenapíše
-- a nikdo ho v seznamu lidí neuvidí, dokud ho někdo z akademie nezařadí.
CREATE OR REPLACE FUNCTION public._chat_smi(p_user UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT pr.role IN ('lektor', 'admin')
        OR (pr.role IN ('student', 'velitel_tridy') AND NULLIF(trim(pr.user_class), '') IS NOT NULL)
    FROM public.profiles pr WHERE pr.id = p_user
  ), false);
$$;

CREATE OR REPLACE FUNCTION public._chat_overit()
RETURNS VOID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.' USING ERRCODE = '42501';
  END IF;
  IF NOT public._chat_smi(auth.uid()) THEN
    RAISE EXCEPTION 'Chat je dostupný až po zařazení do třídy.' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public._chat_je_clen(p_konv UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_clenove
    WHERE konverzace_id = p_konv AND user_id = auth.uid()
  );
$$;

-- Ověřený seznam nových členů: jen lidé, kteří smějí chat používat, bez
-- volajícího a bez duplicit.
CREATE OR REPLACE FUNCTION public._chat_platni(p_users UUID[])
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(DISTINCT u), '{}')
  FROM unnest(COALESCE(p_users, '{}')) AS u
  WHERE u IS DISTINCT FROM auth.uid() AND public._chat_smi(u);
$$;

-- Upozornění do zařízení ostatním členům konverzace. Selhání nesmí zabránit
-- odeslání zprávy (EXCEPTION blok); pg_net požadavek pošle až po potvrzení
-- transakce. Do zvonku se nezapisuje nic.
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
  v_text := CASE WHEN char_length(v_z.text) > 160 THEN left(v_z.text, 157) || '…' ELSE v_z.text END;

  FOR v_davka IN
    SELECT jsonb_agg(z)
    FROM (
      SELECT jsonb_build_object(
               'endpoint', o.endpoint,
               'p256dh',   o.p256dh,
               'auth',     o.auth,
               'title',    left(v_titulek, 200),
               'body',     v_text,
               -- Jedna konverzace = jedno upozornění; další zpráva ho nahradí.
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

REVOKE ALL ON FUNCTION public._chat_smi(UUID)       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._chat_overit()        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._chat_je_clen(UUID)   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._chat_platni(UUID[])  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._chat_push(UUID)      FROM PUBLIC, anon, authenticated;

-- ─── 4. Funkce pro aplikaci ──────────────────────────────────────────────────

-- Smí přihlášený uživatel chat používat? (Aplikace podle toho ukáže chat,
-- nebo vysvětlení, proč ho zatím nemá.)
CREATE OR REPLACE FUNCTION public.chat_pristup()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND public._chat_smi(auth.uid());
$$;

-- Lidé, kterým lze napsat. Bez e-mailů; nejdřív spolužáci z vlastní třídy.
CREATE OR REPLACE FUNCTION public.chat_lide(p_hledat TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, jmeno TEXT, role TEXT, trida TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  v_hledat TEXT := NULLIF(trim(COALESCE(p_hledat, '')), '');
  v_moje   TEXT := lower(trim(COALESCE(public.my_class(), '')));
BEGIN
  PERFORM public._chat_overit();
  RETURN QUERY
  SELECT pr.id, public._jmeno(pr.id), pr.role, NULLIF(trim(pr.user_class), '')
  FROM public.profiles pr
  WHERE pr.id <> auth.uid()
    AND public._chat_smi(pr.id)
    AND (v_hledat IS NULL
         OR public._jmeno(pr.id) ILIKE '%' || replace(replace(v_hledat, '%', ''), '_', '') || '%'
         OR pr.user_class ILIKE '%' || replace(replace(v_hledat, '%', ''), '_', '') || '%')
  ORDER BY (lower(trim(COALESCE(pr.user_class, ''))) = v_moje AND v_moje <> '') DESC,
           pr.role IN ('lektor', 'admin') DESC,
           public._jmeno(pr.id)
  LIMIT 200;
END;
$$;

-- Konverzace přihlášeného uživatele, nejnovější nahoře.
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
    CASE WHEN p.smazano THEN 'Zpráva byla smazána.' ELSE p.text END,
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
    SELECT z.text, z.autor, z.vytvoreno, z.smazano FROM public.chat_zpravy z
    WHERE z.konverzace_id = k.id
    ORDER BY z.vytvoreno DESC LIMIT 1
  ) p ON true
  WHERE c.user_id = auth.uid()
  ORDER BY k.posledni_zprava DESC
  LIMIT 300;
END;
$$;

-- Počet nepřečtených zpráv celkem (odznak v hlavičce). Uživateli bez
-- přístupu vrací 0 místo chyby — hlavička se ptá u každého.
CREATE OR REPLACE FUNCTION public.chat_neprectene()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE WHEN auth.uid() IS NULL OR NOT public._chat_smi(auth.uid()) THEN 0 ELSE (
    SELECT count(*)::INTEGER
    FROM public.chat_clenove c
    JOIN public.chat_zpravy z ON z.konverzace_id = c.konverzace_id
    WHERE c.user_id = auth.uid()
      AND NOT c.ztlumeno
      AND z.vytvoreno > c.precteno_do
      AND z.autor IS DISTINCT FROM auth.uid()
      AND NOT z.smazano
  ) END;
$$;

-- Přímá konverzace s jedním člověkem: vrátí existující, nebo založí novou.
CREATE OR REPLACE FUNCTION public.chat_zalozit_primou(p_user UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_klic TEXT;
  v_id   UUID;
BEGIN
  PERFORM public._chat_overit();
  IF p_user IS NULL OR p_user = auth.uid() THEN
    RAISE EXCEPTION 'Vyberte, komu chcete napsat.' USING ERRCODE = '22023';
  END IF;
  IF NOT public._chat_smi(p_user) THEN
    RAISE EXCEPTION 'Tomuto uživateli zatím nelze psát (není zařazen do třídy).' USING ERRCODE = '42501';
  END IF;

  v_klic := least(auth.uid()::TEXT, p_user::TEXT) || ':' || greatest(auth.uid()::TEXT, p_user::TEXT);

  SELECT k.id INTO v_id FROM public.chat_konverzace k WHERE k.par_klic = v_klic;
  IF v_id IS NULL THEN
    INSERT INTO public.chat_konverzace (je_skupina, par_klic, zalozil)
    VALUES (false, v_klic, auth.uid())
    ON CONFLICT (par_klic) WHERE par_klic IS NOT NULL DO NOTHING
    RETURNING chat_konverzace.id INTO v_id;
    IF v_id IS NULL THEN
      SELECT k.id INTO v_id FROM public.chat_konverzace k WHERE k.par_klic = v_klic;
    END IF;
  END IF;

  -- Člena, který mezitím zmizel (např. smazaný a obnovený účet), vrátí zpět.
  INSERT INTO public.chat_clenove (konverzace_id, user_id)
  VALUES (v_id, auth.uid()), (v_id, p_user)
  ON CONFLICT DO NOTHING;

  RETURN v_id;
END;
$$;

-- Nová skupina s názvem; zakladatel ji spravuje.
CREATE OR REPLACE FUNCTION public.chat_zalozit_skupinu(p_nazev TEXT, p_clenove UUID[])
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nazev   TEXT := trim(COALESCE(p_nazev, ''));
  v_clenove UUID[];
  v_id      UUID;
BEGIN
  PERFORM public._chat_overit();
  IF char_length(v_nazev) NOT BETWEEN 1 AND 80 THEN
    RAISE EXCEPTION 'Název skupiny musí mít 1 až 80 znaků.' USING ERRCODE = '22023';
  END IF;
  v_clenove := public._chat_platni(p_clenove);
  IF cardinality(v_clenove) < 2 THEN
    RAISE EXCEPTION 'Do skupiny vyberte aspoň dva další lidi. Pro jednoho založte přímou konverzaci.' USING ERRCODE = '22023';
  END IF;
  IF cardinality(v_clenove) > 49 THEN
    RAISE EXCEPTION 'Skupina může mít nejvýš 50 členů.' USING ERRCODE = '22023';
  END IF;
  -- Brzda proti zahlcení: nejvýš 10 nových skupin za hodinu.
  IF (SELECT count(*) FROM public.chat_konverzace
      WHERE zalozil = auth.uid() AND je_skupina AND vytvoreno > now() - interval '1 hour') >= 10 THEN
    RAISE EXCEPTION 'Příliš mnoho nových skupin za krátkou dobu. Zkuste to prosím později.' USING ERRCODE = '54000';
  END IF;

  INSERT INTO public.chat_konverzace (je_skupina, nazev, zalozil)
  VALUES (true, v_nazev, auth.uid())
  RETURNING chat_konverzace.id INTO v_id;

  INSERT INTO public.chat_clenove (konverzace_id, user_id)
  SELECT v_id, u FROM unnest(array_append(v_clenove, auth.uid())) AS u
  ON CONFLICT DO NOTHING;

  RETURN v_id;
END;
$$;

-- Zprávy konverzace, nejnovější první; `p_pred` = načíst starší než tento čas.
CREATE OR REPLACE FUNCTION public.chat_zpravy_konverzace(
  p_konv  UUID,
  p_pred  TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 60
)
RETURNS TABLE (
  id          UUID,
  autor_id    UUID,
  autor_jmeno TEXT,
  autor_role  TEXT,
  text        TEXT,
  vytvoreno   TIMESTAMPTZ,
  smazano     BOOLEAN,
  moje        BOOLEAN,
  nahlasil_jsem BOOLEAN
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
    EXISTS (SELECT 1 FROM public.chat_nahlaseni n WHERE n.zprava_id = z.id AND n.nahlasil = auth.uid())
  FROM public.chat_zpravy z
  WHERE z.konverzace_id = p_konv
    AND (p_pred IS NULL OR z.vytvoreno < p_pred)
  ORDER BY z.vytvoreno DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 60), 200));
END;
$$;

-- Označí konverzaci za přečtenou.
CREATE OR REPLACE FUNCTION public.chat_precteno(p_konv UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._chat_overit();
  UPDATE public.chat_clenove SET precteno_do = now()
  WHERE konverzace_id = p_konv AND user_id = auth.uid();
END;
$$;

-- Odeslání zprávy. Vrací id.
CREATE OR REPLACE FUNCTION public.chat_odeslat(p_konv UUID, p_text TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_text TEXT := trim(COALESCE(p_text, ''));
  v_id   UUID;
BEGIN
  PERFORM public._chat_overit();
  IF NOT public._chat_je_clen(p_konv) THEN
    RAISE EXCEPTION 'Konverzace neexistuje nebo v ní nejste.' USING ERRCODE = '42501';
  END IF;
  IF char_length(v_text) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION 'Zpráva musí mít 1 až 2000 znaků.' USING ERRCODE = '22023';
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

  INSERT INTO public.chat_zpravy (konverzace_id, autor, text)
  VALUES (p_konv, auth.uid(), v_text)
  RETURNING chat_zpravy.id INTO v_id;

  UPDATE public.chat_konverzace SET posledni_zprava = now() WHERE id = p_konv;
  UPDATE public.chat_clenove SET precteno_do = now()
  WHERE konverzace_id = p_konv AND user_id = auth.uid();

  PERFORM public._chat_push(v_id);
  RETURN v_id;
END;
$$;

-- Smazání vlastní zprávy. Text se smaže, pokud ho nedrží otevřené
-- nahlášení — to by jinak autor mohl smazáním zamést pod koberec.
CREATE OR REPLACE FUNCTION public.chat_smazat_zpravu(p_zprava UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_z public.chat_zpravy%ROWTYPE;
BEGIN
  PERFORM public._chat_overit();
  SELECT * INTO v_z FROM public.chat_zpravy WHERE id = p_zprava;
  IF NOT FOUND OR v_z.autor IS DISTINCT FROM auth.uid() OR NOT public._chat_je_clen(v_z.konverzace_id) THEN
    RAISE EXCEPTION 'Smazat můžete jen svou zprávu.' USING ERRCODE = '42501';
  END IF;
  UPDATE public.chat_zpravy
  SET smazano = true,
      smazal  = auth.uid(),
      text    = CASE WHEN EXISTS (
                  SELECT 1 FROM public.chat_nahlaseni n
                  WHERE n.zprava_id = p_zprava AND n.vyrizeno IS NULL
                ) THEN text ELSE '' END
  WHERE id = p_zprava;
END;
$$;

-- Nahlášení cizí zprávy lektorům a správcům.
CREATE OR REPLACE FUNCTION public.chat_nahlasit(p_zprava UUID, p_duvod TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_z     public.chat_zpravy%ROWTYPE;
  v_duvod TEXT := trim(COALESCE(p_duvod, ''));
  v_kdo   TEXT;
BEGIN
  PERFORM public._chat_overit();
  SELECT * INTO v_z FROM public.chat_zpravy WHERE id = p_zprava;
  IF NOT FOUND OR NOT public._chat_je_clen(v_z.konverzace_id) THEN
    RAISE EXCEPTION 'Zpráva neexistuje nebo k ní nemáte přístup.' USING ERRCODE = '42501';
  END IF;
  IF v_z.autor = auth.uid() THEN
    RAISE EXCEPTION 'Vlastní zprávu nahlásit nelze — můžete ji smazat.' USING ERRCODE = '22023';
  END IF;
  IF v_z.smazano THEN
    RAISE EXCEPTION 'Zpráva už je smazaná.' USING ERRCODE = '22023';
  END IF;
  IF char_length(v_duvod) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'Napište stručně důvod (nejvýš 500 znaků).' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM public.chat_nahlaseni WHERE zprava_id = p_zprava AND nahlasil = auth.uid()) THEN
    RAISE EXCEPTION 'Tuto zprávu jste už nahlásili.' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.chat_nahlaseni (zprava_id, nahlasil, duvod)
  VALUES (p_zprava, auth.uid(), v_duvod);

  v_kdo := public._jmeno(auth.uid());
  INSERT INTO public.user_notifications (user_id, sender_id, title, body, druh)
  SELECT pr.id, auth.uid(),
         'Nahlášená zpráva v chatu',
         format('%s nahlásil(a) zprávu: %s', v_kdo, left(v_duvod, 200)),
         'chat'
  FROM public.profiles pr
  WHERE pr.role IN ('lektor', 'admin') AND pr.id <> auth.uid();
END;
$$;

-- Nahlášené zprávy pro lektory a správce. Vidí jen nahlášenou zprávu,
-- ne celou konverzaci.
CREATE OR REPLACE FUNCTION public.chat_nahlaseni_seznam(p_vcetne_vyrizenych BOOLEAN DEFAULT false)
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
  zprava_skryta  BOOLEAN
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
    n.zprava_skryta
  FROM public.chat_nahlaseni n
  JOIN public.chat_zpravy z ON z.id = n.zprava_id
  JOIN public.chat_konverzace k ON k.id = z.konverzace_id
  WHERE p_vcetne_vyrizenych OR n.vyrizeno IS NULL
  ORDER BY (n.vyrizeno IS NULL) DESC, n.vytvoreno DESC
  LIMIT 200;
END;
$$;

-- Vyřízení nahlášení: skrýt zprávu (text se smaže), nebo ji ponechat.
-- Vyřídí všechna nahlášení téže zprávy najednou.
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

  IF p_skryt THEN
    UPDATE public.chat_zpravy
    SET smazano = true, smazal = auth.uid(), text = ''
    WHERE id = v_zprava;
  ELSE
    -- Autor zprávu mezitím smazal sám: text už nic nedrží.
    UPDATE public.chat_zpravy SET text = ''
    WHERE id = v_zprava AND smazano;
  END IF;
END;
$$;

-- Členové konverzace.
CREATE OR REPLACE FUNCTION public.chat_clenove_konverzace(p_konv UUID)
RETURNS TABLE (id UUID, jmeno TEXT, role TEXT, trida TEXT, zakladatel BOOLEAN)
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
  SELECT c.user_id,
         COALESCE(public._jmeno(c.user_id), 'Smazaný účet'),
         pr.role,
         NULLIF(trim(pr.user_class), ''),
         c.user_id = k.zalozil
  FROM public.chat_clenove c
  JOIN public.chat_konverzace k ON k.id = c.konverzace_id
  LEFT JOIN public.profiles pr ON pr.id = c.user_id
  WHERE c.konverzace_id = p_konv
  ORDER BY (c.user_id = k.zalozil) DESC, public._jmeno(c.user_id);
END;
$$;

-- Správa skupiny zakladatelem: přejmenovat, přidat a odebrat členy.
-- NULL = beze změny.
CREATE OR REPLACE FUNCTION public.chat_upravit_skupinu(
  p_konv    UUID,
  p_nazev   TEXT DEFAULT NULL,
  p_pridat  UUID[] DEFAULT NULL,
  p_odebrat UUID[] DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_k     public.chat_konverzace%ROWTYPE;
  v_nazev TEXT;
BEGIN
  PERFORM public._chat_overit();
  SELECT * INTO v_k FROM public.chat_konverzace WHERE id = p_konv;
  IF NOT FOUND OR NOT v_k.je_skupina OR NOT public._chat_je_clen(p_konv) THEN
    RAISE EXCEPTION 'Skupina neexistuje nebo v ní nejste.' USING ERRCODE = '42501';
  END IF;
  IF v_k.zalozil IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Skupinu upravuje jen ten, kdo ji založil.' USING ERRCODE = '42501';
  END IF;

  IF p_nazev IS NOT NULL THEN
    v_nazev := trim(p_nazev);
    IF char_length(v_nazev) NOT BETWEEN 1 AND 80 THEN
      RAISE EXCEPTION 'Název skupiny musí mít 1 až 80 znaků.' USING ERRCODE = '22023';
    END IF;
    UPDATE public.chat_konverzace SET nazev = v_nazev WHERE id = p_konv;
  END IF;

  IF p_pridat IS NOT NULL THEN
    INSERT INTO public.chat_clenove (konverzace_id, user_id)
    SELECT p_konv, u FROM unnest(public._chat_platni(p_pridat)) AS u
    ON CONFLICT DO NOTHING;
    IF (SELECT count(*) FROM public.chat_clenove WHERE konverzace_id = p_konv) > 50 THEN
      RAISE EXCEPTION 'Skupina může mít nejvýš 50 členů.' USING ERRCODE = '22023';
    END IF;
  END IF;

  IF p_odebrat IS NOT NULL THEN
    DELETE FROM public.chat_clenove
    WHERE konverzace_id = p_konv
      AND user_id = ANY (p_odebrat)
      AND user_id <> auth.uid();
  END IF;
END;
$$;

-- Odchod ze skupiny. Odejde-li poslední člen, skupina zanikne i se zprávami.
-- Odejde-li zakladatel, správu převezme nejdéle přítomný člen.
CREATE OR REPLACE FUNCTION public.chat_opustit_skupinu(p_konv UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_k public.chat_konverzace%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_k FROM public.chat_konverzace WHERE id = p_konv;
  IF NOT FOUND OR NOT v_k.je_skupina OR NOT public._chat_je_clen(p_konv) THEN
    RAISE EXCEPTION 'Skupina neexistuje nebo v ní nejste.' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.chat_clenove WHERE konverzace_id = p_konv AND user_id = auth.uid();

  IF NOT EXISTS (SELECT 1 FROM public.chat_clenove WHERE konverzace_id = p_konv) THEN
    DELETE FROM public.chat_konverzace WHERE id = p_konv;
  ELSIF v_k.zalozil = auth.uid() THEN
    UPDATE public.chat_konverzace
    SET zalozil = (SELECT user_id FROM public.chat_clenove
                   WHERE konverzace_id = p_konv ORDER BY pridan, user_id LIMIT 1)
    WHERE id = p_konv;
  END IF;
END;
$$;

-- Ztlumení konverzace: bez upozornění do zařízení a bez započtení do odznaku.
CREATE OR REPLACE FUNCTION public.chat_ztlumit(p_konv UUID, p_ztlumit BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._chat_overit();
  UPDATE public.chat_clenove SET ztlumeno = COALESCE(p_ztlumit, false)
  WHERE konverzace_id = p_konv AND user_id = auth.uid();
END;
$$;

-- Práva: jen přihlášení.
DO $$
DECLARE
  f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.chat_pristup()',
    'public.chat_lide(text)',
    'public.chat_konverzace_seznam()',
    'public.chat_neprectene()',
    'public.chat_zalozit_primou(uuid)',
    'public.chat_zalozit_skupinu(text,uuid[])',
    'public.chat_zpravy_konverzace(uuid,timestamptz,integer)',
    'public.chat_precteno(uuid)',
    'public.chat_odeslat(uuid,text)',
    'public.chat_smazat_zpravu(uuid)',
    'public.chat_nahlasit(uuid,text)',
    'public.chat_nahlaseni_seznam(boolean)',
    'public.chat_vyridit_nahlaseni(uuid,boolean)',
    'public.chat_clenove_konverzace(uuid)',
    'public.chat_upravit_skupinu(uuid,text,uuid[],uuid[])',
    'public.chat_opustit_skupinu(uuid)',
    'public.chat_ztlumit(uuid,boolean)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f);
  END LOOP;
END;
$$;

COMMIT;

-- ─── 5. Ověření (po spuštění, jen čtení) ─────────────────────────────────────
--
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE tablename LIKE 'chat\_%' ORDER BY 1;
--     -- 4 řádky, rowsecurity = true
--
--   SELECT count(*) FROM pg_proc WHERE proname LIKE 'chat\_%';
--     -- 17
--
--   SELECT has_table_privilege('anon', 'public.chat_zpravy', 'SELECT'),
--          has_table_privilege('authenticated', 'public.chat_zpravy', 'SELECT'),
--          has_function_privilege('anon', 'public.chat_odeslat(uuid,text)', 'EXECUTE');
--     -- false, false, false
