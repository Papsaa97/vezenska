import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, BellOff, Flag, Info, Loader2, Paperclip, Pencil, Reply, Send, Trash2, Users, X } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import FileViewerModal from '../common/FileViewerModal';
import ReportMessageDialog from './ReportMessageDialog';
import { AttachmentBlock, OpenFileHandler, SharedItemCard } from './MessageExtras';
import { StudyMaterial, formatFileSize } from '../../utils/materials';
import {
  CHAT_ATTACHMENT_ACCEPT,
  CHAT_ATTACHMENT_HINT,
  CHAT_EDIT_MINUTES,
  CHAT_MAX_FILES_AT_ONCE,
  CHAT_MAX_TEXT,
  CHAT_ROLE_LABEL,
  ChatConversation,
  ChatMessage,
  ChatMyPause,
  announceChatChanged,
  blockUser,
  canEditMessage,
  checkAttachment,
  deleteMessage,
  editMessage,
  fetchMessages,
  formatChatDeadline,
  formatChatTime,
  markRead,
  removeAttachment,
  sendMessage,
  splitMessageLinks,
  uploadAttachment,
  withAttachmentName,
} from '../../utils/chat';

interface ConversationViewProps {
  conversation: ChatConversation;
  /** Zpět na seznam (jen na telefonu, kde se seznam a konverzace střídají). */
  onBack: () => void;
  onOpenInfo: () => void;
  /** Pozastavené psaní přihlášeného (vyučující, migrace 056), jinak null. */
  myPause: ChatMyPause | null;
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

/** Text zprávy s klikacími odkazy http(s); odkaz se otevře v nové kartě. */
function MessageText({ text, mine }: { text: string; mine: boolean }) {
  return (
    <>
      {splitMessageLinks(text).map((part, i) =>
        part.kind === 'link' ? (
          <a
            // Úseky vznikají z neměnného textu, pořadí jako klíč stačí.
            key={i}
            href={part.text}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={`underline underline-offset-2 break-all ${mine ? 'decoration-white/70' : 'text-indigo-700 dark:text-indigo-300'}`}
          >
            {part.text}
          </a>
        ) : (
          <React.Fragment key={i}>{part.text}</React.Fragment>
        )
      )}
    </>
  );
}

/** Krátký úryvek zprávy pro citaci nad odpovědí nebo úpravou. */
function quoteOf(m: ChatMessage): string {
  const text = m.text.trim();
  if (text) return text.length > 140 ? `${text.slice(0, 139)}…` : text;
  if (m.attachment) return `Příloha: ${m.attachment.name}`;
  if (m.share) return `Sdílí: ${m.share.nazev}`;
  return '';
}

/** Id prvku zprávy v konverzaci (cíl skoku z citace). */
function messageElementId(conversationId: string, messageId: string): string {
  return `zprava-${conversationId}-${messageId}`;
}

/** Nese přetahovaná věc soubor (ne třeba označený text)? */
function dragHasFiles(event: DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files');
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
export default function ConversationView({ conversation, onBack, onOpenInfo, myPause }: ConversationViewProps) {
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
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  /** Při odesílání více souborů: kolikátý právě odchází. */
  const [sendProgress, setSendProgress] = useState<{ done: number; total: number } | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [unblocking, setUnblocking] = useState<boolean>(false);
  /** Zpráva zvýrazněná po skoku z citace. */
  const [highlightId, setHighlightId] = useState<string | null>(null);
  /** Čas posledního načtení — podle něj mizí tlačítko „Upravit“ po 15 minutách. */
  const [now, setNow] = useState<number>(() => Date.now());
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [viewer, setViewer] = useState<{ material: StudyMaterial; bucket: string } | null>(null);
  /** První zpráva, která byla při otevření nepřečtená (před ní čára „Nové zprávy“). */
  const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  /** Uživatel je u konce konverzace — nová zpráva ho má posunout dolů. */
  const stickToBottomRef = useRef<boolean>(true);
  /** Výška obsahu před načtením starších zpráv (aby obraz neposkočil). */
  const restoreFromHeightRef = useRef<number | null>(null);
  /** Po prvním načtení posunout na čáru „Nové zprávy“ místo na konec. */
  const scrollToDividerRef = useRef<boolean>(false);
  /** Kolik zpráv bylo nepřečtených při otevření (číslo ze seznamu konverzací). */
  const unreadAtOpenRef = useRef<number>(conversation.unread);
  const lastMarkedRef = useRef<string | null>(null);
  const firstLoadRef = useRef<boolean>(true);

  const conversationId = conversation.id;

  const loadLatest = useCallback(async () => {
    const res = await fetchMessages(conversationId);
    setLoading(false);
    setNow(Date.now());
    if (res.error || !res.data) {
      setError(res.error);
      return;
    }
    setError(null);
    const latest = res.data;
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      setHasOlder(latest.length >= PAGE_SIZE);
      // Nepřečtené jsou vždy ty nejnovější cizí zprávy (server počítá cizí,
      // nesmazané zprávy po posledním přečtení).
      const unread = unreadAtOpenRef.current;
      const others = latest.filter((m) => !m.mine && !m.deleted);
      if (unread > 0 && others.length > 0) {
        setFirstUnreadId(others[Math.max(0, others.length - unread)].id);
        scrollToDividerRef.current = true;
      }
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
      // Vlastní zprávu označil za přečtenou už server při odeslání.
      if (!newest.mine) {
        const marked = await markRead(conversationId);
        if (!marked.error) announceChatChanged();
      }
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
    if (scrollToDividerRef.current && dividerRef.current) {
      scrollToDividerRef.current = false;
      el.scrollTop += dividerRef.current.getBoundingClientRect().top - el.getBoundingClientRect().top - 8;
      stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      return;
    }
    if (stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [newestId, messages.length, firstUnreadId]);

  // Obrázek se načte až po vykreslení a obsah naroste: kdo byl u konce
  // konverzace, zůstane u konce (jinak by poslední zprávu měl schovanou).
  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (stickToBottomRef.current && !scrollToDividerRef.current) el.scrollTop = el.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

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

  const openFile: OpenFileHandler = (material, bucket) => setViewer({ material, bucket });

  /**
   * Soubory z výběru, ze schránky nebo přetažené: ověřit a připravit
   * k odeslání. Každý pak odejde jako samostatná zpráva.
   */
  const acceptFiles = (files: File[]) => {
    if (editing) {
      setError('Během úpravy zprávy nejde přikládat soubory.');
      return;
    }
    const problems: string[] = [];
    const ok: File[] = [];
    for (const file of files) {
      const invalid = checkAttachment(file);
      if (invalid) problems.push(`${file.name}: ${invalid}`);
      else ok.push(file);
    }
    setPendingFiles((prev) => {
      const room = CHAT_MAX_FILES_AT_ONCE - prev.length;
      if (ok.length > room) {
        problems.push(`Naráz jde poslat nejvýš ${CHAT_MAX_FILES_AT_ONCE} souborů; další se nepřiložily.`);
      }
      return [...prev, ...ok.slice(0, Math.max(0, room))];
    });
    setError(problems.length > 0 ? problems.join(' ') : null);
  };

  const pickFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    // Stejný soubor jde vybrat znovu jen s vynulovanou hodnotou.
    event.target.value = '';
    if (files.length > 0) acceptFiles(files);
  };

  const onComposerPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Snímek obrazovky (Ctrl+V) se přiloží jako soubor. Kopie z Wordu nese
    // vedle textu i obrázek textu — tehdy se vloží jen text.
    const file = event.clipboardData.files[0];
    if (!file || event.clipboardData.getData('text/plain') || sending || !canWrite) return;
    event.preventDefault();
    acceptFiles(Array.from(event.clipboardData.files).map(withAttachmentName));
  };

  // Přetažený soubor: posluchač níže volá vždy nejnovější verzi (stav `sending`).
  const dropFilesRef = useRef<(files: FileList) => void>(() => undefined);
  useEffect(() => {
    dropFilesRef.current = (files) => {
      if (files.length === 0 || sending || !canWrite) return;
      acceptFiles(Array.from(files).map(withAttachmentName));
    };
  });

  // Přetažení souboru myší do konverzace. Je to pohodlí navíc pro počítač —
  // z klávesnice a na telefonu slouží sponka a vložení ze schránky — proto
  // posluchače přímo na prvku, ne obslužné atributy, které by z obalu
  // konverzace dělaly ovládací prvek bez role.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onDragOver = (event: DragEvent) => {
      if (!dragHasFiles(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      setDragOver(true);
    };
    const onDragLeave = (event: DragEvent) => {
      // Přechod na vnořený prvek není odchod z konverzace.
      if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
      setDragOver(false);
    };
    const onDrop = (event: DragEvent) => {
      if (!dragHasFiles(event)) return;
      event.preventDefault();
      setDragOver(false);
      if (event.dataTransfer) dropFilesRef.current(event.dataTransfer.files);
    };
    root.addEventListener('dragover', onDragOver);
    root.addEventListener('dragleave', onDragLeave);
    root.addEventListener('drop', onDrop);
    return () => {
      root.removeEventListener('dragover', onDragOver);
      root.removeEventListener('dragleave', onDragLeave);
      root.removeEventListener('drop', onDrop);
    };
  }, []);

  const finishSend = async () => {
    setError(null);
    setText('');
    setPendingFiles([]);
    setReplyTo(null);
    setEditing(null);
    stickToBottomRef.current = true;
    await loadLatest();
    announceChatChanged();
  };

  const saveEdit = async (target: ChatMessage) => {
    const trimmed = text.trim();
    if (trimmed === target.text.trim()) {
      setEditing(null);
      setText('');
      return;
    }
    setSending(true);
    const res = await editMessage(target.id, trimmed);
    setSending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    await finishSend();
  };

  const send = async () => {
    const trimmed = text.trim();
    if (sending || !canWrite) return;
    if (editing) {
      await saveEdit(editing);
      return;
    }
    if (!trimmed && pendingFiles.length === 0) return;
    setSending(true);
    const reply = replyTo?.id;
    if (pendingFiles.length === 0) {
      const res = await sendMessage(conversationId, trimmed, reply ? { replyTo: reply } : undefined);
      setSending(false);
      if (res.error) {
        setError(res.error);
        return;
      }
      await finishSend();
      return;
    }

    // Každý soubor = jedna zpráva. Popisek a odpověď nese první z nich.
    const files = pendingFiles;
    for (let i = 0; i < files.length; i += 1) {
      setSendProgress({ done: i, total: files.length });
      const upload = await uploadAttachment(conversationId, files[i]);
      let failure = upload.error;
      if (!failure && upload.data) {
        const res = await sendMessage(conversationId, i === 0 ? trimmed : '', {
          attachment: upload.data,
          replyTo: i === 0 ? reply : undefined,
        });
        // Zpráva se neodeslala: nahraný soubor by v úložišti zůstal bez užitku.
        if (res.error) {
          void removeAttachment(upload.data.path);
          failure = res.error;
        }
      }
      if (failure) {
        setSending(false);
        setSendProgress(null);
        // Odeslané soubory z fronty zmizí, zbytek zůstane k dalšímu pokusu.
        setPendingFiles(files.slice(i));
        if (i > 0) {
          setText('');
          setReplyTo(null);
        }
        setError(i > 0 ? `Odeslalo se ${i} z ${files.length} souborů. ${failure}` : failure);
        await loadLatest();
        announceChatChanged();
        return;
      }
    }
    setSending(false);
    setSendProgress(null);
    await finishSend();
  };

  const startReply = (m: ChatMessage) => {
    setEditing(null);
    setReplyTo(m);
    document.getElementById(composerId)?.focus();
  };

  const startEdit = (m: ChatMessage) => {
    setReplyTo(null);
    setPendingFiles([]);
    setEditing(m);
    setText(m.text);
    document.getElementById(composerId)?.focus();
  };

  const cancelEdit = () => {
    setEditing(null);
    setText('');
  };

  /** Skok z citace na původní zprávu (je-li načtená). */
  const jumpTo = (messageId: string) => {
    const el = document.getElementById(messageElementId(conversationId, messageId));
    if (!el) {
      setError(
        hasOlder
          ? 'Původní zpráva je starší. Načtěte starší zprávy nahoře a zkuste to znovu.'
          : 'Původní zpráva už v konverzaci není.'
      );
      return;
    }
    el.scrollIntoView({ block: 'center' });
    setHighlightId(messageId);
    window.setTimeout(() => setHighlightId((cur) => (cur === messageId ? null : cur)), 2500);
  };

  const unblock = async () => {
    if (!conversation.otherUserId) return;
    setUnblocking(true);
    const res = await blockUser(conversation.otherUserId, false);
    setUnblocking(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(null);
    announceChatChanged();
  };

  const onComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter odešle, Shift+Enter zalomí řádek. Při skládání znaků (IME) nic.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
    // Esc zruší rozepsanou odpověď nebo úpravu.
    if (event.key === 'Escape' && (replyTo || editing)) {
      event.preventDefault();
      if (editing) cancelEdit();
      else setReplyTo(null);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const target = confirmDelete;
    const res = await deleteMessage(target.id);
    setDeleting(false);
    setConfirmDelete(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    // Soubor zmizí i z úložiště. Drží-li zprávu otevřené nahlášení, server
    // smazání odmítne a soubor zůstane moderátorům.
    if (target.attachment) void removeAttachment(target.attachment.path);
    if (replyTo?.id === target.id) setReplyTo(null);
    if (editing?.id === target.id) cancelEdit();
    await loadLatest();
    announceChatChanged();
  };

  const blockedNotice =
    conversation.blocked === 'ja'
      ? 'Tohoto člověka jste zablokovali. Nenapíše vám a vy jemu také ne.'
      : conversation.blocked === 'druhy'
        ? 'Tomuto člověku teď nemůžete napsat.'
        : null;
  const canWrite = !myPause && !blockedNotice;

  // Poslední vlastní zpráva: pod ní se ukáže „Přečteno“.
  let lastOwnId: string | null = null;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].mine && !messages[i].deleted) {
      lastOwnId = messages[i].id;
      break;
    }
  }

