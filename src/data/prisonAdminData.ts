/**
 * Výchozí obsah záložky Vězeňská administrativa.
 *
 * Dřív byl natvrdo v komponentách (PrisonAdministration, PrisonAdminETR,
 * PrisonAdminVIS, PrisonAdminStyleRules). Lektor a správce ho teď mění přes
 * překryv content_blocks — druhy 'admin_template', 'admin_exercise'
 * a 'study_section' (migrace 042). Tenhle soubor zůstává výchozí podobou,
 * ke které se dá kdykoli vrátit.
 */
import { StudySection, StudySectionFields, sectionItem } from './studySections';

// ─── Generátor úředních záznamů ──────────────────────────────────────────────

// Human-readable labels for mandatory field keys, used to build validation messages.
export const FIELD_LABELS: Record<string, string> = {
  prisonName: 'Věznice & Adresa',
  refNumber: 'Číslo jednací (Č.j.)',
  officer: 'Zakročující příslušník',
  dutyOrder: 'Velení do služby rozkazem',
  targetPerson: 'Použito proti komu / Vězněná osoba',
  targetCode: 'Kód / identifikační kód vězněné osoby',
  datetimePlace: 'Datum, čas a místo použití DP',
  precedingEvents: 'Co předcházelo použití DP',
  officerAction: 'Popis jednání příslušníka (zákonná výzva)',
  targetBehavior: 'Popis jednání vězněné osoby',
  dpUsedDetails: 'Popis použitého donucovacího prostředku',
  injuryDamage: 'Škoda a zranění',
  firstAid: 'Poskytnutí první pomoci',
  medicalExam: 'Lékařské ošetření',
  bossInformed: 'Informování nadřízeného',
  photoDoc: 'Fotodokumentace',
  evaluation: 'Vyhodnocení zakročujícího příslušníka',
  departmentHeadOpinion: 'Stanovisko vedoucího oddělení',
  zrvReport: 'Zpráva o prošetření (1. ZŘV)',
  directorDecision: 'Rozhodnutí ředitele věznice',
  targetBirth: 'Datum narození',
  prisonType: 'Typ věznice / stupeň zabezpečení',
  actDescription: 'Popis skutku',
  targetStatement: 'Vyjádření podezřelého',
  evidenceList: 'Další důkazní prostředky',
  docTitle: 'Název záznamu',
  eventStory: 'Popis děje a zjištěné skutečnosti',
  actionsTimeline: 'Provedená opatření',
  witnesses: 'Svědci',
  datetime: 'Datum a čas odnětí věci',
  itemsList: 'Soupis odňatých věcí',
  seizureReason: 'Důvod odnětí věcí',
  surrenderedTo: 'Předání a naložení s věcí',
  housingCell: 'Ubytování (oddíl, cela)',
  officerReport: 'Opatření, informování IDS a VISS',
  signatureDate: 'Místo a datum podpisu',
  officerSignature: 'Podpisová doložka příslušníka',
  // Pole, které není povinné, ale formulář lektora ho u vzoru nabízí.
  cameraUsed: 'Použití osobní kamery'
};

// Cvičné vzory tiskopisů podle studijních podkladů akademie (neoficiální)
/**
 * Upravitelná část tiskopisu: popis a ukázkový vzor vyplnění.
 *
 * Rozvržení formuláře, tiskové podoby i seznam povinných polí patří kódu
 * (PrisonAdministration.tsx) — pro každý tiskopis je jiné a lektor by ho
 * formulářem stejně nepostavil. Proto tu povinná pole nejsou a leží zvlášť
 * v RECORD_TEMPLATE_MANDATORY_FIELDS: kdyby byla součástí uloženého obsahu,
 * úprava lektora by je „zmrazila“ a pozdější oprava v kódu by se k ní
 * nedostala.
 */
export interface RecordTemplate {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  normReference: string;
  /** Ukázkový vzor — hodnoty polí, které formulář předvyplní. */
  defaultData: Record<string, string>;
  affectedBodyPartsDefault?: string[];
}

