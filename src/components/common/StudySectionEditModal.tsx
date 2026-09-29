import React, { useEffect, useId, useState } from 'react';
import { ArrowDown, ArrowUp, FileText, Plus, Trash2 } from 'lucide-react';
import {
  StudySection,
  StudySectionArea,
  StudySectionFields,
  StudySectionItem,
  sectionItem,
} from '../../data/studySections';
import { makeContentId } from '../../utils/contentLibrary';
import EditModalShell, { EDIT_INPUT_CLASS, EDIT_LABEL_CLASS } from './EditModalShell';

interface StudySectionEditModalProps {
  /** Upravovaný blok; null = nový blok v podzáložce `area`. */
  section: StudySection | null;
  area: StudySectionArea;
  fields: StudySectionFields;
  isOpen: boolean;
  usedIds: string[];
  onClose: () => void;
  onSave: (section: StudySection) => Promise<{ persisted: boolean; error: string | null }>;
}

interface DraftItem extends StudySectionItem {
  key: string;
}

let keySeed = 0;
const nextKey = () => `b${Date.now().toString(36)}-${keySeed++}`;

type ItemTextField = 'label' | 'title' | 'text' | 'note';
/** Pole, která se píší do víceřádkového pole — ostatní jsou krátké popisky. */
const MULTILINE: ItemTextField[] = ['text', 'note'];
const ITEM_FIELD_ORDER: ItemTextField[] = ['label', 'title', 'text', 'note'];

const RATING_VALUES = [1, 2, 3, 4, 5];

/**
 * Formulář textového bloku studijní záložky.
 *
 * Nabízí jen pole, která daný blok na obrazovce opravdu používá (viz
 * StudySectionFields) — ostatní se v konceptu drží beze změny, takže se
 * uložením neztratí.
 */
