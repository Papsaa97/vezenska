-- ============================================================================
-- 036  Studijní materiály přestávají být veřejné
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- Kbelík `studijni-materialy` měl `public = true` a nad `storage.objects` k němu
-- stála čtecí politika pro roli `public`, tedy i pro NEPŘIHLÁŠENÉHO:
--
--   "Studijni materialy jsou verejne citelne"  SELECT  USING (bucket_id = 'studijni-materialy')
--
-- Dvě cesty, obě bez účtu:
--   * veřejná URL `/storage/v1/object/public/studijni-materialy/<cesta>` stáhne
--     soubor komukoli, kdo cestu zná nebo uhodne;
--   * REST nad `storage.objects` s anonymním klíčem projde tou politikou, takže
--     si obsah kbelíku lze i VYPSAT a cesty tím nehádat.
--
-- Do kbelíku nahrává lektor, správce a velitel třídy studijní materiály a
-- rozvrhy tříd. Jsou to interní dokumenty Akademie, ne veřejná knihovna.
--
-- CO TENHLE SKRIPT DĚLÁ
--   1. Shazuje čtecí politiku pro roli `public`. Zůstává „Přihlášení mohou číst
--      materiály“ pro `authenticated`, takže uvnitř aplikace se nemění nic.
--   2. Přepíná kbelík na `public = false`, takže veřejná URL vrátí 400 a soubor
--      se dostane ven jedině přes `download()` nebo podepsanou URL — a obojí
--      projde RLS politikou výše, tedy jen s přihlášením.
--
-- AVATARY ZŮSTÁVAJÍ VEŘEJNÉ, A JE TO ZÁMĚR
-- Kbelík `avatars` se nechává `public = true`. Profilové fotky se zobrazují na
-- desítkách míst v rozhraní přes `getPublicUrl()` (`UserProfileModal.tsx:239`)
-- a převod na podepsané URL by znamenal asynchronní načítání v každé z nich.
-- Cena za to je, že podobizna uživatele je stažitelná pro toho, kdo zná její
-- URL; ta obsahuje UUID účtu, takže se nedá uhodnout, a výpis kbelíku zvenčí
-- možný není (čtecí politika pro `public` tu sice je, ale jde o obsah, který
-- si uživatel sám nahrál jako svou veřejnou tvář). Je to vědomé rozhodnutí,
-- ne opomenutí — viz README.md.
--
-- POŘADÍ NASAZENÍ
-- Tenhle skript spouštějte AŽ po nasazení aplikace, která umí podepsané URL
-- (`uploadScheduleImage()` v `src/utils/classBoardService.ts`). Starší verze
-- si po nahrání rozvrhu vyžádá veřejnou URL a ta by na privátním kbelíku
-- vrátila 400. Čtení materiálů a náhledy tím dotčené nejsou — ty už dnes jedou
-- přes `download()` (`FileViewerModal.tsx:87`).
--
-- Spouštět po: 012_materials_storage.sql a 031_materialy_nahravat_lze_znovu.sql.
-- Skript je idempotentní.
-- ============================================================================

-- ─── 1. Číst smí jen přihlášený ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Studijni materialy jsou verejne citelne" ON storage.objects;

-- Politika pro přihlášené existuje od 012; zakládá se tu znovu jen pro případ
-- čisté instalace, kde by jinak po shození té veřejné nezbyla žádná.
DROP POLICY IF EXISTS "Přihlášení mohou číst materiály" ON storage.objects;
CREATE POLICY "Přihlášení mohou číst materiály"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'studijni-materialy');

-- ─── 2. Kbelík přestává být veřejný ──────────────────────────────────────────

UPDATE storage.buckets
SET public = false
WHERE id = 'studijni-materialy' AND public IS DISTINCT FROM false;

-- ─── 3. Ověření ──────────────────────────────────────────────────────────────
--
-- (a) Kbelík a politiky:
--
--   SELECT id, public FROM storage.buckets ORDER BY id;
--     -- avatars = true (záměr), studijni-materialy = false
--
--   SELECT policyname, roles::text FROM pg_policies
--   WHERE schemaname='storage' AND tablename='objects' AND cmd='SELECT';
--     -- nad studijni-materialy smí zůstat jedině politika pro {authenticated}
--
-- (b) Nepřihlášený nesmí vidět ani řádek (uvnitř transakce, vždy ROLLBACK):
--
--   BEGIN;
--   SET LOCAL ROLE anon;
--   SELECT count(*) FROM storage.objects WHERE bucket_id = 'studijni-materialy';
--     -- musí vrátit 0
--   ROLLBACK;
--
-- (c) V aplikaci: přihlášený uživatel otevře Knihovnu materiálů, rozklikne PDF
--     i obrázek a stáhne je. Velitel třídy nahraje rozvrh a ten se zobrazí.
