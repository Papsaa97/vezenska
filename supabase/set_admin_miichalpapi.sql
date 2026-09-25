-- ============================================================================
-- Prvotní nastavení správce  ⚠️ UPRAV SI E-MAIL
-- Spusťte v Supabase Dashboard → SQL Editor.
-- ============================================================================
--
-- Roli správce nelze nastavit z aplikace: politika nad public.profiles pustí
-- změnu role jedině správci, takže první správce v projektu vzniká jedině tady.
--
-- PROČ TO UŽ NENÍ JEDEN `UPDATE ... ILIKE`
-- Dřív tu stálo `WHERE email ILIKE '%miichalpapi%'` nad `public.profiles`.
-- To byly dvě chyby v jednom řádku:
--
--   1. vyhovělo každé adrese, která ten podřetězec kdekoli obsahuje
--      (`miichalpapi.kdokoli@gmail.com`), a registrace je samoobslužná;
--   2. porovnával se profilový e-mail, tedy sloupec, který si uživatel
--      do migrace 032 sám přepisoval.
--
-- Migrace 035 zavedla `nastavit_spravce(text)`: bere CELOU adresu, porovnává
-- ji na rovnost a hledá ji v `auth.users`, kam uživatel nevidí. Vzorek s `%`
-- ani jméno bez domény funkce odmítne, neznámou adresu taky — mlčky „hotovo“
-- nehlásí.
--
-- PŘEDPOKLAD: účet se už alespoň jednou přihlásil, takže v `auth.users` je.
-- Spouštět po: profiles.sql, 011_profiles_role_constraint.sql a
-- 035_spravce_podle_cele_adresy.sql.
-- ============================================================================

SELECT * FROM public.nastavit_spravce('vase.adresa@example.cz');

-- Kontrola stavu: kdo je dnes správce.
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at;
