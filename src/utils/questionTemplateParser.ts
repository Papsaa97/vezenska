/**
 * questionTemplateParser.ts
 * 
 * Modul pro bezpečné zpracování, validaci a přípravu otázek pro hromadný import
 * z textové šablony (.txt) nebo CSV souboru do Banky otázek VS ČR.
 * 
 * Dodržuje pravidla projektu:
 * - Žádný typ `any`
 * - Striktní odmítnutí modulu Kriminalistika
 * - 4 možnosti odpovědi (A, B, C, D)
 * - Povinné zdrojování a odůvodnění
 */

export interface ParsedQuestionImport {
  rawIndex: number;
  subject: string;
  question: string;
  options: [string, string, string, string];
  correct_index: number;
  correct_letter: 'A' | 'B' | 'C' | 'D';
  source: string;
  explanation: string;
  rationale: string;
  isDuplicateInBank?: boolean;
  isDuplicateInBatch?: boolean;
}

export interface ParseValidationError {
  blockNumber: number;
  message: string;
  field?: string;
  rawSnippet?: string;
}

export interface ParseQuestionsResult {
  validQuestions: ParsedQuestionImport[];
  errors: ParseValidationError[];
  totalBlocks: number;
  subjectBreakdown: Record<string, number>;
  duplicatesInBankCount: number;
  duplicatesInBatchCount: number;
}

export const CANONICAL_QUIZ_SUBJECTS = [
  'Zbraně',
  'ZOP',
  'Penologie',
  'Taktika',
  'Právo',
  'Bezpečnostní služba',
  'Služební příprava',
  'Profesní etika',
  'Vězeňská administrativa',
  'Psychologie',
  'Pedagogika',
  'Zdravověda a první pomoc',
  'Ostatní',
] as const;

export type CanonicalQuizSubject = typeof CANONICAL_QUIZ_SUBJECTS[number];

/**
 * Odstraní diakritiku a převede na malá písmena pro bezpečné porovnávání.
 */
export function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Normalizuje předmět na kanonický název z CANONICAL_QUIZ_SUBJECTS.
 * Pokud je zadána kriminalistika, striktně označí isForbiddenKrimi = true.
 */
