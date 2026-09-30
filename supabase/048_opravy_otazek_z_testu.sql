-- ============================================================================
-- 048  Opravy otázek z testu banky (28 otázek)
-- ============================================================================
--
-- CO BYLO ŠPATNĚ (ověřeno proti znění z e-Sbírky, public/data/esbirka)
-- Tester banky otázek našel věcné chyby, chybné odkazy na paragrafy a otázky
-- s více obhajitelnými odpověďmi. Aplikace bere otázky z tabulky
-- quiz_questions, proto se oprava z repozitáře (src/data/questions) přenáší
-- i sem. Věcné chyby:
-- • Ubytovací plocha (pen-15, pen-42): „6 m² pro prvního a 4 m² pro každého
--   dalšího“ vyhláška nezná. Podle § 17 odst. 6 vyhl. č. 345/1999 Sb. připadá
--   ve vícelůžkové místnosti na osobu nejméně 4 m²; 6 m² platí jen pro celu
--   nebo ložnici pro jednu osobu.
-- • DVO (pen-50) je podle NGŘ č. 24/2022 „další vytypovaná osoba“, ne
--   „duševně vysoce narušená osoba“; otázka odporovala pen-16 a sp-37.
-- • Samovazba (pen-19): zákaz návštěv a balíčků platí pro obviněné (§ 22
--   odst. 7 z. 293/1993 Sb.), odsouzeným ho § 49 ZVTOS neukládá.
-- • Donucovací prostředky (sp-04): § 19 z. 555/1992 Sb. neomezuje zákrok na
--   „pouze hmaty a chvaty“, vylučuje vyjmenované prostředky.
-- • Zásobník CZ 75 B (bs-37) má 16 nábojů, jak uvádí přehled zbraní aplikace.
-- Ostatní: chybné paragrafy v pramenu a vysvětlení a dvojznačné distraktory,
-- podrobně u každé otázky níže.
--
-- CO TENHLE SKRIPT DĚLÁ
-- Přepíše 28 otázek (znění, možnosti, správnou odpověď, vysvětlení, pramen
-- a okruh) podle repozitáře. Otázka se hledá podle původního znění; mění-li
-- se znění otázky, nepřepíše se, pokud nové znění v tabulce už je.
-- Skript je idempotentní: druhé spuštění nic nezmění.
-- ============================================================================

BEGIN;

-- 1. pen-15: ubytovací plocha: ne „6 m² pro prvního a 4 m² pro dalšího“, ale 4 m² na osobu, 6 m² jen jednolůžková cela (§ 17 odst. 6 vyhl. 345/1999 Sb.)
UPDATE public.quiz_questions
   SET question      = 'Jaké rozlišujeme způsoby (systémy) ubytování vězňů, vysvětlete rozdíly mezi nimi!',
       options       = to_jsonb(ARRAY['Skupinový systém a Individuální bezpečnostní systém. Norma: jednotně 3 m² ubytovací plochy na osobu a 5 m³ vzduchu bez ohledu na počet ubytovaných osob a typ věznice, s povinností nepřetržitého uzamčení všech ložnic i přes den. Celový ani ložnicový systém se neuplatňuje a výjimky nelze povolit.', 'Diferencovaný systém a Integrovaný systém ubytování. Norma: min. 10 m² pro 1 vězně a min. 8 m² pro každého dalšího, min. 15 m³ vzduchu na osobu, přičemž na jednolůžkovou celu je striktně stanovena plocha min. 12 m² bez výjimky. Snížení plochy při překročení kapacity nelze povolit.', 'Celový systém (uzavřené cely s přísnějším režimem) a Ložnicový systém (ubytovny s volnějším pohybem v oddíle). Norma: ve vícelůžkové místnosti min. 4 m² na osobu, jednolůžková cela min. 6 m²; u patrových lůžek min. 7 m³ vzduchu na osobu (výjimečně nejméně 3 m² při nedostatku kapacity).', 'Pavilonový systém a Koridorový systém ubytování. Norma: min. 8 m² na každého vězně bez rozdílu počtu lůžek, min. 12 m³ vzduchu na osobu, přičemž překročení ubytovací kapacity věznice může povolit výhradně dozorový státní zástupce. Celový ani ložnicový systém norma nezná a vzduch se nestanovuje.']),
       correct_index = 2,
       explanation   = 'Podle § 17 odst. 6 vyhlášky č. 345/1999 Sb. musí v ubytovací místnosti pro více odsouzených připadat na jednoho nejméně 4 m² ubytovací plochy; cela nebo ložnice pro jedinou osobu nesmí mít méně než 6 m². Pravidlo „6 m² pro prvního a 4 m² pro každého dalšího“ vyhláška nezná. Při nedostatku ubytovací kapacity lze plochu snížit, nejvýše však na 3 m² (§ 17 odst. 7), a u jednopatrových lůžek musí na osobu připadat nejméně 7 m³ vzduchu (§ 17 odst. 8). Pro obviněné platí obdobně § 15 vyhlášky č. 109/1994 Sb. (Právní úprava: § 17 odst. 6 až 8 vyhl. 345/1999 Sb., § 15 vyhl. 109/1994 Sb. a Studijní text str. 11, 58–59)',
       source        = '§ 17 odst. 6 až 8 vyhl. 345/1999 Sb., § 15 vyhl. 109/1994 Sb. a Studijní text str. 11, 58–59',
       topic         = 'Způsoby (systémy) ubytování vězňů'
 WHERE question = 'Jaké rozlišujeme způsoby (systémy) ubytování vězňů, vysvětlete rozdíly mezi nimi!';

-- 2. pen-42: totéž pravidlo ubytovací plochy (§ 17 odst. 6 vyhl. 345/1999 Sb.)
UPDATE public.quiz_questions
   SET question      = 'Vyjmenujte a popište základní vybavení cel a ložnic, jak je legislativně upraven počet ubytovaných v cele (ložnici)?',
       options       = to_jsonb(ARRAY['Vybavení: lůžko, uzamykatelná skříňka, stůl, židle dle počtu osob, umyvadlo s pitnou vodou, záchod oddělený neprůhlednou zástěnou/dveřmi, signalizační zařízení, osvětlení, vytápění, větrání. Plocha: ve vícelůžkové místnosti min. 4 m² na osobu, jednolůžková cela min. 6 m²; u patrových lůžek min. 7 m³ vzduchu.', 'Vybavení: lůžko, noční stolek, televizor, lednice, sprchový kout a mikrovlnná trouba. Plocha: minimálně 10 m² na každého odsouzeného a 15 m³ vzduchu, přičemž počet ubytovaných na cele nesmí překročit 2 osoby. Signalizační zařízení se zřizuje jen na odděleních se zvýšenou ostrahou a do ubytovací plochy se započítává i sociální zařízení.', 'Vybavení: matrace na podlaze, skříňka na chodbě ubytovny, společné sociální zařízení na patře. Plocha: minimálně 4 m² pro prvního a 2 m² pro každého dalšího ubytovaného, objem vzduchu není normou stanoven. Umyvadlo s pitnou vodou na cele se nevyžaduje, osvětlení a větrání upravuje pouze vnitřní řád věznice.', 'Vybavení: patrová pryčna, společný stůl, otevřená toaleta bez oddělení, kamna na tuhá paliva. Plocha: jednotně 2,5 m² na osobu bez ohledu na počet lůžek a minimální objem vzduchu 4 m³ na odsouzeného. Uzamykatelná skříňka ani židle se do vybavení cely nepočítají a počet ubytovaných stanoví vychovatel.']),
       correct_index = 0,
       explanation   = 'Podle § 16 odst. 3 ZVTOS a § 17 odst. 1, 2 a 5 vyhlášky č. 345/1999 Sb. má každý odsouzený lůžko a uzamykatelnou skříňku, místnost stolek a židle podle počtu ubytovaných a cela sociální zařízení se záchodem odděleným neprůhlednou zástěnou, elektrické osvětlení a signalizační zařízení (u obviněných § 9 ZVV). Počet ubytovaných omezuje ubytovací plocha: ve vícelůžkové místnosti nejméně 4 m² na osobu, cela pro jednu osobu nejméně 6 m² (§ 17 odst. 6 vyhlášky); 7 m³ vzduchu na osobu se vyžaduje u jednopatrových lůžek (§ 17 odst. 8). (Právní úprava: § 16 odst. 3 ZVTOS, § 17 vyhl. 345/1999 Sb., § 9 ZVV, § 15 vyhl. 109/1994 Sb. a Studijní text str. 11, 58–59)',
       source        = '§ 16 odst. 3 ZVTOS, § 17 vyhl. 345/1999 Sb., § 9 ZVV, § 15 vyhl. 109/1994 Sb. a Studijní text str. 11, 58–59',
       topic         = 'Vybavení cel a ubytovací normy'
 WHERE question = 'Vyjmenujte a popište základní vybavení cel a ložnic, jak je legislativně upraven počet ubytovaných v cele (ložnici)?';

