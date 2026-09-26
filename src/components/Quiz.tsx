import React, { useState, useEffect, useMemo, useRef, useId } from 'react';
import { BookOpen, Clock, Play, CheckCircle2, XCircle, Star, RotateCcw, Volume2, Award, Flag, Printer, ArrowRight, ArrowLeft, ShieldAlert, Sparkles, Cloud, Database, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, QuizSessionRecord, QuestionAttempt } from '../types';
import { normalizeSubject } from './SubjectsHub';
import { speakText, isSpeechSupported } from '../utils/speech';
import { getSubjectInfo } from '../data/questions/subjectsInfo';
import PrintHeader from './common/PrintHeader';
import ConfirmDialog from './common/ConfirmDialog';

interface QuizProps {
  questions: Question[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onSaveQuizResult?: (result: QuizSessionRecord) => void;
  onNavigateToBadges?: () => void;
  presetSubject?: string;
  /** Okruh (`Question.topic`), na který se má test zúžit — např. „Drilovat“ ve Statistikách. */
  presetTopic?: string;
  questionsSource?: 'supabase' | 'local';
}

type GameState = 'setup' | 'playing' | 'results';
type Confidence = 'know' | 'guess' | 'dont_know';

/** Počet otázek ostré zkoušky a její časový limit v minutách. */
const EXAM_QUESTION_COUNT = 50;
const EXAM_TIME_LIMIT_MINUTES = 45;

/**
 * Rovnoměrné promíchání (Fisher–Yates).
 *
 * `sort(() => Math.random() - 0.5)` rovnoměrnou permutaci nedává — výsledek
 * závisí na tom, jak řadicí algoritmus prvky porovnává, takže některá pořadí
 * vycházejí výrazně častěji. V aplikaci to bylo na pěti místech včetně skládání
 * ostré zkoušky.
 */
/** „1 předmět“, „3 předměty“, „9 předmětů“. */
function formatSubjectCount(count: number): string {
  if (count === 1) return '1 předmět';
  if (count >= 2 && count <= 4) return `${count} předměty`;
  return `${count} předmětů`;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Quiz({ 
  questions = [], 
  favorites = [], 
  toggleFavorite, 
  onSaveQuizResult,
  onNavigateToBadges,
  presetSubject,
  presetTopic,
  questionsSource = 'local'
}: QuizProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const [gameState, setGameState] = useState<GameState>('setup');
  
  // Setup state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['all']);
  /** Okruh, na který se test zužuje; null = celý předmět. Nastavuje ho jen předvolba z navigace. */
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isMistakesMode, setIsMistakesMode] = useState<boolean>(false);
  const [mistakeHistory, setMistakeHistory] = useState<Set<string>>(new Set());

  /**
   * Proč se test nespustil. Zobrazuje se v nastavení testu.
   *
   * Dřív to byl `alert()`: v PWA v režimu standalone systémové okno s názvem
   * domény, které blokuje vlákno a nedá se stylovat ani přeložit.
   */
  const [setupError, setSetupError] = useState<string | null>(null);

  /** Čeká se na potvrzení odevzdání ostré zkoušky. */
  const [confirmSubmitExam, setConfirmSubmitExam] = useState<boolean>(false);

  // Special State Exam Mode (50 questions, 45 min, komisionální zkouška ZOP A)
  const [isExamMode, setIsExamMode] = useState<boolean>(false);
  const [examStudentName, setExamStudentName] = useState<string>('Frekventant ZOP A');
  const [examGlobalTimeLeft, setExamGlobalTimeLeft] = useState<number>(EXAM_TIME_LIMIT_MINUTES * 60);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [reviewFilter, setReviewFilter] = useState<'mistakes' | 'all'>('mistakes');

  // Playing state
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [confidences, setConfidences] = useState<Record<string, Confidence>>({});
  const [currentConfidence, setCurrentConfidence] = useState<Confidence>('know');
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOptionsRevealed, setIsOptionsRevealed] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [timedOutMap, setTimedOutMap] = useState<Record<string, boolean>>({});

  const timerRef = useRef<number | null>(null);
  const examTimerRef = useRef<number | null>(null);

  // Ukazatel na vždy aktuální finishExam, aby ho odpočet mohl zavolat, aniž by ho
  // musel mít v závislostech. Jako závislost se nehodí: finishExam čte spoustu stavu
  // (otázky, odpovědi, jistoty, čas startu), takže by se odpočet zakládal znovu po
  // každé zodpovězené otázce. Nespraví to ani useCallback — onSaveQuizResult přichází
  // z App jako nememoizovaná funkce, takže by se identita měnila každý render.
  const finishExamRef = useRef<() => void>(() => {});
  
  const subjects = useMemo(
    () => Array.from(new Set((questions || []).map(q => q?.subject).filter((s): s is string => Boolean(s)))),
    [questions]
  );

  // Předvolba z navigace (Předměty, Statistiky). Okruh se nastavuje spolu
  // s předmětem: dřív se z tlačítek „Procvičit nejslabší okruh“ a „Drilovat“
  // do testu dostal jen předmět a okruh se cestou ztratil.
  useEffect(() => {
    if (presetSubject) {
      setSelectedSubjects([presetSubject]);
      setSelectedTopic(presetTopic ?? null);
    }
  }, [presetSubject, presetTopic]);

  // Výběr předmětu je jednoduchý <select>, takže volba nahrazuje předchozí.
  // Dřív ho obsluhoval přepínač pro vícenásobný výběr: každá volba se přičítala
  // k předchozím, select přitom ukazoval jen první předmět a test se tiše skládal
  // ze všech dosud zvolených — a ukládal jako „Kombinace předmětů“.
  const handleSubjectSelect = (subject: string) => {
    // Okruh patří k předmětu z předvolby; jiná volba předmětu ho ruší.
    setSelectedTopic(null);
    setSelectedSubjects([subject || 'all']);
  };

