import React, { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Loader2, AlertCircle, ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { Scenario, ScenarioChoice, ScenarioStep } from '../../data/scenariosData';
import { makeContentId } from '../../utils/contentLibrary';
import { useDialog } from '../../hooks/useDialog';

const CATEGORIES: Scenario['category'][] = [
  'Právo & Donucovací prostředky',
  'Mimořádné události & Zásah',
  'Eskorty & Střelba',
  'Vstupy & Justiční stráž',
];

const DIFFICULTIES: Scenario['difficulty'][] = ['Základní', 'Pokročilá', 'Expertní'];

const INPUT_CLASS =
  'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50';

interface ScenarioEditModalProps {
  scenario: Scenario | null;
  isOpen: boolean;
  usedIds: string[];
  onClose: () => void;
  onSave: (scenario: Scenario) => Promise<{ persisted: boolean; error: string | null }>;
}

function emptyChoice(seed: string): ScenarioChoice {
  return {
    id: `choice-${seed}`,
    text: '',
    isCorrect: false,
    feedback: '',
    legalBasis: '',
    nextStepId: undefined,
  };
}

function emptyStep(seed: string): ScenarioStep {
  return {
    id: `step-${seed}`,
    title: '',
    description: '',
    choices: [emptyChoice(`${seed}-a`), emptyChoice(`${seed}-b`)],
  };
}

/**
 * Formulář modelové situace.
 *
 * Situace je posloupnost kroků; každý krok nabízí volby a každá volba má
 * zpětnou vazbu i zákonný podklad. Správná volba buď odkáže na další krok,
 * nebo scénář ukončí — proto je u ní výběr „pokračovat krokem".
 */
export default function ScenarioEditModal({
  scenario,
  isOpen,
  usedIds,
  onClose,
  onSave,
}: ScenarioEditModalProps) {
  const fieldIds = useId();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Scenario['category']>(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState<Scenario['difficulty']>('Základní');
  const [badge, setBadge] = useState('');
  const [briefing, setBriefing] = useState('');
  const [steps, setSteps] = useState<ScenarioStep[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dialogRef = useDialog<HTMLDivElement>({ isOpen, onClose, closeOnEscape: !saving });

  useEffect(() => {
    if (!isOpen) return;
    setTitle(scenario?.title ?? '');
    setCategory(scenario?.category ?? CATEGORIES[0]);
    setDifficulty(scenario?.difficulty ?? 'Základní');
    setBadge(scenario?.badge ?? '');
    setBriefing(scenario?.briefing ?? '');
    setSteps(
      scenario?.steps && scenario.steps.length > 0
        ? scenario.steps.map((s) => ({ ...s, choices: s.choices.map((c) => ({ ...c })) }))
        : [emptyStep(Date.now().toString(36))]
    );
    setErrorMsg(null);
  }, [scenario, isOpen]);

  const updateStep = (stepId: string, patch: Partial<ScenarioStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...patch } : s)));
  };

  const updateChoice = (stepId: string, choiceId: string, patch: Partial<ScenarioChoice>) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? { ...s, choices: s.choices.map((c) => (c.id === choiceId ? { ...c, ...patch } : c)) }
          : s
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Název modelové situace nesmí zůstat prázdný.');
      return;
    }

    const cleanSteps: ScenarioStep[] = steps
      .map((step) => ({
        ...step,
        title: step.title.trim(),
        description: step.description.trim(),
        choices: step.choices
          .map((choice) => ({
            ...choice,
            text: choice.text.trim(),
            feedback: choice.feedback.trim(),
            legalBasis: choice.legalBasis.trim(),
          }))
          .filter((choice) => choice.text),
      }))
      .filter((step) => step.choices.length > 0);

    if (cleanSteps.length === 0) {
      setErrorMsg('Situace potřebuje aspoň jeden krok s vyplněnou volbou.');
      return;
    }

    const stepWithoutCorrect = cleanSteps.find((step) => !step.choices.some((c) => c.isCorrect));
    if (stepWithoutCorrect) {
      setErrorMsg(
        `Krok „${stepWithoutCorrect.title || stepWithoutCorrect.id}" nemá označenou správnou volbu — ` +
          'bez ní se ze situace nedá projít dál.'
      );
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload: Scenario = {
      id: scenario?.id ?? makeContentId('situace', title, usedIds),
      title: title.trim(),
      category,
      badge: badge.trim() || 'Modelová situace',
      difficulty,
      briefing: briefing.trim(),
      steps: cleanSteps,
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
            className="w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h2 id={`${fieldIds}-title`} className="font-bold text-slate-900 dark:text-white">
                  {scenario ? 'Upravit modelovou situaci' : 'Nová modelová situace'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Zavřít formulář modelové situace"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
              <div>
                <label
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                  htmlFor={`${fieldIds}-nazev`}
                >
                  Název situace *
                </label>
                <input
                  id={`${fieldIds}-nazev`}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Modelová situace: Podnapilá návštěva na vchodu"
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    htmlFor={`${fieldIds}-kategorie`}
                  >
                    Kategorie
                  </label>
                  <select
                    id={`${fieldIds}-kategorie`}
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Scenario['category'])}
                    className={INPUT_CLASS}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    htmlFor={`${fieldIds}-obtiznost`}
                  >
                    Obtížnost
                  </label>
                  <select
                    id={`${fieldIds}-obtiznost`}
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Scenario['difficulty'])}
                    className={INPUT_CLASS}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    htmlFor={`${fieldIds}-odznak`}
                  >
                    Předpis na odznaku
                  </label>
                  <input
                    id={`${fieldIds}-odznak`}
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="§ 17 z. 555/1992 Sb."
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                  htmlFor={`${fieldIds}-zadani`}
                >
                  Zadání situace
                </label>
                <textarea
                  id={`${fieldIds}-zadani`}
                  value={briefing}
                  onChange={(e) => setBriefing(e.target.value)}
                  rows={3}
                  placeholder="Jste velen jako strážný u hlavního vchodu do věznice…"
                  className={INPUT_CLASS}
                />
              </div>

              {/* Kroky */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Kroky situace ({steps.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSteps((prev) => [...prev, emptyStep(`${Date.now().toString(36)}-${prev.length}`)])
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Přidat krok
                  </button>
                </div>

                {steps.map((step, stepIndex) => (
                  <div
                    key={step.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {stepIndex + 1}
                      </span>
                      <div className="flex-1">
                        <label className="sr-only" htmlFor={`${fieldIds}-krok-${stepIndex}`}>
                          Název kroku {stepIndex + 1}
                        </label>
                        <input
                          id={`${fieldIds}-krok-${stepIndex}`}
                          type="text"
                          value={step.title}
                          onChange={(e) => updateStep(step.id, { title: e.target.value })}
                          placeholder="Název kroku"
                          className={INPUT_CLASS}
                        />
                      </div>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSteps((prev) => prev.filter((s) => s.id !== step.id))}
                          aria-label={`Smazat krok ${stepIndex + 1}`}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="sr-only" htmlFor={`${fieldIds}-popis-${stepIndex}`}>
                        Popis kroku {stepIndex + 1}
                      </label>
                      <textarea
                        id={`${fieldIds}-popis-${stepIndex}`}
                        value={step.description}
                        onChange={(e) => updateStep(step.id, { description: e.target.value })}
                        rows={2}
                        placeholder="Co se v tuhle chvíli děje a na co se frekventant rozhoduje"
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Volby ({step.choices.length})
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateStep(step.id, {
                              choices: [
                                ...step.choices,
                                emptyChoice(`${Date.now().toString(36)}-${step.choices.length}`),
                              ],
                            })
                          }
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          Přidat volbu
                        </button>
                      </div>

                      {step.choices.map((choice, choiceIndex) => (
                        <div
                          key={choice.id}
                          className={`p-3 rounded-xl border space-y-2 ${
                            choice.isCorrect
                              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <label
                                className="sr-only"
                                htmlFor={`${fieldIds}-volba-${stepIndex}-${choiceIndex}`}
                              >
                                Znění volby {choiceIndex + 1} v kroku {stepIndex + 1}
                              </label>
                              <textarea
                                id={`${fieldIds}-volba-${stepIndex}-${choiceIndex}`}
                                value={choice.text}
                                onChange={(e) =>
                                  updateChoice(step.id, choice.id, { text: e.target.value })
                                }
                                rows={2}
                                placeholder="Jak příslušník postupuje"
                                className={INPUT_CLASS}
                              />
                            </div>
                            {step.choices.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateStep(step.id, {
                                    choices: step.choices.filter((c) => c.id !== choice.id),
                                  })
                                }
                                aria-label={`Smazat volbu ${choiceIndex + 1} v kroku ${stepIndex + 1}`}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label
                                className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
                                htmlFor={`${fieldIds}-vazba-${stepIndex}-${choiceIndex}`}
                              >
                                Vysvětlení po volbě
                              </label>
                              <textarea
                                id={`${fieldIds}-vazba-${stepIndex}-${choiceIndex}`}
                                value={choice.feedback}
                                onChange={(e) =>
                                  updateChoice(step.id, choice.id, { feedback: e.target.value })
                                }
                                rows={2}
                                className={INPUT_CLASS}
                              />
                            </div>
                            <div>
                              <label
                                className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
                                htmlFor={`${fieldIds}-podklad-${stepIndex}-${choiceIndex}`}
                              >
                                Zákonný podklad
                              </label>
                              <input
                                id={`${fieldIds}-podklad-${stepIndex}-${choiceIndex}`}
                                type="text"
                                value={choice.legalBasis}
                                onChange={(e) =>
                                  updateChoice(step.id, choice.id, { legalBasis: e.target.value })
                                }
                                placeholder="§ 80 NGŘ č. 33/2019"
                                className={INPUT_CLASS}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={choice.isCorrect}
                                onChange={(e) =>
                                  updateChoice(step.id, choice.id, { isCorrect: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              Správný postup
                            </label>

                            <div className="flex items-center gap-1.5">
                              <label
                                className="text-[10px] font-semibold text-slate-500 dark:text-slate-400"
                                htmlFor={`${fieldIds}-dalsi-${stepIndex}-${choiceIndex}`}
                              >
                                Pokračovat krokem
                              </label>
                              <select
                                id={`${fieldIds}-dalsi-${stepIndex}-${choiceIndex}`}
                                value={choice.nextStepId ?? ''}
                                onChange={(e) =>
                                  updateChoice(step.id, choice.id, {
                                    nextStepId: e.target.value || undefined,
                                  })
                                }
                                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[11px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                              >
                                <option value="">Konec situace</option>
                                {steps
                                  .filter((s) => s.id !== step.id)
                                  .map((s, idx) => (
                                    <option key={s.id} value={s.id}>
                                      {s.title || `Krok ${idx + 1}`}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

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
                  Uložit situaci
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