export const defaultRecordTemplates: RecordTemplate[] = [
  {
    id: 'dp',
    title: 'Záznam o použití donucovacího prostředku',
    subtitle: 'Příloha k PGŘ č. 3/2024 a §§ 6, 17–20 zákona č. 555/1992 Sb.',
    badge: 'PGŘ č. 3/2024',
    normReference: '§ 6 odst. 3 písm. b), §§ 17–20 zákona č. 555/1992 Sb.',
    affectedBodyPartsDefault: ['hlava-oblicej', 'rameno-prave', 'zady-pouta', 'predlokti-prave'],
    defaultData: {
      prisonName: 'Věznice Ostrov, Vykmanov 22, 363 50 Ostrov',
      refNumber: 'VS-1234-1/ČJ-2024-801345-VYS',
      officer: 'pprap. Jan Mokrý, sl. č. 26 569, dozorce OVT',
      dutyOrder: '02.05.2024 / DR VOVT č. 19/2024 - 801345',
      cameraUsed: 'ANO',
      targetPerson: 'ods. Jan Čonka, nar. 18.09.2000, odsouzený',
      targetCode: '8G9R7T',
      datetimePlace: 'Dne 02.05.2024 v čase 18:10 hod. na oddíle UO, ubytovny č. 02 Věznice Ostrov na cele č. 5.',
      precedingEvents: 'Odsouzený začal demolovat zařízení cely č. 5 a opakovaně kopal do zdi a umyvadla. Přítomen byl prap. Josef Suchý.',
      officerAction: 'Dle § 6 odst. 3 písm. b) z. č. 555/1992 Sb. bylo odsouzenému nejprve domlouváno. Následně v 18:12 použita výstraha a zákonná výzva slovy: „Jménem zákona, vyzývám Vás, zanechte svého protiprávního jednání nebo proti Vám bude použito donucovacích prostředků.“',
      targetBehavior: 'Odsouzený na výzvy nereagoval, stupňoval agresi a křičel: „...pojďte do mě vy mrdky, už se těším až Vám rozbiju hubu!“ a v 18:15 rozbil umyvadlo.',
      dpUsedDetails: 'V čase 18:13 byl skrze výdejní okénko aplikován slzotvorný prostředek. V 18:16 vstup se štítem, natlačení na zeď cely, prap. Suchý za pomoci hmatů a chvatů (páka na rameno, podkopnutí nohou) svedl odsouzeného na podlahu na břicho a byla přiložena služební pouta za záda.',
      injuryDamage: 'U příslušníků ke zranění nedošlo. Odsouzený si způsobil řezné poranění na pravém předloktí cca 5 cm o rozbité umyvadlo. Škoda na majetku VS ČR: rozbité keramické umyvadlo na cele č. 5.',
      firstAid: 'V čase 18:18 hod. na cele č. 5 poskytnuta první pomoc prap. Suchým (ošetření a sterilní krytí řezné rány).',
      medicalExam: 'V 18:19 přivolána ZZS. V 18:45 převezen posádkou ZZS MUDr. Davidem Hedvábným k chirurgickému ošetření do Krajské nemocnice Karlovy Vary. Zpět eskortován ve 20:10 hod.',
      bossInformed: 'V čase 18:20 hod. byl osobně informován IDS ppor. Eduard Hebký.',
      photoDoc: 'Pořízena v čase 20:30 hod., pořídil VISS ppor. Milan Slizký.',
      witnesses: 'prap. Josef Suchý, sl. č. 25 014, dozorce OVT',
      evaluation: 'Ze svého pohledu považuji použití DP za nutné, neboť jsem se domníval, že jinak nelze zajistit bezpečnost mou ani okolí, a jednání odsouzeného bezprostředně předcházelo. Ve 20:20 byl odsouzený ubytován na KO, cela č. 7.',
      departmentHeadOpinion: 'Stanovisko vedoucího oddělení: Postup zakročujícího příslušníka pprap. Jana Mokrého odpovídal § 6 odst. 3 písm. b) a §§ 17–20 zákona č. 555/1992 Sb., zákonná výzva i použití slzotvorného prostředku a hmatů a chvatů byly přiměřené intenzitě útoku. Doporučuji uznat zákrok za oprávněný a přiměřený.',
      zrvReport: 'Zpráva o prošetření okolností a důvodů použití DP (1. ZŘV): Na základě prošetření záznamu, fotodokumentace a vyjádření svědka prap. Josefa Suchého bylo zjištěno, že k použití DP došlo v souladu se zákonem a vnitřními předpisy. Nebyly zjištěny skutečnosti nasvědčující excesu ani nepřiměřenosti zákroku.',
      directorDecision: 'Rozhodnutí ředitele věznice: Na základě stanoviska vedoucího oddělení a zprávy 1. ZŘV o prošetření okolností a důvodů podle Přílohy k PGŘ č. 3/2024 rozhoduji, že použití donucovacího prostředku dne 02.05.2024 bylo OPRÁVNĚNÉ A PŘIMĚŘENÉ.',
      signatureDate: 'V Ostrově nad Ohří dne 02.05.2024',
      officerSignature: 'v. ref. pprap. Jan Mokrý, sl. č. 26 569, dozorce OVT'
    }
  },
  {
    id: 'zkp',
    title: 'Záznam o kázeňském přestupku',
    subtitle: 'Dle NGŘ č. 41/2024 (§ 16) a zákona č. 169/1999 Sb. (§ 28)',
    badge: 'NGŘ č. 41/2024',
    normReference: '§ 16 NGŘ č. 41/2024, § 28 zákona č. 169/1999 Sb.',
    defaultData: {
      prisonName: 'Vězeňská služba České republiky / Věznice Stráž pod Ralskem',
      targetPerson: 'Jan Nováček',
      targetBirth: '16.06.2001',
      prisonType: 'OSTRAHA - oddělení s vysokým stupněm zabezpečení (VSZ)',
      actDescription: 'Dne 14.01.2024 v čase 10:01 jsem přistihl jmenovaného odsouzeného na ubytovně C, ložnici č. 211 Věznice Stráž pod Ralskem, jak spí na neustlaném lůžku v době určené pro denní činnost. Odsouzený musel být buzen. Po vstupu na ložnici nepovstal a užil vůči mně vulgarismu, cituji: „Švestko blbá, co mě budíš, nech mě spát.“ Při následné kontrole osobních věcí v přidělené skříňce odsouzeného na ložnici č. 211 v čase 10:10 byly dále nalezeny 2 šablony formátu A4 s motivem hada a nápisem A.C.A.B. určené k nepovolenému tetování.\n\nOdsouzený Jan Nováček je podezřelý ze spáchání kázeňského přestupku dle § 28 odst. 1 zákona č. 169/1999 Sb., tím že nedodržel stanovený pořádek a kázeň, nesplnil příkaz příslušníka a nedodržel zásady slušného jednání s osobou, se kterou přišel do styku, a dále dle § 28 odst. 3 písm. e) zákona č. 169/1999 Sb., kdy měl v držení pomůcky sloužící k tetování. Rovněž porušil Vnitřní řád Věznice Stráž pod Ralskem čl. 14.',
      targetStatement: '„Není to vůbec pravda, všichni si na mě zasedli.“',
      evidenceList: '1. Svědecká výpověď: vychovatel Bc. J. Ondráka\n2. Záznam o odnětí věci ze dne 14.01.2024 (2 ks šablon)\n3. Kamerový záznam chodby oddílu C ze dne 14.01.2024 v čase 10:00–10:15',
      signatureDate: 'Ve Stráži pod Ralskem dne 14.01.2024',
      officerSignature: 'Zpracoval: inspektor, prap. Jiří Červinka, sl. č. 29000, dozorce OVT'
    }
  },
  {
    id: 'sz',
    title: 'Služební záznam',
    subtitle: 'Základní úřední písemnost o mimořádné nebo evidenční události',
    badge: 'Obecný vzor',
    normReference: 'Zákon č. 555/1992 Sb., spisový řád VS ČR',
    defaultData: {
      prisonName: 'Vězeňská služba České republiky / Věznice Rýnovice',
      docTitle: 'SLUŽEBNÍ ZÁZNAM o nálezu nepovoleného předmětu při filcunku cely',
      dutyOrder: 'Dne 15.03.2024 jsem byl velen Denním rozkazem VO VS č. 45/2024 jako strážný na stanovišti dozorčího oddílu B v době od 06:00 do 18:00 hod.',
      eventStory: 'V čase 14:20 hod. jsem společně s prap. Petrem Kovářem prováděl technickou a bezpečnostní prohlídku ložnice č. 114 na oddíle B. Během prohlídky byl v dutině kovové nohy stolu nalezen ukrytý funkční mobilní telefon zn. Nokia černé barvy s vloženou SIM kartou a nabíjecím kabelem. Na ložnici byli v danou chvíli přítomni odsouzení K. M. (nar. 1995) a L. S. (nar. 1989). Na dotaz, komu telefon patří, oba shodně uvedli, že o předmětu nic nevědí.',
      actionsTimeline: '14:25 hod. – Telefon a příslušenství zajištěny dle § 12 zákona č. 555/1992 Sb.\n14:30 hod. – Událost ohlášena ISS-O a VISS npor. M. Veselému.\n14:40 hod. – Zpracován Záznam o odnětí věci.\n15:00 hod. – Předmět předán VISS k provedení forenzní expertizy a zjištění původu.',
      witnesses: 'prap. Petr Kovář, sl. č. 31 220, dozorce oddílu B',
      signatureDate: 'V Jablonci nad Nisou dne 15.03.2024',
      officerSignature: 'v. ref. strm. Bc. Jan Novák, DiS., sl. č. 12345, strážný'
    }
  },
  {
    id: 'odneti',
    title: 'Záznam o odnětí věci',
    subtitle: 'Dle § 12 odst. 1 a 2 zákona č. 555/1992 Sb.',
    badge: '§ 12 Z. 555/1992 Sb.',
    normReference: '§ 12 odst. 1 a 2 zákona č. 555/1992 Sb. o VS a JS ČR',
    defaultData: {
      prisonName: 'Věznice Mírov, 789 53 Mírov',
      datetime: 'Dne 14.03.2024 v čase 14:10 hod.',
      targetPerson: 'Jan Nohák, nar. 01.02.1990, odsouzený (typ věznice: ostraha)',
      itemsList: '1. 1 ks baterie do mobilního telefonu zn. NOKIA, výr. č. 7852140Z47\n2. 21 tablet oranžové barvy kulatého tvaru bez originálního balení (želatinové tobolky)\n3. 2 ks bankovek: 1x 1000 Kč (sér. číslo H 28201925), 1x 500 Kč (sér. číslo K 299329)\n4. 1 ks tetovací strojek vlastní výroby (motorek z magnetofonu, tělo z propisky, jehla z kytarové struny)\n5. 1 ks zavírací nůž s dřevěnou rukojetí a čepelí o délce 12 cm',
      seizureReason: 'Dne 14.03.2024 po skončení návštěvy byly u odsouzeného Jana Noháka při důkladné osobní prohlídce nalezeny výše uvedené předměty. Jelikož se jedná o věci, jejichž držení je vězněným osobám zákonem i Vnitřním řádem zakázáno, byly věci na místě odňaty dle § 12 odst. 1 zákona č. 555/1992 Sb.',
      surrenderedTo: 'Věci byly uloženy a předány: VISS ppor. P. Nový, sl. č. 15897',
      signatureDate: 'V Mírově dne 14.03.2024 v 14:20 hod.',
      officerSignature: 'Odnětí provedl: v. ref. strm. K. Peřina, sl. č. 19349'
    }
  },
  {
    id: 'nasilie',
    title: 'Záznam o zjištění fyzického násilí a ponižujícího jednání',
    subtitle: 'Příloha č. 1 k NGŘ č. 24/2022',
    badge: 'NGŘ č. 24/2022',
    normReference: 'NGŘ č. 24/2022 o postupu při zjištění násilí',
    defaultData: {
      prisonName: 'Věznice Valdice, Náměstí Míru 55, 507 11 Valdice',
      targetPerson: 'Josef Novák',
      targetCode: 'Y6X5C4',
      housingCell: 'Oddíl C, cela č. 205',
      eventStory: 'Dne 13.12.2022 v čase 15:30 hod. během koupání odsouzených z cel 203, 204 a 205 na umývárně č. 231 mi odsouzený Josef Novák sdělil, že byl dne 12.12.2022 v čase cca 20:00 hod. napaden jiným odsouzeným na kulturní místnosti č. 223, a to několika údery otevřenou dlaní pravé ruky do obličejové části hlavy (pravá a levá tvář). Jméno útočníka a důvod napadení odmítl sdělit. U odsouzeného byla na místě v 15:32 provedena prohlídka těla bez zjevných viditelných stop zranění.',
      officerReport: 'V čase 15:34 hod. informován IDS ppor. Jan Novák a VISS ppor. Josef Drobý. V 16:00 hod. zajištěna lékařská prohlídka na zdravotnickém středisku Věznice Valdice. Záznam postoupen k odbornému posouzení psychologovi a oddělení prevence a stížností.',
      signatureDate: 'Ve Valdicích dne 13.12.2022',
      officerSignature: 'dozorce OVT, prap. Daniel Nekonečný, sl. č. 24105'
    }
  }
];

