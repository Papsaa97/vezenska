import React, { useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

export type NoticeTone = 'error' | 'info' | 'success';

export interface Notice {
  tone: NoticeTone;
  title: string;
  /** Co se stalo a co s tím. Vlastní uzly kvůli zvýraznění v textu. */
  description: React.ReactNode;
}

interface NoticeDialogProps {
  /** `null` znamená zavřeno — stav se drží jako jedna proměnná. */
  notice: Notice | null;
  onClose: () => void;
  /** Text zavíracího tlačítka. Výchozí „Rozumím“. */
  closeLabel?: string;
}

const TONE_STYLES: Record<NoticeTone, { icon: React.ElementType; badge: string; button: string }> = {
  error: {
    icon: AlertTriangle,
    badge: 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    button: 'bg-rose-600 hover:bg-rose-500',
  },
  info: {
    icon: Info,
    badge: 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    button: 'bg-blue-600 hover:bg-blue-500',
  },
  success: {
    icon: CheckCircle2,
    badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    button: 'bg-emerald-600 hover:bg-emerald-500',
  },
};

/**
 * Oznamovací dialog aplikace — náhrada za `window.alert()`.
 *
 * PROČ: `alert()` v PWA v režimu standalone vypadá jako systémové hlášení
 * s názvem domény, blokuje vlákno, nedá se stylovat ani přeložit a na iOS ho
 * uživatel může trvale potlačit — pak chybová hlášení prostě nedojdou.
 * Nejhorší ale byl obsah: hlášení chodila jako `alert('Smazání selhalo: ' +
 * error.message)`, tedy surová věta z Postgresu do očí studentovi.
 *
 * Dialog drží fokus uvnitř (useDialog), zavírá se Escapem a vrací fokus tam,
 * odkud se otevřel. Sourozenec `ConfirmDialog` je pro otázky, tento pro
 * oznámení — má jediné tlačítko a nic nerozhoduje.
 */
export default function NoticeDialog({ notice, onClose, closeLabel = 'Rozumím' }: NoticeDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: notice !== null, onClose });

  const styles = TONE_STYLES[notice?.tone ?? 'info'];
  const Icon = styles.icon;

  return (
    <AnimatePresence>
      {notice && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 no-print">
          <div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="alertdialog"
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
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.badge}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-base font-bold text-slate-900 dark:text-white">
                  {notice.title}
                </h2>
                <div
                  id={descriptionId}
                  className="mt-1.5 text-sm leading-relaxed break-words text-slate-600 dark:text-slate-300"
                >
                  {notice.description}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-5 py-4 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className={`rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors ${styles.button}`}
              >
                {closeLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
