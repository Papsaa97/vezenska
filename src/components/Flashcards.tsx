import React, { useState, useEffect, useMemo, useCallback, useId, useRef } from 'react';
import {
  Search,
  Star,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Layers,
  SlidersHorizontal,
  Volume2,
  CheckCircle2,
  RotateCcw,
  BrainCircuit,
  HelpCircle,
  Edit3,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Question } from '../types';
import { normalizeSubject } from './SubjectsHub';
import { speakText, isSpeechSupported, stopSpeaking } from '../utils/speech';
import { getSubjectInfo } from '../data/questions/subjectsInfo';
import { useAuth } from '../context/AuthContext';
import { NAV_TAB_LABELS } from '../data/navTabs';
import LeitnerHelpModal from './common/LeitnerHelpModal';
import QuestionEditModal from './common/QuestionEditModal';
import ConfirmDialog from './common/ConfirmDialog';
import { isQuestionHidden, toggleQuestionVisibilityInSupabase } from '../utils/questionActions';
import { activateOnKey } from '../utils/a11y';
import { updateDailyStreak } from '../utils/gamification';
import { useProgressRevision } from '../hooks/useProgressRevision';
import {
  getStorageOwner,
  readScoped,
  readScopedRaw,
  writeScoped,
  writeScopedRaw,
} from '../utils/userScopedStorage';

/** Klíče postupu v Leitnerově drilu (v úložišti se doplní id účtu). */
const LEITNER_BOXES_KEY = 'vscr_leitner_boxes';
const LEITNER_ACTIVE_KEY = 'vscr_leitner_active';
const LEITNER_REVIEWS_KEY = 'vscr_leitner_reviews';

/**
 * Odstup opakování pro jednotlivé krabičky ve dnech.
 *
 * PROČ TO TU JE: nápověda „Leitnerův systém rozloženého opakování“ tyhle
 * intervaly slibovala („Denní opakování“, „Každé 2 až 3 dny“, „1× týdně“ …),
 * ale v kódu nebylo nic, co by je vynucovalo — žádné datum posledního
 * opakování, žádná fronta „dnes k opakování“. Krabičky byly jen ruční
 * roztřídění a rozvrh si měl student pamatovat sám. Tím se z rozloženého
 * opakování stal obyčejný zásobník kartiček.
 *
 * Je to jediný zdroj pravdy: z něj se odvozuje počet krabiček, popisky v
 * rozhraní i plánovač. Kdyby se popisky psaly zvlášť, dřív nebo později by
 * slibovaly něco jiného, než co kód dělá — přesně tak vznikla původní vada.
 */
const LEITNER_INTERVAL_DAYS: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

/** Čísla krabiček vzestupně (1 … n), odvozená z LEITNER_INTERVAL_DAYS. */
const LEITNER_BOX_NUMBERS: number[] = Object.keys(LEITNER_INTERVAL_DAYS)
  .map(Number)
  .sort((a, b) => a - b);

const LEITNER_MAX_BOX = LEITNER_BOX_NUMBERS[LEITNER_BOX_NUMBERS.length - 1];

/** „po 1 dni“, „po 3 dnech“ — popis intervalu krabičky odvozený z tabulky. */
function formatIntervalDays(days: number): string {
  return days === 1 ? 'po 1 dni' : `po ${days} dnech`;
}

/** Popisek krabičky pro tooltip a přístupné jméno tlačítka. */
function describeBox(box: number): string {
  const days = LEITNER_INTERVAL_DAYS[box] ?? 1;
  const suffix = box === LEITNER_MAX_BOX ? ' (dlouhodobá paměť)' : '';
  return `Box ${box}: opakování ${formatIntervalDays(days)}${suffix}`;
}

/** Správný tvar „kartička“ podle počtu (1 kartička, 2 kartičky, 5 kartiček). */
function pluralCards(count: number): string {
  if (count === 1) return `${count} kartička`;
  if (count >= 2 && count <= 4) return `${count} kartičky`;
  return `${count} kartiček`;
}