/** Povinná pole každého tiskopisu (struktura formuláře, ne upravitelný obsah). */
export const RECORD_TEMPLATE_MANDATORY_FIELDS: Record<string, string[]> = {
  dp: ['prisonName', 'refNumber', 'officer', 'dutyOrder', 'targetPerson', 'targetCode', 'datetimePlace', 'precedingEvents', 'officerAction', 'targetBehavior', 'dpUsedDetails', 'injuryDamage', 'firstAid', 'medicalExam', 'bossInformed', 'photoDoc', 'evaluation', 'departmentHeadOpinion', 'zrvReport', 'directorDecision'],
  zkp: ['prisonName', 'targetPerson', 'targetBirth', 'prisonType', 'actDescription', 'targetStatement', 'evidenceList', 'signatureDate', 'officerSignature'],
  sz: ['prisonName', 'docTitle', 'dutyOrder', 'eventStory', 'actionsTimeline', 'witnesses', 'signatureDate', 'officerSignature'],
  odneti: ['prisonName', 'datetime', 'targetPerson', 'itemsList', 'seizureReason', 'surrenderedTo', 'signatureDate', 'officerSignature'],
  nasilie: ['prisonName', 'targetPerson', 'targetCode', 'housingCell', 'eventStory', 'officerReport', 'signatureDate', 'officerSignature'],
};

