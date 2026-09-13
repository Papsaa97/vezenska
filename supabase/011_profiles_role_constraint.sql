-- Migrace 011: Doplnění role 'velitel_tridy' do omezení public.profiles.role
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)
--
-- PROČ: TypeScript (src/types/auth.ts) zná čtyři role, ale původní omezení
-- z profiles.sql povolovalo jen tři:
--     CHECK (role IN ('student', 'lektor', 'admin'))
-- Administrátorská konzole přitom 'velitel_tridy' v seznamu nabízí a politiky
-- nad public.class_boards jí přidělují práva. Výsledek: zápis role vždy skončil
-- na porušení omezení, takže roli velitele třídy nebylo možné nikomu nastavit
-- a celý model oprávnění nástěnky tříd stál na roli, kterou nikdo nemohl získat.

-- 1. Odstranění stávajícího omezení (najdeme ho podle definice, ne podle názvu —
--    v různých projektech se mohl vygenerovat jiný automatický název)
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', constraint_name);
    RAISE NOTICE 'Odstraněno omezení %', constraint_name;
  END LOOP;
END $$;

-- 2. Nové omezení se všemi čtyřmi rolemi, které zná aplikace
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'velitel_tridy', 'lektor', 'admin'));

-- 3. Ověření stavu
SELECT conname, pg_get_constraintdef(oid) AS definice
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass AND contype = 'c';
