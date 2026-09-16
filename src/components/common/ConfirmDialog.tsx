import React, { useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

export type ConfirmTone = 'danger' | 'neutral';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  /** Vysvětlení, co se stane. Vlastní uzly kvůli zvýraznění v textu. */
  description: React.ReactNode;
  /** Text potvrzovacího tlačítka — pojmenuj akci, ne „OK“. */
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  /** Probíhá akce — tlačítka se uzamknou. */
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Potvrzovací dialog aplikace — náhrada za `window.confirm()`.
 *
 * PROČ: potvrzování bylo rozseté mezi nativní `confirm()` (30 míst) a vlastní
 * modály. Nativní dialog v PWA v režimu standalone vypadá jako systémové
 * hlášení s názvem domény, blokuje vlákno, nejde stylovat ani přeložit a na
 * iOS ho lze potlačit — pak se akce provede, nebo naopak neprovede, bez
 * jakékoli zpětné vazby. Navíc má vždy jen „OK / Zrušit“, takže hlášení typu
 * „smazat NEBO obnovit na výchozí?“ nešlo rozhodnout.
 *
 * Tenhle dialog má pojmenovaná tlačítka, drží fokus uvnitř (useDialog),
 * zavírá se Escapem a vrací fokus tam, odkud se otevřel.
 */
export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Zrušit',
  tone = 'neutral',
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useDialog<HTMLDivElement>({
    isOpen,
    onClose: () => {
      if (!isBusy) onCancel();
    },
  });

  const isDanger = tone === 'danger';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 no-print">
          <div
            aria-hidden="true"
            onClick={() => {
              if (!isBusy) onCancel();
            }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.16 }}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start gap-3 p-5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isDanger
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                }`}
              >
                {isDanger ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-base font-bold text-slate-900 dark:text-white">
                  {title}
                </h2>
                <div
                  id={descriptionId}
                  className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  {description}
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                disabled={isBusy}
                aria-label="Zavřít dialog"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end dark:border-slate-800">
              <button
                type="button"
                onClick={onCancel}
                disabled={isBusy}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isBusy}
                className={`rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-60 ${
                  isDanger
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {isBusy ? 'Pracuji…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
