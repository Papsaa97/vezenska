import {
  LAW_555_1992_FULL,
  LAW_169_1999_FULL,
  LAW_293_1993_FULL,
  LAW_129_2008_FULL,
  LAW_361_2003_FULL,
  LAW_40_2009_FULL,
  LAW_141_1961_FULL,
  DECREE_345_1999_FULL,
  DECREE_109_1994_FULL,
  NGR_33_2019_FULL,
  NGR_16_2022_FULL,
  NGR_24_2022_FULL,
  NGR_28_2018_FULL,
  NGR_41_2024_FULL,
  NGR_19_2023_FULL,
  EPR_2006_FULL,
  MANDELA_RULES_FULL
} from './fullLawTexts/fullRegulationsBundle';

export interface VscrRegulation {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  type: 'zakon' | 'vyhlaska' | 'ngr' | 'instrukce' | 'ustava_mezinarodni';
  authority: string;
  effectiveFrom?: string;
  lastAmendment?: string;
  scope: string;
  keyProvisions: string[];
  importanceForZOP: 'Klíčový (ZOP A)' | 'Velmi vysoký' | 'Vysoký' | 'Informační';
  tags: string[];
  summary: string;
  practicalApplication: string;
  officialUrl?: string;
  fullLegalText: string;
}

export const VSCR_REGULATIONS_REGISTRY: VscrRegulation[] = [
  // =========================================================================
  // 1. ZÁKONY ČESKÉ REPUBLIKY
  // =========================================================================
  {
    id: 'zakon-555-1992',
    code: 'Zákon č. 555/1992 Sb.',
    title: 'Zákon o Vězeňské službě a justiční stráži České republiky',
    shortTitle: 'Zákon o VS a JS ČR',
    type: 'zakon',
    authority: 'Parlament České republiky',
    effectiveFrom: '1. 1. 1993',
    lastAmendment: 'Zákon č. 250/2023 Sb.',
    officialUrl: 'https://e-sbirka.gov.cz/sb/1992/555?zalozka=text',
    scope: 'Základní organický a pravomocný zákon VS ČR. Vymezuje postavení sboru, oprávnění a povinnosti příslušníků, použití donucovacích prostředků a zbraně.',
    keyProvisions: [
      '§ 1 – Postavení VS ČR jako ozbrojeného bezpečnostního sboru, jmenování GŘ ministrem spravedlnosti',
      '§ 2 – Trojí členění: Vězeňská stráž, Justiční stráž, Správní služba',
      '§ 5 – Pověřené orgány VS ČR s postavením policejního orgánu dle TŘ',
      '§ 6 – Povinnost prokázat příslušnost a užít výzvu „Jménem zákona!“',
      '§ 7–§ 16 – Zjišťování totožnosti, zajištění (max. 24 h), odebrání zbraně, prohlídky',
      '§ 17 – Taxativní výčet donucovacích prostředků (hmaty/chvaty, pouta, obušek, slzotvorný prostředek, pes, elektrický paralyzér...) a podmínky použití',
      '§ 18 – Použití služební zbraně (nutná obrana, odvrácení útoku na střežený objekt, zamezení útěku nebezpečné osoby, výzva a varovný výstřel)',
      '§ 19 – Zvláštní omezení: zákaz použití zbraně a úderů obuškem proti těhotným ženám s viditelným těhotenstvím, starým osobám a dětem',
      '§ 20 – Povinnosti po použití zbraně: poskytnout první pomoc, zajistit místo, sepsat záznam a IHNED vyrozumět státního zástupce'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['základní zákon', 'donucovací prostředky', 'použití zbraně', 'oprávnění', 'justiční stráž'],
    summary: 'Stěžejní předpis, který musí každý absolvent ZOP A znát do detailu. Stanoví meze zákonného násilí státu a mantinely služebních zákroků.',
    practicalApplication: 'Aplikuje se při každém služebním zákroku, eskortě, strážení věznice i soudu a při jakémkoliv použití síly.',
    fullLegalText: LAW_555_1992_FULL
  },
  {
    id: 'zakon-169-1999',
    code: 'Zákon č. 169/1999 Sb.',
    title: 'Zákon o výkonu trestu odnětí svobody a o změně některých souvisejících zákonů',
    shortTitle: 'Zákon o výkonu trestu (ZVTOS)',
    type: 'zakon',
    authority: 'Parlament České republiky',
    effectiveFrom: '1. 1. 2000',
    lastAmendment: 'Zákon č. 130/2024 Sb.',
    officialUrl: 'https://e-sbirka.gov.cz/sb/1999/169?zalozka=text',
    scope: 'Upravuje základní zásady výkonu trestu, diferenciaci věznic (ostraha vs. zvýšená ostraha), práva a povinnosti odsouzených, programy zacházení a kázeňské řízení.',
    keyProvisions: [
      '§ 8 – Vnější diferenciace: Věznice s ostrahou (nízký, střední, vysoký stupeň zabezpečení) a se zvýšenou ostrahou',
      '§ 16 – Právo na stravu (3x denně), lůžko, 8 hodin nepřetržitého spánku, zdravotní péči',
      '§ 19 – Návštěvy odsouzených (3 hodiny za kalendářní měsíc, max. 4 osoby současně)',
      '§ 24 – Balíčky (balíček s potravinami a věcmi osobní potřeby do 5 kg jednou za rok / při kázeňské odměně)',
      '§ 28 – Základní povinnosti odsouzeného: podrobit se prohlídkám, plnit pokyny personálu, dodržovat časový rozvrh dne, vykonávat práci',
      '§ 46 – Kázeňské tresty: důtka, zákaz nákupů, propadnutí věci, celodenní umístění do uzavřeného oddělení (až 20 dnů), samovazba (až 28 dnů / mladiství až 14 dnů)'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['výkon trestu', 'práva vězňů', 'návštěvy', 'kázeňské tresty', 'diferenciace', 'ostraha'],
    summary: 'Zákonný rámec penitenciární péče v ČR. Definuje hranice mezi základními lidskými právy odsouzených a bezpečnostními omezeními.',
    practicalApplication: 'Řídí se jím dozorčí služba na ubytovnách, oddělení výkonu trestu, realizace návštěv, balíčků i kázeňské komise.',
    fullLegalText: LAW_169_1999_FULL
  },
  {
    id: 'zakon-293-1993',
    code: 'Zákon č. 293/1993 Sb.',
    title: 'Zákon o výkonu vazby',
    shortTitle: 'Zákon o výkonu vazby (ZVV)',
    type: 'zakon',
    authority: 'Parlament České republiky',
    effectiveFrom: '1. 1. 1994',
    lastAmendment: 'Zákon č. 220/2021 Sb.',
    officialUrl: 'https://e-sbirka.gov.cz/sb/1993/293?zalozka=text',
    scope: 'Upravuje podmínky výkonu vazby obviněných osob, zásadu presumpce neviny a koluzní, útěková a předstihová opatření.',
    keyProvisions: [
      '§ 2 – Presumpce neviny: na obviněného se hledí jako na nevinného, smí být omezován jen v míře nutné k zajištění účelu vazby',
      '§ 7 – Rozmísťování do cel: odděleně muži a ženy, mladiství a dospělí, kuřáci a nekuřáci, osoby v koluzní vazbě zvlášť',
      '§ 13 – Koluzní vazba (§ 67 písm. b) TŘ): veškerá korespondence, telefonáty i návštěvy podléhají předchozímu souhlasu orgánu činného v trestním řízení (s výjimkou obhájce!)',
      '§ 14 – Návštěvy obviněných (90 minut za 2 týdny pro max. 4 osoby)',
      '§ 21 – Kázeňské tresty ve vazbě: důtka, umístění do samovazby (max. 14 dnů)'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['výkon vazby', 'presumpce neviny', 'koluzní vazba', 'obhájce', 'oddělené ubytování'],
    summary: 'Klíčový předpis pro vazební věznice. Zvláštní důraz je kladen na nedotknutelnost komunikace s obhájcem a koluzní režim.',
    practicalApplication: 'Aplikuje se na vazebních odděleních při přijímání obviněných, kontrole korespondence a organizaci výslechů.',
    fullLegalText: LAW_293_1993_FULL
  },
  {
    id: 'zakon-129-2008',
    code: 'Zákon č. 129/2008 Sb.',
    title: 'Zákon o výkonu zabezpečovací detence a o změně některých souvisejících zákonů',
    shortTitle: 'Zákon o zabezpečovací detenci (ZVZD)',
    type: 'zakon',
    authority: 'Parlament České republiky',
    effectiveFrom: '1. 1. 2009',
    lastAmendment: 'Zákon č. 130/2024 Sb.',
    officialUrl: 'https://e-sbirka.gov.cz/sb/2008/129?zalozka=text',
    scope: 'Upravuje výkon ochranného opatření zabezpečovací detence u duševně nemocných pachatelů závažných trestných činů, kteří jsou nebezpeční společnosti.',
    keyProvisions: [
      '§ 1 – Účel zabezpečovací detence: ochrana společnosti a léčebné, psychologické a pedagogické působení na chovance',
      '§ 4 – Výkon detence zajišťuje Vězeňská služba ve zvláštních ústavech (Brno, Opava, Rýnovice)',
      '§ 14 – Režim chovanců, zdravotní a terapeutické programy, stálý lékařský dohled',
      '§ 24 – Použití omezovacích prostředků ze zdravotních a bezpečnostních důvodů'
    ],
    importanceForZOP: 'Vysoký',
    tags: ['zabezpečovací detence', 'chovanci', 'ochranné opatření', 'terapie', 'Brno', 'Opava'],
    summary: 'Specifický předpis pro Ústavy pro výkon zabezpečovací detence (ÚVZD). Kombinuje bezpečnostní střežení VS ČR se zdravotnickou péčí.',
    practicalApplication: 'Platí pro příslušníky sloužící v ÚVZD při práci s duševně narušenými a nebezpečnými chovanci.',
    fullLegalText: LAW_129_2008_FULL
  },
  {
    id: 'zakon-361-2003',
    code: 'Zákon č. 361/2003 Sb.',
    title: 'Zákon o služebním poměru příslušníků bezpečnostních sborů',
    shortTitle: 'Zákon o služebním poměru',
    type: 'zakon',
    authority: 'Parlament České republiky',
    effectiveFrom: '1. 1. 2007',
    lastAmendment: 'Zákon č. 349/2023 Sb.',
    officialUrl: 'https://e-sbirka.gov.cz/sb/2003/361?zalozka=text',
    scope: 'Komplexní úprava právního postavení příslušníků VS ČR, vzniku, změn a zániku služebního poměru, služební kázně, odměňování a výsluhových nároků.',
    keyProvisions: [
      '§ 7 – Hodnosti bezpečnostních sborů (rotný až brigádní generál) a tarifní třídy',
      '§ 45 – Základní povinnosti příslušníka: dodržovat služební slib, jednat nestranně, zachovávat mlčenlivost, plnit rozkazy nadřízených',
      '§ 46 – Omezení práv příslušníka: zákaz členství v politických stranách a zákaz jiné výdělečné činnosti (mimo vědecké, pedagogické a umělecké)',
      '§ 50 – Kázeňské odměny a kázeňské tresty příslušníka (písemná výtka, snížení tarifu až o 25 % na 3 měsíce, odnětí hodnosti, propuštění)',
      '§ 157 – Výsluhové nároky (výsluhový příspěvek po 15 letech služby, odchodné)'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['služební poměr', 'práva a povinnosti příslušníka', 'hodnosti', 'kázeň', 'výsluhy'],
    summary: 'Služební kodex příslušníka VS ČR. Upravuje vztah mezi státem a příslušníkem s důrazem na nestrannost, loajalitu a kázeň.',
    practicalApplication: 'Provází příslušníka celou kariérou od složení služebního slibu přes hodnostní postup až po služební hodnocení.',
    fullLegalText: LAW_361_2003_FULL
  },
  {
    id: 'zakon-40-2009',
    code: 'Zákon č. 40/2009 Sb.',
    title: 'Trestní zákoník',
    shortTitle: 'Trestní zákoník (TZ)',
    type: 'zakon',
    authority: 'Parlament České republiky',
    effectiveFrom: '1. 1. 2010',
    lastAmendment: 'Zákon č. 130/2024 Sb.',
    officialUrl: 'https://e-sbirka.gov.cz/sb/2009/40?zalozka=text',
    scope: 'Definuje základy trestní odpovědnosti, okolnosti vylučující protiprávnost a skutkové podstaty trestných činů relevantních pro vězeňství.',
    keyProvisions: [
      '§ 14 – Věková hranice trestní odpovědnosti (dovršení 15. roku věku)',
      '§ 28 – Krajní nouze (odvracení nebezpečí bez subsidiarity a proporcionality, škoda nesmí být stejně závažná nebo větší)',
      '§ 29 – Nutná obrana (odvracení přímo hrozícího nebo trvajícího útoku na zájem chráněný TZ, nesmí být zcela zjevně nepřiměřená)',
      '§ 337 – Maření výkonu úředního rozhodnutí a vykázání (útěk z věznice, nenastoupení do VTOS, vnášení drog)',
      '§ 345 – Křivé obvinění, § 346 Křivá výpověď',
      '§ 329 – Zneužití pravomoci úřední osoby (trestní odpovědnost příslušníka VS ČR za nezákonné jednání)'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['trestní právo', 'nutná obrana § 29', 'krajní nouze § 28', 'maření výkonu', 'zneužití pravomoci'],
    summary: 'Základ hmotného trestního práva pro právní kvalifikaci zákroků i jednání odsouzených a příslušníků.',
    practicalApplication: 'Zásadní pro obhajobu zákonnosti použití zbraně a donucovacích prostředků v mezích nutné obrany a krajní nouze.',
    fullLegalText: LAW_40_2009_FULL
  },
  {
    id: 'zakon-141-1961',
    code: 'Zákon č. 141/1961 Sb.',
    title: 'Zákon o trestním řízení soudním (Trestní řád)',
    shortTitle: 'Trestní řád (TŘ)',
    type: 'zakon',
    authority: 'Parlament České republiky',
    effectiveFrom: '1. 1. 1962',
    lastAmendment: 'Zákon č. 130/2024 Sb.',
    officialUrl: 'https://e-sbirka.gov.cz/sb/1961/141?zalozka=text',
    scope: 'Upravuje postup orgánů činných v trestním řízení, postavení pověřených orgánů VS ČR, instituty vazby (§ 67–73a) a výkonu rozhodnutí.',
    keyProvisions: [
      '§ 12 odst. 2 – Pověřené orgány Vězeňské služby ČR mají postavení policejního orgánu v trestním řízení o TČ spáchaných ve věznicích a vazebních věznicích',
      '§ 67 – Důvody vazby: písm. a) útěková, písm. b) koluzní (ovlivňování svědků), písm. c) předstihová (opakování TČ)',
      '§ 71–§ 72 – Lhůty trvání vazby a jejich přezkum soudem',
      '§ 320–§ 334 – Výkon trestu odnětí svobody a podmíněné propuštění'
    ],
    importanceForZOP: 'Velmi vysoký',
    tags: ['trestní řád', 'policejní orgán VS', 'důvody vazby § 67', 'trestní řízení'],
    summary: 'Procesní norma upravující oprávnění a vazební lhůty a postavení orgánů prevence a stížností VS ČR.',
    practicalApplication: 'Využíváno při vyšetřování mimořádných událostí ve věznicích a evidenci vazebních důvodů.',
    fullLegalText: LAW_141_1961_FULL
  },

  // =========================================================================
  // 2. PROVÁDĚCÍ VYHLÁŠKY MINISTERSTVA SPRAVEDLNOSTI
  // =========================================================================
  {
    id: 'vyhlaska-345-1999',
    code: 'Vyhláška MS č. 345/1999 Sb.',
    title: 'Vyhláška Ministerstva spravedlnosti, kterou se vydává řád výkonu trestu odnětí svobody',
    shortTitle: 'Řád výkonu trestu odnětí svobody (ŘVTOS)',
    type: 'vyhlaska',
    authority: 'Ministerstvo spravedlnosti ČR',
    effectiveFrom: '1. 1. 2000',
    lastAmendment: 'Vyhláška č. 278/2023 Sb.',
    officialUrl: 'https://e-sbirka.gov.cz/sb/1999/345?zalozka=text',
    scope: 'Detailní prováděcí předpis k zákonu o VTOS. Upravuje každodenní režim života ve věznici, časový rozvrh dne, ubytování, hygienu, nákupy a kázeňské řízení.',
    keyProvisions: [
      '§ 10 – Časový rozvrh dne: 8 hodin spánku, budíček, ranní prověrka početního stavu, zaměstnání, vycházka min. 1 hodina denně, večerní prověrka',
      '§ 16 – Ubytovací standardy: min. 4 m² podlahové plochy na odsouzeného (v jednolůžkové cele 6 m²), větrání a osvětlení',
      '§ 22 – Osobní hygiena, výměna ložního prádla a oděvu, sprchování min. 2x týdně teplou vodou',
      '§ 35 – Nákupy potravin a věcí osobní potřeby ve vězeňské prodejně, bezhotovostní platební styk',
      '§ 56–§ 68 – Podrobný postup ukládání a výkonu kázeňských trestů'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['prováděcí vyhláška', 'časový rozvrh dne', 'hygiena', 'ubytovací plocha 4m2', 'kázeňské řízení'],
    summary: 'Praktická „bible“ dozorce na oddělení výkonu trestu. Všechny procesy dne jsou řízeny touto vyhláškou.',
    practicalApplication: 'Dozorčí a vychovatelská služba se jí řídí každou minutu směny (budíček, stravování, prověrky počtů, vycházky).',
    fullLegalText: DECREE_345_1999_FULL
  },
  {
    id: 'vyhlaska-109-1994',
    code: 'Vyhláška MS č. 109/1994 Sb.',
    title: 'Vyhláška Ministerstva spravedlnosti, kterou se vydává řád výkonu vazby',
    shortTitle: 'Řád výkonu vazby (ŘVV)',
    type: 'vyhlaska',
    authority: 'Ministerstvo spravedlnosti ČR',
    effectiveFrom: '1. 7. 1994',
    lastAmendment: 'Vyhláška č. 279/2023 Sb.',
    officialUrl: 'https://e-sbirka.gov.cz/sb/1994/109?zalozka=text',
    scope: 'Prováděcí předpis k zákonu o výkonu vazby. Upravuje režim obviněných na celách, bezpečnostní opatření, vycházky a manipulaci s věcmi.',
    keyProvisions: [
      'Přijímací řízení obviněného: osobní prohlídka, hygienická očista, lékařská prohlídka do 24 hodin, uložení cenností',
      'Povinnost celodenního uzamčení cel obviněných',
      'Zajištění denní vycházky v délce nejméně 1 hodiny na vyhrazeném vycházkovém dvoře',
      'Režim doručování balíčků a korespondence, technická kontrola proti vnášení nedovolených předmětů'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['řád výkonu vazby', 'přijímací řízení', 'vycházky', 'uzamčení cel', 'osobní prohlídka'],
    summary: 'Stěžejní předpis pro službu ve vazebních věznicích a na eskortních stanovištích.',
    practicalApplication: 'Příslušníci na vazbě se jím řídí při ranních a večerních prověrkách, eskortách k soudům a střežení cel.',
    fullLegalText: DECREE_109_1994_FULL
  },

  // =========================================================================
  // 3. NAŘÍZENÍ GENERÁLNÍHO ŘEDITELE VĚZEŇSKÉ SLUŽBY ČR (NGŘ)
  // =========================================================================
  {
    id: 'ngr-33-2019',
    code: 'NGŘ č. 33/2019 (a NGŘ č. 2/2026)',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o provádění prohlídek osob, věcí a prostor ve věznicích a vazebních věznicích',
    shortTitle: 'Řád prohlídek a kontrol (NGŘ 33/2019)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '1. 10. 2019',
    lastAmendment: 'NGŘ č. 2/2026',
    scope: 'Stanoví závazné postupy a cykly pro provádění osobních prohlídek vězněných osob, technických kontrol prostor, detekci nepovolených předmětů a drog.',
    keyProvisions: [
      'Druhy osobních prohlídek: orientační, důkladná (se svlečením do naha), lékařská prohlídka tělesných otvorů',
      'Důkladnou osobní prohlídku se svlečením smí provádět VÝHRADNĚ příslušník STEJNÉHO POHLAVÍ jako prohlížená osoba a bez přítomnosti třetích osob!',
      'Závazný 90denní cyklus: generální kontrola všech cel, ložnic, pracovišť a prostor věznice musí proběhnout nejméně 1x za 90 dnů',
      'Použití technických prostředků: detektory kovů, detektory nelineárních přechodů (na skryté mobily), narkotesty, endoskopy, služební psi na vyhledávání OPL'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'prohlídky', '90 dnů cyklus', 'stejné pohlaví', 'kontrola cel', 'drogy'],
    summary: 'Nejčastěji zkoušené nařízení v předmětu Bezpečnostní služba. Zabraňuje vnášení drog, zbraní a mobilů.',
    practicalApplication: 'Provádění osobních prohlídek při návratech z pracovišť, nástupech do vazby a pravidelných prohlídkách cel.',
    fullLegalText: NGR_33_2019_FULL
  },
  {
    id: 'ngr-16-2022',
    code: 'NGŘ č. 16/2022',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o organizaci a výkonu strážní, dozorčí a eskortní služby',
    shortTitle: 'Strážní, dozorčí a eskortní služba (NGŘ 16/2022)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '1. 6. 2022',
    scope: 'Komplexně upravuje taktiku strážní služby na věžích a stanovištích, výkon dozorčí služby na ubytovnách a organizaci eskort.',
    keyProvisions: [
      'Stanovení složení eskorty (velitel eskorty, strážný, řidič) a minimálních početních stavů dle rizikovosti eskortované osoby',
      'Kategorie eskortovaných osob a barevné označení eskortních listů (červený pruh pro zvlášť nebezpečné pachatele a útěkáře)',
      'Pravidla pro použití služebního psa při eskortách a střežení perimetru věznice',
      'Postup strážného při narušení perimetru: výzva „Stůj!“, „Stůj, nebo střelím!“, varovný výstřel a střelba do nohou'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'eskortní služba', 'strážní služba', 'dozorčí služba', 'červený pruh', 'narušení perimetru'],
    summary: 'Taktická norma pro všechny bezpečnostní směny. Určuje přesné postupy při střežení věznice i transportu vězňů.',
    practicalApplication: 'Každodenní plánování a provádění eskort k civilním lékařům, soudům a mezi věznicemi.',
    fullLegalText: NGR_16_2022_FULL
  },
  {
    id: 'ngr-24-2022',
    code: 'NGŘ č. 24/2022',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o režimu vstupů osob a vjezdů vozidel do střežených objektů VS ČR',
    shortTitle: 'Vstupy osob a vjezdy vozidel (NGŘ 24/2022)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '1. 9. 2022',
    scope: 'Stanoví bezpečnostní režim na hlavních vchodech a vjezdových propustích věznic, evidenci vstupujících a kontrolu vozidel.',
    keyProvisions: [
      'Režim vjezdové propusti: NIKDY nesmí být otevřena obě vrata současně! Vozidlo musí vjet do propusti, vnější vrata se uzavřou, provede se kontrola a teprve poté se otevřou vnitřní vrata',
      'Kontrola vozidla: kontrola podvozku zrcadlem, kontrola ložné plochy, kabiny řidiče a motorového prostoru',
      'Vstup osob: kontrola dokladu totožnosti, detekční rám, uložení zbraní a mobilních telefonů do úschovných skříněk před vstupem',
      'Oprávnění vstupu bez prohlídky: prezident republiky, členové vlády, poslanci, senátoři, soudci a státní zástupci při výkonu pravomoci'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'vstupy a vjezdy', 'vjezdová propusť', 'obě vrata', 'kontrola podvozku', 'detektory'],
    summary: 'Klíčový bezpečnostní předpis pro službu na hlavním vchodu (stanoviště č. 1) a vjezdové bráně.',
    practicalApplication: 'Kontrola všech civilních návštěv, advokátů, zásobovacích vozidel i zaměstnanců při příchodu do věznice.',
    fullLegalText: NGR_24_2022_FULL
  },
  {
    id: 'ngr-28-2018',
    code: 'NGŘ č. 28/2018',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o Rezortním protikorupčním programu a Etickém kodexu',
    shortTitle: 'Protikorupční program a etický kodex (NGŘ 28/2018)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '1. 11. 2018',
    scope: 'Definuje etické standardy příslušníků, matici korupčních rizik, ochranu oznamovatelů (whistleblowing) a zákaz přijímání darů.',
    keyProvisions: [
      'Etické principy: zákonnost, nestrannost, profesionalita, důstojnost a loajalita ke sboru',
      'Matice korupčních rizik s bodovou škálou 1–25 (Pravděpodobnost 1–5 x Dopad 1–5)',
      'Kritická korupční místa ve věznici: zaměstnávání odsouzených, zařazování do oddílů s mírnějším režimem, schvalování nákupů a balíčků',
      'Postup při nabídce úplatku: okamžité odmítnutí, sepsání záznamu a nahlášení nadřízenému a odboru prevence a stížností / GIBS'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'etika', 'protikorupční program', 'matice rizik 1-25', 'whistleblowing', 'GIBS'],
    summary: 'Stěžejní předpis pro předmět Profesní etika. Chrání příslušníka před korupcí a profesním selháním.',
    practicalApplication: 'Prevence korupčních nabídek od rodin odsouzených a udržení vysoké profesní integrity.',
    fullLegalText: NGR_28_2018_FULL
  },
  {
    id: 'ngr-41-2024',
    code: 'NGŘ č. 41/2024',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o Spisovém řádu a provozu elektronického systému ETŘ',
    shortTitle: 'Spisový řád a ETŘ (NGŘ 41/2024)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '1. 3. 2024',
    scope: 'Upravuje tvorbu, evidenci, oběh a archivaci písemností, generování čísel jednacích (Č.j.) a práci v modulu ETŘ.',
    keyProvisions: [
      'Struktura Čísla jednacího (Č.j.): VS-pořadové_číslo-oddělení/ČJ-rok-kód_útvaru-pořadí',
      'Životní cyklus úředního záznamu v ETŘ: Čekající na zpracování (ČJ) → Připraveno k podpisu (PŘ) → Schváleno / Trvalé číslo (TČ)',
      'Pravidla skartačního řízení: skartační znaky S (stoupa / zničení), V (výběr / archiv), A (archiválie trvalé hodnoty)',
      'Lhůta pro vyhotovení záznamu o kázeňském přestupku (ZKP): neprodleně, nejpozději do konce směny'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'ETŘ', 'spisová služba', 'číslo jednací', 'skartace', 'úřední záznam'],
    summary: 'Základní norma pro předmět Vězeňská administrativa. Řídí veškerou úřední korespondenci a evidenci.',
    practicalApplication: 'Generování úředních záznamů o mimořádných událostech, kázeňských listů a hlášení v systému VIS/ETŘ.',
    fullLegalText: NGR_41_2024_FULL
  },
  {
    id: 'ngr-19-2023',
    code: 'NGŘ č. 19/2023',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o zbraňové službě, skladování zbraní a střelecké přípravě',
    shortTitle: 'Zbraňová služba a střelecká příprava (NGŘ 19/2023)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '1. 5. 2023',
    scope: 'Stanoví bezpečnostní pravidla manipulace se služebními zbraněmi (CZ 75 B, CZ Scorpion EVO 3A1, brokovnice), jejich ukládání a provádění cvičných střeleb.',
    keyProvisions: [
      'Zbraňová bezpečnost: rána jistoty vždy do lapače střel pod úhlem 45 stupňů!',
      'Ukládání zbraní ve zbrojnici: vybité, kohout vypuštěn, zásobník mimo zbraň, uzamčeno v trezoru',
      'Pravidelný střelecký výcvik a povinné přezkoušení příslušníků nejméně 2x ročně',
      'Postup při závadách na zbrani: selhač, zádržka (stovepipe), vzpříčený náboj (double feed) – klepni, natáhni, pokračuj (TAP-RACK)'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'zbraně', 'střelba', 'CZ 75 B', 'Scorpion EVO 3', 'bezpečnost', 'lapač střel'],
    summary: 'Základní střelecký a zbraňový předpis pro předmět Služební příprava.',
    practicalApplication: 'Vydávání a přebírání zbraní ve zbrojnici před nástupem do služby a na eskorty.',
    fullLegalText: NGR_19_2023_FULL
  },

  // =========================================================================
  // 4. MEZINÁRODNÍ ÚMLUVY A STANDARDY
  // =========================================================================
  {
    id: 'mezinarodni-epr-2006',
    code: 'Evropská vězeňská pravidla (EPR)',
    title: 'Doporučení Rec(2006)2 Výboru ministrů Rady Evropy členským státům o Evropských vězeňských pravidlech',
    shortTitle: 'Evropská vězeňská pravidla (EPR)',
    type: 'ustava_mezinarodni',
    authority: 'Rada Evropy',
    effectiveFrom: '11. 1. 2006',
    scope: 'Základní evropský lidskoprávní standard pro zacházení s vězněnými osobami, humanizaci vězeňství a prevenci ponižujícího zacházení.',
    keyProvisions: [
      'Pravidlo 1: Se všemi osobami zbavenými svobody se zachází s respektem k jejich lidským právům',
      'Pravidlo 3: Život ve vězení musí být co nejvíce přiblížen pozitivním aspektům života ve společnosti (princip normalizace)',
      'Zákaz diskriminace, mučení, nelidského a ponižujícího trestání',
      'Právo na hygienu, zdraví, kontakt s vnějším světem a přípravu na propuštění'
    ],
    importanceForZOP: 'Velmi vysoký',
    tags: ['mezinárodní právo', 'Rada Evropy', 'lidská práva', 'normalizace', 'zákaz mučení'],
    summary: 'Mezinárodní standard etického a humánního vězeňství v moderní demokratické Evropě.',
    practicalApplication: 'Garantuje standardy materiálních podmínek věznic kontrolované Výborem CPT a Veřejným ochráncem práv.',
    fullLegalText: EPR_2006_FULL
  },
  {
    id: 'mezinarodni-mandela-rules',
    code: 'Mandela Rules (OSN)',
    title: 'Standardní minimální pravidla OSN pro zacházení s vězni (Pravidla Nelsona Mandely)',
    shortTitle: 'Pravidla Nelsona Mandely (OSN)',
    type: 'ustava_mezinarodni',
    authority: 'Valné shromáždění OSN',
    effectiveFrom: '17. 12. 2015',
    scope: 'Globální univerzální minimální standardy OSN pro správu věznic a zacházení s vězni.',
    keyProvisions: [
      'Pravidlo 1: Zákaz mučení a krutého zacházení za všech okolností',
      'Pravidlo 43: Absolutní zákaz neurčité a dlouhodobé samovazby (delší než 15 po sobě jdoucích dnů)',
      'Zákaz umisťování do temných cel bez denního světla',
      'Povinnost zajistit profesionální lékařskou péči nezávislou na vězeňské správě'
    ],
    importanceForZOP: 'Vysoký',
    tags: ['OSN', 'Mandela rules', 'zákaz dlouhé samovazby', 'lidská důstojnost'],
    summary: 'Globální charta lidských práv vězněných osob schválená OSN.',
    practicalApplication: 'Výuka profesní etiky a penitenciární psychologie na Akademii VS ČR.',
    fullLegalText: MANDELA_RULES_FULL
  }
];
