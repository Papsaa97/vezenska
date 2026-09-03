import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Copy, 
  Check, 
  Printer, 
  HelpCircle, 
  BookOpen, 
  Clock, 
  UserCheck, 
  Lock, 
  Unlock, 
  Shield, 
  ArrowRight, 
  Phone, 
  Eye, 
  Sparkles, 
  Scale, 
  Download, 
  RefreshCw,
  FolderOpen,
  Info,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateDailyStreak } from '../utils/gamification';

export type AdminSection = 'generator' | 'etr' | 'vis' | 'style-rules';

// Pre-defined official templates based directly on VS ČR training documents
interface RecordTemplate {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  normReference: string;
  defaultData: Record<string, string>;
  affectedBodyPartsDefault?: string[];
  mandatoryFields: string[];
}

const RECORD_TEMPLATES: RecordTemplate[] = [
  {
    id: 'dp',
    title: 'Záznam o použití donucovacího prostředku',
    subtitle: 'Příloha k PGŘ č. 3/2024 a §§ 6, 17–20 zákona č. 555/1992 Sb.',
    badge: 'PGŘ č. 3/2024',
    normReference: '§ 6 odst. 3 písm. b), §§ 17–20 zákona č. 555/1992 Sb.',
    mandatoryFields: ['officer', 'dutyOrder', 'targetPerson', 'targetCode', 'datetimePlace', 'precedingEvents', 'officerAction', 'targetBehavior', 'dpUsedDetails', 'injuryDamage', 'firstAid', 'medicalExam', 'bossInformed', 'photoDoc', 'evaluation'],
    affectedBodyPartsDefault: ['hlava-oblicej', 'rameno-prave', 'zady-pouta', 'predlokti-prave'],
    defaultData: {
      prisonName: 'Věznice Ostrov, Vykmanov 22, 363 50 Ostrov',
      refNumber: 'VS-1234/ČJ-2024-801345',
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
      evaluation: 'Použití DP bylo oprávněné a přiměřené, splnilo svůj účel, neboť odsouzený zanechal protiprávního a destruktivního jednání. Ve 20:20 byl odsouzený ubytován na KO, cela č. 7.',
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
    mandatoryFields: ['prisonName', 'targetPerson', 'targetBirth', 'prisonType', 'actDescription', 'targetStatement', 'evidenceList', 'signatureDate', 'officerSignature'],
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
    badge: 'Standard VS ČR',
    normReference: 'Zákon č. 555/1992 Sb., spisový řád VS ČR',
    mandatoryFields: ['prisonName', 'docTitle', 'dutyOrder', 'eventStory', 'actionsTimeline', 'witnesses', 'signatureDate', 'officerSignature'],
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
    mandatoryFields: ['prisonName', 'datetime', 'targetPerson', 'itemsList', 'seizureReason', 'surrenderedTo', 'signatureDate', 'officerSignature'],
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
    mandatoryFields: ['prisonName', 'targetPerson', 'targetCode', 'housingCell', 'eventStory', 'officerReport', 'signatureDate', 'officerSignature'],
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

export default function PrisonAdministration() {
  const [activeSection, setActiveSection] = useState<AdminSection>('generator');
  
  // Generator state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('dp');
  const [formData, setFormData] = useState<Record<string, string>>(() => RECORD_TEMPLATES[0].defaultData);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>(() => RECORD_TEMPLATES[0].affectedBodyPartsDefault || []);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // ETŘ Simulator State
  const [cjOrg, setCjOrg] = useState('VS');
  const [cjSpisNumber, setCjSpisNumber] = useState('123');
  const [cjDocNumber, setCjDocNumber] = useState('1');
  const [cjSpisType, setCjSpisType] = useState<'ČJ' | 'PŘ' | 'TČ'>('TČ');
  const [cjYear, setCjYear] = useState('2024');
  const [cjOrgCode, setCjOrgCode] = useState('801345');
  const [cjCustomExt, setCjCustomExt] = useState('LOG/02');
  const [etrStep, setEtrStep] = useState(1);
  const [cjCopied, setCjCopied] = useState(false);

  const generateCJ = () => {
    const year = new Date().getFullYear();
    const seq = String(Math.floor(1000 + Math.random() * 9000));
    const sub = String(Math.floor(100000 + Math.random() * 900000));
    const num = String(Math.floor(100 + Math.random() * 900));
    const cj = `VS-${seq}-1/ČJ-${year}-80${sub.slice(0, 4)}-${num}`;
    handleFieldChange('refNumber', cj);
  };

  const copyCJ = () => {
    if (formData.refNumber) {
      navigator.clipboard.writeText(formData.refNumber).then(() => {
        setCjCopied(true);
        setTimeout(() => setCjCopied(false), 2000);
      });
    }
  };

  // Style Checker Exercise State
  const [selectedExercise, setSelectedExercise] = useState<number>(0);
  const [userErrorsFound, setUserErrorsFound] = useState<number[]>([]);
  const [exerciseChecked, setExerciseChecked] = useState(false);

  const currentTemplate = useMemo(() => {
    return RECORD_TEMPLATES.find(t => t.id === selectedTemplateId) || RECORD_TEMPLATES[0];
  }, [selectedTemplateId]);

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const targetTpl = RECORD_TEMPLATES.find(t => t.id === tplId);
    if (targetTpl) {
      setFormData({ ...targetTpl.defaultData });
      setSelectedBodyParts(targetTpl.affectedBodyPartsDefault || []);
      setShowValidation(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleBodyPart = (partId: string) => {
    setSelectedBodyParts(prev => 
      prev.includes(partId) ? prev.filter(p => p !== partId) : [...prev, partId]
    );
  };

  const handleCopyRecord = () => {
    const textOutput = buildRecordText();
    navigator.clipboard.writeText(textOutput);
    setCopiedSuccess(true);
    updateDailyStreak();
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
    updateDailyStreak();
  };

  const handleResetToDefault = () => {
    setFormData({ ...currentTemplate.defaultData });
    setSelectedBodyParts(currentTemplate.affectedBodyPartsDefault || []);
  };

  const buildRecordText = (): string => {
    if (selectedTemplateId === 'dp') {
      return `VĚZEŇSKÁ SLUŽBA ČESKÉ REPUBLIKY\n${formData.prisonName || ''}\nČ. j.: ${formData.refNumber || ''}\n\n` +
        `ZÁZNAM O POUŽITÍ DONUCOVACÍHO PROSTŘEDKU (Část první)\n` +
        `------------------------------------------------------------------\n` +
        `Zakročující příslušník: ${formData.officer || ''}\n` +
        `Do služby velen rozkazem: ${formData.dutyOrder || ''}\n` +
        `Použití osobní kamery: ${formData.cameraUsed || 'ANO'}\n` +
        `Použito proti komu: ${formData.targetPerson || ''} (kód: ${formData.targetCode || ''})\n\n` +
        `Zasažená místa těla dle schématu:\n${selectedBodyParts.length > 0 ? selectedBodyParts.map(p => `- ${p}`).join('\n') : '- Žádné specifické zóny'}\n\n` +
        `POPIS PRŮBĚHU POUŽITÍ DP:\n` +
        `1. Čas a místo: ${formData.datetimePlace || ''}\n` +
        `2. Co předcházelo: ${formData.precedingEvents || ''}\n` +
        `3. Zákonná výzva a jednání příslušníka: ${formData.officerAction || ''}\n` +
        `4. Jednání vězněné osoby (citace): ${formData.targetBehavior || ''}\n` +
        `5. Použitý donucovací prostředek a průběh: ${formData.dpUsedDetails || ''}\n\n` +
        `ČINNOST PO POUŽITÍ DP:\n` +
        `- Zranění a škody: ${formData.injuryDamage || ''}\n` +
        `- Poskytnutí první pomoci: ${formData.firstAid || ''}\n` +
        `- Lékařské ošetření: ${formData.medicalExam || ''}\n` +
        `- Informování nadřízeného dle § 20 odst. 2: ${formData.bossInformed || ''}\n` +
        `- Pořízení fotodokumentace: ${formData.photoDoc || ''}\n\n` +
        `Svědci: ${formData.witnesses || 'Bez svědků'}\n` +
        `Vyhodnocení: ${formData.evaluation || ''}\n\n` +
        `${formData.signatureDate || ''}\n` +
        `Podpis zakročujícího: ${formData.officerSignature || ''}`;
    } else if (selectedTemplateId === 'zkp') {
      return `${formData.prisonName || ''}\n\n` +
        `ZÁZNAM O KÁZEŇSKÉM PŘESTUPKU\n` +
        `------------------------------------------------------------------\n` +
        `Jméno a příjmení odsouzeného: ${formData.targetPerson || ''}\n` +
        `Datum narození: ${formData.targetBirth || ''}\n` +
        `Typ věznice: ${formData.prisonType || ''}\n\n` +
        `POPIS SKUTKU:\n${formData.actDescription || ''}\n\n` +
        `VYJÁDŘENÍ PODEZŘELÉHO ZE SPÁCHÁNÍ KÁZEŇSKÉHO PŘESTUPKU:\n${formData.targetStatement || ''}\n\n` +
        `DALŠÍ DŮKAZNÍ PROSTŘEDKY:\n${formData.evidenceList || ''}\n\n` +
        `${formData.signatureDate || ''}\n` +
        `Podpis odsouzeného: ........................................\n\n` +
        `${formData.officerSignature || ''}`;
    } else if (selectedTemplateId === 'odneti') {
      return `${formData.prisonName || ''}\n\n` +
        `ZÁZNAM O ODNĚTÍ VĚCI dle § 12 zákona č. 555/1992 Sb.\n` +
        `------------------------------------------------------------------\n` +
        `Čas a datum: ${formData.datetime || ''}\n` +
        `Vězněná osoba: ${formData.targetPerson || ''}\n\n` +
        `ODŇATÉ VĚCI:\n${formData.itemsList || ''}\n\n` +
        `DŮVOD ODNĚTÍ VĚCÍ:\n${formData.seizureReason || ''}\n\n` +
        `PŘEDÁNÍ A NALOŽENÍ S VĚCÍ:\n${formData.surrenderedTo || ''}\n\n` +
        `${formData.signatureDate || ''}\n` +
        `${formData.officerSignature || ''}`;
    } else {
      return `${formData.prisonName || ''}\n\n` +
        `${formData.docTitle || 'SLUŽEBNÍ ZÁZNAM'}\n` +
        `------------------------------------------------------------------\n` +
        `Velení do služby: ${formData.dutyOrder || ''}\n\n` +
        `POPIS DĚJE A ZJIŠTĚNÉ SKUTEČNOSTI:\n${formData.eventStory || ''}\n\n` +
        `PROVEDENÁ OPATŘENÍ:\n${formData.actionsTimeline || ''}\n\n` +
        `Svědci: ${formData.witnesses || 'Beze svědků'}\n\n` +
        `${formData.signatureDate || ''}\n` +
        `${formData.officerSignature || ''}`;
    }
  };

  const fullGeneratedCj = `${cjOrg}-${cjSpisNumber}-${cjDocNumber}/${cjSpisType}-${cjYear}-${cjOrgCode}${cjCustomExt ? '-' + cjCustomExt : ''}`;

  // Interactive Exercises for finding errors in official records
  const STYLE_EXERCISES = [
    {
      title: 'Hledání chyb ve Služebním záznamu',
      badge: 'Cvičení 1: Služební záznam',
      instruction: 'V níže uvedeném textu označte všechny závažné chyby proti metodice VS ČR (kliknutím na problematická místa):',
      originalTextSegments: [
        { id: 1, text: 'Včera odpoledne kolem třetí hodiny ', isError: true, correction: 'Chyba: Vágní časové určení. Správně: „Dne 14.03.2024 v čase 15:10 hod.“' },
        { id: 2, text: 'jsme byli s kolegou na oddíle ', isError: true, correction: 'Chyba: 1. osoba množného čísla bez uvedení rozkazu. Správně: „Dne ... jsem byl velen rozkazem... byl jsem přítomen s prap. Novákem...“' },
        { id: 3, text: 'a viděli jsme tam tohoto vězně, jak dělal bordel na cele. ', isError: true, correction: 'Chyba: Nespisovný a obecný výraz („bordel“, „tento vězeň“). Správně: „ods. Petr Král, nar. ..., kopal do dveří cely č. 12.“' },
        { id: 4, text: 'Řekl jsem mu, ať se uklidní, jinak dostane. ', isError: true, correction: 'Chyba: Chybí přesná zákonná výzva a citace. Správně: „Použil jsem zákonnou výzvu dle § 6 odst. 3 písm. b) z. č. 555/1992 Sb. slovy: ...“' },
        { id: 5, text: 'Potom jsme ho odvedli k doktorovi a bylo to nahlášeno.', isError: true, correction: 'Chyba: Neurčitý časový sled a anonymní trpný rod. Správně: Uvést přesný čas předvedení k MUDr. a konkrétní orgány, kterým byla událost ohlášena (ISS-O, VISS).' }
      ]
    },
    {
      title: 'Hledání chyb v Záznamu o kázeňském přestupku',
      badge: 'Cvičení 2: Kázeňský přestupek',
      instruction: 'Najděte nedostatky v popisu skutku a právní kvalifikaci:',
      originalTextSegments: [
        { id: 1, text: 'Dne 10.02.2024 v čase 09:15 jsem zjistil odsouzeného Jana Malého na ložnici č. 201, ', isError: false, correction: 'V pořádku (přesný datum, čas, jméno i místo).' },
        { id: 2, text: 'který porušil vnitřní řád věznice tím, že neměl uklizeno. ', isError: true, correction: 'Chyba: Nelze uvést POUZE porušení Vnitřního řádu! Vždy musí být uvedeno porušení zákonné povinnosti dle § 28 zákona č. 169/1999 Sb.' },
        { id: 3, text: 'Odsouzený mi řekl, že na to kašle a uklízet nebude. ', isError: true, correction: 'Chyba: Chybí doslovná přímá řeč v uvozovkách. Správně: užil slov, cituji: „...“' },
        { id: 4, text: 'Odsouzený odmítl se k věci vyjádřit, tak jsem to nechal být a podepsal sám bez svědků.', isError: true, correction: 'Chyba: Do protokolu se musí výslovně zapsat, že odsouzený odmítl vyjádření/podpis, a uvést svědky přítomné incidentu.' }
      ]
    }
  ];

  const currentExerciseData = STYLE_EXERCISES[selectedExercise];

  const handleToggleErrorSegment = (segmentId: number) => {
    if (exerciseChecked) return;
    setUserErrorsFound(prev => 
      prev.includes(segmentId) ? prev.filter(id => id !== segmentId) : [...prev, segmentId]
    );
  };

  const handleCheckExercise = () => {
    setExerciseChecked(true);
    updateDailyStreak();
  };

  const handleResetExercise = () => {
    setUserErrorsFound([]);
    setExerciseChecked(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 border border-amber-300/30 text-amber-200 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Vězeňská administrativa & ETŘ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Spisová služba, tiskopisy & informační systémy VS ČR
            </h1>
            <p className="text-amber-100 text-sm max-w-3xl leading-relaxed">
              Interaktivní trenažér elektronické spisové služby ETŘ (pokyn GŘ č. 4/2016), generátor povinných úředních záznamů (PGŘ č. 3/2024, NGŘ č. 41/2024 a NGŘ č. 24/2022) a metodika informačního systému VIS.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveSection('generator')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                activeSection === 'generator'
                  ? 'bg-white text-slate-950 ring-2 ring-white/50'
                  : 'bg-amber-800/60 hover:bg-amber-800 text-white border border-amber-500/30'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Generátor záznamů</span>
            </button>
            <button
              onClick={() => setActiveSection('etr')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                activeSection === 'etr'
                  ? 'bg-white text-slate-950 ring-2 ring-white/50'
                  : 'bg-amber-800/60 hover:bg-amber-800 text-white border border-amber-500/30'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>ETŘ Trenažér</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSection('generator')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'generator'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Generátor & Vzorník záznamů (DP, ZKP, SZ)</span>
        </button>

        <button
          onClick={() => setActiveSection('etr')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'etr'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>ETŘ: Spisová služba & Číslo jednací</span>
        </button>

        <button
          onClick={() => setActiveSection('vis')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'vis'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>VIS: Evidence & Lustrace (§ 23a)</span>
        </button>

        <button
          onClick={() => setActiveSection('style-rules')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'style-rules'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>7 pravidel úředního stylu & Kontrola chyb</span>
        </button>
      </div>

      {/* SECTION 1: OFFICIAL RECORDS GENERATOR & BODY SCHEME */}
      {activeSection === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Template Selection & Form Fields */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Template Selector Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Výběr úředního záznamu k vyplnění:
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {currentTemplate.badge}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RECORD_TEMPLATES.map(tpl => {
                  const isSelected = tpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-sm ring-1 ring-amber-400'
                          : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold'
                      }`}
                    >
                      <div className="truncate">{tpl.title}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                        {tpl.badge}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields according to selected template */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {currentTemplate.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentTemplate.subtitle}
                  </p>
                </div>
                <button
                  onClick={handleResetToDefault}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Obnovit vzor</span>
                </button>
              </div>

              {/* Notice regarding mandatory highlighted fields */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <strong>Povinné náležitosti formuláře:</strong> Červeně ohraničená pole jsou dle metodiky VS ČR povinná a nesmí zůstat prázdná. Formulář lze upravit, zkopírovat či vytisknout.
                </div>
              </div>

              {/* SPECIFIC FIELDS FOR DONUCOVACÍ PROSTŘEDEK */}
              {selectedTemplateId === 'dp' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Věznice & Adresa <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.prisonName || ''}
                        onChange={(e) => handleFieldChange('prisonName', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Číslo jednací (Č.j.) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={generateCJ}
                            className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Vygenerovat platné formátované Č.j."
                          >
                            <Zap className="w-3 h-3" />
                            <span>Generovat Č.j.</span>
                          </button>
                          <button
                            type="button"
                            onClick={copyCJ}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] transition-colors cursor-pointer"
                            title="Zkopírovat Č.j. do schránky"
                          >
                            {cjCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={formData.refNumber || ''}
                        onChange={(e) => handleFieldChange('refNumber', e.target.value)}
                        placeholder="VS-XXXX-1/ČJ-2026-80XXXX-XXX"
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Zakročující příslušník (hodnost, jméno, sl. č., zařazení) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.officer || ''}
                        onChange={(e) => handleFieldChange('officer', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Velen do služby rozkazem <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.dutyOrder || ''}
                        onChange={(e) => handleFieldChange('dutyOrder', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Použito proti komu (jméno, nar., postavení) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.targetPerson || ''}
                        onChange={(e) => handleFieldChange('targetPerson', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Kód vězněné osoby <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.targetCode || ''}
                        onChange={(e) => handleFieldChange('targetCode', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  {/* Body Part Marker Interactive Widget */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span>Grafické znázornění zasažených míst těla:</span>
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {selectedBodyParts.length} označených zón
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
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
                      ].map(part => {
                        const isMarked = selectedBodyParts.includes(part.id);
                        return (
                          <button
                            key={part.id}
                            type="button"
                            onClick={() => toggleBodyPart(part.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              isMarked
                                ? 'bg-red-500 text-white shadow-xs font-bold ring-1 ring-red-400'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {part.label} {isMarked ? '✓' : '+'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Datum, čas a přesné místo použití DP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.datetimePlace || ''}
                      onChange={(e) => handleFieldChange('datetimePlace', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Co předcházelo použití DP <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.precedingEvents || ''}
                      onChange={(e) => handleFieldChange('precedingEvents', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Popis jednání příslušníka (domluva, zákonná výzva vč. doslovné citace) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.officerAction || ''}
                      onChange={(e) => handleFieldChange('officerAction', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Popis jednání vězněné osoby (vč. doslovné citace vulgarismů a projevů) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.targetBehavior || ''}
                      onChange={(e) => handleFieldChange('targetBehavior', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Důvod, jaký DP byl použit, kolikrát, jakým způsobem a na jakou část těla <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.dpUsedDetails || ''}
                      onChange={(e) => handleFieldChange('dpUsedDetails', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Škoda a zranění (odsouzený vs. příslušníci) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.injuryDamage || ''}
                        onChange={(e) => handleFieldChange('injuryDamage', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Poskytnutí první pomoci (kde a kým) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.firstAid || ''}
                        onChange={(e) => handleFieldChange('firstAid', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Lékařské ošetření (ZZS, nemocnice) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.medicalExam || ''}
                        onChange={(e) => handleFieldChange('medicalExam', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Informování nadřízeného dle § 20 odst. 2 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.bossInformed || ''}
                        onChange={(e) => handleFieldChange('bossInformed', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Fotodokumentace (čas a kým) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.photoDoc || ''}
                        onChange={(e) => handleFieldChange('photoDoc', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Vyhodnocení použití DP (oprávněnost, účel, umístění po zákroku) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.evaluation || ''}
                      onChange={(e) => handleFieldChange('evaluation', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS FOR KÁZEŇSKÝ PŘESTUPEK */}
              {selectedTemplateId === 'zkp' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Jméno a příjmení odsouzeného <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.targetPerson || ''}
                        onChange={(e) => handleFieldChange('targetPerson', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Datum narození <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.targetBirth || ''}
                        onChange={(e) => handleFieldChange('targetBirth', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Typ věznice / stupeň zabezpečení <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.prisonType || ''}
                        onChange={(e) => handleFieldChange('prisonType', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Popis skutku (přesný čas, místo, způsob spáchání, porušení § 28 z. 169/1999 Sb. + VŘV) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={6}
                      value={formData.actDescription || ''}
                      onChange={(e) => handleFieldChange('actDescription', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Vyjádření podezřelého ze spáchání KP (v přímé řeči doslovně) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.targetStatement || ''}
                      onChange={(e) => handleFieldChange('targetStatement', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Další důkazní prostředky (svědci, záznam o odnětí věci, kamery) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.evidenceList || ''}
                      onChange={(e) => handleFieldChange('evidenceList', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS FOR SLUŽEBNÍ ZÁZNAM */}
              {selectedTemplateId === 'sz' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Název záznamu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.docTitle || ''}
                      onChange={(e) => handleFieldChange('docTitle', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Velení do služby (datum, číslo rozkazu VO VS, stanoviště) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.dutyOrder || ''}
                      onChange={(e) => handleFieldChange('dutyOrder', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Popis děje a zjištěné skutečnosti (Kdy, Kde, Kdo, Co, Jak, Proč) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.eventStory || ''}
                      onChange={(e) => handleFieldChange('eventStory', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Provedená opatření v časovém sledu (ISS, VISS, VOVS, lékař) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.actionsTimeline || ''}
                      onChange={(e) => handleFieldChange('actionsTimeline', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS FOR ODNĚTÍ VĚCI */}
              {selectedTemplateId === 'odneti' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Datum a čas odnětí věci <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.datetime || ''}
                        onChange={(e) => handleFieldChange('datetime', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Vězněná osoba (jméno, nar., typ věznice) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.targetPerson || ''}
                        onChange={(e) => handleFieldChange('targetPerson', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Přesný soupis odňatých věcí (výrobní čísla, značka, rozměry, barva, série) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.itemsList || ''}
                      onChange={(e) => handleFieldChange('itemsList', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Důvod odnětí věcí (okolnosti nálezu dle § 12 zákona č. 555/1992 Sb.) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.seizureReason || ''}
                      onChange={(e) => handleFieldChange('seizureReason', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS FOR FYZICKÉ NÁSILÍ */}
              {selectedTemplateId === 'nasilie' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Jméno napadeného odsouzeného <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.targetPerson || ''}
                        onChange={(e) => handleFieldChange('targetPerson', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Identifikační kód <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.targetCode || ''}
                        onChange={(e) => handleFieldChange('targetCode', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Ubytování (oddíl, cela) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.housingCell || ''}
                        onChange={(e) => handleFieldChange('housingCell', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Popis okolností zjištěného případu & prohlídka těla <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.eventStory || ''}
                      onChange={(e) => handleFieldChange('eventStory', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Opatření, informování IDS a VISS & lékařská prohlídka na ZS <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.officerReport || ''}
                      onChange={(e) => handleFieldChange('officerReport', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Common Signature Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Místo a datum podpisu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.signatureDate || ''}
                    onChange={(e) => handleFieldChange('signatureDate', e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kompletní podpisová doložka příslušníka <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.officerSignature || ''}
                    onChange={(e) => handleFieldChange('officerSignature', e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium font-mono text-[11px]"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Live Formatted Document Preview & Actions */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Action Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyRecord}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  {copiedSuccess ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSuccess ? 'Zkopírováno!' : 'Kopírovat záznam'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Tisk / PDF</span>
                </button>
              </div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                Oficiální standard VS ČR
              </span>
            </div>

            {/* Document Paper Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-300 dark:border-slate-800 shadow-md font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[750px] whitespace-pre-wrap select-all">
              {buildRecordText()}
            </div>

            {/* Explanatory Note Box */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-1.5 text-xs text-blue-900 dark:text-blue-200">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Metodické upozornění pro závěrečnou zkoušku ZOP:</span>
              </div>
              <p className="text-[11px] leading-normal">
                U ústní i písemné zkoušky komisaři striktně vyžadují dodržení struktury 7 povinných bodů záznamu, přesnou citaci zákonné výzvy dle § 6 odst. 3 písm. b) zákona č. 555/1992 Sb. a správné uvedení porušeného ustanovení § 28 zákona č. 169/1999 Sb. u kázeňského přestupku.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* SECTION 2: ETŘ SIMULATOR & SPISOVÁ SLUŽBA */}
      {activeSection === 'etr' && (
        <div className="space-y-6">
          
          {/* Interactive Číslo Jednací Decoder */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Interaktivní analyzátor & generátor
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Struktura čísla jednacího (ČJ) v systému ETŘ
                </h2>
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Pokyn GŘ VS ČR č. 4/2016
              </div>
            </div>

            {/* Generated Code Display Box */}
            <div className="bg-slate-950 rounded-2xl p-5 text-center space-y-3 shadow-inner">
              <div className="text-xs font-semibold text-slate-400">
                Výsledný vygenerovaný tvar ČJ v IS ETŘ:
              </div>
              <div className="text-xl sm:text-3xl font-black text-amber-400 font-mono tracking-wider break-all">
                {fullGeneratedCj}
              </div>
              <div className="text-[11px] text-slate-400">
                V systému ETŘ vidí všichni oprávnění uživatelé vždy ČJ a název věci!
              </div>
            </div>

            {/* Interactive Inputs for Segments */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">1. Organizace</label>
                <input
                  type="text"
                  value={cjOrg}
                  onChange={(e) => setCjOrg(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 block">VS = Vězeňská služba</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">2. Číslo spisu</label>
                <input
                  type="text"
                  value={cjSpisNumber}
                  onChange={(e) => setCjSpisNumber(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Pořadové číslo spisu</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">3. Číslo dok.</label>
                <input
                  type="text"
                  value={cjDocNumber}
                  onChange={(e) => setCjDocNumber(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Pořadí v rámci spisu</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">4. Typ spisu</label>
                <select
                  value={cjSpisType}
                  onChange={(e) => setCjSpisType(e.target.value as any)}
                  className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono cursor-pointer"
                >
                  <option value="ČJ">ČJ (Běžné / Svodkové)</option>
                  <option value="PŘ">PŘ (Přestupky)</option>
                  <option value="TČ">TČ (Trestní řízení)</option>
                </select>
                <span className="text-[10px] text-slate-400 block">ČJ / PŘ / TČ</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">5. Rok</label>
                <input
                  type="text"
                  value={cjYear}
                  onChange={(e) => setCjYear(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Kalendářní rok</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">6. Kód OJ (80XXXX)</label>
                <input
                  type="text"
                  value={cjOrgCode}
                  onChange={(e) => setCjOrgCode(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 block">80 = VS ČR + kód OJ</span>
              </div>

            </div>

            {/* Educational Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2 text-xs">
                <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>1. krok: Určení zpracovatele</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Při založení spisu je <strong>nejdůležitější krok</strong> přidat zpracovatele přes záložku <em>„Přiděleno“</em>. Pokud není zpracovatel určen, vidí spis <strong>všichni z celé OJ</strong>. Po přidělení jej vidí zpracovatel a jeho vedoucí.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2 text-xs">
                <div className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4" />
                  <span>Hierarchie změny typu spisu</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Ke změně typu spisu může dojít pouze v jednosměrné hierarchii: <strong>ČJ → Přestupek (PŘ) → Trestný čin (TČ)</strong>. Nikdy v opačném pořadí (zpětnou výjimku může provést pouze administrátor).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-2 text-xs">
                <div className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Pravidlo políčka „ZAMKNOUT“</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Při běžné úpravě popisu ČJ (např. doplnění oddělení LOG/02) se <strong>NIKDY nekliká na „ZAMKNOUT“</strong>! Zamčení omezí viditelnost na deliktní režim a komplikuje běžný oběh dokumentu.
                </p>
              </div>
            </div>

          </div>

          {/* Step-by-Step Interactive Guide to ETŘ Operations */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>Klíčové operace se spisem v ETŘ</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Vkládání dokumentů</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Možnost vložení 2 formátů: <strong>Formuláře</strong> (přes ikonu tiskárny, vlastní typ souboru pro ETŘ, při odeslání ven konverze do PDF) a <strong>Soubory</strong> (přes ikonu adresáře).
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Podpisová kniha</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Interní podpisy v ETŘ jsou platné (logování akcí). Mimo ETŘ se používají <strong>kvalifikované certifikáty a časové razítko</strong>. Sekretariát může podepsat za ředitele s doložkou <em>v. r.</em> (při schválení adminem).
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Slučování spisů</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Slučuje se, pokud věc dorazí více cestami (pošta, datová zpráva). <strong>Spis TČ se nesmí sloučit do ČJ</strong>, naopak je to povoleno (vyšší typ je důležitější).
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                  4
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Skartační řízení</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Skartační znaky: <strong>„S“</strong> (stoupa/skart), <strong>„V“</strong> (výběr – nutno nejprve přehodnotit na S nebo A) a <strong>„A“</strong> (archiválie). Skartační návrh schvaluje komise a archiv PČR.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* SECTION 3: VIS (VĚZEŇSKÝ INFORMAČNÍ SYSTÉM) & DATA PROTECTION */}
      {activeSection === 'vis' && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Vězeňský informační systém VIS
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Evidenční stavy osob a právní režim poskytování informací
                </h2>
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                § 23a zákona č. 555/1992 Sb.
              </div>
            </div>

            {/* 3 Evidential States of Prisoners */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Stav kmenový</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Sledování podle umístění
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Vězněná osoba je kmenově zařazena a vedena ve stavu té konkrétní věznice či vazební věznice, do které byla rozhodnutím generálního ředitelství umístěna.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Stav administrativní</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Sledování podle běhu lhůt
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sledování právního stavu a lhůt výkonu vazby, trestu odnětí svobody nebo zabezpečovací detence (počátek trestu, termíny přezkumů, konec trestu, podmíněné propuštění).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Stav fyzický</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Sledování fyzické přítomnosti
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Reálná fyzická přítomnost v objektu. Při eskortě k civilnímu soudu či do civilní nemocnice je vězeň kmenově v mateřské věznici, ale fyzicky se nachází mimo ni.
                </p>
              </div>

            </div>

            {/* Rules of Information Sharing Grid */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Pravidla poskytování informací z evidence VS ČR (§ 23a zákona č. 555/1992 Sb.)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Poskytování bez souhlasu vězněné osoby</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] list-disc list-inside">
                    <li><strong>Orgánům činným v trestním řízení (OČTŘ)</strong>, soudům a státním zastupitelstvím.</li>
                    <li><strong>Státním orgánům a institucím:</strong> ČSSZ, OSSZ, finanční úřady, exekutoři, probační služba (PMaS), sociální péče, ombudsman.</li>
                    <li><strong>Třetím osobám (věřitelé, zaměstnavatelé, osoby blízké):</strong> POUZE údaj o umístění a délce trestu, pokud <em>osvědčí právní zájem</em>.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-500" />
                    <span>Telefonické lustrace & Ochrana svědků</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] list-disc list-inside">
                    <li><strong>Telefonická hesla:</strong> Stanovuje odbor správní GŘ VS ČR s platností na <strong>3 měsíce</strong>. Po telefonu <em>bez platného hesla</em> se nesmí podat žádná informace!</li>
                    <li><strong>Zvláštní ochrana svědka (z. č. 137/2001 Sb.):</strong> Informace lze podat pouze na základě písemné žádosti schválené Útvarem speciálních činností Policie ČR.</li>
                    <li><strong>Nahlížení do osobního spisu:</strong> Vězeň může žádat písemně; bezpečnostní údaje a totožnost zaměstnanců v komisích se neposkytují formou kopií, ale pouze výpisem.</li>
                  </ul>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* SECTION 4: 7 GOLDEN RULES OF STYLE & INTERACTIVE ERROR CHECKER */}
      {activeSection === 'style-rules' && (
        <div className="space-y-6">
          
          {/* The 7 Golden Rules */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Metodika tvorby úředních písemností VS ČR
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                7 základních požadavků kladených na úřední písemnost
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span>1. Spisovná čeština a odbornost</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Užití spisovného jazyka včetně přesné terminologie bezpečnostního sboru. Žádné hovorové výrazy ani slang.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span>2. 1. osoba jednotného čísla</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Vždy minulý čas: <em>„Já jsem viděl, zjistil, vyzval, zajistil...“</em> (nikoli neurčitý trpný rod nebo množné číslo).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span>3. Max. 3 věty v souvětí</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Krátká, srozumitelná souvětí zabraňující zkreslení výpovědi a zmatení chronologického děje.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span>4. Konkrétní čas a místo</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Zákaz vágních příslovcí (<em>tam, zde, v odpoledních hodinách, asi, hned, potom</em>). Vždy uvést přesný čas a číslo ložnice/cely.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span>5. Zákaz vycpávkových slov</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Nepoužívat bezobsahová ukazovací zájmena (<em>ten, tento, onen, jakoby</em>).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span>6. Přesný pravopis přímé řeči</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Doslovná citace verbálních projevů a vulgarismů v uvozovkách: <em>„Sledujte dobře, jak se píší mezery v přímé řeči.“</em>
                </p>
              </div>

            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
              <div className="font-bold text-amber-700 dark:text-amber-300">
                7. Kompletní podpisová doložka příslušníka:
              </div>
              <p className="text-slate-700 dark:text-slate-200 font-mono text-[11px]">
                vlastnoruční podpis<br />
                <strong>v. ref. strm. Bc. Jan Novák, DiS., sl. č. 12345, strážný</strong><br />
                <span className="text-[10px] text-slate-500">(služ. hodnost, hodn. označení, titul, jméno, příjmení, služební číslo, služební zařazení / funkce)</span>
              </p>
            </div>

          </div>

          {/* Interactive Error Detection Training Exercise */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Tréninkový modul
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {currentExerciseData.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {STYLE_EXERCISES.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedExercise(idx);
                      handleResetExercise();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedExercise === idx
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {ex.badge}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {currentExerciseData.instruction}
            </p>

            {/* Clickable text segments */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 leading-loose text-sm font-serif">
              {currentExerciseData.originalTextSegments.map(seg => {
                const isSelected = userErrorsFound.includes(seg.id);
                let badgeClass = 'hover:bg-amber-200/50 dark:hover:bg-amber-900/40 rounded px-1 cursor-pointer transition-colors';
                
                if (exerciseChecked) {
                  if (seg.isError && isSelected) {
                    badgeClass = 'bg-emerald-200 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold px-1 rounded ring-1 ring-emerald-500';
                  } else if (seg.isError && !isSelected) {
                    badgeClass = 'bg-red-200 dark:bg-red-950 text-red-900 dark:text-red-200 font-bold px-1 rounded ring-1 ring-red-500 underline';
                  } else if (!seg.isError && isSelected) {
                    badgeClass = 'bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-1 rounded line-through';
                  }
                } else if (isSelected) {
                  badgeClass = 'bg-amber-300 dark:bg-amber-700 text-slate-950 dark:text-white font-bold px-1 rounded';
                }

                return (
                  <span
                    key={seg.id}
                    onClick={() => handleToggleErrorSegment(seg.id)}
                    className={badgeClass}
                  >
                    {seg.text}
                  </span>
                );
              })}
            </div>

            {/* Exercise Check / Result Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                {!exerciseChecked ? (
                  <button
                    onClick={handleCheckExercise}
                    disabled={userErrorsFound.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Zkontrolovat označené chyby ({userErrorsFound.length})</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResetExercise}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Vyzkoušet znovu</span>
                  </button>
                )}
              </div>

              {exerciseChecked && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Vyhodnoceno (+15 XP do celkového postupu)</span>
                </span>
              )}
            </div>

            {/* Explanations of corrections when checked */}
            {exerciseChecked && (
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Rozbor a správné znění oprav:
                </h4>
                <div className="space-y-2">
                  {currentExerciseData.originalTextSegments.map(seg => (
                    <div
                      key={seg.id}
                      className={`p-3 rounded-xl text-xs ${
                        seg.isError
                          ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                          : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-semibold">{seg.correction}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
