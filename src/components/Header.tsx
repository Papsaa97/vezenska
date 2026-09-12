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
  MoreHorizontal,
  User,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  UserCog
} from 'lucide-react';
import { QuizSessionRecord, MatchingRecord } from '../types';
import { tacticalScenarios } from '../data/scenariosData';
import { calculateBaseXp, evaluateBadges, getUserRank, loadStreakInfo } from '../utils/gamification';
import { AuthModal } from './AuthUI';
import FeedbackModal from './FeedbackModal';
import UserProfileModal from './UserProfileModal';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import { resolveAvatarDisplay } from '../utils/avatar';

export type NavTab = 
  | 'subjects' 
  | 'quiz' 
  | 'assistant' 
  | 'compass' 
  | 'admin' 
  | 'ethics' 
  | 'scenarios' 
  | 'weapons' 
  | 'flashcards' 
  | 'matching' 
  | 'badges' 
  | 'statistics' 
  | 'library' 
  | 'content-manager';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  quizHistory?: QuizSessionRecord[];
  matchingHistory?: MatchingRecord[];
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
}

type DropdownType = 'practice' | 'drill' | 'more' | 'profile';

interface AvatarCircleProps {
  hasUser: boolean;
  display: ReturnType<typeof resolveAvatarDisplay>;
  initials: string;
  sizeClass: string;
  iconSizeClass: string;
}

