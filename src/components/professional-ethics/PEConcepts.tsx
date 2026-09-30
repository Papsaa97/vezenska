import React, { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useStudySections } from '../../hooks/useStudySections';
import StudySectionsEditor from '../common/StudySectionsEditor';
import RichText from '../common/RichText';
import { StudySectionItem } from '../../data/studySections';

interface ConceptCard {
  /** Klíč karty — id skupiny a pořadí v ní. */
  key: string;
  /** Pořadové číslo napříč všemi skupinami. */
  number: number;
  groupId: string;
  item: StudySectionItem;
}

/**
 * Klíčové pojmy předmětu.
 *
 * Dřív byly natvrdo v tomhle souboru a lektor je neměl jak upravit. Teď jsou
 * to textové bloky podzáložky 'pojmy' (druh 'study_section', stejný překryv
 * content_blocks jako kodex nebo EVP): jeden blok = jedna skupina pojmů,
 * název bloku je filtr. Skupinu, kterou lektor přidá, stránka vykreslí
 * stejně jako výchozí — jako karty pojmů.
 */
export const PEConcepts: React.FC = () => {
  const sectionState = useStudySections('pojmy');
  const { sections } = sectionState;
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const cards = useMemo<ConceptCard[]>(() => {
    let number = 0;
    return sections.flatMap((section) =>
      section.items.map((item, idx) => {
        number += 1;
        return { key: `${section.id}-${idx}`, number, groupId: section.id, item };
      })
    );
  }, [sections]);

  // Skupina mohla zmizet (lektor ji skryl) — filtr se pak vrátí na vše.
  const activeGroup = sections.some((s) => s.id === groupFilter) ? groupFilter : 'all';
  const query = search.trim().toLowerCase();
  const visible = cards.filter((card) => {
    if (activeGroup !== 'all' && card.groupId !== activeGroup) return false;
    if (!query) return true;
    const { title, text, note, label } = card.item;
    return [title, text, note, label].some((field) => field.toLowerCase().includes(query));
  });

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
      active ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
    }`;

  return (
    <div className="space-y-4">
      <StudySectionsEditor area="pojmy" state={sectionState} noun="skupinu" addLabel="Přidat skupinu pojmů" />

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 no-print print:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 flex-1 min-w-0">
          <button type="button" onClick={() => setGroupFilter('all')} className={chip(activeGroup === 'all')}>
            Vše ({cards.length})
          </button>
          {sections.map((section) => (
            <button
              type="button"
              key={section.id}
              onClick={() => setGroupFilter(section.id)}
              className={chip(activeGroup === section.id)}
            >
              {section.title} ({section.items.length})
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat pojem…"
            aria-label="Hledat v klíčových pojmech"
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {visible.length === 0 && (
        <p className="text-center text-sm text-slate-400 italic py-8 no-print print:hidden">
          {cards.length === 0 ? 'Zatím tu nejsou žádné pojmy.' : 'Žádný pojem neodpovídá hledání.'}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 print:grid-cols-2 items-start">
        {visible.map(({ key, number, item }) => {
          const isOpen = openKey === key;
          const hasDetail = item.note.length > 0;
          const body = (
            <>
              <span className="flex items-start justify-between gap-2">
                <span className="block font-bold text-sm text-white print:text-[#111827]">
                  <span className="text-slate-500 print:text-slate-600 font-mono text-xs mr-1.5">{number}.</span>
                  {item.title}
                </span>
                {hasDetail && (
                  <ChevronDown
                    aria-hidden="true"
                    className={`w-4 h-4 mt-0.5 shrink-0 text-slate-500 transition-transform no-print print:hidden ${isOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </span>
              {item.label && (
                <span className="inline-block mt-1 text-[0.625rem] font-semibold uppercase tracking-wider text-emerald-400/80 print:text-slate-600">
                  {item.label}
                </span>
              )}
              {item.text && (
                <span className="block mt-1.5 text-xs text-slate-300 print:text-[#111827] leading-relaxed">
                  <RichText text={item.text} />
                </span>
              )}
              {hasDetail && (
                <span
                  className={`${isOpen ? 'block' : 'hidden print:block'} mt-2.5 pt-2.5 border-t border-slate-700/70 print:border-slate-200 text-xs text-emerald-100/90 print:text-[#111827] leading-relaxed`}
                >
                  <RichText text={item.note} />
                </span>
              )}
            </>
          );
          const cardClass = `w-full text-left p-4 rounded-xl border transition-colors print-card break-inside-avoid print:bg-white print:border-slate-300 print:shadow-none ${
            isOpen ? 'bg-slate-800/90 border-emerald-500/60' : 'bg-slate-900/80 border-slate-800'
          }`;
          // Pojem bez podrobného výkladu nemá co rozbalit, tak není tlačítkem.
          return hasDetail ? (
            <button
              type="button"
              key={key}
              aria-expanded={isOpen}
              onClick={() => setOpenKey(isOpen ? null : key)}
              className={`${cardClass} cursor-pointer hover:border-slate-600`}
              style={{ breakInside: 'avoid' }}
            >
              {body}
            </button>
          ) : (
            <div key={key} className={cardClass} style={{ breakInside: 'avoid' }}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PEConcepts;
