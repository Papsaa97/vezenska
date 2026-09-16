import React from 'react';
import { Award, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { profesniEtikaQuestions } from '../../data/questions/profesniEtika';

interface PETestProps {
  /** Spustí cvičný test předmětu v hlavním zkouškovém modulu. */
  onStartSubjectQuiz?: () => void;
}

/**
 * Rozcestník k testu z Profesní etiky.
 *
 * PROČ TU NENÍ VLASTNÍ TEST: dřív si tahle záložka celý test implementovala
 * sama a ve slabší podobě než hlavní Zkouška:
 *   - neprohazovala možnosti, takže správná odpověď byla vždy na stejné
 *     pozici jako v datovém souboru (stačilo si zapamatovat pořadí),
 *   - slibovala „časový limit 30 minut“, ale žádný časovač neměla,
 *   - tvrdila „ze souboru 50 akreditovaných kontrolních otázek“, přičemž
 *     banka jich má 57, takže „všech 50“ jich 7 zahodilo,
 *   - výsledek se nikam neukládal: žádná historie, XP ani statistiky.
 *
 * Hlavní Zkouška všechno tohle umí. Místo druhé, nekvalitnější implementace
 * proto záložka předá řízení jí a přednastaví předmět.
 */
export const PETest: React.FC<PETestProps> = ({ onStartSubjectQuiz }) => {
  const questionCount = profesniEtikaQuestions.length;

  return (
    <div className="space-y-6">
      <div
        className="bg-slate-900 print:bg-white p-8 print:p-4 rounded-2xl border border-slate-800 print:border-slate-300 text-center max-w-2xl mx-auto space-y-6 print-card break-inside-avoid print:text-[#111827] print:shadow-none"
        style={{ breakInside: 'avoid' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 print:bg-slate-100 text-emerald-400 print:text-slate-900 flex items-center justify-center mx-auto border border-emerald-500/40 print:border-slate-300">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white print:text-[#111827]">
            Test předmětu Profesní etika
          </h3>
          <p className="text-xs md:text-sm text-slate-300 print:text-[#111827] max-w-md mx-auto leading-relaxed">
            Banka obsahuje <strong>{questionCount} kontrolních otázek</strong> z tohoto předmětu.
            Test se spustí v modulu <strong>Test &amp; Zkouška</strong>, kde se prohazují možnosti,
            zaznamenává se vlastní jistota u každé odpovědi a výsledek se uloží do vašich
            statistik a XP.
          </p>
        </div>

        <ul className="text-left text-xs text-slate-300 print:text-[#111827] max-w-sm mx-auto space-y-1.5">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400 print:text-slate-700" />
            <span>Počet otázek i časový limit si nastavíte ve filtrech testu.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400 print:text-slate-700" />
            <span>U každé otázky se po odpovědi zobrazí odůvodnění a pramen.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400 print:text-slate-700" />
            <span>Chyby se zapíšou do statistik jako slabý okruh k dalšímu drilu.</span>
          </li>
        </ul>

        {onStartSubjectQuiz ? (
          <button
            type="button"
            onClick={onStartSubjectQuiz}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer inline-flex items-center justify-center gap-2 no-print print:hidden"
          >
            Spustit test z Profesní etiky
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div
            role="note"
            className="flex items-start gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2.5 text-left text-xs text-slate-300 no-print print:hidden"
          >
            <Info className="w-4 h-4 mt-px shrink-0 text-blue-400" />
            <span>
              Test spustíte v záložce <strong>Test &amp; Zkouška</strong> — ve filtrech vyberte
              předmět <strong>Profesní etika</strong>.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PETest;
