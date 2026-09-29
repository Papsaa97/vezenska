import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { defaultDilemmaScenarios } from '../../data/professionalEthicsData';

const dilemmaScenarios = defaultDilemmaScenarios;

export const PESimulator: React.FC = () => {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [selectedSimOption, setSelectedSimOption] = useState<number | null>(null);
  const [simSubmitted, setSimSubmitted] = useState<boolean>(false);
  const [simScore, setSimScore] = useState<number>(0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 print:bg-white p-6 print:p-4 rounded-2xl border border-slate-800 print:border-slate-300 space-y-5 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 print:border-slate-300 pb-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 print:text-slate-900 uppercase tracking-wider block">Modelová situace #{activeScenarioIdx + 1} ze {dilemmaScenarios.length}</span>
            <h3 className="font-bold text-white print:text-[#111827] text-lg mt-0.5">{dilemmaScenarios[activeScenarioIdx].title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 print:text-slate-700 font-mono">Skóre: {simScore} bodů</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 print:bg-slate-50 border border-slate-700 print:border-slate-300 text-xs md:text-sm text-slate-200 print:text-[#111827] leading-relaxed">
          <strong className="text-white print:text-slate-900 block mb-1.5 font-semibold">Popis služební situace:</strong>
          {dilemmaScenarios[activeScenarioIdx].description}
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 print:text-slate-700 block">Zvolte správný profesně-etický a zákonný postup:</span>
          {dilemmaScenarios[activeScenarioIdx].options.map((opt, idx) => (
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
            dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].correct
              ? 'bg-emerald-950/40 print:bg-emerald-50 border-emerald-500/50 print:border-emerald-600 text-emerald-200 print:text-emerald-950'
              : 'bg-red-950/40 print:bg-red-50 border-red-500/50 print:border-red-600 text-red-200 print:text-red-950'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1.5">
              {dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].correct ? (
                <><CheckCircle2 className="w-5 h-5 text-emerald-400 print:text-emerald-800" /><span>Správné řešení!</span></>
              ) : (
                <><AlertTriangle className="w-5 h-5 text-red-400 print:text-red-800" /><span>Nesprávný postup</span></>
              )}
            </div>
            <p>{dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].explanation}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 print:border-slate-300 no-print print:hidden">
          <button
            disabled={activeScenarioIdx === 0}
            onClick={() => { setActiveScenarioIdx(prev => prev - 1); setSelectedSimOption(null); setSimSubmitted(false); }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
          >
            Předchozí situace
          </button>

          {!simSubmitted ? (
            <button
              disabled={selectedSimOption === null}
              onClick={() => {
                setSimSubmitted(true);
                if (selectedSimOption !== null && dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].correct) {
                  setSimScore(prev => prev + 15);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm disabled:opacity-40 cursor-pointer"
            >
              Vyhodnotit rozhodnutí
            </button>
          ) : (
            <button
              onClick={() => {
                if (activeScenarioIdx < dilemmaScenarios.length - 1) {
                  setActiveScenarioIdx(prev => prev + 1);
                } else {
                  setActiveScenarioIdx(0);
                }
                setSelectedSimOption(null);
                setSimSubmitted(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm cursor-pointer"
            >
              {activeScenarioIdx < dilemmaScenarios.length - 1 ? 'Další modelová situace' : 'Začít znovu od 1. situace'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PESimulator;
