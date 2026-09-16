-- ═════════════════════════════════════════════════════════════════════════════
-- 028 — Náprava schématu public.class_boards
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editor. Je idempotentní.
--
-- NÁLEZ
--   Tabulka v projektu pochází z dřívější verze aplikace a od té doby se
--   rozešla s tím, co aplikace zapisuje. Rozdíly:
--
--     sloupec v databázi        co posílá aplikace
--     ───────────────────────   ─────────────────────────
--     announcements             info_text
--     schedule_image_url        schedule_url
--     (chybí)                   schedule_storage_path
--     (chybí)                   course_start_date, course_end_date
--     (chybí)                   updated_by
--     id UUID                   id TEXT (např. 'class-1758…-x7a2')
--
--   Každé uložení nástěnky proto skončilo chybou „column … does not exist"
--   (u id navíc „invalid input syntax for type uuid"). Aplikace to uživateli
--   hlásí — „změna je zatím jen v tomto zařízení" — ale prakticky to znamená,
--   že se rozvrh, ústrojová kázeň ani služby nikdy nedostaly na server a nikdo
--   další je neviděl. Tabulka je dodnes prázdná.
--
--   Čtení dopadalo stejně: fetchClassBoards() mapuje row.info_text a
--   row.schedule_url, takže i kdyby v tabulce řádky byly, přišly by bez textu
--   hlášení a bez rozvrhu.
--
-- ŘEŠENÍ
--   Srovnat tabulku s aplikací. Sloupce, které nesou data pod jiným názvem, se
--   PŘEJMENUJÍ (obsah zůstává), chybějící se doplní. Skript nic nemaže kromě
--   sloupce linked_materials, a i ten jen tehdy, když je prokazatelně prázdný.
--
--   RLS politiky se nemění — ty jsou v pořádku z migrací 013 a 019 a odkazují
--   na class_name, který zůstává.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─── 1. Přejmenování sloupců, které nesou obsah pod jiným názvem ─────────────
--
-- Podmínka na obou stranách: přejmenuje se jen tehdy, když starý sloupec je
-- a nový ještě není. Na čisté instalaci (class_boards.sql) neudělá skript nic.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='class_boards' AND column_name='announcements')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_schema='public' AND table_name='class_boards' AND column_name='info_text')
  THEN
    ALTER TABLE public.class_boards RENAME COLUMN announcements TO info_text;
    RAISE NOTICE 'class_boards: announcements → info_text';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='class_boards' AND column_name='schedule_image_url')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_schema='public' AND table_name='class_boards' AND column_name='schedule_url')
  THEN
    ALTER TABLE public.class_boards RENAME COLUMN schedule_image_url TO schedule_url;
    RAISE NOTICE 'class_boards: schedule_image_url → schedule_url';
  END IF;
END $$;

-- ─── 2. Chybějící sloupce ────────────────────────────────────────────────────

ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS info_text TEXT NOT NULL DEFAULT '';
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS schedule_url TEXT;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS schedule_storage_path TEXT;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS course_start_date DATE;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS course_end_date DATE;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS duty_roster JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS uniform_guidance JSONB;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- ─── 3. Typ primárního klíče ─────────────────────────────────────────────────
--
-- Aplikace si id generuje sama ('class-<časové razítko>-<náhoda>'), aby šlo
-- o tomtéž záznamu mluvit i offline, než se dostane na server. Do UUID se
-- takový klíč nevejde. Převod na TEXT existující hodnoty zachová.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='class_boards'
               AND column_name='id' AND data_type='uuid')
  THEN
    ALTER TABLE public.class_boards ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE public.class_boards ALTER COLUMN id TYPE TEXT USING id::text;
    RAISE NOTICE 'class_boards: id UUID → TEXT';
  END IF;
END $$;

-- ─── 4. Sloupec linked_materials ─────────────────────────────────────────────
--
-- Ručně vkládané odkazy na materiály nahradily štítky souborů (migrace 027):
-- soubor se ke třídě přiřadí ve správci souborů a na nástěnce se objeví sám.
-- Sloupec proto nikdo nezapisuje. Zahodí se jen tehdy, když v něm opravdu nic
-- není — jinak zůstane i s daty a s upozorněním v logu.

DO $$
DECLARE
  obsazenych INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='class_boards' AND column_name='linked_materials')
  THEN
    EXECUTE 'SELECT count(*) FROM public.class_boards
             WHERE linked_materials IS NOT NULL AND linked_materials <> ''[]''::jsonb'
      INTO obsazenych;

    IF obsazenych = 0 THEN
      ALTER TABLE public.class_boards DROP COLUMN linked_materials;
      RAISE NOTICE 'class_boards: linked_materials zahozen (byl prázdný)';
    ELSE
      RAISE NOTICE 'class_boards: linked_materials PONECHÁN — má obsah u % řádků, přeneste je do štítků souborů a sloupec zahoďte ručně', obsazenych;
    END IF;
  END IF;
END $$;

-- ─── 5. Indexy podle class_boards.sql ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_class_boards_class_name ON public.class_boards(class_name);
CREATE INDEX IF NOT EXISTS idx_class_boards_updated_at ON public.class_boards(updated_at DESC);

-- ─── Ověření ─────────────────────────────────────────────────────────────────
--
-- 1. Sloupce musí odpovídat tomu, co posílá saveClassBoard() v classBoardService.ts:
--    id (text), class_name, course_start_date, course_end_date, schedule_url,
--    schedule_storage_path, info_text, duty_roster, uniform_guidance, sections,
--    updated_at, created_at, updated_by.
--    Sloupec linked_materials tu už být nemá, created_by může zůstat (nepoužívá se).

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='class_boards'
ORDER BY ordinal_position;

-- 2. Politiky zůstávají čtyři (SELECT + tři zápisové s can_manage_class / is_staff):

SELECT policyname, cmd FROM pg_policies
WHERE schemaname='public' AND tablename='class_boards'
ORDER BY cmd;

-- 3. Zkouška nanečisto. Jako role postgres RLS neplatí, takže tohle ověřuje
--    JEN tvar tabulky — že zápis projde i z aplikace, ukáže až uložení třídy
--    přihlášeným lektorem. Řádek se hned maže, v tabulce po něm nic nezůstane.

DO $$
BEGIN
  INSERT INTO public.class_boards (id, class_name, info_text, updated_by)
  VALUES ('class-test-028', 'ZKOUŠKA 028', 'zkušební zápis migrace 028', 'migrace 028');
  DELETE FROM public.class_boards WHERE id = 'class-test-028';
  RAISE NOTICE 'class_boards: zkušební zápis i smazání proběhly, tvar tabulky sedí';
END $$;
