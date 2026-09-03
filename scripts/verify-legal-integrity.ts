import { legalDatabase } from '../src/data/legalCompasData';
import { auditLegalDatabase } from '../src/utils/legalIntegrity';

const result = auditLegalDatabase(legalDatabase);
console.log('====================================================');
console.log('🔍 AUDIT INTEGRITY PŘEDPISŮ A PARAGRAFŮ (VS ČR ZOP)');
console.log('====================================================');
console.log(`Datum a čas auditu: ${result.timestamp}`);
console.log(`Celkem prověřeno zákonných norem: ${result.totalArticles}`);
console.log(`Celkový počet slov v textu: ${result.totalWords.toLocaleString('cs-CZ')}`);
console.log(`Celkový počet znaků: ${result.totalCharacters.toLocaleString('cs-CZ')}`);
console.log('Rozpad podle kategorií předpisů:', result.categories);
console.log('----------------------------------------------------');
if (result.valid) {
  console.log('✅ VŠECHNY TEXTY, PARAGRAFY A ODSTAVCE JSOU 100% KOMPLETNÍ A INTEGROVANÉ!');
  console.log('   - Žádný odstavec není prázdný ani zkrácený.');
  console.log('   - Všechny normy obsahují platné zákonné znění, aplikační výklad i zkušební chytáky.');
  console.log('   - Všechny identifikátory a vazby jsou unikátní.');
} else {
  console.log(`⚠️ Nalezeno ${result.issues.length} nedostatků v integritě:`);
  result.issues.forEach(iss => {
    console.log(`- [${iss.type.toUpperCase()}] Položka "${iss.id}" v poli "${iss.field}": ${iss.message}`);
  });
  process.exit(1);
}
console.log('====================================================');
