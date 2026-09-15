-- ═════════════════════════════════════════════════════════════════════════════
-- 019 — Výkon: překrývající se politiky, InitPlan u auth.uid() a indexy
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editor. Je idempotentní.
--
-- Řeší nálezy výkonnostního advisoru. ŽÁDNÝ z nich nemění to, kdo co smí —
-- každé sloučení níže je doložené tím, že sjednocení politik zůstává stejné.
--
-- 1. multiple_permissive_policies (14×)
--    Permisivní politiky se slučují přes OR, takže každá navíc znamená výraz
--    vyhodnocený pro každý řádek. Většina překryvů tu vznikla tak, že vedle
--    sebe zůstaly starší anglicky pojmenované politiky a jejich české nástupkyně.
--
-- 2. auth_rls_initplan (15×)
--    `auth.uid()` v politice se vyhodnocuje pro každý řádek. Obalení do
--    `(select auth.uid())` z něj udělá InitPlan, který Postgres spočítá jednou
--    za dotaz. Totéž platí pro bezparametrové pomocné funkce is_admin(),
--    is_staff() a my_role(). NEPLATÍ pro can_manage_class(class_name), která
--    bere sloupec, a proto na řádku záviset musí — ta zůstává beze změny.
--
-- 3. unindexed_foreign_keys (3×) a duplicate_index (1×)
-- ═════════════════════════════════════════════════════════════════════════════

-- ─── 1. class_boards: zahodit nadbytečnou politiku ALL ───────────────────────
--
-- "Lecturers and admins can manage class boards" (ALL) nepřidává NIC, co by
-- už nepokrývaly čtyři konkrétní politiky vedle ní:
--
--   SELECT — "Čtení tříd pro přihlášené" má USING (true), tedy nadmnožina
--   DELETE — "Mazat třídu smí jen lektor a správce" má is_staff(), což je
--            přesně totéž co její inline EXISTS nad profiles
--   INSERT — "Zakládat třídu…" má can_manage_class(class_name), a protože
--   UPDATE   can_manage_class = is_staff() OR (velitel vlastní třídy), jde
--            zase o nadmnožinu
--
-- Odchází s ní i inline poddotaz nad profiles, tedy tvar, který migrace 017
-- odstraňovala jinde.

DROP POLICY IF EXISTS "Lecturers and admins can manage class boards" ON public.class_boards;

-- ─── 2. quiz_questions: totéž ────────────────────────────────────────────────
--
-- quiz_questions_write (ALL, inline EXISTS nad profiles) je celá pokrytá:
-- SELECT má quiz_questions_select s USING (true), zápisové akce mají tři
-- politiky s is_staff(), což je stejná podmínka. Migrace 017 už převod
-- z inline dotazu na is_staff() začala, tohle ho dokončuje.

DROP POLICY IF EXISTS "quiz_questions_write" ON public.quiz_questions;

-- ─── 3. user_notifications: zahodit anglické pozůstatky ──────────────────────
--
--   "Admins can send notifications"        INSERT, inline EXISTS  = is_admin()
--                                          → shodná s "Pouze správce může odesílat zprávy"
--   "Users can read their own notifications"   SELECT, user_id = auth.uid()
--                                          → podmnožina české politiky, která má OR is_admin()
--   "Users can update their own notifications" UPDATE, jen USING bez WITH CHECK
--                                          → Postgres v tom případě použije USING i jako
--                                            WITH CHECK, takže je shodná s českou politikou

DROP POLICY IF EXISTS "Admins can send notifications"          ON public.user_notifications;
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;

-- ─── 4. global_announcements: rozdělit ALL na zápisové akce ──────────────────
--
-- Tady nadbytečná není: potřebuje INSERT/UPDATE/DELETE pro lektora a správce.
-- Překrývá se jen ve čtení, kde vedle ní stojí "Čtení hlášení pro přihlášené"
-- s USING (true). Rozdělením na tři zápisové politiky překryv zmizí a čtení
-- zůstává na jediné politice.

DROP POLICY IF EXISTS "Zápis hlášení jen pro lektora a správce"   ON public.global_announcements;
DROP POLICY IF EXISTS "Vkládat hlášení smí jen lektor a správce"  ON public.global_announcements;
DROP POLICY IF EXISTS "Upravovat hlášení smí jen lektor a správce" ON public.global_announcements;
DROP POLICY IF EXISTS "Mazat hlášení smí jen lektor a správce"    ON public.global_announcements;

CREATE POLICY "Vkládat hlášení smí jen lektor a správce"
  ON public.global_announcements FOR INSERT TO authenticated
  WITH CHECK ((select public.is_staff()));

