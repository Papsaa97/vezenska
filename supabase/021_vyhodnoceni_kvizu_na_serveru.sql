-- ═════════════════════════════════════════════════════════════════════════════
-- 021 — Test vyhodnocuje server, ne prohlížeč
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editor. Je idempotentní.
--
-- NÁLEZ
--   Skóre si počítal klient a rovnou ho zapisoval do public.quiz_results:
--
--       POST /rest/v1/quiz_results
--       {"user_id":"<vlastní>","subject":"Závěrečná zkouška ZOP A",
--        "total_questions":50,"correct_answers":50,"accuracy":100, ...}
--
--   Politika u INSERT kontrolovala jedině auth.uid() = user_id, tedy že si
--   uživatel zapisuje pod sebe. Kolik měl správně, si určil sám.
--
--   Sám sebe by tím obelhal jen do vlastní statistiky — kdyby to nečetl ještě
--   někdo další. Jenže čte: politika SELECT nad quiz_results zní
--   „vlastní NEBO is_admin()" a admin konzole (UserManager) z těch řádků počítá
--   XP každého uživatele. Vymyšlené číslo se tedy dostane až do přehledu,
--   podle kterého se správce dívá, jak kdo studuje.
--
-- ŘEŠENÍ
--   Klient nově posílá jen to, co uživatel vybral, a skóre spočítá databáze.
--   Zapisovat řádek s příznakem overeno = true umí výhradně funkce
--   vyhodnotit_kviz() — politika to klientovi zakazuje.
--
-- CO TENHLE SKRIPT NEDĚLÁ
--   Neutajuje správné odpovědi. Portál je záměrně ukazuje: v sekci Předměty si
--   každý přihlášený rozklikne otázku i s vyznačenou správnou odpovědí
--   a vysvětlením — to je smysl studijní pomůcky. Serverové vyhodnocení tedy
--   ručí za to, že zapsané skóre odpovídá odeslaným odpovědím, ne za to, že se
--   uživatel předtím nepodíval. XP proto zůstává měkké číslo.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─── 1. Příznak, že skóre počítal server ─────────────────────────────────────
--
-- Výchozí false schválně: co přijde přímo z klienta (i ze starší verze aplikace,
-- která visí ve frontě neodeslaných výsledků v localStorage), zůstane uložené,
-- jen bez razítka. Dosavadní řádky se zpětně nepřepisují na true — ověřené
-- nejsou a tvářit se tak nemají.

ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS overeno boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.quiz_results.overeno IS
  'true = skóre spočítala funkce vyhodnotit_kviz() z odeslaných odpovědí. false = číslo přišlo hotové z prohlížeče.';

-- ─── 2. Vyhodnocovací funkce ─────────────────────────────────────────────────
--
-- SECURITY DEFINER je tu podstata věci, ne pohodlí: funkce musí umět zapsat
-- řádek s overeno = true, což politika z kroku 3 volajícímu zakazuje.
--
-- PROČ SE POSÍLÁ TEXT ODPOVĚDI, NE JEJÍ POŘADÍ
--   Quiz.tsx pořadí možností u každé otázky před zobrazením promíchá
--   (shuffleQuestionOptions), takže index, na který uživatel klikl, nemá
--   s pořadím v databázi nic společného. Text odpovědi promíchání přežije.
--
-- PROČ SE OTÁZKA DOHLEDÁVÁ I PODLE TEXTU
--   Když je databáze nedostupná, aplikace jede na sadě zabudované do balíčku
--   (academyQuestions) a ta má vlastní identifikátory typu 'pravo-1', ne UUID.
--   Takový test se po návratu sítě odešle z fronty a podle textu otázky se
--   spároval. Nespárované otázky se počítají jako chybné a celý řádek vyjde
--   jako neověřený — ať je poznat, že se skóre neopírá o banku.

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
  v_uid         uuid := auth.uid();
  v_radek       public.quiz_results;
  v_pokusy      jsonb;
  v_celkem      integer;
  v_spravne     integer;
  v_v_limitu    integer;
  v_po_limitu   integer;
  v_nenalezeno  integer;
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

  IF jsonb_array_length(p_odpovedi) > 500 THEN
    RAISE EXCEPTION 'Test může mít nejvýš 500 otázek, přišlo jich %.',
      jsonb_array_length(p_odpovedi) USING ERRCODE = '22023';
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
      WHERE (v.id_uuid IS NOT NULL AND qq.id = v.id_uuid)
         OR (v.text_otazky <> '' AND btrim(qq.question) = v.text_otazky)
      -- Shoda na UUID má přednost před shodou na textu.
      ORDER BY (qq.id = v.id_uuid) DESC NULLS LAST
      LIMIT 1
    ) q ON true
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
    FROM spojeno s
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
    coalesce(nullif(btrim(p_predmet), ''), 'all'),
    v_celkem,
    v_spravne,
    CASE WHEN v_celkem > 0 THEN round(100.0 * v_spravne / v_celkem)::integer ELSE 0 END,
    greatest(coalesce(p_cas_s, 0), 0),
    coalesce(v_pokusy, '[]'::jsonb),
    v_v_limitu,
    v_po_limitu,
    coalesce(p_dokonceno_v, now()),
    -- Razítko dostane jen test, u kterého se v bance našla každá otázka.
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

