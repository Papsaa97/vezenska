import React, { useId, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ChatDialog from './ChatDialog';
import { ChatMessage, reportMessage } from '../../utils/chat';

interface ReportMessageDialogProps {
  message: ChatMessage;
  onClose: () => void;
  onReported: () => void;
}

const MAX_REASON = 500;

/** Nahlášení cizí zprávy lektorům a správci. */
export default function ReportMessageDialog({ message, onClose, onReported }: ReportMessageDialogProps) {
  const reasonId = useId();
  const [reason, setReason] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    setError(null);
    const res = await reportMessage(message.id, reason.trim());
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    onReported();
  };

  return (
    <ChatDialog
      title="Nahlásit zprávu"
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
            disabled={busy || !reason.trim()}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-500 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Nahlásit
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <blockquote className="text-sm text-slate-700 dark:text-slate-200 border-l-4 border-slate-300 dark:border-slate-600 pl-3 whitespace-pre-wrap break-words">
          <span className="block text-xs font-semibold text-slate-500 mb-1">{message.authorName}</span>
          {message.text}
        </blockquote>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Zprávu uvidí lektoři a správce (jen tuto zprávu, ne celou konverzaci) a mohou ji skrýt. Autor se nedozví,
          kdo ji nahlásil.
        </p>
        <div>
          <label htmlFor={reasonId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Proč zprávu hlásíte
          </label>
          <textarea
            id={reasonId}
            value={reason}
            maxLength={MAX_REASON}
            rows={3}
            onChange={(e) => setReason(e.target.value)}
            placeholder="např. urážky, obtěžování, nevhodný obsah"
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
