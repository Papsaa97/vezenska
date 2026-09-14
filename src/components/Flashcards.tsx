import React, { useState, useEffect, useMemo, useCallback, useId } from 'react';
import { 
  Search, 
  Star, 
  Shuffle, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Volume2, 
  CheckCircle2, 
  RotateCcw, 
  BrainCircuit, 
  HelpCircle, 
  Edit3, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { Question } from '../types';
import { normalizeSubject } from './SubjectsHub';
import { speakText, isSpeechSupported } from '../utils/speech';
import { getSubjectInfo } from '../data/questions/subjectsInfo';
import { useAuth } from '../context/AuthContext';
import LeitnerHelpModal from './common/LeitnerHelpModal';
import QuestionEditModal from './common/QuestionEditModal';
import { isQuestionHidden, toggleQuestionVisibilityInSupabase } from '../utils/questionActions';

interface FlashcardsProps {
  questions: Question[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  presetSubject?: string;
  onUpdateQuestion?: (updatedQuestion: Question) => void;
}

export default function Flashcards({ 
  questions = [], 
  favorites = [], 
  toggleFavorite, 
  presetSubject,
  onUpdateQuestion 
}: FlashcardsProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const { profile } = useAuth();
  const canEdit = profile?.role === 'lektor' || profile?.role === 'admin';

  const [selectedSubject, setSelectedSubject] = useState<string>(presetSubject || 'all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Modals state
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Leitner Spaced Repetition Box state (stored in localStorage)
  const [isLeitnerMode, setIsLeitnerMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vscr_leitner_active') === 'true';
    }
    return false;
  });

  const [leitnerBoxes, setLeitnerBoxes] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vscr_leitner_boxes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {};
  });

  const [selectedLeitnerBox, setSelectedLeitnerBox] = useState<number | 'all'>('all');

  useEffect(() => {
    localStorage.setItem('vscr_leitner_active', String(isLeitnerMode));
  }, [isLeitnerMode]);

  useEffect(() => {
    localStorage.setItem('vscr_leitner_boxes', JSON.stringify(leitnerBoxes));
  }, [leitnerBoxes]);

  useEffect(() => {
    if (presetSubject) {
      setSelectedSubject(presetSubject);
    }
  }, [presetSubject]);

  // Base list filtered by role (regular students NEVER see hidden items)
  const accessibleQuestions = useMemo(() => {
    const raw = questions || [];
    if (canEdit) return raw;
    return raw.filter(q => !isQuestionHidden(q));
  }, [questions, canEdit]);

  const subjects = useMemo(
    () => Array.from(new Set(accessibleQuestions.map(q => q?.subject).filter(Boolean))),
    [accessibleQuestions]
  );

  const filteredQuestions = useMemo(() => {
    let filtered = accessibleQuestions;
    if (selectedSubject !== 'all') {
      const normSel = normalizeSubject(selectedSubject);
      filtered = filtered.filter(q => q?.subject && (q.subject === selectedSubject || normalizeSubject(q.subject) === normSel));
    }
    if (showOnlyFavorites) {
      filtered = filtered.filter(q => q?.id && (favorites || []).includes(q.id));
    }
    if (isLeitnerMode && selectedLeitnerBox !== 'all') {
      filtered = filtered.filter(q => {
        const box = q?.id ? (leitnerBoxes[q.id] || 1) : 1;
        return box === selectedLeitnerBox;
      });
    }
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        (q?.question || '').toLowerCase().includes(lowerQuery) || 
        (q?.answer || '').toLowerCase().includes(lowerQuery) ||
        (q?.topic || '').toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [accessibleQuestions, selectedSubject, showOnlyFavorites, isLeitnerMode, selectedLeitnerBox, leitnerBoxes, searchQuery, favorites]);

  // Sync shuffled array with filtered questions
  useEffect(() => {
    setShuffledQuestions(filteredQuestions);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [filteredQuestions]);

  const handleShuffle = () => {
    const shuffled = [...shuffledQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (currentCardIndex < shuffledQuestions.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentQuestion) return;
    const textToRead = isFlipped 
      ? `Odpověď: ${currentQuestion.answer}. Odůvodnění: ${currentQuestion.rationale}` 
      : `Otázka: ${currentQuestion.question}`;
    
    setIsSpeaking(true);
    speakText(textToRead, () => setIsSpeaking(false));
  };

  // Leitner spaced repetition: 5 boxes progression
  const handleLeitnerProgress = (known: boolean) => {
    if (!currentQuestion) return;
    const currentBox = leitnerBoxes[currentQuestion.id] || 1;
    // Správná odpověď: posun o 1 box výše (až do Boxu 5), chyba: reset zpět do Boxu 1
    const nextBox = known ? Math.min(5, currentBox + 1) : 1;

    setLeitnerBoxes(prev => ({
      ...prev,
      [currentQuestion.id]: nextBox
    }));

    handleNext();
  };

  const handleResetLeitner = () => {
    if (window.confirm('Opravdu chcete resetovat všechny kartičky zpět do Boxu 1?')) {
      setLeitnerBoxes({});
    }
  };

  // Visibility toggle for lektor/admin
  const handleToggleVisibility = useCallback(async (q: Question) => {
    if (!canEdit || !q) return;
    const res = await toggleQuestionVisibilityInSupabase(q);
    const updated: Question = {
      ...q,
      is_hidden: res.isHidden,
    };
    // Aktualizace v lokálním shuffled seznamu
    setShuffledQuestions(prev => prev.map(item => item.id === q.id ? updated : item));
    onUpdateQuestion?.(updated);
  }, [canEdit, onUpdateQuestion]);

  // Question edit callback from modal
  const handleQuestionSave = useCallback((updated: Question) => {
    setShuffledQuestions(prev => prev.map(item => item.id === updated.id ? updated : item));
    onUpdateQuestion?.(updated);
  }, [onUpdateQuestion]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (editingQuestion || isHelpModalOpen) return;

      if (e.code === 'Space') { e.preventDefault(); setIsFlipped(prev => !prev); }
      else if (e.code === 'ArrowRight') { if (currentCardIndex < shuffledQuestions.length - 1) { setCurrentCardIndex(prev => prev + 1); setIsFlipped(false); } }
      else if (e.code === 'ArrowLeft') { if (currentCardIndex > 0) { setCurrentCardIndex(prev => prev - 1); setIsFlipped(false); } }
      else if (e.key === 'f' || e.key === 'F') { if (shuffledQuestions[currentCardIndex]) toggleFavorite(shuffledQuestions[currentCardIndex].id); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIndex, shuffledQuestions, toggleFavorite, editingQuestion, isHelpModalOpen]);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const currentQuestion = shuffledQuestions[currentCardIndex];
  const isCurrentHidden = currentQuestion ? isQuestionHidden(currentQuestion) : false;

  // Box counts for Leitner (Box 1 až 5)
  const box1Count = accessibleQuestions.filter(q => q?.id && (leitnerBoxes[q.id] || 1) === 1).length;
  const box2Count = accessibleQuestions.filter(q => q?.id && (leitnerBoxes[q.id] || 1) === 2).length;
  const box3Count = accessibleQuestions.filter(q => q?.id && (leitnerBoxes[q.id] || 1) === 3).length;
  const box4Count = accessibleQuestions.filter(q => q?.id && (leitnerBoxes[q.id] || 1) === 4).length;
  const box5Count = accessibleQuestions.filter(q => q?.id && (leitnerBoxes[q.id] || 1) === 5).length;

  return (
    <>
      {/* Leitner Explanation Modal */}
      <LeitnerHelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />

      {/* In-place Question Edit Modal for Lektor/Admin */}
      {canEdit && (
        <QuestionEditModal
          question={editingQuestion}
          isOpen={Boolean(editingQuestion)}
          onClose={() => setEditingQuestion(null)}
          onQuestionUpdated={handleQuestionSave}
        />
      )}

      {/* Mobile Filter Toggle */}
      <div className="md:hidden w-full flex justify-end shrink-0 no-print">
        <button 
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          {isMobileFiltersOpen ? 'Skrýt filtry' : 'Zobrazit filtry'}
        </button>
      </div>

      {/* Sidebar Controls */}
      <aside className={`w-full md:w-72 flex-col gap-6 shrink-0 md:h-full md:overflow-y-auto no-print ${isMobileFiltersOpen ? 'flex' : 'hidden md:flex'}`}>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            Nastavení Drilu
          </h3>
          
          <div className="space-y-4">
            {/* Spaced Repetition Toggle & 5-Box Leitner Controls */}
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Leitnerův systém</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsHelpModalOpen(true);
                    }}
                    className="p-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Nápověda k Leitnerovu systému"
                    title="Jak funguje Leitnerův systém rozloženého opakování?"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="checkbox"
                  checked={isLeitnerMode}
                  onChange={(e) => setIsLeitnerMode(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  aria-label="Aktivovat Leitnerův systém opakování"
                />
              </div>

              {isLeitnerMode && (
                <div className="mt-2 space-y-2 pt-2 border-t border-indigo-200/40 dark:border-indigo-900/40">
                  <div className="flex items-center justify-between text-[11px] text-indigo-900 dark:text-indigo-300 font-semibold mb-1">
                    <span>Přihrádky paměti:</span>
                    <button
                      type="button"
                      onClick={() => setIsHelpModalOpen(true)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      <HelpCircle className="w-3 h-3" /> Nápověda
                    </button>
                  </div>

                  {/* 5-Box Grid (Box 1 až 5) */}
                  <div className="grid grid-cols-5 gap-1 text-[10px] font-bold">
                    <button
                      onClick={() => setSelectedLeitnerBox(1)}
                      title="Box 1: Denní opakování"
                      className={`p-1 rounded-md border text-center transition-all ${
                        selectedLeitnerBox === 1
                          ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                      }`}
                    >
                      <span>B1</span>
                      <span className="block text-[9px] opacity-80">{box1Count}</span>
                    </button>
                    <button
                      onClick={() => setSelectedLeitnerBox(2)}
                      title="Box 2: Každé 2-3 dny"
                      className={`p-1 rounded-md border text-center transition-all ${
                        selectedLeitnerBox === 2
                          ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-300'
                      }`}
                    >
                      <span>B2</span>
                      <span className="block text-[9px] opacity-80">{box2Count}</span>
                    </button>
                    <button
                      onClick={() => setSelectedLeitnerBox(3)}
                      title="Box 3: 1× týdně"
                      className={`p-1 rounded-md border text-center transition-all ${
                        selectedLeitnerBox === 3
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                      }`}
                    >
                      <span>B3</span>
                      <span className="block text-[9px] opacity-80">{box3Count}</span>
                    </button>
                    <button
                      onClick={() => setSelectedLeitnerBox(4)}
                      title="Box 4: 1× za 14 dní"
                      className={`p-1 rounded-md border text-center transition-all ${
                        selectedLeitnerBox === 4
                          ? 'bg-blue-500 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <span>B4</span>
                      <span className="block text-[9px] opacity-80">{box4Count}</span>
                    </button>
                    <button
                      onClick={() => setSelectedLeitnerBox(5)}
                      title="Box 5: Trvalá paměť (1× za měsíc)"
                      className={`p-1 rounded-md border text-center transition-all ${
                        selectedLeitnerBox === 5
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <span>B5</span>
                      <span className="block text-[9px] opacity-80">{box5Count}</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[10px] text-indigo-700 dark:text-indigo-400">
                    <button
                      onClick={() => setSelectedLeitnerBox('all')}
                      className={`underline ${selectedLeitnerBox === 'all' ? 'font-bold text-indigo-900 dark:text-white' : ''}`}
                    >
                      Všechny boxy
                    </button>
                    <button onClick={handleResetLeitner} className="text-slate-400 hover:text-rose-500">
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Hledat..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2" htmlFor={`${fieldIds}-0`}>Předmět</label>
              <select
                id={`${fieldIds}-0`} 
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="all">Všechny předměty</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{getSubjectInfo(subject).name}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent">
              <input 
                type="checkbox" 
                className="rounded text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                checked={showOnlyFavorites}
                onChange={(e) => setShowOnlyFavorites(e.target.checked)}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Jen Oblíbené ⭐</span>
            </label>

            <button 
              onClick={handleShuffle}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              Zamíchat kartičky
            </button>
          </div>
        </div>
      </aside>

      {/* Main Flashcard Area */}
      <section className="flex-1 flex flex-col min-h-[100dvh] md:min-h-0 h-auto md:h-full overflow-y-auto md:overflow-hidden shrink-0">
        {shuffledQuestions.length === 0 ? (
          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-2">Nenalezeny žádné otázky odpovídající filtrům.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setShowOnlyFavorites(false);
                setSelectedLeitnerBox('all');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              Zrušit filtry
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4 px-2 w-full no-print">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Karta {currentCardIndex + 1} z {shuffledQuestions.length}
                  </span>
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 rounded-full"
                      style={{ width: `${shuffledQuestions.length > 0 ? ((currentCardIndex + 1) / shuffledQuestions.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {isLeitnerMode && (
                  <div className="flex items-center gap-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      (leitnerBoxes[currentQuestion.id] || 1) === 5
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : (leitnerBoxes[currentQuestion.id] || 1) === 4
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                        : (leitnerBoxes[currentQuestion.id] || 1) === 3
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : (leitnerBoxes[currentQuestion.id] || 1) === 2
                        ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}>
                      Box {leitnerBoxes[currentQuestion.id] || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsHelpModalOpen(true)}
                      className="text-slate-400 hover:text-indigo-600 p-0.5"
                      title="Nápověda k Leitnerovu systému"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isSpeechSupported() && (
                  <button
                    onClick={handleSpeak}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Přečíst nahlas (Hlasový dril)"
                  >
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-blue-600 animate-pulse' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Skryto pro studenty Banner (pouze pro lektory/adminy) */}
            {canEdit && isCurrentHidden && (
              <div className="w-full mb-3 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs no-print">
                <span className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Tato kartička je skryta pro běžné studenty</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(currentQuestion)}
                  className="px-2.5 py-1 bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 rounded-lg text-amber-950 dark:text-amber-100 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Znovu publikovat
                </button>
              </div>
            )}

            {/* The 3D Card */}
            <div className="relative min-h-[360px] md:min-h-[420px] h-auto w-full perspective-1000">
              <div 
                className={`w-full min-h-[360px] md:min-h-[420px] h-full transition-all duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={handleFlip}
              >
                {/* Front Side */}
                <div className={`absolute inset-0 w-full h-full min-h-[360px] md:min-h-[420px] backface-hidden bg-white dark:bg-slate-900 border rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col hover:shadow-md transition-all ${
                  canEdit && isCurrentHidden
                    ? 'border-dashed border-amber-300 dark:border-amber-700/70 bg-amber-50/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                      {getSubjectInfo(currentQuestion.subject).name} • {currentQuestion.topic}
                    </div>
                    
                    <div className="flex items-center gap-1.5 no-print">
                      {/* Lektor / Admin akce (Pencil & Eye) */}
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVisibility(currentQuestion);
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isCurrentHidden 
                                ? 'text-amber-600 bg-amber-100 dark:bg-amber-950 hover:bg-amber-200' 
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title={isCurrentHidden ? "Publikovat pro studenty" : "Skrýt pro studenty"}
                          >
                            {isCurrentHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingQuestion(currentQuestion);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
                            title="Upravit kartičku (in-place)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Upravit</span>
                          </button>
                        </>
                      )}

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(currentQuestion.id);
                        }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        title="Přidat do oblíbených"
                      >
                        <Star className={`w-5 h-5 ${favorites.includes(currentQuestion.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400 dark:text-slate-600'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {currentQuestion.question}
                    </h3>
                  </div>
                  <div className="text-center text-sm text-slate-400 dark:text-slate-500 mt-4 font-medium">
                    Kliknutím otočte pro odpověď
                  </div>
                </div>

                {/* Back Side */}
                <div className={`absolute inset-0 w-full h-full min-h-[360px] md:min-h-[420px] backface-hidden rotate-y-180 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col hover:shadow-md transition-all ${
                  canEdit && isCurrentHidden
                    ? 'border-dashed border-amber-300 dark:border-amber-700/70'
                    : 'border-blue-200 dark:border-blue-900/50'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Odpověď
                    </div>

                    {/* Lektor / Admin akce na zadní straně kartičky */}
                    {canEdit && (
                      <div className="flex items-center gap-1.5 no-print">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVisibility(currentQuestion);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isCurrentHidden 
                              ? 'text-amber-600 bg-amber-100 dark:bg-amber-950 hover:bg-amber-200' 
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={isCurrentHidden ? "Publikovat pro studenty" : "Skrýt pro studenty"}
                        >
                          {isCurrentHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingQuestion(currentQuestion);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
                          title="Upravit kartičku (in-place)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Upravit</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center overflow-y-auto">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                      {currentQuestion.answer}
                    </h3>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {currentQuestion.rationale}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">
                    Pramen: {currentQuestion.source}
                  </div>
                </div>
              </div>
            </div>

            {/* Leitner Evaluation Buttons or Standard Navigation Controls */}
            {isLeitnerMode && isFlipped ? (
              <div className="flex items-center justify-center gap-4 mt-6 w-full animate-fadeIn no-print">
                <button
                  onClick={() => handleLeitnerProgress(false)}
                  className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ještě neumím (Vrátit do Boxu 1)</span>
                </button>
                <button
                  onClick={() => handleLeitnerProgress(true)}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Umím (Posunout dál)</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-6 mt-8 w-full no-print">
                  <button 
                    onClick={handlePrev}
                    disabled={currentCardIndex === 0}
                    className="p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
                    title="Předchozí karta (Šipka vlevo)"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={currentCardIndex === shuffledQuestions.length - 1}
                    className="p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
                    title="Další karta (Šipka vpravo)"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
                <div className="hidden sm:flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-400 dark:text-slate-600 font-mono no-print">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">Space</kbd> otočit</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">← →</kbd> navigace</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">F</kbd> oblíbené</span>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}
