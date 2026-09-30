import React, { useId } from 'react';
import { Edit3, FileText, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VscrRegulation } from '../../data/vscrRegulationsRegistry';
import { formatFileSize } from '../../utils/materials';
import { REGULATION_DOC_ACCEPT } from '../../utils/regulationDocuments';
import { useDialog } from '../../hooks/useDialog';
import { REGULATION_TYPE_LABELS, REGULATION_TYPE_ORDER, formatIsoDate } from './legalCompassLabels';

interface LegalEditorModalProps {
  showEditorModal: boolean;
  editingRegulation: Partial<VscrRegulation> | null;
  /**
   * Zakládá se nový předpis? Dřív se to hádalo z prázdného kódu — lektor,
   * který kód u existujícího předpisu smazal, viděl nadpis „Přidat nový“.
   */
  isNew: boolean;
  setShowEditorModal: (v: boolean) => void;
  setEditingRegulation: React.Dispatch<React.SetStateAction<Partial<VscrRegulation> | null>>;
  handleSaveRegulation: () => void;
  /** Probíhá ukládání (a případně nahrávání souboru)? */
  busy: boolean;
  /** Soubor vybraný k nahrání; nahraje se až při uložení. */
  pendingFile: File | null;
  setPendingFile: (file: File | null) => void;
  /** Id předpisu, který ukládaný předpis nahrazuje ('' = žádný). */
  replacesId: string;
  setReplacesId: (id: string) => void;
  /** Předpisy, které lze označit jako nahrazené (platné, kromě upravovaného). */
  replaceableRegulations: VscrRegulation[];
}

