import React from 'react';
import { StudySection } from '../../data/studySections';
import RichText, { textLines } from './RichText';

interface CustomStudySectionsProps {
  sections: StudySection[];
  /**
   * Barevné pojetí záložky: Profesní etika je tmavá i ve světlém režimu
   * (a má tiskové varianty), Administrativa se řídí světlým/tmavým režimem.
   */
  tone: 'dark' | 'adaptive';
}

const TONES = {
  dark: {
    card: 'bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 print:text-[#111827] print:shadow-none',
    title: 'text-white print:text-[#111827]',
    kicker: 'text-emerald-400 print:text-slate-900',
    body: 'text-slate-300 print:text-[#111827]',
    item: 'bg-slate-800/70 print:bg-slate-50 border border-slate-700 print:border-slate-300',
    itemTitle: 'text-emerald-300 print:text-slate-900',
    label: 'bg-emerald-500/20 print:bg-slate-100 text-emerald-300 print:text-slate-900 border border-emerald-500/30 print:border-slate-300',
    note: 'text-slate-400 print:text-slate-700',
    outro: 'bg-amber-950/30 print:bg-amber-50 border border-amber-500/30 print:border-amber-300 text-amber-200 print:text-amber-950',
  },
  adaptive: {
    card: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm',
    title: 'text-slate-900 dark:text-slate-100',
    kicker: 'text-amber-600 dark:text-amber-400',
    body: 'text-slate-600 dark:text-slate-300',
    item: 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700',
    itemTitle: 'text-slate-900 dark:text-slate-100',
    label: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
    note: 'text-slate-500 dark:text-slate-400',
    outro: 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200',
  },
} as const;

/**
 * Bloky, které přidal lektor. Výchozí bloky mají každý své rozvržení
 * v komponentě podzáložky; pro nové žádné neexistuje, proto dostanou jedno
 * společné — nadpis, úvod, karty bodů a závěrečnou poznámku.
 */
export default function CustomStudySections({ sections, tone }: CustomStudySectionsProps) {
  const t = TONES[tone];
  return (
    <>
      {sections.map((section) => (
        <section
          key={section.id}
          className={`${t.card} rounded-2xl p-6 print:p-4 space-y-4 print-card break-inside-avoid`}
          style={{ breakInside: 'avoid' }}
        >
          <div>
            {section.kicker && (
              <span className={`text-xs font-bold uppercase tracking-wider ${t.kicker}`}>{section.kicker}</span>
            )}
            <h3 className={`text-base font-bold ${t.title}`}>{section.title}</h3>
          </div>

          {textLines(section.intro).map((line, idx) => (
            <p key={idx} className={`text-xs md:text-sm leading-relaxed ${t.body}`}>
              <RichText text={line} />
            </p>
          ))}

          {section.items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.items.map((item, idx) => (
                <div key={idx} className={`${t.item} p-4 rounded-xl space-y-1.5 text-xs`}>
                  {(item.label || item.title) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.label && (
                        <span className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold ${t.label}`}>{item.label}</span>
                      )}
                      {item.title && <h4 className={`font-bold text-sm ${t.itemTitle}`}>{item.title}</h4>}
                    </div>
                  )}
                  {textLines(item.text).map((line, lineIdx) => (
                    <p key={lineIdx} className={`leading-relaxed ${t.body}`}>
                      <RichText text={line} />
                    </p>
                  ))}
                  {item.note && (
                    <p className={`text-[11px] leading-relaxed ${t.note}`}>
                      <RichText text={item.note} />
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {section.outro && (
            <div className={`${t.outro} p-3 rounded-xl text-xs leading-relaxed`}>
              <RichText text={section.outro} />
            </div>
          )}
        </section>
      ))}
    </>
  );
}
