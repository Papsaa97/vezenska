import React, { useEffect, useId, useState } from 'react';
import { FileText } from 'lucide-react';
import { BODY_PARTS, FIELD_LABELS, RecordTemplate } from '../../data/prisonAdminData';
import EditModalShell, { EDIT_INPUT_CLASS, EDIT_LABEL_CLASS } from './EditModalShell';

interface RecordTemplateEditModalProps {
  template: RecordTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: RecordTemplate) => Promise<{ persisted: boolean; error: string | null }>;
}

/** Pole, která ve formuláři generátoru bývají dlouhá — dostanou víc řádků. */
const LONG_FIELDS = new Set([
  'precedingEvents',
  'officerAction',
  'targetBehavior',
  'dpUsedDetails',
  'evaluation',
  'departmentHeadOpinion',
  'zrvReport',
  'directorDecision',
  'actDescription',
  'evidenceList',
  'eventStory',
  'actionsTimeline',
  'itemsList',
  'seizureReason',
  'officerReport',
]);

/**
 * Formulář tiskopisu generátoru záznamů: popis a ukázkový vzor vyplnění.
 *
 * Nabízí jen pole, která formulář tiskopisu má (klíče výchozího vzoru).
 * Pořadí a rozvržení polí ani tiskovou podobu tu měnit nejde — jsou v kódu
 * a pro každý tiskopis jiné.
 */
export default function RecordTemplateEditModal({ template, isOpen, onClose, onSave }: RecordTemplateEditModalProps) {
  const ids = useId();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [data, setData] = useState<Record<string, string>>({});
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !template) return;
    setTitle(template.title);
    setSubtitle(template.subtitle);
    setBadge(template.badge);
    setData({ ...template.defaultData });
    setBodyParts(template.affectedBodyPartsDefault ?? []);
    setErrorMsg(null);
  }, [template, isOpen]);

  if (!template) return null;

  const fieldKeys = Object.keys(template.defaultData);
  const hasBodyParts = template.affectedBodyPartsDefault !== undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Název tiskopisu nesmí zůstat prázdný.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    const next: RecordTemplate = {
      ...template,
      title: title.trim(),
      subtitle: subtitle.trim(),
      badge: badge.trim() || template.badge,
      defaultData: Object.fromEntries(fieldKeys.map((key) => [key, data[key] ?? ''])),
    };
    if (hasBodyParts) next.affectedBodyPartsDefault = bodyParts;
    const result = await onSave(next);
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
      title="Upravit tiskopis a ukázkový vzor"
      icon={<FileText className="w-5 h-5" />}
      saving={saving}
      errorMsg={errorMsg}
      saveLabel="Uložit tiskopis"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Vzor uvidí každý student, který tiskopis nemá rozepsaný, a obnoví ho tlačítkem „Obnovit vzor“.
        Používejte jen smyšlená jména a kódy.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-title`}>
            Název tiskopisu *
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
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-subtitle`}>
            Podtitul (právní rámec)
          </label>
          <input
            id={`${ids}-subtitle`}
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={EDIT_INPUT_CLASS}
          />
        </div>
        <div>
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-badge`}>
            Štítek (např. PGŘ č. 3/2024)
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

      {hasBodyParts && (
        <fieldset>
          <legend className={EDIT_LABEL_CLASS}>Zasažená místa těla ve vzoru</legend>
          <div className="flex flex-wrap gap-2">
            {BODY_PARTS.map((part) => (
              <label key={part.id} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bodyParts.includes(part.id)}
                  onChange={(e) =>
                    setBodyParts((prev) =>
                      e.target.checked ? [...prev, part.id] : prev.filter((p) => p !== part.id)
                    )
                  }
                  className="w-4 h-4 accent-amber-600"
                />
                {part.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Ukázkový vzor vyplnění ({fieldKeys.length} polí)
        </legend>
        {fieldKeys.map((key) => (
          <div key={key}>
            <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-f-${key}`}>
              {FIELD_LABELS[key] ?? key}
            </label>
            <textarea
              id={`${ids}-f-${key}`}
              value={data[key] ?? ''}
              onChange={(e) => setData((prev) => ({ ...prev, [key]: e.target.value }))}
              rows={LONG_FIELDS.has(key) ? 4 : 1}
              className={EDIT_INPUT_CLASS}
            />
          </div>
        ))}
      </fieldset>
    </EditModalShell>
  );
}
