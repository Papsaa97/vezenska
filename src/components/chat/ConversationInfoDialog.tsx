import React, { useCallback, useEffect, useId, useState } from 'react';
import { BellOff, Loader2, LogOut, UserMinus, UserPlus } from 'lucide-react';
import ChatDialog from './ChatDialog';
import PeoplePicker from './PeoplePicker';
import ConfirmDialog from '../common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import {
  CHAT_MAX_GROUP_NAME,
  CHAT_ROLE_LABEL,
  ChatConversation,
  ChatMember,
  ChatPerson,
  fetchMembers,
  leaveGroup,
  setMuted,
  updateGroup,
} from '../../utils/chat';

interface ConversationInfoDialogProps {
  conversation: ChatConversation;
  onClose: () => void;
  /** Něco se změnilo (název, členové, ztlumení) — seznam se načte znovu. */
  onChanged: () => void;
  /** Uživatel ze skupiny odešel. */
  onLeft: () => void;
}

/**
 * Podrobnosti konverzace: členové, ztlumení a u skupiny správa (název,
 * přidání a odebrání členů — jen zakladatel) a odchod ze skupiny.
 */
export default function ConversationInfoDialog({
  conversation,
  onClose,
  onChanged,
  onLeft,
}: ConversationInfoDialogProps) {
  const { user } = useAuth();
  const nameId = useId();
  const muteId = useId();
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>(conversation.title);
  const [adding, setAdding] = useState<boolean>(false);
  const [toAdd, setToAdd] = useState<ChatPerson[]>([]);
  const [confirmLeave, setConfirmLeave] = useState<boolean>(false);
  const [muted, setMutedState] = useState<boolean>(conversation.muted);

  const load = useCallback(async () => {
    const res = await fetchMembers(conversation.id);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setMembers(res.data ?? []);
  }, [conversation.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (action: Promise<{ error: string | null }>): Promise<boolean> => {
    setBusy(true);
    setError(null);
    const res = await action;
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return false;
    }
    onChanged();
    return true;
  };

  const toggleMute = async () => {
    const next = !muted;
    if (await run(setMuted(conversation.id, next))) setMutedState(next);
  };

  const rename = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === conversation.title) return;
    await run(updateGroup(conversation.id, { name: trimmed }));
  };

  const addMembers = async () => {
    if (toAdd.length === 0) return;
    if (await run(updateGroup(conversation.id, { add: toAdd.map((p) => p.id) }))) {
      setToAdd([]);
      setAdding(false);
      await load();
    }
  };

  const removeMember = async (memberId: string) => {
    if (await run(updateGroup(conversation.id, { remove: [memberId] }))) await load();
  };

  const leave = async () => {
    if (await run(leaveGroup(conversation.id))) {
      setConfirmLeave(false);
      onLeft();
    } else {
      setConfirmLeave(false);
    }
  };

  const manage = conversation.isGroup && conversation.canManage;

  return (
    <>
      {/* Potvrzení odchodu nahradí dialog, ne překryje: dva dialogy s pastí
          na fokus by si ho přetahovaly. */}
      {!confirmLeave && (
      <ChatDialog title={conversation.isGroup ? 'Skupina' : 'Konverzace'} onClose={onClose} busy={busy}>
        <div className="space-y-5">
          {manage ? (
            <div>
              <label htmlFor={nameId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Název skupiny
              </label>
              <div className="flex gap-2">
                <input
                  id={nameId}
                  type="text"
                  value={name}
                  maxLength={CHAT_MAX_GROUP_NAME}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => void rename()}
                  disabled={busy || !name.trim() || name.trim() === conversation.title}
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                >
                  Přejmenovat
                </button>
              </div>
            </div>
          ) : (
            <p className="text-base font-semibold text-slate-900 dark:text-white">{conversation.title}</p>
          )}

          <div className="flex items-start gap-3">
            <input
              id={muteId}
              type="checkbox"
              checked={muted}
              disabled={busy}
              onChange={() => void toggleMute()}
              className="mt-0.5 w-4 h-4 accent-indigo-600"
            />
            <label htmlFor={muteId} className="text-sm text-slate-700 dark:text-slate-200">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <BellOff className="w-4 h-4" aria-hidden="true" /> Ztlumit
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Bez upozornění do zařízení a bez počítání do odznaku v hlavičce.
              </span>
            </label>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Členové{members.length > 0 ? ` (${members.length})` : ''}
            </h3>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Načítám…
              </div>
            ) : (
              <ul className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-slate-900 dark:text-slate-100 truncate">
                        {m.name}
                        {m.id === user?.id && <span className="text-slate-500 font-normal"> (vy)</span>}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {[
                          m.role ? CHAT_ROLE_LABEL[m.role] ?? m.role : null,
                          m.className,
                          conversation.isGroup && m.founder ? 'spravuje skupinu' : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    {manage && m.id !== user?.id && (
                      <button
                        type="button"
                        onClick={() => void removeMember(m.id)}
                        disabled={busy}
                        aria-label={`Odebrat ze skupiny: ${m.name}`}
                        title="Odebrat ze skupiny"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
                      >
                        <UserMinus className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {manage && !adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" /> Přidat členy
            </button>
          )}
          {manage && adding && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Noví členové uvidí i dřívější zprávy a přílohy skupiny.
              </p>
              <PeoplePicker
                selected={toAdd}
                excludeIds={members.map((m) => m.id)}
                onToggle={(p) =>
                  setToAdd((prev) => (prev.some((x) => x.id === p.id) ? prev.filter((x) => x.id !== p.id) : [...prev, p]))
                }
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setToAdd([]);
                  }}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  onClick={() => void addMembers()}
                  disabled={busy || toAdd.length === 0}
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer disabled:opacity-50"
                >
                  Přidat vybrané
                </button>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {conversation.isGroup && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmLeave(true)}
                disabled={busy}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" /> Opustit skupinu
              </button>
            </div>
          )}
        </div>
      </ChatDialog>
      )}
      <ConfirmDialog
        isOpen={confirmLeave}
        tone="danger"
        title="Opustit skupinu?"
        description={
          <>
            Skupina „{conversation.title}“ vám zmizí ze seznamu a nové zprávy už neuvidíte. Zpět vás může přidat
            jen ten, kdo skupinu spravuje.
          </>
        }
        confirmLabel="Opustit skupinu"
        isBusy={busy}
        onConfirm={() => void leave()}
        onCancel={() => setConfirmLeave(false)}
      />
    </>
  );
}