-- 3. pen-50: DVO = „další vytypovaná osoba“ (NGŘ č. 24/2022), ne „duševně vysoce narušené osoby“
UPDATE public.quiz_questions
   SET question      = 'Která kategorie vězněných osob se označuje zkratkou DVO a jaká platí pro ni specifika?',
       options       = to_jsonb(ARRAY['DVO = dozorem vytypované osoby, tedy vězni zařazení do evidence možných agresorů na základě hlášení dozorce. Platí pro ně zvýšená frekvence osobních prohlídek, oddělené ubytování od ostatních a povinnost hlásit se při opuštění ubytovny.', 'DVO = další vytypovaná osoba, např. vězeň z medializované kauzy nebo osoba známá z veřejného či politického života. Zařazení navrhuje VOVT, rozhoduje a písemně je odůvodňuje ředitel věznice; tělo se na stopy násilí prohlíží jednou týdně.', 'DVO = dlouhodobě vězněné osoby, tedy odsouzení k nepodmíněnému trestu odnětí svobody nad deset let. Vyžadují rozšířený program zacházení, přehodnocování rizik jednou ročně a přednostní zařazení do prostupného systému vnitřní diferenciace.', 'DVO = dobrovolně vyčleněné osoby, tedy vězni, kteří sami požádali o umístění mimo kolektiv. Vyžadují písemný souhlas s omezením účasti na společných aktivitách, samostatnou celu a potvrzení psychologa, že vyčlenění neohrozí duševní stav.']),
       correct_index = 1,
       explanation   = 'Podle NGŘ č. 24/2022 je DVO „další vytypovaná osoba“ – vězeň, kterému kvůli jeho známosti (medializovaná kauza, veřejný či politický život) hrozí násilí ze strany ostatních. O zařazení do DVO i do DVO-P (osoba s výkonem profese, např. bývalý policista nebo příslušník VS) rozhoduje ředitel věznice a u vytypovaných osob se 1x týdně provádí prohlídka těla na stopy násilí. Zkratka DVO neoznačuje duševně narušené osoby. (Právní úprava: NGŘ č. 24/2022, o předcházení násilí mezi vězněnými osobami)',
       source        = 'NGŘ č. 24/2022, o předcházení násilí mezi vězněnými osobami',
       topic         = 'Prevence násilí'
 WHERE question = 'Která kategorie vězněných osob se označuje zkratkou DVO a jaká platí pro ni specifika?';

-- 4. sp-41: odkaz § 21 → § 19 odst. 1 písm. a) z. 555/1992 Sb., zákonné pojmy a úplná výjimka
UPDATE public.quiz_questions
   SET question      = 'U jakých kategorií osob je příslušníkům VS ČR zakázáno použít úderů, kopů, slzotvorných prostředků, taseru a zbraně (neplatí pro nutnou obranu a krajní nouzi)?',
       options       = to_jsonb(ARRAY['U všech cizích státních příslušníků, diplomatů a dalších osob požívajících diplomatické imunity podle mezinárodního práva.', 'U těhotných žen, osob vysokého věku, osob se zjevným zdravotním postižením a u osob, které jsou zjevně mladší patnácti let.', 'Zákon nedefinuje žádné chráněné kategorie, donucovací prostředky lze použít bez omezení vůči každému. Těhotné ženy ani děti mladší patnácti let zvláštní ochranu nepožívají.', 'U osob, které jsou ve výkonu vazby déle než 1 rok bez pravomocného rozsudku. Věk, tělesná vada ani těhotenství na použití donucovacích prostředků vliv nemají.']),
       correct_index = 1,
       explanation   = 'Podle § 19 odst. 1 písm. a) zákona č. 555/1992 Sb. nelze proti těhotné ženě, osobě vysokého věku, osobě se zjevným zdravotním postižením nebo osobě zjevně mladší 15 let použít mimo jiné úderů a kopů, slzotvorných a elektrických prostředků, obušku, služebního psa ani střelné zbraně. Omezení neplatí, pokud útok těchto osob bezprostředně ohrožuje život nebo zdraví příslušníka či jiné osoby nebo hrozí větší škoda na majetku a nebezpečí nelze odvrátit jinak, a při zamezení útěku podle § 18 odst. 1 písm. c). § 21 upravuje zákrok pod jednotným velením. (Právní úprava: § 19 odst. 1 písm. a) zákona č. 555/1992 Sb., o VS a JS ČR)',
       source        = '§ 19 odst. 1 písm. a) zákona č. 555/1992 Sb., o VS a JS ČR',
       topic         = 'Donucovací prostředky'
 WHERE question = 'U jakých kategorií osob je příslušníkům VS ČR zakázáno použít úderů, kopů, slzotvorných prostředků, taseru a zbraně (neplatí pro nutnou obranu a krajní nouzi)?';

-- 5. sp-01: výzvu upravuje § 6 odst. 3, ne § 17; výzva s výstrahou je § 18 odst. 3 (střelná zbraň)
UPDATE public.quiz_questions
   SET question      = 'Jaké jsou zákonné podmínky pro použití donucovacích prostředků (DP) podle zákona č. 555/1992 Sb.?',
       options       = to_jsonb(ARRAY['Při jakémkoliv verbálním neuposlechnutí pokynu dozorce, přičemž výzva „Jménem zákona!“ postačí až po dokončení donucovacího zákroku.', 'K překonání jakéhokoli odporu odsouzeného bez ohledu na jeho intenzitu; výzva s výstrahou je povinná vždy a zákon z ní nepřipouští žádnou výjimku ani tehdy, je-li bezprostředně ohrožen život nebo zdraví a zákrok nesnese odkladu.', 'Výhradně k odvrácení fyzického útoku na příslušníka; použití DP musí předem písemně schválit velitel směny nebo dozorující státní zástupce.', 'Je-li to nezbytné k zajištění pořádku a bezpečnosti, proti osobě, která ohrožuje život či zdraví, poškozuje majetek, maří účel vazby/trestu nebo ruší pořádek; dovolují-li to okolnosti, předchází výzva se slovy „jménem zákona“.']),
       correct_index = 3,
       explanation   = 'Kdy a proti komu lze DP použít, stanoví § 17 odst. 1 zákona č. 555/1992 Sb.; přiměřenost zákroku § 17 odst. 3. Výzvu upravuje § 6 odst. 3: dovolují-li to okolnosti a povaha zákroku, příslušník před ním prokáže příslušnost k VS a použije domluvy, výzvy nebo varování, před výzvou se slovy „jménem zákona“. Výzvu s výstrahou, od níž lze upustit jen při ohrožení života nebo zdraví, když zákrok nesnese odkladu, předepisuje § 18 odst. 3 pro použití střelné zbraně, ne pro donucovací prostředky. (Právní úprava: § 17 odst. 1 a 3, § 6 odst. 3 a § 18 odst. 3 zákona č. 555/1992 Sb., o VS a JS ČR)',
       source        = '§ 17 odst. 1 a 3, § 6 odst. 3 a § 18 odst. 3 zákona č. 555/1992 Sb., o VS a JS ČR',
       topic         = 'Použití donucovacích prostředků'
 WHERE question = 'Jaké jsou zákonné podmínky pro použití donucovacích prostředků (DP) dle § 17 zákona č. 555/1992 Sb.?'
   AND NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE question = 'Jaké jsou zákonné podmínky pro použití donucovacích prostředků (DP) podle zákona č. 555/1992 Sb.?');

-- 6. bs-24: § 9 je mlčenlivost; prohlídku upravuje § 11 odst. 2 (stejné pohlaví nebo lékař)
UPDATE public.quiz_questions
   SET question      = 'Jaká jsou přísná zákonná a metodická pravidla pro provádění důkladné osobní prohlídky (se svlečením do naha)?',
       options       = to_jsonb(ARRAY['Prohlídku provádí zásadně tříčlenná komise na společné chodbě oddílu za účelem zajištění maximální bezpečnosti personálu.', 'Provádí ji osoba stejného pohlaví jako prohlížený (případně lékař), v oddělené místnosti bez přítomnosti nepovolaných osob a způsobem šetřícím lidskou důstojnost.', 'Příslušník stejného pohlaví smí provést kontrolu oděvu a těla pohledem, přičemž je oprávněn sám provádět i invazivní fyzikální vyšetření tělesných dutin pomocí zrcadla.', 'Může ji provádět příslušník opačného pohlaví, pokud je přítomen lékař nebo psycholog a je pořízen nepřetržitý videozáznam úkonu.']),
       correct_index = 1,
       explanation   = 'Podle § 11 odst. 2 zákona č. 555/1992 Sb. provádí osobní prohlídku a prohlídku těla osoba stejného pohlaví nebo lékař; lékařskou prohlídku (např. tělesných dutin) jen lékař. Příslušník musí dbát cti a důstojnosti prohlížené osoby a zásah nesmí překročit nezbytnou míru (§ 6 odst. 2). Provedení v oddělené místnosti bez přítomnosti nepovolaných osob upřesňuje NGŘ o prohlídkách. § 9 zákona upravuje mlčenlivost, ne prohlídky. (Právní úprava: § 11 odst. 2 a § 6 odst. 2 zákona č. 555/1992 Sb. a NGŘ o bezpečnostních prohlídkách)',
       source        = '§ 11 odst. 2 a § 6 odst. 2 zákona č. 555/1992 Sb. a NGŘ o bezpečnostních prohlídkách',
       topic         = 'Metodika bezpečnostních prohlídek'
 WHERE question = 'Jaká jsou přísná zákonná a metodická pravidla pro provádění důkladné osobní prohlídky (se svlečením do naha)?';

