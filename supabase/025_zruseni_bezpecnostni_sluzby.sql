-- ═════════════════════════════════════════════════════════════════════════════
-- 025 — Předmět „Bezpečnostní služba" se ruší
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editoru. Je idempotentní.
--
-- NÁLEZ
--   Takový předmět se na Akademii VS ČR nevyučuje. Strážní, dozorčí a eskortní
--   služba, služba justiční stráže, prohlídky a vstupy do objektů — to všechno
--   je služební příprava. V bance to ale stálo jako samostatný předmět s 36
--   otázkami.
--
-- ŘEŠENÍ
--   34 otázek přechází do Služební přípravy. Dvě jinam, protože do služební
--   přípravy obsahem nepatří:
--
--     bs-04  „Jaký je rozdíl mezi doručováním písemností soudu typu I a II?"
--            → Vězeňská administrativa. Je to o soudních písemnostech a týž
--              okruh už tam je (viz sp-33).
--
--     bs-08  „Jaký je hmotnostní limit pro balíček …?"
--            → Penologie. Balíčky upravuje § 24 zákona č. 169/1999 Sb.
--              a v Penologii je k témuž pen-41.
--
--   Služební příprava tím roste na 57 otázek a je spolu s Právem největší,
--   což odpovídá tomu, jak je na Akademii vážená.
--
--   Karta „Bezpečnostní služba" zůstává v subjectsInfo.ts, ale bez otázek se
--   v Předmětech nenabídne — prázdné okruhy se skrývají samy.
--
--   Stejná úprava je i v repozitáři (bezpecnostniSluzba.ts, sluzebniPriprava.ts),
--   takže se synchronizací výchozích otázek nevrátí zpátky. Parser importních
--   šablon nově posílá „bezpečnostní služba", „strážní" i „dozorčí" rovnou do
--   Služební přípravy.
--
-- Seznamy jsou vygenerované z repozitáře, ne psané ručně.
-- ═════════════════════════════════════════════════════════════════════════════

-- Nejdřív dvě výjimky, teprve pak zbytek. Porovnává se proti předmětu, ne proti
-- vyjmenovaným textům: v bance je „Bezpečnostní služba" právě těch 36 otázek,
-- takže je pravidlo úplné a opakované spuštění už nenajde co měnit.

UPDATE public.quiz_questions SET subject = 'Vězeňská administrativa'
WHERE subject = 'Bezpečnostní služba'
  AND question LIKE 'Jaký je rozdíl mezi doručováním písemností soudu%';

UPDATE public.quiz_questions SET subject = 'Penologie'
WHERE subject = 'Bezpečnostní služba'
  AND question LIKE 'Jaký je hmotnostní limit pro balíček%';

UPDATE public.quiz_questions SET subject = 'Služební příprava'
WHERE subject = 'Bezpečnostní služba';

-- ─── Ověření ─────────────────────────────────────────────────────────────────
--
-- Rozdělení podle předmětů. Musí dát 377 a odpovídat repozitáři:
--
--   Právo 57 · Služební příprava 57 · Profesní etika 57 · Penologie 54
--   Psychologie 42 · Zdravověda a první pomoc 36 · Pedagogika 31
--   Vězeňská administrativa 29 · Zbraně 10 · ZOP 4
--
-- Předmět „Bezpečnostní služba" se ve výsledku už nesmí objevit.

SELECT subject AS predmet, count(*) AS otazek
FROM public.quiz_questions
GROUP BY subject
ORDER BY count(*) DESC, subject;

SELECT count(*) AS zbyva_bezpecnostni_sluzba
FROM public.quiz_questions
WHERE subject = 'Bezpečnostní služba';
