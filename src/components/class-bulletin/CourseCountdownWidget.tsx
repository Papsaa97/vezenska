import React, { useMemo } from 'react';
import { Calendar, Edit2 } from 'lucide-react';
import { getCourseCountdown } from '../../utils/classBoardService';

interface CourseCountdownWidgetProps {
  startDate?: string | null;
  endDate?: string | null;
  compact?: boolean;
  onEditDates?: () => void;
  canEdit?: boolean;
}

export default function CourseCountdownWidget({
  startDate,
  endDate,
  compact = false,
  onEditDates,
  canEdit = false,
}: CourseCountdownWidgetProps) {
  const countdown = useMemo(() => getCourseCountdown(startDate, endDate), [startDate, endDate]);

  if (countdown.status === 'unset') {
    if (!canEdit) return null;
    return (
      <div
        className={`rounded-xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 flex items-center justify-between ${
          compact ? 'mx-4 my-2 px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Termín kurzu není nastaven</span>
        </div>
        {onEditDates && (
          <button
            onClick={onEditDates}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-[11px] cursor-pointer"
          >
            Nastavit termín
          </button>
        )}
      </div>
    );
  }

  // Kompaktní varianta pro dlaždici v mřížce
  if (compact) {
    return (
      <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
              {countdown.headline}:
            </span>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
              {countdown.remainingText}
            </span>
          </div>
          {countdown.progressPercent !== undefined && (
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0 bg-blue-100/60 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/40">
              {countdown.progressPercent} %
            </span>
          )}
        </div>

        {countdown.progressPercent !== undefined && countdown.progressPercent > 0 && (
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                countdown.status === 'completed'
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, countdown.progressPercent))}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Rozšířená varianta pro velký detail třídy
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-slate-50/70 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-200/70 dark:border-blue-900/40 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                {countdown.headline}
              </span>
              {countdown.elapsedText && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300/40 dark:border-blue-800/40">
                  {countdown.elapsedText}
                </span>
              )}
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {countdown.remainingText}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto text-left sm:text-right">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Období kurzu
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {countdown.formattedPeriod || 'Neuvedeno'}
            </div>
          </div>
          {canEdit && onEditDates && (
            <button
              onClick={onEditDates}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Upravit termín zahájení a ukončení kurzu"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {countdown.progressPercent !== undefined && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Průběh výcviku</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {countdown.progressPercent} %
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                countdown.status === 'completed'
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, countdown.progressPercent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
