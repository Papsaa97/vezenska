const fs = require('fs');
const file = 'src/data/questions/matching.ts';
let code = fs.readFileSync(file, 'utf8');

const coerciveGridParts = `[
      { id: 'dp1', label: 'a) hmaty, chvaty, údery a kopy', top: 12.5, left: 12.5, labelTop: 24, labelLeft: 12.5 },
      { id: 'dp2', label: 'b) předváděcí řetízky', top: 12.5, left: 37.5, labelTop: 24, labelLeft: 37.5 },
      { id: 'dp3', label: 'c) pouta', top: 12.5, left: 62.5, labelTop: 24, labelLeft: 62.5 },
      { id: 'dp4', label: 'd) poutací popruhy', top: 12.5, left: 87.5, labelTop: 24, labelLeft: 87.5 },
      
      { id: 'dp5', label: 'e) pouta s poutacím opaskem', top: 37.5, left: 12.5, labelTop: 49, labelLeft: 12.5 },
      { id: 'dp6', label: 'f) slzotvorný prostředek', top: 37.5, left: 37.5, labelTop: 49, labelLeft: 37.5 },
      { id: 'dp7', label: 'g) obušek / úderný prostředek', top: 37.5, left: 62.5, labelTop: 49, labelLeft: 62.5 },
      { id: 'dp8', label: 'h) služební pes', top: 37.5, left: 87.5, labelTop: 49, labelLeft: 87.5 },

      { id: 'dp9', label: 'ch) vodní stříkač', top: 62.5, left: 12.5, labelTop: 74, labelLeft: 12.5 },
      { id: 'dp10', label: 'i) zásahová výbuška', top: 62.5, left: 37.5, labelTop: 74, labelLeft: 37.5 },
      { id: 'dp11', label: 'j) expanzní zbraně', top: 62.5, left: 62.5, labelTop: 74, labelLeft: 62.5 },
      { id: 'dp12', label: 'k) úder střelnou zbraní', top: 62.5, left: 87.5, labelTop: 74, labelLeft: 87.5 },

      { id: 'dp13', label: 'l) hrozba namířenou zbraní', top: 87.5, left: 12.5, labelTop: 99, labelLeft: 12.5 },
      { id: 'dp14', label: 'm) varovný výstřel', top: 87.5, left: 37.5, labelTop: 99, labelLeft: 37.5 },
      { id: 'dp15', label: 'n) vytlačování štítem', top: 87.5, left: 62.5, labelTop: 99, labelLeft: 62.5 },
      { id: 'dp16', label: 'o) vytlačování vozidlem', top: 87.5, left: 87.5, labelTop: 99, labelLeft: 87.5 }
    ]`;

code = code.replace(/title:\s*'Donucovací prostředky.*?'.*?parts:\s*\[[\s\S]*?\]/s, (match) => {
  return "title: 'Donucovací prostředky (§ 17)',\n    type: 'diagram',\n    imageUrl: '/images/gear/donucovaci_prostredky.jpg',\n    pairs: [],\n    parts: " + coerciveGridParts;
});

fs.writeFileSync(file, code);
