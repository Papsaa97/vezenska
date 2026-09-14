import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Shirt, Trash2, X } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import {
  ClassBoardItem,
  DayUniformItem,
  UniformGuidance,
  normalizeUniformDays,
} from '../../utils/classBoardService';

interface UniformGuidanceModalProps {
  item: ClassBoardItem;
  authorName: string;
  onClose: () => void;
  onSave: (guidance: UniformGuidance) => Promise<void>;
}

export default function UniformGuidanceModal({
  item,
  authorName,
  onClose,
  onSave,
}: UniformGuidanceModalProps) {
  const [days, setDays] = useState<DayUniformItem[]>(() => {
    return normalizeUniformDays(item.uniformGuidance);
  });
  const [notes, setNotes] = useState(item.uniformGuidance?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const handleDayNameChange = (index: number, val: string) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, day: val } : d)));
  };

  const handleDayOutfitChange = (index: number, val: string) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, outfit: val } : d)));
  };

  const handleToggleWorkout = (index: number) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== index) return d;
        const nextHasWorkout = !d.hasWorkout;
        return {
          ...d,
          hasWorkout: nextHasWorkout,
          workoutNote: nextHasWorkout
            ? (d.workoutNote || 'Věci na cvičení do tělocvičny s sebou')
            : '',
        };
      })
    );
  };

  const handleWorkoutNoteChange = (index: number, val: string) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, workoutNote: val } : d)));
  };

  const handleAddDay = () => {
    setDays((prev) => [
      ...prev,
      { day: '', outfit: '', hasWorkout: false, workoutNote: '' },
    ]);
  };

  const handleRemoveDay = (index: number) => {
    setDays((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanedDays = days.filter((d) => d.day.trim() !== '' || d.outfit.trim() !== '');
      await onSave({
        days: cleanedDays,
        notes: notes.trim(),
        updatedBy: authorName,
        updatedAt: new Date().toISOString(),
        today: cleanedDays[0]?.outfit,
        tomorrow: cleanedDays[1]?.outfit,
        dayAfterTomorrow: cleanedDays[2]?.outfit,
      });
    } finally {
      setSaving(false);
    }
  };

  // Escape (ne během ukládání), past na fokus a jeho návrat — viz hooks/useDialog.
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: true, onClose, closeOnEscape: !saving });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="uniform-guidance-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-5 sm:p-7 space-y-5 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Hlavička */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h3 id="uniform-guidance-title" className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Ústroj pro třídu {item.className}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Volně zadejte, upravte nebo odstraňte dny a požadovanou ústroj. Názvy i texty si můžete přizpůsobit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Zavřít ústrojovou kázeň"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          {/* Jednotlivé dny a volné kolonky */}
          <div className="space-y-2.5">
            {days.map((dayItem, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all ${
                  dayItem.hasWorkout
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Název dne / položky - volně upravitelné */}
                  <div className="w-full sm:w-36 shrink-0">
                    <input
                      type="text"
                      value={dayItem.day}
                      onChange={(e) => handleDayNameChange(idx, e.target.value)}
                      placeholder="Den (např. Pondělí)..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  {/* Volné textové pole pro ústroj */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={dayItem.outfit}
                      onChange={(e) => handleDayOutfitChange(idx, e.target.value)}
                      placeholder="Ústroj (např. PS II, Civil, Služební...)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  {/* Tlačítko Cvičení a Smazat položku */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleWorkout(idx)}
                      className={`px-3 py-2 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
                        dayItem.hasWorkout
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/20'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>👟</span>
                      <span>{dayItem.hasWorkout ? 'Cvičení: ANO' : 'Cvičení'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveDay(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Odebrat tento řádek"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Doplňující poznámka ke cvičení, pokud je aktivní */}
                {dayItem.hasWorkout && (
                  <div className="mt-2.5 pt-2.5 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                      Upozornění pro třídu:
                    </span>
                    <input
                      type="text"
                      value={dayItem.workoutNote || ''}
                      onChange={(e) => handleWorkoutNoteChange(idx, e.target.value)}
                      placeholder="např. Věci na sebeobranu do tělocvičny a čistá sálová obuv"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-500/40 text-slate-900 dark:text-white text-xs font-normal focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tlačítko pro přidání dalšího dne / položky */}
          <button
            type="button"
            onClick={handleAddDay}
            className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Přidat další den / položku</span>
          </button>

          {/* Poznámka velitele třídy */}
          <div className="pt-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
              Doplňující poznámka pro celou třídu (volitelné)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="např. Přezůvky do tělocvičny a čistý ručník s sebou..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Tlačítka uložení */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              {saving ? 'Ukládám\u2026' : 'Zveřejnit ústroj třídy'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
