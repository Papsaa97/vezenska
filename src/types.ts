export interface Question {
  id: string;
  subject: string;
  topic: string;
  question: string;
  answer: string;
  options?: string[];
  correctOption?: number;
  rationale: string;
  source: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingDiagramPart {
  id: string;
  label: string;
  top: number; // percentage 0-100
  left: number;
  labelTop?: number;
  labelLeft?: number;
}

export interface MatchingCategory {
  id: string;
  title: string;
  type?: 'classic' | 'diagram';
  imageUrl?: string;
  parts?: MatchingDiagramPart[];
  pairs: MatchingPair[];
}

export interface QuestionAttempt {
  questionId: string;
  questionText: string;
  subject: string;
  topic: string;
  isCorrect: boolean;
  selectedOption: number;
  correctOption: number;
  confidence?: 'know' | 'guess' | 'dont_know';
}

export interface QuizSessionRecord {
  id: string;
  timestamp: number; // Date.now()
  dateFormatted: string;
  subject: string; // 'all' or specific subject
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number; // 0 - 100 %
  timeSpentSeconds?: number;
  attempts: QuestionAttempt[];
}

export interface TopicPerformance {
  topic: string;
  subject: string;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  accuracy: number; // 0 - 100 %
  lastTestedTimestamp?: number;
  isWeakTopic: boolean; // true if accuracy < 70% or attempts >= 3 and acc < 75%
}

export type BadgeCategory = 'quiz' | 'matching' | 'subjects' | 'streaks' | 'special';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  iconName: string;
  xpReward: number;
  requirement: {
    type: 
      | 'quiz_count' 
      | 'quiz_perfect' 
      | 'questions_correct' 
      | 'all_subjects' 
      | 'matching_count' 
      | 'matching_speed' 
      | 'matching_flawless' 
      | 'matching_all_categories' 
      | 'streak_days' 
      | 'total_xp' 
      | 'subject_mastery';
    target: number;
    subject?: string;
  };
  unlockedAt?: number;
  isUnlocked: boolean;
  progressPercent: number;
  currentValue: number;
  targetValue: number;
}

export interface UserRank {
  level: number;
  name: string;
  shortTitle: string;
  category: 'podpraporcici' | 'praporcici' | 'dustojnici' | 'vyssi_dustojnici' | 'generalita';
  minXp: number;
  maxXp: number;
  stars: number;
  color: string;
  badgeBg: string;
  description: string;
}

export interface MatchingRecord {
  id: string;
  categoryId: string;
  categoryTitle: string;
  timestamp: number;
  timeSeconds: number;
  errorsCount: number;
  flawless: boolean;
  pairsCount: number;
  xpEarned: number;
}

export interface GamificationState {
  totalXp: number;
  manualUnlockedBadgeIds: string[];
  matchingHistory: MatchingRecord[];
  lastActiveDate: string; // YYYY-MM-DD
  streakDays: number;
}

