import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Puzzle, RotateCcw, Timer, Trophy, ArrowRight, Award, Printer, Plus, Edit3, Trash2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { MatchingCategory, MatchingRecord } from '../types';
import DiagramGame, { DiagramStats } from './DiagramGame';
import { recordMatchingCompletion, MATCHING_XP } from '../utils/gamification';
import { NAV_TAB_LABELS } from '../data/navTabs';
import PrintHeader from './common/PrintHeader';
import MatchingCategoryEditModal from './common/MatchingCategoryEditModal';
import ConfirmDialog from './common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useEditableContent } from '../hooks/useEditableContent';

interface MatchingGameProps {
  categories: MatchingCategory[];
  onGameComplete?: (record: MatchingRecord) => void;
  onNavigateToBadges?: () => void;
}

interface XpLine {
  label: string;
  xp: number;
}

function buildXpBreakdown(record: MatchingRecord): XpLine[] | null {
  const lines: XpLine[] = [{ label: 'Dokončení poznávačky', xp: MATCHING_XP.base }];
  if (record.flawless) lines.push({ label: 'Bez jediné chyby', xp: MATCHING_XP.flawless });
  if (record.timeSeconds <= MATCHING_XP.fast.limitSeconds) {
    lines.push({ label: `Do ${MATCHING_XP.fast.limitSeconds} sekund`, xp: MATCHING_XP.fast.xp });
  } else if (record.timeSeconds <= MATCHING_XP.quick.limitSeconds) {
    lines.push({ label: `Do ${MATCHING_XP.quick.limitSeconds} sekund`, xp: MATCHING_XP.quick.xp });
  }
  const sum = lines.reduce((acc, l) => acc + l.xp, 0);
  return sum === record.xpEarned ? lines : null;
}

