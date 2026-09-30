-- ============================================================================
-- 047  Oprava čtyř věcně chybných otázek
-- ============================================================================
--
-- CO BYLO ŠPATNĚ (ověřeno proti znění z e-Sbírky, public/data/esbirka)
-- • Lhůta ke kázeňskému trestu odsouzeného: otázka tvrdila „1 měsíc od
--   zjištění, nejpozději 1 rok“ a odkazovala na § 52. Zákon č. 169/1999 Sb.
--   zná jen lhůtu 1 roku od spáchání (§ 47 odst. 3); § 52 upravuje stížnost.
--   Lhůta 15 dnů / 1 měsíc platí jen pro obviněné (§ 23 odst. 3 z. 293/1993 Sb.).
-- • Povinnost před použitím střelné zbraně: otázka citovala § 20 a jako
--   povinnost uváděla výstražný výstřel. Výzvu s výstrahou ukládá § 18 odst. 3
--   zákona č. 555/1992 Sb.; varovný výstřel je donucovací prostředek podle
--   § 17 odst. 2 písm. m) a § 20 upravuje povinnosti až po použití zbraně.
-- • Obálky typu I a II: dvě otázky si odporovaly v barvě pruhu (typ II jednou
--   zelený, jednou červený). Barvu žádný předpis ani podklad ZOP neuvádí,
--   proto se z obou otázek odstraňuje; věcný obsah zůstává. U obálky typu II
--   se opravuje odkaz § 64 odst. 4 TŘ na § 64 odst. 5 a 6 TŘ.
--
-- Otázky se hledají podle původního znění; kdo je mezitím upravil, tomu se
-- nepřepíšou. Skript je idempotentní.
-- ============================================================================

BEGIN;

-- 1. Lhůta k uložení kázeňského trestu odsouzenému (va_27)
UPDATE public.quiz_questions
   SET question      = 'Do kdy nejpozději lze odsouzenému uložit kázeňský trest podle § 47 odst. 3 zákona č. 169/1999 Sb.?',
       options       = '["Do 24 hodin od spáchání, jinak se přestupek už nemůže projednat.", "Do 1 roku od spáchání přestupku; kratší lhůtu od zjištění zákon nestanoví.", "Do 1 měsíce ode dne, kdy se o něm zaměstnanec dozvěděl, a nejpozději do 1 roku od spáchání.", "Kdykoli během výkonu trestu, lhůtu zákon nijak neomezuje."]'::jsonb,
       correct_index = 1,
       explanation   = 'Podle § 47 odst. 3 zákona č. 169/1999 Sb. nelze kázeňský trest uložit, jestliže od spáchání kázeňského přestupku uplynula doba jednoho roku. Kratší lhůtu počítanou od zjištění přestupku zákon u odsouzených nestanoví; lhůtu 15 dnů od zjištění a nejvýše 1 měsíc od porušení kázně má jen řízení s obviněnými (§ 23 odst. 3 zákona č. 293/1993 Sb.). (Právní úprava: § 47 odst. 3 zákona č. 169/1999 Sb., o výkonu trestu odnětí svobody)',
       source        = '§ 47 odst. 3 zákona č. 169/1999 Sb., o výkonu trestu odnětí svobody'
 WHERE question = 'V jaké zákonné lhůtě od zjištění kázeňského přestupku odsouzeného musí být přestupek projednán a uložen kázeňský trest dle § 52 zákona o VTOS?'
   AND NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE question = 'Do kdy nejpozději lze odsouzenému uložit kázeňský trest podle § 47 odst. 3 zákona č. 169/1999 Sb.?');

-- 2. Povinnost před použitím střelné zbraně (sp-46)
UPDATE public.quiz_questions
   SET question      = 'Jaká povinnost příslušníka VS ČR předchází použití střelné zbraně podle § 18 odst. 3 zákona č. 555/1992 Sb.?',
       options       = '["Vyzvat osobu, aby upustila od protiprávního jednání, s výstrahou, že bude použito střelné zbraně.", "Vystřelit nejprve varovný výstřel do vzduchu; ústní výzvu zákon nepožaduje.", "Vyžádat si vždy předchozí písemný souhlas ředitele věznice nebo státního zástupce.", "Nejprve vždy použít slzotvorný prostředek a pouta a teprve po jejich selhání tasit a použít střelnou zbraň."]'::jsonb,
       correct_index = 0,
       explanation   = 'Podle § 18 odst. 3 zákona č. 555/1992 Sb. je příslušník před použitím střelné zbraně v případech podle odst. 1 písm. a) až d) povinen vyzvat osobu, aby upustila od protiprávního jednání, s výstrahou, že bude použito střelné zbraně. Upustit od výzvy smí jen tehdy, je-li ohrožen život nebo zdraví a zákrok nesnese odkladu. Varovný výstřel není povinnou součástí výzvy, je to samostatný donucovací prostředek podle § 17 odst. 2 písm. m); § 20 upravuje až povinnosti po použití zbraně. (Právní úprava: § 18 odst. 3 zákona č. 555/1992 Sb., o VS a JS ČR)',
       source        = '§ 18 odst. 3 zákona č. 555/1992 Sb., o VS a JS ČR'
 WHERE question = 'Jaká povinnost příslušníka VS ČR předchází použití zbraně podle § 20 zákona č. 555/1992 Sb., je-li to s ohledem na okolnosti možné?'
   AND NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE question = 'Jaká povinnost příslušníka VS ČR předchází použití střelné zbraně podle § 18 odst. 3 zákona č. 555/1992 Sb.?');

