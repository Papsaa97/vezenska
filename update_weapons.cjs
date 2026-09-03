const fs = require('fs');
const file = 'src/data/questions/matching.ts';
let code = fs.readFileSync(file, 'utf8');

const cz75Parts = `[
      { id: 'c1', label: 'Muška', top: 26, left: 15, labelTop: 10, labelLeft: 15 },
      { id: 'c2', label: 'Hledí', top: 26, left: 77, labelTop: 10, labelLeft: 85 },
      { id: 'c3', label: 'Závěr', top: 28, left: 40, labelTop: 10, labelLeft: 40 },
      { id: 'c4', label: 'Hlaveň', top: 35, left: 20, labelTop: 20, labelLeft: 10 },
      { id: 'c5', label: 'Rám (Tělo zbraně)', top: 41, left: 35, labelTop: 60, labelLeft: 15 },
      { id: 'c6', label: 'Spoušť', top: 50, left: 48, labelTop: 80, labelLeft: 40 },
      { id: 'c7', label: 'Lučík', top: 55, left: 48, labelTop: 90, labelLeft: 40 },
      { id: 'c8', label: 'Kohout', top: 32, left: 88, labelTop: 20, labelLeft: 95 },
      { id: 'c9', label: 'Záchyt závěru', top: 38, left: 65, labelTop: 15, labelLeft: 60 },
      { id: 'c10', label: 'Záchyt zásobníku', top: 52, left: 65, labelTop: 75, labelLeft: 65 },
      { id: 'c11', label: 'Zásobník (dno)', top: 85, left: 85, labelTop: 95, labelLeft: 85 },
      { id: 'c12', label: 'Střenky (Pažbička)', top: 65, left: 80, labelTop: 75, labelLeft: 95 },
      { id: 'c13', label: 'Pojistka', top: 40, left: 75, labelTop: 45, labelLeft: 105 },
      { id: 'c14', label: 'Výhozní okénko', top: 28, left: 55, labelTop: 10, labelLeft: 55 },
      { id: 'c15', label: 'Drážky závěru', top: 28, left: 80, labelTop: -5, labelLeft: 80 },
      { id: 'c16', label: 'Bobří ocas (Beavertail)', top: 45, left: 95, labelTop: 55, labelLeft: 105 }
    ]`;

const evo3Parts = `[
      { id: 'e1', label: 'Sklopná pažba', top: 45, left: 15, labelTop: 30, labelLeft: 10 },
      { id: 'e2', label: 'Hledí', top: 31, left: 40, labelTop: 15, labelLeft: 30 },
      { id: 'e3', label: 'Muška', top: 31, left: 77, labelTop: 15, labelLeft: 77 },
      { id: 'e4', label: 'Předpažbí', top: 40, left: 80, labelTop: 20, labelLeft: 90 },
      { id: 'e5', label: 'Tlumič plamene', top: 40, left: 95, labelTop: 60, labelLeft: 95 },
      { id: 'e6', label: 'Výhozní okénko', top: 37, left: 60, labelTop: 15, labelLeft: 60 },
      { id: 'e7', label: 'Napínací páka', top: 36, left: 68, labelTop: 15, labelLeft: 95 },
      { id: 'e8', label: 'Záchyt zásobníku', top: 50, left: 55, labelTop: 80, labelLeft: 45 },
      { id: 'e9', label: 'Zásobník', top: 65, left: 63, labelTop: 95, labelLeft: 70 },
      { id: 'e10', label: 'Spoušť', top: 50, left: 50, labelTop: 85, labelLeft: 30 },
      { id: 'e11', label: 'Pistolová rukojeť', top: 55, left: 40, labelTop: 90, labelLeft: 15 },
      { id: 'e12', label: 'Přepínač režimu střelby', top: 43, left: 46, labelTop: 70, labelLeft: 20 },
      { id: 'e13', label: 'Lučík', top: 55, left: 50, labelTop: 95, labelLeft: 45 },
      { id: 'e14', label: 'Záchyt závěru', top: 45, left: 50, labelTop: 65, labelLeft: 55 },
      { id: 'e15', label: 'Očko pro popruh', top: 45, left: 30, labelTop: 60, labelLeft: 35 },
      { id: 'e16', label: 'Botka pažby', top: 45, left: 5, labelTop: 65, labelLeft: 5 }
    ]`;

code = code.replace(/id:\s*'cz75_diagram'[\s\S]*?parts:\s*\[[\s\S]*?\]/, (match) => {
  return match.replace(/parts:\s*\[[\s\S]*?\]/, 'parts: ' + cz75Parts);
});

code = code.replace(/id:\s*'evo3_diagram'[\s\S]*?parts:\s*\[[\s\S]*?\]/, (match) => {
  return match.replace(/parts:\s*\[[\s\S]*?\]/, 'parts: ' + evo3Parts);
});

fs.writeFileSync(file, code);
