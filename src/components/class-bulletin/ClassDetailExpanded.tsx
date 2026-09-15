import React from 'react';
import {
  BookOpen,
  Building2,
  Calendar,
  Clock,
  Download,
  Edit2,
  FileText,
  MapPin,
  Plus,
  Printer,
  Shirt,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import {
  ClassBoardItem,
  normalizeUniformDays,
  getTodayCzechName,
} from '../../utils/classBoardService';
import CourseCountdownWidget from './CourseCountdownWidget';

interface ClassDetailExpandedProps {
  item: ClassBoardItem;
  isManager: boolean;
  isPrivileged: boolean;
  formatUpdateTime: (iso: string) => string;
  onEdit: () => void;
  onEditUniform: () => void;
  onAddDuty: () => void;
  onDeleteDuty: (id: string) => void;
  onAddSection: () => void;
  onDeleteSection: (id: string) => void;
  onOpenLightbox: () => void;
  onPrintSchedule: () => void;
}

export default function ClassDetailExpanded({
  item,
  isManager,
  isPrivileged,
  formatUpdateTime,
  onEdit,
  onEditUniform,
  onAddDuty,
  onDeleteDuty,
  onAddSection,
  onDeleteSection,
  onOpenLightbox,
  onPrintSchedule,
}: ClassDetailExpandedProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden space-y-6 p-6 sm:p-8">
      {/* Horní hlavička třídy */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            {item.className.replace(/[^0-9A-Z]/g, '').slice(-3) || 'VS'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Třída {item.className}
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-400/30">
                Moje třída
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Aktualizováno: {formatUpdateTime(item.updatedAt)}
              </span>
              {item.uniformGuidance?.updatedBy && (
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  • {item.uniformGuidance.updatedBy}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Akční tlačítka správy */}
        <div className="flex items-center gap-2 flex-wrap">
          {isManager && (
            <>
              <button
                onClick={onEditUniform}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600/15 hover:bg-purple-600/25 text-purple-700 dark:text-purple-300 border border-purple-400/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Upravit ústrojovou kázeň"
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Ústrojová kázeň</span>
              </button>
              <button
                onClick={onAddDuty}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-400/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Přidat termín služby (Pankrác, Recepce...)"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>+ Služba / Pankrác</span>
              </button>
              <button
                onClick={onAddSection}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Přidat novou modulární sekci"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Sekce</span>
              </button>
            </>
          )}

          {isPrivileged && (
            <button
              onClick={onEdit}
              className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Upravit třídu a rozvrh"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Informační odpočet a průběh kurzu */}
      <CourseCountdownWidget
        startDate={item.courseStartDate}
        endDate={item.courseEndDate}
        canEdit={isPrivileged}
        onEditDates={onEdit}
      />

      {/* Sekce Denní hlášení, operativní změny & zkoušky */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-500/20 dark:border-blue-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Denní hlášení, operativní změny &amp; zkoušky</span>
          </h3>
          {isPrivileged && (
            <button
              onClick={onEdit}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Upravit hlášení</span>
            </button>
          )}
        </div>

        <div className="text-xs leading-relaxed space-y-2">
          {item.infoText ? (
            item.infoText
              .split('\n')
              .filter((l) => l.trim().length > 0)
              .map((line, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-slate-800 dark:text-slate-100">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span className="whitespace-pre-wrap font-medium">{line.replace(/^[•\-*]\s*/, '')}</span>
                </div>
              ))
          ) : (
            <div className="text-slate-400 italic py-1">
              Žádné aktuální změny ani mimořádná hlášení nejsou zadána.
            </div>
          )}
        </div>
      </div>

      {/* Dva hlavní pilíře vedle sebe: 1. Rozvrh hodin, 2. Ústrojová kázeň */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sloupec Rozvrh hodin (7/12) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Rozvrh hodin třídy {item.className}</span>
            </h3>
            {item.scheduleUrl && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrintSchedule}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Tisk A4</span>
                </button>
                <button
                  onClick={onOpenLightbox}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Celoobrazovkový náhled</span>
                </button>
              </div>
            )}
          </div>

          {item.scheduleUrl ? (
            <button type="button"
              onClick={onOpenLightbox}
              className="group relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={item.scheduleUrl}
                alt={`Rozvrh ${item.className}`}
                className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm">
                <ZoomIn className="w-5 h-5" />
                <span>Kliknutím otevřete velký rozvrh s možností zoomu</span>
              </div>
            </button>
          ) : (
            <div className="w-full h-72 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col items-center justify-center p-6 text-center">
              <Calendar className="w-12 h-12 text-slate-400 mb-3 opacity-60" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Rozvrh pro třídu {item.className} zatím nebyl nahrán
              </span>
              <span className="text-xs text-slate-500 mt-1 max-w-xs">
                Lektor nebo velitel výcviku může nahrát aktuální obrázek rozvrhu v editaci třídy.
              </span>
              {isPrivileged && (
                <button
                  onClick={onEdit}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Nahrát rozvrh nyní
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sloupec Ústrojová kázeň & hlášení velitele (5/12) */}
        <div className="lg:col-span-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              <span>Ústrojová kázeň třídy</span>
            </h3>
            {isManager && (
              <button
                onClick={onEditUniform}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
              >
                Upravit ústroj
              </button>
            )}
          </div>

          <div className="flex-1 bg-gradient-to-br from-purple-500/5 via-slate-50 to-indigo-500/5 dark:from-purple-950/20 dark:via-slate-950/40 dark:to-indigo-950/20 border border-purple-500/20 dark:border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
            {item.uniformGuidance ? (
              <>
                <div className="space-y-2 text-xs">
                  {(() => {
                    const days = normalizeUniformDays(item.uniformGuidance);
                    const todayName = getTodayCzechName();
                    return days.map((d, dIdx) => {
                      const dayName = d.day?.trim() || '';
                      const isToday =
                        dayName.length > 0 &&
                        (dayName.toLowerCase() === todayName.toLowerCase() ||
                          dayName.toLowerCase().includes(todayName.toLowerCase()));
                      return (
                        <div
                          key={`${dayName}-${dIdx}`}
                          className={`p-2.5 rounded-xl border transition-all ${
                            isToday
                              ? 'bg-purple-50/90 dark:bg-purple-950/50 border-purple-400/60 shadow-sm ring-1 ring-purple-400/20'
                              : 'bg-white/85 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold ${
                                  isToday
                                    ? 'text-purple-700 dark:text-purple-300'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {dayName || `Položka ${dIdx + 1}`}
                              </span>
                              {isToday && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white tracking-wider">
                                  Dnes
                                </span>
                              )}
                            </div>

                            {d.hasWorkout && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-[10px] font-semibold">
                                <span>👟</span>
                                <span>Věci na cvičení</span>
                              </span>
                            )}
                          </div>

                          <div className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                            {d.outfit || <span className="text-slate-400 italic font-normal">Nestanoveno</span>}
                          </div>

                          {d.hasWorkout && d.workoutNote && (
                            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-normal">
                              <span>•</span>
                              <span>{d.workoutNote}</span>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>

                {item.uniformGuidance.notes && (
                  <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Poznámka: </span>
                    {item.uniformGuidance.notes}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 pt-2 border-t border-purple-200/40 dark:border-purple-900/40 flex items-center justify-between">
                  <span>Určil: {item.uniformGuidance.updatedBy || 'Velitel třídy'}</span>
                  {item.uniformGuidance.updatedAt && (
                    <span>{formatUpdateTime(item.uniformGuidance.updatedAt)}</span>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 text-slate-400">
                <Shirt className="w-10 h-10 mb-2 opacity-40 text-purple-400" />
                <span className="text-xs font-semibold">Ústrojová kázeň zatím nebyla zadána.</span>
                <span className="text-[11px] mt-0.5 text-slate-500">
                  Velitel třídy nebo lektor může stanovit ústroj na jednotlivé dny.
                </span>
                {isManager && (
                  <button
                    onClick={onEditUniform}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Nastavit ústroj třídy
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dvě doplňující sekce: 1. Operativní služby (Pankrác, Recepce), 2. Denní změny a materiály */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Sekce Mimořádné služby & Výpomoc Pankrác / Recepce */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>Termíny výpomocí &amp; služeb (Pankrác, Recepce)</span>
            </h3>
            {isManager && (
              <button
                onClick={onAddDuty}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                + Přidat termín
              </button>
            )}
          </div>

          <div className="space-y-3">
            {item.dutyRoster && item.dutyRoster.length > 0 ? (
              item.dutyRoster.map((duty) => (
                <div
                  key={duty.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 space-y-2 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${
                          duty.type === 'pankrac'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-400/40'
                            : duty.type === 'recepce'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-400/40'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-400/40'
                        }`}
                      >
                        {duty.type === 'pankrac'
                          ? 'VÝPOMOC PANKRÁC'
                          : duty.type === 'recepce'
                          ? 'RECEPCE AKADEMIE'
                          : duty.type.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {duty.date}
                      </span>
                      {duty.time && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {duty.time}
                        </span>
                      )}
                    </div>

                    {isManager && (
                      <button
                        onClick={() => onDeleteDuty(duty.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                        title="Odstranit záznam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    {duty.title}
                  </h4>

                  {duty.location && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{duty.location}</span>
                    </div>
                  )}

                  {duty.attendees && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-xs">
                      <div className="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase mb-0.5">
                        Určení posluchači:
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {duty.attendees}
                      </div>
                    </div>
                  )}

                  {duty.uniform && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-bold">Požadovaná výstroj:</span> {duty.uniform}
                    </div>
                  )}

                  {duty.notes && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      Poznámka: {duty.notes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs italic">
                Žádné mimořádné služby ani výpomoci na Pankráci nejsou v tomto období vypsány.
              </div>
            )}
          </div>
        </div>

        {/* Sekce Studijní materiály & Modulární sekce */}
        <div className="space-y-4">
          {/* Odkazy na studijní materiály třídy */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Studijní materiály pro třídu {item.className}</span>
            </h3>

            <div className="space-y-2">
              {item.linkedMaterials && item.linkedMaterials.length > 0 ? (
                item.linkedMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {mat.title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          {mat.subject && <span className="font-semibold">{mat.subject}</span>}
                          {mat.sizeLabel && <span>{mat.sizeLabel}</span>}
                        </div>
                      </div>
                    </div>
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      <span>Stáhnout</span>
                    </a>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs italic">
                  K této třídě nejsou přiřazeny žádné specifické soubory. Všechny studijní texty naleznete v hlavní Knihovně.
                </div>
              )}
            </div>
          </div>

          {/* Vlastní modulární sekce */}
          {item.sections && item.sections.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Doplňující sekce třídy
              </h3>
              <div className="space-y-2">
                {item.sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {sec.badge && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {sec.badge}
                          </span>
                        )}
                        <span className="font-bold text-slate-900 dark:text-white">{sec.title}</span>
                      </div>
                      {isManager && (
                        <button
                          onClick={() => onDeleteSection(sec.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                          title="Smazat sekci"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {sec.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