// Selectable body-part zones for the DP body-scheme widget.
export interface BodyPart {
  id: string;
  label: string;
}

export const BODY_PARTS: BodyPart[] = [
  { id: 'hlava-oblicej', label: 'Hlava & Obličej' },
  { id: 'krk', label: 'Krk' },
  { id: 'hrudnik', label: 'Hrudník' },
  { id: 'bricho', label: 'Břicho' },
  { id: 'rameno-leve', label: 'Levé rameno' },
  { id: 'rameno-prave', label: 'Pravé rameno' },
  { id: 'predlokti-leve', label: 'Levé předloktí' },
  { id: 'predlokti-prave', label: 'Pravé předloktí' },
  { id: 'zady-pouta', label: 'Záda (přiložení pout)' },
  { id: 'bedra', label: 'Bedra' },
  { id: 'stehna', label: 'Stehna' },
  { id: 'kotniky-nohy', label: 'Kotníky & Nohy' }
];

// ─── 7 pravidel úředního stylu: cvičení hledání chyb ─────────────────────────

export interface StyleExerciseSegment {
  id: number;
  text: string;
  isError: boolean;
  correction: string;
}

export interface StyleExercise {
  id: string;
  title: string;
  badge: string;
  instruction: string;
  originalTextSegments: StyleExerciseSegment[];
}

