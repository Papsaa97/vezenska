-- ============================================================================
-- 035  Správce se určuje celou adresou z auth.users, ne podřetězcem v profiles
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- Dvě místa povyšovala účet na správce podle podřetězce v `profiles.email`:
--
--   set_admin_miichalpapi.sql:12,20,25   WHERE email ILIKE '%miichalpapi%'
--   016_diagnostika_zapisu.sql:146,159   WHERE email ILIKE '%miichalpapi%'
--
-- Dvě samostatné chyby v jednom řádku:
--
--   1. PODŘETĚZEC. Vyhoví každá adresa, která ten kus textu kdekoli obsahuje —
--      `miichalpapi.zloděj@gmail.com` i `neco+miichalpapi@example.org`.
--      Registrace je samoobslužná, takže takový účet si založí kdokoli.
--   2. ZDROJ. Porovnává se `public.profiles.email`, ne `auth.users.email`.
--      Dokud migrace 032 nezamkla profilový e-mail, zapsal si tam uživatel co
--      chtěl — a `016` ho povyšuje na správce DŘÍV (řádek 146), než si ho na
--      řádcích 154–157 srovná podle `auth.users`. README přitom spuštění
--      diagnostiky doporučuje (`README.md:31, 93`), takže stačilo počkat.
--
-- Migrace 032 druhou půlku už uzavřela: profilový e-mail si nesprávce nezmění.
-- Zbývá první — a i tak je špatně vázat oprávnění na tabulku, kterou si uživatel
-- edituje, když vedle stojí `auth.users`, kam nevidí vůbec.
--
-- CO TENHLE SKRIPT DĚLÁ
-- Zavádí `nastavit_spravce(text)`. Bere CELOU adresu, porovnává ji na rovnost
-- (bez ohledu na velikost písmen a okolní mezery) a hledá ji v `auth.users`.
-- Profil doplní, chybí-li, a nastaví roli `admin`.
--
-- Funkce je SECURITY INVOKER schválně. V SQL Editoru běží jako `postgres`,
-- který politiky nad profiles neřeší, takže SECURITY DEFINER by nic nepřidal —
-- jen by z funkce udělal cestu, jak roli správce získat, kdyby někdy EXECUTE
-- uniklo. Takhle je pojistka dvojí: EXECUTE klientské role nemají, a i kdyby
-- ho dostaly, zápis jim zamítne RLS.
--
-- JAK SE POUŽÍVÁ (v Supabase Dashboard → SQL Editor)
--
--   SELECT * FROM public.nastavit_spravce('vase.adresa@example.cz');
--
-- Vrací jeden řádek s tím, co se stalo. Nenajde-li adresu v `auth.users`,
-- skončí chybou — mlčet a netvářit se, že je hotovo, je tu podstatné.
--
-- Spouštět po: profiles.sql a 011_profiles_role_constraint.sql.
-- Skript je idempotentní; samotná funkce se spouští ručně a opakovaně může.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.nastavit_spravce(p_email text)
RETURNS TABLE (ucet_id uuid, ucet_email text, ucet_jmeno text, ucet_role text)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_adresa text := lower(btrim(coalesce(p_email, '')));
  v_id     uuid;
  v_email  text;
  v_jmeno  text;
BEGIN
  IF v_adresa = '' THEN
    RAISE EXCEPTION 'Zadejte e-mailovou adresu správce.' USING ERRCODE = '22023';
  END IF;

  -- Vzorek pro ILIKE ani holé jméno bez domény tudy neprojde. Přesně tahle
  -- volnost dělala z '%miichalpapi%' bezpečnostní nález.
  IF position('%' IN v_adresa) > 0 OR position('@' IN v_adresa) = 0 THEN
    RAISE EXCEPTION 'Zadejte celou adresu včetně domény, ne vzorek. Dostal jsem „%“.', p_email
      USING ERRCODE = '22023';
  END IF;

  SELECT u.id, u.email::text, coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email::text, '@', 1))
    INTO v_id, v_email, v_jmeno
  FROM auth.users u
  WHERE lower(btrim(u.email::text)) = v_adresa;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'V auth.users není účet s adresou „%“. Nejdřív se tím účtem alespoň jednou přihlaste.', p_email
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.profiles AS p (id, email, full_name, role)
  VALUES (v_id, v_email, v_jmeno, 'admin')
  ON CONFLICT (id) DO UPDATE
    SET role  = 'admin',
        -- E-mail se srovná podle auth.users, jméno se zachovává.
        email = EXCLUDED.email,
        full_name = coalesce(p.full_name, EXCLUDED.full_name);

  -- Výstupní sloupce se schválně nejmenují id/email/full_name/role: plpgsql by
  -- je v těle funkce zaměnil se stejnojmennými sloupci profiles a skončil na
  -- 42702 (ambiguous column).
  RETURN QUERY
    SELECT p.id, p.email, p.full_name, p.role
    FROM public.profiles p
    WHERE p.id = v_id;
END;
$$;

-- Volat ji smí jedině ten, kdo se dostane do SQL Editoru. Klientské role ne.
REVOKE ALL     ON FUNCTION public.nastavit_spravce(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.nastavit_spravce(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.nastavit_spravce(text) FROM authenticated;

COMMENT ON FUNCTION public.nastavit_spravce(text) IS
  'Nastaví roli admin účtu s přesně touto adresou v auth.users. Spouští se ručně '
  'v SQL Editoru; klientské role na ni nemají EXECUTE.';

-- ─── Ověření ─────────────────────────────────────────────────────────────────
--
-- (a) Klient ji zavolat nesmí — obojí musí vrátit false:
--
--   SELECT has_function_privilege('anon',          'public.nastavit_spravce(text)', 'EXECUTE'),
--          has_function_privilege('authenticated', 'public.nastavit_spravce(text)', 'EXECUTE');
--
-- (b) Podřetězec ani vzorek neprojde (uvnitř transakce, vždy ROLLBACK):
--
--   BEGIN;
--   SELECT public.nastavit_spravce('%miichalpapi%');  -- 22023
--   SELECT public.nastavit_spravce('miichalpapi');    -- 22023 (chybí doména)
--   SELECT public.nastavit_spravce('nikdo@example.com'); -- P0002
--   ROLLBACK;
--
-- (c) Skutečná adresa projde a nastaví roli:
--
--   BEGIN;
--   SELECT * FROM public.nastavit_spravce('<vase adresa>');
--   ROLLBACK;
