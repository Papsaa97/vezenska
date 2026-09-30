import { QuizSessionRecord, MatchingRecord, UserRank, Badge } from '../types';
import { VSCR_RANKS, RAW_BADGES } from '../data/gamificationData';
import { getStorageOwner, readScoped, writeScoped } from './userScopedStorage';
import { ProgressKind, pullCompleted, pushCompleted, replaceRemoteSet } from './progressSync';
import { clearRemoteMatching, mergeStreaks, pullRecords, pushMatchingRecords, pushStreak } from './recordsSync';
import { MIN_XP_PERCENT } from '../constants/grading';

const MATCHING_HISTORY_KEY = 'vscr_matching_history';
const STREAK_KEY = 'vscr_streak_info';
export const COMPLETED_SCENARIOS_KEY = 'vscr_completed_scenarios';
export const COMPLETED_DRILLS_KEY = 'vscr_completed_drills';

export interface StreakInfo {
  currentStreak: number;
  /**
   * Nejdelší série, jaké kdy uživatel dosáhl. Podle ní se udělují odznaky za
   * vytrvalost — kdyby se braly z aktuální série, přerušení by odznak i jeho XP
   * zase odebralo a uživatel by mohl i sestoupit v hodnosti.
   */
  bestStreak: number;
  lastActiveDate: string; // 'YYYY-MM-DD'
  activeDaysCount: number;
}

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadMatchingHistory(): MatchingRecord[] {
  return readScoped<MatchingRecord[]>(MATCHING_HISTORY_KEY, []);
}

export function saveMatchingHistory(history: MatchingRecord[]): void {
  writeScoped(MATCHING_HISTORY_KEY, history);
}

/** Splněné taktické scénáře přihlášeného uživatele. */
export function loadCompletedScenarios(): string[] {
  return readScoped<string[]>(COMPLETED_SCENARIOS_KEY, []);
}

export function saveCompletedScenarios(ids: string[]): void {
  writeScoped(COMPLETED_SCENARIOS_KEY, ids);
  void pushCompleted('scenario', ids);
}

/** Splněné zbraňové drily přihlášeného uživatele. */
export function loadCompletedDrills(): string[] {
  return readScoped<string[]>(COMPLETED_DRILLS_KEY, []);
}

export function saveCompletedDrills(ids: string[]): void {
  writeScoped(COMPLETED_DRILLS_KEY, ids);
  void pushCompleted('drill', ids);
}

export const FAVORITES_KEY = 'vscr_favorites';
export const LEGAL_FAVS_KEY = 'vscr_legal_favs';

/** Po sloučení oblíbených se serverem — App a Právní kompas si je načtou znovu. */
export const FAVORITES_SYNCED_EVENT = 'vscr:favorites_synced';

const PROGRESS_KEYS: Record<ProgressKind, string> = {
  scenario: COMPLETED_SCENARIOS_KEY,
  drill: COMPLETED_DRILLS_KEY,
  fav_question: FAVORITES_KEY,
  fav_legal: LEGAL_FAVS_KEY,
};

/**
 * Sloučí splněné scénáře a drily ze serveru s tím, co je v zařízení.
 * Volá se po přihlášení (AuthContext). Sjednocení: co je splněné kdekoli,
 * je splněné všude; co server ještě nemá, se mu pošle.
 */
export async function syncCompletedProgress(userId: string): Promise<void> {
  const remote = await pullCompleted(userId);
  // Mezitím se mohl přihlásit někdo jiný — cizí postup do jeho úložiště nepatří.
  if (!remote || getStorageOwner() !== userId) return;

  let favoritesChanged = false;
  for (const kind of Object.keys(PROGRESS_KEYS) as ProgressKind[]) {
    const key = PROGRESS_KEYS[kind];
    const stored = readScoped<unknown>(key, []);
    const local = Array.isArray(stored) ? stored.filter((v): v is string => typeof v === 'string') : [];
    const merged = Array.from(new Set([...local, ...remote[kind]]));
    if (merged.length !== local.length) {
      writeScoped(key, merged);
      if (kind === 'fav_question' || kind === 'fav_legal') favoritesChanged = true;
    }
    const missingOnServer = local.filter((id) => !remote[kind].includes(id));
    if (missingOnServer.length > 0) await pushCompleted(kind, missingOnServer);
  }
  if (favoritesChanged && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(FAVORITES_SYNCED_EVENT));
  }

  await syncMatchingAndStreak(userId);
}

