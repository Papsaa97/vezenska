-- ============================================================================
-- 050  Otázky podle NGŘ č. 2/2026 o dozorčí službě
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- NGŘ č. 2/2026 (účinné od 1. 3. 2026) zrušilo NGŘ č. 2/2022. Nově zavádí
-- funkci vrchního inspektora dozorčí služby: dosavadní inspektor DS se stal
-- vrchním inspektorem a pod něj přibyl nový inspektor DS. Paragrafy se proto
-- posunuly (OVV od § 28 o +1, OVT od § 62 o +2, dozorčí stanoviště § 103 →
-- § 106). Deset otázek v bance citovalo staré NGŘ, tři z nich tvrdily něco,
-- co už neplatí:
-- • sp-53: dozorce OVT je přímo podřízen VRCHNÍMU inspektorovi DS (§ 64).
-- • sp-127: vrchnímu inspektorovi strážní služby je v mimopracovní době
--   podřízen vrchní inspektor DS (§ 60 odst. 1), ne inspektor DS.
-- • pen-81: léky odsouzeným vydává vrchní inspektor DS OVT (§ 61 písm. q)).
-- Další otázky citovaly body „§ 3.6 / 3.8 / 3.10 / 3.12“, které v NGŘ
-- neexistují, a pen-79 měl pravidlo z vyhlášky č. 345/1999 Sb. připsané NGŘ.
--
-- CO TENHLE SKRIPT DĚLÁ
-- Přepíše 10 otázek (znění, možnosti, správnou odpověď, vysvětlení, pramen
-- a okruh) podle repozitáře (src/data/questions). Otázka se hledá podle
-- znění; u sp-127, kde se znění mění, se nepřepíše, pokud nové už v tabulce
-- je. Skript je idempotentní: druhé spuštění nic nezmění.
-- Modelové situace se v databázi nepřepisují, jsou jen v repozitáři.
-- ============================================================================

BEGIN;

-- 1. sp-53: dozorce OVT je nově přímo podřízen vrchnímu inspektorovi dozorčí služby, ne inspektorovi DS (§ 64 odst. 1 NGŘ č. 2/2026)
UPDATE public.quiz_questions
   SET question      = 'Komu je dozorce oddělení výkonu trestu přímo podřízen?',
       options       = to_jsonb(ARRAY['Vrchnímu inspektorovi dozorčí služby OVT', 'Vrchnímu inspektorovi strážní služby', 'Vychovateli oddílu, na kterém koná službu', 'Inspektorovi dozorčí služby OVT ve směně']),
       correct_index = 0,
       explanation   = 'Dozorce oddělení výkonu trestu je přímo podřízen vrchnímu inspektorovi dozorčí služby oddělení výkonu trestu; inspektor dozorčí služby jeho nadřízeným ve směně není. Pokyny vychovatele respektuje jen v oblasti realizace práv a oprávněných zájmů odsouzených. (Právní úprava: § 64 odst. 1 a 5 NGŘ č. 2/2026)',
       source        = '§ 64 odst. 1 a 5 NGŘ č. 2/2026',
       topic         = 'Dozorčí služba – ubytovna odsouzených'
 WHERE question = 'Komu je dozorce oddělení výkonu trestu přímo podřízen?';