-- 7. bs-14: pokyny předsedy senátu v síni upravuje § 22 odst. 3 a 4, ne § 3
UPDATE public.quiz_questions
   SET question      = 'Jaká oprávnění má příslušník Justiční stráže v jednací síni soudu během hlavního líčení?',
       options       = to_jsonb(ARRAY['Řídí se pokyny předsedy senátu, na jeho pokyn vykazuje osoby z jednací síně, chrání přítomné před útoky a drží pořádek při vstupu do síně.', 'Je oprávněn samostatně přerušit jednání soudu při jakémkoli verbálním projevu veřejnosti a rozhodnout o vyloučení veřejnosti bez souhlasu soudce.', 'Podléhá výhradně pokynům státního zástupce, provádí protokolaci výpovědí obžalovaného a rozhoduje o povolení vstupu médií s kamerami.', 'Zajišťuje fyzickou ostrahu soudce a na pokyn obhájce je povinen provést osobní prohlídku přítomných svědků a poškozených přímo v síni.']),
       correct_index = 0,
       explanation   = 'Podle § 22 odst. 3 zákona č. 555/1992 Sb. se justiční stráž řídí pokyny předsedy senátu a dalších oprávněných osob; podle § 22 odst. 4 na pokyn předsedy senátu zejména provádí rozhodnutí o vykázání osob z jednací síně, chrání přítomné úřední a další osoby před fyzickými útoky a vykonává pořádkovou službu při vstupu do síně. Bez pokynu zakročí jen tehdy, nesnese-li zákrok odkladu (§ 22 odst. 6). Obecný úkol zajišťovat pořádek a bezpečnost v budovách soudů stanoví § 3 odst. 3. (Právní úprava: § 3 odst. 3 a § 22 odst. 3, 4 a 6 zákona č. 555/1992 Sb. a Instrukce MS ČR č. 8/2022)',
       source        = '§ 3 odst. 3 a § 22 odst. 3, 4 a 6 zákona č. 555/1992 Sb. a Instrukce MS ČR č. 8/2022',
       topic         = 'Justiční stráž – jednací síň'
 WHERE question = 'Jaká oprávnění má příslušník Justiční stráže v jednací síni soudu během hlavního líčení?';

-- 8. pen-72: nezpracování programu zacházení je v § 40 odst. 2, ne v § 41
UPDATE public.quiz_questions
   SET question      = 'V jakém případě se podle § 40 odst. 2 zákona č. 169/1999 Sb. program zacházení pro odsouzeného nezpracovává?',
       options       = to_jsonb(ARRAY['Má-li vykonat trest nebo jeho zbytek do 3 měsíců', 'Je-li zařazen do věznice se zvýšenou ostrahou', 'Odmítne-li s programem vyslovit písemný souhlas', 'Je-li starší šedesáti let a nemůže ze zdravotních důvodů pracovat']),
       correct_index = 0,
       explanation   = 'Podle § 40 odst. 2 zákona č. 169/1999 Sb. se program zacházení nezpracovává, má-li odsouzený vykonat trest nebo jeho zbytek ve výměře nepřesahující 3 měsíce. § 41 upravuje až podklady a obsah programu (komplexní zprávu). (Právní úprava: § 40 odst. 2 zákona č. 169/1999 Sb.)',
       source        = '§ 40 odst. 2 zákona č. 169/1999 Sb.',
       topic         = 'Program zacházení'
 WHERE question = 'V jakém případě se podle § 41 zákona č. 169/1999 Sb. program zacházení pro odsouzeného nezpracovává?'
   AND NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE question = 'V jakém případě se podle § 40 odst. 2 zákona č. 169/1999 Sb. program zacházení pro odsouzeného nezpracovává?');

-- 9. pen-51: § 9a v zákoně č. 169/1999 Sb. není; stupně zabezpečení jsou v § 12a a § 12b
UPDATE public.quiz_questions
   SET question      = 'Kdo a na jakém základě rozhoduje o zařazení odsouzeného do konkrétního stupně zabezpečení v rámci věznice s ostrahou?',
       options       = to_jsonb(ARRAY['Soudce okresního soudu v místě výkonu trestu při vstupním řízení. Odborná komise se nezřizuje.', 'Ředitel věznice na základě doporučení odborné komise a výsledků komplexní zprávy (včetně SARPO).', 'Výhradně dozorový státní zástupce na návrh vedoucího oddělení. SARPO se nezohledňuje.', 'Vedoucí oddělení vězeňské stráže bez nutnosti posouzení odbornou komisí. Zpráva se nezpracuje.']),
       correct_index = 1,
       explanation   = 'Soud zařazuje odsouzeného do typu věznice (s ostrahou / se zvýšenou ostrahou) podle § 56 trestního zákoníku. Věznice s ostrahou se člení na oddělení s nízkým, středním a vysokým stupněm zabezpečení (§ 12a zákona č. 169/1999 Sb.); míru vnějších a vnitřních rizik vyhodnotí odborná komise a o umístění rozhoduje ředitel věznice s přihlédnutím k jejímu doporučení (§ 12b odst. 1 a 2). § 9a v zákoně není. (Právní úprava: § 12a a § 12b zákona č. 169/1999 Sb., o výkonu trestu odnětí svobody)',
       source        = '§ 12a a § 12b zákona č. 169/1999 Sb., o výkonu trestu odnětí svobody',
       topic         = 'Diferenciace výkonu trestu'
 WHERE question = 'Kdo a na jakém základě rozhoduje o zařazení odsouzeného do konkrétního stupně zabezpečení v rámci věznice s ostrahou?';

-- 10. pen-04: pramen § 6 z. 293/1993 Sb. (umísťování do cel) → § 73b TŘ, § 5 a § 10 ZVV
UPDATE public.quiz_questions
   SET question      = 'Které orgány a na čí návrh rozhodují o uvalení vazby a o propuštění z vazby?',
       options       = to_jsonb(ARRAY['O vzetí do vazby rozhoduje státní zástupce na návrh policejního orgánu; o propuštění z vazby rozhoduje výhradně ředitel vazební věznice po projednání s dozorčím orgánem Vězeňské služby ČR. Prezident ani ministr spravedlnosti do rozhodování o vazbě nezasahují.', 'O vzetí do vazby rozhoduje soud na návrh policejního orgánu; o propuštění rozhoduje generální ředitel Vězeňské služby ČR nebo vedoucí oddělení výkonu vazby po uplynutí zákonné lhůty. Státní zástupce o propuštění z vazby rozhodovat nemůže ani v přípravném řízení.', 'O vzetí do vazby rozhoduje policejní orgán se souhlasem ředitele krajského ředitelství Policie ČR; o propuštění rozhoduje předseda senátu okresního soudu na návrh obhájce obviněného. Soud o vzetí do vazby nerozhoduje a milost prezidenta se na vazbu nevztahuje.', 'O vzetí do vazby rozhoduje vždy soud (v přípravném řízení na návrh státního zástupce); o propuštění rozhoduje soud, v přípravném řízení též státní zástupce, nebo státní zástupce při výkonu dozoru a prezident/ministr při milosti.']),
       correct_index = 3,
       explanation   = 'Podle § 73b odst. 1 trestního řádu rozhoduje o vzetí do vazby soud, v přípravném řízení soudce na návrh státního zástupce; o žádosti o propuštění rozhoduje soud a v přípravném řízení státní zástupce (§ 73b odst. 2). Vazební věznice přijme obviněného jen na písemný příkaz soudu (§ 5 odst. 1 zákona č. 293/1993 Sb.) a propustí ho na písemný příkaz soudu, státního zástupce (i při výkonu dozoru podle § 29) nebo na základě rozhodnutí prezidenta či ministra v řízení o milosti (§ 10). (Právní úprava: § 73b trestního řádu, § 5 a § 10 zákona č. 293/1993 Sb. a Studijní text Penologie ZOP A str. 9-10)',
       source        = '§ 73b trestního řádu, § 5 a § 10 zákona č. 293/1993 Sb. a Studijní text Penologie ZOP A str. 9-10',
       topic         = 'Rozhodování o vazbě'
 WHERE question = 'Které orgány a na čí návrh rozhodují o uvalení vazby a o propuštění z vazby?';

