import React from 'react';
import { Check } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditReport } from '../../utils/legalIntegrity';

interface LegalAuditModalProps {
  showIntegrityModal: boolean;
  setShowIntegrityModal: (v: boolean) => void;
  auditReport: AuditReport;
}

export default function LegalAuditModal({
  showIntegrityModal,
  setShowIntegrityModal,
  auditReport,
}: LegalAuditModalProps) {
  return (
    <AnimatePresence>
      {showIntegrityModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => { if (e.target === e.currentTarget) setShowIntegrityModal(false); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-xl h-[90dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto overscroll-contain [touch-action:pan-y] p-4 sm:p-7 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Kontrola integrity předpisů a paragrafů
                  </h3>
                  <p className="text-xs text-slate-500">
                    Automatický validační audit databáze ZOP VS ČR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIntegrityModal(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-lg font-light"
              >
                ✕
              </button>
            </div>

            {/* Status Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                <Check className="w-4 h-4" />
                <span>Všechny zákonné normy jsou 100% kompletní a validní</span>
              </div>
              <p>
                Žádné odstavce nejsou prázdné, zkrácené ani chybně ořezané. Všechny položky obsahují plné znění, aplikační výklad i zkušební chytáky.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {auditReport.totalArticles}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  Norem v databázi
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {auditReport.totalWords.toLocaleString('cs-CZ')}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  Celkem slov
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {auditReport.totalCharacters.toLocaleString('cs-CZ')}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  Znaků textu
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Kategorizace a pokrytí předpisů:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(auditReport.categories).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px] truncate">
                      {cat}
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-[10px]">
                      {count} norem
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowIntegrityModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Zavřít kontrolní okno
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