  const shuffleQuestionOptions = (q: Question): Question => {
    const targetIdx = typeof q.correctOption === 'number' ? q.correctOption : q.correct_index;
    if (!q.options || q.options.length <= 1 || targetIdx === undefined) return q;
    const indexed = q.options.map((opt, idx) => ({ opt, isCorrect: idx === targetIdx }));
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    const newOptions = indexed.map(item => item.opt);
    const newCorrectOption = indexed.findIndex(item => item.isCorrect);
    const finalIdx = newCorrectOption >= 0 ? newCorrectOption : 0;
    return {
      ...q,
      options: newOptions,
      correctOption: finalIdx,
      correct_index: finalIdx,
    };
  };

  const startExamMode = () => {
    setSetupError(null);

    // Zkouška se skládá poměrně ze všech předmětů, které banka obsahuje.
    const uniqueSubjects = Array.from(
      new Set((questions || []).map(q => q?.subject).filter((s): s is string => Boolean(s)))
    );
    const usable = (questions || []).filter(q => q?.options && q.options.length > 0);

    const picked: Question[] = [];
    const perSubjectTarget = Math.max(1, Math.floor(EXAM_QUESTION_COUNT / (uniqueSubjects.length || 1)));

    uniqueSubjects.forEach((subName) => {
      const subQuestions = usable.filter(q => q?.subject === subName);
      picked.push(...shuffleArray(subQuestions).slice(0, perSubjectTarget));
    });

    // Doplnění na cílový počet z toho, co ještě nebylo vybráno.
    if (picked.length < EXAM_QUESTION_COUNT) {
      const used = new Set(picked.map(q => q.id));
      const remaining = usable.filter(q => !used.has(q.id));
      picked.push(...shuffleArray(remaining).slice(0, EXAM_QUESTION_COUNT - picked.length));
    }

    // Strop na cílový počet.
    //
    // Dřív tu žádný nebyl: `Math.max(2, floor(50 / početPředmětů))` dá při více
    // než 25 předmětech dvě otázky na předmět, tedy přes 50 dohromady — a
    // „zkouška na 50 otázek / 45 minut“ jich měla víc. Lektor smí předměty
    // zakládat, takže to nebyl jen teoretický stav.
    const examSelected = shuffleArray(picked).slice(0, EXAM_QUESTION_COUNT);

    if (examSelected.length === 0) {
      setSetupError('V bance nejsou žádné testové otázky s možnostmi, ze kterých by šlo zkoušku složit. Zkuste to prosím po obnovení připojení nebo se obraťte na lektora.');
      return;
    }

    // Pořadí už je promíchané výše; zbývá promíchat možnosti u každé otázky.
    const randomizedExam = examSelected.map(q => shuffleQuestionOptions(q));

    setIsExamMode(true);
    setQuizQuestions(randomizedExam);
    setCurrentIndex(0);
    setAnswers({});
    setConfidences({});
    setFlaggedQuestions(new Set());
    setIsAnswered(false);
    setIsOptionsRevealed(true);
    setIsTimedOut(false);
    setTimedOutMap({});
    setGameState('playing');
    setQuizStartTime(Date.now());
    setExamGlobalTimeLeft(EXAM_TIME_LIMIT_MINUTES * 60);
  };

  const startQuiz = () => {
    setSetupError(null);
    setIsExamMode(false);
    let pool = questions || [];
    
    if (isMistakesMode) {
      pool = (questions || []).filter(q => q?.id && mistakeHistory.has(q.id));
      if (pool.length === 0) {
        setSetupError('V téhle session nemáte zaznamenanou žádnou chybu k procvičení. Odpovězte nejdřív na několik otázek ve cvičném testu.');
        return;
      }
    } else {
      if (!selectedSubjects.includes('all')) {
        const normSelected = selectedSubjects.map(s => normalizeSubject(s));
        pool = pool.filter(q => q?.subject && (selectedSubjects.includes(q.subject) || normSelected.includes(normalizeSubject(q.subject))));
      }
      // Okruh zužuje předmět jen tehdy, když v něm nějaké otázky jsou. Statistiky
      // nabízejí okruhy z historie, a ten mohl mezitím z banky zmizet nebo být
      // přejmenován — pak je lepší procvičit celý předmět než skončit chybou.
      if (selectedTopic) {
        const topicPool = pool.filter(q => (q?.topic || 'Základní okruh') === selectedTopic);
        if (topicPool.some(q => q?.options && q.options.length > 0)) pool = topicPool;
      }
    }
    
    pool = pool.filter(q => q?.options && q.options.length > 0 && (q.correctOption !== undefined || q.correct_index !== undefined));
    
    // Pořadí se míchá Fisher–Yatesem, ne `sort` s náhodným komparátorem.
    //
    // Dřív o zamíchání rozhodoval stav `isRandomOrder`, ke kterému ale nikdy
    // nevznikl žádný přepínač — byl natrvalo `true`. Míchá se tedy vždy, což je
    // i jediné správné chování pro zkoušku: banka je uložená po předmětech,
    // takže bez zamíchání by test šel tematicky po sobě.
    const finalQuestions = shuffleArray(pool);
    
    const selected = finalQuestions
      .slice(0, questionCount === 0 ? pool.length : Math.min(questionCount, pool.length))
      .map(q => shuffleQuestionOptions(q));
    
    if (selected.length === 0) {
      setSetupError('Pro zvolený výběr předmětů nejsou k dispozici žádné testové otázky. Vyberte prosím jiný předmět nebo zvolte „Všechny předměty“.');
      return;
    }
    
    setQuizQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setConfidences({});
    setCurrentConfidence('know');
    setIsAnswered(false);
    setIsOptionsRevealed(false);
    setIsTimedOut(false);
    setTimedOutMap({});
    setGameState('playing');
    setQuizStartTime(Date.now());
    if (timeLimit) {
      setTimeLeft(timeLimit);
    } else {
      setTimeLeft(null);
    }
  };

