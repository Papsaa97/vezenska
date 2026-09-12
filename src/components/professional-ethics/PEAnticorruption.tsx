import React, { useState } from 'react';
import { Calculator, ShieldAlert, AlertTriangle, Building, Mail, Phone } from 'lucide-react';

const riskCatalogItems = [
  {
    dept: 'Vězeňská stráž',
    action: 'Výkon strážní služby a prohlídky',
    risk: 'Průnik nepovolených předmětů (drogy, mobily), únik informací, nedovolené styky za úplatu',
    prob: 3, impact: 4, score: 12,
    measures: 'Vícestupňový kontrolní systém, rotace strážných, namátkové kontroly personálu, technická detekce.'
  },
  {
    dept: 'Pověřené orgány GŘ / OJ',
    action: 'Provádění úkonů v trestním řízení',
    risk: 'Ovlivnění šetření ve prospěch podezřelého, zatajení trestné činnosti, zkreslení informací OČTŘ',
    prob: 2, impact: 5, score: 10,
    measures: 'Přísná personální kritéria, dozor státního zástupce, elektronická evidence spisů v ETŘ, kontrola 4 očí.'
  },
  {
    dept: 'Personalistika',
    action: 'Vedení osobních údajů a přijímání zaměstnanců',
    risk: 'Únik citlivých dat z VIS/spisů, nepotismus a zvýhodnění příbuzných při výběrových řízeních',
    prob: 2, impact: 5, score: 10,
    measures: 'Vícečlenné výběrové komise, zákaz přímé podřízenosti blízkých osob, audit přístupových logů do personálního systému.'
  },
  {
    dept: 'Logistika a VZ',
    action: 'Zadávání veřejných zakázek a nákupy',
    risk: 'Zmanipulování soutěžních podmínek ve prospěch spřátelené firmy, předražené dodávky, nekvalitní plnění',
    prob: 2, impact: 5, score: 10,
    measures: 'Zadávání přes E-tržiště / EZAK, komisionální přebírání děl, účast zástupců odboru investic MSp.'
  },
  {
    dept: 'Zdravotnická střediska',
    action: 'Výdej léčiv a lékařská posouzení',
    risk: 'Neoprávněný výdej tlumivých léků vězňům, fingování zdravotního stavu pro přerušení trestu',
    prob: 2, impact: 4, score: 8,
    measures: 'Podvojná evidence omamných látek, posuzování oblastní lékařskou komisí, kontrola zdravotními pojišťovnami.'
  },
  {
    dept: 'Správní služba & VIS',
    action: 'Vedení evidence vězněných osob',
    risk: 'Neoprávněný únik informací o vězních, poskytnutí údajů bez právního zájmu za úplatu',
    prob: 3, impact: 4, score: 12,
    measures: 'Jedinečná hesla a přístupová práva, kontrolní bezpečnostní hesla GŘ pro lustrace OČTŘ, logování přístupů.'
  }
];