/**
 * Historie poznávaček a denní série: sjednocení podle id záznamu, série podle
 * mergeStreaks. Co server nemá, se mu pošle. App si změnu přečte sama —
 * writeScoped zvedne revizi postupu.
 */
async function syncMatchingAndStreak(userId: string): Promise<void> {
  const remote = await pullRecords(userId);
  if (!remote || getStorageOwner() !== userId) return;

  const local = loadMatchingHistory();
  const remoteIds = new Set(remote.matching.map((r) => r.id));
  const localIds = new Set(local.map((r) => r.id));
  const merged = [...local, ...remote.matching.filter((r) => !localIds.has(r.id))].sort(
    (a, b) => b.timestamp - a.timestamp
  );
  if (merged.length !== local.length) writeScoped(MATCHING_HISTORY_KEY, merged);
  const missingOnServer = local.filter((r) => !remoteIds.has(r.id));
  if (missingOnServer.length > 0) await pushMatchingRecords(missingOnServer);

  const stored = readScoped<StreakInfo | null>(STREAK_KEY, null);
  const localStreak = stored && typeof stored.currentStreak === 'number' ? stored : null;
  const mergedStreak = mergeStreaks(localStreak, remote.streak);
  if (!mergedStreak) return;
  if (JSON.stringify(mergedStreak) !== JSON.stringify(localStreak)) writeScoped(STREAK_KEY, mergedStreak);
  if (JSON.stringify(mergedStreak) !== JSON.stringify(remote.streak)) await pushStreak(mergedStreak);
}

/** Vymaže historii poznávaček v zařízení i na serveru; vrátí chybu serveru, nebo null. */
export async function clearMatchingHistory(): Promise<string | null> {
  saveMatchingHistory([]);
  return clearRemoteMatching();
}

/** Uloží oblíbené do zařízení i k účtu (odebrané zmizí i ze serveru). */
export function saveFavoriteIds(kind: 'fav_question' | 'fav_legal', ids: string[]): void {
  writeScoped(PROGRESS_KEYS[kind], ids);
  void replaceRemoteSet(kind, ids);
}

/** XP za poznávačku — jediné místo, ze kterého čte i rozpis na vítězné obrazovce. */
export const MATCHING_XP = {
  base: 80,
  flawless: 40,
  fast: { limitSeconds: 30, xp: 50 },
  quick: { limitSeconds: 45, xp: 25 },
} as const;

export function recordMatchingCompletion(record: Omit<MatchingRecord, 'id' | 'timestamp' | 'xpEarned'>): { record: MatchingRecord; newHistory: MatchingRecord[] } {
  const current = loadMatchingHistory();

  let xp: number = MATCHING_XP.base;
  if (record.flawless) xp += MATCHING_XP.flawless;
  if (record.timeSeconds <= MATCHING_XP.fast.limitSeconds) xp += MATCHING_XP.fast.xp;
  else if (record.timeSeconds <= MATCHING_XP.quick.limitSeconds) xp += MATCHING_XP.quick.xp;

  const newRecord: MatchingRecord = {
    ...record,
    id: `match-${Date.now()}`,
    timestamp: Date.now(),
    xpEarned: xp
  };

  const newHistory = [newRecord, ...current];
  saveMatchingHistory(newHistory);
  void pushMatchingRecords([newRecord]);
  updateDailyStreak();
  return { record: newRecord, newHistory };
}

/** Počet kalendářních dní mezi dvěma daty 'YYYY-MM-DD'; NaN, když jedno chybí. */
function daysBetween(from: string, to: string): number {
  if (!from || !to) return Number.NaN;
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 3600 * 24));
}

