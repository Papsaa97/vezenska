import React from 'react';
import { BookOpen, Users } from 'lucide-react';

export interface TagOption {
  /** Hodnota ukládaná do štítku — název předmětu nebo id třídy. */
  value: string;
  label: string;
}

interface MaterialTagPickerProps {
  subjectOptions: TagOption[];
  classOptions: TagOption[];
  selectedSubjects: string[];
  selectedClassIds: string[];
  onChange: (next: { subjects: string[]; classIds: string[] }) => void;
  disabled?: boolean;
  /** Menší provedení pro řádek v seznamu souborů. */
  compact?: boolean;
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * Výběr předmětů a tříd, ke kterým soubor patří.
 *
 * Štítků může být libovolný počet — tentýž soubor tak jde přiřadit Právu
 * i Penologii a zároveň dvěma třídám. Seznam tříd se bere z nástěnek, takže
 * nově založená třída je tu hned k dispozici, aniž by se cokoli nastavovalo.
 */
export default function MaterialTagPicker({
  subjectOptions,
  classOptions,
  selectedSubjects,
  selectedClassIds,
  onChange,
  disabled = false,
  compact = false,
}: MaterialTagPickerProps) {
  // Třídy se skládají z celých řetězců. Tailwind je hledá ve zdrojovém kódu,
  // takže `hover:border-${accent}-400` by se do výsledného CSS nikdy nedostalo.
  const BASE = 'rounded-lg border transition-colors cursor-pointer disabled:opacity-50';
  const IDLE =
    'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-semibold';
  const ACTIVE_SUBJECT = 'bg-indigo-600 text-white border-indigo-500 font-bold';
  const ACTIVE_CLASS = 'bg-blue-600 text-white border-blue-500 font-bold';
  const IDLE_SUBJECT_HOVER = 'hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300';
  const IDLE_CLASS_HOVER = 'hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300';

  const chipClass = (active: boolean, accent: 'indigo' | 'blue') => {
    const size = compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]';
    if (active) {
      return `${size} ${BASE} ${accent === 'indigo' ? ACTIVE_SUBJECT : ACTIVE_CLASS}`;
    }
    return `${size} ${BASE} ${IDLE} ${accent === 'indigo' ? IDLE_SUBJECT_HOVER : IDLE_CLASS_HOVER}`;
  };

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          <span>Předměty ({selectedSubjects.length})</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {subjectOptions.length === 0 && (
            <span className="text-[11px] text-slate-400 italic">Žádné předměty k dispozici.</span>
          )}
          {subjectOptions.map((option) => {
            const active = selectedSubjects.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() =>
                  onChange({
                    subjects: toggle(selectedSubjects, option.value),
                    classIds: selectedClassIds,
                  })
                }
                className={chipClass(active, 'indigo')}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>Třídy ({selectedClassIds.length})</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {classOptions.length === 0 && (
            <span className="text-[11px] text-slate-400 italic">
              Zatím není založená žádná třída.
            </span>
          )}
          {classOptions.map((option) => {
            const active = selectedClassIds.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() =>
                  onChange({
                    subjects: selectedSubjects,
                    classIds: toggle(selectedClassIds, option.value),
                  })
                }
                className={chipClass(active, 'blue')}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
