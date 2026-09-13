/**
 * Kontrola kvality a integrity banky otázek.
 *
 * Spouštěj: npm run check:questions
 *           npm run check:questions -- --update-baseline
 *
 * Skript dělá dvě různé věci:
 *
 * 1. STRUKTURÁLNÍ KONTROLY (tvrdé selhání)
 *    Unikátnost ID, platnost correctOption, soulad answer s options[correctOption],
 *    duplicity, vyplněné rationale/source/topic. Tyhle kontroly banka dnes plní na
 *    100 %, takže je můžeme zamknout — každá regrese shodí build.
 *
 * 2. DÉLKOVÝ TELL (ráčna proti baseline)
 *    U 91 % otázek byla při zavedení této kontroly správná odpověď zároveň nejdelší
 *    ze čtyř. To znamená, že se test dá projít bez znalosti předmětu — stačí zvolit
 *    nejdelší možnost. Je to největší obsahová vada aplikace a opravit ji znamená
 *    přepsat distraktory u stovek otázek, což nejde udělat jedním commitem.
 *
 *    Proto se tu nekontroluje absolutní cíl, ale to, že se stav NEZHORŠUJE:
 *    počet otázek s délkovým tellem nesmí vzrůst — ani celkově, ani v jednom
 *    předmětu. Hlídá se počet, nikoli procento: u předmětu, který je na 100 %,
 *    by přidání další špatné otázky procento nezměnilo.
 *
 *    Po zlepšení přepiš baseline přes --update-baseline a commitni ji.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { academyQuestions } from '../src/data/questionsData';
import type { Question } from '../src/types';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = resolve(HERE, 'question-quality-baseline.json');

/** Cílový stav, ke kterému se má podíl délkového tellu postupně snižovat. */
const TARGET_LONGEST_PCT = 40;

interface SubjectMetrics {
  questions: number;
  longestIsCorrect: number;
  longestIsCorrectPct: number;
}

interface Baseline {
  popis: string;
  vytvoreno: string;
  cil: { longestIsCorrectPct: number };
  global: SubjectMetrics & { avgCorrectLen: number; avgDistractorLen: number };
  predmety: Record<string, SubjectMetrics>;
}

const pct = (part: number, whole: number): number =>
  whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;

// ─── 1. Strukturální kontroly ────────────────────────────────────────────────

function structuralProblems(questions: Question[]): string[] {
  const problems: string[] = [];
  const seenIds = new Map<string, number>();
  const seenText = new Map<string, string[]>();

  for (const q of questions) {
    seenIds.set(q.id, (seenIds.get(q.id) ?? 0) + 1);

    const textKey = q.question.trim().toLowerCase().replace(/\s+/g, ' ');
    seenText.set(textKey, [...(seenText.get(textKey) ?? []), q.id]);

    if (!q.options || q.options.length === 0) {
      problems.push(`${q.id}: chybí options`);
      continue;
    }
    if (q.options.length !== 4) {
      problems.push(`${q.id}: ${q.options.length} možností místo 4`);
    }
    if (typeof q.correctOption !== 'number') {
      problems.push(`${q.id}: correctOption není číslo (${String(q.correctOption)})`);
    } else if (q.correctOption < 0 || q.correctOption >= q.options.length) {
      problems.push(`${q.id}: correctOption ${q.correctOption} je mimo rozsah 0–${q.options.length - 1}`);
    } else {
      const correctText = q.options[q.correctOption]?.trim() ?? '';
      if (correctText !== (q.answer ?? '').trim()) {
        problems.push(`${q.id}: answer se neshoduje s options[${q.correctOption}]`);
      }
    }

    const normalized = q.options.map((o) => o.trim().toLowerCase());
    if (new Set(normalized).size !== normalized.length) {
      problems.push(`${q.id}: duplicitní možnosti`);
    }
    if (normalized.some((o) => !o)) {
      problems.push(`${q.id}: prázdná možnost`);
    }

    for (const field of ['answer', 'rationale', 'source', 'topic'] as const) {
      if (!q[field] || !String(q[field]).trim()) {
        problems.push(`${q.id}: chybí ${field}`);
      }
    }
  }

  for (const [id, count] of seenIds) {
    if (count > 1) problems.push(`duplicitní ID "${id}" (${count}×)`);
  }
  for (const [text, ids] of seenText) {
    if (ids.length > 1) problems.push(`duplicitní znění otázky u ${ids.join(', ')}: "${text.slice(0, 60)}…"`);
  }

  return problems;
}