/**
 * Série bez zápisu.
 *
 * Dřív tahle funkce při prvním čtení rovnou uložila `currentStreak: 1`, takže
 * nový uživatel měl sérii jeden den ještě předtím, než cokoli udělal. Čtení
 * teď nic nezapisuje; sérii zakládá až `updateDailyStreak()`, kterou volá
 * dokončená studijní aktivita.
 *
 * Uložená série se přepočítává na „teď“: poslední aktivita starší než včera
 * znamená, že série skončila, i když se to do úložiště zapíše až s další
 * aktivitou. Dřív se ukazovalo uložené číslo, takže kdo před týdnem skončil na
 * pěti dnech, viděl „5 dní série“ dál.
 */
export function loadStreakInfo(): StreakInfo {
  const stored = readScoped<Partial<StreakInfo> | null>(STREAK_KEY, null);
  if (!stored || typeof stored.currentStreak !== 'number') {
    return { currentStreak: 0, bestStreak: 0, lastActiveDate: '', activeDaysCount: 0 };
  }

  const lastActiveDate = typeof stored.lastActiveDate === 'string' ? stored.lastActiveDate : '';
  // Záznamy ze starší verze `bestStreak` nemají. Nejlepší, co o nich víme, je
  // uložená série — ta se kdysi skutečně odehrála, i když už je přerušená.
  const bestStreak = Math.max(
    typeof stored.bestStreak === 'number' ? stored.bestStreak : 0,
    stored.currentStreak
  );
  const gap = daysBetween(lastActiveDate, getTodayDateString());
  const stillRunning = gap === 0 || gap === 1;

  return {
    currentStreak: stillRunning ? stored.currentStreak : 0,
    bestStreak,
    lastActiveDate,
    activeDaysCount: typeof stored.activeDaysCount === 'number' ? stored.activeDaysCount : 0,
  };
}

export function saveStreakInfo(streak: StreakInfo): void {
  writeScoped(STREAK_KEY, streak);
  void pushStreak(streak);
}

/**
 * Zaznamená, že uživatel dnes studoval, a posune denní sérii.
 *
 * Volá se VÝHRADNĚ po dokončené aktivitě (test, pexeso, scénář, zbraňový
 * dril, vygenerovaný úřední záznam) — ne při spuštění aplikace. Dřív ji
 * spouštěl efekt na připojení App, takže „denní série“ měřila, kolik dní po
 * sobě někdo aplikaci otevřel, ne kolik dní se učil.
 */
export function updateDailyStreak(): StreakInfo {
  const today = getTodayDateString();
  const current = loadStreakInfo();

  if (current.lastActiveDate === today) {
    return current;
  }

  // Prázdné datum = dnes se studuje poprvé (daysBetween vrátí NaN).
  const diffDays = daysBetween(current.lastActiveDate, today);
  const currentStreak = diffDays === 1 ? current.currentStreak + 1 : 1;

  const updated: StreakInfo = {
    currentStreak,
    bestStreak: Math.max(current.bestStreak, currentStreak),
    lastActiveDate: today,
    activeDaysCount: (current.activeDaysCount || 0) + 1,
  };

  saveStreakInfo(updated);
  return updated;
}

/** XP za jeden splněný taktický scénář. */
export const SCENARIO_XP = 80;
/** XP za jeden splněný zbraňový dril. */
export const DRILL_XP = 40;

/**
 * Základní XP z odvedené práce.
 *
 * `extraXp` sem dodává volající — typicky XP za splněné scénáře a drily,
 * které komponenta drží ve svém stavu (viz hooks/useLocalProgress).
 *
 * PROČ TO NEČTE Z localStorage SAMO: dřív ano, a React o tom neměl jak vědět.
 * Memoizace v hlavičce tím pádem držela staré číslo celou session — po
 * splněném scénáři se slíbených „+80 XP“ v liště neobjevilo, kdežto záložka
 * Odznaky se připojila znovu a XP viděla. Ukázaly se dvě různá čísla.
 * Hodnota předaná parametrem je normální závislost, kterou React uhlídá.
 */
/**
 * Počítá se test do XP a odznaků? Jen od MIN_XP_PERCENT úspěšnosti — jinak by
 * se dalo body i odznaky „za počet testů“ nahrabat odklikáním náhodných
 * odpovědí. V historii a statistikách test zůstává.
 */
