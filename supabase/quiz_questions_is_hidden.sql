-- Migrace: Přidání sloupce is_hidden, source a topic do tabulky public.quiz_questions
-- Spusťte v Supabase SQL Editoru

ALTER TABLE public.quiz_questions 
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.quiz_questions 
  ADD COLUMN IF NOT EXISTS source TEXT;

ALTER TABLE public.quiz_questions 
  ADD COLUMN IF NOT EXISTS topic TEXT;

-- Index pro rychlé filtrování skrytých/viditelných otázek
CREATE INDEX IF NOT EXISTS idx_quiz_questions_is_hidden 
  ON public.quiz_questions(is_hidden);
