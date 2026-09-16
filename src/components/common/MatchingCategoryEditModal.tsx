import React, { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Loader2, AlertCircle, LayoutGrid, Plus, Trash2 } from 'lucide-react';
import { MatchingCategory, MatchingDiagramPart, MatchingPair } from '../../types';
import { makeContentId } from '../../utils/contentLibrary';
import { useDialog } from '../../hooks/useDialog';

interface MatchingCategoryEditModalProps {
  category: MatchingCategory | null;
  isOpen: boolean;
  usedIds: string[];
  onClose: () => void;
  onSave: (category: MatchingCategory) => Promise<{ persisted: boolean; error: string | null }>;
}

const INPUT_CLASS =
  'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50';

function newPairId(index: number): string {
  return `pair-${Date.now().toString(36)}-${index}`;
}

/**
 * Formulář poznávačky.
 *
 * Klasická poznávačka je seznam dvojic (pojem ↔ vysvětlení). Diagram místo
 * toho popisuje obrázek — každá část má popisek a souřadnice v procentech
 * šířky a výšky obrázku, takže sedí na jakémkoli rozlišení.
 */
export default function MatchingCategoryEditModal({
  category,
  isOpen,
  usedIds,
  onClose,
  onSave,
}: MatchingCategoryEditModalProps) {
  const fieldIds = useId();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'classic' | 'diagram'>('classic');
  const [imageUrl, setImageUrl] = useState('');
  const [pairs, setPairs] = useState<MatchingPair[]>([]);
  const [parts, setParts] = useState<MatchingDiagramPart[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dialogRef = useDialog<HTMLDivElement>({ isOpen, onClose, closeOnEscape: !saving });

  useEffect(() => {
    if (!isOpen) return;
    setTitle(category?.title ?? '');
    setType(category?.type === 'diagram' ? 'diagram' : 'classic');
    setImageUrl(category?.imageUrl ?? '');
    setPairs(
      category?.pairs && category.pairs.length > 0
        ? category.pairs.map((p) => ({ ...p }))
        : [
            { id: newPairId(0), left: '', right: '' },
            { id: newPairId(1), left: '', right: '' },
          ]
    );
    setParts((category?.parts ?? []).map((p) => ({ ...p })));
    setErrorMsg(null);
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Název poznávačky nesmí zůstat prázdný.');
      return;
    }

    const cleanPairs = pairs
      .map((p) => ({ ...p, left: p.left.trim(), right: p.right.trim() }))
      .filter((p) => p.left && p.right);
    const cleanParts = parts
      .map((p) => ({ ...p, label: p.label.trim() }))
      .filter((p) => p.label);

    if (type === 'classic' && cleanPairs.length < 2) {
      setErrorMsg('Klasická poznávačka potřebuje aspoň dvě úplné dvojice.');
      return;
    }
    if (type === 'diagram') {
      if (!imageUrl.trim()) {
        setErrorMsg('Diagram potřebuje odkaz na obrázek.');
        return;
      }
      if (cleanParts.length < 2) {
        setErrorMsg('Diagram potřebuje aspoň dvě popsané části.');
        return;
      }
    }

    setSaving(true);
    setErrorMsg(null);

    const payload: MatchingCategory = {
      id: category?.id ?? makeContentId('poznavacka', title, usedIds),
      title: title.trim(),
      type,
      imageUrl: type === 'diagram' ? imageUrl.trim() : undefined,
      parts: type === 'diagram' ? cleanParts : undefined,
      // U diagramu se dvojice nepoužívají, ale typ je má povinné — prázdné pole
      // je správná hodnota, hra si vystačí s `parts`.
      pairs: type === 'diagram' ? [] : cleanPairs,
    };

    const result = await onSave(payload);
    setSaving(false);

    if (result.error) {
      setErrorMsg(result.error);
      return;
    }
    onClose();
  };

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
            aria-labelledby={`${fieldIds}-title`}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <h2 id={`${fieldIds}-title`} className="font-bold text-slate-900 dark:text-white">
                  {category ? 'Upravit poznávačku' : 'Nová poznávačka'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Zavřít formulář poznávačky"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    htmlFor={`${fieldIds}-nazev`}
                  >
                    Název poznávačky *
                  </label>
                  <input
                    id={`${fieldIds}-nazev`}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Například Donucovací prostředky a jejich zákonný podklad"
                    required
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    htmlFor={`${fieldIds}-typ`}
                  >
                    Typ
                  </label>
                  <select
                    id={`${fieldIds}-typ`}
                    value={type}
                    onChange={(e) => setType(e.target.value === 'diagram' ? 'diagram' : 'classic')}
                    className={INPUT_CLASS}
                  >
                    <option value="classic">Dvojice pojmů</option>
                    <option value="diagram">Popis obrázku</option>
                  </select>
                </div>
              </div>

              {type === 'diagram' && (
                <div>
                  <label
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    htmlFor={`${fieldIds}-obrazek`}
                  >
                    Odkaz na obrázek *
                  </label>
                  <input
                    id={`${fieldIds}-obrazek`}
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="/images/pistole-cz75.png"
                    className={INPUT_CLASS}
                  />
                </div>
              )}

              {type === 'classic' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Dvojice ({pairs.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPairs((prev) => [...prev, { id: newPairId(prev.length), left: '', right: '' }])
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Přidat dvojici
                    </button>
                  </div>

                  {pairs.map((pair, index) => (
                    <div key={pair.id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <label className="sr-only" htmlFor={`${fieldIds}-levy-${index}`}>
                          Pojem dvojice {index + 1}
                        </label>
                        <input
                          id={`${fieldIds}-levy-${index}`}
                          type="text"
                          value={pair.left}
                          onChange={(e) =>
                            setPairs((prev) =>
                              prev.map((p) => (p.id === pair.id ? { ...p, left: e.target.value } : p))
                            )
                          }
                          placeholder="Pojem"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="sr-only" htmlFor={`${fieldIds}-pravy-${index}`}>
                          Vysvětlení dvojice {index + 1}
                        </label>
                        <input
                          id={`${fieldIds}-pravy-${index}`}
                          type="text"
                          value={pair.right}
                          onChange={(e) =>
                            setPairs((prev) =>
                              prev.map((p) => (p.id === pair.id ? { ...p, right: e.target.value } : p))
                            )
                          }
                          placeholder="Vysvětlení nebo protějšek"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setPairs((prev) => prev.filter((p) => p.id !== pair.id))}
                        aria-label={`Smazat dvojici ${index + 1}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Části obrázku ({parts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setParts((prev) => [
                          ...prev,
                          {
                            id: `part-${Date.now().toString(36)}-${prev.length}`,
                            label: '',
                            top: 50,
                            left: 50,
                            labelTop: 50,
                            labelLeft: 20,
                          },
                        ])
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Přidat část
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Souřadnice jsou v procentech obrázku. „Bod" je místo na obrázku, „popisek"
                    je místo, kam se odkládá název — obvykle mimo střed, po kraji.
                  </p>

                  {parts.map((part, index) => (
                    <div
                      key={part.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="sr-only" htmlFor={`${fieldIds}-cast-${index}`}>
                            Popisek části {index + 1}
                          </label>
                          <input
                            id={`${fieldIds}-cast-${index}`}
                            type="text"
                            value={part.label}
                            onChange={(e) =>
                              setParts((prev) =>
                                prev.map((p) => (p.id === part.id ? { ...p, label: e.target.value } : p))
                              )
                            }
                            placeholder="Název části"
                            className={INPUT_CLASS}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setParts((prev) => prev.filter((p) => p.id !== part.id))}
                          aria-label={`Smazat část ${index + 1}`}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {([
                          ['top', 'Bod shora %'],
                          ['left', 'Bod zleva %'],
                          ['labelTop', 'Popisek shora %'],
                          ['labelLeft', 'Popisek zleva %'],
                        ] as const).map(([field, label]) => (
                          <div key={field}>
                            <label
                              className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
                              htmlFor={`${fieldIds}-${field}-${index}`}
                            >
                              {label}
                            </label>
                            <input
                              id={`${fieldIds}-${field}-${index}`}
                              type="number"
                              min={0}
                              max={100}
                              value={part[field] ?? 0}
                              onChange={(e) =>
                                setParts((prev) =>
                                  prev.map((p) =>
                                    p.id === part.id
                                      ? { ...p, [field]: Number(e.target.value) }
                                      : p
                                  )
                                )
                              }
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Uložit poznávačku
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
