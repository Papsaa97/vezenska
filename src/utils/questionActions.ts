import { Question } from '../types';
import { supabase } from '../lib/supabase';
import { writeFailure } from './supabaseWrite';

const HIDDEN_QUESTIONS_KEY = 'vscr_hidden_questions';

/**
 * Získá množinu ID otázek, které byly lokálně označeny jako skryté.
 */
export function getHiddenQuestionIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(HIDDEN_QUESTIONS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (e) {
    console.error('[questionActions] Chyba při čtení skrytých otázek z localStorage:', e);
    return new Set();
  }
}

/**
 * Uloží stav skrytí otázky do localStorage.
 */
export function setQuestionHiddenInStorage(questionId: string, isHidden: boolean): void {
  if (typeof window === 'undefined' || !questionId) return;
  try {
    const current = getHiddenQuestionIds();
    if (isHidden) {
      current.add(questionId);
    } else {
      current.delete(questionId);
    }
    localStorage.setItem(HIDDEN_QUESTIONS_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {
    console.error('[questionActions] Chyba při zápisu skrytých otázek do localStorage:', e);
  }
}

/**
 * Zjistí, zda je otázka skrytá (kombinace příznaku v objektu a lokálního úložiště).
 */
export function isQuestionHidden(question: Question): boolean {
  // Příznak z databáze má přednost. Místní seznam je jen pro otázky, které
  // příznak nemají (výchozí banka bez spojení se serverem) — dřív se k němu
  // přičítal vždy, takže otázku, kterou jiný lektor zveřejnil, tohle zařízení
  // dál skrývalo, i studentům na sdíleném počítači.
  if (typeof question.is_hidden === 'boolean') return question.is_hidden;
  if (!question.id) return false;
  return getHiddenQuestionIds().has(question.id);
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Uloží změny otázky do Supabase i lokálního úložiště a rozešle notifikaci aplikaci.
 */
export async function updateQuestionInSupabase(
  updatedQuestion: Question
): Promise<{ success: boolean; error?: string }> {
  const isHidden = updatedQuestion.is_hidden ?? false;

  // Offline se změna neuloží nikam, kde by ji viděli studenti. Dřív se tu
  // hlásil úspěch a stav se zapsal jen do tohoto zařízení.
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, error: 'Jste offline — změnu otázky teď nelze uložit na server.' };
  }

  const correctIdx = typeof updatedQuestion.correctOption === 'number'
    ? updatedQuestion.correctOption
    : (updatedQuestion.correct_index ?? 0);

  const cleanOptions = updatedQuestion.options && updatedQuestion.options.length > 0
    ? updatedQuestion.options
    : [updatedQuestion.answer];

  const fullPayload: Record<string, unknown> = {
    subject: updatedQuestion.subject,
    topic: updatedQuestion.topic || updatedQuestion.subject,
    question: updatedQuestion.question.trim(),
    options: cleanOptions,
    correct_index: correctIdx,
    explanation: updatedQuestion.rationale || updatedQuestion.explanation || '',
    source: updatedQuestion.source || '',
    is_hidden: isHidden,
  };

  try {
    let queryError: { message?: string; code?: string } | null = null;
    // Zamítnutí RLS u UPDATE není chyba, ale nula zasažených řádků — proto je
    // každý UPDATE zakončený .select() a výsledek se počítá. Bez toho se
    // úprava otázky tvářila jako uložená a po znovunačtení banky byla pryč.
    let rejection: string | null = null;

    // Pokud je ID platné UUID, zkusíme update podle ID
    if (UUID_REGEX.test(updatedQuestion.id)) {
      const res = await supabase
        .from('quiz_questions')
        .update(fullPayload)
        .eq('id', updatedQuestion.id)
        .select('id');
      queryError = res.error;
      if (!queryError) rejection = writeFailure('Otázku', res);
    } else {
      // Jinak zkusíme update podle textu otázky nebo upsert
      const { data: existing } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('question', updatedQuestion.question.trim())
        .maybeSingle();

      if (existing?.id) {
        const res = await supabase
          .from('quiz_questions')
          .update(fullPayload)
          .eq('id', existing.id)
          .select('id');
        queryError = res.error;
        if (!queryError) rejection = writeFailure('Otázku', res);
      } else {
        const { error } = await supabase
          .from('quiz_questions')
          .upsert(fullPayload, { onConflict: 'question' });
        queryError = error;
      }
    }

    // Odolnost: pokud Supabase tabulka zatím nemá sloupec is_hidden nebo source v produkci,
    // zkusíme záložní payload s garantovanými sloupci
    if (queryError && (queryError.message?.includes('column') || queryError.code === '42703')) {
      console.warn('[questionActions] Sloupce is_hidden/source v Supabase ještě neexistují, ukládám základní sloupce...');
      const fallbackPayload = {
        subject: updatedQuestion.subject,
        question: updatedQuestion.question.trim(),
        options: cleanOptions,
        correct_index: correctIdx,
        explanation: updatedQuestion.rationale || updatedQuestion.explanation || '',
      };

      if (UUID_REGEX.test(updatedQuestion.id)) {
        const res = await supabase
          .from('quiz_questions')
          .update(fallbackPayload)
          .eq('id', updatedQuestion.id)
          .select('id');
        queryError = res.error;
        rejection = queryError ? null : writeFailure('Otázku', res);
      } else {
        const { error: fbErr } = await supabase
          .from('quiz_questions')
          .upsert(fallbackPayload, { onConflict: 'question' });
        queryError = fbErr;
        rejection = null;
      }
    }

    if (rejection) {
      console.error('[questionActions] Zápis otázky neovlivnil žádný řádek (zamítla RLS).');
      return { success: false, error: rejection };
    }

    if (queryError) {
      console.error('[questionActions] Chyba Supabase při aktualizaci otázky:', queryError);
      return { success: false, error: queryError.message || 'Chyba při ukládání do databáze' };
    }

    // Místní seznam skrytých se zapíše až po potvrzení serverem.
    if (updatedQuestion.id) {
      setQuestionHiddenInStorage(updatedQuestion.id, isHidden);
    }

    // Upozorníme aplikaci na změnu
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vscr:questions_updated', { detail: { question: updatedQuestion } }));
    }

    return { success: true };
  } catch (err) {
    console.error('[questionActions] Výjimka při aktualizaci otázky:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Neznámá chyba při ukládání',
    };
  }
}

/**
 * Přepne viditelnost otázky (skrýt/zobrazit) a uloží stav.
 */
export async function toggleQuestionVisibilityInSupabase(
  question: Question
): Promise<{ success: boolean; isHidden: boolean; error?: string }> {
  const currentHidden = isQuestionHidden(question);
  const nextHidden = !currentHidden;

  const updated: Question = {
    ...question,
    is_hidden: nextHidden,
  };

  const res = await updateQuestionInSupabase(updated);
  return {
    success: res.success,
    isHidden: nextHidden,
    error: res.error,
  };
}
