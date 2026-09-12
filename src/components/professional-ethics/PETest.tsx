import React, { useState } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { profesniEtikaQuestions } from '../../data/questions/profesniEtika';
import { Question } from '../../types';

export const PETest: React.FC = () => {
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [testActive, setTestActive] = useState<boolean>(false);
  const [currentTestIdx, setCurrentTestIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [testFinished, setTestFinished] = useState<boolean>(false);

  const currentQuestion = testQuestions[currentTestIdx];

  const startPracticeTest = (questionCount: number = 20) => {
    const shuffled = [...profesniEtikaQuestions].sort(() => Math.random() - 0.5).slice(0, questionCount);
    setTestQuestions(shuffled);
    setUserAnswers({});
    setCurrentTestIdx(0);
    setTestFinished(false);
    setTestActive(true);
  };

  const handleSelectTestOption = (optIdx: number) => {
    if (testFinished) return;
    setUserAnswers(prev => ({ ...prev, [currentTestIdx]: optIdx }));
  };

  const calculateTestScore = () => {
    let score = 0;
    testQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOption) score++;
    });
    return score;
  };

  return (
    <div className="space-y-6">
      {!testActive ? (
        <div className="bg-slate-900 print:bg-white p-8 print:p-4 rounded-2xl border border-slate-800 print:border-slate-300 text-center max-w-2xl mx-auto space-y-6 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 print:bg-slate-100 text-emerald-400 print:text-slate-900 flex items-center justify-center mx-auto border border-emerald-500/40 print:border-slate-300">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white print:text-[#111827]">Oficiální test předmětu Profesní etika (ZOP A)</h3>
            <p className="text-xs md:text-sm text-slate-300 print:text-[#111827] max-w-md mx-auto">
              Test obsahuje 20 náhodně vybraných otázek ze souboru 50 akreditovaných kontrolních otázek. Časový limit pro e-learningový test je stanoven na 30 minut.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 no-print print:hidden">
            <button onClick={() => startPracticeTest(20)} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer">
              Spustit standardní test (20 otázek)
            </button>
            <button onClick={() => startPracticeTest(50)} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all cursor-pointer">
              Procvičit všech 50 otázek
            </button>
          </div>
        </div>
      ) : currentQuestion ? (
        <div className="bg-slate-900 print:bg-white p-6 print:p-4 rounded-2xl border border-slate-800 print:border-slate-300 space-y-6 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 print:border-slate-300 pb-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 print:text-slate-900 uppercase tracking-wider">Otázka {currentTestIdx + 1} z {testQuestions.length}</span>
              <h3 className="font-bold text-white print:text-[#111827] text-base md:text-lg mt-1">{currentQuestion.question}</h3>
            </div>
            <div className="flex items-center gap-2 no-print print:hidden">
              <button onClick={() => { if (window.confirm('Opravdu chcete ukončit probíhající test?')) setTestActive(false); }} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer">
                Ukončit test
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(currentQuestion.options || []).map((option, optIdx) => {
              const isSelected = userAnswers[currentTestIdx] === optIdx;
              const isCorrect = currentQuestion.correctOption === optIdx;
              let optClass = 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300 print:bg-white print:border-slate-300 print:text-[#111827]';
              if (testFinished) {
                if (isCorrect) optClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium print:bg-emerald-50 print:border-emerald-600 print:text-emerald-950';
                else if (isSelected && !isCorrect) optClass = 'bg-red-950/60 border-red-500 text-red-200 print:bg-red-50 print:border-red-600 print:text-red-950';
              } else if (isSelected) {
                optClass = 'bg-emerald-500/10 border-emerald-500 text-white font-medium print:bg-emerald-50 print:border-emerald-600 print:text-emerald-950';
              }
              return (
                <button key={optIdx} onClick={() => handleSelectTestOption(optIdx)} className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm transition-all cursor-pointer ${optClass}`}>
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 print:bg-slate-100 text-slate-300 print:text-slate-900'}`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-relaxed">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {testFinished && (
            <div className="p-4 rounded-xl bg-slate-800/80 print:bg-slate-50 border border-slate-700 print:border-slate-300 text-xs space-y-1.5 print:text-[#111827]">
              <span className="font-bold text-emerald-300 print:text-slate-900 block">Zdůvodnění a právní základ:</span>
              <p className="text-slate-300 print:text-[#111827]">{currentQuestion.rationale}</p>
              <span className="text-slate-400 print:text-slate-600 text-[11px] block">Pramen: {currentQuestion.source}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-800 print:border-slate-300 no-print print:hidden">
            <button disabled={currentTestIdx === 0} onClick={() => setCurrentTestIdx(prev => prev - 1)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 cursor-pointer">
              Předchozí
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto max-w-md px-2">
              {testQuestions.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentTestIdx(idx)} className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all cursor-pointer ${currentTestIdx === idx ? 'bg-emerald-500 text-slate-950 font-bold' : userAnswers[idx] !== undefined ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentTestIdx < testQuestions.length - 1 ? (
              <button onClick={() => setCurrentTestIdx(prev => prev + 1)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer">Další</button>
            ) : !testFinished ? (
              <button onClick={() => setTestFinished(true)} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm cursor-pointer shadow-lg shadow-emerald-500/20">Odevzdat test</button>
            ) : (
              <button onClick={() => startPracticeTest(testQuestions.length)} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer">Spustit znovu</button>
            )}
          </div>

          {testFinished && (
            <div className="p-5 rounded-2xl bg-emerald-950/40 print:bg-slate-50 border border-emerald-500/50 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 print:text-[#111827]">
              <div>
                <h4 className="font-bold text-white print:text-[#111827] text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 print:text-slate-900" />
                  Výsledek testu: {calculateTestScore()} z {testQuestions.length} bodů ({Math.round((calculateTestScore() / testQuestions.length) * 100)} %)
                </h4>
                <p className="text-xs text-emerald-200 print:text-[#111827] mt-0.5">
                  {calculateTestScore() / testQuestions.length >= 0.75
                    ? 'Gratulujeme! Test z Profesní etiky jste úspěšně zvládli.'
                    : 'Doporučujeme zopakovat 36 pojmů a Kodex etiky a test zopakovat.'}
                </p>
              </div>
              <button onClick={() => startPracticeTest(20)} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer no-print print:hidden">
                Nový test (20 ot.)
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default PETest;
