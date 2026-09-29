import React, { useState, useMemo, useEffect, useCallback, useRef, useId } from 'react';
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Printer,
  Lock,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Info,
  Zap,
  Eraser,
  Search,
  Trash2,
} from 'lucide-react';
import { updateDailyStreak } from '../utils/gamification';
import PrisonAdminETR from './prison-admin/PrisonAdminETR';
import PrisonAdminVIS from './prison-admin/PrisonAdminVIS';
import PrisonAdminStyleRules from './prison-admin/PrisonAdminStyleRules';
import ConfirmDialog from './common/ConfirmDialog';
import { useStorageOwner } from '../hooks/useProgressRevision';
import { readScoped, removeScoped, writeScoped } from '../utils/userScopedStorage';
import {
  BODY_PARTS,
  FIELD_LABELS,
  RECORD_TEMPLATE_MANDATORY_FIELDS,
  RecordTemplate,
  defaultRecordTemplates,
} from '../data/prisonAdminData';
import { useAuth } from '../context/AuthContext';
import { useEditableContent } from '../hooks/useEditableContent';
import ContentEditorBar from './common/ContentEditorBar';
import RecordTemplateEditModal from './common/RecordTemplateEditModal';

/**
 * Náhradní tiskopis, když lektor všechny skryl nebo odebral. Hooky níže
 * potřebují objekt i tehdy; obrazovka místo formuláře ukáže upozornění.
 */
const EMPTY_TEMPLATE: RecordTemplate = {
  id: '',
  title: '',
  subtitle: '',
  badge: '',
  normReference: '',
  defaultData: {},
};

/** Drží formulář přesně ukázkový vzor daného tiskopisu? */
function matchesTemplate(
  formData: Record<string, string>,
  bodyParts: string[],
  tpl: RecordTemplate
): boolean {
  const sameFields = Object.keys(tpl.defaultData).every(
    (key) => (formData[key] || '') === (tpl.defaultData[key] || '')
  );
  const sameParts =
    (tpl.affectedBodyPartsDefault || []).slice().sort().join(',') === bodyParts.slice().sort().join(',');
  return sameFields && sameParts;
}

const BUILT_IN_TEMPLATES = new Map(defaultRecordTemplates.map((t) => [t.id, t]));

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

/**
 * Klíč rozepsaného konceptu.
 *
 * SOUKROMÍ — PROČ MÁ PREFIX `vscr_` A ID ÚČTU: koncept obsahuje jméno, datum
 * narození a identifikační kód vězněné osoby, popis zranění a lékařské
 * ošetření. Dřív se ukládal pod klíč `vs-cr-admin-draft:<šablona>`, tedy
 * společný pro celý prohlížeč a bez vazby na uživatele — na sdíleném počítači
 * v učebně se rozepsaný záznam načetl dalšímu studentovi, který si formulář
 * otevřel, a odhlášení nic nesmazalo. Starý prefix navíc nezačínal `vscr_`,
 * takže by ho přehlédl jakýkoli úklid podle prefixu.
 */
const DRAFT_KEY_BASE = 'vscr_admin_draft';

/** Základ klíče pro danou šablonu; id účtu doplní userScopedStorage. */
function draftKey(templateId: string): string {
  return `${DRAFT_KEY_BASE}:${templateId}`;
}

interface RecordDraft {
  formData: Record<string, string>;
  selectedBodyParts: string[];
}

function loadDraft(templateId: string): RecordDraft | null {
  const parsed = readScoped<RecordDraft | null>(draftKey(templateId), null);
  if (parsed && typeof parsed === 'object' && parsed.formData) return parsed;
  return null;
}

function saveDraft(templateId: string, draft: RecordDraft) {
  writeScoped(draftKey(templateId), draft);
}

function clearDraft(templateId: string) {
  removeScoped(draftKey(templateId));
}

/** Smaže rozepsané koncepty všech šablon přihlášeného uživatele. */
function clearAllDrafts(templateIds: string[]) {
  templateIds.forEach(clearDraft);
}