export const defaultStyleExercises: StyleExercise[] = [
  {
    id: 'cviceni-sz',
    title: 'Hledání chyb ve Služebním záznamu',
    badge: 'Cvičení 1: Služební záznam',
    instruction: 'V níže uvedeném textu označte všechny závažné chyby proti metodice VS ČR (kliknutím na problematická místa):',
    originalTextSegments: [
      { id: 1, text: 'Včera odpoledne kolem třetí hodiny ', isError: true, correction: 'Chyba: Vágní časové určení. Správně: „Dne 14.03.2024 v čase 15:10 hod."' },
      { id: 2, text: 'jsme byli s kolegou na oddíle ', isError: true, correction: 'Chyba: 1. osoba množného čísla bez uvedení rozkazu. Správně: „Dne ... jsem byl velen rozkazem... byl jsem přítomen s prap. Novákem..."' },
      { id: 3, text: 'a viděli jsme tam tohoto vězně, jak dělal bordel na cele. ', isError: true, correction: 'Chyba: Nespisovný a obecný výraz („bordel", „tento vězeň"). Správně: „ods. Petr Král, nar. ..., kopal do dveří cely č. 12."' },
      { id: 4, text: 'Řekl jsem mu, ať se uklidní, jinak dostane. ', isError: true, correction: 'Chyba: Chybí přesná zákonná výzva a citace. Správně: „Použil jsem zákonnou výzvu dle § 6 odst. 3 písm. b) z. č. 555/1992 Sb. slovy: ..."' },
      { id: 5, text: 'Potom jsme ho odvedli k doktorovi a bylo to nahlášeno.', isError: true, correction: 'Chyba: Neurčitý časový sled a anonymní trpný rod. Správně: Uvést přesný čas předvedení k MUDr. a konkrétní orgány, kterým byla událost ohlášena (ISS-O, VISS).' }
    ]
  },
  {
    id: 'cviceni-zkp',
    title: 'Hledání chyb v Záznamu o kázeňském přestupku',
    badge: 'Cvičení 2: Kázeňský přestupek',
    instruction: 'Najděte nedostatky v popisu skutku a právní kvalifikaci:',
    originalTextSegments: [
      { id: 1, text: 'Dne 10.02.2024 v čase 09:15 jsem zjistil odsouzeného Jana Malého na ložnici č. 201, ', isError: false, correction: 'V pořádku (přesný datum, čas, jméno i místo).' },
      { id: 2, text: 'který porušil vnitřní řád věznice tím, že neměl uklizeno. ', isError: true, correction: 'Chyba: Nelze uvést POUZE porušení Vnitřního řádu! Vždy musí být uvedeno porušení zákonné povinnosti dle § 28 zákona č. 169/1999 Sb.' },
      { id: 3, text: 'Odsouzený mi řekl, že na to kašle a uklízet nebude. ', isError: true, correction: 'Chyba: Chybí doslovná přímá řeč v uvozovkách. Správně: užil slov, cituji: „..."' },
      { id: 4, text: 'Odsouzený odmítl se k věci vyjádřit, tak jsem to nechal být a podepsal sám bez svědků.', isError: true, correction: 'Chyba: Do protokolu se musí výslovně zapsat, že odsouzený odmítl vyjádření/podpis, a uvést svědky přítomné incidentu.' }
    ]
  }
];