function pluralCz(count: number, one: string, few: string, many: string): string {
  if (count === 1) return `${count} ${one}`;
  if (count >= 2 && count <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
}

/** Fisher–Yates: každá permutace stejně pravděpodobná (sort(random) není). */
function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface VictoryCardProps {
  record: MatchingRecord;
  categoryTitle: string;
  nextCategory: MatchingCategory | null;
  onRestart: () => void;
  onNextCategory: (id: string) => void;
  onNavigateToBadges?: () => void;
}

/** Klidná karta po dokončení — společná pro klasickou poznávačku i schéma. */
function VictoryCard({ record, categoryTitle, nextCategory, onRestart, onNextCategory, onNavigateToBadges }: VictoryCardProps) {
  const breakdown = buildXpBreakdown(record);

  return (
    <div className="max-w-lg mx-auto py-6 sm:py-10 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
        <Trophy className="w-7 h-7" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Hotovo, vše přiřazeno</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">Poznávačka „{categoryTitle}“ je dokončená.</p>

      <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 text-left mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Získané XP</span>
          <span className="text-lg font-bold text-violet-600 dark:text-violet-400">+{record.xpEarned} XP</span>
        </div>

        {breakdown ? (
          <ul className="py-3 space-y-1 text-sm">
            {breakdown.map((line) => (
              <li key={line.label} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>{line.label}</span>
                <span className="font-semibold tabular-nums">+{line.xp} XP</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-3 text-xs text-slate-500 dark:text-slate-400">Rozpis odměny není k dispozici.</p>
        )}

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">Čas</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-violet-500" aria-hidden="true" />
              {formatTime(record.timeSeconds)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">Chyby</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              {record.flawless ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> bez chyby
                </span>
              ) : (
                pluralCz(record.errorsCount, 'chyba', 'chyby', 'chyb')
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Hrát znovu
        </button>
        {nextCategory ? (
          <button
            type="button"
            onClick={() => onNextCategory(nextCategory.id)}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Další poznávačka</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          onNavigateToBadges && (
            <button
              type="button"
              onClick={onNavigateToBadges}
              className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4" aria-hidden="true" />
              <span>Zobrazit odznaky</span>
            </button>
          )
        )}
      </div>
    </div>
  );
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
    purge: purgeCategory,
    toggleHidden: toggleCategoryHidden,
  } = useEditableContent<MatchingCategory>('matching_category', categories, canEdit);

  const [gameKey, setGameKey] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MatchingCategory | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [purgeCategoryId, setPurgeCategoryId] = useState<string | null>(null);

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
  // Schéma (type 'diagram') si měří čas a chyby samo; sem je jen hlásí,
  // aby počítadla v hlavičce byla jedna pro oba druhy poznávačky.
  const [diagramStats, setDiagramStats] = useState<DiagramStats | null>(null);

  const timerRef = useRef<number | null>(null);
  const mismatchTimeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const activeCategory = useMemo(
    () => gameCategories.find(c => c.id === selectedCategoryId),
    [gameCategories, selectedCategoryId]
  );
  const activeEntry = useMemo(
    () => categoryEntries.find(e => e.id === selectedCategoryId) ?? null,
    [categoryEntries, selectedCategoryId]
  );
  const isDiagram = activeCategory?.type === 'diagram';

  // Obsazení funkcí stárne. Úprava lektorem nese vlastní datum uložení,
  // výchozí data datum ze zdroje (pole asOf v matching.ts).
  const personnelAsOf = useMemo(() => {
    const base = categories.find(c => c.id === selectedCategoryId);
    if (!activeCategory?.asOf && !base?.asOf) return null;
    if (activeEntry?.editedAt) {
      const edited = new Date(activeEntry.editedAt);
      if (!Number.isNaN(edited.getTime())) return edited.toLocaleDateString('cs-CZ');
    }
    return activeCategory?.asOf ?? base?.asOf ?? null;
  }, [categories, selectedCategoryId, activeCategory, activeEntry]);

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

  const clearMismatchTimeout = useCallback(() => {
    if (mismatchTimeoutRef.current !== null) {
      window.clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }
  }, []);

  // useCallback drží identitu initGame stabilní, dokud se nezmění kategorie. Efekt
  // níže pak může mít v závislostech přímo initGame, aniž by se hra rozjížděla
  // pořád dokola.
  const initGame = useCallback(() => {
    if (!activeCategory) return;
    clearMismatchTimeout();

    setLeftItems(shuffle(activeCategory.pairs.map(p => ({ id: p.id, text: p.left }))));
    setRightItems(shuffle(activeCategory.pairs.map(p => ({ id: p.id, text: p.right }))));

    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setErrorPair(null);
    setMistakesCount(0);
    setTimeElapsed(0);
    setCompletedRecord(null);
    setDiagramStats(null);
    setIsTimerRunning(activeCategory.type !== 'diagram');
    startTimeRef.current = Date.now();
    setGameKey(prev => prev + 1);
  }, [activeCategory, clearMismatchTimeout]);

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

  // Handle selection and matching. Timeout neshody se uklízí i při odchodu ze
  // záložky nebo restartu, aby setState nedoběhl na odpojené komponentě.
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft === selectedRight) {
        setMatchedPairs(prev => [...prev, selectedLeft]);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setMistakesCount(prev => prev + 1);
        setErrorPair({ left: selectedLeft, right: selectedRight });
        mismatchTimeoutRef.current = window.setTimeout(() => {
          mismatchTimeoutRef.current = null;
          setErrorPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 800);
      }
    }
    return clearMismatchTimeout;
  }, [selectedLeft, selectedRight, clearMismatchTimeout]);

  // Handle game victory (classic only — diagram reports through onGameComplete)
  const isComplete = activeCategory && matchedPairs.length === activeCategory.pairs.length && matchedPairs.length > 0;

  useEffect(() => {
    if (isComplete && isTimerRunning) {
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);

      const finalTime = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const flawless = mistakesCount === 0;

      const { record } = recordMatchingCompletion({
        categoryId: activeCategory?.id || '',
        categoryTitle: activeCategory?.title || NAV_TAB_LABELS.matching,
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

  const nextCategory = useMemo(() => {
    const currentIndex = gameCategories.findIndex(c => c.id === selectedCategoryId);
    if (currentIndex >= 0 && currentIndex < gameCategories.length - 1) {
      return gameCategories[currentIndex + 1];
    }
    return null;
  }, [gameCategories, selectedCategoryId]);

  const shownTime = isDiagram ? diagramStats?.timeElapsed ?? 0 : timeElapsed;
  const shownMistakes = isDiagram ? diagramStats?.mistakes ?? 0 : mistakesCount;
  const shownMatched = isDiagram ? diagramStats?.matched ?? 0 : matchedPairs.length;
  const shownTotal = isDiagram ? activeCategory?.parts?.length ?? 0 : activeCategory?.pairs.length ?? 0;

  const secondaryBtn = 'px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer';

  return (
    <section className="w-full space-y-4 pb-12 print:space-y-0 print:pb-0">
      {/* Záhlaví záložky */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 no-print print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
              <Puzzle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{NAV_TAB_LABELS.matching}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Spojujte pojmy s definicemi a umisťujte názvy součástí do schémat.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {activeCategory && !completedRecord && (
              <div className="flex items-center gap-2 text-xs font-semibold" aria-live="polite">
                <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                  <Timer className="w-3.5 h-3.5 text-violet-500" aria-hidden="true" />
                  {formatTime(shownTime)}
                </span>
                <span className={`px-2.5 py-1.5 rounded-lg tabular-nums ${
                  shownMistakes === 0
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-red-500/10 text-red-700 dark:text-red-400'
                }`}>
                  {pluralCz(shownMistakes, 'chyba', 'chyby', 'chyb')}
                </span>
                <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                  {shownMatched} / {shownTotal}
                </span>
              </div>
            )}
            {activeCategory && (
              <button
                type="button"
                onClick={() => window.print()}
                className={secondaryBtn}
                title="Vytisknout procvičovací list nebo ho uložit do PDF"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Tisk</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Volba poznávačky */}
      {gameCategories.length > 0 ? (
        <div role="group" aria-label="Výběr poznávačky" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 no-print print:hidden">
          {gameCategories.map(cat => {
            const isActive = cat.id === selectedCategoryId;
            return (
              <button
                type="button"
                key={cat.id}
                aria-pressed={isActive}
                title={cat.title}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="block truncate">{cat.title}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400 no-print print:hidden">
          Zatím tu není žádná poznávačka.
          {canEdit && ' Přidejte první tlačítkem níže.'}
        </div>
      )}

      {personnelAsOf && (
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Údaje o obsazení funkcí: stav k {personnelAsOf}. Obsazení se mění — před zkouškou si je ověřte na vscr.cz.
        </p>
      )}

      {/* Správa poznávaček — jen lektor a správce */}
      {canEdit && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 no-print print:hidden">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
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
                  className={secondaryBtn}
                >
                  <Edit3 className="w-4 h-4" aria-hidden="true" />
                  Upravit
                </button>

                <button
                  type="button"
                  onClick={() => toggleCategoryHidden(activeCategory.id).then(r => setCategoryError(r.error))}
                  className={secondaryBtn}
                >
                  {activeEntry?.isHidden ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  {activeEntry?.isHidden ? 'Skryto studentům' : 'Skrýt studentům'}
                </button>

                {confirmDeleteCategory ? (
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      Opravdu odebrat „{activeCategory.title}“?
                    </span>
                    <button
                      type="button"
                      onClick={handleCategoryDelete}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold cursor-pointer transition-colors"
                    >
                      Ano, odebrat
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteCategory(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      Ne
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteCategory(true)}
                    className="px-3.5 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    Odebrat
                  </button>
                )}
              </>
            )}
          </div>

          {deletedEntries.length > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
              <div className="font-semibold">Odebrané poznávačky</div>
              <ul className="space-y-1">
                {deletedEntries.map(entry => (
                  <li key={entry.id} className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-700 dark:text-slate-300">{entry.item.title}</span>
                    <button
                      type="button"
                      onClick={() => restoreCategory(entry.id).then(r => setCategoryError(r.error))}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" aria-hidden="true" />
                      Obnovit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurgeCategoryId(entry.id)}
                      aria-label={`Smazat poznávačku ${entry.item.title} natrvalo`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden="true" />
                      Smazat natrvalo
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ConfirmDialog
            isOpen={purgeCategoryId !== null}
            title="Smazat poznávačku natrvalo?"
            description="Poznávačka zmizí i z přehledu odebraných a vrátit ji půjde jen zásahem do databáze."
            confirmLabel="Smazat natrvalo"
            tone="danger"
            onCancel={() => setPurgeCategoryId(null)}
            onConfirm={() => {
              const id = purgeCategoryId;
              setPurgeCategoryId(null);
              if (id) purgeCategory(id).then(r => setCategoryError(r.error));
            }}
          />

          {categoryError && (
            <div className="text-xs text-red-600 dark:text-red-400" role="alert">{categoryError}</div>
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

      {/* Hrací plocha */}
      {activeCategory && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 print:border-0 print:p-0">
          {completedRecord ? (
            <VictoryCard
              record={completedRecord}
              categoryTitle={activeCategory.title}
              nextCategory={nextCategory}
              onRestart={initGame}
              onNextCategory={setSelectedCategoryId}
              onNavigateToBadges={onNavigateToBadges}
            />
          ) : isDiagram ? (
            <DiagramGame
              key={gameKey}
              category={activeCategory}
              onGameComplete={(record) => {
                setCompletedRecord(record);
                if (onGameComplete) onGameComplete(record);
              }}
              onStatsChange={setDiagramStats}
            />
          ) : (
            <>
              <div className="no-print">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Klikněte na pojem vlevo a potom na odpovídající definici vpravo.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-2.5">
                    <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center justify-between">
                      <span>Pojem</span>
                      <span className="font-normal">1. vyberte</span>
                    </h2>
                    {leftItems.map(item => {
                      const isMatched = matchedPairs.includes(item.id);
                      const isSelected = selectedLeft === item.id;
                      const isError = errorPair?.left === item.id;

                      let btnClass = "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-violet-400 dark:hover:border-violet-500";
                      if (isMatched) btnClass = "bg-emerald-500/10 border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 opacity-50 cursor-not-allowed line-through";
                      else if (isError) btnClass = "bg-red-500/10 border-red-500 text-red-800 dark:text-red-300 font-semibold";
                      else if (isSelected) btnClass = "bg-violet-500/10 border-violet-500 text-violet-900 dark:text-violet-200 font-semibold";

                      return (
                        <button
                          type="button"
                          key={`l-${item.id}`}
                          disabled={isMatched || errorPair !== null}
                          aria-pressed={isSelected}
                          onClick={() => setSelectedLeft(isSelected ? null : item.id)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-colors text-xs sm:text-sm font-medium cursor-pointer ${btnClass}`}
                        >
                          {item.text}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-2.5">
                    <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center justify-between">
                      <span>Definice</span>
                      <span className="font-normal">2. přiřaďte</span>
                    </h2>
                    {rightItems.map(item => {
                      const isMatched = matchedPairs.includes(item.id);
                      const isSelected = selectedRight === item.id;
                      const isError = errorPair?.right === item.id;

                      let btnClass = "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-violet-400 dark:hover:border-violet-500";
                      if (isMatched) btnClass = "bg-emerald-500/10 border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 opacity-50 cursor-not-allowed line-through";
                      else if (isError) btnClass = "bg-red-500/10 border-red-500 text-red-800 dark:text-red-300 font-semibold";
                      else if (isSelected) btnClass = "bg-violet-500/10 border-violet-500 text-violet-900 dark:text-violet-200 font-semibold";

                      return (
                        <button
                          type="button"
                          key={`r-${item.id}`}
                          disabled={isMatched || errorPair !== null}
                          aria-pressed={isSelected}
                          onClick={() => setSelectedRight(isSelected ? null : item.id)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-colors text-xs sm:text-sm font-medium cursor-pointer ${btnClass}`}
                        >
                          {item.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Procvičovací list pro klasickou poznávačku (jen při tisku) */}
              <div className="hidden print:block w-full text-slate-900 bg-white">
                <PrintHeader
                  subject={`Poznávačka – ${activeCategory.title}`}
                  docTitle="Procvičovací list"
                  subtext="Studijní portál – neoficiální studijní materiál"
                />

                <div className="print-card mb-4 p-3 border border-slate-400 rounded-lg text-xs grid grid-cols-3 gap-3">
                  <div><span className="font-bold">Jméno:</span> ............................................</div>
                  <div><span className="font-bold">Datum:</span> .........................</div>
                  <div><span className="font-bold">Výsledek:</span> ......... / {activeCategory.pairs.length} bodů</div>
                </div>

                <p className="text-xs text-slate-700 italic mb-4">
                  Pokyn: K jednotlivým pojmům v levém sloupci přiřaďte správnou definici z pravého sloupce. Do prázdné hranaté závorky vepište odpovídající písmeno (A, B, C…).
                </p>

                <div className="print-card print-avoid-break mb-6 border border-slate-300 rounded-lg p-4 grid grid-cols-2 gap-6 text-xs">
                  <div>
                    <h2 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-1">
                      1. Pojmy k přiřazení
                    </h2>
                    <div className="space-y-3">
                      {activeCategory.pairs.map((p, idx) => (
                        <div key={p.id} className="flex items-start gap-2">
                          <span className="font-bold w-6">{idx + 1}.</span>
                          <span className="font-mono font-bold border-b border-slate-700 px-1.5 py-0.5 text-center min-w-[28px]">[ &nbsp; ]</span>
                          <span className="font-semibold text-slate-900">{p.left}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-1">
                      2. Možnosti definic
                    </h2>
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

                {/* Klíč správných odpovědí na konci */}
                <div className="print-avoid-break mt-6 pt-3 border-t-2 border-dashed border-slate-400">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900">
                      Klíč správných odpovědí
                    </span>
                    <span className="text-[0.625rem] text-slate-600 italic">
                      Před procvičováním odstřihněte nebo přeložte
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {activeCategory.pairs.map((p, idx) => {
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
      )}
    </section>
  );
}
