-- ============================================================================
-- 055  Chat: upozornění jen lidem s přístupem, odkaz na nahlášené zprávy
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
--
-- JAK
-- Jen CREATE OR REPLACE tří funkcí, tabulky ani práva se nemění.
-- * `_chat_push` (poslední verze z 054) navíc filtruje příjemce přes
--   `_chat_smi`, stejně jako všechny čtecí funkce chatu.
-- * `_push_cil('chat')` vede na #chat/nahlasene. Druh „chat“ zapisuje do
--   zvonku jen `chat_nahlaseni` (lektorům a správcům); zprávy samotné do
--   zvonku nejdou a svou adresu (#chat/<id>) si skládá `_chat_push`.
-- * `chat_opustit_skupinu` vybírá nového správce nejdřív mezi lidmi
--   s přístupem.
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

COMMIT;

-- ─── 4. Ověření (po spuštění, jen čtení) ─────────────────────────────────────
--
--   SELECT public._push_cil('chat');
--     -- /#chat/nahlasene
--   SELECT pg_get_functiondef('public._chat_push(uuid)'::regprocedure) LIKE '%_chat_smi(c.user_id)%',
--          pg_get_functiondef('public.chat_opustit_skupinu(uuid)'::regprocedure) LIKE '%_chat_smi(c.user_id) DESC%';
--     -- true, true
--   SELECT has_function_privilege('anon', 'public.chat_opustit_skupinu(uuid)', 'EXECUTE'),
--          has_function_privilege('authenticated', 'public.chat_opustit_skupinu(uuid)', 'EXECUTE');
--     -- false, true
