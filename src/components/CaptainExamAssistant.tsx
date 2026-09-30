import React, { useState, useRef, useEffect, useId } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Printer,
  Trash2,
  Key,
  ChevronRight,
  ChevronDown,
  Volume2,
  Square,
  SkipForward,
  SkipBack,
  ExternalLink,
  BookOpen,
  Plus,
  RotateCcw,
  Play
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
  SavedCustomExam,
  STORAGE_KEY_API_KEY
} from '../utils/geminiAnalyzer';
import { useDialog } from '../hooks/useDialog';
import { buildAppSources } from '../utils/aiSources';
import { readScoped, writeScoped } from '../utils/userScopedStorage';
import { NAV_TAB_LABELS } from '../data/navTabs';
import PrintHeader from './common/PrintHeader';
import ConfirmDialog from './common/ConfirmDialog';

/** Volba „čerpat i z nahraných materiálů“ — pamatuje se pro účet v zařízení. */
const STORAGE_KEY_INCLUDE_MATERIALS = 'vscr_ai_include_materials';

/** Největší přijímaná fotografie zadání; Gemini bere inline data jen do ~20 MB. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface CaptainExamAssistantProps {
  onStartCustomQuiz: (questions: Question[]) => void;
  onStartCustomFlashcards: (questions: Question[]) => void;
}

const SAMPLE_CAPTAIN_PROMPT = `Zadání od kapitána – otázky ze Služební přípravy a Práva:
1. Jaké jsou 3 základní podmínky pro použití zbraně dle § 18 zákona č. 555/1992 Sb.?
2. Jaký je rozdíl mezi krajní nouzí (§ 28 TZ) a nutnou obranou (§ 29 TZ) z hlediska subsidiarity?
3. Kdy je příslušník povinen po střelbě ihned vyrozumět státního zástupce?
4. Jaké donucovací prostředky nelze použít proti těhotné ženě s viditelným těhotenstvím?`;

/** „1 otázka / 2 otázky / 5 otázek“ — v utils sdílený helper není. */
function pocetOtazek(n: number): string {
  if (n === 1) return '1 otázka';
  if (n >= 2 && n <= 4) return `${n} otázky`;
  return `${n} otázek`;
}

/** Klíč zadaný uživatelem (bez záložního klíče z prostředí). */
function readUserApiKey(): string {
  const saved = readScoped<string>(STORAGE_KEY_API_KEY, '');
  return typeof saved === 'string' ? saved.trim() : '';
}

/** Ověří typ i velikost fotky; vrací text chyby, nebo null. */
function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Nahrajte prosím obrázek ve formátu JPG, PNG nebo WEBP.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `Fotka je příliš velká (${(file.size / 1024 / 1024).toFixed(1)} MB). Nejvíc ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`;
  }
  return null;
}

const SECONDARY_BUTTON =
  'flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold text-sm transition-colors cursor-pointer';

