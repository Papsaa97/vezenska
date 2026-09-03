const fs = require('fs');
const file = 'src/data/questions/matching.ts';
let code = fs.readFileSync(file, 'utf8');

const coerciveGridParts = `[
      { id: 'dp1', label: 'Pouta', top: 16, left: 16, labelTop: 30, labelLeft: 16 },
      { id: 'dp2', label: 'Obušek / úderný prostředek', top: 16, left: 50, labelTop: 30, labelLeft: 50 },
      { id: 'dp3', label: 'Slzotvorný prostředek', top: 16, left: 83, labelTop: 30, labelLeft: 83 },
      { id: 'dp4', label: 'Služební pes', top: 50, left: 16, labelTop: 65, labelLeft: 16 },
      { id: 'dp5', label: 'Vytlačování štítem', top: 50, left: 50, labelTop: 65, labelLeft: 50 },
      { id: 'dp6', label: 'Zbraň (Hrozba / Výstřel)', top: 50, left: 83, labelTop: 65, labelLeft: 83 },
      { id: 'dp7', label: 'Elektrický prostředek (Taser)', top: 83, left: 16, labelTop: 97, labelLeft: 16 },
      { id: 'dp8', label: 'Zásahová výbuška', top: 83, left: 50, labelTop: 97, labelLeft: 50 },
      { id: 'dp9', label: 'Vytlačování vozidlem', top: 83, left: 83, labelTop: 97, labelLeft: 83 }
    ]`;

code = code.replace(/id:\s*'vystroj_diagram'[\s\S]*?imageUrl:.*?,[\s\S]*?parts:\s*\[[\s\S]*?\]/, (match) => {
  return match
    .replace(/title:.*?,/, "title: 'Donucovací prostředky (§ 17)',")
    .replace(/imageUrl:.*?,/, "imageUrl: '/images/gear/donucovaci_prostredky.jpg',")
    .replace(/parts:\s*\[[\s\S]*?\]/, 'parts: ' + coerciveGridParts);
});

fs.writeFileSync(file, code);
