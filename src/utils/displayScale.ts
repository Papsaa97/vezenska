import { supabase } from '../lib/supabase';

/**
 * Velikost zobrazení aplikace (návrh z 29. 9. 2026: „možnost změny rozlišení
 * obrazovky“).
 *
 * Aplikace je v Tailwindu, kde písmo i rozestupy vycházejí z `rem`. Změna
 * velikosti písma kořene (<html>) proto zvětší či zmenší celé rozhraní
 * rovnoměrně, podobně jako přiblížení v prohlížeči — jen to funguje i v PWA
 * na ploše, kde prohlížečové přiblížení chybí.
 *
 * Volba patří k účtu (user_metadata v Supabase Auth), takže platí na každém
 * zařízení. V prohlížeči se navíc drží kopie, aby se velikost použila hned při
 * startu, ještě než se načte přihlášení, a stránka neposkočila.
 */

export const DISPLAY_SCALES = [90, 100, 110, 125, 140] as const;
export type DisplayScale = (typeof DISPLAY_SCALES)[number];
export const DEFAULT_DISPLAY_SCALE: DisplayScale = 100;

export const DISPLAY_SCALE_LABELS: Record<DisplayScale, string> = {
  90: 'Menší',
  100: 'Běžná',
  110: 'Větší',
  125: 'Velká',
  140: 'Největší',
};

const LOCAL_KEY = 'vscr_display_scale';
const METADATA_KEY = 'display_scale';

export function isDisplayScale(value: unknown): value is DisplayScale {
  return typeof value === 'number' && (DISPLAY_SCALES as readonly number[]).includes(value);
}

/** Nastaví velikost na <html> a zapamatuje si ji v prohlížeči. */
export function applyDisplayScale(scale: DisplayScale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.fontSize = scale === DEFAULT_DISPLAY_SCALE ? '' : `${scale}%`;
  try {
    window.localStorage.setItem(LOCAL_KEY, String(scale));
  } catch {
    // Bez úložiště se velikost jen nepamatuje mezi starty.
  }
}

/** Použije velikost uloženou v prohlížeči (volá se před prvním vykreslením). */
export function applyStoredDisplayScale(): void {
  try {
    const stored = Number(window.localStorage.getItem(LOCAL_KEY));
    if (isDisplayScale(stored)) applyDisplayScale(stored);
  } catch {
    // viz výše
  }
}

/** Velikost uložená u účtu; účet bez volby má běžnou velikost. */
export function displayScaleFromMetadata(metadata: Record<string, unknown> | undefined | null): DisplayScale {
  const value = metadata?.[METADATA_KEY];
  return isDisplayScale(value) ? value : DEFAULT_DISPLAY_SCALE;
}

/** Uloží volbu k účtu. Vrací text chyby, nebo null. */
export async function saveDisplayScale(scale: DisplayScale): Promise<string | null> {
  applyDisplayScale(scale);
  const { error } = await supabase.auth.updateUser({ data: { [METADATA_KEY]: scale } });
  return error ? error.message : null;
}
