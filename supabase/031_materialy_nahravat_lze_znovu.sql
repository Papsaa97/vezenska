-- ============================================================================
-- 031  Studijní materiály jde znovu nahrávat (náprava kolize migrace 018)
-- ============================================================================
--
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ TOHLE JE OPRAVA ROZBITÉ FUNKCE V PRODUKCI, NE ZPEVNĚNÍ BEZPEČNOSTI.     │
-- │                                                                         │
-- │ Nahrát, přepsat ani smazat studijní materiál nemůže z prohlížeče NIKDO  │
-- │ — ani lektor, ani správce, ani velitel třídy. Čtení funguje, takže se   │
-- │ závada v aplikaci projeví až ve chvíli, kdy chce někdo soubor přidat.   │
-- └─────────────────────────────────────────────────────────────────────────┘
--
-- CO SE STALO
--
-- 012_materials_storage.sql založila nad storage.objects tři politiky pro
-- bucket 'studijni-materialy', které volají public.get_role(auth.uid()) PŘÍMO
-- v podmínce:
--
--   INSERT  "Nahravat studijni materialy smi lektor, spravce a velitel"
--   UPDATE  "Aktualizovat studijni materialy smi lektor, spravce a velitel"
--   DELETE  "Mazat studijni materialy smi lektor a spravce"
--
-- 018_get_role_neni_volatelna_z_klienta.sql pak rolím anon a authenticated
-- odebrala EXECUTE na public.get_role(uuid). To je samo správné — parametr
-- uuid dovoloval zjišťovat roli cizího účtu. Jenže:
--
--   VÝRAZY RLS POLITIK SE VYHODNOCUJÍ PRÁVY VOLAJÍCÍ ROLE, NE VLASTNÍKA
--   TABULKY.
--
-- Klient jde přes PostgREST/Storage pod rolí authenticated, takže od migrace
-- 018 ty tři politiky vyhodnotit nelze a operace končí chybou
-- 42501 "permission denied for function get_role".
--
-- Politiky v public/profiles kolizi nemají, protože 018 je zároveň přepsala
-- na obálku my_role(). Na schéma storage se ale nedostala — a nemohla si toho
-- všimnout ani její vlastní ověřovací dotaz (ř. 93–96), protože filtruje
-- schemaname = 'public'.
--
-- REPRODUKCE PŘED OPRAVOU (skutečné uuid správce, vše v transakci s ROLLBACK):
--
--   BEGIN;
--   SELECT set_config('request.jwt.claims',
--                     '{"sub":"<uuid správce>","role":"authenticated"}', true);
--   SET LOCAL ROLE authenticated;
--   INSERT INTO storage.objects (bucket_id, name, owner)
--   VALUES ('studijni-materialy', 'zkouska.txt', '<uuid správce>');
--   ROLLBACK;
--
--   → ERROR: 42501: permission denied for function get_role
--
-- POZOR NA SLUČOVÁNÍ POLITIK: nad INSERT a DELETE leží ještě starší politiky
-- ("Lektoři a admini mohou nahrávat" / "mohou mazat"), které roli zjišťují
-- přes EXISTS nad profiles a fungují. Nepomůže to: permisivní politiky se
-- slučují přes OR, ale chyba vyhozená při vyhodnocení jedné z nich shodí celý
-- příkaz — OR nezkratuje. UPDATE navíc žádnou náhradní politiku nemá.
--
-- ZASAŽENÉ CESTY V APLIKACI
--   src/utils/materials.ts        uploadMaterial(), deleteMaterial()
--   src/utils/classBoardService.ts uploadScheduleImage()  (upsert: true → i UPDATE)
--
-- CO TENHLE SKRIPT DĚLÁ
-- Nahrazuje přímé volání get_role(auth.uid()) obálkami, které authenticated
-- volat SMÍ a které mají stejný výsledek:
--
--   my_role()   bezparametrová, vrací roli VOLAJÍCÍHO (ne cizího účtu)
--   is_staff()  lektor nebo admin
--
-- Obě jsou SECURITY DEFINER s vlastníkem postgres, takže get_role() uvnitř
-- nich zavolat lze. Oprávnění se tím NEMĚNÍ — jen se přestane volat funkce,
-- na kterou klient nemá právo. Volání je navíc obalené do (select …), takže
-- se vyhodnotí jako InitPlan jednou za příkaz, ne na každý řádek (tentýž
-- vzor jako 019).
--
-- OVĚŘENO PŘED ZAPSÁNÍM (v transakci s ROLLBACK, na produkčních datech):
--   správce  INSERT projde (1 řádek)
--   student  INSERT odmítnut — "new row violates row-level security policy",
--            tedy politikou, ne chybou oprávnění na funkci
--
-- Spouštět po: 012_materials_storage.sql a 018_get_role_neni_volatelna_z_klienta.sql.
-- Skript je idempotentní.
-- ============================================================================

