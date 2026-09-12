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

-- 3. RLS Politiky pro public.profiles

-- Čtení: Všichni přihlášení uživatelé mohou číst profily
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
    role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Změna rolí: Pouze administrátor může měnit libovolné profily včetně rolí
DROP POLICY IF EXISTS "Pouze administrátor může měnit role" ON public.profiles;
CREATE POLICY "Pouze administrátor může měnit role"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
        AND admin_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
        AND admin_profile.role = 'admin'
    )
  );

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
