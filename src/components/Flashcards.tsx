import React, { useState, useEffect, useMemo } from 'react';
import { Search, Star, Shuffle, ChevronLeft, ChevronRight, BookOpen, Volume2, Layers, CheckCircle2, RotateCcw, BrainCircuit } from 'lucide-react';
import { Question } from '../types';
import { speakText, isSpeechSupported } from '../utils/speech';

interface FlashcardsProps {
  questions: Question[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  presetSubject?: string;
}

export default function Flashcards({ questions, favorites, toggleFavorite, presetSubject }: FlashcardsProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>(presetSubject || 'all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const subjects = useMemo(() => Array.from(new Set(questions.map(q => q.subject))), [questions]);

  const filteredQuestions = useMemo(() => {
    let filtered = questions;
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(q => q.subject === selectedSubject);
    }
    if (showOnlyFavorites) {
      filtered = filtered.filter(q => favorites.includes(q.id));
    }
    if (isLeitnerMode && selectedLeitnerBox !== 'all') {
      filtered = filtered.filter(q => {
        const box = leitnerBoxes[q.id] || 1;
        return box === selectedLeitnerBox;
      });
    }
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(lowerQuery) || 
        q.answer.toLowerCase().includes(lowerQuery) ||
        q.topic.toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [questions, selectedSubject, showOnlyFavorites, isLeitnerMode, selectedLeitnerBox, leitnerBoxes, searchQuery, favorites]);

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

  const handleLeitnerProgress = (known: boolean) => {
    if (!currentQuestion) return;
    const currentBox = leitnerBoxes[currentQuestion.id] || 1;
    let nextBox = known ? Math.min(3, currentBox + 1) : 1;

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.code === 'Space') { e.preventDefault(); setIsFlipped(prev => !prev); }
      else if (e.code === 'ArrowRight') { if (currentCardIndex < shuffledQuestions.length - 1) { setCurrentCardIndex(prev => prev + 1); setIsFlipped(false); } }
      else if (e.code === 'ArrowLeft') { if (currentCardIndex > 0) { setCurrentCardIndex(prev => prev - 1); setIsFlipped(false); } }
      else if (e.key === 'f' || e.key === 'F') { if (shuffledQuestions[currentCardIndex]) toggleFavorite(shuffledQuestions[currentCardIndex].id); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIndex, shuffledQuestions, toggleFavorite]);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const currentQuestion = shuffledQuestions[currentCardIndex];

  // Box counts for Leitner
  const box1Count = questions.filter(q => (leitnerBoxes[q.id] || 1) === 1).length;
  const box2Count = questions.filter(q => (leitnerBoxes[q.id] || 1) === 2).length;
  const box3Count = questions.filter(q => (leitnerBoxes[q.id] || 1) === 3).length;

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="md:hidden w-full flex justify-end shrink-0">
        <button 
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          {isMobileFiltersOpen ? 'Skrýt filtry' : 'Zobrazit filtry'}
        </button>
      </div>

      {/* Sidebar Controls */}
      <aside className={`w-full md:w-72 flex-col gap-6 shrink-0 md:h-full md:overflow-y-auto ${isMobileFiltersOpen ? 'flex' : 'hidden md:flex'}`}>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            Nastavení Drilu
          </h3>
          
          <div className="space-y-4">
            {/* Spaced Repetition Toggle */}
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 rounded-xl">
              <label className="flex items-center justify-between cursor-pointer mb-2">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Leitnerův systém (Opakování)</span>
                </div>
                <input
                  type="checkbox"
                  checked={isLeitnerMode}
                  onChange={(e) => setIsLeitnerMode(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              {isLeitnerMode && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-indigo-200/40 dark:border-indigo-900/40">
                  <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
                    <button
                      onClick={() => setSelectedLeitnerBox(1)}
                      className={`p-1.5 rounded-md border text-center transition-all ${
                        selectedLeitnerBox === 1
                          ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>Box 1</span>
                      <span className="block text-[10px] opacity-80">{box1Count}</span>
                    </button>
                    <button
                      onClick={() => setSelectedLeitnerBox(2)}
                      className={`p-1.5 rounded-md border text-center transition-all ${
                        selectedLeitnerBox === 2
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>Box 2</span>
                      <span className="block text-[10px] opacity-80">{box2Count}</span>
                    </button>
                    <button
                      onClick={() => setSelectedLeitnerBox(3)}
                      className={`p-1.5 rounded-md border text-center transition-all ${
                        selectedLeitnerBox === 3
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>Box 3</span>
                      <span className="block text-[10px] opacity-80">{box3Count}</span>
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
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Předmět</label>
              <select 
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="all">Všechny předměty</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
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
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              Zamíchat kartičky
            </button>
          </div>
        </div>
      </aside>

      {/* Main Flashcard Area */}
      <section className="flex-1 flex flex-col h-full overflow-hidden shrink-0 min-h-[400px]">
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
            <div className="flex justify-between items-center mb-4 px-2 w-full">
              <div className="flex items-center gap-2">
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
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    (leitnerBoxes[currentQuestion.id] || 1) === 3
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : (leitnerBoxes[currentQuestion.id] || 1) === 2
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  }`}>
                    Box {leitnerBoxes[currentQuestion.id] || 1}
                  </span>
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

            {/* The 3D Card */}
            <div className="relative h-96 w-full perspective-1000">
              <div 
                className={`w-full h-full transition-all duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={handleFlip}
              >
                {/* Front Side */}
                <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                      {currentQuestion.subject} • {currentQuestion.topic}
                    </div>
                    <div className="flex items-center gap-1">
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
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-slate-50 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-900/50 rounded-2xl shadow-sm p-8 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Odpověď</div>
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
              <div className="flex items-center justify-center gap-4 mt-6 w-full animate-fadeIn">
                <button
                  onClick={() => handleLeitnerProgress(false)}
                  className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ještě neumím (Vrátit do Boxu 1)</span>
                </button>
                <button
                  onClick={() => handleLeitnerProgress(true)}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Umím (Posunout dál)</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-6 mt-8 w-full">
                  <button 
                    onClick={handlePrev}
                    disabled={currentCardIndex === 0}
                    className="p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                    title="Předchozí karta (Šipka vlevo)"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={currentCardIndex === shuffledQuestions.length - 1}
                    className="p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                    title="Další karta (Šipka vpravo)"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
                <div className="hidden sm:flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-400 dark:text-slate-600 font-mono">
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
