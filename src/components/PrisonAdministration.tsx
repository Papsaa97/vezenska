import React, { useState, useMemo, useEffect, useCallback, useRef, useId } from 'react';
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Printer,
  HelpCircle,
  BookOpen,
  Lock,
  Unlock,
  Sparkles,
  Scale,
  Download,
  RefreshCw,
  FolderOpen,
  Info,
  Zap,
  Eraser,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateDailyStreak } from '../utils/gamification';
import PrisonAdminETR from './prison-admin/PrisonAdminETR';
import PrisonAdminVIS from './prison-admin/PrisonAdminVIS';
import PrisonAdminStyleRules from './prison-admin/PrisonAdminStyleRules';

export type AdminSection = 'generator' | 'etr' | 'vis' | 'style-rules';

interface NavSectionConfig {
  id: AdminSection;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Single source of truth for section navigation (replaces the former duplicated
// header-banner buttons + sub-tabs bar that both toggled the same state).
const NAV_SECTIONS: NavSectionConfig[] = [
  { id: 'generator', label: 'Generátor záznamů (DP, ZKP, SZ)', shortLabel: 'Generátor záznamů', icon: FileText },
  { id: 'etr', label: 'ETŘ: Spisová služba & Číslo jednací', shortLabel: 'ETŘ Trenažér', icon: FolderOpen },
  { id: 'vis', label: 'VIS: Evidence & Lustrace (§ 23a)', shortLabel: 'VIS Evidence', icon: Search },
  { id: 'style-rules', label: '7 pravidel úředního stylu & Kontrola chyb', shortLabel: 'Styl & kontrola chyb', icon: Sparkles }
];

// Human-readable labels for mandatory field keys, used to build validation messages.
const FIELD_LABELS: Record<string, string> = {
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
  officerSignature: 'Podpisová doložka příslušníka'
};

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
    mandatoryFields: ['officer', 'dutyOrder', 'targetPerson', 'targetCode', 'datetimePlace', 'precedingEvents', 'officerAction', 'targetBehavior', 'dpUsedDetails', 'injuryDamage', 'firstAid', 'medicalExam', 'bossInformed', 'photoDoc', 'evaluation', 'departmentHeadOpinion', 'zrvReport', 'directorDecision'],
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

// Selectable body-part zones for the DP body-scheme widget — hoisted to module scope.
interface BodyPart {
  id: string;
  label: string;
}

const BODY_PARTS: BodyPart[] = [
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

const DRAFT_STORAGE_PREFIX = 'vs-cr-admin-draft:';

interface RecordDraft {
  formData: Record<string, string>;
  selectedBodyParts: string[];
}

function loadDraft(templateId: string): RecordDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${templateId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.formData) {
      return parsed as RecordDraft;
    }
    return null;
  } catch {
    return null;
  }
}

function saveDraft(templateId: string, draft: RecordDraft) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${templateId}`, JSON.stringify(draft));
  } catch {
    // localStorage may be unavailable (private mode, quota) — draft autosave is best-effort only.
  }
}

function clearDraft(templateId: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${templateId}`);
  } catch {
    // ignore
  }
}