-- 11. pen-34: pramen § 6 → § 10 ZVV; „převod do VTOS“ není důvod propuštění
UPDATE public.quiz_questions
   SET question      = 'Jaké jsou zákonné důvody pro propuštění z VV, kdo o něm rozhoduje?',
       options       = to_jsonb(ARRAY['Písemný příkaz soudu vydaný na základě jeho rozhodnutí, příkaz státního zástupce na základě jeho rozhodnutí (přípravné řízení), příkaz státního zástupce při výkonu dozoru (§ 29 ZVV), nebo příkaz podle rozhodnutí prezidenta či ministra o milosti.', 'Písemný souhlas vyšetřovatele Policie ČR po ukončení výslechu, rozhodnutí velitele eskorty při předvedení k soudu, nebo uplynutí pořádkové lhůty 48 hodin od zadržení podezřelého. Příkaz soudu ani příkaz státního zástupce se k propuštění nevyžaduje.', 'Písemný pokyn primátora statutárního města, rozhodnutí probačního úředníka PMS ČR po stanovení dohledu, nebo nařízení vedoucího oddělení výkonu vazby při nedostatku lůžek. Rozhodnutí soudu o propuštění ani příkaz státního zástupce se nevydává.', 'Rozhodnutí ředitele vazební věznice po dohodě s obhájcem obviněného, složení finanční záruky přímo do pokladny věznice, nebo písemná žádost rodinných příslušníků obviněného. Příkaz soudu se nevyžaduje a o propuštění rozhoduje ředitel věznice.']),
       correct_index = 0,
       explanation   = 'Podle § 10 zákona č. 293/1993 Sb. věznice neodkladně propustí obviněného, obdrží-li písemný příkaz k propuštění vydaný soudem nebo státním zástupcem na základě jejich rozhodnutí, příkaz státního zástupce vydaný při dozoru nad výkonem vazby (§ 29 odst. 2 písm. f) nebo příkaz na základě rozhodnutí prezidenta republiky či ministra v řízení o udělení milosti. Převedení do výkonu trestu není propuštěním z vazby. (Právní úprava: § 10 a § 29 zákona č. 293/1993 Sb., o výkonu vazby a Studijní text str. 9, 10)',
       source        = '§ 10 a § 29 zákona č. 293/1993 Sb., o výkonu vazby a Studijní text str. 9, 10',
       topic         = 'Propuštění z vazby – Důvody a orgány'
 WHERE question = 'Jaké jsou zákonné důvody pro propuštění z VV, kdo o něm rozhoduje?';

-- 12. pen-39: pramen § 18 (telefon) → § 17; výčet korespondence bez kontroly podle § 17 odst. 3
UPDATE public.quiz_questions
   SET question      = 'Vysvětlete, jak je naplňováno právo odsouzeného na korespondenci a jaká jsou jeho případná omezení:',
       options       = to_jsonb(ARRAY['Odsouzený může odeslat nejvýše 4 dopisy za měsíc na náklady věznice. Vězeňská služba je povinna otevírat a cenzurovat veškerou korespondenci včetně dopisů adresovaných obhájci a Evropskému soudu pro lidská práva. Kontrola je vyloučena jen u dopisů prezidentu republiky.', 'Odsouzený smí přijímat a na svůj náklad odesílat korespondenci bez omezení počtu. VS ji může kontrolovat a seznámit se s obsahem. Kontrola je NEPŘÍPUSTNÁ u dopisů s obhájcem, advokátem, státními orgány ČR, diplomatickou misí či konzulátem a mezinárodními lidskoprávními orgány.', 'Odsouzený smí vést korespondenci výhradně s rodinnými příslušníky zapsanými v osobním spise; veškeré dopisy cizím osobám nebo institucím jsou automaticky vraceny odesílateli bez odeslání. Odesílání na vlastní náklady není přípustné a kontrola se provádí i u dopisů obhájci.', 'Korespondence odsouzeného nesmí být ze zákona nikdy otevírána ani kontrolována personálem věznice z důvodu ochrany listovního tajemství dle Listiny základních práv a svobod. Početní limit není stanoven a náklady na odeslání hradí věznice z provozních prostředků, nikoli odsouzený.']),
       correct_index = 1,
       explanation   = 'Podle § 17 odst. 1 a 2 zákona č. 169/1999 Sb. má odsouzený právo přijímat a na svůj náklad odesílat korespondenci bez omezení a Vězeňská služba ji smí kontrolovat. Kontrola korespondence s obhájcem, advokátem, státními orgány ČR, diplomatickou misí či konzulárním úřadem cizího státu a s mezinárodní organizací příslušnou k ochraně lidských práv je nepřípustná (§ 17 odst. 3); tyto dopisy se odevzdávají v zalepené obálce (§ 24 odst. 3 vyhlášky č. 345/1999 Sb.) a nemajetnému odsouzenému se odešlou na náklady věznice (§ 17 odst. 5). § 18 upravuje telefon, ne korespondenci. (Právní úprava: § 17 zákona č. 169/1999 Sb., § 24 vyhl. č. 345/1999 Sb. a Studijní text str. 61–62)',
       source        = '§ 17 zákona č. 169/1999 Sb., § 24 vyhl. č. 345/1999 Sb. a Studijní text str. 61–62',
       topic         = 'Právo odsouzeného na korespondenci a omezení'
 WHERE question = 'Vysvětlete, jak je naplňováno právo odsouzeného na korespondenci a jaká jsou jeho případná omezení:';

-- 13. bs-08: balíček odsouzeného jednou za 6 měsíců (§ 24 odst. 1 ZVTOS), ne jednou za rok
UPDATE public.quiz_questions
   SET question      = 'Jaký je hmotnostní limit pro balíček s potravinami a věcmi osobní potřeby zasílaný vězněné osobě a jak se provádí jeho kontrola?',
       options       = to_jsonb(ARRAY['Hmotnost je limitována na 3 kg včetně obalu; kontrola probíhá výhradně orientačním převážením na příjmu a vizuální kontrolou neporušenosti originálního poštovního obalu. Rentgenová kontrola ani přítomnost vězněné osoby se nevyžadují.', 'Hmotnost nesmí přesáhnout 5 kg netto (bez obalu); kontrola se provádí výhradně stěrem na detekci výbušnin bez nutnosti rozbalení jednotlivých potravinových balení.', 'Hmotnost nesmí přesáhnout 5 kg včetně obalu; balíček projde kontrolou na RTG, fyzickou kontrolou obsahu a kontrolou na přítomnost OPL a nepovolených předmětů za přítomnosti vězně.', 'Hmotnost nesmí přesáhnout 10 kg bez obalu; balíček se otevírá a kontroluje výhradně na oddělení prevence za nepřítomnosti vězně a předává se nejvýše jednou za rok.']),
       correct_index = 2,
       explanation   = 'Podle § 24 odst. 1 zákona č. 169/1999 Sb. má odsouzený právo jedenkrát za šest měsíců přijmout balíček s potravinami a věcmi osobní potřeby do hmotnosti 5 kg; obviněný jedenkrát za 3 měsíce (§ 16 odst. 2 zákona č. 293/1993 Sb.). Balíčky podléhají kontrole zaměstnanců Vězeňské služby a nepovolené věci se vracejí odesílateli na náklady vězně (§ 24 odst. 2 ZVTOS, § 33 vyhlášky č. 345/1999 Sb.). (Právní úprava: § 24 zákona č. 169/1999 Sb., § 16 zákona č. 293/1993 Sb. a Řád výkonu trestu)',
       source        = '§ 24 zákona č. 169/1999 Sb., § 16 zákona č. 293/1993 Sb. a Řád výkonu trestu',
       topic         = 'Kontrola balíčků'
 WHERE question = 'Jaký je hmotnostní limit pro balíček s potravinami a věcmi osobní potřeby zasílaný vězněné osobě a jak se provádí jeho kontrola?';

-- 14. pe_54: chování mimo službu je § 45 odst. 1 písm. i) z. 361/2003 Sb., ne § 46
UPDATE public.quiz_questions
   SET question      = 'Jak by se měl příslušník VS ČR chovat v době mimo službu (v občanském životě a na sociálních sítích)?',
       options       = to_jsonb(ARRAY['Mimo službu (bez uniformy) se na něj nevztahují žádná pravidla a může se chovat zcela podle vlastního uvážení. Zákon o služebním poměru upravuje výhradně dobu výkonu služby, takže chování v soukromí, na sociálních sítích ani styk se závadovými osobami nelze nijak postihnout. Vážnost sboru se posuzuje pouze podle služebních výsledků.', 'Mimo službu nesmí vůbec používat sociální sítě ani se účastnit veřejného života v obci. Kodex profesní etiky zakazuje příslušníkovi jakoukoliv veřejnou aktivitu, včetně členství ve spolcích, kandidatury v komunálních volbách a vystupování v médiích, protože každý takový projev snižuje důvěryhodnost sboru.', 'I mimo službu je povinen chovat se tak, aby nesnižoval vážnost a důvěryhodnost bezpečnostního sboru. Nesmí se opíjet na veřejnosti, vyvolávat konflikty, stýkat se se závadovými osobami a na sociálních sítích sdílet obsah, který podporuje extremismus, nenávist nebo odhaluje utajované skutečnosti z výkonu služby.', 'Může na sociálních sítích volně kritizovat vedení státu a soudy, protože má právo na svobodu slova. Svoboda projevu podle čl. 17 Listiny je absolutní a nelze ji u příslušníka bezpečnostního sboru omezit ani služebním předpisem. Omezit lze pouze sdílení utajovaných skutečností z výkonu služby.']),
       correct_index = 2,
       explanation   = 'Podle § 45 odst. 1 písm. i) zákona č. 361/2003 Sb. je příslušník povinen chovat se a jednat i v době mimo službu tak, aby neohrozil dobrou pověst bezpečnostního sboru, a podle písm. c) zachovávat mlčenlivost. Kodex etiky tento standard rozvádí. Neetické chování v soukromí (např. rasistické komentáře na sociálních sítích) může být kázeňským přestupkem (§ 50). § 46 upravuje služební kázeň a rozkazy. (Právní úprava: § 45 odst. 1 písm. i) zákona č. 361/2003 Sb. a Kodex profesní etiky VS ČR)',
       source        = '§ 45 odst. 1 písm. i) zákona č. 361/2003 Sb. a Kodex profesní etiky VS ČR',
       topic         = 'Profesní chování'
 WHERE question = 'Jak by se měl příslušník VS ČR chovat v době mimo službu (v občanském životě a na sociálních sítích)?';

