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

/** Barvy a ikony evidenčních stavů v pořadí, v jakém byly natvrdo. */
const STATE_TONES: { box: string; badge: string; icon: React.ReactNode }[] = [
  {
    box: 'bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50',
    badge: 'bg-amber-500 text-slate-950',
    icon: <UserCheck className="w-3.5 h-3.5" />,
  },
  {
    box: 'bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50',
    badge: 'bg-blue-600 text-white',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    box: 'bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50',
    badge: 'bg-emerald-600 text-white',
    icon: <Eye className="w-3.5 h-3.5" />,
  },
];

const RULE_ICONS: React.ReactNode[] = [
  <CheckCircle2 key="souhlas" className="w-4 h-4 text-emerald-500" />,
  <Phone key="telefon" className="w-4 h-4 text-amber-500" />,
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

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {states?.kicker || 'Vězeňský informační systém VIS'}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {states?.title || 'Vězeňský informační systém'}
            </h2>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
            § 23a zákona č. 555/1992 Sb.
          </div>
        </div>

        {/* 3 Evidential States of Prisoners */}
        {states && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {states.items.map((item, idx) => {
              const tone = STATE_TONES[idx % STATE_TONES.length];
              return (
                <div key={idx} className={`p-5 rounded-2xl ${tone.box} space-y-2.5`}>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${tone.badge} font-bold text-xs`}>
                    {tone.icon}
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
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {RULE_ICONS[idx % RULE_ICONS.length]}
                    <span>{item.title}</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] list-disc list-inside">
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
