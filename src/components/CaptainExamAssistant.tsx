import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  GraduationCap, 
  Printer, 
  Trash2, 
  Key, 
  Save, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Shield,
  RotateCcw,
  Plus
} from 'lucide-react';
import { Question } from '../types';
import { speakText, stopSpeaking, isSpeechSupported } from '../utils/speech';
import { 
  analyzeExamContent, 
  AnalyzedExamResponse, 
  getSavedApiKey, 
  setSavedApiKey, 
  getSavedCustomExams, 
  saveCustomExam, 
  deleteCustomExam, 
  SavedCustomExam 
} from '../utils/geminiAnalyzer';

interface CaptainExamAssistantProps {
  onStartCustomQuiz: (questions: Question[]) => void;
  onStartCustomFlashcards: (questions: Question[]) => void;
}

const SAMPLE_CAPTAIN_PROMPT = `Kapitán Novák nám dal na tabuli tyto otázky ze Služební přípravy a Práva:
1. Jaké jsou 3 základní podmínky pro použití zbraně dle § 18 zákona č. 555/1992 Sb.?
2. Jaký je rozdíl mezi krajní nouzí (§ 28 TZ) a nutnou obranou (§ 29 TZ) z hlediska subsidiarity?
3. Kdy je příslušník povinen po střelbě ihned vyrozumět státního zástupce?
4. Jaké donucovací prostředky nelze použít proti těhotné ženě s viditelným těhotenstvím?`;

