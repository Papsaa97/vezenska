/**
 * Nahrání bundlované banky otázek do Supabase.
 *
 * VÝKON — PROČ SAMOSTATNÝ SOUBOR: `academyQuestions` má po zabalení 774 kB
 * (194 kB gzip). Dokud tyhle funkce žily v `quizQuestionsLoader.ts`, který si
 * App natahuje kvůli `fetchQuizQuestionsFromSupabase()`, putovala celá banka
 * do vstupního balíku a stahoval ji každý při prvním načtení — přitom je to
 * jen záloha pro případ, že Supabase nic nevrátí, a používá ji výhradně
 * Správa obsahu. Teď je v líně načítaném balíku spolu s ní.
 */
import { Question } from '../types';
import { academyQuestions } from '../data/questionsData';
import { supabase } from '../lib/supabase';
import { extractCorrectIndex } from './quizQuestionsLoader';

/**
 * Synchronizuje výchozí otázky z projektu (academyQuestions) do tabulky public.quiz_questions.
 *
 * Používá `upsert` s konfliktním klíčem na unikátním sloupci `question` (viz
 * supabase/quiz_questions.sql), takže otázka, která v Supabase již existuje (shoduje se
 * text otázky), je AKTUALIZOVÁNA aktuální lokální revizí – včetně nově promíchaného pořadí
 * `options` a odpovídajícího `correct_index`. Otázky, které v Supabase ještě nejsou, se
 * novĕ vloží. Díky tomu se po per-subject přeuspořádání distraktorů (viz
 * scripts/rebalanceOptionsPerSubject.ts) synchronizace korektně promítne i do už dříve
 * naimportovaných řádků, ne jen do nových.
 *
 * Schéma tabulky public.quiz_questions:
 * - subject: text
 * - question: text (UNIQUE – konfliktní klíč pro upsert)
 * - options: jsonb (pole stringů)
 * - correct_index: integer (0-3)
 * - explanation: text
 * DŮLEŽITÉ: Neposílá se lokální id (nechá se vygenerovat UUID v Supabase při vložení,
 * při aktualizaci existujícího řádku zůstává zachováno).
 * DŮLEŽITÉ: Neposílají se sloupce 'answer', 'correct_option' ani 'rationale'.
 */
/**
 * Vrátí výchozí otázky po striktní deduplikaci podle textu otázky (q.question.trim().toLowerCase()).
 */
export function getUniqueDefaultQuestions(allQuestions: Question[] = academyQuestions): Question[] {
  return Array.from(
    new Map(allQuestions.map((q) => [q.question.trim().toLowerCase(), q])).values()
  );
}

export async function importDefaultQuestionsToSupabase(
  _userId?: string | null,
  onProgress?: (imported: number, totalToImport: number) => void,
  forceOverwrite: boolean = false
): Promise<{
  success: boolean;
  importedCount: number;
  updatedCount: number;
  alreadyExistingCount: number;
  totalLocalCount: number;
  errorMessage?: string;
}> {
  // Striktní deduplikace podle textu otázky před rozdělením do dávek (zamezí chybě ON CONFLICT v PostgreSQL)
  const uniqueQuestions = getUniqueDefaultQuestions();
  const totalLocalCount = uniqueQuestions.length;

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      importedCount: 0,
      updatedCount: 0,
      alreadyExistingCount: 0,
      totalLocalCount,
      errorMessage: 'Jste v offline režimu. Pro synchronizaci se Supabase se prosím připojte k internetu.',
    };
  }

  try {
    // 1. Získej existující texty otázek ze Supabase (pro rozlišení nové / aktualizované ve statistice)
    const { data: existingRows, error: fetchErr } = await supabase
      .from('quiz_questions')
      .select('question');

    if (fetchErr) {
      if (fetchErr.code === '42P01' || fetchErr.message.includes('does not exist')) {
        return {
          success: false,
          importedCount: 0,
          updatedCount: 0,
          alreadyExistingCount: 0,
          totalLocalCount,
          errorMessage: 'Tabulka public.quiz_questions v Supabase dosud neexistuje. Spusťte prosím SQL skript v Supabase.',
        };
      }
      return {
        success: false,
        importedCount: 0,
        updatedCount: 0,
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
    const alreadyExistingCount = existingNormalized.size;

    if (forceOverwrite) {
      // Kompletní reset: smaž všechny řádky, upsert níže je pak nahraje od nuly
      await supabase.from('quiz_questions').delete().not('id', 'is', null);
      existingNormalized.clear();
    }

    // 2. Dávkový upsert (dávky po 50 otázkách) – posílá se výhradně deduplikované pole
    const BATCH_SIZE = 50;
    let importedTotal = 0;
    let updatedTotal = 0;

    for (let i = 0; i < uniqueQuestions.length; i += BATCH_SIZE) {
      const batchSlice = uniqueQuestions.slice(i, i + BATCH_SIZE);

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

      const { error: upsertError } = await supabase
        .from('quiz_questions')
        .upsert(payload, { onConflict: 'question', ignoreDuplicates: false });

      if (upsertError) {
        return {
          success: false,
          importedCount: importedTotal,
          updatedCount: updatedTotal,
          alreadyExistingCount,
          totalLocalCount,
          errorMessage: `Chyba při synchronizaci dávky (${importedTotal + updatedTotal + 1} - ${importedTotal + updatedTotal + batchSlice.length}): ${upsertError.message}`,
        };
      }

      for (const q of batchSlice) {
        const norm = q.question.trim().toLowerCase();
        if (existingNormalized.has(norm)) {
          updatedTotal++;
        } else {
          importedTotal++;
        }
      }

      if (onProgress) {
        onProgress(importedTotal + updatedTotal, uniqueQuestions.length);
      }
    }

    return {
      success: true,
      importedCount: importedTotal,
      updatedCount: updatedTotal,
      alreadyExistingCount,
      totalLocalCount,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Neznámá chyba při synchronizaci';
    return {
      success: false,
      importedCount: 0,
      updatedCount: 0,
      alreadyExistingCount: 0,
      totalLocalCount,
      errorMessage: msg,
    };
  }
}
