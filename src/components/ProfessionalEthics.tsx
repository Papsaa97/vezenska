import React, { useState } from 'react';
import {
  HeartHandshake,
  Calculator,
  Globe2,
  HelpCircle,
  BookOpen,
  FileText,
  Sparkles,
  Award,
  Printer
} from 'lucide-react';
import { profesniEtikaQuestions } from '../data/questions/profesniEtika';
import PrintHeader from './common/PrintHeader';
import PEConcepts, { conceptsList } from './professional-ethics/PEConcepts';
import PECodeOfEthics from './professional-ethics/PECodeOfEthics';
import PEAnticorruption from './professional-ethics/PEAnticorruption';
import PEConventions from './professional-ethics/PEConventions';
import PESimulator from './professional-ethics/PESimulator';
import PETest from './professional-ethics/PETest';

interface ProfessionalEthicsProps {
  /** Spustí cvičný test předmětu Profesní etika v modulu Test & Zkouška. */
  onStartSubjectQuiz?: (subject: string) => void;
}

/** Přesný název předmětu v bance otázek — musí souhlasit s polem `subject`. */
const ETHICS_SUBJECT = 'Profesní etika';

export const ProfessionalEthics: React.FC<ProfessionalEthicsProps> = ({ onStartSubjectQuiz }) => {
  const [activeSubTab, setActiveSubTab] = useState<'concepts' | 'code' | 'anticorruption' | 'conventions' | 'simulator' | 'test'>('concepts');

  /**
   * Tlačítko v záhlaví skutečně spustí test.
   *
   * Dřív jen přepnulo podzáložku a komentář u něj přiznával, že test
   * nespouští — přitom slibovalo „Spustit e-Test (20 ot.)“.
   */
  const handleStartQuickTest = () => {
    if (onStartSubjectQuiz) {
      onStartSubjectQuiz(ETHICS_SUBJECT);
      return;
    }
    setActiveSubTab('test');
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Tisková hlavička – viditelná výhradně při tisku */}
      <div className="hidden print:block">
        <PrintHeader
          subject="Profesní etika & Deontologie"
          docTitle={
            activeSubTab === 'concepts'
              ? `Přehled ${conceptsList.length} klíčových pojmů pro zkoušku ZOP A`
              : activeSubTab === 'code'
              ? 'Etický kodex VS ČR (Příloha č. 6 k NGŘ č. 28/2018 Sb.)'
              : activeSubTab === 'anticorruption'
              ? 'Protikorupční program a katalog korupčních rizik VS ČR'
              : activeSubTab === 'conventions'
              ? 'Evropská vězeňská pravidla a mezinárodní úmluvy'
              : activeSubTab === 'simulator'
              ? 'Trenažér etických dilemat a deontologických situací'
              : 'Zkušební test z Profesní etiky'
          }
          category="NGŘ 28/2018"
          subtext="Akademie Vězeňské služby ČR – Interní studijní materiál pro zkoušku ZOP A"
        />
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden print:bg-white print:border print:border-slate-300 print:p-4 print:mb-4 print:shadow-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none no-print print:hidden" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 print:hidden">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white print:text-black tracking-tight">Profesní etika & Deontologie</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 print:bg-slate-100 print:text-slate-900 print:border-slate-300">
                  ZOP A • NGŘ 28/2018
                </span>
              </div>
              <p className="text-sm text-slate-300 print:text-[#111827] mt-1 max-w-2xl">
                Komplexní modul profesní etiky, teorie normativních systémů, mezinárodních vězeňských pravidel (EVP / Mandelova pravidla), protikorupčního programu a etického kodexu VS ČR.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print print:hidden">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center gap-2 transition-all border border-slate-700 cursor-pointer shadow-md no-print"
              title="Vytisknout studijní materiály nebo uložit do PDF"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Tisk / PDF</span>
            </button>
            <button
              onClick={handleStartQuickTest}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer no-print"
            >
              <Award className="w-4 h-4" />
              <span>Spustit test ({profesniEtikaQuestions.length} otázek v bance)</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-800 pt-4 scrollbar-none no-print print:hidden">
          {([
            { id: 'concepts', label: `${conceptsList.length} klíčových pojmů`, Icon: BookOpen },
            { id: 'code', label: 'Etický kodex VS ČR', Icon: FileText },
            { id: 'anticorruption', label: 'Protikorupční program & Rizika', Icon: Calculator },
            { id: 'conventions', label: 'EVP & Lidská práva', Icon: Globe2 },
            { id: 'simulator', label: 'Trenažér etických dilemat', Icon: Sparkles },
            { id: 'test', label: `Zkušební test (${profesniEtikaQuestions.length} otázek)`, Icon: HelpCircle },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSubTab(id)}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeSubTab === id
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'concepts' && <PEConcepts />}
      {activeSubTab === 'code' && <PECodeOfEthics />}
      {activeSubTab === 'anticorruption' && <PEAnticorruption />}
      {activeSubTab === 'conventions' && <PEConventions />}
      {activeSubTab === 'simulator' && <PESimulator />}
      {activeSubTab === 'test' && (
        <PETest onStartSubjectQuiz={onStartSubjectQuiz ? () => onStartSubjectQuiz(ETHICS_SUBJECT) : undefined} />
      )}
    </div>
  );
};

export default ProfessionalEthics;
