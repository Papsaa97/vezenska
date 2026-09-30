-- =====================================================================
-- Kontrola RLS: co opravdu vidí a smí anonym, student a velitel třídy
-- =====================================================================
--
-- PROČ: „Náhled role“ v aplikaci mění jen rozhraní. Jestli databáze sama
-- nepustí studenta k cizím výsledkům nebo k zápisu do banky otázek, se
-- z prohlížeče ověřit nedá. Tenhle skript to zkusí přímo v databázi pod
-- skutečnými rolemi `anon` a `authenticated` s identitou vybraného uživatele.
--
-- JE TO BEZPEČNÉ SPUSTIT NA PRODUKCI: každý pokus běží v pod-transakci, která
-- vždy skončí výjimkou, takže se všechno (i zkušební zápisy a přepnutí role)
-- vrátí zpět. Nic se neuloží; zůstane jen dočasná tabulka s výsledkem, která
-- zmizí po zavření SQL Editoru. Skript NENÍ migrace a nemá číslo.
--
-- JAK: Supabase → SQL Editor → vložit celý soubor → Run. Výsledkem je tabulka
-- řádků „role / kontrola / čekáno / zjištěno / výsledek“. Všechno má být OK.
-- Uživatele pro každou roli si skript vybere sám (první podle data registrace);
-- chybí-li v databázi uživatel dané role, jeho řádky se přeskočí.
--
-- Ověřuje:
--   * anonym nepřečte žádný řádek z osobních tabulek,
--   * student a velitel třídy čtou jen své vlastní řádky,
--   * nikdo z nich si nezvýší roli, nezapíše do banky otázek ani nepošle
--     zprávu jménem správce.
-- =====================================================================

DROP TABLE IF EXISTS pg_temp.kontrola_rls;
CREATE TEMP TABLE kontrola_rls (
  poradi     serial,
  role       text,
  kontrola   text,
  ceka       text,
  zjisteno   text,
  vysledek   text
);

DO $kontrola$
DECLARE
  -- Tabulky s osobními daty a sloupec, podle kterého patří uživateli.
  osobni CONSTANT text[][] := ARRAY[
    ['profiles',           'id'],
    ['quiz_results',       'user_id'],
    ['user_notifications', 'user_id'],
    ['user_feedback',      'user_id'],
    ['studijni_postup',    'user_id'],
    ['studijni_zaznamy',   'user_id']
  ];
  role_db   text;
  uid       uuid;
  tabulka   text;
  sloupec   text;
  vidi      bigint;
  cizi      bigint;
  zprava    text;
  i         int;
