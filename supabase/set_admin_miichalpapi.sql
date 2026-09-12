-- Skript pro nastavení administrátorských práv pro účet miichalpapi
-- Spusťte v Supabase Dashboard -> SQL Editor

-- 1. Zajištění záznamu v public.profiles a nastavení role 'admin'
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'Michal Papi'), 
  'admin'
FROM auth.users
WHERE email ILIKE '%miichalpapi%'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

-- 2. Pojistka pro případ, že řádek již existoval se starou rolí
UPDATE public.profiles
SET role = 'admin'
WHERE email ILIKE '%miichalpapi%';

-- 3. Ověření stavu
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE email ILIKE '%miichalpapi%';
