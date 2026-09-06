import { Project, SyntaxKind, ArrayLiteralExpression, ObjectLiteralExpression } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';

const project = new Project();
const baseDir = path.resolve(__dirname, '../src/data/questions');

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'subjectsInfo.ts' && f !== 'matching.ts');

let totalModified = 0;

for (const file of files) {
  const filePath = path.join(baseDir, file);
  const sourceFile = project.addSourceFileAtPath(filePath);

  const variableDeclarations = sourceFile.getVariableDeclarations();
  for (const varDecl of variableDeclarations) {
    const initializer = varDecl.getInitializer();
    if (initializer && initializer.isKind(SyntaxKind.ArrayLiteralExpression)) {
      const elements = initializer.getElements();
      for (const element of elements) {
        if (element.isKind(SyntaxKind.ObjectLiteralExpression)) {
            // Check if rationale doesn't contain specific law mentions, try to append it.
            // Also ensure we have the 'explanation' field as requested.
            let explanationText = "";
            let rationaleText = "";
            let sourceText = "";

            const rationaleProp = element.getProperty('rationale');
            const sourceProp = element.getProperty('source');
            const explProp = element.getProperty('explanation');

            if (rationaleProp && rationaleProp.isKind(SyntaxKind.PropertyAssignment)) {
                rationaleText = rationaleProp.getInitializer()?.getText().replace(/^['"`]|['"`]$/g, '') || "";
            }
            if (sourceProp && sourceProp.isKind(SyntaxKind.PropertyAssignment)) {
                sourceText = sourceProp.getInitializer()?.getText().replace(/^['"`]|['"`]$/g, '') || "";
            }

            if (!explProp) {
                // Combine rationale and source to create a robust explanation with legal grounding
                const appendedExplanation = `${rationaleText} (Právní úprava: ${sourceText})`;
                element.addPropertyAssignment({
                    name: "explanation",
                    initializer: `\`${appendedExplanation.replace(/`/g, '\\`')}\``
                });
                totalModified++;
            }
        }
      }
    }
  }
  sourceFile.saveSync();
  console.log(`Processed explanations in ${file}`);
}
console.log(`Total questions with generated explanations: ${totalModified}`);