-- 2. sp-127: v mimopracovní době je vrchnímu inspektorovi strážní služby podřízen vrchní inspektor DS; otázka se ptá na něj (§ 60 odst. 1 NGŘ č. 2/2026)
UPDATE public.quiz_questions
   SET question      = 'Komu je vrchní inspektor dozorčí služby OVT podřízen v mimopracovní době věznice?',
       options       = to_jsonb(ARRAY['Inspektorovi strážní služby operátorovi', 'Řediteli věznice osobně', 'Vedoucímu oddělení výkonu trestu', 'Vrchnímu inspektorovi strážní služby']),
       correct_index = 3,
       explanation   = 'Vrchní inspektor dozorčí služby oddělení výkonu trestu je přímo podřízen určenému zástupci vedoucího oddělení a nadřízen inspektorovi dozorčí služby i dozorcům ve směně; v mimopracovní době věznice je podřízen vrchnímu inspektorovi strážní služby. Inspektor dozorčí služby je od NGŘ č. 2/2026 podřízen vrchnímu inspektorovi dozorčí služby. (Právní úprava: § 60 odst. 1 a § 62 odst. 1 NGŘ č. 2/2026)',
       source        = '§ 60 odst. 1 a § 62 odst. 1 NGŘ č. 2/2026',
       topic         = 'Organizace dozorčí služby'
 WHERE question = 'Komu je inspektor dozorčí služby (IDS) podřízen v mimopracovní době věznice?'
   AND NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE question = 'Komu je vrchní inspektor dozorčí služby OVT podřízen v mimopracovní době věznice?');

-- 3. pen-81: výdej léků odsouzeným nově zajišťuje vrchní inspektor dozorčí služby OVT (§ 61 písm. q) NGŘ č. 2/2026)
UPDATE public.quiz_questions
   SET question      = 'Kdo zajišťuje výdej léků odsouzeným v případech, kdy jej neprovádí zdravotnický pracovník (a není pověřen jiný zaměstnanec)?',
       options       = to_jsonb(ARRAY['Dozorce oddílu, na kterém je odsouzený', 'Vychovatel oddílu odsouzeného', 'Inspektor dozorčí služby OVT', 'Vrchní inspektor dozorčí služby OVT']),
       correct_index = 3,
       explanation   = 'Výdej léků v intervalech a dávkách stanovených lékařem zajišťuje od NGŘ č. 2/2026 vrchní inspektor dozorčí služby oddělení výkonu trestu (dříve inspektor dozorčí služby), u obviněných vrchní dozorce oddělení výkonu vazby, v jeho nepřítomnosti vrchní inspektor dozorčí služby OVV. (Právní úprava: NGŘ č. 2/2026, § 24 odst. 2 písm. g), § 26 písm. q), § 61 písm. q))',
       source        = 'NGŘ č. 2/2026, § 24 odst. 2 písm. g), § 26 písm. q), § 61 písm. q)',
       topic         = 'Zdravotní péče – výdej léků'
 WHERE question = 'Kdo zajišťuje výdej léků odsouzeným v případech, kdy jej neprovádí zdravotnický pracovník (a není pověřen jiný zaměstnanec)?';

-- 4. pen-06: prameny podle NGŘ č. 2/2026 (§ 33 odst. 3); „zrakové prohlídky“ → prohlídky těla; léky vydává vrchní dozorce, ne dozorce
UPDATE public.quiz_questions
   SET question      = 'Jaké jsou základní úkoly dozorců oddělení výkonu vazby (OVV)?',
       options       = to_jsonb(ARRAY['Převzít službu (PPZZ), fyzicky převzít a znát stavy obviněných, prověřit uzamčení cel a signalizace, provádět nepravidelné kontroly cel, prohlídky těla vytypovaných obviněných, zajišťovat výdej stravy a vřelé vody, koupání, hygienu a úklid, a plnit časový rozvrh dne bez maření účelu vazby.', 'Zajišťovat předvádění obviněných k výslechům vyšetřovatelů PČR, vyhodnocovat bezpečnostní rizika v systému SARPO, stanovovat individuální programy zacházení a povolovat návštěvy rodinných příslušníků. Kontroly cel, prověrky uzamčení ani výdej stravy do náplně této funkce nepatří.', 'Provádět nepřetržitý dohled nad střeženým obvodem věznice, obsluhovat zabezpečovací a kamerové systémy na operačním středisku, kontrolovat oprávněnost vstupu osob do věznice a evidovat vjezd vozidel. Do oddělení výkonu vazby dozorce nevstupuje, stavy nepřebírá a cely nekontroluje.', 'Vést osobní spisy obviněných, provádět kázeňská řízení ve funkci orgánu s kázeňskou pravomocí, rozhodovat o přemístění obviněných mezi vazebními věznicemi a cenzurovat korespondenci s obhájci. Časový rozvrh dne, výdej stravy ani hygienu dozorce nezajišťuje, to přísluší vychovateli.']),
       correct_index = 0,
       explanation   = 'Dle § 33 odst. 3 NGŘ č. 2/2026 dozorce OVV na oddílu cel přebírá klíče, prověřuje uzamčení cel a signalizaci, fyzicky přebírá obviněné, provádí nepravidelné kontroly cel tak, aby obvinění nemohli zjistit systém kontrol (písm. e)), v případě určení prohlídky těla vytypovaných obviněných (písm. j)) a zajišťuje výdej stravy a vřelé vody (písm. g)). Léky obviněným vydává vrchní dozorce OVV (§ 24 odst. 2 písm. g)). Dozorce dbá, aby nebyl mařen účel vazby (např. u koluzních obviněných). (Právní úprava: § 29–33 NGŘ č. 2/2026 a Studijní text str. 30)',
       source        = '§ 29–33 NGŘ č. 2/2026 a Studijní text str. 30',
       topic         = 'Úkoly dozorců OVV'
 WHERE question = 'Jaké jsou základní úkoly dozorců oddělení výkonu vazby (OVV)?';

