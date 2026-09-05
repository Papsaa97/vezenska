-- Schéma tabulky public.quiz_questions pro Banku otázek
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Zajištění existence sloupců correct_index a explanation
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS correct_index INTEGER DEFAULT 0;
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS explanation TEXT;

-- Index pro rychlé filtrování podle předmětu a řazení podle data vytvoření
CREATE INDEX IF NOT EXISTS idx_quiz_questions_subject ON public.quiz_questions(subject);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_created_at ON public.quiz_questions(created_at DESC);

-- Zapnutí Row Level Security (RLS)
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Politika pro čtení otázek (dostupná pro všechny uživatele / lektory)
CREATE POLICY "Povolit čtení otázek pro všechny"
  ON public.quiz_questions
  FOR SELECT
  USING (true);

-- Politika pro vkládání nových otázek (pro přihlášené lektory a administrátory)
CREATE POLICY "Povolit vkládání pro přihlášené uživatele"
  ON public.quiz_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politika pro úpravu otázek (pro přihlášené lektory a administrátory)
CREATE POLICY "Povolit úpravy pro přihlášené uživatele"
  ON public.quiz_questions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Politika pro mazání otázek (pro přihlášené lektory a administrátory)
CREATE POLICY "Povolit mazání pro přihlášené uživatele"
  ON public.quiz_questions
  FOR DELETE
  TO authenticated
  USING (true);
