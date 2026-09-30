import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { MatchingCategory, MatchingRecord, MatchingDiagramPart } from '../types';
import { recordMatchingCompletion } from '../utils/gamification';
import PrintHeader from './common/PrintHeader';
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { activateOnKey } from '../utils/a11y';

/** Fisher–Yates: každá permutace stejně pravděpodobná (sort(random) není). */
function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function DraggablePart({
  part,
  isMatched,
  isSelected,
  onSelect
}: {
  part: MatchingDiagramPart;
  isMatched: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
} & React.Attributes) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: part.id,
    disabled: isMatched
  });

  const style: React.CSSProperties | undefined = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
    transition: 'none', // Critical: no CSS transition delay while moving with cursor
    willChange: 'transform'
  } : undefined;

  if (isMatched) {
    return (
      <div className="w-auto px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 opacity-50 line-through text-[0.625rem] sm:text-xs font-semibold border border-emerald-300 dark:border-emerald-800 select-none">
        {part.label}
      </div>
    );
  }

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      {...listeners}
      {...attributes}
      aria-pressed={isSelected || isDragging}
      className={`touch-none cursor-grab active:cursor-grabbing w-auto px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[0.625rem] sm:text-xs font-bold border select-none ${
        isDragging
          ? 'bg-violet-500/10 text-violet-900 dark:text-white border-violet-500 ring-2 ring-violet-500 shadow-md opacity-95 pointer-events-none'
          : isSelected
            ? 'bg-violet-600 text-white border-violet-600 ring-2 ring-violet-400 ring-offset-1 dark:ring-offset-slate-900'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-400'
      }`}
    >
      {part.label}
    </button>
  );
}

function DroppableZone({
  part,
  index,
  isMatched,
  isActive,
  isSelectedTarget,
  onZoneClick
}: {
  part: MatchingDiagramPart;
  /** Pořadí ve schématu — do popisku pro čtečku; název součásti prozradit nesmí. */
  index: number;
  isMatched: boolean;
  isActive: boolean;
  isSelectedTarget?: boolean;
  onZoneClick?: () => void;
} & React.Attributes) {
  const y = part.labelTop ?? part.top;
  const x = part.labelLeft ?? part.left;

  const { isOver, setNodeRef } = useDroppable({
    id: part.id,
    disabled: isMatched
  });

  return (
    <div
      ref={setNodeRef}
      role={isMatched ? undefined : 'button'}
      tabIndex={isMatched ? undefined : 0}
      aria-label={isMatched ? `Pozice ${index + 1}: ${part.label}` : `Pozice ${index + 1}, prázdná`}
      onClick={!isMatched ? onZoneClick : undefined}
      onKeyDown={isMatched || !onZoneClick ? undefined : activateOnKey(onZoneClick)}
      style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
      className={`absolute z-10 flex items-center justify-center cursor-pointer select-none ${
        isMatched
          ? 'bg-emerald-600 text-white rounded-md px-1.5 py-0.5 text-[0.5rem] sm:text-[0.625rem] font-bold max-w-[85px] sm:max-w-[130px] truncate sm:whitespace-nowrap'
          : isOver || isSelectedTarget
            ? 'w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-violet-500/60 border-2 border-violet-500 transition-transform duration-100'
            : isActive
              ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/90 dark:bg-slate-800/90 border-2 border-violet-400'
              : 'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border-2 border-slate-400 dark:border-slate-500 hover:scale-110 transition-transform duration-150'
      }`}
    >
      {isMatched ? (
        <span className="flex items-center gap-1 truncate"><CheckCircle2 className="w-2.5 h-2.5 shrink-0" aria-hidden="true" /> {part.label}</span>
      ) : (
        <div className="w-1.5 h-1.5 bg-current rounded-full" />
      )}
    </div>
  );
}

/** Průběžná počítadla, která hlásí nadřazené Poznávačce do společné hlavičky. */
export interface DiagramStats {
  timeElapsed: number;
  mistakes: number;
  matched: number;
  total: number;
}

interface DiagramGameProps {
  category: MatchingCategory;
  /** Po dokončení — nadřazená Poznávačka ukáže společnou vítěznou kartu. */
  onGameComplete?: (record: MatchingRecord) => void;
  onStatsChange?: (stats: DiagramStats) => void;
}