export function normalizeSubject(rawSubject: string): {
  canonicalSubject: string | null;
  isForbiddenKrimi: boolean;
} {
  const clean = removeDiacritics(rawSubject);

  if (!clean) {
    return { canonicalSubject: null, isForbiddenKrimi: false };
  }

  // Kontrola trvale vyřazeného modulu Kriminalistika
  if (clean.includes('krim')) {
    return { canonicalSubject: null, isForbiddenKrimi: true };
  }

  // Mapování synonym a zkratek
  if (clean === 'zbrane' || clean === 'zbran' || clean.includes('strel')) {
    return { canonicalSubject: 'Zbraně', isForbiddenKrimi: false };
  }
  // ZOP jako samostatný předmět v bance není — základní odborná příprava je celý
  // kurz, ne okruh vedle Práva a Penologie. Její čtyři otázky (povinnost zakročit,
  // prokazování příslušnosti, hodnosti, pořadová příprava) jsou služební příprava.
  //
  // Pravidlo musí zůstat PŘED pravidlem pro Právo: „odborna priprava“ obsahuje
  // podřetězec „prav“.
  if (clean === 'zop' || clean.includes('odborna priprava')) {
    return { canonicalSubject: 'Služební příprava', isForbiddenKrimi: false };
  }
  if (clean.includes('penolog')) {
    return { canonicalSubject: 'Penologie', isForbiddenKrimi: false };
  }
  // Sebeobrana patří do služební přípravy, ne do taktiky: hmaty, chvaty a obrana
  // proti noži jsou vypsané mezi okruhy Služební přípravy (viz subjectsInfo).
  // Napíše-li ale někdo do šablony rovnou „Taktika", respektuje se to — karta
  // Taktika dál existuje, jen je po úklidu předmětů prázdná.
  if (clean.includes('sebeobrana')) {
    return { canonicalSubject: 'Služební příprava', isForbiddenKrimi: false };
  }
  if (clean.includes('taktik')) {
    return { canonicalSubject: 'Taktika', isForbiddenKrimi: false };
  }
  // MUSÍ být před pravidlem pro Právo: „sluzebni priprava“ obsahuje podřetězec
  // „prav“, takže by ho `clean.includes('prav')` spolklo a předmět by se
  // z importní šablony zakládal jako Právo.
  if (clean === 'sp' || clean.includes('sluzebni prip')) {
    return { canonicalSubject: 'Služební příprava', isForbiddenKrimi: false };
  }
  if (clean.includes('prav') || clean.includes('zakon')) {
    return { canonicalSubject: 'Právo', isForbiddenKrimi: false };
  }
  // Bezpečnostní služba jako předmět na Akademii VS ČR není a v bance po úklidu
  // nezbyla ani jedna otázka — strážní, dozorčí i eskortní služba je služební
  // příprava. Šablona psaná podle staršího rozdělení se proto přesměruje tam.
  if (
    clean === 'bs' ||
    clean.includes('bezpecnostni') ||
    clean.includes('strazni') ||
    clean.includes('dozorci')
  ) {
    return { canonicalSubject: 'Služební příprava', isForbiddenKrimi: false };
  }
  if (clean === 'pe' || clean.includes('etik')) {
    return { canonicalSubject: 'Profesní etika', isForbiddenKrimi: false };
  }
  if (clean === 'va' || clean.includes('administrativ') || clean.includes('spisov')) {
    return { canonicalSubject: 'Vězeňská administrativa', isForbiddenKrimi: false };
  }
  if (clean.includes('psycholog')) {
    return { canonicalSubject: 'Psychologie', isForbiddenKrimi: false };
  }
  if (clean.includes('pedagog')) {
    return { canonicalSubject: 'Pedagogika', isForbiddenKrimi: false };
  }
  if (
    clean.includes('zdrav') ||
    clean.includes('prvni pomoc') ||
    clean.includes('zdravoved')
  ) {
    return { canonicalSubject: 'Zdravověda a první pomoc', isForbiddenKrimi: false };
  }
  if (clean.includes('ostatn')) {
    return { canonicalSubject: 'Ostatní', isForbiddenKrimi: false };
  }

  // Porovnání s existujícími kanonickými názvy
  for (const subj of CANONICAL_QUIZ_SUBJECTS) {
    if (removeDiacritics(subj) === clean) {
      return { canonicalSubject: subj, isForbiddenKrimi: false };
    }
  }

  // Fallback na 'Ostatní'
  return { canonicalSubject: 'Ostatní', isForbiddenKrimi: false };
}

/**
 * Převede označení správné odpovědi na index 0-3 a odpovídající písmeno A-D.
 */
export function parseCorrectOption(
  rawVal: string,
  options: [string, string, string, string]
): { index: number; letter: 'A' | 'B' | 'C' | 'D' } | null {
  const trimmed = rawVal.trim().toUpperCase();

  if (trimmed === 'A' || trimmed === '0') return { index: 0, letter: 'A' };
  if (trimmed === 'B' || trimmed === '1') return { index: 1, letter: 'B' };
  if (trimmed === 'C' || trimmed === '2') return { index: 2, letter: 'C' };
  if (trimmed === 'D' || trimmed === '3') return { index: 3, letter: 'D' };

  // Podpora variant typu "A)", "B.", "[C]" apod.
  const letterMatch = trimmed.match(/^\[?([A-D])[\.\)\:]?\]?$/i);
  if (letterMatch && letterMatch[1]) {
    const l = letterMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
    const idx = { A: 0, B: 1, C: 2, D: 3 }[l];
    return { index: idx, letter: l };
  }

  // Kontrola, zda hodnota neodpovídá přesnému textu jedné z možností
  const lowerRaw = rawVal.trim().toLowerCase();
  for (let i = 0; i < options.length; i++) {
    if (options[i].trim().toLowerCase() === lowerRaw && lowerRaw.length > 0) {
      const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
      return { index: i, letter: letters[i] };
    }
  }

  return null;
}

