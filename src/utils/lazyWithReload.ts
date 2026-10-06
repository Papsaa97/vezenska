import { lazy } from 'react';

/**
 * Zotavení z „Failed to fetch dynamically imported module“.
 *
 * Záložky se načítají po částech (chunky s otiskem v názvu, např.
 * `Quiz-DEm2n1vr.js`). Když se mezitím nasadí nová verze, starý chunk na
 * serveru už není. Stránka otevřená před nasazením pak při prvním otevření
 * záložky sáhne na neexistující soubor a záložka spadne do chybové obrazovky
 * (hlášení z 29. 9. 2026 u záložky Zkouška).
 *
 * Pomůže jediné: načíst stránku znovu, tím přijde nový index.html s adresami
 * nových chunků. Aby se stránka při skutečném výpadku (bez sítě, chunk
 * rozbitý i v nové verzi) nezacyklila, obnovuje se nejvýš jednou za
 * RELOAD_GUARD_MS; další chyba už propadne do ErrorBoundary.
 */

const RELOAD_GUARD_KEY = 'vscr_chunk_reload_at';
const RELOAD_GUARD_MS = 30_000;

/** Je chyba selháním načtení části aplikace (a ne chybou v jejím kódu)? */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error ?? '');
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError|Unable to preload CSS/i.test(
    message
  );
}

/**
 * Obnoví stránku, pokud se to v posledních RELOAD_GUARD_MS nestalo.
 * Vrací true, když obnovení spustila.
 */
export function reloadForNewVersion(): boolean {
  if (typeof window === 'undefined') return false;
  let last = 0;
  try {
    last = Number(window.sessionStorage.getItem(RELOAD_GUARD_KEY) || '0');
  } catch {
    // sessionStorage může být zakázané; pak se obnoví jen tentokrát.
  }
  if (Date.now() - last < RELOAD_GUARD_MS) return false;
  try {
    window.sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  } catch {
    // viz výše
  }
  window.location.reload();
  return true;
}

/**
 * Pro přímé `import()` mimo React.lazy (banka otázek, pdf.js, náhledy Office).
 * I ty po nasazení nové verze sahají na chunk, který už na serveru není
 * (Vercel to v logu hlásil jako 404 na .js soubor).
 */
export function importWithReload<T>(factory: () => Promise<T>): Promise<T> {
  return factory().catch((error: unknown) => {
    if (isChunkLoadError(error) && reloadForNewVersion()) {
      return new Promise<never>(() => {});
    }
    throw error;
  });
}

/** Jako React.lazy, jen chybějící chunk po nasazení vyřeší obnovením stránky. */
export const lazyWithReload: typeof lazy = (factory) =>
  lazy(() =>
    factory().catch((error: unknown) => {
      if (isChunkLoadError(error) && reloadForNewVersion()) {
        // Stránka se právě obnovuje; do té doby ať Suspense ukazuje načítání.
        return new Promise<never>(() => {});
      }
      throw error;
    })
  );

/**
 * Vite hlásí selhání přednačtení (modulepreload, CSS chunku) událostí
 * `vite:preloadError`. Bez posluchače ji jen vyhodí jako chybu.
 */
export function installPreloadErrorRecovery(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewVersion()) event.preventDefault();
  });
}
