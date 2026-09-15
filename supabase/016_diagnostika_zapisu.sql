-- ═════════════════════════════════════════════════════════════════════════════
-- 016 — Proč nejde nic uložit: diagnostika a oprava zápisů
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editor, přihlášeni jako
-- vlastník projektu. Skript je idempotentní a nic nemaže — jen doplňuje, co
-- chybí, a na konci vypíše přehled.
--
-- PŘÍZNAK, NA KTERÝ ODPOVÍDÁ
--   „Nejde mi aktualizovat nic z databáze. Otázky, uživatele, nástěnka…“
--
-- PROČ TO VYPADÁ, ŽE SE NIC NEDĚJE
--   Zamítnutí RLS u UPDATE a DELETE NENÍ chyba. Politika jen odfiltruje řádky,
--   které volající smí měnit, a příkaz korektně změní nula řádků — PostgREST
--   vrátí HTTP 200 a prázdný výsledek. Aplikace proto donedávna hlásila úspěch
--   i tam, kde se nezapsalo nic; po obnovení stránky byla změna pryč.
--
-- ČTYŘI PŘÍČINY, KTERÉ TENHLE SKRIPT ŘEŠÍ
--   A) Účet má v public.profiles roli 'student', ale v aplikaci vidí správcovské
--      rozhraní díky VITE_ADMIN_EMAILS. O oprávnění rozhoduje VÝHRADNĚ databáze,
--      takže rozhraní je funkční jen na pohled a každý zápis skončí bez efektu.
--      Tohle je zdaleka nejčastější příčina.
--   B) Účet nemá v public.profiles řádek vůbec (neproběhl trigger při registraci).
--      get_role() pak vrátí NULL a všechny politiky zamítnou.
--   C) Chybí sloupec profiles.user_class (neproběhla migrace 010).
--   D) Chybí role 'velitel_tridy' v omezení CHECK (neproběhla migrace 011),
--      takže ji ve správě uživatelů nelze nikomu nastavit.
--
-- KROK 5 NASTAVUJE SPRÁVCE. Uprav si v něm e-mail, než skript spustíš.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─── 1. Diagnostika PŘED opravou ─────────────────────────────────────────────
--
-- Tohle je stav, na kterém se aplikace zasekla. Výpis si nechte — ukazuje, co
-- přesně bylo špatně.

-- POZOR: tenhle dotaz se ZÁMĚRNĚ nedívá na profiles.user_class. Na instalaci
-- bez migrace 010 ten sloupec neexistuje, takže by diagnostika spadla přesně
-- v případě, na který je určená. Zařazení do tříd ukazuje až krok 8, to už
-- sloupec doplnil krok 2.
SELECT
  u.email,
  p.id IS NOT NULL                       AS ma_radek_v_profiles,
  p.role                                 AS role_v_databazi,
  CASE
    WHEN p.id IS NULL              THEN 'PŘÍČINA B: účet nemá řádek v public.profiles'
    WHEN p.role NOT IN ('lektor', 'admin')
      THEN 'PŘÍČINA A: role „' || p.role || '“ nestačí na správu otázek ani uživatelů'
    ELSE 'role je v pořádku'
  END                                    AS zaver
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at;

-- PŘÍČINA E: rekurzivní politika nad profiles
--
-- Tenhle dotaz musí vrátit PRÁZDNÝ výsledek. Cokoli vrátí, znamená, že nad
-- profiles je politika, která sama čte profiles — aplikace pak dostane
-- „infinite recursion detected in policy for relation profiles" (42P17)
-- a neuloží nic, ať už jsou role nastavené sebelíp.
--
-- ⚠️ Zbytek TÉHLE migrace to NEOPRAVÍ a ani nepozná: všechno tady běží jako
-- role postgres, která RLS obchází, takže závěrečný výpis v kroku 8 vypíše
-- „✅ smí spravovat otázky" i nad úplně rozbitou databází. Vrátí-li tenhle
-- dotaz cokoli, spusťte supabase/017_oprava_rekurze_politik.sql — ten hledá
-- takové politiky podle definice a ověřuje výsledek v roli authenticated.

SELECT
  tablename,
  cmd,
  policyname,
  '❌ REKURZE — spusťte 017_oprava_rekurze_politik.sql' AS zaver
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
  AND (coalesce(qual, '') || ' ' || coalesce(with_check, '')) ~ '\mprofiles\M'
ORDER BY policyname;

-- Chybějící sloupce a omezení (příčiny C a D)
SELECT
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_class'
  )                                      AS ma_sloupec_user_class,
  EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%velitel_tridy%'
  )                                      AS zna_roli_velitel_tridy;

-- ─── 2. Příčina C: doplnit sloupec user_class ────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_class TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_user_class ON public.profiles(user_class);

-- ─── 3. Příčina D: doplnit roli velitel_tridy do omezení CHECK ───────────────

DO $$
DECLARE c_name TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%velitel_tridy%'
  ) THEN
    RAISE NOTICE 'Omezení už roli velitel_tridy zná — přeskočeno.';
    RETURN;
  END IF;

  FOR c_name IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', c_name);
  END LOOP;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('student', 'velitel_tridy', 'lektor', 'admin'));
