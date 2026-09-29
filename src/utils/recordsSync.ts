import { supabase } from '../lib/supabase';
import { MatchingRecord } from '../types';
import { getStorageOwner } from './userScopedStorage';

/**
 * Historie poznávaček/pexesa a denní série na serveru
 * (tabulka public.studijni_zaznamy, migrace 042).
 *
 * PROČ: obojí žilo jen v localStorage. Na jiném telefonu, v PWA na ploše nebo
 * po tom, co Safari po týdnu smaže data webu, začínal student od nuly — přišel
 * o XP z pexesa, odznaky za vytrvalost i hodnost, která na XP stojí.
 *
 * Stejně jako u progressSync: localStorage zůstává zdrojem pro vykreslení
 * (funguje offline), server je záloha, která se po přihlášení sloučí.
 */

export interface StreakSnapshot {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
  activeDaysCount: number;
}

type RecordKind = 'matching' | 'streak';

const TABLE = 'studijni_zaznamy';
const STREAK_ROW = 'serie';

/** Tabulka ještě neexistuje (migrace 042 neběžela) — přestaneme to zkoušet. */
let tableMissing = false;

function isMissingTable(code: string | undefined, message: string | undefined): boolean {
  if (code === 'PGRST205' || code === '42P01') return true;
  const text = message ?? '';
  return /studijni_zaznamy/.test(text) && /exist|find/i.test(text);
}

function currentUserId(): string | null {
  const owner = getStorageOwner();
  return owner === 'anon' ? null : owner;
}

function reportError(action: string, error: { code?: string; message?: string }): void {
  if (isMissingTable(error.code, error.message)) tableMissing = true;
  else console.warn(`[recordsSync] ${action}:`, error.message);
}

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Záznam z JSONB převede na MatchingRecord, nebo vrátí null (vadný řádek se přeskočí). */
function toMatchingRecord(value: unknown): MatchingRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const id = typeof raw.id === 'string' ? raw.id : '';
  const timestamp = num(raw.timestamp);
  if (!id || timestamp === null) return null;
  return {
    id,
    categoryId: typeof raw.categoryId === 'string' ? raw.categoryId : '',
    categoryTitle: typeof raw.categoryTitle === 'string' ? raw.categoryTitle : '',
    timestamp,
    timeSeconds: num(raw.timeSeconds) ?? 0,
    errorsCount: num(raw.errorsCount) ?? 0,
    flawless: raw.flawless === true,
    pairsCount: num(raw.pairsCount) ?? 0,
    xpEarned: num(raw.xpEarned) ?? 0,
  };
}

function toStreak(value: unknown): StreakSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const currentStreak = num(raw.currentStreak);
  if (currentStreak === null) return null;
  return {
    currentStreak,
    bestStreak: num(raw.bestStreak) ?? currentStreak,
    lastActiveDate: typeof raw.lastActiveDate === 'string' ? raw.lastActiveDate : '',
    activeDaysCount: num(raw.activeDaysCount) ?? 0,
  };
}

async function upsertRows(kind: RecordKind, rows: { klic: string; data: unknown }[]): Promise<void> {
  const userId = currentUserId();
  if (!userId || tableMissing || rows.length === 0) return;
  try {
    const now = new Date().toISOString();
    const { error } = await supabase.from(TABLE).upsert(
      rows.map((r) => ({ user_id: userId, druh: kind, klic: r.klic, data: r.data, updated_at: now })),
      { onConflict: 'user_id,druh,klic' }
    );
    if (error) reportError('Záznamy se nepodařilo uložit na server', error);
  } catch (err) {
    console.warn('[recordsSync] Spojení se serverem selhalo:', err);
  }
}

/** Pošle na server odehrané poznávačky (existující id se jen přepíší). */
export function pushMatchingRecords(records: MatchingRecord[]): Promise<void> {
  return upsertRows(
    'matching',
    records.map((r) => ({ klic: r.id, data: r }))
  );
}

export function pushStreak(streak: StreakSnapshot): Promise<void> {
  return upsertRows('streak', [{ klic: STREAK_ROW, data: streak }]);
}

/** Smaže serverovou historii poznávaček (tlačítko „Vymazat historii“). */
export async function clearRemoteMatching(): Promise<string | null> {
  const userId = currentUserId();
  if (!userId || tableMissing) return null;
  try {
    const { error } = await supabase.from(TABLE).delete().eq('user_id', userId).eq('druh', 'matching');
    if (error) {
      reportError('Historii poznávaček se nepodařilo smazat na serveru', error);
      return tableMissing ? null : error.message;
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

/** Načte serverové záznamy; při jakékoli potíži vrátí null. */
export async function pullRecords(
  userId: string
): Promise<{ matching: MatchingRecord[]; streak: StreakSnapshot | null } | null> {
  if (tableMissing) return null;
  try {
    const { data, error } = await supabase.from(TABLE).select('druh, klic, data').eq('user_id', userId);
    if (error) {
      reportError('Záznamy se nepodařilo načíst ze serveru', error);
      return null;
    }
    const matching: MatchingRecord[] = [];
    let streak: StreakSnapshot | null = null;
    for (const row of (data ?? []) as { druh: string; klic: string; data: unknown }[]) {
      if (row.druh === 'matching') {
        const rec = toMatchingRecord(row.data);
        if (rec) matching.push(rec);
      } else if (row.druh === 'streak' && row.klic === STREAK_ROW) {
        streak = toStreak(row.data);
      }
    }
    return { matching, streak };
  } catch (err) {
    console.warn('[recordsSync] Spojení se serverem selhalo:', err);
    return null;
  }
}

/**
 * Sloučí dvě série. Platí ta s pozdějším posledním dnem studia (ta je
 * aktuální); nejlepší série a počet aktivních dnů se berou vyšší, protože
 * každé zařízení mohlo vidět jen část dnů.
 */
export function mergeStreaks(a: StreakSnapshot | null, b: StreakSnapshot | null): StreakSnapshot | null {
  if (!a) return b;
  if (!b) return a;
  const newer = a.lastActiveDate >= b.lastActiveDate ? a : b;
  return {
    currentStreak: newer.currentStreak,
    lastActiveDate: newer.lastActiveDate,
    bestStreak: Math.max(a.bestStreak, b.bestStreak, a.currentStreak, b.currentStreak),
    activeDaysCount: Math.max(a.activeDaysCount, b.activeDaysCount),
  };
}
