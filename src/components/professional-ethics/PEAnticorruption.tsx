import React, { useState } from 'react';
import { Info, ShieldAlert, AlertTriangle, Building, Mail, Phone } from 'lucide-react';
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

/**
 * Slovní stupeň míry rizika (součin pravděpodobnosti a dopadu, 1–25).
 *
 * Dřív tu byl posuvníkový „kalkulátor“, který jen násobil dvě čísla, a
 * tabulka pod ním barvila podle jiné hranice (od 10 červeně) než kalkulátor
 * (od 15). Teď platí jedno pásmo pro vysvětlivku i tabulku.
 */
function riskBand(score: number) {
  if (score >= 15) {
    return { label: 'Vysoké', className: 'bg-red-500/20 text-red-300 border-red-500/40 print:bg-red-100 print:text-red-900 print:border-red-300' };
  }
  if (score >= 8) {
    return { label: 'Střední', className: 'bg-amber-500/20 text-amber-300 border-amber-500/40 print:bg-amber-100 print:text-amber-900 print:border-amber-300' };
  }
  return { label: 'Nízké', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 print:bg-emerald-100 print:text-emerald-900 print:border-emerald-300' };
}

const RISK_BANDS: { range: string; score: number }[] = [
  { range: '1–7', score: 1 },
  { range: '8–14', score: 8 },
  { range: '15–25', score: 15 },
];

export const PEAnticorruption: React.FC = () => {
  // Bloky z repozitáře přepsané úpravami lektora (contentLibrary.ts, druh 'study_section').
  const sectionState = useStudySections('protikorupce');
  const { byId, custom } = sectionState;
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

  return (
    <div className="space-y-6">
      <StudySectionsEditor area="protikorupce" state={sectionState} />

      {/* Kontakty protikorupčních linek */}
      <div>
        {contacts && (
          <div className="bg-slate-900 print:bg-white p-6 print:p-4 rounded-2xl border border-slate-800 print:border-slate-300 print-card break-inside-avoid print:text-[#111827] space-y-4 print:shadow-none" style={{ breakInside: 'avoid' }}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400 print:text-slate-900" />
              <h3 className="font-bold text-white print:text-[#111827] text-base">{contacts.title}</h3>
            </div>
            {contacts.intro && (
              <p className="text-xs text-slate-300 print:text-[#111827] leading-relaxed">
                <RichText text={contacts.intro} />
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
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
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-800/60 print:bg-slate-50 border border-slate-700 print:border-slate-300 text-xs text-slate-300 print:text-[#111827] leading-relaxed">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-400 print:text-slate-700" aria-hidden="true" />
            <div className="space-y-2">
              <p>
                <strong className="text-white print:text-slate-900">Jak číst míru rizika:</strong> každé riziko dostává dvě
                známky od 1 do 5 — <strong className="text-white print:text-slate-900">jak pravděpodobné je</strong>, že
                k jednání dojde, a <strong className="text-white print:text-slate-900">jak vážné by byly následky</strong>.
                Jejich součin (1–25) říká, kolik pozornosti a jak přísná opatření riziko potřebuje.
              </p>
              <div className="flex flex-wrap gap-2">
                {RISK_BANDS.map(({ range, score }) => (
                  <span key={range} className={`px-2 py-0.5 rounded-md border font-semibold ${riskBand(score).className}`}>
                    {riskBand(score).label} {range}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse print:text-[#111827]">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-[#111827] bg-slate-950/40 print:bg-slate-100">
                  <th className="p-3 font-semibold">Oddělení / Činnost</th>
                  <th className="p-3 font-semibold">Identifikované korupční riziko</th>
                  <th className="p-3 font-semibold text-center">Míra rizika</th>
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
                      <td className="p-3 text-center whitespace-nowrap">
                        {score !== null ? (
                          <span
                            className={`inline-flex flex-col items-center px-2.5 py-1 rounded-lg border font-bold text-xs ${riskBand(score).className}`}
                            title={`Pravděpodobnost ${item.probability} × dopad ${item.impact} = ${score}`}
                          >
                            <span>{riskBand(score).label}</span>
                            <span className="font-mono text-[0.625rem] font-semibold opacity-80">
                              {item.probability} × {item.impact} = {score}
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
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