/** Půlnoc místního dne, do kterého čas `ms` patří. */
function startOfLocalDay(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Kdy bude kartička zase na řadě (ms od epochy); u nikdy neopakované teď.
 *
 * Počítají se kalendářní dny, ne klouzavé 24hodinové bloky: kartička
 * zopakovaná večer s intervalem 1 den je zase na řadě hned zítra ráno,
 * ne až zítra večer.
 */
function nextReviewAt(box: number, lastReviewedISO: string | undefined): number {
  if (!lastReviewedISO) return Date.now();
  const last = new Date(lastReviewedISO).getTime();
  if (Number.isNaN(last)) return Date.now();
  const due = new Date(startOfLocalDay(last));
  due.setDate(due.getDate() + (LEITNER_INTERVAL_DAYS[box] ?? 1));
  return due.getTime();
}

/** Je kartička v daném boxu dnes ke zopakování? */
function isDueForReview(box: number, lastReviewedISO: string | undefined): boolean {
  // Nikdy neopakovaná kartička je splatná vždy.
  if (!lastReviewedISO) return true;
  return Date.now() >= nextReviewAt(box, lastReviewedISO);
}

interface DeckFilters {
  subject: string;
  favoritesOnly: boolean;
  favorites: string[];
  search: string;
}

/**
 * Filtry balíčku kromě Leitnerovy krabičky: předmět, oblíbené, hledání.
 *
 * Společný základ pro balíček i pro počty v krabičkách. Dřív se počty
 * (B1–B5, „dnes k opakování“) počítaly ze všech předmětů, kdežto balíček
 * respektoval filtry — u „dnes 40“ se pak otevřel prázdný balíček.
 */
function filterDeckBase(questions: Question[], filters: DeckFilters): Question[] {
  let filtered = questions;
  if (filters.subject !== 'all') {
    const normSel = normalizeSubject(filters.subject);
    filtered = filtered.filter(q => q?.subject && (q.subject === filters.subject || normalizeSubject(q.subject) === normSel));
  }
  if (filters.favoritesOnly) {
    filtered = filtered.filter(q => q?.id && filters.favorites.includes(q.id));
  }
  if (filters.search.trim()) {
    const lowerQuery = filters.search.toLowerCase();
    filtered = filtered.filter(q =>
      (q?.question || '').toLowerCase().includes(lowerQuery) ||
      (q?.answer || '').toLowerCase().includes(lowerQuery) ||
      (q?.topic || '').toLowerCase().includes(lowerQuery)
    );
  }
  return filtered;
}

interface FlashcardsProps {
  questions: Question[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  presetSubject?: string;
  onUpdateQuestion?: (updatedQuestion: Question) => void;
}

/** Sdílené třídy tlačítek v postranním panelu (výběr krabičky). */
const BOX_BUTTON_ACTIVE = 'bg-teal-600 text-white border-teal-700';
const BOX_BUTTON_IDLE =
  'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500';

export default function Flashcards({
  questions = [],
  favorites = [],
  toggleFavorite,
  presetSubject,
  onUpdateQuestion,
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
  const [confirmResetLeitner, setConfirmResetLeitner] = useState(false);

  // Leitnerovy krabičky. Ukládají se v tomto prohlížeči, zvlášť pro každý účet
  // (utils/userScopedStorage); na jiné zařízení se nepřenášejí. Klíčem je id
  // otázky z databáze, takže záložní banka (bez připojení) má postup vlastní.
  const progressRevision = useProgressRevision();

  const [isLeitnerMode, setIsLeitnerMode] = useState<boolean>(
    () => readScopedRaw(LEITNER_ACTIVE_KEY) === 'true'
  );

  const [leitnerBoxes, setLeitnerBoxes] = useState<Record<string, number>>(
    () => readScoped<Record<string, number>>(LEITNER_BOXES_KEY, {})
  );

  /** Datum posledního opakování kartičky — podklad pro plánovač. */
  const [leitnerReviews, setLeitnerReviews] = useState<Record<string, string>>(
    () => readScoped<Record<string, string>>(LEITNER_REVIEWS_KEY, {})
  );

  // Výchozí volba je „ke zopakování dnes“ — to je celý smysl metody.
  const [selectedLeitnerBox, setSelectedLeitnerBox] = useState<number | 'all' | 'due'>('due');

  // Po změně vlastníka klíče (přihlášení / odhlášení) se krabičky načtou znovu.
  const leitnerOwnerRef = useRef<string>(getStorageOwner());
  // Předčítání nesmí pokračovat, když student přepne na jinou záložku.
  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    const owner = getStorageOwner();
    if (owner === leitnerOwnerRef.current) return;
    leitnerOwnerRef.current = owner;
    setLeitnerBoxes(readScoped<Record<string, number>>(LEITNER_BOXES_KEY, {}));
    setLeitnerReviews(readScoped<Record<string, string>>(LEITNER_REVIEWS_KEY, {}));
    setIsLeitnerMode(readScopedRaw(LEITNER_ACTIVE_KEY) === 'true');
  }, [progressRevision]);

  useEffect(() => {
    writeScopedRaw(LEITNER_ACTIVE_KEY, String(isLeitnerMode));
  }, [isLeitnerMode]);

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

  // Krabičky a oblíbené se do skládání balíčku berou přes ref, ne přes
  // závislosti.
  //
  // PROČ: dřív balíček závisel na `leitnerBoxes`. Označení kartičky jako
  // „vím“ krabičky změnilo, balíček se přepočítal a efekt níže poslal index
  // zpátky na nulu — čímž okamžitě zrušil `handleNext()` z
  // handleLeitnerProgress. Ve zvolené krabičce se tak dril zasekl na první
  // kartě a totéž zahazovalo i výsledek tlačítka „Zamíchat“.
  const leitnerBoxesRef = useRef(leitnerBoxes);
  useEffect(() => {
    leitnerBoxesRef.current = leitnerBoxes;
  }, [leitnerBoxes]);

  const leitnerReviewsRef = useRef(leitnerReviews);
  useEffect(() => {
    leitnerReviewsRef.current = leitnerReviews;
  }, [leitnerReviews]);

  const favoritesRef = useRef(favorites);
  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  /** Složí balíček podle právě nastavených filtrů. */
  const buildDeck = useCallback((): Question[] => {
    let filtered = filterDeckBase(accessibleQuestions, {
      subject: selectedSubject,
      favoritesOnly: showOnlyFavorites,
      favorites: favoritesRef.current || [],
      search: searchQuery,
    });

    if (isLeitnerMode && selectedLeitnerBox === 'due') {
      filtered = filtered.filter(q => {
        if (!q?.id) return false;
        const box = leitnerBoxesRef.current[q.id] || 1;
        return isDueForReview(box, leitnerReviewsRef.current[q.id]);
      });
    } else if (isLeitnerMode && selectedLeitnerBox !== 'all') {
      filtered = filtered.filter(q => {
        const box = q?.id ? (leitnerBoxesRef.current[q.id] || 1) : 1;
        return box === selectedLeitnerBox;
      });
    }
    return filtered;
  }, [accessibleQuestions, selectedSubject, showOnlyFavorites, isLeitnerMode, selectedLeitnerBox, searchQuery]);

  /** Poskládá balíček znovu a začne od začátku. */
  const resetDeck = useCallback(() => {
    setShuffledQuestions(buildDeck());
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [buildDeck]);

  // Nový balíček jen při změně filtru — ne po každém označení kartičky.
  useEffect(() => {
    resetDeck();
  }, [resetDeck]);

  const handleShuffle = () => {
    setShuffledQuestions(prev => {
      const shuffled = [...prev];
      // Fisher–Yates. `sort(() => Math.random() - 0.5)` nedává rovnoměrné
      // promíchání a v týhle aplikaci se používal na pěti místech.
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
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

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const currentQuestion: Question | undefined = shuffledQuestions[currentCardIndex];
  const currentQuestionId = currentQuestion?.id;
  const isCurrentHidden = currentQuestion ? isQuestionHidden(currentQuestion) : false;

  // Přechod na jinou kartičku předčítání zastaví — jinak hlas dočítal
  // předchozí otázku přes tu novou.
  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, [currentCardIndex, currentQuestionId]);

  const handleSpeak = () => {
    if (!currentQuestion) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const textToRead = isFlipped
      ? `Odpověď: ${currentQuestion.answer}. Odůvodnění: ${currentQuestion.rationale}`
      : `Otázka: ${currentQuestion.question}`;

    setIsSpeaking(true);
    speakText(textToRead, () => setIsSpeaking(false));
  };

  // Leitnerovo rozložené opakování: postup krabičkami 1 … LEITNER_MAX_BOX.
  const handleLeitnerProgress = (known: boolean) => {
    if (!currentQuestion) return;
    const currentBox = leitnerBoxes[currentQuestion.id] || 1;
    // Správná odpověď: posun o 1 box výše (až do nejvyššího boxu), chyba: zpět do Boxu 1.
    // Výš ale postoupí jen kartička, která je dnes na řadě. Dřív šla kartička
    // o box výš při každém „Umím“, takže se dala za jedno sezení proklikat
    // z Boxu 1 až do Boxu 5 a rozložené opakování ztratilo smysl.
    const wasDue = isDueForReview(currentBox, leitnerReviews[currentQuestion.id]);
    const nextBox = known ? (wasDue ? Math.min(LEITNER_MAX_BOX, currentBox + 1) : currentBox) : 1;

    const nextBoxes = { ...leitnerBoxes, [currentQuestion.id]: nextBox };
    setLeitnerBoxes(nextBoxes);
    leitnerBoxesRef.current = nextBoxes;
    writeScoped(LEITNER_BOXES_KEY, nextBoxes);

    // Datum opakování je to, co dělá z krabiček rozložené opakování: podle něj
    // se kartička zase objeví ve frontě „ke zopakování dnes“. Kartička „Ještě
    // neumím“ datum nedostane, takže zůstane ve dnešní frontě a vrátí se v
    // dalším kole — dřív čekala do zítřka.
    const nextReviews = { ...leitnerReviews };
    if (known && wasDue) nextReviews[currentQuestion.id] = new Date().toISOString();
    else delete nextReviews[currentQuestion.id];
    setLeitnerReviews(nextReviews);
    leitnerReviewsRef.current = nextReviews;
    writeScoped(LEITNER_REVIEWS_KEY, nextReviews);

    updateDailyStreak();

    // Poslední kartička kola: balíček se poskládá znovu, takže se ve zvolené
    // krabičce ukáže její nový obsah. Jinak se jen postoupí dál.
    if (currentCardIndex >= shuffledQuestions.length - 1) {
      resetDeck();
    } else {
      handleNext();
    }
  };

  const handleResetLeitner = () => {
    setConfirmResetLeitner(true);
  };

  const doResetLeitner = () => {
    setLeitnerBoxes({});
    leitnerBoxesRef.current = {};
    writeScoped(LEITNER_BOXES_KEY, {});
    setLeitnerReviews({});
    leitnerReviewsRef.current = {};
    writeScoped(LEITNER_REVIEWS_KEY, {});
    setConfirmResetLeitner(false);
    resetDeck();
  };

  // Visibility toggle for lektor/admin
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const handleToggleVisibility = useCallback(async (q: Question) => {
    if (!canEdit || !q) return;
    const res = await toggleQuestionVisibilityInSupabase(q);
    // Neuložené skrytí se nesmí tvářit jako hotové — studenti by kartičku
    // dál viděli, zatímco lektor by ji měl označenou jako skrytou.
    if (!res.success) {
      setVisibilityError(`Skrytí se nepodařilo uložit${res.error ? `: ${res.error}` : ''}.`);
      return;
    }
    setVisibilityError(null);
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

  // Klávesové zkratky.
  //
  // Mezerník se schválně NEODCHYTÁVÁ, když je fokus na ovládacím prvku.
  // Dřív posluchač na `window` volal na mezerník preventDefault() vždy, když
  // fokus nebyl v input/textarea/select — tím pádem zafokusované tlačítko
  // („Vím“, „Nevím“, „Zamíchat“) nešlo mezerníkem zmáčknout, protože
  // preventDefault na keydown zruší i vyvolání kliknutí. Uživatel klávesnice
  // tak o celý dril přišel a jen se mu převracela kartička.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingQuestion || isHelpModalOpen || confirmResetLeitner) return;

      const target = e.target as HTMLElement | null;
      // Kartička sama je role="button" a mezerník/Enter si obsluhuje přes
      // activateOnKey. Šipky a F ale po kliknutí na kartičku (fokus zůstane
      // na ní) dřív nefungovaly, protože se tu vracelo u každého tlačítka.
      const onCard = Boolean(target?.closest('[data-flashcard="true"]'));
      if (onCard && (e.code === 'Space' || e.key === 'Enter')) return;
      // Prvky, které si klávesy obsluhují samy.
      if (!onCard && target?.closest('input, textarea, select, button, a[href], [role="button"], [contenteditable="true"]')) {
        return;
      }

      if (e.code === 'Space') { e.preventDefault(); setIsFlipped(prev => !prev); }
      else if (e.code === 'ArrowRight') { if (currentCardIndex < shuffledQuestions.length - 1) { setCurrentCardIndex(prev => prev + 1); setIsFlipped(false); } }
      else if (e.code === 'ArrowLeft') { if (currentCardIndex > 0) { setCurrentCardIndex(prev => prev - 1); setIsFlipped(false); } }
      else if (e.key === 'f' || e.key === 'F') { if (shuffledQuestions[currentCardIndex]) toggleFavorite(shuffledQuestions[currentCardIndex].id); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIndex, shuffledQuestions, toggleFavorite, editingQuestion, isHelpModalOpen, confirmResetLeitner]);

  // Obsazenost krabiček a počet kartiček splatných k dnešnímu opakování.
  // Jedním průchodem, ne šesti — dřív se pole procházelo pro každou krabičku
  // zvlášť a bez memoizace při každém renderu.
  //
  // Počítá se ze stejného základu jako balíček (filterDeckBase), jen bez filtru
  // krabičky — jinak by čísla u krabiček slibovala kartičky, které balíček
  // s právě nastaveným předmětem nebo hledáním vůbec nenabídne.
  const { boxCounts, dueCount, baseCount, nextDueAt } = useMemo(() => {
    const base = filterDeckBase(accessibleQuestions, {
      subject: selectedSubject,
      favoritesOnly: showOnlyFavorites,
      favorites,
      search: searchQuery,
    });
    const counts: Record<number, number> = {};
    for (const box of LEITNER_BOX_NUMBERS) counts[box] = 0;
    let due = 0;
    let soonest = Number.POSITIVE_INFINITY;
    for (const q of base) {
      if (!q?.id) continue;
      const box = leitnerBoxes[q.id] || 1;
      if (box in counts) counts[box] += 1;
      if (isDueForReview(box, leitnerReviews[q.id])) due += 1;
      else soonest = Math.min(soonest, nextReviewAt(box, leitnerReviews[q.id]));
    }
    return {
      boxCounts: counts,
      dueCount: due,
      baseCount: base.length,
      nextDueAt: Number.isFinite(soonest) ? soonest : null,
    };
  }, [accessibleQuestions, selectedSubject, showOnlyFavorites, favorites, searchQuery, leitnerBoxes, leitnerReviews]);

  // Prázdná fronta „dnes k opakování“ při neprázdném výběru není chyba filtru,
  // ale splněný úkol: vše, co bylo na řadě, je zopakované.
  const isDueQueueDone = isLeitnerMode && selectedLeitnerBox === 'due' && baseCount > 0 && shuffledQuestions.length === 0;

  // Prázdná konkrétní krabička při neprázdném výběru — také ne chyba filtru,
  // jen v ní teď žádná kartička neleží.
  const isSelectedBoxEmpty =
    isLeitnerMode && typeof selectedLeitnerBox === 'number' && baseCount > 0 && shuffledQuestions.length === 0;

  const currentBox = currentQuestion ? (leitnerBoxes[currentQuestion.id] || 1) : 1;
  const isCurrentFavorite = currentQuestion ? favorites.includes(currentQuestion.id) : false;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Leitner Explanation Modal */}
      <LeitnerHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={confirmResetLeitner}
        tone="danger"
        title="Vrátit všechny kartičky do Boxu 1?"
        description={
          <>
            Zahodí se tím <strong>celý váš postup v Leitnerových krabičkách</strong> — všechny
            kartičky se vrátí na začátek, jako byste s drilem ještě nezačal. Vrátit to zpět nelze.
          </>
        }
        confirmLabel="Vrátit do Boxu 1"
        onConfirm={doResetLeitner}
        onCancel={() => setConfirmResetLeitner(false)}
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

      {/* Záhlaví stránky — stejné jako u ostatních záložek */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 no-print print:hidden shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
              <Layers className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{NAV_TAB_LABELS.flashcards}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Otázky z banky jako oboustranné kartičky, volitelně s Leitnerovým rozloženým opakováním.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-sm text-slate-500 dark:text-slate-400">
              {/* V Leitnerově režimu balíček tvoří jen kartičky zvolené krabičky
                  nebo dnešní fronty, takže se ukazují obě čísla — jinak
                  „Karta 2 z 362“ vedle „364 kartiček“ vypadalo jako chyba. */}
              {shuffledQuestions.length !== baseCount
                ? `${shuffledQuestions.length} v balíčku z ${pluralCards(baseCount)} ve výběru`
                : `${pluralCards(baseCount)} ve výběru`}
            </span>
            {/* Přepínač filtrů jen na mobilu — na širší obrazovce je panel vidět vždy */}
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              aria-expanded={isMobileFiltersOpen}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              {isMobileFiltersOpen ? 'Skrýt filtry' : 'Zobrazit filtry'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-5">
        {/* Sidebar Controls */}
        <aside className={`w-full md:w-72 flex-col gap-5 shrink-0 no-print ${isMobileFiltersOpen ? 'flex' : 'hidden md:flex'}`}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Nastavení drilu
            </h2>

            <div className="space-y-4">
              {/* Leitnerovo rozložené opakování */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={`${fieldIds}-leitner`} className="flex items-center gap-2 cursor-pointer min-w-0">
                    <input
                      id={`${fieldIds}-leitner`}
                      type="checkbox"
                      checked={isLeitnerMode}
                      onChange={(e) => setIsLeitnerMode(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <BrainCircuit className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" aria-hidden="true" />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">Leitnerův systém</span>
                  </label>
                  {/* Jediné tlačítko nápovědy na stránce */}
                  <button
                    type="button"
                    onClick={() => setIsHelpModalOpen(true)}
                    className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 shrink-0 cursor-pointer"
                    aria-label="Nápověda k Leitnerovu systému"
                    title="Jak funguje Leitnerův systém rozloženého opakování?"
                  >
                    <HelpCircle className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {isLeitnerMode && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                    {/* Fronta „ke zopakování dnes“ — jádro rozloženého opakování.
                        Odstupy krabiček určuje LEITNER_INTERVAL_DAYS. */}
                    <button
                      type="button"
                      onClick={() => setSelectedLeitnerBox('due')}
                      aria-pressed={selectedLeitnerBox === 'due'}
                      title="Kartičky, u kterých už uplynul odstup opakování pro jejich krabičku"
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        selectedLeitnerBox === 'due' ? BOX_BUTTON_ACTIVE : BOX_BUTTON_IDLE
                      }`}
                    >
                      <span>Ke zopakování dnes</span>
                      <span
                        className={`px-1.5 rounded-full tabular-nums ${
                          selectedLeitnerBox === 'due'
                            ? 'bg-white/20'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dueCount}
                      </span>
                    </button>

                    {/* Krabičky odvozené z LEITNER_INTERVAL_DAYS */}
                    <div className="grid grid-cols-5 gap-1 text-[0.6875rem] font-semibold">
                      {LEITNER_BOX_NUMBERS.map(box => {
                        const isActive = selectedLeitnerBox === box;
                        return (
                          <button
                            key={box}
                            type="button"
                            onClick={() => setSelectedLeitnerBox(box)}
                            aria-pressed={isActive}
                            aria-label={`${describeBox(box)}, ${pluralCards(boxCounts[box] ?? 0)}`}
                            title={describeBox(box)}
                            className={`p-1 rounded-md border text-center transition-colors cursor-pointer ${
                              isActive ? BOX_BUTTON_ACTIVE : BOX_BUTTON_IDLE
                            }`}
                          >
                            <span>B{box}</span>
                            <span className="block text-[0.625rem] opacity-80 tabular-nums">{boxCounts[box] ?? 0}</span>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 leading-snug">
                      Opakování:{' '}
                      {LEITNER_BOX_NUMBERS.map((box, i) => (
                        <span key={box}>
                          B{box} {formatIntervalDays(LEITNER_INTERVAL_DAYS[box])}
                          {i < LEITNER_BOX_NUMBERS.length - 1 ? ', ' : '.'}
                        </span>
                      ))}
                    </p>

                    <div className="flex justify-between items-center pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedLeitnerBox('all')}
                        aria-pressed={selectedLeitnerBox === 'all'}
                        className={`underline cursor-pointer ${
                          selectedLeitnerBox === 'all'
                            ? 'font-semibold text-slate-900 dark:text-white'
                            : 'text-teal-700 dark:text-teal-400'
                        }`}
                      >
                        Všechny boxy
                      </button>
                      <button
                        type="button"
                        onClick={handleResetLeitner}
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                      >
                        Vrátit vše do Boxu 1
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor={`${fieldIds}-search`} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Hledat
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                  <input
                    id={`${fieldIds}-search`}
                    type="search"
                    placeholder="Otázka, odpověď nebo téma"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2" htmlFor={`${fieldIds}-0`}>Předmět</label>
                <select
                  id={`${fieldIds}-0`}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="rounded text-teal-600 focus:ring-teal-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  checked={showOnlyFavorites}
                  onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Jen oblíbené</span>
              </label>

              <button
                type="button"
                onClick={handleShuffle}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                <Shuffle className="w-4 h-4" aria-hidden="true" />
                Zamíchat kartičky
              </button>
            </div>
          </div>
        </aside>

        {/* Main Flashcard Area */}
        <section className="flex-1 min-w-0 flex flex-col">
          {isDueQueueDone ? (
            <div role="status" className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Hotovo pro dnešek</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
                Všechny kartičky, které byly dnes na řadě, máte zopakované.
                {nextDueAt !== null && (
                  <> Další budou na řadě {new Date(nextDueAt).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'numeric' })}.</>
                )}
              </p>
              <button
                type="button"
                onClick={() => setSelectedLeitnerBox('all')}
                className="text-teal-700 dark:text-teal-400 hover:underline text-sm font-medium cursor-pointer"
              >
                Procvičit i ostatní kartičky
              </button>
            </div>
          ) : isSelectedBoxEmpty ? (
            <div role="status" className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center">
              <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">V tomto boxu teď nic není</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
                Kartičky se do Boxu {selectedLeitnerBox} dostanou postupem z nižších boxů, případně návratem po chybě do Boxu 1.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => setSelectedLeitnerBox('due')}
                  className="text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Ke zopakování dnes ({dueCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLeitnerBox('all')}
                  className="text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Všechny boxy
                </button>
              </div>
            </div>
          ) : !currentQuestion ? (
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-2">Nenalezeny žádné otázky odpovídající filtrům.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('all');
                  setShowOnlyFavorites(false);
                  setSelectedLeitnerBox('all');
                }}
                className="text-teal-700 dark:text-teal-400 hover:underline text-sm font-medium cursor-pointer"
              >
                Zrušit filtry
              </button>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-center-safe items-center max-w-2xl mx-auto">
              {/* Lišta nad kartičkou: postup, box, akce. Leží mimo otáčející se
                  plochu, takže je stejná z obou stran a nic se nezdvojuje. */}
              <div className="flex justify-between items-center gap-3 mb-4 px-2 w-full no-print">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      Karta {currentCardIndex + 1} z {shuffledQuestions.length}
                    </span>
                    <div
                      className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-label="Postup balíčkem"
                      aria-valuemin={1}
                      aria-valuemax={shuffledQuestions.length}
                      aria-valuenow={currentCardIndex + 1}
                    >
                      <div
                        className="h-full bg-teal-500 transition-all duration-300 rounded-full"
                        style={{ width: `${((currentCardIndex + 1) / shuffledQuestions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {isLeitnerMode && (
                    <span
                      className="text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 whitespace-nowrap"
                      title={describeBox(currentBox)}
                    >
                      Box {currentBox}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Lektor / Admin akce — jednou, mimo kartičku */}
                  {canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(currentQuestion)}
                        aria-pressed={isCurrentHidden}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isCurrentHidden
                            ? 'text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        aria-label={isCurrentHidden ? 'Publikovat kartičku pro studenty' : 'Skrýt kartičku pro studenty'}
                        title={isCurrentHidden ? 'Publikovat pro studenty' : 'Skrýt pro studenty'}
                      >
                        {isCurrentHidden ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingQuestion(currentQuestion)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg transition-colors cursor-pointer"
                        aria-label="Upravit kartičku"
                        title="Upravit kartičku"
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">Upravit</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleFavorite(currentQuestion.id)}
                    aria-pressed={isCurrentFavorite}
                    aria-label={isCurrentFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
                    title={isCurrentFavorite ? 'Odebrat z oblíbených (F)' : 'Přidat do oblíbených (F)'}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${isCurrentFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400 dark:text-slate-600'}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isSpeechSupported() && (
                    <button
                      type="button"
                      onClick={handleSpeak}
                      aria-pressed={isSpeaking}
                      aria-label={isSpeaking ? 'Zastavit předčítání' : 'Přečíst kartičku nahlas'}
                      className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                        isSpeaking ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
                      }`}
                      title={isSpeaking ? 'Zastavit předčítání' : 'Přečíst nahlas'}
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {/* Skryto pro studenty (pouze pro lektory/adminy) */}
              {canEdit && isCurrentHidden && (
                <div className="w-full mb-3 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-3 no-print">
                  <span className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                    <span>Tato kartička je skryta pro běžné studenty</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(currentQuestion)}
                    className="px-2.5 py-1 bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 rounded-lg text-amber-950 dark:text-amber-100 text-[0.6875rem] font-bold transition-colors cursor-pointer"
                  >
                    Znovu publikovat
                  </button>
                </div>
              )}

              {visibilityError && (
                <p role="alert" className="mb-3 p-3 rounded-xl text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300">
                  {visibilityError}
                </p>
              )}
              {/* The 3D Card */}
              <div className="relative min-h-[360px] md:min-h-[420px] h-auto w-full perspective-1000">
                <div
                  role="button"
                  tabIndex={0}
                  data-flashcard="true"
                  aria-label={isFlipped ? 'Otočit kartičku na otázku' : 'Otočit kartičku na odpověď'}
                  className={`w-full min-h-[360px] md:min-h-[420px] h-full transition-all duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                  onClick={handleFlip}
                  onKeyDown={activateOnKey(handleFlip)}
                >
                  {/* Front Side */}
                  <div className={`absolute inset-0 w-full h-full min-h-[360px] md:min-h-[420px] backface-hidden bg-white dark:bg-slate-900 border rounded-2xl p-6 sm:p-8 flex flex-col transition-colors ${
                    canEdit && isCurrentHidden
                      ? 'border-dashed border-amber-300 dark:border-amber-700/70'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="inline-flex items-center rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
                        {getSubjectInfo(currentQuestion.subject).name}
                        {currentQuestion.topic && currentQuestion.topic !== currentQuestion.subject && currentQuestion.topic !== getSubjectInfo(currentQuestion.subject).name ? ` · ${currentQuestion.topic}` : ''}
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center text-center">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {currentQuestion.question}
                      </h3>
                    </div>
                    <div className="text-center text-sm text-slate-400 dark:text-slate-500 mt-4 font-medium">
                      Kliknutím otočte pro odpověď
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className={`absolute inset-0 w-full h-full min-h-[360px] md:min-h-[420px] backface-hidden rotate-y-180 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl p-6 sm:p-8 flex flex-col transition-colors ${
                    canEdit && isCurrentHidden
                      ? 'border-dashed border-amber-300 dark:border-amber-700/70'
                      : 'border-teal-500/30'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                        Odpověď
                      </div>
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
                    {currentQuestion.source?.trim() && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">
                        Pramen: {currentQuestion.source}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hodnocení v Leitnerově režimu (jen po otočení) */}
              {isLeitnerMode && isFlipped && (
                <div className="flex items-center justify-center gap-4 mt-6 w-full no-print">
                  <button
                    type="button"
                    onClick={() => handleLeitnerProgress(false)}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>Ještě neumím (zpět do Boxu 1)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLeitnerProgress(true)}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>Umím (posunout dál)</span>
                  </button>
                </div>
              )}

              {/* Předchozí / další — dostupné vždy, i při otočené kartě v Leitnerově režimu */}
              <div className={`flex items-center justify-center gap-6 w-full no-print ${isLeitnerMode && isFlipped ? 'mt-4' : 'mt-8'}`}>
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentCardIndex === 0}
                  aria-label="Předchozí karta"
                  className={`rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer ${isLeitnerMode && isFlipped ? 'p-2' : 'p-3'}`}
                  title="Předchozí karta (šipka vlevo)"
                >
                  <ChevronLeft className={isLeitnerMode && isFlipped ? 'w-5 h-5' : 'w-6 h-6'} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentCardIndex === shuffledQuestions.length - 1}
                  aria-label="Další karta"
                  className={`rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer ${isLeitnerMode && isFlipped ? 'p-2' : 'p-3'}`}
                  title="Další karta (šipka vpravo)"
                >
                  <ChevronRight className={isLeitnerMode && isFlipped ? 'w-5 h-5' : 'w-6 h-6'} aria-hidden="true" />
                </button>
              </div>
              <div className="hidden sm:flex items-center justify-center gap-4 mt-3 text-[0.625rem] text-slate-400 dark:text-slate-600 font-mono no-print">
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">Space</kbd> otočit</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">← →</kbd> navigace</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">F</kbd> oblíbené</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
