import React, { useState, useId } from 'react';
import {
  Shield,
  ArrowRight,
  AlertTriangle,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { defaultAdminSections } from '../../data/prisonAdminData';
import RichText from '../common/RichText';

/** Barvy a ikony karet zásad v pořadí, v jakém byly natvrdo; další se opakují dokola. */
const PRINCIPLE_TONES: { box: string; title: string; icon: React.ReactNode }[] = [
  {
    box: 'bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40',
    title: 'text-amber-800 dark:text-amber-300',
    icon: <Shield className="w-4 h-4" />,
  },
  {
    box: 'bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40',
    title: 'text-blue-800 dark:text-blue-300',
    icon: <ArrowRight className="w-4 h-4" />,
  },
  {
    box: 'bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40',
    title: 'text-red-800 dark:text-red-300',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ETŘ sekce — Elektrická evidence trestního řízení, Číslo jednací, Spisová služba.
 * Obsahuje interaktivní generátor čísla jednacího s vlastním lokálním state.
 */
export default function PrisonAdminETR() {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();
  const sections = defaultAdminSections;
  const principles = sections.find((s) => s.id === 'etr-zasady');
  const operations = sections.find((s) => s.id === 'etr-operace');

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

      {/* Interactive Číslo Jednací Decoder */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Interaktivní analyzátor &amp; generátor
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Struktura čísla jednacího (ČJ) v systému ETŘ
            </h2>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            Pokyn GŘ VS ČR č. 4/2016
          </div>
        </div>

        {/* Generated Code Display Box */}
        <div className="bg-slate-950 rounded-2xl p-5 text-center space-y-3 shadow-inner">
          <div className="text-xs font-semibold text-slate-400">
            Výsledný vygenerovaný tvar ČJ v IS ETŘ:
          </div>
          <div className="text-xl sm:text-3xl font-black text-amber-400 font-mono tracking-wider break-all">
            {fullGeneratedCj}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleCopyCj}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              {cjCopyFailed ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              ) : cjCopied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{cjCopyFailed ? 'Kopírování selhalo' : cjCopied ? 'Zkopírováno!' : 'Kopírovat ČJ'}</span>
            </button>
          </div>
          {cjCopyFailed && (
            <div role="alert" className="text-[11px] font-semibold text-red-400">
              Schránka není dostupná — označte ČJ výše a zkopírujte ho ručně.
            </div>
          )}
          <div className="text-[11px] text-slate-400">
            V systému ETŘ vidí všichni oprávnění uživatelé vždy ČJ a název věci!
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
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono"
            />
            <span className="text-[10px] text-slate-400 block">VS = Vězeňská služba</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-1`}>2. Číslo spisu</label>
            <input
              id={`${fieldIds}-1`}
              type="text"
              value={cjSpisNumber}
              onChange={(e) => setCjSpisNumber(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono"
            />
            <span className="text-[10px] text-slate-400 block">Pořadové číslo spisu</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-2`}>3. Číslo dok.</label>
            <input
              id={`${fieldIds}-2`}
              type="text"
              value={cjDocNumber}
              onChange={(e) => setCjDocNumber(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono"
            />
            <span className="text-[10px] text-slate-400 block">Pořadí v rámci spisu</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-3`}>4. Typ spisu</label>
            <select
              id={`${fieldIds}-3`}
              value={cjSpisType}
              onChange={(e) => setCjSpisType(e.target.value as 'ČJ' | 'PŘ' | 'TČ')}
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono cursor-pointer"
            >
              <option value="ČJ">ČJ (Běžné / Svodkové)</option>
              <option value="PŘ">PŘ (Přestupky)</option>
              <option value="TČ">TČ (Trestní řízení)</option>
            </select>
            <span className="text-[10px] text-slate-400 block">ČJ / PŘ / TČ</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-4`}>5. Rok</label>
            <input
              id={`${fieldIds}-4`}
              type="text"
              value={cjYear}
              onChange={(e) => setCjYear(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono"
            />
            <span className="text-[10px] text-slate-400 block">Kalendářní rok</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-5`}>6. Kód OJ (80XXXX)</label>
            <input
              id={`${fieldIds}-5`}
              type="text"
              value={cjOrgCode}
              onChange={(e) => setCjOrgCode(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-amber-600 font-mono"
            />
            <span className="text-[10px] text-slate-400 block">80 = VS ČR + kód OJ</span>
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
              className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-amber-600 font-mono"
            />
          </div>
        </div>

        {/* Educational Breakdown Cards */}
        {principles && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {principles.items.map((item, idx) => {
              const tone = PRINCIPLE_TONES[idx % PRINCIPLE_TONES.length];
              return (
                <div key={idx} className={`p-4 rounded-2xl ${tone.box} space-y-2 text-xs`}>
                  <div className={`font-bold ${tone.title} flex items-center gap-1.5`}>
                    {tone.icon}
                    <span>{item.title}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <span>{operations.title}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {operations.items.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                  {item.label || idx + 1}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                {/* Dřív tu byl dangerouslySetInnerHTML s HTML v textu. Text teď
                    může upravit lektor, proto jen bezpečné **tučně** / *kurzíva*. */}
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  <RichText text={item.text} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
