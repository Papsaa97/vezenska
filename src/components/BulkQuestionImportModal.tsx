import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  UploadCloud,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useDialog } from '../hooks/useDialog';
import {
  ParsedQuestionImport,
  ParseValidationError,
  ParseQuestionsResult,
  parseQuestionsTemplate,
  downloadQuestionsTemplate,
  SAMPLE_QUESTIONS_TEMPLATE,
} from '../utils/questionTemplateParser';

interface BulkQuestionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingQuestions: { question: string }[];
  onImportComplete: () => Promise<void> | void;
}

const BATCH_SIZE = 50;

export default function BulkQuestionImportModal({
  isOpen,
  onClose,
  existingQuestions,
  onImportComplete,
}: BulkQuestionImportModalProps) {
  // ── Input State ──
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Options & Controls ──
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);
  const [showErrorDetails, setShowErrorDetails] = useState<boolean>(true);
  const [filterSubjectPreview, setFilterSubjectPreview] = useState<string>('all');

  // ── Import Execution State ──
  const [isExecuting, setIsExecuting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<{
    totalImported: number;
    newCount: number;
    updatedCount: number;
  } | null>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessReport(null);
      setImportProgress(null);
    }
  }, [isOpen]);

  // Live parsing
  const parseResult: ParseQuestionsResult = useMemo(() => {
    return parseQuestionsTemplate(rawText, existingQuestions);
  }, [rawText, existingQuestions]);

  // Handle file reading
  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      // Hlášení jde do vlastního pruhu v modálu, ne do `alert()`: ten v PWA
      // vypadá jako systémové okno s názvem domény a na iOS ho lze potlačit.
      setErrorMessage('Podporovány jsou pouze textové soubory s příponou .txt nebo .csv.');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setErrorMessage(null);
    setSuccessReport(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setRawText(content);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Chyba při čtení souboru. Zkontrolujte kódování (doporučeno UTF-8).');
    };
    reader.readAsText(file, 'utf-8');
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setRawText('');
    setFileName(null);
    setFileSize(null);
    setErrorMessage(null);
    setSuccessReport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_QUESTIONS_TEMPLATE);
    setFileName('vzor_otazek_vscr.txt');
    setFileSize(SAMPLE_QUESTIONS_TEMPLATE.length);
    setErrorMessage(null);
    setSuccessReport(null);
  };

  // Questions to be imported based on duplicate preference
  const questionsToSubmit = useMemo(() => {
    if (updateExisting) {
      return parseResult.validQuestions;
    }
    return parseResult.validQuestions.filter((q) => !q.isDuplicateInBank);
  }, [parseResult.validQuestions, updateExisting]);

  // Filtered preview
  const previewQuestions = useMemo(() => {
    if (filterSubjectPreview === 'all') {
      return parseResult.validQuestions;
    }
    return parseResult.validQuestions.filter(
      (q) => q.subject.toLowerCase() === filterSubjectPreview.toLowerCase()
    );
  }, [parseResult.validQuestions, filterSubjectPreview]);

  // Execute Supabase batch import
  const handleStartImport = async () => {
    if (questionsToSubmit.length === 0) {
      setErrorMessage('Není k dispozici žádná validní otázka k importu.');
      return;
    }

    setIsExecuting(true);
    setErrorMessage(null);
    setSuccessReport(null);
    setImportProgress({ current: 0, total: questionsToSubmit.length });

    let newCount = 0;
    let updatedCount = 0;

    try {
      for (let i = 0; i < questionsToSubmit.length; i += BATCH_SIZE) {
        const batch = questionsToSubmit.slice(i, i + BATCH_SIZE);

        const payload = batch.map((q) => ({
          subject: q.subject,
          question: q.question.trim(),
          options: q.options,
          correct_index: q.correct_index,
          source: q.source.trim(),
          explanation: q.explanation.trim(),
          is_hidden: false,
        }));

        const { error: upsertError } = await supabase
          .from('quiz_questions')
          .upsert(payload, { onConflict: 'question', ignoreDuplicates: !updateExisting });

        if (upsertError) {
          // Odolnost: pokud tabulka v Supabase dosud nemá sloupce source nebo is_hidden
          if (upsertError.message?.includes('column') || upsertError.code === '42703') {
            console.warn('[BulkImport] Sloupec source/is_hidden v databázi chybí, použije se fallback.');
            const fallbackPayload = batch.map((q) => ({
              subject: q.subject,
              question: q.question.trim(),
              options: q.options,
              correct_index: q.correct_index,
              explanation: q.explanation.trim(),
            }));

            const { error: fbError } = await supabase
              .from('quiz_questions')
              .upsert(fallbackPayload, { onConflict: 'question', ignoreDuplicates: !updateExisting });

            if (fbError) {
              throw new Error(`Dávka (${i + 1}-${i + batch.length}) selhala: ${fbError.message}`);
            }
          } else {
            throw new Error(`Dávka (${i + 1}-${i + batch.length}) selhala: ${upsertError.message}`);
          }
        }

        // Statistika
        for (const item of batch) {
          if (item.isDuplicateInBank) {
            updatedCount++;
          } else {
            newCount++;
          }
        }

        setImportProgress({
          current: Math.min(i + batch.length, questionsToSubmit.length),
          total: questionsToSubmit.length,
        });
      }

      // Úspěšně dokončeno
      setSuccessReport({
        totalImported: questionsToSubmit.length,
        newCount,
        updatedCount,
      });

      // Aktualizace lokálního stavu banky otázek a notifikace aplikace
      await onImportComplete();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vscr:questions_updated'));
      }
    } catch (err) {
      console.error('[BulkImport] Chyba při importu do Supabase:', err);
      const msg = err instanceof Error ? err.message : 'Neznámá chyba při komunikaci s databází.';
      setErrorMessage(`Import se nezdařil: ${msg}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Escape (ne během importu), past na fokus a jeho návrat — viz hooks/useDialog.
  // MUSÍ být nad `return null` níže. Dokud byl hook až za ním, přeskočil se
  // při zavřeném dialogu a po otevření se počet zavolaných hooků změnil —
  // React na to v prohlížeči hlásil „Internal React error: Expected static
  // flag was missing". Zachytil to až ESLint (react-hooks/rules-of-hooks);
  // typová kontrola takovou vadu nevidí.
  const dialogRef = useDialog<HTMLDivElement>({
    isOpen,
    onClose,
    closeOnEscape: !isExecuting,
  });

  if (!isOpen) return null;

  const totalErrors = parseResult.errors.length;
  const totalValid = parseResult.validQuestions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Ztmavené pozadí je dekorace: klik na něj dialog zavře, ale pro
          odečítač obrazovky neexistuje a klávesnice má Escape (useDialog).
          Proto je oddělené od samotného dialogu a označené aria-hidden. */}
      <div
        aria-hidden="true"
        onClick={() => { if (!isExecuting) onClose(); }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-import-title"
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden transition-all"
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 id="bulk-import-title" className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Hromadný import otázek
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Lektor / Admin
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Import ze strukturované šablony (.txt) nebo CSV s automatickou validací a kontrolou duplicit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={downloadQuestionsTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              title="Stáhnout vzorovou šablonu .txt"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Vzorová šablona</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isExecuting}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-40"
              title="Zavřít"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Modal Body (Scrollable) ── */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0 text-slate-800 dark:text-slate-200">
          {/* Input Method Tabs */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Nahrát soubor (.txt / .csv)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'text'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Vložit text přímo
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Vložit ukázku
              </button>
              {rawText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Vyčistit
                </button>
              )}
            </div>
          </div>

          {/* Tab 1: Drag & Drop Zone.
              Zóna je <label> pole výše: klik otevře výběr souboru nativně,
              bez obsluhy onClick a bez druhé zastávky tabulátoru. Přetažení
              myší je navíc a klávesovou obdobu nemá, proto je kontrola na
              těchto obsluhách vypnutá adresně — klávesová cesta vede přes
              samotné pole. */}
          {activeTab === 'upload' && (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <label
              htmlFor="bulk-import-file"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40'
              }`}
            >
              {/* sr-only, ne hidden: display:none vyřadí pole ze stromu
                  přístupnosti i z pořadí tabulátoru, takže výběr souboru by
                  z klávesnice nešel vyvolat vůbec. */}
              <input
                ref={fileInputRef}
                id="bulk-import-file"
                type="file"
                accept=".txt,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
                className="sr-only"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Přetáhněte sem soubor se šablonou nebo klikněte pro výběr
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Podporované formáty: textový soubor se strukturou <code className="font-mono text-blue-600 dark:text-blue-400">=== OTÁZKA ===</code> (.txt) nebo tabulka (.csv)
                </div>
              </div>

              {fileName && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold">
                  <FileText className="w-4 h-4" />
                  <span>{fileName}</span>
                  {fileSize && (
                    <span className="text-blue-500 text-[11px]">
                      ({(fileSize / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              )}
            </label>
          )}

          {/* Tab 2: Direct Textarea */}
          {activeTab === 'text' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Zadejte text strukturovaný podle šablony:</span>
                <span>{rawText.length} znaků</span>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setErrorMessage(null);
                  setSuccessReport(null);
                }}
                rows={10}
                placeholder="Vložte text se zněním otázek začínající oddělovačem === OTÁZKA === ..."
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all leading-relaxed"
              />
            </div>
          )}

          {/* ── Status & Summary Dashboard ── */}
          {rawText.trim().length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-semibold text-slate-500">Rozpoznáno bloků</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {parseResult.totalBlocks}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Validních otázek
                  </div>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {totalValid}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    Duplicit v bance
                  </div>
                  <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-0.5">
                    {parseResult.duplicatesInBankCount}
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl border ${
                    totalErrors > 0
                      ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div
                    className={`text-[11px] font-semibold ${
                      totalErrors > 0 ? 'text-red-700 dark:text-red-400' : 'text-slate-500'
                    }`}
                  >
                    Chyb validace
                  </div>
                  <div
                    className={`text-xl font-black mt-0.5 ${
                      totalErrors > 0 ? 'text-red-700 dark:text-red-400' : 'text-slate-400'
                    }`}
                  >
                    {totalErrors}
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Tags */}
              {Object.keys(parseResult.subjectBreakdown).length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500">
                    Rozpad validních otázek podle předmětů:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(parseResult.subjectBreakdown).map(([subj, count]) => (
                      <span
                        key={subj}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        {subj}
                        <span className="px-1.5 py-0.2 rounded-md bg-blue-200/70 dark:bg-blue-800 text-[10px] font-bold">
                          {count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Errors Box */}
              {totalErrors > 0 && (
                <div className="rounded-2xl border border-red-200 dark:border-red-800/80 bg-red-50/70 dark:bg-red-950/20 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowErrorDetails((prev) => !prev)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-red-700 dark:text-red-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>
                        Nalezeno {totalErrors} chyb v šabloně (tyto bloky nebudou importovány)
                      </span>
                    </div>
                    {showErrorDetails ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showErrorDetails && (
                    <div className="px-4 pb-3 max-h-48 overflow-y-auto space-y-1.5 border-t border-red-100 dark:border-red-900/40 pt-2 text-xs text-red-800 dark:text-red-200">
                      {parseResult.errors.map((err: ParseValidationError, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-red-200/60 dark:border-red-800/40"
                        >
                          <span className="font-bold shrink-0 font-mono text-[11px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">
                            #{err.blockNumber}
                          </span>
                          <span className="flex-1 break-words">{err.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Deduplication Option */}
              {parseResult.duplicatesInBankCount > 0 && (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-200">
                        Detekovány kolize s existující bankou ({parseResult.duplicatesInBankCount} otázek):
                      </span>
                      <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                        Zvolte, jak naložit s otázkami, jejichž text se již v databázi nachází.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
                      <input
                        type="radio"
                        name="dupChoice"
                        checked={updateExisting}
                        onChange={() => setUpdateExisting(true)}
                        className="accent-blue-600"
                      />
                      <span>Aktualizovat (upsert)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
                      <input
                        type="radio"
                        name="dupChoice"
                        checked={!updateExisting}
                        onChange={() => setUpdateExisting(false)}
                        className="accent-blue-600"
                      />
                      <span>Přeskočit duplicity</span>
                    </label>
                  </div>
                </div>
              )}

              {/* ── Questions Preview Section ── */}
              {totalValid > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Náhled otázek připravených k zápisu</span>
                      <span className="text-xs font-normal text-slate-400">
                        ({previewQuestions.length} položek)
                      </span>
                    </div>

                    {/* Filter Preview */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Filtrovat:</span>
                      <select
                        value={filterSubjectPreview}
                        onChange={(e) => setFilterSubjectPreview(e.target.value)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="all">Všechny předměty</option>
                        {Object.keys(parseResult.subjectBreakdown).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                    {previewQuestions.slice(0, 30).map((q: ParsedQuestionImport) => (
                      <div
                        key={q.rawIndex}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-800/40 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {q.subject}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              #{q.rawIndex}
                            </span>
                            {q.isDuplicateInBank && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                                {updateExisting ? 'Bude aktualizováno' : 'Bude přeskočeno'}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Správně: {q.correct_letter}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {q.question}
                        </div>

                        {/* 4 Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = q.correct_index === oIdx;
                            const label = ['A', 'B', 'C', 'D'][oIdx];
                            return (
                              <div
                                key={oIdx}
                                className={`p-1.5 rounded-lg border flex items-start gap-1.5 ${
                                  isCorrect
                                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold'
                                    : 'bg-white/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {label}
                                </span>
                                <span className="flex-1 break-words leading-tight">{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Source and Rationale preview */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50 pt-1.5 space-y-0.5">
                          <div>
                            <strong className="text-slate-700 dark:text-slate-300">Zdroj: </strong>
                            {q.source}
                          </div>
                          <div>
                            <strong className="text-slate-700 dark:text-slate-300">Odůvodnění: </strong>
                            {q.explanation}
                          </div>
                        </div>
                      </div>
                    ))}
                    {previewQuestions.length > 30 && (
                      <div className="text-center text-xs text-slate-400 py-1 font-medium">
                        … a dalších {previewQuestions.length - 30} otázek
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Execution Progress ── */}
          {importProgress && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  Zápis do Supabase probíhá (dávky po {BATCH_SIZE} položkách)…
                </span>
                <span>
                  {importProgress.current} z {importProgress.total} (
                  {Math.round((importProgress.current / (importProgress.total || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (importProgress.current / (importProgress.total || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Success Message ── */}
          {successReport && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  Hromadný import byl úspěšně dokončen!
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  Do Supabase bylo zapsáno celkem {successReport.totalImported} otázek (nově vloženo:{' '}
                  {successReport.newCount}, aktualizováno:{' '}
                  {successReport.updatedCount}). Lokální stav banky otázek byl automaticky aktualizován.
                </div>
              </div>
            </div>
          )}

          {/* ── Error Banner ── */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-red-800 dark:text-red-200 text-xs">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold">{errorMessage}</div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            {questionsToSubmit.length > 0 ? (
              <span>
                K uložení připraveno:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {questionsToSubmit.length} otázek
                </strong>{' '}
                {!updateExisting && parseResult.duplicatesInBankCount > 0 && (
                  <span>({parseResult.duplicatesInBankCount} duplicit přeskočeno)</span>
                )}
              </span>
            ) : (
              <span>Nahrajte nebo vložte šablonu s otázkami.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isExecuting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
            >
              {successReport ? 'Zavřít' : 'Zrušit'}
            </button>

            <button
              type="button"
              onClick={handleStartImport}
              disabled={isExecuting || questionsToSubmit.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importuji do Supabase…
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Uložit {questionsToSubmit.length} otázek do databáze
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
