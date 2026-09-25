import React from 'react';
import { EyeOff, Lock, Shield, Users } from 'lucide-react';
import type { ClassOverview } from '../../utils/classMembership';
import CourseCountdownWidget from './CourseCountdownWidget';

interface ClassOverviewCardProps {
  item: ClassOverview;
  /** Nezařazený student si o tuto třídu může požádat. */
  canRequest: boolean;
  /** O tuto třídu už uživatel požádal a čeká na schválení. */
  isRequested: boolean;
  onRequest: () => void;
  onToggleHide: () => void;
}

/**
 * Dlaždice cizí třídy: jen přehled (termín kurzu, velitel, počet členů).
 *
 * Rozvrh, služby, ústroj a sekce čtou od migrace 038 jen členové třídy,
 * lektoři a správci — server je ostatním vůbec nepošle.
 */
export default function ClassOverviewCard({
  item,
  canRequest,
  isRequested,
  onRequest,
  onToggleHide,
}: ClassOverviewCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <h3 className="font-black text-slate-900 dark:text-white text-base truncate">{item.className}</h3>
        </div>
        <button
          type="button"
          onClick={onToggleHide}
          aria-label={`Skrýt třídu ${item.className} z mřížky`}
          title="Skrýt tuto třídu z mřížky"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
        >
          <EyeOff className="w-3.5 h-3.5" />
        </button>
      </div>

      <CourseCountdownWidget
        startDate={item.courseStartDate}
        endDate={item.courseEndDate}
        compact
      />

      <div className="p-4 flex-1 space-y-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Shield className="w-3.5 h-3.5 text-purple-500" />
          <span className="font-semibold">Velitel třídy:</span>
          <span>{item.commanderName || 'zatím nejmenován'}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold">Členů:</span>
          <span>{item.memberCount}</span>
        </div>
        <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 pt-1">
          <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Rozvrh, služby a ústroj vidí jen členové třídy.</span>
        </div>
      </div>

      {canRequest && (
        <div className="px-4 pb-4">
          {isRequested ? (
            <div className="text-center text-xs font-semibold text-amber-700 dark:text-amber-400 py-2">
              Žádost čeká na schválení velitelem
            </div>
          ) : (
            <button
              type="button"
              onClick={onRequest}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
            >
              Požádat o zařazení
            </button>
          )}
        </div>
      )}
    </div>
  );
}
