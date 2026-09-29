import React, { useEffect, useId, useState } from 'react';
import { Plus, Scale, Trash2 } from 'lucide-react';
import { DilemmaScenario } from '../../data/professionalEthicsData';
import { makeContentId } from '../../utils/contentLibrary';
import EditModalShell, { EDIT_INPUT_CLASS, EDIT_LABEL_CLASS } from './EditModalShell';

interface DilemmaEditModalProps {
  scenario: DilemmaScenario | null;
  isOpen: boolean;
  usedIds: string[];
  onClose: () => void;
  onSave: (scenario: DilemmaScenario) => Promise<{ persisted: boolean; error: string | null }>;
}

interface DraftOption {
  key: string;
  text: string;
  correct: boolean;
  explanation: string;
}

let keySeed = 0;
const nextKey = () => `d${Date.now().toString(36)}-${keySeed++}`;
const emptyOption = (): DraftOption => ({ key: nextKey(), text: '', correct: false, explanation: '' });

/** Formulář modelové situace trenažéru etických dilemat: popis a volby se zpětnou vazbou. */
export default function DilemmaEditModal({ scenario, isOpen, usedIds, onClose, onSave }: DilemmaEditModalProps) {
  const ids = useId();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<DraftOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(scenario?.title ?? '');
    setDescription(scenario?.description ?? '');
    setOptions(
      scenario?.options.length
        ? scenario.options.map((o) => ({ ...o, key: nextKey() }))
        : [emptyOption(), emptyOption(), emptyOption()]
    );
    setErrorMsg(null);
  }, [scenario, isOpen]);

  const updateOption = (key: string, patch: Partial<DraftOption>) =>
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, ...patch } : o)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Název situace nesmí zůstat prázdný.');
      return;
    }
    const cleanOptions = options
      .map((o) => ({ text: o.text.trim(), correct: o.correct, explanation: o.explanation.trim() }))
      .filter((o) => o.text);
    if (cleanOptions.length < 2) {
      setErrorMsg('Situace potřebuje aspoň dvě vyplněné volby.');
      return;
    }
    if (!cleanOptions.some((o) => o.correct)) {
      setErrorMsg('Označte správný postup — bez něj se situace nedá vyřešit.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    const result = await onSave({
      id: scenario?.id ?? makeContentId('dilema', title, usedIds),
      title: title.trim(),
      description: description.trim(),
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
      title={scenario ? 'Upravit modelovou situaci' : 'Nová modelová situace'}
      icon={<Scale className="w-5 h-5" />}
      saving={saving}
      errorMsg={errorMsg}
      saveLabel="Uložit situaci"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div>
        <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-title`}>
          Název situace *
        </label>
        <input
          id={`${ids}-title`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Střet zájmů při eskortě"
          required
          className={EDIT_INPUT_CLASS}
        />
      </div>

      <div>
        <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-description`}>
          Popis služební situace
        </label>
        <textarea
          id={`${ids}-description`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={EDIT_INPUT_CLASS}
        />
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
              opt.correct
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
                  placeholder={`Volba ${String.fromCharCode(65 + i)}`}
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
            <label className="sr-only" htmlFor={`${ids}-oe-${opt.key}`}>
              Vysvětlení k volbě {i + 1}
            </label>
            <textarea
              id={`${ids}-oe-${opt.key}`}
              value={opt.explanation}
              onChange={(e) => updateOption(opt.key, { explanation: e.target.value })}
              rows={2}
              placeholder="Vysvětlení po vyhodnocení (proč je volba správná / chybná, s oporou v předpisu)"
              className={EDIT_INPUT_CLASS}
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={opt.correct}
                onChange={(e) => updateOption(opt.key, { correct: e.target.checked })}
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
