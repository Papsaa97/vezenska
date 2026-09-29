-- ============================================================================
-- 043  Nový účet bez třídy; oznámení o nových událostech
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- 1. Nově registrovaný uživatel se rovnou ocitl ve třídě ZOP A11 (hlášení
--    z 29. 9. 2026 od správce i od Tomáše Větrovce). Příčinou nebyla
--    aplikace, ale výchozí hodnota sloupce na produkci:
--
--      profiles.user_class DEFAULT 'ZOP A11'
--
--    Žádná migrace v repozitáři ji nezakládá, vznikla ruční úpravou tabulky.
--    handle_new_user() vkládá profil bez třídy, takže ji doplnila databáze.
--    Povinný výběr třídy z 038 se tak novému účtu vůbec neukázal a student
--    viděl nástěnku cizí třídy.
--
--    Poznávací znamení takto zařazených účtů: mají třídu, a přitom i datum
--    „nezařazen od“ (to 038 vynuluje každému, koho do třídy opravdu zařadí).
--    Na produkci 29. 9. 2026 jde o jediný účet (Tomáš Větrovec).
--
-- 2. O nové celoškolní události ani o nové události na nástěnce třídy se nikdo
--    nedozvěděl, dokud nástěnku sám neotevřel (návrh z 29. 9. 2026).
--
-- CO TENHLE SKRIPT DĚLÁ
-- 1. Zruší výchozí hodnotu profiles.user_class — nový účet je bez třídy
--    a musí si ji vybrat (038).
-- 2. Účty zařazené jen výchozí hodnotou vrátí mezi nezařazené. Datum
--    „nezařazen od“ jim zůstává, takže v seznamu nezařazených nepředběhnou
--    ani nezaostanou za ostatními.
-- 3. Nové celoškolní oznámení (global_announcements) pošle oznámení do zvonku
--    všem uživatelům kromě autora.
-- 4. Nová položka typu „Událost“ na nástěnce třídy a nově nahraný rozvrh
--    pošlou oznámení členům té třídy kromě autora úpravy.
--
-- Úprava existujícího oznámení nebo události oznámení znovu neposílá.
-- Spouštět po 042. Idempotentní.
-- ============================================================================

BEGIN;

-- ─── 1. Nový účet je bez třídy ───────────────────────────────────────────────

ALTER TABLE public.profiles ALTER COLUMN user_class DROP DEFAULT;

-- ─── 2. Vrátit mezi nezařazené, koho zařadila jen výchozí hodnota ────────────

UPDATE public.profiles p
SET user_class = NULL
WHERE p.user_class IS NOT NULL
  AND p.nezarazen_od IS NOT NULL
  AND p.role = 'student'
  AND NOT EXISTS (
    SELECT 1 FROM public.tridni_prirazeni t WHERE t.user_id = p.id
  );

-- ─── 3. Celoškolní oznámení do zvonku všem ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.oznamit_celoskolni_udalost()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, sender_id, title, body)
  SELECT p.id,
         auth.uid(),
         left('Celoškolní oznámení: ' || coalesce(nullif(trim(NEW.title), ''), 'bez názvu'), 200),
         left(coalesce(NEW.content, ''), 500)
  FROM public.profiles p
  WHERE p.id IS DISTINCT FROM auth.uid();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.oznamit_celoskolni_udalost() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS oznamit_celoskolni_udalost ON public.global_announcements;
CREATE TRIGGER oznamit_celoskolni_udalost
  AFTER INSERT ON public.global_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.oznamit_celoskolni_udalost();

-- ─── 4. Nová událost a nový rozvrh na nástěnce třídy → členům třídy ──────────

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
      WHERE s->>'type' = 'event'
        AND NOT ((s->>'id') = ANY (v_old_ids))
    LOOP
      INSERT INTO public.user_notifications (user_id, sender_id, title, body)
      SELECT p.id,
             auth.uid(),
             left(NEW.class_name || ' – nová událost: '
                  || coalesce(nullif(trim(v_sekce->>'title'), ''), 'bez názvu'), 200),
             left(concat_ws(E'\n',
                    nullif(trim(v_sekce->>'date'), ''),
                    nullif(trim(v_sekce->>'content'), '')), 500)
      FROM public.profiles p
      WHERE lower(trim(p.user_class)) = lower(trim(NEW.class_name))
        AND p.id IS DISTINCT FROM auth.uid();
    END LOOP;
  END IF;

  IF NEW.schedule_url IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.schedule_url IS DISTINCT FROM OLD.schedule_url) THEN
    INSERT INTO public.user_notifications (user_id, sender_id, title, body)
    SELECT p.id,
           auth.uid(),
           left(NEW.class_name || ' – nový rozvrh hodin', 200),
           'Na nástěnce třídy je nahraný nový rozvrh.'
    FROM public.profiles p
    WHERE lower(trim(p.user_class)) = lower(trim(NEW.class_name))
      AND p.id IS DISTINCT FROM auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.oznamit_udalost_tridy() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS oznamit_udalost_tridy ON public.class_boards;
CREATE TRIGGER oznamit_udalost_tridy
  AFTER INSERT OR UPDATE OF sections, schedule_url ON public.class_boards
  FOR EACH ROW
  EXECUTE FUNCTION public.oznamit_udalost_tridy();

COMMIT;

-- ─── Ověření po spuštění ─────────────────────────────────────────────────────
--
-- SELECT column_default FROM information_schema.columns
--  WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_class';
--   → NULL
-- SELECT count(*) FROM public.profiles
--  WHERE user_class IS NOT NULL AND nezarazen_od IS NOT NULL AND role = 'student';
--   → 0
-- SELECT trigger_name FROM information_schema.triggers
--  WHERE trigger_name IN ('oznamit_celoskolni_udalost', 'oznamit_udalost_tridy');
--   → 3 řádky (druhý trigger je na INSERT i UPDATE)
