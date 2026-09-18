-- ============================================================================
-- 033  Test se nedá nafouknout: duplicity, cizí předmět, počet otázek, čas
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- Migrace 021 přesunula výpočet skóre z prohlížeče do vyhodnotit_kviz(), takže
-- zapsané skóre odpovídá odeslaným odpovědím. Neřešila ale, JAKÉ odpovědi smí
-- přijít. Volající si mohl RPC sestavit sám a funkce přijala:
--
--   1. tutéž otázku mnohokrát — 50× zopakovaná jedna správně zodpovězená
--      otázka dala „50 z 50“ a plné XP, aniž by se test vůbec skládal;
--   2. otázky z jiného předmětu, než jaký test deklaruje — výsledek se pak
--      v přehledech i v XP počítá pod cizí předmět;
--   3. až 500 odpovědí bez ohledu na to, kolik otázek v daném předmětu vůbec
--      existuje (největší předmět má 60, celá banka 364);
--   4. libovolné `completed_at` — šlo datovat test dopředu i dozadu.
--
-- Body 1 a 3 mají přímý dopad na XP, podle kterého se správce v konzoli dívá,
-- jak kdo studuje (`UserManager.tsx:172`). Bod 2 rozbíjí statistiku předmětů,
-- bod 4 pořadí v historii.
--
-- CO TENHLE SKRIPT DĚLÁ
-- Přepisuje vyhodnotit_kviz(). Podpis, návratový typ ani oprávnění se nemění,
-- takže klient (`src/utils/quizResults.ts:136`) zůstává beze změny.
--
--   1. ODDUPLIKOVÁNÍ. Odpovědi se po spárování s bankou zúží na jednu na
--      otázku (`DISTINCT ON`), počítá se první výskyt. Klíčem je identita
--      otázky v bance, a teprve když se nenajde, text — tatáž otázka poslaná
--      jednou přes UUID a podruhé textem se proto počítá jednou.
--   2. PŘEDMĚT. Deklaruje-li test existující předmět, páruje se jen s otázkami
--      z něj. Otázka odjinud se chová jako nenalezená: počítá se jako chybná
--      a bere celému výsledku razítko `overeno`. Souhrnné režimy („all“,
--      „Závěrečná zkouška ZOP A“) žádný předmět v bance nemají, takže se
--      neomezují — jejich otázky pocházejí napříč předměty záměrně.
--   3. STROP. Místo pevných 500 se odvozuje z banky: dvojnásobek počtu
--      viditelných otázek v rozsahu testu, nejméně 100 a nejvýš 500. Rezerva
--      je tam kvůli sadě zabudované do balíčku (`src/data/questions/`), která
--      se s bankou nemusí přesně krýt a jede offline.
--   4. ČAS. `completed_at` z klienta se bere jen tehdy, dává-li smysl: nesmí
--      být v budoucnosti (5 minut tolerance na rozjeté hodiny) ani starší než
--      30 dní. Jinak nastupuje now(). Parametr se nezahazuje úplně schválně —
--      fronta neodeslaných výsledků v localStorage odesílá testy i s několika-
--      denním zpožděním a datum dokončení má zůstat to skutečné.
--
-- CO SE ZÁMĚRNĚ NEMĚNÍ
-- Funkce dál neutajuje správné odpovědi; portál je ukazuje záměrně (viz
-- rámeček v záhlaví 021). Ručí za to, že zapsané skóre odpovídá odeslaným
-- odpovědím a že ty odpovědi dávají smysl — ne za to, že se uživatel předtím
-- nepodíval. XP proto zůstává měkké číslo.
--
-- Spouštět po: 021_vyhodnoceni_kvizu_na_serveru.sql. Skript je idempotentní.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.vyhodnotit_kviz(
  p_id          uuid,
  p_predmet     text,
  p_cas_s       integer,
  p_dokonceno_v timestamptz,
  p_odpovedi    jsonb
)
 RETURNS public.quiz_results
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid          uuid := auth.uid();
  v_radek        public.quiz_results;
  v_pokusy       jsonb;
  v_celkem       integer;
  v_spravne      integer;
  v_v_limitu     integer;
  v_po_limitu    integer;
  v_nenalezeno   integer;
  v_predmet      text := coalesce(nullif(btrim(p_predmet), ''), 'all');
  v_predmet_banky text;
  v_dostupnych   integer;
  v_strop        integer;
  v_dokonceno    timestamptz;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Výsledek testu lze uložit jen přihlášenému účtu.'
      USING ERRCODE = '42501';
  END IF;

  IF p_id IS NULL THEN
    RAISE EXCEPTION 'Chybí identifikátor výsledku.' USING ERRCODE = '22023';
  END IF;

  IF jsonb_typeof(p_odpovedi) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Odpovědi se posílají jako pole.' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_odpovedi) = 0 THEN
    RAISE EXCEPTION 'Test bez jediné otázky se neukládá.' USING ERRCODE = '22023';
  END IF;

  -- Rozsah testu. Shoda se hledá bez ohledu na velikost písmen a okolní mezery,
  -- ať „právo“ z klienta sedne na „Právo“ v bance. Nesedne-li nic, jde
  -- o souhrnný režim a předmět se neomezuje.
  SELECT q.subject INTO v_predmet_banky
  FROM public.quiz_questions q
  WHERE lower(btrim(q.subject)) = lower(btrim(v_predmet))
  LIMIT 1;

  -- Strop podle skutečné velikosti banky, ne podle pevného čísla.
  SELECT count(*) INTO v_dostupnych
  FROM public.quiz_questions q
  WHERE coalesce(q.is_hidden, false) = false
    AND (v_predmet_banky IS NULL OR q.subject = v_predmet_banky);

  v_strop := least(500, greatest(coalesce(v_dostupnych, 0) * 2, 100));

  IF jsonb_array_length(p_odpovedi) > v_strop THEN
    RAISE EXCEPTION 'Test v rozsahu „%“ může mít nejvýš % odpovědí, přišlo jich %.',
      v_predmet, v_strop, jsonb_array_length(p_odpovedi) USING ERRCODE = '22023';
  END IF;

  -- Čas dokončení z klienta jen tehdy, dává-li smysl.
  v_dokonceno := coalesce(p_dokonceno_v, now());
  IF v_dokonceno > now() + interval '5 minutes'
     OR v_dokonceno < now() - interval '30 days' THEN
    v_dokonceno := now();
  END IF;

  -- Opakované odeslání z fronty neodeslaných výsledků. Řádek už existuje, takže
  -- se nevyhodnocuje znovu — jen se vrátí, co je uložené.
  SELECT * INTO v_radek FROM public.quiz_results WHERE id = p_id;
  IF FOUND THEN
    IF v_radek.user_id <> v_uid THEN
      RAISE EXCEPTION 'Výsledek s tímto identifikátorem patří jinému účtu.'
        USING ERRCODE = '42501';
    END IF;
    RETURN v_radek;
  END IF;

  WITH vstup AS (
    SELECT
      t.ord,
      -- Cast na uuid je schválně uvnitř CASE: mimo něj by ho Postgres zkusil
      -- provést i na 'pravo-1' z bundlované sady a spadl na 22P02.
      CASE
        WHEN t.prvek ->> 'id' ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
        THEN (t.prvek ->> 'id')::uuid
      END                                                    AS id_uuid,
      btrim(coalesce(t.prvek ->> 'otazka', ''))              AS text_otazky,
      CASE
        WHEN jsonb_typeof(t.prvek -> 'vybrano') = 'string'
        THEN btrim(t.prvek ->> 'vybrano')
      END                                                    AS vybrano,
      CASE
        WHEN t.prvek ->> 'jistota' IN ('know', 'guess', 'dont_know')
        THEN t.prvek ->> 'jistota'
        ELSE 'know'
      END                                                    AS jistota,
      CASE
        WHEN jsonb_typeof(t.prvek -> 'po_limitu') = 'boolean'
        THEN (t.prvek ->> 'po_limitu')::boolean
        ELSE false
      END                                                    AS po_limitu
    FROM jsonb_array_elements(p_odpovedi) WITH ORDINALITY AS t(prvek, ord)
  ),
  spojeno AS (
    SELECT
      v.*,
      q.id            AS q_id,
      q.question      AS q_text,
      q.subject       AS q_predmet,
      q.topic         AS q_tema,
      q.options       AS q_moznosti,
      q.correct_index AS q_spravny
    FROM vstup v
    LEFT JOIN LATERAL (
      SELECT qq.id, qq.question, qq.subject, qq.topic, qq.options, qq.correct_index
      FROM public.quiz_questions qq
      WHERE ((v.id_uuid IS NOT NULL AND qq.id = v.id_uuid)
             OR (v.text_otazky <> '' AND btrim(qq.question) = v.text_otazky))
        -- Deklaruje-li test existující předmět, cizí otázka se nespáruje.
        AND (v_predmet_banky IS NULL OR qq.subject = v_predmet_banky)
      -- Shoda na UUID má přednost před shodou na textu.
      ORDER BY (qq.id = v.id_uuid) DESC NULLS LAST
      LIMIT 1
    ) q ON true
  ),
  odduplikovano AS (
    -- Jedna otázka = jedna odpověď. Klíčem je identita v bance; u nespárované
    -- otázky zastoupí text, ať se ani ta neposílá dvakrát. Bere se první
    -- výskyt, tedy ten s nejnižším pořadím v odeslaném poli.
    SELECT DISTINCT ON (coalesce(s.q_id::text, lower(s.text_otazky)))
      s.*
    FROM spojeno s
    ORDER BY coalesce(s.q_id::text, lower(s.text_otazky)), s.ord
  ),
  ohodnoceno AS (
    SELECT
      s.*,
      (s.q_id IS NOT NULL) AS nalezeno,
      (
        s.q_id IS NOT NULL
        AND s.vybrano IS NOT NULL
        AND s.vybrano = btrim(coalesce(s.q_moznosti ->> s.q_spravny, ''))
      ) AS je_spravne,
      coalesce((
        SELECT m.poradi - 1
        FROM jsonb_array_elements_text(
               CASE WHEN jsonb_typeof(s.q_moznosti) = 'array'
                    THEN s.q_moznosti ELSE '[]'::jsonb END
             ) WITH ORDINALITY AS m(text_moznosti, poradi)
        WHERE btrim(m.text_moznosti) = s.vybrano
        ORDER BY m.poradi
        LIMIT 1
      ), -1) AS index_vybrane
    FROM odduplikovano s
  )
  SELECT
    jsonb_agg(
      jsonb_build_object(
        'questionId',     coalesce(o.q_id::text, nullif(o.text_otazky, ''), ''),
        'questionText',   coalesce(o.q_text, o.text_otazky),
        'subject',        coalesce(o.q_predmet, 'Nezařazeno'),
        'topic',          coalesce(o.q_tema, o.q_predmet, 'Nezařazeno'),
        'isCorrect',      o.je_spravne,
        'selectedOption', o.index_vybrane,
        'correctOption',  coalesce(o.q_spravny, -1),
        'confidence',     o.jistota,
        'timedOut',       o.po_limitu
      ) ORDER BY o.ord
    ),
    count(*),
    count(*) FILTER (WHERE o.je_spravne),
    count(*) FILTER (WHERE o.je_spravne AND NOT o.po_limitu),
    count(*) FILTER (WHERE o.je_spravne AND o.po_limitu),
    count(*) FILTER (WHERE NOT o.nalezeno)
  INTO v_pokusy, v_celkem, v_spravne, v_v_limitu, v_po_limitu, v_nenalezeno
  FROM ohodnoceno o;

  INSERT INTO public.quiz_results (
    id, user_id, subject,
    total_questions, correct_answers, accuracy,
    time_spent_seconds, attempts,
    correct_in_limit, correct_after_limit,
    completed_at, overeno
  )
  VALUES (
    p_id,
    v_uid,
    v_predmet,
    v_celkem,
    v_spravne,
    CASE WHEN v_celkem > 0 THEN round(100.0 * v_spravne / v_celkem)::integer ELSE 0 END,
    greatest(coalesce(p_cas_s, 0), 0),
    coalesce(v_pokusy, '[]'::jsonb),
    v_v_limitu,
    v_po_limitu,
    v_dokonceno,
    -- Razítko dostane jen test, u kterého se v bance našla každá otázka —
    -- a po téhle migraci tedy i každá ve správném předmětu.
    (v_nenalezeno = 0)
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING * INTO v_radek;

  -- Souběžné odeslání téhož výsledku ze dvou karet: řádek vznikl mezitím.
  IF v_radek.id IS NULL THEN
    SELECT * INTO v_radek
    FROM public.quiz_results
    WHERE id = p_id AND user_id = v_uid;
  END IF;

  RETURN v_radek;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.vyhodnotit_kviz(uuid, text, integer, timestamptz, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.vyhodnotit_kviz(uuid, text, integer, timestamptz, jsonb) FROM anon;
GRANT  EXECUTE ON FUNCTION public.vyhodnotit_kviz(uuid, text, integer, timestamptz, jsonb) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.vyhodnotit_kviz(uuid, text, integer, timestamptz, jsonb) TO service_role;

-- ─── Ověření ─────────────────────────────────────────────────────────────────
--
-- Zkoušky se spouštějí v transakci ukončené ROLLBACK, pod JWT běžného účtu:
--
--   BEGIN;
--   SELECT set_config('request.jwt.claims',
--                     '{"sub":"<uuid studenta>","role":"authenticated"}', true);
--   SET LOCAL ROLE authenticated;
--
--   -- (a) tatáž otázka 50×  →  total_questions = 1
--   -- (b) otázka z Práva pod předmětem „Zbraně“  →  overeno = false
--   -- (c) 300 odpovědí pod předmětem „Zbraně“  →  22023, strop je 100
--   -- (d) completed_at v roce 2030  →  uloží se dnešní čas
--
--   ROLLBACK;