// ─── Textové bloky (ETŘ, VIS, pravidla stylu) ────────────────────────────────

export const defaultAdminSections: StudySection[] = [
  {
    id: 'etr-zasady',
    area: 'etr',
    title: 'Zásady práce se spisem v ETŘ',
    kicker: '',
    intro: '',
    outro: '',
    items: [
      sectionItem({
        title: '1. krok: Určení zpracovatele',
        text: 'Při založení spisu je **nejdůležitější krok** přidat zpracovatele přes záložku *„Přiděleno"*. Pokud není zpracovatel určen, vidí spis **všichni z celé OJ**. Po přidělení jej vidí zpracovatel a jeho vedoucí.',
      }),
      sectionItem({
        title: 'Hierarchie změny typu spisu',
        text: 'Ke změně typu spisu může dojít pouze v jednosměrné hierarchii: **ČJ → Přestupek (PŘ) → Trestný čin (TČ)**. Nikdy v opačném pořadí (zpětnou výjimku může provést pouze administrátor).',
      }),
      sectionItem({
        title: 'Pravidlo políčka „ZAMKNOUT"',
        text: 'Při běžné úpravě popisu ČJ (např. doplnění oddělení LOG/02) se **NIKDY nekliká na „ZAMKNOUT"**! Zamčení omezí viditelnost na deliktní režim a komplikuje běžný oběh dokumentu.',
      }),
    ],
  },
  {
    id: 'etr-operace',
    area: 'etr',
    title: 'Klíčové operace se spisem v ETŘ',
    kicker: '',
    intro: '',
    outro: '',
    items: [
      sectionItem({
        label: '1',
        title: 'Vkládání dokumentů',
        text: 'Možnost vložení 2 formátů: **Formuláře** (přes ikonu tiskárny, vlastní typ souboru pro ETŘ, při odeslání ven konverze do PDF) a **Soubory** (přes ikonu adresáře).',
      }),
      sectionItem({
        label: '2',
        title: 'Podpisová kniha',
        text: 'Interní podpisy v ETŘ jsou platné (logování akcí). Mimo ETŘ se používají **kvalifikované certifikáty a časové razítko**. Sekretariát může podepsat za ředitele s doložkou *v. r.* (při schválení adminem).',
      }),
      sectionItem({
        label: '3',
        title: 'Slučování spisů',
        text: 'Slučuje se, pokud věc dorazí více cestami (pošta, datová zpráva). **Spis TČ se nesmí sloučit do ČJ**, naopak je to povoleno (vyšší typ je důležitější).',
      }),
      sectionItem({
        label: '4',
        title: 'Skartační řízení',
        text: 'Skartační znaky: **„S"** (stoupa/skart), **„V"** (výběr – nutno nejprve přehodnotit na S nebo A) a **„A"** (archiválie). Skartační návrh schvaluje komise a archiv PČR.',
      }),
    ],
  },
  {
    id: 'vis-stavy',
    area: 'vis',
    title: 'Evidenční stavy osob a právní režim poskytování informací',
    kicker: 'Vězeňský informační systém VIS',
    intro: '',
    outro: '',
    items: [
      sectionItem({
        label: 'Stav kmenový',
        title: 'Sledování podle umístění',
        text: 'Vězněná osoba je kmenově zařazena a vedena ve stavu té konkrétní věznice či vazební věznice, do které byla rozhodnutím generálního ředitelství umístěna.',
      }),
      sectionItem({
        label: 'Stav administrativní',
        title: 'Sledování podle běhu lhůt',
        text: 'Sledování právního stavu a lhůt výkonu vazby, trestu odnětí svobody nebo zabezpečovací detence (počátek trestu, termíny přezkumů, konec trestu, podmíněné propuštění).',
      }),
      sectionItem({
        label: 'Stav fyzický',
        title: 'Sledování fyzické přítomnosti',
        text: 'Reálná fyzická přítomnost v objektu. Při eskortě k civilnímu soudu či do civilní nemocnice je vězeň kmenově v mateřské věznici, ale fyzicky se nachází mimo ni.',
      }),
    ],
  },
  {
    id: 'vis-pravidla',
    area: 'vis',
    title: 'Pravidla poskytování informací z evidence VS ČR (§ 23a zákona č. 555/1992 Sb.)',
    kicker: '',
    intro: '',
    outro: '',
    items: [
      sectionItem({
        title: 'Poskytování bez souhlasu vězněné osoby',
        text: '**Orgánům činným v trestním řízení (OČTŘ)**, soudům a státním zastupitelstvím.\n**Státním orgánům a institucím:** ČSSZ, OSSZ, finanční úřady, exekutoři, probační služba (PMaS), sociální péče, ombudsman.\n**Třetím osobám (věřitelé, zaměstnavatelé, osoby blízké):** POUZE údaj o umístění a délce trestu, pokud *osvědčí právní zájem*.',
      }),
      sectionItem({
        title: 'Telefonické lustrace & Ochrana svědků',
        text: '**Telefonická hesla:** Stanovuje odbor správní GŘ VS ČR s platností na **3 měsíce**. Po telefonu *bez platného hesla* se nesmí podat žádná informace!\n**Zvláštní ochrana svědka (z. č. 137/2001 Sb.):** Informace lze podat pouze na základě písemné žádosti schválené Útvarem speciálních činností Policie ČR.\n**Nahlížení do osobního spisu:** Vězeň může žádat písemně; bezpečnostní údaje a totožnost zaměstnanců v komisích se neposkytují formou kopií, ale pouze výpisem.',
      }),
    ],
  },
  {
    id: 'styl-pravidla',
    area: 'styl',
    title: '7 základních požadavků kladených na úřední písemnost',
    kicker: '',
    intro: '',
    outro: '',
    items: [
      sectionItem({ label: '1', title: 'Spisovná čeština a odbornost', text: 'Užití spisovného jazyka včetně přesné terminologie bezpečnostního sboru. Žádné hovorové výrazy ani slang.' }),
      sectionItem({ label: '2', title: '1. osoba jednotného čísla', text: 'Vždy minulý čas: „Já jsem viděl, zjistil, vyzval, zajistil..." (nikoli neurčitý trpný rod nebo množné číslo).' }),
      sectionItem({ label: '3', title: 'Max. 3 věty v souvětí', text: 'Krátká, srozumitelná souvětí zabraňující zkreslení výpovědi a zmatení chronologického děje.' }),
      sectionItem({ label: '4', title: 'Konkrétní čas a místo', text: 'Zákaz vágních příslovcí (tam, zde, v odpoledních hodinách, asi, hned, potom). Vždy uvést přesný čas a číslo ložnice/cely.' }),
      sectionItem({ label: '5', title: 'Zákaz vycpávkových slov', text: 'Nepoužívat bezobsahová ukazovací zájmena (ten, tento, onen, jakoby).' }),
      sectionItem({ label: '6', title: 'Přesný pravopis přímé řeči', text: 'Doslovná citace verbálních projevů a vulgarismů v uvozovkách: „Sledujte dobře, jak se píší mezery v přímé řeči."' }),
    ],
  },
  {
    id: 'styl-dolozka',
    area: 'styl',
    title: '7. Kompletní podpisová doložka příslušníka:',
    kicker: '',
    intro: '',
    outro: '',
    items: [
      sectionItem({
        text: 'vlastnoruční podpis',
        title: 'v. ref. strm. Bc. Jan Novák, DiS., sl. č. 12345, strážný',
        note: '(služ. hodnost, hodn. označení, titul, jméno, příjmení, služební číslo, služební zařazení / funkce)',
      }),
    ],
  },
];

