import React from 'react';
import {
  Building2,
  Edit2,
  EyeOff,
  ImageIcon,
  Printer,
  Shield,
  Shirt,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import {
  ClassBoardItem,
  getUpcomingUniformInfo,
} from '../../utils/classBoardService';
import CourseCountdownWidget from './CourseCountdownWidget';

interface ClassCardCompactProps {
  item: ClassBoardItem;
  /** Skutečný velitel třídy (z profilů), nebo null. */
  commanderName: string | null;
  /** Platný zástupce velitele, nebo null. */
  deputyName: string | null;
  memberCount: number;
  isMyClass: boolean;
  isManager: boolean;
  isPrivileged: boolean;
  formatUpdateTime: (iso: string) => string;
  /** Jen lektor/správce: zobrazit tuto třídu v podrobném přehledu. */
  onSelectAsMyClass?: () => void;
  onToggleHide: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditUniform: () => void;
  onOpenLightbox: () => void;
  onPrintSchedule: () => void;
}

export default function ClassCardCompact({
  item,
  commanderName,
  deputyName,
  memberCount,
  isMyClass,
  isManager,
  isPrivileged,
  onSelectAsMyClass,
  onToggleHide,
  onEdit,
  onDelete,
  onEditUniform,
  onOpenLightbox,
  onPrintSchedule,
}: ClassCardCompactProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all flex flex-col overflow-hidden shadow-sm hover:shadow-md ${
        isMyClass
          ? 'border-blue-500/70 ring-2 ring-blue-500/20'
          : 'border-slate-200/90 dark:border-slate-800'
      }`}
    >
      {/* Horní lišta */}
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full ${isMyClass ? 'bg-blue-500' : 'bg-slate-400'}`} />
          <h3 className="font-black text-slate-900 dark:text-white text-base truncate">
            {item.className}
          </h3>
          {isMyClass && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Moje
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onSelectAsMyClass && (
            <button
              type="button"
              onClick={onSelectAsMyClass}
              className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline px-1.5 py-0.5 cursor-pointer"
              title="Zobrazit nástěnku této třídy v podrobném přehledu"
            >
              Zobrazit
            </button>
          )}

          <button
            onClick={onToggleHide}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Skrýt tuto třídu z mřížky"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>

          {isPrivileged && (
            <>
              <button
                onClick={onEdit}
                className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                title="Upravit třídu"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                title="Smazat třídu"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Informační odpočet a průběh kurzu */}
      <CourseCountdownWidget
        startDate={item.courseStartDate}
        endDate={item.courseEndDate}
        compact
        canEdit={isPrivileged}
        onEditDates={onEdit}
      />

      <div className="px-4 pt-3 flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5 min-w-0">
          <Shield className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <span className="font-semibold">Velitel:</span>
          <span className="truncate">
            {commanderName || 'zatím nejmenován'}
            {deputyName ? ` (zastupuje ${deputyName})` : ''}
          </span>
        </span>
        <span className="shrink-0 text-slate-500 dark:text-slate-400">Členů: {memberCount}</span>
      </div>

      {/* Tělo kompaktní karty: dva sloupce */}
      <div className="p-4 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Rozvrh */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <span>Rozvrh hodin</span>
            {item.scheduleUrl && (
              <button
                onClick={onPrintSchedule}
                className="text-slate-400 hover:text-slate-200 text-[10px]"
                title="Vytisknout v A4"
              >
                <Printer className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[140px] flex items-center justify-center">
            {item.scheduleUrl ? (
              <button type="button"
                onClick={onOpenLightbox}
                className="group relative w-full h-full min-h-[140px] max-h-[170px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 cursor-pointer"
              >
                <img
                  src={item.scheduleUrl}
                  alt={`Rozvrh ${item.className}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Zvětšit</span>
                </div>
              </button>
            ) : (
              <div className="w-full h-full min-h-[140px] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-3 text-center">
                <ImageIcon className="w-6 h-6 text-slate-400 mb-1 opacity-50" />
                <span className="text-[11px] text-slate-500">Bez rozvrhu</span>
              </div>
            )}
          </div>
        </div>

        {/* Ústroj & Změny */}
        <div className="flex flex-col space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
            <span className="flex items-center gap-1">
              <Shirt className="w-3 h-3" />
              <span>Ústroj</span>
            </span>
            {isManager && (
              <button onClick={onEditUniform} className="text-[10px] hover:underline cursor-pointer">
                Upravit
              </button>
            )}
          </div>

          {(() => {
            const upcoming = getUpcomingUniformInfo(item.uniformGuidance);
            const displayOutfit =
              upcoming.item?.outfit ||
              item.uniformGuidance?.tomorrow ||
              item.uniformGuidance?.today;

            if (!displayOutfit) {
              return (
                <div className="p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-300/30 text-[11px] leading-snug text-slate-400 italic min-h-[50px] flex items-center">
                  Nestanoveno
                </div>
              );
            }

            return (
              <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-300/30 text-[11px] leading-snug text-purple-950 dark:text-purple-200 min-h-[50px] flex flex-col justify-between">
                <div className="flex items-start justify-between gap-1.5">
                  <div>
                    <span className="font-bold text-purple-800 dark:text-purple-300">
                      {upcoming.targetDayLabel}:{' '}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {displayOutfit}
                    </span>
                  </div>
                  {upcoming.hasWorkout && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shrink-0">
                      <span>👟</span>
                      <span>Cvičení</span>
                    </span>
                  )}
                </div>
                {upcoming.item?.workoutNote && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate mt-1">
                    {upcoming.item.workoutNote}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Nejbližší výpomoc Pankrác / Recepce */}
          {item.dutyRoster && item.dutyRoster.length > 0 ? (
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] leading-snug space-y-0.5">
              <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 text-[10px]">
                <Building2 className="w-3 h-3" />
                <span>{item.dutyRoster[0].type === 'pankrac' ? 'Pankrác' : 'Recepce'}</span>
                <span className="text-slate-500 font-normal">({item.dutyRoster[0].date})</span>
              </div>
              <div className="truncate text-slate-700 dark:text-slate-300 font-medium">
                {item.dutyRoster[0].title}
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 italic">
              Žádná vypsaná výpomoc
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
