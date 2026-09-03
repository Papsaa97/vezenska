import { useState, useMemo } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  BookOpenCheck, 
  Layers, 
  Scale, 
  Shield, 
  Building2, 
  Crosshair, 
  Brain, 
  HeartPulse, 
  GraduationCap, 
  LayoutGrid, 
  Zap, 
  Timer, 
  Trophy, 
  Flame, 
  Medal, 
  Star, 
  Crown, 
  Lock, 
  Search,
  BookOpen,
  ChevronRight,
  TrendingUp,
  FileText,
  HeartHandshake
} from 'lucide-react';
import { Badge, QuizSessionRecord, MatchingRecord, UserRank } from '../types';
import { VSCR_RANKS } from '../data/gamificationData';
import { 
  evaluateBadges, 
  getUserRank, 
  calculateBaseXp, 
  loadStreakInfo, 
  getTierColor 
} from '../utils/gamification';

interface BadgesViewProps {
  quizHistory: QuizSessionRecord[];
  matchingHistory: MatchingRecord[];
  onStartQuiz?: () => void;
  onStartMatching?: () => void;
}

// Helper to render Lucide icon by name
function RenderBadgeIcon({ name, className }: { name: string; className?: string }) {
  const props = { className: className || 'w-6 h-6' };
  switch (name) {
    case 'Award': return <Award {...props} />;
    case 'GraduationCap': return <GraduationCap {...props} />;
    case 'ShieldCheck': return <ShieldCheck {...props} />;
    case 'Sparkles': return <Sparkles {...props} />;
    case 'CheckCircle2': return <CheckCircle2 {...props} />;
    case 'BookOpenCheck': return <BookOpenCheck {...props} />;
    case 'Layers': return <Layers {...props} />;
    case 'Scale': return <Scale {...props} />;
    case 'Shield': return <Shield {...props} />;
    case 'Building2': return <Building2 {...props} />;
    case 'Crosshair': return <Crosshair {...props} />;
    case 'Brain': return <Brain {...props} />;
    case 'HeartPulse': return <HeartPulse {...props} />;
    case 'FileText': return <FileText {...props} />;
    case 'HeartHandshake': return <HeartHandshake {...props} />;
    case 'LayoutGrid': return <LayoutGrid {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'Timer': return <Timer {...props} />;
    case 'Trophy': return <Trophy {...props} />;
    case 'Flame': return <Flame {...props} />;
    case 'Medal': return <Medal {...props} />;
    case 'Star': return <Star {...props} />;
    case 'Crown': return <Crown {...props} />;
    default: return <Award {...props} />;
  }
}

// Shoulder Insignia (Výložka) visual component with authentic VS ČR silver/gold stars & rank bars
function ShoulderInsignia({ rank }: { rank: UserRank }) {
  const isSilver = rank.category === 'podpraporcici' || rank.category === 'praporcici';
  const hasBar = rank.category === 'praporcici' || rank.category === 'vyssi_dustojnici';
  const isGeneral = rank.category === 'generalita';

  return (
    <div className="relative w-14 h-24 sm:w-16 sm:h-28 bg-slate-900 dark:bg-slate-950 rounded-t-lg border-2 border-slate-700 dark:border-slate-600 shadow-md flex flex-col items-center justify-between p-2 overflow-hidden shrink-0">
      {/* Shoulder strap top button */}
      <div className="w-3.5 h-3.5 rounded-full bg-slate-300 border border-slate-400 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
      </div>
      
      {/* Category ribbon / color strip */}
      <div className="absolute top-7 left-0 right-0 h-0.5 bg-blue-500/60"></div>

      {/* Stars and Insignia representation */}
      <div className="flex flex-col items-center justify-center gap-1 my-auto w-full">
        {isGeneral ? (
          <div className="flex flex-col items-center gap-1 text-yellow-300">
            <Crown className="w-4 h-4 fill-yellow-400 text-yellow-300 animate-pulse" />
            <Star className="w-5 h-5 fill-yellow-400 text-amber-200 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]" />
          </div>
        ) : rank.stars > 0 ? (
          <div className="flex flex-col items-center gap-1">
            {Array.from({ length: rank.stars }).map((_, i) => (
              <div 
                key={i} 
                className={isSilver 
                  ? "text-slate-100 filter drop-shadow-[0_0_2px_rgba(255,255,255,0.7)]" 
                  : "text-amber-300 filter drop-shadow-[0_0_3px_rgba(251,191,36,0.9)]"
                }
              >
                <Star 
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    isSilver 
                      ? "fill-slate-200 text-slate-100" 
                      : "fill-amber-400 text-amber-300"
                  }`} 
                />
              </div>
            ))}
          </div>
        ) : (
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">ZOP A</span>
        )}

        {/* Rank Bar (Kolejnička / Lemovka) */}
        {hasBar && (
          <div className={`w-3/4 h-1 mt-1 rounded-sm border ${
            isSilver 
              ? 'bg-slate-300 border-slate-400 shadow-[0_0_2px_rgba(255,255,255,0.5)]' 
              : 'bg-amber-400 border-yellow-300 shadow-[0_0_3px_rgba(251,191,36,0.7)]'
          }`} />
        )}
      </div>

      {/* Bottom bar designation */}
      <div className="w-full text-center">
        <span className="text-[9px] font-extrabold text-slate-300 tracking-wider">VS ČR</span>
      </div>
    </div>
  );
}

export default function BadgesView({
  quizHistory,
  matchingHistory,
  onStartQuiz,
  onStartMatching
}: BadgesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRanksModal, setShowRanksModal] = useState<boolean>(false);

  const streakInfo = useMemo(() => loadStreakInfo(), []);
  const baseXp = useMemo(() => calculateBaseXp(quizHistory, matchingHistory), [quizHistory, matchingHistory]);
  
  const { badges, totalXpWithBadges, unlockedCount } = useMemo(() => {
    return evaluateBadges(quizHistory, matchingHistory, streakInfo, baseXp);
  }, [quizHistory, matchingHistory, streakInfo, baseXp]);

  const { currentRank, nextRank, progressPercent, xpForNext } = useMemo(() => {
    return getUserRank(totalXpWithBadges);
  }, [totalXpWithBadges]);

  // Overall quick stats
  const totalCorrect = useMemo(() => {
    return quizHistory.reduce((acc, s) => acc + (s.correctAnswers || 0), 0);
  }, [quizHistory]);

  const totalQuestionsAnswered = useMemo(() => {
    return quizHistory.reduce((acc, s) => acc + (s.totalQuestions || 0), 0);
  }, [quizHistory]);

  const overallAccuracy = totalQuestionsAnswered > 0 
    ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) 
    : 0;

  // Filter badges
  const filteredBadges = useMemo(() => {
    return badges.filter(b => {
      // Category filter
      if (selectedCategory !== 'all' && b.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'unlocked' && !b.isUnlocked) return false;
      if (selectedStatus === 'locked' && b.isUnlocked) return false;
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [badges, selectedCategory, selectedStatus, searchQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-8">
      
      {/* 1. HERO RANK & PROGRESS BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-5 sm:p-7 border border-slate-700/80 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Rank & Profile info */}
          <div className="flex items-center gap-4 sm:gap-6">
            <ShoulderInsignia rank={currentRank} />

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Úroveň {currentRank.level}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700/80 text-slate-300">
                  {currentRank.shortTitle}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800/40">
                  <Flame className="w-3.5 h-3.5" />
                  {streakInfo.currentStreak} {streakInfo.currentStreak === 1 ? 'den' : streakInfo.currentStreak < 5 ? 'dny' : 'dní'} série
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {currentRank.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl line-clamp-2">
                {currentRank.description}
              </p>
            </div>
          </div>

          {/* XP & Next Rank Progress */}
          <div className="w-full md:w-80 bg-slate-900/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/60 shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Zkušenosti (XP)
              </span>
              <span className="font-bold text-amber-400 text-sm">
                {totalXpWithBadges.toLocaleString('cs-CZ')} XP
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>{nextRank ? `Postup na ${nextRank.name}` : 'Maximální hodnost'}</span>
              <span className="font-medium text-slate-300">{nextRank ? `zbývá ${xpForNext.toLocaleString('cs-CZ')} XP` : 'Dosaženo'}</span>
            </div>

            <button
              onClick={() => setShowRanksModal(true)}
              className="w-full mt-3 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600/80 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Zobrazit přehled všech hodností VS ČR</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-tight">
                {unlockedCount} <span className="text-xs font-normal text-slate-400">/ {badges.length}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Odemčených odznaků</div>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-tight">{quizHistory.length}</div>
              <div className="text-[11px] text-slate-400 font-medium">Dokončených testů</div>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-tight">{overallAccuracy} %</div>
              <div className="text-[11px] text-slate-400 font-medium">Úspěšnost v testech</div>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-400 shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-tight">{matchingHistory.length}</div>
              <div className="text-[11px] text-slate-400 font-medium">Odehraných pexes</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTERS & SEARCH TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {[
            { id: 'all', label: 'Všechny odznaky' },
            { id: 'quiz', label: 'Kvízy & Testy' },
            { id: 'matching', label: 'Poznávačka & Pexeso' },
            { id: 'subjects', label: 'Předměty ZOP' },
            { id: 'streaks', label: 'Vytrvalost & XP' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status filter + Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            aria-label="Filtrovat odznaky podle stavu odemčení"
            className="p-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Všechny stavy</option>
            <option value="unlocked">Pouze odemčené ({unlockedCount})</option>
            <option value="locked">V plnění ({badges.length - unlockedCount})</option>
          </select>

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Hledat odznak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 3. BADGES GRID */}
      {filteredBadges.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">Žádné odpovídající odznaky</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Zkuste upravit filtry nebo hledaný výraz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map(badge => {
            const tierStyle = getTierColor(badge.tier);

            return (
              <div
                key={badge.id}
                className={`relative rounded-xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                  badge.isUnlocked
                    ? `${tierStyle.bg} ${tierStyle.border} shadow-sm dark:shadow-none`
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
                }`}
              >
                {/* Top: Icon & Tier Tag */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${
                      badge.isUnlocked
                        ? `${tierStyle.bg} ${tierStyle.border} ${tierStyle.text}`
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }`}>
                      {badge.isUnlocked ? (
                        <RenderBadgeIcon name={badge.iconName} className="w-6 h-6" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${tierStyle.text} ${tierStyle.bg} ${tierStyle.border}`}>
                        {tierStyle.label}
                      </span>
                      <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        +{badge.xpReward} XP
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className={`text-base font-bold tracking-tight mb-1 flex items-center gap-1.5 ${
                    badge.isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {badge.title}
                    {badge.isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 inline-block" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                {/* Progress Bar & Status */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
                    <span className="text-slate-500 dark:text-slate-400">
                      {badge.isUnlocked ? 'Splněno' : 'Postup'}
                    </span>
                    <span className={`font-bold ${badge.isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {badge.requirement.type === 'matching_speed' 
                        ? (badge.isUnlocked ? `${badge.currentValue}s (Cíl ≤${badge.targetValue}s)` : `${badge.currentValue > 0 ? `${badge.currentValue}s` : 'Zatím nehráno'} / Cíl ≤${badge.targetValue}s`)
                        : `${badge.currentValue} / ${badge.targetValue}`}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        badge.isUnlocked
                          ? 'bg-emerald-500'
                          : 'bg-blue-600 dark:bg-blue-500'
                      }`}
                      style={{ width: `${badge.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. CALL TO ACTION FOOTER */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-2xl p-6 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-1">
            Chcete získat další odznaky a povýšit hodnost?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Procvičujte otázky z předmětů ZOP A nebo trénujte bleskové přiřazování v Poznávačce.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          {onStartQuiz && (
            <button
              onClick={onStartQuiz}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Spustit test</span>
            </button>
          )}

          {onStartMatching && (
            <button
              onClick={onStartMatching}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Poznávačka</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. MODAL: FULL VS ČR RANKS ROADMAP */}
      {showRanksModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-500 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">Kariérní hodnosti Vězeňské služby ČR</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Postupujte v hodnostech sbíráním zkušeností (XP)</p>
                </div>
              </div>
              <button
                onClick={() => setShowRanksModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {VSCR_RANKS.map(r => {
                const isCurrent = r.level === currentRank.level;
                const isPassed = totalXpWithBadges >= r.minXp;

                return (
                  <div
                    key={r.level}
                    className={`p-3.5 rounded-xl border flex items-center gap-4 transition-all ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                        : isPassed
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/50'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 font-extrabold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                      {r.level}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {r.name}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">({r.shortTitle})</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            Vaše hodnost
                          </span>
                        )}
                        {isPassed && !isCurrent && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {r.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {r.minXp.toLocaleString('cs-CZ')} XP
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {r.stars > 0 ? `${r.stars} ${r.stars === 1 ? 'hvězda' : 'hvězdy'}` : 'bez hvězd'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowRanksModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Rozumím
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
