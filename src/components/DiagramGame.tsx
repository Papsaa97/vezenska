import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, ArrowRight, Award, Timer, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { MatchingCategory, MatchingRecord, MatchingDiagramPart } from '../types';
import { recordMatchingCompletion } from '../utils/gamification';
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
      <div className="w-auto px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 opacity-40 line-through text-[10px] sm:text-xs font-semibold border border-emerald-300 dark:border-emerald-800 select-none">
        {part.label}
      </div>
    );
  }

  return (
    <button 
      ref={setNodeRef} 
      style={style} 
      onClick={onSelect}
      {...listeners} 
      {...attributes} 
      className={`touch-none cursor-grab active:cursor-grabbing w-auto px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border select-none ${
        isDragging 
          ? 'bg-blue-50 dark:bg-slate-700 text-blue-900 dark:text-white border-blue-500 ring-2 ring-blue-500 shadow-2xl scale-110 opacity-95 pointer-events-none'
          : isSelected 
            ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400 ring-offset-1 scale-105 shadow-md animate-pulse'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600 shadow-sm hover:border-blue-400 dark:hover:border-blue-400'
      }`}
    >
      {part.label}
    </button>
  );
}

function DroppableZone({ 
  part, 
  isMatched, 
  isActive, 
  isSelectedTarget, 
  onZoneClick 
}: { 
  part: MatchingDiagramPart; 
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
      onClick={!isMatched ? onZoneClick : undefined}
      style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
      className={`absolute z-10 flex items-center justify-center cursor-pointer select-none ${
        isMatched 
          ? 'bg-emerald-600/95 text-white shadow-md rounded-md px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold max-w-[85px] sm:max-w-[130px] truncate sm:whitespace-nowrap transition-transform duration-200'
          : isOver || isSelectedTarget
            ? 'w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-blue-500/60 border-2 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] scale-125 transition-transform duration-100'
            : isActive
              ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/90 border-2 border-blue-400 shadow-sm animate-pulse'
              : 'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border-2 border-slate-400 dark:border-slate-500 shadow-sm hover:scale-110 transition-transform duration-150'
      }`}
    >
      {isMatched ? (
        <span className="flex items-center gap-1 truncate"><CheckCircle2 className="w-2.5 h-2.5 shrink-0"/> {part.label}</span>
      ) : (
        <div className="w-1.5 h-1.5 bg-current rounded-full" />
      )}
    </div>
  );
}

interface DiagramGameProps {
  category: MatchingCategory;
  onGameComplete?: (record: MatchingRecord) => void;
  onNavigateToBadges?: () => void;
  nextCategory?: MatchingCategory | null;
  onNextCategory?: (id: string) => void;
  onRestart?: () => void;
}

export default function DiagramGame({ category, onGameComplete, onNavigateToBadges, nextCategory, onNextCategory, onRestart }: DiagramGameProps & React.Attributes) {
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [completedRecord, setCompletedRecord] = useState<MatchingRecord | null>(null);
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

  useEffect(() => {
    setMatchedIds([]);
    setMistakesCount(0);
    setTimeElapsed(0);
    setCompletedRecord(null);
    setIsTimerRunning(true);
    setSelectedPartId(null);
    startTimeRef.current = Date.now();
    if (category.parts) {
      setShuffledParts([...category.parts].sort(() => Math.random() - 0.5));
    }
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

  const isComplete = category.parts && matchedIds.length === category.parts.length && category.parts.length > 0;

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

      setCompletedRecord(record);
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

  if (isComplete && completedRecord) {
    return (
      <div className="text-center py-8 flex flex-col items-center justify-center h-full max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white mb-4 shadow-lg animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">Skvělá práce!</h3>
        <p className="text-sm text-slate-500 mb-6">Kategorie „{category.title}“ dokončena.</p>

        <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 mb-6 space-y-3">
          <div className="flex justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <span className="font-bold flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500"/> Získaná odměna</span>
            <span className="text-lg font-extrabold text-amber-500">+{completedRecord.xpEarned} XP</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-left">
             <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
               <div className="text-[11px] text-slate-400">Čas</div>
               <div className="text-sm font-bold flex items-center gap-1"><Timer className="w-3.5 h-3.5 text-blue-500"/> {completedRecord.timeSeconds} s</div>
             </div>
             <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
               <div className="text-[11px] text-slate-400">Přesnost</div>
               <div className="text-sm font-bold flex items-center gap-1">
                 {completedRecord.flawless ? <span className="text-emerald-500"><Zap className="w-3.5 h-3.5"/> Bez chyby!</span> : <span>{completedRecord.errorsCount} chyby</span>}
               </div>
             </div>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={onRestart} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold flex justify-center items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"><RotateCcw className="w-4 h-4"/> Opakovat</button>
          {nextCategory ? (
            <button onClick={() => onNextCategory?.(nextCategory.id)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex justify-center items-center gap-2">Další <ArrowRight className="w-4 h-4"/></button>
          ) : (
            onNavigateToBadges && <button onClick={onNavigateToBadges} className="flex-1 py-3 bg-amber-500 text-slate-950 rounded-xl font-bold flex justify-center items-center gap-2"><Award className="w-4 h-4"/> Odznaky</button>
          )}
        </div>
      </div>
    );
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full gap-3 sm:gap-4 overflow-x-hidden select-none">
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
        <span className="flex items-center gap-1.5"><Timer className="w-4 h-4 text-blue-500"/> Čas: {formatTime(timeElapsed)}</span>
        <span className="flex items-center gap-1.5 text-amber-600">Chyby: {mistakesCount}</span>
        <span className="text-emerald-600 dark:text-emerald-400">{matchedIds.length} / {category.parts?.length || 0}</span>
      </div>

      <DndContext autoScroll={false} sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Container strictly locked to 1:1 aspect ratio with overflow protection and touch isolation */}
        <div className="relative w-full max-w-[55vh] mx-auto aspect-square bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center p-1 sm:p-3 shrink-0 touch-none select-none overscroll-contain overflow-hidden">
          <div className="relative w-full h-full pointer-events-auto">
            <img src={category.imageUrl} alt={category.title} className="w-full h-full object-contain pointer-events-none select-none opacity-95 dark:opacity-90 mix-blend-multiply dark:mix-blend-normal" draggable={false} />
            
            {/* SVG lines connecting the actual part to the label drop zone */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
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

            {/* Render a clear anchor dot directly on the weapon */}
            {category.parts?.map(part => {
              if (part.labelTop === undefined || part.labelLeft === undefined) return null;
              return (
                <div 
                  key={`dot-${part.id}`} 
                  className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500 border border-white dark:border-slate-900 shadow-sm transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[5]"
                  style={{ top: `${part.top}%`, left: `${part.left}%` }} 
                />
              );
            })}
            
            {/* Drop Zones (positioned at labelTop / labelLeft so they don't crowd the image center) */}
            {category.parts?.map(part => (
              <DroppableZone 
                key={part.id} 
                part={part} 
                isMatched={matchedIds.includes(part.id)} 
                isActive={activeDragId === part.id}
                isSelectedTarget={selectedPartId === part.id}
                onZoneClick={() => handleZoneClick(part.id)}
              />
            ))}
          </div>
        </div>

        {/* Draggable Parts list at the bottom */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shrink-0">
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold uppercase tracking-wider text-center">
            Přetáhněte pojem nebo klikněte pro výběr a umístění
          </p>
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
  );
}
