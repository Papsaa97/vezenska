import React, { useState, useMemo } from 'react';
import { tacticalScenarios, Scenario, ScenarioStep, ScenarioChoice } from '../data/scenariosData';
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, BookOpen, AlertTriangle, ChevronRight, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Scenarios() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vscr_completed_scenarios');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [activeCategory, setActiveCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => Array.from(new Set(tacticalScenarios.map(s => s.category))), []);
  const filteredScenarios = activeCategory === 'all' ? tacticalScenarios : tacticalScenarios.filter(s => s.category === activeCategory);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentStepIndex(0);
    setSelectedChoice(null);
  };

  const handleChoose = (choice: ScenarioChoice) => {
    if (selectedChoice) return;
    setSelectedChoice(choice);
    setScore(prev => ({
      correct: prev.correct + (choice.isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNextStep = () => {
    if (!selectedScenario || !selectedChoice) return;

    if (selectedChoice.isCorrect && selectedChoice.nextStepId) {
      const nextIdx = selectedScenario.steps.findIndex(s => s.id === selectedChoice.nextStepId);
      if (nextIdx !== -1) {
        setCurrentStepIndex(nextIdx);
        setSelectedChoice(null);
        return;
      }
    }

    // Finished scenario
    if (selectedChoice.isCorrect) {
      setCompletedScenarios(prev => {
        if (!prev.includes(selectedScenario.id)) {
          const next = [...prev, selectedScenario.id];
          try {
            localStorage.setItem('vscr_completed_scenarios', JSON.stringify(next));
            window.dispatchEvent(new Event('storage'));
          } catch {
            // ignore
          }
          return next;
        }
        return prev;
      });
    }
  };

  const handleResetScenario = () => {
    setCurrentStepIndex(0);
    setSelectedChoice(null);
  };

  const handleBackToList = () => {
    setSelectedScenario(null);
    setCurrentStepIndex(0);
    setSelectedChoice(null);
  };

  if (!selectedScenario) {
    return (
      <div className="w-full h-full flex flex-col overflow-y-auto p-2 sm:p-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-md border border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-400/20">
                <Compass className="w-3.5 h-3.5" />
                <span>Takticko-právní kazuistika ZOP A</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Modelové situace a rozhodovací scénáře</h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Otestujte si správné taktické postupy, zákonné výzvy, volbu donucovacích prostředků a záchranu života v reálných podmínkách služby.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 self-start sm:self-auto">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-300">Úspěšnost zásahů</div>
                <div className="text-lg font-bold text-white">
                  {completedScenarios.length} / {tacticalScenarios.length} <span className="text-xs font-normal text-slate-300">vyřešeno</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
            }`}
          >
            Vše ({tacticalScenarios.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
              }`}
            >
              {cat} ({tacticalScenarios.filter(s => s.category === cat).length})
            </button>
          ))}
        </div>

        {/* Scenario Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScenarios.map((scenario) => {
            const isCompleted = completedScenarios.includes(scenario.id);
            return (
              <div
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className={`group relative bg-white dark:bg-slate-900 border rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isCompleted 
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-500/[0.02]' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700">
                      {scenario.category}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      scenario.difficulty === 'Expertní' 
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400' 
                        : scenario.difficulty === 'Pokročilá'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {scenario.difficulty}
                    </span>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {scenario.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {scenario.briefing}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    {scenario.badge}
                  </span>

                  <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                    <span>{isCompleted ? 'Znovu projít' : 'Zahájit řešení'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentStep: ScenarioStep = selectedScenario.steps[currentStepIndex];
  const isFinished = selectedChoice?.isCorrect && !selectedChoice.nextStepId;

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto p-2 sm:p-4 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={handleBackToList}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Zpět na přehled scénářů</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
            Krok {currentStepIndex + 1} z {selectedScenario.steps.length}
          </span>
          <button
            onClick={handleResetScenario}
            title="Resetovat scénář"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scenario Header & Briefing */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>{selectedScenario.category}</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
          {selectedScenario.title}
        </h2>
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3.5 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-slate-900 dark:text-white block mb-1">Zadání situace:</span>
          {selectedScenario.briefing}
        </div>
      </div>

      {/* Step Description */}
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-5 shadow-sm"
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
          {currentStep.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
          {currentStep.description}
        </p>

        {/* Choices */}
        <div className="space-y-3">
          {currentStep.choices.map((choice) => {
            const isSelected = selectedChoice?.id === choice.id;
            let choiceStyle = 'border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200';

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
                disabled={!!selectedChoice}
                onClick={() => handleChoose(choice)}
                className={`w-full text-left p-4 rounded-xl border transition-all text-xs sm:text-sm leading-relaxed flex items-start gap-3 ${choiceStyle}`}
              >
                <div className="mt-0.5 shrink-0">
                  {selectedChoice && isSelected ? (
                    choice.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    )
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold">
                      •
                    </div>
                  )}
                </div>
                <div className="flex-1 font-medium">{choice.text}</div>
              </button>
            );
          })}
        </div>

        {/* Feedback block after choice */}
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
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Takticky i právně správný postup</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Taktická nebo právní chyba v zákroku</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed mb-2.5">
                  {selectedChoice.feedback}
                </p>
                <div className="text-[11px] font-mono font-semibold bg-white/50 dark:bg-black/30 px-2.5 py-1.5 rounded-md inline-block">
                  Zákonný rámec / norma: {selectedChoice.legalBasis}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex justify-end gap-3">
                {!selectedChoice.isCorrect ? (
                  <button
                    onClick={() => setSelectedChoice(null)}
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Zkusit jinou možnost</span>
                  </button>
                ) : isFinished ? (
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>Scénář úspěšně vyřešen!</span>
                    </div>
                    <button
                      onClick={handleBackToList}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <span>Dokončit a zpět na přehled</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <span>Pokračovat na další krok</span>
                    <ArrowRight className="w-4 h-4" />
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
