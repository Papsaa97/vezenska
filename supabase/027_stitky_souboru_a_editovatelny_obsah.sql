-- ═════════════════════════════════════════════════════════════════════════════
-- 027 — Štítky souborů a editovatelný obsah záložek
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editor. Je idempotentní.
--
-- Přináší dvě nové tabulky. Obě mají stejný účel: co dnes leží natvrdo ve
-- zdrojovém kódu nebo v názvu složky ve Storage, má jít změnit z aplikace,
-- aby Akademie nemusela na každou úpravu obsahu shánět vývojáře.
--
-- 1. public.material_tags — štítky u souborů
--
--    Dosud o zařazení souboru rozhodovala složka v bucketu 'studijni-materialy'
--    ('pravo/', 'penologie/', …). Soubor tedy mohl patřit právě k jednomu
--    předmětu a ke třídě vůbec. Štítky to obracejí: cesta ve Storage zůstává
--    jen adresou, zařazení nese tenhle řádek a může jich být víc najednou.
--
--    Klíčem je celá cesta v bucketu (např. 'materialy/eskorty__1737500000.pdf'),
--    protože přesně tou se soubor stahuje i maže. Řádek vzniká při nahrání
--    a dá se kdykoli přepsat — štítky jdou tedy doplnit i zpětně.
--
--    class_ids ZÁMĚRNĚ nemá cizí klíč na public.class_boards. Nástěnky tříd
--    fungují i v režimu bez serveru (výchozí sada v localStorage, viz
--    classBoardService.ts), takže třída, na kterou se štítek odkazuje, nemusí
--    mít v databázi řádek. Cizí klíč by v takovém případě označení znemožnil.
--    Osiřelý odkaz nevadí: aplikace zobrazuje jen štítky tříd, které opravdu
--    existují.
--
-- 2. public.content_blocks — editovatelné bloky obsahu
--
--    Předměty (subjectsInfo.ts), poznávačky (questionsData.ts) i modelové
--    situace (scenariosData.ts) jsou v repozitáři. Tahle tabulka je nepřepisuje,
--    leží nad nimi jako PŘEKRYV:
--
--      • řádek se stejným id jako výchozí položka   → nahradí její obsah
--      • řádek s novým id                            → přidá položku navíc
--      • řádek s is_deleted = true                   → schová výchozí položku
--      • řádek s is_hidden = true                    → schová položku studentům,
--                                                      lektor ji dál vidí
--
--    Výchozí data z repozitáře tím zůstávají nedotčená a kdykoli se dá vrátit
--    k nim (smazáním řádku překryvu). Payload je JSONB, protože každý druh
--    obsahu má jiný tvar; validitu hlídá aplikace při zápisu i při čtení.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─── 1. Štítky souborů ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.material_tags (
  storage_path TEXT PRIMARY KEY,
  display_name TEXT,
  subjects     TEXT[] NOT NULL DEFAULT '{}',
  class_ids    TEXT[] NOT NULL DEFAULT '{}',
  note         TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by   TEXT
);

-- Dotazy jdou vždycky přes „obsahuje tenhle štítek?" (operátor @>), na to je
-- GIN. Bez indexu by se každý seznam souborů u předmětu nebo třídy četl celý.
CREATE INDEX IF NOT EXISTS idx_material_tags_subjects
  ON public.material_tags USING GIN (subjects);
CREATE INDEX IF NOT EXISTS idx_material_tags_class_ids
  ON public.material_tags USING GIN (class_ids);

ALTER TABLE public.material_tags ENABLE ROW LEVEL SECURITY;

-- Čtení: každý přihlášený. Samotné soubory jsou v bucketu, který je veřejně
-- čitelný (migrace 012), takže štítky nic navíc neprozrazují.
DROP POLICY IF EXISTS "Čtení štítků souborů pro přihlášené" ON public.material_tags;
CREATE POLICY "Čtení štítků souborů pro přihlášené"
  ON public.material_tags FOR SELECT TO authenticated
  USING (true);

-- Zápis: lektor a správce, tedy stejný okruh, který smí soubory mazat.
DROP POLICY IF EXISTS "Vkládat štítky smí jen lektor a správce" ON public.material_tags;
CREATE POLICY "Vkládat štítky smí jen lektor a správce"
  ON public.material_tags FOR INSERT TO authenticated
  WITH CHECK ((select public.is_staff()));