BEGIN
  FOREACH role_db IN ARRAY ARRAY['anon', 'student', 'velitel_tridy'] LOOP
    uid := NULL;
    IF role_db <> 'anon' THEN
      SELECT p.id INTO uid FROM public.profiles p
       WHERE p.role = role_db ORDER BY p.created_at NULLS LAST LIMIT 1;
      IF uid IS NULL THEN
        INSERT INTO kontrola_rls (role, kontrola, ceka, zjisteno, vysledek)
        VALUES (role_db, 'uživatel této role', 'existuje', 'žádný', 'PŘESKOČENO');
        CONTINUE;
      END IF;
    END IF;

    -- ---------------- Čtení osobních tabulek ----------------
    FOR i IN 1 .. array_length(osobni, 1) LOOP
      tabulka := osobni[i][1];
      sloupec := osobni[i][2];
      BEGIN
        PERFORM set_config('request.jwt.claims',
          json_build_object('sub', uid, 'role',
            CASE WHEN role_db = 'anon' THEN 'anon' ELSE 'authenticated' END)::text, true);
        EXECUTE format('SET LOCAL ROLE %I',
          CASE WHEN role_db = 'anon' THEN 'anon' ELSE 'authenticated' END);
        EXECUTE format('SELECT count(*), count(*) FILTER (WHERE %I IS DISTINCT FROM $1) FROM public.%I',
                       sloupec, tabulka)
          INTO vidi, cizi USING uid;
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = format('hotovo:%s:%s', vidi, cizi);
      EXCEPTION
        WHEN insufficient_privilege THEN
          INSERT INTO kontrola_rls (role, kontrola, ceka, zjisteno, vysledek)
          VALUES (role_db, 'čtení ' || tabulka, 'jen vlastní řádky',
                  'přístup odepřen', 'OK');
        WHEN raise_exception THEN
          IF SQLERRM LIKE 'hotovo:%' THEN
            vidi := split_part(SQLERRM, ':', 2)::bigint;
            cizi := split_part(SQLERRM, ':', 3)::bigint;
            INSERT INTO kontrola_rls (role, kontrola, ceka, zjisteno, vysledek)
            VALUES (role_db, 'čtení ' || tabulka,
                    CASE WHEN role_db = 'anon' THEN '0 řádků' ELSE '0 cizích řádků' END,
                    format('%s řádků, z toho %s cizích', vidi, cizi),
                    CASE WHEN cizi = 0 THEN 'OK' ELSE 'CHYBA' END);
          ELSE
            INSERT INTO kontrola_rls (role, kontrola, ceka, zjisteno, vysledek)
            VALUES (role_db, 'čtení ' || tabulka, 'jen vlastní řádky', SQLERRM, 'ZKONTROLOVAT');
          END IF;
        WHEN OTHERS THEN
          INSERT INTO kontrola_rls (role, kontrola, ceka, zjisteno, vysledek)
          VALUES (role_db, 'čtení ' || tabulka, 'jen vlastní řádky', SQLERRM, 'ZKONTROLOVAT');
      END;
    END LOOP;

    -- ---------------- Zakázané zápisy ----------------
    -- Každý pokus: kolik řádků by se změnilo. Čeká se 0 nebo odmítnutí.
    FOREACH zprava IN ARRAY ARRAY[
      'UPDATE public.profiles SET role = ''admin'' WHERE id = $1',
      'UPDATE public.quiz_questions SET question = question',
      'DELETE FROM public.quiz_questions',
      'INSERT INTO public.user_notifications (user_id, title, body) VALUES ($1, ''test'', ''test'')',
      'UPDATE public.quiz_results SET accuracy = accuracy WHERE user_id IS DISTINCT FROM $1'
    ] LOOP
      BEGIN
        PERFORM set_config('request.jwt.claims',
          json_build_object('sub', uid, 'role',
            CASE WHEN role_db = 'anon' THEN 'anon' ELSE 'authenticated' END)::text, true);
        EXECUTE format('SET LOCAL ROLE %I',
          CASE WHEN role_db = 'anon' THEN 'anon' ELSE 'authenticated' END);
        EXECUTE zprava USING uid;
        GET DIAGNOSTICS vidi = ROW_COUNT;
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = format('hotovo:%s', vidi);
      EXCEPTION
        WHEN raise_exception THEN
          IF SQLERRM LIKE 'hotovo:%' THEN
            vidi := split_part(SQLERRM, ':', 2)::bigint;
            INSERT INTO kontrola_rls (role, kontrola, ceka, zjisteno, vysledek)
            VALUES (role_db, left(zprava, 60), '0 řádků nebo odmítnuto',
                    format('změnilo by %s řádků', vidi),
                    CASE WHEN vidi = 0 THEN 'OK' ELSE 'CHYBA' END);
          ELSE
            -- Výjimka vyhozená triggerem nebo pojistkou = zápis odmítnut.
            INSERT INTO kontrola_rls (role, kontrola, ceka, zjisteno, vysledek)
            VALUES (role_db, left(zprava, 60), '0 řádků nebo odmítnuto',
                    'odmítnuto: ' || left(SQLERRM, 80), 'OK');
          END IF;
        WHEN undefined_table OR undefined_column OR undefined_function THEN
          -- Chyba ve skriptu, ne odmítnutí: nesmí se vydávat za OK.
          INSERT INTO kontrola_rls (role, kontrola, ceka, zjisteno, vysledek)
          VALUES (role_db, left(zprava, 60), '0 řádků nebo odmítnuto',
                  left(SQLERRM, 80), 'ZKONTROLOVAT');
        WHEN OTHERS THEN
          INSERT INTO kontrola_rls (role, kontrola, ceka, zjisteno, vysledek)
          VALUES (role_db, left(zprava, 60), '0 řádků nebo odmítnuto',
                  'odmítnuto: ' || left(SQLERRM, 80), 'OK');
      END;
    END LOOP;
  END LOOP;
END
$kontrola$;

SELECT role, kontrola, ceka AS "čekáno", zjisteno AS "zjištěno", vysledek AS "výsledek"
  FROM kontrola_rls
 ORDER BY (vysledek = 'OK'), poradi;