export default function DiagramGame({ category, onGameComplete, onStatsChange }: DiagramGameProps & React.Attributes) {
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 6,
      },
    })
  );

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [shuffledParts, setShuffledParts] = useState<MatchingDiagramPart[]>([]);

  const totalParts = category.parts?.length ?? 0;

  useEffect(() => {
    setMatchedIds([]);
    setMistakesCount(0);
    setTimeElapsed(0);
    setIsTimerRunning(true);
    setSelectedPartId(null);
    startTimeRef.current = Date.now();
    setShuffledParts(shuffle(category.parts ?? []));
  }, [category]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        setTimeElapsed(elapsed);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  useEffect(() => {
    onStatsChange?.({ timeElapsed, mistakes: mistakesCount, matched: matchedIds.length, total: totalParts });
  }, [onStatsChange, timeElapsed, mistakesCount, matchedIds.length, totalParts]);

  const isComplete = totalParts > 0 && matchedIds.length === totalParts;

  useEffect(() => {
    if (isComplete && isTimerRunning) {
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);

      const finalTime = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const flawless = mistakesCount === 0;

      const { record } = recordMatchingCompletion({
        categoryId: category.id,
        categoryTitle: category.title,
        timeSeconds: finalTime,
        errorsCount: mistakesCount,
        flawless,
        pairsCount: category.parts?.length || 0
      });

      if (onGameComplete) onGameComplete(record);
    }
  }, [isComplete, isTimerRunning, category, mistakesCount, onGameComplete]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
    setSelectedPartId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) {
      setMatchedIds(prev => [...prev, active.id as string]);
    } else {
      setMistakesCount(prev => prev + 1);
    }
  };

  // Handle tap-to-select and tap-to-place (for mobile convenience)
  const handlePartSelect = (partId: string) => {
    if (matchedIds.includes(partId)) return;
    setSelectedPartId(prev => prev === partId ? null : partId);
  };

  const handleZoneClick = (targetPartId: string) => {
    if (!selectedPartId) return;

    if (selectedPartId === targetPartId) {
      setMatchedIds(prev => [...prev, selectedPartId]);
      setSelectedPartId(null);
    } else {
      setMistakesCount(prev => prev + 1);
      setSelectedPartId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 overflow-x-hidden select-none">
      {/* Interaktivní plocha (při tisku skrytá) */}
      <div className="no-print flex flex-col gap-3 sm:gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Přetáhněte název na správné místo ve schématu, nebo název vyberte a potom klepněte na pozici.
        </p>

        <DndContext autoScroll={false} sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Container strictly locked to 1:1 aspect ratio with overflow protection and touch isolation */}
          <div className="relative w-full max-w-[55vh] mx-auto aspect-square bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 sm:p-3 shrink-0 touch-none select-none overscroll-contain overflow-hidden">
            <div className="relative w-full h-full pointer-events-auto">
              <img src={category.imageUrl} alt={category.title} className="w-full h-full object-contain pointer-events-none select-none opacity-95 dark:opacity-90 mix-blend-multiply dark:mix-blend-normal" draggable={false} />

              {/* SVG lines connecting the actual part to the label drop zone */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
                {category.parts?.map(part => {
                  if (part.labelTop === undefined || part.labelLeft === undefined) return null;
                  return (
                    <line
                      key={`line-${part.id}`}
                      x1={`${part.labelLeft}%`}
                      y1={`${part.labelTop}%`}
                      x2={`${part.left}%`}
                      y2={`${part.top}%`}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-slate-400/60 dark:text-slate-500/60"
                      strokeDasharray="4 2"
                    />
                  );
                })}
              </svg>

              {/* Kotevní tečka přímo na součásti */}
              {category.parts?.map(part => {
                if (part.labelTop === undefined || part.labelLeft === undefined) return null;
                return (
                  <div
                    key={`dot-${part.id}`}
                    className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-violet-500 border border-white dark:border-slate-900 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[5]"
                    style={{ top: `${part.top}%`, left: `${part.left}%` }}
                  />
                );
              })}

              {/* Drop Zones (positioned at labelTop / labelLeft so they don't crowd the image center) */}
              {category.parts?.map((part, index) => (
                <DroppableZone
                  key={part.id}
                  part={part}
                  index={index}
                  isMatched={matchedIds.includes(part.id)}
                  isActive={activeDragId === part.id}
                  isSelectedTarget={selectedPartId === part.id}
                  onZoneClick={() => handleZoneClick(part.id)}
                />
              ))}
            </div>
          </div>

          {/* Názvy k umístění */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shrink-0">
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
              {shuffledParts.map(part => (
                <DraggablePart
                  key={part.id}
                  part={part}
                  isMatched={matchedIds.includes(part.id)}
                  isSelected={selectedPartId === part.id}
                  onSelect={() => handlePartSelect(part.id)}
                />
              ))}
            </div>
          </div>
        </DndContext>
      </div>

      {/* Procvičovací list (jen při tisku) */}
      <div className="hidden print:block w-full text-slate-900 bg-white">
        <PrintHeader
          subject={`Poznávačka – ${category.title}`}
          docTitle="Procvičovací list"
          subtext="Studijní portál – neoficiální studijní materiál"
        />

        <div className="print-card mb-4 p-3 border border-slate-400 rounded-lg text-xs grid grid-cols-3 gap-3">
          <div><span className="font-bold">Jméno:</span> ............................................</div>
          <div><span className="font-bold">Datum:</span> .........................</div>
          <div><span className="font-bold">Výsledek:</span> ......... / {totalParts} bodů</div>
        </div>

        <p className="text-xs text-slate-700 italic mb-3">
          Pokyn: Podle číslovaných pozic ve schématu doplňte do očíslovaných řádků názvy vyznačených součástí.
        </p>

        {/* Schéma s číslovanými pozicemi (1..N) */}
        <div className="print-card print-avoid-break relative w-full max-w-[170mm] mx-auto aspect-[4/3] max-h-[110mm] border border-slate-300 rounded-xl p-2 flex items-center justify-center mb-5 overflow-hidden">
          <div className="relative w-full h-full">
            <img
              src={category.imageUrl}
              alt={category.title}
              className="w-full h-full object-contain pointer-events-none select-none filter contrast-125"
            />

            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
              {category.parts?.map((part) => {
                const targetX = part.labelLeft ?? part.left;
                const targetY = part.labelTop ?? part.top;
                return (
                  <line
                    key={`print-line-${part.id}`}
                    x1={`${targetX}%`}
                    y1={`${targetY}%`}
                    x2={`${part.left}%`}
                    y2={`${part.top}%`}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                );
              })}
            </svg>

            {category.parts?.map((part) => (
              <div
                key={`print-dot-${part.id}`}
                className="absolute w-2 h-2 rounded-full bg-slate-900 transform -translate-x-1/2 -translate-y-1/2 z-[5]"
                style={{ top: `${part.top}%`, left: `${part.left}%` }}
              />
            ))}

            {category.parts?.map((part, index) => {
              const posX = part.labelLeft ?? part.left;
              const posY = part.labelTop ?? part.top;
              return (
                <div
                  key={`print-badge-${part.id}`}
                  style={{ top: `${posY}%`, left: `${posX}%`, transform: 'translate(-50%, -50%)' }}
                  className="absolute z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-2 border-slate-900 text-slate-900 font-black text-[0.6875rem] flex items-center justify-center"
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Řádky pro odpovědi */}
        <div className="print-card print-avoid-break mb-5 p-3.5 border border-slate-300 rounded-lg">
          <h2 className="font-bold text-xs text-slate-800 mb-2.5 border-b border-slate-200 pb-1">
            Odpovědi
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
            {category.parts?.map((part, idx) => (
              <div key={part.id} className="flex items-center gap-2">
                <span className="font-bold w-6 text-right text-slate-900">{idx + 1}.</span>
                <span className="flex-1 border-b border-dotted border-slate-600 h-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Klíč správných odpovědí na konci */}
        <div className="print-avoid-break mt-6 pt-3 border-t-2 border-dashed border-slate-400">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-slate-900">
              Klíč správných odpovědí
            </span>
            <span className="text-[0.625rem] text-slate-600 italic">
              Před procvičováním odstřihněte nebo přeložte
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-xs text-slate-800">
            {category.parts?.map((part, idx) => (
              <div key={part.id} className="flex items-baseline gap-1.5">
                <span className="font-bold text-slate-900">{idx + 1}.</span>
                <span>{part.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