/**
 * Vzorová šablona se 3 reálnými ukázkovými otázkami dle zadání.
 */
export const SAMPLE_QUESTIONS_TEMPLATE = `# ==============================================================================
# VZOROVÁ ŠABLONA PRO HROMADNÝ IMPORT OTÁZEK – AKADEMIE VĚZEŇSKÉ SLUŽBY ČR
# ==============================================================================
# NÁVOD K VYPLNĚNÍ:
# 1. Každá otázka začíná oddělovačem: === OTÁZKA ===
# 2. Všechna pole jsou povinná:
#    - Předmět: Zbraně, ZOP, Penologie, Taktika, Právo, Bezpečnostní služba,
#               Služební příprava, Profesní etika, Vězeňská administrativa,
#               Psychologie, Pedagogika, Zdravověda a první pomoc, Ostatní.
#               (UPOZORNĚNÍ: Modul Kriminalistika je trvale vyřazen a nelze jej importovat!)
#    - Otázka: Úplné textové znění otázky
#    - A: První varianta odpovědi
#    - B: Druhá varianta odpovědi
#    - C: Třetí varianta odpovědi
#    - D: Čtvrtá varianta odpovědi
#    - Správně: Označení správné možnosti (A, B, C nebo D)
#    - Zdroj: Číslo zákona, vyhlášky, NGŘ nebo takticko-technických dat
#    - Odůvodnění: Zákonné vysvětlení správné varianty
# ==============================================================================

=== OTÁZKA ===
Předmět: zbrane
Otázka: Jaká je standardní kapacita zásobníku pistole CZ P-10 C?
A: 10 nábojů
B: 12 nábojů
C: 15 nábojů
D: 17 nábojů
Správně: C
Zdroj: Takticko-technická data CZ P-10 C
Odůvodnění: Základní dvouřadý zásobník pistole CZ P-10 C pojme 15 nábojů ráže 9x19 mm.

=== OTÁZKA ===
Předmět: Bezpečnostní služba
Otázka: Jaké jsou hlavní povinnosti a zákazy pro strážného u hlavního vchodu do věznice?
A: Provádět kontrolu totožnosti výhradně u civilních návštěv a umožnit vstup osobám pod vlivem alkoholu.
B: Převzít službu (PPZZ), kontrolovat totožnost a oprávnění ke vstupu, nepustit podnapilé osoby a děti do 15 let bez doprovodu, neotevírat současně vnitřní a vnější vrata/dveře.
C: Přezkoušet spojení, vpustit mladistvé od 12 let bez doprovodu a provádět osobní prohlídku soudců bez výjimky.
D: Otevřít obě brány propusťového systému současně při zvýšeném provozu pro urychlení odbavení.
Správně: B
Zdroj: NGŘ č. 33/2019 a NGŘ č. 2/2026
Odůvodnění: Strážný u vchodu plní klíčovou bariérovou funkci: provádí PPZZ, kontroluje totožnost, zakazuje vstup podnapilým osobám a striktně dodržuje komorový propusťový režim (nikdy neotevřít obě brány najednou).

=== OTÁZKA ===
Předmět: Právo
Otázka: Za jakých zákonných podmínek je příslušník Vězeňské služby ČR oprávněn použít střelnou zbraň podle § 19 zákona č. 555/1992 Sb.?
A: Kdykoliv při neuposlechnutí jakékoliv slovní výzvy odsouzeným v prostoru věznice.
B: Pouze se souhlasem ředitele věznice po předchozím písemném varování odsouzeného.
C: K odvrácení přímo hrozícího nebo trvajícího útoku na život nebo zdraví, k překonání odporu směřujícího ke zmaření zákroku proti nebezpečnému pachateli, nebo k zamezení útěku nebezpečné osoby po marné výzvě.
D: Výhradně při vyhlášení mimořádné bezpečnostní události 3. stupně.
Správně: C
Zdroj: § 19 zákona č. 555/1992 Sb.
Odůvodnění: Podle § 19 odst. 1 zákona č. 555/1992 Sb. je použití střelné zbraně krajním opatřením k odvrácení nebezpečného útoku na život či zdraví nebo zabránění útěku nebezpečného pachatele po marné výzvě a varovném výstřelu, je-li to možné.
`;