export function countsTowardProgress(session: Pick<QuizSessionRecord, 'accuracy'>): boolean {
  return (session.accuracy ?? 0) >= MIN_XP_PERCENT;
}

/**
 * XP za jeden test: 15 za správnou odpověď, 50 za dokončení a bonus za 80 %
 * nebo 100 %. Test pod MIN_XP_PERCENT dává 0. Jediné místo s tímto
 * pravidlem — používá ho souhrn XP, obrazovka výsledku i přehled uživatelů.
 */
export function quizSessionXp(
  session: Pick<QuizSessionRecord, 'accuracy' | 'correctAnswers' | 'totalQuestions'>
): number {
  if (!countsTowardProgress(session)) return 0;
  let xp = (session.correctAnswers || 0) * 15 + 50;
  if (session.accuracy === 100 && session.totalQuestions >= 5) {
    xp += 100;
  } else if (session.accuracy >= 80 && session.totalQuestions >= 5) {
    xp += 50;
  }
  return xp;
}

export function calculateBaseXp(
  quizHistory: QuizSessionRecord[],
  matchingHistory: MatchingRecord[],
  extraXp = 0
): number {
  let xp = extraXp;

  // 1. XP from quizzes
  quizHistory.forEach(session => {
    xp += quizSessionXp(session);
  });

  // 2. XP from matching games
  matchingHistory.forEach(match => {
    xp += match.xpEarned || 80;
  });

  return xp;
}

export function getUserRank(totalXp: number): { currentRank: UserRank; nextRank: UserRank | null; progressPercent: number; xpForNext: number } {
  let currentRank = VSCR_RANKS[0];
  let nextRank: UserRank | null = VSCR_RANKS[1] || null;

  for (let i = 0; i < VSCR_RANKS.length; i++) {
    const rank = VSCR_RANKS[i];
    if (totalXp >= rank.minXp) {
      currentRank = rank;
      nextRank = VSCR_RANKS[i + 1] || null;
    }
  }

  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      progressPercent: 100,
      xpForNext: 0
    };
  }

  const range = nextRank.minXp - currentRank.minXp;
  const currentInRank = Math.max(0, totalXp - currentRank.minXp);
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInRank / range) * 100)));
  const xpForNext = Math.max(0, nextRank.minXp - totalXp);

  return {
    currentRank,
    nextRank,
    progressPercent,
    xpForNext
  };
}

/**
 * Označení souhrnných testů v `QuizSessionRecord.subject`. Nejsou to předměty:
 * „Kombinace předmětů“ se dřív započítala do odznaku za všechny předměty jako
 * další vyzkoušený předmět. Skutečné předměty takového testu se berou z odpovědí.
 */
const AGGREGATE_QUIZ_SUBJECTS: ReadonlySet<string> = new Set([
  'all',
  'Kombinace předmětů',
  'Závěrečná zkouška ZOP A',
]);

/**
 * Předměty, které mají v bance aspoň jednu otázku, bez souhrnných označení.
 * Podle nich se určuje cíl odznaku za všechny předměty (viz evaluateBadges).
 */
export function subjectsWithQuestions(questions: ReadonlyArray<{ subject?: string | null }>): string[] {
  const set = new Set<string>();
  questions.forEach(q => {
    if (q.subject && !AGGREGATE_QUIZ_SUBJECTS.has(q.subject)) set.add(q.subject);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'cs'));
}

/**
 * `availableSubjects` jsou předměty, které v bance mají otázky (subjectsWithQuestions).
 * Dřív byl cíl odznaku za všechny předměty natvrdo 9: po zrušení Bezpečnostní
 * služby by šel splnit jen díky starým testům z předmětu, který už neexistuje,
 * a nový předmět by se do něj nikdy nepočítal. Dokud se banka nenačte (prázdný
 * seznam), platí číslo z gamificationData.
 */