export default function CaptainExamAssistant({
  onStartCustomQuiz,
  onStartCustomFlashcards
}: CaptainExamAssistantProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const [apiKey, setApiKey] = useState<string>(() => getSavedApiKey());
  const [hasUserKey, setHasUserKey] = useState<boolean>(() => readUserApiKey() !== '');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [tempKey, setTempKey] = useState<string>('');
  const [keyError, setKeyError] = useState<string | null>(null);

  const closeKeyModal = () => {
    setShowKeyModal(false);
    setKeyError(null);
  };

  // Otevře modal vždy jen s klíčem, který zadal uživatel — klíč z prostředí
  // se do pole nepředvyplňuje, aby ho nešlo z formuláře vyčíst.
  const openKeyModal = () => {
    setTempKey(readUserApiKey());
    setKeyError(null);
    setShowKeyModal(true);
  };

  // Escape, past na fokus a jeho návrat — viz hooks/useDialog.
  const keyDialogRef = useDialog<HTMLDivElement>({
    isOpen: showKeyModal,
    onClose: closeKeyModal,
  });

  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [textInput, setTextInput] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [includeMaterials, setIncludeMaterials] = useState<boolean>(
    () => readScoped<boolean>(STORAGE_KEY_INCLUDE_MATERIALS, false) === true
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Připravuji…');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [analyzedResult, setAnalyzedResult] = useState<AnalyzedExamResponse | null>(null);
  /** Id uloženého zadání, které je právě zobrazené — kvůli smazání z obrazovky. */
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [savedExams, setSavedExams] = useState<SavedCustomExam[]>(() => getSavedCustomExams());
  const [examToDelete, setExamToDelete] = useState<SavedCustomExam | null>(null);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(0);
  const audioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * Generace přehrávání. `speechSynthesis.cancel()` vyvolá onerror → onEnd
   * asynchronně, takže po Stop / Další / Předchozí by starý callback ještě
   * naplánoval další otázku. Každé spuštění i zastavení generaci zvýší a
   * callback ze staré generace se ignoruje.
   */
  const speechGenRef = useRef<number>(0);
  /**
   * Časovače, které během analýzy přepínají text kroku. Musí se po skončení
   * zrušit: jinak po rychlé chybě (třeba neplatný klíč) doběhly až do dalšího
   * spuštění a přepsaly jeho krok zastaralým textem z toho předchozího.
   */
  const stepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearStepTimers = () => {
    stepTimersRef.current.forEach(clearTimeout);
    stepTimersRef.current = [];
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Náhled fotky: URL se uvolní při výměně i při odchodu ze záložky.
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  // Při odchodu ze záložky zmlkne předčítání a text kroku už nemá kdo číst.
  useEffect(() => () => {
    speechGenRef.current += 1;
    stopSpeaking();
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    stepTimersRef.current.forEach(clearTimeout);
  }, []);

  const handleSaveApiKey = () => {
    const trimmed = tempKey.trim();
    if (!trimmed) {
      setKeyError('Vložte klíč, nebo použijte „Odstranit klíč“.');
      return;
    }
    setSavedApiKey(trimmed);
    setApiKey(trimmed);
    setHasUserKey(true);
    closeKeyModal();
  };

  const handleRemoveApiKey = () => {
    setSavedApiKey('');
    setHasUserKey(false);
    setApiKey(getSavedApiKey());
    setTempKey('');
    closeKeyModal();
  };

  const acceptImageFile = (file: File) => {
    const problem = validateImageFile(file);
    if (problem) {
      setErrorMsg(problem);
      return;
    }
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setErrorMsg(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Vynulovat, aby šla stejná fotka vybrat znovu (onChange by se jinak nespustil).
    e.target.value = '';
    if (file) acceptImageFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) acceptImageFile(file);
  };

  const handleRunAnalysis = async () => {
    const key = apiKey || getSavedApiKey();
    if (!key) {
      openKeyModal();
      return;
    }

    if (inputMode === 'text' && (!textInput || textInput.trim() === '')) {
      setErrorMsg('Vložte prosím text zadání nebo otázky.');
      return;
    }

    if (inputMode === 'image' && !selectedImage) {
      setErrorMsg('Vyberte nebo vyfoťte prosím obrázek se zadáním.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(includeMaterials ? 'Načítám zdroje aplikace a materiály…' : 'Načítám zdroje aplikace…');

    try {
      const sources = await buildAppSources(includeMaterials);
      setLoadingStep(inputMode === 'image' ? 'Odesílám fotku zadání…' : 'Odesílám zadání…');

      clearStepTimers();
      stepTimersRef.current = [
        setTimeout(() => setLoadingStep('Čekám na odpověď modelu…'), 1500),
      ];

      const result = await analyzeExamContent(
        key,
        inputMode === 'text' ? textInput : undefined,
        inputMode === 'image' ? selectedImage || undefined : undefined,
        sources
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
      setActiveExamId(saved.id);
      setSavedExams(getSavedCustomExams());
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Chyba při zpracování zadání.');
    } finally {
      clearStepTimers();
      setIsLoading(false);
    }
  };

  const stopSequence = () => {
    speechGenRef.current += 1;
    setIsPlayingAll(false);
    setSpeakingId(null);
    stopSpeaking();
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
  };

  const handleOpenSavedExam = (exam: SavedCustomExam) => {
    stopSequence();
    setAnalyzedResult({
      title: exam.title,
      subject: exam.subject,
      summary: `Uložené zadání ze dne ${new Date(exam.createdAt).toLocaleDateString('cs-CZ')}`,
      questions: exam.questions
    });
    setActiveExamId(exam.id);
    setExpandedQuestionIds(new Set(exam.questions.map(q => q.id)));
  };

  const handleNewAssignment = () => {
    stopSequence();
    setAnalyzedResult(null);
    setActiveExamId(null);
    setExpandedQuestionIds(new Set());
    setErrorMsg(null);
  };

  const handleConfirmDelete = () => {
    if (!examToDelete) return;
    deleteCustomExam(examToDelete.id);
    setSavedExams(getSavedCustomExams());
    if (activeExamId === examToDelete.id) {
      handleNewAssignment();
    }
    setExamToDelete(null);
  };

  // Play a single question audio
  const handlePlayAudio = (q: Question) => {
    if (isPlayingAll) {
      stopSequence();
    }
    if (speakingId === q.id) {
      speechGenRef.current += 1;
      setSpeakingId(null);
      stopSpeaking();
      return;
    }
    const gen = ++speechGenRef.current;
    setSpeakingId(q.id);
    speakText(`Otázka: ${q.question}. Navržená odpověď: ${q.answer}. Odkaz: ${q.source}`, () => {
      if (gen !== speechGenRef.current) return;
      setSpeakingId(null);
    });
  };

  // Sequential Play All logic
  const playSequenceAt = (index: number, questions: Question[], gen: number) => {
    if (gen !== speechGenRef.current) return;
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

    const speechText = `Otázka číslo ${index + 1}: ${q.question}. Navržená odpověď: ${q.answer}. Odkaz: ${q.source}.`;

    speakText(speechText, () => {
      if (gen !== speechGenRef.current) return;
      audioTimerRef.current = setTimeout(() => {
        playSequenceAt(index + 1, questions, gen);
      }, 1200);
    });
  };

  const handleTogglePlayAll = () => {
    if (!analyzedResult || analyzedResult.questions.length === 0) return;

    if (isPlayingAll) {
      stopSequence();
    } else {
      const gen = ++speechGenRef.current;
      setIsPlayingAll(true);
      playSequenceAt(0, analyzedResult.questions, gen);
    }
  };

  const jumpSequenceTo = (index: number) => {
    if (!analyzedResult || !isPlayingAll) return;
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    const gen = ++speechGenRef.current;
    stopSpeaking();
    playSequenceAt(index, analyzedResult.questions, gen);
  };

  const handleNextAudio = () => {
    if (!analyzedResult) return;
    jumpSequenceTo(Math.min(analyzedResult.questions.length - 1, currentAudioIndex + 1));
  };

  const handlePrevAudio = () => {
    jumpSequenceTo(Math.max(0, currentAudioIndex - 1));
  };

  const toggleExpand = (id: string) => {
    setExpandedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const modeButtonClass = (active: boolean) =>
    `px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
      active
        ? 'bg-indigo-600 text-white'
        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
    }`;

  const keyButtonLabel = hasUserKey ? 'Vlastní API klíč' : apiKey ? 'API klíč aplikace' : 'Zadat API klíč';

  return (
    <div className="w-full flex flex-col space-y-5 pb-8 print:p-0 print:m-0 print:space-y-4">
      {/* Záhlaví — stejně klidné jako u ostatních záložek */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 no-print print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sparkles className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{NAV_TAB_LABELS.assistant}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Vyfoť nebo vlož zadání a nech si navrhnout odpovědi; výstup modelu je nutné ověřit.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openKeyModal}
            className={`${SECONDARY_BUTTON} shrink-0 self-start md:self-auto`}
            title="Nastavit Gemini API klíč"
          >
            <Key className="w-4 h-4" aria-hidden="true" />
            <span>{keyButtonLabel}</span>
          </button>
        </div>
      </div>

      {/* Upozornění, že výstup modelu není ověřený.
          Modul generuje citace paragrafů, takže bez tohohle textu vypadá jako
          autorita. Není: model si paragraf i lhůtu umí vymyslet. */}
      <div
        role="note"
        className="no-print flex items-start gap-3 rounded-2xl border border-amber-300 dark:border-amber-800/70 bg-amber-50 dark:bg-amber-950/30 px-4 py-3"
      >
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          <strong>Odpovědi generuje jazykový model a nikdo je neověřil.</strong> Čísla paragrafů,
          lhůty i výčty si model může vymyslet, i když zní přesvědčivě. Než se podle nich budete
          učit, porovnejte je se zněním předpisu v záložce <strong>{NAV_TAB_LABELS.compass}</strong> nebo na
          e-Sbírce. Výsledky testů z těchto otázek se počítají do vašich statistik — berte je
          jako procvičení formy, ne jako zdroj práva.
        </p>
      </div>

      {/* Main Grid: Input Form & Saved Tests */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-5 ${analyzedResult ? 'no-print' : ''}`}>
        {/* Left 2 Cols: Input Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5">
            {/* Přepínač režimu vstupu */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={inputMode === 'text'}
                onClick={() => setInputMode('text')}
                className={modeButtonClass(inputMode === 'text')}
              >
                <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Vložit text</span>
              </button>
              <button
                type="button"
                aria-pressed={inputMode === 'image'}
                onClick={() => setInputMode('image')}
                className={modeButtonClass(inputMode === 'image')}
              >
                <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Vyfotit nebo nahrát</span>
              </button>
            </div>

            {/* Text Mode */}
            {inputMode === 'text' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor={`${fieldIds}-zadani`}>
                    Otázky nebo zadání od učitele či kapitána
                  </label>
                  <button
                    type="button"
                    onClick={() => setTextInput(SAMPLE_CAPTAIN_PROMPT)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1 font-medium shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Vložit ukázkové zadání
                  </button>
                </div>
                <textarea
                  id={`${fieldIds}-zadani`}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Sem vložte otázky, zadání písemky nebo modelovou situaci…"
                  rows={7}
                  className="w-full p-4 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>
            )}

            {/* Image Mode */}
            {inputMode === 'image' && (
              <div className="space-y-4">
                {/* sr-only, ne hidden: display:none vyřadí pole ze stromu
                    přístupnosti i z pořadí tabulátoru, takže výběr fotky by
                    z klávesnice nešel vyvolat vůbec. */}
                <input
                  type="file"
                  id={`${fieldIds}-foto`}
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp"
                  aria-label="Fotka zadání"
                  className="sr-only"
                />

                {!selectedImage ? (
                  /* Zóna je <label> pole výše: klik otevře výběr fotky nativně,
                     bez obsluhy onClick a bez druhé zastávky tabulátoru.
                     Přetažení myší je navíc a klávesovou obdobu nemá, proto je
                     kontrola na té obsluze vypnutá adresně. */
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                  <label
                    htmlFor={`${fieldIds}-foto`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 space-y-3 block"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Klikněte pro vyfocení nebo výběr fotky zadání
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        JPG, PNG nebo WEBP do {MAX_IMAGE_BYTES / 1024 / 1024} MB, na mobilu i přímo z fotoaparátu
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 p-2 flex flex-col items-center">
                    <img
                      src={imagePreviewUrl || ''}
                      alt="Náhled zadání"
                      className="max-h-72 object-contain rounded-xl"
                    />
                    <div className="flex items-center gap-3 mt-3 w-full justify-between px-2">
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-xs">
                        {selectedImage.name} ({(selectedImage.size / 1024).toFixed(0)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`${SECONDARY_BUTTON} px-3 py-1.5 text-xs`}
                      >
                        Změnit fotku
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Zdroje odpovědí */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3.5 space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                <BookOpen className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-indigo-500" aria-hidden="true" />
                Model dostane jako podklad texty ze záložky {NAV_TAB_LABELS.compass} (články i registr předpisů)
                a má se držet jen jich. Co v nich nenajde, má označit jako nenalezené; přesto si výsledek ověřte.
              </p>
              <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMaterials}
                  onChange={(e) => {
                    setIncludeMaterials(e.target.checked);
                    writeScoped(STORAGE_KEY_INCLUDE_MATERIALS, e.target.checked);
                  }}
                  className="mt-0.5 w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <span>
                  Čerpat i z nahraných studijních materiálů (knihovna materiálů — PDF a obrázky)
                </span>
              </label>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div role="alert" className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRunAnalysis}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                  <span>Navrhnout odpovědi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Saved Custom Exams History */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              Moje uložená zadání ({savedExams.length})
            </h2>

            {savedExams.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                <p>Zatím nemáte žádná uložená zadání.</p>
                <p className="mt-1">Po vyhodnocení se zde automaticky uloží.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {savedExams.map((exam) => {
                  const isActive = activeExamId === exam.id;
                  return (
                    /* Otevření a smazání jsou dvě sourozenecká tlačítka —
                       tlačítko uvnitř prvku s role="button" odečítač nevidí. */
                    <div
                      key={exam.id}
                      className={`rounded-xl border bg-slate-50/50 dark:bg-slate-800/40 transition-colors flex items-stretch gap-1 ${
                        isActive
                          ? 'border-indigo-400 dark:border-indigo-600'
                          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenSavedExam(exam)}
                        aria-current={isActive ? 'true' : undefined}
                        className="flex-1 min-w-0 text-left p-3 rounded-l-xl cursor-pointer space-y-1"
                      >
                        <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                          {exam.title}
                        </span>
                        <span className="flex items-center gap-2 text-[0.625rem] text-slate-500 dark:text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium">
                            {exam.subject}
                          </span>
                          <span>{pocetOtazek(exam.questionCount)}</span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExamToDelete(exam)}
                        className="self-start m-2 text-slate-400 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                        aria-label={`Smazat zadání ${exam.title}`}
                        title="Smazat zadání"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
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
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 print:p-0 print:border-none"
        >
          {/* Tisková hlavička — subtext říká i na papíře, že jde o neověřený návrh. */}
          <PrintHeader
            subject={analyzedResult.subject}
            docTitle={analyzedResult.title}
            category={pocetOtazek(analyzedResult.questions.length)}
            subtext="Návrh odpovědí vygenerovaný modelem – neověřeno"
          />

          {/* Result Header & Action Bar */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 print:pb-3 print:mb-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1 print:hidden">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                Navrženo: {pocetOtazek(analyzedResult.questions.length)}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {analyzedResult.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed whitespace-pre-line">
                {analyzedResult.summary}
              </p>
            </div>

            {/* Actions: Audio / Print */}
            <div className="flex items-center gap-2 flex-wrap no-print shrink-0">
              {isSpeechSupported() && (
                <button
                  type="button"
                  onClick={handleTogglePlayAll}
                  aria-pressed={isPlayingAll}
                  className={SECONDARY_BUTTON}
                  title="Přečíst postupně všechny otázky a navržené odpovědi"
                >
                  {isPlayingAll ? (
                    <>
                      <Square className="w-4 h-4 fill-current" aria-hidden="true" />
                      <span>Zastavit čtení ({currentAudioIndex + 1}/{analyzedResult.questions.length})</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                      <span>Přehrát nahlas</span>
                    </>
                  )}
                </button>
              )}

              {/* Procvičení navržených otázek.
                  Props `onStartCustomQuiz` a `onStartCustomFlashcards` tu byly
                  od začátku, App.tsx je předávala a `handleStartCustomQuiz`
                  i `handleStartCustomFlashcards` fungovaly — jen k nim nikdy
                  nevzniklo tlačítko. */}
              <button
                type="button"
                onClick={() => {
                  stopSequence();
                  onStartCustomQuiz(analyzedResult.questions);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors cursor-pointer"
                title="Spustit cvičný test z těchto otázek"
              >
                <Play className="w-4 h-4" aria-hidden="true" />
                <span>Procvičit jako test</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSequence();
                  onStartCustomFlashcards(analyzedResult.questions);
                }}
                className={SECONDARY_BUTTON}
                title="Převést otázky na kartičky pro opakování"
              >
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                <span>Do kartiček</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className={SECONDARY_BUTTON}
                title="Vytisknout přehled otázek a navržených odpovědí (A4)"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Tisk</span>
              </button>

              <button
                type="button"
                onClick={handleNewAssignment}
                className={SECONDARY_BUTTON}
                title="Zavřít výsledek a začít s novým zadáním"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Nové zadání</span>
              </button>
            </div>
          </div>

          {/* Lišta postupného předčítání */}
          {isPlayingAll && (
            <div className="no-print p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Předčítání: otázka {currentAudioIndex + 1} z {analyzedResult.questions.length}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                    {analyzedResult.questions[currentAudioIndex]?.question}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevAudio}
                  disabled={currentAudioIndex === 0}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  aria-label="Předchozí otázka"
                  title="Předchozí otázka"
                >
                  <SkipBack className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={stopSequence}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Zastavit přehrávání"
                >
                  <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>Stop</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextAudio}
                  disabled={currentAudioIndex === analyzedResult.questions.length - 1}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  aria-label="Další otázka"
                  title="Další otázka"
                >
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Questions Accordion / Pocket Cheat Sheet Grid */}
          <div className="space-y-4 print:space-y-0">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 no-print">
              Otázky a navržené odpovědi
            </h3>

            <div className="space-y-3 print-questions-grid">
            {analyzedResult.questions.map((q, idx) => {
              const isExpanded = expandedQuestionIds.has(q.id);
              const isCurrentlyPlaying = isPlayingAll && currentAudioIndex === idx;

              return (
                <div
                  key={q.id}
                  className={`print-question-card border rounded-xl overflow-hidden transition-colors ${
                    isCurrentlyPlaying
                      ? 'border-indigo-500 ring-2 ring-indigo-400/60 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Rozbalení a předčítání jsou sourozenci — tlačítko uvnitř
                      role="button" odečítač nevidí. */}
                  <div className="flex items-start gap-2 p-4 print:p-1.5">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => toggleExpand(q.id)}
                      className="flex items-start gap-3 print:gap-1.5 flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <span className="w-6 h-6 print:w-4 print:h-4 print:text-[8pt] rounded-md bg-indigo-600 print:bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="space-y-1 print:space-y-0.5 flex-1 min-w-0 block">
                        <span className="flex items-center gap-2 flex-wrap no-print">
                          <span className="text-[0.6875rem] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                            {q.topic}
                          </span>
                          <span className="text-[0.6875rem] text-slate-500 dark:text-slate-400">
                            {q.source}
                          </span>
                        </span>
                        <span className="block text-sm sm:text-base print:text-[8pt] font-bold text-slate-900 dark:text-white leading-snug print:leading-tight">
                          {q.question}
                        </span>
                      </span>
                      <span className="text-slate-400 p-1 shrink-0 no-print" aria-hidden="true">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </span>
                    </button>

                    {isSpeechSupported() && (
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(q)}
                        aria-pressed={speakingId === q.id}
                        className={`no-print p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                          speakingId === q.id
                            ? 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50'
                            : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        aria-label={speakingId === q.id ? 'Zastavit předčítání otázky' : 'Přečíst otázku nahlas'}
                        title={speakingId === q.id ? 'Zastavit předčítání' : 'Přečíst otázku nahlas'}
                      >
                        <Volume2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <div className={`px-4 pb-4 pt-1 print:p-1.5 print:pt-0 border-t print:border-none border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900/80 space-y-3.5 print:space-y-1 text-sm ${isExpanded ? 'block' : 'hidden print:block'}`}>
                    {/* Navržená odpověď */}
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs no-print">
                        Navržená odpověď
                      </span>
                      <div className="print-correct-answer p-3.5 print:p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-300 rounded-xl print:rounded-md font-semibold print:font-bold leading-relaxed print:leading-tight print:text-[8pt] print:border-emerald-600 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400 print:hidden" aria-hidden="true" />
                        <span>{q.answer}</span>
                      </div>
                    </div>

                    {/* Rationale & Source */}
                    <div className="bg-indigo-50/70 dark:bg-indigo-950/40 print:bg-transparent border border-indigo-200 dark:border-indigo-800 print:border-none rounded-xl print:rounded-none p-3.5 print:p-0 text-sm space-y-1.5 print:space-y-0.5 text-slate-800 dark:text-slate-200 print:text-slate-700">
                      <div className="flex items-center gap-1.5 font-semibold text-indigo-900 dark:text-indigo-300 print:hidden">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                        <span>Odůvodnění navržené modelem (neověřeno)</span>
                      </div>
                      {q.rationale ? (
                        <p className="leading-relaxed print:leading-tight print:text-[7.5pt] print:text-slate-600">{q.rationale}</p>
                      ) : (
                        <p className="leading-relaxed italic text-slate-500 dark:text-slate-400">
                          Model k této otázce odůvodnění nedodal. Ověřte si odpověď v záložce {NAV_TAB_LABELS.compass}.
                        </p>
                      )}
                      <div className="pt-1.5 print:pt-0 text-[0.6875rem] print:text-[7pt] text-indigo-700 dark:text-indigo-400 print:text-slate-500 font-medium">
                        <strong>Pramen podle modelu:</strong>{' '}
                        {q.source || <span className="italic font-normal">neuveden — dohledejte si ho</span>}
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

      <ConfirmDialog
        isOpen={examToDelete !== null}
        tone="danger"
        title="Smazat uložené zadání?"
        description={
          <>
            Zadání <strong>{examToDelete?.title}</strong> ({examToDelete ? pocetOtazek(examToDelete.questionCount) : ''})
            se odstraní z tohoto prohlížeče. Vrátit to zpět nelze.
          </>
        }
        confirmLabel="Smazat zadání"
        onConfirm={handleConfirmDelete}
        onCancel={() => setExamToDelete(null)}
      />

      {/* API Key Modal */}
      {showKeyModal && (
        <div
          ref={keyDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${fieldIds}-key-modal-title`}
          tabIndex={-1}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Key className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 id={`${fieldIds}-key-modal-title`} className="font-bold text-base text-slate-900 dark:text-white">Gemini API klíč</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {hasUserKey
                    ? 'Používá se váš vlastní klíč z tohoto prohlížeče.'
                    : apiKey
                      ? 'Aplikace má nastavený společný klíč; vlastní ho v tomto prohlížeči nahradí.'
                      : 'Bez klíče asistent nefunguje.'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Klíč Google Gemini API získáte zdarma na{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 underline font-semibold inline-flex items-center gap-0.5"
              >
                aistudio.google.com <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>.
            </p>

            <input
              type="password"
              value={tempKey}
              onChange={(e) => {
                setTempKey(e.target.value);
                if (keyError) setKeyError(null);
              }}
              placeholder="AIzaSy..."
              aria-label="Gemini API klíč"
              aria-invalid={keyError ? true : undefined}
              aria-describedby={keyError ? `${fieldIds}-key-error` : undefined}
              autoComplete="off"
              className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {keyError && (
              <p id={`${fieldIds}-key-error`} role="alert" className="text-xs text-rose-600 dark:text-rose-400">
                {keyError}
              </p>
            )}
            <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 leading-snug">
              Vlastní klíč se ukládá jen v tomto prohlížeči (localStorage) a na server této aplikace se
              neposílá. Volání jdou přímo z prohlížeče na Google, takže klíč, zadání i fotka jdou jedině tam.
            </p>

            <div className="flex items-center justify-between gap-2.5 pt-2 flex-wrap">
              <div>
                {hasUserKey && (
                  <button
                    type="button"
                    onClick={handleRemoveApiKey}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    Odstranit klíč
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={closeKeyModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                >
                  Uložit klíč
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