-- 15. pe_56: zákaz přijímat dary je § 45 odst. 1 písm. b) z. 361/2003 Sb., ne § 46
UPDATE public.quiz_questions
   SET question      = 'Může příslušník nebo zaměstnanec VS ČR přijmout peněžitý dar nebo pozornost od rodinného příslušníka vězněné osoby jako poděkování za lidský přístup?',
       options       = to_jsonb(ARRAY['Ano, pokud hodnota daru nepřesáhne částku 500 Kč a je o tom sepsán neformální záznam. Zákon o služebním poměru stanoví u darů hodnotový limit 500 Kč.', 'Ne, přijetí jakéhokoliv daru nebo výhody v souvislosti s výkonem služby je striktně zakázáno a zakládá podezření z korupčního jednání.', 'Ano, ale pouze pokud se jedná o kávu, čokoládu nebo jiné trvanlivé potraviny. Zákaz přijímání darů se vztahuje jen na peněžní plnění, nikoli na věci.', 'Ano, pokud k předání dojde mimo areál věznice v době osobního volna. Mimo areál věznice a mimo službu zákaz neplatí.']),
       correct_index = 1,
       explanation   = 'Podle § 45 odst. 1 písm. b) zákona č. 361/2003 Sb. příslušník v souvislosti s výkonem služby nepřijímá dary nebo jiné výhody; zákon pro to nestanoví žádný hodnotový limit. Etický kodex VS ČR tento zákaz rozvádí. (Právní úprava: § 45 odst. 1 písm. b) zákona č. 361/2003 Sb. a Etický kodex VS ČR)',
       source        = '§ 45 odst. 1 písm. b) zákona č. 361/2003 Sb. a Etický kodex VS ČR',
       topic         = 'Střet zájmů a přijímání darů'
 WHERE question = 'Může příslušník nebo zaměstnanec VS ČR přijmout peněžitý dar nebo pozornost od rodinného příslušníka vězněné osoby jako poděkování za lidský přístup?';

-- 16. pe_42: prohlídku provádí osoba stejného pohlaví NEBO lékař (§ 11 odst. 2); svědek je metodika
UPDATE public.quiz_questions
   SET question      = 'Jak má být genderově a bezpečnostně zajištěn standardní průběh osobních prohlídek občanů a vězněných osob?',
       options       = to_jsonb(ARRAY['Při prohlídce vstupujícího občana nesmí být přítomen žádný svědek z důvodu ochrany osobních údajů a utajení bezpečnostních procedur. Přítomnost druhého příslušníka jako svědka zákon nevyžaduje ani u vstupujících osob a prohlídku smí provést příslušník sám, pokud o ní sepíše úřední záznam.', 'Prohlídku vězněných žen provádí zásadně smíšená hlídka za přítomnosti psovoda se služebním psem bez náhubku. Pohlaví prohlížející osoby zákon neupravuje, rozhodující je pouze přítomnost služebního psa jako donucovacího prostředku a záznam do knihy prohlídek oddělení.', 'Osobní prohlídku může provádět příslušník libovolného pohlaví o samotě, přičemž tělesné prohlídky tělních dutin provádí dozorce směny. Intimní prohlídky nejsou vyhrazeny lékaři, jde o úkon bezpečnostní povahy.', 'Osobní prohlídku a prohlídku těla provádí osoba stejného pohlaví nebo lékař; u vstupující osoby je podle metodiky přítomen další příslušník stejného pohlaví jako svědek (celkem 2). Lékařskou prohlídku, včetně tělesných dutin, provádí jen lékař.']),
       correct_index = 3,
       explanation   = 'Podle § 11 odst. 2 zákona č. 555/1992 Sb. provádí osobní prohlídku a prohlídku těla osoba stejného pohlaví nebo lékař, lékařskou prohlídku pouze lékař; osobní prohlídku vstupující osoby při důvodném podezření umožňuje § 13 odst. 1. Přítomnost druhého příslušníka stejného pohlaví jako svědka nestanoví zákon, ale metodika ZOP a EVP (body 54.5–54.7): chrání důstojnost prohlížené osoby i příslušníka před nařčením ze zneužití pravomoci. (Právní úprava: § 11 odst. 2 a § 13 odst. 1 z. 555/1992 Sb.; EVP body 54.5–54.7; Studijní opora str. 9)',
       source        = '§ 11 odst. 2 a § 13 odst. 1 z. 555/1992 Sb.; EVP body 54.5–54.7; Studijní opora str. 9',
       topic         = 'Osobní prohlídky a gender'
 WHERE question = 'Jak má být genderově a bezpečnostně zajištěn standardní průběh osobních prohlídek občanů a vězněných osob?';

-- 17. psy-11: „90–94 % celé komunikace“ a „nesoulad signalizuje lež“ – upřesněno na Mehrabianův poměr
UPDATE public.quiz_questions
   SET question      = 'Z čeho se skládá neverbální komunikace a jaký podíl na sdělení se jí připisuje podle Mehrabianova poměru?',
       options       = to_jsonb(ARRAY['Tvoří přibližně 50–55 % celkového procesu komunikace. Zahrnuje výhradně artikulační rychlost, slovní zásobu, syntaktickou stavbu vět a fonetické zabarvení hlasu mluvčího. Mimika, gesta ani proxemika do neverbální komunikace nepatří, jde o složky řeči.', 'Tvoří 70–75 % celkového procesu komunikace. Zahrnuje výhradně grafologické znaky rukopisu, styl oblékání, nošení doplňků a úpravu služebního stejnokroje. Oční kontakt ani haptika se mezi neverbální projevy neřadí, protože jde o přímý fyzický kontakt osob.', 'Tvoří zanedbatelných 10–15 % komunikace. Zahrnuje výhradně fyziologické vegetativní reakce organismu, jako je tepová frekvence, pocení dlaní a kožní galvanický reflex. Paralingvistika je součástí verbální řeči.', 'Podle Mehrabianova poměru přibližně 93 % (38 % hlas, 55 % řeč těla) při sdělování pocitů a postojů. Zahrnuje mimiku, kineziku a gesta, oční kontakt, paralingvistiku (tón, hlasitost, tempo, pauzy), proxemiku, haptiku a držení těla.']),
       correct_index = 3,
       explanation   = 'Neverbální komunikaci tvoří mimika, kinezika a gesta, oční kontakt, paralingvistika, proxemika, haptika a držení těla. Často citovaný poměr 7 % slova – 38 % hlas – 55 % řeč těla (A. Mehrabian) pochází z pokusů o sdělování pocitů a postojů, neplatí tedy pro každou komunikaci. Neverbální projevy prozrazují emoce a postoje; nesoulad se slovy snižuje věrohodnost sdělení, sám o sobě však lež nedokazuje. (Právní úprava: Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 24, 26–29)',
       source        = 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 24, 26–29',
       topic         = 'Neverbální komunikace'
 WHERE question = 'Z čeho se skládá neverbální komunikace a kolik procent celkového procesu komunikace tvoří?'
   AND NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE question = 'Z čeho se skládá neverbální komunikace a jaký podíl na sdělení se jí připisuje podle Mehrabianova poměru?');

-- 18. bs-37: zásobník CZ 75 B má 16 nábojů (shodně s přehledem zbraní), palebný průměr 32
UPDATE public.quiz_questions
   SET question      = 'Jaká je kapacita zásobníku pistole CZ 75 B a její plný palebný průměr?',
       options       = to_jsonb(ARRAY['16 nábojů, plný palebný průměr 32 nábojů', '12 nábojů, palebný průměr 24 nábojů', '20 nábojů, plný palebný průměr 60 nábojů ve 3 zásobnících', '10 nábojů, plný palebný průměr 20 nábojů']),
       correct_index = 0,
       explanation   = 'Pistole CZ 75 B ráže 9 mm Luger má dvouřadý zásobník na 16 nábojů; plný palebný průměr jsou 2 zásobníky po 16 nábojích, tedy 32 nábojů. (Právní úprava: Učební text Speciální příprava – střelecká teorie, s. 3–8)',
       source        = 'Učební text Speciální příprava – střelecká teorie, s. 3–8',
       topic         = 'Pistole CZ 75'
 WHERE question = 'Jaká je kapacita zásobníku pistole CZ 75 B a její plný palebný průměr?';

