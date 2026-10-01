-- ============================================================================
-- 053  O žádosti o vstup do třídy může rozhodnout i hlasování členů třídy
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- O žádosti studenta o zařazení do třídy (tridni_prirazeni, druh 'zadost',
-- migrace 038) rozhodoval jen velitel, jeho platný zástupce, lektor nebo
-- správce. Když velitel nebyl aktivní a ostatní si žádosti nevšimli, nový
-- člen se do třídy nedostal.
--
-- CO TENHLE SKRIPT DĚLÁ
-- 1. Žádost dál jde schválit jedním kliknutím velitele, zástupce, lektora
--    nebo správce (rozhodnout_zadost() se nemění). Nově ji mohou přijmout
--    i členové třídy hlasováním.
-- 2. Hlasovat smí jen ten, kdo byl členem třídy V OKAMŽIKU PODÁNÍ ŽÁDOSTI
--    (seznam se uloží do tridni_hlasovani_opravneni) a členem je pořád.
--    Kamarádi z jiné třídy ani lidé přidaní do třídy až po podání žádosti
--    tak výsledek neovlivní a „většina“ se nedá nafouknout.
-- 3. Přijato je, jakmile pro hlasuje víc než polovina oprávněných
--    (u 5 členů 3, u 6 členů 4). Zamítnuto je, jakmile už většina vzniknout
--    nemůže (hlasy proti + odešlí členové to znemožní). Hlas jde do uzavření
--    změnit, každý má jeden.
-- 4. Třída s méně než 3 oprávněnými hlasovat nemůže — jeden nebo dva lidé
--    by o vstupu rozhodli sami. Tam rozhoduje velitel, zástupce, lektor nebo
--    správce jako dosud.
-- 5. Výsledek počítá databáze (funkce hlasovat_o_zadosti), ne aplikace.
--    Tabulky s hlasy nejsou z klienta čitelné ani zapisovatelné; všechno jde
--    přes funkce SECURITY DEFINER, které samy ověří, kdo volá.
-- 6. Kdo hlasoval jak, vidí jen velitel, zástupce, lektor a správce.
--    Členové a žadatel vidí jen počty.
-- 7. Žadatel, kterého hlasování zamítlo, může do téže třídy znovu požádat
--    až po 24 hodinách. Členové dostanou oznámení o nové žádosti nejvýš
--    jednou za 24 hodin od téhož žadatele (proti zahlcení zvonku).
--
-- Bez této migrace aplikace funguje dál jako dřív: panel hlasování se
-- nezobrazí (funkce chybí) a žádosti vyřizuje velitel.
--
-- Spouštět po 051. Idempotentní.
-- ============================================================================

BEGIN;

-- ─── 1. Tabulky ──────────────────────────────────────────────────────────────

ALTER TABLE public.tridni_prirazeni
  ADD COLUMN IF NOT EXISTS rozhodnuto_hlasovanim BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.tridni_prirazeni.rozhodnuto_hlasovanim IS
  'true = o žádosti rozhodlo hlasování členů třídy (migrace 053), ne velitel ani lektor.';