export function evaluateBadges(
  quizHistory: QuizSessionRecord[], 
  matchingHistory: MatchingRecord[], 
  streakInfo: StreakInfo,
  baseXp: number,
  availableSubjects: readonly string[] = []
): { badges: Badge[]; totalXpWithBadges: number; unlockedCount: number } {
  // Do odznaků se počítají jen testy od MIN_XP_PERCENT — viz countsTowardProgress.
  quizHistory = quizHistory.filter(countsTowardProgress);

  // Aggregate helper values
  const totalQuizCount = quizHistory.length;
  const totalCorrectAnswers = quizHistory.reduce((acc, s) => acc + (s.correctAnswers || 0), 0);
  
  // Count unique tested subjects
  const testedSubjects = new Set<string>();
  quizHistory.forEach(s => {
    if (s.subject && !AGGREGATE_QUIZ_SUBJECTS.has(s.subject)) {
      testedSubjects.add(s.subject);
    }
    s.attempts.forEach(a => {
      if (a.subject) testedSubjects.add(a.subject);
    });
  });

  // Perfect quizzes count (min 10 questions & 100%)
  const perfectQuizzesCount = quizHistory.filter(s => s.accuracy === 100 && s.totalQuestions >= 10).length;

  // Best accuracy per subject
  const subjectBestAccuracy: Record<string, number> = {};
  quizHistory.forEach(s => {
    if (s.subject && !AGGREGATE_QUIZ_SUBJECTS.has(s.subject)) {
      subjectBestAccuracy[s.subject] = Math.max(subjectBestAccuracy[s.subject] || 0, s.accuracy);
    }
    // Also check filtered attempts per subject in a session if at least 4 questions
    const subAttempts: Record<string, { total: number; correct: number }> = {};
    s.attempts.forEach(a => {
      if (!subAttempts[a.subject]) subAttempts[a.subject] = { total: 0, correct: 0 };
      subAttempts[a.subject].total += 1;
      if (a.isCorrect) subAttempts[a.subject].correct += 1;
    });
    Object.entries(subAttempts).forEach(([sub, data]) => {
      if (data.total >= 4) {
        const acc = Math.round((data.correct / data.total) * 100);
        subjectBestAccuracy[sub] = Math.max(subjectBestAccuracy[sub] || 0, acc);
      }
    });
  });

  // Matching game metrics
  const totalMatchingCount = matchingHistory.length;
  const flawlessMatchingCount = matchingHistory.filter(m => m.flawless || m.errorsCount === 0).length;
  const bestMatchingTime = matchingHistory.length > 0 ? Math.min(...matchingHistory.map(m => m.timeSeconds)) : 999;
  const uniqueCategoriesMatched = new Set(matchingHistory.map(m => m.categoryId)).size;

  let badgeBonusXp = 0;

  const badges: Badge[] = RAW_BADGES.map(b => {
    let currentValue = 0;
    let targetValue = b.requirement.target;
    let isUnlocked = false;

    switch (b.requirement.type) {
      case 'quiz_count':
        currentValue = totalQuizCount;
        isUnlocked = currentValue >= targetValue;
        break;

      case 'quiz_perfect':
        currentValue = perfectQuizzesCount;
        isUnlocked = currentValue >= targetValue;
        break;

      case 'questions_correct':
        currentValue = totalCorrectAnswers;
        isUnlocked = currentValue >= targetValue;
        break;

      case 'all_subjects':
        if (availableSubjects.length > 0) {
          // Počítají se jen předměty, které v bance pořád jsou — test ze zrušeného
          // předmětu nesmí nahradit ten, který uživateli ještě chybí.
          targetValue = availableSubjects.length;
          currentValue = availableSubjects.filter(sub => testedSubjects.has(sub)).length;
        } else {
          currentValue = testedSubjects.size;
        }
        isUnlocked = currentValue >= targetValue;
        break;

      case 'subject_mastery':
        const sub = b.requirement.subject || '';
        currentValue = subjectBestAccuracy[sub] || 0;
        isUnlocked = currentValue >= targetValue;
        break;

      case 'matching_count':
        currentValue = totalMatchingCount;
        isUnlocked = currentValue >= targetValue;
        break;

      case 'matching_flawless':
        currentValue = flawlessMatchingCount;
        isUnlocked = currentValue >= targetValue;
        break;

      case 'matching_speed':
        // For speed target is 25s, currentValue should reflect lowest time
        currentValue = bestMatchingTime === 999 ? 0 : bestMatchingTime;
        isUnlocked = bestMatchingTime <= targetValue && matchingHistory.length > 0;
        break;

      case 'matching_all_categories':
        currentValue = uniqueCategoriesMatched;
        isUnlocked = currentValue >= targetValue;
        break;

      case 'streak_days':
        // Nejlepší série, ne aktuální: jednou získaný odznak se přerušením
        // neodebírá. A bez `|| 1` — nový uživatel nemá za sebou ani den.
        currentValue = streakInfo.bestStreak;
        isUnlocked = currentValue >= targetValue;
        break;

      case 'total_xp':
        currentValue = baseXp;
        isUnlocked = currentValue >= targetValue;
        break;
    }

    let progressPercent = 0;
    if (b.requirement.type === 'matching_speed') {
      progressPercent = isUnlocked ? 100 : (currentValue > 0 ? Math.min(95, Math.round((targetValue / currentValue) * 100)) : 0);
    } else {
      progressPercent = Math.min(100, Math.max(0, Math.round((currentValue / targetValue) * 100)));
    }

    if (isUnlocked) {
      badgeBonusXp += b.xpReward;
    }

    return {
      ...b,
      isUnlocked,
      progressPercent,
      currentValue,
      targetValue
    };
  });

  const totalXpWithBadges = baseXp + badgeBonusXp;
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return {
    badges,
    totalXpWithBadges,
    unlockedCount
  };
}

