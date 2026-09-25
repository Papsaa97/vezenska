-- ============================================================================
-- 038  Zařazování do tříd: žádosti, nominace velitele a soukromí nástěnek
-- ============================================================================
--
-- CO SE MĚNÍ PRO UŽIVATELE
-- 1. Třídu si student už nezapíše sám. Po prvním přihlášení buď požádá
--    o zařazení do existující třídy (schvaluje velitel té třídy, nebo lektor
--    či správce), nebo zvolí „Nevidím zde svou třídu“ a povinně napíše
--    poznámku, kam patří.
-- 2. Velitel třídy vidí seznam nezařazených uživatelů (jméno, poznámka, jak
--    dlouho v seznamu jsou) a může je označit pro svou třídu. Zařazení
--    proběhne až tehdy, když to označený sám potvrdí. O potvrzení i odmítnutí
--    přijde veliteli oznámení do zvonku.
-- 3. Třídu komukoli mění, velitele jmenuje a odvolává jen lektor nebo správce.
-- 4. Plný obsah nástěnky třídy (rozvrh, služby, ústroj, sekce) čtou jen
--    členové třídy, lektoři a správci. Ostatní vidí přes trida_prehled()
--    jen přehled: název, termín kurzu, jméno velitele a počet členů.
--
-- PROČ PŘES FUNKCE, A NE PŘES PŘÍMÝ ZÁPIS DO profiles
-- Po migraci 029 čte každý jen vlastní řádek v profiles, takže velitel ani
-- lektor cizí profily nevidí a nemůže je upravit. Každý přechod (žádost,
-- nominace, potvrzení, přiřazení) proto dělá SECURITY DEFINER funkce, která
-- sama ověří roli volajícího a zároveň pošle oznámení. Přímý zápis
-- `user_class` do profiles smí od teď jen správce.
--
-- CO ZŮSTÁVÁ
-- Stávající zařazení (5 studentů a velitel v ZOP A11, správce v ZOP A10) se
-- nemění — skript nikoho nepřeřazuje. `user_class` zůstává textem shodným
-- s class_boards.class_name; přejmenování třídy teď ale zařazení přenese
-- (trigger v kroku 6) a smazání třídy její členy vrátí mezi nezařazené.
--
-- Spouštět po 037_zpravy_od_spravce_sloupce.sql. Skript je idempotentní.
-- ============================================================================

BEGIN;

-- ─── 1. Nové sloupce v profiles ──────────────────────────────────────────────
--
-- trida_poznamka  — text z „Nevidím zde svou třídu“. Vidí ho velitelé
--                   a lektoři v seznamu nezařazených.
-- nezarazen_od    — od kdy je účet bez třídy. Z toho se v seznamu počítá
--                   „v seznamu 5 dní“. Stávajícím nezařazeným se doplní datum
--                   založení účtu, novým účtům výchozí now().

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trida_poznamka TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nezarazen_od TIMESTAMPTZ DEFAULT now();

UPDATE public.profiles
SET nezarazen_od = COALESCE(created_at, now())
WHERE user_class IS NULL AND nezarazen_od IS NULL;

UPDATE public.profiles
SET nezarazen_od = NULL
WHERE user_class IS NOT NULL AND nezarazen_od IS NOT NULL;

COMMENT ON COLUMN public.profiles.trida_poznamka IS
  'Poznámka uživatele bez třídy („Nevidím zde svou třídu“) — kam patří.';
COMMENT ON COLUMN public.profiles.nezarazen_od IS
  'Od kdy je účet bez třídy. NULL = zařazený.';
COMMENT ON COLUMN public.profiles.user_class IS
  'Zařazení do třídy ZOP (shodné s class_boards.class_name). Mění ho jen '
  'funkce z migrace 038 nebo správce; u velitele určuje spravovanou třídu '
  'a u všech ostatních, čí nástěnku smí číst.';

-- ─── 2. Žádosti a nominace ───────────────────────────────────────────────────
--
-- druh 'zadost'   — uživatel sám požádal o třídu; rozhoduje velitel/lektor/správce.
-- druh 'nominace' — velitel označil nezařazeného; rozhoduje označený uživatel.

