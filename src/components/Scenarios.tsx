import React, { useState, useMemo, useEffect } from 'react';
import { tacticalScenarios, Scenario, ScenarioStep, ScenarioChoice } from '../data/scenariosData';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, BookOpen, AlertTriangle, ChevronRight, Compass, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useEditableContent } from '../hooks/useEditableContent';
import { useProgressRevision } from '../hooks/useProgressRevision';
import { loadCompletedScenarios, saveCompletedScenarios, updateDailyStreak } from '../utils/gamification';
import { NAV_TAB_LABELS } from '../data/navTabs';
import ScenarioEditModal from './common/ScenarioEditModal';
import ConfirmDialog from './common/ConfirmDialog';

const SECONDARY_BUTTON =
  'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700';
const PRIMARY_BUTTON = 'bg-blue-600 hover:bg-blue-700 text-white';

export default function Scenarios() {
  const { profile } = useAuth();
  const canEdit = profile?.role === 'lektor' || profile?.role === 'admin';

  // Modelové situace z repozitáře přepsané úpravami lektora (contentLibrary.ts).
  const {
    entries: scenarioEntries,
    items: scenarios,
    save: saveScenario,
    remove: removeScenario,
    restore: restoreScenario,
    purge: purgeScenario,
    toggleHidden: toggleScenarioHidden,
  } = useEditableContent<Scenario>('scenario', tacticalScenarios, canEdit);

  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [confirmDeleteScenarioId, setConfirmDeleteScenarioId] = useState<string | null>(null);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [purgeScenarioId, setPurgeScenarioId] = useState<string | null>(null);

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>(loadCompletedScenarios);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [activeCategory, setActiveCategoryFilter] = useState<string>('all');

  // Postup se přečte znovu, kdykoli se úložiště změní — i po přihlášení, kdy
  // se vlastník klíče změní z „anon“ na id účtu.
  const progressRevision = useProgressRevision();
  useEffect(() => {
    setCompletedScenarios(loadCompletedScenarios());
  }, [progressRevision]);

  const categories = useMemo(
    () => Array.from(new Set<string>(scenarios.map(s => s.category))),
    [scenarios]
  );

  // Když lektor odebere poslední situaci vybrané kategorie, filtr by ukazoval
  // prázdný seznam bez možnosti zjistit proč. Vrátí se proto na „Vše“.
  useEffect(() => {
    if (activeCategory !== 'all' && !categories.includes(activeCategory)) {
      setActiveCategoryFilter('all');
    }
  }, [activeCategory, categories]);

  const filteredScenarios = activeCategory === 'all'
    ? scenarios
    : scenarios.filter(s => s.category === activeCategory);

  // Počítají se jen existující situace — po odebrání situace by jinak
  // „vyřešeno“ mohlo převýšit celkový počet.
  const completedCount = scenarios.filter(s => completedScenarios.includes(s.id)).length;

  // Stav položky (skrytá, smazaná, upravená) podle jejího id.
  const entryById = useMemo(
    () => new Map(scenarioEntries.map(entry => [entry.id, entry])),
    [scenarioEntries]
  );
  const deletedEntries = useMemo(
    () => scenarioEntries.filter(entry => entry.isDeleted),
    [scenarioEntries]
  );
  const scenarioToDelete = confirmDeleteScenarioId
    ? scenarios.find(s => s.id === confirmDeleteScenarioId) ?? null
    : null;

  const handleScenarioSave = async (scenario: Scenario) => {
    const result = await saveScenario(scenario);
    setScenarioError(result.error);
    return result;
  };

  const handleScenarioDelete = async (id: string) => {
    const result = await removeScenario(id);
    setScenarioError(result.error);
    setConfirmDeleteScenarioId(null);
    if (!result.error) setSelectedScenario(prev => (prev?.id === id ? null : prev));
  };

  const markScenarioCompleted = (scenarioId: string) => {
    setCompletedScenarios(prev => {
      if (prev.includes(scenarioId)) return prev;
      const next = [...prev, scenarioId];
      // Zápis je vedlejší efekt a updater setState musí být čistá funkce —
      // StrictMode ho ve vývoji spouští dvakrát. Proto až po vyhodnocení.
      queueMicrotask(() => {
        saveCompletedScenarios(next);
        updateDailyStreak();
      });
      return next;
    });
  };

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentStepIndex(0);
    setSelectedChoice(null);
    setScore({ correct: 0, total: 0 });
  };

  // Správná volba vede na další krok jen tehdy, když ten krok ve scénáři
  // opravdu existuje. Odkaz na neexistující krok (překlep v editoru) by jinak
  // nechal tlačítko „Pokračovat“ bez účinku a scénář by skončil slepě.
  const findNextStepIndex = (choice: ScenarioChoice): number => {
    if (!selectedScenario || !choice.nextStepId) return -1;
    return selectedScenario.steps.findIndex(s => s.id === choice.nextStepId);
  };

  const handleChoose = (choice: ScenarioChoice) => {
    if (selectedChoice) return;
    setSelectedChoice(choice);
    setScore(prev => ({
      correct: prev.correct + (choice.isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Scénář se započítá (XP, odznaky) jen tehdy, když ho student prošel
    // napoprvé bez chybné volby. Dřív stačilo zkoušet možnosti, dokud nějaká
    // nevyšla. `score` je tu ještě stav PŘED touto volbou.
    if (selectedScenario && choice.isCorrect && findNextStepIndex(choice) === -1 && score.correct === score.total) {
      markScenarioCompleted(selectedScenario.id);
    }
  };

  const handleNextStep = () => {
    if (!selectedScenario || !selectedChoice || !selectedChoice.isCorrect) return;
    const nextIdx = findNextStepIndex(selectedChoice);
    if (nextIdx === -1) return;
    setCurrentStepIndex(nextIdx);
    setSelectedChoice(null);
  };

  const handleResetScenario = () => {
    setCurrentStepIndex(0);
    setSelectedChoice(null);
    setScore({ correct: 0, total: 0 });
  };

  const handleBackToList = () => {
    if (selectedScenario && selectedChoice?.isCorrect && findNextStepIndex(selectedChoice) === -1 && score.correct === score.total) {
      markScenarioCompleted(selectedScenario.id);
    }
    setSelectedScenario(null);
    setCurrentStepIndex(0);
    setSelectedChoice(null);
    setScore({ correct: 0, total: 0 });
  };

  if (!selectedScenario) {
    return (
      <div className="w-full flex flex-col gap-5 pb-8">
        {/* Záhlaví — stejně klidné jako u Administrativy a Profesní etiky */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Compass className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{NAV_TAB_LABELS.scenarios}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Modelové situace ze služby s výběrem postupu krok za krokem.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {completedCount} z {scenarios.length} vyřešeno
              </span>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingScenario(null);
                    setScenarioModalOpen(true);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${PRIMARY_BUTTON}`}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Přidat modelovou situaci
                </button>
              )}
            </div>
          </div>
        </div>

        {scenarioError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">{scenarioError}</p>
        )}

        {/* Filtr kategorií */}
        {scenarios.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {[{ id: 'all', label: 'Vše', count: scenarios.length }, ...categories.map(cat => ({
              id: cat,
              label: cat,
              count: scenarios.filter(s => s.category === cat).length,
            }))].map(({ id, label, count }) => {
              const isActive = activeCategory === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategoryFilter(id)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="truncate">{label}</span>
                  <span className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Seznam situací */}
        {scenarios.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Zatím tu není žádná modelová situace.
            {canEdit && ' Přidejte první tlačítkem nahoře.'}
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            V této kategorii není žádná situace.
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScenarios.map((scenario) => {
            const isCompleted = completedScenarios.includes(scenario.id);
            const entry = entryById.get(scenario.id);
            return (
              <div key={scenario.id} className="flex flex-col gap-2">
              <button type="button"
                onClick={() => handleSelectScenario(scenario)}
                className={`w-full text-left group relative bg-white dark:bg-slate-900 border rounded-xl p-5 transition-colors cursor-pointer flex flex-col justify-between flex-1 ${
                  entry?.isHidden
                    ? 'border-dashed border-slate-300 dark:border-slate-600'
                    : isCompleted
                    ? 'border-emerald-300 dark:border-emerald-800'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700">
                      {scenario.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {entry?.isHidden && (
                        <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <EyeOff className="w-3 h-3" aria-hidden="true" />
                          Skryto
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                          Vyřešeno
                        </span>
                      )}
                      <span className="text-[0.6875rem] font-semibold px-2 py-0.5 rounded-md text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {scenario.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {scenario.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {scenario.briefing}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
                    {scenario.badge}
                  </span>

                  <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                    <span>{isCompleted ? 'Projít znovu' : 'Začít'}</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>
              </button>

              {/* Správa situace — jen lektor a správce. Tlačítka nejdou dovnitř
                  karty, ta je sama tlačítkem a vnořit je nelze. */}
              {canEdit && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingScenario(scenario);
                      setScenarioModalOpen(true);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.6875rem] font-bold cursor-pointer ${SECONDARY_BUTTON}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                    Upravit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleScenarioHidden(scenario.id).then(r => setScenarioError(r.error))}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.6875rem] font-bold cursor-pointer ${SECONDARY_BUTTON}`}
                  >
                    {entry?.isHidden ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
                    {entry?.isHidden ? 'Zveřejnit studentům' : 'Skrýt studentům'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteScenarioId(scenario.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-[0.6875rem] font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Odebrat
                  </button>
                </div>
              )}
              </div>
            );
          })}
        </div>
        )}

        {canEdit && deletedEntries.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-[0.6875rem] text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Odebrané situace (vrátit / smazat natrvalo):</span>
            {deletedEntries.map(entry => (
              <span key={entry.id} className="inline-flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => restoreScenario(entry.id).then(r => setScenarioError(r.error))}
                  aria-label={`Vrátit situaci ${entry.item.title}`}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  {entry.item.title}
                </button>
                <button
                  type="button"
                  onClick={() => setPurgeScenarioId(entry.id)}
                  aria-label={`Smazat situaci ${entry.item.title} natrvalo`}
                  className="p-1 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}

        {canEdit && (
          <ConfirmDialog
            isOpen={confirmDeleteScenarioId !== null}
            title="Odebrat modelovou situaci?"
            description={
              <>
                Situace <strong>{scenarioToDelete?.title ?? confirmDeleteScenarioId}</strong> zmizí z přehledu.
                Půjde ji vrátit ze seznamu odebraných.
              </>
            }
            confirmLabel="Odebrat"
            tone="danger"
            onCancel={() => setConfirmDeleteScenarioId(null)}
            onConfirm={() => {
              if (confirmDeleteScenarioId) void handleScenarioDelete(confirmDeleteScenarioId);
            }}
          />
        )}

        {canEdit && (
          <ConfirmDialog
            isOpen={purgeScenarioId !== null}
            title="Smazat situaci natrvalo?"
            description="Situace zmizí i z přehledu odebraných a vrátit ji půjde jen zásahem do databáze."
            confirmLabel="Smazat natrvalo"
            tone="danger"
            onCancel={() => setPurgeScenarioId(null)}
            onConfirm={() => {
              const id = purgeScenarioId;
              setPurgeScenarioId(null);
              if (id) purgeScenario(id).then(r => setScenarioError(r.error));
            }}
          />
        )}

        {canEdit && (
          <ScenarioEditModal
            scenario={editingScenario}
            isOpen={scenarioModalOpen}
            usedIds={scenarioEntries.map(e => e.id)}
            onClose={() => {
              setScenarioModalOpen(false);
              setEditingScenario(null);
            }}
            onSave={handleScenarioSave}
          />
        )}
      </div>
    );
  }

  const currentStep: ScenarioStep = selectedScenario.steps[currentStepIndex];
  // Poslední krok = správná volba bez (existujícího) dalšího kroku.
  const isFinished = !!selectedChoice?.isCorrect && findNextStepIndex(selectedChoice) === -1;
  const legalBasis = selectedChoice?.legalBasis.trim() ?? '';

  return (
    <div className="w-full flex flex-col pb-8">
      {/* Horní lišta */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={handleBackToList}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 rotate-180" aria-hidden="true" />
          <span>Zpět na přehled</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Skóre rozhodnutí. Dřív se počítalo do stavu `score` a nikde se
              nezobrazilo, takže po scénáři nebylo poznat, kolik rozhodnutí
              bylo správně. */}
          {score.total > 0 && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-md border bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
              title="Kolik voleb v tomto průchodu bylo správných; opakovaný pokus po chybě se počítá jako další volba"
            >
              Správné volby: <strong>{score.correct}</strong> z {score.total}
            </span>
          )}
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
            Krok {currentStepIndex + 1} z {selectedScenario.steps.length}
          </span>
          <button
            type="button"
            onClick={handleResetScenario}
            title="Začít scénář znovu"
            aria-label="Začít scénář znovu od prvního kroku"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Zadání situace */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-5">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
          {selectedScenario.category} · {selectedScenario.difficulty}
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {selectedScenario.title}
        </h2>
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3.5 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-slate-900 dark:text-white block mb-1">Zadání situace</span>
          {selectedScenario.briefing}
        </div>
      </div>

      {/* Krok scénáře */}
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-5"
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
          {currentStep.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
          {currentStep.description}
        </p>

        {/* Možnosti */}
        <div className="space-y-3">
          {currentStep.choices.map((choice) => {
            const isSelected = selectedChoice?.id === choice.id;
            let choiceStyle = 'border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 cursor-pointer';

            if (selectedChoice) {
              if (isSelected) {
                choiceStyle = choice.isCorrect
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                  : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
              } else if (choice.isCorrect) {
                choiceStyle = 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300';
              } else {
                choiceStyle = 'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400';
              }
            }

            return (
              <button
                key={choice.id}
                type="button"
                disabled={!!selectedChoice}
                onClick={() => handleChoose(choice)}
                className={`w-full text-left p-4 rounded-xl border transition-colors text-xs sm:text-sm leading-relaxed flex items-start gap-3 ${choiceStyle}`}
              >
                <div className="mt-0.5 shrink-0" aria-hidden="true">
                  {selectedChoice && isSelected ? (
                    choice.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    )
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                  )}
                </div>
                <div className="flex-1 font-medium">{choice.text}</div>
              </button>
            );
          })}
        </div>

        {/* Vyhodnocení volby */}
        <AnimatePresence>
          {selectedChoice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className={`p-4 rounded-xl border ${
                selectedChoice.isCorrect
                  ? 'bg-emerald-500/10 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-500/10 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
                  {selectedChoice.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      <span>Správný postup</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                      <span>Tento postup není správný</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {selectedChoice.feedback}
                </p>
                {legalBasis && (
                  <div className="mt-2.5 text-[0.6875rem] font-mono font-semibold bg-white/50 dark:bg-black/30 px-2.5 py-1.5 rounded-md inline-block">
                    Opora / odkaz: {legalBasis}
                  </div>
                )}
              </div>

              {/* Další krok */}
              <div className="mt-4 flex justify-end gap-3">
                {!selectedChoice.isCorrect ? (
                  <button
                    type="button"
                    onClick={() => setSelectedChoice(null)}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${SECONDARY_BUTTON}`}
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>Zkusit jinou možnost</span>
                  </button>
                ) : isFinished ? (
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {score.correct === score.total
                        ? 'Scénář dokončen bez chyby.'
                        : 'Scénář dokončen. Do plnění se započítá, až ho projdete bez chyby.'}
                    </span>
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${PRIMARY_BUTTON}`}
                    >
                      <span>Zpět na přehled</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${PRIMARY_BUTTON}`}
                  >
                    <span>Pokračovat na další krok</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
