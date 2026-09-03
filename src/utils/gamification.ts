import { QuizSessionRecord, MatchingRecord, UserRank, Badge } from '../types';
import { VSCR_RANKS, RAW_BADGES } from '../data/gamificationData';

const MATCHING_HISTORY_KEY = 'vscr_matching_history';
const STREAK_KEY = 'vscr_streak_info';

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
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MATCHING_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading matching history', e);
    return [];
  }
}

export function saveMatchingHistory(history: MatchingRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MATCHING_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving matching history', e);
  }
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

export function loadStreakInfo(): StreakInfo {
  const defaultStreak: StreakInfo = { currentStreak: 1, lastActiveDate: getTodayDateString(), activeDaysCount: 1 };
  if (typeof window === 'undefined') return defaultStreak;
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      saveStreakInfo(defaultStreak);
      return defaultStreak;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultStreak;
  }
}

export function saveStreakInfo(streak: StreakInfo): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch (e) {
    console.error('Error saving streak', e);
  }
}

export function updateDailyStreak(): StreakInfo {
  const today = getTodayDateString();
  const current = loadStreakInfo();

  if (current.lastActiveDate === today) {
    return current;
  }

  const lastDate = new Date(current.lastActiveDate);
  const now = new Date(today);
  const diffDays = Math.round((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

  let newStreak = 1;
  if (diffDays === 1) {
    newStreak = current.currentStreak + 1;
  }

  const updated: StreakInfo = {
    currentStreak: newStreak,
    lastActiveDate: today,
    activeDaysCount: (current.activeDaysCount || 1) + (diffDays > 0 ? 1 : 0)
  };

  saveStreakInfo(updated);
  return updated;
}

export function calculateBaseXp(quizHistory: QuizSessionRecord[], matchingHistory: MatchingRecord[]): number {
  let xp = 0;

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

  // 3. XP from tactical scenarios (80 XP per completed scenario)
  if (typeof window !== 'undefined') {
    try {
      const savedScenarios = JSON.parse(localStorage.getItem('vscr_completed_scenarios') || '[]');
      if (Array.isArray(savedScenarios)) {
        xp += savedScenarios.length * 80;
      }
    } catch {
      // ignore JSON parse errors
    }

    // 4. XP from weapon drills (40 XP per completed drill)
    try {
      const savedDrills = JSON.parse(localStorage.getItem('vscr_completed_drills') || '[]');
      if (Array.isArray(savedDrills)) {
        xp += savedDrills.length * 40;
      }
    } catch {
      // ignore
    }
  }

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

export interface UserBackupData {
  version: number;
  exportedAt: string;
  quizHistory: QuizSessionRecord[];
  matchingHistory: MatchingRecord[];
  streakInfo: StreakInfo;
  favorites: string[];
  legalFavorites: string[];
  theme: string;
  leitnerBoxes?: Record<string, number>;
  leitnerActive?: boolean;
}

export function exportAllUserData(): string {
  if (typeof window === 'undefined') return '{}';
  
  const backup: UserBackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    quizHistory: JSON.parse(localStorage.getItem('vscr_quiz_history') || '[]'),
    matchingHistory: JSON.parse(localStorage.getItem('vscr_matching_history') || '[]'),
    streakInfo: JSON.parse(localStorage.getItem('vscr_streak_info') || '{"currentStreak":1,"lastActiveDate":"","activeDaysCount":1}'),
    favorites: JSON.parse(localStorage.getItem('vscr_favorites') || '[]'),
    legalFavorites: JSON.parse(localStorage.getItem('vscr_legal_favs') || '[]'),
    theme: localStorage.getItem('vscr_theme') || 'light',
    leitnerBoxes: JSON.parse(localStorage.getItem('vscr_leitner_boxes') || '{}'),
    leitnerActive: localStorage.getItem('vscr_leitner_active') === 'true',
  };

  return JSON.stringify(backup, null, 2);
}

export function importAllUserData(jsonString: string): { success: boolean; message: string } {
  if (typeof window === 'undefined') return { success: false, message: 'Prohlížeč není dostupný' };
  
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Neplatný formát souboru se zálohou.' };
    }

    if (Array.isArray(data.quizHistory)) {
      localStorage.setItem('vscr_quiz_history', JSON.stringify(data.quizHistory));
    }
    if (Array.isArray(data.matchingHistory)) {
      localStorage.setItem('vscr_matching_history', JSON.stringify(data.matchingHistory));
    }
    if (data.streakInfo && typeof data.streakInfo === 'object') {
      localStorage.setItem('vscr_streak_info', JSON.stringify(data.streakInfo));
    }
    if (Array.isArray(data.favorites)) {
      localStorage.setItem('vscr_favorites', JSON.stringify(data.favorites));
    }
    if (Array.isArray(data.legalFavorites)) {
      localStorage.setItem('vscr_legal_favs', JSON.stringify(data.legalFavorites));
    }
    if (data.theme && (data.theme === 'light' || data.theme === 'dark')) {
      localStorage.setItem('vscr_theme', data.theme);
    }
    if (data.leitnerBoxes && typeof data.leitnerBoxes === 'object') {
      localStorage.setItem('vscr_leitner_boxes', JSON.stringify(data.leitnerBoxes));
    }
    if (typeof data.leitnerActive === 'boolean') {
      localStorage.setItem('vscr_leitner_active', String(data.leitnerActive));
    }

    return { success: true, message: 'Záloha byla úspěšně nahrána.' };
  } catch (err: any) {
    return { success: false, message: `Chyba při čtení JSON: ${err.message || 'neznámá chyba'}` };
  }
}
