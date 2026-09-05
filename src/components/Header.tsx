import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderKanban, 
  GraduationCap, 
  Scale, 
  ShieldAlert, 
  Crosshair, 
  Layers, 
  LayoutGrid, 
  Award, 
  BarChart3, 
  Moon, 
  Sun, 
  Sparkles,
  FileText,
  HeartHandshake,
  ChevronDown,
  Shield,
  Zap,
  BookOpen,
  Settings2,
} from 'lucide-react';
import { QuizSessionRecord, MatchingRecord } from '../types';
import { calculateBaseXp, evaluateBadges, getUserRank, loadStreakInfo } from '../utils/gamification';
import { UserBadge, AuthModal } from './AuthUI';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'subjects' | 'quiz' | 'assistant' | 'compass' | 'admin' | 'ethics' | 'scenarios' | 'weapons' | 'flashcards' | 'matching' | 'badges' | 'statistics' | 'library' | 'content-manager';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  quizHistory?: QuizSessionRecord[];
  matchingHistory?: MatchingRecord[];
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  toggleDarkMode,
  quizHistory = [],
  matchingHistory = []
}: HeaderProps) {
  const { profile } = useAuth();
  const isPrivileged = profile?.role === 'lektor' || profile?.role === 'admin';

  const [openDropdown, setOpenDropdown] = useState<'practice' | 'drill' | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const streakInfo = useMemo(() => loadStreakInfo(), []);
  const baseXp = useMemo(() => calculateBaseXp(quizHistory, matchingHistory), [quizHistory, matchingHistory]);
  
  const { totalXpWithBadges, unlockedCount } = useMemo(() => {
    return evaluateBadges(quizHistory, matchingHistory, streakInfo, baseXp);
  }, [quizHistory, matchingHistory, streakInfo, baseXp]);

  const { currentRank, progressPercent: xpProgress } = useMemo(() => {
    return getUserRank(totalXpWithBadges);
  }, [totalXpWithBadges]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPracticeActive = ['scenarios', 'weapons', 'admin', 'ethics'].includes(activeTab);
  const isDrillActive = ['compass', 'flashcards', 'matching'].includes(activeTab);

  return (
    <div className="shrink-0 relative z-30" ref={dropdownRef}>
      <div className="h-16 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 border-b border-slate-800 transition-colors">
        
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center gap-3 cursor-pointer group shrink-0" 
          onClick={() => {
            setActiveTab('subjects');
            setOpenDropdown(null);
          }}
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform border border-blue-400/30">
            V
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-sm sm:text-base tracking-tight flex items-center gap-2">
              AKADEMIE VS ČR
              <span className="text-amber-400 font-bold text-[10px] sm:text-xs px-2 py-0.5 bg-amber-400/10 rounded-full border border-amber-400/30 tracking-wider">
                ZOP A
              </span>
            </h1>
            <span className="text-[10px] text-slate-400 hidden sm:block tracking-wide">Výukový & zkušební systém</span>
          </div>
        </div>
        
        {/* Desktop Navigation (Categorized Masterpiece) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {/* 1. Subjects */}
          <button
            onClick={() => { setActiveTab('subjects'); setOpenDropdown(null); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'subjects' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Předměty (9)</span>
          </button>

          {/* 2. Exam & Quiz */}
          <button
            onClick={() => { setActiveTab('quiz'); setOpenDropdown(null); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quiz' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Test & Zkouška</span>
          </button>

          {/* 3. AI Captain Exam Assistant */}
          <button
            onClick={() => { setActiveTab('assistant'); setOpenDropdown(null); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'assistant' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/40 shadow-sm shadow-indigo-500/25' 
                : 'text-indigo-300 bg-indigo-950/40 border-indigo-500/30 hover:text-white hover:bg-indigo-900/60'
            }`}
            title="AI vyhodnocení zadání a písemek od kapitánů z fotky či textu"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Asistent</span>
          </button>

          {/* 4. Practice & Simulator Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'practice' ? null : 'practice')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isPracticeActive
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Výcvik & Praxe</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'practice' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {openDropdown === 'practice' && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-xl"
                >
                  <button
                    onClick={() => { setActiveTab('scenarios'); setOpenDropdown(null); }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'scenarios' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <ShieldAlert className={`w-4 h-4 shrink-0 ${activeTab === 'scenarios' ? 'text-slate-950' : 'text-amber-400'}`} />
                    <div>
                      <div className="font-bold">Taktické scénáře</div>
                      <div className="text-[10px] opacity-75">10 modelových situací z praxe</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('weapons'); setOpenDropdown(null); }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'weapons' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Crosshair className={`w-4 h-4 shrink-0 ${activeTab === 'weapons' ? 'text-slate-950' : 'text-blue-400'}`} />
                    <div>
                      <div className="font-bold">Zbraně & Střelba</div>
                      <div className="text-[10px] opacity-75">CZ 75 B & Scorpion EVO 3A1</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('admin'); setOpenDropdown(null); }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'admin' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'admin' ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <div>
                      <div className="font-bold">Administrativa & ETŘ</div>
                      <div className="text-[10px] opacity-75">Úřední záznamy, Č.j. a tiskopisy</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('ethics'); setOpenDropdown(null); }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'ethics' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <HeartHandshake className={`w-4 h-4 shrink-0 ${activeTab === 'ethics' ? 'text-slate-950' : 'text-rose-400'}`} />
                    <div>
                      <div className="font-bold">Profesní etika</div>
                      <div className="text-[10px] opacity-75">Kodex & protikorupční modul</div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. Drill & Knowledge Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'drill' ? null : 'drill')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isDrillActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Znalosti & Dril</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'drill' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {openDropdown === 'drill' && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-xl"
                >
                  <button
                    onClick={() => { setActiveTab('compass'); setOpenDropdown(null); }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'compass' ? 'bg-blue-600 text-white font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Scale className={`w-4 h-4 shrink-0 ${activeTab === 'compass' ? 'text-white' : 'text-blue-400'}`} />
                    <div>
                      <div className="font-bold">Předpisy & § Kompas</div>
                      <div className="text-[10px] opacity-75">Zákony 555/1992, 169/1999 & NGŘ</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('flashcards'); setOpenDropdown(null); }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'flashcards' ? 'bg-blue-600 text-white font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Layers className={`w-4 h-4 shrink-0 ${activeTab === 'flashcards' ? 'text-white' : 'text-amber-400'}`} />
                    <div>
                      <div className="font-bold">Kartičky (Dril)</div>
                      <div className="text-[10px] opacity-75">3D otočné Leitnerovy boxy</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('matching'); setOpenDropdown(null); }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'matching' ? 'bg-blue-600 text-white font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <LayoutGrid className={`w-4 h-4 shrink-0 ${activeTab === 'matching' ? 'text-white' : 'text-emerald-400'}`} />
                    <div>
                      <div className="font-bold">Poznávačka pojmů</div>
                      <div className="text-[10px] opacity-75">Rychlé pexeso na čas</div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 6. Badges */}
          <button
            onClick={() => { setActiveTab('badges'); setOpenDropdown(null); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'badges' 
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Odznaky</span>
            {unlockedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                {unlockedCount}
              </span>
            )}
          </button>

          {/* 7. Statistics */}
          <button
            onClick={() => { setActiveTab('statistics'); setOpenDropdown(null); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'statistics' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistiky</span>
          </button>

          {/* 8. Material Library – for all users */}
          <button
            onClick={() => { setActiveTab('library'); setOpenDropdown(null); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'library'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Materiály</span>
          </button>

          {/* 9. Content Manager – lektor / admin only */}
          {isPrivileged && (
            <button
              onClick={() => { setActiveTab('content-manager'); setOpenDropdown(null); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'content-manager'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 hover:text-white hover:bg-emerald-900/60'
              }`}
              title="Správa obsahu – nahrávání a mazání materiálů"
            >
              <Settings2 className="w-4 h-4" />
              <span>Správa obsahu</span>
            </button>
          )}
        </nav>

        {/* Right controls: Auth + Rank Badge + Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Auth user badge / login button */}
          <UserBadge onLoginClick={() => setIsAuthModalOpen(true)} />

          <button
            onClick={() => { setActiveTab('badges'); setOpenDropdown(null); }}
            className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 rounded-xl transition-all text-xs text-slate-200 hover:border-amber-400/50 hover:ring-1 hover:ring-amber-500/30 shadow-sm"
            title="Zobrazit hodnostní postup VS ČR a odznaky"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xs shadow-sm">
              {currentRank.level}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-amber-300 leading-tight text-[11px] sm:text-xs">
                {currentRank.shortTitle}
              </span>
              <span className="text-[9px] text-slate-400 font-mono leading-none">
                {totalXpWithBadges.toLocaleString('cs-CZ')} XP
              </span>
            </div>
          </button>

          <button 
            onClick={toggleDarkMode}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            title={isDarkMode ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* XP Progress Line */}
      <div className="h-0.5 bg-slate-800 dark:bg-slate-900 shrink-0">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 shadow-sm"
          initial={false}
          animate={{ width: `${xpProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </div>
  );
}