-- 19. pr-39: strany podle § 12 odst. 7 TŘ; § 2 odst. 10 TŘ je veřejnost, ne rovnost stran
UPDATE public.quiz_questions
   SET question      = 'Kdo jsou subjekty trestního řízení a jak se liší od stran trestního řízení?',
       options       = to_jsonb(ARRAY['Subjekty trestního řízení jsou výhradně příslušníci a občanští zaměstnanci Vězeňské služby ČR zajišťující ostrahu obviněného v průběhu soudního líčení: 1. velitel eskorty, 2. dozorce justiční stráže, 3. vedoucí oddělení výkonu vazby, 4. ředitel věznice. Stranami jsou zaměstnanci soudu zajišťující průběh jednání (zapisovatel, soudní tajemník); obhájce se mezi subjekty ani strany nezařazuje.', 'Subjekty jsou všichni činitelé s procesními právy a povinnostmi ovlivňující průběh řízení: 1. OČTŘ (soud, státní zástupce, policejní orgán), 2. Osoba, proti níž se řízení vede (podezřelý, obviněný, obžalovaný), 3. Poškozený, 4. Zúčastněná osoba, 5. Obhájce, zmocněnci a opatrovník. Stranami jsou dle § 12 odst. 7 TŘ obviněný, poškozený a zúčastněná osoba, před soudem i státní zástupce.', 'Subjekty jsou výhradně očití svědci a přizvaní soudní znalci, zatímco stranami trestního řízení jsou výhradně příslušníci vězeňské eskorty a justiční stráže: 1. svědek události, 2. znalec z oboru psychiatrie, 3. tlumočník, 4. zapisovatel. Soud, státní zástupce ani policejní orgán mezi subjekty nepatří, protože řízení vedou, a poškozený je pouhým oznamovatelem bez procesních práv.', 'Subjektem trestního řízení je výhradně předseda senátu krajského soudu a stranami jsou vyšetřovatelé Policie ČR podávající zprávu o průběhu vyšetřování: 1. předseda senátu, 2. přísedící, 3. vyšetřovatel, 4. dozorující státní zástupce. Obviněný, poškozený ani obhájce nemají procesní práva, jimiž by průběh řízení ovlivňovali, a Probační a mediační služba se řízení neúčastní.']),
       correct_index = 1,
       explanation   = 'Subjekty trestního řízení jsou orgány činné v trestním řízení (soud, státní zástupce, policejní orgán – § 12 odst. 1 TŘ), osoba, proti níž se řízení vede, poškozený, zúčastněná osoba a jejich zástupci (obhájce, zmocněnec, opatrovník). Stranou je podle § 12 odst. 7 TŘ ten, proti němuž se řízení vede, zúčastněná osoba a poškozený, v řízení před soudem též státní zástupce. Svědci a znalci se stávají subjekty řízení jen tehdy, když uplatňují vlastní nárok (např. svědečné nebo znalečné). (Právní úprava: § 12 odst. 1 a 7 zákona č. 141/1961 Sb., trestní řád)',
       source        = '§ 12 odst. 1 a 7 zákona č. 141/1961 Sb., trestní řád',
       topic         = 'Trestní právo procesní'
 WHERE question = 'Kdo jsou subjekty trestního řízení a jak se liší od stran trestního řízení?';

-- 20. pr-52: § 39a ZVTOS je náhrada škody → § 12a, § 12b; soud zařazuje „zpravidla“, ne obligatorně
UPDATE public.quiz_questions
   SET question      = 'Jak se z hlediska výkonu člení nepodmíněné tresty odnětí svobody (§ 56 TZ a ZVTOS)?',
       options       = to_jsonb(ARRAY['Vykonávají se výhradně ve třech typech věznic: dohled, dozor a ostraha. O zařazení rozhoduje ředitel věznice na základě kapacity ubytovacích prostor bez ohledu na verdikt soudu. Věznice se zvýšenou ostrahou zákon nezná a vnitřní členění na oddělení s nízkým, středním a vysokým stupněm zabezpečení se neuplatňuje.', 'Odnětí svobody se vykonává ve věznicích s ostrahou (členěné na oddělení s nízkým, středním a vysokým stupněm zabezpečení) nebo se zvýšenou ostrahou. Do věznice se zvýšenou ostrahou soud zpravidla zařadí například pachatele s výjimečným trestem nebo za trestný čin spáchaný ve prospěch organizované zločinecké skupiny.', 'Existuje výhradně jeden typ věznice s jednotným režimem pro všechny odsouzené, protože ústava zaručuje rovnost občanů před zákonem i během výkonu trestu. Pachatele s výjimečným trestem ani odsouzeného za zvlášť závažný zločin ve prospěch organizované zločinecké skupiny nelze zařadit odlišně a soud o zařazení nerozhoduje.', 'Tresty odnětí svobody se člení na krátkodobé (do 1 roku), střednědobé (do 5 let) a dlouhodobé (nad 5 let), přičemž všechny se vykonávají ve stejných ubytovnách se společným režimem. Typ věznice se neurčuje, obligatorní zařazení do věznice se zvýšenou ostrahou zákon neupravuje a o délce trestu rozhoduje ředitel.']),
       correct_index = 1,
       explanation   = 'Podle § 56 odst. 1 trestního zákoníku se nepodmíněný trest vykonává ve věznici s ostrahou nebo se zvýšenou ostrahou (novela z roku 2017 nahradila dřívější čtyři typy věznic). Do věznice se zvýšenou ostrahou soud zpravidla zařadí pachatele podle § 56 odst. 2 písm. b), vždy pak pachatele odsouzeného na doživotí (§ 56 odst. 3). Věznice s ostrahou se člení na oddělení s nízkým, středním a vysokým stupněm zabezpečení (§ 12a ZVTOS); o umístění do oddělení rozhoduje ředitel věznice po vyhodnocení rizik odbornou komisí (§ 12b ZVTOS), o typu věznice soud. (Právní úprava: § 56 zákona č. 40/2009 Sb., trestní zákoník a § 12a a § 12b zákona č. 169/1999 Sb.)',
       source        = '§ 56 zákona č. 40/2009 Sb., trestní zákoník a § 12a a § 12b zákona č. 169/1999 Sb.',
       topic         = 'Trestní právo hmotné'
 WHERE question = 'Jak se z hlediska výkonu člení nepodmíněné tresty odnětí svobody (§ 56 TZ a ZVTOS)?';

-- 21. sp-05: NGŘ č. 33/2019 je řád prohlídek → NGŘ č. 19/2023 o zbraňové službě
UPDATE public.quiz_questions
   SET question      = 'Jaký je stanovený postup bezpečné kontroly zbraně (vybití zbraně) u lapače střel?',
       options       = to_jsonb(ARRAY['1. Zbraň směřuje do lapače střel, 2. Vyjmout zásobník, 3. Dvakrát promáčknout spoušť naprázdno, 4. Natáhnout závěr do zadní polohy a zajistit manuální pojistkou, 5. Nábojovou komoru kontrolovat pouze zrakem, hmatová kontrola se u služebních pistolí neprovádí.', '1. Zbraň směřuje do lapače střel (úhel 45°), 2. Vyjmout zásobník, 3. Zkontrolovat nábojovou komoru (zrakem a hmatem), 4. Vypustit závěr, 5. Rána jistoty do lapače, 6. Zajistit/zasunout do pouzdra.', '1. Zbraň směřuje do země, 2. Vyjmout zásobník, 3. Stisknout spoušť bez natažení závěru, 4. Vizuálně zkontrolovat výhozní okénko, 5. Zasunout zbraň do pouzdra.', '1. Zbraň směřuje do lapače, 2. Natáhnout závěr vzad a vypustit ránu jistoty, 3. Vyjmout zásobník, 4. Zkontrolovat komoru, 5. Zasunout do pouzdra.']),
       correct_index = 1,
       explanation   = 'Základní bezpečnostní drill pro manipulaci se služební zbraní: Zbraň vždy směřuje do bezpečného prostoru/lapače, PRVNÍ je vyjmutí zásobníku, NÁSLEDUJE kontrola komory (dvojí kontrola: zrak + prst), vypuštění závěru a rána jistoty. (Právní úprava: NGŘ č. 19/2023 o zbraňové službě a střelecké přípravě a střelecký řád VS ČR)',
       source        = 'NGŘ č. 19/2023 o zbraňové službě a střelecké přípravě a střelecký řád VS ČR',
       topic         = 'Střelecká příprava – Pistole CZ 75 B / P-10 C'
 WHERE question = 'Jaký je stanovený postup bezpečné kontroly zbraně (vybití zbraně) u lapače střel?';

