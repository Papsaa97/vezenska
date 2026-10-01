import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, BellOff, Flag, Info, Loader2, Send, Trash2, Users } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import ReportMessageDialog from './ReportMessageDialog';
import {
  CHAT_MAX_TEXT,
  CHAT_ROLE_LABEL,
  ChatConversation,
  ChatMessage,
  announceUnreadChanged,
  deleteMessage,
  fetchMessages,
  formatChatTime,
  markRead,
  sendMessage,
} from '../../utils/chat';

interface ConversationViewProps {
  conversation: ChatConversation;
  /** Zpět na seznam (jen na telefonu, kde se seznam a konverzace střídají). */
  onBack: () => void;
  onOpenInfo: () => void;
  /** Odeslaná nebo smazaná zpráva — seznam konverzací se načte znovu. */
  onActivity: () => void;
}

/** Jak často se otevřená konverzace načte znovu, když je stránka vidět. */
const REFRESH_MS = 5_000;
/** Stejná velikost stránky jako výchozí p_limit v chat_zpravy_konverzace. */
const PAGE_SIZE = 60;

function memberWord(count: number): string {
  if (count === 1) return 'člen';
  if (count >= 2 && count <= 4) return 'členové';
  return 'členů';
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Dnes';
  if (d.toDateString() === yesterday.toDateString()) return 'Včera';
  return d.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });
}

/**
 * Otevřená konverzace: zprávy, psaní, mazání vlastních a nahlášení cizích.
 * Nové zprávy se načítají každých pár sekund; rodič komponentu klíčuje id
 * konverzace, takže se stav při přepnutí sám vynuluje.
 */
