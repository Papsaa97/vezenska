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

-- Unikátní index na textu otázky – slouží jako konfliktní klíč pro `upsert()` volané
-- z funkce Synchronizovat/Importovat výchozí otázky (admin), aby se otázka se stejným
-- textem při opakované synchronizaci AKTUALIZOVALA (např. nově promíchané pořadí
-- odpovědí), místo aby vznikaly duplicity nebo se změna ignorovala.
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_questions_question_unique ON public.quiz_questions(question);

-- Zapnutí Row Level Security (RLS)
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- 1. Politika pro čtení otázek (veřejné pro všechny studenty i nepřihlášené návštěvníky)
DROP POLICY IF EXISTS "Povolit čtení otázek pro všechny" ON public.quiz_questions;
CREATE POLICY "Povolit čtení otázek pro všechny"
  ON public.quiz_questions
  FOR SELECT
  USING (true);

-- 2. Politika pro vkládání nových otázek (pouze pro přihlášené lektory a administrátory)
DROP POLICY IF EXISTS "Povolit vkládání pro přihlášené uživatele" ON public.quiz_questions;
DROP POLICY IF EXISTS "Povolit vkládání pro lektory a administrátory" ON public.quiz_questions;
CREATE POLICY "Povolit vkládání pro lektory a administrátory"
  ON public.quiz_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('lektor', 'admin')
    )
  );

-- 3. Politika pro úpravu otázek (pouze pro přihlášené lektory a administrátory)
DROP POLICY IF EXISTS "Povolit úpravy pro přihlášené uživatele" ON public.quiz_questions;
DROP POLICY IF EXISTS "Povolit úpravy pro lektory a administrátory" ON public.quiz_questions;
CREATE POLICY "Povolit úpravy pro lektory a administrátory"
  ON public.quiz_questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('lektor', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('lektor', 'admin')
    )
  );

-- 4. Politika pro mazání otázek (pouze pro přihlášené lektory a administrátory)
DROP POLICY IF EXISTS "Povolit mazání pro přihlášené uživatele" ON public.quiz_questions;
DROP POLICY IF EXISTS "Povolit mazání pro lektory a administrátory" ON public.quiz_questions;
CREATE POLICY "Povolit mazání pro lektory a administrátory"
  ON public.quiz_questions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('lektor', 'admin')
    )
  );
