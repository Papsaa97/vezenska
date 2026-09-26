import React, { useEffect, useId, useMemo, useState } from 'react';
import { Utensils, Edit3, ChevronDown } from 'lucide-react';
import { useEditableContent } from '../../hooks/useEditableContent';
import {
  DEFAULT_JIDELNICEK,
  DNY_V_TYDNU,
  EMPTY_JIDELNICEK,
  Jidelnicek,
  JIDELNICEK_ID,
} from '../../data/jidelnicek';
import EditModalShell, { EDIT_INPUT_CLASS, EDIT_LABEL_CLASS } from '../common/EditModalShell';

/** Dnešní den názvem z DNY_V_TYDNU (getDay: 0 = neděle). */
function todayName(): string {
  return DNY_V_TYDNU[(new Date().getDay() + 6) % 7];
}

/**
 * Jídelníček na nástěnce (návrh ze zpětné vazby 18. 9. 2026).
 *
 * Vyplňuje ho lektor nebo správce; student vidí týden s vyznačeným dneškem.
 * Dokud je prázdný, student kartu nevidí vůbec — prázdné okno by jen mátlo.
 */
export default function JidelnicekCard({ canEdit }: { canEdit: boolean }) {
  const { items, save } = useEditableContent<Jidelnicek>('jidelnicek', DEFAULT_JIDELNICEK, canEdit);
  const menu = items.find((m) => m.id === JIDELNICEK_ID) ?? EMPTY_JIDELNICEK;
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);

  const today = todayName();
  const filledDays = useMemo(() => menu.days.filter((d) => d.meals.trim()), [menu.days]);
  const isEmpty = filledDays.length === 0 && !menu.note.trim();

  if (isEmpty && !canEdit) return null;

  return (
    <section
      aria-label="Jídelníček"
      className="no-print bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2.5 text-left cursor-pointer min-w-0"
        >
          <span className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Utensils className="w-4 h-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-900 dark:text-white">Jídelníček</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
              {menu.weekLabel || (isEmpty ? 'Zatím nevyplněno' : 'Tento týden')}
            </span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {canEdit && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEmpty ? 'Vyplnit' : 'Upravit'}
          </button>
        )}
      </div>

      {open && (
        <div className="px-4 pb-4">
          {isEmpty ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              Studenti kartu uvidí, jakmile jídelníček vyplníte.
            </p>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {menu.days.map((d) => {
                  const isToday = d.day === today;
                  return (
                    <li
                      key={d.day}
                      className={`rounded-xl border p-3 ${
                        isToday
                          ? 'border-orange-300 dark:border-orange-700 bg-orange-50/70 dark:bg-orange-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        {d.day}
                        {isToday && <span className="ml-1.5 text-orange-600 dark:text-orange-400">· dnes</span>}
                      </div>
                      <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                        {d.meals.trim() || '—'}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {menu.note.trim() && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 whitespace-pre-line">{menu.note}</p>
              )}
            </>
          )}
        </div>
      )}

      {canEdit && (
        <JidelnicekEditModal
          menu={menu}
          isOpen={editing}
          onClose={() => setEditing(false)}
          onSave={(next) => save(next)}
        />
      )}
    </section>
  );
}

function JidelnicekEditModal({
  menu,
  isOpen,
  onClose,
  onSave,
}: {
  menu: Jidelnicek;
  isOpen: boolean;
  onClose: () => void;
  onSave: (menu: Jidelnicek) => Promise<{ persisted: boolean; error: string | null }>;
}) {
  const ids = useId();
  const [weekLabel, setWeekLabel] = useState('');
  const [note, setNote] = useState('');
  const [meals, setMeals] = useState<Record<string, string>>({});
  const [withWeekend, setWithWeekend] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setWeekLabel(menu.weekLabel);
    setNote(menu.note);
    setMeals(Object.fromEntries(menu.days.map((d) => [d.day, d.meals])));
    setWithWeekend(menu.days.some((d) => d.day === 'Sobota' || d.day === 'Neděle'));
    setErrorMsg(null);
  }, [menu, isOpen]);

  const days = withWeekend ? DNY_V_TYDNU : DNY_V_TYDNU.slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    const result = await onSave({
      id: JIDELNICEK_ID,
      weekLabel: weekLabel.trim(),
      note: note.trim(),
      days: days.map((day) => ({ day, meals: (meals[day] ?? '').trim() })),
    });
    setSaving(false);
    if (result.error) {
      setErrorMsg(result.error);
      return;
    }
    onClose();
  };

  return (
    <EditModalShell
      isOpen={isOpen}
      title="Jídelníček na nástěnce"
      icon={<Utensils className="w-5 h-5" />}
      saving={saving}
      errorMsg={errorMsg}
      saveLabel="Uložit jídelníček"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div>
        <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-week`}>
          Týden
        </label>
        <input
          id={`${ids}-week`}
          type="text"
          value={weekLabel}
          onChange={(e) => setWeekLabel(e.target.value)}
          placeholder="29. 9. – 3. 10. 2026"
          className={EDIT_INPUT_CLASS}
        />
      </div>
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={withWeekend}
          onChange={(e) => setWithWeekend(e.target.checked)}
          className="w-4 h-4 accent-amber-500"
        />
        Včetně víkendu
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {days.map((day) => (
          <div key={day}>
            <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-${day}`}>
              {day}
            </label>
            <textarea
              id={`${ids}-${day}`}
              value={meals[day] ?? ''}
              onChange={(e) => setMeals((prev) => ({ ...prev, [day]: e.target.value }))}
              rows={3}
              placeholder={'Polévka\nHlavní jídlo'}
              className={EDIT_INPUT_CLASS}
            />
          </div>
        ))}
      </div>
      <div>
        <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-note`}>
          Poznámka (výdej, alergeny, změny)
        </label>
        <textarea
          id={`${ids}-note`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className={EDIT_INPUT_CLASS}
        />
      </div>
    </EditModalShell>
  );
}
