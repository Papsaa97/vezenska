import React, { useEffect, useId, useState } from 'react';
import { Crosshair, Plus, Trash2 } from 'lucide-react';
import { WeaponData, WeaponStep } from '../../data/weaponsData';
import { makeContentId } from '../../utils/contentLibrary';
import EditModalShell, { EDIT_INPUT_CLASS, EDIT_LABEL_CLASS } from './EditModalShell';

interface WeaponEditModalProps {
  weapon: WeaponData | null;
  isOpen: boolean;
  usedIds: string[];
  onClose: () => void;
  onSave: (weapon: WeaponData) => Promise<{ persisted: boolean; error: string | null }>;
}

/** Krok v editoru — `key` drží React klíč stabilní i po smazání kroku. */
interface DraftStep extends Omit<WeaponStep, 'stepNumber'> {
  key: string;
}

interface DraftSpec {
  key: string;
  label: string;
  value: string;
}

let keySeed = 0;
const nextKey = () => `k${Date.now().toString(36)}-${keySeed++}`;

const emptyStep = (): DraftStep => ({
  key: nextKey(),
  title: '',
  actionInstruction: '',
  whyCrucial: '',
  dangerIfOmitted: '',
});

const toDraftSteps = (steps: WeaponStep[] | undefined): DraftStep[] =>
  steps && steps.length > 0
    ? steps.map((s) => ({
        key: nextKey(),
        title: s.title,
        actionInstruction: s.actionInstruction,
        whyCrucial: s.whyCrucial,
        dangerIfOmitted: s.dangerIfOmitted,
      }))
    : [emptyStep()];

function cleanSteps(steps: DraftStep[]): WeaponStep[] {
  return steps
    .map((s) => ({
      title: s.title.trim(),
      actionInstruction: s.actionInstruction.trim(),
      whyCrucial: s.whyCrucial.trim(),
      dangerIfOmitted: s.dangerIfOmitted.trim(),
    }))
    .filter((s) => s.title && s.actionInstruction)
    .map((s, i) => ({ ...s, stepNumber: i + 1 }));
}

function StepsEditor({
  label,
  steps,
  onChange,
}: {
  label: string;
  steps: DraftStep[];
  onChange: (steps: DraftStep[]) => void;
}) {
  const ids = useId();
  const update = (key: string, patch: Partial<DraftStep>) =>
    onChange(steps.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label} ({steps.length})
        </legend>
        <button
          type="button"
          onClick={() => onChange([...steps, emptyStep()])}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Přidat krok
        </button>
      </div>
      {steps.map((step, i) => (
        <div
          key={step.key}
          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <label className="sr-only" htmlFor={`${ids}-t-${step.key}`}>
              Název kroku {i + 1}
            </label>
            <input
              id={`${ids}-t-${step.key}`}
              type="text"
              value={step.title}
              onChange={(e) => update(step.key, { title: e.target.value })}
              placeholder="Název kroku *"
              className={EDIT_INPUT_CLASS}
            />
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() => onChange(steps.filter((s) => s.key !== step.key))}
                aria-label={`Smazat krok ${i + 1}`}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <label className="sr-only" htmlFor={`${ids}-a-${step.key}`}>
            Pokyn ke kroku {i + 1}
          </label>
          <textarea
            id={`${ids}-a-${step.key}`}
            value={step.actionInstruction}
            onChange={(e) => update(step.key, { actionInstruction: e.target.value })}
            rows={2}
            placeholder="Co přesně udělat *"
            className={EDIT_INPUT_CLASS}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="sr-only" htmlFor={`${ids}-w-${step.key}`}>
                Proč je krok {i + 1} důležitý
              </label>
              <textarea
                id={`${ids}-w-${step.key}`}
                value={step.whyCrucial}
                onChange={(e) => update(step.key, { whyCrucial: e.target.value })}
                rows={2}
                placeholder="Proč je to důležité"
                className={EDIT_INPUT_CLASS}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor={`${ids}-d-${step.key}`}>
                Nebezpečí při vynechání kroku {i + 1}
              </label>
              <textarea
                id={`${ids}-d-${step.key}`}
                value={step.dangerIfOmitted}
                onChange={(e) => update(step.key, { dangerIfOmitted: e.target.value })}
                rows={2}
                placeholder="Co hrozí při vynechání"
                className={EDIT_INPUT_CLASS}
              />
            </div>
          </div>
        </div>
      ))}
    </fieldset>
  );
}

