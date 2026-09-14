import { legalDatabase } from '../src/data/legalCompasData';
import { auditLegalDatabase, measureRegulationCoverage } from '../src/utils/legalIntegrity';
import { VSCR_REGULATIONS_REGISTRY } from '../src/data/vscrRegulationsRegistry';

// Pokrytí plných textů předpisů, které aplikace zobrazuje v Právním kompasu.
// Dřívější verze skriptu je nekontrolovala vůbec, přesto hlásila, že jsou
// "všechny texty, paragrafy a odstavce 100% kompletní".
const coverage = VSCR_REGULATIONS_REGISTRY
  .filter((reg) => typeof reg.fullLegalText === 'string' && reg.fullLegalText.length > 0)
  .map((reg) => measureRegulationCoverage(reg.code, reg.shortTitle, reg.fullLegalText));

const result = auditLegalDatabase(legalDatabase, coverage);

console.log('====================================================');
console.log('KONTROLA TVARU DAT PŘEDPISŮ A PARAGRAFŮ (VS ČR ZOP)');
console.log('====================================================');
console.log(`Datum a čas kontroly: ${result.timestamp}`);
console.log(`Prověřeno položek v databázi Právního kompasu: ${result.totalArticles}`);
console.log(`Celkový počet slov v textu: ${result.totalWords.toLocaleString('cs-CZ')}`);
console.log(`Celkový počet znaků: ${result.totalCharacters.toLocaleString('cs-CZ')}`);
console.log('Rozpad podle kategorií předpisů:', result.categories);

console.log('----------------------------------------------------');
console.log('CO TATO KONTROLA OVĚŘUJE');
console.log('  - unikátnost identifikátorů a vyplněnost kategorie');
console.log('  - že u každé položky není prázdné ani podezřele krátké pole');
console.log('    (přesné znění, výklad, zkušební chytáky)');
console.log('  - že text nekončí uprostřed věty a nemá nespárované uvozovky');
console.log('');
console.log('CO TATO KONTROLA NEOVĚŘUJE');
console.log('  - že text odpovídá platnému znění předpisu ve Sbírce zákonů');
console.log('  - že je znění úplné — k porovnání chybí závazný zdroj');
console.log('  Pro jistotu vždy porovnejte s oficiálním zněním (e-Sbírka).');

if (coverage.length > 0) {
  console.log('----------------------------------------------------');
  console.log('ROZSAH PLNÝCH TEXTŮ PŘEDPISŮ (informativně, není to verdikt o úplnosti)');
  const withGaps = coverage.filter((c) => c.missingFromSequence.length > 0);
  coverage
    .slice()
    .sort((a, b) => b.missingFromSequence.length - a.missingFromSequence.length)
    .forEach((c) => {
      const gaps = c.missingFromSequence.length;
      const range = c.highestSection ? `§ 1–${c.highestSection}` : 'bez § nadpisů';
      const note = gaps > 0 ? `v řadě chybí ${gaps}` : 'řada souvislá';
      console.log(
        `  ${c.code.padEnd(18)} ${String(c.characters).padStart(7)} znaků  ` +
        `${String(c.sectionHeadings).padStart(3)} nadpisů §  ${range.padEnd(12)} ${note}`
      );
    });
  if (withGaps.length > 0) {
    console.log('');
    console.log('  Mezera v číselné řadě může být legitimní (zrušený paragraf), sama o sobě');
    console.log('  tedy chybu neznamená. Velký podíl chybějících čísel spolu s malým počtem');
    console.log('  znaků ale ukazuje, že jde spíš o výběr ustanovení než o úplné znění:');
    withGaps
      .filter((c) => c.highestSection > 0 && c.sectionHeadings / c.highestSection < 0.6)
      .forEach((c) => {
        console.log(
          `    ${c.code} — ${c.sectionHeadings} nadpisů § při rozsahu do § ${c.highestSection} ` +
          `(${c.characters.toLocaleString('cs-CZ')} znaků)`
        );
      });
  }
}

console.log('----------------------------------------------------');
if (result.valid) {
  console.log(`KONTROLA TVARU DAT PROŠLA: u ${result.totalArticles} položek nenalezena žádná vada.`);
  console.log('(Neznamená to, že texty odpovídají platnému znění — viz výše.)');
} else {
  console.log(`NALEZENO ${result.issues.length} vad v tvaru dat:`);
  result.issues.forEach((iss) => {
    console.log(`- [${iss.type.toUpperCase()}] Položka "${iss.id}" v poli "${iss.field}": ${iss.message}`);
  });
  process.exit(1);
}
console.log('====================================================');
