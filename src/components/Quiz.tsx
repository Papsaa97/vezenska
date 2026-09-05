import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookOpen, Clock, Play, CheckCircle2, XCircle, Star, RotateCcw, Volume2, Award, Flag, Printer, ArrowRight, ArrowLeft, ShieldAlert, Sparkles, Cloud, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, QuizSessionRecord, QuestionAttempt } from '../types';

import { speakText, isSpeechSupported } from '../utils/speech';

interface QuizProps {
  questions: Question[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onSaveQuizResult?: (result: QuizSessionRecord) => void;
  onNavigateToBadges?: () => void;
  presetSubject?: string;
  presetTopic?: string;
  questionsSource?: 'supabase' | 'local';
}

type GameState = 'setup' | 'playing' | 'results';
type Confidence = 'know' | 'guess' | 'dont_know';

interface SessionStats {
  correct: number;
  incorrect: number;
  total: number;
  history: { question: number; accuracy: number }[];
}

export default function Quiz({ 
  questions, 
  favorites, 
  toggleFavorite, 
  onSaveQuizResult,
  onNavigateToBadges,
  presetSubject,
  presetTopic,
  questionsSource = 'local'
}: QuizProps) {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [sessionStats, setSessionStats] = useState<SessionStats>({ correct: 0, incorrect: 0, total: 0, history: [] });
  
  // Setup state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['all']);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isRandomOrder, setIsRandomOrder] = useState<boolean>(true);
  const [isMistakesMode, setIsMistakesMode] = useState<boolean>(false);
  const [mistakeHistory, setMistakeHistory] = useState<Set<string>>(new Set());

  // Special State Exam Mode (50 questions, 45 min, komisionální zkouška ZOP A)
  const [isExamMode, setIsExamMode] = useState<boolean>(false);
  const [examStudentName, setExamStudentName] = useState<string>('Frekventant ZOP A');
  const [examGlobalTimeLeft, setExamGlobalTimeLeft] = useState<number>(45 * 60); // 45 minutes
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

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

  const timerRef = useRef<number | null>(null);
  const examTimerRef = useRef<number | null>(null);
  
  const subjects = useMemo(() => Array.from(new Set(questions.map(q => q.subject))), [questions]);
  
  const topics = useMemo(() => {
    let pool = questions;
    if (!selectedSubjects.includes('all')) {
      pool = pool.filter(q => selectedSubjects.includes(q.subject));
    }
    return Array.from(new Set(pool.map(q => q.topic)));
  }, [questions, selectedSubjects]);

  // Handle preset subject or topic from navigation
  useEffect(() => {
    if (presetSubject) {
      setSelectedSubjects([presetSubject]);
    }
    if (presetTopic) {
      setSelectedTopic(presetTopic);
    }
  }, [presetSubject, presetTopic]);

  const handleSubjectToggle = (subject: string) => {
    if (subject === 'all') {
      setSelectedSubjects(['all']);
      setSelectedTopic('all');
    } else {
      let newSubjects = selectedSubjects.filter(s => s !== 'all');
      if (newSubjects.includes(subject)) {
        newSubjects = newSubjects.filter(s => s !== subject);
      } else {
        newSubjects.push(subject);
      }
      if (newSubjects.length === 0) newSubjects = ['all'];
      setSelectedSubjects(newSubjects);
      setSelectedTopic('all');
    }
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
    // Generate 50 questions proportionally from all subjects
    const subList = ['Právo', 'Bezpečnostní služba', 'Penologie', 'Služební příprava', 'Psychologie', 'Profesní etika', 'Pedagogika', 'Zdravověda a první pomoc', 'Vězeňská administrativa'];
    let examSelected: Question[] = [];

    subList.forEach((subName) => {
      const subQuestions = questions.filter(q => q.subject === subName && q.options && q.options.length > 0);
      const shuffled = [...subQuestions].sort(() => Math.random() - 0.5);
      // Allocate 5-6 questions per subject to reach 50 total
      const count = (subName === 'Právo' || subName === 'Bezpečnostní služba' || subName === 'Penologie' || subName === 'Služební příprava' || subName === 'Profesní etika') ? 6 : 5;
      examSelected.push(...shuffled.slice(0, count));
    });

    // If still less than 50, fill from remaining
    if (examSelected.length < 50) {
      const remaining = questions.filter(q => !examSelected.some(eq => eq.id === q.id) && q.options);
      const extra = [...remaining].sort(() => Math.random() - 0.5).slice(0, 50 - examSelected.length);
      examSelected.push(...extra);
    }

    // Shuffle full exam and shuffle options of every question
    const randomizedExam = examSelected
      .sort(() => Math.random() - 0.5)
      .map(q => shuffleQuestionOptions(q));

    setIsExamMode(true);
    setQuizQuestions(randomizedExam);
    setCurrentIndex(0);
    setAnswers({});
    setConfidences({});
    setFlaggedQuestions(new Set());
    setIsAnswered(false);
    setGameState('playing');
    setQuizStartTime(Date.now());
    setExamGlobalTimeLeft(45 * 60);
  };

  const startQuiz = () => {
    setIsExamMode(false);
    let pool = questions;
    
    if (isMistakesMode) {
      pool = questions.filter(q => mistakeHistory.has(q.id));
      if (pool.length === 0) {
        alert('Nemáte žádné zaznamenané chyby k procvičení.');
        return;
      }
    } else {
      if (!selectedSubjects.includes('all')) {
        pool = questions.filter(q => selectedSubjects.includes(q.subject));
      }
      if (selectedTopic !== 'all') {
        pool = pool.filter(q => q.topic === selectedTopic);
      }
    }
    
    pool = pool.filter(q => q.options && q.options.length > 0 && (q.correctOption !== undefined || q.correct_index !== undefined));
    
    let finalQuestions = [...pool];
    if (isRandomOrder) {
      finalQuestions.sort(() => Math.random() - 0.5);
    }
    
    const selected = finalQuestions
      .slice(0, questionCount === 0 ? pool.length : Math.min(questionCount, pool.length))
      .map(q => shuffleQuestionOptions(q));
    
    if (selected.length === 0) {
      alert('Pro zvolený výběr nejsou dostupné žádné testové otázky.');
      return;
    }
    
    setQuizQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setConfidences({});
    setCurrentConfidence('know');
    setIsAnswered(false);
    setGameState('playing');
    setQuizStartTime(Date.now());
    if (timeLimit) {
      setTimeLeft(timeLimit);
    }
  };

  // Exam global 45m countdown timer
  useEffect(() => {
    if (gameState === 'playing' && isExamMode && examGlobalTimeLeft > 0) {
      examTimerRef.current = window.setInterval(() => {
        setExamGlobalTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(examTimerRef.current!);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    };
  }, [gameState, isExamMode, examGlobalTimeLeft]);

  // Question timer logic (in practice mode)
  useEffect(() => {
    if (!isExamMode && gameState === 'playing' && !isAnswered && timeLimit !== null && timeLeft !== null && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (!isExamMode && timeLeft === 0 && !isAnswered) {
      handleAnswer(-1);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, isAnswered, timeLeft, timeLimit, isExamMode]);

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
    
    setIsAnswered(true);
    setAnswers(prev => ({ ...prev, [quizQuestions[currentIndex].id]: optionIndex }));
    setConfidences(prev => ({ ...prev, [quizQuestions[currentIndex].id]: currentConfidence }));
    
    const isCorrect = optionIndex === quizQuestions[currentIndex].correctOption;
    
    if (!isCorrect) {
      setMistakeHistory(prev => {
        const next = new Set(prev);
        next.add(quizQuestions[currentIndex].id);
        return next;
      });
    } else {
      setMistakeHistory(prev => {
        const next = new Set(prev);
        next.delete(quizQuestions[currentIndex].id);
        return next;
      });
    }

    if (optionIndex !== -1) {
      setSessionStats(prev => {
        const newCorrect = prev.correct + (isCorrect ? 1 : 0);
        const newIncorrect = prev.incorrect + (isCorrect ? 0 : 1);
        const newTotal = prev.total + 1;
        const newAccuracy = Math.round((newCorrect / newTotal) * 100);
        return {
          correct: newCorrect,
          incorrect: newIncorrect,
          total: newTotal,
          history: [...prev.history, { question: newTotal, accuracy: newAccuracy }]
        };
      });
    }

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
    
    const finishedAttempts: QuestionAttempt[] = quizQuestions.map(q => {
      const selected = answers[q.id] !== undefined ? answers[q.id] : -1;
      const isCorrect = selected === q.correctOption;
      return {
        questionId: q.id,
        questionText: q.question,
        subject: q.subject,
        topic: q.topic,
        isCorrect,
        selectedOption: selected,
        correctOption: q.correctOption ?? 0,
        confidence: confidences[q.id] || 'know'
      };
    });

    const correctCount = finishedAttempts.filter(a => a.isCorrect).length;
    const totalCount = finishedAttempts.length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const timeSpent = Math.max(1, Math.round((Date.now() - quizStartTime) / 1000));

    const recordedSubject = isExamMode 
      ? 'Závěrečná zkouška ZOP A' 
      : (selectedSubjects.length === 1 ? selectedSubjects[0] : (selectedSubjects.length > 1 ? 'Kombinace předmětů' : 'all'));

    const sessionRecord: QuizSessionRecord = {
      id: `exam-${Date.now()}`,
      timestamp: Date.now(),
      dateFormatted: 'Dnes ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subject: recordedSubject,
      totalQuestions: totalCount,
      correctAnswers: correctCount,
      accuracy,
      timeSpentSeconds: timeSpent,
      attempts: finishedAttempts
    };

    if (onSaveQuizResult) {
      onSaveQuizResult(sessionRecord);
    }

    setGameState('results');
  };

  const nextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setCurrentConfidence('know');
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
                onClick={() => {
                  if (window.confirm('Opravdu chcete test ukončit a odevzdat zkušební komisi?')) {
                    finishExam();
                  }
                }}
                className="w-full mt-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
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
      <aside className={`w-full md:w-72 flex-col gap-5 shrink-0 ${gameState === 'playing' ? 'hidden md:flex' : 'flex'}`}>
        {/* Exam Mode Banner CTA */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-xl shadow-md p-4 border border-blue-400/30">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Zkouškový standard</span>
          </div>
          <h4 className="font-bold text-sm mb-1.5">Ostrá zkouška ZOP A</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            Komisionální simulace: 50 otázek ze všech 9 předmětů ZOP A, 45 min limit, závěrečný protokol.
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
                  className="hidden"
                  checked={isMistakesMode}
                  onChange={(e) => setIsMistakesMode(e.target.checked)}
                  disabled={gameState === 'playing'}
                />
              </label>
            )}

            <div className={isMistakesMode ? 'opacity-50 pointer-events-none' : ''}>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Předmět</label>
              <select 
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200"
                value={selectedSubjects[0]}
                onChange={(e) => handleSubjectToggle(e.target.value)}
                disabled={gameState === 'playing'}
              >
                <option value="all">Všechny předměty</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {topics.length > 1 && (
              <div className={isMistakesMode ? 'opacity-50 pointer-events-none' : ''}>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Tematický okruh</label>
                <select 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  disabled={gameState === 'playing'}
                >
                  <option value="all">Všechny okruhy</option>
                  {topics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={isMistakesMode ? 'opacity-50 pointer-events-none' : ''}>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Časový limit na otázku</label>
              <div className="grid grid-cols-2 gap-1.5">
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
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Počet otázek: {questionCount}
              </label>
              <input 
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
          className="flex-1 flex flex-col gap-6 h-full"
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
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={startExamMode}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Award className="w-4 h-4" />
                <span>Ostrá zkouška (50 otázek, 45 min)</span>
              </button>
              <button
                onClick={startQuiz}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
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
            
            {/* Exam Header */}
            <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800">
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
            </div>

            {/* XP Award & Progress Banner */}
            {(() => {
              let earnedXp = (correctCount * 15) + 50;
              if (percentage === 100 && totalCount >= 5) earnedXp += 100;
              else if (percentage >= 80 && totalCount >= 5) earnedXp += 50;

              return (
                <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-blue-500/10 border border-amber-400/30 dark:border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
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
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                    >
                      <Award className="w-4 h-4" />
                      <span>Zkontrolovat odznaky</span>
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Personalization for Protocol */}
            <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
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

            {/* Subject Breakdown Table */}
            <div className="my-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Výsledky podle jednotlivých předmětů (9 předmětů ZOP A):
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
            <div className="hidden print:block my-8 p-8 border-2 border-slate-900 text-slate-900 bg-white">
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                <h1 className="text-xl font-bold uppercase tracking-widest">Generální ředitelství Vězeňské služby ČR</h1>
                <h2 className="text-lg font-extrabold uppercase mt-1">Akademie Vězeňské služby • Stráž pod Ralskem</h2>
                <h3 className="text-base font-bold mt-2 underline">PROTOKOL O VYKONÁNÍ ZÁVĚREČNÉ ZKOUŠKY ZOP A</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div><strong>Frekventant:</strong> {examStudentName || 'Frekventant ZOP A'}</div>
                <div><strong>Datum a čas konání:</strong> {new Date().toLocaleString('cs-CZ')}</div>
                <div><strong>Typ zkoušky:</strong> Komisionální písemný test ZOP A</div>
                <div><strong>Dosažené skóre:</strong> {correctCount} / {totalCount} ({percentage} %)</div>
                <div><strong>Celkový výsledek:</strong> <span className="font-extrabold">{gradeLabel}</span></div>
                <div><strong>Časový limit:</strong> 45 minut</div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-sm border-b border-slate-900 pb-1 mb-2">Rozpad hodnocení podle předmětů ZOP A:</h4>
                <table className="w-full text-xs text-left border-collapse">
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

              <div className="mt-12 pt-8 grid grid-cols-3 gap-6 text-center text-xs">
                <div className="border-t border-slate-800 pt-2">
                  <span>Předseda zkušební komise</span>
                </div>
                <div className="border-t border-slate-800 pt-2">
                  <span>Člen komise pro právní přípravu</span>
                </div>
                <div className="border-t border-slate-800 pt-2">
                  <span>Člen komise pro bezpečnostní službu</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Vytisknout / PDF protokol</span>
              </button>

              <button
                onClick={() => setGameState('setup')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nový test / Zkouška</span>
              </button>
            </div>

            {/* Detailed Mistake Breakdown */}
            {percentage < 100 && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
                  Rozbor chybných odpovědí a zákonné prameny:
                </h3>
                <div className="space-y-4">
                  {quizQuestions.filter(q => answers[q.id] !== q.correctOption).map(q => (
                    <div key={q.id} className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {q.subject} • {q.topic}
                        </span>
                      </div>
                      <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-3">
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 p-3 rounded-lg text-xs">
                          <span className="font-bold text-rose-700 dark:text-rose-400 block mb-0.5">Vaše odpověď:</span>
                          <span className="text-slate-800 dark:text-slate-200">
                            {answers[q.id] === undefined || answers[q.id] === -1 ? 'Nezodpovězeno' : q.options?.[answers[q.id]]}
                          </span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-lg text-xs">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">Správná odpověď:</span>
                          <span className="text-slate-800 dark:text-slate-200">
                            {q.options?.[q.correctOption!]}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold block mb-1">Odůvodnění:</span>
                        {q.rationale}
                        <div className="mt-2 text-blue-600 dark:text-blue-400 font-mono font-semibold">
                          Pramen: {q.source}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                {currentQ.subject} • {currentQ.topic}
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
                <span className={`font-mono font-bold text-base ${timeLeft !== null && timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-600 dark:text-slate-300'}`}>
                  00:{String(timeLeft).padStart(2, '0')}
                </span>
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
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
                  {currentQ.question}
                </h2>
                
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
                        className={`flex items-start p-3.5 sm:p-4 border rounded-xl transition-all text-left group cursor-pointer ${btnClass}`}
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
                  onClick={() => {
                    if (currentIndex < quizQuestions.length - 1) {
                      setCurrentIndex(prev => prev + 1);
                    } else {
                      if (window.confirm('Dosáhli jste konce testu. Přejete si zkoušku odevzdat?')) {
                        finishExam();
                      }
                    }
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
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

  return (
    <>
      {renderAside()}
      {renderSection()}
    </>
  );
}
