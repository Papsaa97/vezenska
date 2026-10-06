-- ============================================================================
-- 055  Chat: upozornění jen lidem s přístupem, nahlášené zprávy
-- ============================================================================
--
-- CO SE MĚNÍ PRO UŽIVATELE
-- 1. Kdo chat ztratil (vyřazení ze třídy, smazaná třída na konci kurzu), tomu
--    už nechodí upozornění do zařízení na nové zprávy ze skupin, ve kterých
--    zůstal členem. Dřív mu na telefon dál chodily náhledy zpráv (jméno
--    autora a začátek textu), které v aplikaci číst nesměl.
-- 2. Upozornění do zařízení o nahlášené zprávě otevře lektorovi a správci
--    rovnou přehled „Nahlášené“ (adresa #chat/nahlasene), ne seznam konverzací.
-- 3. Odejde-li ze skupiny ten, kdo ji spravuje, převezme správu nejdéle
--    přítomný člen, který chat může používat. Dřív to mohl být i člověk bez
--    přístupu a skupinu pak nemohl spravovat nikdo.
-- 4. Nahlásí-li student zprávu lektora nebo správce, ten se o nahlášení
--    nedozví a nemůže ho sám vyřídit: oznámení mu nepřijde, v přehledu
--    „Nahlášené“ ho nevidí a vyřídí ho jiný lektor nebo správce. Dřív mu
--    přišlo oznámení se jménem toho, kdo zprávu nahlásil, a mohl nahlášení
--    vlastní zprávy sám „Ponechat“. Nápověda přitom slibuje, že se autor
--    nedozví, kdo ho nahlásil.
--
-- JAK
-- Jen CREATE OR REPLACE šesti funkcí, tabulky ani práva se nemění.
-- * `_chat_push` (poslední verze z 054) navíc filtruje příjemce přes
--   `_chat_smi`, stejně jako všechny čtecí funkce chatu.
-- * `_push_cil('chat')` vede na #chat/nahlasene. Druh „chat“ zapisuje do
--   zvonku jen `chat_nahlaseni` (lektorům a správcům); zprávy samotné do
--   zvonku nejdou a svou adresu (#chat/<id>) si skládá `_chat_push`.
-- * `chat_opustit_skupinu` vybírá nového správce nejdřív mezi lidmi
--   s přístupem.
-- * `chat_nahlasit` (z 052), `chat_nahlaseni_seznam` a
--   `chat_vyridit_nahlaseni` (z 054) vynechávají autora nahlášené zprávy.
--
-- Spouštět po 054. Skript je idempotentní.
-- ============================================================================

BEGIN;

-- ─── 1. Adresa upozornění ze zvonku podle druhu ──────────────────────────────

CREATE OR REPLACE FUNCTION public._push_cil(p_druh TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE p_druh
    WHEN 'zminka'     THEN '/#dashboard'
    WHEN 'anketa'     THEN '/#dashboard'
    WHEN 'nastenka'   THEN '/#dashboard'
    WHEN 'celoskolni' THEN '/#dashboard'
    WHEN 'zarazeni'   THEN '/#dashboard'
    -- Do zvonku jde z chatu jen nahlášená zpráva (lektorům a správcům).
    WHEN 'chat'       THEN '/#chat/nahlasene'
    ELSE '/'
  END;
$$;
REVOKE ALL ON FUNCTION public._push_cil(TEXT) FROM PUBLIC, anon, authenticated;

-- ─── 2. Upozornění na zprávu jen členům, kteří chat smějí používat ───────────

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
        -- Člen, který chat ztratil (vyřazen ze třídy), zprávy číst nesmí,
        -- tak mu nechodí ani jejich náhled.
        AND public._chat_smi(c.user_id)
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

-- ─── 3. Odchod správce: správu převezme člen s přístupem ─────────────────────

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
    SET zalozil = (SELECT c.user_id FROM public.chat_clenove c
                   WHERE c.konverzace_id = p_konv
                   ORDER BY public._chat_smi(c.user_id) DESC, c.pridan, c.user_id
                   LIMIT 1)
    WHERE id = p_konv;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.chat_opustit_skupinu(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.chat_opustit_skupinu(UUID) TO authenticated;

-- ─── 4. Nahlášení vlastní zprávy lektora nebo správce vyřizuje někdo jiný ────

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
  WHERE pr.role IN ('lektor', 'admin') AND pr.id <> auth.uid()
    -- Autor nahlášené zprávy (je-li lektor nebo správce) se nedozví, kdo ho
    -- nahlásil; nahlášení vyřídí někdo jiný.
    AND pr.id IS DISTINCT FROM v_z.autor;
END;
$$;
REVOKE ALL ON FUNCTION public.chat_nahlasit(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.chat_nahlasit(UUID, TEXT) TO authenticated;

-- Stejný výsledek jako v 054, takže stačí CREATE OR REPLACE.
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
  WHERE (p_vcetne_vyrizenych OR n.vyrizeno IS NULL)
    -- Nahlášení vlastních zpráv lektor ani správce nevidí.
    AND z.autor IS DISTINCT FROM auth.uid()
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
  IF EXISTS (SELECT 1 FROM public.chat_zpravy WHERE id = v_zprava AND autor = auth.uid()) THEN
    RAISE EXCEPTION 'Nahlášení vlastní zprávy vyřizuje jiný lektor nebo správce.' USING ERRCODE = '42501';
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
REVOKE ALL ON FUNCTION public.chat_vyridit_nahlaseni(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.chat_vyridit_nahlaseni(UUID, BOOLEAN) TO authenticated;

COMMIT;

-- ─── 5. Ověření (po spuštění, jen čtení) ─────────────────────────────────────
--
--   SELECT public._push_cil('chat');
--     -- /#chat/nahlasene
--   SELECT pg_get_functiondef('public._chat_push(uuid)'::regprocedure) LIKE '%_chat_smi(c.user_id)%',
--          pg_get_functiondef('public.chat_opustit_skupinu(uuid)'::regprocedure) LIKE '%_chat_smi(c.user_id) DESC%',
--          pg_get_functiondef('public.chat_nahlasit(uuid,text)'::regprocedure) LIKE '%IS DISTINCT FROM v_z.autor%',
--          pg_get_functiondef('public.chat_nahlaseni_seznam(boolean)'::regprocedure) LIKE '%z.autor IS DISTINCT FROM auth.uid()%',
--          pg_get_functiondef('public.chat_vyridit_nahlaseni(uuid,boolean)'::regprocedure) LIKE '%vlastní zprávy vyřizuje%';
--     -- true ×5
--   SELECT has_function_privilege('anon', 'public.chat_opustit_skupinu(uuid)', 'EXECUTE'),
--          has_function_privilege('authenticated', 'public.chat_opustit_skupinu(uuid)', 'EXECUTE'),
--          has_function_privilege('anon', 'public.chat_nahlaseni_seznam(boolean)', 'EXECUTE'),
--          has_function_privilege('authenticated', 'public.chat_vyridit_nahlaseni(uuid,boolean)', 'EXECUTE');
--     -- false, true, false, true
