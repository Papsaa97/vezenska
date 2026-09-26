-- ============================================================================
-- 040  Postup ve scénářích a drilech na serveru; editovatelné zbraně a jídelníček
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- 1. Splněné taktické scénáře a zbraňové drily se ukládaly jen do localStorage
--    prohlížeče (utils/gamification.ts). Na jiném zařízení, v PWA na ploše
--    telefonu (má vlastní úložiště, oddělené od Safari) nebo po tom, co Safari
--    po sedmi dnech bez návštěvy smaže data webu, ukazovala záložka Modelové
--    situace „0 / 12 vyřešeno“, i když uživatel scénáře prošel.
-- 2. Záložku Zbraně a střelba nemohl lektor ani správce upravit — data byla
--    natvrdo v komponentě (zpětná vazba z 18. 9. 2026).
-- 3. Na nástěnku chyběl jídelníček (návrh ze zpětné vazby 18. 9. 2026).
--
-- CO TENHLE SKRIPT DĚLÁ
-- 1. Tabulka public.studijni_postup: jeden řádek = jedna splněná položka
--    (scénář, dril, oblíbená otázka nebo oblíbený předpis) jednoho uživatele. Každý čte, zapisuje a maže jen
--    své řádky. Aplikace při přihlášení sloučí serverový a místní postup.
-- 2. Rozšíří výčet druhů v public.content_blocks o 'weapon', 'stoppage_drill',
--    'jidelnicek' a 'regulation'. Zapisovat je smí jako dosud jen lektor
--    a správce (politiky z 027 se nemění).
-- 3. Oznámení ve zvonku si smaže jejich adresát (dosud jen správce).
-- 4. Žádost o třídu bez velitele dostane zástupce, případně lektoři a správci.
-- 5. Velitel přeřazený do jiné třídy, vyřazený z třídy nebo ve smazané třídě
--    přestává být velitelem (dosud zůstával: dva velitelé, velitel bez třídy).
--
-- Aplikace bez této migrace funguje dál jako dřív (postup jen v zařízení,
-- úpravy zbraní a jídelníčku skončí chybou kontroly `content_blocks_kind_check`).
--
-- Spouštět po 039_diskuze_tridy.sql. Idempotentní.
-- ============================================================================

BEGIN;

-- ─── 1. Postup uživatele ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.studijni_postup (
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  druh       TEXT        NOT NULL,
  polozka    TEXT        NOT NULL,
  dokonceno  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, druh, polozka)
);

ALTER TABLE public.studijni_postup DROP CONSTRAINT IF EXISTS studijni_postup_druh_check;
ALTER TABLE public.studijni_postup ADD CONSTRAINT studijni_postup_druh_check
  CHECK (druh IN ('scenario', 'drill', 'fav_question', 'fav_legal'));

ALTER TABLE public.studijni_postup DROP CONSTRAINT IF EXISTS studijni_postup_polozka_check;
ALTER TABLE public.studijni_postup ADD CONSTRAINT studijni_postup_polozka_check
  CHECK (char_length(polozka) BETWEEN 1 AND 120);

COMMENT ON TABLE public.studijni_postup IS
  'Splněné scénáře a drily, oblíbené otázky a předpisy. Každý uživatel vidí a mění jen své řádky.';

ALTER TABLE public.studijni_postup ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Svůj postup čte každý sám" ON public.studijni_postup;
CREATE POLICY "Svůj postup čte každý sám"
  ON public.studijni_postup FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Svůj postup zapisuje každý sám" ON public.studijni_postup;
CREATE POLICY "Svůj postup zapisuje každý sám"
  ON public.studijni_postup FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Svůj postup maže každý sám" ON public.studijni_postup;
CREATE POLICY "Svůj postup maže každý sám"
  ON public.studijni_postup FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- UPDATE není potřeba (řádek se jen vloží nebo smaže); upsert s
-- ignoreDuplicates ho nepoužívá.
REVOKE ALL ON public.studijni_postup FROM anon;
REVOKE ALL ON public.studijni_postup FROM authenticated;
GRANT SELECT, INSERT, DELETE ON public.studijni_postup TO authenticated;

-- ─── 2. Nové druhy editovatelného obsahu ─────────────────────────────────────

ALTER TABLE public.content_blocks DROP CONSTRAINT IF EXISTS content_blocks_kind_check;
ALTER TABLE public.content_blocks ADD CONSTRAINT content_blocks_kind_check
  CHECK (kind IN ('subject', 'matching_category', 'scenario', 'weapon', 'stoppage_drill', 'jidelnicek', 'regulation'));

-- ─── 3. Oznámení si každý smaže sám ──────────────────────────────────────────
--
-- Mazat směl jen správce, takže přečtená oznámení (od 038/039 jich chodí
-- mnohem víc: žádosti, nominace, označení v diskuzi) se jen hromadila.

DROP POLICY IF EXISTS "Pouze správce může mazat zprávy" ON public.user_notifications;
DROP POLICY IF EXISTS "Vlastní oznámení maže adresát, správce všechna" ON public.user_notifications;
CREATE POLICY "Vlastní oznámení maže adresát, správce všechna"
  ON public.user_notifications FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id OR (select public.is_admin()));

-- ─── 4. Žádost o třídu bez velitele se neztratí ──────────────────────────────
--
-- pozadat_o_tridu() upozorňovala jen velitele. U třídy bez velitele (a zástupce
-- nedostal nic nikdy) žádost neviděl nikdo a student čekal donekonečna.
-- Nově dostane oznámení i platný zástupce, a nemá-li třída ani jednoho,
-- lektoři a správci.