export const PEAnticorruption: React.FC = () => {
  const [probScore, setProbScore] = useState<number>(2);
  const [impactScore, setImpactScore] = useState<number>(3);
  const [catalogFilter, setCatalogFilter] = useState<string>('all');

  const filteredRiskItems = catalogFilter === 'all'
    ? riskCatalogItems
    : riskCatalogItems.filter(item => item.dept.toLowerCase().includes(catalogFilter.toLowerCase()));

  const calculatedRiskLevel = probScore * impactScore;

  const getRiskColor = (score: number) => {
    if (score >= 15) return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', label: 'Vysoké / Kritické riziko (15–25)' };
    if (score >= 8) return { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', label: 'Střední riziko (8–14)' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', label: 'Nízké riziko (1–7)' };
  };

  const currentRiskColor = getRiskColor(calculatedRiskLevel);

  return (
    <div className="space-y-6">
      {/* Risk Calculator & Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block print:space-y-4">
        <div className="lg:col-span-6 bg-slate-900 print:bg-white p-6 print:p-4 rounded-2xl border border-slate-800 print:border-slate-300 print-card break-inside-avoid print:text-[#111827] space-y-5 print:shadow-none" style={{ breakInside: 'avoid' }}>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400 print:text-slate-900" />
            <h3 className="font-bold text-white print:text-[#111827] text-base">Kalkulátor míry korupčního rizika (NGŘ 28/2018)</h3>
          </div>
          <p className="text-xs text-slate-300 print:text-[#111827]">
            Dle metodiky VS ČR se míra korupčního rizika vypočítává jako prostý součin: <br />
            <strong className="text-emerald-300 print:text-slate-900 font-mono">Míra rizika = Pravděpodobnost výskytu (1–5) × Dopad jevu na chod OSS (1–5)</strong>
          </p>

          <div className="space-y-4 pt-2 no-print print:hidden">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">1. Pravděpodobnost výskytu jevu (1–5):</span>
                <span className="text-emerald-400 font-bold font-mono">Stupeň {probScore} / 5</span>
              </div>
              <input type="range" min={1} max={5} value={probScore} onChange={(e) => setProbScore(parseInt(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1: Výjimečný</span><span>2: Nepravděpodobný</span><span>3: Pravděpodobný</span><span>4: Častý</span><span>5: Téměř jistý</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">2. Míra dopadu jevu na chod OSS (1–5):</span>
                <span className="text-emerald-400 font-bold font-mono">Stupeň {impactScore} / 5</span>
              </div>
              <input type="range" min={1} max={5} value={impactScore} onChange={(e) => setImpactScore(parseInt(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1: Bez vlivu</span><span>2: Malé ztráty</span><span>3: Střední ztráty</span><span>4: Velké ztráty</span><span>5: Devastující</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/90 print:bg-slate-50 border border-slate-700 print:border-slate-300 flex items-center justify-between print:text-[#111827]">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 print:text-slate-600 uppercase tracking-wider block">Vypočtená míra rizika:</span>
              <span className={`text-2xl font-bold font-mono ${currentRiskColor.text} print:text-slate-900`}>{calculatedRiskLevel} / 25</span>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentRiskColor.bg}/20 ${currentRiskColor.text} ${currentRiskColor.border} print:bg-slate-200 print:text-slate-900 print:border-slate-400`}>
                {currentRiskColor.label}
              </span>
            </div>
          </div>
        </div>

        {/* Whistleblowing Contacts */}
        <div className="lg:col-span-6 bg-slate-900 print:bg-white p-6 print:p-4 rounded-2xl border border-slate-800 print:border-slate-300 print-card break-inside-avoid print:text-[#111827] space-y-4 print:shadow-none" style={{ breakInside: 'avoid' }}>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 print:text-slate-900" />
            <h3 className="font-bold text-white print:text-[#111827] text-base">Protikorupční linky & Ochrana oznamovatelů</h3>
          </div>
          <p className="text-xs text-slate-300 print:text-[#111827] leading-relaxed">
            VS ČR deklaruje ochranu oznamovatelů (whistleblowerů) jednající v dobré víře. Zaměstnanec <strong>nesmí být vystaven žádné přímé ani nepřímé diskriminaci či represi</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { icon: Building, color: 'text-emerald-400', title: 'Protikorupční linka VS ČR', email: 'korupce@grvs.justice.cz', phone: '244 024 666', addr: 'Soudní 1672/1a, 140 67 Praha 4' },
              { icon: Building, color: 'text-blue-400', title: 'Protikorupční linka MSp ČR', email: 'korupce@msp.justice.cz', phone: '221 997 595', addr: 'Vyšehradská 16, Praha 2' }
            ].map((contact) => (
              <div key={contact.title} className="p-3.5 bg-slate-800/80 print:bg-slate-50 rounded-xl border border-slate-700 print:border-slate-300 space-y-2 text-xs print:text-[#111827]">
                <h4 className="font-bold text-white print:text-[#111827] flex items-center gap-1.5">
                  <contact.icon className={`w-4 h-4 ${contact.color} print:text-slate-900`} />
                  <span>{contact.title}</span>
                </h4>
                <div className="space-y-1 text-slate-300 print:text-[#111827]">
                  <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400 print:text-slate-600" /><span className="font-mono text-[11px]">{contact.email}</span></div>
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 print:text-slate-600" /><span className="font-mono text-[11px]">{contact.phone}</span></div>
                  <p className="text-[10px] text-slate-400 print:text-slate-600">{contact.addr}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-amber-950/30 print:bg-amber-50 border border-amber-500/30 print:border-amber-300 rounded-xl text-xs text-amber-200 print:text-amber-950 leading-relaxed">
            <strong>Povinný obsah oznámení:</strong> Identifikace podezřelých osob, podrobný popis skutku, konkrétní důkazy a případný požadavek na zachování anonymity oznamovatele.
          </div>
        </div>
      </div>

      {/* Catalog of Risks Table */}
      <div className="bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 rounded-2xl p-6 print:p-4 space-y-4 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-white print:text-[#111827] text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 print:text-slate-900" />
            <span>Příklady z oficiálních Katalogů korupčních rizik VS ČR (NGŘ 28/2018)</span>
          </h3>
          <div className="flex items-center gap-2 no-print print:hidden">
            <select value={catalogFilter} onChange={(e) => setCatalogFilter(e.target.value)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500">
              <option value="all">Všechna oddělení</option>
              <option value="Vězeňská stráž">Vězeňská stráž</option>
              <option value="Pověřené orgány">Pověřené orgány</option>
              <option value="Personalistika">Personalistika</option>
              <option value="Logistika">Logistika & VZ</option>
              <option value="Zdravotnická">Zdravotnická střediska</option>
              <option value="Správní">Správní služba</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse print:text-[#111827]">
            <thead>
              <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-[#111827] bg-slate-950/40 print:bg-slate-100">
                <th className="p-3 font-semibold">Oddělení / Činnost</th>
                <th className="p-3 font-semibold">Identifikované korupční riziko</th>
                <th className="p-3 font-semibold text-center font-mono">P × D</th>
                <th className="p-3 font-semibold text-center">Míra</th>
                <th className="p-3 font-semibold">Stanovená protikorupční opatření</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-slate-300 print:text-[#111827]">
              {filteredRiskItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 print:bg-white transition-colors break-inside-avoid print:text-[#111827]" style={{ breakInside: 'avoid' }}>
                  <td className="p-3 font-medium text-white print:text-[#111827] whitespace-nowrap">
                    <span className="text-emerald-400 print:text-slate-900 font-bold block">{item.dept}</span>
                    <span className="text-[11px] text-slate-400 print:text-slate-600">{item.action}</span>
                  </td>
                  <td className="p-3 text-slate-300 print:text-[#111827] max-w-xs">{item.risk}</td>
                  <td className="p-3 text-center font-mono text-slate-400 print:text-[#111827] whitespace-nowrap">{item.prob} × {item.impact}</td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-xs ${item.score >= 10 ? 'bg-red-500/20 text-red-400 border border-red-500/30 print:bg-red-100 print:text-red-900 print:border-red-300' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 print:bg-amber-100 print:text-amber-900 print:border-amber-300'}`}>
                      {item.score}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 print:text-[#111827] max-w-sm">{item.measures}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PEAnticorruption;