-- 22. sp-04: § 19 nepovoluje „pouze hmaty a chvaty“; vylučuje vyjmenované prostředky
UPDATE public.quiz_questions
   SET question      = 'Vůči kterým osobám je příslušník povinen omezit použití DP a zbraně dle § 19 zákona č. 555/1992 Sb.?',
       options       = to_jsonb(ARRAY['Vůči obviněným ve výkonu vazby a osobám s psychiatrickou diagnózou (povolena výhradně hrozba namířenou střelnou zbraní a varovný výstřel).', 'Vůči těhotným ženám, osobám vysokého věku, se zjevným zdravotním postižením a zjevně mladším 15 let (nelze užít mj. úderů a kopů, obušku, psa ani zbraně, neohrožuje-li jejich útok život či zdraví).', 'Vůči mladistvým do 18 let, osobám zbaveným svéprávnosti, cizím státním příslušníkům a osobám v ústavním léčení, vůči nimž nesmí být použit žádný donucovací prostředek včetně hmatů a chvatů, a to ani tehdy, je-li bezprostředně ohrožen život příslušníka.', 'Vůči ženám obecně, osobám starším 60 let a prvotrestaným odsouzeným (lze použít výhradně slzotvorný sprej a pouta, nikoli obušek a psa).']),
       correct_index = 1,
       explanation   = 'Podle § 19 odst. 1 písm. a) zákona č. 555/1992 Sb. nelze proti těhotné ženě, osobě vysokého věku, osobě se zjevným zdravotním postižením nebo osobě zjevně mladší 15 let použít úderů a kopů sebeobrany, pout s poutacím opaskem, slzotvorných a elektrických prostředků, obušku, služebního psa, vodního stříkače, zásahové výbušky, expanzní zbraně, úderu střelnou zbraní, varovného výstřelu ani střelné zbraně. Ostatní prostředky (např. hmaty, chvaty, pouta) zákon nevylučuje. Proti ženě nelze použít služebního psa, elektrický prostředek a střelnou zbraň (písm. b). Omezení neplatí, pokud útok těchto osob bezprostředně ohrožuje život nebo zdraví příslušníka či jiné osoby nebo hrozí větší škoda na majetku a nebezpečí nelze odvrátit jinak, a při zamezení útěku podle § 18 odst. 1 písm. c). (Právní úprava: § 19 odst. 1 zákona č. 555/1992 Sb., o VS a JS ČR)',
       source        = '§ 19 odst. 1 zákona č. 555/1992 Sb., o VS a JS ČR',
       topic         = 'Zákonná omezení použití DP a zbraně'
 WHERE question = 'Vůči kterým osobám je příslušník povinen omezit použití DP a zbraně dle § 19 zákona č. 555/1992 Sb.?';

-- 23. pen-19: zákaz návštěv a balíčků v samovazbě platí pro obviněné (§ 22 odst. 7 ZVV), ne odsouzené
UPDATE public.quiz_questions
   SET question      = 'Uveďte nejdůležitější režimová omezení odsouzeného při celodenním umístění do uzavřeného oddílu a v samovazbě!',
       options       = to_jsonb(ARRAY['Zákaz sprchování a osobní hygieny, zákaz podávání teplé stravy, zákaz korespondence s obhájcem a státními orgány, zákaz denních vycházek a povinné celodenní stání v pozoru u mříže cely. Nákup hygienických potřeb zůstává povolen a vycházky se konají dvakrát denně.', 'Povolení neomezeného nákupu potravin i tabákových výrobků, možnost sledování společné televize do 23:00 hodin, zachování nároku na standardní balíčky a účast na všech skupinových sportovních aktivitách. Zákaz kouření ani zákaz odpočinku na lůžku se v uzavřeném oddílu neuplatňuje.', 'Zákaz užívání předepsaných léků, zákaz kontaktu se zdravotnickým personálem, omezení pitné vody na 1 litr denně a povinné vykonávání nočních úklidových prací po dobu trvání trestu. Zákaz kouření neplatí a návštěvy advokáta jsou vyloučeny.', 'Zákaz kouření, nákupu potravin (kromě hygienických potřeb), čtení tisku a knih (kromě právnické, vzdělávací a náboženské literatury), bateriového radiopřijímače a odpočinku na lůžku mimo určenou dobu; balíček se vydá až po skončení trestu.']),
       correct_index = 3,
       explanation   = 'Podle § 49 odst. 3 ZVTOS není odsouzenému v samovazbě dovoleno kouřit, číst tisk a knihy (kromě právnické, vzdělávací a náboženské literatury), nakupovat (kromě hygienických potřeb) ani odpočívat na lůžku mimo určenou dobu; totéž platí při celodenním umístění do uzavřeného oddílu, kde navíc vykonává úklidové práce. Bateriový radiopřijímač v uzavřeném oddílu mít nesmí (§ 63 odst. 1 vyhl. č. 345/1999 Sb.), návštěvy probíhají odděleně za přímého dozoru a nárokový balíček se vydá až po skončení trestu (§ 64). Zákaz návštěv (kromě obhájce a advokáta) a balíčků v samovazbě platí pro obviněné (§ 22 odst. 7 zákona č. 293/1993 Sb.), ne pro odsouzené. (Právní úprava: § 49 ZVTOS, § 63–65 vyhl. 345/1999 Sb., § 22 odst. 7 ZVV a Studijní text str. 55–56)',
       source        = '§ 49 ZVTOS, § 63–65 vyhl. 345/1999 Sb., § 22 odst. 7 ZVV a Studijní text str. 55–56',
       topic         = 'Režimová omezení v uzavřeném oddílu'
 WHERE question = 'Uveďte nejdůležitější režimová omezení v uzavřeném oddělení!'
   AND NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE question = 'Uveďte nejdůležitější režimová omezení odsouzeného při celodenním umístění do uzavřeného oddílu a v samovazbě!');

-- 24. pen-52: interval hodnocení závisí na typu věznice (§ 38 odst. 1 vyhl. 345/1999 Sb.)
UPDATE public.quiz_questions
   SET question      = 'Jak často se podle řádu výkonu trestu zpravidla vyhodnocuje plnění programu zacházení u odsouzeného ve věznici s ostrahou?',
       options       = to_jsonb(ARRAY['Pouze jednou za kalendářní rok bez ohledu na délku uloženého trestu. Změna v chování ani přeřazení na vyhodnocení nemají vliv.', 'Každý týden v rámci ranní prověrky na ubytovně. U mladistvých se vyhodnocení neprovádí vůbec a změny v chování se nezohledňují.', 'Zpravidla jednou za 3 měsíce; ve věznici pro mladistvé jednou za měsíc, ve výstupním oddílu za 2 a při zvýšené ostraze za 6 měsíců.', 'Výhradně těsně před podáním žádosti o podmíněné propuštění na soud. V průběhu výkonu trestu se program zacházení nevyhodnocuje vůbec.']),
       correct_index = 2,
       explanation   = 'Podle § 38 odst. 1 vyhlášky č. 345/1999 Sb. se úspěšnost plnění programu zacházení vyhodnocuje zpravidla jednou za měsíc ve věznici pro mladistvé, za dva měsíce ve výstupních oddílech, za tři měsíce ve věznici s ostrahou a za šest měsíců ve věznici se zvýšenou ostrahou. Odsouzený je s výsledky prokazatelně seznámen a program se při vyhodnocení aktualizuje (§ 38 odst. 2 a 3). (Právní úprava: § 38 vyhlášky MS ČR č. 345/1999 Sb., řád výkonu trestu odnětí svobody)',
       source        = '§ 38 vyhlášky MS ČR č. 345/1999 Sb., řád výkonu trestu odnětí svobody',
       topic         = 'Program zacházení odsouzených'
 WHERE question = 'Jak často se standardně provádí komplexní hodnocení plnění individuálního programu zacházení u odsouzeného ve VTOS?'
   AND NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE question = 'Jak často se podle řádu výkonu trestu zpravidla vyhodnocuje plnění programu zacházení u odsouzeného ve věznici s ostrahou?');

-- 25. pen-77: v koluzní vazbě i advokát v jiné věci (§ 13a odst. 3 ZVV), ne „pouze obhájce“
UPDATE public.quiz_questions
   SET question      = 'S kým smí obviněný ve vazbě z koluzních důvodů používat telefon podle § 13a zákona č. 293/1993 Sb.?',
       options       = to_jsonb(ARRAY['S osobou blízkou i se svým obhájcem', 'Jen s obhájcem či advokátem v jiné věci', 'Jen s osobou blízkou po souhlasu soudu', 'S nikým, telefon je v koluzní vazbě vyloučen']),
       correct_index = 1,
       explanation   = 'Podle § 13a odst. 1 zákona č. 293/1993 Sb. má právo telefonovat osobě blízké jen obviněný, u něhož důvodem vazby není obava z maření objasňování skutečností (koluzní vazba). Právo na kontakt s obhájcem nebo s advokátem, který obviněného zastupuje v jiné věci, má podle § 13a odst. 3 každý obviněný, tedy i v koluzní vazbě. (Právní úprava: § 13a odst. 1 a 3 zákona č. 293/1993 Sb.)',
       source        = '§ 13a odst. 1 a 3 zákona č. 293/1993 Sb.',
       topic         = 'Práva obviněného'
 WHERE question = 'S kým smí obviněný ve vazbě z koluzních důvodů používat telefon podle § 13a zákona č. 293/1993 Sb.?';

