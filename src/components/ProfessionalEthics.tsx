import React, { useState } from 'react';
import {
  HeartHandshake,
  ShieldAlert,
  Globe2,
  BookOpen,
  FileText,
  Sparkles,
  Award,
  Printer
} from 'lucide-react';
import PrintHeader from './common/PrintHeader';
import PEConcepts from './professional-ethics/PEConcepts';
import PECodeOfEthics from './professional-ethics/PECodeOfEthics';
import PEAnticorruption from './professional-ethics/PEAnticorruption';
import PEConventions from './professional-ethics/PEConventions';
import PESimulator from './professional-ethics/PESimulator';

interface ProfessionalEthicsProps {
  /** Spustí cvičný test předmětu Profesní etika v modulu Test & Zkouška. */
  onStartSubjectQuiz?: (subject: string) => void;
  /**
   * Kolik otázek z Profesní etiky test opravdu nabídne — z živé banky, po
   * odečtení skrytých. Dřív se tu počítal soubor v repozitáři, takže po
   * úpravách lektora popisek nesouhlasil s testem.
   */
  questionCount: number;
}

/** Přesný název předmětu v bance otázek — musí souhlasit s polem `subject`. */
const ETHICS_SUBJECT = 'Profesní etika';

type EthicsTab = 'concepts' | 'code' | 'anticorruption' | 'conventions' | 'simulator';

/**
 * Podzáložky předmětu. Test mezi nimi není: dřív tu byla záložka
 * „Zkušební test“, která jen odkazovala do modulu Zkouška — stejně jako
 * tlačítko v záhlaví. Test se teď spouští jen tím tlačítkem.
 */
const TABS: { id: EthicsTab; label: string; printTitle: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'concepts', label: 'Klíčové pojmy', printTitle: 'Klíčové pojmy profesní etiky', Icon: BookOpen },
  { id: 'code', label: 'Etický kodex', printTitle: 'Kodex profesní etiky VS ČR (Příloha č. 6 k NGŘ č. 28/2018)', Icon: FileText },
  { id: 'anticorruption', label: 'Protikorupce', printTitle: 'Protikorupční program a korupční rizika', Icon: ShieldAlert },
  { id: 'conventions', label: 'Lidská práva', printTitle: 'Evropská vězeňská pravidla a mezinárodní úmluvy', Icon: Globe2 },
  { id: 'simulator', label: 'Etická dilemata', printTitle: 'Trenažér etických dilemat', Icon: Sparkles },
];

export const ProfessionalEthics: React.FC<ProfessionalEthicsProps> = ({ onStartSubjectQuiz, questionCount }) => {
  const [activeSubTab, setActiveSubTab] = useState<EthicsTab>('concepts');
  const activeTab = TABS.find((t) => t.id === activeSubTab) ?? TABS[0];

  return (
    <div className="w-full space-y-5 pb-12">
      {/* Tisková hlavička – viditelná výhradně při tisku */}
      <div className="hidden print:block">
        <PrintHeader
          subject="Profesní etika & Deontologie"
          docTitle={activeTab.printTitle}
          category="ZOP A"
          subtext="Akademie Vězeňské služby ČR – studijní materiál pro zkoušku ZOP A"
        />
      </div>

      {/* Záhlaví předmětu */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 no-print print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <HeartHandshake className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight">Profesní etika & Deontologie</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Pojmy, etický kodex, protikorupce, lidská práva ve vězeňství a modelové situace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors border border-slate-700 cursor-pointer"
              title="Vytisknout otevřenou část nebo ji uložit do PDF"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Tisk</span>
            </button>
            {onStartSubjectQuiz && (
              <button
                type="button"
                onClick={() => onStartSubjectQuiz(ETHICS_SUBJECT)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                title={`Test z Profesní etiky — v bance je ${questionCount} otázek`}
              >
                <Award className="w-4 h-4" aria-hidden="true" />
                <span>Spustit test</span>
                <span className="text-xs font-semibold text-slate-900/70">({questionCount} ot.)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigace podzáložek */}
      <div role="tablist" aria-label="Části předmětu Profesní etika" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 no-print print:hidden">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeSubTab === id;
          return (
            <button
              type="button"
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSubTab(id)}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {activeSubTab === 'concepts' && <PEConcepts />}
      {activeSubTab === 'code' && <PECodeOfEthics />}
      {activeSubTab === 'anticorruption' && <PEAnticorruption />}
      {activeSubTab === 'conventions' && <PEConventions />}
      {activeSubTab === 'simulator' && <PESimulator />}
    </div>
  );
};

export default ProfessionalEthics;
