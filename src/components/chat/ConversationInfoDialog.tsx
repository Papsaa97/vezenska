import React, { useCallback, useEffect, useId, useState } from 'react';
import { BellOff, EyeOff, FileText, Loader2, LogOut, PauseCircle, UserMinus, UserPlus, UserX } from 'lucide-react';
import ChatDialog from './ChatDialog';
import PeoplePicker from './PeoplePicker';
import PauseUserDialog from './PauseUserDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import FileViewerModal from '../common/FileViewerModal';
import { AttachmentRow, OpenFileHandler, SharedItemCard } from './MessageExtras';
import { useAuth } from '../../context/AuthContext';
import type { StudyMaterial } from '../../utils/materials';
import {
  CHAT_MAX_GROUP_NAME,
  CHAT_ROLE_LABEL,
  ChatConversation,
  ChatFileItem,
  ChatMember,
  ChatPerson,
  blockUser,
  fetchBlocked,
  fetchConversationFiles,
  fetchMembers,
  formatChatTime,
  hideConversation,
  leaveGroup,
  setMuted,
  updateGroup,
} from '../../utils/chat';

const isStaffRole = (role: string | null) => role === 'lektor' || role === 'admin';

interface ConversationInfoDialogProps {
  conversation: ChatConversation;
  onClose: () => void;
  /** Něco se změnilo (název, členové, ztlumení) — seznam se načte znovu. */
  onChanged: () => void;
  /** Uživatel ze skupiny odešel, nebo konverzaci skryl. */
  onLeft: () => void;
}