-- Volat ji smí přihlášený uživatel. Sama si ohlídá, že zapisuje pod auth.uid(),
-- takže cizí účet přes ni obsloužit nejde.
REVOKE EXECUTE ON FUNCTION public.vyhodnotit_kviz(uuid, text, integer, timestamptz, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.vyhodnotit_kviz(uuid, text, integer, timestamptz, jsonb) FROM anon;
GRANT  EXECUTE ON FUNCTION public.vyhodnotit_kviz(uuid, text, integer, timestamptz, jsonb) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.vyhodnotit_kviz(uuid, text, integer, timestamptz, jsonb) TO service_role;

-- ─── 3. Přímý zápis smí vzniknout jen jako neověřený ─────────────────────────
--
-- Politika se neruší, jen se doplňuje o `overeno = false`. Starší verze
-- aplikace (a hlavně výsledky, které v ní uvízly ve frontě v localStorage)
-- tak dál projdou a o nic se nepřijde — jen nedostanou razítko.
--
-- Až fronty doběhnou, je možné politiku shodit úplně a nechat jedinou cestu
-- přes vyhodnotit_kviz(). Do té doby platí, že overeno = true je výsadou
-- funkce: WITH CHECK níže klientovi true nepustí.

DROP POLICY IF EXISTS "Povolit vkládání vlastních výsledků" ON public.quiz_results;
DROP POLICY IF EXISTS "Vlastní výsledek jen jako neověřený" ON public.quiz_results;
CREATE POLICY "Vlastní výsledek jen jako neověřený"
  ON public.quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id AND overeno = false);

-- Nad quiz_results není žádná politika pro UPDATE, takže overeno už nikdo
-- dodatečně nepřeklopí. Kontrola, že to tak je, je v ověření níže.

-- ─── 4. Ověření ──────────────────────────────────────────────────────────────
--
-- (a) Politiky nad quiz_results. U INSERT musí být v WITH CHECK `overeno = false`
--     a řádek s cmd = 'UPDATE' tu být nesmí:

SELECT policyname, cmd, roles::text, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'quiz_results'
ORDER BY cmd, policyname;

-- (b) Práva na funkci. anon tam být nesmí, authenticated ano:

SELECT p.proname AS funkce, CAST(p.proacl AS text) AS prava
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'vyhodnotit_kviz';

-- (c) Rozdělení uložených výsledků. Po nasazení musí ověřených přibývat:

SELECT overeno, count(*) AS pocet FROM public.quiz_results GROUP BY overeno ORDER BY overeno;

-- ─── Očekávané hlášení linteru ───────────────────────────────────────────────
--
-- vyhodnotit_kviz() se objeví v hlášení „Signed-In Users Can Execute SECURITY
-- DEFINER Function" (0029) — stejně jako is_admin(), is_staff(), my_class(),
-- my_role(), can_manage_class() a admin_delete_user(), viz migrace 018. Je to
-- záměr: bez SECURITY DEFINER by funkce nemohla zapsat řádek s razítkem, což je
-- celý smysl tohohle skriptu.
--
-- V hlášení „Public Can Execute" (0028, role anon) být NESMÍ — EXECUTE se jí
-- v kroku 2 odebírá. Kontrola je v bodě (b) výše: v proacl nesmí figurovat anon.
--
-- ─── Návrat zpět ─────────────────────────────────────────────────────────────
--
--     DROP FUNCTION IF EXISTS public.vyhodnotit_kviz(uuid, text, integer, timestamptz, jsonb);
--     DROP POLICY IF EXISTS "Vlastní výsledek jen jako neověřený" ON public.quiz_results;
--     CREATE POLICY "Povolit vkládání vlastních výsledků"
--       ON public.quiz_results FOR INSERT TO authenticated
--       WITH CHECK ((SELECT auth.uid()) = user_id);
--     ALTER TABLE public.quiz_results DROP COLUMN IF EXISTS overeno;
--
-- Uložené výsledky zůstanou; zmizí jen informace, které z nich počítal server.

-- (d) Zkouška nasucho pod rolí přihlášeného uživatele. Přepište <UUID_UCTU>
--     za id z public.profiles; transakce se celá vrací zpět:
--
--     BEGIN;
--       SELECT set_config('request.jwt.claims',
--                json_build_object('sub','<UUID_UCTU>','role','authenticated')::text, true);
--       SET LOCAL ROLE authenticated;
--
--       -- 1. Správná odpověď se pozná i po promíchání možností na klientovi.
--       SELECT correct_answers, accuracy, overeno
--       FROM public.vyhodnotit_kviz(
--              gen_random_uuid(), 'Zkouška nasucho', 60, now(),
--              (SELECT jsonb_agg(jsonb_build_object(
--                        'id', q.id, 'otazka', q.question,
--                        'vybrano', q.options ->> q.correct_index,
--                        'jistota', 'know', 'po_limitu', false))
--               FROM (SELECT * FROM public.quiz_questions LIMIT 5) q));
--       -- očekáváno: 5 / 100 / true
--
--       -- 2. Podvržené skóre přes přímý zápis neprojde s razítkem:
--       INSERT INTO public.quiz_results
--         (user_id, subject, total_questions, correct_answers, accuracy, overeno)
--       VALUES (auth.uid(), 'Podvrh', 50, 50, 100, true);
--       -- očekáváno: new row violates row-level security policy (42501)
--     ROLLBACK;
