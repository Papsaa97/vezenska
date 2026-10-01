import React, { useCallback, useEffect, useState } from 'react';
import { BellOff, Flag, Loader2, MessagesSquare, Plus, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NAV_TAB_LABELS } from '../data/navTabs';
import ConversationView from './chat/ConversationView';
import ConversationInfoDialog from './chat/ConversationInfoDialog';
import NewConversationDialog from './chat/NewConversationDialog';
import ReportsPanel from './chat/ReportsPanel';
import {
  ChatConversation,
  announceUnreadChanged,
  conversationIdFromHash,
  fetchChatAccess,
  fetchConversations,
  fetchReports,
  formatChatTime,
} from '../utils/chat';

/** Jak často se seznam konverzací načte znovu, když je stránka vidět. */
const REFRESH_MS = 15_000;

type Access = 'nacitam' | 'ano' | 'ne';

function setChatHash(conversationId: string | null): void {
  const target = conversationId ? `#chat/${conversationId}` : '#chat';
  if (window.location.hash !== target) window.history.replaceState(null, '', target);
}

function previewText(c: ChatConversation): string {
  if (!c.lastText) return c.isGroup ? 'Skupina založena' : 'Zatím bez zpráv';
  const who = c.lastIsMine ? 'Vy' : c.isGroup ? c.lastAuthor : null;
  return who ? `${who}: ${c.lastText}` : c.lastText;
}

/**
 * Záložka Chat — interní zprávy mezi lidmi z akademie.
 *
 * Přímé konverzace 1:1 a skupiny. Kdo smí psát a co kdo vidí, hlídá server
 * (migrace 052): jen zařazení studenti a velitelé, lektoři a správci; každý
 * jen své konverzace. Lektoři a správci navíc vyřizují nahlášené zprávy.
 * Zprávy se načítají opakovaně (bez trvalého spojení), upozornění do
 * zařízení posílá databáze.
 */
