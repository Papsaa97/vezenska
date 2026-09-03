export interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  iconName: string;
  badgeColor: string;
  accentColor: string;
  description: string;
  legalFramework: string[];
  keyTopics: string[];
  examRequirements: string;
}

export const subjectsMeta: Record<string, SubjectInfo> = {
  'Právo': {
    id: 'pravo',
    name: 'Právo',
    code: 'PRV',
    iconName: 'Scale',
    badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    accentColor: 'indigo',
    description: 'Základní právní odvětví nezbytná pro výkon služby příslušníka VS ČR. Zahrnuje trestní právo hmotné i procesní, zákon o Vězeňské službě a justiční stráži, služební poměr příslušníků bezpečnostních sborů, soudnictví ve věcech mládeže a Probační a mediační službu.',
    legalFramework: [
      'Zákon č. 40/2009 Sb., trestní zákoník',
      'Zákon č. 141/1961 Sb., o trestním řízení soudním (trestní řád)',
      'Zákon č. 555/1992 Sb., o Vězeňské službě a justiční stráži ČR',
      'Zákon č. 361/2003 Sb., o služebním poměru příslušníků bezpečnostních sborů',
      'Zákon č. 218/2003 Sb., o soudnictví ve věcech mládeže',
      'Zákon č. 257/2000 Sb., o Probační a mediační službě'
    ],
    keyTopics: [
      'Trestní právo hmotné (okolnosti vylučující protiprávnost, nepříčetnost, hranice škod § 138)',
      'Trestní právo procesní (důvody vazby § 67 TrŘ, stádia trestního řízení, zadržení § 76)',
      'Zákon o VS a JS ČR (členění, řízení, základní oprávnění a povinnosti)',
      'Služební poměr (vznik, zánik, kázeňská pravomoc, hodnosti)',
      'Soudnictví ve věcech mládeže (provinění, opatření, věkové hranice)',
      'Probační a mediační služba (spolupráce s VS ČR při podmíněném propuštění)'
    ],
    examRequirements: 'Ústní i písemná zkouška před zkušební komisí Akademie VS ČR. Důraz na aplikaci § 28, § 29 TZ a § 6, § 17–22 z. 555/1992 Sb.'
  },
  'Bezpečnostní služba': {
    id: 'bezpecnostni-sluzba',
    name: 'Bezpečnostní služba',
    code: 'BEZ',
    iconName: 'Shield',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    accentColor: 'blue',
    description: 'Taktika a výkon strážní služby, dozorčí služby, Justiční stráže a eskortních činností. Pravidla vstupu osob a vjezdu vozidel, provádění osobních a technických prohlídek a řešení mimořádných událostí.',
    legalFramework: [
      'Zákon č. 555/1992 Sb., o Vězeňské službě a justiční stráži ČR',
      'NGŘ č. 33/2019, o strážní, dozorčí a eskortní službě',
      'NGŘ č. 2/2026, o pravidlech vstupu a vjezdu do objektů VS ČR',
      'Instrukce MS ČR č. 8/2022, o Justiční stráži',
      'Směrnice pro provádění prohlídek ve věznicích VS ČR'
    ],
    keyTopics: [
      'Strážní služba u vchodu a na strážních věžích (PPZZ, propusťový režim)',
      'Dozorčí služba na ubytovnách a pracovištích vězňů',
      'Justiční stráž (ochrana soudů a státních zastupitelství, úschova zbraní, doručování)',
      'Eskortní služba a přeprava osob (soudní eskorty, nemocnice, přeprava cenin)',
      'Provádění prohlídek (dílčí 90 dnů, technické, důkladné osobní prohlídky)',
      'Postupy při mimořádných událostech (útěk, oběšení, napadení)'
    ],
    examRequirements: 'Praktické prověření modelových situací na trenažéru + písemný test znalostí NGŘ a taktických postupů.'
  },
  'Penologie': {
    id: 'penologie',
    name: 'Penologie',
    code: 'PEN',
    iconName: 'Building2',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    accentColor: 'emerald',
    description: 'Věda o trestu a výkonu trestu odnětí svobody a vazby. Metodika SARPO, tvorba Programu zacházení, diferenciace věznic, prevence násilí mezi vězni, specifika výkonu zabezpečovací detence a resocializace.',
    legalFramework: [
      'Zákon č. 169/1999 Sb., o výkonu trestu odnětí svobody',
      'Zákon č. 293/1993 Sb., o výkonu vazby',
      'Zákon č. 129/2008 Sb., o výkonu zabezpečovací detence',
      'NGŘ č. 24/2022, o předcházení násilí mezi vězněnými osobami',
      'NGŘ č. 41/2024, o kázeňském řízení s vězněnými osobami'
    ],
    keyTopics: [
      'Diferenciace věznic (ostraha – nízký, střední, vysoký stupeň vs. zvýšená ostraha)',
      'Program zacházení (5 oblastí: práce, vzdělávání, spec. výchova, zájmy, vztahy)',
      'Diagnostika SARPO (analýza rizik a kriminogenních potřeb)',
      'Kázeňská pravomoc, tresty (§ 46) a odměny (§ 45)',
      'Prevence násilí a rizikové kategorie (STH, NMU, MON, MPN, DVO, DVO-P)',
      'Výkon vazby (standardní a zmírněný režim) a zabezpečovací detence'
    ],
    examRequirements: 'Schopnost vyhodnotit penitenciární situaci, zařazení odsouzeného a návrh vhodných výchovných či bezpečnostních opatření.'
  },
  'Služební příprava': {
    id: 'sluzebni-priprava',
    name: 'Služební příprava',
    code: 'SLP',
    iconName: 'Crosshair',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    accentColor: 'amber',
    description: 'Zákonné podmínky a taktika použití donucovacích prostředků a zbraně. Střelecká a zbraňová příprava (pistole CZ 75 B / CZ P-10 C, samopal Scorpion EVO 3A1) a taktická sebeobrana.',
    legalFramework: [
      '§ 17 až § 23 zákona č. 555/1992 Sb. (DP a použití zbraně)',
      'Předpis pro střeleckou přípravu a bezpečnost manipulace se zbraněmi',
      'Metodika taktické sebeobrany Akademie VS ČR',
      'Bezpečnostní směrnice pro manipulaci se zbraněmi na stanovišti'
    ],
    keyTopics: [
      'Katalog donucovacích prostředků (§ 17 z. 555/1992 Sb.) a jejich subsidiarita',
      'Zákonná omezení použití DP a zbraně (§ 21 – těhotné, staří, děti <15 let)',
      'Použití zbraně (§ 19, § 20) a povinnosti po střelbě (§ 22)',
      'Konstrukce a manipulace: CZ 75 B, CZ P-10 C, CZ Scorpion EVO 3A1, lapač střel',
      'Zbraňová bezpečnost: rána jistoty, kontrola komory, rozborka a sborka',
      'Hmaty, chvaty, údery a kopy, obrana proti noži a úderným zbraním'
    ],
    examRequirements: 'Praktická střelba, bezpečná manipulace na čas, předvedení hmatů, chvatů a modelového zákroku s DP.'
  },
  'Psychologie': {
    id: 'psychologie',
    name: 'Psychologie',
    code: 'PSY',
    iconName: 'Brain',
    badgeColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    accentColor: 'rose',
    description: 'Penitenciární a sociální psychologie, krizová komunikace, verbální deeskalace, prevence suicidiálního jednání, rozpoznání manipulace odsouzených a prevence syndromu vyhoření u příslušníků.',
    legalFramework: [
      'Metodika krizové intervence a prevence sebevražd VS ČR',
      'Listina základních práv a svobod (čl. 1–4, 7, 8)',
      'Evropská vězeňská pravidla (EPR)'
    ],
    keyTopics: [
      'Sociální percepce, první dojem a Halo efekt v kontaktu s pachateli',
      'Rozlišení automutilace (sebepoškozování) a suicidia (sebevraždy)',
      'Ringelův presuicidální syndrom a včasné varovné signály',
      'Prizonizace a institucionalismus u dlouhodobě trestaných osob',
      'Asertivní techniky (poškrábaná deska) a taktická deeskalace konfliktů',
      'Syndrom vyhoření (fáze a psychohygiena)'
    ],
    examRequirements: 'Zvládnutí krizového rozhovoru, psychologická typologie vězněných osob a řešení modelového konfliktu.'
  },
  'Zdravověda a první pomoc': {
    id: 'zdravoveda',
    name: 'Zdravověda a první pomoc',
    code: 'ZDR',
    iconName: 'HeartPulse',
    badgeColor: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    accentColor: 'rose',
    description: 'Neodkladná přednemocniční první pomoc a zdravotnická příprava personálu VS ČR. Postupy TCCC (Tactical Combat Casualty Care), KPR s použitím AED, zástava masivního krvácení škrtidlem CAT, řešení intoxikací a předávkování, zásah u oběšení, popálenin a akutních stavů.',
    legalFramework: [
      'Doporučené postupy Evropské resuscitační rady (ERC Guidelines)',
      'Mezinárodní taktický standard TCCC (Tactical Combat Casualty Care)',
      'Metodický pokyn zdravotnické služby VS ČR pro poskytování první pomoci',
      'Zákon č. 372/2011 Sb., o zdravotních službách (§ 49 poskytnutí PP)'
    ],
    keyTopics: [
      'TCCC algoritmus (MARCHE: Massive bleeding, Airway, Respiration, Circulation, Hypothermia)',
      'Zástava masivního tepenného krvácení: turniket / CAT škrtidlo, tlakový obvaz, wound packing',
      'Kardiopulmonální resuscitace KPR dospělého (poměr 30:2, 100–120/min) a obsluha AED',
      'Penetrující poranění hrudníku (Chest Seal, ventilová chlopeň, tenzní pneumotorax)',
      'Zásah u oběšení (odříznutí se zajištěním těla, uvolnění smyčky, okamžitá KPR)',
      'Intoxikace OPL a předávkování opioidy (aplikace Naloxonu / Nyxoidu, monitorace)',
      'Epileptický záchvat, anafylaxe (EpiPen), FAST test při mrtvici, pravidlo 5T při šoku'
    ],
    examRequirements: 'Praktické předvedení KPR s AED na trenažéru, správná aplikace turniketu CAT do 30 sekund a vyřešení modelové kazuistiky akutního stavu.'
  },
  'Pedagogika': {
    id: 'pedagogika',
    name: 'Pedagogika',
    code: 'PED',
    iconName: 'GraduationCap',
    badgeColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    accentColor: 'teal',
    description: 'Základy obecné, speciální a penitenciární pedagogiky. Zahrnuje výchovné principy a metody, etopedii, práci s mentálně retardovanými či jinak specifickými osobami a aplikaci Programu zacházení a kázeňské praxe ve vězeňství.',
    legalFramework: [
      'Zákon č. 109/2002 Sb., o výkonu ústavní výchovy',
      'Zákon č. 169/1999 Sb., o výkonu trestu odnětí svobody'
    ],
    keyTopics: [
      'Základní pedagogické principy a prostředky výchovy',
      'Speciální pedagogika, integrace a poruchy chování (etopedie)',
      'Penitenciární pedagogika, metody a prostředky',
      'Program zacházení (SARPO, aktivity)',
      'Kázeň (odměny, tresty, režim)'
    ],
    examRequirements: 'Znalost základních pedagogických pojmů a postupů s důrazem na aplikaci v penitenciárním prostředí (programy zacházení, kázeň).'
  },
  'Vězeňská administrativa': {
    id: 'vezenska-administrativa',
    name: 'Vězeňská administrativa',
    code: 'ADM',
    iconName: 'FileText',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    accentColor: 'amber',
    description: 'Elektronická spisová služba ETŘ, Vězeňský informační systém VIS, tvorba a náležitosti úředních písemností VS ČR (Služební záznam, Záznam o použití DP, Záznam o kázeňském přestupku, Záznam o odnětí věci, Záznam o zjištění fyzického násilí) a pravidla ochrany osobních údajů.',
    legalFramework: [
      'Pokyn generálního ředitele VS ČR č. 4/2016 (systém ETŘ)',
      'Zákon č. 499/2004 Sb., o archivnictví a spisové službě',
      'Vyhláška č. 259/2012 Sb., o podrobnostech výkonu spisové služby',
      'NGŘ č. 41/2024 (§ 16 Zpracování záznamu o kázeňském přestupku)',
      'Příloha k PGŘ č. 3/2024 (Záznam o použití donucovacího prostředku)',
      'NGŘ č. 24/2022 (Záznam o zjištění fyzického násilí a ponižujícího jednání)',
      'Zákon č. 555/1992 Sb., o VS a JS ČR (§ 12, § 20, § 23a evidence a informace)',
      'Zákon č. 101/2000 Sb. a GDPR (ochrana osobních údajů ve VIS)'
    ],
    keyTopics: [
      'Struktura čísla jednacího ČJ v ETŘ (VS - pořadí - dok / typ spisu - rok - kód OJ 80XXXX - rozlišení)',
      'Postup založení spisu a pravidlo přidělení hlavnímu zpracovateli',
      'Hierarchie změny typu spisu (ČJ → PŘ → TČ) a pravidla slučování spisů',
      'Skartační řízení a spisové znaky (S – stoupa, V – výběr, A – archiv)',
      'Informační systém VIS a evidenční stavy (kmenový, administrativní, fyzický)',
      'Pravidla poskytování informací a telefonické lustrace (3měsíční heslo GŘ)',
      'Náležitosti a tvorba Záznamu o použití DP, ZKP, SZ, Odnětí věci a Fyzického násilí',
      '7 zlatých pravidel úředního stylu písemností (spisovnost, 1. os. j. č., zákaz neurčitých výrazů)'
    ],
    examRequirements: 'Zvládnutí práce se spisem v ETŘ, bezchybné vyhotovení úředních záznamů (SZ, ZKP, DP) v souladu s metodikou a znalost právních limitů poskytování informací z VIS.'
  },
  'Profesní etika': {
    id: 'profesni-etika',
    name: 'Profesní etika',
    code: 'ETK',
    iconName: 'HeartHandshake',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    accentColor: 'emerald',
    description: 'Etické základy výkonu služby v bezpečnostním sboru, teorie normativních systémů (mravnost, morálka, právo), axiologie a deontologie. Protikorupční program VS ČR (NGŘ č. 28/2018 Sb.), Kodex profesní etiky, matice a katalogy korupčních rizik, mezinárodní konvence ochrany lidských práv (EVP Rec(2006)2-rev, Mandelova pravidla OSN), instituce ochrany LP (ESLP, CPT, Veřejný ochránce práv) a etika použití zbraně.',
    legalFramework: [
      'Příloha č. 6 k NGŘ č. 28/2018 Sb., Kodex profesní etiky zaměstnance a příslušníka VS ČR',
      'NGŘ č. 28/2018 Sb., Interní protikorupční program VS ČR a Katalogy korupčních rizik',
      'Doporučení Rec(2006)2-rev Výboru ministrů k Evropským vězeňským pravidlům (rev. 2020)',
      'Standardní minimální pravidla OSN pro zacházení s vězni (Mandelova pravidla 2015)',
      'Listina základních práv a svobod (ústavní zákon č. 2/1993 Sb.)',
      'Ústava České republiky (ústavní zákon č. 1/1993 Sb.)',
      'Zákon č. 555/1992 Sb., o Vězeňské službě a justiční stráži ČR (§ 6, § 11, § 18–20, § 23a)',
      'Zákon č. 40/2009 Sb., trestní zákoník (§ 331–333 úplatkářství, § 329 zneužití pravomoci)'
    ],
    keyTopics: [
      'Normativní systémy: mravnost (svědomí), morálka (společenské sankce), právo (státní donucení)',
      'Axiologie (třídění hodnot, hodnotový žebříček) a deontologie (nauka o povinnostech)',
      'Deformace hodnotového systému u pachatelů (bio-psycho-sociálně-spirituální model)',
      'Kodex profesní etiky VS ČR (8 článků a Desatero etických zásad)',
      'Interní protikorupční program a výpočet míry rizika (Pravděpodobnost 1–5 × Dopad 1–5)',
      'Formy korupce (úplatkářství, nepotismus, klientelismus, komoditizace informací)',
      'Ochrana oznamovatelů (whistleblowing bez přímých či nepřímých represí)',
      'Evropská vězeňská pravidla (EVP) a standardy ubytování, hygieny, stravování a samovazby',
      'Instituce na ochranu LP: ESLP Štrasburk, CPT Štrasburk, Výbor OSN Ženeva, Veřejný ochránce práv',
      'Etika a deontologie použití střelné zbraně (§ 18 z. 555/1992 Sb. vs. imperativ „Nezabiješ“)',
      'Genderový kontext osobních prohlídek (2 příslušníci stejného pohlaví, intimní jen lékař)',
      'Duchovní péče ve vězeňství (VDP z.s. dobrovolníci, VDS kaplani VS ČR, dohody ČBK, ERC a NSSJ)'
    ],
    examRequirements: 'Ústní i písemný test (50 otázek). Schopnost etické analýzy situací, aplikace Kodexu etiky a znalost mezinárodních standardů LP.'
  }
};
