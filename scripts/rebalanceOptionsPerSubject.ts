/**
 * Per-subject vyvážení pozic správných odpovědí (A/B/C/D).
 *
 * Dřívější `rebalanceQuestions.ts` používal jeden globální čítač
 * (`totalModified % 4`) napříč VŠEMI soubory předmětů. Výsledkem byl
 * u každého předmětu zcela deterministický cyklus 0,1,2,3,0,1,2,3…
 * (viz např. src/data/questions/pravo.ts) – rozložení bylo sice
 * matematicky vyvážené, ale zcela předvídatelné, což umožňuje
 * zkoušenému uhodnout správnou odpověď bez znalosti látky.
 *
 * Tento skript pro KAŽDÝ předmět (soubor) zvlášť:
 *  1) spočítá co nejrovnoměrnější kvótu cílových indexů 0/1/2/3
 *     (rozdíl mezi předměty max. 1 otázka),
 *  2) tuto kvótu náhodně zamíchá (Fisher–Yates) tak, aby pořadí
 *     správných odpovědí v rámci předmětu nebylo předvídatelné,
 *  3) pro každou otázku náhodně přeuspořádá i pořadí 3 chybných
 *     distraktorů kolem správné odpovědi,
 *  4) aktualizuje `correctOption` na nový index.
 *
 * Text jednotlivých možností (`options`) ani `answer`/`rationale`
 * se nemění – mění se pouze POŘADÍ možností a index správné odpovědi.
 *
 * Provádí se čistě textovou substitucí na přesných pozicích uzlů
 * (zjištěných přes ts-morph), takže zůstává zachováno původní
 * formátování souboru beze změny mimo přeuspořádané řetězce.
 */
import { Project, SyntaxKind } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const QUESTION_FILES = [
  'bezpecnostniSluzba.ts',
  'pedagogika.ts',
  'penologie.ts',
  'pravo.ts',
  'profesniEtika.ts',
  'psychologie.ts',
  'sluzebniPriprava.ts',
  'vezenskaAdministrativa.ts',
  'zdravoveda.ts',
];

const baseDir = path.resolve(__dirname, '../src/data/questions');

// Jednoduchý seedovaný PRNG (mulberry32) pro reprodukovatelnost běhu skriptu.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Sestaví co nejrovnoměrnější seznam cílových indexů 0..3 délky n a zamíchá jej. */
function buildBalancedTargets(n: number, rand: () => number): number[] {
  const base = Math.floor(n / 4);
  const remainder = n % 4;
  const targets: number[] = [];
  for (let idx = 0; idx < 4; idx++) {
    const count = base + (idx < remainder ? 1 : 0);
    for (let k = 0; k < count; k++) targets.push(idx);
  }
  return shuffle(targets, rand);
}

interface Edit {
  start: number;
  end: number;
  text: string;
}

let seedCounter = 1;

for (const file of QUESTION_FILES) {
  const filePath = path.join(baseDir, file);
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);
  const rand = mulberry32(seedCounter++);

  // Najdi exportované pole otázek a jeho prvky (ObjectLiteralExpression).
  const arrayLiteral = sourceFile
    .getVariableDeclarations()
    .map((v) => v.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression))
    .find((a) => !!a);

  if (!arrayLiteral) {
    console.warn(`[skip] Nenalezeno pole otázek v ${file}`);
    continue;
  }

  const questionObjects = arrayLiteral
    .getElements()
    .filter((e) => e.isKind(SyntaxKind.ObjectLiteralExpression));

  const targets = buildBalancedTargets(questionObjects.length, rand);
  const edits: Edit[] = [];
  const distribution = [0, 0, 0, 0];

  questionObjects.forEach((obj, i) => {
    const optionsProp = obj.getProperty('options');
    const correctProp = obj.getProperty('correctOption');
    if (!optionsProp || !optionsProp.isKind(SyntaxKind.PropertyAssignment)) return;
    if (!correctProp || !correctProp.isKind(SyntaxKind.PropertyAssignment)) return;

    const optionsArray = optionsProp.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
    const correctInit = correctProp.getInitializer();
    if (!optionsArray || !correctInit) return;

    const optionNodes = optionsArray.getElements();
    if (optionNodes.length !== 4) {
      console.warn(`[warn] ${file}: otázka #${i + 1} nemá 4 možnosti, přeskočeno.`);
      return;
    }

    const oldCorrectIdx = parseInt(correctInit.getText(), 10);
    if (Number.isNaN(oldCorrectIdx) || oldCorrectIdx < 0 || oldCorrectIdx > 3) {
      console.warn(`[warn] ${file}: otázka #${i + 1} má neplatný correctOption, přeskočeno.`);
      return;
    }

    const rawTexts = optionNodes.map((n) => n.getText());
    const correctText = rawTexts[oldCorrectIdx];
    const wrongTexts = shuffle(
      rawTexts.filter((_, idx) => idx !== oldCorrectIdx),
      rand
    );

    const targetIdx = targets[i];
    const newTexts: string[] = new Array(4);
    newTexts[targetIdx] = correctText;
    let wrongCursor = 0;
    for (let pos = 0; pos < 4; pos++) {
      if (pos === targetIdx) continue;
      newTexts[pos] = wrongTexts[wrongCursor++];
    }

    distribution[targetIdx]++;

    optionNodes.forEach((node, pos) => {
      const newText = newTexts[pos];
      if (newText !== node.getText()) {
        edits.push({ start: node.getStart(), end: node.getEnd(), text: newText });
      }
    });

    if (targetIdx !== oldCorrectIdx) {
      edits.push({ start: correctInit.getStart(), end: correctInit.getEnd(), text: String(targetIdx) });
    }
  });

  // Aplikuj úpravy odzadu, ať se neposouvají offsety.
  edits.sort((a, b) => b.start - a.start);
  let text = sourceFile.getFullText();
  for (const edit of edits) {
    text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
  }
  fs.writeFileSync(filePath, text, 'utf8');

  const total = questionObjects.length;
  const pct = distribution.map((c) => ((c / total) * 100).toFixed(1) + '%');
  console.log(`${file}: n=${total} rozložení A/B/C/D = ${distribution.join('/')} (${pct.join(', ')})`);
}

console.log('Hotovo: možnosti odpovědí byly náhodně přeuspořádány zvlášť pro každý předmět.');
