import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ChatDialog from './ChatDialog';
import {
  CHAT_ROLE_LABEL,
  ChatBlockedPerson,
  announceChatChanged,
  blockUser,
  fetchBlocked,
  formatChatTime,
} from '../../utils/chat';

interface BlockedPeopleDialogProps {
  onClose: () => void;
}

/** Lidé, které jsem zablokoval(a), s možností je odblokovat. */
export default function BlockedPeopleDialog({ onClose }: BlockedPeopleDialogProps) {
  const [people, setPeople] = useState<ChatBlockedPerson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetchBlocked();
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setPeople(res.data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unblock = async (person: ChatBlockedPerson) => {
    setBusyId(person.id);
    setError(null);
    const res = await blockUser(person.id, false);
    setBusyId(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    announceChatChanged();
    await load();
  };

  return (
    <ChatDialog title="Zablokovaní" onClose={onClose} busy={busyId !== null}>
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Zablokovaný člověk vám nenapíše do přímé konverzace a nepřidá vás do skupiny. Ve společné skupině jeho zprávy
          dál vidíte, jen vám z nich nechodí upozornění. O zablokování se nedozví, jen zjistí, že vám napsat nemůže.
        </p>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Načítám…
          </div>
        )}
        {!loading && people.length === 0 && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nikoho nemáte zablokovaného.</p>
        )}
        {people.length > 0 && (
          <ul className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
            {people.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="flex-1 min-w-0">
                  <span className="block font-medium text-slate-900 dark:text-slate-100 truncate">{p.name}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {[p.role ? CHAT_ROLE_LABEL[p.role] ?? p.role : null, p.className, `od ${formatChatTime(p.since)}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => void unblock(p)}
                  disabled={busyId !== null}
                  aria-label={`Odblokovat: ${p.name}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                >
                  {busyId === p.id ? 'Odblokovávám…' : 'Odblokovat'}
                </button>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </ChatDialog>
  );
}