CREATE POLICY "Upravovat hlášení smí jen lektor a správce"
  ON public.global_announcements FOR UPDATE TO authenticated
  USING ((select public.is_staff()))
  WITH CHECK ((select public.is_staff()));

CREATE POLICY "Mazat hlášení smí jen lektor a správce"
  ON public.global_announcements FOR DELETE TO authenticated
  USING ((select public.is_staff()));

-- ─── 5. profiles: sloučit dvě politiky UPDATE a obalit auth.uid() ────────────
--
-- Dvě politiky UPDATE vedle sebe daly dohromady toto:
--
--   USING       is_admin() OR auth.uid() = id
--   WITH CHECK  is_admin() OR (auth.uid() = id AND role = my_role())
--
-- Sloučená politika má přesně tenhle výraz, takže se nemění vůbec nic:
-- správce smí upravit jakýkoli profil včetně role, ostatní jen svůj vlastní
-- řádek a jen tak, aby role zůstala stejná. Porovnání `role = my_role()` dál
-- staví novou hodnotu proti staré, protože STABLE funkce vidí snímek z doby
-- před UPDATE — eskalace role tedy neprojde ani po sloučení.

DROP POLICY IF EXISTS "Povolit vytvoření vlastního profilu" ON public.profiles;
CREATE POLICY "Povolit vytvoření vlastního profilu"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id AND role = 'student');

DROP POLICY IF EXISTS "Čtení vlastního profilu, správce čte všechny" ON public.profiles;
CREATE POLICY "Čtení vlastního profilu, správce čte všechny"
  ON public.profiles FOR SELECT TO authenticated
  USING ((select auth.uid()) = id OR (select public.is_admin()));

DROP POLICY IF EXISTS "Pouze administrátor může měnit role"           ON public.profiles;
DROP POLICY IF EXISTS "Povolit úpravu vlastního jména bez změny role" ON public.profiles;
DROP POLICY IF EXISTS "Úprava profilu: správce vše, ostatní vlastní bez změny role" ON public.profiles;

CREATE POLICY "Úprava profilu: správce vše, ostatní vlastní bez změny role"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((select public.is_admin()) OR (select auth.uid()) = id)
  WITH CHECK (
    (select public.is_admin())
    OR ((select auth.uid()) = id AND role = (select public.my_role()))
  );

-- ─── 6. quiz_results: sloučit dvě politiky SELECT a obalit auth.uid() ────────
--
-- "Povolit čtení vlastních výsledků" (auth.uid() = user_id) a "Správce může
-- číst všechny výsledky testů" (is_admin()) se slučovaly přes OR. Sloučená
-- politika má stejný výraz.

DROP POLICY IF EXISTS "Povolit čtení vlastních výsledků"        ON public.quiz_results;
DROP POLICY IF EXISTS "Správce může číst všechny výsledky testů" ON public.quiz_results;
DROP POLICY IF EXISTS "Čtení vlastních výsledků, správce čte všechny" ON public.quiz_results;

CREATE POLICY "Čtení vlastních výsledků, správce čte všechny"
  ON public.quiz_results FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id OR (select public.is_admin()));

DROP POLICY IF EXISTS "Povolit vkládání vlastních výsledků" ON public.quiz_results;
CREATE POLICY "Povolit vkládání vlastních výsledků"
  ON public.quiz_results FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Povolit mazání vlastních výsledků" ON public.quiz_results;
CREATE POLICY "Povolit mazání vlastních výsledků"
  ON public.quiz_results FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ─── 7. user_feedback a user_notifications: obalit auth.uid() ────────────────
--
-- Podmínka `user_id IS NULL OR …` u vkládání zpětné vazby zůstává: dovoluje
-- podnět bez vazby na účet.

