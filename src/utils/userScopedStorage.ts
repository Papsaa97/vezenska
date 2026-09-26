/**
 * Úložiště postupu vázané na účet, ne na zařízení.
 *
 * PROČ: veškerá gamifikace (pexeso, denní série, splněné scénáře a zbraňové
 * drily, Leitnerovy krabičky, oblíbené otázky) se dřív ukládala pod jedním
 * klíčem pro celý prohlížeč. Na sdíleném počítači v učebně si tak studenti
 * navzájem dědili sérii i splněné scénáře a XP v hlavičce se jim počítalo
 * z cizích dat — přitom README slibuje, že „nový uživatel vždy startuje na
 * prázdné historii / 0 XP“. Platilo to jen pro testy v Supabase.
 *
 * JAK: každý klíč dostane příponu s id přihlášeného uživatele. Nepřihlášený
 * host má vlastní jmenný prostor `anon`, takže si host a účet nemíchají data.
 *
 * PŘECHOD ZE STARÝCH DAT: první uživatel, který se na daném zařízení přihlásí,
 * si dosavadní data ze společného klíče převezme a společný klíč se smaže.
 * Je to jediné rozumné rozdělení — nikdo neví, komu z dřívějších uživatelů
 * data patřila — a hlavně se tím pro každého dalšího účet startuje čistý.
 */

const ANONYMOUS_OWNER = 'anon';

/** Vlastník, pod kterým se právě čte a zapisuje. */
let currentOwner: string = ANONYMOUS_OWNER;

/**
 * Událost, kterou modul vyvolá po každém zápisu.
 *
 * Bez ní se hlavička o XP za scénář nebo zbraňový dril nedozvěděla:
 * `calculateBaseXp` je čte z localStorage, což React v závislostech
 * memoizace nevidí, takže hlavička držela staré číslo celou session a
 * ukazovala jiné XP než záložka Odznaky.
 */
export const PROGRESS_EVENT = 'vscr:progress_updated';

function notifyProgressChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

/** Klíče, které se při prvním přihlášení převádějí ze společného úložiště. */
const MIGRATED_KEYS = [
  'vscr_matching_history',
  'vscr_streak_info',
  'vscr_completed_scenarios',
  'vscr_completed_drills',
  'vscr_leitner_boxes',
  'vscr_leitner_active',
  'vscr_favorites',
  'vscr_legal_favs',
  'vscr_custom_saved_exams',
  'vscr_gemini_api_key',
];

/** Plný klíč v localStorage pro daný základ a aktuálního vlastníka. */
export function scopedKey(base: string): string {
  return `${base}::${currentOwner}`;
}

/**
 * Nastaví, čí postup se čte a zapisuje. Volá se z AuthContext při každé
 * změně relace. Vrací true, když se vlastník opravdu změnil — volající pak
 * ví, že má stav znovu načíst.
 */
export function setStorageOwner(userId: string | null): boolean {
  const next = userId || ANONYMOUS_OWNER;
  if (next === currentOwner) return false;
  currentOwner = next;

  if (next !== ANONYMOUS_OWNER) migrateLegacyKeys();
  notifyProgressChanged();
  return true;
}

export function getStorageOwner(): string {
  return currentOwner;
}

/** Jednorázový převod dat ze společného klíče na první přihlášený účet. */
function migrateLegacyKeys(): void {
  if (typeof window === 'undefined') return;

  for (const base of MIGRATED_KEYS) {
    try {
      const legacy = localStorage.getItem(base);
      if (legacy === null) continue;

      // Účet, který už vlastní data má, si cizí nepřebírá.
      if (localStorage.getItem(scopedKey(base)) === null) {
        localStorage.setItem(scopedKey(base), legacy);
      }
      localStorage.removeItem(base);
    } catch (err) {
      console.warn(`[userScopedStorage] Převod klíče ${base} se nepodařil:`, err);
    }
  }
}

/** Přečte a rozparsuje hodnotu; při jakékoli potíži vrátí záložní hodnotu. */
export function readScoped<T>(base: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(scopedKey(base));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeScoped(base: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(scopedKey(base), JSON.stringify(value));
    notifyProgressChanged();
  } catch (err) {
    console.warn(`[userScopedStorage] Zápis klíče ${base} se nepodařil:`, err);
  }
}

export function removeScoped(base: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(scopedKey(base));
    notifyProgressChanged();
  } catch (err) {
    console.warn(`[userScopedStorage] Smazání klíče ${base} se nepodařilo:`, err);
  }
}

/** Nerozparsovaný zápis pro hodnoty, které nejsou JSON (např. 'true'). */
export function readScopedRaw(base: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(scopedKey(base));
  } catch {
    return null;
  }
}

export function writeScopedRaw(base: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(scopedKey(base), value);
    notifyProgressChanged();
  } catch (err) {
    console.warn(`[userScopedStorage] Zápis klíče ${base} se nepodařil:`, err);
  }
}
