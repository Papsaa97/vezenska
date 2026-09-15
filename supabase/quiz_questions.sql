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

-- Role se ověřuje přes public.is_staff() z profiles.sql, ne přes
-- "EXISTS (SELECT ... FROM public.profiles ...)" uvnitř politiky.
--
-- Inline dotaz tu dřív byl a podléhal RLS nad profiles: jakákoli chyba
-- v politikách profiles (třeba rekurzivní politika, viz migrace 017) shodila
-- i úpravy otázek. is_staff() je SECURITY DEFINER, RLS obchází a je na stavu
-- politik nad profiles nezávislá.

-- Zapnutí Row Level Security (RLS)
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- 1. Politika pro čtení otázek
--
-- Banku čte každý PŘIHLÁŠENÝ uživatel celou, včetně sloupce correct_index. Zní
-- to velkoryse, ale utažení by nic neutajilo: všech 377 výchozích otázek i se
-- správnými odpověďmi je součástí veřejného klientského bundlu, protože App.tsx
-- importuje academyQuestions. Viz README, sekce „Co zatím utažené není".
--
-- Klauzule TO authenticated tu ale být MUSÍ. Bez ní politika platí pro PUBLIC,
-- tedy i pro roli anon, a banku by si stáhl kdokoli bez přihlášení.
--
-- Dřív tu stála politika "Povolit čtení otázek pro všechny" bez klauzule TO,
-- zatímco nasazená databáze má quiz_questions_select omezenou na authenticated.
-- Repozitář se tím rozcházel s produkcí a čistá instalace by vyšla VOLNĚJŠÍ než
-- ostrý provoz. Starý název se proto shazuje níže.
DROP POLICY IF EXISTS "Povolit čtení otázek pro všechny" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_select" ON public.quiz_questions;
CREATE POLICY "quiz_questions_select"
  ON public.quiz_questions
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Politika pro vkládání nových otázek (pouze pro přihlášené lektory a administrátory)
DROP POLICY IF EXISTS "Povolit vkládání pro přihlášené uživatele" ON public.quiz_questions;
DROP POLICY IF EXISTS "Povolit vkládání pro lektory a administrátory" ON public.quiz_questions;
CREATE POLICY "Povolit vkládání pro lektory a administrátory"
  ON public.quiz_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_staff()
  );

-- 3. Politika pro úpravu otázek (pouze pro přihlášené lektory a administrátory)
DROP POLICY IF EXISTS "Povolit úpravy pro přihlášené uživatele" ON public.quiz_questions;
DROP POLICY IF EXISTS "Povolit úpravy pro lektory a administrátory" ON public.quiz_questions;
CREATE POLICY "Povolit úpravy pro lektory a administrátory"
  ON public.quiz_questions
  FOR UPDATE
  TO authenticated
  USING (
    public.is_staff()
  )
  WITH CHECK (
    public.is_staff()
  );

-- 4. Politika pro mazání otázek (pouze pro přihlášené lektory a administrátory)
DROP POLICY IF EXISTS "Povolit mazání pro přihlášené uživatele" ON public.quiz_questions;
DROP POLICY IF EXISTS "Povolit mazání pro lektory a administrátory" ON public.quiz_questions;
CREATE POLICY "Povolit mazání pro lektory a administrátory"
  ON public.quiz_questions
  FOR DELETE
  TO authenticated
  USING (
    public.is_staff()
  );