DROP POLICY IF EXISTS "Upravovat štítky smí jen lektor a správce" ON public.material_tags;
CREATE POLICY "Upravovat štítky smí jen lektor a správce"
  ON public.material_tags FOR UPDATE TO authenticated
  USING ((select public.is_staff()))
  WITH CHECK ((select public.is_staff()));

DROP POLICY IF EXISTS "Mazat štítky smí jen lektor a správce" ON public.material_tags;
CREATE POLICY "Mazat štítky smí jen lektor a správce"
  ON public.material_tags FOR DELETE TO authenticated
  USING ((select public.is_staff()));

-- ─── 2. Editovatelné bloky obsahu ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.content_blocks (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_hidden   BOOLEAN NOT NULL DEFAULT false,
  is_deleted  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  TEXT
);

-- Druhy obsahu jsou omezené výčtem, aby se do tabulky nedostal překlep v `kind`
-- a s ním blok, který žádná obrazovka nikdy nepřečte. Nový druh = nová migrace,
-- která omezení rozšíří.
ALTER TABLE public.content_blocks DROP CONSTRAINT IF EXISTS content_blocks_kind_check;
ALTER TABLE public.content_blocks ADD CONSTRAINT content_blocks_kind_check
  CHECK (kind IN ('subject', 'matching_category', 'scenario'));

CREATE INDEX IF NOT EXISTS idx_content_blocks_kind
  ON public.content_blocks (kind, sort_order);

ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- Čtení: každý přihlášený. Skryté bloky (is_hidden) neodfiltrovává politika,
-- ale aplikace — lektor je vidět musí, aby je mohl vrátit zpátky.
DROP POLICY IF EXISTS "Čtení bloků obsahu pro přihlášené" ON public.content_blocks;
CREATE POLICY "Čtení bloků obsahu pro přihlášené"
  ON public.content_blocks FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Vkládat bloky obsahu smí jen lektor a správce" ON public.content_blocks;
CREATE POLICY "Vkládat bloky obsahu smí jen lektor a správce"
  ON public.content_blocks FOR INSERT TO authenticated
  WITH CHECK ((select public.is_staff()));

DROP POLICY IF EXISTS "Upravovat bloky obsahu smí jen lektor a správce" ON public.content_blocks;
CREATE POLICY "Upravovat bloky obsahu smí jen lektor a správce"
  ON public.content_blocks FOR UPDATE TO authenticated
  USING ((select public.is_staff()))
  WITH CHECK ((select public.is_staff()));

DROP POLICY IF EXISTS "Mazat bloky obsahu smí jen lektor a správce" ON public.content_blocks;
CREATE POLICY "Mazat bloky obsahu smí jen lektor a správce"
  ON public.content_blocks FOR DELETE TO authenticated
  USING ((select public.is_staff()));

-- ─── 3. Nová složka pro nahrávané soubory ────────────────────────────────────
--
-- Nové soubory jdou do 'materialy/', protože o zařazení už nerozhoduje složka.
-- Bucket ani jeho politiky se nemění (migrace 012 je psaná na celý bucket),
-- takže tady není co spouštět — je to poznámka pro čtenáře, který by hledal,
-- kde se složka zakládá. Supabase Storage složky nezakládá, vzniknou prvním
-- nahraným souborem.

-- ─── Ověření ─────────────────────────────────────────────────────────────────
--
-- 1. Obě tabulky existují a mají zapnuté RLS (rowsecurity musí být true):

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('material_tags', 'content_blocks')
ORDER BY tablename;

-- 2. Nad každou tabulkou musí být právě čtyři politiky (SELECT + tři zápisové):

SELECT tablename, count(*) AS politik
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('material_tags', 'content_blocks')
GROUP BY tablename
ORDER BY tablename;

-- 3. Po prvním použití z aplikace tady bude vidět, co je označené a čím:

SELECT storage_path, subjects, class_ids, updated_at
FROM public.material_tags
ORDER BY updated_at DESC
LIMIT 20;

SELECT kind, count(*) FILTER (WHERE NOT is_deleted) AS upraveno,
       count(*) FILTER (WHERE is_deleted) AS skryto_vychozich
FROM public.content_blocks
GROUP BY kind
ORDER BY kind;
