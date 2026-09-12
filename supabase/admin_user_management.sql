-- RPC funkce a doplňkové RLS politiky pro administrátorskou konzoli správy uživatelů
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)
-- Vyžaduje již existující tabulky public.profiles a public.quiz_results.

-- 1. RPC funkce pro bezpečné smazání uživatelského účtu správcem.
--    Běží s právy SECURITY DEFINER, protože běžný přihlášený uživatel nemá
--    přímý přístup ke smazání záznamu z auth.users. Smazání z auth.users se díky
--    "ON DELETE CASCADE" u public.profiles.id automaticky promítne i do veřejného
--    profilu a všech navázaných záznamů (quiz_results, user_notifications...).
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();

  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Pouze správce může mazat uživatelské účty.' USING ERRCODE = '42501';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Nelze smazat vlastní uživatelský účet.' USING ERRCODE = '42501';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;

-- 2. Doplňková politika: správce smí číst výsledky testů všech uživatelů.
--    Potřeba pro zobrazení agregovaného sloupce "Hodnost / XP" v konzoli správy
--    uživatelů. Nenahrazuje původní politiku (uživatel čte své vlastní výsledky),
--    pouze ji rozšiřuje o čtení pro roli 'admin'.
DROP POLICY IF EXISTS "Správce může číst všechny výsledky testů" ON public.quiz_results;
CREATE POLICY "Správce může číst všechny výsledky testů"
  ON public.quiz_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
        AND admin_profile.role = 'admin'
    )
  );
