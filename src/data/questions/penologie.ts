import { Question } from '../../types';

export const penologieQuestions: Question[] = [
  {
    id: 'pen-01',
    subject: 'Penologie',
    topic: 'Výkon vazby – Důvody vazby',
    question: 'Jaké jsou důvody vazby a která právní norma je stanovuje?',
    answer: 'Stanovuje je § 67 trestního řádu (zák. č. 141/1961 Sb.): a) útěková vazba, b) koluzní vazba (ovlivňování svědků / maření objasňování skutečností), c) předstižná / preventivní vazba (pokračování v trestné činnosti či její dokonání).',
    options: [
      'Stanovuje je § 67 trestního řádu (zák. č. 141/1961 Sb.): a) kárná vazba, b) vyšetřovací vazba k zajištění výslechu, c) zabezpečovací vazba k ochraně poškozených osob.',
      'Stanovuje je § 67 trestního řádu (zák. č. 141/1961 Sb.): a) útěková vazba, b) koluzní vazba (ovlivňování svědků / maření objasňování skutečností), c) předstižná / preventivní vazba (pokračování v trestné činnosti či její dokonání).',
      'Stanovuje je § 5 zákona o výkonu vazby (zák. č. 293/1993 Sb.): a) pořádková vazba, b) mediační vazba pro dohodu o vině a trestu, c) ochranná vazba pro osoby s duševní poruchou.',
      'Stanovuje je § 38 trestního zákoníku (zák. č. 40/2009 Sb.): a) útěková vazba, b) kárná vazba pro porušení zákazu styku, c) sankční vazba za neplacení peněžitého trestu.'
    ],
    correctOption: 1,
    rationale: 'Dle § 67 zákona č. 141/1961 Sb. (trestní řád) smí být obviněný vzat do vazby jen tehdy, jsou-li dány konkrétní skutečnosti odůvodňující obavu z útěku či skrývání [písm. a)], působení na svědky a maření objasňování skutečností [písm. b) - koluzní vazba trvající max. 3 měsíce], nebo pokračování v trestné činnosti či jejího dokonání [písm. c)].',
    source: '§ 67 zákona č. 141/1961 Sb. (trestní řád) a Studijní text Penologie ZOP A str. 9'
  },
  {
    id: 'pen-02',
    subject: 'Penologie',
    topic: 'Zásady výkonu vazby',
    question: 'Jaké jsou hlavní zásady výkonu vazby dle zákona č. 293/1993 Sb.?',
    answer: 'Presumpce neviny (hledí se na něj, jako by byl nevinen), respektování lidské důstojnosti, zákaz fyzického i psychického nátlaku, a uplatnění pouze nezbytných omezení nutných k naplnění účelu vazby a pořádku.',
    options: [
      'Povinná resocializace a převýchova obviněného, povinné zařazení do práce bez nároku na odměnu a uplatnění všech režimových omezení jako u odsouzených ve věznici se zvýšenou ostrahou.',
      'Presumpce neviny (hledí se na něj, jako by byl nevinen), respektování lidské důstojnosti, zákaz fyzického i psychického nátlaku, a uplatnění pouze nezbytných omezení nutných k naplnění účelu vazby a pořádku.',
      'Zásada retribuce a odčinění škody poškozeným, absolutní zákaz kontaktu s vnějším světem a uplatňování kázeňských trestů včetně celodenního umístění do uzavřeného oddílu až na 28 dnů.',
      'Zásada individuálního zacházení prostřednictvím komplexního programu zacházení (SARPO), povinnost podrobit se terapeutickému programu a zákaz nošení vlastního civilního oděvu.'
    ],
    correctOption: 1,
    rationale: 'Dle § 2 zákona č. 293/1993 Sb. platí zásada presumpce neviny. Vazba je zajišťovacím procesním institutem, nikoli trestem. Obviněný smí být podroben pouze omezením nutným ke splnění účelu vazby a zachování bezpečnosti.',
    source: '§ 2 zákona č. 293/1993 Sb., o výkonu vazby a Studijní text Penologie ZOP A str. 9'
  },
  {
    id: 'pen-03',
    subject: 'Penologie',
    topic: 'Zásady výkonu trestu odnětí svobody',
    question: 'Jaké jsou hlavní zásady výkonu trestu odnětí svobody (VTOS) dle zákona č. 169/1999 Sb.?',
    answer: 'Respektovat důstojnost osobnosti odsouzeného, omezovat škodlivé účinky zbavení svobody (prizonizaci), zachovávat zdraví a podporovat postoje a dovednosti pro soběstačný život v souladu se zákonem po propuštění.',
    options: [
      'Uplatňovat výhradně odstrašující a retributivní složku trestu, izolovat odsouzeného od jakéhokoliv kontaktu s rodinou a zaměřit se pouze na výkon manuální práce ve prospěch věznice.',
      'Respektovat důstojnost osobnosti odsouzeného, omezovat škodlivé účinky zbavení svobody (prizonizaci), zachovávat zdraví a podporovat postoje a dovednosti pro soběstačný život v souladu se zákonem po propuštění.',
      'Uplatňovat presumpci neviny, zachovávat odsouzenému veškerá občanská a politická práva bez omezení a uplatňovat pouze ta omezení, která schválí dozorový státní zástupce.',
      'Soustředit se na generální prevenci prostřednictvím zpřísněného režimu bez možnosti individuálního hodnocení rizik a potřeb a vyloučit jakékoliv vzdělávací či terapeutické aktivity.'
    ],
    correctOption: 1,
    rationale: 'Dle § 1 a § 2 zákona č. 169/1999 Sb. je účelem trestu snižovat nebezpečí recidivy a vést odsouzené k soběstačnému životu v souladu se zákonem při zachování jejich lidské důstojnosti a zdraví.',
    source: '§ 1 a § 2 zákona č. 169/1999 Sb., o VTOS a Studijní text Penologie ZOP A str. 13'
  },
  {
    id: 'pen-04',
    subject: 'Penologie',
    topic: 'Rozhodování o vazbě',
    question: 'Které orgány a na čí návrh rozhodují o uvalení vazby a o propuštění z vazby?',
    answer: 'O vzetí do vazby rozhoduje vždy soud (v přípravném řízení na návrh státního zástupce); o propuštění rozhoduje soud, v přípravném řízení též státní zástupce, nebo státní zástupce při výkonu dozoru a prezident/ministr při milosti.',
    options: [
      'O vzetí do vazby rozhoduje státní zástupce na návrh policejního orgánu; o propuštění z vazby rozhoduje výhradně ředitel vazební věznice po projednání s dozorčím orgánem Vězeňské služby ČR.',
      'O vzetí do vazby rozhoduje vždy soud (v přípravném řízení na návrh státního zástupce); o propuštění rozhoduje soud, v přípravném řízení též státní zástupce, nebo státní zástupce při výkonu dozoru a prezident/ministr při milosti.',
      'O vzetí do vazby rozhoduje policejní orgán se souhlasem ředitele krajského ředitelství Policie ČR; o propuštění rozhoduje předseda senátu okresního soudu na návrh obhájce obviněného.',
      'O vzetí do vazby rozhoduje soud na návrh policejního orgánu; o propuštění rozhoduje generální ředitel Vězeňské služby ČR nebo vedoucí oddělení výkonu vazby po uplynutí zákonné lhůty.'
    ],
    correctOption: 1,
    rationale: 'Dle § 5 a § 10 zákona č. 293/1993 Sb. a trestního řádu může do vazby vzít osobu pouze soudce na základě písemného příkazu. Propuštění nařizuje soud, státní zástupce (v přípravném řízení či při dozoru dle § 29) nebo v řízení o milosti.',
    source: '§ 5 a § 10 zákona č. 293/1993 Sb. a Studijní text Penologie ZOP A str. 9-10'
  },
  {
    id: 'pen-05',
    subject: 'Penologie',
    topic: 'Postup při příjmu do VV a VTOS',
    question: 'Jaký bude postup zaměstnanců VS ČR při přijetí osob do VV, resp. do VTOS?',
    answer: 'Kontrola písemných rozhodnutí (příkaz soudu/rozsudek), ověření totožnosti, osobní prohlídka a prohlídka věcí za přítomnosti policie (záznam zranění), hygienická opatření, poučení o právech a povinnostech, vstupní lékařská prohlídka, uložení věcí a ubytování v přijímacím/nástupním oddílu.',
    options: [
      'Kontrola totožnosti obviněného dle občanského průkazu, orientační dechová zkouška na alkohol, odebrání civilního oděvu bez možnosti jeho ponechání a okamžité zařazení na kmenovou ubytovnu k výkonu práce.',
      'Kontrola písemných rozhodnutí (příkaz soudu/rozsudek), ověření totožnosti, osobní prohlídka a prohlídka věcí za přítomnosti policie (záznam zranění), hygienická opatření, poučení o právech a povinnostech, vstupní lékařská prohlídka, uložení věcí a ubytování v přijímacím/nástupním oddílu.',
      'Ověření pravomocného rozhodnutí soudu, provedení důkladné osobní prohlídky, uložení všech věcí do skladu bez soupisu a umístění přijímané osoby do cely uzavřeného oddílu na dobu 14 dnů z karanténních důvodů.',
      'Kontrola eskortních dokladů, provedení odběru biologického materiálu k analýze DNA, stanovení programu zacházení speciálním pedagogem a přidělení lůžka na specializovaném oddělení dle volné kapacity.'
    ],
    correctOption: 1,
    rationale: 'Dle § 5-8 zákona č. 293/1993 Sb. (příjem do VV nepřetržitě), § 6 zákona č. 169/1999 Sb. a vyhlášek 109/1994 a 345/1999 Sb. musí být ověřena totožnost, provedena osobní prohlídka, sepsán protokol o stopách násilí za přítomnosti eskorty PČR, poskytnuto poučení v mateřském jazyce a provedena vstupní lékařská prohlídka.',
    source: '§ 5–8 ZVV, § 6 ZVTOS, vyhlášky 109/1994 a 345/1999 Sb. a Studijní text str. 10, 14'
  },
  {
    id: 'pen-06',
    subject: 'Penologie',
    topic: 'Úkoly dozorců OVV',
    question: 'Jaké jsou základní úkoly dozorců oddělení výkonu vazby (OVV)?',
    answer: 'Převzít službu (PPZZ), fyzicky převzít a znát stavy obviněných, prověřit uzamčení cel a signalizace, provádět nepravidelné kontroly cel, zrakové prohlídky vytypovaných osob, zajišťovat výdej stravy, vřelé vody a léků, hygienu a úklid, a plnit časový rozvrh dne bez maření účelu vazby.',
    options: [
      'Zajišťovat předvádění obviněných k výslechům vyšetřovatelů PČR, vyhodnocovat bezpečnostní rizika v systému SARPO, stanovovat individuální programy zacházení a povolovat návštěvy rodinných příslušníků.',
      'Převzít službu (PPZZ), fyzicky převzít a znát stavy obviněných, prověřit uzamčení cel a signalizace, provádět nepravidelné kontroly cel, zrakové prohlídky vytypovaných osob, zajišťovat výdej stravy, vřelé vody a léků, hygienu a úklid, a plnit časový rozvrh dne bez maření účelu vazby.',
      'Provádět nepřetržitý dohled nad střeženým obvodem věznice, obsluhovat zabezpečovací a kamerové systémy na operačním středisku, kontrolovat oprávněnost vstupu osob do věznice a evidovat vjezd vozidel.',
      'Vést osobní spisy obviněných, provádět kázeňská řízení ve funkci orgánu s kázeňskou pravomocí, rozhodovat o přemístění obviněných mezi vazebními věznicemi a cenzurovat korespondenci s obhájci.'
    ],
    correctOption: 1,
    rationale: 'Dle § 3.6 a § 32 NGŘ č. 2/2022 dozorce OVV odpovídá za pořádek a bezpečnost na oddíle vazby, provádí nepravidelné kontroly cel (aby obvinění nezjistili systém), zrakové prohlídky vytypovaných osob a dbá na to, aby nebyl mařen účel vazby (např. u koluzních obviněných).',
    source: 'NGŘ č. 2/2022 čl. 3.6 a § 28–32 a Studijní text str. 30'
  },
  {
    id: 'pen-07',
    subject: 'Penologie',
    topic: 'Úkoly dozorců OVT v ubytovně',
    question: 'Jaké jsou základní úkoly dozorců oddělení výkonu trestu (OVT) v ubytovně odsouzených?',
    answer: 'Fyzicky převzít odsouzené, mít trvalý přehled o stavech, provádět nepravidelné kontroly ložnic/cel, zajišťovat plnění časového rozvrhu dne, organizovat vycházky a fyzické početní prověrky, dohlížet na ústroj, hygienu a úklid rajónů, kontrolovat uzamčení vstupů a bránit vnášení nepovolených věcí.',
    options: [
      'Zpracovávat komplexní pedagogicko-psychologické zprávy odsouzených, vést specializované terapeutické skupiny, rozhodovat o přeřazení do jiného typu věznice a podávat soudu návrhy na podmíněné propuštění.',
      'Fyzicky převzít odsouzené, mít trvalý přehled o stavech, provádět nepravidelné kontroly ložnic/cel, zajišťovat plnění časového rozvrhu dne, organizovat vycházky a fyzické početní prověrky, dohlížet na ústroj, hygienu a úklid rajónů, kontrolovat uzamčení vstupů a bránit vnášení nepovolených věcí.',
      'Zajišťovat technickou údržbu ubytoven, uzavírat pracovní smlouvy s externími subjekty zaměstnávajícími odsouzené, schvalovat výši odměn za práci a vést mzdové účetnictví věznice.',
      'Provádět výhradně venkovní hlídkovou činnost podél signálně-bezpečnostní technologie, střežit odsouzené na venkovních strážních stanovištích a obsluhovat zbraňové systémy věznice.'
    ],
    correctOption: 1,
    rationale: 'Dle § 3.8 a § 68 NGŘ č. 2/2022 dozorce OVT na ubytovně odsouzených zajišťuje vnitřní bezpečnost, provádí kontroly cel a ubytovacích prostor, početní prověrky stavu, dohlíží na dodržování ČRD a spolupracuje s vychovatelem při naplňování programu zacházení.',
    source: 'NGŘ č. 2/2022 čl. 3.8 a § 68 a Studijní text str. 32–33'
  },
  {
    id: 'pen-08',
    subject: 'Penologie',
    topic: 'Dozorčí stanoviště – Druhy',
    question: 'Jaké rozlišujeme druhy dozorčích stanovišť? Doplňte i vhodnými příklady!',
    answer: 'Člení se na: a) vnější a vnitřní, b) pevná a pohyblivá, c) stálá a dočasná. (Příklad: stálé pevné vnitřní stanoviště na ubytovně OVT / dočasné pohyblivé vnější stanoviště při dozoru na nestřeženém pracovišti).',
    options: [
      'Člení se na: a) ozbrojená a neozbrojená, b) denní a noční, c) pěší a motorizovaná. (Příklad: ozbrojené denní motorizované stanoviště eskorty / neozbrojené noční stanoviště na bráně věznice).',
      'Člení se na: a) vnější a vnitřní, b) pevná a pohyblivá, c) stálá a dočasná. (Příklad: stálé pevné vnitřní stanoviště na ubytovně OVT / dočasné pohyblivé vnější stanoviště při dozoru na nestřeženém pracovišti).',
      'Člení se na: a) základní a specializovaná, b) režimová a bezpečnostní, c) kmenová a záložní. (Příklad: základní kmenové stanoviště na chodbě OVV / specializované režimové stanoviště v kuchyni).',
      'Člení se na: a) střežená a nestřežená, b) uzavřená a polootevřená, c) technická a manuální. (Příklad: střežené uzavřené technické stanoviště na operačním středisku / nestřežené manuální stanoviště ve skladu).'
    ],
    correctOption: 1,
    rationale: 'Dle § 103 odst. 2 NGŘ č. 2/2022 a Rozpisu dozorčích stanovišť se dozorčí stanoviště dělí na vnější/vnitřní, pevná/pohyblivá a stálá/dočasná. Jsou určena Plánem střežení věznice.',
    source: '§ 103 odst. 2 NGŘ č. 2/2022 a Studijní text str. 27'
  },
  {
    id: 'pen-09',
    subject: 'Penologie',
    topic: 'Způsoby realizace návštěv odsouzených',
    question: 'Uveďte, jakými způsoby lze realizovat návštěvy odsouzených!',
    answer: '1. Standardní návštěva v návštěvní místnosti za přímého dohledu VS, 2. Návštěva bez zrakové a sluchové kontroly (v prostorách hotelového typu), 3. Návštěva za bezpečnostní dělicí přepážkou, 4. Návštěva spojená s povolením opustit věznici až na 24 hodin, 5. Návštěva v lůžkovém zdravotnickém zařízení se souhlasem lékaře.',
    options: [
      '1. Standardní návštěva v návštěvní místnosti za přímého dohledu VS, 2. Návštěva na ložnici odsouzeného za přítomnosti spoluvězňů, 3. Návštěva formou neomezeného videohovoru, 4. Návštěva s opuštěním věznice až na 72 hodin bez souhlasu ředitele, 5. Návštěva na pracovišti odsouzeného.',
      '1. Standardní návštěva v návštěvní místnosti za přímého dohledu VS, 2. Návštěva bez zrakové a sluchové kontroly (v prostorách hotelového typu), 3. Návštěva za bezpečnostní dělicí přepážkou, 4. Návštěva spojená s povolením opustit věznici až na 24 hodin, 5. Návštěva v lůžkovém zdravotnickém zařízení se souhlasem lékaře.',
      '1. Návštěva v jednací místnosti soudu za přítomnosti soudce, 2. Návštěva přes neprůstřelné sklo s telefonem, 3. Skupinová návštěva na sportovišti věznice, 4. Návštěva v ubytovacím oddílu bez dohledu dozorce, 5. Návštěva v kanceláři vedoucího oddělení výkonu trestu.',
      '1. Výhradně návštěva za bezpečnostní dělicí přepážkou se sluchovou kontrolou, 2. Distanční návštěva prostřednictvím videokonference schválené soudem, 3. Návštěva v mimovězeňském restauračním zařízení se souhlasem vychovatele, 4. Celodenní návštěva na cele samovazby.'
    ],
    correctOption: 1,
    rationale: 'Dle § 19 zákona č. 169/1999 Sb. a vyhlášky č. 345/1999 Sb. (§ 26-28) má odsouzený nárok na 3 hodiny návštěv měsíčně. Ředitel může povolit návštěvu bez kontroly, opuštění věznice na 24 hodin, nebo naopak z bezpečnostních důvodů nařídit přepážku.',
    source: '§ 19 ZVTOS, § 26–28 vyhl. 345/1999 Sb. a Studijní text str. 63–65'
  },
  {
    id: 'pen-10',
    subject: 'Penologie',
    topic: 'Základní povinnosti odsouzených',
    question: 'Uveďte základní povinnosti odsouzených dle § 28 zákona č. 169/1999 Sb.!',
    answer: 'Dodržovat pořádek a kázeň, plnit pokyny zaměstnanců VS, pracovat, plnit program zacházení, šetrně zacházet se svěřenými věcmi, chovat se slušně (vykat a oslovovat „pane/paní“), podrobit se osobním a lékařským prohlídkám, testování na OPL, dodržovat hygienu a noční klid.',
    options: [
      'Hradit měsíčně paušální náklady na stravu a ostrahu ve výši 15 000 Kč, vykonávat samostatně ostrahu ubytovny odsouzených, hlásit přestupky spoluvězňů na operační středisko a nosit výhradně civilní oděv zajištěný rodinou.',
      'Dodržovat pořádek a kázeň, plnit pokyny zaměstnanců VS, pracovat, plnit program zacházení, šetrně zacházet se svěřenými věcmi, chovat se slušně (vykat a oslovovat „pane/paní“), podrobit se osobním a lékařským prohlídkám, testování na OPL, dodržovat hygienu a noční klid.',
      'Zajišťovat výuku mladistvých spoluvězňů, účastnit se povinně náboženských obřadů, předkládat vychovateli denní písemné hlášení o chování a setrvávat na lůžku v době od 06:00 do 22:00 hodin.',
      'Podrobit se bezvýhradně výslechům Policie ČR bez přítomnosti obhájce, odevzdávat veškerou došlou korespondenci ke skartaci, vykonávat pouze těžké fyzické práce a žádat o souhlas dozorce při každém opuštění lůžka.'
    ],
    correctOption: 1,
    rationale: 'Ustanovení § 28 odst. 1 a 2 zákona č. 169/1999 Sb. taxativně stanoví základní i další povinnosti odsouzeného ve VTOS, včetně pracovní povinnosti a podrobení se toxikologickým testům.',
    source: '§ 28 odst. 1 a 2 zákona č. 169/1999 Sb. a Studijní text str. 39–41'
  },
  {
    id: 'pen-11',
    subject: 'Penologie',
    topic: 'Zákazy pro odsouzené',
    question: 'Co je odsouzeným zakázáno dle § 28 odst. 3 ZVTOS?',
    answer: 'Navazovat nedovolené styky, vyrábět/přechovávat/pít alkohol (>0,5 %) a OPL (např. kvasit KVAK/KVÁSKU), přechovávat zbraně a věci k útěku, tiskoviny s rasovou nesnášenlivostí a návody na násilí/drogy, hrát hazardní hry, tetovat sebe či jiné, sebepoškozovat se, prodávat/směňovat věci a mít hotovost.',
    options: [
      'Podávat opravné prostředky proti kázeňským trestům, žádat o přemístění do jiné věznice, vést korespondenci s rodinnými příslušníky, půjčovat si knihy z vězeňské knihovny a odmítnout výkon práce ze zdravotních důvodů.',
      'Navazovat nedovolené styky, vyrábět/přechovávat/pít alkohol (>0,5 %) a OPL (např. kvasit KVAK/KVÁSKU), přechovávat zbraně a věci k útěku, tiskoviny s rasovou nesnášenlivostí a návody na násilí/drogy, hrát hazardní hry, tetovat sebe či jiné, sebepoškozovat se, prodávat/směňovat věci a mít hotovost.',
      'Podávat stížnosti dozorovému státnímu zástupci nebo Veřejnému ochránci práv, přijímat nárokové balíčky do 5 kg jednou za 6 měsíců, využívat telefonní automat ve stanovený čas a nosit předepsaný vězeňský oděv.',
      'Hovořit s obhájcem o samotě bez přítomnosti příslušníka VS, sledovat televizní vysílání ve vymezeném osobním volnu, nakupovat hygienické potřeby ve vězeňské prodejně a účastnit se vzdělávacích aktivit programu zacházení.'
    ],
    correctOption: 1,
    rationale: 'Zákon č. 169/1999 Sb. v § 28 odst. 3 stanoví katalog zákazů k ochraně bezpečnosti, zdraví a pořádku ve věznici. Zakazuje zejména návykové látky, zbraně, hazard, tetování a držení finanční hotovosti.',
    source: '§ 28 odst. 3 zákona č. 169/1999 Sb. a Studijní text str. 44–45'
  },
  {
    id: 'pen-12',
    subject: 'Penologie',
    topic: 'Kázeňské tresty v uzavřeném oddílu',
    question: 'Které kázeňské tresty se vykonávají v uzavřeném oddělení během VTOS?',
    answer: '1. Umístění do uzavřeného oddílu až na 28 dnů (UOMPZ) – odsouzený dochází do práce a na aktivity PZ; 2. Celodenní umístění do uzavřeného oddílu až na 20 dnů (CUO) – nepracuje, neúčastní se PZ, provádí jen úklid věznice, nutné lékařské posouzení; 3. Umístění do samovazby až na 20 dnů.',
    options: [
      '1. Písemná důtka spojená s odebráním volnočasových aktivit až na 14 dnů; 2. Peněžitá pokuta do výše 10 000 Kč; 3. Propadnutí věci nepovolené k držení; 4. Přeložení do věznice se zvýšenou ostrahou na dobu až 6 měsíců.',
      '1. Umístění do uzavřeného oddílu až na 28 dnů (UOMPZ) – odsouzený dochází do práce a na aktivity PZ; 2. Celodenní umístění do uzavřeného oddílu až na 20 dnů (CUO) – nepracuje, neúčastní se PZ, provádí jen úklid věznice, nutné lékařské posouzení; 3. Umístění do samovazby až na 20 dnů.',
      '1. Umístění do uzavřeného oddílu až na 60 dnů s úplným zákazem vycházek; 2. Celodenní umístění do samovazby až na 45 dnů bez souhlasu lékaře; 3. Zákaz přijímání návštěv na dobu 1 roku.',
      '1. Snížení kapesného na dobu 3 měsíců; 2. Zákaz nákupu potravin ve vězeňské prodejně až na 6 měsíců; 3. Zařazení do zvláštního zpřísněného oddílu pro odsouzené s poruchou chování až na 90 dnů.'
    ],
    correctOption: 1,
    rationale: 'Dle § 46 odst. 3 písm. f), g), h) ZVTOS a § 49, 63, 64 vyhlášky č. 345/1999 Sb. se v uzavřeném oddílu vykonávají UOMPZ (do 28 dnů), CUO (do 20 dnů) a samovazba (do 20 dnů, u mladistvých do 10 dnů).',
    source: '§ 46 ZVTOS, § 63–65 vyhl. 345/1999 Sb. a Studijní text str. 55–56'
  },
  {
    id: 'pen-13',
    subject: 'Penologie',
    topic: 'Kázeňská pravomoc ve VV a VTOS',
    question: 'Kteří zaměstnanci VS ČR mají kázeňskou pravomoc ve VV a kteří ve VTOS?',
    answer: 'Ve VV: vrchní dozorce, speciální pedagog, ZVOVV, VOVV, 1. zástupce ředitele a ředitel věznice. Ve VTOS: vychovatel, speciální pedagog, ZVOVT, VOVT, 1. zástupce ředitele a ředitel věznice. O stížnostech proti rozhodnutí ŘV rozhoduje generální ředitel VS ČR.',
    options: [
      'Ve VV i VTOS mají kázeňskou pravomoc všichni řadoví dozorci a strážní bez omezení; o stížnostech proti jejich rozhodnutí rozhoduje přímo dozorový státní zástupce nebo předseda senátu okresního soudu.',
      'Ve VV: vrchní dozorce, speciální pedagog, ZVOVV, VOVV, 1. zástupce ředitele a ředitel věznice. Ve VTOS: vychovatel, speciální pedagog, ZVOVT, VOVT, 1. zástupce ředitele a ředitel věznice. O stížnostech proti rozhodnutí ŘV rozhoduje generální ředitel VS ČR.',
      'Ve VV má kázeňskou pravomoc výhradně policejní vyšetřovatel a státní zástupce; ve VTOS pouze ředitel věznice a vedoucí oddělení prevence a stížností, přičemž proti jejich rozhodnutí není přípustný žádný opravný prostředek.',
      'Ve VV: pouze dozorce na stanovišti a vedoucí eskortní směny; ve VTOS: mistr odborného výcviku, skladník věznice a psycholog oddělení; o odvoláních rozhoduje ministr spravedlnosti ČR.'
    ],
    correctOption: 1,
    rationale: 'Nařízení generálního ředitele č. 41/2024 (účinné od 1. 1. 2025) v § 2–4 svěřuje a odstupňovává kázeňskou pravomoc od vychovatele / vrchního dozorce až po ředitele věznice a generálního ředitele VS ČR.',
    source: 'NGŘ č. 41/2024 § 2–4, Přílohy 1a–1c a Studijní text str. 50–53'
  },
  {
    id: 'pen-14',
    subject: 'Penologie',
    topic: 'Kontrola balíčků a nepovolené předměty',
    question: 'Jaký je postup zaměstnanců VS ČR při kontrole balíku?',
    answer: 'Ověření nároku/potvrzení, váhový limit do 5 kg, RTG kontrola, fyzická kontrola obsahu. Zakázány jsou: zbraně, mobilní telefony, SIM karty, drogy, alkohol, léčiva, cennosti, hotovost, skleněné obaly, potraviny podléhající rychlé zkáze, mák setý, spreje a tetovací potřeby. Nepovolené věci se vrátí odesílateli na náklady vězně.',
    options: [
      'Ověření totožnosti odesílatele v registru obyvatel, vážení do limitu 10 kg, otevření balíku za přítomnosti státního zástupce; povoleny jsou veškeré trvanlivé i čerstvé potraviny, alkoholické nápoje do 10 % a volně prodejná léčiva.',
      'Ověření nároku/potvrzení, váhový limit do 5 kg, RTG kontrola, fyzická kontrola obsahu. Zakázány jsou: zbraně, mobilní telefony, SIM karty, drogy, alkohol, léčiva, cennosti, hotovost, skleněné obaly, potraviny podléhající rychlé zkáze, mák setý, spreje a tetovací potřeby. Nepovolené věci se vrátí odesílateli na náklady vězně.',
      'Vizuální kontrola neporušenosti obalu, zvážení do 3 kg a předání balíku přímo na celu bez otevření; pokud balík obsahuje nepovolené předměty, jsou tyto automaticky zlikvidovány ve spalovně bez záznamu a vyrozumění vězně.',
      'Rentgenová kontrola zásilky, chemická analýza na přítomnost výbušnin, váhový limit do 15 kg; zakázána je pouze střelná zbraň a střelivo, veškerá elektronika včetně chytrých telefonů a tabletů je po zapsání výrobního čísla vězni vydána.'
    ],
    correctOption: 1,
    rationale: 'Dle § 24 ZVTOS, § 16 ZVV a § 33 vyhl. č. 345/1999 Sb. / § 48 vyhl. č. 109/1994 Sb. podléhají balíčky přísné kontrole za účelem zamezení průniku nepovolených látek a předmětů ohrožujících bezpečnost.',
    source: '§ 33 vyhl. č. 345/1999 Sb. a Studijní text str. 68–69'
  },
  {
    id: 'pen-15',
    subject: 'Penologie',
    topic: 'Způsoby (systémy) ubytování vězňů',
    question: 'Jaké rozlišujeme způsoby (systémy) ubytování vězňů, vysvětlete rozdíly mezi nimi!',
    answer: 'Celový systém (uzavřené cely s přísnějším režimem) a Ložnicový systém (ubytovny s volnějším pohybem v oddíle). Norma: min. 6 m² pro 1 vězně a min. 4 m² pro každého dalšího (jednolůžková cela min. 6 m²), min. 7 m³ vzduchu na osobu (výjimečně min. 3 m² při překročení kapacity v obvodu vrchního soudu).',
    options: [
      'Diferencovaný systém a Integrovaný systém ubytování. Norma: min. 10 m² pro 1 vězně a min. 8 m² pro každého dalšího, min. 15 m³ vzduchu na osobu, přičemž na jednolůžkovou celu je striktně stanovena plocha min. 12 m² bez výjimky.',
      'Celový systém (uzavřené cely s přísnějším režimem) a Ložnicový systém (ubytovny s volnějším pohybem v oddíle). Norma: min. 6 m² pro 1 vězně a min. 4 m² pro každého dalšího (jednolůžková cela min. 6 m²), min. 7 m³ vzduchu na osobu (výjimečně min. 3 m² při překročení kapacity v obvodu vrchního soudu).',
      'Skupinový systém a Individuální bezpečnostní systém. Norma: jednotně 3 m² ubytovací plochy na osobu a 5 m³ vzduchu bez ohledu na počet ubytovaných osob a typ věznice, s povinností nepřetržitého uzamčení všech ložnic i přes den.',
      'Pavilonový systém a Koridorový systém ubytování. Norma: min. 8 m² na každého vězně bez rozdílu počtu lůžek, min. 12 m³ vzduchu na osobu, přičemž překročení ubytovací kapacity věznice může povolit výhradně dozorový státní zástupce.'
    ],
    correctOption: 1,
    rationale: 'Dle § 17 vyhlášky č. 345/1999 Sb. a § 15 vyhlášky č. 109/1994 Sb. je stanovena standardní plocha 6 m² pro prvního a 4 m² pro každého dalšího ubytovaného a minimálně 7 m³ objemu vzduchu.',
    source: '§ 17 vyhl. 345/1999 Sb., § 15 vyhl. 109/1994 Sb. a Studijní text str. 11, 58–59'
  },
  {
    id: 'pen-16',
    subject: 'Penologie',
    topic: 'Rizikové vytypované osoby dle NGŘ č. 24/2022',
    question: 'Vyjmenujte rizikové skupiny osob podle NGŘ č. 24/2022 včetně stanovených úředních zkratek!',
    answer: 'STH (Snížená tělesná hmotnost – lékař), NMU (Nízká mentální úroveň – VOVT na návrh psychologa), MON (Možný objekt násilí – VOVT), MPN (Možný pachatel násilí – VOVT), DVO (Další vytypovaná osoba – ředitel věznice), DVO-P (Vytypovaná osoba s výkonem profese – ředitel věznice).',
    options: [
      'STH (Stav trvalé hostility – psycholog), NMU (Neschopný manuálního umístění – lékař), MON (Mimořádně odsouzený narkoman – VOVT), MPN (Možný podněcovatel nepokojů – ředitel věznice), DVO (Dozorovaný vězeň ostrahy), DVO-P (Dozorovaný vězeň s postižením).',
      'STH (Snížená tělesná hmotnost – lékař), NMU (Nízká mentální úroveň – VOVT na návrh psychologa), MON (Možný objekt násilí – VOVT), MPN (Možný pachatel násilí – VOVT), DVO (Další vytypovaná osoba – ředitel věznice), DVO-P (Vytypovaná osoba s výkonem profese – ředitel věznice).',
      'STH (Střední tělesný handicap – vrchní dozorce), NMU (Nezletilý mladistvý ubytovaný – vychovatel), MON (Možný organizátor narkotik – VOVT), MPN (Možný pachatel napadení – ZVOVT), DVO (Dočasně vyčleněná osoba), DVO-P (Dočasně vyčleněná osoba v podmínce).',
      'STH (Snížená tolerance hospitalizace – lékař), NMU (Negativně motivovaný ubytovaný – speciální pedagog), MON (Mladistvý odsouzený nováček – psycholog), MPN (Manipulativní pachatel nátlaku – VOVT), DVO (Dlouhodobě vězněná osoba), DVO-P (Dlouhodobě pracující osoba).'
    ],
    correctOption: 1,
    rationale: 'NGŘ č. 24/2022 v § 3–9 definuje 6 kategorií vytypovaných osob pro prevenci násilí a viktimizace. U STH, NMU, MON, DVO a DVO-P se provádí zraková prohlídka těla na stopy násilí 1x týdně.',
    source: 'NGŘ č. 24/2022 § 3–9 a Studijní text str. 87–88'
  },
  {
    id: 'pen-17',
    subject: 'Penologie',
    topic: 'Povinnosti dozorce v uzavřeném oddílu',
    question: 'Jaké jsou základní povinnosti dozorce v uzavřeném oddělení?',
    answer: 'Převzít klíče a cely PPZZ, prověřit signalizaci, umísťovat odsouzené na základě vykonatelného rozhodnutí o KT a potvrzení lékaře, provést osobní prohlídku, převléknout do eráru, odebrat zakázané věci se soupisem, poučit o právech/povinnostech a provádět nepravidelné kontroly cel.',
    options: [
      'Převzít odsouzené na základě ústního pokynu vychovatele bez lékařského posouzení, ponechat jim veškeré osobní věci a civilní oděv, umožnit volný pohyb po chodbě oddílu a provádět kontroly cel v pevných hodinových intervalech.',
      'Převzít klíče a cely PPZZ, prověřit signalizaci, umísťovat odsouzené na základě vykonatelného rozhodnutí o KT a potvrzení lékaře, provést osobní prohlídku, převléknout do eráru, odebrat zakázané věci se soupisem, poučit o právech/povinnostech a provádět nepravidelné kontroly cel.',
      'Zpracovávat návrhy na zmírnění uloženého kázeňského trestu, vydávat odsouzeným radiopřijímače a tiskoviny, organizovat sportovní hry v prostoru uzavřeného oddílu a zamykat cely pouze na noční dobu od 22:00 do 06:00 hodin.',
      'Vydávat stravu a léky bez asistence zdravotnického personálu, provádět zrakové prohlídky těla pouze při propuštění z oddílu, povolovat telefonní hovory s příbuznými 2× denně a vést osobní spis odsouzeného.'
    ],
    correctOption: 1,
    rationale: 'Dle § 3.12 a § 70 NGŘ č. 2/2022 vyžaduje výkon služby v uzavřeném oddílu zvýšenou bezpečnostní ostražitost, striktní evidenci věcí, lékařské posouzení způsobilosti a nepřipuštění nedovolených kontaktů.',
    source: 'NGŘ č. 2/2022 § 3.12, § 70 a Studijní text str. 35, 54'
  },
  {
    id: 'pen-18',
    subject: 'Penologie',
    topic: 'Kázeňské tresty a rozsah v uzavřeném oddílu',
    question: 'Které kázeňské tresty a v jakém rozsahu se vykonávají v uzavřeném oddělení?',
    answer: 'VTOS dospělí: UOMPZ až na 28 dnů, CUO až na 20 dnů, samovazba až na 20 dnů. VTOS mladiství a TPN: UOMPZ až 14 dnů, CUO až 10 dnů, samovazba až 10 dnů. Výkon vazby: samovazba až na 10 dnů (mladiství ve VV max. 5 dnů).',
    options: [
      'VTOS dospělí: UOMPZ až na 45 dnů, CUO až na 30 dnů, samovazba až na 30 dnů. VTOS mladiství: UOMPZ až 28 dnů, CUO až 20 dnů, samovazba až 15 dnů. Výkon vazby: samovazba až na 20 dnů (mladiství ve VV max. 10 dnů).',
      'VTOS dospělí: UOMPZ až na 28 dnů, CUO až na 20 dnů, samovazba až na 20 dnů. VTOS mladiství a TPN: UOMPZ až 14 dnů, CUO až 10 dnů, samovazba až 10 dnů. Výkon vazby: samovazba až na 10 dnů (mladiství ve VV max. 5 dnů).',
      'VTOS dospělí: UOMPZ až na 14 dnů, CUO až na 10 dnů, samovazba až na 10 dnů. VTOS mladiství: UOMPZ až 7 dnů, CUO až 5 dnů, samovazba až 3 dny. Výkon vazby: samovazba až na 5 dnů (mladiství ve VV max. 2 dny).',
      'VTOS dospělí: UOMPZ až na 20 dnů, CUO až na 28 dnů, samovazba až na 28 dnů. VTOS mladiství: UOMPZ až 10 dnů, CUO až 14 dnů, samovazba se u mladistvých nesmí uložit vůbec. Výkon vazby: samovazba až na 14 dnů.'
    ],
    correctOption: 1,
    rationale: 'Dle § 46 ZVTOS, § 64 ZVTOS pro mladistvé, § 22 a § 26 ZVV jsou délky trestů v uzavřeném oddílu a samovazbě přesně zákonně limitovány.',
    source: '§ 46, 64 ZVTOS, § 22, 26 ZVV a Studijní text str. 49, 50, 52'
  },
  {
    id: 'pen-19',
    subject: 'Penologie',
    topic: 'Režimová omezení v uzavřeném oddílu',
    question: 'Uveďte nejdůležitější režimová omezení v uzavřeném oddělení!',
    answer: 'Zákaz kouření, zákaz nákupu potravin (mimo hygieny), zákaz knih/tisku (kromě právnické, vzdělávací a náboženské literatury), zákaz radiopřijímače/TV, zákaz odpočinku na lůžku mimo vymezený čas; u samovazby zákaz návštěv (mimo advokáta) a balíčků.',
    options: [
      'Zákaz sprchování a osobní hygieny, zákaz podávání teplé stravy, zákaz korespondence s obhájcem a státními orgány, zákaz denních vycházek a povinné celodenní stání v pozoru u mříže cely.',
      'Zákaz kouření, zákaz nákupu potravin (mimo hygieny), zákaz knih/tisku (kromě právnické, vzdělávací a náboženské literatury), zákaz radiopřijímače/TV, zákaz odpočinku na lůžku mimo vymezený čas; u samovazby zákaz návštěv (mimo advokáta) a balíčků.',
      'Povolení neomezeného nákupu potravin i tabákových výrobků, možnost sledování společné televize do 23:00 hodin, zachování nároku na standardní balíčky a účast na všech skupinových sportovních aktivitách.',
      'Zákaz užívání předepsaných léků, zákaz kontaktu se zdravotnickým personálem, omezení pitné vody na 1 litr denně a povinné vykonávání nočních úklidových prací po dobu trvání trestu.'
    ],
    correctOption: 1,
    rationale: 'Dle § 49 odst. 3 ZVTOS a § 64, 65 vyhlášky č. 345/1999 Sb. jsou odsouzeným v samovazbě a CUO citelně omezena běžná práva a volnočasové aktivity za účelem naplnění sankčního účelu kázeňského trestu.',
    source: '§ 49 ZVTOS, § 64–65 vyhl. 345/1999 Sb. a Studijní text str. 55–56'
  },
  {
    id: 'pen-20',
    subject: 'Penologie',
    topic: 'Druhy pracovišť odsouzených',
    question: 'Jaké rozlišujeme druhy pracovišť odsouzených z hlediska jejich zabezpečení (střežení)?',
    answer: '1. Střežené pracoviště uvnitř věznice (SPUV), 2. Nestřežené pracoviště mimo věznici (NPMV – max. 40 vězňů na zaměstnance), 3. Pracoviště s volným pohybem mimo věznici (VPMV), 4. Pracoviště s volným pohybem v prostoru věznice.',
    options: [
      '1. Primární průmyslové pracoviště s ozbrojeným dohledem, 2. Sekundární zemědělské pracoviště s volným režimem (max. 100 vězňů), 3. Terciární pracoviště služeb bez ostrahy, 4. Chráněná dílna pro mladistvé odsouzené.',
      '1. Střežené pracoviště uvnitř věznice (SPUV), 2. Nestřežené pracoviště mimo věznici (NPMV – max. 40 vězňů na zaměstnance), 3. Pracoviště s volným pohybem mimo věznici (VPMV), 4. Pracoviště s volným pohybem v prostoru věznice.',
      '1. Vnitřní výrobní pracoviště se stálou stráží na věži, 2. Vnější uzavřené pracoviště s technickým zabezpečením (max. 15 vězňů), 3. Brigádní pracoviště veřejně prospěšných prací, 4. Noční úklidové pracoviště v ubytovnách.',
      '1. Střežené pracoviště v režimu zvýšené ostrahy (SPZO), 2. Dozorované pracoviště s elektronickým monitoringem (DPEM – max. 60 vězňů), 3. Polozavřené dílenské pracoviště, 4. Individuální pracoviště v cele odsouzeného.'
    ],
    correctOption: 1,
    rationale: 'Dle § 30 ZVTOS a § 51–55 vyhlášky č. 345/1999 Sb. a NGŘ č. 45/2015 se pracoviště dělí podle rizikovosti a režimu střežení na SPUV, NPMV, VPMV a volný pohyb v objektu.',
    source: '§ 51–55 vyhl. 345/1999 Sb. a Studijní text str. 79–80'
  },
  {
    id: 'pen-21',
    subject: 'Penologie',
    topic: 'Povinnosti dozorce na nestřeženém pracovišti',
    question: 'Uveďte základní povinnosti dozorce na vnějším nestřeženém pracovišti!',
    answer: 'Převzít jmenovitě a početně odsouzené dle propustky, provést osobní prohlídku a prohlídku vozidla před odjezdem, vymezit prostor pohybu a zakázat nepovolené kontakty s civilisty, provádět nepravidelné početní prověrky a kontroly v předepsaných intervalech a hlásit na OS závažné události.',
    options: [
      'Dohlížet pouze na plnění výrobních norem a evidovat odpracované hodiny, umožnit odsouzeným volný nákup v přilehlých obchodech a provést kontrolu stavu pouze při návratu do věznice.',
      'Převzít jmenovitě a početně odsouzené dle propustky, provést osobní prohlídku a prohlídku vozidla před odjezdem, vymezit prostor pohybu a zakázat nepovolené kontakty s civilisty, provádět nepravidelné početní prověrky a kontroly v předepsaných intervalech a hlásit na OS závažné události.',
      'Vykonávat manuální práci spolu s odsouzenými u výrobní linky, pověřit vybraného spolehlivého odsouzeného vedením početní evidence a hlásit situaci na operační středisko 1× týdně písemným záznamem.',
      'Střežit vnější perimetr pracoviště se střelnou zbraní v pohotovostní poloze, zamezit jakémukoliv přístupu civilních mistrů k odsouzeným a provádět kompletní osobní prohlídku každých 30 minut.'
    ],
    correctOption: 1,
    rationale: 'Dle § 3.10 a § 67 NGŘ č. 2/2022 dozorce na NPMV odpovídá za to, aby odsouzení neopustili pracoviště, nenavazovali nedovolené kontakty a dodržovali stanovený režim a bezpečnost práce.',
    source: '§ 67 NGŘ č. 2/2022 a Studijní text str. 34, 52'
  },
  {
    id: 'pen-22',
    subject: 'Penologie',
    topic: 'Důvody propuštění z VTOS',
    question: 'Jaké jsou zákonné důvody propuštění odsouzeného z VTOS?',
    answer: 'a) Uplynutí doby trestu stanovené v rozsudku, b) písemný příkaz soudu (např. rozhodnutí o podmíněném propuštění dle § 88 TZ), c) příkaz státního zástupce při výkonu dozoru, d) rozhodnutí prezidenta republiky o milosti nebo ministra spravedlnosti.',
    options: [
      'a) Dosažení věku 65 let odsouzeného, b) složení kauce rodinnými příslušníky ve výši stanovené ředitelem věznice, c) splnění všech cílů programu zacházení, d) písemná žádost zaměstnavatele o návrat pracovníka.',
      'a) Uplynutí doby trestu stanovené v rozsudku, b) písemný příkaz soudu (např. rozhodnutí o podmíněném propuštění dle § 88 TZ), c) příkaz státního zástupce při výkonu dozoru, d) rozhodnutí prezidenta republiky o milosti nebo ministra spravedlnosti.',
      'a) Rozhodnutí ředitele věznice na návrh komise pro zacházení, b) zaplacení peněžitého trestu nebo náhrady škody poškozenému, c) udělení kázeňské odměny za mimořádný pracovní výkon, d) písemný souhlas primátora města.',
      'a) Uplynutí 1/3 trestu při bezproblémovém chování, b) rozhodnutí probačního úředníka PMS ČR, c) nařízení vedoucího oddělení výkonu trestu z kapacitních důvodů, d) souhlasné stanovisko psychologa věznice.'
    ],
    correctOption: 1,
    rationale: 'Ustanovení § 73a zákona č. 169/1999 Sb. taxativně vymezuje právní důvody, na jejichž základě je věznice povinna odsouzeného neprodleně propustit na svobodu.',
    source: '§ 73a zákona č. 169/1999 Sb. a Studijní text str. 89'
  },
  {
    id: 'pen-23',
    subject: 'Penologie',
    topic: 'Pravomoci dozorového státního zástupce',
    question: 'Uveďte nejdůležitější pravomoci dozorového státního zástupce při kontrole podmínek ve VV a VTOS!',
    answer: 'Navštěvovat věznici v kteroukoliv dobu, nahlížet do všech spisů a dokladů, hovořit s vězněnými osobami o samotě bez přítomnosti personálu, prověřovat zákonnost rozhodnutí VS, vydávat závazné příkazy k nápravě a nařídit okamžité propuštění nezákonně držené osoby.',
    options: [
      'Udělovat odsouzeným kázeňské odměny a tresty, schvalovat měsíční jídelníček věznice, stanovovat rozvrh směn příslušníků VS ČR a provádět výhradně plánované prověrky po předchozím ohlášení 14 dnů předem.',
      'Navštěvovat věznici v kteroukoliv dobu, nahlížet do všech spisů a dokladů, hovořit s vězněnými osobami o samotě bez přítomnosti personálu, prověřovat zákonnost rozhodnutí VS, vydávat závazné příkazy k nápravě a nařídit okamžité propuštění nezákonně držené osoby.',
      'Rozhodovat o podmíněném propuštění na svobodu na místě bez účasti soudu, měnit zařazení věznic do typů ostrahy, řídit zásahovou jednotku VS ČR při mimořádných událostech a provádět tělesné prohlídky vězňů.',
      'Vstupovat do věznice pouze v pracovní dny v doprovodu ředitele věznice, hovořit s vězni výhradně za přítomnosti vychovatele a podávat pouze nezávazná doporučení generálnímu ředitelství VS ČR.'
    ],
    correctOption: 1,
    rationale: 'Dle § 78 ZVTOS, § 29 ZVV a § 40 ZVD vykonává krajské státní zastupitelství nezávislý dozor nad dodržováním právních předpisů ve vězeňských zařízeních a jeho příkazy je VS ČR povinna bez odkladu splnit.',
    source: '§ 78 ZVTOS, § 29 ZVV, § 40 ZVD a Studijní text str. 92'
  },
  {
    id: 'pen-24',
    subject: 'Penologie',
    topic: 'Návštěvy blízkých osob – pravidla',
    question: 'Uveďte základní způsoby realizace návštěv blízkých osob u odsouzených!',
    answer: 'Právo na návštěvu v trvání 3 hodin za kalendářní měsíc pro nejvýše 4 osoby včetně dětí (děti <15 let pouze v doprovodu dospělého >18 let). Jako odměnu lze dobu zvýšit až na 5 hodin (u mladistvých až 8 hodin). Návštěvy probíhají zpravidla ve dnech pracovního klidu.',
    options: [
      'Právo na návštěvu v trvání 90 minut jednou za 2 týdny pro nejvýše 2 zletilé osoby bez možnosti účasti dětí; jako odměnu lze dobu prodloužit na 3 hodiny jednou měsíčně výhradně v pracovní dny.',
      'Právo na návštěvu v trvání 3 hodin za kalendářní měsíc pro nejvýše 4 osoby včetně dětí (děti <15 let pouze v doprovodu dospělého >18 let). Jako odměnu lze dobu zvýšit až na 5 hodin (u mladistvých až 8 hodin). Návštěvy probíhají zpravidla ve dnech pracovního klidu.',
      'Právo na návštěvu v trvání 1 hodiny týdně pro neomezený počet příbuzných v přímé linii; jako odměnu lze povolit návštěvu v domácím prostředí na dobu až 48 hodin bez souhlasu ředitele.',
      'Právo na návštěvu v trvání 5 hodin měsíčně pro max. 6 osob současně; návštěvy probíhají výhradně formou videokonference přes schválený zabezpečený terminál s dohledem psychologa.'
    ],
    correctOption: 1,
    rationale: 'Dle § 19 zákona č. 169/1999 Sb. a § 26 vyhlášky č. 345/1999 Sb. je návštěva v rozsahu 3 hodin měsíčně pro max. 4 osoby základním zákonným právem odsouzeného.',
    source: '§ 19 zákona č. 169/1999 Sb., § 26 vyhl. 345/1999 Sb. a Studijní text str. 63'
  },
  {
    id: 'pen-25',
    subject: 'Penologie',
    topic: 'Potraviny podléhající rychlé zkáze v balíčku',
    question: 'Uveďte několik příkladů tzv. nedovolených předmětů, které nebudou odsouzeným vydány z doručeného balíku, vysvětlete pojem potravina podléhající rychlé zkáze a doplňte ho příkladem.',
    answer: 'Nedovolené předměty: zbraně, SIM karty, mobily, drogy, alkohol, léky, peníze, sklo, spreje. Potravina podléhající rychlé zkáze: potravina vyžadující stálé chlazení či tepelné zpracování, u níž hrozí rychlé mikrobiální zkažení (příklad: měkké salámy, tlačenky, majonézové saláty, čerstvé maso, zákusky).',
    options: [
      'Nedovolené předměty: knihy s pevnou vazbou, dopisní papíry, poštovní známky, mýdlo v tuhém stavu. Potravina podléhající rychlé zkáze: veškeré balené sterilované konzervy, instantní polévky a balený černý čaj po otevření.',
      'Nedovolené předměty: zbraně, SIM karty, mobily, drogy, alkohol, léky, peníze, sklo, spreje. Potravina podléhající rychlé zkáze: potravina vyžadující stálé chlazení či tepelné zpracování, u níž hrozí rychlé mikrobiální zkažení (příklad: měkké salámy, tlačenky, majonézové saláty, čerstvé maso, zákusky).',
      'Nedovolené předměty: pouze střelné zbraně a trhaviny. Potravina podléhající rychlé zkáze: jakákoliv potravina s dobou minimální trvanlivosti kratší než 2 roky (příklad: tvrdé sýry, balené těstoviny a rýže).',
      'Nedovolené předměty: civilní spodní prádlo, fotografie rodinných příslušníků, plastové příbory. Potravina podléhající rychlé zkáze: balené suchary, čokoláda s obsahem kakaa pod 50 % a minerální vody v PET lahvích.'
    ],
    correctOption: 1,
    rationale: 'Dle § 33 vyhlášky č. 345/1999 Sb. je zakázáno v balíčcích zasílat potraviny podléhající rychlé zkáze z hygienických a zdravotních důvodů (riziko těžkých alimentárních infekcí a otrav na celách bez lednice).',
    source: '§ 33 odst. 1 vyhlášky č. 345/1999 Sb. a Studijní text str. 44, 68'
  },
  {
    id: 'pen-26',
    subject: 'Penologie',
    topic: 'Zajištění zdravotní péče ve VS ČR',
    question: 'Jakými způsoby VS ČR zajišťuje zdravotní péči o vězněné osoby?',
    answer: '1. Vlastní zdravotnická střediska ve věznicích (praktický lékař, stomatolog, sestry), 2. Vězeňské nemocnice (Praha-Pankrác a Brno), 3. Mimovězeňští poskytovatelé zdravotních služeb (odborné ambulance a civilní nemocnice pod ostrahou VS), 4. Zdravotnická záchranná služba (RZS). Od roku 2024 spravuje zdravotnictví MS ČR.',
    options: [
      '1. Lékárničky první pomoci umístěné na každé ložnici ubytovny, 2. Služba Červeného kříže docházející 1× měsíčně, 3. Samoléčba volně prodejnými léky z vězeňské prodejny, 4. Telemedicína přes videohovory s lékaři ze soukromých klinik.',
      '1. Vlastní zdravotnická střediska ve věznicích (praktický lékař, stomatolog, sestry), 2. Vězeňské nemocnice (Praha-Pankrác a Brno), 3. Mimovězeňští poskytovatelé zdravotních služeb (odborné ambulance a civilní nemocnice pod ostrahou VS), 4. Zdravotnická záchranná služba (RZS). Od roku 2024 spravuje zdravotnictví MS ČR.',
      '1. Výhradně polní nemocnice Armády ČR, 2. Zdravotnická zařízení Ministerstva vnitra ČR, 3. Krajské hygienické stanice, 4. Poskytovatelé lázeňské a rehabilitační péče schválení ředitelem věznice.',
      '1. Zdravotní střediska v gesci Ministerstva práce a sociálních věcí, 2. Vězeňská nemocnice v Plzni a v Ostravě, 3. Ošetřovny charitativních organizací, 4. Lékařská péče poskytovaná pouze po ukončení výkonu trestu.'
    ],
    correctOption: 1,
    rationale: 'Dle § 16 ZVTOS, § 18 ZVV, § 19 ZVD a § 23/32 vyhlášek je zdravotní péče garantována státem a organizována ve 4 stupních od vězeňského střediska až po specializovanou péči v civilních nemocnicích.',
    source: '§ 16 ZVTOS, § 18 ZVV, § 23 vyhl. 345/1999 Sb. a Studijní text str. 60'
  },
  {
    id: 'pen-27',
    subject: 'Penologie',
    topic: 'Postup při zjištění stop násilí',
    question: 'Jaký bude postup zaměstnance VS ČR při zjištění stop násilí na těle odsouzeného (obviněného)?',
    answer: '1. Zamezit dalšímu násilí, 2. Poskytnout první pomoc a zajistit lékařské ošetření, 3. Ihned ohlásit nadřízenému (v mimopracovní době VISS), 4. Pořídit fotodokumentaci osobou stejného pohlaví, 5. Vyplnit Záznam o zjištění fyzického násilí, 6. Předvedení k lékaři a psychologovi, 7. Předat oddělení prevence a stížností.',
    options: [
      '1. Okamžitě oddělit účastníky a umístit je oba bezodkladně do samovazby na 20 dnů, 2. Vyčkat na vyjádření obou stran v kázeňském řízení, 3. Seznámit s incidentem zástupce samosprávy odsouzených, 4. Provést záznam do knihy předávání služby.',
      '1. Zamezit dalšímu násilí, 2. Poskytnout první pomoc a zajistit lékařské ošetření, 3. Ihned ohlásit nadřízenému (v mimopracovní době VISS), 4. Pořídit fotodokumentaci osobou stejného pohlaví, 5. Vyplnit Záznam o zjištění fyzického násilí, 6. Předvedení k lékaři a psychologovi, 7. Předat oddělení prevence a stížností.',
      '1. Vyzvat zraněného k podání písemné stížnosti řediteli věznice, 2. Vydat náplast z lékárničky stanoviště, 3. Vyfotografovat stopy násilí služebním mobilním telefonem bez ohledu na pohlaví, 4. Vyčkat do nástupu ranní směny vychovatele.',
      '1. Předvést zraněného odsouzeného k výslechu na Policii ČR, 2. Provést kompletní technickou prohlídku všech ložnic na oddílu, 3. Zrušit všem odsouzeným na patře vycházky na dobu 14 dnů, 4. Zaslat hlášení dozorovému státnímu zástupci do 30 dnů.'
    ],
    correctOption: 1,
    rationale: 'Ustanovení § 20 NGŘ č. 24/2022 ukládá přesný algoritmický postup od poskytnutí první pomoci, přes fotodokumentaci těla, vyšetření lékařem/psychologem až po postoupení orgánům činným v trestním řízení / GIBS.',
    source: '§ 20 NGŘ č. 24/2022 a Studijní text str. 88'
  },
  {
    id: 'pen-28',
    subject: 'Penologie',
    topic: 'Instituce pro stížnosti vězněných osob',
    question: 'Uveďte 4 příklady institucí (osob), na něž se může obrátit se stížností vězněná osoba v případě, že se domnívá, že byla porušena její zákonem garantovaná práva, či poškozena lidská důstojnost?',
    answer: '1. Dozorový státní zástupce krajského státního zastupitelství, 2. Veřejný ochránce práv (Ombudsman), 3. Evropský soud pro lidská práva (ESLP Štrasburk), 4. Výbor OSN proti mučení / Evropský výbor pro zabránění mučení (CPT).',
    options: [
      '1. Kancelář prezidenta republiky, 2. Policejní prezidium ČR, 3. Česká advokátní komora, 4. Předseda Úřadu pro ochranu hospodářské soutěže.',
      '1. Dozorový státní zástupce krajského státního zastupitelství, 2. Veřejný ochránce práv (Ombudsman), 3. Evropský soud pro lidská práva (ESLP Štrasburk), 4. Výbor OSN proti mučení / Evropský výbor pro zabránění mučení (CPT).',
      '1. Místně příslušný živnostenský úřad, 2. Česká obchodní inspekce, 3. Úřad práce ČR, 4. Finanční arbitr České republiky.',
      '1. Ředitel Probační a mediační služby ČR, 2. Ústavní ústav Akademie věd ČR, 3. Generální inspekce bezpečnostních sborů (GIBS) pro veškeré civilní spory, 4. Rada pro rozhlasové a televizní vysílání.'
    ],
    correctOption: 1,
    rationale: 'Dle § 26 ZVTOS, § 13 ZVV a § 34 vyhlášky č. 345/1999 Sb. podávají vězněné osoby stížnosti v zalepených obálkách do uzamykatelných schránek vybíraných denně určeným pracovníkem.',
    source: '§ 26 ZVTOS, § 34 vyhl. 345/1999 Sb. a Studijní text str. 70'
  },
  {
    id: 'pen-29',
    subject: 'Penologie',
    topic: 'Mezinárodní dokumenty a instituce v penologii',
    question: 'Uveďte název klíčového mezinárodního dokumentu, který stanovuje podmínky výkonu vězeňství v ČR, současně uveďte i název mezinárodní instituce provádějící monitoring vězeňství a dodržování lidských práv v jednotlivých evropských zemích.',
    answer: 'Dokument: Evropská vězeňská pravidla (Standardní minimální pravidla pro zacházení s vězni); Mezinárodní instituce: Evropský výbor pro zabránění mučení a nelidskému či ponižujícímu zacházení nebo trestání (CPT).',
    options: [
      'Dokument: Mezinárodní pakt o občanských právech INTERPOLu; Mezinárodní instituce: Stálý rozhodčí soud v Haagu (PCA).',
      'Dokument: Evropská vězeňská pravidla (Standardní minimální pravidla pro zacházení s vězni); Mezinárodní instituce: Evropský výbor pro zabránění mučení a nelidskému či ponižujícímu zacházení nebo trestání (CPT).',
      'Dokument: Ženevská úmluva o ochraně civilních osob v době ozbrojeného konfliktu; Mezinárodní instituce: Agentura Evropské unie pro justiční spolupráci (EUROJUST).',
      'Dokument: Všeobecná deklarace Schengenského prostoru; Mezinárodní instituce: Evropská agentura pro pohraniční a pobřežní stráž (FRONTEX).'
    ],
    correctOption: 1,
    rationale: 'Evropská vězeňská pravidla (Rada Evropy) stanovují etický a právní rámec moderního vězeňství. Výbor CPT má právo neomezených inspekcí ve všech místech detence v členských státech.',
    source: 'Evropská vězeňská pravidla, Mandát CPT a Studijní text str. 56, 92'
  },
  {
    id: 'pen-30',
    subject: 'Penologie',
    topic: 'Pravidla pro korespondenci vězňů',
    question: 'Jaká pravidla, či omezení platí při nakládání s korespondencí vězněných osob?',
    answer: 'Korespondence je přijímána a odesílána bez početního omezení na náklady vězně. Zaměstnanci VS ji mohou kontrolovat a číst (zamezení drogám, zbraním a maření účelu). KONTROLA JE VYLOUČENA u korespondence s obhájcem, advokátem, soudy, SZ, ombudsmanem a mezinárodními orgány lidských práv.',
    options: [
      'Korespondence je omezena na 2 dopisy měsíčně o maximálním rozsahu 1 strany A4 na náklady věznice; veškerá došlá i odesílaná korespondence včetně dopisů obhájci podléhá povinné kontrole a předčítání vychovatelem.',
      'Korespondence je přijímána a odesílána bez početního omezení na náklady vězně. Zaměstnanci VS ji mohou kontrolovat a číst (zamezení drogám, zbraním a maření účelu). KONTROLA JE VYLOUČENA u korespondence s obhájcem, advokátem, soudy, SZ, ombudsmanem a mezinárodními orgány lidských práv.',
      'Korespondence mezi vězni z různých věznic je bez omezení povolena; zaměstnanci VS nesmí otevírat žádné dopisy bez předchozího písemného souhlasu předsedy senátu okresního soudu.',
      'Korespondence je povolena pouze v elektronické podobě prostřednictvím zabezpečeného e-mailového účtu věznice; kontrolu provádí automatizovaný software s vyloučením lidského faktoru.'
    ],
    correctOption: 1,
    rationale: 'Dle § 17 ZVTOS a § 13 ZVV je korespondence se zákonem chráněnými subjekty (advokát, soud, ombudsman, CPT) nedotknutelná a nesmí být personálem otevírána ani cenzurována.',
    source: '§ 17 ZVTOS, § 13 ZVV a Studijní text str. 61–62, 73'
  },
  {
    id: 'pen-31',
    subject: 'Penologie',
    topic: 'Omezená ústavní práva ve VTOS',
    question: 'Která ústavní práva a svobody jsou omezeny ve VTOS?',
    answer: 'Svoboda pohybu a pobytu, nedotknutelnost osoby a soukromí, listovní tajemství a tajemství zpráv (kontrola dopisů/telefonů), svobodná volba lékaře, právo na stávku, právo zakládat politické strany a sdružovat se v nich, právo podnikat a vykonávat volené veřejné funkce.',
    options: [
      'Právo na život a osobní integritu, zákaz mučení a nelidského zacházení, právo na právní pomoc obhájce, svoboda myšlení, svědomí a náboženského vyznání a právo podat ústavní stížnost.',
      'Svoboda pohybu a pobytu, nedotknutelnost osoby a soukromí, listovní tajemství a tajemství zpráv (kontrola dopisů/telefonů), svobodná volba lékaře, právo na stávku, právo zakládat politické strany a sdružovat se v nich, právo podnikat a vykonávat volené veřejné funkce.',
      'Pouze právo volit ve volbách do zákonodárných sborů a orgánů územní samosprávy a právo na bezplatnou základní zdravotní péči, ostatní práva zůstávají zcela nedotčena.',
      'Právo na rodinný život a styk s dětmi, právo vlastnit majetek nabytý před nástupem do výkonu trestu, presumpce neviny v nových trestních řízeních a právo na spravedlivý proces.'
    ],
    correctOption: 1,
    rationale: 'Zákon č. 169/1999 Sb. v § 27 v souladu s Listinou (čl. 13, 14, 27) přesně vymezuje okruh práv, která odsouzeným po dobu výkonu trestu nepřísluší z důvodu ochrany společnosti a účelu trestu.',
    source: '§ 27 zákona č. 169/1999 Sb. a Studijní text str. 71–72'
  },
  {
    id: 'pen-32',
    subject: 'Penologie',
    topic: 'Návštěvy obviněných ve vazbě',
    question: 'Kolik osob se může zúčastnit návštěvy obviněného, jak často se návštěvy realizují?',
    answer: 'Nejvýše 4 osoby současně včetně nezletilých dětí (děti <15 let v doprovodu dospělého >18 let), v trvání 90 minut jednou za 2 týdny.',
    options: [
      'Nejvýše 2 zletilé osoby současně bez možnosti přítomnosti dětí do 18 let, v trvání 60 minut jednou za kalendářní měsíc.',
      'Nejvýše 4 osoby současně včetně nezletilých dětí (děti <15 let v doprovodu dospělého >18 let), v trvání 90 minut jednou za 2 týdny.',
      'Nejvýše 4 osoby včetně dětí, v trvání 3 hodin jednou za měsíc (s možností navýšení na 5 hodin jako kázeňská odměna).',
      'Neomezený počet osob z okruhu osob blízkých, v trvání 45 minut každý týden ve dnech pracovního klidu.'
    ],
    correctOption: 1,
    rationale: 'Dle § 14 odst. 1 zákona č. 293/1993 Sb. má obviněný právo na přijetí návštěvy nejvýše 4 osob jednou za 2 týdny v trvání 90 minut. Ředitel může povolit výjimku.',
    source: '§ 14 odst. 1 zákona č. 293/1993 Sb. a Studijní text str. 73'
  },
  {
    id: 'pen-33',
    subject: 'Penologie',
    topic: 'Dozorčí služba – OVV povinnosti',
    question: 'Uveďte povinnosti dozorce v oddělení VV!',
    answer: 'Prověřit spojení a signalizaci, převzít a zkontrolovat uzamčení cel, fyzicky převzít obviněné, provádět nepravidelné kontroly cel, mít přehled o vytypovaných a nebezpečných obviněných, kontrolovat dodržování vnitřního řádu a nepustit nedovolené kontakty mezi společníky.',
    options: [
      'Provádět výslechy obviněných k okolnostem trestné činnosti, sepisovat protokoly o výpovědi pro státního zástupce a vyhodnocovat důkazní situaci v probíhajícím vyšetřování.',
      'Prověřit spojení a signalizaci, převzít a zkontrolovat uzamčení cel, fyzicky převzít obviněné, provádět nepravidelné kontroly cel, mít přehled o vytypovaných a nebezpečných obviněných, kontrolovat dodržování vnitřního řádu a nepustit nedovolené kontakty mezi společníky.',
      'Zajišťovat komplexní psychologickou diagnostiku obviněných v systému SARPO, stanovovat individuální resocializační plány a schvalovat propuštění obviněných na kauci.',
      'Střežit obvodový plášť budovy vazební věznice ze strážní věže, obsluhovat vjezdová vrata pro eskortní vozidla a kontrolovat zavazadlový prostor zásobovacích automobilů.'
    ],
    correctOption: 1,
    rationale: 'Dle § 3.6 a § 31, 32 NGŘ č. 2/2022 dozorce na OVV odpovídá za izolaci obviněných, zamezení maření vyšetřování a bezpečný chod vazebního oddělení.',
    source: 'NGŘ č. 2/2022 § 3.6, § 31–32 a Studijní text str. 30'
  },
  {
    id: 'pen-34',
    subject: 'Penologie',
    topic: 'Propuštění z vazby – Důvody a orgány',
    question: 'Jaké jsou zákonné důvody pro propuštění z VV, kdo o něm rozhoduje?',
    answer: 'Písemný příkaz soudu na základě rozhodnutí o propuštění, příkaz státního zástupce v přípravném řízení, příkaz státního zástupce při výkonu dozoru (§ 29 ZVV), rozhodnutí prezidenta o milosti nebo ministra, či převod do VTOS na základě nařízení soudu.',
    options: [
      'Písemný souhlas vyšetřovatele Policie ČR po ukončení výslechu, rozhodnutí velitele eskorty při předvedení k soudu, nebo uplynutí pořádkové lhůty 48 hodin od zadržení podezřelého.',
      'Písemný příkaz soudu na základě rozhodnutí o propuštění, příkaz státního zástupce v přípravném řízení, příkaz státního zástupce při výkonu dozoru (§ 29 ZVV), rozhodnutí prezidenta o milosti nebo ministra, či převod do VTOS na základě nařízení soudu.',
      'Rozhodnutí ředitele vazební věznice po dohodě s obhájcem obviněného, složení finanční záruky přímo do pokladny věznice, nebo písemná žádost rodinných příslušníků obviněného.',
      'Písemný pokyn primátora statutárního města, rozhodnutí probačního úředníka PMS ČR po stanovení dohledu, nebo nařízení vedoucího oddělení výkonu vazby při nedostatku lůžek.'
    ],
    correctOption: 1,
    rationale: 'Dle § 10 zákona č. 293/1993 Sb. vazební věznice neprodleně propustí obviněného na svobodu po doručení originálu (či ověřeného faxu) písemného příkazu soudu, státního zástupce nebo v řízení o milosti.',
    source: '§ 10 zákona č. 293/1993 Sb., o výkonu vazby a Studijní text str. 9, 10'
  },
  {
    id: 'pen-35',
    subject: 'Penologie',
    topic: 'Program zacházení – Význam a struktura',
    question: 'Co je program zacházení, kdo ho zpracovává a v čem spočívá jeho význam?',
    answer: 'Základní forma cílevědomého a komplexního působení na odsouzeného k přípravě na soběstačný život bez kriminality. Zpracovává ho speciální pedagog ve spolupráci s psychology a vychovateli na základě komplexní zprávy (SARPO). Skládá se z 5 oblastí: pracovní, vzdělávací, spec. výchovná, zájmová a utváření vnějších vztahů.',
    options: [
      'Režimový plán střežení a eskortování nebezpečných odsouzených. Zpracovává ho vedoucí oddělení vězeňské stráže na základě bezpečnostní prověrky NBÚ. Skládá se ze 3 oblastí: fyzická ostraha, technické zabezpečení a režimová opatření.',
      'Základní forma cílevědomého a komplexního působení na odsouzeného k přípravě na soběstačný život bez kriminality. Zpracovává ho speciální pedagog ve spolupráci s psychology a vychovateli na základě komplexní zprávy (SARPO). Skládá se z 5 oblastí: pracovní, vzdělávací, spec. výchovná, zájmová a utváření vnějších vztahů.',
      'Léčebný rehabilitační plán drogově závislých osob. Zpracovává ho výhradně praktický lékař věznice ve spolupráci s psychiatrickou klinikou. Skládá se ze 4 fází: detoxifikace, stabilizace, farmakoterapie a lázeňská doléčovací péče.',
      'Harmonogram denního výkonu strážní a dozorčí služby ve věznici. Zpracovává ho vrchní inspektor provozní směny (VISS) pro každou směnu zvlášť. Skládá se ze stanovišť: brána, koridor, ubytovna, pracoviště a eskorty.'
    ],
    correctOption: 1,
    rationale: 'Dle § 40 a § 41 ZVTOS a § 36 vyhlášky č. 345/1999 Sb. je Program zacházení klíčovým individuálním resocializačním nástrojem (nezpracovává se pouze u trestů kratších než 3 měsíce).',
    source: '§ 40, 41 ZVTOS, § 36 vyhl. 345/1999 Sb. a Studijní text str. 17–19'
  },
  {
    id: 'pen-36',
    subject: 'Penologie',
    topic: 'Časový rozvrh dne (ČRD)',
    question: 'Uveďte několik příkladů činností stanovených v časovém rozvrhu dne, která vnitřní norma jej stanovuje?',
    answer: 'Činnosti: budíček, ranní toaleta a úklid, výdej stravy, odchod do zaměstnání, realizace PZ, hodinová vycházka, osobní volno, sčítací prověrka, večerka a 8hodinový nepřetržitý noční klid. Stanovuje jej Vnitřní řád věznice jako svou závaznou přílohu.',
    options: [
      'Činnosti: ranní nástup k apelaci, vojenský pořadový výcvik, výslechová činnost OČTŘ, nucené práce v lomu a večerní samovazba. Stanovuje jej Trestní řád jako součást rozsudku okresního soudu.',
      'Činnosti: budíček, ranní toaleta a úklid, výdej stravy, odchod do zaměstnání, realizace PZ, hodinová vycházka, osobní volno, sčítací prověrka, večerka a 8hodinový nepřetržitý noční klid. Stanovuje jej Vnitřní řád věznice jako svou závaznou přílohu.',
      'Činnosti: budíček v 04:00, nepřetržitá směna na pracovišti 12 hodin, večerní kontrola cel a 4hodinový noční klid. Stanovuje jej Kolektivní smlouva zaměstnanců Vězeňské služby ČR schválená odbory.',
      'Činnosti: individuální program dle volby vězně, neomezený výdej stravy z kantýny, volný pohyb po areálu věznice a dobrovolná účast na sčítání. Stanovuje jej Rozkaz vedoucího oddělení logistiky.'
    ],
    correctOption: 1,
    rationale: 'Dle § 14 ZVTOS a § 3 vyhlášky č. 109/1994 Sb. / § 22 vyhl. 345/1999 Sb. je ČRD povinnou přílohou vnitřního řádu každé věznice, schvalovanou ředitelem se souhlasem GŘ VS ČR.',
    source: '§ 14 ZVTOS, § 3 vyhl. 109/1994 Sb. a Studijní text str. 19, 41'
  },
  {
    id: 'pen-37',
    subject: 'Penologie',
    topic: 'Balíček a návštěvy u obviněného',
    question: 'Jak často má obviněný nárok na balíček a kolik osob se může zúčastnit návštěvy?',
    answer: 'Balíček s potravinami a osobními věcmi do hmotnosti 5 kg: 1× za 3 měsíce (balíčky s prádlem k výměně, hygienou a tiskovinami bez omezení). Návštěvy: nejvýše 4 osoby včetně dětí jednou za 2 týdny na 90 minut.',
    options: [
      'Balíček s potravinami do 10 kg: 1× za kalendářní měsíc (včetně možnosti zasílání tabáku a alkoholu). Návštěvy: nejvýše 2 zletilé osoby jednou za měsíc na 60 minut.',
      'Balíček s potravinami a osobními věcmi do hmotnosti 5 kg: 1× za 3 měsíce (balíčky s prádlem k výměně, hygienou a tiskovinami bez omezení). Návštěvy: nejvýše 4 osoby včetně dětí jednou za 2 týdny na 90 minut.',
      'Balíček s potravinami do 5 kg: 1× za 6 měsíců (stejně jako odsouzený ve VTOS). Návštěvy: nejvýše 4 osoby jednou měsíčně na 3 hodiny ve dnech pracovního klidu.',
      'Balíček s potravinami do 3 kg: 1× za rok se souhlasem soudce. Návštěvy: neomezený počet osob jednou týdně na 45 minut za přítomnosti vyšetřovatele PČR.'
    ],
    correctOption: 1,
    rationale: 'Dle § 16 odst. 2 a § 14 odst. 1 zákona č. 293/1993 Sb. o výkonu vazby má obviněný nárok na potravinový balíček 1x za 3 měsíce do 5 kg a návštěvu 4 osob na 90 minut jednou za 14 dní.',
    source: '§ 14 a § 16 zákona č. 293/1993 Sb. a Studijní text str. 73–74'
  },
  {
    id: 'pen-38',
    subject: 'Penologie',
    topic: 'Koluzní vazba a realizace návštěv',
    question: 'Za jakých okolností může být provedena návštěva u obviněného, který je ve VV z koluzních důvodů (§ 67 písm. b TrŘ)?',
    answer: 'Návštěva je možná pouze s předchozím písemným souhlasem příslušného orgánu činného v trestním řízení (v přípravném řízení státní zástupce, v řízení před soudem soudce) a za přítomnosti zástupce OČTŘ (či s jeho výslovným souhlasem bez jeho přítomnosti).',
    options: [
      'Návštěva probíhá standardně bez jakýchkoliv omezení za přítomnosti pouze službu konajícího dozorce OVV, přičemž souhlas orgánů činných v trestním řízení se nevyžaduje.',
      'Návštěva je možná pouze s předchozím písemným souhlasem příslušného orgánu činného v trestním řízení (v přípravném řízení státní zástupce, v řízení před soudem soudce) a za přítomnosti zástupce OČTŘ (či s jeho výslovným souhlasem bez jeho přítomnosti).',
      'Návštěva je u koluzní vazby ze zákona absolutně vyloučena po celou dobu trvání tohoto důvodu vazby (nejvýše však po dobu 3 měsíců) a nelze udělit žádnou výjimku.',
      'Návštěva je možná pouze se souhlasem ředitele vazební věznice a probíhá výhradně formou telefonického hovoru přes neprůstřelnou skleněnou přepážku bez přítomnosti policie.'
    ],
    correctOption: 1,
    rationale: 'Dle § 14 odst. 2 zákona č. 293/1993 Sb. a § 44 odst. 5 vyhlášky č. 109/1994 Sb. musí být u koluzní vazby vyloučeno maření vyšetřování a ovlivňování svědků prostřednictvím návštěvníků.',
    source: '§ 14 odst. 2 ZVV, § 44 odst. 5 vyhl. 109/1994 Sb. a Studijní text str. 73'
  },
  {
    id: 'pen-39',
    subject: 'Penologie',
    topic: 'Právo odsouzeného na korespondenci a omezení',
    question: 'Vysvětlete, jak je naplňováno právo odsouzeného na korespondenci a jaká jsou jeho případná omezení:',
    answer: 'Odsouzený má právo přijímat a na svůj náklad odesílat korespondenci bez početního limitu. VS je oprávněna ji otevírat a kontrolovat obsah. Kontrola je ZAKÁZÁNA u korespondence s obhájcem, advokátem, státními orgány ČR, prezidentem, ombudsmanem a mezinárodními institucemi lidských práv.',
    options: [
      'Odsouzený může odeslat nejvýše 4 dopisy za měsíc na náklady věznice. Vězeňská služba je povinna otevírat a cenzurovat veškerou korespondenci včetně dopisů adresovaných obhájci a Evropskému soudu pro lidská práva.',
      'Odsouzený má právo přijímat a na svůj náklad odesílat korespondenci bez početního limitu. VS je oprávněna ji otevírat a kontrolovat obsah. Kontrola je ZAKÁZÁNA u korespondence s obhájcem, advokátem, státními orgány ČR, prezidentem, ombudsmanem a mezinárodními institucemi lidských práv.',
      'Korespondence odsouzeného nesmí být ze zákona nikdy otevírána ani kontrolována personálem věznice z důvodu ochrany listovního tajemství dle Listiny základních práv a svobod.',
      'Odsouzený smí vést korespondenci pouze s rodinnými příslušníky zapsanými v osobním spise; veškeré dopisy cizím osobám nebo institucím jsou automaticky vraceny odesílateli bez odeslání.'
    ],
    correctOption: 1,
    rationale: 'Dle § 17 zákona č. 169/1999 Sb. a § 24 vyhlášky č. 345/1999 Sb. je korespondence významným sociálním kontaktem, přičemž ochrana obhajoby a kontrolních orgánů má absolutní zákonnou prioritu.',
    source: '§ 17 zákona č. 169/1999 Sb. a Studijní text str. 61–62'
  },
  {
    id: 'pen-40',
    subject: 'Penologie',
    topic: 'Nákupy potravin a uvolňování financí',
    question: 'Jak často má odsouzený nárok na nákup potravin a věcí osobní potřeby, jaká částka je na tyto nákupy uvolňována a dle čeho se určuje její výše?',
    answer: 'Nejméně 1× týdně (ve věznici zpravidla 2× týdně) formou bezhotovostní platby z volných peněz na zvláštním účtu (kapesné, peněžité odměny, doručené neúčelové peníze). Výše nákupu je omezena zůstatkem volných prostředků a maximálním jednorázovým limitem stanoveným vnitřním řádem věznice.',
    options: [
      'Každý pracovní den formou hotovostní platby z peněz uložených u sebe v cele. Výše nákupu je neomezená a odsouzený může nakupovat jakékoliv zboží včetně lihovin a tabáku bez limitu.',
      'Nejméně 1× týdně (ve věznici zpravidla 2× týdně) formou bezhotovostní platby z volných peněz na zvláštním účtu (kapesné, peněžité odměny, doručené neúčelové peníze). Výše nákupu je omezena zůstatkem volných prostředků a maximálním jednorázovým limitem stanoveným vnitřním řádem věznice.',
      'Pouze 1× za měsíc formou věcných poukázek vydávaných vychovatelem. Maximální částka nákupu je pevně stanovena zákonem na 500 Kč měsíčně bez ohledu na výši pracovního příjmu.',
      'Jednou za 14 dní výhradně z prostředků zaslaných rodinou na účet vězeňské prodejny; z pracovní odměny ani z kapesného nelze nákup potravin dle předpisů hradit.'
    ],
    correctOption: 1,
    rationale: 'Dle § 23 zákona č. 169/1999 Sb. a § 31 vyhlášky č. 345/1999 Sb. se nákupy realizují bezhotovostně ve vězeňské prodejně za ceny nepřevyšující ceny v místě obvyklé.',
    source: '§ 23 ZVTOS, § 31 vyhl. 345/1999 Sb. a Studijní text str. 67–68'
  },
  {
    id: 'pen-41',
    subject: 'Penologie',
    topic: 'Nárokový balíček – interval a povolení',
    question: 'Jak často a do jaké váhy může přijmout odsouzený balík s potravinami a osobními věcmi, kdo povoluje jeho přijetí?',
    answer: 'Jedenkrát za 6 měsíců do hmotnosti 5 kg (tzv. nárokový balíček NB). Lhůta běží od nástupu do VTOS/převedení z VV. Potvrzení o právu na balíček s poučením pro odesílatele vydává a eviduje věznice (vychovatel OVT). Mladistvému lze mimořádný balíček udělit jako odměnu.',
    options: [
      'Jedenkrát za 3 měsíce do hmotnosti 10 kg (tzv. čtvrtletní balíček). Povolení vydává dozorový státní zástupce na základě písemné žádosti odsouzeného schválené lékařem věznice.',
      'Jedenkrát za 6 měsíců do hmotnosti 5 kg (tzv. nárokový balíček NB). Lhůta běží od nástupu do VTOS/převedení z VV. Potvrzení o právu na balíček s poučením pro odesílatele vydává a eviduje věznice (vychovatel OVT). Mladistvému lze mimořádný balíček udělit jako odměnu.',
      'Jedenkrát za kalendářní měsíc do hmotnosti 3 kg bez omezení obsahu. Povolení není vyžadováno, balíček může poslat kdokoliv přímo na adresu věznice s uvedením jména odsouzeného.',
      'Jedenkrát za rok do hmotnosti 15 kg u dospělých a 20 kg u mladistvých. Přijetí balíku schvaluje výhradně ředitel věznice po předchozím projednání v komisi pro zacházení.'
    ],
    correctOption: 1,
    rationale: 'Dle § 24 zákona č. 169/1999 Sb. a § 32 vyhlášky č. 345/1999 Sb. má odsouzený právo na balíček 1x za 6 měsíců do 5 kg (mladistvý odsouzený 4x ročně dle § 62 ZVTOS).',
    source: '§ 24 a § 62 zákona č. 169/1999 Sb. a Studijní text str. 68–69, 84'
  },
  {
    id: 'pen-42',
    subject: 'Penologie',
    topic: 'Vybavení cel a ubytovací normy',
    question: 'Vyjmenujte a popište základní vybavení cel a ložnic, jak je legislativně upraven počet ubytovaných v cele (ložnici)?',
    answer: 'Vybavení: lůžko, uzamykatelná skříňka, stůl, židle dle počtu osob, umyvadlo s pitnou vodou, záchod oddělený neprůhlednou zástěnou/dveřmi, signalizační zařízení, osvětlení, vytápění, větrání. Plocha: jednolůžková cela min. 6 m², vícelůžková min. 6 m² pro prvního a min. 4 m² pro každého dalšího, min. 7 m³ vzduchu.',
    options: [
      'Vybavení: patrová pryčna, společný stůl, otevřená toaleta bez oddělení, kamna na tuhá paliva. Plocha: jednotně 2,5 m² na osobu bez ohledu na počet lůžek a minimální objem vzduchu 4 m³ na odsouzeného.',
      'Vybavení: lůžko, uzamykatelná skříňka, stůl, židle dle počtu osob, umyvadlo s pitnou vodou, záchod oddělený neprůhlednou zástěnou/dveřmi, signalizační zařízení, osvětlení, vytápění, větrání. Plocha: jednolůžková cela min. 6 m², vícelůžková min. 6 m² pro prvního a min. 4 m² pro každého dalšího, min. 7 m³ vzduchu.',
      'Vybavení: lůžko, noční stolek, televizor, lednice, sprchový kout a mikrovlnná trouba. Plocha: minimálně 10 m² na každého odsouzeného a 15 m³ vzduchu, přičemž počet ubytovaných na cele nesmí překročit 2 osoby.',
      'Vybavení: matrace na podlaze, skříňka na chodbě ubytovny, společné sociální zařízení na patře. Plocha: minimálně 4 m² pro prvního a 2 m² pro každého dalšího ubytovaného, objem vzduchu není normou stanoven.'
    ],
    correctOption: 1,
    rationale: 'Dle § 9 a § 16 ZVTOS, § 9 ZVV a § 17 vyhlášky č. 345/1999 Sb. musí každé ubytovací místo splňovat hygienické, prostorové a bezpečnostní parametry.',
    source: '§ 17 vyhl. 345/1999 Sb., § 15 vyhl. 109/1994 Sb. a Studijní text str. 11, 58–59'
  },
  {
    id: 'pen-43',
    subject: 'Penologie',
    topic: 'Civilní oděv ve výkonu vazby',
    question: 'Za jakých podmínek je umožněno obviněným používání civilního oděvu ve výkonu vazby?',
    answer: 'Obviněný používá vlastní oděv, prádlo a obuv zpravidla po celou dobu vazby, pokud splňují podmínky hygienické a estetické nezávadnosti a má zajištěnu jejich pravidelnou výměnu na vlastní náklady (výměna prádla min. 1× týdně). Jinak mu věznice přidělí erární oděv.',
    options: [
      'Obviněný musí povinně nosit vězeňský stejnokroj ihned po přijetí do vazební věznice; vlastní civilní oděv smí použít pouze v den konání hlavního líčení u soudu na základě písemné žádosti obhájce.',
      'Obviněný používá vlastní oděv, prádlo a obuv zpravidla po celou dobu vazby, pokud splňují podmínky hygienické a estetické nezávadnosti a má zajištěnu jejich pravidelnou výměnu na vlastní náklady (výměna prádla min. 1× týdně). Jinak mu věznice přidělí erární oděv.',
      'Obviněný smí nosit vlastní oděv pouze o víkendech a ve dnech pracovního klidu; praní a chemické čištění civilního oděvu zajišťuje věznice bezplatně ve své centrální prádelně.',
      'Civilní oděv je povolen pouze u obviněných stíhaných pro nedbalostní trestné činy, u úmyslných trestných činů je nošení vlastního oděvu z bezpečnostních důvodů vyloučeno.'
    ],
    correctOption: 1,
    rationale: 'Dle § 12 zákona č. 293/1993 Sb. a § 29 vyhlášky č. 109/1994 Sb. je nošení vlastního oděvu u obviněných standardem vyplývajícím z presumpce neviny.',
    source: '§ 12 ZVV, § 29 vyhl. 109/1994 Sb. a Studijní text str. 73'
  },
  {
    id: 'pen-44',
    subject: 'Penologie',
    topic: 'Zdravotní péče o vězněné osoby – úrovně',
    question: 'Jakými způsoby je poskytována zdravotní péče vězněným osobám v systému VS ČR?',
    answer: '1. Vězeňská zdravotnická střediska (ordinace praktického lékaře, zubního lékaře a sester ve věznici), 2. Vězeňské nemocnice (Praha-Pankrác a Brno s lůžkovými odděleními), 3. Civilní zdravotnická zařízení (ambulantní specialisté a nemocnice pod střežením VS), 4. Rychlá záchranná služba (RZS) při akutních stavech.',
    options: [
      '1. Ošetřovny vedené vyškolenými dozorci se základním kurzem první pomoci, 2. Krajské hygienické stanice docházející na vyžádání, 3. Samostatné polní lazarety Ministerstva vnitra, 4. Nestátní neziskové zdravotnické organizace.',
      '1. Vězeňská zdravotnická střediska (ordinace praktického lékaře, zubního lékaře a sester ve věznici), 2. Vězeňské nemocnice (Praha-Pankrác a Brno s lůžkovými odděleními), 3. Civilní zdravotnická zařízení (ambulantní specialisté a nemocnice pod střežením VS), 4. Rychlá záchranná služba (RZS) při akutních stavech.',
      '1. Vězeňské nemocnice ve Valdicích, na Mírově a v Ruzyni, 2. Posádková zdravotnická střediska Armády ČR, 3. Soukromé kliniky plastické a estetické chirurgie, 4. Lékařské konzultace zajišťované výhradně telefonicky.',
      '1. Ordinace závodního lékaře pro příslušníky VS využívané i pro vězně, 2. Lázeňské léčebny Ministerstva spravedlnosti, 3. Mobilní sanitní vozy bez stálé posádky, 4. Zajištění péče rodinou vězněného po propuštění na propustku.'
    ],
    correctOption: 1,
    rationale: 'Dle § 16 ZVTOS, § 18 ZVV a § 23 vyhlášky č. 345/1999 Sb. je zdravotní péče organizována vícestupňově k zajištění nepřetržité dostupnosti neodkladné i specializované péče.',
    source: '§ 16 ZVTOS, § 18 ZVV a Studijní text str. 60'
  },
  {
    id: 'pen-45',
    subject: 'Penologie',
    topic: 'Specifika a práva mladistvých ve VTOS',
    question: 'Uveďte několik rozdílů v základních právech mladistvých ve výkonu trestního opatření ve srovnání s dospělými ve VTOS:',
    answer: 'Návštěvy: 5 hodin měsíčně (dospělí 3 h); Odměna návštěv: až na 8 hodin (dospělí 5 h); Balíčky: 4× ročně do 5 kg (dospělí 1× za 6 měsíců); Samovazba: max. 10 dnů (dospělí 20 dnů); UOMPZ: max. 14 dnů (dospělí 28 dnů); CUO: max. 10 dnů (dospělí 20 dnů); Nelze uložit finanční pokutu; Povinné denní vzdělávání místo práce.',
    options: [
      'Návštěvy: 3 hodiny měsíčně stejně jako u dospělých; Balíčky: 1× za rok do 10 kg; Samovazba: max. 20 dnů; UOMPZ: až na 30 dnů; Lze uložit finanční pokutu až do 10 000 Kč; Povinný výkon těžkých prací v dílnách.',
      'Návštěvy: 5 hodin měsíčně (dospělí 3 h); Odměna návštěv: až na 8 hodin (dospělí 5 h); Balíčky: 4× ročně do 5 kg (dospělí 1× za 6 měsíců); Samovazba: max. 10 dnů (dospělí 20 dnů); UOMPZ: max. 14 dnů (dospělí 28 dnů); CUO: max. 10 dnů (dospělí 20 dnů); Nelze uložit finanční pokutu; Povinné denní vzdělávání místo práce.',
      'Návštěvy: 8 hodin týdně bez dohledu personálu; Balíčky: neomezeně každý týden do 20 kg; Samovazba a CUO jsou zcela zakázány; Hlavním kázeňským trestem je snížení kapesného a zákaz sledování televize až na 1 rok.',
      'Návštěvy: 2 hodiny měsíčně pod přísným sluchovým dohledem; Balíčky: 2× ročně do 2 kg; Samovazba: až na 15 dnů (dospělí 10 dnů); UOMPZ: až na 21 dnů; Povinnost hradit plné náklady na výkon trestního opatření.'
    ],
    correctOption: 1,
    rationale: 'Zákon č. 169/1999 Sb. (§ 60–65) a zákon č. 218/2003 Sb. (ZSM) stanoví zvýšenou ochranu mladistvých, prioritní zaměření na vzdělávání a přípravu na povolání, rozšířená práva a mírnější sankce.',
    source: '§ 60–65 zákona č. 169/1999 Sb. a Studijní text str. 83–84'
  }
  ,
  // 46. Výkon zabezpečovací detence
  {
    id: 'pen-46',
    subject: 'Penologie',
    topic: 'Zabezpečovací detence',
    question: 'Jaká jsou specifika výkonu zabezpečovací detence a kdo ji zajišťuje?',
    answer: 'Vykonává se v ústavech pro výkon zabezpečovací detence (ÚVZD), které spravuje Vězeňská služba ČR. Střežení a bezpečnost zajišťují příslušníci VS ČR, ale odborné zacházení, terapii a ošetřovatelství zajišťují psychologové, speciální pedagogové a zdravotnický personál. Režim je volnější než ve věznici, kladen je důraz na léčebně-terapeutické a výchovné působení.',
    options: [
      'Vykonává se v běžných věznicích na odděleních se zvýšenou ostrahou; střežení i terapii zajišťují výhradně příslušníci VS ČR (dozorci).',
      'Vykonává se v ústavech pro výkon zabezpečovací detence (ÚVZD), které spravuje Vězeňská služba ČR. Střežení a bezpečnost zajišťují příslušníci VS ČR, ale odborné zacházení, terapii a ošetřovatelství zajišťují psychologové, speciální pedagogové a zdravotnický personál. Režim je volnější než ve věznici, kladen je důraz na léčebně-terapeutické a výchovné působení.',
      'Zajišťují ji výhradně civilní psychiatrické nemocnice spadající pod Ministerstvo zdravotnictví, bez jakékoliv účasti Vězeňské služby ČR.',
      'Detence se vykonává formou domácího vězení s elektronickým náramkem a povinnou ambulantní psychiatrickou léčbou.'
    ],
    correctOption: 1,
    rationale: 'ÚVZD (Brno, Opava) kombinují bezpečnostní prvky věznice s terapeutickým režimem zdravotnického zařízení. VS ČR zajišťuje střežení, civilní odborníci terapii (z. č. 129/2008 Sb.).',
    source: 'Zákon č. 129/2008 Sb., o výkonu zabezpečovací detence'
  },
  // 47. Klasifikace věznic
  {
    id: 'pen-47',
    subject: 'Penologie',
    topic: 'Diferenciace věznic',
    question: 'Jaké jsou dva základní typy věznic v ČR pro výkon trestu odnětí svobody plnoletých pachatelů podle platného znění TZ (§ 56)?',
    answer: '1. Věznice s ostrahou (dále se vnitřně člení na oddělení s nízkým, středním a vysokým stupněm zabezpečení) a 2. Věznice se zvýšenou ostrahou.',
    options: [
      '1. Věznice pro prvotrestané a 2. Věznice pro recidivisty.',
      '1. Věznice s ostrahou (dále se vnitřně člení na oddělení s nízkým, středním a vysokým stupněm zabezpečení) a 2. Věznice se zvýšenou ostrahou.',
      '1. Věznice s dohledem, 2. Věznice s dozorem, 3. Věznice s ostrahou, 4. Věznice se zvýšenou ostrahou.',
      '1. Polouzavřené ústavy a 2. Plně uzavřené ústavy s maximální ostrahou.'
    ],
    correctOption: 1,
    rationale: 'Od 1. 1. 2017 (novela TZ) existují jen dva typy věznic. Věznice s ostrahou se vnitřně člení na 3 oddělení. O zařazení do oddělení rozhoduje ředitel věznice na základě doporučení komise, soud určuje jen typ věznice.',
    source: '§ 56 zákona č. 40/2009 Sb., trestní zákoník'
  },
  // 48. Metodika SARPO
  {
    id: 'pen-48',
    subject: 'Penologie',
    topic: 'Penitenciární diagnostika',
    question: 'K čemu slouží v penitenciární praxi nástroj SARPO (Souhrnná analýza rizik a kriminogenních potřeb)?',
    answer: 'Je to standardizovaný diagnostický nástroj pro hodnocení rizik (např. riziko recidivy, riziko agrese, útěku) a kriminogenních potřeb (např. závislosti, dluhy, vzdělání) odsouzených. Výsledky SARPO jsou klíčové pro nastavení individuálního Programu zacházení a pro rozhodování o umístění do prostupného režimu.',
    options: [
      'Slouží k automatickému přidělování vězňů na pracovní zařazení bez posouzení jejich zdravotního stavu.',
      'Je to formulář pro podávání stížností odsouzených proti rozhodnutí ředitele věznice o kázeňském trestu.',
      'Je to standardizovaný diagnostický nástroj pro hodnocení rizik (např. riziko recidivy, riziko agrese, útěku) a kriminogenních potřeb (např. závislosti, dluhy, vzdělání) odsouzených. Výsledky SARPO jsou klíčové pro nastavení individuálního Programu zacházení a pro rozhodování o umístění do prostupného režimu.',
      'Jedná se o účetní program pro výpočet srážek ze mzdy pracujících vězňů za výkon trestu.'
    ],
    correctOption: 2,
    rationale: 'SARPO umožňuje objektivní posouzení rizik a potřeb vězně, čímž zefektivňuje zacílení odborného zacházení a snižuje pravděpodobnost recidivy po propuštění.',
    source: 'Metodika SARPO a koncepce vězeňství ČR'
  },
  // 49. Program zacházení (aktivity)
  {
    id: 'pen-49',
    subject: 'Penologie',
    topic: 'Program zacházení',
    question: 'Z jakých základních typů aktivit se skládá Program zacházení odsouzeného?',
    answer: 'Skládá se z aktivit: 1. Pracovní (pracovní zařazení), 2. Vzdělávací (škola, kurzy), 3. Speciálně výchovné (terapeutické programy, zvládání agrese), 4. Zájmové (sport, kultura) a 5. Oblast utváření vnějších vztahů (udržování kontaktů s rodinou).',
    options: [
      '1. Výslechy na policii, 2. Účast na soudech, 3. Advokátní poradny.',
      '1. Úklid cely, 2. Sledování televize, 3. Nákup v kantýně, 4. Osobní volno.',
      'Skládá se z aktivit: 1. Pracovní (pracovní zařazení), 2. Vzdělávací (škola, kurzy), 3. Speciálně výchovné (terapeutické programy, zvládání agrese), 4. Zájmové (sport, kultura) a 5. Oblast utváření vnějších vztahů (udržování kontaktů s rodinou).',
      'Program zacházení zahrnuje výhradně povinnost mlčet a denně cvičit prostná.'
    ],
    correctOption: 2,
    rationale: 'Těchto 5 oblastí aktivit (PV, VV, SV, ZV, UVZ) tvoří komplexní rámec resocializace odsouzeného, který se individualizuje na základě výsledků SARPO.',
    source: 'Zákon č. 169/1999 Sb., o VTOS a Řád výkonu trestu'
  },
  // 50. Prevence násilí (kategorie DVO)
  {
    id: 'pen-50',
    subject: 'Penologie',
    topic: 'Prevence násilí',
    question: 'Která kategorie vězněných osob se označuje zkratkou DVO a jaká platí pro ni specifika?',
    answer: 'DVO = Duševně (psychicky) vysoce narušené osoby a osoby s mentální retardací (dále DVO-P, DVO-M). Vyžadují speciální zacházení, umístění na specializované oddělení, dohled psychologa a zvýšenou ochranu před šikanou ze strany ostatních vězňů.',
    options: [
      'DVO = Dlouhodobě vydělávající osoby; mají přednost při zařazení do práce mimo věznici.',
      'DVO = Dobře vychované osoby; tyto osoby mají povoleny neomezené návštěvy.',
      'DVO = Dozorci ve výslužbě; označení pro bývalé příslušníky v civilu.',
      'DVO = Duševně (psychicky) vysoce narušené osoby a osoby s mentální retardací (dále DVO-P, DVO-M). Vyžadují speciální zacházení, umístění na specializované oddělení, dohled psychologa a zvýšenou ochranu před šikanou ze strany ostatních vězňů.'
    ],
    correctOption: 3,
    rationale: 'Osoby v kategorii DVO jsou obzvlášť zranitelné (riziko viktimizace) nebo hůře zvladatelné běžnými metodami, proto se pro ně zřizují specializovaná oddělení s intenzivnějším dohledem odborných zaměstnanců.',
    source: 'NGŘ č. 24/2022, o předcházení násilí mezi vězněnými osobami'
  }
];
