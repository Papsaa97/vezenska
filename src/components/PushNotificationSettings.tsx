import React from 'react';
import { BellRing, BellOff, Loader2 } from 'lucide-react';
import { usePushNotifications, PushStav } from '../hooks/usePushNotifications';
import { PUSH_DRUHY, PUSH_DRUH_POPIS } from '../utils/pushNotifications';

/** Vysvětlení stavů, ve kterých upozornění zapnout nejde. */
export const PUSH_STAV_POPIS: Partial<Record<PushStav, string>> = {
  'ios-plocha':
    'Na iPhonu a iPadu chodí upozornění jen z aplikace přidané na plochu: v Safari Sdílet → Přidat na plochu, pak aplikaci otevřete z plochy.',
  nepodporovano: 'Tento prohlížeč upozornění do zařízení nepodporuje. Zkuste Chrome, Edge, Firefox nebo Safari.',
  zablokovano:
    'Upozornění jsou pro tuto stránku v prohlížeči zablokovaná. Povolte je v nastavení webu (ikona vlevo od adresy) a stránku obnovte.',
};

/**
 * Upozornění do zařízení v profilu: zapnutí pro tento prohlížeč a výběr,
 * o čem chce uživatel vědět. Výběr platí pro všechna jeho zařízení,
 * zvoneček v aplikaci dostává všechno bez ohledu na něj.
 */
export default function PushNotificationSettings() {
  const { stav, pracuji, chyba, vypnuteDruhy, zapnout, vypnout, prepnoutDruh } = usePushNotifications(true);
  const vysvetleni = PUSH_STAV_POPIS[stav];

  return (
    <fieldset className="space-y-3 pb-6 mb-6 border-b border-slate-800">
      <legend className="flex items-center gap-2 text-slate-300 mb-3">
        <BellRing className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        <span className="text-sm font-bold">Upozornění do zařízení</span>
        {(stav === 'nacitam' || pracuji) && (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" aria-label="Pracuji" />
        )}
      </legend>
      <p className="text-[0.6875rem] text-slate-400 leading-snug">
        Oznámení ze zvonečku se ukážou i na zamčeném telefonu nebo na počítači, když aplikaci nemáte otevřenou.
        Zapíná se zvlášť v každém zařízení.
      </p>

      {vysvetleni && <p className="text-[0.6875rem] text-amber-300 leading-snug">{vysvetleni}</p>}

      {stav === 'vypnuto' && (
        <button
          type="button"
          onClick={() => void zapnout()}
          disabled={pracuji}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
          Zapnout v tomto zařízení
        </button>
      )}

      {stav === 'zapnuto' && (
        <>
          <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 px-3 py-2">
            <span className="text-xs text-emerald-200 font-semibold">V tomto zařízení zapnuto</span>
            <button
              type="button"
              onClick={() => void vypnout()}
              disabled={pracuji}
              className="flex items-center gap-1 text-[0.6875rem] font-semibold text-slate-300 hover:text-white cursor-pointer disabled:opacity-50"
            >
              <BellOff className="w-3.5 h-3.5" aria-hidden="true" /> Vypnout
            </button>
          </div>
          <div className="space-y-1.5">
            <p className="text-[0.6875rem] text-slate-400">Posílat upozornění na:</p>
            {PUSH_DRUHY.map((druh) => {
              const id = `push-druh-${druh}`;
              return (
                <div key={druh} className="flex items-center gap-2">
                  <input
                    id={id}
                    type="checkbox"
                    checked={!vypnuteDruhy.includes(druh)}
                    onChange={() => void prepnoutDruh(druh)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                  <label htmlFor={id} className="text-xs text-slate-300 cursor-pointer">
                    {PUSH_DRUH_POPIS[druh]}
                  </label>
                </div>
              );
            })}
          </div>
        </>
      )}

      {chyba && (
        <p role="alert" className="text-[0.6875rem] text-amber-300 leading-snug">
          {chyba}
        </p>
      )}
    </fieldset>
  );
}
