import React, { useState, useEffect, useCallback, useRef, useMemo, useId } from 'react';
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
  RotateCcw,
  Printer,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { writeFailure } from '../utils/supabaseWrite';
import { useAuth } from '../context/AuthContext';
import PrintHeader from './common/PrintHeader';
import NoticeDialog, { Notice } from './common/NoticeDialog';
import ConfirmDialog from './common/ConfirmDialog';
import BulkQuestionImportModal from './BulkQuestionImportModal';
import { downloadQuestionsTemplate } from '../utils/questionTemplateParser';
import { useEditableContent } from '../hooks/useEditableContent';
import { DEFAULT_SUBJECTS } from '../utils/contentLibrary';
import { SupabaseQuizQuestionRow } from '../utils/quizQuestionsLoader';
import {
  importDefaultQuestionsToSupabase,
  getUniqueDefaultQuestions,
} from '../utils/defaultQuestionsImport';

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
  /** Skrytá studentům (sloupec is_hidden). */
  is_hidden: boolean;
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

function parseQuestionRow(row: SupabaseQuizQuestionRow): QuizQuestionItem {
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
    is_hidden: row.is_hidden === true,
    created_at: row.created_at ? String(row.created_at) : undefined,
    created_by: row.created_by ? String(row.created_by) : null,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface QuestionBankManagerProps {
  onQuestionsUpdated?: () => void;
}

export default function QuestionBankManager({ onQuestionsUpdated }: QuestionBankManagerProps = {}) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const { user, profile } = useAuth();
  const isLektorOrAdmin = profile?.role === 'lektor' || profile?.role === 'admin';
  const formRef = useRef<HTMLDivElement>(null);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  // ── Form State ──
  const [formData, setFormData] = useState<QuestionFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Questions List State ──
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  // Chyba načtení jiná než chybějící tabulka. Dřív se tvářila jako prázdná
  // banka („vytvořte svou první otázku“) a nechávala zapnutý i import
  // s přepsáním — nad falešně prázdnou bankou.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Předměty, které lektor přidal v záložce Předměty, musí jít vybrat i tady —
  // jinak by k novému předmětu nešlo napsat jedinou otázku. QUIZ_SUBJECTS drží
  // pořadí zavedených předmětů, nové se připojují za ně.
  const { entries: subjectEntries } = useEditableContent('subject', DEFAULT_SUBJECTS, true);
  const subjectOptions = useMemo(() => {
    const names = subjectEntries
      .filter((entry) => !entry.isDeleted)
      .map((entry) => entry.item.name);
    return Array.from(new Set<string>([...QUIZ_SUBJECTS, ...names]));
  }, [subjectEntries]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // ── Import / Sync State ──
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  /** Oznámení pro správce místo `alert()`. */
  const [notice, setNotice] = useState<Notice | null>(null);

  /**
   * Čeká se na potvrzení synchronizace výchozích otázek do Supabase?
   * `'overwrite'` je destruktivní varianta (přepsání celé tabulky).
   */
  const [pendingImport, setPendingImport] = useState<'upsert' | 'overwrite' | null>(null);
  const uniqueDefaultQuestionsCount = useMemo(() => getUniqueDefaultQuestions().length, []);

  // ── Fetch Questions ──
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setTableMissing(false);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) {
        // PostgREST 42P01: relation "public.quiz_questions" does not exist
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setTableMissing(true);
        } else {
          console.error('[QuizQuestions] Chyba při načítání:', error);
          setLoadError(`Otázky se nepodařilo načíst (${error.message}).`);
        }
        setQuestions([]);
      } else if (data) {
        const parsed = (data as SupabaseQuizQuestionRow[]).map(parseQuestionRow);
        setQuestions(parsed);
      }
    } catch (err) {
      console.error('[QuizQuestions] Neznámá chyba:', err);
      setLoadError(`Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();

    const handleQuestionsUpdated = () => {
      fetchQuestions();
    };
    window.addEventListener('vscr:questions_updated', handleQuestionsUpdated);
    return () => {
      window.removeEventListener('vscr:questions_updated', handleQuestionsUpdated);
    };
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

      // .select() je u UPDATE povinné: zamítnutí RLS se nevrací jako chyba, ale
      // jako nula zasažených řádků. Bez něj by se níže ohlásilo „úspěšně
      // aktualizována“ i ve chvíli, kdy se do databáze nezapsalo nic — a otázka
      // by se po fetchQuestions() vrátila do původní podoby bez vysvětlení.
      let rejection: string | null = null;

      if (editingId) {
        const res = await supabase
          .from('quiz_questions')
          .update(payload)
          .eq('id', editingId)
          .select('id');
        error = res.error;
        if (!error) {
          rejection = writeFailure('Otázku', res);
        }
      } else {
        const res = await supabase
          .from('quiz_questions')
          .insert([payload]);
        error = res.error;
      }

      if (rejection) {
        setFormMsg({ type: 'error', text: rejection });
      } else if (error) {
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
        if (onQuestionsUpdated) {
          onQuestionsUpdated();
        }
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
  // Skrytí přímo ze správce banky. Dřív to šlo jen z Předmětů a Kartiček
  // a skrytá otázka tu vypadala stejně jako zveřejněná.
  const handleToggleHidden = async (q: QuizQuestionItem) => {
    setTogglingId(q.id);
    const res = await supabase
      .from('quiz_questions')
      .update({ is_hidden: !q.is_hidden })
      .eq('id', q.id)
      .select('id');
    setTogglingId(null);
    const failure = res.error ? res.error.message : writeFailure('Otázku', res);
    if (failure) {
      setNotice({ tone: 'error', title: 'Viditelnost se nezměnila', description: failure });
      return;
    }
    setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, is_hidden: !q.is_hidden } : item)));
    window.dispatchEvent(new CustomEvent('vscr:questions_updated'));
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      let attempts = 0;
      let lastError: { message?: string } | null = null;
      let deleteResult: unknown[] | null = null;

      while (attempts < 2) {
        attempts++;
        const { data, error } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('id', id)
          .select();

        if (!error) {
          deleteResult = data;
          lastError = null;
          break;
        }

        lastError = error;
        const msg = error.message || '';
        const isNetworkErr =
          msg.includes('Load failed') ||
          msg.includes('Failed to fetch') ||
          msg.includes('NetworkError');

        if (isNetworkErr && attempts < 2) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }
        break;
      }

      if (lastError) {
        const msg = lastError.message || '';
        const isNetworkErr =
          msg.includes('Load failed') ||
          msg.includes('Failed to fetch') ||
          msg.includes('NetworkError');

        if (isNetworkErr) {
          setNotice({
            tone: 'error',
            title: 'Otázka se nesmazala — spojení se serverem selhalo',
            description:
              'Zkontrolujte připojení k internetu a zkuste mazání znovu. Otázka v databázi zůstala.',
          });
        } else {
          setNotice({
            tone: 'error',
            title: 'Otázku se nepodařilo smazat',
            description: (
              <>
                Server odmítl mazání. Otázka v databázi zůstala.
                <span className="mt-2 block font-mono text-xs text-slate-500 dark:text-slate-400">{msg}</span>
              </>
            ),
          });
        }
      } else if (!deleteResult || deleteResult.length === 0) {
        setNotice({
          tone: 'error',
          title: 'Otázka se nesmazala — chybí oprávnění',
          description:
            'Server mazání přijal, ale neodstranil žádný řádek. Bývá to politikou RLS pro DELETE nad tabulkou quiz_questions: mazat smí jen lektor nebo správce. Zkontrolujte svou roli, případně se obraťte na správce systému.',
        });
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        if (editingId === id) {
          handleCancelEdit();
        }
        if (onQuestionsUpdated) {
          onQuestionsUpdated();
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vscr:questions_updated'));
        }
      }
    } catch (err: unknown) {
      console.error('[QuizQuestions] Chyba při mazání:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('Load failed') || errMsg.includes('Failed to fetch')) {
        setNotice({
          tone: 'error',
          title: 'Otázka se nesmazala — spojení se serverem selhalo',
          description:
            'Zkontrolujte připojení k internetu a zkuste mazání znovu. Otázka v databázi zůstala.',
        });
      } else {
        setNotice({
          tone: 'error',
          title: 'Při mazání došlo k chybě',
          description: (
            <>
              Otázka v databázi zůstala.
              <span className="mt-2 block font-mono text-xs text-slate-500 dark:text-slate-400">{errMsg}</span>
            </>
          ),
        });
      }
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // ── Import / Synchronize Default Questions Handler ──
  const handleImportDefaults = async (forceOverwrite = false) => {
    if (isImporting) return;

    setIsImporting(true);
    setImportMsg(null);
    setImportProgress({ current: 0, total: uniqueDefaultQuestionsCount });

    try {
      const result = await importDefaultQuestionsToSupabase(user?.id, (current, total) => {
        setImportProgress({ current, total });
      }, forceOverwrite);

      if (result.success) {
        if (result.importedCount > 0 || result.updatedCount > 0) {
          setImportMsg({
            type: 'success',
            text: `Synchronizace dokončena (upsert): Nově vloženo ${result.importedCount} otázek, aktualizováno ${result.updatedCount} již existujících (celkem v aplikaci: ${result.totalLocalCount}).`,
          });
        } else {
          setImportMsg({
            type: 'info',
            text: `Všechny výchozí otázky (${result.totalLocalCount}) jsou v Supabase již aktuální. Nebylo třeba nic měnit.`,
          });
        }
      } else {
        setImportMsg({
          type: 'error',
          text: result.errorMessage || 'Synchronizace selhala.',
        });
      }
      await fetchQuestions();
      if (onQuestionsUpdated) {
        onQuestionsUpdated();
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vscr:questions_updated'));
      }
    } catch (err) {
      setImportMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Neznámá chyba při importu.',
      });
      await fetchQuestions();
      if (onQuestionsUpdated) {
        onQuestionsUpdated();
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vscr:questions_updated'));
      }
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_questions_question_unique ON public.quiz_questions(question);

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
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3 no-print">
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
        className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 space-y-5 transition-all shadow-sm no-print"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-3">
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

          <div className="flex flex-wrap items-center gap-2">
            {editingId ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Zrušit úpravy
              </button>
            ) : (
              isLektorOrAdmin && (
                <>
                  <button
                    type="button"
                    onClick={downloadQuestionsTemplate}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-600/50"
                    title="Stáhnout vzorovou textovou šablonu vzor_otazek_vscr.txt"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="hidden sm:inline">Stáhnout vzorovou šablonu (.txt)</span>
                    <span className="sm:hidden">Šablona (.txt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBulkImportModal(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
                    title="Otevřít průvodce hromadným importem otázek ze šablony (.txt / .csv)"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Hromadný import otázek</span>
                  </button>
                </>
              )
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Předmět */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5" htmlFor={`${fieldIds}-0`}>
              Předmět *
            </label>
            <select
              id={`${fieldIds}-0`}
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              {subjectOptions.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Text otázky */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5" htmlFor={`${fieldIds}-1`}>
              Text otázky *
            </label>
            <textarea
              id={`${fieldIds}-1`}
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
              {/* Popisuje skupinu čtyř variant, ne jedno pole. */}
              <span
                id={`${fieldIds}-moznosti`}
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Možnosti odpovědi (A, B, C, D) *
              </span>
              <span className="text-xs text-slate-400">
                Přepínačem vlevo označte <span className="text-emerald-600 dark:text-emerald-400 font-semibold">správnou variantu</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5" role="group" aria-labelledby={`${fieldIds}-moznosti`}>
              {formData.options.map((optionValue, idx) => {
                const isSelected = formData.correctOption === idx;
                const label = OPTION_LABELS[idx];

                return (
                  <div
                    key={label}
                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl border transition-all min-w-0 w-full ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700 shadow-xs'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {/* Radio Button */}
                    <label
                      htmlFor={`option-radio-${idx}`}
                      className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none shrink-0"
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
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-colors shrink-0 ${
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
                      className={`min-w-0 flex-1 w-full px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor={`${fieldIds}-2`}>
                Vysvětlení správné odpovědi
              </label>
              <span className="text-xs text-slate-400">Volitelné (proč je daná možnost správná)</span>
            </div>
            <textarea
              id={`${fieldIds}-2`}
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
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-emerald-50/80 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-emerald-950/20 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs no-print">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Synchronizace výchozích otázek ({uniqueDefaultQuestionsCount} otázek)
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Hromadně porovná otázky v projektu se Supabase a pomocí <code className="font-mono text-[11px] px-1 bg-white/70 dark:bg-slate-800/80 rounded">upsert</code> (podle unikátního textu otázky) je zapíše do tabulky <code className="font-mono text-[11px] px-1 bg-white/70 dark:bg-slate-800/80 rounded">quiz_questions</code> – chybějící otázky vloží a již existující přepíše aktuální revizí (např. nově promíchané pořadí odpovědí A/B/C/D).
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

        <div className="flex flex-col gap-2 shrink-0">
        {isLektorOrAdmin && (
          <button
            type="button"
            onClick={() => setShowBulkImportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-sm shadow-indigo-500/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <UploadCloud className="w-4 h-4" /> Hromadný import ze šablony
          </button>
        )}
        <button
          type="button"
          onClick={() => setPendingImport('upsert')}
          disabled={isImporting || tableMissing || loadError !== null}
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
          onClick={() => setPendingImport('overwrite')}
          disabled={isImporting || tableMissing || loadError !== null}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-red-500/25 transition-all cursor-pointer whitespace-nowrap"
        >
          <UploadCloud className="w-4 h-4" /> Přepsat banku novou revizí
        </button>
        </div>
      </div>

      {/* ── Existing Questions List ── */}
      <div className="space-y-4">
        {/* Tisková hlavička – viditelná výhradně při tisku */}
        <PrintHeader 
          subject="Banka zkušebních otázek Akademie VS ČR" 
          docTitle={`Výběr: ${filterSubject === 'all' ? 'Všechny předměty' : filterSubject} (${filteredQuestions.length} ${filteredQuestions.length === 1 ? 'otázka' : filteredQuestions.length < 5 ? 'otázky' : 'otázek'})`} 
          subtext="Oficiální studijní a zkušební přehled otázek pro přípravu na zkoušky ZOP A" 
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
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
            <button
              type="button"
              onClick={async () => {
                await fetchQuestions();
                if (onQuestionsUpdated) onQuestionsUpdated();
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('vscr:questions_updated'));
                }
              }}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer disabled:opacity-50"
              title="Obnovit / znovu načíst otázky ze Supabase"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filtry & Search & Print */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={loading || filteredQuestions.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Vytisknout filtrované otázky nebo exportovat do PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Tisk otázek / PDF</span>
            </button>

            {/* Subject filter */}
            <div className="relative flex items-center">
              <Filter className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
              >
                <option value="all">Všechny předměty</option>
                {subjectOptions.map((s) => (
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
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-12 no-print">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            Načítám otázky ze Supabase…
          </div>
        )}

        {/* Empty state */}
        {!loading && loadError && (
          <div role="alert" className="p-4 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-sm text-red-700 dark:text-red-300 flex flex-wrap items-center justify-between gap-3 no-print">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => void fetchQuestions()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Zkusit znovu
            </button>
          </div>
        )}

        {!loading && questions.length === 0 && !tableMissing && !loadError && (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 space-y-2 no-print">
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
          <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 no-print">
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
                  className={`print-card p-4 rounded-2xl border transition-all ${
                    isEditing
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 shadow-sm'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      {/* Badge & Meta */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 print:bg-white print:border-slate-300 print:text-slate-800">
                          {q.subject}
                        </span>
                        <span className="text-xs text-slate-400 font-mono print:text-slate-700">
                          #{qIndex + 1}
                        </span>
                        {q.created_at && (
                          <span className="text-xs text-slate-400 print:hidden">
                            · {new Date(q.created_at).toLocaleDateString('cs-CZ')}
                          </span>
                        )}
                        {q.is_hidden && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 no-print">
                            Skryto studentům
                          </span>
                        )}
                        {isEditing && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 no-print">
                            Právě editujete
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <div className="font-bold text-sm text-slate-900 dark:text-white pt-1 print:text-[10.5pt] leading-snug">
                        {qIndex + 1}. {q.question}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 no-print">
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
                            onClick={() => void handleToggleHidden(q)}
                            disabled={togglingId === q.id}
                            aria-label={q.is_hidden ? 'Zveřejnit otázku studentům' : 'Skrýt otázku studentům'}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {q.is_hidden ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 print:grid-cols-1 print:gap-1.5">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = q.correct_option === oIdx;
                      return (
                        <div
                          key={oIdx}
                          className={`flex items-start gap-2 p-2 rounded-xl text-xs transition-colors print:p-1.5 ${
                            isCorrect
                              ? 'print-correct-answer bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 font-medium border border-emerald-200 dark:border-emerald-800/60 print:font-bold print:border-emerald-600'
                              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700/40 print:bg-white print:border-slate-200 print:text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md font-bold flex items-center justify-center shrink-0 text-xs ${
                              isCorrect
                                ? 'bg-emerald-600 text-white shadow-xs print:bg-emerald-700 print:text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 print:bg-slate-100 print:text-slate-700'
                            }`}
                          >
                            {OPTION_LABELS[oIdx]}
                          </span>
                          <span className={`flex-1 break-words ${isCorrect ? 'font-bold text-slate-950' : ''}`}>
                            {opt}
                          </span>
                          {isCorrect && (
                            <span className="text-emerald-700 font-bold shrink-0 ml-1 text-xs">✓ Správně</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rationale and Source */}
                  {(q.rationale || q.answer) && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/30 print:bg-white print:border-slate-200 print:text-slate-800">
                      {q.rationale && (
                        <div>
                          <strong className="text-slate-900 dark:text-slate-200 font-bold">Zákonné odůvodnění: </strong>
                          {q.rationale}
                        </div>
                      )}
                      {q.answer && (
                        <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          <strong>Správná odpověď dle předpisu:</strong> {q.answer}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal pro hromadný import otázek ── */}
      {isLektorOrAdmin && (
        <BulkQuestionImportModal
          isOpen={showBulkImportModal}
          onClose={() => setShowBulkImportModal(false)}
          existingQuestions={questions}
          onImportComplete={async () => {
            await fetchQuestions();
            if (onQuestionsUpdated) {
              onQuestionsUpdated();
            }
          }}
        />
      )}

      {/* Potvrzení synchronizace výchozích otázek do Supabase.
          Dřív se na obojí ptal `window.confirm()` — systémové okno s názvem
          domény, které v PWA nejde stylovat a na iOS ho lze potlačit. */}
      <ConfirmDialog
        isOpen={pendingImport !== null}
        tone={pendingImport === 'overwrite' ? 'danger' : 'neutral'}
        title={
          pendingImport === 'overwrite'
            ? 'Přepsat celou banku otázek v Supabase?'
            : 'Synchronizovat výchozí otázky do Supabase?'
        }
        description={
          pendingImport === 'overwrite' ? (
            <>
              Všechny otázky v tabulce <span className="font-mono">quiz_questions</span> se{' '}
              <strong>smažou</strong> a nahradí aktuální revizí z aplikace. Ruční úpravy otázek
              provedené ve správě banky se tím nevratně ztratí.
            </>
          ) : (
            <>
              Chybějící otázky se do tabulky <span className="font-mono">quiz_questions</span>{' '}
              vloží a otázky se stejným textem, které se v aplikaci od poslední synchronizace
              změnily (např. přeuspořádané možnosti), se přepíšou aktuální revizí (upsert).
              Otázky, které jsou jen v Supabase, zůstanou.
            </>
          )
        }
        confirmLabel={pendingImport === 'overwrite' ? 'Přepsat databázi' : 'Synchronizovat'}
        isBusy={isImporting}
        onConfirm={() => {
          const rezim = pendingImport;
          setPendingImport(null);
          void handleImportDefaults(rezim === 'overwrite');
        }}
        onCancel={() => setPendingImport(null)}
      />

      <NoticeDialog notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