DROP POLICY IF EXISTS "Vkládání vlastní zpětné vazby" ON public.user_feedback;
CREATE POLICY "Vkládání vlastní zpětné vazby"
  ON public.user_feedback FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR (select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Čtení vlastní zpětné vazby, lektor a správce čtou vše" ON public.user_feedback;
CREATE POLICY "Čtení vlastní zpětné vazby, lektor a správce čtou vše"
  ON public.user_feedback FOR SELECT TO authenticated
  USING ((select public.is_staff()) OR (select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Uživatel čte vlastní zprávy, správce všechny" ON public.user_notifications;
CREATE POLICY "Uživatel čte vlastní zprávy, správce všechny"
  ON public.user_notifications FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id OR (select public.is_admin()));

DROP POLICY IF EXISTS "Uživatel označuje vlastní zprávy jako přečtené" ON public.user_notifications;
CREATE POLICY "Uživatel označuje vlastní zprávy jako přečtené"
  ON public.user_notifications FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ─── 8. Indexy nad cizími klíči ──────────────────────────────────────────────
--
-- Bez nich musí Postgres při mazání nebo změně rodičovského řádku projít
-- celou podřízenou tabulku.

CREATE INDEX IF NOT EXISTS idx_class_boards_created_by   ON public.class_boards(created_by);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_created_by ON public.quiz_questions(created_by);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id     ON public.user_feedback(user_id);

-- ─── 9. Duplicitní unikátní index nad quiz_questions(question) ───────────────
--
-- Na produkci existují dva shodné unikátní indexy nad stejným sloupcem:
--
--   unique_question_text                — krytý stejnojmenným CONSTRAINTEM
--   idx_quiz_questions_question_unique  — samostatný index bez constraintu
--
-- Zahodit se smí jen ten druhý, protože index krytý constraintem Postgres
-- přímo zahodit nedovolí. POZOR ale na čistou instalaci: quiz_questions.sql
-- zakládá POUZE idx_quiz_questions_question_unique, takže bezpodmínečné
-- zahození by tam unikátnost sebralo úplně a rozbilo upsert otázek podle
-- jejich textu. Constraint se proto nejdřív doplní, chybí-li.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_question_text'
      AND conrelid = 'public.quiz_questions'::regclass
  ) THEN
    ALTER TABLE public.quiz_questions
      ADD CONSTRAINT unique_question_text UNIQUE (question);
  END IF;
END $$;

DROP INDEX IF EXISTS public.idx_quiz_questions_question_unique;

-- ─── 10. Ověření ─────────────────────────────────────────────────────────────
--
-- (a) Překryvy. Dotaz musí vrátit prázdno — žádná dvojice politik nad stejnou
--     tabulkou, rolí a akcí. ALL se rozepisuje na všechny čtyři akce.

WITH rozepsane AS (
  SELECT p.tablename, p.policyname, r.role, a.akce
  FROM pg_policies p
  CROSS JOIN LATERAL unnest(p.roles) AS r(role)
  CROSS JOIN LATERAL unnest(
    CASE WHEN p.cmd = 'ALL'
         THEN ARRAY['SELECT','INSERT','UPDATE','DELETE']
         ELSE ARRAY[p.cmd] END
  ) AS a(akce)
  WHERE p.schemaname = 'public' AND p.permissive = 'PERMISSIVE'
)
SELECT tablename, role, akce, count(*) AS politik, string_agg(policyname, ' + ') AS ktere
FROM rozepsane
GROUP BY tablename, role, akce
HAVING count(*) > 1
ORDER BY tablename, akce;

-- (b) Přehled politik, které sahají na auth.*. V každém výrazu musí stát
--     `( SELECT auth.uid() …)`, ne holé `auth.uid()`. Postgres v operátoru ~
--     neumí zpětný test, takže se to kontroluje okem — a závazně tím, že se
--     znovu spustí výkonnostní advisor, kde má auth_rls_initplan klesnout na 0.

SELECT tablename, policyname, cmd,
       coalesce(qual,'-')       AS using_expr,
       coalesce(with_check,'-') AS check_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND (coalesce(qual,'') LIKE '%auth.%' OR coalesce(with_check,'') LIKE '%auth.%')
ORDER BY tablename, cmd, policyname;

-- (c) Unikátnost nad question musí zůstat právě jedna:

SELECT i.relname AS index_name, idx.indisunique AS je_unique
FROM pg_index idx
JOIN pg_class i ON i.oid = idx.indexrelid
JOIN pg_class t ON t.oid = idx.indrelid
WHERE t.relname = 'quiz_questions' AND idx.indisunique;

-- (d) Ruční zkouška v aplikaci: student vidí jen své výsledky a své zprávy,
--     správce vidí všechny; lektor smí upravit otázku i nástěnku; velitel
--     třídy smí upravit nástěnku své vlastní třídy a cizí ne.

-- ─── Co se ZÁMĚRNĚ nemění ────────────────────────────────────────────────────
--
-- Politiky nad class_boards s can_manage_class(class_name) zůstávají bez
-- obalení do (select …). Funkce bere sloupec, takže na řádku záviset MUSÍ —
-- obalení by ji spočítalo jednou a rozbilo oprávnění velitele třídy.
--
-- unused_index (8×) se neřeší. Jde o úroveň INFO a příčina je nejspíš nízký
-- provoz, ne zbytečnost indexu: statistiky se počítají od posledního resetu.
-- Zahodit index, který se „zatím nepoužil", znamená riskovat, že se pak bude
-- hledat, proč je dotaz pomalý.
