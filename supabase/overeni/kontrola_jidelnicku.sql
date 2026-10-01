-- =====================================================================
-- Kontrola jídelníčku: kdo ho smí změnit a zapíše se každá změna?
-- =====================================================================
--
-- PROČ: Migrace 051 pustila k jídelníčku velitele tříd a zavedla historii
-- změn plněnou triggerem. Tenhle skript ověří přímo v databázi pod
-- skutečnými rolemi `anon` a `authenticated`, že:
--   * velitel, lektor i správce jídelníček uloží a vznikne záznam s jejich id,
--   * student ani anonym ho nezmění,
--   * velitel nezapíše jiný druh obsahu a jídelníček nesmaže,
--   * historii nikdo z aplikace nepřepíše ani nesmaže (ani správce).
--
-- JE TO BEZPEČNÉ SPUSTIT NA PRODUKCI: každý pokus běží v pod-transakci, která
-- vždy skončí výjimkou, takže se všechno vrátí zpět. Zůstane jen dočasná
-- tabulka s výsledkem. Skript NENÍ migrace a nemá číslo.
--
-- JAK: Supabase → SQL Editor → vložit celý soubor → Run. Všechny řádky mají
-- mít výsledek OK (role, která v databázi nikoho nemá, je PŘESKOČENO).
-- =====================================================================

DROP TABLE IF EXISTS pg_temp.kontrola_jidelnicku;
CREATE TEMP TABLE kontrola_jidelnicku (
  poradi     serial,
  role       text,
  kontrola   text,
  ceka       text,
  zjisteno   text,
  vysledek   text
);
GRANT ALL ON kontrola_jidelnicku TO anon, authenticated;
GRANT USAGE ON SEQUENCE kontrola_jidelnicku_poradi_seq TO anon, authenticated;

DO $kontrola$
DECLARE
  role_app  text;
  uid       uuid;
  db_role   text;
  pokus     record;
  n         bigint;
  autor     uuid;
  ulozit CONSTANT text :=
    'INSERT INTO public.content_blocks (id, kind, payload) '
    'VALUES (''jidelnicek:aktualni'', ''jidelnicek'', ''{"id":"aktualni","weekLabel":"kontrola","note":"","days":[]}''::jsonb) '
    'ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, is_deleted = false';