export default function PrisonAdministration() {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const [activeSection, setActiveSection] = useState<AdminSection>('generator');

  // Generator state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('dp');
  const [formData, setFormData] = useState<Record<string, string>>(() => RECORD_TEMPLATES[0].defaultData);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>(() => RECORD_TEMPLATES[0].affectedBodyPartsDefault || []);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [copyError, setCopyError] = useState(false);
  /** Selhalo kopírování Č.j. Vlastní stav, protože `copyError` patří k tlačítku „Kopírovat záznam". */
  const [cjCopyFailed, setCjCopyFailed] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [draftNotice, setDraftNotice] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentTemplate = useMemo(() => {
    return RECORD_TEMPLATES.find(t => t.id === selectedTemplateId) || RECORD_TEMPLATES[0];
  }, [selectedTemplateId]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const generateCJ = useCallback(() => {
    const year = new Date().getFullYear();
    const seq = String(Math.floor(1000 + Math.random() * 9000));
    const sub = String(Math.floor(100000 + Math.random() * 900000));
    const num = String(Math.floor(100 + Math.random() * 900));
    const cj = `VS-${seq}-1/ČJ-${year}-80${sub.slice(0, 4)}-${num}`;
    handleFieldChange('refNumber', cj);
  }, [handleFieldChange]);

  const copyCJ = useCallback(() => {
    if (formData.refNumber) {
      navigator.clipboard.writeText(formData.refNumber).then(() => {
        setCjCopyFailed(false);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2000);
      }).catch(() => {
        // Schránka bývá nedostupná bez HTTPS nebo bez svolení uživatele. Dřív se
        // po kliknutí nestalo vůbec nic a nešlo poznat, jestli se zkopírovalo.
        setCjCopyFailed(true);
        setTimeout(() => setCjCopyFailed(false), 4000);
      });
    }
  }, [formData.refNumber]);

  // Load a previously auto-saved draft for the initial template on first mount.
  useEffect(() => {
    const draft = loadDraft(selectedTemplateId);
    if (draft) {
      setFormData(draft.formData);
      setSelectedBodyParts(draft.selectedBodyParts || []);
      setDraftNotice(true);
      setTimeout(() => setDraftNotice(false), 4000);
    }
    // Only ever run for the initial template — switching templates is handled by handleSelectTemplate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave the in-progress record as a draft (debounced) so a reload/tab-close doesn't lose it.
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      saveDraft(selectedTemplateId, { formData, selectedBodyParts });
    }, 400);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [formData, selectedBodyParts, selectedTemplateId]);

  const handleSelectTemplate = useCallback((tplId: string) => {
    setSelectedTemplateId(tplId);
    const targetTpl = RECORD_TEMPLATES.find(t => t.id === tplId);
    if (targetTpl) {
      const draft = loadDraft(tplId);
      if (draft) {
        setFormData(draft.formData);
        setSelectedBodyParts(draft.selectedBodyParts || []);
        setDraftNotice(true);
        setTimeout(() => setDraftNotice(false), 4000);
      } else {
        setFormData({ ...targetTpl.defaultData });
        setSelectedBodyParts(targetTpl.affectedBodyPartsDefault || []);
      }
      setShowValidation(false);
      setCopyError(false);
    }
  }, []);

  const toggleBodyPart = useCallback((partId: string) => {
    setSelectedBodyParts(prev =>
      prev.includes(partId) ? prev.filter(p => p !== partId) : [...prev, partId]
    );
  }, []);

  // Real validation: which of the current template's mandatory fields are still empty.
  const missingMandatoryFields = useMemo(() => {
    return currentTemplate.mandatoryFields.filter(field => !(formData[field] || '').trim());
  }, [currentTemplate, formData]);

  const isFormDirty = useMemo(() => {
    const defaultKeys = Object.keys(currentTemplate.defaultData);
    const changedField = defaultKeys.some(key => (formData[key] || '') !== (currentTemplate.defaultData[key] || ''));
    const defaultParts = (currentTemplate.affectedBodyPartsDefault || []).slice().sort().join(',');
    const currentParts = selectedBodyParts.slice().sort().join(',');
    return changedField || defaultParts !== currentParts;
  }, [formData, selectedBodyParts, currentTemplate]);

  const handleCopyRecord = useCallback(() => {
    if (missingMandatoryFields.length > 0) {
      setShowValidation(true);
      return;
    }
    navigator.clipboard.writeText(recordText).then(() => {
      setCopiedSuccess(true);
      setCopyError(false);
      updateDailyStreak();
      setTimeout(() => setCopiedSuccess(false), 2500);
    }).catch(() => {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingMandatoryFields]);

  const handlePrint = useCallback(() => {
    if (missingMandatoryFields.length > 0) {
      setShowValidation(true);
      return;
    }
    window.print();
    updateDailyStreak();
  }, [missingMandatoryFields]);

  const handleResetToDefault = useCallback(() => {
    if (isFormDirty && !window.confirm('Opravdu chcete obnovit ukázkový vzor? Vaše rozepsané změny v tomto formuláři budou nenávratně přepsány.')) {
      return;
    }
    setFormData({ ...currentTemplate.defaultData });
    setSelectedBodyParts(currentTemplate.affectedBodyPartsDefault || []);
    setShowValidation(false);
    setCopyError(false);
    clearDraft(selectedTemplateId);
  }, [isFormDirty, currentTemplate, selectedTemplateId]);

  const handleClearForm = useCallback(() => {
    if (!window.confirm('Opravdu chcete vymazat celý formulář do prázdna? Tuto akci nelze vrátit zpět.')) {
      return;
    }
    const blank: Record<string, string> = {};
    Object.keys(currentTemplate.defaultData).forEach(key => { blank[key] = ''; });
    setFormData(blank);
    setSelectedBodyParts([]);
    setShowValidation(false);
    setCopyError(false);
    clearDraft(selectedTemplateId);
  }, [currentTemplate, selectedTemplateId]);

  const recordText = useMemo((): string => {
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
        `Vlastní vyhodnocení zakročujícího příslušníka: ${formData.evaluation || ''}\n\n` +
        `${formData.signatureDate || ''}\n` +
        `Podpis zakročujícího: ${formData.officerSignature || ''}\n\n` +
        `ZÁZNAM O POUŽITÍ DONUCOVACÍHO PROSTŘEDKU (Část druhá)\n` +
        `------------------------------------------------------------------\n` +
        `Stanovisko vedoucího oddělení: ${formData.departmentHeadOpinion || ''}\n\n` +
        `Zpráva o prošetření okolností a důvodů (1. ZŘV): ${formData.zrvReport || ''}\n\n` +
        `Rozhodnutí ředitele věznice o oprávněnosti a přiměřenosti: ${formData.directorDecision || ''}`;
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
  }, [selectedTemplateId, formData, selectedBodyParts]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 print:max-w-none print:w-full print:p-0 print:m-0 print:space-y-0 print:pb-0">
      
      {/* Header Banner — purely informative, no action buttons (navigation lives in the segmented control below) */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden no-print print:hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
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
      </div>

      {/* Section navigation — single segmented control (replaces the former duplicated header buttons + sub-tabs bar) */}
      <div role="tablist" aria-label="Sekce modulu Administrativa a ETŘ" className="grid grid-cols-2 sm:grid-cols-4 gap-2 no-print print:hidden">
        {NAV_SECTIONS.map(({ id, label, shortLabel, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              title={label}
              onClick={() => setActiveSection(id)}
              className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: OFFICIAL RECORDS GENERATOR & BODY SCHEME */}
      {activeSection === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block print:w-full print:p-0 print:m-0">
          
          {/* Left Column: Template Selection & Form Fields */}
          <div className="lg:col-span-7 space-y-5 no-print print:hidden">
            
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
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleClearForm}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                    title="Vymazat všechna pole do prázdna"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Vyčistit formulář</span>
                  </button>
                  <button
                    onClick={handleResetToDefault}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                    title="Obnovit ukázkový vzor (přepíše rozepsané změny)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Obnovit vzor</span>
                  </button>
                </div>
              </div>

              {/* Notice regarding mandatory highlighted fields */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <strong>Povinné náležitosti formuláře:</strong> Červeně ohraničená pole jsou dle metodiky VS ČR povinná a nesmí zůstat prázdná. Před zkopírováním či tiskem se vyplnění povinných polí ověřuje. Rozepsaný koncept se průběžně ukládá automaticky do tohoto zařízení.
                </div>
              </div>

              {draftNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Načten dříve rozpracovaný koncept tohoto záznamu z tohoto zařízení.</span>
                </div>
              )}

              {/* SPECIFIC FIELDS FOR DONUCOVACÍ PROSTŘEDEK */}
              {selectedTemplateId === 'dp' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-0`}>
                        Věznice & Adresa <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-0`}
                        type="text"
                        value={formData.prisonName || ''}
                        onChange={(e) => handleFieldChange('prisonName', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-40`}>
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
                            title={cjCopyFailed ? 'Zkopírování do schránky se nezdařilo — označte Č.j. a zkopírujte ručně' : 'Zkopírovat Č.j. do schránky'}
                          >
                            {cjCopyFailed ? (
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                            ) : copiedSuccess ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          {cjCopyFailed && (
                            <span role="alert" className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                              Kopírování selhalo — zkopírujte Č.j. ručně.
                            </span>
                          )}
                        </div>
                      </div>
                      <input
                        id={`${fieldIds}-40`}
                        type="text"
                        value={formData.refNumber || ''}
                        onChange={(e) => handleFieldChange('refNumber', e.target.value)}
                        placeholder="VS-XXXX-1/ČJ-2024-80XXXX-XXX"
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-1`}>
                        Zakročující příslušník (hodnost, jméno, sl. č., zařazení) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-1`}
                        type="text"
                        value={formData.officer || ''}
                        onChange={(e) => handleFieldChange('officer', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-2`}>
                        Velen do služby rozkazem <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-2`}
                        type="text"
                        value={formData.dutyOrder || ''}
                        onChange={(e) => handleFieldChange('dutyOrder', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-3`}>
                        Použito proti komu (jméno, nar., postavení) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-3`}
                        type="text"
                        value={formData.targetPerson || ''}
                        onChange={(e) => handleFieldChange('targetPerson', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-4`}>
                        Kód vězněné osoby <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-4`}
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
                      {/* Popisuje skupinu přepínatelných zón, ne jedno pole. */}
                      <span
                        id={`${fieldIds}-zony`}
                        className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span>Grafické znázornění zasažených míst těla:</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {selectedBodyParts.length} označených zón
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby={`${fieldIds}-zony`}>
                      {BODY_PARTS.map(part => {
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
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-5`}>
                      Datum, čas a přesné místo použití DP <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${fieldIds}-5`}
                      type="text"
                      value={formData.datetimePlace || ''}
                      onChange={(e) => handleFieldChange('datetimePlace', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-6`}>
                      Co předcházelo použití DP <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-6`}
                      rows={2}
                      value={formData.precedingEvents || ''}
                      onChange={(e) => handleFieldChange('precedingEvents', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-7`}>
                      Popis jednání příslušníka (domluva, zákonná výzva vč. doslovné citace) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-7`}
                      rows={3}
                      value={formData.officerAction || ''}
                      onChange={(e) => handleFieldChange('officerAction', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-8`}>
                      Popis jednání vězněné osoby (vč. doslovné citace vulgarismů a projevů) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-8`}
                      rows={2}
                      value={formData.targetBehavior || ''}
                      onChange={(e) => handleFieldChange('targetBehavior', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-9`}>
                      Důvod, jaký DP byl použit, kolikrát, jakým způsobem a na jakou část těla <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-9`}
                      rows={4}
                      value={formData.dpUsedDetails || ''}
                      onChange={(e) => handleFieldChange('dpUsedDetails', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-10`}>
                        Škoda a zranění (odsouzený vs. příslušníci) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id={`${fieldIds}-10`}
                        rows={2}
                        value={formData.injuryDamage || ''}
                        onChange={(e) => handleFieldChange('injuryDamage', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-11`}>
                        Poskytnutí první pomoci (kde a kým) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id={`${fieldIds}-11`}
                        rows={2}
                        value={formData.firstAid || ''}
                        onChange={(e) => handleFieldChange('firstAid', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-12`}>
                        Lékařské ošetření (ZZS, nemocnice) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-12`}
                        type="text"
                        value={formData.medicalExam || ''}
                        onChange={(e) => handleFieldChange('medicalExam', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-13`}>
                        Informování nadřízeného dle § 20 odst. 2 <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-13`}
                        type="text"
                        value={formData.bossInformed || ''}
                        onChange={(e) => handleFieldChange('bossInformed', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-14`}>
                        Fotodokumentace (čas a kým) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-14`}
                        type="text"
                        value={formData.photoDoc || ''}
                        onChange={(e) => handleFieldChange('photoDoc', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-15`}>
                      Vlastní vyhodnocení zakročujícího příslušníka (umístění po zákroku) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-15`}
                      rows={2}
                      value={formData.evaluation || ''}
                      onChange={(e) => handleFieldChange('evaluation', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  {/* ČÁST DRUHÁ — schvalovací řetězec dle Přílohy k PGŘ č. 3/2024 (stanovisko, prošetření 1. ZŘV, rozhodnutí ředitele) */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-900 dark:text-blue-200">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                      <span>
                        <strong>Část druhá záznamu</strong> — o oprávněnosti a přiměřenosti zákroku nerozhoduje zakročující příslušník sám. Tato část se vyplňuje až následně: stanovisko zpracovává vedoucí oddělení, zprávu o prošetření 1. zástupce ředitele věznice (1. ZŘV) a závazné rozhodnutí vydává ředitel věznice.
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-16`}>
                        Stanovisko vedoucího oddělení <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id={`${fieldIds}-16`}
                        rows={2}
                        value={formData.departmentHeadOpinion || ''}
                        onChange={(e) => handleFieldChange('departmentHeadOpinion', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-17`}>
                        Zpráva o prošetření okolností a důvodů (1. ZŘV) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id={`${fieldIds}-17`}
                        rows={2}
                        value={formData.zrvReport || ''}
                        onChange={(e) => handleFieldChange('zrvReport', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-18`}>
                        Rozhodnutí ředitele věznice o oprávněnosti a přiměřenosti <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id={`${fieldIds}-18`}
                        rows={2}
                        value={formData.directorDecision || ''}
                        onChange={(e) => handleFieldChange('directorDecision', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS FOR KÁZEŇSKÝ PŘESTUPEK */}
              {selectedTemplateId === 'zkp' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-19`}>
                        Jméno a příjmení odsouzeného <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-19`}
                        type="text"
                        value={formData.targetPerson || ''}
                        onChange={(e) => handleFieldChange('targetPerson', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-20`}>
                        Datum narození <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-20`}
                        type="text"
                        value={formData.targetBirth || ''}
                        onChange={(e) => handleFieldChange('targetBirth', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-21`}>
                        Typ věznice / stupeň zabezpečení <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-21`}
                        type="text"
                        value={formData.prisonType || ''}
                        onChange={(e) => handleFieldChange('prisonType', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-22`}>
                      Popis skutku (přesný čas, místo, způsob spáchání, porušení § 28 z. 169/1999 Sb. + VŘV) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-22`}
                      rows={6}
                      value={formData.actDescription || ''}
                      onChange={(e) => handleFieldChange('actDescription', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-23`}>
                      Vyjádření podezřelého ze spáchání KP (v přímé řeči doslovně) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${fieldIds}-23`}
                      type="text"
                      value={formData.targetStatement || ''}
                      onChange={(e) => handleFieldChange('targetStatement', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-24`}>
                      Další důkazní prostředky (svědci, záznam o odnětí věci, kamery) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-24`}
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
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-25`}>
                      Název záznamu <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${fieldIds}-25`}
                      type="text"
                      value={formData.docTitle || ''}
                      onChange={(e) => handleFieldChange('docTitle', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-26`}>
                      Velení do služby (datum, číslo rozkazu VO VS, stanoviště) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${fieldIds}-26`}
                      type="text"
                      value={formData.dutyOrder || ''}
                      onChange={(e) => handleFieldChange('dutyOrder', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-27`}>
                      Popis děje a zjištěné skutečnosti (Kdy, Kde, Kdo, Co, Jak, Proč) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-27`}
                      rows={5}
                      value={formData.eventStory || ''}
                      onChange={(e) => handleFieldChange('eventStory', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-28`}>
                      Provedená opatření v časovém sledu (ISS, VISS, VOVS, lékař) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-28`}
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
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-29`}>
                        Datum a čas odnětí věci <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-29`}
                        type="text"
                        value={formData.datetime || ''}
                        onChange={(e) => handleFieldChange('datetime', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-30`}>
                        Vězněná osoba (jméno, nar., typ věznice) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-30`}
                        type="text"
                        value={formData.targetPerson || ''}
                        onChange={(e) => handleFieldChange('targetPerson', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-31`}>
                      Přesný soupis odňatých věcí (výrobní čísla, značka, rozměry, barva, série) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-31`}
                      rows={5}
                      value={formData.itemsList || ''}
                      onChange={(e) => handleFieldChange('itemsList', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-32`}>
                      Důvod odnětí věcí (okolnosti nálezu dle § 12 zákona č. 555/1992 Sb.) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-32`}
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
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-33`}>
                        Jméno napadeného odsouzeného <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-33`}
                        type="text"
                        value={formData.targetPerson || ''}
                        onChange={(e) => handleFieldChange('targetPerson', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-34`}>
                        Identifikační kód <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-34`}
                        type="text"
                        value={formData.targetCode || ''}
                        onChange={(e) => handleFieldChange('targetCode', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-35`}>
                        Ubytování (oddíl, cela) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`${fieldIds}-35`}
                        type="text"
                        value={formData.housingCell || ''}
                        onChange={(e) => handleFieldChange('housingCell', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-36`}>
                      Popis okolností zjištěného případu & prohlídka těla <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-36`}
                      rows={5}
                      value={formData.eventStory || ''}
                      onChange={(e) => handleFieldChange('eventStory', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-37`}>
                      Opatření, informování IDS a VISS & lékařská prohlídka na ZS <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${fieldIds}-37`}
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-38`}>
                    Místo a datum podpisu <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${fieldIds}-38`}
                    type="text"
                    value={formData.signatureDate || ''}
                    onChange={(e) => handleFieldChange('signatureDate', e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor={`${fieldIds}-39`}>
                    Kompletní podpisová doložka příslušníka <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${fieldIds}-39`}
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
          {/* Right Column: Live Formatted Document Preview & Actions */}
          <div className="lg:col-span-5 space-y-4 print:col-span-12 print:w-full print:p-0 print:m-0">

            {/* Validation warning — real check against currentTemplate.mandatoryFields */}
            {showValidation && missingMandatoryFields.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 space-y-1.5 no-print print:hidden">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Nelze zkopírovat / vytisknout — chybí {missingMandatoryFields.length} povinných polí:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5">
                  {missingMandatoryFields.map(field => (
                    <li key={field}>{FIELD_LABELS[field] || field}</li>
                  ))}
                </ul>
              </div>
            )}

            {copyError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-center gap-2 no-print print:hidden">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Kopírování do schránky selhalo (chybí oprávnění nebo nezabezpečený kontext). Zkuste text označit a zkopírovat ručně (Ctrl+C).</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2 flex-wrap no-print print:hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyRecord}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  {copiedSuccess ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSuccess ? 'Zkopírováno!' : 'Kopírovat záznam'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  title="Vytisknout úřední záznam do oficiálního formátu A4 nebo uložit jako PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Vytisknout úřední záznam / PDF</span>
                </button>
              </div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                Oficiální standard VS ČR
              </span>
            </div>

            {/* Document Paper Preview (Screen Only) */}
            <div id="printable-record-area" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-300 dark:border-slate-800 shadow-md font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[60vh] lg:max-h-[750px] whitespace-pre-wrap select-all no-print print:hidden">
              {recordText}
            </div>

            {/* Action Bar below Document Preview */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm no-print print:hidden">
              <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium">Oficiální A4 tiskopis s právním záhlavím, náležitostmi a podpisovými doložkami</span>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-sm cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Vytisknout úřední záznam / PDF</span>
              </button>
            </div>

            {/* Explanatory Note Box */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-1.5 text-xs text-blue-900 dark:text-blue-200 no-print print:hidden">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Metodické upozornění pro závěrečnou zkoušku ZOP:</span>
              </div>
              <p className="text-[11px] leading-normal">
                U ústní i písemné zkoušky komisaři striktně vyžadují dodržení struktury 7 povinných bodů záznamu, přesnou citaci zákonné výzvy dle § 6 odst. 3 písm. b) zákona č. 555/1992 Sb. a správné uvedení porušeného ustanovení § 28 zákona č. 169/1999 Sb. u kázeňského přestupku.
              </p>
            </div>

            {/* =========================================================================
                OFFICIAL ADMINISTRATIVE A4 PRINTABLE DOCUMENT LAYOUTS READY FOR SIGNATURE
               ========================================================================= */}
            <div className="hidden print:block w-full text-black bg-white print:text-black print:bg-white" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
              
              {/* Common Official VS CR Letterhead Header */}
              <div className="border-b-2 border-black pb-2 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-slate-700 uppercase">
                      Česká republika
                    </div>
                    <h1 className="text-sm font-bold uppercase tracking-wider text-black m-0 p-0 leading-tight">
                      VĚZEŇSKÁ SLUŽBA ČESKÉ REPUBLIKY
                    </h1>
                    <h2 className="text-xs font-semibold text-black mt-0.5">
                      {formData.prisonName || 'Věznice'}
                    </h2>
                  </div>
                  <div className="text-right text-xs space-y-0.5">
                    <div className="font-mono font-bold text-black text-xs">
                      {formData.refNumber ? `Č. j.: ${formData.refNumber}` : 'Č. j.: VS-......................../ČJ-2024-........'}
                    </div>
                    <div className="text-slate-700 text-[11px]">
                      Datum vyhotovení: {formData.signatureDate || new Date().toLocaleDateString('cs-CZ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* TEMPLATE 1: DONUCOVACÍ PROSTŘEDEK (DP) */}
              {selectedTemplateId === 'dp' && (
                <div>
                  <div className="text-center my-3">
                    <h2 className="text-base font-black uppercase tracking-wide text-black m-0 p-0">
                      ÚŘEDNÍ ZÁZNAM o použití donucovacích prostředků
                    </h2>
                    <p className="text-[11px] font-bold text-slate-800 italic mt-0.5">
                      (podle § 17 zákona č. 555/1992 Sb., o Vězeňské službě a justiční stráži ČR)
                    </p>
                    <div className="mt-1.5 inline-block px-3 py-0.5 bg-slate-100 border border-slate-400 font-bold text-[11px] uppercase tracking-wider text-black">
                      Část první – Vyhotovení zakročujícím příslušníkem (Příloha k PGŘ č. 3/2024)
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="print-card my-3 border border-slate-400 text-xs">
                    <div className="grid grid-cols-2 border-b border-slate-300">
                      <div className="p-2 border-r border-slate-300">
                        <strong>Zakročující příslušník:</strong> {formData.officer}
                      </div>
                      <div className="p-2">
                        <strong>Velen do služby rozkazem:</strong> {formData.dutyOrder}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-300">
                      <div className="p-2 border-r border-slate-300">
                        <strong>Použito proti:</strong> {formData.targetPerson} {formData.targetCode ? `(identifikační kód: ${formData.targetCode})` : ''}
                      </div>
                      <div className="p-2">
                        <strong>Záznam z osobní kamery:</strong> {formData.cameraUsed || 'ANO'}
                      </div>
                    </div>
                    <div className="p-2">
                      <strong>Čas a místo zákroku:</strong> {formData.datetimePlace}
                    </div>
                  </div>

                  {/* Body impact zones */}
                  <div className="print-card my-2 p-2 border border-slate-300 text-xs">
                    <strong>Zasažená místa těla dle schématu zásahových zón:</strong>{' '}
                    {selectedBodyParts.length > 0 ? selectedBodyParts.join(', ') : 'Bez zasažení rizikových zón'}
                  </div>

                  {/* Structured Report Sections */}
                  <div className="space-y-2 text-xs">
                    <div className="print-card p-2.5 border border-slate-300">
                      <div className="font-bold text-black mb-0.5">1. Události předcházející použití DP:</div>
                      <p className="whitespace-pre-wrap">{formData.precedingEvents}</p>
                    </div>

                    <div className="print-card p-2.5 border border-slate-300">
                      <div className="font-bold text-black mb-0.5">2. Zákonná výzva a jednání příslušníka dle § 6 odst. 3 písm. b):</div>
                      <p className="whitespace-pre-wrap">{formData.officerAction}</p>
                    </div>

                    <div className="print-card p-2.5 border border-slate-300">
                      <div className="font-bold text-black mb-0.5">3. Jednání vězněné osoby (včetně přímé řeči a projevů agrese):</div>
                      <p className="whitespace-pre-wrap">{formData.targetBehavior}</p>
                    </div>

                    <div className="print-card p-2.5 border border-slate-300">
                      <div className="font-bold text-black mb-0.5">4. Použitý donucovací prostředek a průběh zákroku:</div>
                      <p className="whitespace-pre-wrap">{formData.dpUsedDetails}</p>
                    </div>

                    <div className="print-card p-2.5 border border-slate-300">
                      <div className="font-bold text-black mb-1">5. Činnost po použití donucovacího prostředku (zranění a ošetření):</div>
                      <ul className="list-disc list-inside space-y-0.5 pl-1">
                        <li><strong>Zranění osob a vzniklá škoda:</strong> {formData.injuryDamage || 'Bez zranění a škody'}</li>
                        <li><strong>Poskytnutí první pomoci:</strong> {formData.firstAid || 'Nebylo nutné'}</li>
                        <li><strong>Lékařské ošetření:</strong> {formData.medicalExam || 'Provedeno lékařem'}</li>
                        <li><strong>Ohlášení nadřízenému (§ 20 odst. 2):</strong> {formData.bossInformed || 'Provedeno ihned'}</li>
                        <li><strong>Fotodokumentace:</strong> {formData.photoDoc || 'Pořízena'}</li>
                      </ul>
                    </div>

                    <div className="print-card p-2.5 border border-slate-300">
                      <div className="font-bold text-black mb-0.5">6. Svědci události a další zúčastněné osoby:</div>
                      <p className="whitespace-pre-wrap">{formData.witnesses || 'Beze svědků'}</p>
                    </div>

                    <div className="print-card p-2.5 border border-slate-300">
                      <div className="font-bold text-black mb-0.5">7. Vlastní vyhodnocení zakročujícího příslušníka:</div>
                      <p className="whitespace-pre-wrap">{formData.evaluation}</p>
                    </div>
                  </div>

                  {/* Officer Signature Block & Shift Commander Acknowledgment */}
                  <div
                    className="print-avoid-break break-inside-avoid mt-4 pt-3 border-t-2 border-black text-xs"
                    style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                  >
                    <div className="font-bold text-xs uppercase tracking-wider mb-2 text-black">
                      Úřední zakončení první části – stvrzení a převzetí záznamu
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-slate-400 p-2.5 rounded bg-white">
                        <div className="space-y-1 text-[11px]">
                          <div><strong>Místo a datum vyhotovení:</strong> {formData.signatureDate || '........................................'}</div>
                          <div><strong>Čas sepsání záznamu:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[11px] font-bold text-black">Vlastnoruční podpis zasahujícího příslušníka</div>
                          <div className="text-[10px] text-slate-700 font-mono mt-0.5">
                            {formData.officerSignature || formData.officer || 'hodnost, jméno, služební číslo'}
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-400 p-2.5 rounded bg-white">
                        <div className="space-y-1 text-[11px]">
                          <div><strong>Záznam převzal:</strong> velitel směny / oddělení</div>
                          <div><strong>Datum a čas převzetí:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[11px] font-bold text-black">Podpis velitele směny / oddělení</div>
                          <div className="text-[10px] text-slate-700 mt-0.5">
                            (potvrzení převzetí k dalšímu služebnímu postupu)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Part Two - Supervisors evaluation */}
                  <div
                    className="print-avoid-break break-inside-avoid mt-6 pt-4 border-t-2 border-black text-xs"
                    style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                  >
                    <div className="text-center mb-3">
                      <div className="font-bold text-xs uppercase tracking-wider text-black">
                        ČÁST DRUHÁ – STANOVISKA A ROZHODNUTÍ SLUŽEBNÍCH FUNKCIONÁŘŮ (Příloha k PGŘ č. 3/2024)
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="print-card p-2.5 border border-slate-300">
                        <div className="font-bold text-black mb-1">Stanovisko vedoucího oddělení / oddílu:</div>
                        <p className="min-h-[28px] whitespace-pre-wrap">{formData.departmentHeadOpinion || 'Použití DP shledávám oprávněným a v souladu se zákonem č. 555/1992 Sb.'}</p>
                        <div className="mt-4 flex justify-between text-[10px] text-slate-700">
                          <span>Datum: ........................................</span>
                          <span>Podpis vedoucího oddělení: ....................................................</span>
                        </div>
                      </div>

                      <div className="print-card p-2.5 border border-slate-300">
                        <div className="font-bold text-black mb-1">Zpráva o prošetření okolností a důvodů použití DP (1. ZŘV):</div>
                        <p className="min-h-[28px] whitespace-pre-wrap">{formData.zrvReport || 'Okolnosti použití DP byly prošetřeny, postup příslušníka byl v mezích zákona.'}</p>
                        <div className="mt-4 flex justify-between text-[10px] text-slate-700">
                          <span>Datum: ........................................</span>
                          <span>Podpis 1. zástupce ředitele: ....................................................</span>
                        </div>
                      </div>

                      <div className="print-card p-2.5 border border-slate-300">
                        <div className="font-bold text-black mb-1">Rozhodnutí ředitele věznice o oprávněnosti a přiměřenosti (§ 20 odst. 4):</div>
                        <p className="min-h-[28px] whitespace-pre-wrap">{formData.directorDecision || 'Použití donucovacího prostředku bylo OPRÁVNĚNÉ a PŘIMĚŘENÉ.'}</p>
                        <div className="mt-6 flex justify-between text-[10px] text-slate-700">
                          <span>Datum: ........................................</span>
                          <span>Otisk úředního razítka a podpis ředitele věznice: ....................................................</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATE 2: KÁZEŇSKÝ PŘESTUPEK (ZKP) */}
              {selectedTemplateId === 'zkp' && (
                <div>
                  <div className="text-center my-3">
                    <h2 className="text-base font-black uppercase tracking-wide text-black m-0 p-0">
                      ÚŘEDNÍ ZÁZNAM O KÁZEŇSKÉM PŘESTUPKU
                    </h2>
                    <p className="text-[11px] font-bold text-slate-800 italic mt-0.5">
                      podle § 46 zákona č. 169/1999 Sb., o výkonu trestu odnětí svobody a NGŘ č. 41/2024
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="print-card my-3 border border-slate-400 text-xs">
                    <div className="grid grid-cols-2 border-b border-slate-300">
                      <div className="p-2 border-r border-slate-300">
                        <strong>Jméno a příjmení odsouzeného:</strong> {formData.targetPerson}
                      </div>
                      <div className="p-2">
                        <strong>Datum narození:</strong> {formData.targetBirth}
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="p-2 border-r border-slate-300">
                        <strong>Typ věznice / oddělení:</strong> {formData.prisonType}
                      </div>
                      <div className="p-2">
                        <strong>Datum a čas sepsání:</strong> {formData.signatureDate}
                      </div>
                    </div>
                  </div>

                  {/* Content Sections */}
                  <div className="space-y-3 text-xs">
                    <div className="print-card p-3 border border-slate-300">
                      <div className="font-bold text-black mb-1">
                        I. Popis skutku, v němž je spatřován kázeňský přestupek:
                      </div>
                      <p className="whitespace-pre-wrap">{formData.actDescription}</p>
                    </div>

                    <div className="print-card p-3 border border-slate-300">
                      <div className="font-bold text-black mb-1">
                        II. Vyjádření podezřelého ze spáchání kázeňského přestupku:
                      </div>
                      <p className="whitespace-pre-wrap">{formData.targetStatement}</p>
                      <div className="mt-8 flex justify-between items-end pt-2">
                        <span className="text-[10px] text-slate-600">Vyjádření převzato dne: {formData.signatureDate}</span>
                        <div className="text-center">
                          <div className="w-56 border-b border-dotted border-black mb-1"></div>
                          <span className="text-[10px] font-bold text-black">Vlastnoruční podpis odsouzeného</span>
                        </div>
                      </div>
                    </div>

                    <div className="print-card p-3 border border-slate-300">
                      <div className="font-bold text-black mb-1">
                        III. Důkazní prostředky a zjištěné skutečnosti:
                      </div>
                      <p className="whitespace-pre-wrap">{formData.evidenceList}</p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div
                    className="print-avoid-break break-inside-avoid mt-6 pt-3 border-t-2 border-black text-xs"
                    style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                  >
                    <div className="font-bold text-xs uppercase tracking-wider mb-2 text-black">
                      Úřední zakončení – podpisy a převzetí záznamu o přestupku
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-slate-400 p-2.5 rounded bg-white">
                        <div className="space-y-1 text-[11px]">
                          <div><strong>Místo a datum:</strong> {formData.signatureDate}</div>
                          <div><strong>Čas sepsání:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[11px] font-bold text-black">Vlastnoruční podpis oznamujícího příslušníka</div>
                          <div className="text-[10px] text-slate-700 font-mono mt-0.5">
                            {formData.officerSignature || 'hodnost, jméno, služební číslo'}
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-400 p-2.5 rounded bg-white">
                        <div className="space-y-1 text-[11px]">
                          <div><strong>Záznam převzal:</strong> vedoucí oddělení / velitel oddílu</div>
                          <div><strong>Datum a čas převzetí:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[11px] font-bold text-black">Podpis vedoucího oddělení / velitele oddílu</div>
                          <div className="text-[10px] text-slate-700 mt-0.5">
                            (převzetí k zahájení kázeňského řízení)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATE 3: ODNĚTÍ VĚCI */}
              {selectedTemplateId === 'odneti' && (
                <div>
                  <div className="text-center my-3">
                    <h2 className="text-base font-black uppercase tracking-wide text-black m-0 p-0">
                      ÚŘEDNÍ ZÁZNAM O ODNĚTÍ VĚCI
                    </h2>
                    <p className="text-[11px] font-bold text-slate-800 italic mt-0.5">
                      podle § 12 zákona č. 555/1992 Sb., o Vězeňské službě a justiční stráži České republiky
                    </p>
                  </div>

                  <div className="print-card my-3 border border-slate-400 text-xs">
                    <div className="grid grid-cols-2">
                      <div className="p-2 border-r border-slate-300">
                        <strong>Vězněná osoba (od koho odňato):</strong> {formData.targetPerson}
                      </div>
                      <div className="p-2">
                        <strong>Čas a datum odnětí:</strong> {formData.datetime}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="print-card p-3 border border-slate-300">
                      <div className="font-bold text-black mb-1">
                        I. Seznam a přesný popis odňatých věcí (včetně množství a stavu):
                      </div>
                      <p className="whitespace-pre-wrap font-mono text-[11px]">{formData.itemsList}</p>
                    </div>

                    <div className="print-card p-3 border border-slate-300">
                      <div className="font-bold text-black mb-1">
                        II. Důvod odnětí věcí (ustanovení zákona, bezpečnostní riziko):
                      </div>
                      <p className="whitespace-pre-wrap">{formData.seizureReason}</p>
                    </div>

                    <div className="print-card p-3 border border-slate-300">
                      <div className="font-bold text-black mb-1">
                        III. Předání a naložení s odňatou věcí:
                      </div>
                      <p className="whitespace-pre-wrap">{formData.surrenderedTo}</p>
                    </div>
                  </div>

                  {/* Signatures 3 blocks */}
                  <div
                    className="print-avoid-break break-inside-avoid mt-6 pt-4 border-t-2 border-black grid grid-cols-3 gap-4 text-center text-xs"
                    style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                  >
                    <div className="border border-slate-400 p-2 rounded bg-white">
                      <div className="w-full border-b border-dotted border-black h-8 mb-1"></div>
                      <div className="font-bold text-black">Podpis vězněné osoby</div>
                      <div className="text-[10px] text-slate-700">(potvrzení o odnětí věci)</div>
                    </div>
                    <div className="border border-slate-400 p-2 rounded bg-white">
                      <div className="w-full border-b border-dotted border-black h-8 mb-1"></div>
                      <div className="font-bold text-black">Odnětí provedl</div>
                      <div className="text-[10px] text-slate-700 font-mono">{formData.officerSignature || 'příslušník VS ČR'}</div>
                    </div>
                    <div className="border border-slate-400 p-2 rounded bg-white">
                      <div className="w-full border-b border-dotted border-black h-8 mb-1"></div>
                      <div className="font-bold text-black">Věc převzal do úschovy</div>
                      <div className="text-[10px] text-slate-700">(sklad / pověřená osoba)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATE 4: SLUŽEBNÍ ZÁZNAM (SZ) */}
              {(selectedTemplateId === 'sz' || (selectedTemplateId !== 'dp' && selectedTemplateId !== 'zkp' && selectedTemplateId !== 'odneti')) && (
                <div>
                  <div className="text-center my-3">
                    <h2 className="text-base font-black uppercase tracking-wide text-black m-0 p-0">
                      {formData.docTitle || 'SLUŽEBNÍ ZÁZNAM'}
                    </h2>
                    <p className="text-[11px] font-bold text-slate-800 italic mt-0.5">
                      podle Pokynu generálního ředitele VS ČR č. 4/2016 o spisové službě
                    </p>
                  </div>

                  <div className="print-card my-3 border border-slate-400 text-xs">
                    <div className="grid grid-cols-2">
                      <div className="p-2 border-r border-slate-300">
                        <strong>Velení do služby:</strong> {formData.dutyOrder}
                      </div>
                      <div className="p-2">
                        <strong>Datum sepsání:</strong> {formData.signatureDate}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="print-card p-3 border border-slate-300">
                      <div className="font-bold text-black mb-1">I. Popis děje a zjištěné skutečnosti:</div>
                      <p className="whitespace-pre-wrap">{formData.eventStory}</p>
                    </div>

                    <div className="print-card p-3 border border-slate-300">
                      <div className="font-bold text-black mb-1">II. Provedená opatření a řešení situace:</div>
                      <p className="whitespace-pre-wrap">{formData.actionsTimeline}</p>
                    </div>

                    <div className="print-card p-3 border border-slate-300">
                      <div className="font-bold text-black mb-1">III. Svědci / další zúčastněné osoby:</div>
                      <p className="whitespace-pre-wrap">{formData.witnesses || 'Beze svědků'}</p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div
                    className="print-avoid-break break-inside-avoid mt-6 pt-3 border-t-2 border-black text-xs"
                    style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                  >
                    <div className="font-bold text-xs uppercase tracking-wider mb-2 text-black">
                      Úřední zakončení služebního záznamu
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-slate-400 p-2.5 rounded bg-white">
                        <div className="space-y-1 text-[11px]">
                          <div><strong>Místo a datum:</strong> {formData.signatureDate}</div>
                          <div><strong>Čas vyhotovení:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[11px] font-bold text-black">Vyhotovil příslušník / zaměstnanec</div>
                          <div className="text-[10px] text-slate-700 font-mono mt-0.5">
                            {formData.officerSignature || 'hodnost, jméno, služební číslo'}
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-400 p-2.5 rounded bg-white">
                        <div className="space-y-1 text-[11px]">
                          <div><strong>Vzal na vědomí:</strong> velitel směny / nadřízený</div>
                          <div><strong>Datum a čas:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[11px] font-bold text-black">Podpis nadřízeného</div>
                          <div className="text-[10px] text-slate-700 mt-0.5">
                            (kontrola formálních a věcných náležitostí)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* SECTION 2: ETŘ SIMULATOR */}
      {activeSection === 'etr' && <PrisonAdminETR />}

      {/* SECTION 3: VIS */}
      {activeSection === 'vis' && <PrisonAdminVIS />}

      {/* SECTION 4: 7 GOLDEN RULES OF STYLE */}
      {activeSection === 'style-rules' && <PrisonAdminStyleRules />}

    </div>
  );
}
