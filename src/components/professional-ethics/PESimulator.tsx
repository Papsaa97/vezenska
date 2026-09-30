import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { defaultDilemmaScenarios, DilemmaScenario } from '../../data/professionalEthicsData';
import { useAuth } from '../../context/AuthContext';
import { useEditableContent } from '../../hooks/useEditableContent';
import ContentEditorBar from '../common/ContentEditorBar';
import DilemmaEditModal from '../common/DilemmaEditModal';

export const PESimulator: React.FC = () => {
  const { profile } = useAuth();
  const canEdit = profile?.role === 'lektor' || profile?.role === 'admin';

  // Situace z repozitáře přepsané úpravami lektora (contentLibrary.ts, druh 'ethics_dilemma').
  const dilemmaContent = useEditableContent<DilemmaScenario>('ethics_dilemma', defaultDilemmaScenarios, canEdit);
  const dilemmaScenarios = dilemmaContent.items;

  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [selectedSimOption, setSelectedSimOption] = useState<number | null>(null);
  const [simSubmitted, setSimSubmitted] = useState<boolean>(false);
  // Kolik situací student vyhodnotil a kolik z nich správně. Dřív tu bylo
  // „Skóre: 15 bodů“ za správnou odpověď — body nic neznamenaly a nikam se nepočítaly.
  const [answered, setAnswered] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DilemmaScenario | null>(null);

  // Lektor mohl situaci odebrat — index nesmí ukazovat za konec seznamu.
  const scenarioIdx = Math.min(activeScenarioIdx, Math.max(dilemmaScenarios.length - 1, 0));
  // `as` jen přiznává, že index za koncem (prázdný seznam) vrací undefined.
  const scenario = dilemmaScenarios[scenarioIdx] as DilemmaScenario | undefined;
  const scenarioEntry = dilemmaContent.entries.find((e) => e.id === scenario?.id);

  const resetAnswer = () => {
    setSelectedSimOption(null);
    setSimSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {canEdit && (
        <>
          <ContentEditorBar
            content={dilemmaContent}
            targets={scenarioEntry ? [scenarioEntry] : []}
            deleted={dilemmaContent.entries.filter((e) => e.isDeleted)}
            getName={(d) => d.title}
            noun="situaci"
            onEdit={(d) => {
              setEditing(d);
              setModalOpen(true);
            }}
            onAdd={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          />
          <DilemmaEditModal
            scenario={editing}
            isOpen={modalOpen}
            usedIds={dilemmaContent.entries.map((e) => e.id)}
            onClose={() => {
              setModalOpen(false);
              setEditing(null);
            }}
            onSave={async (d) => {
              const result = await dilemmaContent.save(d);
              // Po uložení ukázat právě upravenou situaci s čistou odpovědí —
              // stará volba by mohla ukazovat na možnost, která už neexistuje.
              if (!result.error) {
                resetAnswer();
                // Nová situace se řadí na konec seznamu; index se ořízne na
                // poslední platný (viz scenarioIdx), takže lektor ji hned vidí.
                if (!editing) setActiveScenarioIdx(Number.MAX_SAFE_INTEGER);
              }
              return result;
            }}
          />
        </>
      )}

      {!scenario ? (
        <p className="text-center text-sm text-slate-400 italic py-8">
          V trenažéru zatím nejsou žádné modelové situace{canEdit ? ' — přidejte je tlačítkem Přidat situaci.' : '.'}
        </p>
      ) : (
        <div className="bg-slate-900 print:bg-white p-6 print:p-4 rounded-2xl border border-slate-800 print:border-slate-300 space-y-5 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 print:border-slate-300 pb-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 print:text-slate-900 uppercase tracking-wider block">Modelová situace #{scenarioIdx + 1} ze {dilemmaScenarios.length}</span>
              <h3 className="font-bold text-white print:text-[#111827] text-lg mt-0.5">{scenario.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              {answered > 0 && (
                <span className="text-xs text-slate-400 print:text-slate-700 no-print print:hidden">
                  Správně {correctCount} z {answered}
                </span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 print:bg-slate-50 border border-slate-700 print:border-slate-300 text-xs md:text-sm text-slate-200 print:text-[#111827] leading-relaxed">
            <strong className="text-white print:text-slate-900 block mb-1.5 font-semibold">Popis služební situace:</strong>
            {scenario.description}
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-400 print:text-slate-700 block">Zvolte správný profesně-etický a zákonný postup:</span>
            {scenario.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => { if (!simSubmitted) setSelectedSimOption(idx); }}
                className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm transition-all cursor-pointer ${
                  selectedSimOption === idx
                    ? simSubmitted
                      ? opt.correct
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 print:bg-emerald-50 print:border-emerald-600 print:text-emerald-950'
                        : 'bg-red-950/60 border-red-500 text-red-200 print:bg-red-50 print:border-red-600 print:text-red-950'
                      : 'bg-emerald-500/10 border-emerald-500 text-white print:bg-emerald-50 print:border-emerald-600 print:text-emerald-950'
                    : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/80 text-slate-300 print:bg-white print:border-slate-300 print:text-[#111827]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${selectedSimOption === idx ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 print:bg-slate-100 text-slate-300 print:text-slate-900'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                </div>
              </button>
            ))}
          </div>

          {simSubmitted && selectedSimOption !== null && (
            <div className={`p-4 rounded-xl border text-xs md:text-sm leading-relaxed ${
              scenario.options[selectedSimOption].correct
                ? 'bg-emerald-950/40 print:bg-emerald-50 border-emerald-500/50 print:border-emerald-600 text-emerald-200 print:text-emerald-950'
                : 'bg-red-950/40 print:bg-red-50 border-red-500/50 print:border-red-600 text-red-200 print:text-red-950'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1.5">
                {scenario.options[selectedSimOption].correct ? (
                  <><CheckCircle2 className="w-5 h-5 text-emerald-400 print:text-emerald-800" /><span>Správné řešení!</span></>
                ) : (
                  <><AlertTriangle className="w-5 h-5 text-red-400 print:text-red-800" /><span>Nesprávný postup</span></>
                )}
              </div>
              <p>{scenario.options[selectedSimOption].explanation}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 print:border-slate-300 no-print print:hidden">
            <button
              disabled={scenarioIdx === 0}
              onClick={() => { setActiveScenarioIdx(scenarioIdx - 1); resetAnswer(); }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            >
              Předchozí situace
            </button>

            {!simSubmitted ? (
              <button
                disabled={selectedSimOption === null}
                onClick={() => {
                  setSimSubmitted(true);
                  setAnswered(prev => prev + 1);
                  if (selectedSimOption !== null && scenario.options[selectedSimOption].correct) {
                    setCorrectCount(prev => prev + 1);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm disabled:opacity-40 cursor-pointer"
              >
                Vyhodnotit rozhodnutí
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveScenarioIdx(scenarioIdx < dilemmaScenarios.length - 1 ? scenarioIdx + 1 : 0);
                  resetAnswer();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm cursor-pointer"
              >
                {scenarioIdx < dilemmaScenarios.length - 1 ? 'Další modelová situace' : 'Začít znovu od 1. situace'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PESimulator;
