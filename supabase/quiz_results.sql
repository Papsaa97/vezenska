-- Schéma tabulky public.quiz_results pro reálnou historii testů uživatele
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)
--
-- Nahrazuje dřívější ukládání historie testů pouze do localStorage prohlížeče.
-- Každý řádek reprezentuje jednu dokončenou relaci testu (QuizSessionRecord)
-- a je napevno svázán s uživatelem, který jej absolvoval.

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  accuracy INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER,
  attempts JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_in_limit INTEGER,
  correct_after_limit INTEGER,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexy pro rychlé dotazy na statistiky konkrétního uživatele
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON public.quiz_results(completed_at DESC);

-- Zapnutí Row Level Security (RLS)
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- 1. Čtení: uživatel vidí pouze své vlastní výsledky
DROP POLICY IF EXISTS "Povolit čtení vlastních výsledků" ON public.quiz_results;
CREATE POLICY "Povolit čtení vlastních výsledků"
  ON public.quiz_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Vkládání: uživatel smí zapisovat pouze výsledky pod svým vlastním user_id
DROP POLICY IF EXISTS "Povolit vkládání vlastních výsledků" ON public.quiz_results;
CREATE POLICY "Povolit vkládání vlastních výsledků"
  ON public.quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Mazání: uživatel smí mazat pouze své vlastní výsledky (např. reset historie)
DROP POLICY IF EXISTS "Povolit mazání vlastních výsledků" ON public.quiz_results;
CREATE POLICY "Povolit mazání vlastních výsledků"
  ON public.quiz_results
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
