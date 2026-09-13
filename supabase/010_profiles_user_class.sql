-- Migrace 010: Sloupec public.profiles.user_class
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)
--
-- PROČ: src/context/AuthContext.tsx (fetchProfile) tento sloupec čte v OBOU
-- variantách dotazu — i v té "záložní bez avatar_url". Dokud sloupec neexistuje,
-- selžou oba dotazy na chybu "column profiles.user_class does not exist",
-- profileData zůstane null a efektivní rolí uživatele se stane hodnota
-- z localStorage. Tj. bez této migrace se autorizace rolí opírá o klientský
-- prohlížeč, nikoli o databázi.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_class TEXT;

-- Index pro dotazy typu "kdo je ve třídě ZOP A11" (správa uživatelů, nástěnka tříd)
CREATE INDEX IF NOT EXISTS idx_profiles_user_class ON public.profiles(user_class);

COMMENT ON COLUMN public.profiles.user_class IS
  'Zařazení uživatele do třídy ZOP (např. "ZOP A11"). U role velitel_tridy určuje, '
  'kterou třídu smí spravovat — viz RLS politiky nad public.class_boards.';
