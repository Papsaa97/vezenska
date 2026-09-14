import React from 'react';
import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

interface DeleteConfirmModalProps {
  className: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  className,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  // Escape, past na fokus a jeho návrat po zavření — viz hooks/useDialog.
  const dialogRef = useDialog<HTMLDivElement>({
    isOpen: true,
    onClose: onCancel,
    closeOnEscape: !isDeleting,
  });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 mx-auto flex items-center justify-center">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 id="delete-confirm-title" className="text-base font-bold text-slate-900 dark:text-white">
            Smazat třídu {className}?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Tato akce odstraní kartu třídy, rozvrh, ústrojovou kázeň i všechny vypsané služby. Doporučeno
            při ukončení kurzu.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Zrušit
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/20 cursor-pointer"
          >
            {isDeleting ? 'Mažu…' : 'Ano, smazat'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
