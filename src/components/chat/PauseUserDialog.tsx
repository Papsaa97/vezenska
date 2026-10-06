import React, { useId, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ChatDialog from './ChatDialog';
import { CHAT_MAX_PAUSE_DAYS, pauseUser } from '../../utils/chat';

interface PauseUserDialogProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onPaused: () => void;
}

const DAY_OPTIONS = [1, 3, 7, 14, CHAT_MAX_PAUSE_DAYS];

function dayWord(days: number): string {
  if (days === 1) return 'den';
  if (days >= 2 && days <= 4) return 'dny';
  return 'dní';
}

/**
 * Pozastavení psaní do chatu (lektor, správce). Uživatel dál čte, ale nepíše;
 * do kdy a proč uvidí v chatu i ve zvonku.
 */
export default function PauseUserDialog({ userId, userName, onClose, onPaused }: PauseUserDialogProps) {
  const daysId = useId();
  const reasonId = useId();
  const [days, setDays] = useState<number>(3);
  const [reason, setReason] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !busy && reason.trim().length >= 3;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    const res = await pauseUser(userId, days, reason.trim());
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    onPaused();
  };

  return (
    <ChatDialog
      title="Pozastavit psaní do chatu"
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
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Pozastavit
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <strong>{userName}</strong> bude konverzace dál číst, ale nenapíše, nezaloží novou a nepošle přílohu. Do kdy
          a proč, uvidí v chatu i ve zvonku. Zbytek aplikace mu zůstane.
        </p>
        <div>
          <label htmlFor={daysId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Na jak dlouho
          </label>
          <select
            id={daysId}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DAY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} {dayWord(d)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={reasonId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Důvod (uvidí ho)
          </label>
          <textarea
            id={reasonId}
            value={reason}
            maxLength={500}
            rows={3}
            onChange={(e) => setReason(e.target.value)}
            placeholder="např. opakovaně nevhodné zprávy spolužákům"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