/**
 * Odklidí koncepty uložené starou, nezabezpečenou podobou klíče.
 *
 * Nepřevádí se na nový klíč: nikdo neví, komu z dřívějších uživatelů
 * zařízení data patřila, a jde o osobní údaje vězněných osob. Poctivé je
 * je zahodit.
 */
function purgeLegacyDrafts(): void {
  if (typeof window === 'undefined') return;
  try {
    const stale = Object.keys(localStorage).filter((key) => key.startsWith('vs-cr-admin-draft:'));
    stale.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Nedostupné localStorage (anonymní režim) — není co uklízet.
  }
}

export default function PrisonAdministration() {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const { profile } = useAuth();
  const canEdit = profile?.role === 'lektor' || profile?.role === 'admin';

  // Tiskopisy z repozitáře přepsané úpravami lektora (contentLibrary.ts,
  // druh 'admin_template'). Lektor mění popis a ukázkový vzor vyplnění;
  // rozvržení formuláře a tisku zůstává v kódu níže.
  const templateContent = useEditableContent<RecordTemplate>('admin_template', defaultRecordTemplates, canEdit);
  const templates = templateContent.items;
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const [activeSection, setActiveSection] = useState<AdminSection>('generator');

  // Generator state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('dp');
  const [formData, setFormData] = useState<Record<string, string>>(() => defaultRecordTemplates[0].defaultData);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>(() => defaultRecordTemplates[0].affectedBodyPartsDefault || []);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [copyError, setCopyError] = useState(false);
  /** Selhalo kopírování Č.j. Vlastní stav, protože `copyError` patří k tlačítku „Kopírovat záznam". */
  const [cjCopyFailed, setCjCopyFailed] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [draftNotice, setDraftNotice] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Potvrzení obnovení vzoru / vymazání formuláře / smazání konceptů. */
  const [pendingFormAction, setPendingFormAction] = useState<'reset' | 'clear' | 'purge' | null>(null);

  // Změní-li se vlastník úložiště (přihlášení / odhlášení), koncepty se
  // načtou znovu — jinak by v formuláři zůstal cizí rozepsaný záznam.
  //
  // Vlastník, ne revize úložiště: revize se zvedá každým zápisem, tedy i
  // automatickým uložením konceptu níže. Načtení konceptu pak vrátilo do
  // formuláře nový objekt, ten spustil další uložení a tak dokola — každých
  // 400 ms zápis do localStorage a překreslení celé aplikace, dokud byla
  // záložka otevřená.
  const draftsOwner = useStorageOwner();

  // Zvolený tiskopis mohl lektor skrýt či odebrat — pak se ukáže první
  // dostupný. Všechno níže proto pracuje s `templateId`, ne se zvoleným id.
  const currentTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) ?? templates[0] ?? EMPTY_TEMPLATE;
  }, [templates, selectedTemplateId]);
  const templateId = currentTemplate.id;

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

  /**
   * Šablona, jejíž data právě drží `formData`.
   *
   * Autosave podle toho pozná, že formulář ještě nese obsah předchozí šablony,
   * a neuloží ho pod klíč té nové.
   */
  const loadedTemplateRef = useRef<string | null>(null);

  /**
   * Načtení konceptu pro zvolenou šablonu.
   *
   * Dřív to bylo rozdělené na efekt „jen při připojení“ (s `eslint-disable`
   * na chybějící závislost, což AGENTS.md zakazuje) a na tutéž logiku znovu
   * v `handleSelectTemplate`. Jeden efekt se závislostí na zvoleném tiskopisu
   * dělá totéž, obsluhuje i přepnutí šablony a nic nemlčí.
   */
  useEffect(() => {
    // Koncepty ze staré, nezabezpečené podoby klíče se zahodí.
    purgeLegacyDrafts();

    const tpl = currentTemplate;
    if (!tpl.id) return;
    let draft = loadDraft(tpl.id);

    // Dřív se koncept ukládal i nerozepsaný, takže mnoho zařízení má uložený
    // jen původní vzor z aplikace. Takový „koncept“ by zakryl vzor, který
    // mezitím upravil lektor — nic rozepsaného v něm není, proto se zahodí.
    const builtIn = BUILT_IN_TEMPLATES.get(tpl.id);
    if (draft && builtIn && builtIn !== tpl && matchesTemplate(draft.formData, draft.selectedBodyParts || [], builtIn)) {
      clearDraft(tpl.id);
      draft = null;
    }

    setShowValidation(false);
    setCopyError(false);

    if (draft) {
      setFormData(draft.formData);
      setSelectedBodyParts(draft.selectedBodyParts || []);
      loadedTemplateRef.current = tpl.id;
      setDraftNotice(true);
      const timer = window.setTimeout(() => setDraftNotice(false), 4000);
      return () => clearTimeout(timer);
    }

    setFormData({ ...tpl.defaultData });
    setSelectedBodyParts(tpl.affectedBodyPartsDefault || []);
    loadedTemplateRef.current = tpl.id;
    // Závislost na celém tiskopisu, ne jen na id: když se po načtení
    // překryvu objeví lektorem upravený vzor, formulář se na něj přepne.
    // Objekt tiskopisu je stabilní, dokud se jeho obsah nezmění.
  }, [currentTemplate, draftsOwner]);

  const isFormDirty = useMemo(
    () => !matchesTemplate(formData, selectedBodyParts, currentTemplate),
    [formData, selectedBodyParts, currentTemplate]
  );

  // Autosave the in-progress record as a draft (debounced) so a reload/tab-close doesn't lose it.
  useEffect(() => {
    // Formulář ještě nese obsah předchozí šablony — ukládat ho pod klíč té
    // nové by data prohodilo.
    if (!templateId || loadedTemplateRef.current !== templateId) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      // Ukládá se jen skutečně rozepsaný záznam. Nerozepsaný vzor jako
      // koncept by po úpravě vzoru lektorem dál ukazoval ten starý.
      if (isFormDirty) {
        saveDraft(templateId, { formData, selectedBodyParts });
      } else {
        clearDraft(templateId);
      }
    }, 400);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [formData, selectedBodyParts, templateId, isFormDirty]);

  /** Přepnutí šablony. Načtení konceptu obstará efekt výše. */
  const handleSelectTemplate = useCallback((tplId: string) => {
    setSelectedTemplateId(tplId);
  }, []);

  const toggleBodyPart = useCallback((partId: string) => {
    setSelectedBodyParts(prev =>
      prev.includes(partId) ? prev.filter(p => p !== partId) : [...prev, partId]
    );
  }, []);

  // Real validation: which of the current template's mandatory fields are still empty.
  const missingMandatoryFields = useMemo(() => {
    return (RECORD_TEMPLATE_MANDATORY_FIELDS[currentTemplate.id] ?? []).filter(field => !(formData[field] || '').trim());
  }, [currentTemplate, formData]);


  const handlePrint = useCallback(() => {
    if (missingMandatoryFields.length > 0) {
      setShowValidation(true);
      return;
    }
    window.print();
    updateDailyStreak();
  }, [missingMandatoryFields]);

  const handleResetToDefault = useCallback(() => {
    // Nerozepsaný formulář není o co přijít — potvrzení nemá koho zdržovat.
    if (!isFormDirty) {
      setFormData({ ...currentTemplate.defaultData });
      setSelectedBodyParts(currentTemplate.affectedBodyPartsDefault || []);
      setShowValidation(false);
      setCopyError(false);
      clearDraft(templateId);
      return;
    }
    setPendingFormAction('reset');
  }, [isFormDirty, currentTemplate, templateId]);

  const doResetToDefault = useCallback(() => {
    setFormData({ ...currentTemplate.defaultData });
    setSelectedBodyParts(currentTemplate.affectedBodyPartsDefault || []);
    setShowValidation(false);
    setCopyError(false);
    clearDraft(templateId);
    setPendingFormAction(null);
  }, [currentTemplate, templateId]);

  const handleClearForm = useCallback(() => {
    setPendingFormAction('clear');
  }, []);

  const doClearForm = useCallback(() => {
    const blank: Record<string, string> = {};
    Object.keys(currentTemplate.defaultData).forEach(key => { blank[key] = ''; });
    setFormData(blank);
    setSelectedBodyParts([]);
    setShowValidation(false);
    setCopyError(false);
    clearDraft(templateId);
    setPendingFormAction(null);
  }, [currentTemplate, templateId]);

  /**
   * Smaže rozepsané koncepty VŠECH šablon.
   *
   * Dosud taková možnost v rozhraní nebyla vůbec: koncepty s osobními údaji
   * vězněných osob se ukládaly automaticky a uživatel je neměl jak odstranit.
   */
  const doPurgeDrafts = useCallback(() => {
    // Všechny známé tiskopisy, i ty, které lektor právě skryl.
    clearAllDrafts(defaultRecordTemplates.map((t) => t.id));
    setFormData({ ...currentTemplate.defaultData });
    setSelectedBodyParts(currentTemplate.affectedBodyPartsDefault || []);
    setShowValidation(false);
    setCopyError(false);
    setPendingFormAction(null);
  }, [currentTemplate]);

  const recordText = useMemo((): string => {
    if (templateId === 'dp') {
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
    } else if (templateId === 'zkp') {
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
    } else if (templateId === 'odneti') {
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
  }, [templateId, formData, selectedBodyParts]);

  // Pod recordText, aby text šel do závislostí — dřív se kopíroval text
  // z prvního vykreslení a umlčení pravidla to skrývalo.
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
  }, [missingMandatoryFields, recordText]);

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

      {/* Správa tiskopisů — jen lektor a správce. Přidat nový tiskopis nejde:
          formulář i tisková podoba každého jsou v kódu. */}
      {activeSection === 'generator' && canEdit && (
        <>
          <ContentEditorBar
            content={templateContent}
            targets={templateContent.entries.filter((e) => e.id === templateId && !e.isDeleted)}
            deleted={templateContent.entries.filter((e) => e.isDeleted)}
            getName={(t) => t.title}
            noun="tiskopis"
            onEdit={() => setTemplateModalOpen(true)}
          />
          <RecordTemplateEditModal
            template={templateId ? currentTemplate : null}
            isOpen={templateModalOpen}
            onClose={() => setTemplateModalOpen(false)}
            onSave={(t) => templateContent.save(t)}
          />
        </>
      )}

      {activeSection === 'generator' && templates.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8 no-print print:hidden">
          V generátoru teď nejsou žádné tiskopisy{canEdit ? ' — vraťte některý z přehledu odebraných.' : '.'}
        </p>
      )}

      {/* SECTION 1: OFFICIAL RECORDS GENERATOR & BODY SCHEME */}
      {activeSection === 'generator' && templates.length > 0 && (
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
                {templates.map(tpl => {
                  const isSelected = tpl.id === templateId;
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
                      <div className={`text-[0.625rem] truncate ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
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
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                    title="Vymazat všechna pole do prázdna"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Vyčistit formulář</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                    title="Obnovit ukázkový vzor (přepíše rozepsané změny)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Obnovit vzor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingFormAction('purge')}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5 cursor-pointer"
                    title="Smazat rozepsané koncepty všech tiskopisů z tohoto zařízení"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Smazat koncepty</span>
                  </button>
                </div>
              </div>

              {/* Upozornění na osobní údaje.
                  Formulář se průběžně ukládá do prohlížeče a obsahuje jméno,
                  datum narození a kód vězněné osoby i popis zranění. Bez
                  tohohle textu uživatel netuší, že po sobě má co uklízet. */}
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-200">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div>
                  <strong>Cvičný trenažér — nezadávejte skutečné osobní údaje.</strong> Rozepsaný
                  koncept se automaticky ukládá do <strong>tohoto prohlížeče</strong> (jen pro váš
                  účet) a zůstane tam, dokud ho nesmažete tlačítkem <em>Smazat koncepty</em>. Na
                  sdíleném počítači proto používejte cvičná jména a kódy; skutečný záznam
                  o vězněné osobě patří výhradně do ETŘ, ne do studijní aplikace.
                </div>
              </div>

              {/* Notice regarding mandatory highlighted fields */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <strong>Povinné náležitosti formuláře:</strong> Červeně ohraničená pole jsou dle metodiky VS ČR povinná a nesmí zůstat prázdná. Před zkopírováním či tiskem se vyplnění povinných polí ověřuje.
                </div>
              </div>

              {draftNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Načten dříve rozpracovaný koncept tohoto záznamu z tohoto zařízení.</span>
                </div>
              )}

              {/* SPECIFIC FIELDS FOR DONUCOVACÍ PROSTŘEDEK */}
              {templateId === 'dp' && (
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
                            className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-[0.625rem] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Vygenerovat cvičné Č.j. ve formátu VS ČR (náhodné číslo, není přidělené)"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Cvičné Č.j.</span>
                          </button>
                          <button
                            type="button"
                            onClick={copyCJ}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[0.625rem] transition-colors cursor-pointer"
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
                            <span role="alert" className="text-[0.625rem] font-semibold text-red-600 dark:text-red-400">
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
                        placeholder="VS-XXXX-1/ČJ-RRRR-80XXXX-XXX"
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
                      <span className="text-[0.6875rem] text-slate-500">
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
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[0.6875rem] text-blue-900 dark:text-blue-200">
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
              {templateId === 'zkp' && (
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
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium font-mono text-[0.6875rem]"
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
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium font-mono text-[0.6875rem]"
                    />
                  </div>
                </div>
              )}

              {/* SPECIFIC FIELDS FOR SLUŽEBNÍ ZÁZNAM */}
              {templateId === 'sz' && (
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
              {templateId === 'odneti' && (
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
                      className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium font-mono text-[0.6875rem]"
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
              {templateId === 'nasilie' && (
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
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium font-mono text-[0.6875rem]"
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
              <span className="text-[0.6875rem] font-bold text-amber-600 dark:text-amber-400">
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
                <span className="text-[0.6875rem] sm:text-xs font-medium">Oficiální A4 tiskopis s právním záhlavím, náležitostmi a podpisovými doložkami</span>
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
              <p className="text-[0.6875rem] leading-normal">
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
                    <div className="text-[0.625rem] font-bold tracking-widest text-slate-700 uppercase">
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
                    <div className="text-slate-700 text-[0.6875rem]">
                      Datum vyhotovení: {formData.signatureDate || new Date().toLocaleDateString('cs-CZ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* TEMPLATE 1: DONUCOVACÍ PROSTŘEDEK (DP) */}
              {templateId === 'dp' && (
                <div>
                  <div className="text-center my-3">
                    <h2 className="text-base font-black uppercase tracking-wide text-black m-0 p-0">
                      ÚŘEDNÍ ZÁZNAM o použití donucovacích prostředků
                    </h2>
                    <p className="text-[0.6875rem] font-bold text-slate-800 italic mt-0.5">
                      (podle § 17 zákona č. 555/1992 Sb., o Vězeňské službě a justiční stráži ČR)
                    </p>
                    <div className="mt-1.5 inline-block px-3 py-0.5 bg-slate-100 border border-slate-400 font-bold text-[0.6875rem] uppercase tracking-wider text-black">
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
                        <div className="space-y-1 text-[0.6875rem]">
                          <div><strong>Místo a datum vyhotovení:</strong> {formData.signatureDate || '........................................'}</div>
                          <div><strong>Čas sepsání záznamu:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[0.6875rem] font-bold text-black">Vlastnoruční podpis zasahujícího příslušníka</div>
                          <div className="text-[0.625rem] text-slate-700 font-mono mt-0.5">
                            {formData.officerSignature || formData.officer || 'hodnost, jméno, služební číslo'}
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-400 p-2.5 rounded bg-white">
                        <div className="space-y-1 text-[0.6875rem]">
                          <div><strong>Záznam převzal:</strong> velitel směny / oddělení</div>
                          <div><strong>Datum a čas převzetí:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[0.6875rem] font-bold text-black">Podpis velitele směny / oddělení</div>
                          <div className="text-[0.625rem] text-slate-700 mt-0.5">
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
                        <div className="mt-4 flex justify-between text-[0.625rem] text-slate-700">
                          <span>Datum: ........................................</span>
                          <span>Podpis vedoucího oddělení: ....................................................</span>
                        </div>
                      </div>

                      <div className="print-card p-2.5 border border-slate-300">
                        <div className="font-bold text-black mb-1">Zpráva o prošetření okolností a důvodů použití DP (1. ZŘV):</div>
                        <p className="min-h-[28px] whitespace-pre-wrap">{formData.zrvReport || 'Okolnosti použití DP byly prošetřeny, postup příslušníka byl v mezích zákona.'}</p>
                        <div className="mt-4 flex justify-between text-[0.625rem] text-slate-700">
                          <span>Datum: ........................................</span>
                          <span>Podpis 1. zástupce ředitele: ....................................................</span>
                        </div>
                      </div>

                      <div className="print-card p-2.5 border border-slate-300">
                        <div className="font-bold text-black mb-1">Rozhodnutí ředitele věznice o oprávněnosti a přiměřenosti (§ 20 odst. 4):</div>
                        <p className="min-h-[28px] whitespace-pre-wrap">{formData.directorDecision || 'Použití donucovacího prostředku bylo OPRÁVNĚNÉ a PŘIMĚŘENÉ.'}</p>
                        <div className="mt-6 flex justify-between text-[0.625rem] text-slate-700">
                          <span>Datum: ........................................</span>
                          <span>Otisk úředního razítka a podpis ředitele věznice: ....................................................</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATE 2: KÁZEŇSKÝ PŘESTUPEK (ZKP) */}
              {templateId === 'zkp' && (
                <div>
                  <div className="text-center my-3">
                    <h2 className="text-base font-black uppercase tracking-wide text-black m-0 p-0">
                      ÚŘEDNÍ ZÁZNAM O KÁZEŇSKÉM PŘESTUPKU
                    </h2>
                    <p className="text-[0.6875rem] font-bold text-slate-800 italic mt-0.5">
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
                        <span className="text-[0.625rem] text-slate-600">Vyjádření převzato dne: {formData.signatureDate}</span>
                        <div className="text-center">
                          <div className="w-56 border-b border-dotted border-black mb-1"></div>
                          <span className="text-[0.625rem] font-bold text-black">Vlastnoruční podpis odsouzeného</span>
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
                        <div className="space-y-1 text-[0.6875rem]">
                          <div><strong>Místo a datum:</strong> {formData.signatureDate}</div>
                          <div><strong>Čas sepsání:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[0.6875rem] font-bold text-black">Vlastnoruční podpis oznamujícího příslušníka</div>
                          <div className="text-[0.625rem] text-slate-700 font-mono mt-0.5">
                            {formData.officerSignature || 'hodnost, jméno, služební číslo'}
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-400 p-2.5 rounded bg-white">
                        <div className="space-y-1 text-[0.6875rem]">
                          <div><strong>Záznam převzal:</strong> vedoucí oddělení / velitel oddílu</div>
                          <div><strong>Datum a čas převzetí:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[0.6875rem] font-bold text-black">Podpis vedoucího oddělení / velitele oddílu</div>
                          <div className="text-[0.625rem] text-slate-700 mt-0.5">
                            (převzetí k zahájení kázeňského řízení)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATE 3: ODNĚTÍ VĚCI */}
              {templateId === 'odneti' && (
                <div>
                  <div className="text-center my-3">
                    <h2 className="text-base font-black uppercase tracking-wide text-black m-0 p-0">
                      ÚŘEDNÍ ZÁZNAM O ODNĚTÍ VĚCI
                    </h2>
                    <p className="text-[0.6875rem] font-bold text-slate-800 italic mt-0.5">
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
                      <p className="whitespace-pre-wrap font-mono text-[0.6875rem]">{formData.itemsList}</p>
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
                      <div className="text-[0.625rem] text-slate-700">(potvrzení o odnětí věci)</div>
                    </div>
                    <div className="border border-slate-400 p-2 rounded bg-white">
                      <div className="w-full border-b border-dotted border-black h-8 mb-1"></div>
                      <div className="font-bold text-black">Odnětí provedl</div>
                      <div className="text-[0.625rem] text-slate-700 font-mono">{formData.officerSignature || 'příslušník VS ČR'}</div>
                    </div>
                    <div className="border border-slate-400 p-2 rounded bg-white">
                      <div className="w-full border-b border-dotted border-black h-8 mb-1"></div>
                      <div className="font-bold text-black">Věc převzal do úschovy</div>
                      <div className="text-[0.625rem] text-slate-700">(sklad / pověřená osoba)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATE 4: SLUŽEBNÍ ZÁZNAM (SZ) */}
              {(templateId === 'sz' || (templateId !== 'dp' && templateId !== 'zkp' && templateId !== 'odneti')) && (
                <div>
                  <div className="text-center my-3">
                    <h2 className="text-base font-black uppercase tracking-wide text-black m-0 p-0">
                      {formData.docTitle || 'SLUŽEBNÍ ZÁZNAM'}
                    </h2>
                    <p className="text-[0.6875rem] font-bold text-slate-800 italic mt-0.5">
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
                        <div className="space-y-1 text-[0.6875rem]">
                          <div><strong>Místo a datum:</strong> {formData.signatureDate}</div>
                          <div><strong>Čas vyhotovení:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[0.6875rem] font-bold text-black">Vyhotovil příslušník / zaměstnanec</div>
                          <div className="text-[0.625rem] text-slate-700 font-mono mt-0.5">
                            {formData.officerSignature || 'hodnost, jméno, služební číslo'}
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-400 p-2.5 rounded bg-white">
                        <div className="space-y-1 text-[0.6875rem]">
                          <div><strong>Vzal na vědomí:</strong> velitel směny / nadřízený</div>
                          <div><strong>Datum a čas:</strong> ........................................</div>
                        </div>
                        <div className="mt-8 pt-2 border-t border-dotted border-black text-center">
                          <div className="text-[0.6875rem] font-bold text-black">Podpis nadřízeného</div>
                          <div className="text-[0.625rem] text-slate-700 mt-0.5">
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

      <ConfirmDialog
        isOpen={pendingFormAction !== null}
        tone="danger"
        title={
          pendingFormAction === 'reset'
            ? 'Obnovit ukázkový vzor?'
            : pendingFormAction === 'clear'
            ? 'Vymazat celý formulář?'
            : 'Smazat rozepsané koncepty?'
        }
        description={
          pendingFormAction === 'reset' ? (
            <>
              Vaše rozepsané změny v tomto tiskopisu se <strong>přepíšou ukázkovým vzorem</strong>{' '}
              a uložený koncept se smaže. Vrátit to zpět nelze.
            </>
          ) : pendingFormAction === 'clear' ? (
            <>
              Všechna pole tohoto tiskopisu se <strong>vyprázdní</strong> a uložený koncept se
              smaže. Vrátit to zpět nelze.
            </>
          ) : (
            <>
              Smažou se <strong>rozepsané koncepty všech {templates.length} tiskopisů</strong>{' '}
              z tohoto prohlížeče, včetně osobních údajů, které jste do nich zadal. Doporučeno po
              práci na sdíleném počítači. Vrátit to zpět nelze.
            </>
          )
        }
        confirmLabel={
          pendingFormAction === 'reset'
            ? 'Obnovit vzor'
            : pendingFormAction === 'clear'
            ? 'Vymazat formulář'
            : 'Smazat koncepty'
        }
        onConfirm={
          pendingFormAction === 'reset'
            ? doResetToDefault
            : pendingFormAction === 'clear'
            ? doClearForm
            : doPurgeDrafts
        }
        onCancel={() => setPendingFormAction(null)}
      />
    </div>
  );
}
