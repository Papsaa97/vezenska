import React, { useState, useMemo } from 'react';
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
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  Star, 
  ArrowLeft, 
  FileText, 
  Sparkles,
  Award,
  HeartHandshake,
  HeartPulse,
  Printer,
  Volume2,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';
import { Question } from '../types';
import { subjectsMeta, SubjectInfo, getSubjectInfo } from '../data/questions/subjectsInfo';
import { speakText, isSpeechSupported } from '../utils/speech';
import PrintHeader from './common/PrintHeader';
import { useAuth } from '../context/AuthContext';
import QuestionEditModal from './common/QuestionEditModal';
import { isQuestionHidden, toggleQuestionVisibilityInSupabase } from '../utils/questionActions';

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
    .replace(/[\u0300-\u036f]/g, '')
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

  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Filtrování podle role: Běžný student položky s is_hidden === true vůbec neuvidí (odfiltrují se ze statistik i přehledu)
  const accessibleQuestions = useMemo(() => {
    const raw = questions || [];
    if (canEdit) return raw;
    return raw.filter(q => !isQuestionHidden(q));
  }, [questions, canEdit]);

  const subjectNames = useMemo(() => Object.keys(subjectsMeta), []);

  // Compute question counts per subject safely
  const subjectStats = useMemo(() => {
    const stats: Record<string, { totalQuestions: number }> = {};
    const safeQuestions = accessibleQuestions || [];
    subjectNames.forEach(subj => {
      const info = getSubjectInfo(subj);
      const subjQuestions = safeQuestions.filter(
        q => q?.subject && matchesSubject(q.subject, info)
      );
      stats[subj] = {
        totalQuestions: subjQuestions.length
      };
    });
    return stats;
  }, [accessibleQuestions, subjectNames]);

  // Pouze předměty s alespoň jednou otázkou (skrytí prázdných okruhů např. Ostatní)
  const visibleSubjectNames = useMemo(() => {
    return subjectNames.filter(subjKey => {
      const count = subjectStats[subjKey]?.totalQuestions ?? 0;
      return count > 0;
    });
  }, [subjectNames, subjectStats]);

  // Selected subject details - safe fallback guaranteed
  const activeSubjectInfo: SubjectInfo | null = selectedSubjectKey ? getSubjectInfo(selectedSubjectKey) : null;
  const activeSubjectQuestions = useMemo(() => {
    if (!selectedSubjectKey || !activeSubjectInfo) return [];
    const safeQuestions = accessibleQuestions || [];
    return safeQuestions.filter(
      q => q?.subject && matchesSubject(q.subject, activeSubjectInfo)
    );
  }, [accessibleQuestions, selectedSubjectKey, activeSubjectInfo]);

  const handleToggleVisibility = async (q: Question) => {
    if (!canEdit || !q) return;
    const res = await toggleQuestionVisibilityInSupabase(q);
    const updated: Question = {
      ...q,
      is_hidden: res.isHidden,
    };
    onUpdateQuestion?.(updated);
  };

  const handleQuestionSave = (updated: Question) => {
    onUpdateQuestion?.(updated);
  };

  // Filtered questions within selected subject (by search query across questions, answers, rationale and citations)
  const filteredQuestions = useMemo(() => {
    return (activeSubjectQuestions || []).filter(q => {
      if (!q) return false;
      const qLower = (searchQuery || '').toLowerCase();
      const matchesSearch = 
        (q.question || '').toLowerCase().includes(qLower) || 
        (q.answer || '').toLowerCase().includes(qLower) || 
        (q.topic ? q.topic.toLowerCase().includes(qLower) : false) || 
        (q.source || '').toLowerCase().includes(qLower) ||
        (q.rationale ? q.rationale.toLowerCase().includes(qLower) : false) ||
        (q.explanation ? q.explanation.toLowerCase().includes(qLower) : false);
      return matchesSearch;
    });
  }, [activeSubjectQuestions, searchQuery]);

  const getSubjectIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'Scale': return <Scale className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Building2': return <Building2 className={className} />;
      case 'Crosshair': return <Crosshair className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'Search': return <Search className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'HeartHandshake': return <HeartHandshake className={className} />;
      case 'HeartPulse': return <HeartPulse className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  const getSubjectColorStyles = (accentColor: string) => {
    switch (accentColor) {
      case 'indigo':
        return {
          cardBg: 'hover:border-indigo-400 dark:hover:border-indigo-600',
          badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          iconBg: 'bg-indigo-600 text-white',
          button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          lightBtn: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60',
          accentBorder: 'border-indigo-500'
        };
      case 'blue':
        return {
          cardBg: 'hover:border-blue-400 dark:hover:border-blue-600',
          badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          iconBg: 'bg-blue-600 text-white',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          lightBtn: 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60',
          accentBorder: 'border-blue-500'
        };
      case 'emerald':
        return {
          cardBg: 'hover:border-emerald-400 dark:hover:border-emerald-600',
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          iconBg: 'bg-emerald-600 text-white',
          button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          lightBtn: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60',
          accentBorder: 'border-emerald-500'
        };
      case 'amber':
        return {
          cardBg: 'hover:border-amber-400 dark:hover:border-amber-600',
          badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          iconBg: 'bg-amber-600 text-white',
          button: 'bg-amber-600 hover:bg-amber-700 text-white',
          lightBtn: 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60',
          accentBorder: 'border-amber-500'
        };
      case 'rose':
        return {
          cardBg: 'hover:border-rose-400 dark:hover:border-rose-600',
          badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          iconBg: 'bg-rose-600 text-white',
          button: 'bg-rose-600 hover:bg-rose-700 text-white',
          lightBtn: 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60',
          accentBorder: 'border-rose-500'
        };
      case 'teal':
        return {
          cardBg: 'hover:border-teal-400 dark:hover:border-teal-600',
          badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          iconBg: 'bg-teal-600 text-white',
          button: 'bg-teal-600 hover:bg-teal-700 text-white',
          lightBtn: 'bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/60',
          accentBorder: 'border-teal-500'
        };
      case 'purple':
      default:
        return {
          cardBg: 'hover:border-purple-400 dark:hover:border-purple-600',
          badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          iconBg: 'bg-purple-600 text-white',
          button: 'bg-purple-600 hover:bg-purple-700 text-white',
          lightBtn: 'bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60',
          accentBorder: 'border-purple-500'
        };
    }
  };

  // If a single subject is selected, display its comprehensive dedicated view
  if (selectedSubjectKey && activeSubjectInfo) {
    const styles = getSubjectColorStyles(activeSubjectInfo.accentColor);

    return (
      <>
        {canEdit && (
          <QuestionEditModal
            question={editingQuestion}
            isOpen={Boolean(editingQuestion)}
            onClose={() => setEditingQuestion(null)}
            onQuestionUpdated={handleQuestionSave}
          />
        )}
        <AnimatePresence mode="wait">
        <motion.div
          key={selectedSubjectKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="max-w-6xl mx-auto px-4 py-6 space-y-6"
        >
        {/* Tisková hlavička – viditelná výhradně při tisku */}
        {activeSubjectInfo && (
          <PrintHeader 
            subject={`Předmět ZOP A: ${activeSubjectInfo.name} (${activeSubjectInfo.code})`} 
            docTitle={`Kompletní přehled testových otázek a pramenů práva (${filteredQuestions?.length ?? 0} otázek)`} 
            subtext="Akademie Vězeňské služby ČR – Oficiální studijní materiály pro přípravu na zkoušky" 
          />
        )}

        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 no-print">
          <button
            onClick={() => {
              setSelectedSubjectKey(null);
              setSearchQuery('');
            }}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět na přehled všech předmětů
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
              title="Vytisknout přehled nebo uložit jako PDF"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Tisk / PDF</span>
            </button>
            <button
              onClick={() => onStartQuiz(selectedSubjectKey)}
              disabled={(activeSubjectQuestions || []).length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-colors ${
                (activeSubjectQuestions || []).length === 0
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Spustit test ({activeSubjectQuestions?.length ?? 0} otázek)
            </button>
            <button
              onClick={() => onStartFlashcards(selectedSubjectKey)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Kartičky
            </button>
          </div>
        </div>

        {/* Subject Header Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden print-avoid-break print:p-4 print:mb-4 print:border-slate-300 print:shadow-none">
          <div className="flex items-start gap-5">
            <div className={`p-4 rounded-xl shrink-0 ${styles.iconBg} shadow-md`}>
              {getSubjectIcon(activeSubjectInfo.iconName, "w-8 h-8")}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${styles.badge}`}>
                  {activeSubjectInfo.code}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {activeSubjectInfo.name}
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-4xl">
                {activeSubjectInfo.description}
              </p>
            </div>
          </div>

          {/* Legal Framework & Key Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Prameny práva a předpisy
              </h2>
              <ul className="space-y-2">
                {(activeSubjectInfo?.legalFramework || []).map((law, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{law}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Klíčové tematické okruhy
              </h2>
              <ul className="space-y-2">
                {(activeSubjectInfo?.keyTopics || []).map((item, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 md:col-span-2">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Požadavky ke zkoušce ZOP A
              </h2>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeSubjectInfo?.examRequirements || 'Standardní požadavky k závěrečné zkoušce ZOP A.'}
              </div>
            </div>
          </div>
        </div>

        {/* Question Explorer Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Studijní databáze otázek z předmětu ({filteredQuestions?.length ?? 0} z {activeSubjectQuestions?.length ?? 0})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kompletní přehled testových otázek s přesným odůvodněním a zákonným pramenem.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto no-print">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hledat v otázkách či §..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Bar - Count & Expand/Collapse */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800 no-print">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Celkem {filteredQuestions?.length ?? 0} otázek ke studiu
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setExpandedQuestionIds(new Set((filteredQuestions || []).map(q => q?.id).filter((id): id is string => Boolean(id))))}
                className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors font-medium cursor-pointer"
              >
                Rozbalit vše
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={() => setExpandedQuestionIds(new Set())}
                className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Sbalit vše
              </button>
            </div>
          </div>

          {/* Questions Accordion List */}
          <div className="space-y-3 pt-2">
            {(filteredQuestions || []).length === 0 ? (
              <div className="text-center py-12 text-slate-400 no-print">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Pro zadaná kritéria nebyla nalezena žádná otázka.</p>
              </div>
            ) : (
              (filteredQuestions || []).map((q, index) => {
                if (!q) return null;
                const isExpanded = q?.id ? expandedQuestionIds.has(q.id) : false;
                const isFav = q?.id ? (favorites || []).includes(q.id) : false;

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

                const handlePlayAudio = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (speakingId === q.id) {
                    setSpeakingId(null);
                    window.speechSynthesis?.cancel();
                  } else {
                    setSpeakingId(q.id);
                    speakText(`${q.question}. Správná odpověď: ${correctAnswerText}`, () => setSpeakingId(null));
                  }
                };

                const isHidden = isQuestionHidden(q);

                return (
                  <div
                    key={q.id}
                    className={`print-card border rounded-xl overflow-hidden transition-all ${
                      canEdit && isHidden
                        ? 'border-dashed border-amber-300 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/20 print:hidden'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div 
                      onClick={toggleExpand}
                      className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 print:bg-slate-100 print:text-slate-900">
                          {index + 1}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {canEdit && isHidden && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded">
                                <EyeOff className="w-3 h-3" />
                                Skryto pro studenty
                              </span>
                            )}
                            {q.topic && (
                              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded print:bg-white print:border print:border-slate-300">
                                {q.topic}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {q.source}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug print:text-[10.5pt]">
                            {q.question}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 no-print">
                        {/* Lektor / Admin akce (Pencil & Eye) */}
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVisibility(q);
                              }}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isHidden
                                  ? 'text-amber-600 bg-amber-100 dark:bg-amber-950 hover:bg-amber-200'
                                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                              title={isHidden ? "Publikovat pro studenty" : "Skrýt pro studenty"}
                            >
                              {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingQuestion(q);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
                              title="Upravit otázku (in-place)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Upravit</span>
                            </button>
                          </>
                        )}

                        {isSpeechSupported() && (
                          <button
                            type="button"
                            onClick={handlePlayAudio}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              speakingId === q.id 
                                ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 animate-pulse' 
                                : 'text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                            title="Přečíst otázku nahlas"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(q.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isFav ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                          }`}
                          title={isFav ? "Odebrat z oblíbených" : "Uložit do oblíbených"}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                        </button>
                        <span className="text-slate-400 p-1">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                      </div>
                    </div>

                    <div className={`px-4 pb-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900/80 space-y-3 text-xs sm:text-sm ${isExpanded ? 'block' : 'hidden print:block'}`}>
                      {/* Správná odpověď ke zkoušce (čistý studijní režim bez klamavých distraktorů) */}
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs uppercase tracking-wider print:text-slate-900">
                          Správná odpověď:
                        </span>
                        <div className="print-correct-answer p-3 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl font-bold leading-relaxed flex items-start gap-2.5 print:border-emerald-600 print:p-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-600 text-white text-xs font-black shrink-0 mt-0.5 print:bg-emerald-700 print:text-white">
                            ✓
                          </span>
                          <span className="flex-1 text-xs sm:text-sm print:text-[10pt] text-emerald-950 dark:text-emerald-100 font-semibold print:font-bold leading-snug">
                            {correctAnswerText}
                          </span>
                        </div>
                      </div>

                      {/* Zákonné odůvodnění & citace pramene */}
                      {(q.rationale || q.source) && (
                        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs space-y-1.5 text-slate-800 dark:text-slate-200 print:bg-white print:border-slate-200 print:text-slate-800">
                          {q.rationale && (
                            <>
                              <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 print:text-slate-900">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 print:hidden" />
                                <span>Zákonné odůvodnění:</span>
                              </div>
                              <p className="leading-relaxed">{q.rationale}</p>
                            </>
                          )}
                          {q.source && (
                            <div className="pt-1 text-[11px] text-blue-800 dark:text-blue-400 font-medium print:text-slate-700">
                              <strong>Pramen / citace:</strong> {q.source}
                            </div>
                          )}
                        </div>
                      )}

                      {/* In-place edit bar v rozbaleném detailu (pouze lektor/admin) */}
                      {canEdit && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 no-print">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(q)}
                            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            {isHidden ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                            <span>{isHidden ? "Znovu publikovat pro studenty" : "Skrýt pro studenty"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingQuestion(q)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Upravit otázku</span>
                          </button>
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
      </AnimatePresence>
      </>
    );
  }

  // Otherwise, render the Main Subjects Directory (Přehled všech předmětů)
  return (
    <AnimatePresence mode="wait">
    <motion.div
      key="grid"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="max-w-6xl mx-auto px-4 py-8 space-y-8"
    >
      {/* Intro Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            ZOP A
          </span>
          <span className="text-xs text-slate-500">Studijní plán Akademie Vězeňské služby ČR</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Samostatné studijní předměty
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Každý předmět základní odborné přípravy má samostatně vyhrazený studijní modul. 
          Zvolte předmět pro podrobné studium, procházení konkrétních otázek s paragrafovými citacemi nebo spuštění specializovaného testu.
        </p>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleSubjectNames.map(subjKey => {
          const info = getSubjectInfo(subjKey);
          const stats = subjectStats?.[subjKey] || { totalQuestions: 0 };
          const styles = getSubjectColorStyles(info?.accentColor || 'indigo');

          return (
            <div
              key={subjKey}
              onClick={() => setSelectedSubjectKey(subjKey)}
              className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:shadow-lg cursor-pointer ${styles.cardBg} group`}
            >
              <div className="space-y-4">
                {/* Header with Icon and Code */}
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${styles.iconBg} shadow-sm transition-transform group-hover:scale-105`}>
                    {getSubjectIcon(info?.iconName || 'BookOpen', "w-6 h-6")}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${styles.badge}`}>
                    {info?.code || subjKey.substring(0, 3).toUpperCase()}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {info?.name || subjKey}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {info?.description || ''}
                  </p>
                </div>

                {/* Stats Pills - Only total questions */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    {stats?.totalQuestions ?? 0} otázek
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSubjectKey(subjKey);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Otevřít předmět a studium
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartQuiz(subjKey);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${styles.lightBtn}`}
                    title="Spustit test z tohoto předmětu"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Spustit test
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartFlashcards(subjKey);
                    }}
                    className="py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Procvičovat kartičky z tohoto předmětu"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Kartičky
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
    </AnimatePresence>
  );
}
