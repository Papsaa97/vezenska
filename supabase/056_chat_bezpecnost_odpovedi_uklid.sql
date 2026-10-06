-- ============================================================================
-- 056  Chat: blokování, pozastavení, odpovědi, „Přečteno“, úpravy, úklid
-- ============================================================================
--
-- CO SE MĚNÍ PRO UŽIVATELE
-- 1. Zablokování člověka: v přímé konverzaci vám nenapíše a nepřidá vás do
--    nové skupiny (ani do stávající). Vyučujícího a správce zablokovat nejde.
--    Ve společné skupině jeho zprávy dál vidíte, jen vám z nich nechodí
--    upozornění do zařízení.
-- 2. Vyučující nebo správce může uživateli pozastavit psaní do chatu na 1 až
--    30 dní s důvodem. Ten konverzace dál čte, ale nepíše, nezakládá nové
--    a neposílá přílohy; v chatu i ve zvonku vidí, do kdy a proč.
-- 3. Odpověď na konkrétní zprávu (citace nad odpovědí).
-- 4. „Přečteno“: u vlastních zpráv server vrací, kolik členů je přečetlo
--    a kolik jich bylo v konverzaci, když zpráva odešla. Údaj vidí jen autor.
-- 5. Přehled souborů a sdílených věcí konverzace.
-- 6. „Vybrat celou třídu“ při zakládání skupiny: lektor a správce kteroukoli
--    třídu, velitel a jeho platný zástupce svou.
-- 7. Úprava vlastní zprávy do 15 minut od odeslání (označí se „upraveno“).
--    Nahlášení si drží znění zprávy z okamžiku nahlášení.
-- 8. Úklid: přílohy se mažou 12 měsíců po odeslání, zprávy 24 měsíců po
--    odeslání, prázdná konverzace zmizí. Zprávu s otevřeným nahlášením úklid
--    nechá. Konverzaci jde skrýt ze seznamu; nová zpráva ji vrátí.
-- 9. Do chatu jde poslat i modelovou situaci a okruh Poznávačky.
--
-- JAK
-- * Tabulky `chat_blokace`, `chat_pozastaveni` a `chat_prilohy_ke_smazani`
--   jsou klientům zavřené jako ostatní tabulky chatu (vše přes funkce).
-- * `chat_zpravy` dostává `odpoved_na`, `upraveno` a `priloha_smazana_nazev`,
--   `chat_clenove` dostává `skryto`, `chat_nahlaseni` `text_pri_nahlaseni`.
-- * `chat_odeslat` přibírá nepovinný parametr `p_odpoved_na`; starší
--   aplikace volá dál se dvěma nebo pěti pojmenovanými parametry.
-- * `chat_konverzace_seznam`, `chat_zpravy_konverzace`
--   a `chat_nahlaseni_seznam` vracejí sloupce navíc (DROP + CREATE).
-- * Soubory v úložišti SQL smazat nesmí (Supabase je chrání triggerem
--   a soubor by v úložišti zůstal). Úklid proto cestu uvolní a zapíše do
--   fronty; soubor smaže aplikace jeho autora při dalším otevření chatu
--   přes Storage API (politika „nepoužitou přílohu smaže autor“ z 054).
-- * Úklid spouští jednou denně pg_cron (úloha `chat-uklid`, 3:15 UTC).
--
-- Spouštět po 055. Skript je idempotentní.
-- ============================================================================

BEGIN;