-- 5. pen-07: pramen § 70 odst. 3 NGŘ č. 2/2026 místo neexistujícího „čl. 3.8“ a § 68 NGŘ č. 2/2022
UPDATE public.quiz_questions
   SET question      = 'Jaké jsou základní úkoly dozorců oddělení výkonu trestu (OVT) v ubytovně odsouzených?',
       options       = to_jsonb(ARRAY['Fyzicky převzít odsouzené, mít trvalý přehled o stavech, provádět nepravidelné kontroly ložnic/cel, zajišťovat plnění časového rozvrhu dne, organizovat vycházky a fyzické početní prověrky, dohlížet na ústroj, hygienu a úklid rajónů, kontrolovat uzamčení vstupů a bránit vnášení nepovolených věcí.', 'Zajišťovat technickou údržbu ubytoven, uzavírat pracovní smlouvy s externími subjekty zaměstnávajícími odsouzené, schvalovat výši odměn za práci a vést mzdové účetnictví věznice. Dále spravovat skladové zásoby ubytovny a odpovídat za inventarizaci drobného majetku na oddělení.', 'Provádět výhradně venkovní hlídkovou činnost podél signálně-bezpečnostní technologie, střežit odsouzené na venkovních strážních stanovištích a obsluhovat zbraňové systémy věznice. Do vnitřních prostor ubytovny nevstupovat a kontrolu ložnic ponechat výhradně vychovateli oddělení.', 'Zpracovávat komplexní pedagogicko-psychologické zprávy odsouzených, vést specializované terapeutické skupiny, rozhodovat o přeřazení do jiného typu věznice a podávat soudu návrhy na podmíněné propuštění. Dále samostatně rozhodovat o uložení kázeňských trestů a o zařazení odsouzeného do prostupného režimu.']),
       correct_index = 0,
       explanation   = 'Dle § 70 odst. 3 NGŘ č. 2/2026 dozorce OVT na ubytovně odsouzených fyzicky přebírá odsouzené a vede o nich trvalý přehled, provádí nepravidelné kontroly cel a ložnic, zajišťuje plnění časového rozvrhu dne, vycházky a fyzické početní prověrky, dbá na ustrojení, hygienu a úklid, kontroluje uzamčení vstupů, zabraňuje vnášení nepovolených věcí a respektuje pokyny vychovatele při naplňování práv odsouzených. (Právní úprava: § 70 odst. 3 NGŘ č. 2/2026 a Studijní text str. 32–33)',
       source        = '§ 70 odst. 3 NGŘ č. 2/2026 a Studijní text str. 32–33',
       topic         = 'Úkoly dozorců OVT v ubytovně'
 WHERE question = 'Jaké jsou základní úkoly dozorců oddělení výkonu trestu (OVT) v ubytovně odsouzených?';