END $$;

-- ─── 4. Příčina B: doplnit chybějící řádky v public.profiles ─────────────────
--
-- Účty, které vznikly dřív, než existoval trigger handle_new_user(), řádek
-- nemají. Zakládá se s rolí 'student' — povýšení je vědomé rozhodnutí správce.

INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'student'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- ─── 5. Příčina A: nastavit roli správce ⚠️ UPRAV SI E-MAIL ──────────────────
--
-- Musí sedět s adresou, kterou se do aplikace přihlašujete, i s tím, co máte
-- ve VITE_ADMIN_EMAILS. Roli správce nelze nastavit z aplikace — první správce
-- v projektu vzniká jedině tady, protože politika „Pouze administrátor může
-- měnit role“ vyžaduje, aby už nějaký správce existoval.

UPDATE public.profiles
SET role = 'admin'
WHERE email ILIKE '%miichalpapi%'
  AND role IS DISTINCT FROM 'admin';

-- Řádky založené v kroku 4 nemusí mít e-mail — doplníme ho z auth.users, ať
-- podmínka výše i správa uživatelů pracují s reálnou adresou.
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id AND p.email IS DISTINCT FROM u.email;

-- Ještě jednou po doplnění e-mailů, ať se nastavení správce chytí i tam.
UPDATE public.profiles
SET role = 'admin'
WHERE email ILIKE '%miichalpapi%'
  AND role IS DISTINCT FROM 'admin';

-- ─── 6. Kontrola: nepřežila někde povolující politika z doby před 013? ───────
--
-- PERMISSIVE politiky se slučují přes OR, takže jediná zbylá s USING (true)
-- zneplatní všechna utažení vedle sebe. Vrátit se smí jen class_boards
-- a global_announcements (čtení pro přihlášené) a quiz_questions (záměrně
-- veřejné čtení). Cokoli jiného — hlavně profiles nebo user_feedback —
-- znamená, že je potřeba spustit 014_drop_leftover_policies.sql.

SELECT tablename, cmd, policyname, coalesce(qual, with_check) AS podminka
FROM pg_policies
WHERE schemaname = 'public' AND (qual = 'true' OR with_check = 'true')
ORDER BY tablename, cmd, policyname;

-- ─── 7. Kontrola: má každá tabulka politiku pro zápis? ───────────────────────
--
-- Tabulka se zapnutou RLS a bez politiky pro UPDATE odmítne úplně všechno,
-- a to zase potichu. Tenhle výpis takové tabulky odhalí.

SELECT
  c.relname                                                  AS tabulka,
  c.relrowsecurity                                           AS rls_zapnuta,
  count(*) FILTER (WHERE pol.cmd IN ('UPDATE', 'ALL'))       AS politik_pro_update,
  count(*) FILTER (WHERE pol.cmd IN ('INSERT', 'ALL'))       AS politik_pro_insert,
  count(*) FILTER (WHERE pol.cmd IN ('DELETE', 'ALL'))       AS politik_pro_delete
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies pol ON pol.schemaname = n.nspname AND pol.tablename = c.relname
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity
GROUP BY c.relname, c.relrowsecurity
ORDER BY c.relname;

-- ─── 8. Diagnostika PO opravě — tady má být všechno v pořádku ────────────────

SELECT
  u.email,
  p.role                                 AS role_v_databazi,
  p.user_class                           AS trida,
  CASE
    WHEN p.id IS NULL                       THEN '❌ stále chybí řádek v profiles'
    WHEN p.role IN ('lektor', 'admin')      THEN '✅ smí spravovat otázky, uživatele i nástěnky'
    WHEN p.role = 'velitel_tridy' AND p.user_class IS NOT NULL
                                            THEN '✅ smí spravovat nástěnku třídy ' || p.user_class
    WHEN p.role = 'velitel_tridy'           THEN '⚠️ velitel bez vyplněné třídy — nástěnku spravovat nemůže'
    ELSE '• student (jen studium a vlastní statistiky)'
  END                                    AS opravneni
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at;

-- ─── ⚠️ Co výpis výše NEOVĚŘUJE ──────────────────────────────────────────────
--
-- Krok 8 čte role jako postgres, tedy s obejitou RLS. Říká tedy jen „role je
-- v databázi nastavená správně" — NE „aplikace to tak uvidí". Rekurzivní
-- politika (příčina E), odebraná práva k funkcím nebo chybějící politika pro
-- SELECT se sem nepromítnou. Skutečné ověření v roli authenticated dělá krok 5
-- v supabase/017_oprava_rekurze_politik.sql; ten spusťte jako druhý.

-- ─── Co dělat, když správce v kroku 8 pořád není 'admin' ─────────────────────
--
--   1. E-mail v kroku 5 nesedí s adresou účtu — ověřte ji: SELECT email FROM auth.users;
--   2. Účet v auth.users vůbec neexistuje — zaregistrujte se v aplikaci
--      a spusťte tenhle skript znovu.
--   3. Po opravě se v aplikaci ODHLASTE A ZNOVU PŘIHLASTE. Role se čte při
--      načtení profilu, takže stará session ukazuje stará oprávnění.
