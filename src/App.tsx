import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header, { NavTab } from './components/Header';
import SubjectsHub from './components/SubjectsHub';
import Quiz from './components/Quiz';
import Flashcards from './components/Flashcards';
import Scenarios from './components/Scenarios';
import WeaponSimulator from './components/WeaponSimulator';
import LegalCompass from './components/LegalCompass';
import PrisonAdministration from './components/PrisonAdministration';
import ProfessionalEthics from './components/ProfessionalEthics';
import MatchingGame from './components/MatchingGame';
import BadgesView from './components/BadgesView';
import Statistics from './components/Statistics';
import CaptainExamAssistant from './components/CaptainExamAssistant';
import OfflineBanner from './components/OfflineBanner';
import MaterialLibrary from './components/MaterialLibrary';
import ContentManager from './components/ContentManager';
import { matchingCategories, defaultQuizHistory } from './data/initialData';
import { academyQuestions } from './data/questionsData';
import { 
  FolderKanban,  
  Layers, 
  LayoutGrid, 
  BarChart3, 
  ShieldAlert, 
  Crosshair, 
  Scale, 
  Award, 
  FileText, 
  HeartHandshake, 
  Sparkles,
  Menu,
  X,
  Zap,
  GraduationCap,
  Shield,
  BookOpen,
  Settings2,
} from 'lucide-react';
import { QuizSessionRecord, MatchingRecord, Question } from './types';
import { loadMatchingHistory, updateDailyStreak } from './utils/gamification';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useAuth } from './context/AuthContext';



