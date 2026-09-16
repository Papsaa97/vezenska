import { QuizSessionRecord, MatchingRecord, UserRank, Badge } from '../types';
import { VSCR_RANKS, RAW_BADGES } from '../data/gamificationData';
import { readScoped, writeScoped } from './userScopedStorage';

const MATCHING_HISTORY_KEY = 'vscr_matching_history';
const STREAK_KEY = 'vscr_streak_info';
export const COMPLETED_SCENARIOS_KEY = 'vscr_completed_scenarios';
export const COMPLETED_DRILLS_KEY = 'vscr_completed_drills';

export interface StreakInfo {
  currentStreak: number;
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
}

/** Splněné zbraňové drily přihlášeného uživatele. */
export function loadCompletedDrills(): string[] {
  return readScoped<string[]>(COMPLETED_DRILLS_KEY, []);
}

export function saveCompletedDrills(ids: string[]): void {
  writeScoped(COMPLETED_DRILLS_KEY, ids);
}

export function recordMatchingCompletion(record: Omit<MatchingRecord, 'id' | 'timestamp' | 'xpEarned'>): { record: MatchingRecord; newHistory: MatchingRecord[] } {
  const current = loadMatchingHistory();
  
  // Calculate XP
  let xp = 80; // base
  if (record.flawless) xp += 40;
  if (record.timeSeconds <= 30) xp += 50;
  else if (record.timeSeconds <= 45) xp += 25;

  const newRecord: MatchingRecord = {
    ...record,
    id: `match-${Date.now()}`,
    timestamp: Date.now(),
    xpEarned: xp
  };

  const newHistory = [newRecord, ...current];
  saveMatchingHistory(newHistory);
  updateDailyStreak();
  return { record: newRecord, newHistory };
}

/**
 * Série bez zápisu.
 *
 * Dřív tahle funkce při prvním čtení rovnou uložila `currentStreak: 1`, takže
 * nový uživatel měl sérii jeden den ještě předtím, než cokoli udělal. Čtení
 * teď nic nezapisuje; sérii zakládá až `updateDailyStreak()`, kterou volá
 * dokončená studijní aktivita.
 */
export function loadStreakInfo(): StreakInfo {
  const stored = readScoped<StreakInfo | null>(STREAK_KEY, null);
  if (stored && typeof stored.currentStreak === 'number') return stored;
  return { currentStreak: 0, lastActiveDate: '', activeDaysCount: 0 };
}

export function saveStreakInfo(streak: StreakInfo): void {
  writeScoped(STREAK_KEY, streak);
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

  // Prázdné datum = dnes se studuje poprvé.
  const diffDays = current.lastActiveDate
    ? Math.round(
        (new Date(today).getTime() - new Date(current.lastActiveDate).getTime()) / (1000 * 3600 * 24)
      )
    : Number.NaN;

  const updated: StreakInfo = {
    currentStreak: diffDays === 1 ? current.currentStreak + 1 : 1,
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
export function calculateBaseXp(
  quizHistory: QuizSessionRecord[],
  matchingHistory: MatchingRecord[],
  extraXp = 0
): number {
  let xp = extraXp;

  // 1. XP from quizzes
  quizHistory.forEach(session => {
    // 15 XP per correct answer
    xp += (session.correctAnswers || 0) * 15;
    // 50 XP completion bonus
    xp += 50;
    // Accuracy bonuses
    if (session.accuracy === 100 && session.totalQuestions >= 5) {
      xp += 100;
    } else if (session.accuracy >= 80 && session.totalQuestions >= 5) {
      xp += 50;
    }
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

export function evaluateBadges(
  quizHistory: QuizSessionRecord[], 
  matchingHistory: MatchingRecord[], 
  streakInfo: StreakInfo,
  baseXp: number
): { badges: Badge[]; totalXpWithBadges: number; unlockedCount: number } {
  // Aggregate helper values
  const totalQuizCount = quizHistory.length;
  const totalCorrectAnswers = quizHistory.reduce((acc, s) => acc + (s.correctAnswers || 0), 0);
  
  // Count unique tested subjects
  const testedSubjects = new Set<string>();
  quizHistory.forEach(s => {
    if (s.subject && s.subject !== 'all' && s.subject !== 'Závěrečná zkouška ZOP A') {
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
    if (s.subject && s.subject !== 'all') {
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
        currentValue = testedSubjects.size;
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
        currentValue = streakInfo.currentStreak || 1;
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

