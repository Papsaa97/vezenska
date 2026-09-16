import React, { useId } from 'react';
import { Check, AlertTriangle, Info, CheckCircle2, ShieldAlert, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditReport } from '../../utils/legalIntegrity';
import { useDialog } from '../../hooks/useDialog';

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
  const isValid = auditReport.valid;

  // Escape, past na fokus a jeho návrat — viz hooks/useDialog.
  const titleId = useId();
  const dialogRef = useDialog<HTMLDivElement>({
    isOpen: showIntegrityModal,
    onClose: () => setShowIntegrityModal(false),
  });

  const coverage = auditReport.regulationCoverage ?? [];
  // Předpisy s úředním zněním se řadí podle toho, kolik paragrafů výběru chybí.
  const porovnane = coverage
    .filter((c) => c.maUplneZneni)
    .slice()
    .sort((a, b) => b.chybejiciParagrafy.length - a.chybejiciParagrafy.length);
  // Předpisy bez úředního znění — u nich se o úplnosti nedá říct nic.
  const bezZneni = coverage.filter((c) => !c.maUplneZneni);
  const sectionIssues = auditReport.articleSectionIssues ?? [];

  return (
    <AnimatePresence>
      {showIntegrityModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* Ztmavené pozadí je dekorace: klik na něj dialog zavře, ale pro
              odečítač obrazovky neexistuje a klávesnice má Escape (useDialog).
              Proto je oddělené od samotného dialogu a označené aria-hidden. */}
          <div
            aria-hidden="true"
            onClick={() => setShowIntegrityModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-xl h-[90dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto overscroll-contain [touch-action:pan-y] p-4 sm:p-7 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={
                    isValid
                      ? 'p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  }
                >
                  {isValid ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div>
                  <h3 id={titleId} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Kontrola dat a porovnání s e-Sbírkou
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tvar dat Právního kompasu a pokrytí předpisů podle úředních znění
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Zavřít kontrolní okno"
                onClick={() => setShowIntegrityModal(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-lg font-light"
              >
                ✕
              </button>
            </div>

            {/* Status Banner — vychází ze skutečného výsledku kontroly */}
            {isValid ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <Check className="w-4 h-4" />
                  <span>Kontrola tvaru dat prošla bez nálezu</span>
                </div>
                <p>
                  U {auditReport.totalArticles} položek není prázdné ani podezřele krátké pole, text nekončí uprostřed věty a identifikátory jsou unikátní.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Nalezeno {auditReport.issues.length}{' '}
                    {auditReport.issues.length === 1 ? 'vada' : auditReport.issues.length < 5 ? 'vady' : 'vad'} v tvaru dat
                  </span>
                </div>
                <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {auditReport.issues.map((iss, i) => (
                    <li key={`${iss.id}-${iss.field}-${i}`} className="flex gap-1.5">
                      <span className="font-mono text-[10px] shrink-0 opacity-70">{iss.type}</span>
                      <span>
                        <strong>{iss.id}</strong> ({iss.field}): {iss.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Paragrafy, které úřední znění nezná — nejzávažnější nález */}
            {sectionIssues.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {sectionIssues.length}{' '}
                    {sectionIssues.length === 1 ? 'položka odkazuje' : 'položek odkazuje'} na paragraf, který
                    v platném znění není
                  </span>
                </div>
                <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {sectionIssues.map((iss) => (
                    <li key={iss.id}>
                      <strong>{iss.id}</strong> — {iss.actNumber}, uvedeno „{iss.section}“; e-Sbírka nezná{' '}
                      {iss.neznameParagrafy.join(', ')}.
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Porovnání s úředním zněním z e-Sbírky */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Pokrytí předpisu studijním výběrem</span>
                <a
                  href="https://e-sbirka.gov.cz/restful-api"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 normal-case"
                >
                  zdroj: e-Sbírka <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {porovnane.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Žádné úřední znění není stažené. Doplní ho příkaz <code>npm run sync:laws</code>.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {porovnane.map((c) => {
                    const podil = c.uredniParagrafu
                      ? Math.round((c.vyberParagrafu.length / c.uredniParagrafu) * 100)
                      : 0;
                    return (
                      <div
                        key={c.code}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                            {c.code}
                          </span>
                          <span
                            className={`shrink-0 font-bold px-1.5 py-0.5 rounded text-[10px] ${
                              podil >= 90
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {c.vyberParagrafu.length} z {c.uredniParagrafu} § ({podil} %)
                          </span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          Úřední znění č. {c.cisloZneni} účinné od {c.ucinnostOd}
                          {c.chybejiciParagrafy.length > 0 && (
                            <>
                              {' '}• ve výběru chybí {c.chybejiciParagrafy.length} §
                              {c.chybejiciParagrafy.length <= 12 && (
                                <> ({c.chybejiciParagrafy.join(', ')})</>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Co kontrola neověřuje — dřív tu stálo, že je vše "100% kompletní" */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                <Info className="w-3.5 h-3.5" />
                <span>Jak číst výsledek</span>
              </div>
              <p>
                Kontrola tvaru dat hlídá jen <strong>úplnost a čitelnost polí</strong>. O tom, jestli text
                odpovídá platnému znění, rozhoduje porovnání s e-Sbírkou výše — a to je porovnání seznamu
                paragrafů, ne doslovného znění vět. <strong>Studijní výběr je výběr</strong>: chybějící
                paragrafy nejsou vada, ale je dobré o nich vědět.
              </p>
              {bezZneni.length > 0 && (
                <p>
                  U těchto předpisů se úplnost porovnat nedá, protože se ve Sbírce zákonů nevyhlašují:{' '}
                  {bezZneni.map((c) => c.code).join(', ')}.
                </p>
              )}
              <p>
                Právně závazné je znění ve Sbírce zákonů; znění z e-Sbírky je informativní.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
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
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {auditReport.snapshotsAvailable}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  Úplných znění z e-Sbírky
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