  // Odpočet 45 minut u závěrečné zkoušky — jen tiká.
  //
  // Interval se zakládá jednou na začátku zkoušky. Dřív měl v závislostech
  // examGlobalTimeLeft, takže se každou vteřinu rušil a zakládal znovu, pokaždé
  // znovu od plné vteřiny; za 45 minut se ta prodleva nasčítala. Updater si vystačí
  // s předchozí hodnotou, takže stav v závislostech vůbec být nemusí.
  useEffect(() => {
    if (gameState !== 'playing' || !isExamMode) return;

    const id = window.setInterval(() => {
      setExamGlobalTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    examTimerRef.current = id;

    return () => {
      clearInterval(id);
      examTimerRef.current = null;
    };
  }, [gameState, isExamMode]);

  // Vypršení času je schválně oddělené od tikání.
  //
  // Dřív se finishExam() volalo přímo uvnitř updateru setExamGlobalTimeLeft. Updater
  // ale musí být čistá funkce a StrictMode ho ve vývojovém režimu spouští dvakrát,
  // takže se zkouška uzavřela a uložila dvakrát. Změřeno na samostatném pokusu:
  // vývojový build se StrictMode 2 volání, bez StrictMode 1, produkční build 1 —
  // šlo tedy o vadu viditelnou jen ve vývoji, ne u uživatelů.
  useEffect(() => {
    if (gameState === 'playing' && isExamMode && examGlobalTimeLeft === 0) {
      finishExamRef.current();
    }
  }, [gameState, isExamMode, examGlobalTimeLeft]);

  // Question timer logic (in practice mode)
  useEffect(() => {
    if (!isExamMode && gameState === 'playing' && !isAnswered && isOptionsRevealed && timeLimit !== null && timeLeft !== null && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (!isExamMode && gameState === 'playing' && isOptionsRevealed && timeLimit !== null && timeLeft === 0 && !isAnswered && !isTimedOut) {
      // Time limit expired: do NOT auto-answer.
      // Flag current question as timed out; options remain active for user to choose.
      setIsTimedOut(true);
      const currentQ = quizQuestions[currentIndex];
      if (currentQ?.id) {
        setTimedOutMap(prev => ({ ...prev, [currentQ.id]: true }));
      }
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, isAnswered, isOptionsRevealed, timeLeft, timeLimit, isExamMode, isTimedOut, currentIndex, quizQuestions]);

  const handleAnswer = (optionIndex: number) => {
    if (isExamMode) {
      // In exam mode, selection is recorded and can be changed before submitting
      setAnswers(prev => ({ ...prev, [quizQuestions[currentIndex].id]: optionIndex }));
      return;
    }

    if (isAnswered) return;
    
    if (optionIndex !== -1 && typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    const currentQ = quizQuestions[currentIndex];
    const currentQId = currentQ.id;
    const answeredAfterTimeout = Boolean(isTimedOut || (timeLimit !== null && timeLeft === 0) || timedOutMap[currentQId]);
    
    setIsAnswered(true);
    setAnswers(prev => ({ ...prev, [currentQId]: optionIndex }));
    setConfidences(prev => ({ ...prev, [currentQId]: currentConfidence }));
    setTimedOutMap(prev => ({ ...prev, [currentQId]: answeredAfterTimeout }));
    
    const isCorrect = optionIndex === currentQ.correctOption;
    
    if (!isCorrect) {
      setMistakeHistory(prev => {
        const next = new Set(prev);
        next.add(currentQId);
        return next;
      });
    } else {
      setMistakeHistory(prev => {
        const next = new Set(prev);
        next.delete(currentQId);
        return next;
      });
    }

    // POZN.: tady se dřív vedl běžící součet správných a chybných odpovědí
    // (`sessionStats`) včetně historie úspěšnosti po otázkách. Nikdy se nikde
    // nečetl — úspěšnost počítá výsledková obrazovka z `attempts` a graf
    // vývoje je v záložce Statistiky. Odstraněno, ať se nepočítá pro nic.

    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const finishExam = () => {
    if (examTimerRef.current) clearInterval(examTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const finishedAttempts: QuestionAttempt[] = quizQuestions.map(q => {
      const selected = answers[q.id] !== undefined ? answers[q.id] : -1;
      const isCorrect = selected === q.correctOption;
      const wasTimedOut = Boolean(timedOutMap[q.id]);
      return {
        questionId: q.id,
        questionText: q.question,
        subject: q.subject,
        topic: q.topic,
        isCorrect,
        selectedOption: selected,
        correctOption: q.correctOption ?? 0,
        // Text odpovědi je to jediné, podle čeho umí test vyhodnotit server:
        // `selected` je index do pole promíchaného v shuffleQuestionOptions(),
        // takže mimo tenhle prohlížeč nic neznamená. Prázdný řetězec znamená
        // „nevybráno" a server ho vyhodnotí jako chybu — stejně jako klient níže.
        selectedText: selected >= 0 ? (q.options?.[selected] ?? '') : '',
        // Jistota se zaznamená jen tam, kde se na ni aplikace opravdu zeptala,
        // tedy ve cvičném režimu.
        //
        // Dřív se chybějící hodnota doplnila na 'know'. V ostré zkoušce se ale
        // paleta jistoty nezobrazuje vůbec, takže 50otázková zkouška přispěla
        // do grafu 50 odpověďmi „vím“ — a KAŽDÁ chyba ve zkoušce se vykázala
        // jako „falešná jistota“. Nevyplněná jistota teď zůstane nevyplněná
        // a statistika takové pokusy do rozpadu jistoty nepočítá.
        confidence: confidences[q.id],
        timedOut: wasTimedOut
      };
    });

    const correctCount = finishedAttempts.filter(a => a.isCorrect).length;
    const totalCount = finishedAttempts.length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const timeSpent = Math.max(1, Math.round((Date.now() - quizStartTime) / 1000));
    const correctInLimit = finishedAttempts.filter(a => a.isCorrect && !a.timedOut).length;
    const correctAfterLimit = finishedAttempts.filter(a => a.isCorrect && a.timedOut).length;

    const recordedSubject = isExamMode 
      ? 'Závěrečná zkouška ZOP A' 
      : (selectedSubjects.length === 1 ? selectedSubjects[0] : (selectedSubjects.length > 1 ? 'Kombinace předmětů' : 'all'));

    const sessionRecord: QuizSessionRecord = {
      id: `${isExamMode ? 'exam' : 'quiz'}-${Date.now()}`,
      timestamp: Date.now(),
      dateFormatted: 'Dnes ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subject: recordedSubject,
      totalQuestions: totalCount,
      correctAnswers: correctCount,
      accuracy,
      timeSpentSeconds: timeSpent,
      attempts: finishedAttempts,
      correctInLimit,
      correctAfterLimit
    };

    if (onSaveQuizResult) {
      onSaveQuizResult(sessionRecord);
    }

    setGameState('results');
  };

  // Ref se přepisuje v efektu, ne při renderu — zápis do refu během renderu React
  // zakazuje. Efekt bez pole závislostí běží po každém renderu, tedy vždycky dřív,
  // než stihne tiknout interval odpočtu.
  useEffect(() => {
    finishExamRef.current = finishExam;
  });

  const nextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setCurrentConfidence('know');
      setIsOptionsRevealed(isExamMode ? true : false);
      setIsTimedOut(false);
      if (timeLimit) setTimeLeft(timeLimit);
    } else {
      finishExam();
    }
  };

  const handleSpeakQuestion = () => {
    const q = quizQuestions[currentIndex];
    if (!q) return;
    const text = `Otázka: ${q.question}. Možnosti: ` + (q.options?.map((opt, i) => `Možnost ${String.fromCharCode(65 + i)}: ${opt}`).join('. ') || '');
    setIsSpeaking(true);
    speakText(text, () => setIsSpeaking(false));
  };

  const getOptionLetter = (idx: number) => String.fromCharCode(65 + idx);

  const formatExamTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const renderAside = () => {
    if (isExamMode && gameState === 'playing') {
      const answeredCount = Object.keys(answers).length;
      return (
        <aside className="w-full md:w-72 flex flex-col gap-4 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Zkušební paleta
              </span>
              <span className="text-xs font-bold text-slate-500">
                {answeredCount} / {quizQuestions.length}
              </span>
            </div>

            {/* Questions 1..50 Grid */}
            <div className="grid grid-cols-5 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {quizQuestions.map((q, idx) => {
                const isSelected = idx === currentIndex;
                const isAnsweredQ = answers[q.id] !== undefined;
                const isFlagged = flaggedQuestions.has(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 rounded text-xs font-bold transition-all relative flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                        : isAnsweredQ
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white dark:border-slate-900"></span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900 border border-emerald-400"></span>
                <span>Zodpovězeno</span>
                <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 ml-2"></span>
                <span>Nevyplněno</span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmSubmitExam(true)}
                className="w-full mt-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Odevzdat zkoušku ZOP A</span>
              </button>
            </div>
          </div>
        </aside>
      );
    }

    return (
      <aside className={`w-full md:w-72 flex-col gap-5 shrink-0 pb-8 md:pb-0 ${gameState === 'playing' ? 'hidden md:flex' : 'flex'}`}>
        {/* Exam Mode Banner CTA */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-xl shadow-md p-4 border border-blue-400/30">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Zkouškový standard</span>
          </div>
          <h4 className="font-bold text-sm mb-1.5">Ostrá zkouška ZOP A</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            Komisionální simulace: {EXAM_QUESTION_COUNT} otázek poměrně ze všech předmětů v bance, limit {EXAM_TIME_LIMIT_MINUTES} min, závěrečný protokol.
          </p>
          <button
            onClick={startExamMode}
            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Spustit ostrou zkoušku (50 ot.)</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            Vlastní tréninkový test
          </h3>
          <div className="space-y-4">
            {questions.length > 0 && questions[0]?.id?.startsWith('custom-q') && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Načteno zadání od kapitána ({questions.length} otázek)</span>
              </div>
            )}
            {mistakeHistory.size > 0 && (
              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isMistakesMode ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                <div>
                  <span className={`block text-xs font-bold ${isMistakesMode ? 'text-orange-700 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'}`}>Procvičování chyb</span>
                  <span className="block text-[10px] text-slate-500">Otázek k opravě: {mistakeHistory.size}</span>
                </div>
                <div className={`w-8 h-5 rounded-full p-0.5 transition-colors ${isMistakesMode ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${isMistakesMode ? 'translate-x-3' : 'translate-x-0'}`}></div>
                </div>
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={isMistakesMode}
                  onChange={(e) => setIsMistakesMode(e.target.checked)}
                  disabled={gameState === 'playing'}
                />
              </label>
            )}

            <div className={isMistakesMode ? 'opacity-50 pointer-events-none' : ''}>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5" htmlFor={`${fieldIds}-0`}>Předmět</label>
              <select
                id={`${fieldIds}-0`} 
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200"
                value={selectedSubjects[0]}
                onChange={(e) => handleSubjectSelect(e.target.value)}
                disabled={gameState === 'playing'}
              >
                <option value="all">Všechny předměty (Souhrnný test)</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{getSubjectInfo(subject).name}</option>
                ))}
              </select>
              {selectedTopic && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1.5 text-[11px] text-blue-800 dark:text-blue-200">
                  <span className="min-w-0 truncate">Okruh: <strong>{selectedTopic}</strong></span>
                  <button
                    type="button"
                    onClick={() => setSelectedTopic(null)}
                    disabled={gameState === 'playing'}
                    className="shrink-0 font-semibold underline hover:no-underline cursor-pointer"
                  >
                    Celý předmět
                  </button>
                </div>
              )}
            </div>

            <div className={isMistakesMode ? 'opacity-50 pointer-events-none' : ''}>
              {/* Popisuje skupinu voleb, ne jedno pole. */}
              <span id={`${fieldIds}-limit`} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Časový limit na otázku
              </span>
              <div className="grid grid-cols-2 gap-1.5" role="group" aria-labelledby={`${fieldIds}-limit`}>
                {[
                  { label: 'Bez limitu', value: null },
                  { label: '30 s', value: 30 },
                  { label: '15 s', value: 15 },
                  { label: '5 s', value: 5 }
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setTimeLimit(opt.value)}
                    disabled={gameState === 'playing'}
                    className={`p-1.5 text-xs border rounded-lg font-medium transition-colors ${
                      timeLimit === opt.value 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={isMistakesMode ? 'opacity-50 pointer-events-none' : ''}>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5" htmlFor={`${fieldIds}-1`}>
                Počet otázek: {questionCount}
              </label>
              <input
                id={`${fieldIds}-1`} 
                type="range" 
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" 
                min="5" 
                max="50" 
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                disabled={gameState === 'playing'}
              />
            </div>

            <button
              onClick={startQuiz}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Spustit cvičný test ({questionCount} ot.)</span>
            </button>
          </div>
        </div>
      </aside>
    );
  };

  const renderSection = () => {
    if (gameState === 'setup') {
      return (
        <motion.section 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex flex-1 flex-col gap-6 h-full"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full items-center justify-center p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-xs">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Příprava na závěrečnou zkoušku ZOP A
            </h2>
            <div className="mb-4">
              {questionsSource === 'supabase' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Cloud className="w-3.5 h-3.5" />
                  Banka otázek: Supabase Cloud ({questions.length} otázek)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <Database className="w-3.5 h-3.5" />
                  Banka otázek: Lokální záloha ({questions.length} otázek)
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed mb-6">
              Vyberte si režim: buď <strong>Ostrou závěrečnou zkoušku</strong> (50 otázek, 45 minut, generování protokolu) nebo <strong>Cvičný kvíz</strong> pro jednotlivé předměty.
              {' '}Parametry ostré zkoušky jsou <strong>nastavení této aplikace</strong>, ne citace zkušebního řádu — ověřte si je u svého lektora.
            </p>

            {setupError && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200 max-w-lg"
              >
                <ShieldAlert className="w-4 h-4 mt-px shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{setupError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={startExamMode}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Ostrá zkouška (50 otázek, 45 min)</span>
              </button>
              <button
                type="button"
                onClick={startQuiz}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Cvičný test podle filtrů</span>
              </button>
            </div>
          </div>
        </motion.section>
      );
    }

    if (gameState === 'results') {
      const correctCount = quizQuestions.filter(q => answers[q.id] === q.correctOption).length;
      const totalCount = quizQuestions.length;
      const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      const correctInLimit = quizQuestions.filter(q => answers[q.id] === q.correctOption && !timedOutMap[q.id]).length;
      const correctAfterLimit = quizQuestions.filter(q => answers[q.id] === q.correctOption && Boolean(timedOutMap[q.id])).length;
      const totalTimedOut = quizQuestions.filter(q => Boolean(timedOutMap[q.id])).length;
      
      let gradeLabel = 'Neprospěl';
      let gradeColor = 'text-rose-600 dark:text-rose-400';
      if (percentage >= 90) {
        gradeLabel = 'Výborně (Prospěl s vyznamenáním)';
        gradeColor = 'text-emerald-600 dark:text-emerald-400';
      } else if (percentage >= 75) {
        gradeLabel = 'Velmi dobře (Prospěl)';
        gradeColor = 'text-blue-600 dark:text-blue-400';
      } else if (percentage >= 60) {
        gradeLabel = 'Dobře (Prospěl)';
        gradeColor = 'text-amber-600 dark:text-amber-400';
      }

      // Per-subject breakdown
      const subjectBreakdown: Record<string, { total: number; correct: number }> = {};
      quizQuestions.forEach(q => {
        if (!subjectBreakdown[q.subject]) {
          subjectBreakdown[q.subject] = { total: 0, correct: 0 };
        }
        subjectBreakdown[q.subject].total += 1;
        if (answers[q.id] === q.correctOption) {
          subjectBreakdown[q.subject].correct += 1;
        }
      });

      return (
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col gap-6 h-full overflow-hidden"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full p-6 sm:p-8 overflow-y-auto">
            
            {/* Exam Header (Screen only) */}
            <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800 no-print">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Protokol o testu ZOP A</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Hodnocení zkouškového testu
              </h2>
              <div className="text-5xl sm:text-6xl font-black my-4 text-blue-600 dark:text-blue-400">
                {percentage} %
              </div>
              <div className={`text-lg sm:text-xl font-bold ${gradeColor}`}>
                {gradeLabel}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Správně zodpovězeno {correctCount} z {totalCount} otázek
              </p>

              {/* In-limit vs after-limit statistics */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3.5 no-print">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Správně v limitu: <strong className="font-bold">{correctInLimit}</strong></span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Správně po limitu: <strong className="font-bold">{correctAfterLimit}</strong></span>
                </div>
                {totalTimedOut > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Celkem po limitu: <strong className="font-bold">{totalTimedOut}</strong> z {totalCount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* XP Award & Progress Banner (Screen only) */}
            {(() => {
              let earnedXp = (correctCount * 15) + 50;
              if (percentage === 100 && totalCount >= 5) earnedXp += 100;
              else if (percentage >= 80 && totalCount >= 5) earnedXp += 50;

              return (
                <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-blue-500/10 border border-amber-400/30 dark:border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm shrink-0">
                      <Sparkles className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Získané zkušenosti (XP)
                      </div>
                      <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                        +{earnedXp} XP do hodnostního postupu VS ČR
                      </div>
                    </div>
                  </div>

                  {onNavigateToBadges && (
                    <button
                      onClick={onNavigateToBadges}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Zkontrolovat odznaky</span>
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Personalization for Protocol (Screen only) */}
            <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">Jméno na protokolu:</span>
                <input
                  type="text"
                  value={examStudentName}
                  onChange={(e) => setExamStudentName(e.target.value)}
                  placeholder="Frekventant ZOP A (Jméno Příjmení)"
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              <span className="text-[11px] text-slate-400">
                Datum zkoušky: {new Date().toLocaleDateString('cs-CZ')}
              </span>
            </div>

            {/* Subject Breakdown Table (Screen only) */}
            <div className="my-6 no-print">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                {/* Počet se bere z testu, ne natvrdo: předměty v bance přibývají i mizí. */}
                Výsledky podle jednotlivých předmětů ({formatSubjectCount(Object.keys(subjectBreakdown).length)}):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(subjectBreakdown).map(([sub, stats]) => {
                  const subPct = Math.round((stats.correct / stats.total) * 100);
                  const isPass = subPct >= 60;
                  return (
                    <div key={sub} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{sub}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {stats.correct} z {stats.total} správně
                        </span>
                      </div>
                      <span className={`text-sm font-black px-2 py-1 rounded-md ${
                        isPass 
                           ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                           : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}>
                        {subPct} %
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Printable Certificate (Visible during print) */}
            <div className="hidden print:block my-4 p-6 border-2 border-slate-900 text-slate-900 bg-white print-card print-avoid-break">
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <h1 className="text-base font-bold uppercase tracking-widest text-slate-950">Generální ředitelství Vězeňské služby ČR</h1>
                <h2 className="text-sm font-extrabold uppercase mt-1 text-slate-800">Akademie Vězeňské služby • Stráž pod Ralskem</h2>
                <h3 className="text-sm font-black mt-2 underline uppercase">PROTOKOL O VYKONÁNÍ ZÁVĚREČNÉ ZKOUŠKY ZOP A</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div><strong>Frekventant:</strong> {examStudentName || 'Frekventant ZOP A'}</div>
                <div><strong>Datum a čas konání:</strong> {new Date().toLocaleString('cs-CZ')}</div>
                <div><strong>Typ zkoušky:</strong> Komisionální písemný test ZOP A</div>
                <div><strong>Dosažené skóre:</strong> {correctCount} / {totalCount} ({percentage} %)</div>
                <div><strong>Celkový výsledek:</strong> <span className="font-extrabold">{gradeLabel}</span></div>
                <div><strong>Časový limit:</strong> 45 minut</div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold text-xs border-b border-slate-900 pb-1 mb-2">Rozpad hodnocení podle předmětů ZOP A:</h4>
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-400">
                      <th className="py-1">Předmět</th>
                      <th className="py-1 text-center">Správně</th>
                      <th className="py-1 text-center">Celkem</th>
                      <th className="py-1 text-right">Úspěšnost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(subjectBreakdown).map(([sub, stats]) => (
                      <tr key={sub} className="border-b border-slate-200">
                        <td className="py-1 font-medium">{sub}</td>
                        <td className="py-1 text-center">{stats.correct}</td>
                        <td className="py-1 text-center">{stats.total}</td>
                        <td className="py-1 text-right font-bold">{Math.round((stats.correct / stats.total) * 100)} %</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-4 grid grid-cols-3 gap-6 text-center text-[11px]">
                <div className="border-t border-slate-800 pt-1">
                  <span>Předseda zkušební komise</span>
                </div>
                <div className="border-t border-slate-800 pt-1">
                  <span>Člen pro právní přípravu</span>
                </div>
                <div className="border-t border-slate-800 pt-1">
                  <span>Člen pro bezpečnostní službu</span>
                </div>
              </div>
            </div>

            {/* Action buttons (Screen only) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 no-print">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  title="Vytisknout zkušební protokol a rozbor otázek ve formátu A4"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>Vytisknout / PDF protokol</span>
                </button>

                {percentage < 100 && (
                  <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setReviewFilter('mistakes')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        reviewFilter === 'mistakes'
                          ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Jen chyby ({quizQuestions.filter(q => answers[q.id] !== q.correctOption).length})
                    </button>
                    <button
                      onClick={() => setReviewFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        reviewFilter === 'all'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Všechny otázky ({quizQuestions.length})
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setGameState('setup')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nový test / Zkouška</span>
              </button>
            </div>

            {/* Questions Review & Analysis Section */}
            {(() => {
              const wrongQuestions = quizQuestions.filter(q => answers[q.id] !== q.correctOption);
              const questionsToDisplay = reviewFilter === 'mistakes' && wrongQuestions.length > 0 ? wrongQuestions : quizQuestions;

              if (questionsToDisplay.length === 0) return null;

              return (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 print:mt-4 print:pt-4">
                  <div className="hidden print:block mb-4">
                    <PrintHeader
                      subject={`Protokol o zkoušce ZOP A – ${reviewFilter === 'all' || wrongQuestions.length === 0 ? 'Přehled všech testových otázek' : 'Rozbor chybných odpovědí'}`}
                      docTitle="Detailní přehled testových otázek, variant A–D a zákonných pramenů"
                    />
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center justify-between no-print">
                    <span>
                      {reviewFilter === 'mistakes' && wrongQuestions.length > 0 
                        ? `Rozbor chybných odpovědí (${wrongQuestions.length}):` 
                        : `Přehled všech testových otázek (${quizQuestions.length}):`}
                    </span>
                  </h3>

                  <div className="space-y-4">
                    {questionsToDisplay.map((q, index) => {
                      const isWrong = answers[q.id] !== q.correctOption;
                      const studentAnswerIdx = answers[q.id];

                      return (
                        <div 
                          key={q.id} 
                          className={`p-5 rounded-xl border print-card print-avoid-break ${
                            isWrong 
                              ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 print:border-slate-300' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 print:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 print:text-slate-700">
                              {q.subject}{q.topic ? ` • ${q.topic}` : ''}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                isWrong 
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 print:bg-rose-50 print:text-rose-900 print:border print:border-rose-300' 
                                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 print:bg-emerald-50 print:text-emerald-900 print:border print:border-emerald-400'
                              }`}>
                                {isWrong ? 'Chybná odpověď' : 'Správně zodpovězeno'}
                              </span>
                              {timedOutMap[q.id] ? (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1 print:bg-amber-50 print:text-amber-900 print:border-amber-300">
                                  <Clock className="w-3 h-3" />
                                  Po limitu (nestihnuto)
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1 print:bg-slate-50 print:text-slate-700 print:border-slate-300">
                                  <CheckCircle2 className="w-3 h-3" />
                                  V limitu
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-3">
                            {index + 1}. {q.question}
                          </p>

                          {/* Options A-D with correct option marked ✓ in bold */}
                          {q.options && q.options.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                              {q.options.map((opt, optIdx) => {
                                const isCorrect = optIdx === q.correctOption;
                                const isUserPick = studentAnswerIdx === optIdx;

                                let optClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                                if (isCorrect) {
                                  optClass = 'print-correct-answer bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-bold print:border-emerald-600';
                                } else if (isUserPick && !isCorrect) {
                                  optClass = 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300 print:text-rose-900 line-through print:bg-rose-50/50 print:border-rose-300';
                                }

                                return (
                                  <div key={optIdx} className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${optClass}`}>
                                    <span className="font-bold min-w-[20px]">{String.fromCharCode(65 + optIdx)})</span>
                                    <span className="flex-1">{opt}</span>
                                    {isCorrect && (
                                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400 print:text-emerald-800" title="Správná varianta">
                                        ✓
                                      </span>
                                    )}
                                    {isUserPick && !isCorrect && (
                                      <span className="font-bold text-rose-600 dark:text-rose-400" title="Vaše chybná volba">
                                        ✗
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
                              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 p-2.5 rounded-lg print:bg-rose-50/50 print:border-rose-300">
                                <span className="font-bold text-rose-700 dark:text-rose-400 block mb-0.5 print:text-rose-900">Vaše odpověď:</span>
                                <span className="text-slate-800 dark:text-slate-200">
                                  {studentAnswerIdx === undefined || studentAnswerIdx === -1 ? 'Nezodpovězeno' : String(studentAnswerIdx)}
                                </span>
                              </div>
                              <div className="print-correct-answer bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-2.5 rounded-lg print:border-emerald-600">
                                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5 print:text-emerald-900">Správná odpověď:</span>
                                <span className="text-slate-800 dark:text-slate-200 font-bold print:text-emerald-950">
                                  {q.answer || 'Správná varianta'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Rationale & Source */}
                          <div className="p-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                            <span className="font-bold block mb-1 text-slate-900 dark:text-slate-100">
                              Odůvodnění:
                            </span>
                            <p className="leading-relaxed">{q.rationale}</p>
                            <div className="mt-2 text-blue-700 dark:text-blue-400 print:text-slate-800 font-medium">
                              <strong>Zákonný pramen:</strong> {q.source}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.section>
      );
    }

    // Playing State
    const currentQ = quizQuestions[currentIndex];
    const progressPercent = ((currentIndex + 1) / quizQuestions.length) * 100;
    const isFlagged = flaggedQuestions.has(currentQ.id);

    return (
      <section className="flex-1 flex flex-col gap-4 h-full">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
          
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
            <motion.div 
              className={`h-full rounded-r-full ${isExamMode ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]'}`} 
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          
          {/* Header info */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                isExamMode ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}>
                Otázka {currentIndex + 1} / {quizQuestions.length}
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-semibold text-xs hidden sm:block">
                {getSubjectInfo(currentQ.subject).name}{currentQ.topic ? ` • ${currentQ.topic}` : ''}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Exam Global Countdown */}
              {isExamMode ? (
                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span className="font-mono font-bold text-sm text-amber-700 dark:text-amber-300">
                    {formatExamTime(examGlobalTimeLeft)}
                  </span>
                </div>
              ) : timeLimit !== null ? (
                <div className="flex items-center gap-1.5">
                  {isTimedOut || timeLeft === 0 ? (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                      00:00 (Vypršel)
                    </span>
                  ) : !isOptionsRevealed ? (
                    <span className="inline-flex items-center gap-1 font-mono font-semibold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700" title="Odpočet se spustí po zobrazení možností">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      00:{String(timeLimit).padStart(2, '0')}
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 font-mono font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg ${
                      timeLeft !== null && timeLeft <= 5
                        ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 animate-pulse'
                        : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      00:{String(timeLeft).padStart(2, '0')}
                    </span>
                  )}
                </div>
              ) : null}

              {/* Audio Speech */}
              {isSpeechSupported() && (
                <button
                  onClick={handleSpeakQuestion}
                  className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Přečíst otázku nahlas"
                >
                  <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-blue-600 animate-pulse' : ''}`} />
                </button>
              )}

              {/* Flag button in exam mode */}
              {isExamMode && (
                <button
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isFlagged 
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 border border-amber-300' 
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Označit otázku k revizi"
                >
                  <Flag className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => toggleFavorite(currentQ.id)}
                aria-pressed={favorites.includes(currentQ.id)}
                aria-label={
                  favorites.includes(currentQ.id)
                    ? 'Odebrat otázku z oblíbených'
                    : 'Přidat otázku mezi oblíbené'
                }
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-300 dark:text-slate-600 hover:text-yellow-500 transition-colors"
              >
                <Star className={`w-5 h-5 ${favorites.includes(currentQ.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Question and Options Area */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl"
              >
                {/* Timed-out alert badge when time expires */}
                {!isExamMode && (isTimedOut || (timeLimit !== null && timeLeft === 0)) && !isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs sm:text-sm font-bold shadow-xs"
                  >
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                    <span>Časový limit vypršel – odpověz dodatečně</span>
                  </motion.div>
                )}

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
                  {currentQ.question}
                </h2>
                
                {/* Two-phase button when options are hidden */}
                {!isExamMode && !isOptionsRevealed && !isAnswered ? (
                  <div className="my-6">
                    <button
                      type="button"
                      onClick={() => setIsOptionsRevealed(true)}
                      className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer touch-manipulation active:scale-[0.98]"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Zobrazit možnosti</span>
                      {timeLimit !== null && (
                        <span className="ml-1.5 px-2 py-0.5 text-xs bg-white/20 rounded-md font-mono font-bold">
                          {timeLimit} s
                        </span>
                      )}
                    </button>
                    {timeLimit !== null ? (
                      <p className="mt-2.5 text-xs text-slate-400 dark:text-slate-500">
                        Časový limit ({timeLimit} s) se spustí až v okamžiku kliknutí a odkrytí odpovědí.
                      </p>
                    ) : (
                      <p className="mt-2.5 text-xs text-slate-400 dark:text-slate-500">
                        Promyslete si otázku a poté stiskněte tlačítko pro výběr z variant.
                      </p>
                    )}
                  </div>
                ) : (
                  <motion.div
                    initial={!isExamMode ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    {/* Confidence selector (in training mode only) */}
                    {!isExamMode && !isAnswered && (
                      <div className="mb-6 flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Jistota odpovědi:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentConfidence('know')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border ${
                              currentConfidence === 'know' ? 'bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700'
                            }`}
                          >
                            Vím jistě
                          </button>
                          <button
                            onClick={() => setCurrentConfidence('guess')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border ${
                              currentConfidence === 'guess' ? 'bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700'
                            }`}
                          >
                            Tipuji
                          </button>
                          <button
                            onClick={() => setCurrentConfidence('dont_know')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border ${
                              currentConfidence === 'dont_know' ? 'bg-rose-100 border-rose-500 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700'
                            }`}
                          >
                            Nevím
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Options List */}
                    <div className="grid grid-cols-1 gap-3">
                      {currentQ.options?.map((option, idx) => {
                        const isSelected = answers[currentQ.id] === idx;
                        const isCorrect = idx === currentQ.correctOption;
                        
                        let btnClass = "border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200";
                        let letterClass = "bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
                        let icon = null;

                        if (isExamMode) {
                          // In exam mode, only highlight selection
                          if (isSelected) {
                            btnClass = "border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 font-bold shadow-xs";
                            letterClass = "bg-blue-600 text-white";
                          }
                        } else if (isAnswered) {
                          if (isCorrect) {
                            btnClass = "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-300 shadow-xs";
                            letterClass = "bg-emerald-500 text-white";
                            icon = <CheckCircle2 className="ml-auto text-emerald-600 w-5 h-5 shrink-0" />;
                          } else if (isSelected) {
                            btnClass = "border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 font-bold text-rose-900 dark:text-rose-300 shadow-xs";
                            letterClass = "bg-rose-500 text-white";
                            icon = <XCircle className="ml-auto text-rose-600 w-5 h-5 shrink-0" />;
                          } else {
                            btnClass = "opacity-40 border-slate-200 dark:border-slate-800 text-slate-400";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={!isExamMode && isAnswered}
                            className={`min-h-[44px] flex items-start p-3.5 sm:p-4 border rounded-xl transition-all text-left group cursor-pointer touch-manipulation ${btnClass}`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold mr-3.5 shrink-0 text-xs transition-colors ${letterClass}`}>
                              {getOptionLetter(idx)}
                            </div>
                            <span className="font-medium text-xs sm:text-sm leading-relaxed mt-0.5">{option}</span>
                            {icon}
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Rationale (only in practice mode) */}
                    {!isExamMode && isAnswered && (
                      <motion.div 
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Odůvodnění & Zákonná norma:</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2.5">
                          {currentQ.rationale}
                        </p>
                        <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                          {currentQ.source}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Bottom Bar Controls */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            {isExamMode ? (
              <div className="flex items-center justify-between w-full">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Předchozí</span>
                </button>

                <div className="text-xs text-slate-400 font-medium">
                  {Object.keys(answers).length} / {quizQuestions.length} zodpovězeno
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (currentIndex < quizQuestions.length - 1) {
                      setCurrentIndex(prev => prev + 1);
                    } else {
                      setConfirmSubmitExam(true);
                    }
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentIndex === quizQuestions.length - 1 ? 'Odevzdat test' : 'Další'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <span className="text-xs text-slate-400 font-medium">
                  Otázka {currentIndex + 1} z {quizQuestions.length}
                </span>
                {isAnswered && (
                  <button 
                    onClick={nextQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-sm flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <span>{currentIndex < quizQuestions.length - 1 ? 'Další otázka' : 'Vyhodnotit test'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    );
  };

  const unansweredCount = quizQuestions.length - Object.keys(answers).length;

  return (
    <>
      {renderAside()}
      {renderSection()}

      <ConfirmDialog
        isOpen={confirmSubmitExam}
        tone="danger"
        title="Odevzdat zkoušku zkušební komisi?"
        description={
          unansweredCount > 0 ? (
            <>
              Máte <strong>{unansweredCount}</strong> z {quizQuestions.length}{' '}
              {unansweredCount === 1 ? 'otázku' : unansweredCount < 5 ? 'otázky' : 'otázek'} bez
              odpovědi — ty se vyhodnotí jako chyba. Po odevzdání už nelze nic doplnit.
            </>
          ) : (
            <>
              Zodpověděl jste všech {quizQuestions.length} otázek. Po odevzdání se zkouška
              uzavře, vyhodnotí a uloží do vašich statistik — měnit odpovědi už nebude možné.
            </>
          )
        }
        confirmLabel="Odevzdat zkoušku"
        cancelLabel="Vrátit se k otázkám"
        onConfirm={() => {
          setConfirmSubmitExam(false);
          finishExam();
        }}
        onCancel={() => setConfirmSubmitExam(false)}
      />
    </>
  );
}