type Confirm = { kind: 'leave' } | { kind: 'hide' } | { kind: 'block'; member: ChatMember };

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
  const { user, profile } = useAuth();
  const iAmStaff = isStaffRole(profile?.role ?? null);
  const nameId = useId();
  const muteId = useId();
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>(conversation.title);
  const [adding, setAdding] = useState<boolean>(false);
  const [toAdd, setToAdd] = useState<ChatPerson[]>([]);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [muted, setMutedState] = useState<boolean>(conversation.muted);
  /** Koho mám zablokovaného (null = nevím, chybí migrace 056). */
  const [blockedIds, setBlockedIds] = useState<Set<string> | null>(null);
  const [files, setFiles] = useState<ChatFileItem[] | null>(null);
  const [filesLoading, setFilesLoading] = useState<boolean>(false);
  const [viewer, setViewer] = useState<{ material: StudyMaterial; bucket: string } | null>(null);
  const [pauseTarget, setPauseTarget] = useState<ChatMember | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const openFile: OpenFileHandler = (material, bucket) => setViewer({ material, bucket });

  const load = useCallback(async () => {
    const [res, blocked] = await Promise.all([fetchMembers(conversation.id), fetchBlocked()]);
    setLoading(false);
    setBlockedIds(blocked.data ? new Set(blocked.data.map((b) => b.id)) : null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setMembers(res.data ?? []);
  }, [conversation.id]);

  const loadFiles = async () => {
    setFilesLoading(true);
    const res = await fetchConversationFiles(conversation.id);
    setFilesLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setFiles(res.data ?? []);
  };

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
    const ok = await run(leaveGroup(conversation.id));
    setConfirm(null);
    if (ok) onLeft();
  };

  const hide = async () => {
    const ok = await run(hideConversation(conversation.id, true));
    setConfirm(null);
    if (ok) onLeft();
  };

  const setBlocked = async (member: ChatMember, block: boolean) => {
    const ok = await run(blockUser(member.id, block));
    setConfirm(null);
    if (!ok) return;
    setBlockedIds((prev) => {
      const next = new Set(prev ?? []);
      if (block) next.add(member.id);
      else next.delete(member.id);
      return next;
    });
  };

  const runConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === 'leave') void leave();
    else if (confirm.kind === 'hide') void hide();
    else void setBlocked(confirm.member, true);
  };

  const manage = conversation.isGroup && conversation.canManage;

  return (
    <>
      {/* Potvrzení, prohlížeč souboru i pozastavení nahradí dialog, ne překryjí:
          dva dialogy s pastí na fokus by si ho přetahovaly. */}
      {!confirm && !viewer && !pauseTarget && (
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
                    {m.id !== user?.id && blockedIds !== null && !isStaffRole(m.role) && (
                      blockedIds.has(m.id) ? (
                        <button
                          type="button"
                          onClick={() => void setBlocked(m, false)}
                          disabled={busy}
                          aria-label={`Odblokovat: ${m.name}`}
                          className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                        >
                          Odblokovat
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirm({ kind: 'block', member: m })}
                          disabled={busy}
                          aria-label={`Zablokovat: ${m.name}`}
                          title="Zablokovat"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
                        >
                          <UserX className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )
                    )}
                    {iAmStaff && m.id !== user?.id && !isStaffRole(m.role) && (
                      <button
                        type="button"
                        onClick={() => setPauseTarget(m)}
                        disabled={busy}
                        aria-label={`Pozastavit psaní do chatu: ${m.name}`}
                        title="Pozastavit psaní do chatu"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10 cursor-pointer disabled:opacity-50"
                      >
                        <PauseCircle className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
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

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Soubory a sdílené věci{files && files.length > 0 ? ` (${files.length})` : ''}
            </h3>
            {files === null ? (
              <button
                type="button"
                onClick={() => void loadFiles()}
                disabled={filesLoading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
              >
                {filesLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileText className="w-4 h-4" aria-hidden="true" />
                )}
                Ukázat soubory konverzace
              </button>
            ) : files.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">V konverzaci zatím nejsou žádné soubory.</p>
            ) : (
              <ul className="space-y-2">
                {files.map((f) => (
                  <li key={f.messageId} className="rounded-xl border border-slate-200 dark:border-slate-800">
                    {f.attachment ? (
                      <AttachmentRow
                        attachment={f.attachment}
                        caption={`${f.authorName} · ${formatChatTime(f.createdAt)}`}
                        onOpenFile={openFile}
                      />
                    ) : (
                      f.share && (
                        <div className="p-1.5 space-y-1">
                          <p className="px-1 text-[0.6875rem] font-semibold text-slate-500 dark:text-slate-400">
                            {f.authorName} · {formatChatTime(f.createdAt)}
                          </p>
                          <SharedItemCard share={f.share} onOpenFile={openFile} />
                        </div>
                      )
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notice && (
            <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
            {!conversation.isGroup &&
              conversation.otherUserId &&
              blockedIds !== null &&
              !isStaffRole(conversation.otherUserRole) &&
              (blockedIds.has(conversation.otherUserId) ? (
                <button
                  type="button"
                  onClick={() => {
                    const other = members.find((m) => m.id === conversation.otherUserId);
                    if (other) void setBlocked(other, false);
                  }}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" aria-hidden="true" /> Odblokovat
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const other = members.find((m) => m.id === conversation.otherUserId);
                    if (other) setConfirm({ kind: 'block', member: other });
                  }}
                  disabled={busy || members.length === 0}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" aria-hidden="true" /> Zablokovat
                </button>
              ))}
            <button
              type="button"
              onClick={() => setConfirm({ kind: 'hide' })}
              disabled={busy}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
            >
              <EyeOff className="w-4 h-4" aria-hidden="true" /> Skrýt konverzaci
            </button>
            {conversation.isGroup && (
              <button
                type="button"
                onClick={() => setConfirm({ kind: 'leave' })}
                disabled={busy}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" /> Opustit skupinu
              </button>
            )}
          </div>
        </div>
      </ChatDialog>
      )}
      <ConfirmDialog
        isOpen={confirm !== null}
        tone="danger"
        title={
          confirm?.kind === 'leave'
            ? 'Opustit skupinu?'
            : confirm?.kind === 'hide'
              ? 'Skrýt konverzaci?'
              : `Zablokovat: ${confirm?.kind === 'block' ? confirm.member.name : ''}?`
        }
        description={
          confirm?.kind === 'leave' ? (
            <>
              Skupina „{conversation.title}“ vám zmizí ze seznamu a nové zprávy už neuvidíte. Zpět vás může přidat jen
              ten, kdo skupinu spravuje.
            </>
          ) : confirm?.kind === 'hide' ? (
            <>Konverzace zmizí ze seznamu, dokud do ní někdo nenapíše. Zprávy se nemažou.</>
          ) : (
            <>
              Nenapíše vám do přímé konverzace a nepřidá vás do skupiny. Ve společné skupině jeho zprávy dál uvidíte, jen
              vám z nich nepřijde upozornění. Odblokovat ho jde kdykoli v seznamu „Zablokovaní“.
            </>
          )
        }
        confirmLabel={confirm?.kind === 'leave' ? 'Opustit skupinu' : confirm?.kind === 'hide' ? 'Skrýt' : 'Zablokovat'}
        isBusy={busy}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
      <FileViewerModal
        material={viewer?.material ?? null}
        bucket={viewer?.bucket}
        isOpen={viewer !== null}
        onClose={() => setViewer(null)}
      />
      {pauseTarget && (
        <PauseUserDialog
          userId={pauseTarget.id}
          userName={pauseTarget.name}
          onClose={() => setPauseTarget(null)}
          onPaused={() => {
            setNotice(`${pauseTarget.name} má psaní do chatu pozastavené. Zrušit to jde v přehledu Nahlášené.`);
            setPauseTarget(null);
          }}
        />
      )}
    </>
  );
}
