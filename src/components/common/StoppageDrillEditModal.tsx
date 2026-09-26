import React, { useEffect, useId, useState } from 'react';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import { StoppageDrill } from '../../data/weaponsData';
import { makeContentId } from '../../utils/contentLibrary';
import EditModalShell, { EDIT_INPUT_CLASS, EDIT_LABEL_CLASS } from './EditModalShell';

interface StoppageDrillEditModalProps {
  drill: StoppageDrill | null;
  isOpen: boolean;
  usedIds: string[];
  onClose: () => void;
  onSave: (drill: StoppageDrill) => Promise<{ persisted: boolean; error: string | null }>;
}

interface DraftOption {
  key: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

let keySeed = 0;
const nextKey = () => `o${Date.now().toString(36)}-${keySeed++}`;
const emptyOption = (): DraftOption => ({ key: nextKey(), text: '', isCorrect: false, feedback: '' });

const TEXT_FIELDS: { field: 'symptom' | 'cause' | 'correctAction' | 'whyCorrect' | 'dangerOfWrongAction'; label: string }[] = [
  { field: 'symptom', label: 'Příznak závady' },
  { field: 'cause', label: 'Možná příčina' },
  { field: 'correctAction', label: 'Správný postup' },
  { field: 'whyCorrect', label: 'Proč je postup správný' },
  { field: 'dangerOfWrongAction', label: 'Nebezpečí chybného postupu' },
];

type DrillTexts = Record<(typeof TEXT_FIELDS)[number]['field'], string>;

const emptyTexts = (): DrillTexts => ({
  symptom: '',
  cause: '',
  correctAction: '',
  whyCorrect: '',
  dangerOfWrongAction: '',
});

/** Formulář střelecké závady: popis, správný postup a volby s jednou správnou. */
export default function StoppageDrillEditModal({ drill, isOpen, usedIds, onClose, onSave }: StoppageDrillEditModalProps) {
  const ids = useId();
  const [name, setName] = useState('');
  const [texts, setTexts] = useState<DrillTexts>(emptyTexts);
  const [options, setOptions] = useState<DraftOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(drill?.name ?? '');
    setTexts(
      drill
        ? {
            symptom: drill.symptom,
            cause: drill.cause,
            correctAction: drill.correctAction,
            whyCorrect: drill.whyCorrect,
            dangerOfWrongAction: drill.dangerOfWrongAction,
          }
        : emptyTexts()
    );
    setOptions(
      drill?.options.length
        ? drill.options.map((o) => ({ ...o, key: nextKey() }))
        : [emptyOption(), emptyOption(), emptyOption()]
    );
    setErrorMsg(null);
  }, [drill, isOpen]);

  const updateOption = (key: string, patch: Partial<DraftOption>) =>
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, ...patch } : o)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Název závady nesmí zůstat prázdný.');
      return;
    }
    const cleanOptions = options
      .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect, feedback: o.feedback.trim() }))
      .filter((o) => o.text);
    if (cleanOptions.length < 2) {
      setErrorMsg('Závada potřebuje aspoň dvě vyplněné volby.');
      return;
    }
    if (!cleanOptions.some((o) => o.isCorrect)) {
      setErrorMsg('Označte správnou volbu — bez ní se závada nedá splnit.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    const result = await onSave({
      id: drill?.id ?? makeContentId('zavada', name, usedIds),
      name: name.trim(),
      symptom: texts.symptom.trim(),
      cause: texts.cause.trim(),
      correctAction: texts.correctAction.trim(),
      whyCorrect: texts.whyCorrect.trim(),
      dangerOfWrongAction: texts.dangerOfWrongAction.trim(),
      options: cleanOptions,
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
      title={drill ? 'Upravit střeleckou závadu' : 'Nová střelecká závada'}
      icon={<Wrench className="w-5 h-5" />}
      saving={saving}
      errorMsg={errorMsg}
      saveLabel="Uložit závadu"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div>
        <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-name`}>
          Název závady *
        </label>
        <input
          id={`${ids}-name`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="6. Nedovření závěru"
          required
          className={EDIT_INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TEXT_FIELDS.map(({ field, label }) => (
          <div key={field} className={field === 'correctAction' ? 'sm:col-span-2' : undefined}>
            <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-${field}`}>
              {label}
            </label>
            <textarea
              id={`${ids}-${field}`}
              value={texts[field]}
              onChange={(e) => setTexts((prev) => ({ ...prev, [field]: e.target.value }))}
              rows={2}
              className={EDIT_INPUT_CLASS}
            />
          </div>
        ))}
      </div>

      <fieldset className="space-y-2">
        <div className="flex items-center justify-between">
          <legend className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Volby ({options.length})
          </legend>
          <button
            type="button"
            onClick={() => setOptions((prev) => [...prev, emptyOption()])}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Přidat volbu
          </button>
        </div>
        {options.map((opt, i) => (
          <div
            key={opt.key}
            className={`p-3 rounded-xl border space-y-2 ${
              opt.isCorrect
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <label className="sr-only" htmlFor={`${ids}-ot-${opt.key}`}>
                  Text volby {i + 1}
                </label>
                <textarea
                  id={`${ids}-ot-${opt.key}`}
                  value={opt.text}
                  onChange={(e) => updateOption(opt.key, { text: e.target.value })}
                  rows={2}
                  placeholder={`Volba ${i + 1}`}
                  className={EDIT_INPUT_CLASS}
                />
              </div>
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => setOptions((prev) => prev.filter((o) => o.key !== opt.key))}
                  aria-label={`Smazat volbu ${i + 1}`}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <label className="sr-only" htmlFor={`${ids}-of-${opt.key}`}>
              Zpětná vazba k volbě {i + 1}
            </label>
            <textarea
              id={`${ids}-of-${opt.key}`}
              value={opt.feedback}
              onChange={(e) => updateOption(opt.key, { feedback: e.target.value })}
              rows={2}
              placeholder="Zpětná vazba po zvolení"
              className={EDIT_INPUT_CLASS}
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={opt.isCorrect}
                onChange={(e) => updateOption(opt.key, { isCorrect: e.target.checked })}
                className="w-4 h-4 accent-emerald-600"
              />
              Správný postup
            </label>
          </div>
        ))}
      </fieldset>
    </EditModalShell>
  );
}
