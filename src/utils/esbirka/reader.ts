/**
 * Pomůcky pro čtečku úplných znění.
 *
 * Text z e-Sbírky přichází jako jeden dlouhý řetězec. Aby v něm šlo skákat na
 * paragrafy a zvýrazňovat hledané, rozdělí se na bloky podle nadpisů paragrafů.
 */

export interface TextBlock {
  /** Klíč pro React a cíl pro odkaz „skoč na paragraf“. */
  key: string;
  /** Označení paragrafu (`§ 17`), nebo null u úvodní části před prvním §. */
  label: string | null;
  /** Nadpis ustanovení, pokud za označením následuje. */
  heading: string | null;
  /** Vlastní text bloku bez nadpisu. */
  body: string;
}

/** Nadpis paragrafu stojí na samostatném řádku a nic dalšího na něm není. */
const SECTION_HEADING = /^§\s*(\d+[a-z]*)$/;

/** Id prvku pro daný paragraf. Používá čtečka i tlačítka rychlého skoku. */
export function sectionAnchorId(label: string): string {
  return `esb-sek-${label.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase()}`;
}

/**
 * Rozdělí text předpisu na bloky po paragrafech.
 *
 * Řádek bezprostředně za nadpisem paragrafu se bere jako nadpis ustanovení,
 * pokud nezačíná číslovaným odstavcem — tak to sází e-Sbírka a bez toho by
 * název ustanovení splynul s textem.
 */
export function splitIntoSectionBlocks(text: string): TextBlock[] {
  const lines = text.split('\n');
  const blocks: TextBlock[] = [];
  let current: TextBlock = { key: 'uvod', label: null, heading: null, body: '' };
  const buffer: string[] = [];
  const used = new Set<string>();

  const flush = () => {
    current.body = buffer.join('\n').replace(/^\n+|\n+$/g, '');
    if (current.body || current.label) blocks.push(current);
    buffer.length = 0;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].trim().match(SECTION_HEADING);
    if (!match) {
      buffer.push(lines[i]);
      continue;
    }

    flush();

    const label = `§ ${match[1]}`;
    // Nadpis se smí opakovat jen v teorii, ale klíč musí být jedinečný vždy.
    let key = sectionAnchorId(label);
    let suffix = 2;
    while (used.has(key)) {
      key = `${sectionAnchorId(label)}-${suffix}`;
      suffix += 1;
    }
    used.add(key);

    let heading: string | null = null;
    let next = i + 1;
    while (next < lines.length && lines[next].trim() === '') next += 1;
    const candidate = lines[next]?.trim() ?? '';
    if (candidate && !/^\(\d+\)/.test(candidate) && !SECTION_HEADING.test(candidate) && candidate.length <= 120) {
      heading = candidate;
      i = next;
    }

    current = { key, label, heading, body: '' };
  }

  flush();
  return blocks;
}

/**
 * Rozseká text na úseky podle hledaného výrazu, aby šly shody zvýraznit.
 * Liché položce výsledku odpovídá shoda.
 */
export function splitByQuery(text: string, query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [text];
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.split(new RegExp(`(${escaped})`, 'gi'));
}

/** Kolik shod hledaného výrazu text obsahuje. */
export function countMatches(text: string, query: string): number {
  const trimmed = query.trim();
  if (!trimmed) return 0;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.match(new RegExp(escaped, 'gi'))?.length ?? 0;
}
