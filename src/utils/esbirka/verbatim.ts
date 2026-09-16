/**
 * Porovnání doslovnosti studijních textů s úředním zněním.
 *
 * Paragrafový výklad zobrazuje svůj text pod nadpisem „Doslovné znění zákona“.
 * Když je ve skutečnosti přepsaný vlastními slovy, je to vada — a nejhorší
 * druh vady, protože se učí naopak, než co v zákoně stojí. Ověřit to jde jen
 * proti závaznému zdroji, který aplikace až teď má (`npm run sync:laws`).
 *
 * METODA: věta se hledá v úředním znění jako posloupnost pěti po sobě jdoucích
 * slov. Doslovná citace se tak najde i při jiném zalomení řádků, uvozovkách či
 * mezerách, zatímco přeformulovaná věta propadne. Prahy jsou schválně mírné,
 * aby se hlásilo skutečné přepsání obsahu, ne drobné krácení.
 */

/** Kolik slov tvoří jeden porovnávaný úsek. */
const SHINGLE = 5;

/** Kratší věty nesou málo informace a hlásily by hlavně šum. */
const MIN_SENTENCE_CHARS = 60;

/** Podíl nalezených úseků, od kterého se věta bere jako doslovná. */
const MATCH_THRESHOLD = 0.6;

/**
 * Sjednotí zápis, aby se neshodovalo jen formátování: různé uvozovky, pomlčky,
 * nedělitelné mezery a velikost písmen.
 */
export function normalizeForComparison(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[„“”"»«]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Množina všech pětislovných úseků textu. Staví se jednou na předpis. */
export function buildShingleIndex(text: string): Set<string> {
  const words = normalizeForComparison(text).split(' ').filter(Boolean);
  const index = new Set<string>();
  for (let i = 0; i + SHINGLE <= words.length; i += 1) {
    index.add(words.slice(i, i + SHINGLE).join(' '));
  }
  return index;
}

/** Rozdělí text na věty vhodné k porovnání. */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?:])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= MIN_SENTENCE_CHARS);
}

/** Podíl úseků věty, které se v úředním znění vyskytují (0 až 1). */
export function sentenceMatchRatio(sentence: string, index: Set<string>): number {
  const words = normalizeForComparison(sentence).split(' ').filter(Boolean);
  if (words.length < SHINGLE) return 1;
  let hits = 0;
  let total = 0;
  for (let i = 0; i + SHINGLE <= words.length; i += 1) {
    total += 1;
    if (index.has(words.slice(i, i + SHINGLE).join(' '))) hits += 1;
  }
  return total === 0 ? 1 : hits / total;
}

export interface VerbatimResult {
  /** Kolik vět textu se v úředním znění našlo doslova. */
  doslovnych: number;
  /** Kolik vět se porovnávalo. */
  celkem: number;
  /** Věty, které se v úředním znění nenašly, i s naměřenou shodou. */
  neshodne: Array<{ veta: string; shoda: number }>;
}

/** Porovná jeden studijní text s úředním zněním předpisu. */
export function compareWithOfficialText(studyText: string, index: Set<string>): VerbatimResult {
  const sentences = splitSentences(studyText);
  const neshodne: Array<{ veta: string; shoda: number }> = [];
  let doslovnych = 0;

  for (const sentence of sentences) {
    const ratio = sentenceMatchRatio(sentence, index);
    if (ratio >= MATCH_THRESHOLD) {
      doslovnych += 1;
    } else {
      neshodne.push({ veta: sentence, shoda: ratio });
    }
  }

  return { doslovnych, celkem: sentences.length, neshodne };
}