-- 6. pen-08: pramen § 106 odst. 2 NGŘ č. 2/2026 (dříve § 103 odst. 2 NGŘ č. 2/2022)
UPDATE public.quiz_questions
   SET question      = 'Jaké rozlišujeme druhy dozorčích stanovišť? Doplňte i vhodnými příklady!',
       options       = to_jsonb(ARRAY['Člení se na: a) vnější a vnitřní, b) pevná a pohyblivá, c) stálá a dočasná. (Příklad: stálé pevné vnitřní stanoviště na ubytovně OVT / dočasné pohyblivé vnější stanoviště při dozoru na nestřeženém pracovišti).', 'Člení se na: a) ozbrojená a neozbrojená, b) denní a noční, c) pěší a motorizovaná. (Příklad: ozbrojené denní motorizované stanoviště eskorty / neozbrojené noční stanoviště na bráně věznice). Vnější a vnitřní členění se neuplatňuje.', 'Člení se na: a) základní a specializovaná, b) režimová a bezpečnostní, c) kmenová a záložní. (Příklad: základní kmenové stanoviště na chodbě OVV / specializované režimové stanoviště v kuchyni). Pevná a pohyblivá stanoviště se nerozlišují.', 'Člení se na: a) střežená a nestřežená, b) uzavřená a polootevřená, c) technická a manuální. (Příklad: střežené uzavřené technické stanoviště na operačním středisku / nestřežené manuální stanoviště ve skladu). Stálá ani dočasná stanoviště se nerozlišují.']),
       correct_index = 0,
       explanation   = 'Dle § 106 odst. 2 NGŘ č. 2/2026 a Rozpisu dozorčích stanovišť se dozorčí stanoviště dělí na vnější/vnitřní, pevná/pohyblivá a stálá/dočasná. Jsou určena Plánem střežení věznice. (Právní úprava: § 106 odst. 2 NGŘ č. 2/2026 a Studijní text str. 27)',
       source        = '§ 106 odst. 2 NGŘ č. 2/2026 a Studijní text str. 27',
       topic         = 'Dozorčí stanoviště – Druhy'
 WHERE question = 'Jaké rozlišujeme druhy dozorčích stanovišť? Doplňte i vhodnými příklady!';

-- 7. pen-17: pramen § 72 NGŘ č. 2/2026 místo neexistujícího „§ 3.12“ a § 70 NGŘ č. 2/2022
UPDATE public.quiz_questions
   SET question      = 'Jaké jsou základní povinnosti dozorce v uzavřeném oddělení?',
       options       = to_jsonb(ARRAY['Převzít odsouzené na základě ústního pokynu vychovatele bez lékařského posouzení, ponechat jim veškeré osobní věci a civilní oděv, umožnit volný pohyb po chodbě oddílu a provádět kontroly cel v pevných hodinových intervalech. Potvrzení lékaře se nevyžaduje a zakázané věci se odebírají bez soupisu.', 'Zpracovávat návrhy na zmírnění uloženého kázeňského trestu, vydávat odsouzeným radiopřijímače a tiskoviny, organizovat sportovní hry v prostoru uzavřeného oddílu a zamykat cely výhradně na noční dobu od 22:00 do 06:00 hodin. Osobní prohlídku ani převlečení do eráru dozorce neprovádí a klíče nepřebírá.', 'Převzít klíče a cely PPZZ, prověřit signalizaci, umísťovat odsouzené na základě vykonatelného rozhodnutí o KT a potvrzení lékaře, provést osobní prohlídku, převléknout do eráru, odebrat zakázané věci se soupisem, poučit o právech/povinnostech a provádět nepravidelné kontroly cel.', 'Vydávat stravu a léky bez asistence zdravotnického personálu, provádět zrakové prohlídky těla výhradně při propuštění z oddílu, povolovat telefonní hovory s příbuznými 2× denně a vést osobní spis odsouzeného. Signalizaci dozorce neprověřuje a o právech a povinnostech nepoučuje.']),
       correct_index = 2,
       explanation   = 'Dle § 72 NGŘ č. 2/2026 dozorce v uzavřeném oddílu přebírá klíče a prověřuje uzamčení cel a signalizaci, umísťuje odsouzené na základě vykonatelného rozhodnutí o kázeňském trestu po osobní prohlídce a kontrole potvrzení o zdravotní způsobilosti, zajišťuje převlečení a odebrání nepovolených věcí se seznamem, poučuje o právech a povinnostech, nepravidelně kontroluje cely a nepřipouští nedovolené styky. (Právní úprava: § 72 NGŘ č. 2/2026 a Studijní text str. 35, 54)',
       source        = '§ 72 NGŘ č. 2/2026 a Studijní text str. 35, 54',
       topic         = 'Povinnosti dozorce v uzavřeném oddílu'
 WHERE question = 'Jaké jsou základní povinnosti dozorce v uzavřeném oddělení?';