CREATE TABLE IF NOT EXISTS public.tridni_prirazeni (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_name  TEXT NOT NULL,
  druh        TEXT NOT NULL CHECK (druh IN ('zadost', 'nominace')),
  stav        TEXT NOT NULL DEFAULT 'ceka'
              CHECK (stav IN ('ceka', 'prijato', 'odmitnuto', 'zruseno')),
  vytvoril    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  vytvoreno   TIMESTAMPTZ NOT NULL DEFAULT now(),
  rozhodl     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rozhodnuto  TIMESTAMPTZ
);

-- Jedna čekající žádost nebo nominace na dvojici uživatel–třída.
CREATE UNIQUE INDEX IF NOT EXISTS uq_tridni_prirazeni_ceka
  ON public.tridni_prirazeni (user_id, lower(trim(class_name)))
  WHERE stav = 'ceka';

CREATE INDEX IF NOT EXISTS idx_tridni_prirazeni_trida_ceka
  ON public.tridni_prirazeni (lower(trim(class_name)))
  WHERE stav = 'ceka';

-- Klient do tabulky nesahá vůbec — všechno jde přes funkce níže.
ALTER TABLE public.tridni_prirazeni ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tridni_prirazeni FROM anon, authenticated;

-- ─── 3. Pomocné funkce (nejsou volatelné z klienta) ──────────────────────────

