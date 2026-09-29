import React, { useEffect, useId, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from 'lucide-react';
import { StyleExercise } from '../../data/prisonAdminData';
import { makeContentId } from '../../utils/contentLibrary';
import EditModalShell, { EDIT_INPUT_CLASS, EDIT_LABEL_CLASS } from './EditModalShell';

interface StyleExerciseEditModalProps {
  exercise: StyleExercise | null;
  isOpen: boolean;
  usedIds: string[];
  onClose: () => void;
  onSave: (exercise: StyleExercise) => Promise<{ persisted: boolean; error: string | null }>;
}

interface DraftSegment {
  key: string;
  text: string;
  isError: boolean;
  correction: string;
}

let keySeed = 0;
const nextKey = () => `s${Date.now().toString(36)}-${keySeed++}`;
const emptySegment = (): DraftSegment => ({ key: nextKey(), text: '', isError: true, correction: '' });

/**
 * Formulář cvičení „najdi chyby v záznamu“: text rozdělený na úseky, u každého
 * příznak chyby a vysvětlení opravy.
 */
export default function StyleExerciseEditModal({ exercise, isOpen, usedIds, onClose, onSave }: StyleExerciseEditModalProps) {
  const ids = useId();
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('');
  const [instruction, setInstruction] = useState('');
  const [segments, setSegments] = useState<DraftSegment[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(exercise?.title ?? '');
    setBadge(exercise?.badge ?? '');
    setInstruction(exercise?.instruction ?? '');
    setSegments(
      exercise?.originalTextSegments.length
        ? exercise.originalTextSegments.map((seg) => ({
            key: nextKey(),
            // Koncová mezera se ve formuláři nezobrazuje — doplní se při uložení.
            text: seg.text.trimEnd(),
            isError: seg.isError,
            correction: seg.correction,
          }))
        : [emptySegment(), emptySegment()]
    );
    setErrorMsg(null);
  }, [exercise, isOpen]);

  const updateSegment = (key: string, patch: Partial<DraftSegment>) =>
    setSegments((prev) => prev.map((seg) => (seg.key === key ? { ...seg, ...patch } : seg)));

  const moveSegment = (index: number, delta: -1 | 1) =>
    setSegments((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Název cvičení nesmí zůstat prázdný.');
      return;
    }
    const filled = segments.filter((seg) => seg.text.trim());
    if (filled.length === 0) {
      setErrorMsg('Cvičení potřebuje aspoň jeden úsek textu.');
      return;
    }
    if (!filled.some((seg) => seg.isError)) {
      setErrorMsg('Označte aspoň jeden úsek jako chybný — jinak není co hledat.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    const result = await onSave({
      id: exercise?.id ?? makeContentId('cviceni', title, usedIds),
      title: title.trim(),
      badge: badge.trim() || title.trim(),
      instruction: instruction.trim(),
      originalTextSegments: filled.map((seg, i) => ({
        id: i + 1,
        // Úseky se skládají za sebe do jednoho odstavce; mezera na konci
        // odděluje slova, takže ji lektor nemusí hlídat sám.
        text: seg.text.trim() + (i < filled.length - 1 ? ' ' : ''),
        isError: seg.isError,
        correction: seg.correction.trim(),
      })),
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
      title={exercise ? 'Upravit cvičení hledání chyb' : 'Nové cvičení hledání chyb'}
      icon={<Sparkles className="w-5 h-5" />}
      saving={saving}
      errorMsg={errorMsg}
      saveLabel="Uložit cvičení"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-title`}>
            Název cvičení *
          </label>
          <input
            id={`${ids}-title`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={EDIT_INPUT_CLASS}
          />
        </div>
        <div>
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-badge`}>
            Popisek tlačítka (např. Cvičení 3: Odnětí věci)
          </label>
          <input
            id={`${ids}-badge`}
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className={EDIT_INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-instruction`}>
          Zadání pro studenta
        </label>
        <textarea
          id={`${ids}-instruction`}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          rows={2}
          className={EDIT_INPUT_CLASS}
        />
      </div>

      <fieldset className="space-y-2">
        <div className="flex items-center justify-between">
          <legend className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Úseky textu ({segments.length}) — skládají se za sebe do jednoho odstavce
          </legend>
          <button
            type="button"
            onClick={() => setSegments((prev) => [...prev, emptySegment()])}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Přidat úsek
          </button>
        </div>

        {segments.map((seg, i) => (
          <div
            key={seg.key}
            className={`p-3 rounded-xl border space-y-2 ${
              seg.isError
                ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <label className="sr-only" htmlFor={`${ids}-st-${seg.key}`}>
                  Text úseku {i + 1}
                </label>
                <textarea
                  id={`${ids}-st-${seg.key}`}
                  value={seg.text}
                  onChange={(e) => updateSegment(seg.key, { text: e.target.value })}
                  rows={2}
                  placeholder={`Úsek ${i + 1}`}
                  className={EDIT_INPUT_CLASS}
                />
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveSegment(i, -1)}
                  disabled={i === 0}
                  aria-label={`Posunout úsek ${i + 1} výš`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSegment(i, 1)}
                  disabled={i === segments.length - 1}
                  aria-label={`Posunout úsek ${i + 1} níž`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                {segments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSegments((prev) => prev.filter((s) => s.key !== seg.key))}
                    aria-label={`Smazat úsek ${i + 1}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <label className="sr-only" htmlFor={`${ids}-sc-${seg.key}`}>
              Vysvětlení k úseku {i + 1}
            </label>
            <textarea
              id={`${ids}-sc-${seg.key}`}
              value={seg.correction}
              onChange={(e) => updateSegment(seg.key, { correction: e.target.value })}
              rows={2}
              placeholder={seg.isError ? 'Chyba: … Správně: „…“' : 'Proč je úsek v pořádku'}
              className={EDIT_INPUT_CLASS}
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={seg.isError}
                onChange={(e) => updateSegment(seg.key, { isError: e.target.checked })}
                className="w-4 h-4 accent-amber-600"
              />
              Úsek obsahuje chybu
            </label>
          </div>
        ))}
      </fieldset>
    </EditModalShell>
  );
}