-- ─── 1. Nahrávání: lektor, správce, velitel třídy ───────────────────────────

DROP POLICY IF EXISTS "Nahravat studijni materialy smi lektor, spravce a velitel"
  ON storage.objects;

CREATE POLICY "Nahravat studijni materialy smi lektor, spravce a velitel"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'studijni-materialy'
    AND (select public.my_role()) = ANY (ARRAY['lektor', 'admin', 'velitel_tridy'])
  );

-- ─── 2. Přepsání souboru: lektor, správce, velitel třídy ────────────────────
--
-- Tuhle cestu používá uploadScheduleImage() s upsert: true — bez UPDATE
-- politiky se nahrání rozvrhu pod stejným názvem neprovede.

DROP POLICY IF EXISTS "Aktualizovat studijni materialy smi lektor, spravce a velitel"
  ON storage.objects;

CREATE POLICY "Aktualizovat studijni materialy smi lektor, spravce a velitel"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'studijni-materialy'
    AND (select public.my_role()) = ANY (ARRAY['lektor', 'admin', 'velitel_tridy'])
  )
  WITH CHECK (
    bucket_id = 'studijni-materialy'
    AND (select public.my_role()) = ANY (ARRAY['lektor', 'admin', 'velitel_tridy'])
  );

-- ─── 3. Mazání: jen lektor a správce ────────────────────────────────────────
--
-- Velitel třídy tu záměrně NENÍ — odpovídá to původnímu znění z 012.

DROP POLICY IF EXISTS "Mazat studijni materialy smi lektor a spravce"
  ON storage.objects;

CREATE POLICY "Mazat studijni materialy smi lektor a spravce"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'studijni-materialy'
    AND (select public.is_staff())
  );

-- ─── 4. Kontrola ────────────────────────────────────────────────────────────
--
-- Žádná politika nad storage.objects už nesmí volat get_role přímo:
--
--   SELECT policyname, cmd
--   FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects'
--     AND coalesce(qual, '') || coalesce(with_check, '') LIKE '%get_role%';
--
--   → musí vrátit 0 řádků
--
-- Zkouška nahrání pod správcem (v transakci s ROLLBACK) musí projít, pod
-- studentem musí skončit na "violates row-level security policy" — viz
-- reprodukce v záhlaví.
--
-- ─── 5. Co tenhle skript ZÁMĚRNĚ neřeší ─────────────────────────────────────
--
-- Nad bucketem 'studijni-materialy' leží i starší, překrývající se politiky
-- ("Lektoři a admini mohou nahrávat", "Lektoři a admini mohou mazat") a dvojí
-- politiky čtení, z nichž jedna míří na roli public. Souvisí to s otázkou,
-- jestli mají být interní materiály VS ČR čitelné bez přihlášení — to je
-- rozhodnutí o zveřejnění, ne technická náprava, a patří do vlastní migrace.