  const subtitle = conversation.isGroup
    ? `Skupina · ${conversation.memberCount} ${memberWord(conversation.memberCount)}`
    : conversation.otherUserRole
      ? CHAT_ROLE_LABEL[conversation.otherUserRole] ?? null
      : null;

  return (
    <div ref={rootRef} className="relative flex flex-col h-full min-h-0">
      {dragOver && canWrite && (
        <div className="absolute inset-0 z-10 m-2 flex items-center justify-center rounded-2xl border-2 border-dashed border-indigo-400 bg-white/90 dark:bg-slate-900/90 text-sm font-semibold text-indigo-700 dark:text-indigo-300 pointer-events-none">
          Pusťte soubory a přiloží se ke zprávě
        </div>
      )}
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
        className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div ref={contentRef} className="space-y-1">
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
                {m.id === firstUnreadId && (
                  <div ref={dividerRef} className="flex items-center gap-2 py-2">
                    <span className="flex-1 h-px bg-indigo-200 dark:bg-indigo-900" aria-hidden="true" />
                    <span className="text-[0.6875rem] font-semibold text-indigo-700 dark:text-indigo-300">Nové zprávy</span>
                    <span className="flex-1 h-px bg-indigo-200 dark:bg-indigo-900" aria-hidden="true" />
                  </div>
                )}
                <div
                  id={messageElementId(conversationId, m.id)}
                  className={`group flex flex-col rounded-xl ${m.mine ? 'items-end' : 'items-start'} ${
                    highlightId === m.id ? 'bg-amber-100/70 dark:bg-amber-500/15' : ''
                  }`}
                >
                  {showAuthor && (
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-1 mt-1">
                      {m.authorName}
                      {roleLabel && <span className="font-normal text-slate-500"> · {roleLabel}</span>}
                    </span>
                  )}
                  {!m.deleted && m.replyTo && (
                    <button
                      type="button"
                      onClick={() => jumpTo(m.replyTo?.id ?? '')}
                      aria-label={`Odpověď na zprávu od ${m.replyTo.authorName}: ${m.replyTo.preview}. Přejít na ni.`}
                      className={`max-w-[85%] sm:max-w-[70%] mb-0.5 text-left rounded-xl border-l-4 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800`}
                    >
                      <span className="block font-semibold text-slate-600 dark:text-slate-300">{m.replyTo.authorName}</span>
                      <span className="block text-slate-500 dark:text-slate-400 truncate">{m.replyTo.preview}</span>
                    </button>
                  )}
                  {!m.deleted && m.attachment && (
                    <div className={`w-full flex mb-0.5 ${m.mine ? 'justify-end' : 'justify-start'}`}>
                      <AttachmentBlock attachment={m.attachment} onOpenFile={openFile} />
                    </div>
                  )}
                  {!m.deleted && m.share && (
                    <div className={`w-full flex mb-0.5 ${m.mine ? 'justify-end' : 'justify-start'}`}>
                      <SharedItemCard share={m.share} onOpenFile={openFile} />
                    </div>
                  )}
                  {!m.deleted && m.removedAttachmentName && (
                    <p className="max-w-[85%] sm:max-w-[70%] mb-0.5 px-3 py-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs italic text-slate-500 dark:text-slate-400">
                      Příloha „{m.removedAttachmentName}“ byla po 12 měsících smazána.
                    </p>
                  )}
                  {(m.deleted || m.text.trim() !== '') && (
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                        m.deleted
                          ? 'italic text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700'
                          : m.mine
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {m.deleted ? 'Zpráva byla smazána.' : <MessageText text={m.text} mine={m.mine} />}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1 px-1 text-[0.6875rem] text-slate-500 dark:text-slate-400">
                    <time dateTime={m.createdAt}>{formatChatTime(m.createdAt)}</time>
                    {!m.deleted && m.editedAt && <span title={`Upraveno ${formatChatTime(m.editedAt)}`}>· upraveno</span>}
                    {m.id === lastOwnId && m.recipientCount !== null && m.readCount !== null && m.recipientCount > 0 && (
                      conversation.isGroup ? (
                        <span>· Přečetlo {m.readCount} z {m.recipientCount}</span>
                      ) : (
                        m.readCount > 0 && <span>· Přečteno</span>
                      )
                    )}
                    {!m.deleted && canWrite && (
                      <button
                        type="button"
                        onClick={() => startReply(m)}
                        aria-label={`Odpovědět na zprávu od ${m.mine ? 'vás' : m.authorName}`}
                        title="Odpovědět"
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                    {canWrite && canEditMessage(m, now) && m.text.trim() !== '' && (
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        aria-label="Upravit zprávu"
                        title={`Upravit (do ${CHAT_EDIT_MINUTES} minut od odeslání)`}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
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
      </div>

      {error && (
        <p role="alert" className="px-4 py-2 text-sm text-red-600 dark:text-red-400 border-t border-slate-200 dark:border-slate-800">
          {error}
        </p>
      )}

      {!canWrite ? (
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 text-sm text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-3">
          {myPause ? (
            <p>
              Psaní do chatu máte pozastavené do <strong>{formatChatDeadline(myPause.until)}</strong>. Důvod:{' '}
              {myPause.reason}. Konverzace můžete dál číst.
            </p>
          ) : (
            <>
              <p className="flex-1 min-w-0">{blockedNotice}</p>
              {conversation.blocked === 'ja' && (
                <button
                  type="button"
                  onClick={() => void unblock()}
                  disabled={unblocking}
                  className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                >
                  Odblokovat
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          {(replyTo || editing) && (
            <div className="border-t border-slate-200 dark:border-slate-800 px-3 pt-2 flex">
              <div className="flex items-start gap-2 max-w-full w-full rounded-xl border-l-4 border-indigo-400 bg-slate-50 dark:bg-slate-800/60 pl-3 pr-1 py-1.5 text-xs">
                {editing ? (
                  <Pencil className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                ) : (
                  <Reply className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                )}
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-slate-700 dark:text-slate-200">
                    {editing
                      ? 'Upravujete zprávu'
                      : replyTo?.mine
                        ? 'Odpovídáte na svou zprávu'
                        : `Odpovídáte: ${replyTo?.authorName ?? ''}`}
                  </span>
                  {replyTo && !editing && (
                    <span className="block truncate text-slate-500 dark:text-slate-400">{quoteOf(replyTo)}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => (editing ? cancelEdit() : setReplyTo(null))}
                  disabled={sending}
                  aria-label={editing ? 'Zrušit úpravu zprávy' : 'Zrušit odpověď'}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {pendingFiles.length > 0 && (
            <ul
              aria-label="Přiložené soubory"
              className={`${replyTo || editing ? '' : 'border-t border-slate-200 dark:border-slate-800 '}px-3 pt-2 flex flex-wrap gap-1.5`}
            >
              {pendingFiles.map((file, index) => (
                <li
                  // Stejný soubor jde přiložit dvakrát; pořadí rozliší.
                  key={`${index}-${file.name}-${file.size}`}
                  className="flex items-center gap-2 max-w-full rounded-xl bg-slate-100 dark:bg-slate-800 pl-3 pr-1 py-1 text-xs text-slate-700 dark:text-slate-200"
                >
                  <Paperclip className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate font-semibold max-w-[12rem]">{file.name}</span>
                  <span className="text-slate-500 shrink-0">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== index))}
                    disabled={sending}
                    aria-label={`Odebrat přílohu ${file.name}`}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div
            className={`${pendingFiles.length > 0 || replyTo || editing ? '' : 'border-t border-slate-200 dark:border-slate-800 '}p-3 flex items-end gap-2`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={CHAT_ATTACHMENT_ACCEPT}
              onChange={pickFiles}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || editing !== null}
              aria-label="Přiložit soubory"
              title={`Přiložit soubory, nejvýš ${CHAT_MAX_FILES_AT_ONCE} naráz (${CHAT_ATTACHMENT_HINT})`}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
            >
              <Paperclip className="w-4 h-4" aria-hidden="true" />
            </button>
            <label htmlFor={composerId} className="sr-only">
              {editing ? 'Upravit zprávu' : 'Napsat zprávu'}
            </label>
            <textarea
              id={composerId}
              value={text}
              maxLength={CHAT_MAX_TEXT}
              rows={1}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onComposerKeyDown}
              onPaste={onComposerPaste}
              placeholder={
                editing
                  ? 'Upravte zprávu…'
                  : pendingFiles.length > 0
                    ? 'Přidejte popisek (nepovinné)…'
                    : 'Napište zprávu…'
              }
              className="flex-1 min-w-0 resize-none max-h-40 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 field-sizing-content"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending || (!text.trim() && pendingFiles.length === 0 && !(editing && editing.attachment))}
              aria-label={editing ? 'Uložit úpravu' : 'Odeslat zprávu'}
              title={editing ? 'Uložit úpravu (Enter)' : 'Odeslat (Enter)'}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {sendProgress && (
            <p className="px-4 pb-2 -mt-1 text-xs text-slate-500" aria-live="polite">
              Odesílám soubor {sendProgress.done + 1} z {sendProgress.total}…
            </p>
          )}
          {text.length > CHAT_MAX_TEXT - 200 && (
            <p className="px-4 pb-2 -mt-1 text-xs text-slate-500">
              {text.length} / {CHAT_MAX_TEXT} znaků
            </p>
          )}
        </>
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
      <FileViewerModal
        material={viewer?.material ?? null}
        bucket={viewer?.bucket}
        isOpen={viewer !== null}
        onClose={() => setViewer(null)}
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
