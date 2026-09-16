import { Question } from '../types';
import { supabase } from '../lib/supabase';

export interface SupabaseQuizQuestionRow {
  id?: string | number | null;
  subject?: string | null;
  topic?: string | null;
  question?: string | null;
  answer?: string | number | null;
  options?: string[] | string | null;
  correct_index?: number | null;
  correct_option?: number | null;
  correctOption?: number | null;
  rationale?: string | null;
  explanation?: string | null;
  source?: string | null;
  created_at?: string | null;
  is_hidden?: boolean | null;
  // Index signature je nutná pro kompatibilitu s `Record<string, unknown>` ve funkci
  // extractCorrectIndex() — TypeScript vyžaduje, aby byl interface přiřaditelný.
  [key: string]: unknown;
}

/**
 * Bezpečně extrahuje index správné odpovědi (0-3) z libovolné formy otázky
 * (q.answer, q.correctAnswer, q.correctOption, q.correct_index).
 */
export function extractCorrectIndex(q: Question | SupabaseQuizQuestionRow | Record<string, unknown>): number {
  const record = q as SupabaseQuizQuestionRow;

  if (typeof record.correct_index === 'number') {
    return Math.min(Math.max(record.correct_index, 0), 3);
  }
  if (typeof record.correctOption === 'number') {
    return Math.min(Math.max(record.correctOption, 0), 3);
  }
  if (typeof record.correct_option === 'number') {
    return Math.min(Math.max(record.correct_option, 0), 3);
  }
  if (typeof record.correctAnswer === 'number') {
    return Math.min(Math.max(record.correctAnswer, 0), 3);
  }
  if (typeof record.answer === 'number') {
    return Math.min(Math.max(record.answer, 0), 3);
  }

  const rawCandidate = record.answer ?? record.correctAnswer ?? record.correct_index;
  if (typeof rawCandidate === 'string') {
    const rawTrimmed = rawCandidate.trim();

    // 1. Zkontroluj, zda řetězec přesně odpovídá některé možnosti v options
    const options = record.options;
    if (Array.isArray(options)) {
      const foundIdx = options.findIndex((opt: unknown) => String(opt).trim() === rawTrimmed);
      if (foundIdx !== -1) return foundIdx;
    }

    // 2. Zkontroluj písmena A, B, C, D nebo číslice 0, 1, 2, 3
    const upper = rawTrimmed.toUpperCase();
    if (upper === 'A' || upper === '0') return 0;
    if (upper === 'B' || upper === '1') return 1;
    if (upper === 'C' || upper === '2') return 2;
    if (upper === 'D' || upper === '3') return 3;

    const parsedNum = parseInt(rawTrimmed, 10);
    if (!isNaN(parsedNum) && parsedNum >= 0 && parsedNum < 4) {
      return parsedNum;
    }
  }

  return 0;
}

/**
 * Převede surový záznam z tabulky public.quiz_questions na typ Question.
 * Správně mapuje `correct_index` i `explanation` zpět na formát očekávaný testovacím enginem.
 */
export function mapRowToQuestion(row: SupabaseQuizQuestionRow): Question {
  const correctIdx = typeof row.correct_index === 'number'
    ? row.correct_index
    : typeof row.correct_option === 'number'
    ? row.correct_option
    : typeof row.correctOption === 'number'
    ? row.correctOption
    : 0;

  let options: string[] = [];
  if (Array.isArray(row.options)) {
    options = row.options.map(String);
  } else if (typeof row.options === 'string') {
    try {
      const parsed = JSON.parse(row.options);
      if (Array.isArray(parsed)) {
        options = parsed.map(String);
      }
    } catch {
      options = [];
    }
  }

  const subject = String(row.subject || 'Ostatní');
  const answer = String(
    row.answer || (options.length > correctIdx ? options[correctIdx] : '')
  );
  const topic = row.topic ? String(row.topic) : subject;
  const source = row.source ? String(row.source) : 'Banka otázek Supabase';
  const explanation = row.explanation
    ? String(row.explanation)
    : row.rationale
    ? String(row.rationale)
    : '';

  return {
    id: String(row.id),
    subject,
    topic,
    question: String(row.question || ''),
    answer,
    options: options.length > 0 ? options : undefined,
    correctOption: correctIdx,
    correct_index: correctIdx,
    rationale: explanation,
    explanation,
    source,
    is_hidden: row.is_hidden === true,
  };
}

/**
 * Načte otázky ze Supabase tabulky public.quiz_questions.
 * Pokud je uživatel offline, databáze je nedostupná nebo je tabulka prázdná,
 * vrátí null (indikátor pro použití fallbacku na lokální otázky).
 */
export async function fetchQuizQuestionsFromSupabase(): Promise<Question[] | null> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return null;
  }

  try {
    // Vyjmenované sloupce musí v tabulce existovat, jinak PostgREST celý dotaz
    // odmítne chybou 42703 a načtení skončí fallbackem na bundlovanou sadu — i když
    // je banka plná. Přesně to se dělo: výběr obsahoval `answer`, `correct_option`,
    // `correctOption` a `rationale`, tedy čtyři názvy, které v public.quiz_questions
    // nikdy nevznikly (skutečné schéma viz supabase/quiz_questions.sql). Aplikace tak
    // trvale jela na 377 otázkách z balíčku místo na bance.
    //
    // mapRowToQuestion() ty názvy dál umí přečíst, kdyby řádek odjinud přišel — jen
    // se na ně už nesmí ptát databáze.
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, subject, topic, question, options, correct_index, explanation, source, is_hidden')
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error) {
      console.warn('[QuizQuestionsLoader] Chyba při čtení ze Supabase, použije se fallback:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return (data as SupabaseQuizQuestionRow[]).map(mapRowToQuestion);
    }

    return null;
  } catch (err) {
    console.warn('[QuizQuestionsLoader] Výjimka při komunikaci se Supabase, použije se fallback:', err);
    return null;
  }
}
