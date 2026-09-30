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
  NGR_02_2022_FULL,
  NGR_02_2026_FULL,
  NGR_24_2025_FULL,
  NGR_43_2015_FULL,
  NGR_15_2018_FULL,
  NGR_38_2018_FULL,
  POKYN_11_2020_FULL,
  POKYN_4_2016_FULL,
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
  /**
   * Novely, kterými vzniklo platné znění.
   *
   * U předpisů ze Sbírky zákonů musí hodnota odpovídat tomu, co e-Sbírka vede
   * u aktuálního znění — hlídá to `npm run check:legal`. Zdrojem pravdy je
   * `src/data/esbirka/snapshotManifest.ts`, který plní `npm run sync:laws`.
   */
  lastAmendment?: string;
  scope: string;
  keyProvisions: string[];
  importanceForZOP: 'Klíčový (ZOP A)' | 'Velmi vysoký' | 'Vysoký' | 'Informační';
  tags: string[];
  summary: string;
  practicalApplication: string;
  officialUrl?: string;
  fullLegalText: string;
  /**
   * Platí předpis, nebo ho už něco zrušilo? Chybí-li, předpis platí.
   *
   * Hlavně pro NGŘ: ta ve Sbírce nejsou, takže za ně aktuálnost nehlídá
   * `npm run sync:laws` a musí ji ručně nastavit lektor, když vyjde nové.
   */
  status?: RegulationStatus;
  /** Označení předpisu, který tento nahradil (např. „NGŘ č. 14/2026“). */
  replacedBy?: string;
  /**
   * Co u záznamu chybí nebo je potřeba ověřit. Zobrazí se všem, aby student
   * poznal, že čte neúplný záznam; lektor poznámku po doplnění smaže.
   */
  reviewNote?: string;
  /** Nahraný text předpisu (PDF nebo Word) v kbelíku studijních materiálů. */
  document?: RegulationDocument;
  /** Dřívější nahrané verze — při nahrazení souboru se nemažou. */
  previousDocuments?: RegulationDocument[];
}

export type RegulationStatus = 'platny' | 'zruseny';

