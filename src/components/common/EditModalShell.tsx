import React, { useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

export const EDIT_INPUT_CLASS =
  'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50';

export const EDIT_LABEL_CLASS = 'block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5';

interface EditModalShellProps {
  isOpen: boolean;
  title: string;
  icon: React.ReactNode;
  saving: boolean;
  errorMsg: string | null;
  saveLabel: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

/**
 * Rám formuláře pro úpravu obsahu záložky (zbraň, závada, jídelníček).
 * Drží přístupnost dialogu (useDialog), hlavičku, chybu a tlačítka.
 */
export default function EditModalShell({
  isOpen,
  title,
  icon,
  saving,
  errorMsg,
  saveLabel,
  onClose,
  onSubmit,
  children,
}: EditModalShellProps) {
  const titleId = useId();
  const dialogRef = useDialog<HTMLDivElement>({ isOpen, onClose, closeOnEscape: !saving });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
                  {icon}
                </div>
                <h2 id={titleId} className="font-bold text-slate-900 dark:text-white">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Zavřít formulář"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
              {children}

              {errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors cursor-pointer"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saveLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
