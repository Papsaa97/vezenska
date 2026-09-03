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
  Filter, 
  Sparkles,
  Award,
  HeartHandshake,
  HeartPulse,
  Printer,
  Volume2
} from 'lucide-react';
import { Question } from '../types';
import { subjectsMeta, SubjectInfo } from '../data/questions/subjectsInfo';
import { speakText, isSpeechSupported } from '../utils/speech';

interface SubjectsHubProps {
  questions: Question[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onStartQuiz: (subject: string, topic?: string) => void;
  onStartFlashcards: (subject: string) => void;
}

export default function SubjectsHub({
  questions,
  favorites,
  toggleFavorite,
  onStartQuiz,
  onStartFlashcards
}: SubjectsHubProps) {
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const subjectNames = useMemo(() => Object.keys(subjectsMeta), []);

  // Compute question counts and topics per subject
  const subjectStats = useMemo(() => {
    const stats: Record<string, { totalQuestions: number; topics: string[] }> = {};
    subjectNames.forEach(subj => {
      const subjQuestions = questions.filter(q => q.subject === subj);
      const topics = Array.from(new Set(subjQuestions.map(q => q.topic)));
      stats[subj] = {
        totalQuestions: subjQuestions.length,
        topics
      };
    });
    return stats;
  }, [questions, subjectNames]);

  // Selected subject details
  const activeSubjectInfo: SubjectInfo | null = selectedSubjectKey ? subjectsMeta[selectedSubjectKey] || null : null;
  const activeSubjectQuestions = useMemo(() => {
    if (!selectedSubjectKey) return [];
    return questions.filter(q => q.subject === selectedSubjectKey);
  }, [questions, selectedSubjectKey]);

  // Filtered questions within selected subject
  const filteredQuestions = useMemo(() => {
    return activeSubjectQuestions.filter(q => {
      const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic;
      const qLower = searchQuery.toLowerCase();
      const matchesSearch = 
        q.question.toLowerCase().includes(qLower) || 
        q.answer.toLowerCase().includes(qLower) || 
        q.topic.toLowerCase().includes(qLower) || 
        q.source.toLowerCase().includes(qLower) ||
        (q.rationale && q.rationale.toLowerCase().includes(qLower));
      return matchesTopic && matchesSearch;
    });
  }, [activeSubjectQuestions, selectedTopic, searchQuery]);

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
    const availableTopics = subjectStats[selectedSubjectKey]?.topics || [];

    return (
      <AnimatePresence mode="wait">
      <motion.div
        key={selectedSubjectKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="max-w-6xl mx-auto px-4 py-6 space-y-6"
      >
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setSelectedSubjectKey(null);
              setSelectedTopic('all');
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Vytisknout přehled nebo uložit jako PDF"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Tisk přehledu</span>
            </button>
            <button
              onClick={() => onStartQuiz(selectedSubjectKey, selectedTopic !== 'all' ? selectedTopic : undefined)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              Spustit test ({activeSubjectQuestions.length} otázek)
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
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
                {activeSubjectInfo.legalFramework.map((law, idx) => (
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
                {activeSubjectInfo.keyTopics.map((item, idx) => (
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
                {activeSubjectInfo.examRequirements}
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
                Studijní databáze otázek z předmětu ({filteredQuestions.length} z {activeSubjectQuestions.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kompletní přehled testových otázek s přesným zákonným odůvodněním a citacemi předpisů.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hledat v otázkách či §..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechna témata ({availableTopics.length})</option>
                {availableTopics.map((topic, i) => (
                  <option key={i} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Topics Chips & Expand All Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin flex-1">
              <button
                onClick={() => setSelectedTopic('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedTopic === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Vše ({activeSubjectQuestions.length})
              </button>
              {availableTopics.map((top, idx) => {
                const count = activeSubjectQuestions.filter(q => q.topic === top).length;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedTopic(top)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                      selectedTopic === top
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {top} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setExpandedQuestionIds(new Set(filteredQuestions.map(q => q.id)))}
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
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Pro zadaná kritéria nebyla nalezena žádná otázka.</p>
              </div>
            ) : (
              filteredQuestions.map((q, index) => {
                const isExpanded = expandedQuestionIds.has(q.id);
                const isFav = favorites.includes(q.id);

                const toggleExpand = () => {
                  setExpandedQuestionIds(prev => {
                    const next = new Set(prev);
                    if (next.has(q.id)) next.delete(q.id);
                    else next.add(q.id);
                    return next;
                  });
                };

                const handlePlayAudio = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (speakingId === q.id) {
                    setSpeakingId(null);
                    window.speechSynthesis?.cancel();
                  } else {
                    setSpeakingId(q.id);
                    speakText(`${q.question}. Správná odpověď: ${q.answer}`, () => setSpeakingId(null));
                  }
                };

                return (
                  <div
                    key={q.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div 
                      onClick={toggleExpand}
                      className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                              {q.topic}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {q.source}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug">
                            {q.question}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
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

                      <div className={`px-4 pb-4 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900/80 space-y-3.5 text-xs sm:text-sm ${isExpanded ? 'block' : 'hidden print:block'}`}>
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs uppercase tracking-wider">
                            Správná odpověď ke zkoušce:
                          </span>
                          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 rounded-xl font-medium leading-relaxed">
                            {q.answer}
                          </div>
                        </div>

                        {/* Rationale and Source */}
                        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 text-xs sm:text-sm space-y-1.5 text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Odůvodnění a metodika:</span>
                          </div>
                          <p className="leading-relaxed">{q.rationale}</p>
                          <div className="pt-1.5 text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                            <strong>Citace:</strong> {q.source}
                          </div>
                        </div>
                      </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
      </AnimatePresence>
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
            ZOP A (2026)
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
        {subjectNames.map(subjKey => {
          const info = subjectsMeta[subjKey];
          if (!info) return null;
          const stats = subjectStats[subjKey] || { totalQuestions: 0, topics: [] };
          const styles = getSubjectColorStyles(info.accentColor);

          return (
            <div
              key={subjKey}
              className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:shadow-lg cursor-pointer ${styles.cardBg} group`}
            >
              <div className="space-y-4">
                {/* Header with Icon and Code */}
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${styles.iconBg} shadow-sm transition-transform group-hover:scale-105`}>
                    {getSubjectIcon(info.iconName, "w-6 h-6")}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${styles.badge}`}>
                    {info.code}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {info.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {info.description}
                  </p>
                </div>

                {/* Stats Pills */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    {stats.totalQuestions} otázek
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    <Filter className="w-3.5 h-3.5 text-indigo-500" />
                    {stats.topics.length} témat
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedSubjectKey(subjKey)}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Otevřít předmět a studium
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onStartQuiz(subjKey)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${styles.lightBtn}`}
                    title="Spustit test z tohoto předmětu"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Spustit test
                  </button>
                  <button
                    onClick={() => onStartFlashcards(subjKey)}
                    className="py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
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
