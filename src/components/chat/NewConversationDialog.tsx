import React, { useEffect, useId, useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import ChatDialog from './ChatDialog';
import PeoplePicker from './PeoplePicker';
import {
  CHAT_MAX_GROUP_MEMBERS,
  CHAT_MAX_GROUP_NAME,
  ChatClassOption,
  ChatPerson,
  createGroup,
  fetchClassOptions,
  fetchClassPeople,
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
  const classSelectId = useId();
  const [classes, setClasses] = useState<ChatClassOption[]>([]);
  const [classPick, setClassPick] = useState<string>('');
  const [classBusy, setClassBusy] = useState<boolean>(false);
  const [classNote, setClassNote] = useState<string | null>(null);
  const [selected, setSelected] = useState<ChatPerson[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isGroup = selected.length >= 2;
  const tooMany = selected.length > CHAT_MAX_GROUP_MEMBERS - 1;
  const canSubmit = !busy && selected.length > 0 && !tooMany && (!isGroup || groupName.trim().length > 0);

  // Celou třídu může vybrat vyučující, správce a vedení třídy (velitel, zástupce).
  // Server vrátí jen třídy, které volající smí vybrat; ostatním prázdný seznam.
  useEffect(() => {
    let alive = true;
    void fetchClassOptions().then((list) => {
      if (!alive) return;
      setClasses(list);
      if (list.length > 0) setClassPick(list[0].name);
    });
    return () => {
      alive = false;
    };
  }, []);

  const addClass = async () => {
    if (!classPick || classBusy) return;
    setClassBusy(true);
    setClassNote(null);
    const res = await fetchClassPeople(classPick);
    setClassBusy(false);
    if (res.error || !res.data) {
      setClassNote(res.error ?? 'Třídu se nepodařilo načíst.');
      return;
    }
    const people = res.data;
    let skipped = 0;
    setSelected((prev) => {
      const known = new Set(prev.map((p) => p.id));
      const next = [...prev];
      for (const person of people) {
        if (known.has(person.id)) continue;
        if (next.length >= CHAT_MAX_GROUP_MEMBERS - 1) {
          skipped += 1;
          continue;
        }
        next.push(person);
        known.add(person.id);
      }
      return next;
    });
    if (people.length === 0) {
      setClassNote(`Ve třídě ${classPick} teď není nikdo, komu můžete napsat.`);
    } else if (skipped > 0) {
      setClassNote(`Skupina má limit ${CHAT_MAX_GROUP_MEMBERS} členů, ${skipped} lidí se už nevešlo.`);
    } else {
      setClassNote(`Přidáno z třídy ${classPick}: ${people.length}.`);
    }
    if (!groupName.trim()) setGroupName(`Třída ${classPick}`);
  };

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
        {classes.length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
            <label htmlFor={classSelectId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Vybrat celou třídu
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                id={classSelectId}
                value={classPick}
                onChange={(e) => setClassPick(e.target.value)}
                className="flex-1 min-w-[8rem] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {classes.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void addClass()}
                disabled={classBusy || !classPick}
                className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {classBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Users className="w-4 h-4" aria-hidden="true" />
                )}
                Přidat všechny
              </button>
            </div>
            {classNote && (
              <p role="status" className="text-xs text-slate-600 dark:text-slate-300">
                {classNote}
              </p>
            )}
          </div>
        )}
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
