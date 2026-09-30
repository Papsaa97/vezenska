const fs = require('fs');
const file = 'src/components/QuestionBankManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const importHandler = `  const handleImportDefaults = async () => {
    if (isImporting) return;
    const confirmed = window.confirm(
      'Chcete porovnat výchozí otázky v aplikaci (355 otázek) se Supabase a chybějící otázky automaticky hromadně nahrát do tabulky quiz_questions?'
    );
    if (!confirmed) return;

    setIsImporting(true);
    setImportMsg(null);
    setImportProgress({ current: 0, total: 355 });

    try {
      const result = await importDefaultQuestionsToSupabase(user?.id, (current, total) => {
        setImportProgress({ current, total });
      });`;

const updatedHandler = `  const handleImportDefaults = async (forceOverwrite = false) => {
    if (isImporting) return;
    const msg = forceOverwrite
      ? 'POZOR! Opravdu chcete PŘEPSAT celou databázi v Supabase aktuální revizí z aplikace? Všechny stávající otázky v Supabase budou smazány a nahrazeny!'
      : 'Chcete porovnat výchozí otázky v aplikaci se Supabase a chybějící otázky automaticky hromadně nahrát do tabulky quiz_questions?';

    const confirmed = window.confirm(msg);
    if (!confirmed) return;

    setIsImporting(true);
    setImportMsg(null);
    setImportProgress({ current: 0, total: 373 }); // updated total

    try {
      const result = await importDefaultQuestionsToSupabase(user?.id, (current, total) => {
        setImportProgress({ current, total });
      }, forceOverwrite);`;

code = code.replace(importHandler, updatedHandler);

const buttonHtml = `<button
          type="button"
          onClick={handleImportDefaults}
          disabled={isImporting || tableMissing}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all cursor-pointer whitespace-nowrap"
        >
          {isImporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Probíhá import…
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              Synchronizovat / Importovat výchozí otázky do Supabase
            </>
          )}
        </button>`;

const newButtons = `<div className="flex flex-col gap-2 shrink-0">
        <button
          type="button"
          onClick={() => handleImportDefaults(false)}
          disabled={isImporting || tableMissing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all cursor-pointer whitespace-nowrap"
        >
          {isImporting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Probíhá import…</>
          ) : (
            <><UploadCloud className="w-4 h-4" /> Doplnit chybějící do Supabase</>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleImportDefaults(true)}
          disabled={isImporting || tableMissing}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-red-500/25 transition-all cursor-pointer whitespace-nowrap"
        >
          <UploadCloud className="w-4 h-4" /> Přepsat banku novou revizí
        </button>
        </div>`;

code = code.replace(buttonHtml, newButtons);
code = code.replace('Synchronizace výchozích otázek (355 otázek)', 'Synchronizace výchozích otázek (373 otázek)');
fs.writeFileSync(file, code);
