import { supabase } from '../lib/supabase';
import { QuestionAttempt, QuizSessionRecord } from '../types';

/** Přesný tvar řádku tabulky public.quiz_results v Supabase. */
export interface QuizResultRow {
  id: string;
  user_id: string;
  subject: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  time_spent_seconds: number | null;
  attempts: QuestionAttempt[];
  correct_in_limit: number | null;
  correct_after_limit: number | null;
  completed_at: string;
  created_at: string;
  /** True, když skóre spočítala funkce vyhodnotit_kviz(), ne prohlížeč. Viz migrace 021. */
  overeno?: boolean;
}

export interface QuizResultOperationResult {
  error: string | null;
  /** True, když řádek v databázi už byl — konflikt primárního klíče při opakovaném odeslání. */
  alreadyStored?: boolean;
  /**
   * Výsledek tak, jak ho po vyhodnocení uložil server. Čísla v něm jsou závazná —
   * to, co spočítal prohlížeč, slouží jen k okamžitému zobrazení na výsledkové
   * obrazovce, než dorazí odpověď.
   */
  stored?: QuizSessionRecord;
}

/** Jedna odpověď tak, jak ji přijímá parametr p_odpovedi funkce vyhodnotit_kviz(). */
interface OdpovedProServer {
  id: string;
  otazka: string;
  vybrano: string;
  jistota: string;
  po_limitu: boolean;
}

/**
 * Převede dokončený test na vstup pro serverové vyhodnocení.
 *
 * Vrátí null, když záznam pochází ze starší verze aplikace, která si text zvolené
 * odpovědi nepamatovala. Takový výsledek se serverově ohodnotit nedá (index do
 * promíchaného pole možností nikomu jinému nic neříká) a ukládá se dosavadní
 * cestou jako neověřený — zahodit ho by znamenalo připravit uživatele o test,
 * který mu uvízl ve frontě.
 */
function odpovediProServer(result: QuizSessionRecord): OdpovedProServer[] | null {
  const attempts = result.attempts ?? [];
  if (attempts.length === 0) return null;
  if (!attempts.every((a) => typeof a.selectedText === 'string')) return null;

  return attempts.map((a) => ({
    id: a.questionId,
    otazka: a.questionText,
    vybrano: a.selectedText ?? '',
    jistota: a.confidence ?? 'know',
    po_limitu: a.timedOut === true,
  }));
}

/** Náhradní identifikátor řádku, když ho volající nepředal. Tvar UUID v4. */
function newRowId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString('cs-CZ')} ${date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}`;
}

function rowToSessionRecord(row: QuizResultRow): QuizSessionRecord {
  return {
    id: row.id,
    timestamp: new Date(row.completed_at).getTime(),
    dateFormatted: formatRelativeDate(row.completed_at),
    subject: row.subject,
    totalQuestions: row.total_questions,
    correctAnswers: row.correct_answers,
    accuracy: row.accuracy,
    timeSpentSeconds: row.time_spent_seconds ?? undefined,
    attempts: Array.isArray(row.attempts) ? row.attempts : [],
    correctInLimit: row.correct_in_limit ?? undefined,
    correctAfterLimit: row.correct_after_limit ?? undefined,
  };
}

/** Načte kompletní historii testů přihlášeného uživatele ze Supabase, seřazenou od nejstarší. */
export async function fetchQuizHistory(userId: string): Promise<{ history: QuizSessionRecord[]; error: string | null }> {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('id, user_id, subject, total_questions, correct_answers, accuracy, time_spent_seconds, attempts, correct_in_limit, correct_after_limit, completed_at, created_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: true });

  if (error) {
    return { history: [], error: error.message };
  }

  const rows = (data ?? []) as QuizResultRow[];
  return { history: rows.map(rowToSessionRecord), error: null };
}

/**
 * Uloží nově dokončenou relaci testu do Supabase pod účet přihlášeného uživatele.
 *
 * Skóre se NEPOSÍLÁ. Odchází jen to, co uživatel vybral, a kolik měl správně
 * spočítá funkce public.vyhodnotit_kviz() z banky otázek (migrace 021). Dřív si
 * `correct_answers` i `accuracy` určoval prohlížeč a politika u INSERT hlídala
 * jedině to, že si uživatel zapisuje pod sebe — vymyšlené číslo se tak dostalo až
 * do admin konzole, která z těch řádků počítá XP každého uživatele.
 *
 * `rowId` je identifikátor generovaný na klientovi (viz utils/quizResultQueue).
 * Posílá se jako primární klíč, takže opakované odeslání téhož výsledku po výpadku
 * sítě vrátí už uložený řádek místo vzniku duplikátu.
 */
export async function saveQuizResult(
  userId: string,
  result: QuizSessionRecord,
  rowId?: string
): Promise<QuizResultOperationResult> {
  const odpovedi = odpovediProServer(result);

  if (odpovedi) {
    const { data, error } = await supabase.rpc('vyhodnotit_kviz', {
      p_id: rowId ?? newRowId(),
      p_predmet: result.subject,
      p_cas_s: Math.max(0, Math.round(result.timeSpentSeconds ?? 0)),
      p_dokonceno_v: new Date(result.timestamp).toISOString(),
      p_odpovedi: odpovedi,
    });

    if (error) {
      return { error: error.message, alreadyStored: false };
    }

    // Funkce vrací celý uložený řádek; PostgREST ho podá jako objekt.
    const row = (Array.isArray(data) ? data[0] : data) as QuizResultRow | null;
    return {
      error: null,
      alreadyStored: false,
      stored: row ? rowToSessionRecord(row) : undefined,
    };
  }

  // Záložní cesta pro výsledky uvízlé ve frontě ze starší verze aplikace. Politika
  // „Vlastní výsledek jen jako neověřený" jim nedovolí nastavit overeno, takže se
  // uloží bez razítka a do XP v admin konzoli se nezapočítají.
  const { data, error } = await supabase
    .from('quiz_results')
    .insert([
      {
        ...(rowId ? { id: rowId } : {}),
        user_id: userId,
        subject: result.subject,
        total_questions: result.totalQuestions,
        correct_answers: result.correctAnswers,
        accuracy: result.accuracy,
        time_spent_seconds: result.timeSpentSeconds ?? null,
        attempts: result.attempts,
        correct_in_limit: result.correctInLimit ?? null,
        correct_after_limit: result.correctAfterLimit ?? null,
        completed_at: new Date(result.timestamp).toISOString(),
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    // 23505 = unique_violation. Řádek s tímhle klíčem už v databázi je, což při
    // opakovaném odeslání z fronty znamená, že první pokus prošel a jen se
    // ztratilo potvrzení. Pro volajícího je to úspěch, ne chyba.
    const alreadyStored = error.code === '23505';
    return { error: alreadyStored ? null : error.message, alreadyStored };
  }

  const row = data as QuizResultRow | null;
  return {
    error: null,
    alreadyStored: false,
    stored: row ? rowToSessionRecord(row) : undefined,
  };
}

/** Trvale smaže celou historii testů přihlášeného uživatele. */
export async function clearQuizHistory(userId: string): Promise<QuizResultOperationResult> {
  const { error } = await supabase.from('quiz_results').delete().eq('user_id', userId);
  return { error: error?.message ?? null };
}