-- ─── 1. Tabulky a sloupce ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_blokace (
  blokujici UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blokovany UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vytvoreno TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blokujici, blokovany),
  CHECK (blokujici <> blokovany)
);
CREATE INDEX IF NOT EXISTS idx_chat_blokace_blokovany ON public.chat_blokace (blokovany);
ALTER TABLE public.chat_blokace ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_blokace FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.chat_pozastaveni (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  do_kdy     TIMESTAMPTZ NOT NULL,
  duvod      TEXT NOT NULL CHECK (char_length(trim(duvod)) BETWEEN 3 AND 500),
  pozastavil UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vytvoreno  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_pozastaveni ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_pozastaveni FROM anon, authenticated;

-- Soubory, na které už žádná zpráva neodkazuje a které má smazat jejich autor.
CREATE TABLE IF NOT EXISTS public.chat_prilohy_ke_smazani (
  cesta     TEXT PRIMARY KEY,
  vlastnik  UUID,
  zarazeno  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_prilohy_ke_smazani_vlastnik
  ON public.chat_prilohy_ke_smazani (vlastnik);
ALTER TABLE public.chat_prilohy_ke_smazani ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_prilohy_ke_smazani FROM anon, authenticated;

ALTER TABLE public.chat_zpravy ADD COLUMN IF NOT EXISTS odpoved_na UUID
  REFERENCES public.chat_zpravy(id) ON DELETE SET NULL;
ALTER TABLE public.chat_zpravy ADD COLUMN IF NOT EXISTS upraveno TIMESTAMPTZ;
ALTER TABLE public.chat_zpravy ADD COLUMN IF NOT EXISTS priloha_smazana_nazev TEXT;
CREATE INDEX IF NOT EXISTS idx_chat_zpravy_odpoved_na
  ON public.chat_zpravy (odpoved_na) WHERE odpoved_na IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_zpravy_vytvoreno ON public.chat_zpravy (vytvoreno);

ALTER TABLE public.chat_clenove ADD COLUMN IF NOT EXISTS skryto BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.chat_nahlaseni ADD COLUMN IF NOT EXISTS text_pri_nahlaseni TEXT;

-- Zpráva, které úklid smazal přílohu, zůstává platná i bez textu.
ALTER TABLE public.chat_zpravy DROP CONSTRAINT IF EXISTS chat_zpravy_obsah_check;
ALTER TABLE public.chat_zpravy ADD CONSTRAINT chat_zpravy_obsah_check CHECK (
  smazano OR (
    char_length(trim(text)) <= 2000
    AND (char_length(trim(text)) >= 1 OR priloha_cesta IS NOT NULL
         OR sdileni IS NOT NULL OR priloha_smazana_nazev IS NOT NULL)
  )
);

-- ─── 2. Pomocné funkce ───────────────────────────────────────────────────────

-- Zablokoval `p_kdo` člověka `p_koho`?
CREATE OR REPLACE FUNCTION public._chat_blokuje(p_kdo UUID, p_koho UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_blokace b WHERE b.blokujici = p_kdo AND b.blokovany = p_koho
  );
$$;

-- Do kdy má uživatel pozastavené psaní (NULL = nemá).
CREATE OR REPLACE FUNCTION public._chat_pozastaveno(p_user UUID)
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.do_kdy FROM public.chat_pozastaveni p
  WHERE p.user_id = p_user AND p.do_kdy > now();
$$;

-- Jako _chat_overit, navíc odmítne toho, komu vyučující psaní pozastavil.
CREATE OR REPLACE FUNCTION public._chat_overit_psani()
RETURNS VOID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_p public.chat_pozastaveni%ROWTYPE;
BEGIN
  PERFORM public._chat_overit();
  SELECT * INTO v_p FROM public.chat_pozastaveni
  WHERE user_id = auth.uid() AND do_kdy > now();
  IF FOUND THEN
    RAISE EXCEPTION 'Psaní do chatu máte pozastavené do %. Důvod: %',
      to_char(v_p.do_kdy AT TIME ZONE 'Europe/Prague', 'FMDD. FMMM. YYYY HH24:MI'), v_p.duvod
      USING ERRCODE = '42501';
  END IF;
END;
$$;

-- Ověřený seznam nových členů skupiny: jen lidé s přístupem, bez volajícího,
-- bez duplicit a bez těch, kdo volajícího zablokovali.
CREATE OR REPLACE FUNCTION public._chat_platni(p_users UUID[])
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(DISTINCT u), '{}')
  FROM unnest(COALESCE(p_users, '{}')) AS u
  WHERE u IS DISTINCT FROM auth.uid()
    AND public._chat_smi(u)
    AND NOT public._chat_blokuje(u, auth.uid());
$$;

-- Zařadí soubor do fronty k smazání (smaže ho jeho autor přes Storage API).
CREATE OR REPLACE FUNCTION public._chat_zaradit_prilohu(p_cesta TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.chat_prilohy_ke_smazani (cesta, vlastnik)
  SELECT p_cesta, (
    SELECT NULLIF(o.owner_id, '')::UUID FROM storage.objects o
    WHERE o.bucket_id = 'chat-prilohy' AND o.name = p_cesta
  )
  WHERE p_cesta IS NOT NULL
  ON CONFLICT (cesta) DO NOTHING;
$$;

REVOKE ALL ON FUNCTION public._chat_blokuje(UUID, UUID)  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._chat_pozastaveno(UUID)     FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._chat_overit_psani()        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._chat_platni(UUID[])        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._chat_zaradit_prilohu(TEXT) FROM PUBLIC, anon, authenticated;

-- Nahrát přílohu nesmí ani ten, kdo má psaní pozastavené.
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
  IF NOT public._chat_je_clen(v_konv) OR public._chat_pozastaveno(auth.uid()) IS NOT NULL THEN
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
REVOKE ALL ON FUNCTION public._chat_smi_nahrat_prilohu(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public._chat_smi_nahrat_prilohu(TEXT) TO authenticated;

-- Upozornění do zařízení: ne tomu, kdo autora zablokoval (verze z 055 + blokace).
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
        AND public._chat_smi(c.user_id)
        AND NOT public._chat_blokuje(c.user_id, v_z.autor)
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

-- ─── 3. Blokování ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.chat_zablokovat(p_user UUID, p_ano BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._chat_overit();
  IF p_user IS NULL OR p_user = auth.uid() THEN
    RAISE EXCEPTION 'Vyberte, koho chcete zablokovat.' USING ERRCODE = '22023';
  END IF;
  IF COALESCE(p_ano, false) THEN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user AND role IN ('lektor', 'admin')) THEN
      RAISE EXCEPTION 'Vyučujícího ani správce zablokovat nejde. Obtěžuje-li vás, nahlaste jeho zprávu.'
        USING ERRCODE = '42501';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user) THEN
      RAISE EXCEPTION 'Uživatel neexistuje.' USING ERRCODE = 'P0002';
    END IF;
    INSERT INTO public.chat_blokace (blokujici, blokovany)
    VALUES (auth.uid(), p_user)
    ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.chat_blokace WHERE blokujici = auth.uid() AND blokovany = p_user;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.chat_blokovani_seznam()
RETURNS TABLE (id UUID, jmeno TEXT, role TEXT, trida TEXT, vytvoreno TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  PERFORM public._chat_overit();
  RETURN QUERY
  SELECT b.blokovany,
         COALESCE(public._jmeno(b.blokovany), 'Smazaný účet'),
         pr.role,
         NULLIF(trim(pr.user_class), ''),
         b.vytvoreno
  FROM public.chat_blokace b
  LEFT JOIN public.profiles pr ON pr.id = b.blokovany
  WHERE b.blokujici = auth.uid()
  ORDER BY b.vytvoreno DESC;
END;
$$;

-- Lidé, kterým lze napsat: bez těch, kdo volajícího zablokovali.
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
    AND NOT public._chat_blokuje(pr.id, auth.uid())
    AND (v_hledat IS NULL
         OR public._jmeno(pr.id) ILIKE '%' || replace(replace(v_hledat, '%', ''), '_', '') || '%'
         OR pr.user_class ILIKE '%' || replace(replace(v_hledat, '%', ''), '_', '') || '%')
  ORDER BY (lower(trim(COALESCE(pr.user_class, ''))) = v_moje AND v_moje <> '') DESC,
           pr.role IN ('lektor', 'admin') DESC,
           public._jmeno(pr.id)
  LIMIT 200;
END;
$$;

-- ─── 4. Pozastavení psaní ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.chat_pozastavit(p_user UUID, p_dni INTEGER, p_duvod TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_duvod TEXT := trim(COALESCE(p_duvod, ''));
  v_do    TIMESTAMPTZ;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Psaní do chatu pozastavují lektoři a správci.' USING ERRCODE = '42501';
  END IF;
  IF p_user IS NULL OR p_user = auth.uid() THEN
    RAISE EXCEPTION 'Vyberte, komu chcete psaní pozastavit.' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user) THEN
    RAISE EXCEPTION 'Uživatel neexistuje.' USING ERRCODE = 'P0002';
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user AND role IN ('lektor', 'admin')) THEN
    RAISE EXCEPTION 'Lektorovi ani správci psaní pozastavit nejde.' USING ERRCODE = '42501';
  END IF;
  IF p_dni IS NULL OR p_dni NOT BETWEEN 1 AND 30 THEN
    RAISE EXCEPTION 'Psaní jde pozastavit na 1 až 30 dní.' USING ERRCODE = '22023';
  END IF;
  IF char_length(v_duvod) NOT BETWEEN 3 AND 500 THEN
    RAISE EXCEPTION 'Napište důvod (3 až 500 znaků). Uživatel ho uvidí.' USING ERRCODE = '22023';
  END IF;

  v_do := now() + make_interval(days => p_dni);
  INSERT INTO public.chat_pozastaveni (user_id, do_kdy, duvod, pozastavil, vytvoreno)
  VALUES (p_user, v_do, v_duvod, auth.uid(), now())
  ON CONFLICT (user_id) DO UPDATE
  SET do_kdy = EXCLUDED.do_kdy, duvod = EXCLUDED.duvod,
      pozastavil = EXCLUDED.pozastavil, vytvoreno = EXCLUDED.vytvoreno;

  INSERT INTO public.user_notifications (user_id, sender_id, title, body, druh)
  VALUES (
    p_user, auth.uid(),
    'Psaní do chatu je pozastavené',
    format('%s vám pozastavil(a) psaní do chatu do %s. Důvod: %s. Konverzace můžete dál číst.',
           public._jmeno(auth.uid()),
           to_char(v_do AT TIME ZONE 'Europe/Prague', 'FMDD. FMMM. YYYY HH24:MI'),
           left(v_duvod, 300)),
    'zprava'
  );
  RETURN v_do;
END;
$$;

CREATE OR REPLACE FUNCTION public.chat_zrusit_pozastaveni(p_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Psaní do chatu pozastavují lektoři a správci.' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.chat_pozastaveni WHERE user_id = p_user AND do_kdy > now();
  IF FOUND THEN
    INSERT INTO public.user_notifications (user_id, sender_id, title, body, druh)
    VALUES (p_user, auth.uid(), 'Psaní do chatu je znovu povolené',
            'Do chatu můžete zase psát.', 'zprava');
  END IF;
  -- Prošlé záznamy nikdo nepotřebuje.
  DELETE FROM public.chat_pozastaveni WHERE user_id = p_user;
END;
$$;

CREATE OR REPLACE FUNCTION public.chat_pozastaveni_seznam()
RETURNS TABLE (
  user_id          UUID,
  jmeno            TEXT,
  trida            TEXT,
  do_kdy           TIMESTAMPTZ,
  duvod            TEXT,
  pozastavil_jmeno TEXT,
  vytvoreno        TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Přehled vidí lektoři a správci.' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT p.user_id,
         COALESCE(public._jmeno(p.user_id), 'Smazaný účet'),
         NULLIF(trim(pr.user_class), ''),
         p.do_kdy,
         p.duvod,
         public._jmeno(p.pozastavil),
         p.vytvoreno
  FROM public.chat_pozastaveni p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.do_kdy > now()
  ORDER BY p.do_kdy;
END;
$$;

-- Stav přihlášeného: má pozastavené psaní? (Banner v záložce Chat.)
CREATE OR REPLACE FUNCTION public.chat_muj_stav()
RETURNS TABLE (pozastaveno_do TIMESTAMPTZ, duvod TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
BEGIN
  PERFORM public._chat_overit();
  RETURN QUERY
  SELECT p.do_kdy, p.duvod FROM public.chat_pozastaveni p
  WHERE p.user_id = auth.uid() AND p.do_kdy > now();
END;
$$;

-- ─── 5. Zakládání konverzací a skupin ────────────────────────────────────────

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

  v_klic := least(auth.uid()::TEXT, p_user::TEXT) || ':' || greatest(auth.uid()::TEXT, p_user::TEXT);
  SELECT k.id INTO v_id FROM public.chat_konverzace k WHERE k.par_klic = v_klic;

  -- Existující konverzaci, ve které volající je, otevře vždy (číst smí dál,
  -- psaní hlídá chat_odeslat). Skrytou vrátí do seznamu.
  IF v_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.chat_clenove WHERE konverzace_id = v_id AND user_id = auth.uid()
  ) THEN
    UPDATE public.chat_clenove SET skryto = false
    WHERE konverzace_id = v_id AND user_id = auth.uid();
    RETURN v_id;
  END IF;

  PERFORM public._chat_overit_psani();
  IF NOT public._chat_smi(p_user) THEN
    RAISE EXCEPTION 'Tomuto uživateli zatím nelze psát (není zařazen do třídy).' USING ERRCODE = '42501';
  END IF;
  IF public._chat_blokuje(auth.uid(), p_user) THEN
    RAISE EXCEPTION 'Tohoto člověka jste zablokovali. Odblokovat ho jde v záložce Chat pod „Zablokovaní“.'
      USING ERRCODE = '42501';
  END IF;
  IF public._chat_blokuje(p_user, auth.uid()) THEN
    RAISE EXCEPTION 'Tomuto člověku teď nemůžete napsat.' USING ERRCODE = '42501';
  END IF;

  IF v_id IS NULL THEN
    INSERT INTO public.chat_konverzace (je_skupina, par_klic, zalozil)
    VALUES (false, v_klic, auth.uid())
    ON CONFLICT (par_klic) WHERE par_klic IS NOT NULL DO NOTHING
    RETURNING chat_konverzace.id INTO v_id;
    IF v_id IS NULL THEN
      SELECT k.id INTO v_id FROM public.chat_konverzace k WHERE k.par_klic = v_klic;
    END IF;
  END IF;

  INSERT INTO public.chat_clenove (konverzace_id, user_id)
  VALUES (v_id, auth.uid()), (v_id, p_user)
  ON CONFLICT DO NOTHING;

  RETURN v_id;
END;
$$;

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
  PERFORM public._chat_overit_psani();
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
  -- Přejmenovat a přidávat nesmí, kdo má psaní pozastavené; odebrat smí.
  IF p_nazev IS NOT NULL OR p_pridat IS NOT NULL THEN
    PERFORM public._chat_overit_psani();
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

-- Třídy, které volající smí vybrat celé: lektor a správce všechny třídy
-- s lidmi v chatu, velitel a platný zástupce svou.
CREATE OR REPLACE FUNCTION public.chat_tridy_k_vyberu()
RETURNS TABLE (trida TEXT, pocet INTEGER)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  v_moje TEXT;
BEGIN
  PERFORM public._chat_overit();
  IF NOT public.is_staff() THEN
    v_moje := lower(trim(COALESCE(public._velim_tride(), '')));
    IF v_moje = '' THEN
      RETURN;
    END IF;
  END IF;
  RETURN QUERY
  SELECT min(trim(pr.user_class)), count(*)::INTEGER
  FROM public.profiles pr
  WHERE NULLIF(trim(pr.user_class), '') IS NOT NULL
    AND pr.id <> auth.uid()
    AND public._chat_smi(pr.id)
    AND (v_moje IS NULL OR lower(trim(pr.user_class)) = v_moje)
  GROUP BY lower(trim(pr.user_class))
  ORDER BY 1;
END;
$$;

-- Všichni z jedné třídy (pro „Vybrat celou třídu“), bez volajícího a bez
-- těch, kdo ho zablokovali.
CREATE OR REPLACE FUNCTION public.chat_lide_tridy(p_trida TEXT)
RETURNS TABLE (id UUID, jmeno TEXT, role TEXT, trida TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  v_trida TEXT := lower(trim(COALESCE(p_trida, '')));
BEGIN
  PERFORM public._chat_overit();
  IF v_trida = '' THEN
    RAISE EXCEPTION 'Vyberte třídu.' USING ERRCODE = '22023';
  END IF;
  IF NOT public.is_staff()
     AND lower(trim(COALESCE(public._velim_tride(), ''))) IS DISTINCT FROM v_trida THEN
    RAISE EXCEPTION 'Celou třídu vybírá jen její velitel nebo zástupce, lektor a správce.' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT pr.id, public._jmeno(pr.id), pr.role, NULLIF(trim(pr.user_class), '')
  FROM public.profiles pr
  WHERE lower(trim(pr.user_class)) = v_trida
    AND pr.id <> auth.uid()
    AND public._chat_smi(pr.id)
    AND NOT public._chat_blokuje(pr.id, auth.uid())
  ORDER BY public._jmeno(pr.id)
  LIMIT 200;
END;
$$;

-- ─── 6. Seznam konverzací (stav blokace, skryté konverzace) ──────────────────

DROP FUNCTION IF EXISTS public.chat_konverzace_seznam();
CREATE FUNCTION public.chat_konverzace_seznam()
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
  spravuji        BOOLEAN,
  -- Přímá konverzace: 'ja' = druhého jsem zablokoval, 'druhy' = nemohu mu
  -- psát (zablokoval mě). Jinak NULL.
  blokace         TEXT
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
         WHEN p.priloha_smazana_nazev IS NOT NULL AND char_length(trim(p.text)) = 0
           THEN 'Příloha: ' || p.priloha_smazana_nazev || ' (smazána)'
         ELSE public._chat_nahled(p.text, p.priloha_nazev, p.sdileni) END,
    CASE WHEN p.autor IS NULL THEN NULL ELSE COALESCE(public._jmeno(p.autor), 'Smazaný účet') END,
    p.autor = auth.uid(),
    COALESCE(p.vytvoreno, k.vytvoreno),
    (SELECT count(*)::INTEGER FROM public.chat_zpravy z
      WHERE z.konverzace_id = k.id AND z.vytvoreno > c.precteno_do
        AND z.autor IS DISTINCT FROM auth.uid() AND NOT z.smazano),
    c.ztlumeno,
    k.je_skupina AND k.zalozil = auth.uid(),
    CASE WHEN k.je_skupina OR o.user_id IS NULL THEN NULL
         WHEN public._chat_blokuje(auth.uid(), o.user_id) THEN 'ja'
         WHEN public._chat_blokuje(o.user_id, auth.uid()) THEN 'druhy'
    END
  FROM public.chat_clenove c
  JOIN public.chat_konverzace k ON k.id = c.konverzace_id
  LEFT JOIN LATERAL (
    SELECT c3.user_id FROM public.chat_clenove c3
    WHERE c3.konverzace_id = k.id AND c3.user_id <> auth.uid()
    LIMIT 1
  ) o ON NOT k.je_skupina
  LEFT JOIN LATERAL (
    SELECT z.text, z.autor, z.vytvoreno, z.smazano, z.priloha_nazev, z.sdileni, z.priloha_smazana_nazev
    FROM public.chat_zpravy z
    WHERE z.konverzace_id = k.id
    ORDER BY z.vytvoreno DESC LIMIT 1
  ) p ON true
  WHERE c.user_id = auth.uid() AND NOT c.skryto
  ORDER BY k.posledni_zprava DESC
  LIMIT 300;
END;
$$;

-- Skrytí konverzace ze seznamu. Skrytá se zároveň označí za přečtenou;
-- nová zpráva ji vrátí (chat_odeslat).
CREATE OR REPLACE FUNCTION public.chat_skryt_konverzaci(p_konv UUID, p_skryt BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._chat_overit();
  IF NOT public._chat_je_clen(p_konv) THEN
    RAISE EXCEPTION 'Konverzace neexistuje nebo v ní nejste.' USING ERRCODE = '42501';
  END IF;
  UPDATE public.chat_clenove
  SET skryto = COALESCE(p_skryt, false),
      precteno_do = CASE WHEN COALESCE(p_skryt, false) THEN now() ELSE precteno_do END
  WHERE konverzace_id = p_konv AND user_id = auth.uid();
END;
$$;

-- ─── 7. Zprávy konverzace: odpověď, úprava, „Přečteno“ ───────────────────────

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
  sdileni          JSONB,
  priloha_smazana  TEXT,
  upraveno         TIMESTAMPTZ,
  odpoved_na       UUID,
  odpoved_autor    TEXT,
  odpoved_nahled   TEXT,
  -- Jen u vlastních zpráv: kolik členů zprávu přečetlo / kolik jich v
  -- konverzaci bylo, když odešla (bez autora).
  precetlo         INTEGER,
  prijemcu         INTEGER
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
    CASE WHEN z.smazano THEN NULL ELSE z.sdileni END,
    CASE WHEN z.smazano THEN NULL ELSE z.priloha_smazana_nazev END,
    CASE WHEN z.smazano THEN NULL ELSE z.upraveno END,
    CASE WHEN z.smazano THEN NULL ELSE z.odpoved_na END,
    CASE WHEN z.smazano OR o.id IS NULL THEN NULL
         ELSE COALESCE(public._jmeno(o.autor), 'Smazaný účet') END,
    CASE WHEN z.smazano OR o.id IS NULL THEN NULL
         WHEN o.smazano THEN 'Zpráva byla smazána.'
         ELSE left(COALESCE(NULLIF(public._chat_nahled(o.text, o.priloha_nazev, o.sdileni), ''),
                            'Příloha: ' || o.priloha_smazana_nazev, ''), 140) END,
    CASE WHEN z.autor = auth.uid() AND NOT z.smazano THEN (
      SELECT count(*)::INTEGER FROM public.chat_clenove c
      WHERE c.konverzace_id = z.konverzace_id AND c.user_id <> auth.uid()
        AND c.pridan <= z.vytvoreno AND c.precteno_do >= z.vytvoreno
    ) END,
    CASE WHEN z.autor = auth.uid() AND NOT z.smazano THEN (
      SELECT count(*)::INTEGER FROM public.chat_clenove c
      WHERE c.konverzace_id = z.konverzace_id AND c.user_id <> auth.uid()
        AND c.pridan <= z.vytvoreno
    ) END
  FROM public.chat_zpravy z
  LEFT JOIN public.chat_zpravy o ON o.id = z.odpoved_na AND o.konverzace_id = z.konverzace_id
  WHERE z.konverzace_id = p_konv
    AND (p_pred IS NULL OR z.vytvoreno < p_pred)
  ORDER BY z.vytvoreno DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 60), 200));
END;
$$;

-- Přehled souborů a sdílených věcí konverzace (dialog „i“).
CREATE OR REPLACE FUNCTION public.chat_soubory_konverzace(p_konv UUID)
RETURNS TABLE (
  zprava_id        UUID,
  autor_jmeno      TEXT,
  vytvoreno        TIMESTAMPTZ,
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
  SELECT z.id, COALESCE(public._jmeno(z.autor), 'Smazaný účet'), z.vytvoreno,
         z.priloha_cesta, z.priloha_nazev, z.priloha_typ, z.priloha_velikost, z.sdileni
  FROM public.chat_zpravy z
  WHERE z.konverzace_id = p_konv
    AND NOT z.smazano
    AND (z.priloha_cesta IS NOT NULL OR z.sdileni IS NOT NULL)
  ORDER BY z.vytvoreno DESC
  LIMIT 300;
END;
$$;

-- ─── 8. Odeslání a úprava zprávy ─────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.chat_odeslat(UUID, TEXT);
DROP FUNCTION IF EXISTS public.chat_odeslat(UUID, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.chat_odeslat(UUID, TEXT, TEXT, TEXT, JSONB, UUID);
CREATE FUNCTION public.chat_odeslat(
  p_konv          UUID,
  p_text          TEXT,
  p_priloha       TEXT  DEFAULT NULL,
  p_priloha_nazev TEXT  DEFAULT NULL,
  p_sdileni       JSONB DEFAULT NULL,
  p_odpoved_na    UUID  DEFAULT NULL
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
  v_druhy  UUID;
BEGIN
  PERFORM public._chat_overit_psani();
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

  -- Odpověď jen na živou zprávu ze stejné konverzace.
  IF p_odpoved_na IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.chat_zpravy
    WHERE id = p_odpoved_na AND konverzace_id = p_konv AND NOT smazano
  ) THEN
    RAISE EXCEPTION 'Zpráva, na kterou odpovídáte, už není k dispozici.' USING ERRCODE = '22023';
  END IF;

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

  IF p_sdileni IS NOT NULL THEN
    IF jsonb_typeof(p_sdileni) <> 'object' OR char_length(p_sdileni::text) > 6000 THEN
      RAISE EXCEPTION 'Sdílená položka je příliš velká.' USING ERRCODE = '22023';
    END IF;
    v_druh := p_sdileni->>'druh';
    IF v_druh IS NULL OR v_druh NOT IN ('material', 'otazka', 'predpis', 'clanek', 'scenar', 'poznavacka') THEN
      RAISE EXCEPTION 'Tuhle věc nelze sdílet.' USING ERRCODE = '22023';
    END IF;
    IF char_length(trim(COALESCE(p_sdileni->>'nazev', ''))) NOT BETWEEN 1 AND 300 THEN
      RAISE EXCEPTION 'Sdílená položka nemá název.' USING ERRCODE = '22023';
    END IF;
  END IF;

  -- Přímá konverzace: druhý musí mít přístup a nikdo nikoho nesmí blokovat.
  SELECT c.user_id INTO v_druhy
  FROM public.chat_konverzace k
  JOIN public.chat_clenove c ON c.konverzace_id = k.id
  WHERE k.id = p_konv AND NOT k.je_skupina AND c.user_id <> auth.uid()
  LIMIT 1;
  IF v_druhy IS NOT NULL THEN
    IF NOT public._chat_smi(v_druhy) THEN
      RAISE EXCEPTION 'Tomuto uživateli teď nelze psát (není zařazen do třídy).' USING ERRCODE = '42501';
    END IF;
    IF public._chat_blokuje(auth.uid(), v_druhy) THEN
      RAISE EXCEPTION 'Tohoto člověka jste zablokovali. Než mu napíšete, odblokujte ho v podrobnostech konverzace.'
        USING ERRCODE = '42501';
    END IF;
    IF public._chat_blokuje(v_druhy, auth.uid()) THEN
      RAISE EXCEPTION 'Tomuto člověku teď nemůžete napsat.' USING ERRCODE = '42501';
    END IF;
  END IF;

  IF (SELECT count(*) FROM public.chat_zpravy
      WHERE autor = auth.uid() AND vytvoreno > now() - interval '1 minute') >= 30 THEN
    RAISE EXCEPTION 'Příliš mnoho zpráv za krátkou dobu. Zkuste to prosím za chvíli.' USING ERRCODE = '54000';
  END IF;

  INSERT INTO public.chat_zpravy (
    konverzace_id, autor, text,
    priloha_cesta, priloha_nazev, priloha_typ, priloha_velikost, sdileni, odpoved_na
  )
  VALUES (
    p_konv, auth.uid(), v_text,
    p_priloha, v_nazev, v_typ, v_vel, p_sdileni, p_odpoved_na
  )
  RETURNING chat_zpravy.id INTO v_id;

  UPDATE public.chat_konverzace SET posledni_zprava = now() WHERE id = p_konv;
  UPDATE public.chat_clenove SET precteno_do = now()
  WHERE konverzace_id = p_konv AND user_id = auth.uid();
  -- Kdo konverzaci skryl, uvidí ji s novou zprávou zase v seznamu.
  UPDATE public.chat_clenove SET skryto = false
  WHERE konverzace_id = p_konv AND skryto;

  PERFORM public._chat_push(v_id);
  RETURN v_id;
END;
$$;

-- Úprava vlastní zprávy do 15 minut od odeslání.
CREATE OR REPLACE FUNCTION public.chat_upravit_zpravu(p_zprava UUID, p_text TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_z    public.chat_zpravy%ROWTYPE;
  v_text TEXT := trim(COALESCE(p_text, ''));
BEGIN
  PERFORM public._chat_overit_psani();
  SELECT * INTO v_z FROM public.chat_zpravy WHERE id = p_zprava;
  IF NOT FOUND OR v_z.autor IS DISTINCT FROM auth.uid() OR NOT public._chat_je_clen(v_z.konverzace_id) THEN
    RAISE EXCEPTION 'Upravit můžete jen svou zprávu.' USING ERRCODE = '42501';
  END IF;
  IF v_z.smazano THEN
    RAISE EXCEPTION 'Smazanou zprávu upravit nejde.' USING ERRCODE = '22023';
  END IF;
  IF v_z.vytvoreno < now() - interval '15 minutes' THEN
    RAISE EXCEPTION 'Zprávu jde upravit jen do 15 minut od odeslání.' USING ERRCODE = '22023';
  END IF;
  IF char_length(v_text) > 2000 THEN
    RAISE EXCEPTION 'Zpráva může mít nejvýš 2000 znaků.' USING ERRCODE = '22023';
  END IF;
  IF char_length(v_text) = 0 AND v_z.priloha_cesta IS NULL AND v_z.sdileni IS NULL THEN
    RAISE EXCEPTION 'Zpráva nesmí zůstat prázdná. Chcete-li ji odstranit, smažte ji.' USING ERRCODE = '22023';
  END IF;
  IF v_text = v_z.text THEN
    RETURN;
  END IF;
  UPDATE public.chat_zpravy SET text = v_text, upraveno = now() WHERE id = p_zprava;
END;
$$;

-- ─── 9. Mazání, nahlášení a moderace ─────────────────────────────────────────

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
      sdileni          = CASE WHEN v_drzi THEN sdileni ELSE NULL END,
      priloha_smazana_nazev = NULL
  WHERE id = p_zprava;
  IF NOT v_drzi THEN
    PERFORM public._chat_zaradit_prilohu(v_z.priloha_cesta);
  END IF;
END;
$$;

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

  -- Znění v okamžiku nahlášení: pozdější úprava ho nezmění.
  INSERT INTO public.chat_nahlaseni (zprava_id, nahlasil, duvod, text_pri_nahlaseni)
  VALUES (p_zprava, auth.uid(), v_duvod, v_z.text);

  v_kdo := public._jmeno(auth.uid());
  INSERT INTO public.user_notifications (user_id, sender_id, title, body, druh)
  SELECT pr.id, auth.uid(),
         'Nahlášená zpráva v chatu',
         format('%s nahlásil(a) zprávu: %s', v_kdo, left(v_duvod, 200)),
         'chat'
  FROM public.profiles pr
  WHERE pr.role IN ('lektor', 'admin') AND pr.id <> auth.uid()
    AND pr.id IS DISTINCT FROM v_z.autor;
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
  sdileni          JSONB,
  autor_id         UUID,
  autor_muze_byt_pozastaven BOOLEAN,
  autor_pozastaven_do TIMESTAMPTZ,
  text_pri_nahlaseni TEXT,
  upraveno           TIMESTAMPTZ
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
    z.sdileni,
    z.autor,
    z.autor IS NOT NULL AND COALESCE(pa.role NOT IN ('lektor', 'admin'), false),
    public._chat_pozastaveno(z.autor),
    n.text_pri_nahlaseni,
    z.upraveno
  FROM public.chat_nahlaseni n
  JOIN public.chat_zpravy z ON z.id = n.zprava_id
  JOIN public.chat_konverzace k ON k.id = z.konverzace_id
  LEFT JOIN public.profiles pa ON pa.id = z.autor
  WHERE (p_vcetne_vyrizenych OR n.vyrizeno IS NULL)
    AND z.autor IS DISTINCT FROM auth.uid()
  ORDER BY (n.vyrizeno IS NULL) DESC, n.vytvoreno DESC
  LIMIT 200;
END;
$$;

CREATE OR REPLACE FUNCTION public.chat_vyridit_nahlaseni(p_nahlaseni UUID, p_skryt BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_zprava UUID;
  v_cesta  TEXT;
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

  -- Skrytá zpráva, nebo zpráva, kterou autor mezitím smazal sám: obsah už
  -- nic nedrží a soubor jde do fronty k smazání.
  SELECT priloha_cesta INTO v_cesta FROM public.chat_zpravy
  WHERE id = v_zprava AND (p_skryt OR smazano);
  UPDATE public.chat_zpravy
  SET smazano = true,
      smazal  = CASE WHEN smazano THEN smazal ELSE auth.uid() END,
      text = '', priloha_cesta = NULL, priloha_nazev = NULL,
      priloha_typ = NULL, priloha_velikost = NULL, sdileni = NULL,
      priloha_smazana_nazev = NULL
  WHERE id = v_zprava AND (p_skryt OR smazano);
  PERFORM public._chat_zaradit_prilohu(v_cesta);
END;
$$;

-- ─── 10. Úklid starých dat ───────────────────────────────────────────────────

-- Jednou denně (pg_cron). Zprávu s otevřeným nahlášením nechá.
CREATE OR REPLACE FUNCTION public.chat_uklid()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prilohy  INTEGER;
  v_zpravy   INTEGER;
  v_konv     INTEGER;
BEGIN
  -- 1. Přílohy starší 12 měsíců: soubor do fronty, ve zprávě zůstane jen název.
  WITH stare AS (
    SELECT z.id, z.priloha_cesta FROM public.chat_zpravy z
    WHERE z.priloha_cesta IS NOT NULL
      AND z.vytvoreno < now() - interval '12 months'
      AND NOT EXISTS (SELECT 1 FROM public.chat_nahlaseni n WHERE n.zprava_id = z.id AND n.vyrizeno IS NULL)
  ), fronta AS (
    INSERT INTO public.chat_prilohy_ke_smazani (cesta, vlastnik)
    SELECT s.priloha_cesta, (
      SELECT NULLIF(o.owner_id, '')::UUID FROM storage.objects o
      WHERE o.bucket_id = 'chat-prilohy' AND o.name = s.priloha_cesta
    ) FROM stare s
    ON CONFLICT (cesta) DO NOTHING
  )
  UPDATE public.chat_zpravy z
  SET priloha_smazana_nazev = CASE WHEN z.smazano THEN NULL ELSE COALESCE(z.priloha_nazev, 'Příloha') END,
      priloha_cesta = NULL, priloha_nazev = NULL, priloha_typ = NULL, priloha_velikost = NULL
  FROM stare s WHERE z.id = s.id;
  GET DIAGNOSTICS v_prilohy = ROW_COUNT;

  -- 2. Zprávy starší 24 měsíců (příloha už je v kroku 1 pryč).
  DELETE FROM public.chat_zpravy z
  WHERE z.vytvoreno < now() - interval '24 months'
    AND z.priloha_cesta IS NULL
    AND NOT EXISTS (SELECT 1 FROM public.chat_nahlaseni n WHERE n.zprava_id = z.id AND n.vyrizeno IS NULL);
  GET DIAGNOSTICS v_zpravy = ROW_COUNT;

  -- 3. Konverzace bez zpráv, kde se 24 měsíců nic nedělo.
  DELETE FROM public.chat_konverzace k
  WHERE k.posledni_zprava < now() - interval '24 months'
    AND NOT EXISTS (SELECT 1 FROM public.chat_zpravy z WHERE z.konverzace_id = k.id);
  GET DIAGNOSTICS v_konv = ROW_COUNT;

  -- 4. Prošlá pozastavení.
  DELETE FROM public.chat_pozastaveni WHERE do_kdy < now() - interval '30 days';

  RETURN jsonb_build_object('prilohy', v_prilohy, 'zpravy', v_zpravy, 'konverzace', v_konv);
END;
$$;
REVOKE ALL ON FUNCTION public.chat_uklid() FROM PUBLIC, anon, authenticated;

-- Soubory přihlášeného, které má aplikace smazat z úložiště.
CREATE OR REPLACE FUNCTION public.chat_moje_prilohy_ke_smazani()
RETURNS SETOF TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.cesta FROM public.chat_prilohy_ke_smazani f
  WHERE f.vlastnik = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM public.chat_zpravy z WHERE z.priloha_cesta = f.cesta)
  ORDER BY f.zarazeno
  LIMIT 100;
$$;

-- Aplikace soubory smazala: z fronty zmizí jen ty, které v úložišti opravdu nejsou.
CREATE OR REPLACE FUNCTION public.chat_prilohy_smazany(p_cesty TEXT[])
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.chat_prilohy_ke_smazani f
  WHERE f.vlastnik = auth.uid()
    AND f.cesta = ANY (COALESCE(p_cesty, '{}'))
    AND NOT EXISTS (
      SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'chat-prilohy' AND o.name = f.cesta
    );
$$;

-- ─── 11. Práva ───────────────────────────────────────────────────────────────

DO $$
DECLARE
  f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.chat_zablokovat(uuid,boolean)',
    'public.chat_blokovani_seznam()',
    'public.chat_lide(text)',
    'public.chat_pozastavit(uuid,integer,text)',
    'public.chat_zrusit_pozastaveni(uuid)',
    'public.chat_pozastaveni_seznam()',
    'public.chat_muj_stav()',
    'public.chat_zalozit_primou(uuid)',
    'public.chat_zalozit_skupinu(text,uuid[])',
    'public.chat_upravit_skupinu(uuid,text,uuid[],uuid[])',
    'public.chat_tridy_k_vyberu()',
    'public.chat_lide_tridy(text)',
    'public.chat_konverzace_seznam()',
    'public.chat_skryt_konverzaci(uuid,boolean)',
    'public.chat_zpravy_konverzace(uuid,timestamptz,integer)',
    'public.chat_soubory_konverzace(uuid)',
    'public.chat_odeslat(uuid,text,text,text,jsonb,uuid)',
    'public.chat_upravit_zpravu(uuid,text)',
    'public.chat_smazat_zpravu(uuid)',
    'public.chat_nahlasit(uuid,text)',
    'public.chat_nahlaseni_seznam(boolean)',
    'public.chat_vyridit_nahlaseni(uuid,boolean)',
    'public.chat_moje_prilohy_ke_smazani()',
    'public.chat_prilohy_smazany(text[])'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f);
  END LOOP;
END;
$$;

-- ─── 12. Plánovač úklidu (pg_cron) ───────────────────────────────────────────
--
-- Na Supabase je pg_cron k dispozici, jen se musí zapnout. Kde není (místní
-- testovací databáze), skript úlohu jen přeskočí.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'chat-uklid';
    PERFORM cron.schedule('chat-uklid', '15 3 * * *', 'SELECT public.chat_uklid()');
  ELSE
    RAISE NOTICE 'pg_cron není k dispozici, úklid chatu se nenaplánoval.';
  END IF;
END;
$$;

COMMIT;

-- ─── 13. Ověření (po spuštění, jen čtení) ────────────────────────────────────
--
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE tablename IN ('chat_blokace', 'chat_pozastaveni', 'chat_prilohy_ke_smazani');
--     -- 3 řádky, rowsecurity = true
--   SELECT pg_get_function_identity_arguments('public.chat_odeslat'::regproc);
--     -- p_konv uuid, p_text text, p_priloha text, p_priloha_nazev text, p_sdileni jsonb, p_odpoved_na uuid
--   SELECT jobname, schedule, command FROM cron.job WHERE jobname = 'chat-uklid';
--     -- chat-uklid | 15 3 * * * | SELECT public.chat_uklid()
--   SELECT has_function_privilege('anon', 'public.chat_zablokovat(uuid,boolean)', 'EXECUTE'),
--          has_function_privilege('authenticated', 'public.chat_uklid()', 'EXECUTE'),
--          has_table_privilege('authenticated', 'public.chat_blokace', 'SELECT');
--     -- false, false, false
