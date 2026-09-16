import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LayoutGrid, CheckCircle2, RotateCcw, Timer, AlertCircle, Sparkles, Trophy, ArrowRight, Zap, Award, Printer, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { MatchingCategory, MatchingRecord } from '../types';
import DiagramGame from "./DiagramGame";
import { recordMatchingCompletion, loadMatchingHistory } from '../utils/gamification';
import PrintHeader from './common/PrintHeader';
import MatchingCategoryEditModal from './common/MatchingCategoryEditModal';
import { useAuth } from '../context/AuthContext';
import { useEditableContent } from '../hooks/useEditableContent';

interface MatchingGameProps {
  categories: MatchingCategory[];
  onGameComplete?: (record: MatchingRecord) => void;
  onNavigateToBadges?: () => void;
}

export default function MatchingGame({ categories, onGameComplete, onNavigateToBadges }: MatchingGameProps) {
  const { profile } = useAuth();
  const canEdit = profile?.role === 'lektor' || profile?.role === 'admin';

  // Poznávačky z repozitáře přepsané úpravami lektora (viz contentLibrary.ts).
  // `categories` jsou výchozí data, překryv z databáze je může změnit, doplnit
  // i schovat.
  const {
    entries: categoryEntries,
    items: gameCategories,
    save: saveCategory,
    remove: removeCategory,
    restore: restoreCategory,
    toggleHidden: toggleCategoryHidden,
  } = useEditableContent<MatchingCategory>('matching_category', categories, canEdit);

  const [gameKey, setGameKey] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MatchingCategory | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  
  const [leftItems, setLeftItems] = useState<{ id: string, text: string }[]>([]);
  const [rightItems, setRightItems] = useState<{ id: string, text: string }[]>([]);
  
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // stores pair IDs
  const [errorPair, setErrorPair] = useState<{left: string, right: string} | null>(null);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedRecord, setCompletedRecord] = useState<MatchingRecord | null>(null);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const activeCategory = useMemo(
    () => gameCategories.find(c => c.id === selectedCategoryId),
    [gameCategories, selectedCategoryId]
  );
  const activeEntry = useMemo(
    () => categoryEntries.find(e => e.id === selectedCategoryId) ?? null,
    [categoryEntries, selectedCategoryId]
  );

  // Vybraná poznávačka může zmizet — lektor ji smaže, nebo se seznam teprve
  // dočte ze serveru. Bez tohohle by hra zůstala na prázdné obrazovce.
  useEffect(() => {
    if (gameCategories.length === 0) return;
    if (!gameCategories.some(c => c.id === selectedCategoryId)) {
      setSelectedCategoryId(gameCategories[0].id);
    }
  }, [gameCategories, selectedCategoryId]);

  const deletedEntries = useMemo(
    () => categoryEntries.filter(e => e.isDeleted),
    [categoryEntries]
  );

  const handleCategorySave = async (category: MatchingCategory) => {
    const result = await saveCategory(category);
    setCategoryError(result.error);
    if (!result.error) setSelectedCategoryId(category.id);
    return result;
  };

  const handleCategoryDelete = async () => {
    if (!activeEntry) return;
    const result = await removeCategory(activeEntry.id);
    setCategoryError(result.error);
    setConfirmDeleteCategory(false);
  };

  const printRights = useMemo(() => {
    if (!activeCategory || activeCategory.type === 'diagram') return [];
    return [...activeCategory.pairs].map(p => ({ id: p.id, text: p.right })).sort((a, b) => a.text.localeCompare(b.text, 'cs'));
  }, [activeCategory]);

  // useCallback drží identitu initGame stabilní, dokud se nezmění kategorie. Efekt
  // níže pak může mít v závislostech přímo initGame, aniž by se hra rozjížděla
  // pořád dokola. `matchingCategories` je modulový import, takže activeCategory je
  // stabilní reference a smyčka nehrozí.
  const initGame = useCallback(() => {
    if (!activeCategory) return;
    
    const lefts = activeCategory.pairs.map(p => ({ id: p.id, text: p.left }));
    const rights = activeCategory.pairs.map(p => ({ id: p.id, text: p.right }));
    
    // Shuffle independently
    setLeftItems(lefts.sort(() => Math.random() - 0.5));
    setRightItems(rights.sort(() => Math.random() - 0.5));
    
    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setErrorPair(null);
    setMistakesCount(0);
    setTimeElapsed(0);
    setCompletedRecord(null);
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
    setGameKey(prev => prev + 1);
  }, [activeCategory]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Stopwatch timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        setTimeElapsed(elapsed);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Handle selection and matching
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft === selectedRight) {
        setMatchedPairs(prev => [...prev, selectedLeft]);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setMistakesCount(prev => prev + 1);
        setErrorPair({ left: selectedLeft, right: selectedRight });
        setTimeout(() => {
          setErrorPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 800);
      }
    }
  }, [selectedLeft, selectedRight]);

  // Handle game victory
  const isComplete = activeCategory && matchedPairs.length === activeCategory.pairs.length && matchedPairs.length > 0;

  useEffect(() => {
    if (isComplete && isTimerRunning) {
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);

      const finalTime = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const flawless = mistakesCount === 0;

      const { record } = recordMatchingCompletion({
        categoryId: activeCategory?.id || '',
        categoryTitle: activeCategory?.title || 'Poznávačka',
        timeSeconds: finalTime,
        errorsCount: mistakesCount,
        flawless,
        pairsCount: activeCategory?.pairs.length || 0
      });

      setCompletedRecord(record);
      if (onGameComplete) {
        onGameComplete(record);
      }
    }
  }, [isComplete, isTimerRunning, activeCategory, mistakesCount, onGameComplete]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const nextCategory = useMemo(() => {
    const currentIndex = gameCategories.findIndex(c => c.id === selectedCategoryId);
    if (currentIndex >= 0 && currentIndex < gameCategories.length - 1) {
      return gameCategories[currentIndex + 1];
    }
    return null;
  }, [gameCategories, selectedCategoryId]);

  return (
    <section className="flex-1 flex flex-col h-full overflow-hidden items-center justify-start min-h-[600px] md:min-h-0">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-full">
        {/* Header toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 no-print">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Poznávačka & Pexeso</h2>
            </div>

            {/* Live stats pill */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                <Timer className="w-3.5 h-3.5 text-blue-500" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                mistakesCount === 0 
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
              }`}>
                <span>Chyby: {mistakesCount}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              aria-label="Vybrat kategorii poznávačky"
              className="w-full sm:w-auto p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm dark:text-slate-200"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              {gameCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </select>

            {activeCategory?.type !== 'diagram' && (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                title="Vytisknout pracovní list poznávačky"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Tisk listu</span>
              </button>
            )}
          </div>
        </div>

        {/* Správa poznávaček — jen lektor a správce */}
        {canEdit && (
          <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 no-print">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Přidat poznávačku
              </button>

              {activeCategory && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(activeCategory);
                      setCategoryModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Upravit tuhle
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCategoryHidden(activeCategory.id).then(r => setCategoryError(r.error))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {activeEntry?.isHidden ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                    {activeEntry?.isHidden ? 'Skryto studentům' : 'Skrýt studentům'}
                  </button>

                  {confirmDeleteCategory ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Opravdu odebrat „{activeCategory.title}"?
                      </span>
                      <button
                        type="button"
                        onClick={handleCategoryDelete}
                        className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Ano
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteCategory(false)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                      >
                        Ne
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteCategory(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Odebrat
                    </button>
                  )}
                </>
              )}
            </div>

            {deletedEntries.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Odebrané:</span>
                {deletedEntries.map(entry => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => restoreCategory(entry.id).then(r => setCategoryError(r.error))}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {entry.item.title}
                  </button>
                ))}
              </div>
            )}

            {categoryError && (
              <div className="text-[11px] text-red-600 dark:text-red-400">{categoryError}</div>
            )}
          </div>
        )}

        {canEdit && (
          <MatchingCategoryEditModal
            category={editingCategory}
            isOpen={categoryModalOpen}
            usedIds={categoryEntries.map(e => e.id)}
            onClose={() => {
              setCategoryModalOpen(false);
              setEditingCategory(null);
            }}
            onSave={handleCategorySave}
          />
        )}
            
            {/* Main Content Area */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {activeCategory?.type === 'diagram' ? (
                <DiagramGame key={gameKey} 
                  category={activeCategory} 
                  onGameComplete={(record) => {
                    setCompletedRecord(record);
                    if (onGameComplete) onGameComplete(record);
                  }}
                  onNavigateToBadges={onNavigateToBadges}
                  nextCategory={nextCategory}
                  onNextCategory={setSelectedCategoryId}
                  onRestart={initGame}
                />
              ) : isComplete && completedRecord ? (
                <div className="text-center py-8 sm:py-12 flex flex-col items-center justify-center h-full max-w-lg mx-auto">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white mb-4 shadow-lg shadow-emerald-500/20 animate-bounce">
                    <Trophy className="w-10 h-10" />
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                    Skvělá práce! Vše správně spojeno.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Kategorie „{activeCategory?.title}“ úspěšně dokončena.
                  </p>

                  {/* XP & Stats Award Card */}
                  <div className="w-full bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/80 shadow-sm mb-6 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Získaná odměna
                      </span>
                      <span className="text-lg font-extrabold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                        +{completedRecord.xpEarned} XP
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                        <div className="text-[11px] text-slate-400 font-medium">Čas splnění</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                          <Timer className="w-3.5 h-3.5 text-blue-500" />
                          {completedRecord.timeSeconds} sekund
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                        <div className="text-[11px] text-slate-400 font-medium">Přesnost</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                          {completedRecord.flawless ? (
                            <span className="text-emerald-500 flex items-center gap-1 font-extrabold">
                              <Zap className="w-3.5 h-3.5" /> Bez chyby!
                            </span>
                          ) : (
                            <span className="text-slate-700 dark:text-slate-300">
                              {completedRecord.errorsCount} {completedRecord.errorsCount === 1 ? 'chyba' : 'chyby'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Gamification bonuses note */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 text-center">
                      💡 Základ +80 XP {completedRecord.flawless && '• Bezchybnost +40 XP'} {completedRecord.timeSeconds <= 30 && '• Rychlostní bonus +50 XP'}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <button
                      onClick={initGame}
                      className="w-full sm:flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Hrát znovu
                    </button>

                    {nextCategory ? (
                      <button
                        onClick={() => setSelectedCategoryId(nextCategory.id)}
                        className="w-full sm:flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                      >
                        <span>Další kategorie</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      onNavigateToBadges && (
                        <button
                          onClick={onNavigateToBadges}
                          className="w-full sm:flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          <span>Zkontrolovat odznaky</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="no-print">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
                      <span>Spojte správné dvojice kliknutím na pojem a odpovídající definici:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {matchedPairs.length} / {activeCategory?.pairs.length || 0} spojeno
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Left Column */}
                      <div className="space-y-2.5">
                        <h4 className="font-bold text-slate-400 dark:text-slate-500 text-[11px] tracking-wider uppercase mb-2 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center justify-between">
                          <span>Pojem / Zkratka / Téma</span>
                          <span className="text-[10px] font-normal text-slate-400">1. Vyberte</span>
                        </h4>
                        {leftItems.map(item => {
                          const isMatched = matchedPairs.includes(item.id);
                          const isSelected = selectedLeft === item.id;
                          const isError = errorPair?.left === item.id;
                          
                          let btnClass = "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20";
                          if (isMatched) btnClass = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 opacity-40 cursor-not-allowed line-through";
                          else if (isError) btnClass = "bg-red-50 dark:bg-red-950/40 border-red-500 dark:border-red-700 text-red-800 dark:text-red-300 font-bold ring-2 ring-red-500/20";
                          else if (isSelected) btnClass = "bg-blue-50 dark:bg-blue-950/50 border-blue-500 dark:border-blue-600 text-blue-900 dark:text-blue-200 font-bold ring-2 ring-blue-500/30";
                          
                          return (
                            <button
                              key={`l-${item.id}`}
                              disabled={isMatched || errorPair !== null}
                              onClick={() => setSelectedLeft(isSelected ? null : item.id)}
                              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm font-medium ${btnClass}`}
                            >
                              {item.text}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Right Column */}
                      <div className="space-y-2.5">
                        <h4 className="font-bold text-slate-400 dark:text-slate-500 text-[11px] tracking-wider uppercase mb-2 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center justify-between">
                          <span>Definice / Význam</span>
                          <span className="text-[10px] font-normal text-slate-400">2. Přiřaďte</span>
                        </h4>
                        {rightItems.map(item => {
                          const isMatched = matchedPairs.includes(item.id);
                          const isSelected = selectedRight === item.id;
                          const isError = errorPair?.right === item.id;
                          
                          let btnClass = "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20";
                          if (isMatched) btnClass = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 opacity-40 cursor-not-allowed line-through";
                          else if (isError) btnClass = "bg-red-50 dark:bg-red-950/40 border-red-500 dark:border-red-700 text-red-800 dark:text-red-300 font-bold ring-2 ring-red-500/20";
                          else if (isSelected) btnClass = "bg-blue-50 dark:bg-blue-950/50 border-blue-500 dark:border-blue-600 text-blue-900 dark:text-blue-200 font-bold ring-2 ring-blue-500/30";
                          
                          return (
                            <button
                              key={`r-${item.id}`}
                              disabled={isMatched || errorPair !== null}
                              onClick={() => setSelectedRight(isSelected ? null : item.id)}
                              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm font-medium ${btnClass}`}
                            >
                              {item.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Printable Worksheet View for Classic Matching (Visible exclusively in print) */}
                  <div className="hidden print:block w-full text-slate-900 bg-white">
                    <PrintHeader
                      subject={`Pracovní list: Poznávačka a přiřazování – ${activeCategory?.title || ''}`}
                      docTitle="Pracovní list k prověření odborných znalostí"
                    />

                    <div className="print-card mb-4 p-3 border border-slate-400 rounded-lg text-xs grid grid-cols-3 gap-3">
                      <div><span className="font-bold">Frekventant / Příslušník:</span> ............................................</div>
                      <div><span className="font-bold">Datum:</span> .........................</div>
                      <div><span className="font-bold">Hodnocení:</span> ......... / {activeCategory?.pairs.length || 0} bodů</div>
                    </div>

                    <p className="text-xs text-slate-700 italic mb-4">
                      Pokyn: K jednotlivým pojmům v levém sloupci přiřaďte správnou definici z pravého sloupce. Do prázdné hranaté závorky vepište odpovídající písmeno (A, B, C...).
                    </p>

                    <div className="print-card print-avoid-break mb-6 border border-slate-300 rounded-lg p-4 grid grid-cols-2 gap-6 text-xs">
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-3 border-b border-slate-200 pb-1">
                          1. Pojmy k přiřazení:
                        </h4>
                        <div className="space-y-3">
                          {activeCategory?.pairs.map((p, idx) => (
                            <div key={p.id} className="flex items-start gap-2">
                              <span className="font-bold w-6">{idx + 1}.</span>
                              <span className="font-mono font-bold border-b border-slate-700 px-1.5 py-0.5 text-center min-w-[28px]">[ &nbsp; ]</span>
                              <span className="font-semibold text-slate-900">{p.left}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-3 border-b border-slate-200 pb-1">
                          2. Možnosti definic:
                        </h4>
                        <div className="space-y-3">
                          {printRights.map((item, idx) => (
                            <div key={item.id} className="flex items-start gap-2">
                              <span className="font-bold text-slate-900">{String.fromCharCode(65 + idx)})</span>
                              <span className="text-slate-800">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Separate Answer Key at the end */}
                    <div className="print-avoid-break mt-6 pt-3 border-t-2 border-dashed border-slate-400">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                          Klíč správných odpovědí (pro lektora / instruktora)
                        </span>
                        <span className="text-[10px] text-slate-600 italic">
                          Zde odstřihněte nebo přeložte před zahájením zkoušení
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {activeCategory?.pairs.map((p, idx) => {
                          const letterIdx = printRights.findIndex(r => r.id === p.id);
                          const letter = letterIdx >= 0 ? String.fromCharCode(65 + letterIdx) : '?';
                          return (
                            <div key={p.id} className="flex items-baseline gap-1.5">
                              <span className="font-bold text-slate-900">{idx + 1}.</span>
                              <span>{p.left} &rarr; <strong>[{letter}]</strong></span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      );
    }

