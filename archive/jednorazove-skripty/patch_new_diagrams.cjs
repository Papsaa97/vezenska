const fs = require('fs');
const file = 'src/data/questions/matching.ts';
let code = fs.readFileSync(file, 'utf8');

const tcccParts = `[
      { id: 'm1', label: 'Lékárnička (IFAK)', top: 50, left: 25, labelTop: 15, labelLeft: 25 },
      { id: 'm2', label: 'Taktické zaškrcovadlo (Turniket)', top: 50, left: 45, labelTop: 15, labelLeft: 45 },
      { id: 'm3', label: 'Tlakový obvaz (Izraelský obvaz)', top: 50, left: 55, labelTop: 85, labelLeft: 55 },
      { id: 'm4', label: 'Chlopeň (Pneumotorax)', top: 50, left: 68, labelTop: 15, labelLeft: 68 },
      { id: 'm5', label: 'Hemostatická gáza', top: 50, left: 80, labelTop: 85, labelLeft: 80 },
      { id: 'm6', label: 'Nosní vzduchovod (NPA)', top: 50, left: 93, labelTop: 15, labelLeft: 93 }
    ]`;

const riotParts = `[
      { id: 'v1', label: 'Hmaty, chvaty, údery a kopy', top: 20, left: 30, labelTop: 5, labelLeft: 30 },
      { id: 'v2', label: 'Pouta', top: 48, left: 35, labelTop: 35, labelLeft: 55 },
      { id: 'v3', label: 'Slzotvorný prostředek', top: 48, left: 26, labelTop: 35, labelLeft: 5 },
      { id: 'v4', label: 'Obušek', top: 40, left: 35, labelTop: 20, labelLeft: 55 },
      { id: 'v5', label: 'Služební pes', top: 70, left: 70, labelTop: 90, labelLeft: 70 },
      { id: 'v6', label: 'Zbraň (Hrozba / Výstřel)', top: 55, left: 23, labelTop: 85, labelLeft: 15 },
      { id: 'v7', label: 'Vytlačování štítem', top: 50, left: 15, labelTop: 50, labelLeft: -5 }
    ]`;

code = code.replace(/id:\s*'tccc_diagram'[\s\S]*?imageUrl:.*?,[\s\S]*?parts:\s*\[[\s\S]*?\]/, (match) => {
  return match
    .replace(/title:.*?,/, "title: 'Vybavení lékárničky (IFAK)',")
    .replace(/imageUrl:.*?,/, "imageUrl: '/images/gear/ifak_kit.jpg',")
    .replace(/parts:\s*\[[\s\S]*?\]/, 'parts: ' + tcccParts);
});

code = code.replace(/id:\s*'vystroj_diagram'[\s\S]*?imageUrl:.*?,[\s\S]*?parts:\s*\[[\s\S]*?\]/, (match) => {
  return match
    .replace(/title:.*?,/, "title: 'Donucovací prostředky (§ 17)',")
    .replace(/imageUrl:.*?,/, "imageUrl: '/images/gear/riot_guard.jpg',")
    .replace(/parts:\s*\[[\s\S]*?\]/, 'parts: ' + riotParts);
});

fs.writeFileSync(file, code);
