import React, { useState } from 'react';
import { Calculator, ShieldAlert, AlertTriangle, Building, Mail, Phone } from 'lucide-react';
import { useStudySections } from '../../hooks/useStudySections';
import StudySectionsEditor from '../common/StudySectionsEditor';
import CustomStudySections from '../common/CustomStudySections';
import RichText from '../common/RichText';

/**
 * Předvolby filtru katalogu. Hledá se podřetězcem v názvu oddělení, proto
 * „Logistika“ najde „Logistika a VZ“. Předvolby zůstávají kvůli dosavadním
 * popiskům; oddělení, které lektor přidá a žádná předvolba ho nenajde,
 * dostane do filtru vlastní položku.
 */
const CATALOG_FILTER_PRESETS: { value: string; label: string }[] = [
  { value: 'Vězeňská stráž', label: 'Vězeňská stráž' },
  { value: 'Pověřené orgány', label: 'Pověřené orgány' },
  { value: 'Personalistika', label: 'Personalistika' },
  { value: 'Logistika', label: 'Logistika & VZ' },
  { value: 'Zdravotnická', label: 'Zdravotnická střediska' },
  { value: 'Správní', label: 'Správní služba' },
];

const matchesDept = (dept: string, filter: string) => dept.toLowerCase().includes(filter.toLowerCase());

/** Barvy ikon kontaktů v pořadí, v jakém byly natvrdo (VS ČR zelená, MSp modrá). */
const CONTACT_COLORS = ['text-emerald-400', 'text-blue-400'];