BEGIN
  FOREACH role_app IN ARRAY ARRAY['anon', 'student', 'velitel_tridy', 'lektor', 'admin'] LOOP
    uid := NULL;
    db_role := CASE WHEN role_app = 'anon' THEN 'anon' ELSE 'authenticated' END;
    IF role_app <> 'anon' THEN
      -- Velitel musí mít třídu, jinak by jídelníček (správně) upravit nesměl.
      SELECT p.id INTO uid FROM public.profiles p
       WHERE p.role = role_app
         AND (role_app <> 'velitel_tridy' OR p.user_class IS NOT NULL)
       ORDER BY p.created_at NULLS LAST LIMIT 1;
      IF uid IS NULL THEN
        INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
        VALUES (role_app, 'uživatel této role', 'existuje', 'žádný', 'PŘESKOČENO');
        CONTINUE;
      END IF;
    END IF;

    -- ---------- Uložení jídelníčku a záznam v historii ----------
    BEGIN
      PERFORM set_config('request.jwt.claims',
        json_build_object('sub', uid, 'role', db_role)::text, true);
      EXECUTE format('SET LOCAL ROLE %I', db_role);
      EXECUTE ulozit;
      RESET ROLE;
      SELECT h.autor_id INTO autor FROM public.jidelnicek_historie h
       WHERE h.block_id = 'jidelnicek:aktualni' ORDER BY h.id DESC LIMIT 1;
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ulozeno:' || COALESCE(autor::text, '-');
    EXCEPTION
      WHEN raise_exception THEN
        IF SQLERRM LIKE 'ulozeno:%' THEN
          INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
          VALUES (role_app, 'uložit jídelníček',
                  CASE WHEN role_app IN ('velitel_tridy', 'lektor', 'admin')
                       THEN 'uloží se, v historii je jeho id' ELSE 'odmítnuto' END,
                  CASE WHEN split_part(SQLERRM, ':', 2) = uid::text THEN 'uloženo, záznam s jeho id'
                       ELSE 'uloženo, záznam: ' || split_part(SQLERRM, ':', 2) END,
                  CASE WHEN role_app IN ('velitel_tridy', 'lektor', 'admin')
                        AND split_part(SQLERRM, ':', 2) = uid::text THEN 'OK' ELSE 'CHYBA' END);
        ELSE
          INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
          VALUES (role_app, 'uložit jídelníček', '?', left(SQLERRM, 80), 'ZKONTROLOVAT');
        END IF;
      WHEN undefined_table OR undefined_column OR undefined_function THEN
        INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
        VALUES (role_app, 'uložit jídelníček', 'migrace 051 spuštěná', left(SQLERRM, 80), 'ZKONTROLOVAT');
      WHEN OTHERS THEN
        INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
        VALUES (role_app, 'uložit jídelníček',
                CASE WHEN role_app IN ('velitel_tridy', 'lektor', 'admin')
                     THEN 'uloží se, v historii je jeho id' ELSE 'odmítnuto' END,
                'odmítnuto: ' || left(SQLERRM, 60),
                CASE WHEN role_app IN ('velitel_tridy', 'lektor', 'admin') THEN 'CHYBA' ELSE 'OK' END);
    END;

    -- ---------- Zápisy, které nesmí projít nikomu z této role ----------
    FOR pokus IN
      SELECT * FROM (VALUES
        ('zapsat do historie',
         'INSERT INTO public.jidelnicek_historie (block_id, autor_jmeno, akce) VALUES (''jidelnicek:aktualni'', ''podvrh'', ''uprava'')',
         true),
        ('přepsat historii',
         'UPDATE public.jidelnicek_historie SET autor_jmeno = ''podvrh''',
         true),
        ('smazat historii',
         'DELETE FROM public.jidelnicek_historie',
         true),
        ('vyprázdnit historii (TRUNCATE)',
         'TRUNCATE public.jidelnicek_historie',
         true),
        ('zapsat jiný druh obsahu',
         'INSERT INTO public.content_blocks (id, kind, payload) VALUES (''subject:kontrola'', ''subject'', ''{}''::jsonb)',
         role_app IN ('anon', 'student', 'velitel_tridy')),
        ('smazat jídelníček',
         'DELETE FROM public.content_blocks WHERE kind = ''jidelnicek''',
         role_app IN ('anon', 'student', 'velitel_tridy'))
      ) AS t(nazev, prikaz, zakazano)
    LOOP
      CONTINUE WHEN NOT pokus.zakazano;
      BEGIN
        PERFORM set_config('request.jwt.claims',
          json_build_object('sub', uid, 'role', db_role)::text, true);
        EXECUTE format('SET LOCAL ROLE %I', db_role);
        EXECUTE pokus.prikaz;
        GET DIAGNOSTICS n = ROW_COUNT;
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = format('hotovo:%s', n);
      EXCEPTION
        WHEN raise_exception THEN
          IF SQLERRM LIKE 'hotovo:%' THEN
            n := split_part(SQLERRM, ':', 2)::bigint;
            INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
            VALUES (role_app, pokus.nazev, '0 řádků nebo odmítnuto',
                    format('změnilo by %s řádků', n), CASE WHEN n = 0 THEN 'OK' ELSE 'CHYBA' END);
          ELSE
            INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
            VALUES (role_app, pokus.nazev, '0 řádků nebo odmítnuto', 'odmítnuto: ' || left(SQLERRM, 60), 'OK');
          END IF;
        WHEN undefined_table OR undefined_column OR undefined_function THEN
          INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
          VALUES (role_app, pokus.nazev, 'migrace 051 spuštěná', left(SQLERRM, 80), 'ZKONTROLOVAT');
        WHEN OTHERS THEN
          INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
          VALUES (role_app, pokus.nazev, '0 řádků nebo odmítnuto', 'odmítnuto: ' || left(SQLERRM, 60), 'OK');
      END;
    END LOOP;

    -- ---------- Čtení historie ----------
    BEGIN
      PERFORM set_config('request.jwt.claims',
        json_build_object('sub', uid, 'role', db_role)::text, true);
      EXECUTE format('SET LOCAL ROLE %I', db_role);
      EXECUTE 'SELECT count(*) FROM public.jidelnicek_historie' INTO n;
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'cte';
    EXCEPTION
      WHEN raise_exception THEN
        INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
        VALUES (role_app, 'číst historii',
                CASE WHEN role_app = 'anon' THEN 'odmítnuto' ELSE 'smí číst' END, 'čte',
                CASE WHEN role_app = 'anon' THEN 'CHYBA' ELSE 'OK' END);
      WHEN undefined_table THEN
        INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
        VALUES (role_app, 'číst historii', 'migrace 051 spuštěná', left(SQLERRM, 80), 'ZKONTROLOVAT');
      WHEN OTHERS THEN
        INSERT INTO kontrola_jidelnicku (role, kontrola, ceka, zjisteno, vysledek)
        VALUES (role_app, 'číst historii',
                CASE WHEN role_app = 'anon' THEN 'odmítnuto' ELSE 'smí číst' END,
                'odmítnuto: ' || left(SQLERRM, 60),
                CASE WHEN role_app = 'anon' THEN 'OK' ELSE 'CHYBA' END);
    END;
  END LOOP;
END
$kontrola$;

SELECT role, kontrola, ceka AS "čekáno", zjisteno AS "zjištěno", vysledek AS "výsledek"
  FROM kontrola_jidelnicku
 ORDER BY (vysledek = 'OK'), poradi;