export default function Chat() {
  const { profile } = useAuth();
  const isStaff = profile?.role === 'lektor' || profile?.role === 'admin';

  const [access, setAccess] = useState<Access>('nacitam');
  const [accessError, setAccessError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [listLoaded, setListLoaded] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => conversationIdFromHash(window.location.hash));
  const [showReports, setShowReports] = useState<boolean>(false);
  const [openReports, setOpenReports] = useState<number>(0);
  const [newOpen, setNewOpen] = useState<boolean>(false);
  const [infoOpen, setInfoOpen] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    void fetchChatAccess().then((res) => {
      if (!active) return;
      if (res.error) {
        setAccessError(res.error);
        setAccess('ne');
        return;
      }
      setAccess(res.data ? 'ano' : 'ne');
    });
    return () => {
      active = false;
    };
  }, []);

  const loadConversations = useCallback(async () => {
    const res = await fetchConversations();
    setListLoaded(true);
    if (res.error) {
      setListError(res.error);
      return;
    }
    setListError(null);
    setConversations(res.data ?? []);
  }, []);

  useEffect(() => {
    if (access !== 'ano') return;
    void loadConversations();
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') void loadConversations();
    };
    document.addEventListener('visibilitychange', refreshIfVisible);
    const timer = window.setInterval(refreshIfVisible, REFRESH_MS);
    return () => {
      document.removeEventListener('visibilitychange', refreshIfVisible);
      window.clearInterval(timer);
    };
  }, [access, loadConversations]);

  // Počet otevřených nahlášení pro tlačítko v hlavičce záložky.
  useEffect(() => {
    if (!isStaff || access !== 'ano') return;
    let active = true;
    void fetchReports(false).then((res) => {
      if (active && res.data) setOpenReports(res.data.length);
    });
    return () => {
      active = false;
    };
  }, [isStaff, access]);

  // Klepnutí na upozornění otevře aplikaci na #chat/<id>.
  useEffect(() => {
    const onHash = () => {
      const id = conversationIdFromHash(window.location.hash);
      if (id) {
        setSelectedId(id);
        setShowReports(false);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const select = (id: string | null) => {
    setSelectedId(id);
    setShowReports(false);
    setChatHash(id);
  };

  const onActivity = useCallback(() => {
    void loadConversations();
  }, [loadConversations]);

  const onReportCount = useCallback((count: number) => setOpenReports(count), []);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const rightPaneOpen = showReports || selectedId !== null;

  const header = (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex-col sm:flex-row sm:items-center justify-between gap-3 no-print ${
        rightPaneOpen ? 'hidden md:flex' : 'flex'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <MessagesSquare className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{NAV_TAB_LABELS.chat}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Zprávy jen mezi lidmi z akademie — spolužáky, veliteli a lektory
          </p>
        </div>
      </div>
      {access === 'ano' && (
        <div className="flex items-center gap-2">
          {isStaff && (
            <button
              type="button"
              onClick={() => {
                setShowReports(true);
                setSelectedId(null);
                setChatHash(null);
              }}
              aria-pressed={showReports}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer border ${
                showReports
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Flag className="w-4 h-4" aria-hidden="true" />
              Nahlášené
              {openReports > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-xs font-bold inline-flex items-center justify-center">
                  {openReports}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Nová konverzace
          </button>
        </div>
      )}
    </div>
  );

  if (access === 'nacitam') {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <div className="flex items-center gap-2 text-sm text-slate-500 p-4">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Načítám…
        </div>
      </div>
    );
  }

  if (access === 'ne') {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm text-slate-700 dark:text-slate-200 space-y-2">
          {accessError ? (
            <p role="alert" className="text-red-600 dark:text-red-400">
              {accessError}
            </p>
          ) : (
            <>
              <p className="font-semibold">Chat se otevře po zařazení do třídy.</p>
              <p className="text-slate-600 dark:text-slate-300">
                Psát si mohou jen lidé z akademie: studenti a velitelé zařazení do třídy, lektoři a správce. Až vás
                velitel nebo lektor do třídy zařadí, chat se vám zpřístupní.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      {header}

      <div className="flex-1 min-h-[24rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex">
        {/* Seznam konverzací — na telefonu jen tehdy, když není nic otevřené. */}
        <nav
          aria-label="Konverzace"
          className={`${rightPaneOpen ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 md:shrink-0 md:border-r border-slate-200 dark:border-slate-800 min-h-0`}
        >
          <div className="flex-1 min-h-0 overflow-y-auto">
            {!listLoaded && (
              <div className="flex items-center gap-2 text-sm text-slate-500 p-4">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Načítám konverzace…
              </div>
            )}
            {listError && (
              <p role="alert" className="p-4 text-sm text-red-600 dark:text-red-400">
                {listError}
              </p>
            )}
            {listLoaded && !listError && conversations.length === 0 && (
              <div className="p-5 text-sm text-slate-600 dark:text-slate-300 space-y-3">
                <p>Zatím nemáte žádnou konverzaci.</p>
                <button
                  type="button"
                  onClick={() => setNewOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" /> Napsat někomu
                </button>
              </div>
            )}
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {conversations.map((c) => {
                const active = c.id === selectedId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => select(c.id)}
                      aria-current={active ? 'true' : undefined}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 cursor-pointer ${
                        active ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                        {c.isGroup ? (
                          <Users className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <span className="text-sm font-bold" aria-hidden="true">
                            {c.title.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span
                            className={`flex-1 truncate text-sm ${
                              c.unread > 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {c.title}
                          </span>
                          <span className="text-[0.6875rem] text-slate-500 dark:text-slate-400 shrink-0">
                            {formatChatTime(c.lastAt)}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`flex-1 truncate text-xs ${
                              c.unread > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {previewText(c)}
                          </span>
                          {c.muted && (
                            <>
                              <BellOff className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                              <span className="sr-only">(ztlumeno)</span>
                            </>
                          )}
                          {c.unread > 0 && (
                            <span className="min-w-5 h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[0.6875rem] font-bold inline-flex items-center justify-center shrink-0">
                              {c.unread > 99 ? '99+' : c.unread}
                              <span className="sr-only"> nepřečtených</span>
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Pravá část: otevřená konverzace, nahlášené zprávy, nebo výzva. */}
        <section
          aria-label={showReports ? 'Nahlášené zprávy' : selected ? `Konverzace: ${selected.title}` : 'Konverzace'}
          className={`${rightPaneOpen ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col min-h-0`}
        >
          {showReports && isStaff ? (
            <div className="flex flex-col h-full min-h-0">
              <div className="md:hidden px-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReports(false)}
                  className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                >
                  ← Zpět na konverzace
                </button>
              </div>
              <ReportsPanel onOpenCountChange={onReportCount} />
            </div>
          ) : selected ? (
            <ConversationView
              key={selected.id}
              conversation={selected}
              onBack={() => select(null)}
              onOpenInfo={() => setInfoOpen(true)}
              onActivity={onActivity}
            />
          ) : selectedId && listLoaded ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center text-sm text-slate-600 dark:text-slate-300">
              <p>Tahle konverzace už není dostupná — možná jste ze skupiny odešli nebo vás z ní odebrali.</p>
              <button
                type="button"
                onClick={() => select(null)}
                className="font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer"
              >
                Zpět na konverzace
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              <MessagesSquare className="w-8 h-8 text-slate-300 dark:text-slate-700" aria-hidden="true" />
              <p>Vyberte konverzaci vlevo, nebo začněte novou.</p>
            </div>
          )}
        </section>
      </div>

      {newOpen && (
        <NewConversationDialog
          onClose={() => setNewOpen(false)}
          onOpened={(id) => {
            setNewOpen(false);
            select(id);
            void loadConversations();
          }}
        />
      )}
      {infoOpen && selected && (
        <ConversationInfoDialog
          conversation={selected}
          onClose={() => setInfoOpen(false)}
          onChanged={() => {
            void loadConversations();
            announceUnreadChanged();
          }}
          onLeft={() => {
            setInfoOpen(false);
            select(null);
            void loadConversations();
          }}
        />
      )}
    </div>
  );
}