-- 3. Obálka typu II bez fikce doručení (sp-33)
UPDATE public.quiz_questions
   SET question      = 'U kterého typu soudní obálky NIKDY nenastává fikce doručení vhozením do schránky?',
       options       = '["Obálka typu I – standardní zásilka, kde je vhození do schránky přísně zakázáno a po 3 dnech dochází ke skartaci.", "Obálka typu II – do vlastních rukou s vyloučením vložení do schránky (např. platební rozkaz); po 10 dnech se vrací soudu.", "Obálka typu III – určená výhradně pro doručování mezinárodních zatykačů a předvolání svědků s fikcí po 30 dnech.", "Obálka typu IV – písemnost doručovaná výhradně statutárním orgánům právnických osob do datové schránky s okamžitým účinkem."]'::jsonb,
       correct_index = 1,
       explanation   = 'U obálky typu II je náhradní doručení vložením do schránky vyloučeno (§ 49 odst. 5 OSŘ); doručující orgán vrátí písemnost soudu po marném uplynutí 10 dnů od jejího připravení k vyzvednutí. V trestním řízení totéž platí pro písemnosti podle § 64 odst. 5 a 6 trestního řádu (např. obžaloba, rozsudek, trestní příkaz). (Právní úprava: § 49 odst. 5 zákona č. 99/1963 Sb. (OSŘ) a § 64 odst. 5 a 6 trestního řádu)',
       source        = '§ 49 odst. 5 zákona č. 99/1963 Sb. (OSŘ) a § 64 odst. 5 a 6 trestního řádu'
 WHERE question = 'U kterého typu soudní obálky NIKDY nenastává fikce doručení vhozením do schránky (§ 146 / OSŘ)?'
   AND NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE question = 'U kterého typu soudní obálky NIKDY nenastává fikce doručení vhozením do schránky?');

-- 4. Rozdíl obálek typu I a II (bs-04)
UPDATE public.quiz_questions
   SET question      = 'Jaký je rozdíl mezi doručováním písemností soudu v obálce typu I a v obálce typu II?',
       options       = '["Typ I je určen výhradně pro orgány činné v trestním řízení s fikcí po 15 dnech; Typ II se doručuje civilním osobám a vhazuje se do schránky ihned při nezastižení adresáta.", "Typ I se doručuje výhradně do vlastních rukou bez možnosti náhradního doručení; Typ II umožňuje po 3 dnech uložení vhození do domovní schránky s okamžitým účinkem doručení. Fikce doručení nastává u obou typů vždy až po uplynutí třiceti dnů od uložení na poště.", "Typ I i Typ II umožňují vhození do schránky po 10 dnech, ale u Typu II musí doručující příslušník JS osobně ověřit přítomnost adresáta u sousedů a vyhotovit úřední záznam pro Policii ČR.", "Typ I umožňuje náhradní doručení (po 10 dnech vyvěšení/výzvy se vhodí do schránky s fikcí doručení). Typ II je striktně do vlastních rukou bez vhození do schránky (pokud nevyzvedne, vrací se odesílateli bez fikce vhozením)."]'::jsonb,
       correct_index = 3,
       explanation   = 'Dle občanského soudního řádu (§ 49 a násl. OSŘ): Zásilka typu I připouští náhradní doručení vhozením do schránky po uplynutí 10denní úložní lhůty (fikce doručení). U zásilky typu II je vhození vyloučeno předsedou senátu a při nevyzvednutí se vrací soudu. (Právní úprava: Zákon č. 99/1963 Sb., občanský soudní řád (OSŘ) a kancelářský řád)',
       source        = 'Zákon č. 99/1963 Sb., občanský soudní řád (OSŘ) a kancelářský řád'
 WHERE question = 'Jaký je rozdíl mezi doručováním písemností soudu typu I (zelený pruh) a typu II (červený pruh)?'
   AND NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE question = 'Jaký je rozdíl mezi doručováním písemností soudu v obálce typu I a v obálce typu II?');

COMMIT;

-- Kontrola po spuštění (má vrátit 4):
-- SELECT count(*) FROM public.quiz_questions WHERE question IN (
--   'Do kdy nejpozději lze odsouzenému uložit kázeňský trest podle § 47 odst. 3 zákona č. 169/1999 Sb.?',
--   'Jaká povinnost příslušníka VS ČR předchází použití střelné zbraně podle § 18 odst. 3 zákona č. 555/1992 Sb.?',
--   'U kterého typu soudní obálky NIKDY nenastává fikce doručení vhozením do schránky?',
--   'Jaký je rozdíl mezi doručováním písemností soudu v obálce typu I a v obálce typu II?');
