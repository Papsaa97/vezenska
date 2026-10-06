import React, { useEffect, useId, useMemo, useState } from 'react';
import { Check, Loader2, Search, Users } from 'lucide-react';
import ChatDialog from './ChatDialog';
import PeoplePicker from './PeoplePicker';
import {
  CHAT_MAX_TEXT,
  ChatConversation,
  ChatPerson,
  fetchConversations,
  openDirectConversation,
  sendMessage,
} from '../../utils/chat';
import { CHAT_SHARE_LABEL, ChatShare } from '../../utils/chatShare';
import { foldSearchText } from '../../utils/searchText';

interface ShareToChatDialogProps {
  share: ChatShare;
  onClose: () => void;
}

/**
 * Poslání věci z aplikace (soubor z Knihovny, otázka, předpis, článek) do
 * existující konverzace, nebo někomu, s kým uživatel ještě nepíše.
 */
export default function ShareToChatDialog({ share, onClose }: ShareToChatDialogProps) {
  const searchId = useId();
  const noteId = useId();
  const groupName = useId();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [pickPerson, setPickPerson] = useState<boolean>(false);
  const [person, setPerson] = useState<ChatPerson | null>(null);
  const [note, setNote] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    let active = true;
    void fetchConversations().then((res) => {
      if (!active) return;
      setLoading(false);
      if (res.error) {
        setError(res.error);
        return;
      }
      // Do zablokované soukromé konverzace psát nejde, proto ji nenabízíme.
      const list = (res.data ?? []).filter((c) => c.blocked === null);
      setConversations(list);
      if (list.length === 0) setPickPerson(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const q = foldSearchText(search).trim();
    return q ? conversations.filter((c) => foldSearchText(c.title).includes(q)) : conversations;
  }, [conversations, search]);

  const canSend = !busy && (pickPerson ? person !== null : targetId !== null);

  const submit = async () => {
    if (!canSend) return;
    setBusy(true);
    setError(null);
    let conversationId = targetId;
    let title = conversations.find((c) => c.id === targetId)?.title ?? '';
    if (pickPerson && person) {
      const opened = await openDirectConversation(person.id);
      if (opened.error || !opened.data) {
        setBusy(false);
        setError(opened.error ?? 'Konverzaci se nepodařilo otevřít.');
        return;
      }
      conversationId = opened.data;
      title = person.name;
    }
    if (!conversationId) {
      setBusy(false);
      return;
    }
    const res = await sendMessage(conversationId, note.trim(), { share });
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSent({ id: conversationId, title });
  };

  if (sent) {
    return (
      <ChatDialog
        title="Odesláno"
        onClose={onClose}
        footer={
          <>
            <a
              href={`#chat/${sent.id}`}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Otevřít chat
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
            >
              Hotovo
            </button>
          </>
        }
      >
        <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200" role="status">
          <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          Posláno do konverzace {sent.title}.
        </p>
      </ChatDialog>
    );
  }

  return (
    <ChatDialog
      title="Poslat do chatu"
      onClose={onClose}
      busy={busy}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canSend}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Odeslat
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
          <div className="text-[0.6875rem] font-semibold text-slate-500 dark:text-slate-400">{CHAT_SHARE_LABEL[share.druh]}</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{share.nazev}</div>
        </div>

        {pickPerson ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">Komu to poslat?</p>
            <PeoplePicker
              selected={person ? [person] : []}
              onToggle={(p) => setPerson((prev) => (prev?.id === p.id ? null : p))}
            />
            {conversations.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setPickPerson(false);
                  setPerson(null);
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Zpět na mé konverzace
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor={searchId} className="sr-only">
              Hledat konverzaci
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id={searchId}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hledat konverzaci…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Načítám konverzace…
              </div>
            ) : (
              <fieldset className="max-h-60 overflow-y-auto space-y-1">
                <legend className="sr-only">Konverzace</legend>
                {visible.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-2">Žádná konverzace neodpovídá hledání.</p>
                )}
                {visible.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border ${
                      targetId === c.id
                        ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/40'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name={groupName}
                      checked={targetId === c.id}
                      onChange={() => setTargetId(c.id)}
                      className="accent-indigo-600"
                    />
                    <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                      {c.isGroup ? (
                        <Users className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <span className="text-xs font-bold" aria-hidden="true">
                          {c.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.title}</span>
                  </label>
                ))}
              </fieldset>
            )}
            <button
              type="button"
              onClick={() => {
                setPickPerson(true);
                setTargetId(null);
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Poslat někomu, s kým ještě nepíšete
            </button>
          </div>
        )}

        <div>
          <label htmlFor={noteId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Zpráva (nepovinné)
          </label>
          <textarea
            id={noteId}
            value={note}
            maxLength={CHAT_MAX_TEXT}
            rows={2}
            onChange={(e) => setNote(e.target.value)}
            placeholder="např. Podívej se na tohle před zkouškou."
            className="w-full resize-none px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </ChatDialog>
  );
}