/** Soubor s textem předpisu, nahraný lektorem. */
export interface RegulationDocument {
  /** Cesta v kbelíku 'studijni-materialy' (složka 'predpisy/'). */
  path: string;
  /** Původní název souboru, pod kterým se i stahuje. */
  fileName: string;
  size: number;
  mimeType: string;
  /** Kdy byl soubor nahrán (ISO). */
  uploadedAt: string;
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
    lastAmendment: '270/2025 Sb.',
    officialUrl: 'https://e-sbirka.gov.cz/sb/1992/555?zalozka=text',
    scope: 'Základní organický a pravomocný zákon VS ČR. Vymezuje postavení sboru, oprávnění a povinnosti příslušníků, použití donucovacích prostředků a zbraně.',
    // Ověřeno proti úplnému znění z e-Sbírky (znění č. 25 účinné od 1. 1. 2026).
    // Předchozí verze tvrdila trojí členění sboru (zákon uvádí v § 3 odst. 1
    // pět složek), přiřazovala pověřené orgány k § 5 (jsou v § 3 odst. 8)
    // a po použití zbraně ukládala vyrozumět státního zástupce — § 20 ukládá
    // bezodkladné oznámení nadřízenému a o státním zástupci v této souvislosti
    // zákon nemluví vůbec.
    keyProvisions: [
      '§ 1 – Zřízení VS ČR jako ozbrojeného bezpečnostního sboru; řídí ji generální ředitel, kterého jmenuje a odvolává ministr spravedlnosti',
      '§ 2 – Úkoly Vězeňské služby: správa a střežení věznic a ústavů pro zabezpečovací detenci, eskorty, programy zacházení, pořádek v budovách soudů a státních zastupitelství',
      '§ 3 odst. 1 – Úkoly zajišťuje PĚT složek: vězeňská stráž, justiční stráž, správní služba, Akademie Vězeňské služby a pověřené orgány Vězeňské služby',
      '§ 3 odst. 8 – Pověřené orgány VS ČR mají postavení policejního orgánu v řízení o trestných činech osob ve výkonu vazby, trestu odnětí svobody a zabezpečovací detence',
      '§ 6 – Povinnost jednat vážně a rozhodně a šetřit důstojnost osob; před zákrokem prokázat příslušnost k Vězeňské službě a použít domluvy, výzvy nebo varování — před výzvou příslušník použije slova „jménem zákona“',
      '§ 7 – Kdy je příslušník povinen zakročit a kdy zákrok provést nemusí (vliv léků, chybějící výcvik, důležitý zájem služby)',
      '§ 11–§ 16 – Osobní prohlídka, odnětí věcí, prokázání totožnosti, pronásledování prchajících osob, operativně pátrací prostředky',
      '§ 17 – Taxativní výčet donucovacích prostředků (hmaty, chvaty, údery a kopy sebeobrany, předváděcí řetízky, pouta, obušek, slzotvorné prostředky, služební pes, elektrický paralyzér…) a podmínky použití',
      '§ 18 – Střelná zbraň jen výjimečně a jen když jsou donucovací prostředky zřejmě neúčinné: nutná obrana, překonání odporu, zamezení útěku, odvrácení útoku na střežený objekt, zneškodnění zvířete; předchází výzva s výstrahou',
      '§ 19 – Omezení: proti těhotné ženě, osobě vysokého věku, osobě se zjevným zdravotním postižením a osobě zjevně mladší 15 let nelze použít úderů a kopů, obušku, psa, paralyzéru ani střelné zbraně; proti ženě nelze použít psa, paralyzér a střelnou zbraň',
      '§ 20 – Po použití: při zranění poskytnout první pomoc, zajistit lékařské ošetření a sepsat záznam; každé použití BEZODKLADNĚ oznámit svému NADŘÍZENÉMU'
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
    lastAmendment: '220/2025 Sb., 270/2025 Sb.',
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
    lastAmendment: '220/2025 Sb., 270/2025 Sb.',
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
    lastAmendment: '220/2025 Sb., 270/2025 Sb.',
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
    lastAmendment: '300/2025 Sb.',
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
    lastAmendment: '268/2024 Sb., 220/2025 Sb., 250/2025 Sb., 270/2025 Sb.',
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
    lastAmendment: '265/2001 Sb., 220/2025 Sb., 269/2025 Sb., 270/2025 Sb., 285/2025 Sb.',
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
    lastAmendment: '360/2024 Sb.',
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
    lastAmendment: '360/2024 Sb.',
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
  //
  // NGŘ nejsou ve Sbírce zákonů, takže je `npm run sync:laws` nestahuje a nikdo
  // za lektora nehlídá, jestli ještě platí. Text konkrétního NGŘ se proto do
  // aplikace NAHRÁVÁ jako soubor (Katalog předpisů → Upravit → Nahrát soubor)
  // a nové NGŘ, které starší nahrazuje, to u starého vyznačí (status/replacedBy).
  //
  // Názvy a paragrafy níže jsou ověřené proti podkladům ze závěrečných zkoušek
  // ZOP A 2026 („závěrečky zop.pdf“ ve sdílených souborech projektu). Dřívější
  // verze registru přiřazovala čtyřem NGŘ cizí obsah — 33/2019 jako „řád
  // prohlídek“, 16/2022 jako „strážní, dozorčí a eskortní službu“, 24/2022 jako
  // „vstupy a vjezdy“ a 41/2024 jako „spisový řád a ETŘ“ — a k tomu vymyšlené
  // články. Podle podkladů je 33/2019 o vězeňské a justiční stráži (prohlídky,
  // eskorty i vstupy jsou jeho části), 16/2022 o mimořádných událostech,
  // 24/2022 o předcházení násilí a 41/2024 o kázeňském řízení.
  {
    id: 'ngr-33-2019',
    code: 'NGŘ č. 33/2019',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o vězeňské a justiční stráži',
    shortTitle: 'Vězeňská a justiční stráž (NGŘ 33/2019)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '1. 1. 2020',
    lastAmendment: 'NGŘ č. 17/2020 a NGŘ č. 8/2022',
    scope: 'Systém střežení, výzbroj a výstroj vězeňské a justiční stráže: strážní a eskortní služba, převoz dětí matek ve výkonu, prohlídky a vstup do střežených objektů (část druhá, § 29 až § 113), justiční stráž (část třetí, § 114 až § 152).',
    keyProvisions: [
      '§ 19 – Zbraně se nabíjejí a vybíjejí na určeném a bezpečném místě s vybíjecím zařízením; hlášení „ZBRAŇ NABITA“ / „ZBRAŇ VYBITA“',
      '§ 32 odst. 3 – Strážný nesmí nikomu vydat svoji zbraň ani zásobníky s náboji, a to ani osobám, jimž je podřízen',
      '§ 41 a § 43 – Eskorty; žádost o eskortu do zdravotnického zařízení podepisuje lékař a služební funkcionář oprávněný eskortu nařídit, kromě náhlé změny zdravotního stavu',
      '§ 51 – Střídání strážných po rozdílení směny a nabití zbraní; postup stanoví ředitel věznice ve strážní dokumentaci',
      '§ 73 – Povinnosti velitele eskorty',
      '§ 79 a § 80 – Strážný neopouští stanoviště, dokud nebude vystřídán nebo odvolán; strážný u hlavního vchodu nesmí vpustit mimo jiné osoby mladší 15 let bez doprovodu osoby starší 18 let (§ 80 odst. 3 písm. e)',
      '§ 85 – Střežení v mimovězeňském zdravotnickém zařízení vždy nejméně dvěma strážnými',
      '§ 89 až § 96 – Šest druhů prohlídek; generální nejméně jednou ročně, dílčí do 90 dnů od předchozí; preventivní osobní prohlídka (§ 96)',
      '§ 99 a § 101 – Osobní prohlídka ostatních osob a služební záznam (§ 99 odst. 5); kontrola vstupujících detekčním rámem a ručním detektorem kovů (§ 101)',
      '§ 103 až § 113 – Vstup do střežených objektů'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'strážní služba', 'eskortní služba', 'prohlídky', 'vstupy a vjezdy', 'hlavní vchod'],
    summary: 'Základní předpis vězeňské a justiční stráže: výzbroj, střežení, eskorty, prohlídky a vstup do střežených objektů.',
    practicalApplication: 'Služba na strážních stanovištích a u hlavního vchodu, eskorty k soudům a do zdravotnických zařízení, generální a dílčí prohlídky.',
    fullLegalText: NGR_33_2019_FULL
  },
  {
    id: 'ngr-02-2022',
    code: 'NGŘ č. 2/2022',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o zaměstnancích a příslušnících zabezpečujících výkon vazby, výkon trestu odnětí svobody a výkon zabezpečovací detence',
    shortTitle: 'Dozorčí služba – výkon vazby a trestu (NGŘ 2/2022)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    scope: 'Povinnosti dozorců oddělení výkonu vazby a výkonu trestu a dalších zaměstnanců zabezpečujících výkon vazby, trestu a zabezpečovací detence. Nahradilo NGŘ č. 5/2016.',
    keyProvisions: [
      '§ 28 až § 32 – Dozorce oddělení výkonu vazby; na stanovišti v oddílu cel obviněných převezme při nástupu klíče od cel, prověří uzamčení všech cel a spojovací a signálně zabezpečovací prostředky (§ 32 odst. 3)',
      '§ 62 a § 68 odst. 3 – Povinnosti dozorce oddělení výkonu trestu',
      '§ 70 – Dozorce zajišťující komplexní výkon dozorčí služby v uzavřeném oddílu je přímo podřízen inspektorovi dozorčí služby'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'dozorčí služba', 'dozorce', 'výkon vazby', 'výkon trestu'],
    summary: 'Předpis pro dozorčí službu na odděleních výkonu vazby a trestu — v závěrečných zkouškách ZOP A druhé nejcitovanější NGŘ.',
    practicalApplication: 'Nástup do služby na oddílu, kontrola cel a vězněných osob, spolupráce s inspektorem dozorčí služby.',
    // Podle lektora (2026-09-30) ho nahradilo NGŘ č. 2/2026.
    status: 'zruseny',
    replacedBy: 'NGŘ č. 2/2026',
    fullLegalText: NGR_02_2022_FULL
  },
  {
    id: 'ngr-16-2022',
    code: 'NGŘ č. 16/2022',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o mimořádných událostech',
    shortTitle: 'Mimořádné události (NGŘ 16/2022)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    scope: 'Rozdělení mimořádných událostí na závažné a ostatní, povinnost je hlásit a náležitosti hlášení.',
    keyProvisions: [
      '§ 3 – Zaměstnanec mimořádnou událost neprodleně hlásí v době služby přímému nadřízenému, mimo službu vrchnímu inspektorovi strážní služby, resp. operačnímu středisku',
      '§ 5 – Závažné mimořádné události (např. útěk, pokus o útěk a příprava k útěku podle písm. a)',
      '§ 6 – Ostatní mimořádné události (např. sebevražda, nález mobilního telefonu mimo vstupní kontrolu, fyzické napadení zaměstnance)',
      '§ 7 – Organizační jednotka hlásí mimořádnou událost neprodleně stálé službě; vybrané týkající se vězněné osoby i dozorovému státnímu zástupci; při závažné události ředitel telefonicky generálnímu řediteli (odst. 6)',
      '§ 8 – Náležitosti hlášení: k jaké události došlo, kdy, kde a proč, případně jak a kdo ji zavinil, jak a kdy byla zjištěna a jaká byla přijata opatření',
      '§ 9 – Písemná zpráva ředitele organizační jednotky nejpozději do tří pracovních dnů'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'mimořádné události', 'hlášení', 'závažná MU', 'ostatní MU'],
    summary: 'Určuje, co je závažná a co ostatní mimořádná událost a komu a jak se hlásí.',
    practicalApplication: 'Hlášení útěku, napadení, pokusu o sebevraždu, nálezu mobilního telefonu, alkoholu, zbraně nebo výbušniny a dalších událostí vyjmenovaných v § 5 a § 6.',
    // Podle lektora (2026-09-30) ho nahradilo NGŘ č. 14/2026.
    status: 'zruseny',
    replacedBy: 'NGŘ č. 14/2026',
    fullLegalText: NGR_16_2022_FULL
  },
  {
    id: 'ngr-24-2022',
    code: 'NGŘ č. 24/2022',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o předcházení, zabránění a včasném odhalování násilí u obviněných, odsouzených a chovanců a o zaznamenávání známek nevhodného nebo ponižujícího jednání',
    shortTitle: 'Předcházení násilí mezi vězněnými (NGŘ 24/2022)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    scope: 'Jmenný seznam vězněných osob, u kterých jsou realizována opatření k předcházení násilí, prohlídky těla, kontroly dozorcem a postup při zjištění násilí (záznam, fotodokumentace, lékař, šetření). Zrušilo NGŘ č. 2/2019.',
    keyProvisions: [
      '§ 3 – Jmenný seznam vězněných osob, u kterých jsou realizována opatření k předcházení násilí; kategorie STH, NMU, MON, MPN, DVO a DVO-P (odst. 2)',
      '§ 7 odst. 4 – Možný pachatel násilí (MPN) se zpravidla neumísťuje na celu nebo ložnici s ohroženou osobou',
      '§ 13 – U ohrožených osob se jednou týdně provádí prohlídka těla, vždy osobou stejného pohlaví a bez fyzického kontaktu',
      '§ 16 a § 17 – Dozorce kontroluje osoby ze seznamu v intervalu podle dokumentace pro výkon dozorčí služby a zaznamenává časy a výsledky',
      '§ 20 odst. 1 – Kdo zjistí násilí, zamezí mu, poskytne první pomoc a oznámí to přes inspektora dozorčí služby přímému nadřízenému, mimo pracovní dobu vrchnímu inspektorovi strážní služby',
      '§ 20 odst. 6 – Záznam o fyzickém násilí podle přílohy č. 1 a evidence v informačním systému v záložce „Fyzické násilí“'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'násilí', 'prevence', 'vytypované osoby', 'fyzické násilí'],
    summary: 'Chrání zranitelné vězněné osoby a ukládá zaznamenat každé zjištěné fyzické násilí.',
    practicalApplication: 'Kontroly osob ze seznamu, týdenní prohlídky těla, zákrok a oznámení při zjištění násilí a sepsání Záznamu o fyzickém násilí.',
    fullLegalText: NGR_24_2022_FULL
  },
  {
    id: 'ngr-28-2018',
    code: 'NGŘ č. 28/2018',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR, kterým se vyhlašuje Interní protikorupční program Vězeňské služby ČR, Katalogy korupčních rizik a Kodex profesní etiky zaměstnance a příslušníka Vězeňské služby ČR',
    shortTitle: 'Protikorupční program a Kodex profesní etiky (NGŘ 28/2018)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    scope: 'Interní protikorupční program VS ČR (příloha č. 1), příkladové katalogy korupčních rizik (přílohy č. 2 až 5) a Kodex profesní etiky zaměstnance a příslušníka VS ČR (příloha č. 6). Zrušilo NGŘ č. 12/2016 a jeho novely.',
    keyProvisions: [
      '§ 3 – Míra rizika korupčního jednání je prostý násobek pravděpodobnosti a dopadu (obojí stupně 1 až 5, příloha č. 1 bod 3.1)',
      'Příloha č. 1, A. Preambule – Korupce jako zneužívání pravomoci a veřejných prostředků k dosažení vlastních individuálních či skupinových zájmů',
      'Příloha č. 1, bod 1.3 – Oznámení podezření na korupci přes protikorupční linku VS ČR nebo Ministerstva spravedlnosti; při podezření na trestný čin povinně i orgánům činným v trestním řízení',
      'Příloha č. 1, bod 1.4 – Ochrana oznamovatelů; zaměstnanec nesmí být za oznámení diskriminován',
      'Příloha č. 6 – Kodex profesní etiky zaměstnance a příslušníka VS ČR'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'etika', 'protikorupční program', 'Kodex profesní etiky', 'oznámení korupce'],
    summary: 'Stěžejní předpis pro předmět Profesní etika. Chrání příslušníka před korupcí a profesním selháním.',
    practicalApplication: 'Oznámení podezření na korupci přes protikorupční linku a znalost korupčních rizik vlastního pracoviště (nejvyšší míru mají v katalogu věznic strážní služba a prohlídky).',
    fullLegalText: NGR_28_2018_FULL
  },
  {
    id: 'ngr-41-2024',
    code: 'NGŘ č. 41/2024',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o kázeňském řízení u obviněných, odsouzených a chovanců',
    shortTitle: 'Kázeňské řízení (NGŘ 41/2024)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '1. 1. 2025',
    scope: 'Kázeňská pravomoc, odměny a kázeňské tresty obviněných, odsouzených a chovanců, záznam o kázeňském přestupku, rozhodnutí, stížnost a právní moc, odnětí a zabrání věci. Zrušilo NGŘ č. 23/2020.',
    keyProvisions: [
      '§ 2 odst. 1 – Kázeňské tresty obviněným ukládá mimo jiné vrchní dozorce (podle přílohy č. 1a například důtku nebo samovazbu až na 3 dny)',
      '§ 16 – Záznam o kázeňském přestupku může zpracovat kterýkoliv zaměstnanec, zpravidla v den spáchání, na tiskopisu podle přílohy č. 4',
      '§ 16 odst. 3 – Popis skutku vždy obsahuje přesný čas a místo, způsob a okolnosti spáchání, průběh jednání s porušenou povinností a seznam svědků',
      '§ 17 – Postačí-li domluva, záznam se nesepisuje; domluva se zapíše do informačního systému a jednotného záznamového listu; odmítne-li vězněná osoba zápis podepsat, záznam se sepíše',
      '§ 31 odst. 2 – Stížnost do tří dnů; rozhodnutí o kázeňském trestu nabývá právní moci dnem oznámení, u propadnutí a zabrání věci dnem po uplynutí lhůty ke stížnosti',
      '§ 37 a § 38 – Záznam o odnětí věci (příloha č. 9)'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'kázeňské řízení', 'kázeňský přestupek', 'záznam', 'kázeňský trest'],
    summary: 'Předpis pro kázeňské řízení — běžný dozorce kázeňskou pravomoc nemá (vrchní dozorce u obviněných ano), ale záznam o přestupku sepsat může každý zaměstnanec.',
    practicalApplication: 'Sepsání záznamu o kázeňském přestupku a jeho předání, řešení domluvou a zápis do VIS.',
    fullLegalText: NGR_41_2024_FULL
  },
  {
    id: 'ngr-19-2023',
    code: 'NGŘ č. 19/2023',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o zbraňové službě, skladování zbraní a střelecké přípravě',
    shortTitle: 'Zbraňová služba a střelecká příprava (NGŘ 19/2023)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    scope: 'Stanoví bezpečnostní pravidla manipulace se služebními zbraněmi (CZ 75 B, CZ Scorpion EVO 3A1, brokovnice), jejich ukládání a provádění cvičných střeleb.',
    keyProvisions: [
      'Zbraňová bezpečnost: se zbraní se vždy zachází jako s nabitou, hlaveň míří do bezpečného prostoru',
      'Ukládání zbraní ve zbrojnici: vybité, kohout vypuštěn, zásobník mimo zbraň, uzamčeno v trezoru',
      'Postup při závadách na zbrani: klepni, natáhni, pokračuj (TAP-RACK)'
    ],
    importanceForZOP: 'Vysoký',
    tags: ['NGŘ', 'zbraně', 'střelba', 'CZ 75 B', 'Scorpion EVO 3', 'bezpečnost'],
    summary: 'Zbraňový předpis pro předmět Služební příprava.',
    practicalApplication: 'Vydávání a přebírání zbraní ve zbrojnici před nástupem do služby a na eskorty.',
    reviewNote: 'Číslo, název ani obsah tohoto NGŘ nejsou v podkladech ze závěrečných zkoušek. Nahrajte platné znění, nebo záznam odeberte.',
    fullLegalText: NGR_19_2023_FULL
  },

  // --- NGŘ, o kterých víme, ale jejich text v aplikaci zatím není ----------
  //
  // Doplněno podle lektora (2026-09-30). Úplný název, účinnost a text se
  // doplní nahráním souboru v Katalogu předpisů; nic z toho se tu nevymýšlí.
  {
    id: 'ngr-2-2026',
    code: 'NGŘ č. 2/2026',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o zaměstnancích a příslušnících Vězeňské služby České republiky zabezpečujících výkon vazby, výkon trestu odnětí svobody a výkon zabezpečovací detence',
    shortTitle: 'Dozorčí služba – výkon vazby a trestu (NGŘ 2/2026)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '1. 3. 2026',
    scope: 'Organizace, činnost a úkoly zaměstnanců a příslušníků oddělení výkonu vazby, výkonu trestu a výkonu zabezpečovací detence, dozorčí stanoviště, denní rozkaz a pochůzková kontrolní činnost. Zrušilo NGŘ č. 2/2022 a jeho novelu NGŘ č. 35/2023.',
    keyProvisions: [
      '§ 3 – Společné úkoly všech zaměstnanců oddělení (hlášení atypického chování a mimořádných událostí, pochůzková kontrolní činnost)',
      '§ 4 – Společné povinnosti příslušníků dozorčí služby (převzetí stanoviště, Kniha předání a převzetí služby, ochranné rukavice při prohlídkách)',
      '§ 29 a § 64 – Dozorce oddělení výkonu vazby i trestu je přímo podřízen vrchnímu inspektorovi dozorčí služby',
      '§ 33 odst. 3 – Dozorce v oddílu cel obviněných převezme při nástupu klíče od cel, prověří uzamčení cel a spojovací a signálně zabezpečovací prostředky',
      '§ 60 až § 62 – Vrchní inspektor dozorčí služby je přímo podřízen určenému zástupci vedoucího oddělení; inspektor dozorčí služby vrchnímu inspektorovi',
      '§ 71 a § 72 – Dozorce v krizovém a v uzavřeném oddílu',
      '§ 106 až § 109 – Dozorčí stanoviště, denní rozkaz, závazný pokyn, rozdílení a střídání směn',
      'Příloha č. 2 – Standardní intervaly pochůzkové kontrolní činnosti'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'dozorčí služba', 'dozorce', 'výkon vazby', 'výkon trestu', 'pochůzková kontrola'],
    summary: 'Platný předpis pro dozorčí službu na odděleních výkonu vazby, trestu a zabezpečovací detence. Oproti NGŘ č. 2/2022 je jinak očíslovaný a dozorce je nově přímo podřízen vrchnímu inspektorovi dozorčí služby.',
    practicalApplication: 'Nástup do služby a převzetí stanoviště, kontrola cel a vězněných osob, zápisy do Knihy předání a převzetí služby, intervaly pochůzkových kontrol.',
    fullLegalText: NGR_02_2026_FULL
  },
  {
    id: 'ngr-14-2026',
    code: 'NGŘ č. 14/2026',
    title: 'NGŘ č. 14/2026 – mimořádné události',
    shortTitle: 'Mimořádné události (NGŘ 14/2026)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    scope: 'Mimořádné události.',
    keyProvisions: [],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'mimořádné události', 'k doplnění'],
    summary: '',
    practicalApplication: '',
    reviewNote: 'Doplňte úplný název, účinnost a nahrajte text NGŘ. Nahradilo NGŘ č. 16/2022; dokud tu text není, berte výklad podle starého nařízení jen orientačně.',
    fullLegalText: ''
  },
  {
    id: 'ngr-12-2025',
    code: 'NGŘ č. 12/2025',
    title: 'NGŘ č. 12/2025 – Oddělení prevence a stížností (OPaS)',
    shortTitle: 'Oddělení prevence a stížností (NGŘ 12/2025)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    scope: 'Oddělení prevence a stížností (OPaS).',
    keyProvisions: [],
    importanceForZOP: 'Vysoký',
    tags: ['NGŘ', 'OPaS', 'prevence', 'stížnosti', 'k doplnění'],
    summary: '',
    practicalApplication: '',
    reviewNote: 'Doplňte úplný název, účinnost a nahrajte text NGŘ.',
    fullLegalText: ''
  },
  {
    id: 'ngr-21-2026',
    code: 'NGŘ č. 21/2026',
    title: 'NGŘ č. 21/2026 – fyzické napadení a jeho řešení (přesný název doplňte)',
    shortTitle: 'Fyzické napadení (NGŘ 21/2026)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    scope: 'Fyzické napadení a řešení těchto situací.',
    keyProvisions: [],
    importanceForZOP: 'Vysoký',
    tags: ['NGŘ', 'fyzické napadení', 'násilí', 'k doplnění'],
    summary: '',
    practicalApplication: '',
    reviewNote: 'Doplňte přesný název, účinnost a nahrajte text NGŘ. Ověřte, zda nenahrazuje NGŘ č. 24/2022 o předcházení násilí; pokud ano, vyberte ho v editoru v poli „Nahrazuje předpis“.',
    fullLegalText: ''
  },

