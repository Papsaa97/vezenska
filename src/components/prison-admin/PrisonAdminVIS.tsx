import React from 'react';
import {
  CheckCircle2,
  UserCheck,
  Clock,
  Eye,
  Phone,
} from 'lucide-react';
import { useStudySections } from '../../hooks/useStudySections';
import StudySectionsEditor from '../common/StudySectionsEditor';
import CustomStudySections from '../common/CustomStudySections';
import RichText, { textLines } from '../common/RichText';

/** Ikony evidenčních stavů v pořadí, v jakém byly natvrdo. */
const STATE_ICONS: React.ReactNode[] = [
  <UserCheck key="stav-1" className="w-3.5 h-3.5" />,
  <Clock key="stav-2" className="w-3.5 h-3.5" />,
  <Eye key="stav-3" className="w-3.5 h-3.5" />,
];

const RULE_ICONS: React.ReactNode[] = [
  <CheckCircle2 key="souhlas" className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
  <Phone key="telefon" className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
];

/**
 * VIS — Vězeňský informační systém.
 * Statická vzdělávací sekce (bez lokálního state) — zobrazuje
 * evidenční stavy osob a pravidla poskytování informací dle § 23a
 * zákona č. 555/1992 Sb.
 */
export default function PrisonAdminVIS() {
  // Bloky z repozitáře přepsané úpravami lektora (contentLibrary.ts, druh 'study_section').
  const sectionState = useStudySections('vis');
  const { byId, custom } = sectionState;
  const states = byId('vis-stavy');
  const rules = byId('vis-pravidla');

  return (
    <div className="space-y-6 no-print print:hidden">

      <StudySectionsEditor area="vis" state={sectionState} />

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-5">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            {states?.kicker && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {states.kicker}
              </span>
            )}
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {states?.title || 'Vězeňský informační systém'}
            </h2>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 self-start sm:self-auto">
            § 23a zákona č. 555/1992 Sb.
          </div>
        </div>

        {/* 3 Evidential States of Prisoners */}
        {states && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {states.items.map((item, idx) => {
              return (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs">
                    {STATE_ICONS[idx % STATE_ICONS.length]}
                    <span>{item.label}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <RichText text={item.text} />
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Rules of Information Sharing Grid */}
        {rules && (
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {rules.title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {rules.items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {RULE_ICONS[idx % RULE_ICONS.length]}
                    <span>{item.title}</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[0.6875rem] list-disc list-inside">
                    {textLines(item.text).map((line, lineIdx) => (
                      <li key={lineIdx}><RichText text={line} /></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bloky přidané lektorem */}
      <CustomStudySections sections={custom} tone="adaptive" />

    </div>
  );
}