const INPUT_CLASS =
  'w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function LegalEditorModal({
  showEditorModal,
  editingRegulation,
  isNew,
  setShowEditorModal,
  setEditingRegulation,
  handleSaveRegulation,
  busy,
  pendingFile,
  setPendingFile,
  replacesId,
  setReplacesId,
  replaceableRegulations,
}: LegalEditorModalProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  // Escape, past na fokus a jeho návrat — viz hooks/useDialog.
  const dialogRef = useDialog<HTMLDivElement>({
    isOpen: showEditorModal && editingRegulation !== null,
    onClose: () => setShowEditorModal(false),
  });

  return (
    <AnimatePresence>
      {showEditorModal && editingRegulation && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
          {/* Ztmavené pozadí je dekorace: klik na něj dialog zavře, ale pro
              odečítač obrazovky neexistuje a klávesnice má Escape (useDialog).
              Proto je oddělené od samotného dialogu a označené aria-hidden. */}
          <div
            aria-hidden="true"
            onClick={() => setShowEditorModal(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${fieldIds}-title`}
            tabIndex={-1}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
          >
            <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {isNew ? (
                  <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
                ) : (
                  <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
                )}
                <h3 id={`${fieldIds}-title`} className="text-base sm:text-lg font-bold truncate">
                  {isNew
                    ? 'Přidat předpis'
                    : `Úprava předpisu${editingRegulation.code ? `: ${editingRegulation.code}` : ''}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                aria-label="Zavřít editor předpisu"
                title="Zavřít (Esc)"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
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
                    className={INPUT_CLASS}
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
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-2`}>Úplný název *</label>
                <input
                  id={`${fieldIds}-2`}
                  type="text"
                  placeholder="Celý název předpisu…"
                  value={editingRegulation.title || ''}
                  onChange={(e) => setEditingRegulation(prev => ({ ...prev, title: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-3`}>Typ předpisu</label>
                  <select
                    id={`${fieldIds}-3`}
                    value={editingRegulation.type || 'ngr'}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, type: e.target.value as VscrRegulation['type'] }))}
                    className={INPUT_CLASS}
                  >
                    {REGULATION_TYPE_ORDER.map((type) => (
                      <option key={type} value={type}>
                        {REGULATION_TYPE_LABELS[type]}
                      </option>
                    ))}
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
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-5`}>Důležitost pro ZOP</label>
                  <select
                    id={`${fieldIds}-5`}
                    value={editingRegulation.importanceForZOP || 'Vysoký'}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, importanceForZOP: e.target.value as VscrRegulation['importanceForZOP'] }))}
                    className={INPUT_CLASS}
                  >
                    <option value="Klíčový (ZOP A)">Klíčový (ZOP A)</option>
                    <option value="Velmi vysoký">Velmi vysoký</option>
                    <option value="Vysoký">Vysoký</option>
                    <option value="Informační">Informační</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-6`}>Odkaz na e-Sbírku</label>
                <input
                  id={`${fieldIds}-6`}
                  type="url"
                  placeholder="https://e-sbirka.gov.cz/sb/..."
                  value={editingRegulation.officialUrl || ''}
                  onChange={(e) => setEditingRegulation(prev => ({ ...prev, officialUrl: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-7`}>Stručná charakteristika &amp; rozsah úpravy</label>
                <textarea
                  id={`${fieldIds}-7`}
                  rows={2}
                  placeholder="Co tento předpis řeší v praxi…"
                  value={editingRegulation.scope || ''}
                  onChange={(e) => setEditingRegulation(prev => ({ ...prev, scope: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>

              {/* Aktuálnost předpisu. NGŘ nejsou v e-Sbírce, takže platnost
                  za lektora nikdo jiný nehlídá. */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-9`}>Účinnost od</label>
                  <input
                    id={`${fieldIds}-9`}
                    type="text"
                    placeholder="např. 1. 3. 2026"
                    value={editingRegulation.effectiveFrom || ''}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-10`}>Poslední změna</label>
                  <input
                    id={`${fieldIds}-10`}
                    type="text"
                    placeholder="např. NGŘ č. 8/2022"
                    value={editingRegulation.lastAmendment || ''}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, lastAmendment: e.target.value || undefined }))}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-11`}>Stav</label>
                  <select
                    id={`${fieldIds}-11`}
                    value={editingRegulation.status === 'zruseny' ? 'zruseny' : 'platny'}
                    onChange={(e) =>
                      setEditingRegulation(prev => ({
                        ...prev,
                        status: e.target.value === 'zruseny' ? 'zruseny' : 'platny',
                      }))
                    }
                    className={INPUT_CLASS}
                  >
                    <option value="platny">Platný</option>
                    <option value="zruseny">Zrušený</option>
                  </select>
                </div>
              </div>

              {editingRegulation.status === 'zruseny' && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-12`}>Nahrazen předpisem</label>
                  <input
                    id={`${fieldIds}-12`}
                    type="text"
                    placeholder="např. NGŘ č. 14/2026"
                    value={editingRegulation.replacedBy || ''}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, replacedBy: e.target.value || undefined }))}
                    className={INPUT_CLASS}
                  />
                </div>
              )}

              {replaceableRegulations.length > 0 && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-13`}>Nahrazuje předpis</label>
                  <select
                    id={`${fieldIds}-13`}
                    value={replacesId}
                    onChange={(e) => setReplacesId(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    <option value="">Nic nenahrazuje</option>
                    {replaceableRegulations.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.code} – {reg.shortTitle}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[0.6875rem] text-slate-500 dark:text-slate-400">
                    Vybraný předpis se po uložení označí jako zrušený a u něj se ukáže odkaz na tento.
                  </p>
                </div>
              )}

              {/* Text předpisu jako soubor */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  Text předpisu (PDF nebo Word)
                </p>
                {editingRegulation.document ? (
                  <p className="text-slate-600 dark:text-slate-400">
                    Nahráno: <strong>{editingRegulation.document.fileName}</strong>
                    {' '}({formatFileSize(editingRegulation.document.size)}
                    {editingRegulation.document.uploadedAt ? `, ${formatIsoDate(editingRegulation.document.uploadedAt)}` : ''})
                  </p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">Zatím není nahraný žádný soubor.</p>
                )}
                <label className="font-semibold text-slate-700 dark:text-slate-300 block" htmlFor={`${fieldIds}-14`}>
                  {editingRegulation.document ? 'Nahradit novějším zněním' : 'Nahrát soubor'}
                </label>
                <input
                  id={`${fieldIds}-14`}
                  type="file"
                  accept={REGULATION_DOC_ACCEPT}
                  onChange={(e) => {
                    setPendingFile(e.target.files?.[0] ?? null);
                    e.target.value = '';
                  }}
                  className="block w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-300 file:font-semibold"
                />
                {pendingFile && (
                  <p className="text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <span>Po uložení se nahraje: {pendingFile.name} ({formatFileSize(pendingFile.size)})</span>
                    <button
                      type="button"
                      onClick={() => setPendingFile(null)}
                      className="underline cursor-pointer"
                    >
                      Zrušit výběr
                    </button>
                  </p>
                )}
                <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400">
                  Soubor uvidí každý přihlášený uživatel portálu. Starší nahrané znění se nemaže, zůstává
                  v historii předpisu.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-15`}>Co je potřeba doplnit nebo ověřit</label>
                <textarea
                  id={`${fieldIds}-15`}
                  rows={2}
                  placeholder="Zobrazí se u předpisu všem. Po doplnění poznámku smažte."
                  value={editingRegulation.reviewNote || ''}
                  onChange={(e) => setEditingRegulation(prev => ({ ...prev, reviewNote: e.target.value || undefined }))}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1" htmlFor={`${fieldIds}-8`}>
                  Studijní výběr ustanovení (text pro čtení a vyhledávání)
                </label>
                <textarea
                  id={`${fieldIds}-8`}
                  rows={6}
                  placeholder="Vložte ustanovení vybraná pro výuku. Znění z e-Sbírky se sem nepřepisuje, stahuje ho aplikace sama."
                  value={editingRegulation.fullLegalText || ''}
                  onChange={(e) => setEditingRegulation(prev => ({ ...prev, fullLegalText: e.target.value }))}
                  className={`${INPUT_CLASS} font-mono text-xs`}
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleSaveRegulation}
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-wait"
              >
                {busy ? (pendingFile ? 'Nahrávám…' : 'Ukládám…') : 'Uložit pro všechny'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