-- 26. ped-23: kázeňská pravomoc: GŘ a ředitelé věznic, ostatní jen se zmocněním (§ 51 odst. 1 ZVTOS)
UPDATE public.quiz_questions
   SET question      = 'Kdo má ve věznici pravomoc ukládat odsouzeným kázeňské tresty a odměny?',
       options       = to_jsonb(ARRAY['Každý příslušník vězeňské stráže nebo dozorce bez ohledu na služební zařazení a bez nutnosti schválení nadřízeným.', 'Samospráva odsouzených zvolená v rámci oddílu na základě kolektivního hlasování vězněných osob. Pravomoc nemá.', 'Generální ředitel VS a ředitel věznice; ostatní zaměstnanci (např. vychovatel) jen v rozsahu, k němuž byli zmocněni.', 'Výhradně příslušný samosoudce okresního soudu po provedení hlavního líčení přímo v prostorách věznice. Ředitel ji nemá.']),
       correct_index = 2,
       explanation   = 'Podle § 51 odst. 1 zákona č. 169/1999 Sb. vykonávají kázeňskou pravomoc nad odsouzenými generální ředitel Vězeňské služby a ředitelé věznic. Jiní zaměstnanci (vedoucí oddělení výkonu trestu, vychovatel apod.) ji mohou vykonávat, jen pokud je k tomu zmocnil generální ředitel nebo s jeho souhlasem ředitel věznice. V praxi se tak pravomoc v určeném rozsahu deleguje zejména na vychovatele, aby mohl pružně a výchovně reagovat. (Právní úprava: § 51 odst. 1 zákona č. 169/1999 Sb. a Učební texty předmětu Pedagogika, Akademie VS ČR, str. 68)',
       source        = '§ 51 odst. 1 zákona č. 169/1999 Sb. a Učební texty předmětu Pedagogika, Akademie VS ČR, str. 68',
       topic         = 'Kázeňská pravomoc'
 WHERE question = 'Kdo má ve věznici pravomoc ukládat odsouzeným kázeňské tresty a odměny?';

-- 27. psy-44: distraktor „první uvěznění“ je sám rizikový faktor – nahrazen ochranným
UPDATE public.quiz_questions
   SET question      = 'Které z uvedených faktorů podle učebního textu psychologie nasvědčují vysoké pravděpodobnosti sebevražedného jednání?',
       options       = to_jsonb(ARRAY['Mužské pohlaví a věk nad 40 let', 'Stabilní rodina a pravidelné návštěvy', 'Ženské pohlaví a věk pod 25 let', 'Práce a zájmová činnost']),
       correct_index = 0,
       explanation   = 'Mezi faktory vysoké pravděpodobnosti sebeohrožení patří sebevražedné pokusy v anamnéze a v příbuzenstvu, beznaděj, chronická nemoc, abúzus alkoholu nebo drog, osamělost, věk nad 40 let a mužské pohlaví. Pracovní zařazení, zájmová činnost a udržované rodinné vztahy naopak patří k ochranným faktorům. (Právní úprava: učební text Psychologie pro ZOP (Akademie VS ČR, 2023), kapitola Sebevražedné (suicidiální) jednání, s. 73–75)',
       source        = 'učební text Psychologie pro ZOP (Akademie VS ČR, 2023), kapitola Sebevražedné (suicidiální) jednání, s. 73–75',
       topic         = 'Suicidální chování vězňů'
 WHERE question = 'Které z uvedených faktorů podle učebního textu psychologie nasvědčují vysoké pravděpodobnosti sebevražedného jednání?';

-- 28. sp-137: ochrana svědků i podle pokynů vedoucího státního zástupce (§ 22 odst. 7) – dvojznačné
UPDATE public.quiz_questions
   SET question      = 'Podle čích pokynů poskytuje justiční stráž ochranu svědkům, jejichž totožnost a podoba má být utajena?',
       options       = to_jsonb(ARRAY['Podle pokynů předsedy senátu nebo vedoucího státního zástupce', 'Podle pokynů ředitele věznice nebo generálního ředitele Vězeňské služby', 'Podle pokynů vedoucího oddělení VS nebo velitele eskorty', 'Podle pokynů policejního orgánu nebo obhájce obviněného']),
       correct_index = 0,
       explanation   = 'Podle § 22 odst. 7 zákona č. 555/1992 Sb. poskytuje justiční stráž v budovách soudů a státních zastupitelství ochranu svědkům, jejichž totožnost a podoba má být utajena, podle pokynů předsedy senátu nebo vedoucího státního zástupce; při ochraně chráněné osoby spolupracuje s policií. (Právní úprava: § 22 odst. 7 zákona č. 555/1992 Sb.; § 140 odst. 2 NGŘ č. 33/2019)',
       source        = '§ 22 odst. 7 zákona č. 555/1992 Sb.; § 140 odst. 2 NGŘ č. 33/2019',
       topic         = 'Justiční stráž – ochrana svědků'
 WHERE question = 'Podle čích pokynů poskytuje justiční stráž ochranu svědkům, jejichž totožnost a podoba má být utajena?';

COMMIT;

-- Kontrola po spuštění (jen čte). Má vrátit 28 řádků a ve sloupci
-- spravna_odpoved text správné možnosti:
-- SELECT question, correct_index, options ->> correct_index AS spravna_odpoved, source
--   FROM public.quiz_questions
--  WHERE question IN (
--   'Jaké rozlišujeme způsoby (systémy) ubytování vězňů, vysvětlete rozdíly mezi nimi!',
--   'Vyjmenujte a popište základní vybavení cel a ložnic, jak je legislativně upraven počet ubytovaných v cele (ložnici)?',
--   'Která kategorie vězněných osob se označuje zkratkou DVO a jaká platí pro ni specifika?',
--   'U jakých kategorií osob je příslušníkům VS ČR zakázáno použít úderů, kopů, slzotvorných prostředků, taseru a zbraně (neplatí pro nutnou obranu a krajní nouzi)?',
--   'Jaké jsou zákonné podmínky pro použití donucovacích prostředků (DP) podle zákona č. 555/1992 Sb.?',
--   'Jaká jsou přísná zákonná a metodická pravidla pro provádění důkladné osobní prohlídky (se svlečením do naha)?',
--   'Jaká oprávnění má příslušník Justiční stráže v jednací síni soudu během hlavního líčení?',
--   'V jakém případě se podle § 40 odst. 2 zákona č. 169/1999 Sb. program zacházení pro odsouzeného nezpracovává?',
--   'Kdo a na jakém základě rozhoduje o zařazení odsouzeného do konkrétního stupně zabezpečení v rámci věznice s ostrahou?',
--   'Které orgány a na čí návrh rozhodují o uvalení vazby a o propuštění z vazby?',
--   'Jaké jsou zákonné důvody pro propuštění z VV, kdo o něm rozhoduje?',
--   'Vysvětlete, jak je naplňováno právo odsouzeného na korespondenci a jaká jsou jeho případná omezení:',
--   'Jaký je hmotnostní limit pro balíček s potravinami a věcmi osobní potřeby zasílaný vězněné osobě a jak se provádí jeho kontrola?',
--   'Jak by se měl příslušník VS ČR chovat v době mimo službu (v občanském životě a na sociálních sítích)?',
--   'Může příslušník nebo zaměstnanec VS ČR přijmout peněžitý dar nebo pozornost od rodinného příslušníka vězněné osoby jako poděkování za lidský přístup?',
--   'Jak má být genderově a bezpečnostně zajištěn standardní průběh osobních prohlídek občanů a vězněných osob?',
--   'Z čeho se skládá neverbální komunikace a jaký podíl na sdělení se jí připisuje podle Mehrabianova poměru?',
--   'Jaká je kapacita zásobníku pistole CZ 75 B a její plný palebný průměr?',
--   'Kdo jsou subjekty trestního řízení a jak se liší od stran trestního řízení?',
--   'Jak se z hlediska výkonu člení nepodmíněné tresty odnětí svobody (§ 56 TZ a ZVTOS)?',
--   'Jaký je stanovený postup bezpečné kontroly zbraně (vybití zbraně) u lapače střel?',
--   'Vůči kterým osobám je příslušník povinen omezit použití DP a zbraně dle § 19 zákona č. 555/1992 Sb.?',
--   'Uveďte nejdůležitější režimová omezení odsouzeného při celodenním umístění do uzavřeného oddílu a v samovazbě!',
--   'Jak často se podle řádu výkonu trestu zpravidla vyhodnocuje plnění programu zacházení u odsouzeného ve věznici s ostrahou?',
--   'S kým smí obviněný ve vazbě z koluzních důvodů používat telefon podle § 13a zákona č. 293/1993 Sb.?',
--   'Kdo má ve věznici pravomoc ukládat odsouzeným kázeňské tresty a odměny?',
--   'Které z uvedených faktorů podle učebního textu psychologie nasvědčují vysoké pravděpodobnosti sebevražedného jednání?',
--   'Podle čích pokynů poskytuje justiční stráž ochranu svědkům, jejichž totožnost a podoba má být utajena?')
--  ORDER BY question;