export default function StudySectionEditModal({
  section,
  area,
  fields,
  isOpen,
  usedIds,
  onClose,
  onSave,
}: StudySectionEditModalProps) {
  const ids = useId();
  const [title, setTitle] = useState('');
  const [kicker, setKicker] = useState('');
  const [intro, setIntro] = useState('');
  const [outro, setOutro] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(section?.title ?? '');
    setKicker(section?.kicker ?? '');
    setIntro(section?.intro ?? '');
    setOutro(section?.outro ?? '');
    setItems(
      section?.items.length
        ? section.items.map((item) => ({ ...item, key: nextKey() }))
        : [{ ...sectionItem({}), key: nextKey() }]
    );
    setErrorMsg(null);
  }, [section, isOpen]);

  const updateItem = (key: string, patch: Partial<StudySectionItem>) =>
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const moveItem = (index: number, delta: -1 | 1) =>
    setItems((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const itemFields = ITEM_FIELD_ORDER.filter((field) => fields.item[field] !== undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Nadpis bloku nesmí zůstat prázdný.');
      return;
    }

    const cleanItems: StudySectionItem[] = [];
    for (const draft of items) {
      const item: StudySectionItem = {
        label: draft.label.trim(),
        title: draft.title.trim(),
        text: draft.text.trim(),
        note: draft.note.trim(),
      };
      if (!item.label && !item.title && !item.text && !item.note) continue;
      if (fields.item.rating) {
        if ((draft.probability === undefined) !== (draft.impact === undefined)) {
          setErrorMsg('U řádku katalogu vyplňte pravděpodobnost i dopad, nebo ani jedno.');
          return;
        }
      }
      if (draft.probability !== undefined && draft.impact !== undefined) {
        item.probability = draft.probability;
        item.impact = draft.impact;
      }
      cleanItems.push(item);
    }

    if (cleanItems.length === 0 && !intro.trim() && !outro.trim()) {
      setErrorMsg('Blok nemá žádný obsah — vyplňte aspoň jeden bod nebo úvodní text.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    const result = await onSave({
      id: section?.id ?? makeContentId('blok', title, usedIds),
      area: section?.area ?? area,
      title: title.trim(),
      kicker: kicker.trim(),
      intro: intro.trim(),
      outro: outro.trim(),
      items: cleanItems,
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
      title={section ? 'Upravit textový blok' : 'Nový textový blok'}
      icon={<FileText className="w-5 h-5" />}
      saving={saving}
      errorMsg={errorMsg}
      saveLabel="Uložit blok"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Formátování: <strong>**tučně**</strong> a <em>*kurzíva*</em>. Vzhled bloku zůstává stejný, mění se jen text.
      </p>

      <div>
        <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-title`}>
          {fields.title} *
        </label>
        <input
          id={`${ids}-title`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={EDIT_INPUT_CLASS}
        />
        {fields.titleHidden && (
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Studentům se tento název nezobrazuje.</p>
        )}
      </div>

      {fields.kicker !== undefined && (
        <div>
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-kicker`}>
            {fields.kicker}
          </label>
          <input
            id={`${ids}-kicker`}
            type="text"
            value={kicker}
            onChange={(e) => setKicker(e.target.value)}
            className={EDIT_INPUT_CLASS}
          />
        </div>
      )}

      {fields.intro !== undefined && (
        <div>
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-intro`}>
            {fields.intro}
          </label>
          <textarea
            id={`${ids}-intro`}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={3}
            className={EDIT_INPUT_CLASS}
          />
        </div>
      )}

      <fieldset className="space-y-2">
        <div className="flex items-center justify-between">
          <legend className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {fields.itemsLegend} ({items.length})
          </legend>
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, { ...sectionItem({}), key: nextKey() }])}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Přidat položku
          </button>
        </div>

        {items.map((item, i) => (
          <div
            key={item.key}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Položka {i + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(i, -1)}
                  disabled={i === 0}
                  aria-label={`Posunout položku ${i + 1} výš`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label={`Posunout položku ${i + 1} níž`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((it) => it.key !== item.key))}
                  aria-label={`Smazat položku ${i + 1}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {itemFields.map((field) => {
              const inputId = `${ids}-${field}-${item.key}`;
              return (
                <div key={field}>
                  <label className={EDIT_LABEL_CLASS} htmlFor={inputId}>
                    {fields.item[field]}
                  </label>
                  {MULTILINE.includes(field) ? (
                    <textarea
                      id={inputId}
                      value={item[field]}
                      onChange={(e) => updateItem(item.key, { [field]: e.target.value })}
                      rows={field === 'text' ? 3 : 2}
                      className={EDIT_INPUT_CLASS}
                    />
                  ) : (
                    <input
                      id={inputId}
                      type="text"
                      value={item[field]}
                      onChange={(e) => updateItem(item.key, { [field]: e.target.value })}
                      className={EDIT_INPUT_CLASS}
                    />
                  )}
                </div>
              );
            })}

            {fields.item.rating && (
              <div className="grid grid-cols-2 gap-2">
                {(['probability', 'impact'] as const).map((field) => {
                  const inputId = `${ids}-${field}-${item.key}`;
                  return (
                    <div key={field}>
                      <label className={EDIT_LABEL_CLASS} htmlFor={inputId}>
                        {field === 'probability' ? 'Pravděpodobnost (1–5)' : 'Dopad (1–5)'}
                      </label>
                      <select
                        id={inputId}
                        value={item[field] ?? ''}
                        onChange={(e) =>
                          updateItem(item.key, { [field]: e.target.value ? Number(e.target.value) : undefined })
                        }
                        className={EDIT_INPUT_CLASS}
                      >
                        <option value="">—</option>
                        {RATING_VALUES.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </fieldset>

      {fields.outro !== undefined && (
        <div>
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-outro`}>
            {fields.outro}
          </label>
          <textarea
            id={`${ids}-outro`}
            value={outro}
            onChange={(e) => setOutro(e.target.value)}
            rows={2}
            className={EDIT_INPUT_CLASS}
          />
        </div>
      )}
    </EditModalShell>
  );
}
