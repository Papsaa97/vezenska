import { Project, SyntaxKind, ArrayLiteralExpression, ObjectLiteralExpression } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const project = new Project();
const baseDir = path.resolve(__dirname, '../src/data/questions');

// Mappings for updating the sync function. We'll do the sync function manually via bash.
// Right now let's focus on updating the questions files.

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'subjectsInfo.ts' && f !== 'matching.ts');

let totalModified = 0;

for (const file of files) {
  const filePath = path.join(baseDir, file);
  const sourceFile = project.addSourceFileAtPath(filePath);

  // Find the exported array
  const variableDeclarations = sourceFile.getVariableDeclarations();
  for (const varDecl of variableDeclarations) {
    const initializer = varDecl.getInitializer();
    if (initializer && initializer.isKind(SyntaxKind.ArrayLiteralExpression)) {
      const elements = initializer.getElements();
      for (const element of elements) {
        if (element.isKind(SyntaxKind.ObjectLiteralExpression)) {
          const props = element.getProperties();
          const optionsProp = element.getProperty('options');
          const correctOptionProp = element.getProperty('correctOption');

          if (optionsProp && optionsProp.isKind(SyntaxKind.PropertyAssignment) &&
              correctOptionProp && correctOptionProp.isKind(SyntaxKind.PropertyAssignment)) {

            const optionsArray = optionsProp.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
            if (optionsArray) {
              const optionStrings = optionsArray.getElements().map(e => e.getText().replace(/^['"`]|['"`]$/g, ''));

              const correctOptionStr = correctOptionProp.getInitializer()?.getText();
              const oldCorrectIdx = parseInt(correctOptionStr || '1', 10);

              const correctAnswerText = optionStrings[oldCorrectIdx];

              // We want to randomly pick a new index from 0 to 3 to balance it out globally.
              // A pseudo-random assignment that distributes them evenly
              const newCorrectIdx = totalModified % 4;
              totalModified++;

              if (newCorrectIdx !== oldCorrectIdx && optionStrings.length === 4) {
                 // swap elements
                 const temp = optionStrings[newCorrectIdx];
                 optionStrings[newCorrectIdx] = optionStrings[oldCorrectIdx];
                 optionStrings[oldCorrectIdx] = temp;

                 // update options property
                 const newOptionsString = '[\n      ' + optionStrings.map(o => `\`${o.replace(/`/g, '\\`')}\``).join(',\n      ') + '\n    ]';
                 optionsProp.setInitializer(newOptionsString);

                 // update correctOption property
                 correctOptionProp.setInitializer(newCorrectIdx.toString());
              }
            }
          }
        }
      }
    }
  }
  sourceFile.saveSync();
  console.log(`Processed ${file}`);
}
console.log(`Total questions modified for balance: ${totalModified}`);
