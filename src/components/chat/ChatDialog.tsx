import React, { useId } from 'react';
import { X } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

interface ChatDialogProps {
  title: string;
  onClose: () => void;
  /** Probíhá akce — Escape ani křížek dialog nezavřou. */
  busy?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Jednotný rámec dialogů chatu: fokus uvnitř, Escape zavírá, klidný vzhled. */
export default function ChatDialog({ title, onClose, busy = false, children, footer }: ChatDialogProps) {
  const titleId = useId();
  const close = () => {
    if (!busy) onClose();
  };
  const ref = useDialog<HTMLDivElement>({ isOpen: true, onClose: close, closeOnEscape: !busy });

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 no-print">
      <div aria-hidden="true" onClick={close} className="absolute inset-0 bg-slate-900/60" />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full sm:max-w-lg max-h-[90dvh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 id={titleId} className="text-base font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            aria-label="Zavřít"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
