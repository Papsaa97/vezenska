import React, { useState } from 'react';
import { MonitorSmartphone, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DISPLAY_SCALES,
  DISPLAY_SCALE_LABELS,
  DisplayScale,
  displayScaleFromMetadata,
  saveDisplayScale,
} from '../utils/displayScale';

/**
 * Volba velikosti zobrazení v profilu. Změna se projeví hned a uloží se
 * k účtu, takže platí i na dalších zařízeních (viz utils/displayScale).
 */
export default function DisplayScalePicker() {
  const { user } = useAuth();
  const [current, setCurrent] = useState<DisplayScale>(() => displayScaleFromMetadata(user?.user_metadata));
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePick = async (scale: DisplayScale) => {
    if (scale === current || saving) return;
    setCurrent(scale);
    setSaving(true);
    setError(null);
    const message = await saveDisplayScale(scale);
    setSaving(false);
    if (message) {
      setError('Velikost platí v tomto zařízení, k účtu se ji uložit nepodařilo. Zkuste to prosím později.');
      // Zobrazení se nevrací: uživatel chtěl změnu vidět hned.
    }
  };

  return (
    <fieldset className="space-y-3 pb-6 mb-6 border-b border-slate-800">
      <legend className="flex items-center gap-2 text-slate-300 mb-3">
        <MonitorSmartphone className="w-4 h-4 text-sky-400" aria-hidden="true" />
        <span className="text-sm font-bold">Velikost zobrazení</span>
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" aria-label="Ukládám" />}
      </legend>
      <p className="text-[0.6875rem] text-slate-400 leading-snug">
        Zvětší nebo zmenší písmo i ovládací prvky v celé aplikaci. Volba se uloží k vašemu účtu.
      </p>
      <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Velikost zobrazení">
        {DISPLAY_SCALES.map((scale) => {
          const active = scale === current;
          return (
            <button
              key={scale}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => void handlePick(scale)}
              className={`flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2 transition-all cursor-pointer ${
                active
                  ? 'bg-sky-500/15 border-sky-500/60 text-sky-200'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xs font-bold">{scale} %</span>
              <span className="text-[0.625rem] text-slate-400">{DISPLAY_SCALE_LABELS[scale]}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-[0.6875rem] text-amber-300">{error}</p>}
    </fieldset>
  );
}
