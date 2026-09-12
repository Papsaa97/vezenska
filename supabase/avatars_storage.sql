-- Storage bucket "avatars" pro profilové fotografie uživatelů
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)
--
-- Konvence cesty souboru: "<user_id>/avatar-<timestamp>.<ext>"
-- Díky tomu lze v RLS politikách ověřit, že uživatel smí nahrávat/mazat
-- pouze soubory ve své vlastní složce pojmenované podle auth.uid().

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 1. Čtení: avatary jsou veřejně dostupné (zobrazují se v hlavičce, profilu, žebříčcích)
DROP POLICY IF EXISTS "Avatary jsou veřejně čitelné" ON storage.objects;
CREATE POLICY "Avatary jsou veřejně čitelné"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- 2. Nahrávání: uživatel smí nahrávat pouze do vlastní složky <user_id>/...
DROP POLICY IF EXISTS "Uživatel smí nahrát vlastní avatar" ON storage.objects;
CREATE POLICY "Uživatel smí nahrát vlastní avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Aktualizace: uživatel smí přepsat pouze soubory ve vlastní složce
DROP POLICY IF EXISTS "Uživatel smí aktualizovat vlastní avatar" ON storage.objects;
CREATE POLICY "Uživatel smí aktualizovat vlastní avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Mazání: uživatel smí mazat pouze soubory ve vlastní složce
DROP POLICY IF EXISTS "Uživatel smí smazat vlastní avatar" ON storage.objects;
CREATE POLICY "Uživatel smí smazat vlastní avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
