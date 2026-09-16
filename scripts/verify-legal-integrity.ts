/**
 * Kontrola dat Právního kompasu proti úředním zněním z e-Sbírky.
 * Spuštění: `npm run check:legal` (běží i v `npm test` a v CI).
 *
 * Kontrola má dvě části:
 *   1. TVAR DAT — prázdná či podezřele krátká pole, duplicitní identifikátory,
 *      text useknutý uprostřed věty. Nález tady shodí build.
 *   2. POROVNÁNÍ S e-SBÍRKOU — existuje citovaný paragraf v platném znění?
 *      Kolik paragrafů předpisu studijní výběr vynechává? A je text, který se
 *      v aplikaci zobrazuje jako „doslovné znění zákona“, opravdu doslovný?
 *      Tohle se opírá o data stažená příkazem `npm run sync:laws`.
 *
 * Neexistující paragraf je vada a shodí build: aplikace by učila odkaz, který
 * v zákoně není. Chybějící paragrafy ve výběru vada nejsou — výběr je výběr —
 * a vypisují se jen informativně. Nedoslovné věty se hlásí jako varování:
 * rozhodnout, jestli jde o legitimní zkrácení nebo o přepsaný obsah, musí
 * člověk.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { legalDatabase } from '../src/data/legalCompasData';
import { auditLegalDatabase, measureRegulationCoverage } from '../src/utils/legalIntegrity';
import { VSCR_REGULATIONS_REGISTRY } from '../src/data/vscrRegulationsRegistry';
import { ESBIRKA_SNAPSHOTS } from '../src/data/esbirka/snapshotManifest';
import { buildSnapshotSlug, parseSbiratkaRef } from '../src/utils/esbirka/eli';
import { buildShingleIndex, compareWithOfficialText } from '../src/utils/esbirka/verbatim';
import type { EsbirkaSnapshot } from '../src/utils/esbirka/snapshot';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT_DIR = path.join(ROOT, 'public', 'data', 'esbirka');

/** Načte stažené znění z disku. Index úseků se staví jen jednou na předpis. */
const indexCache = new Map<string, Set<string> | null>();
function officialIndex(actNumber: string): Set<string> | null {
  const ref = parseSbiratkaRef(actNumber);
  if (!ref) return null;
  const slug = buildSnapshotSlug(ref);
  if (indexCache.has(slug)) return indexCache.get(slug) ?? null;

  let index: Set<string> | null = null;
  try {
    const raw = readFileSync(path.join(SNAPSHOT_DIR, `${slug}.json`), 'utf8');
    index = buildShingleIndex((JSON.parse(raw) as EsbirkaSnapshot).text);
  } catch {
    index = null;
  }
  indexCache.set(slug, index);
  return index;
}

const coverage = VSCR_REGULATIONS_REGISTRY
  .filter((reg) => typeof reg.fullLegalText === 'string' && reg.fullLegalText.length > 0)
  .map((reg) => measureRegulationCoverage(reg));

const result = auditLegalDatabase(legalDatabase, coverage);

console.log('====================================================');
console.log('KONTROLA DAT PRÁVNÍHO KOMPASU (VS ČR ZOP)');
console.log('====================================================');
console.log(`Datum a čas kontroly: ${result.timestamp}`);
console.log(`Prověřeno položek Paragrafového výkladu: ${result.totalArticles}`);
console.log(`Celkový počet slov v textu: ${result.totalWords.toLocaleString('cs-CZ')}`);
console.log(`Celkový počet znaků: ${result.totalCharacters.toLocaleString('cs-CZ')}`);
console.log('Rozpad podle kategorií předpisů:', result.categories);

const snapshotCount = Object.keys(ESBIRKA_SNAPSHOTS).length;
console.log('----------------------------------------------------');
if (snapshotCount === 0) {
  console.log('POZOR: není stažené žádné úřední znění z e-Sbírky.');
  console.log('Porovnání s platným zněním se proto nekoná. Spusťte: npm run sync:laws');
} else {
  const nejstarsi = Object.values(ESBIRKA_SNAPSHOTS)
    .map((s) => s.stazenoDne)
    .sort()[0];
  console.log(`Úřední znění z e-Sbírky: ${snapshotCount} předpisů (nejstarší stažení ${nejstarsi.slice(0, 10)})`);
}

const porovnane = coverage.filter((c) => c.maUplneZneni);
if (porovnane.length > 0) {
  console.log('----------------------------------------------------');
  console.log('POKRYTÍ PŘEDPISU STUDIJNÍM VÝBĚREM (porovnáno s osnovou z e-Sbírky)');
  porovnane
    .slice()
    .sort((a, b) => b.chybejiciParagrafy.length - a.chybejiciParagrafy.length)
    .forEach((c) => {
      const podil = c.uredniParagrafu
        ? Math.round((c.vyberParagrafu.length / c.uredniParagrafu) * 100)
        : 0;
      console.log(
        `  ${c.code.padEnd(28)} ` +
          `${String(c.vyberParagrafu.length).padStart(3)} z ${String(c.uredniParagrafu).padEnd(3)} § ` +
          `(${String(podil).padStart(3)} %)  ` +
          `výběr ${String(Math.round(c.vyberZnaku / 1024)).padStart(3)} kB / ` +
          `úřední ${String(Math.round(c.uredniZnaku / 1024)).padStart(3)} kB  ` +
          `znění č. ${c.cisloZneni} od ${c.ucinnostOd}`
      );
    });
}

