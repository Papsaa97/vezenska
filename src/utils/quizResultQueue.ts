import { QuizSessionRecord } from '../types';

/**
 * Trvalá fronta neodeslaných výsledků testů (náprava Z-16).
 *
 * PROČ: handleSaveQuizResult zapisoval výsledek přímo do Supabase a případnou
 * chybu pouze vypsal do konzole. Výsledek zůstal v paměti komponenty, takže se
 * student po dokončení testu díval na uložený výsledek — ale po obnovení
 * stránky byl pryč. Offline test tedy tiše zmizel, a to přesto, že mu banner
 * tvrdil, že aplikace funguje offline.
 *
 * Fronta žije v localStorage, přežije obnovení stránky i zavření prohlížeče
 * a odesílá se při návratu připojení, při startu aplikace a po přihlášení.
 */

const QUEUE_KEY = 'vscr_pending_quiz_results';

/**
 * Strop délky fronty. Chrání localStorage před zaplněním u někoho, kdo je
 * offline dlouhodobě; při překročení se zahazují nejstarší položky.
 */
const MAX_QUEUE_LENGTH = 200;

export interface PendingQuizResult {
  /**
   * Identifikátor řádku generovaný na klientovi. Posílá se do Supabase jako
   * primární klíč, takže opakované odeslání téhož výsledku skončí na konfliktu
   * primárního klíče místo aby vznikl duplikát.
   */
  id: string;
  userId: string;
  result: QuizSessionRecord;
  queuedAt: number;
  attempts: number;
  lastError: string | null;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Záloha pro prostředí bez crypto.randomUUID (starší WebView). Tvar UUID v4.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function loadPendingResults(): PendingQuizResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Obranná kontrola tvaru — v localStorage může být cokoli z dřívějších verzí.
    return parsed.filter((item): item is PendingQuizResult =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as PendingQuizResult).id === 'string' &&
      typeof (item as PendingQuizResult).userId === 'string' &&
      !!(item as PendingQuizResult).result
    );
  } catch (e) {
    console.error('[quizResultQueue] Frontu se nepodařilo načíst:', e);
    return [];
  }
}

function savePendingResults(queue: PendingQuizResult[]): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = queue.length > MAX_QUEUE_LENGTH ? queue.slice(-MAX_QUEUE_LENGTH) : queue;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('[quizResultQueue] Frontu se nepodařilo uložit:', e);
  }
}

/** Zařadí výsledek do fronty a vrátí zařazenou položku i novou podobu fronty. */
export function enqueuePendingResult(
  userId: string,
  result: QuizSessionRecord
): { pending: PendingQuizResult; queue: PendingQuizResult[] } {
  const pending: PendingQuizResult = {
    id: newId(),
    userId,
    result,
    queuedAt: Date.now(),
    attempts: 0,
    lastError: null,
  };
  const queue = [...loadPendingResults(), pending];
  savePendingResults(queue);
  return { pending, queue };
}

/** Odstraní z fronty položky, které už jsou v databázi. */
export function removePendingResults(ids: string[]): PendingQuizResult[] {
  if (ids.length === 0) return loadPendingResults();
  const remaining = loadPendingResults().filter((item) => !ids.includes(item.id));
  savePendingResults(remaining);
  return remaining;
}

/** Výsledky čekající na odeslání pro konkrétního uživatele. */
export function pendingResultsForUser(userId: string): PendingQuizResult[] {
  return loadPendingResults().filter((item) => item.userId === userId);
}

export interface FlushOutcome {
  sent: number;
  failed: number;
  remaining: PendingQuizResult[];
  lastError: string | null;
}

/**
 * Pokusí se odeslat všechny čekající výsledky daného uživatele.
 *
 * `sendOne` vrací chybovou hlášku, nebo null při úspěchu. Konflikt primárního
 * klíče (SQLSTATE 23505) se považuje za úspěch: řádek už v databázi je, jen
 * se nestihlo potvrzení, takže položka z fronty zmizí bez duplikátu.
 */
export async function flushPendingResults(
  userId: string,
  sendOne: (pending: PendingQuizResult) => Promise<{ error: string | null; alreadyStored?: boolean }>
): Promise<FlushOutcome> {
  const mine = pendingResultsForUser(userId);
  if (mine.length === 0) {
    return { sent: 0, failed: 0, remaining: loadPendingResults(), lastError: null };
  }

  const sentIds: string[] = [];
  let failed = 0;
  let lastError: string | null = null;

  for (const pending of mine) {
    const { error, alreadyStored } = await sendOne(pending);
    if (error === null || alreadyStored) {
      sentIds.push(pending.id);
    } else {
      failed += 1;
      lastError = error;
      pending.attempts += 1;
      pending.lastError = error;
    }
  }

  // Zapsat zvýšené počty pokusů u těch, které neprošly, a vyřadit odeslané.
  const queue = loadPendingResults().map((item) => {
    const updated = mine.find((m) => m.id === item.id);
    return updated ?? item;
  });
  const remaining = queue.filter((item) => !sentIds.includes(item.id));
  savePendingResults(remaining);

  return { sent: sentIds.length, failed, remaining, lastError };
}