/** Co které pole výchozích bloků znamená — pro formulář lektora. */
export const adminSectionFields: Record<string, StudySectionFields> = {
  'etr-zasady': {
    title: 'Název bloku (jen pro přehled lektora)',
    titleHidden: true,
    itemsLegend: 'Karty zásad',
    item: { title: 'Nadpis karty', text: 'Text karty' },
  },
  'etr-operace': {
    title: 'Nadpis bloku',
    itemsLegend: 'Operace',
    item: { label: 'Číslo', title: 'Název operace', text: 'Popis' },
  },
  'vis-stavy': {
    title: 'Nadpis stránky VIS',
    kicker: 'Řádek nad nadpisem',
    itemsLegend: 'Evidenční stavy',
    item: { label: 'Štítek stavu', title: 'Nadpis', text: 'Popis' },
  },
  'vis-pravidla': {
    title: 'Nadpis bloku',
    itemsLegend: 'Rámečky',
    item: { title: 'Nadpis rámečku', text: 'Odrážky (každý řádek = jedna odrážka)' },
  },
  'styl-pravidla': {
    title: 'Nadpis bloku',
    kicker: 'Řádek nad nadpisem',
    itemsLegend: 'Požadavky',
    item: { label: 'Číslo', title: 'Název požadavku', text: 'Popis' },
  },
  'styl-dolozka': {
    title: 'Nadpis rámečku',
    itemsLegend: 'Vzory doložky',
    item: { text: 'Řádek nad doložkou', title: 'Vzor doložky (tučně)', note: 'Vysvětlivka' },
  },
};