const bezZneni = coverage.filter((c) => !c.maUplneZneni);
if (bezZneni.length > 0) {
  console.log('');
  console.log('  Bez úředního znění (ve Sbírce zákonů se nevyhlašují, porovnat nelze):');
  bezZneni.forEach((c) => console.log(`    ${c.code}`));
}

const neznameVeVyberu = porovnane.filter((c) => c.neznameParagrafy.length > 0);
if (neznameVeVyberu.length > 0) {
  console.log('');
  console.log('  Paragrafy citované ve výběru, které platné znění nezná');
  console.log('  (může jít o zrušené ustanovení nebo o odkaz na jiný předpis):');
  neznameVeVyberu.forEach((c) =>
    console.log(`    ${c.code}: ${c.neznameParagrafy.join(', ')}`)
  );
}

// Novely uvedené v registru vs. novely aktuálního znění podle e-Sbírky.
const zastaraleNovely = VSCR_REGULATIONS_REGISTRY.map((reg) => {
  const ref = parseSbiratkaRef(reg.code);
  if (!ref) return null;
  const snapshot = ESBIRKA_SNAPSHOTS[buildSnapshotSlug(ref)];
  if (!snapshot || snapshot.novely.length === 0) return null;
  const ocekavane = snapshot.novely.join(', ');
  if ((reg.lastAmendment || '') === ocekavane) return null;
  return { code: reg.code, uvedeno: reg.lastAmendment || '(nevyplněno)', ocekavane };
}).filter((item): item is NonNullable<typeof item> => item !== null);

if (zastaraleNovely.length > 0) {
  console.log('----------------------------------------------------');
  console.log('NOVELY V REGISTRU NEODPOVÍDAJÍ e-SBÍRCE (varování)');
  zastaraleNovely.forEach((z) => {
    console.log(`  ${z.code}`);
    console.log(`     v registru: ${z.uvedeno}`);
    console.log(`     e-Sbírka:   ${z.ocekavane}`);
  });
}

// Doslovnost textů, které se v aplikaci vydávají za znění zákona.
const verbatim = legalDatabase
  .map((art) => {
    const index = officialIndex(art.actNumber);
    if (!index) return null;
    const result = compareWithOfficialText(art.exactText, index);
    if (result.celkem === 0 || result.neshodne.length === 0) return null;
    return { art, result };
  })
  .filter((item): item is NonNullable<typeof item> => item !== null)
  .sort((a, b) => b.result.neshodne.length - a.result.neshodne.length);

if (verbatim.length > 0) {
  console.log('----------------------------------------------------');
  console.log('DOSLOVNOST TEXTŮ OZNAČENÝCH JAKO ZNĚNÍ ZÁKONA (varování, ne chyba)');
  console.log('Věta se hledá v úředním znění po pěti slovech; co se nenajde, je');
  console.log('buď krácení, nebo přepsání vlastními slovy. Druhé je vada obsahu.');
  verbatim.forEach(({ art, result }) => {
    console.log(
      `  ${art.id} (${art.actNumber}, ${art.section}) — ` +
        `doslovných ${result.doslovnych} z ${result.celkem} vět`
    );
    result.neshodne.slice(0, 3).forEach((n) => {
      const nahled = n.veta.length > 110 ? `${n.veta.slice(0, 110)}…` : n.veta;
      console.log(`      shoda ${Math.round(n.shoda * 100)} %: ${nahled}`);
    });
    if (result.neshodne.length > 3) {
      console.log(`      … a dalších ${result.neshodne.length - 3} vět`);
    }
  });
}

console.log('----------------------------------------------------');
let failed = false;

if (result.articleSectionIssues.length > 0) {
  failed = true;
  console.log(
    `NALEZENO ${result.articleSectionIssues.length} položek, jejichž paragraf v platném znění není:`
  );
  result.articleSectionIssues.forEach((iss) => {
    console.log(
      `- "${iss.id}" (${iss.actNumber}) uvádí "${iss.section}"; ` +
        `e-Sbírka nezná ${iss.neznameParagrafy.join(', ')}`
    );
  });
  console.log('');
}

if (result.valid) {
  console.log(`KONTROLA TVARU DAT PROŠLA: u ${result.totalArticles} položek nenalezena žádná vada.`);
} else {
  failed = true;
  console.log(`NALEZENO ${result.issues.length} vad v tvaru dat:`);
  result.issues.forEach((iss) => {
    console.log(`- [${iss.type.toUpperCase()}] Položka "${iss.id}" v poli "${iss.field}": ${iss.message}`);
  });
}

console.log('');
console.log('CO KONTROLA STÁLE NEOVĚŘUJE');
console.log('  - doslovnou shodu vět výkladu s platným zněním (porovnává se seznam paragrafů)');
console.log('  - obsah vnitřních předpisů VS ČR, které ve Sbírce zákonů nejsou');
console.log('  Právně závazné je znění ve Sbírce zákonů; e-Sbírka poskytuje informativní znění.');
console.log('====================================================');

if (failed) process.exit(1);
