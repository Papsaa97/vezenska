import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, RotateCcw, CheckCircle2, Trophy, Clock, Brain } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

interface LeitnerHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeitnerHelpModal({ isOpen, onClose }: LeitnerHelpModalProps) {
  // Vlastní obsluha Escape nahrazena sdíleným hookem — ten navíc drží fokus
  // uvnitř dialogu a po zavření ho vrátí tam, odkud se otevíral.
  const dialogRef = useDialog<HTMLDivElement>({ isOpen, onClose });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
          {/* Ztmavené pozadí je dekorace: klik na něj dialog zavře, ale pro
              odečítač obrazovky neexistuje a klávesnice má Escape (useDialog).
              Proto je oddělené od samotného dialogu a označené aria-hidden. */}
          <div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="leitner-help-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="leitner-help-title" className="text-base font-bold text-slate-900 dark:text-white">
                    Leitnerův systém rozloženého opakování
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Jak fungují krabičky (Box 1 až 5) a efektivní učení
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Zavřít nápovědu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Introduction */}
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                <p>
                  <strong>Leitnerův systém</strong> je metoda učení s rozloženým opakováním (<em>Spaced
                  Repetition</em>). Kartičky jsou roztříděny do <strong>5 krabiček (Box 1 až 5)</strong>{' '}
                  podle toho, jak spolehlivě si je pamatujete. Odpovíte-li správně, kartička jde
                  o krabičku výš a příště se ozve později; chyba ji vrátí do Boxu 1.
                </p>
                <p>
                  Odstupy níže <strong>hlídá aplikace za vás</strong>: u každé kartičky si pamatuje
                  datum posledního opakování a ty splatné shrne do fronty{' '}
                  <strong>„Ke zopakování dnes“</strong> v panelu krabiček. Nemusíte si tedy rozvrh
                  držet v hlavě — stačí každý den projít, co je ve frontě.
                </p>
              </div>

              {/* Box progression overview */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Přehled krabiček a intervalů
                </h3>

                <div className="grid gap-2 text-xs">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
                    <span className="px-2 py-1 rounded-md font-bold bg-rose-500 text-white shrink-0">Box 1</span>
                    <div className="flex-1">
                      <div className="font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Denní opakování
                      </div>
                      <div className="text-rose-800/80 dark:text-rose-300/80 text-[11px]">
                        Výchozí krabička. Nové pojmy a kartičky, ve kterých jste chybovali.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/20">
                    <span className="px-2 py-1 rounded-md font-bold bg-orange-500 text-white shrink-0">Box 2</span>
                    <div className="flex-1">
                      <div className="font-bold text-orange-950 dark:text-orange-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Po 3 dnech
                      </div>
                      <div className="text-orange-800/80 dark:text-orange-300/80 text-[11px]">
                        První úspěšné zopakování. Začátek upevňování znalosti.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
                    <span className="px-2 py-1 rounded-md font-bold bg-amber-500 text-white shrink-0">Box 3</span>
                    <div className="flex-1">
                      <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> 1× týdně
                      </div>
                      <div className="text-amber-800/80 dark:text-amber-300/80 text-[11px]">
                        Střednědobá retence. Otázky, které jste zvládli dvakrát za sebou.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
                    <span className="px-2 py-1 rounded-md font-bold bg-blue-500 text-white shrink-0">Box 4</span>
                    <div className="flex-1">
                      <div className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> 1× za 14 dní
                      </div>
                      <div className="text-blue-800/80 dark:text-blue-300/80 text-[11px]">
                        Pokročilá paměťová stopa. Důkladně zažité znalosti.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <span className="px-2 py-1 rounded-md font-bold bg-emerald-600 text-white shrink-0">Box 5</span>
                    <div className="flex-1">
                      <div className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" /> 1× měsíčně / Trvalá paměť
                      </div>
                      <div className="text-emerald-800/80 dark:text-emerald-300/80 text-[11px]">
                        Cíl výcviku! Kartičky jsou bezpečně zvládnuté a trvale uložené v paměti.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Movement Rules */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3 text-xs sm:text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  Klíčová pravidla posunu:
                </h4>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Při správné odpovědi ("Umím"):</strong> kartička se posouvá do vyšší krabičky s delším intervalem (např. z Boxu 1 do Boxu 2).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Při chybě ("Ještě neumím"):</strong> kartička se bez ohledu na aktuální pozici vrací zpět do <strong>Boxu 1</strong> na denní procvičování.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Hlavní cíl:</strong> Přesunout všechny otázky a pojmy postupně až do <strong>Boxu 5</strong> pro stoprocentní jistotu u zkoušky ZOP.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
              >
                Rozumím, pokračovat
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