export const PEAnticorruption: React.FC = () => {
  // Bloky z repozitáře přepsané úpravami lektora (contentLibrary.ts, druh 'study_section').
  const sectionState = useStudySections('protikorupce');
  const { byId, custom } = sectionState;
  const [probScore, setProbScore] = useState<number>(2);
  const [impactScore, setImpactScore] = useState<number>(3);
  const [catalogFilter, setCatalogFilter] = useState<string>('all');

  const contacts = byId('protikorupce-linky');
  const catalog = byId('protikorupce-katalog');
  const riskCatalogItems = catalog?.items ?? [];

  const filterOptions = [
    ...CATALOG_FILTER_PRESETS.filter((preset) => riskCatalogItems.some((item) => matchesDept(item.label, preset.value))),
    ...riskCatalogItems
      .filter((item) => item.label && !CATALOG_FILTER_PRESETS.some((preset) => matchesDept(item.label, preset.value)))
      .map((item) => ({ value: item.label, label: item.label })),
  ].filter((option, idx, all) => all.findIndex((o) => o.value === option.value) === idx);

  const filteredRiskItems = catalogFilter === 'all'
    ? riskCatalogItems
    : riskCatalogItems.filter(item => matchesDept(item.label, catalogFilter));

  const calculatedRiskLevel = probScore * impactScore;

  const getRiskColor = (score: number) => {
    if (score >= 15) return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', label: 'Vysoké / Kritické riziko (15–25)' };
    if (score >= 8) return { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', label: 'Střední riziko (8–14)' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', label: 'Nízké riziko (1–7)' };
  };

  const currentRiskColor = getRiskColor(calculatedRiskLevel);

  return (
    <div className="space-y-6">
      <StudySectionsEditor area="protikorupce" state={sectionState} />

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
              <div className="flex justify-between text-[0.625rem] text-slate-400 mt-1">
                <span>1: Výjimečný</span><span>2: Nepravděpodobný</span><span>3: Pravděpodobný</span><span>4: Častý</span><span>5: Téměř jistý</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">2. Míra dopadu jevu na chod OSS (1–5):</span>
                <span className="text-emerald-400 font-bold font-mono">Stupeň {impactScore} / 5</span>
              </div>
              <input type="range" min={1} max={5} value={impactScore} onChange={(e) => setImpactScore(parseInt(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
              <div className="flex justify-between text-[0.625rem] text-slate-400 mt-1">
                <span>1: Bez vlivu</span><span>2: Malé ztráty</span><span>3: Střední ztráty</span><span>4: Velké ztráty</span><span>5: Devastující</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/90 print:bg-slate-50 border border-slate-700 print:border-slate-300 flex items-center justify-between print:text-[#111827]">
            <div>
              <span className="text-[0.6875rem] font-semibold text-slate-400 print:text-slate-600 uppercase tracking-wider block">Vypočtená míra rizika:</span>
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
        {contacts && (
          <div className="lg:col-span-6 bg-slate-900 print:bg-white p-6 print:p-4 rounded-2xl border border-slate-800 print:border-slate-300 print-card break-inside-avoid print:text-[#111827] space-y-4 print:shadow-none" style={{ breakInside: 'avoid' }}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400 print:text-slate-900" />
              <h3 className="font-bold text-white print:text-[#111827] text-base">{contacts.title}</h3>
            </div>
            {contacts.intro && (
              <p className="text-xs text-slate-300 print:text-[#111827] leading-relaxed">
                <RichText text={contacts.intro} />
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {contacts.items.map((contact, idx) => (
                <div key={`${idx}-${contact.title}`} className="p-3.5 bg-slate-800/80 print:bg-slate-50 rounded-xl border border-slate-700 print:border-slate-300 space-y-2 text-xs print:text-[#111827]">
                  <h4 className="font-bold text-white print:text-[#111827] flex items-center gap-1.5">
                    <Building className={`w-4 h-4 ${CONTACT_COLORS[idx % CONTACT_COLORS.length]} print:text-slate-900`} />
                    <span>{contact.title}</span>
                  </h4>
                  <div className="space-y-1 text-slate-300 print:text-[#111827]">
                    {contact.text && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400 print:text-slate-600" /><span className="font-mono text-[0.6875rem]">{contact.text}</span></div>}
                    {contact.note && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 print:text-slate-600" /><span className="font-mono text-[0.6875rem]">{contact.note}</span></div>}
                    {contact.label && <p className="text-[0.625rem] text-slate-400 print:text-slate-600">{contact.label}</p>}
                  </div>
                </div>
              ))}
            </div>
            {contacts.outro && (
              <div className="p-3 bg-amber-950/30 print:bg-amber-50 border border-amber-500/30 print:border-amber-300 rounded-xl text-xs text-amber-200 print:text-amber-950 leading-relaxed">
                <RichText text={contacts.outro} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Catalog of Risks Table */}
      {catalog && (
        <div className="bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 rounded-2xl p-6 print:p-4 space-y-4 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-white print:text-[#111827] text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 print:text-slate-900" />
              <span>{catalog.title}</span>
            </h3>
            <div className="flex items-center gap-2 no-print print:hidden">
              <select value={catalogFilter} onChange={(e) => setCatalogFilter(e.target.value)} aria-label="Filtrovat katalog podle oddělení" className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500">
                <option value="all">Všechna oddělení</option>
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
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
                {filteredRiskItems.map((item, idx) => {
                  // Míra se počítá, neukládá: dřív tu stálo i pole `score`,
                  // které se dalo přepsat nezávisle na P a D.
                  const hasRating = item.probability !== undefined && item.impact !== undefined;
                  const score = hasRating ? (item.probability ?? 0) * (item.impact ?? 0) : null;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 print:bg-white transition-colors break-inside-avoid print:text-[#111827]" style={{ breakInside: 'avoid' }}>
                      <td className="p-3 font-medium text-white print:text-[#111827] whitespace-nowrap">
                        <span className="text-emerald-400 print:text-slate-900 font-bold block">{item.label}</span>
                        <span className="text-[0.6875rem] text-slate-400 print:text-slate-600">{item.title}</span>
                      </td>
                      <td className="p-3 text-slate-300 print:text-[#111827] max-w-xs"><RichText text={item.text} /></td>
                      <td className="p-3 text-center font-mono text-slate-400 print:text-[#111827] whitespace-nowrap">{hasRating ? `${item.probability} × ${item.impact}` : '—'}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {score !== null && (
                          <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-xs ${score >= 10 ? 'bg-red-500/20 text-red-400 border border-red-500/30 print:bg-red-100 print:text-red-900 print:border-red-300' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 print:bg-amber-100 print:text-amber-900 print:border-amber-300'}`}>
                            {score}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300 print:text-[#111827] max-w-sm"><RichText text={item.note} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bloky přidané lektorem */}
      <CustomStudySections sections={custom} tone="dark" />
    </div>
  );
};

export default PEAnticorruption;