/** Formulář zbraně: základní údaje, technická data a oba postupy nácviku. */
export default function WeaponEditModal({ weapon, isOpen, usedIds, onClose, onSave }: WeaponEditModalProps) {
  const ids = useId();
  const [name, setName] = useState('');
  const [caliber, setCaliber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [serviceRole, setServiceRole] = useState('');
  const [specs, setSpecs] = useState<DraftSpec[]>([]);
  const [safetySteps, setSafetySteps] = useState<DraftStep[]>([]);
  const [disassemblySteps, setDisassemblySteps] = useState<DraftStep[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(weapon?.name ?? '');
    setCaliber(weapon?.caliber ?? '');
    setCapacity(weapon?.capacity ?? '');
    setServiceRole(weapon?.serviceRole ?? '');
    setSpecs(
      weapon?.technicalSpecs.length
        ? weapon.technicalSpecs.map((s) => ({ ...s, key: nextKey() }))
        : [{ key: nextKey(), label: '', value: '' }]
    );
    setSafetySteps(toDraftSteps(weapon?.safetySteps));
    setDisassemblySteps(toDraftSteps(weapon?.disassemblySteps));
    setErrorMsg(null);
  }, [weapon, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Název zbraně nesmí zůstat prázdný.');
      return;
    }
    const safety = cleanSteps(safetySteps);
    const disassembly = cleanSteps(disassemblySteps);
    if (safety.length === 0 || disassembly.length === 0) {
      setErrorMsg('Bezpečnostní kontrola i rozborka potřebují aspoň jeden krok s názvem a pokynem.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    const result = await onSave({
      id: weapon?.id ?? makeContentId('zbran', name, usedIds),
      name: name.trim(),
      caliber: caliber.trim(),
      capacity: capacity.trim(),
      serviceRole: serviceRole.trim(),
      technicalSpecs: specs
        .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
        .filter((s) => s.label && s.value),
      safetySteps: safety,
      disassemblySteps: disassembly,
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
      title={weapon ? `Upravit zbraň ${weapon.name}` : 'Nová zbraň'}
      icon={<Crosshair className="w-5 h-5" />}
      saving={saving}
      errorMsg={errorMsg}
      saveLabel="Uložit zbraň"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-3">
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-name`}>
            Název zbraně *
          </label>
          <input
            id={`${ids}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pistole CZ P-10 C"
            required
            className={EDIT_INPUT_CLASS}
          />
        </div>
        <div>
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-caliber`}>
            Ráže
          </label>
          <input
            id={`${ids}-caliber`}
            type="text"
            value={caliber}
            onChange={(e) => setCaliber(e.target.value)}
            className={EDIT_INPUT_CLASS}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-capacity`}>
            Kapacita zásobníku
          </label>
          <input
            id={`${ids}-capacity`}
            type="text"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className={EDIT_INPUT_CLASS}
          />
        </div>
        <div className="sm:col-span-3">
          <label className={EDIT_LABEL_CLASS} htmlFor={`${ids}-role`}>
            Použití ve službě
          </label>
          <textarea
            id={`${ids}-role`}
            value={serviceRole}
            onChange={(e) => setServiceRole(e.target.value)}
            rows={2}
            className={EDIT_INPUT_CLASS}
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <div className="flex items-center justify-between">
          <legend className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Takticko-technická data ({specs.length})
          </legend>
          <button
            type="button"
            onClick={() => setSpecs((prev) => [...prev, { key: nextKey(), label: '', value: '' }])}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Přidat údaj
          </button>
        </div>
        {specs.map((spec, i) => (
          <div key={spec.key} className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`${ids}-sl-${spec.key}`}>
              Údaj {i + 1}
            </label>
            <input
              id={`${ids}-sl-${spec.key}`}
              type="text"
              value={spec.label}
              onChange={(e) =>
                setSpecs((prev) => prev.map((s) => (s.key === spec.key ? { ...s, label: e.target.value } : s)))
              }
              placeholder="Údaj (např. Hmotnost)"
              className={EDIT_INPUT_CLASS}
            />
            <label className="sr-only" htmlFor={`${ids}-sv-${spec.key}`}>
              Hodnota údaje {i + 1}
            </label>
            <input
              id={`${ids}-sv-${spec.key}`}
              type="text"
              value={spec.value}
              onChange={(e) =>
                setSpecs((prev) => prev.map((s) => (s.key === spec.key ? { ...s, value: e.target.value } : s)))
              }
              placeholder="Hodnota"
              className={EDIT_INPUT_CLASS}
            />
            <button
              type="button"
              onClick={() => setSpecs((prev) => prev.filter((s) => s.key !== spec.key))}
              aria-label={`Smazat údaj ${i + 1}`}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </fieldset>

      <StepsEditor label="Bezpečnostní kontrola a vybíjení" steps={safetySteps} onChange={setSafetySteps} />
      <StepsEditor label="Částečná rozborka" steps={disassemblySteps} onChange={setDisassemblySteps} />
    </EditModalShell>
  );
}
