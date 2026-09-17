-- Schéma tabulky public.profiles a bezpečnostních RLS politik pro Akademie VS ČR
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)

-- 1. Vytvoření tabulky public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'lektor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- 2. Zapnutí Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2b. Pomocné funkce pro RLS politiky.
--     KRITICKÉ: nikdy nezjišťuj roli uživatele přímo v USING/WITH CHECK politiky
--     nad public.profiles pomocí "EXISTS (SELECT ... FROM public.profiles ...)".
--     Taková politika se odkazuje sama na sebe (na tabulku, na které je definována)
--     a Postgres při jejím vyhodnocování skončí chybou
--     "infinite recursion detected in policy for relation profiles".
--     Místo toho čti roli přes SECURITY DEFINER funkci níže – ta běží s právy
--     vlastníka (v Supabase typicky role s BYPASSRLS), takže RLS na profiles
--     vůbec neaplikuje a k rekurzi nemůže dojít.
CREATE OR REPLACE FUNCTION public.get_role(uid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

REVOKE ALL ON FUNCTION public.get_role(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_role(UUID) TO authenticated;

-- COALESCE je tu podstatný, ne kosmetika. get_role() vrátí pro nepřihlášeného
-- NULL, takže `NULL = 'admin'` je NULL. V RLS politice to zákaz znamená, ale
-- v plpgsql se `IF NOT NULL THEN` chová jako nepravda — a přesně tak se dala
-- obejít strážní podmínka v admin_delete_user(). Viz migrace 015. Funkce jsou
-- tu rovnou v opravené podobě, aby opakované spuštění tohohle skriptu opravu
-- z 015 nevrátilo zpátky.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(public.get_role(auth.uid()) = 'admin', false);
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

/** True pro lektora i správce — tedy pro kohokoli, kdo spravuje obsah. */
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(public.get_role(auth.uid()) IN ('lektor', 'admin'), false);
$$;

REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

-- 3. RLS Politiky pro public.profiles
--
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ POZOR: POLITIKY V TOMHLE SOUBORU JSOU PŘEKONANÉ POZDĚJŠÍMI MIGRACEMI.   │
-- │                                                                         │
-- │ Tenhle soubor je ZAVÁDĚCÍ skript prvního kroku (viz supabase/README.md). │
-- │ Platný stav politik nad public.profiles určují migrace, které běží po    │
-- │ něm — u čtení konkrétně:                                                │
-- │                                                                         │
-- │   013_harden_rls.sql       ruší "Povolit čtení profilů pro přihlášené"   │
-- │                           a zavádí "Čtení vlastního profilu, správce     │
-- │                           čte všechny"                                   │
-- │   017_oprava_rekurze_politik.sql  tutéž politiku přepisuje kvůli 42P17   │
-- │   019_vykon_politik_a_indexu.sql  ji přepisuje na (select auth.uid())    │
-- │                                                                         │
-- │ NEČTI tedy z tohohle souboru, co v databázi platí — přečti si posledního │
-- │ pisatele politiky, nebo se zeptej databáze:                             │
-- │                                                                         │
-- │   SELECT policyname, cmd, qual, with_check FROM pg_policies             │
-- │   WHERE schemaname = 'public' AND tablename = 'profiles';               │
-- │                                                                         │
-- │ Chybějící poznámka tohohle druhu už jednou vedla k nesprávnému           │
-- │ bezpečnostnímu nálezu: audit z 9/2026 ohlásil USING (true) níže jako     │
-- │ živý stav, přestože ho 013 zrušila dva dny předtím.                      │
-- └─────────────────────────────────────────────────────────────────────────┘

-- Čtení: PŘEKONÁNO migracemi 013 → 017 → 019 (viz rámeček výše).
-- Ponecháno kvůli reprodukovatelnosti historie: kdo spouští skripty od začátku,
-- dostane tuhle politiku a hned nato ji 013 nahradí zúženou verzí.
DROP POLICY IF EXISTS "Povolit čtení profilů pro přihlášené" ON public.profiles;
CREATE POLICY "Povolit čtení profilů pro přihlášené"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Vkládání: Nový uživatel si smí vytvořit pouze svůj vlastní profil s rolí 'student'
DROP POLICY IF EXISTS "Povolit vytvoření vlastního profilu" ON public.profiles;
CREATE POLICY "Povolit vytvoření vlastního profilu"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND role = 'student'
  );

-- Úprava údajů: Uživatel může měnit své jméno, ale nesmí sám povýšit svou roli
DROP POLICY IF EXISTS "Povolit úpravu vlastního jména bez změny role" ON public.profiles;
CREATE POLICY "Povolit úpravu vlastního jména bez změny role"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = public.get_role(id)
  );

-- Změna rolí: Pouze administrátor může měnit libovolné profily včetně rolí
DROP POLICY IF EXISTS "Pouze administrátor může měnit role" ON public.profiles;
CREATE POLICY "Pouze administrátor může měnit role"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Trigger pro automatické vytvoření profilu při registraci nového uživatele
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
