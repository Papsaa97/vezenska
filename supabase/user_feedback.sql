-- Schéma tabulky public.user_feedback pro systém uživatelské zpětné vazby
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  screen_context TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pro rychlé řazení podle data a filtrování podle stavu
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON public.user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);

-- 1. Zapnutí Row Level Security (RLS)
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- 2. Politika pro vkládání zpětné vazby (povoleno pro všechny studenty i nepřihlášené)
DROP POLICY IF EXISTS "Povolit vkládání zpětné vazby pro přihlášené uživatele" ON public.user_feedback;
DROP POLICY IF EXISTS "Povolit vkládání zpětné vazby pro všechny" ON public.user_feedback;
CREATE POLICY "Povolit vkládání zpětné vazby pro všechny"
  ON public.user_feedback
  FOR INSERT
  WITH CHECK (true);

-- 3. Politika pro čtení zpětné vazby (pro přihlášené lektory a správce)
DROP POLICY IF EXISTS "Povolit čtení zpětné vazby pro přihlášené uživatele" ON public.user_feedback;
CREATE POLICY "Povolit čtení zpětné vazby pro přihlášené uživatele"
  ON public.user_feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Politika pro úpravu stavu zpětné vazby (pro přihlášené lektory a správce)
DROP POLICY IF EXISTS "Povolit úpravy zpětné vazby pro přihlášené uživatele" ON public.user_feedback;
CREATE POLICY "Povolit úpravy zpětné vazby pro přihlášené uživatele"
  ON public.user_feedback
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Politika pro mazání zpětné vazby (pro přihlášené lektory a správce)
DROP POLICY IF EXISTS "Povolit mazání zpětné vazby pro přihlášené uživatele" ON public.user_feedback;
CREATE POLICY "Povolit mazání zpětné vazby pro přihlášené uživatele"
  ON public.user_feedback
  FOR DELETE
  TO authenticated
  USING (true);