/**
 * Vygeneruje a spustí stažení souboru vzor_otazek_vscr.txt v prohlížeči.
 */
export function downloadQuestionsTemplate(): void {
  const blob = new Blob([SAMPLE_QUESTIONS_TEMPLATE], {
    type: 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vzor_otazek_vscr.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parsování bloku textu klíč-hodnota s podporou víceřádkových položek.
 */
function parseKeyValueBlock(blockText: string): Record<string, string> {
  const lines = blockText.split(/\r?\n/);
  const result: Record<string, string> = {};
  let currentKey: string | null = null;

  // Regex pro rozpoznání klíčů na začátku řádku
  const keyRegex = /^(předmět|predmet|subject|oblast|okruh|otázka|otazka|question|znění|zneni|správně|spravne|správná|spravna|správná odpověď|spravna odpoved|correct|answer|zdroj|source|předpis|predpis|odkaz|zákon|zakon|odůvodnění|oduvodneni|vysvětlení|vysvetleni|rationale|explanation|komentář|komentar|[a-d])\s*[:\.\)]\s*(.*)$/i;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Přeskočení prázdných řádků nebo komentářů (#)
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(keyRegex);
    if (match) {
      const rawKey = removeDiacritics(match[1]);
      let normalizedKey = rawKey;

      if (rawKey === 'predmet' || rawKey === 'subject' || rawKey === 'oblast' || rawKey === 'okruh') {
        normalizedKey = 'subject';
      } else if (rawKey === 'otazka' || rawKey === 'question' || rawKey === 'zneni') {
        normalizedKey = 'question';
      } else if (
        rawKey === 'spravne' ||
        rawKey === 'spravna' ||
        rawKey === 'spravna odpoved' ||
        rawKey === 'correct' ||
        rawKey === 'answer'
      ) {
        normalizedKey = 'correct';
      } else if (
        rawKey === 'zdroj' ||
        rawKey === 'source' ||
        rawKey === 'predpis' ||
        rawKey === 'odkaz' ||
        rawKey === 'zakon'
      ) {
        normalizedKey = 'source';
      } else if (
        rawKey === 'oduvodneni' ||
        rawKey === 'vysvetleni' ||
        rawKey === 'rationale' ||
        rawKey === 'explanation' ||
        rawKey === 'komentar'
      ) {
        normalizedKey = 'rationale';
      } else if (['a', 'b', 'c', 'd'].includes(rawKey)) {
        normalizedKey = rawKey;
      }

      currentKey = normalizedKey;
      result[normalizedKey] = match[2].trim();
    } else if (currentKey) {
      // Víceřádkový obsah – připoj k předchozímu klíči
      result[currentKey] = `${result[currentKey]} ${trimmed}`.trim();
    }
  }

  return result;
}

/**
 * Parsování jednoduchého CSV řádku s ohledem na uvozovky.
 */
function parseCsvRow(row: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Zpracuje data ve formátu CSV.
 */
function parseCsvQuestions(
  text: string,
  existingQuestionTexts: Set<string>
): ParseQuestionsResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      validQuestions: [],
      errors: [
        {
          blockNumber: 1,
          message: 'CSV soubor neobsahuje žádné řádky s daty nebo hlavičku.',
        },
      ],
      totalBlocks: 0,
      subjectBreakdown: {},
      duplicatesInBankCount: 0,
      duplicatesInBatchCount: 0,
    };
  }

  // Detekce oddělovače (středník nebo čárka)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';
  const headers = parseCsvRow(firstLine, delimiter).map((h) => removeDiacritics(h));

  const validQuestions: ParsedQuestionImport[] = [];
  const errors: ParseValidationError[] = [];
  const subjectBreakdown: Record<string, number> = {};
  const seenInBatch = new Set<string>();
  let duplicatesInBankCount = 0;
  let duplicatesInBatchCount = 0;

  for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
    const row = parseCsvRow(lines[rowIdx], delimiter);
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    const blockNumber = rowIdx;
    const getCol = (names: string[]): string => {
      for (const name of names) {
        const idx = headers.findIndex((h) => h.includes(name));
        if (idx !== -1 && row[idx]) return row[idx].trim();
      }
      return '';
    };

    const rawSubject = getCol(['predmet', 'subject']);
    const rawQuestion = getCol(['otazka', 'question']);
    const optA = getCol(['a', 'moznost a', 'odpoved a']);
    const optB = getCol(['b', 'moznost b', 'odpoved b']);
    const optC = getCol(['c', 'moznost c', 'odpoved c']);
    const optD = getCol(['d', 'moznost d', 'odpoved d']);
    const rawCorrect = getCol(['spravne', 'correct', 'spravna']);
    const rawSource = getCol(['zdroj', 'source', 'predpis']);
    const rawRationale = getCol(['oduvodneni', 'vysvetleni', 'rationale', 'explanation']);

    // Validace
    let hasError = false;

    // Předmět
    const { canonicalSubject, isForbiddenKrimi } = normalizeSubject(rawSubject);
    if (isForbiddenKrimi) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Modul Kriminalistika byl trvale vyřazen z osnov VS ČR a tyto otázky nelze importovat.`,
        field: 'subject',
      });
      hasError = true;
    } else if (!canonicalSubject) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Chybí název předmětu.`,
        field: 'subject',
      });
      hasError = true;
    }

    // Otázka
    if (!rawQuestion) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Text otázky je prázdný.`,
        field: 'question',
      });
      hasError = true;
    }

    // Možnosti A, B, C, D
    if (!optA) {
      errors.push({ blockNumber, message: `Otázka #${blockNumber}: Chybí možnost A.`, field: 'A' });
      hasError = true;
    }
    if (!optB) {
      errors.push({ blockNumber, message: `Otázka #${blockNumber}: Chybí možnost B.`, field: 'B' });
      hasError = true;
    }
    if (!optC) {
      errors.push({ blockNumber, message: `Otázka #${blockNumber}: Chybí možnost C.`, field: 'C' });
      hasError = true;
    }
    if (!optD) {
      errors.push({ blockNumber, message: `Otázka #${blockNumber}: Chybí možnost D.`, field: 'D' });
      hasError = true;
    }

    // Správná možnost
    const optionsArray: [string, string, string, string] = [optA, optB, optC, optD];
    const parsedCorrect = parseCorrectOption(rawCorrect, optionsArray);
    if (!parsedCorrect) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Chybí nebo je neplatná správná odpověď ('${rawCorrect}'). Očekáváno A, B, C nebo D.`,
        field: 'correct',
      });
      hasError = true;
    }

    // Zdroj
    if (!rawSource) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Chybí citace zdroje či právního předpisu (pole 'Zdroj:').`,
        field: 'source',
      });
      hasError = true;
    }

    // Odůvodnění
    if (!rawRationale) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Chybí zákonné odůvodnění (pole 'Odůvodnění:').`,
        field: 'rationale',
      });
      hasError = true;
    }

    if (!hasError && canonicalSubject && parsedCorrect) {
      const normQuestionText = rawQuestion.trim().toLowerCase();
      let isDuplicateInBatch = false;
      let isDuplicateInBank = false;

      if (seenInBatch.has(normQuestionText)) {
        isDuplicateInBatch = true;
        duplicatesInBatchCount++;
      } else {
        seenInBatch.add(normQuestionText);
      }

      if (existingQuestionTexts.has(normQuestionText)) {
        isDuplicateInBank = true;
        duplicatesInBankCount++;
      }

      validQuestions.push({
        rawIndex: blockNumber,
        subject: canonicalSubject,
        question: rawQuestion.trim(),
        options: optionsArray,
        correct_index: parsedCorrect.index,
        correct_letter: parsedCorrect.letter,
        source: rawSource.trim(),
        explanation: rawRationale.trim(),
        rationale: rawRationale.trim(),
        isDuplicateInBank,
        isDuplicateInBatch,
      });

      subjectBreakdown[canonicalSubject] = (subjectBreakdown[canonicalSubject] || 0) + 1;
    }
  }

  return {
    validQuestions,
    errors,
    totalBlocks: lines.length - 1,
    subjectBreakdown,
    duplicatesInBankCount,
    duplicatesInBatchCount,
  };
}

/**
 * Hlavní parser textové šablony nebo CSV.
 * 
 * @param rawText Vstupní text (soubor nebo vloženo přes textarea)
 * @param existingQuestions Pole existujících otázek v bance pro detekci kolizí
 */
export function parseQuestionsTemplate(
  rawText: string,
  existingQuestions: { question: string }[] = []
): ParseQuestionsResult {
  const cleanInput = rawText.trim();
  const existingSet = new Set(
    existingQuestions.map((q) => q.question.trim().toLowerCase())
  );

  if (!cleanInput) {
    return {
      validQuestions: [],
      errors: [],
      totalBlocks: 0,
      subjectBreakdown: {},
      duplicatesInBankCount: 0,
      duplicatesInBatchCount: 0,
    };
  }

  // Detekce formátu: Pokud text neobsahuje oddělovač '=== OTÁZKA ===' a vypadá jako CSV (má čárku/středník a nový řádek)
  const hasDelimiter = /(?:^|\r?\n)[ \t]*={2,}[ \t]*(?:otázka|otazka)[ \t]*={2,}/i.test(
    cleanInput
  );

  if (!hasDelimiter && (cleanInput.includes(';') || cleanInput.includes(',')) && cleanInput.includes('\n')) {
    return parseCsvQuestions(cleanInput, existingSet);
  }

  // Rozdělení podle regexu oddělovače: === OTÁZKA === (povoluje 2 a více rovnítka, libovolné mezery a case-insensitivity)
  const delimiterRegex = /(?:^|\r?\n)[ \t]*={2,}[ \t]*(?:otázka|otazka)[ \t]*={2,}[ \t]*(?:\r?\n|$)/i;
  const rawParts = cleanInput.split(delimiterRegex);

  // První část před prvním oddělovačem: zkontrolujeme, zda to není jen hlavička/návod
  const blocksToProcess: string[] = [];
  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i].trim();
    if (!part) continue;

    // Odstranění komentářových řádků začínajících znakem #
    const nonCommentLines = part
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));

    if (nonCommentLines.length === 0) {
      // Celý blok se skládá pouze z komentářů
      continue;
    }

    if (i === 0) {
      // Pokud první blok před prvním oddělovačem neobsahuje nekomentovaný klíč otázka ani předmět, je to pouze úvodní komentář
      const nonCommentText = nonCommentLines.join('\n');
      const hasQuestionKey = /(?:otázka|otazka|question)\s*[:\.\)]/i.test(nonCommentText);
      const hasSubjectKey = /(?:předmět|predmet|subject)\s*[:\.\)]/i.test(nonCommentText);
      if (!hasQuestionKey && !hasSubjectKey) {
        continue;
      }
    }
    blocksToProcess.push(part);
  }

  if (blocksToProcess.length === 0) {
    return {
      validQuestions: [],
      errors: [
        {
          blockNumber: 1,
          message:
            'V zadaném textu nebyl nalezen žádný platný blok uvozený oddělovačem "=== OTÁZKA ===". Prohlédněte si prosím vzorovou šablonu.',
        },
      ],
      totalBlocks: 0,
      subjectBreakdown: {},
      duplicatesInBankCount: 0,
      duplicatesInBatchCount: 0,
    };
  }

  const validQuestions: ParsedQuestionImport[] = [];
  const errors: ParseValidationError[] = [];
  const subjectBreakdown: Record<string, number> = {};
  const seenInBatch = new Set<string>();
  let duplicatesInBankCount = 0;
  let duplicatesInBatchCount = 0;

  for (let idx = 0; idx < blocksToProcess.length; idx++) {
    const blockText = blocksToProcess[idx];
    const blockNumber = idx + 1;
    const kv = parseKeyValueBlock(blockText);

    let hasError = false;

    // 1. Předmět
    const rawSubject = kv.subject || '';
    const { canonicalSubject, isForbiddenKrimi } = normalizeSubject(rawSubject);
    if (isForbiddenKrimi) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Modul Kriminalistika byl trvale vyřazen z osnov Akademie VS ČR a tyto otázky nelze importovat.`,
        field: 'subject',
        rawSnippet: blockText.slice(0, 100),
      });
      hasError = true;
    } else if (!rawSubject || !canonicalSubject) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Chybí název předmětu (např. 'Předmět: Zbraně').`,
        field: 'subject',
        rawSnippet: blockText.slice(0, 100),
      });
      hasError = true;
    }

    // 2. Otázka
    const questionText = kv.question || '';
    if (!questionText) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Text otázky je prázdný (pole 'Otázka:').`,
        field: 'question',
        rawSnippet: blockText.slice(0, 100),
      });
      hasError = true;
    }

    // 3. Možnosti A, B, C, D
    const optA = kv.a || '';
    const optB = kv.b || '';
    const optC = kv.c || '';
    const optD = kv.d || '';

    if (!optA) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Chybí možnost A.`,
        field: 'A',
      });
      hasError = true;
    }
    if (!optB) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Chybí možnost B.`,
        field: 'B',
      });
      hasError = true;
    }
    if (!optC) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Chybí možnost C.`,
        field: 'C',
      });
      hasError = true;
    }
    if (!optD) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Chybí možnost D.`,
        field: 'D',
      });
      hasError = true;
    }

    // 4. Správná odpověď
    const rawCorrect = kv.correct || '';
    const optionsArray: [string, string, string, string] = [optA, optB, optC, optD];
    const parsedCorrect = parseCorrectOption(rawCorrect, optionsArray);

    if (!rawCorrect) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Není určena správná odpověď (pole 'Správně: A/B/C/D').`,
        field: 'correct',
      });
      hasError = true;
    } else if (!parsedCorrect) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Neplatná hodnota správné odpovědi ('${rawCorrect}'). Zadejte písmeno A, B, C nebo D.`,
        field: 'correct',
      });
      hasError = true;
    }

    // 5. Zdroj
    const sourceText = kv.source || '';
    if (!sourceText) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Chybí citace zdroje či právního předpisu (pole 'Zdroj:').`,
        field: 'source',
      });
      hasError = true;
    }

    // 6. Odůvodnění
    const rationaleText = kv.rationale || '';
    if (!rationaleText) {
      errors.push({
        blockNumber,
        message: `Otázka #${blockNumber}: Chybí zákonné odůvodnění správné varianty (pole 'Odůvodnění:').`,
        field: 'rationale',
      });
      hasError = true;
    }

    // Pokud je blok kompletní a validní
    if (!hasError && canonicalSubject && parsedCorrect) {
      const normQuestion = questionText.trim().toLowerCase();
      let isDuplicateInBatch = false;
      let isDuplicateInBank = false;

      if (seenInBatch.has(normQuestion)) {
        isDuplicateInBatch = true;
        duplicatesInBatchCount++;
      } else {
        seenInBatch.add(normQuestion);
      }

      if (existingSet.has(normQuestion)) {
        isDuplicateInBank = true;
        duplicatesInBankCount++;
      }

      validQuestions.push({
        rawIndex: blockNumber,
        subject: canonicalSubject,
        question: questionText.trim(),
        options: optionsArray,
        correct_index: parsedCorrect.index,
        correct_letter: parsedCorrect.letter,
        source: sourceText.trim(),
        explanation: rationaleText.trim(),
        rationale: rationaleText.trim(),
        isDuplicateInBank,
        isDuplicateInBatch,
      });

      subjectBreakdown[canonicalSubject] =
        (subjectBreakdown[canonicalSubject] || 0) + 1;
    }
  }

  return {
    validQuestions,
    errors,
    totalBlocks: blocksToProcess.length,
    subjectBreakdown,
    duplicatesInBankCount,
    duplicatesInBatchCount,
  };
}
