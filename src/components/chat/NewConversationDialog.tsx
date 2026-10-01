import React, { useId, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ChatDialog from './ChatDialog';
import PeoplePicker from './PeoplePicker';
import {
  CHAT_MAX_GROUP_MEMBERS,
  CHAT_MAX_GROUP_NAME,
  ChatPerson,
  createGroup,
  openDirectConversation,
} from '../../utils/chat';

interface NewConversationDialogProps {
  onClose: () => void;
  onOpened: (conversationId: string) => void;
}

/**
 * Nová konverzace: jeden vybraný člověk = přímá konverzace (existuje-li,
 * otevře se ta stávající), dva a více = skupina s názvem.
 */
export default function NewConversationDialog({ onClose, onOpened }: NewConversationDialogProps) {
  const nameId = useId();
  const [selected, setSelected] = useState<ChatPerson[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isGroup = selected.length >= 2;
  const tooMany = selected.length > CHAT_MAX_GROUP_MEMBERS - 1;
  const canSubmit = !busy && selected.length > 0 && !tooMany && (!isGroup || groupName.trim().length > 0);

  const toggle = (person: ChatPerson) => {
    setSelected((prev) =>
      prev.some((p) => p.id === person.id) ? prev.filter((p) => p.id !== person.id) : [...prev, person]
    );
  };

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    const res = isGroup
      ? await createGroup(groupName.trim(), selected.map((p) => p.id))
      : await openDirectConversation(selected[0].id);
    setBusy(false);
    if (res.error || !res.data) {
      setError(res.error ?? 'Konverzaci se nepodařilo otevřít.');
      return;
    }
    onOpened(res.data);
  };

  return (
    <ChatDialog
      title="Nová konverzace"
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
            disabled={!canSubmit}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {isGroup ? 'Založit skupinu' : 'Otevřít konverzaci'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Vyberte jednoho člověka pro soukromou konverzaci, nebo více lidí pro skupinu.
        </p>
        <PeoplePicker selected={selected} onToggle={toggle} />
        {isGroup && (
          <div>
            <label htmlFor={nameId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Název skupiny
            </label>
            <input
              id={nameId}
              type="text"
              value={groupName}
              maxLength={CHAT_MAX_GROUP_NAME}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="např. Studijní skupina A11"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
        {tooMany && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Skupina může mít nejvýš {CHAT_MAX_GROUP_MEMBERS} členů včetně vás.
          </p>
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
