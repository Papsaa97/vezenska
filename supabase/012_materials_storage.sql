-- Migrace 012: Storage bucket "studijni-materialy" a jeho RLS politiky
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)
--
-- PROČ: src/utils/classBoardService.ts (uploadScheduleImage) nahrává rozvrhy do
-- bucketu 'studijni-materialy/rozvrhy/', ale v repozitáři bylo SQL jen pro bucket
-- 'avatars'. Na čistě založeném projektu tedy nahrávání rozvrhů nemohlo fungovat,
-- a pokud byl bucket vytvořen ručně přes Dashboard, jeho politiky nebyly nikde
-- zdokumentované ani reprodukovatelné.
--
-- Bucket je veřejně čitelný, protože kód používá getPublicUrl() a rozvrh se
-- vykresluje jako <img src="...">. Zápis je omezen na lektory, správce a velitele
-- tříd. Vyžaduje pomocné funkce z 013_harden_rls.sql — spusťte 013 před 012,
-- nebo 012 spusťte znovu po 013.

INSERT INTO storage.buckets (id, name, public)
VALUES ('studijni-materialy', 'studijni-materialy', true)
ON CONFLICT (id) DO NOTHING;

-- 1. Čtení: materiály a rozvrhy jsou veřejně čitelné (zobrazují se jako obrázky a odkazy)
DROP POLICY IF EXISTS "Studijni materialy jsou verejne citelne" ON storage.objects;
CREATE POLICY "Studijni materialy jsou verejne citelne"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'studijni-materialy');

-- 2. Nahrávání: pouze lektor, správce nebo velitel třídy
DROP POLICY IF EXISTS "Nahravat studijni materialy smi lektor, spravce a velitel" ON storage.objects;
CREATE POLICY "Nahravat studijni materialy smi lektor, spravce a velitel"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'studijni-materialy'
    AND public.get_role(auth.uid()) IN ('lektor', 'admin', 'velitel_tridy')
  );

-- 3. Přepsání existujícího souboru (kód nahrává s upsert: true)
DROP POLICY IF EXISTS "Aktualizovat studijni materialy smi lektor, spravce a velitel" ON storage.objects;
CREATE POLICY "Aktualizovat studijni materialy smi lektor, spravce a velitel"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'studijni-materialy'
    AND public.get_role(auth.uid()) IN ('lektor', 'admin', 'velitel_tridy')
  )
  WITH CHECK (
    bucket_id = 'studijni-materialy'
    AND public.get_role(auth.uid()) IN ('lektor', 'admin', 'velitel_tridy')
  );

-- 4. Mazání: pouze lektor a správce
DROP POLICY IF EXISTS "Mazat studijni materialy smi lektor a spravce" ON storage.objects;
CREATE POLICY "Mazat studijni materialy smi lektor a spravce"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'studijni-materialy'
    AND public.get_role(auth.uid()) IN ('lektor', 'admin')
  );