  {
    id: 'ngr-24-2025',
    code: 'NGŘ č. 24/2025',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o dočasném odděleném ubytování odsouzených s prodlouženou dobou uzamykání',
    shortTitle: 'Dočasné oddělené ubytování (NGŘ 24/2025)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    scope: 'Umístění odsouzeného odděleně s prodlouženou dobou uzamykání podle § 50 odst. 2 vyhlášky č. 345/1999 Sb. na nejvýše 72 hodin: kdo rozhoduje, z jakých důvodů, komu se hlásí a jak se eviduje. Účinné dnem následujícím po vyhlášení; zrušilo NGŘ č. 47/2005 o samostatném ubytování odsouzených.',
    keyProvisions: [
      '§ 2 písm. d) – Dočasné oddělené ubytování nejdéle 72 hodin od rozhodnutí',
      '§ 4 odst. 1 – Rozhoduje ředitel věznice a stanoví zvýšený interval kontrol, nejvýše 60 minut',
      '§ 4 odst. 2 – Pět výjimečných důvodů (zákrok, neobjasněný závažný kázeňský přestupek, působení na jiné, po použití donucovacího prostředku nebo zbraně, ochrana života a zdraví)',
      '§ 4 odst. 3 – Mimo dobu služby se hlásí vrchnímu inspektoru strážní služby a zároveň inspektoru dozorčí služby',
      '§ 5 odst. 1 – Bez hromadných akcí, strava donáškou, vycházka 1 hodinu denně, denní návštěva určeného zaměstnance',
      '§ 6 a § 7 – Zápisy do informačního systému a Knihy hlášení o předání a převzetí služby'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'oddělené ubytování', 'prodloužená doba uzamykání', '72 hodin', 'kázeň'],
    summary: 'Výjimečné oddělení odsouzeného s prodlouženou dobou uzamykání na nejvýše 72 hodin rozhodnutím ředitele věznice, s kontrolami nejméně jednou za 60 minut.',
    practicalApplication: 'Hlášení důvodu (mimo dobu služby VISS a IDS), kontroly odděleně ubytovaného odsouzeného ve stanoveném intervalu a zápisy do knih.',
    fullLegalText: NGR_24_2025_FULL
  },
  {
    id: 'ngr-43-2015',
    code: 'NGŘ č. 43/2015',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o služebních stejnokrojích a naturálních náležitostech příslušníků Vězeňské služby České republiky',
    shortTitle: 'Služební stejnokroje a výstroj (NGŘ 43/2015)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '15. 10. 2015',
    scope: 'Druhy, vzhled, označení a pravidla nošení služebních stejnokrojů a poskytování výstrojních náležitostí (výstrojní konto, oděvné, vracení výstroje).',
    keyProvisions: [
      '§ 2 – Druhy stejnokrojů (základní, společenský, polní, pracovní, speciální aj.)',
      '§ 4 odst. 2 – Barvy košil a domovenky „VĚZEŇSKÁ STRÁŽ“ a „JUSTIČNÍ STRÁŽ“',
      '§ 7 – Služební šňůry: žluté pro vrchní inspektory, bílé pro inspektory',
      '§ 11 – Vázací kravatu nenosí příslušník ve styku s vězněnými osobami; při eskortě jednotná ústroj',
      '§ 21 a § 24 – Výstrojní konto (15 Kč denně) a oděvné (2 000 Kč / 4 000 Kč ročně)'
    ],
    importanceForZOP: 'Vysoký',
    tags: ['NGŘ', 'stejnokroj', 'výstroj', 'ústrojová kázeň', 'oděvné'],
    summary: 'Co a jak příslušník nosí ve službě a jak funguje jeho výstrojní konto a oděvné.',
    practicalApplication: 'Správná ústroj ve službě a při eskortě, označení funkce šňůrou, čerpání výstroje.',
    fullLegalText: NGR_43_2015_FULL
  },
  {
    id: 'ngr-15-2018',
    code: 'NGŘ č. 15/2018',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR o vzdělávání ve Vězeňské službě České republiky',
    shortTitle: 'Vzdělávání ve VS ČR a ZOP (NGŘ 15/2018)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '15. 4. 2018',
    scope: 'Systém vzdělávání ve VS ČR: vstupní vzdělávání úvodní a následné (ZOP), typy ZOP, zařazování, ukončení, služební zkouška a pravomoc ředitele Akademie. Změněno NGŘ č. 3/2019 a č. 5/2020.',
    keyProvisions: [
      '§ 4 – Vstupní vzdělávání úvodní končí nejpozději do tří měsíců',
      '§ 5 – ZOP je kvalifikačním požadavkem; končí nejpozději do 12 měsíců od vzniku poměru',
      '§ 8 – Typy ZOP (A pro příslušníky, B/1–B/4 a I pro zaměstnance)',
      '§ 10 odst. 3 – Po více než 60 měsících od skončení poměru se ZOP opakuje',
      '§ 14 – Neúspěch u závěrečné zkoušky je důvodem ke služebnímu hodnocení s neuspokojivým závěrem',
      '§ 20 – Praktická příprava (zpravidla 2,5 roku) a služební zkouška'
    ],
    importanceForZOP: 'Vysoký',
    tags: ['NGŘ', 'vzdělávání', 'ZOP', 'Akademie', 'služební zkouška'],
    summary: 'Pravidla vzdělávání od nástupu přes ZOP až po služební zkoušku, včetně lhůt a důsledků neúspěchu.',
    practicalApplication: 'Posluchač ZOP A z něj ví, do kdy musí ZOP absolvovat a co znamená neúspěch nebo nenastoupení.',
    fullLegalText: NGR_15_2018_FULL
  },
  {
    id: 'ngr-38-2018',
    code: 'NGŘ č. 38/2018',
    title: 'Nařízení generálního ředitele Vězeňské služby ČR, kterým se upravují pravidla služební zdvořilosti a pořadová příprava ve Vězeňské službě České republiky',
    shortTitle: 'Služební zdvořilost a pořadová příprava (NGŘ 38/2018)',
    type: 'ngr',
    authority: 'Generální ředitelství VS ČR',
    scope: 'Vzhled příslušníka, zdravení a vzdávání pocty, povely a pořadová příprava, hlášení nadřízenému a chování ve stejnokroji. Účinné patnáctým dnem od vyhlášení.',
    keyProvisions: [
      '§ 3 – Vzhled příslušníka (vlasy, piercing, tetování, šperky)',
      '§ 4 – Zdravení; podřízený a nižší hodnost zdraví první',
      '§ 7 – Kdy příslušník nezdraví (zákrok, řízení vozidla, stanoviště se zbraní v ponosu)',
      '§ 9 – Povely „POZOR!“, „POHOV!“, „VOLNO!“, „ZPĚT!“',
      '§ 19 – Hlášení nadřízenému jen jednou při prvním příchodu; poděkování „Sloužím vlasti“',
      '§ 28 – Nevhodné chování ve stejnokroji'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['NGŘ', 'služební zdvořilost', 'pořadová příprava', 'zdravení', 'hlášení'],
    summary: 'Jak příslušník vypadá, zdraví, hlásí se nadřízenému a vykonává povely.',
    practicalApplication: 'Hlášení při příchodu nadřízeného na stanoviště, zdravení a pořadová příprava v ZOP.',
    fullLegalText: NGR_38_2018_FULL
  },
  {
    id: 'pokyn-11-2020',
    code: 'Pokyn GŘ č. 11/2020',
    title: 'Pokyn generálního ředitele Vězeňské služby ČR, kterým se vyhlašuje Metodika činnosti příslušníků vězeňské stráže při kontrole osob a vozidel na vchodech a vjezdech do střežených objektů',
    shortTitle: 'Kontrola osob a vozidel na vstupu (Pokyn GŘ 11/2020)',
    type: 'instrukce',
    authority: 'Generální ředitelství VS ČR',
    scope: 'Jednotný postup vězeňské stráže na vchodech a vjezdech: vstupní a vjezdový koš, detekční rám, rentgen, ruční detektor kovů, detektor tepové frekvence. Účinný dnem vyhlášení.',
    keyProvisions: [
      'Metodika čl. II bod 3) – Úkoly strážného a druhého strážného',
      'Metodika čl. II bod 4) – Ve vstupním koši se nesmí současně otevřít vstupní dveře a dveře do objektu',
      'Metodika čl. II bod 4) – Při nálezu nedovolené věci se ihned informuje vrchní inspektor strážní služby',
      'Metodika čl. II bod 5) – Kdo odmítne uložit zbraň nebo telefon, nevstoupí; sepíše se služební záznam',
      'Metodika čl. III bod 3) – Ve vjezdovém koši zpravidla jedno vozidlo, brány se neotevírají současně'
    ],
    importanceForZOP: 'Klíčový (ZOP A)',
    tags: ['Pokyn GŘ', 'vězeňská stráž', 'vstupní koš', 'kontrola vozidel', 'detekční rám'],
    summary: 'Závazný postup strážného při kontrole osob, zavazadel a vozidel na vstupu do věznice.',
    practicalApplication: 'Služba na hlavním vchodu a vjezdu: odbavení osob a vozidel, kdy odmítnout vstup a koho informovat.',
    fullLegalText: POKYN_11_2020_FULL
  },
  {
    id: 'pokyn-4-2016',
    code: 'Pokyn GŘ č. 4/2016',
    title: 'Pokyn generálního ředitele Vězeňské služby ČR, kterým se stanoví informační systém ETŘ jako elektronický systém spisové služby Vězeňské služby České republiky',
    shortTitle: 'Spisová služba ETŘ (Pokyn GŘ 4/2016)',
    type: 'instrukce',
    authority: 'Generální ředitelství VS ČR',
    effectiveFrom: '1. 9. 2016',
    scope: 'Elektronická spisová služba VS ČR v systému ETŘ: evidence dokumentů, role, přístupová oprávnění a jejich logování.',
    keyProvisions: [
      '§ 5 – V ETŘ se evidují veškeré dokumenty VS (ne utajované)',
      '§ 11 – Povinnosti uživatelů a vedoucích zaměstnanců',
      '§ 15 – Každý přístup a náhled na dokument se automaticky zaznamenává',
      '§ 17 – Oprávnění jen v rozsahu nezbytném pro konkrétní úkol'
    ],
    importanceForZOP: 'Informační',
    tags: ['Pokyn GŘ', 'spisová služba', 'ETŘ', 'přístupová oprávnění'],
    summary: 'Zavádí ETŘ jako jediný elektronický systém spisové služby VS ČR.',
    practicalApplication: 'Práce s dokumenty v ETŘ jen v rozsahu vlastních oprávnění; přístupy jsou logovány.',
    fullLegalText: POKYN_4_2016_FULL
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
