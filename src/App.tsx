import React, { useState, useEffect, useCallback, useMemo, useId, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header, { NavTab } from './components/Header';
import OfflineBanner from './components/OfflineBanner';
import RoleSyncBanner from './components/RoleSyncBanner';
import RolePreviewBanner from './components/RolePreviewBanner';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import UpdatePrompt from './components/UpdatePrompt';
import FeedbackButton from './components/FeedbackButton';
import { fetchQuizQuestionsFromSupabase } from './utils/quizQuestionsLoader';

// Lazy-loaded view components — načteny až při první návštěvě daného tabu
const ClassBulletinBoard   = lazy(() => import('./components/ClassBulletinBoard'));
const SubjectsHub          = lazy(() => import('./components/SubjectsHub'));
const Quiz                 = lazy(() => import('./components/Quiz'));
const CaptainExamAssistant = lazy(() => import('./components/CaptainExamAssistant'));
const LegalCompass         = lazy(() => import('./components/LegalCompass'));
const PrisonAdministration = lazy(() => import('./components/PrisonAdministration'));
const ProfessionalEthics   = lazy(() => import('./components/ProfessionalEthics'));
const Scenarios            = lazy(() => import('./components/Scenarios'));
const WeaponSimulator      = lazy(() => import('./components/WeaponSimulator'));
const Flashcards           = lazy(() => import('./components/Flashcards'));
const MatchingGame         = lazy(() => import('./components/MatchingGame'));
const BadgesView           = lazy(() => import('./components/BadgesView'));
const Statistics           = lazy(() => import('./components/Statistics'));
const MaterialLibrary      = lazy(() => import('./components/MaterialLibrary'));
const ContentManager       = lazy(() => import('./components/ContentManager'));
import { matchingCategories } from './data/initialData';
import { useDialog } from './hooks/useDialog';
import { academyQuestions } from './data/questionsData';
import { tacticalScenarios } from './data/scenariosData';
import { 
  FolderKanban,  
  Layers, 
  LayoutGrid, 
  BarChart3, 
  ShieldAlert, 
  Loader2,
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
  LayoutDashboard,
} from 'lucide-react';
import { QuizSessionRecord, MatchingRecord, Question } from './types';
import { loadMatchingHistory, updateDailyStreak } from './utils/gamification';
import { fetchQuizHistory, saveQuizResult, clearQuizHistory } from './utils/quizResults';
import {
  enqueuePendingResult,
  flushPendingResults,
  pendingResultsForUser,
  removePendingResults,
  PendingQuizResult,
} from './utils/quizResultQueue';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { getHiddenQuestionIds, isQuestionHidden } from './utils/questionActions';

/** Spinner zobrazený při lazy-loadingu view komponent. */
function TabLoader({ isDark }: { isDark?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center flex-1 gap-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <span className="text-xs font-medium">Načítám…</span>
    </div>
  );
}


const NAV_TAB_LABELS: Record<NavTab, string> = {
  dashboard: 'Nástěnka',
  subjects: 'Předměty',
  quiz: 'Zkouška',
  assistant: 'AI Asistent',
  compass: 'Kompas zákonů',
  admin: 'Administrativa & ETŘ',
  ethics: 'Profesní etika',
  scenarios: 'Taktické scénáře',
  weapons: 'Zbraně & Střelba',
  flashcards: 'Kartičky',
  matching: 'Poznávačka',
  badges: 'Odznaky & Úrovně',
  statistics: 'Statistiky',
  library: 'Knihovna',
  'content-manager': 'Správa obsahu',
};

const VALID_TABS: NavTab[] = [
  'dashboard',
  'subjects',
  'quiz',
  'assistant',
  'compass',
  'admin',
  'ethics',
  'scenarios',
  'weapons',
  'flashcards',
  'matching',
  'badges',
  'statistics',
  'library',
  'content-manager',
];

function getInitialTab(): NavTab {
  if (typeof window !== 'undefined') {
    const rawHash = window.location.hash.replace(/^#/, '');
    const tabFromHash = rawHash.split('/')[0] as NavTab;
    if (VALID_TABS.includes(tabFromHash)) {
      return tabFromHash;
    }
    const saved = localStorage.getItem('vscr_active_tab') as NavTab | null;
    if (saved && VALID_TABS.includes(saved)) {
      return saved;
    }
  }
  return 'dashboard';
}

export default function App() {
  const { user, profile, loading: authLoading } = useAuth();
  const isPrivileged = profile?.role === 'lektor' || profile?.role === 'admin';

  const [activeTab, setActiveTab] = useState<NavTab>(getInitialTab);
  const [favorites, setFavorites] = useState<string[]>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('vscr_favorites');
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
  }
  return [];
});
  const [quizPreset, setQuizPreset] = useState<{ subject?: string }>({});
  const [flashcardPresetSubject, setFlashcardPresetSubject] = useState<string | undefined>(undefined);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Escape, past na fokus a jeho návrat — viz hooks/useDialog. Ref patří na
  // samotný panel, ne na ztmavené pozadí: past se má týkat jen ovládacích
  // prvků nabídky.
  const mobileMenuTitleId = useId();
  const mobileMenuRef = useDialog<HTMLDivElement>({
    isOpen: isMobileMenuOpen,
    onClose: () => setIsMobileMenuOpen(false),
  });

  // Otázky: primárně načtené ze Supabase tabulky quiz_questions, s fallbackem na lokální sadu
  const [allQuestions, setAllQuestions] = useState<Question[]>(academyQuestions);
  const [questionsSource, setQuestionsSource] = useState<'supabase' | 'local'>('local');

  const loadQuestions = useCallback(async () => {
    const dbQuestions = await fetchQuizQuestionsFromSupabase();
    const hiddenSet = getHiddenQuestionIds();
    const sourceQuestions = (dbQuestions && dbQuestions.length > 0) ? dbQuestions : academyQuestions;
    const syncedQuestions = sourceQuestions.map(q => ({
      ...q,
      is_hidden: q.is_hidden === true || hiddenSet.has(q.id),
    }));

    setAllQuestions(syncedQuestions);
    setQuestionsSource(dbQuestions && dbQuestions.length > 0 ? 'supabase' : 'local');
  }, []);

  const handleQuestionUpdate = useCallback((updatedQuestion: Question) => {
    setAllQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
  }, []);

  // Otázky se načítají teprve po vyřešení relace, ne hned při připojení komponenty.
  // Politika `quiz_questions_select` je omezená na roli `authenticated` a pro `anon`
  // na tabulce žádná není, takže dotaz odeslaný před přihlášením nevrátí ani řádek:
  // `fetchQuizQuestionsFromSupabase()` vrátí `null` a aplikace spadne na bundlovanou
  // sadu. Bez tohoto efektu by na ní zůstala až do dalšího načtení stránky, protože
  // znovunačtení posílá jedině správa otázek přes `vscr:questions_updated`.
  //
  // V závislostech je `user?.id`, ne `user`: při obnově tokenu chodí z
  // onAuthStateChange nový objekt se stejným id a na ten otázky načítat znovu nemá
  // smysl. Odhlášení naopak id změní na `null`, dotaz projde jako anonymní a sada se
  // správně vrátí na bundlovanou.
  //
  // `allQuestions` startuje na `academyQuestions`, takže i kdyby se relace nevyřešila,
  // aplikace pořád jede na bundlované sadě — čekání nemůže skončit prázdnou bankou.
  useEffect(() => {
    if (authLoading) return;
    loadQuestions();
  }, [loadQuestions, authLoading, user?.id]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<{ question?: Question }>;
      if (customEvt.detail?.question) {
        handleQuestionUpdate(customEvt.detail.question);
      } else {
        loadQuestions();
      }
    };

    window.addEventListener('vscr:questions_updated', handleUpdate);
    window.addEventListener('online', handleUpdate);

    return () => {
      window.removeEventListener('vscr:questions_updated', handleUpdate);
      window.removeEventListener('online', handleUpdate);
    };
  }, [loadQuestions, handleQuestionUpdate]);

  // Historie testů se váže výhradně na reálný účet přihlášeného uživatele (tabulka
  // public.quiz_results) - nový uživatel vždy startuje na prázdné historii / 0 XP.
  const [quizHistory, setQuizHistory] = useState<QuizSessionRecord[]>([]);
  const [quizHistoryLoading, setQuizHistoryLoading] = useState<boolean>(true);
  const [quizHistoryError, setQuizHistoryError] = useState<string | null>(null);

  // Výsledky, které se ještě nepodařilo odeslat do Supabase (náprava Z-16).
  // Žijí v localStorage, takže přežijí obnovení stránky i zavření prohlížeče.
  const [pendingResults, setPendingResults] = useState<PendingQuizResult[]>([]);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setQuizHistory([]);
      setQuizHistoryError(null);
      setQuizHistoryLoading(false);
      return;
    }

    setQuizHistoryLoading(true);
    fetchQuizHistory(user.id).then(({ history, error }) => {
      if (cancelled) return;
      if (error) {
        // Historii NEMAŽEME na prázdnou: vypadalo by to, že o ni uživatel přišel.
        // Necháme dosavadní stav a řekneme, že se ji nepodařilo načíst.
        console.error('[App] Nepodařilo se načíst historii testů:', error);
        setQuizHistoryError(error);
      } else {
        setQuizHistoryError(null);
        setQuizHistory(history);
      }
      setQuizHistoryLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  /** Odešle vše, co čeká ve frontě, a promítne výsledek do stavu. */
  const flushQueue = useCallback(async (userId: string) => {
    const ulozene: QuizSessionRecord[] = [];

    const outcome = await flushPendingResults(userId, async (pending) => {
      const res = await saveQuizResult(pending.userId, pending.result, pending.id);
      if (res.stored) ulozene.push(res.stored);
      return { error: res.error, alreadyStored: res.alreadyStored };
    });

    // Odeslaná položka z fronty zmizí, takže bez tohohle kroku by test z přehledu
    // vypadl až do dalšího načtení stránky — `quizHistory` se stahuje jen při změně
    // uživatele. Zároveň se tím do historie dostanou čísla, jak je spočítal server
    // (viz saveQuizResult), ne jak je odhadl prohlížeč.
    if (ulozene.length > 0) {
      setQuizHistory((prev) => {
        const zname = new Set(prev.map((h) => h.id));
        const prirustek = ulozene.filter((r) => !zname.has(r.id));
        if (prirustek.length === 0) return prev;
        return [...prev, ...prirustek].sort((a, b) => a.timestamp - b.timestamp);
      });
    }

    setPendingResults(pendingResultsForUser(userId));
    return outcome;
  }, []);

  // Fronta se vyprazdňuje při přihlášení, po startu aplikace a při návratu sítě.
  useEffect(() => {
    if (!user) {
      setPendingResults([]);
      return;
    }

    setPendingResults(pendingResultsForUser(user.id));
    void flushQueue(user.id);

    const handleOnline = () => {
      void flushQueue(user.id);
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user, flushQueue]);

  // Čekající výsledky patří do zobrazené historie — jinak by test po dokončení
  // z přehledu zmizel, dokud se neodešle, a působilo by to jako ztráta dat.
  const effectiveQuizHistory = useMemo(() => {
    if (pendingResults.length === 0) return quizHistory;
    const known = new Set(quizHistory.map((h) => h.id));
    const extra = pendingResults
      .map((p) => p.result)
      .filter((r) => !known.has(r.id));
    if (extra.length === 0) return quizHistory;
    return [...quizHistory, ...extra].sort((a, b) => a.timestamp - b.timestamp);
  }, [quizHistory, pendingResults]);

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

  useEffect(() => {
    localStorage.setItem('vscr_theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // History tracking for Back / Forward navigation (both desktop arrows & touch swipe)
  const [navHistory, setNavHistory] = useState<NavTab[]>(() => [getInitialTab()]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navHistory.length - 1;

  const navigateToTab = useCallback((tab: NavTab, push = true) => {
    if (tab === 'quiz' || tab === 'flashcards') {
      setCustomQuestions(null);
    }
    setActiveTab(tab);
    if (push) {
      setNavHistory(prev => {
        const next = prev.slice(0, historyIndex + 1);
        if (next[next.length - 1] === tab) return next;
        return [...next, tab];
      });
      setHistoryIndex(prev => prev + 1);
      window.history.pushState({ tab }, '', `#${tab}`);
    }
  }, [historyIndex]);

  const handleGoBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevTab = navHistory[prevIndex];
      setHistoryIndex(prevIndex);
      setActiveTab(prevTab);
      window.history.replaceState({ tab: prevTab }, '', `#${prevTab}`);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  }, [historyIndex, navHistory]);

  const handleGoForward = useCallback(() => {
    if (historyIndex < navHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextTab = navHistory[nextIndex];
      setHistoryIndex(nextIndex);
      setActiveTab(nextTab);
      window.history.replaceState({ tab: nextTab }, '', `#${nextTab}`);
    } else if (typeof window !== 'undefined') {
      window.history.forward();
    }
  }, [historyIndex, navHistory]);

  // Synchronizace aktivní záložky do URL hash a localStorage pro zachování pozice při refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vscr_active_tab', activeTab);
      const rawHash = window.location.hash.replace(/^#/, '');
      const currentHashTab = rawHash.split('/')[0];
      if (currentHashTab !== activeTab) {
        window.history.replaceState(null, '', `#${activeTab}`);
      }
    }
  }, [activeTab]);

  // Reakce na historii a změny hashe v prohlížeči
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#/, '');
      const tabFromHash = rawHash.split('/')[0] as NavTab;
      if (VALID_TABS.includes(tabFromHash)) {
        setActiveTab((prev) => (prev !== tabFromHash ? tabFromHash : prev));
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Swipe gestem doleva / doprava na mobilech a tabletech pro přechod Zpět / Vpřed
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length !== 1) return;
      const deltaX = e.changedTouches[0].clientX - startX;
      const deltaY = e.changedTouches[0].clientY - startY;
      const elapsed = Date.now() - startTime;

      // Rychlý vodorovný tah (< 500 ms)
      if (elapsed > 500) return;
      if (Math.abs(deltaX) < 70 || Math.abs(deltaY) > 45) return;

      // Nekolidovat s interaktivními prvky a formuláři
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, button, [role="slider"], canvas, .no-swipe, [data-no-swipe]')) {
        return;
      }

      // Nekolidovat s vnitřním vodorovným posunem kontejnerů
      let cur = target;
      while (cur && cur !== document.body) {
        if (cur.scrollWidth > cur.clientWidth + 15) {
          const overflowX = window.getComputedStyle(cur).overflowX;
          if (overflowX === 'auto' || overflowX === 'scroll') return;
        }
        cur = cur.parentElement;
      }

      if (deltaX > 70) {
        // Swipe doprava -> Zpět
        handleGoBack();
      } else if (deltaX < -70) {
        // Swipe doleva -> Vpřed
        handleGoForward();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleGoBack, handleGoForward]);

  const handleTabChange = (tab: NavTab) => {
    navigateToTab(tab);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleSaveQuizResult = (result: QuizSessionRecord) => {
    updateDailyStreak();

    if (!user) {
      // Bez přihlášení se historie nikam neukládá (viz komentář u quizHistory).
      setQuizHistory(prev => [...prev, result]);
      return;
    }

    // Nejdřív do trvalé fronty, teprve potom pokus o odeslání. Kdyby se
    // v tuhle chvíli ztratilo připojení nebo uživatel zavřel kartu, výsledek
    // zůstane v localStorage a odešle se při dalším spuštění.
    enqueuePendingResult(user.id, result);
    setPendingResults(pendingResultsForUser(user.id));

    // Odesílá se výhradně přes frontu — jedno odeslání, jedno místo, kde se
    // řeší chyby. Při úspěchu položka z fronty zmizí, jinak v ní zůstane.
    flushQueue(user.id).catch((e) => {
      console.error('[App] Odeslání výsledku testu selhalo, zůstává ve frontě:', e);
    });
  };

  const handleMatchingGameComplete = (record: MatchingRecord) => {
    setMatchingHistory(prev => [record, ...prev]);
  };

  const handleStartSubjectQuiz = (subject: string) => {
    setCustomQuestions(null);
    setQuizPreset({ subject });
    navigateToTab('quiz');
  };

  const handleStartSubjectFlashcards = (subject: string) => {
    setCustomQuestions(null);
    setFlashcardPresetSubject(subject);
    navigateToTab('flashcards');
  };

  const handleStartCustomQuiz = (questions: Question[]) => {
    setCustomQuestions(questions);
    setQuizPreset({});
    navigateToTab('quiz');
  };

  const handleStartCustomFlashcards = (questions: Question[]) => {
    setCustomQuestions(questions);
    setFlashcardPresetSubject(undefined);
    navigateToTab('flashcards');
  };

  const handleClearHistory = () => {
    setQuizHistory([]);
    setMatchingHistory([]);
    localStorage.removeItem('vscr_matching_history');
    if (user) {
      // Frontu je nutné vyprázdnit také, jinak by se čekající výsledky po
      // odeslání vrátily do právě smazané historie.
      const mine = pendingResultsForUser(user.id).map((p) => p.id);
      removePendingResults(mine);
      setPendingResults([]);
      clearQuizHistory(user.id).then(({ error }) => {
        if (error) console.error('[App] Nepodařilo se smazat historii testů:', error);
      });
    }
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <ErrorBoundary>
      <ProtectedRoute isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
        <div className={`flex flex-col min-h-[100dvh] h-[100dvh] w-full font-sans overflow-hidden transition-colors print:h-auto print:overflow-visible print:bg-white print:text-black ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="no-print">
        <Header 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode}
          quizHistory={effectiveQuizHistory}
          matchingHistory={matchingHistory}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
        />
        <OfflineBanner pendingResultCount={pendingResults.length} />
        <RoleSyncBanner />
        <RolePreviewBanner />
      </div>
      <PWAInstallPrompt />
      <UpdatePrompt />
      <FeedbackButton screenLabel={NAV_TAB_LABELS[activeTab] ?? activeTab} />
      
      <main className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-3 sm:p-4 pb-28 sm:pb-32 md:pb-6 lg:pb-4 md:p-6 gap-4 md:gap-6 w-full print:p-0 print:m-0 print:overflow-visible print:h-auto">
        <Suspense fallback={<TabLoader isDark={isDarkMode} />}>
        {activeTab === 'dashboard' && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <ClassBulletinBoard />
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <SubjectsHub
              questions={allQuestions || []}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onStartQuiz={handleStartSubjectQuiz}
              onStartFlashcards={handleStartSubjectFlashcards}
              onUpdateQuestion={isPrivileged ? handleQuestionUpdate : undefined}
            />
          </div>
        )}

        {activeTab === 'quiz' && (
          <Quiz 
            questions={(customQuestions || allQuestions || []).filter(q => isPrivileged || !isQuestionHidden(q))} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite}
            onSaveQuizResult={handleSaveQuizResult}
            onNavigateToBadges={() => setActiveTab('badges')}
            presetSubject={quizPreset.subject}
            questionsSource={questionsSource}
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
          <div className="w-full h-full min-h-[calc(100dvh-170px)] md:min-h-0 flex flex-col overflow-hidden">
            <LegalCompass />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="w-full h-full overflow-y-auto pr-1 print:h-auto print:overflow-visible print:p-0 print:m-0">
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
            questions={customQuestions || allQuestions || []} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite}
            presetSubject={flashcardPresetSubject}
            onUpdateQuestion={isPrivileged ? handleQuestionUpdate : undefined}
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
              quizHistory={effectiveQuizHistory}
              matchingHistory={matchingHistory}
              onStartQuiz={() => setActiveTab('quiz')}
              onStartMatching={() => setActiveTab('matching')}
            />
          </div>
        )}

        {activeTab === 'statistics' && (
          <Statistics
            questions={allQuestions}
            history={effectiveQuizHistory}
            isLoading={quizHistoryLoading}
            onStartTopicQuiz={handleStartSubjectQuiz}
            onClearHistory={handleClearHistory}
            onStartQuiz={() => navigateToTab('quiz')}
            onStartScenario={() => navigateToTab('scenarios')}
          />
        )}

        {activeTab === 'library' && (
          <div className="w-full h-full overflow-y-auto pr-1">
            <MaterialLibrary />
          </div>
        )}

        {activeTab === 'content-manager' && (
          authLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="text-sm font-medium">Ověřuji oprávnění…</span>
            </div>
          ) : isPrivileged ? (
            <div className="w-full h-full overflow-y-auto pr-1">
              <ContentManager onQuestionsUpdated={loadQuestions} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
              <ShieldAlert className="w-12 h-12 text-amber-500 opacity-60" />
              <div className="text-center">
                <div className="font-bold text-slate-700 dark:text-slate-300">Přístup odepřen</div>
                <div className="text-sm mt-1">Tato sekce je dostupná pouze pro lektory a správce.</div>
              </div>
            </div>
          )
        )}
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation (5 Ergonomic Core Pillars) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-1 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] no-print" style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom))' }}>
        
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
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 no-print"
            />

            {/* Sheet Container */}
            <motion.div
              ref={mobileMenuRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={mobileMenuTitleId}
              tabIndex={-1}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl z-50 p-5 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl space-y-5 no-print"
            >
              {/* Handle & Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h3 id={mobileMenuTitleId} className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    Všechny moduly Akademie VS ČR
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  aria-label="Zavřít nabídku"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Informační tabule tříd ZOP - Hlavní uvítací nástěnka */}
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600/15 border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-sm'
                    : 'bg-gradient-to-r from-blue-900/20 via-slate-900/30 to-indigo-900/20 border-blue-500/30 text-slate-800 dark:text-slate-200 hover:border-blue-400/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-snug">Informační tabule tříd ZOP</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Rozvrhy hodin, změny v učebnách a termíny výcviku
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-400/30 shrink-0">
                  Nástěnka
                </span>
              </button>

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
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{tacticalScenarios.length} modelových situací</div>
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
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
