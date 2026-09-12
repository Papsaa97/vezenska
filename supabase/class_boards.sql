-- Schéma tabulky public.class_boards a public.global_announcements pro Informační tabuli tříd ZOP
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)

CREATE TABLE IF NOT EXISTS public.class_boards (
  id TEXT PRIMARY KEY,
  class_name TEXT NOT NULL,
  schedule_url TEXT,
  schedule_storage_path TEXT,
  info_text TEXT NOT NULL DEFAULT '',
  duty_roster JSONB DEFAULT '[]'::jsonb,
  uniform_guidance JSONB,
  linked_materials JSONB DEFAULT '[]'::jsonb,
  sections JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_by TEXT
);

-- Přidání nových sloupců, pokud tabulka již existuje
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS course_start_date DATE;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS course_end_date DATE;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS duty_roster JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS uniform_guidance JSONB;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS linked_materials JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.class_boards ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb;

-- Indexy pro rychlé řazení a vyhledávání
CREATE INDEX IF NOT EXISTS idx_class_boards_class_name ON public.class_boards(class_name);
CREATE INDEX IF NOT EXISTS idx_class_boards_updated_at ON public.class_boards(updated_at DESC);

-- Zapnutí Row Level Security (RLS)
ALTER TABLE public.class_boards ENABLE ROW LEVEL SECURITY;

-- Politiky pro public.class_boards
DROP POLICY IF EXISTS "Povolit čtení tříd pro všechny" ON public.class_boards;
CREATE POLICY "Povolit čtení tříd pro všechny"
  ON public.class_boards
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Povolit vkládání tříd pro lektory a administrátory" ON public.class_boards;
CREATE POLICY "Povolit vkládání tříd pro lektory a administrátory"
  ON public.class_boards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('lektor', 'admin', 'velitel_tridy')
    )
  );

DROP POLICY IF EXISTS "Povolit úpravy tříd pro lektory a administrátory" ON public.class_boards;
CREATE POLICY "Povolit úpravy tříd pro lektory a administrátory"
  ON public.class_boards
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('lektor', 'admin', 'velitel_tridy')
    )
  );

DROP POLICY IF EXISTS "Povolit mazání tříd pro lektory a administrátory" ON public.class_boards;
CREATE POLICY "Povolit mazání tříd pro lektory a administrátory"
  ON public.class_boards
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('lektor', 'admin')
    )
  );

-- ─── Celoškolní hlášení (Global Announcements) ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.global_announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  badge TEXT,
  date TEXT NOT NULL,
  author TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.global_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Povolit čtení hlášení pro všechny" ON public.global_announcements;
CREATE POLICY "Povolit čtení hlášení pro všechny"
  ON public.global_announcements
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Povolit zápis hlášení pro lektory a administrátory" ON public.global_announcements;
CREATE POLICY "Povolit zápis hlášení pro lektory a administrátory"
  ON public.global_announcements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('lektor', 'admin')
    )
  );
