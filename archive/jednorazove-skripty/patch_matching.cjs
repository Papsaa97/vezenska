const fs = require('fs');
const file = 'src/data/questions/matching.ts';
let code = fs.readFileSync(file, 'utf8');

const newDiagrams = `
  {
    id: 'tccc_diagram',
    title: 'TCCC / MARCH Protokol',
    type: 'diagram',
    imageUrl: '/images/gear/march_protocol.jpg',
    pairs: [],
    parts: [
      { id: 'm1', label: 'M (Masivní krvácení)', top: 65, left: 45, labelTop: 65, labelLeft: 20 },
      { id: 'm2', label: 'A (Průchodnost dýchacích cest)', top: 15, left: 50, labelTop: 15, labelLeft: 80 },
      { id: 'm3', label: 'R (Dýchání / Hrudník)', top: 30, left: 45, labelTop: 30, labelLeft: 20 },
      { id: 'm4', label: 'C (Krevní oběh)', top: 32, left: 52, labelTop: 35, labelLeft: 80 },
      { id: 'm5', label: 'H (Hypotermie / Zajištění tepla)', top: 48, left: 50, labelTop: 55, labelLeft: 80 }
    ]
  },
  {
    id: 'vystroj_diagram',
    title: 'Výstroj a donucovací prostředky',
    type: 'diagram',
    imageUrl: '/images/gear/police_belt.jpg',
    pairs: [],
    parts: [
      { id: 'v1', label: 'Taktická vesta', top: 35, left: 30, labelTop: 15, labelLeft: 60 },
      { id: 'v2', label: 'Služební zbraň (Pouzdro)', top: 75, left: 20, labelTop: 95, labelLeft: 20 },
      { id: 'v3', label: 'Pouta', top: 73, left: 40, labelTop: 55, labelLeft: 40 },
      { id: 'v4', label: 'Teleskopický obušek / Tonfa', top: 73, left: 55, labelTop: 95, labelLeft: 55 },
      { id: 'v5', label: 'Slzotvorný prostředek (Kaser)', top: 73, left: 63, labelTop: 55, labelLeft: 63 },
      { id: 'v6', label: 'Radiostanice', top: 73, left: 72, labelTop: 95, labelLeft: 72 },
      { id: 'v7', label: 'Zásobníky', top: 73, left: 85, labelTop: 55, labelLeft: 85 }
    ]
  }
];
`;

code = code.replace(/\];\s*$/g, ',' + newDiagrams);
fs.writeFileSync(file, code);
