import { supabase } from '../lib/supabase';
import { getStorageOwner } from './userScopedStorage';

/**
 * Splněné scénáře a drily na serveru (tabulka public.studijni_postup, migrace 040).
 *
 * PROČ: dřív žil tenhle postup jen v localStorage. Na jiném zařízení, v PWA
 * na ploše telefonu (má jiné úložiště než prohlížeč) nebo po tom, co Safari
 * po týdnu bez návštěvy smaže data webu, ukazovala záložka Modelové situace
 * „0 / 12 vyřešeno“, přestože uživatel scénáře prošel.
 *
 * localStorage zůstává zdrojem pro vykreslení (funguje i offline); server je
 * záloha, která se při přihlášení s místním stavem sloučí sjednocením —
 * splněnou položku tak žádné zařízení „neodsplní“.
 */

export type ProgressKind = 'scenario' | 'drill';

const TABLE = 'studijni_postup';

/** Tabulka ještě neexistuje (migrace 040 neběžela) — přestaneme to zkoušet. */
let tableMissing = false;

function isMissingTable(code: string | undefined, message: string | undefined): boolean {
  if (code === 'PGRST205' || code === '42P01') return true;
  const text = message ?? '';
  return /studijni_postup/.test(text) && /exist|find/i.test(text);
}

/** Id přihlášeného uživatele, pod kterým se právě čte úložiště, nebo null. */
function currentUserId(): string | null {
  const owner = getStorageOwner();
  return owner === 'anon' ? null : owner;
}

/** Zapíše splněné položky na server. Chyba nevadí — místní stav zůstává. */
export async function pushCompleted(kind: ProgressKind, ids: string[]): Promise<void> {
  const userId = currentUserId();
  if (!userId || tableMissing || ids.length === 0) return;
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert(
        ids.map((polozka) => ({ user_id: userId, druh: kind, polozka })),
        { onConflict: 'user_id,druh,polozka', ignoreDuplicates: true }
      );
    if (error) {
      if (isMissingTable(error.code, error.message)) tableMissing = true;
      else console.warn('[progressSync] Postup se nepodařilo uložit na server:', error.message);
    }
  } catch (err) {
    console.warn('[progressSync] Spojení se serverem selhalo:', err);
  }
}

/** Načte splněné položky ze serveru; při jakékoli potíži vrátí null. */
export async function pullCompleted(userId: string): Promise<Record<ProgressKind, string[]> | null> {
  if (tableMissing) return null;
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('druh, polozka')
      .eq('user_id', userId);
    if (error) {
      if (isMissingTable(error.code, error.message)) tableMissing = true;
      else console.warn('[progressSync] Postup se nepodařilo načíst ze serveru:', error.message);
      return null;
    }
    const result: Record<ProgressKind, string[]> = { scenario: [], drill: [] };
    for (const row of (data ?? []) as { druh: string; polozka: string }[]) {
      if (row.druh === 'scenario' || row.druh === 'drill') result[row.druh].push(row.polozka);
    }
    return result;
  } catch (err) {
    console.warn('[progressSync] Spojení se serverem selhalo:', err);
    return null;
  }
}
