-- Migrace 014: Odstranění zbylých povolujících politik, které rušily účinek 013
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)
--
-- PROČ: 013_harden_rls.sql shazuje staré politiky podle PŘESNÝCH názvů, které
-- očekává z dřívějších SQL souborů — všechny české. Na instalaci, kde politiky
-- vznikly pod anglickými názvy (profiles_select_authenticated, "Authenticated
-- users can read feedback" a podobně), tyhle názvy v seznamu DROP nejsou, takže
-- staré politiky přežily.
--
-- To samo o sobě není nepořádek, ale chyba v zabezpečení: PERMISSIVE politiky se
-- v Postgresu slučují přes OR. Jediná politika s USING (true) proto zneplatní
-- všechna utažení, která vedle ní 013 vytvořilo. Utažení tak vypadá provedené
-- (funkce existují, nové politiky existují), ale neúčinkuje.
--
-- Změřený dopad před spuštěním: kterýkoli přihlášený uživatel mohl číst profily
-- všech ostatních, číst veškerou zpětnou vazbu a libovolnou zpětnou vazbu přepsat.

-- 1. Konkrétní známé názvy z původních SQL souborů
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Authenticated users can update feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can insert feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Authenticated users can view class boards" ON public.class_boards;

-- 2. Obecný úklid pro profiles a user_feedback bez ohledu na názvy.
--    Na těchto dvou tabulkách nemá zůstat ŽÁDNÁ povolující politika s podmínkou
--    true — každý přístup je tu vázaný na vlastnictví řádku nebo na roli.
--
--    class_boards a global_announcements se schválně nezametají: tam je čtení
--    pro všechny přihlášené záměrné (viz README) a politika s true je správně.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'user_feedback')
      AND permissive = 'PERMISSIVE'
      AND (qual = 'true' OR with_check = 'true')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    RAISE NOTICE 'Odstraněna povolující politika %.%', r.tablename, r.policyname;
  END LOOP;
END $$;

-- 3. Ověření: tenhle dotaz smí vrátit už jen class_boards a global_announcements
--    (čtení pro přihlášené) a quiz_questions (záměrně veřejné, viz README).
SELECT tablename, cmd, policyname, coalesce(qual, with_check) AS podminka
FROM pg_policies
WHERE schemaname = 'public' AND (qual = 'true' OR with_check = 'true')
ORDER BY tablename, cmd, policyname;
