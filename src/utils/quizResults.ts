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
}

export interface QuizResultOperationResult {
  error: string | null;
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

/** Uloží nově dokončenou relaci testu do Supabase pod účet přihlášeného uživatele. */
export async function saveQuizResult(userId: string, result: QuizSessionRecord): Promise<QuizResultOperationResult> {
  const { error } = await supabase.from('quiz_results').insert([
    {
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
  ]);

  return { error: error?.message ?? null };
}

/** Trvale smaže celou historii testů přihlášeného uživatele. */
export async function clearQuizHistory(userId: string): Promise<QuizResultOperationResult> {
  const { error } = await supabase.from('quiz_results').delete().eq('user_id', userId);
  return { error: error?.message ?? null };
}
