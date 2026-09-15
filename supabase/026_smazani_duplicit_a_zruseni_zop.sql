-- ═════════════════════════════════════════════════════════════════════════════
-- 026 — Smazání zdvojených otázek a zrušení předmětu ZOP
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editoru. Je idempotentní.
--
-- Skript MAŽE DATA. Krok 1 vypíše, co půjde pryč, ještě než se to stane.
-- Celé znění mazaných otázek včetně distraktorů je v souboru
-- supabase/026_zaloha_smazanych_duplicit.txt.
--
-- NÁLEZ 1 — třináct otázek se ptá na totéž jako jiná otázka v bance
--   Ve Zdravovědě byla resuscitace i popáleniny třikrát. Většinu zdvojení
--   způsobilo to, že sedm otázek o první pomoci bylo napsaných do
--   sluzebniPriprava.ts vedle už existujících zdr-*; migrace 022 je přeřadila
--   do Zdravovědy a tím se dvojice dostaly vedle sebe.
--
--   Unikátní index na sloupci question je nezachytil — znění se lišilo, shodná
--   byla až odpověď.
--
--   Z každé dvojice zůstává ta úplnější (rozpis v záložním souboru).
--   Zdravověda klesá z 36 na 25, Penologie z 54 na 53, Služební příprava
--   přijde o jednu duplicitu (bs-05, totéž co sp-31).
--
-- NÁLEZ 2 — předmět „ZOP" se ruší
--   Základní odborná příprava je celý kurz, ne okruh vedle Práva a Penologie.
--   Jeho čtyři otázky — povinnost zakročit, prokazování příslušnosti k VS ČR,
--   hodnostní sbory a pořadová příprava — jsou služební příprava a přecházejí
--   pod ni.
--
--   Karta ZOP zůstává v subjectsInfo.ts, ale bez otázek se v Předmětech
--   nenabídne. Parser importních šablon nově posílá „zop" i „základní odborná
--   příprava" do Služební přípravy.
--
-- VÝSLEDEK: 377 → 364 otázek, Služební příprava 60 a je největší.
--
-- Stejná úprava je i v repozitáři, takže se synchronizací výchozích otázek
-- nevrátí zpátky. Seznamy jsou vygenerované z repozitáře, ne psané ručně.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─── 1. Co půjde pryč (spusťte a podívejte se, než pustíte krok 2) ──────────
--
-- Očekávaný výsledek při prvním spuštění: 13 řádků. Při opakovaném nic.

SELECT subject AS predmet, left(question, 70) AS otazka
FROM public.quiz_questions
WHERE question IN (
  'Jaký je správný a okamžitý postup při masivním tepenném krvácení z končetiny (např. po bodném poranění)?',
  'Jaký je správný poměr stlačování hrudníku a umělých vdechů při základní resuscitaci dospělého a jaká je frekvence dle ERC Guidelines?',
  'Jaká je správná první pomoc při termickém popálení pokožky II. stupně (puchýře)?',
  'Jak se v taktické první pomoci (TCCC) ošetřuje otevřené poranění hrudníku (nasávající rána hrudníku)?',
  'Jaké jsou příznaky a první pomoc při těžké alergické reakci (anafylaxi) s otokem dýchacích cest?',
  'Jaká je správná první pomoc při záchvatu křečí s bezvědomím (epileptický záchvat typu Grand Mal)?',
  'Jaká jsou základní pravidla první pomoci při termických popáleninách II. a III. stupně?',
  'Jaké je základní pravidlo pro znehybnění (fixaci) zavřené zlomeniny dlouhé kosti (např. předloktí nebo bérce)?',
  'Jaké jsou typické příznaky předávkování opioidy (např. heroin, fentanyl) a jaká je první pomoc?',
  'Kdy se používá zotavovací (stabilizovaná) poloha na boku?',
  'Jaký je správný poměr stlačení hrudníku a umělých vdechů při poskytování KPR u dospělé osoby v bezvědomí bez normálního dýchání?',
  'Jakými způsoby je poskytována zdravotní péče vězněným osobám v systému VS ČR?',
  'Kdo nese zavazadlo s penězi a ceninami při pěším doprovodu pokladní soudu příslušníky Justiční stráže?'
)
ORDER BY subject, question;

-- ─── 2. Smazání duplicit ─────────────────────────────────────────────────────

DELETE FROM public.quiz_questions
WHERE question IN (
  'Jaký je správný a okamžitý postup při masivním tepenném krvácení z končetiny (např. po bodném poranění)?',
  'Jaký je správný poměr stlačování hrudníku a umělých vdechů při základní resuscitaci dospělého a jaká je frekvence dle ERC Guidelines?',
  'Jaká je správná první pomoc při termickém popálení pokožky II. stupně (puchýře)?',
  'Jak se v taktické první pomoci (TCCC) ošetřuje otevřené poranění hrudníku (nasávající rána hrudníku)?',
  'Jaké jsou příznaky a první pomoc při těžké alergické reakci (anafylaxi) s otokem dýchacích cest?',
  'Jaká je správná první pomoc při záchvatu křečí s bezvědomím (epileptický záchvat typu Grand Mal)?',
  'Jaká jsou základní pravidla první pomoci při termických popáleninách II. a III. stupně?',
  'Jaké je základní pravidlo pro znehybnění (fixaci) zavřené zlomeniny dlouhé kosti (např. předloktí nebo bérce)?',
  'Jaké jsou typické příznaky předávkování opioidy (např. heroin, fentanyl) a jaká je první pomoc?',
  'Kdy se používá zotavovací (stabilizovaná) poloha na boku?',
  'Jaký je správný poměr stlačení hrudníku a umělých vdechů při poskytování KPR u dospělé osoby v bezvědomí bez normálního dýchání?',
  'Jakými způsoby je poskytována zdravotní péče vězněným osobám v systému VS ČR?',
  'Kdo nese zavazadlo s penězi a ceninami při pěším doprovodu pokladní soudu příslušníky Justiční stráže?'
);

-- ─── 3. Zrušení předmětu ZOP ─────────────────────────────────────────────────

UPDATE public.quiz_questions SET subject = 'Služební příprava'
WHERE subject = 'ZOP';

-- ─── 4. Ověření ──────────────────────────────────────────────────────────────
--
-- Rozdělení podle předmětů. Musí dát 364 a odpovídat repozitáři:
--
--   Služební příprava 60 · Právo 57 · Profesní etika 57 · Penologie 53
--   Psychologie 42 · Pedagogika 31 · Vězeňská administrativa 29
--   Zdravověda a první pomoc 25 · Zbraně 10
--
-- Předměty „ZOP", „Bezpečnostní služba" a „Taktika" se už nesmí objevit.

SELECT subject AS predmet, count(*) AS otazek
FROM public.quiz_questions
GROUP BY subject
ORDER BY count(*) DESC, subject;

SELECT count(*) AS celkem FROM public.quiz_questions;
