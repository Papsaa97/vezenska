import React, { useId } from 'react';
import { Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VscrRegulation } from '../../data/vscrRegulationsRegistry';

interface LegalEditorModalProps {
  showEditorModal: boolean;
  editingRegulation: Partial<VscrRegulation> | null;
  setShowEditorModal: (v: boolean) => void;
  setEditingRegulation: React.Dispatch<React.SetStateAction<Partial<VscrRegulation> | null>>;
  handleSaveRegulation: () => void;
}

export default function LegalEditorModal({
  showEditorModal,
  editingRegulation,
  setShowEditorModal,
  setEditingRegulation,
  handleSaveRegulation,
}: LegalEditorModalProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  return (
    <AnimatePresence>
      {showEditorModal && editingRegulation && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/70 backdrop-blur-xs"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditorModal(false); }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
          >
            <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base sm:text-lg font-bold">
                  {editingRegulation.code ? `Úprava předpisu: ${editingRegulation.code}` : 'Přidat nový předpis / směrnici'}
                </h3>
              </div>
              <button
                onClick={() => setShowEditorModal(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-lg font-light"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-y] p-3 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-0`}>Číslo / Kód předpisu *</label>
                  <input
                    id={`${fieldIds}-0`}
                    type="text"
                    placeholder="např. NGŘ č. 33/2019 nebo Zákon č. 555/1992 Sb."
                    value={editingRegulation.code || ''}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-1`}>Zkrácený název *</label>
                  <input
                    id={`${fieldIds}-1`}
                    type="text"
                    placeholder="např. NGŘ o eskortách a střežení"
                    value={editingRegulation.shortTitle || ''}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, shortTitle: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-2`}>Úplný oficiální název *</label>
                <input
                  id={`${fieldIds}-2`}
                  type="text"
                  placeholder="Celý název předpisu..."
                  value={editingRegulation.title || ''}
                  onChange={(e) => setEditingRegulation(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-3`}>Typ předpisu</label>
                  <select
                    id={`${fieldIds}-3`}
                    value={editingRegulation.type || 'ngr'}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, type: e.target.value as VscrRegulation['type'] }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="zakon">Zákon (Sb.)</option>
                    <option value="vyhlaska">Vyhláška MS ČR</option>
                    <option value="ngr">Nařízení GŘ (NGŘ)</option>
                    <option value="instrukce">Instrukce / Justiční stráž</option>
                    <option value="ustava_mezinarodni">Mezinárodní úmluva</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-4`}>Vydavatel</label>
                  <input
                    id={`${fieldIds}-4`}
                    type="text"
                    placeholder="např. Generální ředitelství VS ČR"
                    value={editingRegulation.authority || ''}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, authority: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-5`}>Důležitost pro ZOP</label>
                  <select
                    id={`${fieldIds}-5`}
                    value={editingRegulation.importanceForZOP || 'Vysoký'}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, importanceForZOP: e.target.value as VscrRegulation['importanceForZOP'] }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Klíčový (ZOP A)">Klíčový (ZOP A)</option>
                    <option value="Velmi vysoký">Velmi vysoký</option>
                    <option value="Vysoký">Vysoký</option>
                    <option value="Informační">Informační</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-6`}>Oficiální URL odkaz (e-Sbírka / portál)</label>
                <input
                  id={`${fieldIds}-6`}
                  type="url"
                  placeholder="https://e-sbirka.gov.cz/sb/..."
                  value={editingRegulation.officialUrl || ''}
                  onChange={(e) => setEditingRegulation(prev => ({ ...prev, officialUrl: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-7`}>Stručná charakteristika &amp; rozsah úpravy</label>
                <textarea
                  id={`${fieldIds}-7`}
                  rows={2}
                  placeholder="Co tento předpis řeší v praxi..."
                  value={editingRegulation.scope || ''}
                  onChange={(e) => setEditingRegulation(prev => ({ ...prev, scope: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-8`}>
                  Plné znění předpisu (Text pro čtení a vyhledávání)
                </label>
                <textarea
                  id={`${fieldIds}-8`}
                  rows={6}
                  placeholder="Zde vložte kompletní nebo výňatkové znění předpisu..."
                  value={editingRegulation.fullLegalText || ''}
                  onChange={(e) => setEditingRegulation(prev => ({ ...prev, fullLegalText: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-950">
              <button
                onClick={() => setShowEditorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Zrušit
              </button>
              <button
                onClick={handleSaveRegulation}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Uložit do databáze
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
