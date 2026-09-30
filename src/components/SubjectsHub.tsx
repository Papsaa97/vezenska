import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale,
  Shield,
  Building2,
  Crosshair,
  Brain,
  Search,
  BookOpen,
  GraduationCap,
  Layers,
  ChevronRight,
  ChevronDown,
  Star,
  ArrowLeft,
  FileText,
  ListChecks,
  Check,
  HeartHandshake,
  HeartPulse,
  Printer,
  Volume2,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  RotateCcw,
  Paperclip
} from 'lucide-react';
import { Question } from '../types';
import { SubjectInfo } from '../data/questions/subjectsInfo';
import { NAV_TAB_LABELS } from '../data/navTabs';
import { speakText, stopSpeaking, isSpeechSupported } from '../utils/speech';
import PrintHeader from './common/PrintHeader';
import { useAuth } from '../context/AuthContext';
import QuestionEditModal from './common/QuestionEditModal';
import SubjectEditModal from './common/SubjectEditModal';
import AttachedFilesPanel from './common/AttachedFilesPanel';
import { isQuestionHidden, toggleQuestionVisibilityInSupabase } from '../utils/questionActions';
import { useEditableContent } from '../hooks/useEditableContent';
import { useTaggedMaterials } from '../hooks/useTaggedMaterials';
import { DEFAULT_SUBJECTS } from '../utils/contentLibrary';
import { materialsForSubject } from '../utils/materials';

interface SubjectsHubProps {
  questions?: Question[];
  favorites?: string[];
  toggleFavorite: (id: string) => void;
  onStartQuiz: (subject: string) => void;
  onStartFlashcards: (subject: string) => void;
  onUpdateQuestion?: (updatedQuestion: Question) => void;
}