-- Kanonický název existující třídy, nebo NULL.
CREATE OR REPLACE FUNCTION public._trida_kanonicky(p_class TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT class_name FROM public.class_boards
  WHERE lower(trim(class_name)) = lower(trim(p_class))
  ORDER BY created_at
  LIMIT 1;
$$;

-- Zapíše oznámení do zvonku. Odesílatelem je volající.
CREATE OR REPLACE FUNCTION public._upozornit(p_user UUID, p_title TEXT, p_body TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- `sender_name` se nevyplňuje: na produkci ho doplní výchozí hodnota
  -- (viz 037) a v tabulce založené z user_notifications.sql vůbec není.
  -- Aplikace jméno odesílatele bere ze `sender_id`.
  INSERT INTO public.user_notifications (user_id, sender_id, title, body)
  SELECT p_user, auth.uid(), p_title, p_body
  WHERE p_user IS NOT NULL AND p_user IS DISTINCT FROM auth.uid();
$$;

-- Jméno k zobrazení v oznámeních.
CREATE OR REPLACE FUNCTION public._jmeno(p_user UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(NULLIF(trim(full_name), ''), split_part(email, '@', 1), 'Uživatel')
  FROM public.profiles WHERE id = p_user;
$$;

-- Zařadí uživatele do třídy a uklidí všechny jeho čekající žádosti a nominace.
CREATE OR REPLACE FUNCTION public._zaradit(p_user UUID, p_class TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET user_class     = p_class,
      trida_poznamka = CASE WHEN p_class IS NULL THEN trida_poznamka ELSE NULL END,
      nezarazen_od   = CASE WHEN p_class IS NULL THEN COALESCE(nezarazen_od, now()) ELSE NULL END
  WHERE id = p_user;

  UPDATE public.tridni_prirazeni
  SET stav = 'zruseno', rozhodl = auth.uid(), rozhodnuto = now()
  WHERE user_id = p_user AND stav = 'ceka';
END;
$$;

-- Velitelé dané třídy (obvykle jeden).
CREATE OR REPLACE FUNCTION public._velitele_tridy(p_class TEXT)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles
  WHERE role = 'velitel_tridy'
    AND lower(trim(user_class)) = lower(trim(p_class));
$$;

REVOKE ALL ON FUNCTION public._trida_kanonicky(TEXT)     FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._upozornit(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._jmeno(UUID)                FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._zaradit(UUID, TEXT)        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._velitele_tridy(TEXT)       FROM PUBLIC, anon, authenticated;

-- ─── 4. Funkce pro klienta ───────────────────────────────────────────────────

-- 4a. Přehled všech tříd — to jediné, co z cizí třídy vidí nečlen.
CREATE OR REPLACE FUNCTION public.trida_prehled()
RETURNS TABLE (
  id                TEXT,
  class_name        TEXT,
  course_start_date DATE,
  course_end_date   DATE,
  velitel_jmeno     TEXT,
  pocet_clenu       INTEGER,
  updated_at        TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id,
    b.class_name,
    b.course_start_date,
    b.course_end_date,
    (SELECT string_agg(public._jmeno(p.id), ', ' ORDER BY p.full_name)
       FROM public.profiles p
      WHERE p.role = 'velitel_tridy'
        AND lower(trim(p.user_class)) = lower(trim(b.class_name))),
    (SELECT count(*)::int
       FROM public.profiles p
      WHERE p.role IN ('student', 'velitel_tridy')
        AND lower(trim(p.user_class)) = lower(trim(b.class_name))),
    b.updated_at
  FROM public.class_boards b
  WHERE auth.uid() IS NOT NULL
  ORDER BY b.class_name;
$$;

-- 4b. Stav zařazení přihlášeného uživatele: třída, poznámka, čekající položky.
CREATE OR REPLACE FUNCTION public.moje_zarazeni()
RETURNS TABLE (
  user_class     TEXT,
  trida_poznamka TEXT,
  nezarazen_od   TIMESTAMPTZ,
  polozka_id     UUID,
  druh           TEXT,
  class_name     TEXT,
  od_koho        TEXT,
  vytvoreno      TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_class, p.trida_poznamka, p.nezarazen_od,
         t.id, t.druh, t.class_name, public._jmeno(t.vytvoril), t.vytvoreno
  FROM public.profiles p
  LEFT JOIN public.tridni_prirazeni t
    ON t.user_id = p.id AND t.stav = 'ceka'
  WHERE p.id = auth.uid()
  ORDER BY t.vytvoreno DESC NULLS LAST;
$$;

-- 4c. Student požádá o zařazení do existující třídy.
CREATE OR REPLACE FUNCTION public.pozadat_o_tridu(p_class TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me    public.profiles%ROWTYPE;
  v_class TEXT := public._trida_kanonicky(p_class);
  v_vel   UUID;
BEGIN
  SELECT * INTO v_me FROM public.profiles WHERE id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Profil nenalezen.' USING ERRCODE = '42501'; END IF;
  IF v_me.user_class IS NOT NULL THEN
    RAISE EXCEPTION 'Už jste zařazeni do třídy %. Změnit ji může jen lektor nebo správce.', v_me.user_class
      USING ERRCODE = '42501';
  END IF;
  IF v_class IS NULL THEN
    RAISE EXCEPTION 'Třída „%“ neexistuje.', p_class USING ERRCODE = 'P0002';
  END IF;

  -- Jinou čekající vlastní žádost stáhneme — čeká vždy nejvýš jedna.
  UPDATE public.tridni_prirazeni
  SET stav = 'zruseno', rozhodl = auth.uid(), rozhodnuto = now()
  WHERE user_id = auth.uid() AND druh = 'zadost' AND stav = 'ceka'
    AND lower(trim(class_name)) <> lower(trim(v_class));

  INSERT INTO public.tridni_prirazeni (user_id, class_name, druh, vytvoril)
  VALUES (auth.uid(), v_class, 'zadost', auth.uid())
  ON CONFLICT DO NOTHING;

  FOR v_vel IN SELECT public._velitele_tridy(v_class) LOOP
    PERFORM public._upozornit(
      v_vel,
      'Žádost o zařazení do třídy ' || v_class,
      public._jmeno(auth.uid()) || ' žádá o zařazení do vaší třídy. Schválit nebo odmítnout '
        || 'to můžete na nástěnce v přehledu „Zařazení do tříd“.'
    );
  END LOOP;

  RETURN v_class;
END;
$$;

-- 4d. „Nevidím zde svou třídu“ — povinná poznámka, zůstává nezařazený.
CREATE OR REPLACE FUNCTION public.nevidim_svou_tridu(p_poznamka TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_note TEXT := trim(COALESCE(p_poznamka, ''));
BEGIN
  IF length(v_note) < 3 THEN
    RAISE EXCEPTION 'Napište prosím alespoň informativně, do které třídy patříte.' USING ERRCODE = '22023';
  END IF;
  IF length(v_note) > 300 THEN
    RAISE EXCEPTION 'Poznámka může mít nejvýš 300 znaků.' USING ERRCODE = '22023';
  END IF;
  IF (SELECT user_class FROM public.profiles WHERE id = auth.uid()) IS NOT NULL THEN
    RAISE EXCEPTION 'Už jste zařazeni do třídy. Změnit ji může jen lektor nebo správce.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.profiles
  SET trida_poznamka = v_note,
      nezarazen_od   = COALESCE(nezarazen_od, now())
  WHERE id = auth.uid();

  UPDATE public.tridni_prirazeni
  SET stav = 'zruseno', rozhodl = auth.uid(), rozhodnuto = now()
  WHERE user_id = auth.uid() AND druh = 'zadost' AND stav = 'ceka';
END;
$$;

-- 4e. Seznam pro velitele a lektory/správce.
--
-- Velitel dostane jen nezařazené studenty (bez e-mailu). Lektor a správce
-- dostanou všechny účty s e-mailem — potřebují je přeřazovat a jmenovat velitele.
CREATE OR REPLACE FUNCTION public.seznam_zarazeni()
RETURNS TABLE (
  id              UUID,
  full_name       TEXT,
  email           TEXT,
  role            TEXT,
  user_class      TEXT,
  trida_poznamka  TEXT,
  nezarazen_od    TIMESTAMPTZ,
  zadost_id       UUID,
  zadost_trida    TEXT,
  nominace_tridy  TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role  TEXT := public.my_role();
  v_staff BOOLEAN := public.is_staff();
BEGIN
  IF NOT v_staff AND NOT (v_role = 'velitel_tridy' AND public.my_class() IS NOT NULL) THEN
    RAISE EXCEPTION 'Seznam vidí jen velitel třídy, lektor a správce.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    public._jmeno(p.id),
    CASE WHEN v_staff THEN p.email ELSE NULL END,
    p.role,
    p.user_class,
    p.trida_poznamka,
    CASE WHEN p.user_class IS NULL THEN COALESCE(p.nezarazen_od, p.created_at) END,
    z.id,
    z.class_name,
    (SELECT string_agg(n.class_name, ', ' ORDER BY n.class_name)
       FROM public.tridni_prirazeni n
      WHERE n.user_id = p.id AND n.druh = 'nominace' AND n.stav = 'ceka')
  FROM public.profiles p
  LEFT JOIN LATERAL (
    SELECT t.id, t.class_name FROM public.tridni_prirazeni t
    WHERE t.user_id = p.id AND t.druh = 'zadost' AND t.stav = 'ceka'
    ORDER BY t.vytvoreno DESC LIMIT 1
  ) z ON true
  WHERE v_staff
     OR (p.user_class IS NULL AND p.role = 'student')
  ORDER BY (p.user_class IS NOT NULL), COALESCE(p.nezarazen_od, p.created_at), p.full_name;
END;
$$;

-- 4f. Velitel označí nezařazeného pro svou třídu.
CREATE OR REPLACE FUNCTION public.nominovat_do_tridy(p_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class  TEXT := public.my_class();
  v_target public.profiles%ROWTYPE;
BEGIN
  IF public.my_role() <> 'velitel_tridy' OR v_class IS NULL THEN
    RAISE EXCEPTION 'Označovat do třídy smí jen velitel třídy.' USING ERRCODE = '42501';
  END IF;
  v_class := COALESCE(public._trida_kanonicky(v_class), v_class);

  SELECT * INTO v_target FROM public.profiles WHERE id = p_user;
  IF NOT FOUND OR v_target.role <> 'student' OR v_target.user_class IS NOT NULL THEN
    RAISE EXCEPTION 'Označit lze jen nezařazeného studenta.' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.tridni_prirazeni (user_id, class_name, druh, vytvoril)
  VALUES (p_user, v_class, 'nominace', auth.uid())
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    PERFORM public._upozornit(
      p_user,
      'Byli jste označeni ve třídě ' || v_class,
      public._jmeno(auth.uid()) || ', velitel třídy ' || v_class || ', vás označil jako člena své třídy. '
        || 'Potvrďte nebo odmítněte to prosím v aplikaci.'
    );
  END IF;
END;
$$;

-- 4g. Velitel stáhne svou nominaci (třeba omylem označil jiného člověka).
CREATE OR REPLACE FUNCTION public.zrusit_nominaci(p_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tridni_prirazeni
  SET stav = 'zruseno', rozhodl = auth.uid(), rozhodnuto = now()
  WHERE user_id = p_user AND druh = 'nominace' AND stav = 'ceka'
    AND (public.is_staff()
         OR (public.my_role() = 'velitel_tridy'
             AND lower(trim(class_name)) = lower(trim(public.my_class()))));
END;
$$;

-- 4h. Označený uživatel potvrdí nebo odmítne nominaci.
CREATE OR REPLACE FUNCTION public.rozhodnout_nominaci(p_id UUID, p_prijmout BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t public.tridni_prirazeni%ROWTYPE;
BEGIN
  SELECT * INTO v_t FROM public.tridni_prirazeni
  WHERE id = p_id AND user_id = auth.uid() AND druh = 'nominace' AND stav = 'ceka'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Označení už neplatí nebo nepatří vám.' USING ERRCODE = 'P0002';
  END IF;

  IF p_prijmout THEN
    IF (SELECT user_class FROM public.profiles WHERE id = auth.uid()) IS NOT NULL THEN
      RAISE EXCEPTION 'Už jste zařazeni do třídy.' USING ERRCODE = '42501';
    END IF;
    IF public._trida_kanonicky(v_t.class_name) IS NULL THEN
      RAISE EXCEPTION 'Třída % už neexistuje.', v_t.class_name USING ERRCODE = 'P0002';
    END IF;
    PERFORM public._zaradit(auth.uid(), public._trida_kanonicky(v_t.class_name));
    UPDATE public.tridni_prirazeni
    SET stav = 'prijato', rozhodl = auth.uid(), rozhodnuto = now()
    WHERE id = p_id;
    PERFORM public._upozornit(
      v_t.vytvoril,
      'Potvrzeno: ' || public._jmeno(auth.uid()) || ' je ve třídě ' || v_t.class_name,
      public._jmeno(auth.uid()) || ' potvrdil(a) označení a byl(a) zařazen(a) do třídy ' || v_t.class_name || '.'
    );
  ELSE
    UPDATE public.tridni_prirazeni
    SET stav = 'odmitnuto', rozhodl = auth.uid(), rozhodnuto = now()
    WHERE id = p_id;
    PERFORM public._upozornit(
      v_t.vytvoril,
      'Odmítnuto: ' || public._jmeno(auth.uid()) || ' do třídy ' || v_t.class_name,
      public._jmeno(auth.uid()) || ' označení do třídy ' || v_t.class_name
        || ' odmítl(a) a zůstává v seznamu nezařazených.'
    );
  END IF;
END;
$$;

-- 4i. Velitel dané třídy (nebo lektor/správce) rozhodne o žádosti studenta.
CREATE OR REPLACE FUNCTION public.rozhodnout_zadost(p_id UUID, p_schvalit BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t public.tridni_prirazeni%ROWTYPE;
BEGIN
  SELECT * INTO v_t FROM public.tridni_prirazeni
  WHERE id = p_id AND druh = 'zadost' AND stav = 'ceka'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Žádost už neplatí.' USING ERRCODE = 'P0002';
  END IF;
  IF NOT public.can_manage_class(v_t.class_name) THEN
    RAISE EXCEPTION 'O žádosti rozhoduje velitel třídy %, lektor nebo správce.', v_t.class_name
      USING ERRCODE = '42501';
  END IF;

  IF p_schvalit THEN
    IF public._trida_kanonicky(v_t.class_name) IS NULL THEN
      RAISE EXCEPTION 'Třída % už neexistuje.', v_t.class_name USING ERRCODE = 'P0002';
    END IF;
    PERFORM public._zaradit(v_t.user_id, public._trida_kanonicky(v_t.class_name));
    UPDATE public.tridni_prirazeni
    SET stav = 'prijato', rozhodl = auth.uid(), rozhodnuto = now()
    WHERE id = p_id;
    PERFORM public._upozornit(
      v_t.user_id,
      'Jste zařazeni do třídy ' || v_t.class_name,
      'Vaši žádost o zařazení do třídy ' || v_t.class_name || ' schválil(a) ' || public._jmeno(auth.uid()) || '.'
    );
  ELSE
    UPDATE public.tridni_prirazeni
    SET stav = 'odmitnuto', rozhodl = auth.uid(), rozhodnuto = now()
    WHERE id = p_id;
    PERFORM public._upozornit(
      v_t.user_id,
      'Žádost o třídu ' || v_t.class_name || ' byla odmítnuta',
      public._jmeno(auth.uid()) || ' vaši žádost o zařazení do třídy ' || v_t.class_name
        || ' odmítl(a). Zvolte prosím jinou třídu, nebo napište poznámku, kam patříte.'
    );
  END IF;
END;
$$;

-- 4j. Lektor nebo správce přiřadí (nebo odebere) třídu komukoli.
CREATE OR REPLACE FUNCTION public.priradit_tridu(p_user UUID, p_class TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class TEXT;
  v_old   TEXT;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Třídu mění jen lektor nebo správce.' USING ERRCODE = '42501';
  END IF;

  IF p_class IS NOT NULL AND trim(p_class) <> '' THEN
    v_class := public._trida_kanonicky(p_class);
    IF v_class IS NULL THEN
      RAISE EXCEPTION 'Třída „%“ neexistuje.', p_class USING ERRCODE = 'P0002';
    END IF;
  END IF;

  SELECT user_class INTO v_old FROM public.profiles WHERE id = p_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'Uživatel nenalezen.' USING ERRCODE = 'P0002'; END IF;
  IF v_old IS NOT DISTINCT FROM v_class THEN RETURN; END IF;

  PERFORM public._zaradit(p_user, v_class);

  PERFORM public._upozornit(
    p_user,
    CASE WHEN v_class IS NULL THEN 'Vaše zařazení do třídy bylo zrušeno'
         ELSE 'Jste zařazeni do třídy ' || v_class END,
    CASE WHEN v_class IS NULL
         THEN public._jmeno(auth.uid()) || ' vás vyřadil(a) ze třídy ' || COALESCE(v_old, '') || '.'
         ELSE public._jmeno(auth.uid()) || ' vás zařadil(a) do třídy ' || v_class || '.' END
  );
END;
$$;

-- 4k. Lektor nebo správce jmenuje velitele třídy.
--
-- Třída má jednoho velitele: dosavadní velitel téže třídy se vrací mezi
-- studenty (ve třídě zůstává). Lektora ani správce velitelem udělat nejde —
-- šlo by o snížení jejich role.
CREATE OR REPLACE FUNCTION public.jmenovat_velitele(p_user UUID, p_class TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class  TEXT := public._trida_kanonicky(p_class);
  v_target public.profiles%ROWTYPE;
  v_prev   UUID;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Velitele třídy jmenuje jen lektor nebo správce.' USING ERRCODE = '42501';
  END IF;
  IF v_class IS NULL THEN
    RAISE EXCEPTION 'Třída „%“ neexistuje.', p_class USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_target FROM public.profiles WHERE id = p_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Uživatel nenalezen.' USING ERRCODE = 'P0002'; END IF;
  IF v_target.role IN ('lektor', 'admin') THEN
    RAISE EXCEPTION 'Lektora ani správce nelze jmenovat velitelem třídy.' USING ERRCODE = '42501';
  END IF;

  FOR v_prev IN
    SELECT id FROM public.profiles
    WHERE role = 'velitel_tridy' AND id <> p_user
      AND lower(trim(user_class)) = lower(trim(v_class))
  LOOP
    UPDATE public.profiles SET role = 'student' WHERE id = v_prev;
    PERFORM public._upozornit(
      v_prev,
      'Změna velitele třídy ' || v_class,
      'Velitelem třídy ' || v_class || ' byl(a) jmenován(a) ' || public._jmeno(p_user)
        || '. Ve třídě zůstáváte jako student.'
    );
  END LOOP;

  UPDATE public.profiles SET role = 'velitel_tridy' WHERE id = p_user;
  PERFORM public._zaradit(p_user, v_class);

  PERFORM public._upozornit(
    p_user,
    'Jste velitelem třídy ' || v_class,
    public._jmeno(auth.uid()) || ' vás jmenoval(a) velitelem třídy ' || v_class
      || '. Můžete upravovat její nástěnku a zařazovat do ní nezařazené.'
  );
END;
$$;

-- 4l. Lektor nebo správce odvolá velitele (zůstane ve třídě jako student).
CREATE OR REPLACE FUNCTION public.odvolat_velitele(p_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Velitele odvolává jen lektor nebo správce.' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles SET role = 'student'
  WHERE id = p_user AND role = 'velitel_tridy';
  IF FOUND THEN
    PERFORM public._upozornit(
      p_user,
      'Funkce velitele třídy skončila',
      public._jmeno(auth.uid()) || ' vás odvolal(a) z funkce velitele třídy. Ve třídě zůstáváte jako student.'
    );
  END IF;
END;
$$;

-- Práva: jen přihlášení.
DO $$
DECLARE
  f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.trida_prehled()',
    'public.moje_zarazeni()',
    'public.pozadat_o_tridu(text)',
    'public.nevidim_svou_tridu(text)',
    'public.seznam_zarazeni()',
    'public.nominovat_do_tridy(uuid)',
    'public.zrusit_nominaci(uuid)',
    'public.rozhodnout_nominaci(uuid, boolean)',
    'public.rozhodnout_zadost(uuid, boolean)',
    'public.priradit_tridu(uuid, text)',
    'public.jmenovat_velitele(uuid, text)',
    'public.odvolat_velitele(uuid)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f);
  END LOOP;
END $$;

-- ─── 5. Zámky v RLS ──────────────────────────────────────────────────────────
--
-- 5a. profiles UPDATE: nesprávce už nesmí měnit `user_class` vůbec (dosud jen
--     velitel), ani si sám zapsat `trida_poznamka` a `nezarazen_od` jinak než
--     přes nevidim_svou_tridu(). Zbytek podmínek je beze změny z migrace 032.

DROP POLICY IF EXISTS "Úprava profilu: správce vše, ostatní vlastní bez změny role" ON public.profiles;

CREATE POLICY "Úprava profilu: správce vše, ostatní vlastní bez změny role"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((select public.is_admin()) OR (select auth.uid()) = id)
  WITH CHECK (
    (select public.is_admin())
    OR (
      (select auth.uid()) = id
      AND role = (select public.my_role())
      AND user_class IS NOT DISTINCT FROM (select public.my_class())
      AND email IS NOT DISTINCT FROM (select public.my_email())
    )
  );

-- Poznámku a datum nezařazení hlídá trigger, ne sloupcové oprávnění:
-- Supabase dává roli `authenticated` UPDATE nad celou tabulkou a REVOKE nad
-- jednotlivým sloupcem takové oprávnění neodebere. Funkce z kroku 4 běží jako
-- vlastník tabulky (current_user není `authenticated`), takže je trigger pustí.
CREATE OR REPLACE FUNCTION public.hlidat_sloupce_zarazeni()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.trida_poznamka := NULL;
    NEW.nezarazen_od   := now();
  ELSE
    NEW.trida_poznamka := OLD.trida_poznamka;
    NEW.nezarazen_od   := OLD.nezarazen_od;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.hlidat_sloupce_zarazeni() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS hlidat_sloupce_zarazeni ON public.profiles;
CREATE TRIGGER hlidat_sloupce_zarazeni
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.hlidat_sloupce_zarazeni();

-- 5b. profiles INSERT: vlastní profil se zakládá bez třídy.
DROP POLICY IF EXISTS "Povolit vytvoření vlastního profilu" ON public.profiles;
CREATE POLICY "Povolit vytvoření vlastního profilu"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = id
    AND role = 'student'
    AND user_class IS NULL
  );

-- 5c. class_boards SELECT: plný řádek jen členům, lektorům a správcům.
--     Přehled pro ostatní dává trida_prehled().
DROP POLICY IF EXISTS "Čtení tříd pro přihlášené" ON public.class_boards;
DROP POLICY IF EXISTS "Povolit čtení tříd pro všechny" ON public.class_boards;
DROP POLICY IF EXISTS "Nástěnku třídy čtou její členové, lektoři a správci" ON public.class_boards;

CREATE POLICY "Nástěnku třídy čtou její členové, lektoři a správci"
  ON public.class_boards FOR SELECT TO authenticated
  USING (
    (select public.is_staff())
    OR lower(trim(class_name)) = lower(trim((select public.my_class())))
  );

-- ─── 6. Přejmenování a smazání třídy ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.trida_zmena_nazvu_nebo_smazani()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF lower(trim(NEW.class_name)) IS DISTINCT FROM lower(trim(OLD.class_name)) THEN
      UPDATE public.profiles SET user_class = NEW.class_name
      WHERE lower(trim(user_class)) = lower(trim(OLD.class_name));
      UPDATE public.tridni_prirazeni SET class_name = NEW.class_name
      WHERE stav = 'ceka' AND lower(trim(class_name)) = lower(trim(OLD.class_name));
    END IF;
    RETURN NEW;
  END IF;

  -- DELETE: členové se vrací mezi nezařazené, čekající položky padají.
  UPDATE public.profiles
  SET user_class = NULL, nezarazen_od = now()
  WHERE lower(trim(user_class)) = lower(trim(OLD.class_name));
  UPDATE public.tridni_prirazeni
  SET stav = 'zruseno', rozhodnuto = now()
  WHERE stav = 'ceka' AND lower(trim(class_name)) = lower(trim(OLD.class_name));
  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION public.trida_zmena_nazvu_nebo_smazani() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trida_zmena_nazvu ON public.class_boards;
CREATE TRIGGER trida_zmena_nazvu
  AFTER UPDATE OF class_name ON public.class_boards
  FOR EACH ROW EXECUTE FUNCTION public.trida_zmena_nazvu_nebo_smazani();

DROP TRIGGER IF EXISTS trida_smazani ON public.class_boards;
CREATE TRIGGER trida_smazani
  AFTER DELETE ON public.class_boards
  FOR EACH ROW EXECUTE FUNCTION public.trida_zmena_nazvu_nebo_smazani();

COMMIT;

-- ─── 7. Ověření (po spuštění, jen čtení) ─────────────────────────────────────
--
--   SELECT policyname, qual FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'class_boards' AND cmd = 'SELECT';
--     -- jediná politika „Nástěnku třídy čtou její členové, lektoři a správci“
--
--   SELECT proname FROM pg_proc
--   WHERE proname IN ('trida_prehled','moje_zarazeni','pozadat_o_tridu',
--                     'nevidim_svou_tridu','seznam_zarazeni','nominovat_do_tridy',
--                     'zrusit_nominaci','rozhodnout_nominaci','rozhodnout_zadost',
--                     'priradit_tridu','jmenovat_velitele','odvolat_velitele');
--     -- 12 řádků
--
--   SELECT count(*) FROM public.profiles WHERE user_class IS NULL AND nezarazen_od IS NULL;
--     -- 0
