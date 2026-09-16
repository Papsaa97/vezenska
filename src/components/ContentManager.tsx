import React, { useEffect, useState } from 'react';
import {
  Settings2,
  FolderOpen,
  ShieldAlert,
  HelpCircle,
  MessageSquareWarning,
  Users,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import QuestionBankManager from './QuestionBankManager';
import FeedbackManager from './FeedbackManager';
import UserManager from './UserManager';
import MaterialManager from './content-manager/MaterialManager';

// ─── Component ────────────────────────────────────────────────────────────────

interface ContentManagerProps {
  onQuestionsUpdated?: () => void;
}

export default function ContentManager({ onQuestionsUpdated }: ContentManagerProps = {}) {
  const { profile } = useAuth();

  // Guard: only lektor or admin
  if (!profile || (profile.role !== 'lektor' && profile.role !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
        <ShieldAlert className="w-12 h-12 text-amber-500 opacity-60" />
        <div className="text-center">
          <div className="font-bold text-slate-700 dark:text-slate-300">Přístup odepřen</div>
          <div className="text-sm mt-1">Tato sekce je dostupná pouze pro lektory a správce.</div>
        </div>
      </div>
    );
  }

  return <ContentManagerInner onQuestionsUpdated={onQuestionsUpdated} />;
}

const VALID_CM_TABS = ['materials', 'questions', 'feedback', 'users'] as const;
type ContentManagerTab = (typeof VALID_CM_TABS)[number];

function getInitialCmTab(): ContentManagerTab {
  if (typeof window !== 'undefined') {
    const rawHash = window.location.hash.replace(/^#/, '');
    const hashParts = rawHash.split('/');
    if (hashParts[0] === 'content-manager' && hashParts[1]) {
      if (VALID_CM_TABS.includes(hashParts[1] as ContentManagerTab)) {
        return hashParts[1] as ContentManagerTab;
      }
    }
    const saved = localStorage.getItem('vscr_content_manager_tab') as ContentManagerTab | null;
    if (saved && VALID_CM_TABS.includes(saved)) {
      return saved;
    }
  }
  return 'materials';
}

function ContentManagerInner({ onQuestionsUpdated }: ContentManagerProps) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<ContentManagerTab>(getInitialCmTab);
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);

  // Bezpečnostní pojistka: záložka "users" je viditelná a dostupná pouze pro roli 'admin'.
  // Pokud byla obnovena z URL hash / localStorage (např. sdílený prohlížeč), pro lektora ji přesměruj pryč.
  useEffect(() => {
    if (activeTab === 'users' && !isAdmin) {
      setActiveTab('materials');
    }
  }, [activeTab, isAdmin]);

  // Synchronizace pod-záložky do URL hash a localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vscr_content_manager_tab', activeTab);
      const rawHash = window.location.hash.replace(/^#/, '');
      const hashParts = rawHash.split('/');
      if (hashParts[0] === 'content-manager') {
        window.history.replaceState(null, '', `#content-manager/${activeTab}`);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#/, '');
      const hashParts = rawHash.split('/');
      if (hashParts[0] === 'content-manager' && hashParts[1]) {
        if (VALID_CM_TABS.includes(hashParts[1] as ContentManagerTab)) {
          setActiveTab(hashParts[1] as ContentManagerTab);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Načte počet nevyřešených zpráv zpětné vazby nezávisle na aktivní záložce (pro odznak)
  useEffect(() => {
    let mounted = true;
    supabase
      .from('user_feedback')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new')
      .then(({ count }) => {
        if (mounted && typeof count === 'number') setNewFeedbackCount(count);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/25">
          <Settings2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Správa obsahu</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Nahrávání a správa studijních materiálů a testových otázek</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 w-fit max-w-full overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'materials'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-emerald-500" />
          Správce souborů
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-blue-500" />
          Banka otázek
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquareWarning className="w-4 h-4 text-indigo-500" />
          Zpětná vazba
          {newFeedbackCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {newFeedbackCount > 99 ? '99+' : newFeedbackCount}
            </span>
          )}
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-amber-500" />
            Správa uživatelů
          </button>
        )}
      </div>

      {activeTab === 'materials' && <MaterialManager />}

      {activeTab === 'questions' && <QuestionBankManager onQuestionsUpdated={onQuestionsUpdated} />}

      {activeTab === 'feedback' && <FeedbackManager onNewCountChange={setNewFeedbackCount} />}

      {activeTab === 'users' && isAdmin && <UserManager />}
    </div>
  );
}
