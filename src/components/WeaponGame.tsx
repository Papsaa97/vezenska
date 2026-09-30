import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import {
  DndContext,
  useDroppable,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { MatchingCategory, MatchingDiagramPart, MatchingRecord, WeaponSpecRow, WeaponView } from '../types';
import { recordMatchingCompletion } from '../utils/gamification';
import { activateOnKey } from '../utils/a11y';
import PrintHeader from './common/PrintHeader';
import { DraggablePart, DiagramStats, shuffle } from './DiagramGame';

/**
 * Porovnání vepsané hodnoty s tabulkou: bez mezer a velikosti písmen, s čárkou
 * i tečkou, se znakem × i x, s jednotkou řádku i bez ní. U řádku bez jednotky
 * (ráže) se navíc ignoruje „mm“, aby prošlo „9 mm“ i „9×19 mm Luger“.
 */
export function normalizeSpecValue(raw: string, unit?: string): string {
  let s = raw.toLowerCase().replace(/[\s ]/g, '').replace(/×/g, 'x').replace(/,/g, '.');
  if (unit) {
    const u = unit.toLowerCase().replace(/\s/g, '');
    if (s.endsWith(u)) s = s.slice(0, -u.length);
  } else {
    s = s.replace(/mm/g, '');
  }
  return s.replace(/\.$/, '');
}

export function isSpecAnswerCorrect(row: WeaponSpecRow, value: string): boolean {
  const given = normalizeSpecValue(value, row.unit);
  if (!given) return false;
  return [row.answer, ...(row.accepted ?? [])].some(a => normalizeSpecValue(a, row.unit) === given);
}

type Step =
  | { kind: 'view'; view: WeaponView }
  | { kind: 'pairs' }
  | { kind: 'specs' };

function DroppableSlot({
  part,
  index,
  isMatched,
  isSelectedTarget,
  onSlotClick
}: {
  part: MatchingDiagramPart;
  /** Pořadí na obrázku — do popisku pro čtečku; název součásti prozradit nesmí. */
  index: number;
  isMatched: boolean;
  isSelectedTarget: boolean;
  onSlotClick: () => void;
} & React.Attributes) {
  const { isOver, setNodeRef } = useDroppable({ id: part.id, disabled: isMatched });
  const top = part.labelTop ?? part.top;
  const left = part.labelLeft ?? part.left;

  return (
    <div
      ref={setNodeRef}
      role={isMatched ? undefined : 'button'}
      tabIndex={isMatched ? undefined : 0}
      aria-label={isMatched ? `Pole ${index + 1}: ${part.label}` : `Pole ${index + 1}, prázdné`}
      onClick={isMatched ? undefined : onSlotClick}
      onKeyDown={isMatched ? undefined : activateOnKey(onSlotClick)}
      style={{
        top: `${top}%`,
        left: `${left}%`,
        minWidth: `${part.slotWidth ?? 8}%`,
        height: `${part.slotHeight ?? 4}%`,
        transform: 'translate(-50%, -50%)'
      }}
      className={`absolute z-10 flex items-center justify-center rounded-md px-1 select-none text-[0.5rem] sm:text-[0.6875rem] leading-tight font-bold whitespace-nowrap ${
        isMatched
          ? 'bg-emerald-600 text-white'
          : isOver || isSelectedTarget
            ? 'bg-violet-500/25 border-2 border-violet-500 cursor-pointer'
            : 'bg-white/70 border-2 border-dashed border-violet-400 hover:bg-violet-500/10 cursor-pointer'
      }`}
    >
      {isMatched ? (
        <span className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />{part.label}</span>
      ) : (
        <span className="text-violet-500/80 tabular-nums" aria-hidden="true">{index + 1}</span>
      )}
    </div>
  );
}

function ViewBoard({
  view,
  matchedIds,
  onCorrect,
  onMistake
}: {
  view: WeaponView;
  matchedIds: string[];
  onCorrect: (id: string) => void;
  onMistake: () => void;
} & React.Attributes) {
  const [names] = useState<MatchingDiagramPart[]>(() => shuffle(view.parts));
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 6 } })
  );

  const tryPlace = (partId: string, slotId: string) => {
    if (partId === slotId) onCorrect(partId);
    else onMistake();
  };

  const handleDragStart = () => setSelectedPartId(null);
  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) return;
    tryPlace(String(event.active.id), String(event.over.id));
  };

  const handleSlotClick = (slotId: string) => {
    if (!selectedPartId) return;
    tryPlace(selectedPartId, slotId);
    setSelectedPartId(null);
  };

  const ratio = view.width / view.height;

  return (
    <DndContext autoScroll={false} sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-3">
        <div
          className="relative w-full mx-auto bg-white rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden touch-none select-none"
          style={{ aspectRatio: `${view.width} / ${view.height}`, maxWidth: `min(100%, calc(80vh * ${ratio.toFixed(3)}))` }}
        >
          <img
            src={view.imageUrl}
            alt={`${view.title} – obrázek z příručky s prázdnými poli pro názvy součástí`}
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            draggable={false}
          />
          {view.parts.map((part, index) => (
            <DroppableSlot
              key={part.id}
              part={part}
              index={index}
              isMatched={matchedIds.includes(part.id)}
              isSelectedTarget={selectedPartId !== null}
              onSlotClick={() => handleSlotClick(part.id)}
            />
          ))}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
            {names.map(part => (
              <DraggablePart
                key={part.id}
                part={part}
                isMatched={matchedIds.includes(part.id)}
                isSelected={selectedPartId === part.id}
                onSelect={() => setSelectedPartId(prev => (prev === part.id ? null : part.id))}
              />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}

function PairsBoard({
  category,
  matchedIds,
  onCorrect,
  onMistake
}: {
  category: MatchingCategory;
  matchedIds: string[];
  onCorrect: (id: string) => void;
  onMistake: () => void;
} & React.Attributes) {
  const [lefts] = useState(() => shuffle(category.pairs.map(p => ({ id: p.id, text: p.left }))));
  const [rights] = useState(() => shuffle(category.pairs.map(p => ({ id: p.id, text: p.right }))));
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [wrongRight, setWrongRight] = useState<string | null>(null);

  const pickRight = (id: string) => {
    if (!selectedLeft) return;
    if (selectedLeft === id) {
      onCorrect(id);
      setWrongRight(null);
    } else {
      onMistake();
      setWrongRight(id);
    }
    setSelectedLeft(null);
  };

  const itemClass = (matched: boolean, active: boolean, wrong: boolean) =>
    `w-full text-left p-3 rounded-xl border-2 transition-colors text-xs sm:text-sm font-medium ${
      matched
        ? 'bg-emerald-500/10 border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 opacity-50 line-through cursor-not-allowed'
        : wrong
          ? 'bg-red-500/10 border-red-500 text-red-800 dark:text-red-300 cursor-pointer'
          : active
            ? 'bg-violet-500/10 border-violet-500 text-violet-900 dark:text-violet-200 font-semibold cursor-pointer'
            : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-violet-400 cursor-pointer'
    }`;

  return (
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        Klikněte na součást nebo pojem vlevo a potom na jeho funkci vpravo.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          {lefts.map(item => {
            const matched = matchedIds.includes(item.id);
            return (
              <button
                type="button"
                key={item.id}
                disabled={matched}
                aria-pressed={selectedLeft === item.id}
                onClick={() => {
                  setWrongRight(null);
                  setSelectedLeft(prev => (prev === item.id ? null : item.id));
                }}
                className={itemClass(matched, selectedLeft === item.id, false)}
              >
                {item.text}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {rights.map(item => {
            const matched = matchedIds.includes(item.id);
            return (
              <button
                type="button"
                key={item.id}
                disabled={matched}
                onClick={() => pickRight(item.id)}
                className={itemClass(matched, false, wrongRight === item.id)}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SpecsTable({
  specs,
  matchedIds,
  revealedIds,
  onCorrect,
  onMistake,
  onReveal
}: {
  specs: WeaponSpecRow[];
  matchedIds: string[];
  revealedIds: string[];
  onCorrect: (id: string) => void;
  onMistake: () => void;
  onReveal: (ids: string[]) => void;
} & React.Attributes) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const open = specs.filter(r => !matchedIds.includes(r.id));

  const check = () => {
    const wrong: string[] = [];
    for (const row of open) {
      const value = values[row.id] ?? '';
      if (!value.trim()) continue;
      if (isSpecAnswerCorrect(row, value)) onCorrect(row.id);
      else {
        wrong.push(row.id);
        onMistake();
      }
    }
    setWrongIds(wrong);
  };

  return (
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        Vepište hodnoty takticko-technických dat podle příručky a dejte Zkontrolovat. Jednotku psát nemusíte.
      </p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs">
            <tr>
              <th scope="col" className="text-left font-semibold px-3 py-2">Údaj</th>
              <th scope="col" className="text-left font-semibold px-3 py-2">Hodnota</th>
            </tr>
          </thead>
          <tbody>
            {specs.map(row => {
              const done = matchedIds.includes(row.id);
              const revealed = revealedIds.includes(row.id);
              const wrong = wrongIds.includes(row.id) && !done;
              return (
                <tr key={row.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{row.label}</td>
                  <td className="px-3 py-2">
                    {done ? (
                      <span className={`inline-flex items-center gap-1.5 font-semibold ${revealed ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        {revealed ? <XCircle className="w-4 h-4" aria-hidden="true" /> : <CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
                        {row.answer}{row.unit ? ` ${row.unit}` : ''}
                        {revealed && <span className="font-normal text-xs">(z řešení)</span>}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="text"
                          aria-label={row.label}
                          aria-invalid={wrong || undefined}
                          value={values[row.id] ?? ''}
                          onChange={e => setValues(prev => ({ ...prev, [row.id]: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === 'Enter') check();
                          }}
                          className={`w-28 sm:w-36 px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                            wrong ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                          }`}
                        />
                        {row.unit && <span className="text-slate-500 dark:text-slate-400 text-xs">{row.unit}</span>}
                        {wrong && <span className="text-red-600 dark:text-red-400 text-xs font-semibold">Špatně</span>}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {open.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={check}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm cursor-pointer transition-colors"
          >
            Zkontrolovat
          </button>
          <button
            type="button"
            onClick={() => onReveal(open.map(r => r.id))}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
          >
            Ukázat řešení
          </button>
        </div>
      )}
    </div>
  );
}

interface WeaponGameProps {
  category: MatchingCategory;
  onGameComplete?: (record: MatchingRecord) => void;
  onStatsChange?: (stats: DiagramStats) => void;
}

/**
 * Poznávačka jedné zbraně: několik obrázků z příručky, na které student
 * přiřazuje názvy součástí, funkce součástí a tabulka takticko-technických
 * dat, do které hodnoty vepisuje. Chyby a čas se počítají za celek.
 */
export default function WeaponGame({ category, onGameComplete, onStatsChange }: WeaponGameProps) {
  const steps = useMemo<Step[]>(() => {
    const list: Step[] = (category.views ?? []).map(view => ({ kind: 'view', view }));
    if (category.pairs.length > 0) list.push({ kind: 'pairs' });
    if ((category.specs ?? []).length > 0) list.push({ kind: 'specs' });
    return list;
  }, [category]);

  const stepIds = useMemo(
    () =>
      steps.map(step =>
        step.kind === 'view'
          ? step.view.parts.map(p => p.id)
          : step.kind === 'pairs'
            ? category.pairs.map(p => p.id)
            : (category.specs ?? []).map(r => r.id)
      ),
    [steps, category]
  );
  const total = stepIds.reduce((sum, ids) => sum + ids.length, 0);

  const [stepIndex, setStepIndex] = useState(0);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => {
      setTimeElapsed(Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    onStatsChange?.({ timeElapsed, mistakes, matched: matchedIds.length, total });
  }, [onStatsChange, timeElapsed, mistakes, matchedIds.length, total]);

  const handleCorrect = useCallback((id: string) => {
    setMatchedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  }, []);
  const handleMistake = useCallback(() => setMistakes(prev => prev + 1), []);
  const handleReveal = useCallback((ids: string[]) => {
    setRevealedIds(prev => [...prev, ...ids]);
    setMatchedIds(prev => [...prev, ...ids.filter(id => !prev.includes(id))]);
    setMistakes(prev => prev + ids.length);
  }, []);

  useEffect(() => {
    if (finished || total === 0 || matchedIds.length < total) return;
    setFinished(true);
    const { record } = recordMatchingCompletion({
      categoryId: category.id,
      categoryTitle: category.title,
      timeSeconds: Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)),
      errorsCount: mistakes,
      flawless: mistakes === 0,
      pairsCount: total
    });
    onGameComplete?.(record);
  }, [finished, total, matchedIds.length, category, mistakes, onGameComplete]);

  const step = steps[stepIndex];
  if (!step) return null;

  const stepLabel = (s: Step) => (s.kind === 'view' ? s.view.title : s.kind === 'pairs' ? 'Funkce a konstrukce' : 'Takticko-technická data');
  const stepDone = (i: number) => stepIds[i].every(id => matchedIds.includes(id));
  const currentDone = stepDone(stepIndex);

  const navBtn = 'px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print flex flex-col gap-4">
        {/* Kroky poznávačky */}
        <div role="group" aria-label="Části poznávačky" className="flex flex-wrap gap-1.5">
          {steps.map((s, i) => {
            const done = stepDone(i);
            const count = stepIds[i].filter(id => matchedIds.includes(id)).length;
            return (
              <button
                type="button"
                key={s.kind === 'view' ? s.view.id : s.kind}
                aria-pressed={i === stepIndex}
                onClick={() => setStepIndex(i)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                  i === stepIndex
                    ? 'bg-violet-600 text-white border-violet-600'
                    : done
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {i + 1}. {stepLabel(s)} <span className="tabular-nums opacity-80">{count}/{stepIds[i].length}</span>
              </button>
            );
          })}
        </div>

        {step.kind === 'view' && (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Přetáhněte název do prázdného pole, na které ukazuje čára, nebo název vyberte a klepněte na pole.
            </p>
            <ViewBoard
              key={step.view.id}
              view={step.view}
              matchedIds={matchedIds}
              onCorrect={handleCorrect}
              onMistake={handleMistake}
            />
          </>
        )}
        {step.kind === 'pairs' && (
          <PairsBoard category={category} matchedIds={matchedIds} onCorrect={handleCorrect} onMistake={handleMistake} />
        )}
        {step.kind === 'specs' && (
          <SpecsTable
            specs={category.specs ?? []}
            matchedIds={matchedIds}
            revealedIds={revealedIds}
            onCorrect={handleCorrect}
            onMistake={handleMistake}
            onReveal={handleReveal}
          />
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button type="button" className={navBtn} disabled={stepIndex === 0} onClick={() => setStepIndex(i => i - 1)}>
            <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Předchozí
          </button>
          {currentDone && stepIndex < steps.length - 1 && (
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Tato část je hotová.</span>
          )}
          <button
            type="button"
            className={currentDone && stepIndex < steps.length - 1 ? 'px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center gap-1.5 cursor-pointer transition-colors' : navBtn}
            disabled={stepIndex === steps.length - 1}
            onClick={() => setStepIndex(i => i + 1)}
          >
            Další <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {category.source && (
          <p className="text-xs text-slate-500 dark:text-slate-400">Obrázky a údaje: {category.source}.</p>
        )}
      </div>

      {/* Procvičovací list (jen při tisku) */}
      <div className="hidden print:block w-full text-slate-900 bg-white">
        <PrintHeader
          subject={`Poznávačka – ${category.title}`}
          docTitle="Procvičovací list"
          subtext="Studijní portál – neoficiální studijní materiál"
        />
        <p className="text-xs text-slate-700 italic mb-3">
          Pokyn: Ke každému číslu na obrázcích doplňte název součásti, spojte pojmy s funkcí a vyplňte tabulku takticko-technických dat.
        </p>

        {(category.views ?? []).map(view => (
          <div key={view.id} className="print-card print-avoid-break mb-5">
            <h2 className="font-bold text-sm mb-1.5">{view.title}</h2>
            <div className="relative w-full max-w-[170mm] mx-auto" style={{ aspectRatio: `${view.width} / ${view.height}`, maxHeight: '120mm' }}>
              <img src={view.imageUrl} alt={view.title} className="absolute inset-0 w-full h-full" />
              {view.parts.map((part, idx) => (
                <div
                  key={part.id}
                  style={{ top: `${part.labelTop ?? part.top}%`, left: `${part.labelLeft ?? part.left}%`, transform: 'translate(-50%, -50%)' }}
                  className="absolute w-5 h-5 rounded-full bg-white border-2 border-slate-900 text-[0.625rem] font-black flex items-center justify-center"
                >
                  {idx + 1}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs mt-2">
              {view.parts.map((part, idx) => (
                <div key={part.id} className="flex items-center gap-2">
                  <span className="font-bold w-6 text-right">{idx + 1}.</span>
                  <span className="flex-1 border-b border-dotted border-slate-600 h-4" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {category.pairs.length > 0 && (
          <div className="print-card print-avoid-break mb-5 text-xs">
            <h2 className="font-bold text-sm mb-1.5">Funkce a konstrukce</h2>
            <ol className="list-decimal pl-5 space-y-1">
              {category.pairs.map(p => (
                <li key={p.id}>{p.left}: <span className="inline-block w-64 border-b border-dotted border-slate-600" /></li>
              ))}
            </ol>
          </div>
        )}

        {(category.specs ?? []).length > 0 && (
          <div className="print-card print-avoid-break mb-5 text-xs">
            <h2 className="font-bold text-sm mb-1.5">Takticko-technická data</h2>
            <table className="w-full border-collapse">
              <tbody>
                {(category.specs ?? []).map(row => (
                  <tr key={row.id}>
                    <td className="border border-slate-400 px-2 py-1 w-1/2">{row.label}</td>
                    <td className="border border-slate-400 px-2 py-1 text-right">{row.unit ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="print-avoid-break mt-6 pt-3 border-t-2 border-dashed border-slate-400 text-xs">
          <div className="font-bold mb-2">Klíč správných odpovědí</div>
          {(category.views ?? []).map(view => (
            <p key={view.id} className="mb-1">
              <strong>{view.title}:</strong> {view.parts.map((p, i) => `${i + 1}. ${p.label}`).join('; ')}
            </p>
          ))}
          {category.pairs.length > 0 && (
            <p className="mb-1">
              <strong>Funkce:</strong> {category.pairs.map((p, i) => `${i + 1}. ${p.right}`).join('; ')}
            </p>
          )}
          {(category.specs ?? []).length > 0 && (
            <p className="mb-1">
              <strong>TTD:</strong> {(category.specs ?? []).map(r => `${r.label} ${r.answer}${r.unit ? ` ${r.unit}` : ''}`).join('; ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