/**
 * Text postupu na kartě odznaku.
 *
 * Skutečná hodnota může cíl přerůst (po pěti testech je „První krok“ na 5 / 1),
 * což na splněném odznaku působilo jako chyba. Zobrazení se proto u cíle
 * zastaví; `currentValue` zůstává nezkrácený pro případné jiné použití.
 */
export function formatBadgeProgress(
  badge: Pick<Badge, 'requirement' | 'currentValue' | 'targetValue' | 'isUnlocked'>
): string {
  const { requirement, currentValue, targetValue, isUnlocked } = badge;
  if (requirement.type === 'matching_speed') {
    if (isUnlocked) return `${currentValue} s (cíl ≤ ${targetValue} s)`;
    return `${currentValue > 0 ? `${currentValue} s` : 'Zatím nehráno'} / cíl ≤ ${targetValue} s`;
  }
  const shown = Math.min(currentValue, targetValue);
  if (requirement.type === 'subject_mastery') return `${shown} % / ${targetValue} %`;
  return `${shown.toLocaleString('cs-CZ')} / ${targetValue.toLocaleString('cs-CZ')}`;
}

export function getTierColor(tier: string): { bg: string; text: string; border: string; glow: string; label: string } {
  switch (tier) {
    case 'bronze':
      return {
        bg: 'bg-amber-900/20 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-700/40 dark:border-amber-600/50',
        glow: 'shadow-amber-500/10',
        label: 'Bronzový'
      };
    case 'silver':
      return {
        bg: 'bg-slate-200/50 dark:bg-slate-800/60',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-300 dark:border-slate-600',
        glow: 'shadow-slate-400/10',
        label: 'Stříbrný'
      };
    case 'gold':
      return {
        bg: 'bg-yellow-500/10 dark:bg-yellow-950/50',
        text: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-500/40 dark:border-yellow-500/60',
        glow: 'shadow-yellow-500/20',
        label: 'Zlatý'
      };
    case 'diamond':
      return {
        bg: 'bg-cyan-500/10 dark:bg-cyan-950/50',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-500/40 dark:border-cyan-500/60',
        glow: 'shadow-cyan-500/20',
        label: 'Diamantový'
      };
    case 'platinum':
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-950/50',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/40 dark:border-purple-500/60',
        glow: 'shadow-purple-500/20',
        label: 'Platinový'
      };
    default:
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-800/50',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-400/40',
        glow: 'shadow-none',
        label: 'Standardní'
      };
  }
}

