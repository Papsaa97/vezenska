const fs = require('fs');
const file = 'src/utils/quizQuestionsLoader.ts';
let code = fs.readFileSync(file, 'utf8');

const oldFuncStart = `export async function importDefaultQuestionsToSupabase(`;
const forceParam = `export async function importDefaultQuestionsToSupabase(
  _userId?: string | null,
  onProgress?: (imported: number, totalToImport: number) => void,
  forceOverwrite: boolean = false
): Promise<{`;

code = code.replace(`export async function importDefaultQuestionsToSupabase(
  _userId?: string | null,
  onProgress?: (imported: number, totalToImport: number) => void
): Promise<{`, forceParam);

const missingQuestionsLogic = `const missingQuestions = academyQuestions.filter((q) => {
      const norm = q.question.trim().toLowerCase();
      return !existingNormalized.has(norm);
    });`;

const updatedMissingLogic = `const missingQuestions = forceOverwrite
      ? academyQuestions
      : academyQuestions.filter((q) => {
          const norm = q.question.trim().toLowerCase();
          return !existingNormalized.has(norm);
        });

    if (forceOverwrite) {
      // First, delete all existing questions to rewrite everything fresh
      await supabase.from('quiz_questions').delete().neq('id', 0);
    }
`;

code = code.replace(missingQuestionsLogic, updatedMissingLogic);
fs.writeFileSync(file, code);
