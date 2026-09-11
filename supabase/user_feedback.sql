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

-- Zapnutí Row Level Security (RLS)
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Politika pro vkládání zpětné vazby (kterýkoliv přihlášený uživatel)
CREATE POLICY "Povolit vkládání zpětné vazby pro přihlášené uživatele"
  ON public.user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politika pro čtení zpětné vazby (pro přihlášené uživatele; UI omezuje zobrazení na lektory/správce)
CREATE POLICY "Povolit čtení zpětné vazby pro přihlášené uživatele"
  ON public.user_feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- Politika pro úpravu stavu zpětné vazby (pro přihlášené uživatele; UI omezuje akci na lektory/správce)
CREATE POLICY "Povolit úpravy zpětné vazby pro přihlášené uživatele"
  ON public.user_feedback
  FOR UPDATE
  TO authenticated
  USING (true);

-- Politika pro mazání zpětné vazby (pro přihlášené uživatele; UI omezuje akci na lektory/správce)
CREATE POLICY "Povolit mazání zpětné vazby pro přihlášené uživatele"
  ON public.user_feedback
  FOR DELETE
  TO authenticated
  USING (true);
