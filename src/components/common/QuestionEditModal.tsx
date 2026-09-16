import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Edit3, Eye, EyeOff, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Question } from '../../types';
import { updateQuestionInSupabase, isQuestionHidden } from '../../utils/questionActions';
import { useDialog } from '../../hooks/useDialog';

interface QuestionEditModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onQuestionUpdated: (updatedQuestion: Question) => void;
}

export default function QuestionEditModal({
  question,
  isOpen,
  onClose,
  onQuestionUpdated,
}: QuestionEditModalProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [rationaleText, setRationaleText] = useState('');
  const [topicText, setTopicText] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setQuestionText(question.question || '');
      setAnswerText(question.answer || '');
      setSourceText(question.source || '');
      setRationaleText(question.rationale || question.explanation || '');
      setTopicText(question.topic || '');
      setIsHidden(isQuestionHidden(question));
      setErrorMsg(null);
    }
  }, [question, isOpen]);

  // Vlastní obsluha Escape nahrazena sdíleným hookem — ten navíc drží fokus
  // uvnitř dialogu a po zavření ho vrátí tam, odkud se otevíral.
  const dialogRef = useDialog<HTMLDivElement>({ isOpen, onClose, closeOnEscape: !isSaving });

  if (!question) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setErrorMsg('Znění otázky nesmí být prázdné.');
      return;
    }
    if (!answerText.trim()) {
      setErrorMsg('Správná odpověď nesmí být prázdná.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    // Pokud otázka obsahuje varianty výběru (options), aktualizujeme v nich správnou odpověď
    let updatedOptions = question.options;
    const correctIdx = typeof question.correctOption === 'number'
      ? question.correctOption
      : (question.correct_index ?? 0);

    if (Array.isArray(updatedOptions) && updatedOptions.length > 0) {
      updatedOptions = updatedOptions.map((opt, idx) => (idx === correctIdx ? answerText.trim() : opt));
    } else {
      updatedOptions = [answerText.trim()];
    }

    const updated: Question = {
      ...question,
      question: questionText.trim(),
      answer: answerText.trim(),
      source: sourceText.trim(),
      rationale: rationaleText.trim(),
      explanation: rationaleText.trim(),
      topic: topicText.trim() || question.topic,
      options: updatedOptions,
      correctOption: correctIdx,
      correct_index: correctIdx,
      is_hidden: isHidden,
    };

    try {
      // Uložení do Supabase + localStorage
      const result = await updateQuestionInSupabase(updated);
      if (!result.success) {
        // Dřív se selhání jen zalogovalo do konzole, změna se uplatnila v React
        // stavu a dialog se zavřel — úprava tedy vypadala uložená a po obnovení
        // stránky byla pryč. Otázky jsou sdílený obsah: neuloží-li se na server,
        // neuvidí je nikdo další, takže to musí uživatel vědět hned.
        console.error('[QuestionEditModal] Ukládání do databáze selhalo:', result.error);
        setErrorMsg(result.error ?? 'Otázku se nepodařilo uložit do databáze.');
        return;
      }

      // Okamžitá aktualizace lokálního React stavu
      onQuestionUpdated(updated);
      onClose();
    } catch (err) {
      console.error('[QuestionEditModal] Neočekávaná chyba:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Uložení selhalo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
          {/* Ztmavené pozadí je dekorace: klik na něj dialog zavře, ale pro
              odečítač obrazovky neexistuje a klávesnice má Escape (useDialog).
              Proto je oddělené od samotného dialogu a označené aria-hidden. */}
          <div
            aria-hidden="true"
            onClick={() => !isSaving && onClose()}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-edit-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="question-edit-title" className="text-base font-bold text-slate-900 dark:text-white">
                    Rychlá in-place úprava otázky
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Předmět: <span className="font-semibold text-slate-700 dark:text-slate-300">{question.subject}</span> • ID: <span className="font-mono text-slate-600 dark:text-slate-400">{question.id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                aria-label="Zavřít editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Question Text */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5" htmlFor={`${fieldIds}-0`}>
                    Znění otázky / Přední strana kartičky *
                  </label>
                  <textarea
                    id={`${fieldIds}-0`}
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Sem napište znění otázky..."
                  />
                </div>

                {/* Answer Text */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5" htmlFor={`${fieldIds}-1`}>
                    Správná odpověď / Zadní strana kartičky *
                  </label>
                  <textarea
                    id={`${fieldIds}-1`}
                    rows={2}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors font-medium"
                    placeholder="Přesná formulace správné odpovědi..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Legal Source */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5" htmlFor={`${fieldIds}-2`}>
                      Zákonný pramen / předpis (source)
                    </label>
                    <input
                      id={`${fieldIds}-2`}
                      type="text"
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono text-xs"
                      placeholder="např. Zákon č. 555/1992 Sb., § 18"
                    />
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5" htmlFor={`${fieldIds}-3`}>
                      Tématický okruh (topic)
                    </label>
                    <input
                      id={`${fieldIds}-3`}
                      type="text"
                      value={topicText}
                      onChange={(e) => setTopicText(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="např. Donucovací prostředky"
                    />
                  </div>
                </div>

                {/* Rationale / Explanation */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5" htmlFor={`${fieldIds}-4`}>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Zákonné odůvodnění a vysvětlení (rationale)
                  </label>
                  <textarea
                    id={`${fieldIds}-4`}
                    rows={3}
                    value={rationaleText}
                    onChange={(e) => setRationaleText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors leading-relaxed"
                    placeholder="Podrobné vysvětlení správné odpovědi, zákonná opora..."
                  />
                </div>

                {/* Visibility Toggle Box */}
                <div className={`p-4 rounded-xl border transition-colors ${
                  isHidden
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isHidden}
                      onChange={(e) => setIsHidden(e.target.checked)}
                      className="mt-1 rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        {isHidden ? (
                          <>
                            <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-amber-800 dark:text-amber-300">Skryto pro studenty</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-slate-800 dark:text-slate-200">Publikováno pro studenty</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Pokud je položka skrytá, běžní studenti ji neuvidí v procvičování, kartičkách ani tiskových sestavách. 
                        Lektoři a správci ji uvidí se zřetelným štítkem.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ukládám...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Uložit změny</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