export default function CaptainExamAssistant({
  onStartCustomQuiz,
  onStartCustomFlashcards
}: CaptainExamAssistantProps) {
  const [apiKey, setApiKey] = useState<string>(() => getSavedApiKey());
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [tempKey, setTempKey] = useState<string>('');

  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [textInput, setTextInput] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Inicializace...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [analyzedResult, setAnalyzedResult] = useState<AnalyzedExamResponse | null>(null);
  const [savedExams, setSavedExams] = useState<SavedCustomExam[]>(() => getSavedCustomExams());
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(0);
  const audioTimerRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      stopSpeaking();
      if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    };
  }, [imagePreviewUrl]);

  const handleSaveApiKey = () => {
    setSavedApiKey(tempKey);
    setApiKey(tempKey.trim());
    setShowKeyModal(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(URL.createObjectURL(file));
        setErrorMsg(null);
      } else {
        setErrorMsg('Nahrajte prosím obrázek ve formátu JPG, PNG nebo WEBP.');
      }
    }
  };

  const handleRunAnalysis = async () => {
    const key = apiKey || getSavedApiKey();
    if (!key) {
      setTempKey('');
      setShowKeyModal(true);
      return;
    }

    if (inputMode === 'text' && (!textInput || textInput.trim() === '')) {
      setErrorMsg('Vložte prosím text zadání nebo otázky od kapitána.');
      return;
    }

    if (inputMode === 'image' && !selectedImage) {
      setErrorMsg('Vyberte nebo vyfoťte prosím obrázek se zadáním testu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep('Předávání zadání modelu Gemini...');

    try {
      setTimeout(() => setLoadingStep('Provádění OCR přepisu a právní analýzy VS ČR...'), 1000);
      setTimeout(() => setLoadingStep('Dohledávání paragrafů v zákonech 555/1992 a 169/1999 Sb...'), 2500);
      setTimeout(() => setLoadingStep('Generování testových otázek a zkušebních tipů...'), 4000);

      const result = await analyzeExamContent(
        key,
        inputMode === 'text' ? textInput : undefined,
        inputMode === 'image' ? selectedImage || undefined : undefined
      );

      setAnalyzedResult(result);
      setExpandedQuestionIds(new Set(result.questions.map(q => q.id)));

      // Auto save to history
      const saved = saveCustomExam({
        title: result.title,
        subject: result.subject,
        questionCount: result.questions.length,
        questions: result.questions
      });
      setSavedExams(getSavedCustomExams());
    } catch (err: any) {
      setErrorMsg(err.message || 'Chyba při zpracování zadání.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSavedExam = (exam: SavedCustomExam) => {
    setAnalyzedResult({
      title: exam.title,
      subject: exam.subject,
      summary: `Uložený test ze dne ${new Date(exam.createdAt).toLocaleDateString('cs-CZ')}`,
      questions: exam.questions
    });
    setExpandedQuestionIds(new Set(exam.questions.map(q => q.id)));
  };

  const handleDeleteSavedExam = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteCustomExam(id);
    setSavedExams(getSavedCustomExams());
  };

  // Play a single question audio
  const handlePlayAudio = (e: React.MouseEvent, q: Question) => {
    e.stopPropagation();
    if (isPlayingAll) {
      stopSequence();
    }
    if (speakingId === q.id) {
      setSpeakingId(null);
      stopSpeaking();
    } else {
      setSpeakingId(q.id);
      speakText(`Otázka: ${q.question}. Správná odpověď: ${q.answer}. Odkaz: ${q.source}`, () => setSpeakingId(null));
    }
  };

  // Sequential Play All logic
  const playSequenceAt = (index: number, questions: Question[]) => {
    if (index >= questions.length) {
      setIsPlayingAll(false);
      setCurrentAudioIndex(0);
      setSpeakingId(null);
      return;
    }

    const q = questions[index];
    setCurrentAudioIndex(index);
    setSpeakingId(q.id);

    // Expand the active question so user sees it
    setExpandedQuestionIds(prev => new Set(prev).add(q.id));

    const speechText = `Otázka číslo ${index + 1}: ${q.question}. Správná odpověď ke zkoušce: ${q.answer}. Zákonný odkaz: ${q.source}.`;
    
    speakText(speechText, () => {
      audioTimerRef.current = setTimeout(() => {
        playSequenceAt(index + 1, questions);
      }, 1200);
    });
  };

  const stopSequence = () => {
    setIsPlayingAll(false);
    setSpeakingId(null);
    stopSpeaking();
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
  };

  const handleTogglePlayAll = () => {
    if (!analyzedResult || analyzedResult.questions.length === 0) return;

    if (isPlayingAll) {
      stopSequence();
    } else {
      setIsPlayingAll(true);
      playSequenceAt(0, analyzedResult.questions);
    }
  };

  const handleNextAudio = () => {
    if (!analyzedResult || !isPlayingAll) return;
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    stopSpeaking();
    const nextIdx = Math.min(analyzedResult.questions.length - 1, currentAudioIndex + 1);
    playSequenceAt(nextIdx, analyzedResult.questions);
  };

  const handlePrevAudio = () => {
    if (!analyzedResult || !isPlayingAll) return;
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    stopSpeaking();
    const prevIdx = Math.max(0, currentAudioIndex - 1);
    playSequenceAt(prevIdx, analyzedResult.questions);
  };

  const toggleExpand = (id: string) => {
    setExpandedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto p-2 sm:p-4 max-w-6xl mx-auto space-y-6 print:p-0 print:m-0 print:space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-md border border-indigo-500/20 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gemini 3.6 Flash AI • Multimodální asistent Akademie VS ČR</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">AI Vyhodnocení zadání od kapitánů</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Vyfoťte papír s testem, nahrajte sken nebo vložte otázky. AI je přečte, vypracuje správné odpovědi dle zákonů VS ČR a připraví cvičný kvíz i tahák.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setTempKey(apiKey);
                setShowKeyModal(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium text-white transition-all cursor-pointer shadow-sm"
              title="Nastavit Gemini API klíč"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>{apiKey ? 'API klíč aktivní' : 'Zadat API klíč'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Form & Saved Tests */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${analyzedResult ? 'no-print' : ''}`}>
        {/* Left 2 Cols: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            {/* Input Mode Selector */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  inputMode === 'text'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Vložit text / Otázky</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('image')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  inputMode === 'image'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Vyfotit / Nahrát fotku testu</span>
              </button>
            </div>

            {/* Text Mode */}
            {inputMode === 'text' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Otázky nebo zadání od učitele / kapitána:
                  </label>
                  <button
                    type="button"
                    onClick={() => setTextInput(SAMPLE_CAPTAIN_PROMPT)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Vložit ukázkové zadání
                  </button>
                </div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Sem vložte otázky, zadání písemky nebo modelovou situaci od kapitána..."
                  rows={7}
                  className="w-full p-4 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
                />
              </div>
            )}

            {/* Image Mode */}
            {inputMode === 'image' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                {!selectedImage ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Klikněte pro vyfocení nebo výběr fotky zadání
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Podporuje JPG, PNG, WEBP nebo přímé vyfocení mobilem
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 p-2 flex flex-col items-center">
                    <img
                      src={imagePreviewUrl || ''}
                      alt="Náhled zadání testu"
                      className="max-h-72 object-contain rounded-xl"
                    />
                    <div className="flex items-center gap-3 mt-3 w-full justify-between px-2">
                      <span className="text-xs text-slate-300 truncate max-w-xs font-mono">
                        {selectedImage.name} ({(selectedImage.size / 1024).toFixed(0)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
                          setImagePreviewUrl(null);
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Změnit fotku
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRunAnalysis}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>Analyzovat zadání & Vygenerovat odpovědi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Saved Custom Exams History */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Moje uložená zadání ({savedExams.length})
            </h2>

            {savedExams.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                <p>Zatím nemáte žádná uložená zadání.</p>
                <p className="mt-1">Po vyhodnocení se zde automaticky uloží.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {savedExams.map((exam) => (
                  <div
                    key={exam.id}
                    onClick={() => handleOpenSavedExam(exam)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {exam.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium">
                          {exam.subject}
                        </span>
                        <span>{exam.questionCount} otázek</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSavedExam(e, exam.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                      title="Smazat test"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results View */}
      {analyzedResult && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 print:p-0 print:border-none print:shadow-none"
        >
          {/* Printable Official Header */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-slate-950 uppercase tracking-tight m-0 p-0 border-none">
                  AKADEMIE VĚZEŇSKÉ SLUŽBY ČESKÉ REPUBLIKY
                </h1>
                <p className="text-[10pt] text-slate-700 font-semibold m-0">
                  Základní odborná příprava (ZOP A) • Zkušební protokol a studijní přehled
                </p>
              </div>
              <div className="text-right text-[9pt] text-slate-600 font-mono">
                <div>Předmět: <strong>{analyzedResult.subject}</strong></div>
                <div>Otázek: <strong>{analyzedResult.questions.length}</strong></div>
              </div>
            </div>
          </div>

          {/* Result Header & Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 print:pb-3 print:mb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded text-xs font-bold uppercase tracking-wider mb-2 print:hidden">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vyhodnoceno ({analyzedResult.questions.length} otázek)
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {analyzedResult.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {analyzedResult.summary}
              </p>
            </div>

            {/* Actions: Audio / Print */}
            <div className="flex items-center gap-2.5 flex-wrap no-print">
              {isSpeechSupported() && (
                <button
                  type="button"
                  onClick={handleTogglePlayAll}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
                    isPlayingAll
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  title="Pustit postupné předčítání všech otázek a správných odpovědí za sebou"
                >
                  {isPlayingAll ? (
                    <>
                      <Square className="w-4 h-4 fill-current" />
                      <span>Zastavit čtení ({currentAudioIndex + 1}/{analyzedResult.questions.length})</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Přehrát vše nahlas</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
                title="Vytisknout úsporný kapesní tahák A4 bez zbytečné grafiky"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Tisk taháku (úsporný A4)</span>
              </button>
            </div>
          </div>

          {/* Sticky Floating Audio Bar when Playing All */}
          {isPlayingAll && (
            <div className="no-print p-3 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl shadow-lg border border-indigo-400/30 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Audio průvodce: Otázka {currentAudioIndex + 1} z {analyzedResult.questions.length}
                  </div>
                  <div className="text-xs text-slate-300 line-clamp-1">
                    {analyzedResult.questions[currentAudioIndex]?.question}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevAudio}
                  disabled={currentAudioIndex === 0}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 cursor-pointer"
                  title="Předchozí otázka"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={stopSequence}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Zastavit přehrávání"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextAudio}
                  disabled={currentAudioIndex === analyzedResult.questions.length - 1}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 cursor-pointer"
                  title="Další otázka"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Questions Accordion / Pocket Cheat Sheet Grid */}
          <div className="space-y-4 print:space-y-0">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider no-print">
              Vypracované otázky a správné odpovědi ke zkoušce:
            </h3>

            <div className="space-y-3 print-questions-grid">
            {analyzedResult.questions.map((q, idx) => {
              const isExpanded = expandedQuestionIds.has(q.id);
              const isCurrentlyPlaying = isPlayingAll && currentAudioIndex === idx;

              return (
                <div
                  key={q.id}
                  className={`print-question-card border rounded-xl overflow-hidden transition-all ${
                    isCurrentlyPlaying 
                      ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50/20 dark:bg-amber-950/30 shadow-md' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(q.id)}
                    className="p-4 print:p-1.5 flex items-start justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 print:gap-1.5 flex-1">
                      <span className="w-6 h-6 print:w-4 print:h-4 print:text-[8pt] rounded-md bg-indigo-600 print:bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        {idx + 1}
                      </span>
                      <div className="space-y-1 print:space-y-0.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap no-print">
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                            {q.topic}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {q.source}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base print:text-[8pt] font-bold text-slate-900 dark:text-white leading-snug print:leading-tight">
                          {q.question}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 no-print">
                      {isSpeechSupported() && (
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(e, q)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            speakingId === q.id 
                              ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 animate-pulse' 
                              : 'text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                          title="Přečíst otázku nahlas"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                      <span className="text-slate-400 p-1">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>

                  <div className={`px-4 pb-4 pt-1 print:p-1.5 print:pt-0 border-t print:border-none border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900/80 space-y-3.5 print:space-y-1 text-xs sm:text-sm ${isExpanded ? 'block' : 'hidden print:block'}`}>
                    {/* Correct Answer Box */}
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs uppercase tracking-wider no-print">
                        Správná odpověď ke zkoušce:
                      </span>
                      <div className="p-3.5 print:p-1 bg-emerald-500/10 print:bg-transparent border border-emerald-500/20 print:border-none text-emerald-950 dark:text-emerald-300 print:text-slate-950 rounded-xl print:rounded-none font-semibold print:font-bold leading-relaxed print:leading-tight print:text-[8pt]">
                        <span className="hidden print:inline text-emerald-800 font-bold mr-1">✓</span>
                        {q.answer}
                      </div>
                    </div>

                    {/* Rationale & Source */}
                    <div className="bg-indigo-50/70 dark:bg-indigo-950/40 print:bg-transparent border border-indigo-200 dark:border-indigo-800 print:border-none rounded-xl print:rounded-none p-3.5 print:p-0 text-xs sm:text-sm space-y-1.5 print:space-y-0.5 text-slate-800 dark:text-slate-200 print:text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300 print:hidden">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Zákonné odůvodnění & Výklad VS ČR:</span>
                      </div>
                      <p className="leading-relaxed print:leading-tight print:text-[7.5pt] print:text-slate-600">{q.rationale}</p>
                      <div className="pt-1.5 print:pt-0 text-[11px] print:text-[7pt] text-indigo-700 dark:text-indigo-400 print:text-slate-500 font-medium">
                        <strong>Pramen:</strong> {q.source}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </motion.div>
      )}

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Nastavení Gemini API klíče</h3>
                <p className="text-xs text-slate-500">Klíč se uloží pouze do vašeho prohlížeče.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Pro analýzu zadání, fotek a generování odpovědí je vyžadován bezplatný klíč Google Gemini API. Získáte jej zdarma na{' '}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 underline font-semibold inline-flex items-center gap-0.5"
              >
                aistudio.google.com <ExternalLink className="w-3 h-3" />
              </a>.
            </p>

            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
              >
                Uložit klíč
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
