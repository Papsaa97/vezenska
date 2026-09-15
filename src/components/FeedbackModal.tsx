import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, AlertCircle, Loader2, MessageSquareWarning } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';

// ─── Kategorie zpětné vazby ───────────────────────────────────────────────────

export const FEEDBACK_CATEGORIES = [
  { value: 'app_bug', label: 'Chyba v aplikaci' },
  { value: 'question_bug', label: 'Chyba / překlep v otázce' },
  { value: 'idea', label: 'Nápad na vylepšení' },
  { value: 'other', label: 'Jiné' },
] as const;

export type FeedbackCategory = typeof FEEDBACK_CATEGORIES[number]['value'];

export const FEEDBACK_CATEGORY_COLORS: Record<FeedbackCategory, string> = {
  app_bug: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  question_bug: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  idea: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  other: 'bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600',
};

export function feedbackCategoryLabel(value: string): string {
  return FEEDBACK_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

const MIN_MESSAGE_LENGTH = 10;

// ─── FeedbackModal ────────────────────────────────────────────────────────────

interface FeedbackModalProps {
  onClose: () => void;
  screenContext: string;
}

export default function FeedbackModal({ onClose, screenContext }: FeedbackModalProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const { user, profile } = useAuth();

  const [category, setCategory] = useState<FeedbackCategory>('app_bug');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Escape (ne během odesílání), past na fokus a jeho návrat — viz hooks/useDialog.
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: true, onClose, closeOnEscape: !submitting });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanMessage = message.trim();
    if (cleanMessage.length < MIN_MESSAGE_LENGTH) {
      setErrorMsg(`Zpráva musí mít alespoň ${MIN_MESSAGE_LENGTH} znaků.`);
      return;
    }

    setSubmitting(true);

    const userName = profile?.full_name || user?.email || 'Anonymní uživatel';

    const { error } = await supabase.from('user_feedback').insert([
      {
        user_id: user?.id ?? null,
        user_name: userName,
        category,
        message: cleanMessage,
        screen_context: screenContext,
        status: 'new',
      },
    ]);

    if (error) {
      setErrorMsg(`Odeslání selhalo: ${error.message}`);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="feedback-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        key="feedback-modal"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        {/* Obsah se po odeslání celý vymění za poděkování, takže tu nemá co
            ukazovat aria-labelledby — název dialogu je proto zapsaný přímo. */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Zpětná vazba"
          tabIndex={-1}
          className="pointer-events-auto w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 relative"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Zavřít formulář zpětné vazby"
          >
            <X className="w-4 h-4" />
          </button>

          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Děkujeme za zpětnou vazbu!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Vaše zpráva byla úspěšně odeslána.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <MessageSquareWarning className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-slate-900 dark:text-white font-bold text-lg leading-tight">Zpětná vazba</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Pomozte nám aplikaci vylepšit</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
                <div>
                  {/* Popisuje skupinu tlačítek, ne jedno pole. Proto span
                      s role="group", nikoli popisek formulářového pole —
                      ten by odečítač neměl k čemu přiřadit. */}
                  <span
                    id={`${fieldIds}-kategorie`}
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                  >
                    Kategorie *
                  </span>
                  <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby={`${fieldIds}-kategorie`}>
                    {FEEDBACK_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                          category === cat.value
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor={`${fieldIds}-0`}>
                    Zpráva *
                  </label>
                  <textarea
                    id={`${fieldIds}-0`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Popište prosím co nejpřesněji, co se stalo nebo co byste chtěli vylepšit…"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                  />
                  <div className="text-[11px] text-slate-400 mt-1 text-right">
                    {message.trim().length} / min. {MIN_MESSAGE_LENGTH} znaků
                  </div>
                </div>

                {/* Error message */}
                {errorMsg && (
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-300 leading-snug">{errorMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || message.trim().length < MIN_MESSAGE_LENGTH}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-500/25"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Odesílám…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Odeslat zpětnou vazbu
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
