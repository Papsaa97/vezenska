import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Filter,
  Search,
  Check,
  X,
  Database,
  Code,
  Copy,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { importDefaultQuestionsToSupabase } from '../utils/quizQuestionsLoader';

// ─── Constants & Types ────────────────────────────────────────────────────────

export const QUIZ_SUBJECTS = [
  'Zbraně',
  'ZOP',
  'Penologie',
  'Taktika',
  'Právo',
  'Bezpečnostní služba',
  'Služební příprava',
  'Profesní etika',
  'Vězeňská administrativa',
  'Psychologie',
  'Pedagogika',
  'Zdravověda a první pomoc',
  'Ostatní',
] as const;

export type QuizSubject = typeof QUIZ_SUBJECTS[number];

export interface QuizQuestionItem {
  id: string;
  subject: string;
  question: string;
  options: [string, string, string, string];
  correct_option: number;
  answer: string;
  rationale?: string | null;
  created_at?: string;
  created_by?: string | null;
}

interface QuestionFormData {
  subject: string;
  question: string;
  options: [string, string, string, string];
  correctOption: number;
  rationale: string;
}

const INITIAL_FORM: QuestionFormData = {
  subject: 'Zbraně',
  question: '',
  options: ['', '', '', ''],
  correctOption: 0,
  rationale: '',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseQuestionRow(row: Record<string, unknown>): QuizQuestionItem {
  let optionsArray: string[] = [];
  if (Array.isArray(row.options)) {
    optionsArray = row.options.map(String);
  } else if (typeof row.options === 'string') {
    try {
      const parsed = JSON.parse(row.options);
      if (Array.isArray(parsed)) {
        optionsArray = parsed.map(String);
      }
    } catch {
      optionsArray = [];
    }
  }

  const fixedOptions: [string, string, string, string] = [
    optionsArray[0] ?? '',
    optionsArray[1] ?? '',
    optionsArray[2] ?? '',
    optionsArray[3] ?? '',
  ];

  const correctIdx = typeof row.correct_index === 'number'
    ? row.correct_index
    : typeof row.correct_option === 'number'
    ? row.correct_option
    : typeof row.correctOption === 'number'
    ? row.correctOption
    : 0;

  const explanation = row.explanation
    ? String(row.explanation)
    : row.rationale
    ? String(row.rationale)
    : null;

  return {
    id: String(row.id),
    subject: String(row.subject ?? 'Ostatní'),
    question: String(row.question ?? ''),
    options: fixedOptions,
    correct_option: correctIdx >= 0 && correctIdx < 4 ? correctIdx : 0,
    answer: String(row.answer ?? fixedOptions[correctIdx] ?? ''),
    rationale: explanation,
    created_at: row.created_at ? String(row.created_at) : undefined,
    created_by: row.created_by ? String(row.created_by) : null,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuestionBankManager() {
  const { user } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);

  // ── Form State ──
  const [formData, setFormData] = useState<QuestionFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Questions List State ──
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // ── Import / Sync State ──
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // ── Fetch Questions ──
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setTableMissing(false);
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // PostgREST 42P01: relation "public.quiz_questions" does not exist
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setTableMissing(true);
        } else {
          console.error('[QuizQuestions] Chyba při načítání:', error);
        }
        setQuestions([]);
      } else if (data) {
        const parsed = (data as Record<string, unknown>[]).map(parseQuestionRow);
        setQuestions(parsed);
      }
    } catch (err) {
      console.error('[QuizQuestions] Neznámá chyba:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // ── Form Handlers ──
  const handleOptionTextChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newOptions = [...prev.options] as [string, string, string, string];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const handleStartEdit = (item: QuizQuestionItem) => {
    setEditingId(item.id);
    setFormData({
      subject: item.subject,
      question: item.question,
      options: [item.options[0], item.options[1], item.options[2], item.options[3]],
      correctOption: item.correct_option,
      rationale: item.rationale ?? '',
    });
    setFormMsg(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const cleanQuestion = formData.question.trim();
    if (!cleanQuestion) {
      setFormMsg({ type: 'error', text: 'Vyplňte prosím text otázky.' });
      return;
    }

    const cleanOptions = formData.options.map((o) => o.trim()) as [string, string, string, string];
    if (cleanOptions.some((opt) => !opt)) {
      setFormMsg({ type: 'error', text: 'Vyplňte prosím všechny 4 možnosti odpovědi (A, B, C, D).' });
      return;
    }

    const correctText = cleanOptions[formData.correctOption];
    if (!correctText) {
      setFormMsg({ type: 'error', text: 'Zvolená správná odpověď nesmí být prázdná.' });
      return;
    }

    setSaving(true);
    setFormMsg(null);

    const payload: Record<string, unknown> = {
      subject: formData.subject,
      question: cleanQuestion,
      options: cleanOptions,
      correct_index: formData.correctOption,
      explanation: formData.rationale.trim() || '',
    };

    try {
      let error = null;

      if (editingId) {
        const res = await supabase
          .from('quiz_questions')
          .update(payload)
          .eq('id', editingId);
        error = res.error;
      } else {
        const res = await supabase
          .from('quiz_questions')
          .insert([payload]);
        error = res.error;
      }

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setTableMissing(true);
          setFormMsg({
            type: 'error',
            text: 'Tabulka public.quiz_questions v Supabase dosud neexistuje. Vytvořte ji prosím podle SQL níže.',
          });
        } else {
          setFormMsg({ type: 'error', text: `Uložení selhalo: ${error.message}` });
        }
      } else {
        setFormMsg({
          type: 'success',
          text: editingId
            ? 'Otázka byla úspěšně aktualizována.'
            : 'Otázka byla úspěšně vytvořena a uložena do Supabase.',
        });
        setFormData(INITIAL_FORM);
        setEditingId(null);
        await fetchQuestions();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vscr:questions_updated'));
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Neznámá chyba';
      setFormMsg({ type: 'error', text: `Chyba při komunikaci: ${message}` });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Handler ──
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Smazání selhalo: ' + error.message);
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        if (editingId === id) {
          handleCancelEdit();
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vscr:questions_updated'));
        }
      }
    } catch (err) {
      console.error('[QuizQuestions] Chyba při mazání:', err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // ── Import / Synchronize Default Questions Handler ──
  const handleImportDefaults = async () => {
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
      });

      if (result.success) {
        if (result.importedCount > 0) {
          setImportMsg({
            type: 'success',
            text: `Synchronizace dokončena: Úspěšně nahráno ${result.importedCount} nových otázek do Supabase (již existovalo: ${result.alreadyExistingCount}).`,
          });
        } else {
          setImportMsg({
            type: 'info',
            text: `Všechny výchozí otázky (${result.totalLocalCount}) již v Supabase existují. Žádné nové otázky nebylo třeba vkládat.`,
          });
        }
        await fetchQuestions();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vscr:questions_updated'));
        }
      } else {
        setImportMsg({
          type: 'error',
          text: result.errorMessage || 'Synchronizace selhala.',
        });
      }
    } catch (err) {
      setImportMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Neznámá chyba při importu.',
      });
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  // ── Filtered Questions ──
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSubject = filterSubject === 'all' || q.subject.toLowerCase() === filterSubject.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.options.some((opt) => opt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (q.rationale && q.rationale.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSubject && matchQuery;
    });
  }, [questions, filterSubject, searchQuery]);

  const sqlSnippet = `-- Spusťte v Supabase SQL Editoru:
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Povolit čtení otázek pro všechny"
  ON public.quiz_questions FOR SELECT USING (true);

CREATE POLICY "Povolit zápis pro přihlášené uživatele"
  ON public.quiz_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Missing Table Notice */}
      {tableMissing && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-sm">Tabulka public.quiz_questions dosud nebyla vytvořena</div>
              <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                V databázi Supabase ještě neexistuje tabulka pro ukládání otázek. Spusťte prosím připravený SQL skript v Supabase SQL Editoru.
              </div>
            </div>
            <button
              onClick={() => setShowSqlHelp((prev) => !prev)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-200/70 dark:bg-amber-900 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" />
              {showSqlHelp ? 'Skrýt SQL' : 'Zobrazit SQL'}
            </button>
          </div>

          {showSqlHelp && (
            <div className="mt-3 relative">
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                {sqlSnippet}
              </pre>
              <button
                onClick={copySql}
                className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-sans flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSql ? 'Zkopírováno' : 'Kopírovat'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Form Section ── */}
      <div
        ref={formRef}
        className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 space-y-5 transition-all shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <div className="flex items-center gap-2.5">
            {editingId ? (
              <Edit3 className="w-5 h-5 text-amber-500" />
            ) : (
              <PlusCircle className="w-5 h-5 text-blue-500" />
            )}
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingId ? 'Upravit otázku' : 'Nová testová otázka'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingId
                  ? 'Provádíte úpravu existující otázky v bance'
                  : 'Vytvořte novou testovou otázku a uložte ji do Supabase'}
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Zrušit úpravy
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Předmět */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Předmět *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              {QUIZ_SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Text otázky */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Text otázky *
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
              rows={3}
              placeholder="Např. Jaké jsou zákonné podmínky pro použití zbraně podle § 19 zákona č. 555/1992 Sb.?"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* 4 Varianty odpovědí */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Možnosti odpovědi (A, B, C, D) *
              </label>
              <span className="text-xs text-slate-400">
                Přepínačem vlevo označte <span className="text-emerald-600 dark:text-emerald-400 font-semibold">správnou variantu</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {formData.options.map((optionValue, idx) => {
                const isSelected = formData.correctOption === idx;
                const label = OPTION_LABELS[idx];

                return (
                  <div
                    key={label}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700 shadow-xs'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {/* Radio Button */}
                    <label
                      htmlFor={`option-radio-${idx}`}
                      className="flex items-center gap-2 cursor-pointer select-none shrink-0"
                    >
                      <input
                        id={`option-radio-${idx}`}
                        type="radio"
                        name="correct-option-radio"
                        checked={isSelected}
                        onChange={() => setFormData((prev) => ({ ...prev, correctOption: idx }))}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer accent-emerald-600"
                      />
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {label}
                      </span>
                    </label>

                    {/* Text input */}
                    <input
                      type="text"
                      value={optionValue}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      placeholder={`Text možnosti ${label}`}
                      required
                      className={`flex-1 px-3 py-1.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                        isSelected
                          ? 'border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-emerald-500/40'
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-blue-500/40'
                      }`}
                    />

                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 pr-1">
                        <Check className="w-3.5 h-3.5" />
                        Správná
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volitelné vysvětlení */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Vysvětlení správné odpovědi
              </label>
              <span className="text-xs text-slate-400">Volitelné (proč je daná možnost správná)</span>
            </div>
            <textarea
              value={formData.rationale}
              onChange={(e) => setFormData((prev) => ({ ...prev, rationale: e.target.value }))}
              rows={2}
              placeholder="Např. Dle § 19 odst. 1 písm. b) zákona č. 555/1992 Sb. je příslušník oprávněn použít zbraň k odvrácení nebezpečného útoku..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* Zpráva o výsledku */}
          <AnimatePresence>
            {formMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                  formMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
                }`}
              >
                {formMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{formMsg.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Odeslací tlačítka */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                editingId
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/25'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editingId ? 'Aktualizuji…' : 'Ukládám…'}
                </>
              ) : editingId ? (
                <>
                  <Check className="w-4 h-4" />
                  Aktualizovat otázku
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Uložit novou otázku
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all cursor-pointer"
              >
                Zrušit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Synchronization Box ── */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-emerald-50/80 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-emerald-950/20 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Synchronizace výchozích otázek (355 otázek)
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Hromadně porovná otázky v projektu se Supabase a chybějící otázky ze všech předmětů ZOP automaticky vloží do tabulky <code className="font-mono text-[11px] px-1 bg-white/70 dark:bg-slate-800/80 rounded">quiz_questions</code>.
          </p>
          {importProgress && (
            <div className="pt-2 text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Nahrávání do Supabase: {importProgress.current} z {importProgress.total} otázek…
            </div>
          )}
          {importMsg && (
            <div
              className={`mt-2 text-xs font-semibold p-2.5 rounded-xl border flex items-center gap-2 ${
                importMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : importMsg.type === 'info'
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                  : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}
            >
              {importMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{importMsg.text}</span>
            </div>
          )}
        </div>

        <button
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
        </button>
      </div>

      {/* ── Existing Questions List ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Existující otázky
              {!loading && (
                <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                  ({filteredQuestions.length} z {questions.length})
                </span>
              )}
            </h3>
          </div>

          {/* Filtry & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject filter */}
            <div className="relative flex items-center">
              <Filter className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
              >
                <option value="all">Všechny předměty</option>
                {QUIZ_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Search filter */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hledat v otázkách…"
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-12">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            Načítám otázky ze Supabase…
          </div>
        )}

        {/* Empty state */}
        {!loading && questions.length === 0 && !tableMissing && (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">
              V bance zatím nejsou žádné otázky
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Pomocí formuláře výše vytvořte svou první testovou otázku a uložte ji do Supabase.
            </p>
          </div>
        )}

        {/* Empty search/filter state */}
        {!loading && questions.length > 0 && filteredQuestions.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
            Žádná otázka neodpovídá zvolenému filtru nebo hledání.
          </div>
        )}

        {/* Question items list */}
        {!loading && filteredQuestions.length > 0 && (
          <div className="space-y-3">
            {filteredQuestions.map((q, qIndex) => {
              const isEditing = editingId === q.id;
              const isDeleting = deletingId === q.id;
              const isConfirming = confirmDeleteId === q.id;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isEditing
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 shadow-sm'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      {/* Badge & Meta */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {q.subject}
                        </span>
                        <span className="text-xs text-slate-400">
                          #{qIndex + 1}
                        </span>
                        {q.created_at && (
                          <span className="text-xs text-slate-400">
                            · {new Date(q.created_at).toLocaleDateString('cs-CZ')}
                          </span>
                        )}
                        {isEditing && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                            Právě editujete
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <div className="font-semibold text-sm text-slate-900 dark:text-white pt-1">
                        {q.question}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isConfirming ? (
                        <div className="flex items-center gap-1.5 p-1 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800">
                          <span className="text-xs text-red-600 dark:text-red-400 font-semibold px-1">
                            Smazat?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(q.id)}
                            disabled={isDeleting}
                            className="px-2 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all cursor-pointer disabled:opacity-50"
                          >
                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ano'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
                          >
                            Ne
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(q)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                            title="Upravit otázku"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(q.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                            title="Smazat otázku"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 4 Options Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = q.correct_option === oIdx;
                      return (
                        <div
                          key={oIdx}
                          className={`flex items-start gap-2 p-2 rounded-xl text-xs transition-colors ${
                            isCorrect
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 font-medium border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700/40'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md font-bold flex items-center justify-center shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {OPTION_LABELS[oIdx]}
                          </span>
                          <span className="flex-1 break-words">{opt}</span>
                          {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rationale if present */}
                  {q.rationale && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/30">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Vysvětlení: </span>
                      {q.rationale}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