export default function ConversationView({ conversation, onBack, onOpenInfo, onActivity }: ConversationViewProps) {
  const composerId = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingOlder, setLoadingOlder] = useState<boolean>(false);
  const [hasOlder, setHasOlder] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<ChatMessage | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [reportTarget, setReportTarget] = useState<ChatMessage | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  /** Uživatel je u konce konverzace — nová zpráva ho má posunout dolů. */
  const stickToBottomRef = useRef<boolean>(true);
  /** Výška obsahu před načtením starších zpráv (aby obraz neposkočil). */
  const restoreFromHeightRef = useRef<number | null>(null);
  const lastMarkedRef = useRef<string | null>(null);
  const firstLoadRef = useRef<boolean>(true);

  const conversationId = conversation.id;

  const loadLatest = useCallback(async () => {
    const res = await fetchMessages(conversationId);
    setLoading(false);
    if (res.error || !res.data) {
      setError(res.error);
      return;
    }
    setError(null);
    const latest = res.data;
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      setHasOlder(latest.length >= PAGE_SIZE);
    }
    setMessages((prev) => {
      const ids = new Set(latest.map((m) => m.id));
      const oldest = latest[0]?.createdAt;
      const older = oldest ? prev.filter((m) => !ids.has(m.id) && m.createdAt < oldest) : [];
      return [...older, ...latest];
    });
    const newest = latest[latest.length - 1];
    if (newest && newest.id !== lastMarkedRef.current) {
      lastMarkedRef.current = newest.id;
      const marked = await markRead(conversationId);
      if (!marked.error) announceUnreadChanged();
    }
  }, [conversationId]);

  useEffect(() => {
    void loadLatest();
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') void loadLatest();
    };
    document.addEventListener('visibilitychange', refreshIfVisible);
    const timer = window.setInterval(refreshIfVisible, REFRESH_MS);
    return () => {
      document.removeEventListener('visibilitychange', refreshIfVisible);
      window.clearInterval(timer);
    };
  }, [loadLatest]);

  const newestId = messages.length > 0 ? messages[messages.length - 1].id : null;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (restoreFromHeightRef.current !== null) {
      el.scrollTop += el.scrollHeight - restoreFromHeightRef.current;
      restoreFromHeightRef.current = null;
      return;
    }
    if (stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [newestId, messages.length]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const loadOlder = async () => {
    const oldest = messages[0];
    if (!oldest || loadingOlder) return;
    setLoadingOlder(true);
    const res = await fetchMessages(conversationId, oldest.createdAt);
    setLoadingOlder(false);
    if (res.error || !res.data) {
      setError(res.error);
      return;
    }
    const older = res.data;
    setHasOlder(older.length >= PAGE_SIZE);
    if (older.length === 0) return;
    restoreFromHeightRef.current = scrollRef.current?.scrollHeight ?? null;
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      return [...older.filter((m) => !ids.has(m.id)), ...prev];
    });
  };

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const res = await sendMessage(conversationId, trimmed);
    setSending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(null);
    setText('');
    stickToBottomRef.current = true;
    await loadLatest();
    onActivity();
  };

  const onComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter odešle, Shift+Enter zalomí řádek. Při skládání znaků (IME) nic.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await deleteMessage(confirmDelete.id);
    setDeleting(false);
    setConfirmDelete(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    await loadLatest();
    onActivity();
  };

  const subtitle = conversation.isGroup
    ? `Skupina · ${conversation.memberCount} ${memberWord(conversation.memberCount)}`
    : conversation.otherUserRole
      ? CHAT_ROLE_LABEL[conversation.otherUserRole] ?? null
      : null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          aria-label="Zpět na seznam konverzací"
          className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
          {conversation.isGroup ? (
            <Users className="w-4 h-4" aria-hidden="true" />
          ) : (
            <span className="text-sm font-bold" aria-hidden="true">
              {conversation.title.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
            {conversation.title}
            {conversation.muted && (
              <>
                <BellOff className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span className="sr-only">(ztlumeno)</span>
              </>
            )}
          </h2>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onOpenInfo}
          aria-label={conversation.isGroup ? 'Podrobnosti skupiny' : 'Podrobnosti konverzace'}
          title="Podrobnosti"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer"
        >
          <Info className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 space-y-1"
        aria-live="polite"
        aria-relevant="additions"
      >
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500 p-2">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Načítám zprávy…
          </div>
        )}
        {hasOlder && !loading && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={() => void loadOlder()}
              disabled={loadingOlder}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
            >
              {loadingOlder ? 'Načítám…' : 'Načíst starší zprávy'}
            </button>
          </div>
        )}
        {!loading && messages.length === 0 && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
            Zatím tu nejsou žádné zprávy. Napište první.
          </p>
        )}
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
          const showAuthor = conversation.isGroup && !m.mine && (newDay || prev?.authorId !== m.authorId);
          const roleLabel = m.authorRole && m.authorRole !== 'student' ? CHAT_ROLE_LABEL[m.authorRole] : null;
          return (
            <React.Fragment key={m.id}>
              {newDay && (
                <div className="flex justify-center py-2">
                  <span className="text-[0.6875rem] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                    {dayLabel(m.createdAt)}
                  </span>
                </div>
              )}
              <div className={`group flex flex-col ${m.mine ? 'items-end' : 'items-start'}`}>
                {showAuthor && (
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-1 mt-1">
                    {m.authorName}
                    {roleLabel && <span className="font-normal text-slate-500"> · {roleLabel}</span>}
                  </span>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                    m.deleted
                      ? 'italic text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700'
                      : m.mine
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {m.deleted ? 'Zpráva byla smazána.' : m.text}
                </div>
                <div className="flex items-center gap-1 px-1 text-[0.6875rem] text-slate-500 dark:text-slate-400">
                  <time dateTime={m.createdAt}>{formatChatTime(m.createdAt)}</time>
                  {!m.deleted && m.mine && (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(m)}
                      aria-label="Smazat zprávu"
                      title="Smazat zprávu"
                      className="p-1 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                  {!m.deleted && !m.mine && !m.reportedByMe && (
                    <button
                      type="button"
                      onClick={() => setReportTarget(m)}
                      aria-label={`Nahlásit zprávu od ${m.authorName}`}
                      title="Nahlásit zprávu"
                      className="p-1 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                  {m.reportedByMe && !m.deleted && <span>· nahlášeno</span>}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="px-4 py-2 text-sm text-red-600 dark:text-red-400 border-t border-slate-200 dark:border-slate-800">
          {error}
        </p>
      )}

      <div className="border-t border-slate-200 dark:border-slate-800 p-3 flex items-end gap-2">
        <label htmlFor={composerId} className="sr-only">
          Napsat zprávu
        </label>
        <textarea
          id={composerId}
          value={text}
          maxLength={CHAT_MAX_TEXT}
          rows={1}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onComposerKeyDown}
          placeholder="Napište zprávu…"
          className="flex-1 min-w-0 resize-none max-h-40 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 field-sizing-content"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={sending || !text.trim()}
          aria-label="Odeslat zprávu"
          title="Odeslat (Enter)"
          className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>
      {text.length > CHAT_MAX_TEXT - 200 && (
        <p className="px-4 pb-2 -mt-1 text-xs text-slate-500">
          {text.length} / {CHAT_MAX_TEXT} znaků
        </p>
      )}

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        tone="danger"
        title="Smazat zprávu?"
        description="Zpráva zmizí všem v konverzaci. Místo ní uvidí „Zpráva byla smazána.“"
        confirmLabel="Smazat zprávu"
        isBusy={deleting}
        onConfirm={() => void doDelete()}
        onCancel={() => setConfirmDelete(null)}
      />
      {reportTarget && (
        <ReportMessageDialog
          message={reportTarget}
          onClose={() => setReportTarget(null)}
          onReported={() => {
            setReportTarget(null);
            void loadLatest();
          }}
        />
      )}
    </div>
  );
}