export const normalizeSubject = (str?: string | null): string => {
  return (str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
};

export const matchesSubject = (qSubject: string | undefined | null, subject: SubjectInfo): boolean => {
  if (!qSubject || !subject) return false;
  const nQ = normalizeSubject(qSubject);
  const nId = normalizeSubject(subject.id);
  const nName = normalizeSubject(subject.name);
  const nCode = normalizeSubject(subject.code);

  const cleanQ = nQ.replace(/[-_]/g, ' ');
  const cleanId = nId.replace(/[-_]/g, ' ');
  const cleanName = nName.replace(/[-_]/g, ' ');

  return (
    nQ === nId ||
    nQ === nName ||
    nQ === nCode ||
    cleanQ === cleanId ||
    cleanQ === cleanName
  );
};

// České množné číslo: 1 otázka / 2 otázky / 5 otázek. Sdílený helper v repu
// není exportovaný (classBoardService.ts), proto lokální kopie.
const pluralCz = (count: number, one: string, few: string, many: string): string => {
  if (count === 1) return `${count} ${one}`;
  if (count >= 2 && count <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
};
const questionCountLabel = (count: number): string => pluralCz(count, 'otázka', 'otázky', 'otázek');
const fileCountLabel = (count: number): string => pluralCz(count, 'soubor', 'soubory', 'souborů');

const NO_QUESTIONS_TITLE = 'K předmětu zatím nejsou žádné otázky.';

const SECONDARY_BUTTON =
  'px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800';
const PRIMARY_BUTTON =
  'px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600';
const ICON_BUTTON =
  'p-1.5 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700';

interface SubjectColorStyles {
  /** Změna barvy rámečku dlaždice při najetí myší. */
  cardHover: string;
  /** Štítek s kódem předmětu. */
  badge: string;
  /** Tónovaný čtverec s ikonou předmětu. */
  iconBox: string;
}

const getSubjectColorStyles = (accentColor: string): SubjectColorStyles => {
  switch (accentColor) {
    case 'indigo':
      return {
        cardHover: 'hover:border-indigo-400 dark:hover:border-indigo-600',
        badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        iconBox: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
      };
    case 'blue':
      return {
        cardHover: 'hover:border-blue-400 dark:hover:border-blue-600',
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        iconBox: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
      };
    case 'emerald':
      return {
        cardHover: 'hover:border-emerald-400 dark:hover:border-emerald-600',
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        iconBox: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      };
    case 'amber':
      return {
        cardHover: 'hover:border-amber-400 dark:hover:border-amber-600',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        iconBox: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
      };
    case 'rose':
      return {
        cardHover: 'hover:border-rose-400 dark:hover:border-rose-600',
        badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        iconBox: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
      };
    case 'teal':
      return {
        cardHover: 'hover:border-teal-400 dark:hover:border-teal-600',
        badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        iconBox: 'bg-teal-500/15 border-teal-500/30 text-teal-600 dark:text-teal-400',
      };
    case 'purple':
    default:
      return {
        cardHover: 'hover:border-purple-400 dark:hover:border-purple-600',
        badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        iconBox: 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400',
      };
  }
};

const getSubjectIcon = (iconName: string, className = 'w-6 h-6') => {
  switch (iconName) {
    case 'Scale': return <Scale className={className} aria-hidden="true" />;
    case 'Shield': return <Shield className={className} aria-hidden="true" />;
    case 'Building2': return <Building2 className={className} aria-hidden="true" />;
    case 'Crosshair': return <Crosshair className={className} aria-hidden="true" />;
    case 'Brain': return <Brain className={className} aria-hidden="true" />;
    case 'Search': return <Search className={className} aria-hidden="true" />;
    case 'FileText': return <FileText className={className} aria-hidden="true" />;
    case 'GraduationCap': return <GraduationCap className={className} aria-hidden="true" />;
    case 'HeartHandshake': return <HeartHandshake className={className} aria-hidden="true" />;
    case 'HeartPulse': return <HeartPulse className={className} aria-hidden="true" />;
    default: return <BookOpen className={className} aria-hidden="true" />;
  }
};

export default function SubjectsHub({
  questions = [],
  favorites = [],
  toggleFavorite,
  onStartQuiz,
  onStartFlashcards,
  onUpdateQuestion,
}: SubjectsHubProps) {
  const { profile } = useAuth();
  const canEdit = profile?.role === 'lektor' || profile?.role === 'admin';

  // Vybraný předmět drží id, ne název. Název se dá přejmenovat a otevřený
  // předmět by se tím pod rukama ztratil.
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Předměty z repozitáře přepsané úpravami lektora (viz contentLibrary.ts).
  const {
    entries: subjectEntries,
    save: saveSubject,
    remove: removeSubject,
    restore: restoreSubject,
    purge: purgeSubject,
    toggleHidden: toggleSubjectHidden,
  } = useEditableContent<SubjectInfo>('subject', DEFAULT_SUBJECTS, canEdit);

  // Soubory označené ve správci souborů štítkem předmětu.
  const { materials, loading: materialsLoading } = useTaggedMaterials();

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectInfo | null>(null);
  const [confirmDeleteSubjectId, setConfirmDeleteSubjectId] = useState<string | null>(null);
  const [confirmPurgeSubjectId, setConfirmPurgeSubjectId] = useState<string | null>(null);
  const [subjectActionError, setSubjectActionError] = useState<string | null>(null);

  // Předčítání: speakText() při novém spuštění zruší staré utterance a to
  // ještě zavolá svůj onEnd. Bez čítače generací by tak zhasl indikátor
  // právě spuštěného čtení.
  const speechGeneration = useRef(0);
  const stopReading = useCallback(() => {
    speechGeneration.current += 1;
    stopSpeaking();
    setSpeakingId(null);
  }, []);
  useEffect(() => () => stopSpeaking(), []);

  // Filtrování podle role: Běžný student položky s is_hidden === true vůbec neuvidí (odfiltrují se ze statistik i přehledu)
  const accessibleQuestions = useMemo(() => {
    const raw = questions || [];
    if (canEdit) return raw;
    return raw.filter(q => !isQuestionHidden(q));
  }, [questions, canEdit]);

  // Počty otázek a souborů u každého předmětu. Klíčem je id předmětu.
  const subjectStats = useMemo(() => {
    const stats: Record<string, { totalQuestions: number; totalFiles: number }> = {};
    const safeQuestions = accessibleQuestions || [];
    subjectEntries.forEach(entry => {
      stats[entry.id] = {
        totalQuestions: safeQuestions.filter(
          q => q?.subject && matchesSubject(q.subject, entry.item)
        ).length,
        totalFiles: materialsForSubject(materials, entry.item.name).length,
      };
    });
    return stats;
  }, [accessibleQuestions, subjectEntries, materials]);

  // Studentovi se prázdný okruh nenabízí — dřív se skrýval podle otázek, nově
  // stačí i přiřazený soubor. Lektor vidí všechno včetně skrytých a smazaných:
  // jinak by nový předmět zmizel hned po založení, než k němu něco přibude.
  const visibleEntries = useMemo(() => {
    // Odebrané předměty nejsou dlaždice v mřížce — lektor je má v pruhu pod
    // ní, kde je vrátí nebo smaže natrvalo. Dřív v mřížce visely napořád.
    if (canEdit) return subjectEntries.filter(entry => !entry.isDeleted);
    return subjectEntries.filter(entry => {
      const stats = subjectStats[entry.id];
      return (stats?.totalQuestions ?? 0) > 0 || (stats?.totalFiles ?? 0) > 0;
    });
  }, [subjectEntries, subjectStats, canEdit]);

  const activeEntry = useMemo(
    () => subjectEntries.find(entry => entry.id === selectedSubjectKey) ?? null,
    [subjectEntries, selectedSubjectKey]
  );
  const activeSubjectInfo: SubjectInfo | null = activeEntry?.item ?? null;

  const activeSubjectQuestions = useMemo(() => {
    if (!activeSubjectInfo) return [];
    const safeQuestions = accessibleQuestions || [];
    return safeQuestions.filter(
      q => q?.subject && matchesSubject(q.subject, activeSubjectInfo)
    );
  }, [accessibleQuestions, activeSubjectInfo]);

  const activeSubjectFiles = useMemo(
    () => (activeSubjectInfo ? materialsForSubject(materials, activeSubjectInfo.name) : []),
    [materials, activeSubjectInfo]
  );

  const usedSubjectIds = useMemo(() => subjectEntries.map(entry => entry.id), [subjectEntries]);

  // Stav vázaný na otevřený předmět (rozbalené otázky, hledání, chyba,
  // potvrzení mazání, čtení nahlas) nesmí přežít přepnutí na jiný předmět.
  const resetSubjectView = () => {
    setExpandedQuestionIds(new Set());
    setSearchQuery('');
    setSubjectActionError(null);
    setConfirmDeleteSubjectId(null);
    stopReading();
  };
  const openSubject = (id: string) => {
    resetSubjectView();
    setSelectedSubjectKey(id);
  };
  const closeSubject = () => {
    resetSubjectView();
    setSelectedSubjectKey(null);
  };

  const handleSubjectSave = async (subject: SubjectInfo) => {
    const result = await saveSubject(subject);
    if (result.error) setSubjectActionError(result.error);
    else setSubjectActionError(null);
    return result;
  };

  const handleSubjectDelete = async (id: string) => {
    const result = await removeSubject(id);
    setSubjectActionError(result.error);
    setConfirmDeleteSubjectId(null);
    if (!result.error && selectedSubjectKey === id) closeSubject();
  };

  const handleSubjectRestore = async (id: string) => {
    const result = await restoreSubject(id);
    setSubjectActionError(result.error);
  };

  const deletedEntries = useMemo(
    () => subjectEntries.filter(entry => entry.isDeleted),
    [subjectEntries]
  );

  const handleSubjectPurge = async (id: string) => {
    const result = await purgeSubject(id);
    setSubjectActionError(result.error);
    setConfirmPurgeSubjectId(null);
  };

  const handleSubjectHiddenToggle = async (id: string) => {
    const result = await toggleSubjectHidden(id);
    setSubjectActionError(result.error);
  };

  const handleToggleVisibility = async (q: Question) => {
    if (!canEdit || !q) return;
    const res = await toggleQuestionVisibilityInSupabase(q);
    // Nepovedené skrytí se dřív tvářilo jako hotové a studenti otázku dál viděli.
    if (!res.success) {
      setSubjectActionError(res.error ?? 'Viditelnost otázky se nepodařilo uložit.');
      return;
    }
    setSubjectActionError(null);
    const updated: Question = {
      ...q,
      is_hidden: res.isHidden,
    };
    onUpdateQuestion?.(updated);
  };

  const handleQuestionSave = (updated: Question) => {
    onUpdateQuestion?.(updated);
  };

  // Hledání bez ohledu na diakritiku a velikost písmen; prohledává znění,
  // odpověď, možnosti, okruh, pramen i vysvětlení.
  const normalizedQuery = normalizeSubject(searchQuery);
  const filteredQuestions = useMemo(() => {
    if (!normalizedQuery) return activeSubjectQuestions;
    return activeSubjectQuestions.filter(q => {
      if (!q) return false;
      const haystack = [
        q.question,
        q.answer,
        q.topic,
        q.source,
        q.rationale,
        q.explanation,
        ...(q.options ?? []),
      ]
        .map(part => normalizeSubject(part))
        .join('\n');
      return haystack.includes(normalizedQuery);
    });
  }, [activeSubjectQuestions, normalizedQuery]);

  const openSubjectEditor = (subject: SubjectInfo | null) => {
    setEditingSubject(subject);
    setSubjectModalOpen(true);
  };

  const renderSubjectDetail = (info: SubjectInfo) => {
    const styles = getSubjectColorStyles(info.accentColor);
    const totalQuestions = activeSubjectQuestions.length;
    const hasQuestions = totalQuestions > 0;
    const isSearching = normalizedQuery.length > 0;
    const purpose = (info.examRequirements ?? '').trim();
    const legalFramework = info.legalFramework ?? [];
    const keyTopics = info.keyTopics ?? [];
    const subtitleParts = [info.code, questionCountLabel(totalQuestions)];
    if (activeSubjectFiles.length > 0) subtitleParts.push(fileCountLabel(activeSubjectFiles.length));

    return (
      <motion.div
        key={info.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="w-full space-y-5 pb-8"
      >
        {/* Tisková hlavička – viditelná výhradně při tisku */}
        <PrintHeader
          subject={`${info.name} (${info.code})`}
          docTitle={`Přehled otázek s vysvětlením a pramenem (${questionCountLabel(filteredQuestions.length)})`}
          subtext="Studijní portál – neoficiální studijní materiál"
        />

        {/* Záhlaví předmětu */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 no-print print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <button type="button" onClick={closeSubject} className={`${SECONDARY_BUTTON} shrink-0`}>
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Zpět</span>
              </button>
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${styles.iconBox}`}>
                {getSubjectIcon(info.iconName, 'w-6 h-6')}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {info.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {subtitleParts.join(' · ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => window.print()}
                className={SECONDARY_BUTTON}
                title="Vytisknout přehled otázek nebo ho uložit do PDF"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Tisk</span>
              </button>
              <button
                type="button"
                onClick={() => onStartFlashcards(info.name)}
                disabled={!hasQuestions}
                className={SECONDARY_BUTTON}
                title={hasQuestions ? 'Procvičovat kartičky z tohoto předmětu' : NO_QUESTIONS_TITLE}
              >
                <Layers className="w-4 h-4" aria-hidden="true" />
                <span>Kartičky</span>
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => openSubjectEditor(info)}
                  className={SECONDARY_BUTTON}
                  title="Upravit popis, prameny i okruhy předmětu"
                >
                  <Edit3 className="w-4 h-4" aria-hidden="true" />
                  <span>Upravit předmět</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onStartQuiz(info.name)}
                disabled={!hasQuestions}
                className={PRIMARY_BUTTON}
                title={hasQuestions ? `Test z předmětu – ${questionCountLabel(totalQuestions)}` : NO_QUESTIONS_TITLE}
              >
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                <span>Spustit test</span>
              </button>
            </div>
          </div>
        </div>

        {canEdit && subjectActionError && (
          <p role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-xs no-print">
            {subjectActionError}
          </p>
        )}

        {/* O předmětu */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5 print-avoid-break print:p-4 print:mb-4 print:border-slate-300">
          {info.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              {info.description}
            </p>
          )}

          {(legalFramework.length > 0 || keyTopics.length > 0 || purpose) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              {legalFramework.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    Prameny práva a předpisy
                  </h2>
                  <ul className="space-y-1.5 list-disc pl-5">
                    {legalFramework.map((law, idx) => (
                      <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                        {law}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {keyTopics.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    Klíčové okruhy
                  </h2>
                  <ul className="space-y-1.5 list-disc pl-5">
                    {keyTopics.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {purpose && (
                <section className="space-y-2 md:col-span-2">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    K čemu předmět slouží
                  </h2>
                  <p className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {purpose}
                  </p>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Soubory přiřazené předmětu ve správci souborů */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4 print-avoid-break no-print print:hidden">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-slate-500" aria-hidden="true" />
              Soubory k předmětu
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeSubjectFiles.length > 0
                ? `${fileCountLabel(activeSubjectFiles.length)} – prezentace, skripta a předpisy označené štítkem předmětu. Otevřou se rovnou v aplikaci.`
                : 'Prezentace, skripta a předpisy označené štítkem předmětu se otevřou rovnou v aplikaci.'}
            </p>
          </div>

          <AttachedFilesPanel
            materials={activeSubjectFiles}
            loading={materialsLoading}
            emptyText={
              canEdit
                ? 'K předmětu zatím není přiřazený žádný soubor. Přiřadíte ho ve Správě obsahu → Správce souborů označením štítku předmětu.'
                : 'K předmětu zatím není přiřazený žádný soubor.'
            }
          />
        </div>

        {/* Otázky */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4 print:p-0 print:border-0">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-500 print:hidden" aria-hidden="true" />
                Otázky
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Přehled otázek s vysvětlením a pramenem.
              </p>
            </div>

            {hasQuestions && (
              <div className="relative w-full sm:w-72 no-print">
                <label htmlFor="subject-question-search" className="sr-only">
                  Hledat v otázkách
                </label>
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="subject-question-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hledat v otázkách, možnostech či pramenu"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {hasQuestions && (
            <div className="flex items-center justify-between gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-slate-800 no-print">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400" aria-live="polite">
                {isSearching
                  ? `${filteredQuestions.length} z ${questionCountLabel(totalQuestions)} odpovídá hledání`
                  : questionCountLabel(totalQuestions)}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setExpandedQuestionIds(new Set(filteredQuestions.map(q => q.id)))}
                  disabled={filteredQuestions.length === 0}
                  className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rozbalit vše
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedQuestionIds(new Set())}
                  disabled={expandedQuestionIds.size === 0}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sbalit vše
                </button>
              </div>
            </div>
          )}

          {/* Seznam otázek */}
          <div className="space-y-3">
            {!hasQuestions ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50 print:hidden" aria-hidden="true" />
                <p className="text-sm">{NO_QUESTIONS_TITLE}</p>
                {canEdit && (
                  <p className="text-xs mt-1 no-print">Otázky k předmětu přidáte ve Správě obsahu.</p>
                )}
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50 print:hidden" aria-hidden="true" />
                <p className="text-sm">Hledání „{searchQuery.trim()}“ nenašlo žádnou otázku.</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer no-print"
                >
                  Zrušit hledání
                </button>
              </div>
            ) : (
              filteredQuestions.map((q, index) => {
                if (!q) return null;
                const isExpanded = expandedQuestionIds.has(q.id);
                const isFav = favorites.includes(q.id);
                const isSpeaking = speakingId === q.id;

                const toggleExpand = () => {
                  setExpandedQuestionIds(prev => {
                    const next = new Set(prev);
                    if (next.has(q.id)) next.delete(q.id);
                    else next.add(q.id);
                    return next;
                  });
                };

                const targetIdx = typeof q.correctOption === 'number'
                  ? q.correctOption
                  : (typeof q.correct_index === 'number' ? q.correct_index : undefined);
                const correctAnswerText = (targetIdx !== undefined && q.options && q.options[targetIdx])
                  ? q.options[targetIdx]
                  : (q.answer || '');

                const handlePlayAudio = () => {
                  if (isSpeaking) {
                    stopReading();
                    return;
                  }
                  speechGeneration.current += 1;
                  const generation = speechGeneration.current;
                  setSpeakingId(q.id);
                  const started = speakText(`${q.question}. Správná odpověď: ${correctAnswerText}`, () => {
                    if (speechGeneration.current === generation) setSpeakingId(null);
                  });
                  if (!started) setSpeakingId(null);
                };

                const isHidden = isQuestionHidden(q);

                return (
                  <div
                    key={q.id}
                    className={`print-card border rounded-xl overflow-hidden transition-colors ${
                      canEdit && isHidden
                        ? 'border-dashed border-amber-300 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/20 print:hidden'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="p-4 flex items-start justify-between gap-3">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={toggleExpand}
                        className="flex items-start gap-3 flex-1 min-w-0 text-left cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 print:bg-slate-100 print:text-slate-900">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 space-y-1 block">
                          <span className="flex items-center gap-2 flex-wrap">
                            {canEdit && isHidden && (
                              <span className="inline-flex items-center gap-1 text-[0.6875rem] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded">
                                <EyeOff className="w-3 h-3" aria-hidden="true" />
                                Skryto pro studenty
                              </span>
                            )}
                            {q.topic && (
                              <span className="text-[0.6875rem] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded print:bg-white print:border print:border-slate-300">
                                {q.topic}
                              </span>
                            )}
                            {q.source && (
                              <span className="text-[0.6875rem] text-slate-500 dark:text-slate-400 font-mono">
                                {q.source}
                              </span>
                            )}
                          </span>
                          <span className="block text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug print:text-[10.5pt]">
                            {q.question}
                          </span>
                        </span>
                        <span className="text-slate-400 shrink-0 mt-0.5 no-print" aria-hidden="true">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0 no-print">
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(q)}
                              aria-label={isHidden ? 'Zveřejnit otázku studentům' : 'Skrýt otázku studentům'}
                              aria-pressed={isHidden}
                              title={isHidden ? 'Zveřejnit otázku studentům' : 'Skrýt otázku studentům'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isHidden
                                  ? 'text-amber-700 bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 dark:hover:bg-amber-900'
                                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {isHidden ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQuestion(q)}
                              aria-label="Upravit otázku"
                              title="Upravit otázku"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span className="hidden sm:inline">Upravit</span>
                            </button>
                          </>
                        )}

                        {isSpeechSupported() && (
                          <button
                            type="button"
                            onClick={handlePlayAudio}
                            aria-label={isSpeaking ? 'Zastavit čtení' : 'Přečíst otázku nahlas'}
                            aria-pressed={isSpeaking}
                            title={isSpeaking ? 'Zastavit čtení' : 'Přečíst otázku nahlas'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isSpeaking
                                ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/50'
                                : 'text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            <Volume2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleFavorite(q.id)}
                          aria-label={isFav ? 'Odebrat z oblíbených' : 'Uložit do oblíbených'}
                          aria-pressed={isFav}
                          title={isFav ? 'Odebrat z oblíbených' : 'Uložit do oblíbených'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isFav ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className={`px-4 pb-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900/80 space-y-3 text-sm ${isExpanded ? 'block' : 'hidden print:block'}`}>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 print:text-slate-900">
                          Správná odpověď
                        </p>
                        <div className="print-correct-answer p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-start gap-2.5 print:border-emerald-600 print:p-2">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="flex-1 text-sm print:text-[10pt] text-emerald-950 dark:text-emerald-100 font-semibold leading-snug">
                            {correctAnswerText}
                          </span>
                        </div>
                      </div>

                      {(q.rationale || q.source) && (
                        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs space-y-1.5 text-slate-800 dark:text-slate-200 print:bg-white print:border-slate-200 print:text-slate-800">
                          {q.rationale && (
                            <>
                              <p className="font-semibold text-slate-900 dark:text-white">Vysvětlení:</p>
                              <p className="leading-relaxed">{q.rationale}</p>
                            </>
                          )}
                          {q.source && (
                            <p className="pt-1 text-[0.6875rem] text-slate-600 dark:text-slate-400">
                              <strong>Pramen:</strong> {q.source}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSubjectGrid = () => (
    <motion.div
      key="grid"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="w-full space-y-5 pb-8"
    >
      {/* Záhlaví */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 no-print print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <BookOpen className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{NAV_TAB_LABELS.subjects}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Vyberte předmět, projděte otázky s vysvětlením nebo spusťte test.
              </p>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => openSubjectEditor(null)}
              className={`${PRIMARY_BUTTON} shrink-0 self-start md:self-auto`}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Přidat předmět</span>
            </button>
          )}
        </div>
      </div>

      {canEdit && subjectActionError && (
        <p role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-xs">
          {subjectActionError}
        </p>
      )}

      {visibleEntries.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500 dark:text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
          <p className="text-sm">
            {canEdit
              ? 'Zatím tu není žádný předmět. Založte první tlačítkem „Přidat předmět“.'
              : 'Zatím tu není žádný předmět s otázkami ani soubory.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleEntries.map(entry => {
            const info = entry.item;
            const stats = subjectStats[entry.id] ?? { totalQuestions: 0, totalFiles: 0 };
            const styles = getSubjectColorStyles(info.accentColor || 'indigo');
            const hasQuestions = stats.totalQuestions > 0;

            return (
              <div
                key={entry.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col justify-between transition-colors ${
                  entry.isHidden
                    ? 'border-dashed border-amber-300 dark:border-amber-700'
                    : `border-slate-200 dark:border-slate-800 ${styles.cardHover}`
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${styles.iconBox}`}>
                      {getSubjectIcon(info.iconName || 'BookOpen', 'w-6 h-6')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {entry.isHidden && (
                        <span className="text-[0.625rem] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          Skryto
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${styles.badge}`}>
                        {info.code || info.name.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {info.name}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                      {info.description || ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      {questionCountLabel(stats.totalQuestions)}
                    </span>
                    {stats.totalFiles > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        <Paperclip className="w-3.5 h-3.5" aria-hidden="true" />
                        {fileCountLabel(stats.totalFiles)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => openSubject(entry.id)}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    <span>Otevřít předmět</span>
                    <ChevronRight className="w-4 h-4 ml-auto" aria-hidden="true" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onStartQuiz(info.name)}
                      disabled={!hasQuestions}
                      className="py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title={hasQuestions ? 'Spustit test z tohoto předmětu' : NO_QUESTIONS_TITLE}
                    >
                      <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                      Spustit test
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartFlashcards(info.name)}
                      disabled={!hasQuestions}
                      className="py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title={hasQuestions ? 'Procvičovat kartičky z tohoto předmětu' : NO_QUESTIONS_TITLE}
                    >
                      <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                      Kartičky
                    </button>
                  </div>

                  {/* Správa bloku předmětu — jen lektor a správce */}
                  {canEdit && (
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => openSubjectEditor(info)}
                        className="flex-1 py-1.5 px-2 rounded-lg text-[0.6875rem] font-bold flex items-center justify-center gap-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                        Upravit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubjectHiddenToggle(entry.id)}
                        aria-label={entry.isHidden ? `Zveřejnit předmět ${info.name}` : `Skrýt předmět ${info.name} studentům`}
                        aria-pressed={Boolean(entry.isHidden)}
                        title={entry.isHidden ? 'Zveřejnit předmět' : 'Skrýt předmět studentům'}
                        className={`${ICON_BUTTON} hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30`}
                      >
                        {entry.isHidden ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
                      </button>
                      {confirmDeleteSubjectId === entry.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSubjectDelete(entry.id)}
                            className="px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[0.6875rem] font-bold cursor-pointer transition-colors"
                          >
                            Odebrat
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteSubjectId(null)}
                            className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[0.6875rem] font-bold cursor-pointer"
                          >
                            Ne
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteSubjectId(entry.id)}
                          aria-label={`Odebrat předmět ${info.name}`}
                          title="Odebrat předmět"
                          className={`${ICON_BUTTON} hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canEdit && deletedEntries.length > 0 && (
        <section
          aria-label="Odebrané předměty"
          className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-2"
        >
          <div>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">Odebrané předměty</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Studenti je nevidí. Vrátit je můžete do výchozí podoby, nebo je smazat natrvalo, aby tu už nebyly.
            </p>
          </div>
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {deletedEntries.map(entry => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{entry.item.name}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSubjectRestore(entry.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-[0.6875rem] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    Vrátit
                  </button>
                  {confirmPurgeSubjectId === entry.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSubjectPurge(entry.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[0.6875rem] font-bold cursor-pointer transition-colors"
                      >
                        Ano, smazat natrvalo
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmPurgeSubjectId(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[0.6875rem] font-bold cursor-pointer"
                      >
                        Ne
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmPurgeSubjectId(entry.id)}
                      className="px-2.5 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-[0.6875rem] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Smazat natrvalo
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </motion.div>
  );

  return (
    <>
      {canEdit && (
        <>
          <QuestionEditModal
            question={editingQuestion}
            isOpen={Boolean(editingQuestion)}
            onClose={() => setEditingQuestion(null)}
            onQuestionUpdated={handleQuestionSave}
          />
          <SubjectEditModal
            subject={editingSubject}
            isOpen={subjectModalOpen}
            usedIds={usedSubjectIds}
            onClose={() => {
              setSubjectModalOpen(false);
              setEditingSubject(null);
            }}
            onSave={handleSubjectSave}
          />
        </>
      )}
      <AnimatePresence mode="wait">
        {selectedSubjectKey && activeSubjectInfo ? renderSubjectDetail(activeSubjectInfo) : renderSubjectGrid()}
      </AnimatePresence>
    </>
  );
}