-- 8. pen-21: pramen § 69 a § 73 NGŘ č. 2/2026 místo neexistujícího „§ 3.10“ a § 67 NGŘ č. 2/2022
UPDATE public.quiz_questions
   SET question      = 'Uveďte základní povinnosti dozorce na vnějším nestřeženém pracovišti!',
       options       = to_jsonb(ARRAY['Dohlížet výhradně na plnění výrobních norem a evidovat odpracované hodiny, umožnit odsouzeným volný nákup v přilehlých obchodech a provést kontrolu stavu pouze při návratu do věznice. Početní prověrky během pracovní doby neprovádět a o pohybu odsouzených vést jen souhrnný denní zápis.', 'Vykonávat manuální práci spolu s odsouzenými u výrobní linky, pověřit vybraného spolehlivého odsouzeného vedením početní evidence a hlásit situaci na operační středisko 1× týdně písemným záznamem. Osobní prohlídku před odjezdem neprovádět, odpovědnost nese civilní mistr provozu.', 'Střežit vnější perimetr pracoviště se střelnou zbraní v pohotovostní poloze, zamezit jakémukoliv přístupu civilních mistrů k odsouzeným a provádět kompletní osobní prohlídku každých 30 minut. Propustku ani jmenovitý seznam odsouzených nepřebírat a početní stav ověřit až po návratu eskorty do věznice.', 'Převzít jmenovitě a početně odsouzené dle propustky, provést osobní prohlídku a prohlídku vozidla před odjezdem, vymezit prostor pohybu a zakázat nepovolené kontakty s civilisty, provádět nepravidelné početní prověrky a kontroly v předepsaných intervalech a hlásit na OS závažné události.']),
       correct_index = 3,
       explanation   = 'Dle § 69 a § 73 NGŘ č. 2/2026 dozorce na nestřeženém pracovišti přebírá odsouzené početně i jmenovitě, vymezuje jim prostor pohybu, zabraňuje nedovoleným stykům, provádí nepravidelné početní prověrky, hlásí operačnímu středisku závažné skutečnosti a podle potřeby navrhuje odvolání odsouzeného z pracoviště. (Právní úprava: § 69 a § 73 NGŘ č. 2/2026 a Studijní text str. 34, 52)',
       source        = '§ 69 a § 73 NGŘ č. 2/2026 a Studijní text str. 34, 52',
       topic         = 'Povinnosti dozorce na nestřeženém pracovišti'
 WHERE question = 'Uveďte základní povinnosti dozorce na vnějším nestřeženém pracovišti!';

