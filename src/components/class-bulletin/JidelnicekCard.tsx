import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Utensils, Edit3, ChevronDown, History, X, RotateCcw, Loader2 } from 'lucide-react';
import { useEditableContent } from '../../hooks/useEditableContent';
import {
  DEFAULT_JIDELNICEK,
  DNY_V_TYDNU,
  EMPTY_JIDELNICEK,
  Jidelnicek,
  JIDELNICEK_ID,
} from '../../data/jidelnicek';
import EditModalShell, { EDIT_INPUT_CLASS, EDIT_LABEL_CLASS } from '../common/EditModalShell';
import { useDialog } from '../../hooks/useDialog';
import { ROLE_LABELS } from '../../constants/auth';
import type { UserRole } from '../../types/auth';
import { JidelnicekZmena, coSeZmenilo, fetchJidelnicekHistorie } from '../../utils/jidelnicekHistorie';

/** Id řádku jídelníčku v content_blocks (viz rowId v contentLibrary). */
const JIDELNICEK_BLOCK_ID = `jidelnicek:${JIDELNICEK_ID}`;

function formatKdy(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function roleLabel(role: string | null): string | null {
  return role && role in ROLE_LABELS ? ROLE_LABELS[role as UserRole] : null;
}

/** Dnešní den názvem z DNY_V_TYDNU (getDay: 0 = neděle). */
function todayName(): string {
  return DNY_V_TYDNU[(new Date().getDay() + 6) % 7];
}

/**
 * Jídelníček na nástěnce (návrh ze zpětné vazby 18. 9. 2026).
 *
 * Jeden společný pro všechny třídy. Vyplňuje ho lektor, správce nebo velitel
 * kterékoli třídy (i jeho zástupce, migrace 051); student vidí týden
 * s vyznačeným dneškem. Každou změnu zapíše databáze se jménem autora —
 * kdo naposledy upravoval, vidí všichni, celou historii a návrat ke starší
 * verzi ti, kdo smějí upravovat.
 * Dokud je prázdný, student kartu nevidí vůbec — prázdné okno by jen mátlo.
 */
export default function JidelnicekCard({ canEdit }: { canEdit: boolean }) {
  const { items, save } = useEditableContent<Jidelnicek>('jidelnicek', DEFAULT_JIDELNICEK, canEdit);
  const menu = items.find((m) => m.id === JIDELNICEK_ID) ?? EMPTY_JIDELNICEK;
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [zmeny, setZmeny] = useState<JidelnicekZmena[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    const result = await fetchJidelnicekHistorie(JIDELNICEK_BLOCK_ID);
    setZmeny(result.zmeny);
    setHistoryError(result.error);
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const saveAndLog = useCallback(
    async (next: Jidelnicek) => {
      const result = await save(next);
      await loadHistory();
      return result;
    },
    [save, loadHistory]
  );

  const posledni = zmeny[0] ?? null;

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
          <div className="flex items-center gap-1.5 shrink-0">
            {zmeny.length > 0 && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                aria-label="Historie změn jídelníčku"
                title="Historie změn"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Historie</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEmpty ? 'Vyplnit' : 'Upravit'}
            </button>
          </div>
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
                      <div className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
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
          {posledni && (
            <p className="mt-2 text-[0.6875rem] text-slate-400 dark:text-slate-500">
              Naposledy upravil(a) {posledni.autorJmeno}, {formatKdy(posledni.zmeneno)}
            </p>
          )}
        </div>
      )}

      {canEdit && (
        <>
          <JidelnicekEditModal
            menu={menu}
            isOpen={editing}
            onClose={() => setEditing(false)}
            onSave={saveAndLog}
          />
          <JidelnicekHistoryDialog
            isOpen={historyOpen}
            zmeny={zmeny}
            error={historyError}
            onClose={() => setHistoryOpen(false)}
            onRestore={(verze) => saveAndLog({ ...verze, id: JIDELNICEK_ID })}
          />
        </>
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
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Jídelníček je společný pro všechny třídy. Změna se uloží s vaším jménem a v historii ji uvidí lektoři i
        velitelé.
      </p>
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

const AKCE_POPIS: Record<JidelnicekZmena['akce'], string> = {
  vlozeni: 'Vyplnil(a) jídelníček',
  uprava: 'Upravil(a)',
  smazani: 'Smazal(a) jídelníček',
};

function JidelnicekHistoryDialog({
  isOpen,
  zmeny,
  error,
  onClose,
  onRestore,
}: {
  isOpen: boolean;
  zmeny: JidelnicekZmena[];
  error: string | null;
  onClose: () => void;
  onRestore: (verze: Jidelnicek) => Promise<{ persisted: boolean; error: string | null }>;
}) {
  const titleId = useId();
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const dialogRef = useDialog<HTMLDivElement>({ isOpen, onClose, closeOnEscape: restoringId === null });

  useEffect(() => {
    if (!isOpen) return;
    setConfirmId(null);
    setRestoreError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRestore = async (zmena: JidelnicekZmena) => {
    if (!zmena.po) return;
    setRestoringId(zmena.id);
    setRestoreError(null);
    const result = await onRestore(zmena.po);
    setRestoringId(null);
    setConfirmId(null);
    if (result.error) setRestoreError(result.error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="min-w-0">
            <h2 id={titleId} className="font-bold text-slate-900 dark:text-white">
              Historie změn jídelníčku
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Záznamy zapisuje databáze sama, nejdou upravit ani smazat.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít historii"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
          {(error || restoreError) && (
            <p className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
              {restoreError ?? error}
            </p>
          )}
          {zmeny.length === 0 && !error && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Zatím žádná změna.</p>
          )}
          <ol className="space-y-2">
            {zmeny.map((zmena, index) => {
              const co = coSeZmenilo(zmena.pred, zmena.po);
              const role = roleLabel(zmena.autorRole);
              const jeAktualni = index === 0 && !zmena.poOdebrano;
              const lzeObnovit = zmena.po !== null && !zmena.poOdebrano && !jeAktualni;
              return (
                <li
                  key={zmena.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <div className="text-sm text-slate-800 dark:text-slate-100">
                      <span className="font-bold">{zmena.autorJmeno}</span>
                      {role && <span className="text-slate-500 dark:text-slate-400"> · {role}</span>}
                    </div>
                    <time dateTime={zmena.zmeneno} className="text-xs text-slate-500 dark:text-slate-400">
                      {formatKdy(zmena.zmeneno)}
                    </time>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                    {zmena.poOdebrano ? 'Odebral(a) jídelníček' : AKCE_POPIS[zmena.akce]}
                    {zmena.akce === 'uprava' && !zmena.poOdebrano && (co.length > 0 ? `: ${co.join(', ')}` : ' (bez změny textu)')}
                    {jeAktualni && <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">· platí teď</span>}
                  </p>

                  {zmena.po && (
                    <details className="mt-2">
                      <summary className="text-xs font-semibold text-blue-700 dark:text-blue-300 cursor-pointer">
                        Zobrazit tuto verzi
                      </summary>
                      <div className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-200">
                        {zmena.po.weekLabel && <div className="font-semibold">{zmena.po.weekLabel}</div>}
                        {zmena.po.days.map((d) => (
                          <div key={d.day}>
                            <span className="font-semibold">{d.day}:</span>{' '}
                            <span className="whitespace-pre-line">{d.meals.trim() || '—'}</span>
                          </div>
                        ))}
                        {zmena.po.note && <div className="text-slate-500 dark:text-slate-400 whitespace-pre-line">{zmena.po.note}</div>}
                      </div>
                    </details>
                  )}

                  {lzeObnovit && zmena.po && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {confirmId === zmena.id ? (
                        <>
                          <span className="text-xs text-slate-600 dark:text-slate-300">Vrátit jídelníček na tuto verzi?</span>
                          <button
                            type="button"
                            onClick={() => handleRestore(zmena)}
                            disabled={restoringId !== null}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            {restoringId === zmena.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Ano, vrátit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            disabled={restoringId !== null}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                          >
                            Ne
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(zmena.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Vrátit tuto verzi
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