// ─── 2. Měření délkového tellu ───────────────────────────────────────────────

function measure(questions: Question[]): Baseline['global'] & { predmety: Record<string, SubjectMetrics> } {
  const perSubject = new Map<string, { questions: number; longestIsCorrect: number }>();
  let total = 0;
  let longest = 0;
  let correctLenSum = 0;
  let distractorLenSum = 0;
  let distractorCount = 0;

  for (const q of questions) {
    if (!q.options || typeof q.correctOption !== 'number') continue;
    const lengths = q.options.map((o) => o.length);
    const correctLen = lengths[q.correctOption];
    if (correctLen === undefined) continue;

    const isLongest = correctLen >= Math.max(...lengths);
    const entry = perSubject.get(q.subject) ?? { questions: 0, longestIsCorrect: 0 };
    entry.questions++;
    if (isLongest) entry.longestIsCorrect++;
    perSubject.set(q.subject, entry);

    total++;
    if (isLongest) longest++;
    correctLenSum += correctLen;
    lengths.forEach((len, i) => {
      if (i !== q.correctOption) {
        distractorLenSum += len;
        distractorCount++;
      }
    });
  }

  const predmety: Record<string, SubjectMetrics> = {};
  for (const [subject, e] of [...perSubject.entries()].sort((a, b) => a[0].localeCompare(b[0], 'cs'))) {
    predmety[subject] = {
      questions: e.questions,
      longestIsCorrect: e.longestIsCorrect,
      longestIsCorrectPct: pct(e.longestIsCorrect, e.questions),
    };
  }

  return {
    questions: total,
    longestIsCorrect: longest,
    longestIsCorrectPct: pct(longest, total),
    avgCorrectLen: Math.round(correctLenSum / Math.max(1, total)),
    avgDistractorLen: Math.round(distractorLenSum / Math.max(1, distractorCount)),
    predmety,
  };
}

// ─── Běh ─────────────────────────────────────────────────────────────────────

const updateBaseline = process.argv.includes('--update-baseline');
const measured = measure(academyQuestions);
const { predmety, ...global } = measured;

console.log('═'.repeat(68));
console.log('KONTROLA KVALITY BANKY OTÁZEK');
console.log('═'.repeat(68));
console.log(`Otázek celkem: ${academyQuestions.length}`);
console.log();

const problems = structuralProblems(academyQuestions);
if (problems.length > 0) {
  console.log(`✗ STRUKTURÁLNÍ CHYBY: ${problems.length}`);
  problems.slice(0, 40).forEach((p) => console.log(`    ${p}`));
  if (problems.length > 40) console.log(`    … a dalších ${problems.length - 40}`);
} else {
  console.log('✓ Struktura: ID unikátní, correctOption platné, answer souhlasí s options,');
  console.log('  žádné duplicity, rationale/source/topic vyplněné u všech otázek.');
}
console.log();

console.log('DÉLKOVÝ TELL (správná odpověď je nejdelší ze čtyř)');
console.log('─'.repeat(68));
console.log(
  `Celkem: ${global.longestIsCorrect} / ${global.questions} = ${global.longestIsCorrectPct} %` +
    `   (cíl: ≤ ${TARGET_LONGEST_PCT} %)`
);
console.log(
  `Průměrná délka: správná ${global.avgCorrectLen} znaků, distraktor ${global.avgDistractorLen} znaků` +
    ` (${(global.avgCorrectLen / Math.max(1, global.avgDistractorLen)).toFixed(2)}×)`
);
console.log();
console.log('  předmět'.padEnd(30) + 'tell'.padStart(10) + 'podíl'.padStart(9));
for (const [subject, m] of Object.entries(predmety).sort(
  (a, b) => b[1].longestIsCorrectPct - a[1].longestIsCorrectPct
)) {
  const bar = m.longestIsCorrectPct >= 90 ? ' ←' : '';
  console.log(
    `  ${subject}`.padEnd(30) +
      `${m.longestIsCorrect}/${m.questions}`.padStart(10) +
      `${m.longestIsCorrectPct} %`.padStart(9) +
      bar
  );
}
console.log();

