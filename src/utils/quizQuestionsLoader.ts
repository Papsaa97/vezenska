import { Question } from '../types';
import { academyQuestions } from '../data/questionsData';
import { supabase } from '../lib/supabase';

/**
 * Bezpečně extrahuje index správné odpovědi (0-3) z libovolné formy otázky
 * (q.answer, q.correctAnswer, q.correctOption, q.correct_index).
 */
export function extractCorrectIndex(q: Question | Record<string, unknown>): number {
  const record = q as Record<string, unknown>;

  if (typeof record.correct_index === 'number') {
    return Math.min(Math.max(record.correct_index, 0), 3);
  }
  if (typeof record.correctOption === 'number') {
    return Math.min(Math.max(record.correctOption, 0), 3);
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
export function mapRowToQuestion(row: Record<string, unknown>): Question {
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
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[QuizQuestionsLoader] Chyba při čtení ze Supabase, použije se fallback:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return (data as Record<string, unknown>[]).map(mapRowToQuestion);
    }

    return null;
  } catch (err) {
    console.warn('[QuizQuestionsLoader] Výjimka při komunikaci se Supabase, použije se fallback:', err);
    return null;
  }
}

/**
 * Zkontroluje, které výchozí otázky z projektu (academyQuestions) ještě v Supabase nejsou,
 * a hromadně je do tabulky public.quiz_questions naimportuje.
 * 
 * Schéma tabulky public.quiz_questions:
 * - subject: text
 * - question: text
 * - options: jsonb (pole stringů)
 * - correct_index: integer (0-3)
 * - explanation: text
 * DŮLEŽITÉ: Neposílá se lokální id (nechá se vygenerovat UUID v Supabase).
 * DŮLEŽITÉ: Neposílají se sloupce 'answer', 'correct_option' ani 'rationale'.
 */
export async function importDefaultQuestionsToSupabase(
  _userId?: string | null,
  onProgress?: (imported: number, totalToImport: number) => void,
  forceOverwrite: boolean = false
): Promise<{
  success: boolean;
  importedCount: number;
  alreadyExistingCount: number;
  totalLocalCount: number;
  errorMessage?: string;
}> {
  const totalLocalCount = academyQuestions.length;

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      importedCount: 0,
      alreadyExistingCount: 0,
      totalLocalCount,
      errorMessage: 'Jste v offline režimu. Pro synchronizaci se Supabase se prosím připojte k internetu.',
    };
  }

  try {
    // 1. Získej existující texty otázek ze Supabase pro deduplikaci
    const { data: existingRows, error: fetchErr } = await supabase
      .from('quiz_questions')
      .select('question');

    if (fetchErr) {
      if (fetchErr.code === '42P01' || fetchErr.message.includes('does not exist')) {
        return {
          success: false,
          importedCount: 0,
          alreadyExistingCount: 0,
          totalLocalCount,
          errorMessage: 'Tabulka public.quiz_questions v Supabase dosud neexistuje. Spusťte prosím SQL skript v Supabase.',
        };
      }
      return {
        success: false,
        importedCount: 0,
        alreadyExistingCount: 0,
        totalLocalCount,
        errorMessage: `Chyba při kontrole existujících otázek: ${fetchErr.message}`,
      };
    }

    const existingNormalized = new Set<string>();
    if (existingRows) {
      for (const row of existingRows) {
        if (typeof row.question === 'string') {
          existingNormalized.add(row.question.trim().toLowerCase());
        }
      }
    }

    // 2. Najdi otázky, které v Supabase chybí
    const missingQuestions = forceOverwrite
      ? academyQuestions
      : academyQuestions.filter((q) => {
          const norm = q.question.trim().toLowerCase();
          return !existingNormalized.has(norm);
        });

    if (forceOverwrite) {
      // First, delete all existing questions to rewrite everything fresh
      await supabase.from('quiz_questions').delete().neq('id', 0);
    }


    const alreadyExistingCount = totalLocalCount - missingQuestions.length;

    if (missingQuestions.length === 0) {
      return {
        success: true,
        importedCount: 0,
        alreadyExistingCount,
        totalLocalCount,
      };
    }

    // 3. Dávkové vkládání (dávky po 50 otázkách)
    const BATCH_SIZE = 50;
    let importedTotal = 0;

    for (let i = 0; i < missingQuestions.length; i += BATCH_SIZE) {
      const batchSlice = missingQuestions.slice(i, i + BATCH_SIZE);

      // Připrav payload odpovídající přesnému schématu tabulky public.quiz_questions
      const payload = batchSlice.map((q) => {
        const correctIdx = extractCorrectIndex(q);
        const expl = q.explanation || q.rationale || '';

        return {
          subject: q.subject,
          question: q.question.trim(),
          options: q.options ?? [],
          correct_index: correctIdx,
          explanation: expl,
        };
      });

      const { error: insertError } = await supabase
        .from('quiz_questions')
        .insert(payload);

      if (insertError) {
        return {
          success: false,
          importedCount: importedTotal,
          alreadyExistingCount,
          totalLocalCount,
          errorMessage: `Chyba při vkládání dávky (${importedTotal + 1} - ${importedTotal + batchSlice.length}): ${insertError.message}`,
        };
      }

      importedTotal += batchSlice.length;
      if (onProgress) {
        onProgress(importedTotal, missingQuestions.length);
      }
    }

    return {
      success: true,
      importedCount: importedTotal,
      alreadyExistingCount,
      totalLocalCount,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Neznámá chyba při synchronizaci';
    return {
      success: false,
      importedCount: 0,
      alreadyExistingCount: 0,
      totalLocalCount,
      errorMessage: msg,
    };
  }
}