-- Kdo smí o žádosti hlasovat: členové třídy v okamžiku podání žádosti.
CREATE TABLE IF NOT EXISTS public.tridni_hlasovani_opravneni (
  prirazeni_id UUID NOT NULL REFERENCES public.tridni_prirazeni(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (prirazeni_id, user_id)
);

-- Hlasy. Jeden na oprávněného člena; změna hlasu přepíše řádek.
CREATE TABLE IF NOT EXISTS public.tridni_hlasy (
  prirazeni_id UUID NOT NULL REFERENCES public.tridni_prirazeni(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pro          BOOLEAN NOT NULL,
  kdy          TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (prirazeni_id, user_id),
  FOREIGN KEY (prirazeni_id, user_id)
    REFERENCES public.tridni_hlasovani_opravneni (prirazeni_id, user_id) ON DELETE CASCADE
);

-- Klient do tabulek nesahá vůbec — všechno jde přes funkce níže.
ALTER TABLE public.tridni_hlasovani_opravneni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tridni_hlasy ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tridni_hlasovani_opravneni FROM anon, authenticated;
REVOKE ALL ON public.tridni_hlasy FROM anon, authenticated;

-- ─── 2. Pomocné funkce (nejsou volatelné z klienta) ──────────────────────────

-- Nejmenší počet oprávněných, od kterého třída smí hlasovat.
CREATE OR REPLACE FUNCTION public._hlasovani_minimum()
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$ SELECT 3 $$;

-- Je uživatel právě teď členem třídy? Stejné pravidlo jako počet členů
-- v trida_prehled() a seznam v clenove_tridy().
CREATE OR REPLACE FUNCTION public._je_clenem_tridy(p_user UUID, p_class TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_user
      AND p.role IN ('student', 'velitel_tridy')
      AND lower(trim(p.user_class)) = lower(trim(p_class))
  );
$$;

-- Uloží, kdo smí o žádosti hlasovat: dnešní členové třídy.
CREATE OR REPLACE FUNCTION public._zalozit_hlasovani(p_id UUID, p_class TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.tridni_hlasovani_opravneni (prirazeni_id, user_id)
  SELECT p_id, p.id FROM public.profiles p
  WHERE p.role IN ('student', 'velitel_tridy')
    AND lower(trim(p.user_class)) = lower(trim(p_class))
  ON CONFLICT DO NOTHING;
$$;

-- Stav hlasování. Počítají se jen hlasy těch, kdo jsou ve třídě pořád;
-- základ pro většinu (opravneni) je ale pevný z okamžiku podání žádosti.
CREATE OR REPLACE FUNCTION public._stav_hlasovani(p_id UUID)
RETURNS TABLE (opravneni INTEGER, potreba INTEGER, pro INTEGER, proti INTEGER, mozno_pro INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH t AS (
    SELECT class_name FROM public.tridni_prirazeni WHERE id = p_id
  ),
  o AS (
    SELECT o.user_id,
           public._je_clenem_tridy(o.user_id, (SELECT class_name FROM t)) AS clen,
           h.pro
    FROM public.tridni_hlasovani_opravneni o
    LEFT JOIN public.tridni_hlasy h
      ON h.prirazeni_id = o.prirazeni_id AND h.user_id = o.user_id
    WHERE o.prirazeni_id = p_id
  )
  SELECT
    count(*)::int,
    (count(*) / 2 + 1)::int,
    count(*) FILTER (WHERE clen AND pro IS TRUE)::int,
    count(*) FILTER (WHERE clen AND pro IS FALSE)::int,
    count(*) FILTER (WHERE clen AND pro IS DISTINCT FROM false)::int
  FROM o;
$$;

REVOKE ALL ON FUNCTION public._hlasovani_minimum()            FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._je_clenem_tridy(UUID, TEXT)    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._zalozit_hlasovani(UUID, TEXT)  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._stav_hlasovani(UUID)           FROM PUBLIC, anon, authenticated;

-- ─── 3. Žádost o třídu: uloží oprávněné a upozorní členy ─────────────────────
--
-- Tělo je z 041 (upozornění velitele, zástupce, případně lektorů); přibývá
-- 24hodinová lhůta po zamítnutí hlasováním, seznam oprávněných a oznámení
-- členům třídy, pokud třída smí hlasovat.

CREATE OR REPLACE FUNCTION public.pozadat_o_tridu(p_class TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me       public.profiles%ROWTYPE;
  v_class    TEXT := public._trida_kanonicky(p_class);
  v_komu     UUID;
  v_pocet    INT := 0;
  v_title    TEXT;
  v_body     TEXT;
  v_id       UUID;
  v_vedeni   UUID[];
  v_opravneni INT;
  v_nedavno  BOOLEAN;
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

  IF EXISTS (
    SELECT 1 FROM public.tridni_prirazeni
    WHERE user_id = auth.uid() AND druh = 'zadost' AND stav = 'odmitnuto'
      AND rozhodnuto_hlasovanim
      AND lower(trim(class_name)) = lower(trim(v_class))
      AND rozhodnuto > now() - interval '24 hours'
  ) THEN
    RAISE EXCEPTION 'Členové třídy % vaši žádost nedávno zamítli. Znovu můžete požádat až po 24 hodinách, nebo se obraťte na velitele či lektora.', v_class
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.tridni_prirazeni
  SET stav = 'zruseno', rozhodl = auth.uid(), rozhodnuto = now()
  WHERE user_id = auth.uid() AND druh = 'zadost' AND stav = 'ceka'
    AND lower(trim(class_name)) <> lower(trim(v_class));

  -- Dostal už někdo z členů oznámení o žádosti téhož člověka do téže třídy
  -- v posledních 24 hodinách? Pak se členům znovu nepíše.
  v_nedavno := EXISTS (
    SELECT 1 FROM public.tridni_prirazeni
    WHERE user_id = auth.uid() AND druh = 'zadost'
      AND lower(trim(class_name)) = lower(trim(v_class))
      AND vytvoreno > now() - interval '24 hours'
  );

  INSERT INTO public.tridni_prirazeni (user_id, class_name, druh, vytvoril)
  VALUES (auth.uid(), v_class, 'zadost', auth.uid())
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_id;

  -- Žádost už čekala (dvojí odeslání) — nic dalšího se neposílá.
  IF v_id IS NULL THEN
    RETURN v_class;
  END IF;

  PERFORM public._zalozit_hlasovani(v_id, v_class);
  SELECT opravneni INTO v_opravneni FROM public._stav_hlasovani(v_id);

  v_title := 'Žádost o zařazení do třídy ' || v_class;
  v_body  := public._jmeno(auth.uid()) || ' žádá o zařazení do třídy ' || v_class
    || '. Schválit nebo odmítnout to můžete na nástěnce v přehledu „Zařazení“.';

  SELECT array_agg(x) INTO v_vedeni FROM (
    SELECT public._velitele_tridy(v_class) AS x
    UNION
    SELECT z.user_id FROM public.tridni_zastupce z
    WHERE lower(trim(z.class_name)) = lower(trim(v_class))
      AND (z.plati_do IS NULL OR z.plati_do > now())
  ) s;

  FOREACH v_komu IN ARRAY COALESCE(v_vedeni, '{}') LOOP
    PERFORM public._upozornit(v_komu, v_title, v_body);
    v_pocet := v_pocet + 1;
  END LOOP;

  IF v_pocet = 0 THEN
    FOR v_komu IN SELECT id FROM public.profiles WHERE role IN ('lektor', 'admin') LOOP
      PERFORM public._upozornit(v_komu, v_title, v_body || ' Třída zatím nemá velitele.');
    END LOOP;
  END IF;

  -- Ostatní členové (vedení už oznámení má): mohou o přijetí hlasovat.
  IF v_opravneni >= public._hlasovani_minimum() AND NOT v_nedavno THEN
    FOR v_komu IN
      SELECT o.user_id FROM public.tridni_hlasovani_opravneni o
      WHERE o.prirazeni_id = v_id
        AND NOT (o.user_id = ANY (COALESCE(v_vedeni, '{}')))
    LOOP
      PERFORM public._upozornit(
        v_komu,
        'Nový zájemce o vaši třídu ' || v_class,
        public._jmeno(auth.uid()) || ' žádá o zařazení do třídy ' || v_class
          || '. Jako člen třídy můžete na Nástěnce hlasovat o přijetí. Přijat(a) bude, '
          || 'až pro bude víc než polovina členů, nebo když žádost schválí velitel.'
      );
    END LOOP;
  END IF;

  RETURN v_class;
END;
$$;

REVOKE ALL ON FUNCTION public.pozadat_o_tridu(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pozadat_o_tridu(TEXT) TO authenticated;

-- Žádosti, které už čekají: oprávnění jsou dnešní členové (dřívější stav
-- se nikde neukládal).
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT t.id, t.class_name FROM public.tridni_prirazeni t
    WHERE t.druh = 'zadost' AND t.stav = 'ceka'
      AND NOT EXISTS (SELECT 1 FROM public.tridni_hlasovani_opravneni o WHERE o.prirazeni_id = t.id)
  LOOP
    PERFORM public._zalozit_hlasovani(r.id, r.class_name);
  END LOOP;
END $$;

-- ─── 4. Hlasování ────────────────────────────────────────────────────────────

-- Člen třídy hlasuje pro (true) nebo proti (false). Vrací stav žádosti po
-- hlasování: 'ceka', 'prijato' nebo 'odmitnuto'.
CREATE OR REPLACE FUNCTION public.hlasovat_o_zadosti(p_id UUID, p_pro BOOLEAN)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t      public.tridni_prirazeni%ROWTYPE;
  v_s      RECORD;
  v_class  TEXT;
  v_komu   UUID;
BEGIN
  IF p_pro IS NULL THEN
    RAISE EXCEPTION 'Zvolte, zda hlasujete pro, nebo proti.' USING ERRCODE = '22023';
  END IF;

  -- Zámek řádku: souběžné hlasy se vyhodnotí jeden po druhém.
  SELECT * INTO v_t FROM public.tridni_prirazeni
  WHERE id = p_id AND druh = 'zadost' AND stav = 'ceka'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'O žádosti už je rozhodnuto.' USING ERRCODE = 'P0002';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.tridni_hlasovani_opravneni
    WHERE prirazeni_id = p_id AND user_id = auth.uid()
  ) OR NOT public._je_clenem_tridy(auth.uid(), v_t.class_name) THEN
    RAISE EXCEPTION 'Hlasovat mohou jen ti, kdo byli členy třídy % už při podání žádosti.', v_t.class_name
      USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_s FROM public._stav_hlasovani(p_id);
  IF v_s.opravneni < public._hlasovani_minimum() THEN
    RAISE EXCEPTION 'Třída má méně než % členy, hlasovat proto nelze. O žádosti rozhodne velitel nebo lektor.',
      public._hlasovani_minimum() USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.tridni_hlasy (prirazeni_id, user_id, pro, kdy)
  VALUES (p_id, auth.uid(), p_pro, now())
  ON CONFLICT (prirazeni_id, user_id) DO UPDATE SET pro = EXCLUDED.pro, kdy = EXCLUDED.kdy;

  SELECT * INTO v_s FROM public._stav_hlasovani(p_id);

  IF v_s.pro >= v_s.potreba THEN
    v_class := public._trida_kanonicky(v_t.class_name);
    IF v_class IS NULL THEN
      RAISE EXCEPTION 'Třída % už neexistuje.', v_t.class_name USING ERRCODE = 'P0002';
    END IF;
    IF (SELECT user_class FROM public.profiles WHERE id = v_t.user_id) IS NOT NULL THEN
      RAISE EXCEPTION 'Žadatel už je zařazen v jiné třídě.' USING ERRCODE = '42501';
    END IF;
    PERFORM public._zaradit(v_t.user_id, v_class);
    UPDATE public.tridni_prirazeni
    SET stav = 'prijato', rozhodl = auth.uid(), rozhodnuto = now(), rozhodnuto_hlasovanim = true
    WHERE id = p_id;

    PERFORM public._upozornit(
      v_t.user_id,
      'Jste zařazeni do třídy ' || v_class,
      'Členové třídy ' || v_class || ' vás hlasováním přijali (' || v_s.pro || ' z ' || v_s.opravneni || ' pro).'
    );
    FOR v_komu IN
      SELECT public._velitele_tridy(v_class)
      UNION
      SELECT z.user_id FROM public.tridni_zastupce z
      WHERE lower(trim(z.class_name)) = lower(trim(v_class))
        AND (z.plati_do IS NULL OR z.plati_do > now())
    LOOP
      PERFORM public._upozornit(
        v_komu,
        'Přijat(a) hlasováním: ' || public._jmeno(v_t.user_id),
        public._jmeno(v_t.user_id) || ' byl(a) přijat(a) do třídy ' || v_class
          || ' hlasováním členů (' || v_s.pro || ' z ' || v_s.opravneni || ' pro).'
      );
    END LOOP;
    RETURN 'prijato';
  END IF;

  IF v_s.mozno_pro < v_s.potreba THEN
    UPDATE public.tridni_prirazeni
    SET stav = 'odmitnuto', rozhodl = auth.uid(), rozhodnuto = now(), rozhodnuto_hlasovanim = true
    WHERE id = p_id;

    PERFORM public._upozornit(
      v_t.user_id,
      'Žádost o třídu ' || v_t.class_name || ' byla zamítnuta',
      'Členové třídy ' || v_t.class_name || ' vaši žádost hlasováním zamítli. Patříte-li do ní, '
        || 'obraťte se na velitele nebo lektora; znovu požádat můžete po 24 hodinách.'
    );
    FOR v_komu IN SELECT public._velitele_tridy(v_t.class_name) LOOP
      PERFORM public._upozornit(
        v_komu,
        'Zamítnuto hlasováním: ' || public._jmeno(v_t.user_id),
        'Žádost ' || public._jmeno(v_t.user_id) || ' o zařazení do třídy ' || v_t.class_name
          || ' členové hlasováním zamítli (' || v_s.proti || ' proti).'
      );
    END LOOP;
    RETURN 'odmitnuto';
  END IF;

  RETURN 'ceka';
END;
$$;

-- Čekající žádosti s hlasováním, které volající smí vidět:
--   • člen třídy — žádosti do své třídy (počty a svůj hlas),
--   • žadatel — svou žádost (jen počty),
--   • lektor a správce — všechny.
-- Jména hlasujících dostane jen ten, kdo třídu vede (can_manage_class).
CREATE OR REPLACE FUNCTION public.hlasovani_o_zadostech()
RETURNS TABLE (
  zadost_id        UUID,
  class_name       TEXT,
  zadatel_id       UUID,
  zadatel_jmeno    TEXT,
  vytvoreno        TIMESTAMPTZ,
  opravneni        INTEGER,
  potreba          INTEGER,
  pro              INTEGER,
  proti            INTEGER,
  hlasovani_mozne  BOOLEAN,
  muj_hlas         BOOLEAN,
  smim_hlasovat    BOOLEAN,
  jmena_pro        TEXT,
  jmena_proti      TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff BOOLEAN := public.is_staff();
  v_moje  TEXT    := (SELECT user_class FROM public.profiles WHERE id = auth.uid());
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nejste přihlášeni.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    t.id,
    t.class_name,
    t.user_id,
    public._jmeno(t.user_id),
    t.vytvoreno,
    s.opravneni,
    s.potreba,
    s.pro,
    s.proti,
    s.opravneni >= public._hlasovani_minimum(),
    (SELECT h.pro FROM public.tridni_hlasy h WHERE h.prirazeni_id = t.id AND h.user_id = auth.uid()),
    s.opravneni >= public._hlasovani_minimum()
      AND EXISTS (SELECT 1 FROM public.tridni_hlasovani_opravneni o
                  WHERE o.prirazeni_id = t.id AND o.user_id = auth.uid())
      AND public._je_clenem_tridy(auth.uid(), t.class_name),
    CASE WHEN public.can_manage_class(t.class_name) THEN
      (SELECT string_agg(public._jmeno(h.user_id), ', ' ORDER BY h.kdy)
         FROM public.tridni_hlasy h
        WHERE h.prirazeni_id = t.id AND h.pro
          AND public._je_clenem_tridy(h.user_id, t.class_name))
    END,
    CASE WHEN public.can_manage_class(t.class_name) THEN
      (SELECT string_agg(public._jmeno(h.user_id), ', ' ORDER BY h.kdy)
         FROM public.tridni_hlasy h
        WHERE h.prirazeni_id = t.id AND NOT h.pro
          AND public._je_clenem_tridy(h.user_id, t.class_name))
    END
  FROM public.tridni_prirazeni t
  CROSS JOIN LATERAL public._stav_hlasovani(t.id) s
  WHERE t.druh = 'zadost' AND t.stav = 'ceka'
    AND (
      v_staff
      OR t.user_id = auth.uid()
      OR (v_moje IS NOT NULL
          AND lower(trim(t.class_name)) = lower(trim(v_moje))
          AND public._je_clenem_tridy(auth.uid(), t.class_name))
    )
  ORDER BY t.vytvoreno;
END;
$$;

REVOKE ALL ON FUNCTION public.hlasovat_o_zadosti(UUID, BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.hlasovani_o_zadostech()           FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hlasovat_o_zadosti(UUID, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.hlasovani_o_zadostech()           TO authenticated, service_role;

COMMIT;

-- ─── Ověření po spuštění (jen čtení) ─────────────────────────────────────────
--
--   SELECT to_regprocedure('public.hlasovat_o_zadosti(uuid, boolean)') IS NOT NULL AS hlasovani,
--          to_regprocedure('public.hlasovani_o_zadostech()')         IS NOT NULL AS prehled,
--          (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.tridni_hlasy'::regclass) AS rls_hlasy,
--          has_table_privilege('authenticated', 'public.tridni_hlasy', 'SELECT') AS klient_cte_hlasy;
--   -- čekáno: true, true, true, false