function AvatarCircle({ hasUser, display, initials, sizeClass, iconSizeClass }: AvatarCircleProps) {
  if (!hasUser) {
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md border border-white/10`}>
        <User className={`${iconSizeClass} text-blue-200`} />
      </div>
    );
  }

  if (display.type === 'image') {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden shadow-md border border-white/10`}>
        <img src={display.url} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  if (display.type === 'preset') {
    const Icon = display.preset.icon;
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-tr ${display.preset.gradient} flex items-center justify-center shadow-md border border-white/10`}>
        <Icon className={`${iconSizeClass} text-white`} />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xs shadow-md border border-white/10`}>
      {initials}
    </div>
  );
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  toggleDarkMode,
  quizHistory = [],
  matchingHistory = [],
  canGoBack = false,
  canGoForward = false,
  onGoBack,
  onGoForward
}: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const isPrivileged = profile?.role === 'lektor' || profile?.role === 'admin';

  const [openDropdown, setOpenDropdown] = useState<DropdownType | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const streakInfo = useMemo(() => loadStreakInfo(), []);
  const baseXp = useMemo(() => calculateBaseXp(quizHistory, matchingHistory), [quizHistory, matchingHistory]);
  
  const { totalXpWithBadges, unlockedCount } = useMemo(() => {
    return evaluateBadges(quizHistory, matchingHistory, streakInfo, baseXp);
  }, [quizHistory, matchingHistory, streakInfo, baseXp]);

  const { currentRank, progressPercent: xpProgress } = useMemo(() => {
    return getUserRank(totalXpWithBadges);
  }, [totalXpWithBadges]);

  const displayName = user 
    ? (profile?.full_name || user.email?.split('@')[0] || 'Uživatel')
    : 'Host';

  const userInitials = useMemo(() => {
    if (!user) return 'VS';
    const name = (profile?.full_name || user.email || '').trim();
    if (!name) return 'VS';
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'VS';
  }, [user, profile]);

  const role = profile?.role ?? 'student';
  const roleLabel = role === 'admin' ? 'Správce' : role === 'lektor' ? 'Lektor' : 'Student';
  const avatarDisplay = useMemo(() => resolveAvatarDisplay(profile?.avatar_url), [profile?.avatar_url]);

  // Toggle Dropdowns
  const toggleDropdown = (type: DropdownType, e: React.MouseEvent<HTMLElement>) => {
    if (openDropdown === type) {
      setOpenDropdown(null);
      setDropdownPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const isProfile = type === 'profile';
      const isMore = type === 'more';
      const menuWidth = isMore ? 320 : isProfile ? 280 : 256;

      let left = rect.left;
      if (isProfile) {
        left = rect.right - menuWidth;
      }
      if (left + menuWidth > window.innerWidth - 12) {
        left = window.innerWidth - menuWidth - 12;
      }
      if (left < 12) left = 12;

      setDropdownPos({ top: rect.bottom + 8, left });
      setOpenDropdown(type);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setDropdownPos(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Nav scroll gradient tracking
  const navScrollRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkNavScroll = () => {
    if (navScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollWidth - clientWidth - scrollLeft > 4);
    }
  };

  useEffect(() => {
    checkNavScroll();
    window.addEventListener('resize', checkNavScroll);
    return () => window.removeEventListener('resize', checkNavScroll);
  }, []);

  const isPracticeActive = ['scenarios', 'weapons', 'admin', 'ethics'].includes(activeTab);
  const isDrillActive = ['compass', 'flashcards', 'matching'].includes(activeTab);
  const isMoreActive = isPracticeActive || isDrillActive || ['badges', 'statistics', 'library'].includes(activeTab);

  return (
    <div className="shrink-0 relative z-50" ref={dropdownRef}>
      <div className="h-16 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md flex items-center justify-between px-3 sm:px-5 lg:px-6 border-b border-slate-800 transition-colors">
        
        {/* Brand Logo & Title + Desktop History Controls */}
        <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group" 
            onClick={() => {
              setActiveTab('subjects');
              setOpenDropdown(null);
              setDropdownPos(null);
            }}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-base sm:text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform border border-blue-400/30 shrink-0">
              V
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-bold text-xs sm:text-sm lg:text-base tracking-tight flex items-center gap-1.5 sm:gap-2">
                AKADEMIE VS ČR
                <span className="text-amber-400 font-bold text-[9px] sm:text-[10px] lg:text-xs px-1.5 sm:px-2 py-0.5 bg-amber-400/10 rounded-full border border-amber-400/30 tracking-wider">
                  ZOP A
                </span>
              </h1>
              <span className="text-[10px] text-slate-400 hidden xl:block tracking-wide">Výukový & zkušební systém</span>
            </div>
          </div>

          {/* Desktop Back / Forward History Controls */}
          <div className="hidden lg:flex items-center gap-1 ml-1 pl-2 border-l border-slate-800 text-slate-400">
            <button
              type="button"
              onClick={onGoBack}
              disabled={!canGoBack}
              title="Zpět v historii"
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800/80 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
              aria-label="Přejít zpět"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onGoForward}
              disabled={!canGoForward}
              title="Vpřed v historii"
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800/80 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
              aria-label="Přejít vpřed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Navigation - Středový kontejner */}
        <div className="relative flex-1 min-w-0 mx-2 lg:mx-4 hidden md:flex items-center overflow-hidden">
          {/* Left edge scroll gradient indicator */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent dark:from-slate-950 z-10 flex items-center justify-start pl-0.5">
              <div className="w-1 h-3 rounded-full bg-slate-500/40" />
            </div>
          )}

          <nav 
            ref={navScrollRef}
            onScroll={() => {
              checkNavScroll();
              if (openDropdown) { setOpenDropdown(null); setDropdownPos(null); }
            }}
            className="flex-1 overflow-x-auto hide-scrollbar flex items-center gap-1.5 lg:gap-2 py-1"
          >
            {/* 1. Subjects - Primary Item */}
            <button
              onClick={() => { setActiveTab('subjects'); setOpenDropdown(null); setDropdownPos(null); }}
              className={`px-2.5 lg:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'subjects' 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Předměty</span>
            </button>

            {/* 2. Exam & Quiz - Primary Item */}
            <button
              onClick={() => { setActiveTab('quiz'); setOpenDropdown(null); setDropdownPos(null); }}
              className={`px-2.5 lg:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'quiz' 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Test & Zkouška</span>
            </button>

            {/* 3. AI Captain Exam Assistant - Primary Item */}
            <button
              onClick={() => { setActiveTab('assistant'); setOpenDropdown(null); setDropdownPos(null); }}
              className={`px-2.5 lg:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                activeTab === 'assistant' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/40 shadow-sm shadow-indigo-500/25' 
                  : 'text-indigo-300 bg-indigo-950/40 border-indigo-500/30 hover:text-white hover:bg-indigo-900/60'
              }`}
              title="AI vyhodnocení zadání a písemek od kapitánů z fotky či textu"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>AI Asistent</span>
            </button>

            {/* Tablet-only "Další" Dropdown Button (md/lg view) */}
            <button
              onClick={(e) => toggleDropdown('more', e)}
              className={`flex xl:hidden px-2.5 lg:px-3 py-2 rounded-xl text-xs font-bold transition-all items-center gap-1.5 cursor-pointer shrink-0 ${
                isMoreActive
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title="Další moduly a nástroje"
            >
              <MoreHorizontal className="w-4 h-4" />
              <span>Další</span>
              {unlockedCount > 0 && !isMoreActive && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'more' ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop-only full menu (xl+ view) */}
            {/* 4. Practice & Simulator Dropdown */}
            <div className="relative shrink-0 hidden xl:block">
              <button
                onClick={(e) => toggleDropdown('practice', e)}
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
            </div>

            {/* 5. Drill & Knowledge Dropdown */}
            <div className="relative shrink-0 hidden xl:block">
              <button
                onClick={(e) => toggleDropdown('drill', e)}
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
            </div>

            {/* 6. Badges */}
            <button
              onClick={() => { setActiveTab('badges'); setOpenDropdown(null); setDropdownPos(null); }}
              className={`hidden xl:flex px-3 py-2 rounded-xl text-xs font-bold transition-all items-center gap-1.5 cursor-pointer shrink-0 ${
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
              onClick={() => { setActiveTab('statistics'); setOpenDropdown(null); setDropdownPos(null); }}
              className={`hidden xl:flex px-3 py-2 rounded-xl text-xs font-bold transition-all items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'statistics' 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistiky</span>
            </button>

            {/* 8. Material Library */}
            <button
              onClick={() => { setActiveTab('library'); setOpenDropdown(null); setDropdownPos(null); }}
              className={`hidden xl:flex px-3 py-2 rounded-xl text-xs font-bold transition-all items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'library'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Materiály</span>
            </button>
          </nav>

          {/* Right edge scroll gradient indicator */}
          {canScrollRight && (
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent dark:from-slate-950 z-10 flex items-center justify-end pr-0.5">
              <div className="w-1 h-3 rounded-full bg-slate-500/40" />
            </div>
          )}
        </div>

        {/* Right controls: Merged Profile & Rank + Theme Toggle */}
        <div className="flex-shrink-0 flex items-center gap-2 sm:gap-2.5">
          {/* Combined Profile + Rank Element */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => toggleDropdown('profile', e)}
              className={`cursor-pointer flex items-center gap-2 sm:gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl sm:rounded-2xl transition-all border shrink-0 ${
                openDropdown === 'profile'
                  ? 'bg-slate-800 border-amber-400/70 ring-2 ring-amber-400/20 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 hover:border-amber-400/40 text-slate-200'
              }`}
              title="Profil uživatele, hodnostní postup a XP"
            >
              {/* Circular avatar with rank level badge in corner */}
              <div className="relative shrink-0">
                <AvatarCircle
                  hasUser={!!user}
                  display={avatarDisplay}
                  initials={userInitials}
                  sizeClass="w-8 h-8 sm:w-9 sm:h-9"
                  iconSizeClass="w-4 h-4"
                />
                {/* Rank level badge in corner */}
                <div 
                  className="absolute -bottom-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-[9px] flex items-center justify-center border border-slate-900 shadow-sm leading-none"
                  title={`Hodnostní úroveň ${currentRank.level}: ${currentRank.name}`}
                >
                  {currentRank.level}
                </div>
              </div>

              {/* Text block: Name/Role on top, Rank & XP below */}
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs max-w-[90px] md:max-w-[120px] truncate" title={user ? displayName : 'Host'}>
                    {user ? displayName : 'Host'}
                  </span>
                  {user && role === 'admin' && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/40">
                      Správce
                    </span>
                  )}
                  {user && role === 'lektor' && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                      Lektor
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                  <span className="font-bold text-amber-300">{currentRank.shortTitle}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-slate-300 text-[10px]">{totalXpWithBadges.toLocaleString('cs-CZ')} XP</span>
                </div>
              </div>

              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform ${openDropdown === 'profile' ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
          </div>

          {/* Notification Bell (zprávy od správce) */}
          <NotificationBell />

          {/* Feedback Button (accessible from header on mobile and desktop) */}
          {user && (
            <button 
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-700"
              title="Odeslat zpětnou vazbu k aplikaci"
              aria-label="Zpětná vazba"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </button>
          )}

          {/* Theme Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            title={isDarkMode ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Floating Dropdowns */}
      <AnimatePresence>
        {/* Practice Dropdown (Desktop) */}
        {openDropdown === 'practice' && dropdownPos && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left }}
            className="w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-xl"
          >
            <button
              onClick={() => { setActiveTab('scenarios'); setOpenDropdown(null); setDropdownPos(null); }}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'scenarios' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 shrink-0 ${activeTab === 'scenarios' ? 'text-slate-950' : 'text-amber-400'}`} />
              <div>
                <div className="font-bold">Taktické scénáře</div>
                <div className="text-[10px] opacity-75">{tacticalScenarios.length} modelových situací z praxe</div>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('weapons'); setOpenDropdown(null); setDropdownPos(null); }}
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
              onClick={() => { setActiveTab('admin'); setOpenDropdown(null); setDropdownPos(null); }}
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
              onClick={() => { setActiveTab('ethics'); setOpenDropdown(null); setDropdownPos(null); }}
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

        {/* Drill Dropdown (Desktop) */}
        {openDropdown === 'drill' && dropdownPos && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left }}
            className="w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-xl"
          >
            <button
              onClick={() => { setActiveTab('compass'); setOpenDropdown(null); setDropdownPos(null); }}
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
              onClick={() => { setActiveTab('flashcards'); setOpenDropdown(null); setDropdownPos(null); }}
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
              onClick={() => { setActiveTab('matching'); setOpenDropdown(null); setDropdownPos(null); }}
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

        {/* Tablet "Další" Dropdown (md/lg view) */}
        {openDropdown === 'more' && dropdownPos && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left }}
            className="w-80 max-h-[82vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 space-y-3 z-50 backdrop-blur-xl"
          >
            {/* Section 1: Výcvik & Praxe */}
            <div className="space-y-1">
              <div className="px-2 pt-1 text-[10px] font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                <span>Výcvik & Praxe</span>
              </div>

              <button
                onClick={() => { setActiveTab('scenarios'); setOpenDropdown(null); setDropdownPos(null); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'scenarios' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className={`w-4 h-4 shrink-0 ${activeTab === 'scenarios' ? 'text-slate-950' : 'text-amber-400'}`} />
                <div>
                  <div className="font-bold">Taktické scénáře</div>
                  <div className="text-[10px] opacity-75">{tacticalScenarios.length} modelových situací z praxe</div>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('weapons'); setOpenDropdown(null); setDropdownPos(null); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
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
                onClick={() => { setActiveTab('admin'); setOpenDropdown(null); setDropdownPos(null); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
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
                onClick={() => { setActiveTab('ethics'); setOpenDropdown(null); setDropdownPos(null); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'ethics' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <HeartHandshake className={`w-4 h-4 shrink-0 ${activeTab === 'ethics' ? 'text-slate-950' : 'text-rose-400'}`} />
                <div>
                  <div className="font-bold">Profesní etika</div>
                  <div className="text-[10px] opacity-75">Kodex & protikorupční modul</div>
                </div>
              </button>
            </div>

            {/* Section 2: Znalosti & Dril */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="px-2 pt-1 text-[10px] font-black uppercase tracking-wider text-blue-400/90 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-300" />
                <span>Znalosti & Dril</span>
              </div>

              <button
                onClick={() => { setActiveTab('compass'); setOpenDropdown(null); setDropdownPos(null); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
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
                onClick={() => { setActiveTab('flashcards'); setOpenDropdown(null); setDropdownPos(null); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
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
                onClick={() => { setActiveTab('matching'); setOpenDropdown(null); setDropdownPos(null); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'matching' ? 'bg-blue-600 text-white font-bold' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <LayoutGrid className={`w-4 h-4 shrink-0 ${activeTab === 'matching' ? 'text-white' : 'text-emerald-400'}`} />
                <div>
                  <div className="font-bold">Poznávačka pojmů</div>
                  <div className="text-[10px] opacity-75">Rychlé pexeso na čas</div>
                </div>
              </button>
            </div>

            {/* Section 3: Přehledy & Materiály */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="px-2 pt-1 text-[10px] font-black uppercase tracking-wider text-indigo-400/90 flex items-center gap-1.5">
                <Award className="w-3 h-3" />
                <span>Přehledy & Systém</span>
              </div>

              <button
                onClick={() => { setActiveTab('badges'); setOpenDropdown(null); setDropdownPos(null); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'badges' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className={`w-4 h-4 shrink-0 ${activeTab === 'badges' ? 'text-slate-950' : 'text-amber-400'}`} />
                  <div>
                    <div className="font-bold">Odznaky & Úrovně</div>
                    <div className="text-[10px] opacity-75">Služební postup a trofeje</div>
                  </div>
                </div>
                {unlockedCount > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'badges' ? 'bg-slate-950 text-amber-400' : 'bg-amber-400 text-slate-950'
                  }`}>
                    {unlockedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveTab('statistics'); setOpenDropdown(null); setDropdownPos(null); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'statistics' ? 'bg-blue-600 text-white font-bold' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BarChart3 className={`w-4 h-4 shrink-0 ${activeTab === 'statistics' ? 'text-white' : 'text-blue-400'}`} />
                <div>
                  <div className="font-bold">Statistiky & Úspěšnost</div>
                  <div className="text-[10px] opacity-75">Detailní grafy a slabé okruhy</div>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('library'); setOpenDropdown(null); setDropdownPos(null); }}
                className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'library' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'library' ? 'text-white' : 'text-indigo-400'}`} />
                <div>
                  <div className="font-bold">Knihovna materiálů</div>
                  <div className="text-[10px] opacity-75">Studijní texty a předpisy ke stažení</div>
                </div>
              </button>

              {isPrivileged && (
                <button
                  onClick={() => { setActiveTab('content-manager'); setOpenDropdown(null); setDropdownPos(null); }}
                  className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'content-manager' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-300 hover:bg-slate-800'
                  }`}
                >
                  <Settings2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <div>
                    <div className="font-bold">Správa obsahu</div>
                    <div className="text-[10px] opacity-75">Administrace otázek a materiálů</div>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Profile & Rank Dropdown Popover */}
        {openDropdown === 'profile' && dropdownPos && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left }}
            className="w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 space-y-3 z-50 backdrop-blur-xl"
          >
            {/* User Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="shrink-0">
                <AvatarCircle
                  hasUser={!!user}
                  display={avatarDisplay}
                  initials={userInitials}
                  sizeClass="w-10 h-10"
                  iconSizeClass="w-5 h-5"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm truncate" title={user ? displayName : 'Host'}>
                  {user ? displayName : 'Nepřihlášený host'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'Data uložena lokálně v prohlížeči'}
                </div>
                <div className="mt-1">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                    role === 'admin' 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : role === 'lektor' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                    {user ? roleLabel : 'Host'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rank & XP Status Box */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xs shadow-sm">
                    {currentRank.level}
                  </div>
                  <div>
                    <div className="font-bold text-amber-300 text-xs">{currentRank.name}</div>
                    <div className="text-[10px] text-slate-400">{currentRank.shortTitle} • Úroveň {currentRank.level}</div>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-xs text-white">
                  {totalXpWithBadges.toLocaleString('cs-CZ')} XP
                </div>
              </div>

              {/* Mini XP progress bar */}
              <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>

              <button
                onClick={() => { setActiveTab('badges'); setOpenDropdown(null); setDropdownPos(null); }}
                className="w-full mt-1 py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Hodnostní žebříček a odznaky</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {isPrivileged && (
                <button
                  onClick={() => { setActiveTab('content-manager'); setOpenDropdown(null); setDropdownPos(null); }}
                  className="w-full mt-1.5 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Správa obsahu</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Actions: Edit profile / Sign in or Sign out */}
            {user ? (
              <div className="pt-1 space-y-1">
                <button
                  onClick={() => { setIsProfileModalOpen(true); setOpenDropdown(null); setDropdownPos(null); }}
                  className="w-full py-2 px-3 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <UserCog className="w-4 h-4 text-blue-400" />
                  <span>Upravit profil</span>
                </button>
                <button
                  onClick={() => { signOut(); setOpenDropdown(null); setDropdownPos(null); }}
                  className="w-full py-2 px-3 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-transparent hover:border-rose-900/50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Odhlásit se z účtu</span>
                </button>
              </div>
            ) : (
              <div className="pt-1">
                <button
                  onClick={() => { setIsAuthModalOpen(true); setOpenDropdown(null); setDropdownPos(null); }}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Přihlásit se / Registrovat</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <FeedbackModal
          onClose={() => setIsFeedbackOpen(false)}
          screenContext={activeTab}
        />
      )}

      {/* User Profile Modal */}
      {isProfileModalOpen && user && (
        <UserProfileModal
          onClose={() => setIsProfileModalOpen(false)}
          totalXp={totalXpWithBadges}
          currentRank={currentRank}
        />
      )}
    </div>
  );
}
