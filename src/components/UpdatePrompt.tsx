import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, X, ArrowUpCircle } from 'lucide-react';
import { useServiceWorkerUpdate } from '../registerServiceWorker';

/**
 * Nabídne uživateli přechod na novou verzi aplikace.
 *
 * Aktualizace se nevnucuje. Nový Service Worker čeká ve stavu `waiting` až do
 * potvrzení — kdyby převzal řízení sám, běžící stránce by zmizely soubory staré
 * verze z mezipaměti a rozpadla by se klidně uprostřed rozdělaného testu.
 *
 * Odložení je jen na tuto relaci: příště se nabídka objeví znovu, protože verze
 * s opravami se k uživateli dostat musí.
 */
export default function UpdatePrompt() {
  const { updateReady, applyUpdate } = useServiceWorkerUpdate();
  const [dismissed, setDismissed] = useState(false);
  const [applying, setApplying] = useState(false);

  const handleApply = () => {
    setApplying(true);
    applyUpdate();
  };

  return (
    <AnimatePresence>
      {updateReady && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-24 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-[22rem] z-[100] bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/70 rounded-2xl shadow-2xl p-4"
        >
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Zavřít nabídku aktualizace"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shrink-0">
              <ArrowUpCircle className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Je k dispozici nová verze
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Aplikace se aktualizuje po obnovení stránky. Rozdělaný test si předtím prosím dokončete —
                obnovení ho ukončí.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3.5">
            <button
              type="button"
              onClick={handleApply}
              disabled={applying}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-500/25"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${applying ? 'animate-spin' : ''}`} />
              {applying ? 'Aktualizuji…' : 'Aktualizovat teď'}
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Později
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
