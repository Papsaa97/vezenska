import type { Question, QuizSessionRecord } from '../types';

/**
 * Co student o otázce ví, odvozeno z uložené historie testů.
 *
 * - `new`: ještě ji nedostal,
 * - `weak`: naposledy chyba, nebo správně, ale jen tipem („Tipuji“, „Nevím“),
 * - `learning`: naposledy správně, ale zatím jen jednou po sobě,
 * - `mastered`: aspoň dvakrát po sobě správně a naposledy ne tipem.
 *
 * Dvě správné odpovědi po sobě jsou schválně nízká laťka: banka má stovky
 * otázek a student má vidět, že se ukazatel hýbe. Jedna chyba otázku vrací
 * zpátky mezi slabé.
 */
export type MasteryState = 'new' | 'weak' | 'learning' | 'mastered';

export interface QuestionMastery {
  state: MasteryState;
  /** Kolik správných odpovědí po sobě má otázka od poslední chyby. */
  correctStreak: number;
  /** Kdy ji student viděl naposledy (ms), 0 = nikdy. */
  lastSeen: number;
}

export interface SubjectReadiness {
  subject: string;
  total: number;
  mastered: number;
  learning: number;
  weak: number;
  unseen: number;
  /** Podíl zvládnutých otázek v procentech. */
  percent: number;
}

/** Po kolika dnech se zvládnutá otázka vrací k zopakování. */
const REVIEW_AFTER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Stav každé otázky, na kterou student někdy odpovídal.
 *
 * Pokusy se berou v časovém pořadí testů; v rámci jednoho testu záleží jen na
 * tom, jak odpověděl, pořadí tam nehraje roli (otázka je v testu jednou).
 */
export function buildMasteryMap(history: ReadonlyArray<QuizSessionRecord>): Map<string, QuestionMastery> {
  const map = new Map<string, QuestionMastery>();
  const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);

  for (const session of sorted) {
    for (const attempt of session.attempts ?? []) {
      if (!attempt?.questionId) continue;
      const prev = map.get(attempt.questionId) ?? { state: 'new' as MasteryState, correctStreak: 0, lastSeen: 0 };
      const guessed = attempt.confidence === 'guess' || attempt.confidence === 'dont_know';

      let correctStreak: number;
      let state: MasteryState;
      if (!attempt.isCorrect) {
        correctStreak = 0;
        state = 'weak';
      } else if (guessed) {
        // Uhodnutá odpověď se nepočítá jako znalost, ale ani nemaže předchozí řadu.
        correctStreak = prev.correctStreak;
        state = 'weak';
      } else {
        correctStreak = prev.correctStreak + 1;
        state = correctStreak >= 2 ? 'mastered' : 'learning';
      }

      map.set(attempt.questionId, { state, correctStreak, lastSeen: session.timestamp });
    }
  }
  return map;
}

export function masteryOf(map: ReadonlyMap<string, QuestionMastery>, questionId: string): QuestionMastery {
  return map.get(questionId) ?? { state: 'new', correctStreak: 0, lastSeen: 0 };
}

/**
 * Pořadí otázek pro chytré procvičování: nejdřív slabé, pak nové, pak
 * rozpracované, zvládnuté až nakonec — kromě těch, které student delší dobu
 * neviděl; ty se řadí k rozpracovaným, aby se zopakovaly.
 *
 * V rámci skupiny jdou dřív otázky viděné nejdávněji; nové se promíchají,
 * jinak by chodily pořád ve stejném pořadí, v jakém jsou v bance.
 */
export function orderForPractice(
  questions: ReadonlyArray<Question>,
  map: ReadonlyMap<string, QuestionMastery>,
  now: number = Date.now(),
): Question[] {
  const rank = (m: QuestionMastery): number => {
    switch (m.state) {
      case 'weak': return 0;
      case 'new': return 1;
      case 'learning': return 2;
      case 'mastered': return now - m.lastSeen > REVIEW_AFTER_DAYS * DAY_MS ? 2 : 3;
    }
  };
  const decorated = questions.map((q) => {
    const m = masteryOf(map, q.id);
    return { q, rank: rank(m), lastSeen: m.lastSeen, tie: Math.random() };
  });
  decorated.sort((a, b) => a.rank - b.rank || a.lastSeen - b.lastSeen || a.tie - b.tie);
  return decorated.map((d) => d.q);
}

/** Připravenost po předmětech banky, seřazená od nejslabšího. */
export function subjectReadiness(
  questions: ReadonlyArray<Question>,
  map: ReadonlyMap<string, QuestionMastery>,
): SubjectReadiness[] {
  const bySubject = new Map<string, SubjectReadiness>();
  for (const q of questions) {
    if (!q?.subject || !q.options || q.options.length === 0) continue;
    const entry = bySubject.get(q.subject)
      ?? { subject: q.subject, total: 0, mastered: 0, learning: 0, weak: 0, unseen: 0, percent: 0 };
    entry.total += 1;
    const state = masteryOf(map, q.id).state;
    if (state === 'mastered') entry.mastered += 1;
    else if (state === 'learning') entry.learning += 1;
    else if (state === 'weak') entry.weak += 1;
    else entry.unseen += 1;
    bySubject.set(q.subject, entry);
  }
  return [...bySubject.values()]
    .map((e) => ({ ...e, percent: e.total > 0 ? Math.round((e.mastered / e.total) * 100) : 0 }))
    .sort((a, b) => a.percent - b.percent || b.weak - a.weak);
}
