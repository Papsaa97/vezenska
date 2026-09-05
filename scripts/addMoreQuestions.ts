import { Project, SyntaxKind, ArrayLiteralExpression, ObjectLiteralExpression } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';

const project = new Project();
const baseDir = path.resolve(__dirname, '../src/data/questions');

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'subjectsInfo.ts' && f !== 'matching.ts');

function generateNewQuestions(subject: string) {
  // Returns some mocked new questions for each subject based on the filename or subject string
  const baseQuestions = [
    {
      id: `new_${subject.replace('.ts', '')}_01`,
      subject: "To_Be_Replaced",
      topic: "Nová modelová situace 1",
      question: "Dozorce ubytovny zjistí při ranní kontrole, že odsouzený nereaguje a leží nehybně na lůžku. Jaký je správný prvotní postup?",
      answer: "Okamžitě přivolat dalšího příslušníka (zálohu), otevřít celu s jištěním, zkontrolovat životní funkce (vědomí, dýchání) a v případě potřeby zahájit KPR a volat ZZS.",
      options: [
        "Okamžitě vstoupit sám do cely, začít odsouzeným třást a pokusit se ho probudit.",
        "Okamžitě přivolat dalšího příslušníka (zálohu), otevřít celu s jištěním, zkontrolovat životní funkce (vědomí, dýchání) a v případě potřeby zahájit KPR a volat ZZS.",
        "Uzamknout celu, neprodleně nahlásit situaci veliteli směny a vyčkat na jeho příchod bez dalších akcí.",
        "Otevřít celu, zkontrolovat tep a pokud odsouzený nedýchá, ihned ho přenést na ošetřovnu."
      ],
      correctOption: 1,
      rationale: "Z bezpečnostního hlediska nesmí příslušník vstupovat na celu sám. Prvním krokem je zajištění bezpečnosti přivoláním zálohy, následný vstup, posouzení stavu a neodkladná první pomoc.",
      source: "NGŘ č. 33/2019 Sb. a standardy poskytování PP (TCCC/ERC)"
    },
    {
      id: `new_${subject.replace('.ts', '')}_02`,
      subject: "To_Be_Replaced",
      topic: "Nová modelová situace 2",
      question: "Při osobní prohlídce odsouzeného po eskortě naleznete ukrytý nepovolený předmět (mobilní telefon). Jaký je správný postup dle předpisů?",
      answer: "Předmět odnít s vystavením potvrzení o odnětí věci, sepsat Záznam o kázeňském přestupku, informovat nadřízeného a předmět uložit do úschovy.",
      options: [
        "Předmět zabavit, zničit ho před odsouzeným, aby se předešlo dalšímu použití a sepsat záznam.",
        "Předmět ponechat odsouzenému s důrazným varováním, že při dalším nálezu bude potrestán.",
        "Předmět odnít s vystavením potvrzení o odnětí věci, sepsat Záznam o kázeňském přestupku, informovat nadřízeného a předmět uložit do úschovy.",
        "Okamžitě použít donucovací prostředky, předmět zabavit a umístit odsouzeného do samovazby."
      ],
      correctOption: 2,
      rationale: "Zabavení věci vyžaduje úřední postup (Potvrzení o odnětí věci) a projednání v kázeňském řízení (Záznam o kázeňském přestupku). Fyzická likvidace nebo neoprávněné užití donucovacích prostředků je nezákonné.",
      source: "Zákon č. 169/1999 Sb. a NGŘ o Vězeňské administrativě (VIS/ETŘ)"
    }
  ];
  return baseQuestions;
}

let addedTotal = 0;

for (const file of files) {
  const filePath = path.join(baseDir, file);
  const sourceFile = project.addSourceFileAtPath(filePath);

  const variableDeclarations = sourceFile.getVariableDeclarations();
  for (const varDecl of variableDeclarations) {
    const initializer = varDecl.getInitializer();
    if (initializer && initializer.isKind(SyntaxKind.ArrayLiteralExpression)) {

      // Get the subject name from the first question if available
      let subjectName = "Neznámý předmět";
      const elements = initializer.getElements();
      if (elements.length > 0) {
          const firstElem = elements[0];
          if (firstElem.isKind(SyntaxKind.ObjectLiteralExpression)) {
              const subjProp = firstElem.getProperty('subject');
              if (subjProp && subjProp.isKind(SyntaxKind.PropertyAssignment)) {
                  subjectName = subjProp.getInitializer()?.getText().replace(/['"]/g, '') || subjectName;
              }
          }
      }

      const newQuestions = generateNewQuestions(file);
      for (const q of newQuestions) {
          q.subject = subjectName;

          const objStr = `{
    id: '${q.id}',
    subject: '${q.subject}',
    topic: '${q.topic}',
    question: '${q.question.replace(/'/g, "\\'")}',
    answer: '${q.answer.replace(/'/g, "\\'")}',
    options: [
      '${q.options[0].replace(/'/g, "\\'")}',
      '${q.options[1].replace(/'/g, "\\'")}',
      '${q.options[2].replace(/'/g, "\\'")}',
      '${q.options[3].replace(/'/g, "\\'")}'
    ],
    correctOption: ${q.correctOption},
    rationale: '${q.rationale.replace(/'/g, "\\'")}',
    source: '${q.source.replace(/'/g, "\\'")}'
  }`;
          initializer.addElement(objStr);
          addedTotal++;
      }
    }
  }
  sourceFile.saveSync();
  console.log(`Added questions to ${file}`);
}

console.log(`Total new questions added: ${addedTotal}`);
