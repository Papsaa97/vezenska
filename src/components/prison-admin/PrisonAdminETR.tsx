import React, { useState, useId } from 'react';
import {
  Shield,
  ArrowRight,
  AlertTriangle,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { useStudySections } from '../../hooks/useStudySections';
import StudySectionsEditor from '../common/StudySectionsEditor';
import CustomStudySections from '../common/CustomStudySections';
import RichText from '../common/RichText';

/** Ikony karet zásad v pořadí, v jakém byly natvrdo; další se opakují dokola. */
const PRINCIPLE_ICONS: React.ReactNode[] = [
  <Shield key="zpracovatel" className="w-4 h-4" />,
  <ArrowRight key="hierarchie" className="w-4 h-4" />,
  <AlertTriangle key="pozor" className="w-4 h-4" />,
];

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ETŘ sekce — elektronická spisová služba a číslo jednací.
 * Obsahuje interaktivní generátor čísla jednacího s vlastním lokálním state.
 */
export default function PrisonAdminETR() {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();
  // Bloky z repozitáře přepsané úpravami lektora (contentLibrary.ts, druh 'study_section').
  const sectionState = useStudySections('etr');
  const { byId, custom } = sectionState;
  const principles = byId('etr-zasady');
  const operations = byId('etr-operace');

  const [cjOrg, setCjOrg] = useState('VS');
  const [cjSpisNumber, setCjSpisNumber] = useState('123');
  const [cjDocNumber, setCjDocNumber] = useState('1');
  const [cjSpisType, setCjSpisType] = useState<'ČJ' | 'PŘ' | 'TČ'>('TČ');
  const [cjYear, setCjYear] = useState(String(new Date().getFullYear()));
  const [cjOrgCode, setCjOrgCode] = useState('801345');
  const [cjCustomExt, setCjCustomExt] = useState('LOG/02');
  const [cjCopied, setCjCopied] = useState(false);
  const [cjCopyFailed, setCjCopyFailed] = useState(false);

  const fullGeneratedCj = `${cjOrg}-${cjSpisNumber}-${cjDocNumber}/${cjSpisType}-${cjYear}-${cjOrgCode}${cjCustomExt ? '-' + cjCustomExt : ''}`;

  const handleCopyCj = () => {
    navigator.clipboard.writeText(fullGeneratedCj).then(() => {
      setCjCopyFailed(false);
      setCjCopied(true);
      setTimeout(() => setCjCopied(false), 2000);
    }).catch(() => {
      // Schránka bývá nedostupná bez HTTPS nebo bez svolení uživatele. Dřív se
      // po kliknutí nestalo vůbec nic a nešlo poznat, jestli se zkopírovalo.
      setCjCopyFailed(true);
      setTimeout(() => setCjCopyFailed(false), 4000);
    });
  };

  return (
    <div className="space-y-6 no-print print:hidden">

      <StudySectionsEditor area="etr" state={sectionState} />

      {/* Interactive Číslo Jednací Decoder */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-5">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Jak je složené číslo jednací (ČJ)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Změňte kteroukoli část a hned uvidíte výsledný tvar.
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 self-start sm:self-auto">
            Pokyn GŘ VS ČR č. 4/2016
          </div>
        </div>

        {/* Generated Code Display Box */}
        <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5 text-center space-y-3">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Výsledný tvar ČJ:
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-400 font-mono tracking-wider break-all">
            {fullGeneratedCj}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleCopyCj}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              {cjCopyFailed ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              ) : cjCopied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{cjCopyFailed ? 'Kopírování selhalo' : cjCopied ? 'Zkopírováno' : 'Kopírovat ČJ'}</span>
            </button>
          </div>
          {cjCopyFailed && (
            <div role="alert" className="text-[0.6875rem] font-semibold text-red-600 dark:text-red-400">
              Schránka není dostupná — označte ČJ výše a zkopírujte ho ručně.
            </div>
          )}
          <div className="text-[0.6875rem] text-slate-500 dark:text-slate-400">
            ČJ a název věci vidí v ETŘ vždy všichni oprávnění uživatelé.
          </div>
        </div>

        {/* Interactive Inputs for Segments */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-0`}>1. Organizace</label>
            <input
              id={`${fieldIds}-0`}
              type="text"
              value={cjOrg}
              onChange={(e) => setCjOrg(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-semibold text-slate-900 dark:text-slate-100 font-mono"
            />
            <span className="text-[0.625rem] text-slate-400 block">VS = Vězeňská služba</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-1`}>2. Číslo spisu</label>
            <input
              id={`${fieldIds}-1`}
              type="text"
              value={cjSpisNumber}
              onChange={(e) => setCjSpisNumber(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-semibold text-slate-900 dark:text-slate-100 font-mono"
            />
            <span className="text-[0.625rem] text-slate-400 block">Pořadové číslo spisu</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-2`}>3. Číslo dok.</label>
            <input
              id={`${fieldIds}-2`}
              type="text"
              value={cjDocNumber}
              onChange={(e) => setCjDocNumber(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-semibold text-slate-900 dark:text-slate-100 font-mono"
            />
            <span className="text-[0.625rem] text-slate-400 block">Pořadí v rámci spisu</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-3`}>4. Typ spisu</label>
            <select
              id={`${fieldIds}-3`}
              value={cjSpisType}
              onChange={(e) => setCjSpisType(e.target.value as 'ČJ' | 'PŘ' | 'TČ')}
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-semibold text-slate-900 dark:text-slate-100 font-mono cursor-pointer"
            >
              <option value="ČJ">ČJ</option>
              <option value="PŘ">PŘ</option>
              <option value="TČ">TČ</option>
            </select>
            <span className="text-[0.625rem] text-slate-400 block">ČJ běžný, PŘ přestupek, TČ trestní řízení</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-4`}>5. Rok</label>
            <input
              id={`${fieldIds}-4`}
              type="text"
              value={cjYear}
              onChange={(e) => setCjYear(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-semibold text-slate-900 dark:text-slate-100 font-mono"
            />
            <span className="text-[0.625rem] text-slate-400 block">Kalendářní rok</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-5`}>6. Kód OJ (80XXXX)</label>
            <input
              id={`${fieldIds}-5`}
              type="text"
              value={cjOrgCode}
              onChange={(e) => setCjOrgCode(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-semibold text-slate-900 dark:text-slate-100 font-mono"
            />
            <span className="text-[0.625rem] text-slate-400 block">80 = VS ČR + kód OJ</span>
          </div>

        </div>

        {/* Custom Extension Input */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-6`}>7. Přípona (volitelná, např. LOG/02)</label>
            <input
              id={`${fieldIds}-6`}
              type="text"
              value={cjCustomExt}
              onChange={(e) => setCjCustomExt(e.target.value)}
              placeholder="LOG/02"
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>
        </div>

        {/* Educational Breakdown Cards */}
        {principles && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {principles.items.map((item, idx) => {
              return (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="text-amber-600 dark:text-amber-400">{PRINCIPLE_ICONS[idx % PRINCIPLE_ICONS.length]}</span>
                    <span>{item.title}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[0.6875rem] leading-relaxed">
                    <RichText text={item.text} />
                  </p>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Step-by-Step Interactive Guide to ETŘ Operations */}
      {operations && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>{operations.title}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {operations.items.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-sm">
                  {item.label || idx + 1}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                {/* Dřív tu byl dangerouslySetInnerHTML s HTML v textu. Text teď
                    může upravit lektor, proto jen bezpečné **tučně** / *kurzíva*. */}
                <p className="text-slate-600 dark:text-slate-400 text-[0.6875rem] leading-relaxed">
                  <RichText text={item.text} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bloky přidané lektorem */}
      <CustomStudySections sections={custom} tone="adaptive" />

    </div>
  );
}