if (updateBaseline) {
  const baseline: Baseline = {
    popis:
      'Referenční stav kvality banky otázek. Kontrola check:questions hlídá, že počet ' +
      'otázek s délkovým tellem nevzroste. Po zlepšení obsahu přepiš tento soubor ' +
      'příkazem "npm run check:questions -- --update-baseline" a commitni ho.',
    vytvoreno: new Date().toISOString(),
    cil: { longestIsCorrectPct: TARGET_LONGEST_PCT },
    global,
    predmety,
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + '\n', 'utf-8');
  console.log(`✓ Baseline přepsána: ${BASELINE_PATH}`);
  console.log('  Nezapomeň ji commitnout.');
  process.exit(problems.length > 0 ? 1 : 0);
}

let baseline: Baseline;
try {
  baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8')) as Baseline;
} catch {
  console.error(`✗ Nepodařilo se načíst baseline ${BASELINE_PATH}.`);
  console.error('  Vytvoř ji: npm run check:questions -- --update-baseline');
  process.exit(1);
}

// Ráčna: počet otázek s délkovým tellem nesmí vzrůst — ani celkově, ani v předmětu.
const regressions: string[] = [];

if (global.longestIsCorrect > baseline.global.longestIsCorrect) {
  regressions.push(
    `celkem: ${baseline.global.longestIsCorrect} → ${global.longestIsCorrect} ` +
      `(+${global.longestIsCorrect - baseline.global.longestIsCorrect})`
  );
}
for (const [subject, m] of Object.entries(predmety)) {
  const base = baseline.predmety[subject];
  if (!base) {
    // Nový předmět: posuzujeme ho rovnou proti cíli, ne proti baseline.
    if (m.longestIsCorrectPct > TARGET_LONGEST_PCT) {
      regressions.push(
        `nový předmět "${subject}": ${m.longestIsCorrectPct} % > cíl ${TARGET_LONGEST_PCT} % ` +
          `(${m.longestIsCorrect}/${m.questions})`
      );
    }
    continue;
  }
  if (m.longestIsCorrect > base.longestIsCorrect) {
    regressions.push(
      `${subject}: ${base.longestIsCorrect} → ${m.longestIsCorrect} ` +
        `(+${m.longestIsCorrect - base.longestIsCorrect})`
    );
  }
}

const improvement = baseline.global.longestIsCorrect - global.longestIsCorrect;
if (improvement > 0) {
  console.log(
    `↓ Zlepšení proti baseline: o ${improvement} otázek méně ` +
      `(${baseline.global.longestIsCorrectPct} % → ${global.longestIsCorrectPct} %).`
  );
  console.log('  Přepiš baseline: npm run check:questions -- --update-baseline');
  console.log();
}

if (regressions.length > 0) {
  console.log('✗ ZHORŠENÍ DÉLKOVÉHO TELLU proti baseline:');
  regressions.forEach((r) => console.log(`    ${r}`));
  console.log();
  console.log('  Nové ani upravené otázky nesmí mít správnou odpověď výrazně delší než');
  console.log('  distraktory. Dorovnej distraktory na srovnatelnou délku, odbornost');
  console.log('  a gramatickou strukturu (viz AGENTS.md).');
}

if (problems.length > 0 || regressions.length > 0) {
  console.log();
  console.log('═'.repeat(68));
  console.log('KONTROLA NEPROŠLA');
  console.log('═'.repeat(68));
  process.exit(1);
}

console.log('═'.repeat(68));
console.log(
  global.longestIsCorrectPct > TARGET_LONGEST_PCT
    ? `KONTROLA PROŠLA (bez zhoršení). Do cíle ${TARGET_LONGEST_PCT} % zbývá přepracovat ` +
        `~${Math.max(0, global.longestIsCorrect - Math.floor((TARGET_LONGEST_PCT / 100) * global.questions))} otázek.`
    : `KONTROLA PROŠLA — cíl ${TARGET_LONGEST_PCT} % je splněn.`
);
console.log('═'.repeat(68));