-- 9. pen-33: pramen § 32–33 NGŘ č. 2/2026 místo neexistujícího „§ 3.6“ a § 31–32 NGŘ č. 2/2022
UPDATE public.quiz_questions
   SET question      = 'Uveďte povinnosti dozorce v oddělení VV!',
       options       = to_jsonb(ARRAY['Zajišťovat komplexní psychologickou diagnostiku obviněných v systému SARPO, stanovovat individuální resocializační plány a schvalovat propuštění obviněných na kauci. Dále rozhodovat o umístění obviněného do oddělení se zesíleným stavebně technickým zabezpečením a povolovat návštěvy bez dohledu.', 'Střežit obvodový plášť budovy vazební věznice ze strážní věže, obsluhovat vjezdová vrata pro eskortní vozidla a kontrolovat zavazadlový prostor zásobovacích automobilů. Do oddělení výkonu vazby nevstupovat a kontrolu uzamčení cel přenechat směnovému technikovi ostrahy.', 'Provádět výslechy obviněných k okolnostem trestné činnosti, sepisovat protokoly o výpovědi pro státního zástupce a vyhodnocovat důkazní situaci v probíhajícím vyšetřování. Dále rozhodovat o trvání koluzní vazby, povolovat korespondenci s obhájcem a vést evidenci procesních úkonů.', 'Prověřit spojení a signalizaci, převzít a zkontrolovat uzamčení cel, fyzicky převzít obviněné, provádět nepravidelné kontroly cel, mít přehled o vytypovaných a nebezpečných obviněných, kontrolovat dodržování vnitřního řádu a nepustit nedovolené kontakty mezi společníky.']),
       correct_index = 3,
       explanation   = 'Dle § 33 odst. 3 NGŘ č. 2/2026 dozorce OVV v oddílu cel prověřuje spojovací a signálně zabezpečovací prostředky a uzamčení cel, fyzicky přebírá obviněné, má přehled o nebezpečných a vytypovaných obviněných a nepravidelně kontroluje cely; tím brání nedovoleným kontaktům a maření účelu vazby. (Právní úprava: § 32–33 NGŘ č. 2/2026 a Studijní text str. 30)',
       source        = '§ 32–33 NGŘ č. 2/2026 a Studijní text str. 30',
       topic         = 'Dozorčí služba – OVV povinnosti'
 WHERE question = 'Uveďte povinnosti dozorce v oddělení VV!';

-- 10. pen-79: pravidlo o umístění do cely samotného je v § 64 vyhl. č. 345/1999 Sb., ne v NGŘ
UPDATE public.quiz_questions
   SET question      = 'Kdy smí být odsouzený v uzavřeném oddílu umístěn do cely sám?',
       options       = to_jsonb(ARRAY['Kdykoli na jeho vlastní žádost podanou vedoucímu oddílu', 'Vždy, jde-li o celodenní umístění do uzavřeného oddílu a samovazbu', 'Při vážných bezpečnostních důvodech nebo bez dalšího odsouzeného', 'Jen na základě rozhodnutí lékaře o jeho zdravotní způsobilosti']),
       correct_index = 2,
       explanation   = 'Do cely může být odsouzený umístěn sám jen tehdy, jsou-li pro to vážné důvody bezpečnostní nebo nejsou-li ve výkonu tohoto kázeňského trestu současně alespoň dva odsouzení. (Právní úprava: § 64 vyhl. č. 345/1999 Sb.)',
       source        = '§ 64 vyhl. č. 345/1999 Sb.',
       topic         = 'Kázeňské tresty – uzavřený oddíl'
 WHERE question = 'Kdy smí být odsouzený v uzavřeném oddílu umístěn do cely sám?';

COMMIT;

-- OVĚŘENÍ (po spuštění musí vrátit 10 řádků a žádný s 2/2022):
-- SELECT question, options ->> correct_index AS spravna_odpoved, source
--   FROM public.quiz_questions
--  WHERE source LIKE '%2/2026%' OR source LIKE '%345/1999 Sb.'
--  ORDER BY question;
-- SELECT count(*) FROM public.quiz_questions WHERE source ~ '0?2/2022' OR explanation ~ 'NGŘ č\. 0?2/2022';