export default function App() {
  const { profile } = useAuth();
  const isPrivileged = profile?.role === 'lektor' || profile?.role === 'admin';

  const [activeTab, setActiveTab] = useState<NavTab>('subjects');
  const [favorites, setFavorites] = useState<string[]>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('vscr_favorites');
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
  }
  return [];
});
  const [quizPreset, setQuizPreset] = useState<{ subject?: string; topic?: string }>({});
  const [flashcardPresetSubject, setFlashcardPresetSubject] = useState<string | undefined>(undefined);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Use complete academy questions data
  const allQuestions = academyQuestions;

  // Load quiz history from localStorage (or fallback to default)
  const [quizHistory, setQuizHistory] = useState<QuizSessionRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('vscr_quiz_history');
      if (savedHistory) {
        try {
          return JSON.parse(savedHistory);
        } catch (e) {
          console.error('Failed to parse quiz history', e);
        }
      }
    }
    return defaultQuizHistory;
  });

  // Load matching history from localStorage
  const [matchingHistory, setMatchingHistory] = useState<MatchingRecord[]>(() => {
    return loadMatchingHistory();
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('vscr_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Daily streak check on mount
  useEffect(() => {
    updateDailyStreak();
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('vscr_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save quiz history to localStorage
  useEffect(() => {
    localStorage.setItem('vscr_quiz_history', JSON.stringify(quizHistory));
  }, [quizHistory]);

  useEffect(() => {
    localStorage.setItem('vscr_theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleTabChange = (tab: NavTab) => {
    if (tab === 'quiz' || tab === 'flashcards') {
      setCustomQuestions(null);
    }
    setActiveTab(tab);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleSaveQuizResult = (result: QuizSessionRecord) => {
    setQuizHistory(prev => [...prev, result]);
    updateDailyStreak();
  };

  const handleMatchingGameComplete = (record: MatchingRecord) => {
    setMatchingHistory(prev => [record, ...prev]);
  };

  const handleStartSubjectQuiz = (subject: string, topic?: string) => {
    setCustomQuestions(null);
    setQuizPreset({ subject, topic });
    setActiveTab('quiz');
  };

  const handleStartSubjectFlashcards = (subject: string) => {
    setCustomQuestions(null);
    setFlashcardPresetSubject(subject);
    setActiveTab('flashcards');
  };

  const handleStartCustomQuiz = (questions: Question[]) => {
    setCustomQuestions(questions);
    setQuizPreset({});
    setActiveTab('quiz');
  };

  const handleStartCustomFlashcards = (questions: Question[]) => {
    setCustomQuestions(questions);
    setFlashcardPresetSubject(undefined);
    setActiveTab('flashcards');
  };

  const handleClearHistory = () => {
    setQuizHistory([]);
    localStorage.removeItem('vscr_quiz_history');
    setMatchingHistory([]);
    localStorage.removeItem('vscr_matching_history');
  };

  const handleLoadSampleData = () => {
    setQuizHistory(defaultQuizHistory);
    localStorage.setItem('vscr_quiz_history', JSON.stringify(defaultQuizHistory));
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`flex flex-col h-[100dvh] w-full font-sans overflow-hidden transition-colors print:h-auto print:overflow-visible print:bg-white print:text-black ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="no-print">
        <Header 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode}
          quizHistory={quizHistory}
          matchingHistory={matchingHistory}
        />
        <OfflineBanner />
      </div>
      
      <main className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-3 sm:p-4 pb-24 lg:pb-4 md:p-6 gap-4 md:gap-6 w-full print:p-0 print:m-0 print:overflow-visible print:h-auto">
        {activeTab === 'subjects' && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <SubjectsHub
              questions={allQuestions}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onStartQuiz={handleStartSubjectQuiz}
              onStartFlashcards={handleStartSubjectFlashcards}
            />
          </div>
        )}

        {activeTab === 'quiz' && (
          <Quiz 
            questions={customQuestions || allQuestions} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite}
            onSaveQuizResult={handleSaveQuizResult}
            onNavigateToBadges={() => setActiveTab('badges')}
            presetSubject={quizPreset.subject}
            presetTopic={quizPreset.topic}
          />
        )}

        {activeTab === 'assistant' && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <CaptainExamAssistant
              onStartCustomQuiz={handleStartCustomQuiz}
              onStartCustomFlashcards={handleStartCustomFlashcards}
            />
          </div>
        )}

        {activeTab === 'compass' && (
          <div className="w-full h-full min-h-[calc(100vh-170px)] md:min-h-0 flex flex-col overflow-hidden">
            <LegalCompass />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <PrisonAdministration />
          </div>
        )}

        {activeTab === 'ethics' && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <ProfessionalEthics />
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <Scenarios />
          </div>
        )}

        {activeTab === 'weapons' && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <WeaponSimulator 
              onNavigateToBadges={() => setActiveTab('badges')}
            />
          </div>
        )}
        
        {activeTab === 'flashcards' && (
          <Flashcards 
            questions={customQuestions || allQuestions} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite}
            presetSubject={flashcardPresetSubject}
          />
        )}
        
        {activeTab === 'matching' && (
          <MatchingGame 
            categories={matchingCategories} 
            onGameComplete={handleMatchingGameComplete}
            onNavigateToBadges={() => setActiveTab('badges')}
          />
        )}

        {activeTab === 'badges' && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <BadgesView 
              quizHistory={quizHistory}
              matchingHistory={matchingHistory}
              onStartQuiz={() => setActiveTab('quiz')}
              onStartMatching={() => setActiveTab('matching')}
            />
          </div>
        )}

        {activeTab === 'statistics' && (
          <Statistics 
            questions={allQuestions}
            history={quizHistory}
            onStartTopicQuiz={handleStartSubjectQuiz}
            onClearHistory={handleClearHistory}
            onLoadSampleData={handleLoadSampleData}
          />
        )}

        {activeTab === 'library' && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <MaterialLibrary />
          </div>
        )}

        {activeTab === 'content-manager' && isPrivileged && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <ContentManager />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation (5 Ergonomic Core Pillars) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-1 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] no-print" style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom))' }}>
        
        {/* 1. Subjects */}
        <button
          onClick={() => { setActiveTab('subjects'); setIsMobileMenuOpen(false); }}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'subjects' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
          }`}
        >
          <FolderKanban className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Předměty</span>
        </button>

        {/* 2. Quiz & Exam */}
        <button
          onClick={() => { setCustomQuestions(null); setActiveTab('quiz'); setIsMobileMenuOpen(false); }}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'quiz' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Zkouška</span>
        </button>

        {/* 3. AI Assistant (Featured Center Button) */}
        <button
          onClick={() => { setActiveTab('assistant'); setIsMobileMenuOpen(false); }}
          className="flex flex-1 flex-col items-center justify-center py-0.5 px-1 -mt-3 cursor-pointer group"
        >
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
            activeTab === 'assistant'
              ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 text-white ring-2 ring-indigo-400/50 shadow-indigo-500/30'
              : 'bg-slate-900 dark:bg-slate-800 text-amber-300 border border-slate-700 shadow-slate-950/40'
          }`}>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className={`text-[10px] mt-1 font-bold ${activeTab === 'assistant' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
            AI Asistent
          </span>
        </button>

        {/* 4. Practice / Scenarios */}
        <button
          onClick={() => { 
            setActiveTab('scenarios');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            ['scenarios', 'weapons', 'admin', 'ethics'].includes(activeTab)
              ? 'text-amber-500 font-bold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Výcvik</span>
        </button>

        {/* 5. More / Tools Hub */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            isMobileMenuOpen || ['compass', 'flashcards', 'matching', 'badges', 'statistics'].includes(activeTab)
              ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Více</span>
        </button>
      </nav>

      {/* Mobile Hub Bottom Sheet (Full Navigation Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 no-print"
            />

            {/* Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl z-50 p-5 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl space-y-5 no-print"
            >
              {/* Handle & Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    Všechny moduly Akademie VS ČR
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Section 1: Výcvik & Trenažéry */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Výcvik & Praxe</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setActiveTab('scenarios'); setIsMobileMenuOpen(false); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeTab === 'scenarios' 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 font-bold' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5 text-amber-500 mb-1.5" />
                    <div className="text-xs font-bold leading-snug">Taktické scénáře</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">10 situací z praxe</div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('weapons'); setIsMobileMenuOpen(false); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeTab === 'weapons' 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 font-bold' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Crosshair className="w-5 h-5 text-blue-500 mb-1.5" />
                    <div className="text-xs font-bold leading-snug">Zbraně & Střelba</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">CZ 75 B & Scorpion</div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeTab === 'admin' 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 font-bold' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-emerald-500 mb-1.5" />
                    <div className="text-xs font-bold leading-snug">Administrativa & ETŘ</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Úřední záznamy & Č.j.</div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('ethics'); setIsMobileMenuOpen(false); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeTab === 'ethics' 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 font-bold' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <HeartHandshake className="w-5 h-5 text-rose-500 mb-1.5" />
                    <div className="text-xs font-bold leading-snug">Profesní etika</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Kodex & rizika</div>
                  </button>
                </div>
              </div>

              {/* Section 2: Znalosti & Dril */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Znalosti & Dril</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { setActiveTab('compass'); setIsMobileMenuOpen(false); }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeTab === 'compass' 
                        ? 'bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-300 font-bold' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Scale className="w-4 h-4 text-blue-500 mb-1" />
                    <div className="text-xs font-bold">Předpisy & §</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Kompas zákonů</div>
                  </button>

                  <button
                    onClick={() => { setCustomQuestions(null); setActiveTab('flashcards'); setIsMobileMenuOpen(false); }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeTab === 'flashcards' 
                        ? 'bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-300 font-bold' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-amber-500 mb-1" />
                    <div className="text-xs font-bold">Kartičky</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">3D Leitner dril</div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('matching'); setIsMobileMenuOpen(false); }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeTab === 'matching' 
                        ? 'bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-300 font-bold' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 text-emerald-500 mb-1" />
                    <div className="text-xs font-bold">Poznávačka</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Pexeso pojmů</div>
                  </button>
                </div>
              </div>

              {/* Section 3: Profil & Výsledky */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Profil & Statistiky</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setActiveTab('badges'); setIsMobileMenuOpen(false); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      activeTab === 'badges' 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 font-bold' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">Odznaky & Úrovně</div>
                      <div className="text-[10px] text-slate-500">Hodnostní postup</div>
                    </div>
                    <Award className="w-5 h-5 text-amber-500" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('statistics'); setIsMobileMenuOpen(false); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      activeTab === 'statistics' 
                        ? 'bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-300 font-bold' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">Statistiky</div>
                      <div className="text-[10px] text-slate-500">Analýza zkoušky</div>
                    </div>
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </button>
                </div>
              </div>

              {/* Section 4: Materiály & Správa */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Studijní materiály</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setActiveTab('library'); setIsMobileMenuOpen(false); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      activeTab === 'library'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-900 dark:text-indigo-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">Knihovna</div>
                      <div className="text-[10px] text-slate-500">PDF, DOCX, PPTX</div>
                    </div>
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                  </button>

                  {isPrivileged && (
                    <button
                      onClick={() => { setActiveTab('content-manager'); setIsMobileMenuOpen(false); }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'content-manager'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">Správa obsahu</div>
                        <div className="text-[10px] text-slate-500">Nahrávání souborů</div>
                      </div>
                      <Settings2 className="w-5 h-5 text-emerald-500" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <SpeedInsights />
    </div>
  );
}