CREATE OR REPLACE FUNCTION public.pozadat_o_tridu(p_class TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me     public.profiles%ROWTYPE;
  v_class  TEXT := public._trida_kanonicky(p_class);
  v_komu   UUID;
  v_pocet  INT := 0;
  v_title  TEXT;
  v_body   TEXT;
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

  UPDATE public.tridni_prirazeni
  SET stav = 'zruseno', rozhodl = auth.uid(), rozhodnuto = now()
  WHERE user_id = auth.uid() AND druh = 'zadost' AND stav = 'ceka'
    AND lower(trim(class_name)) <> lower(trim(v_class));

  INSERT INTO public.tridni_prirazeni (user_id, class_name, druh, vytvoril)
  VALUES (auth.uid(), v_class, 'zadost', auth.uid())
  ON CONFLICT DO NOTHING;

  v_title := 'Žádost o zařazení do třídy ' || v_class;
  v_body  := public._jmeno(auth.uid()) || ' žádá o zařazení do třídy ' || v_class
    || '. Schválit nebo odmítnout to můžete na nástěnce v přehledu „Zařazení“.';

  FOR v_komu IN
    SELECT public._velitele_tridy(v_class)
    UNION
    SELECT z.user_id FROM public.tridni_zastupce z
    WHERE lower(trim(z.class_name)) = lower(trim(v_class))
      AND (z.plati_do IS NULL OR z.plati_do > now())
  LOOP
    PERFORM public._upozornit(v_komu, v_title, v_body);
    v_pocet := v_pocet + 1;
  END LOOP;

  IF v_pocet = 0 THEN
    FOR v_komu IN SELECT id FROM public.profiles WHERE role IN ('lektor', 'admin') LOOP
      PERFORM public._upozornit(v_komu, v_title, v_body || ' Třída zatím nemá velitele.');
    END LOOP;
  END IF;

  RETURN v_class;
END;
$$;

REVOKE ALL ON FUNCTION public.pozadat_o_tridu(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pozadat_o_tridu(TEXT) TO authenticated;

-- ─── 5. Velitel, který odchází z třídy, přestává velet ───────────────────────
--
-- priradit_tridu() přesunula velitele do jiné třídy (nebo „bez třídy“), ale
-- nechala mu roli velitel_tridy: cílová třída pak měla dva velitele a stará
-- žádného, případně existoval velitel bez třídy. Totéž po smazání třídy.

CREATE OR REPLACE FUNCTION public._odvolat_pri_odchodu(p_user UUID, p_old_class TEXT, p_duvod TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET role = 'student'
  WHERE id = p_user AND role = 'velitel_tridy';
  IF FOUND THEN
    DELETE FROM public.tridni_zastupce
    WHERE lower(trim(class_name)) = lower(trim(COALESCE(p_old_class, '')));
    PERFORM public._zapsat_historii(COALESCE(p_old_class, '—'), 'odvolani', p_user, NULL, p_duvod, NULL);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public._odvolat_pri_odchodu(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

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

  PERFORM public._odvolat_pri_odchodu(p_user, v_old, 'Přeřazení do jiné třídy');
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

REVOKE ALL ON FUNCTION public.priradit_tridu(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.priradit_tridu(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.trida_zmena_nazvu_nebo_smazani()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vel UUID;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF lower(trim(NEW.class_name)) IS DISTINCT FROM lower(trim(OLD.class_name)) THEN
      UPDATE public.profiles SET user_class = NEW.class_name
      WHERE lower(trim(user_class)) = lower(trim(OLD.class_name));
      UPDATE public.tridni_prirazeni SET class_name = NEW.class_name
      WHERE stav = 'ceka' AND lower(trim(class_name)) = lower(trim(OLD.class_name));
      UPDATE public.tridni_zastupce SET class_name = NEW.class_name
      WHERE lower(trim(class_name)) = lower(trim(OLD.class_name));
    END IF;
    RETURN NEW;
  END IF;

  -- DELETE: velitel končí, členové se vrací mezi nezařazené, čekající položky padají.
  FOR v_vel IN SELECT public._velitele_tridy(OLD.class_name) LOOP
    PERFORM public._odvolat_pri_odchodu(v_vel, OLD.class_name, 'Třída byla smazána');
  END LOOP;
  UPDATE public.profiles
  SET user_class = NULL, nezarazen_od = now()
  WHERE lower(trim(user_class)) = lower(trim(OLD.class_name));
  UPDATE public.tridni_prirazeni
  SET stav = 'zruseno', rozhodnuto = now()
  WHERE stav = 'ceka' AND lower(trim(class_name)) = lower(trim(OLD.class_name));
  DELETE FROM public.tridni_zastupce
  WHERE lower(trim(class_name)) = lower(trim(OLD.class_name));
  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION public.trida_zmena_nazvu_nebo_smazani() FROM PUBLIC, anon, authenticated;

-- Stávající velitelé bez třídy (vznikli dřívějším přeřazením) se vrací mezi studenty.
UPDATE public.profiles SET role = 'student'
WHERE role = 'velitel_tridy' AND user_class IS NULL;

COMMIT;

-- ─── Ověření (spusťte zvlášť, má vrátit true, true, 3) ───────────────────────
-- SELECT to_regclass('public.studijni_postup') IS NOT NULL,
--        pg_get_constraintdef(oid) LIKE '%jidelnicek%'
--   FROM pg_constraint WHERE conname = 'content_blocks_kind_check';
-- SELECT count(*) FROM pg_policies WHERE tablename = 'studijni_postup';
