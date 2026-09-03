import React, { useState, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Target, 
  BookOpen, 
  Flame, 
  RotateCcw, 
  Calendar, 
  BarChart3, 
  Compass, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  BrainCircuit,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  FileJson,
  Check
} from 'lucide-react';
import { exportAllUserData, importAllUserData } from '../utils/gamification';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  Cell,
  PieChart,
  Pie,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Question, QuizSessionRecord, TopicPerformance } from '../types';
import { defaultQuizHistory } from '../data/initialData';

interface StatisticsProps {
  questions: Question[];
  history: QuizSessionRecord[];
  onStartTopicQuiz?: (subject: string, topic?: string) => void;
  onClearHistory?: () => void;
  onLoadSampleData?: () => void;
}

export default function Statistics({ 
  questions, 
  history, 
  onStartTopicQuiz, 
  onClearHistory,
  onLoadSampleData 
}: StatisticsProps) {
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '30d'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [activeView, setActiveView] = useState<'overview' | 'weaknesses' | 'history'>('overview');
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const jsonStr = exportAllUserData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    a.href = url;
    a.download = `vscr_akademie_zaloha_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupMessage({ type: 'success', text: 'Záloha byla úspěšně stažena do souboru JSON.' });
    setTimeout(() => setBackupMessage(null), 5000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importAllUserData(content);
      if (res.success) {
        setBackupMessage({ type: 'success', text: 'Záloha byla úspěšně načtena! Obnovuji data...' });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setBackupMessage({ type: 'error', text: res.message });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter history based on time and subject
  const filteredHistory = useMemo(() => {
    let list = [...history];

    const now = Date.now();
    if (timeFilter === '7d') {
      list = list.filter(item => now - item.timestamp <= 7 * 24 * 3600 * 1000);
    } else if (timeFilter === '30d') {
      list = list.filter(item => now - item.timestamp <= 30 * 24 * 3600 * 1000);
    }

    if (selectedSubjectFilter !== 'all') {
      list = list.filter(item => item.subject === 'all' || item.subject === selectedSubjectFilter || item.attempts.some(a => a.subject === selectedSubjectFilter));
    }

    return list.sort((a, b) => a.timestamp - b.timestamp);
  }, [history, timeFilter, selectedSubjectFilter]);

  // Aggregate all question attempts from filtered history
  const allAttempts = useMemo(() => {
    return filteredHistory.flatMap(sess => sess.attempts);
  }, [filteredHistory]);

  // Calculate Overall KPIs
  const totalAnswered = allAttempts.length;
  const totalCorrect = allAttempts.filter(a => a.isCorrect).length;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const totalSessions = filteredHistory.length;

  // Aggregate stats per topic
  const topicStats: TopicPerformance[] = useMemo(() => {
    const map = new Map<string, { topic: string; subject: string; total: number; correct: number; lastTime: number }>();

    // First seed with known topics from questions catalog if needed
    questions.forEach(q => {
      if (!map.has(q.topic)) {
        map.set(q.topic, { topic: q.topic, subject: q.subject, total: 0, correct: 0, lastTime: 0 });
      }
    });

    // Populate with actual attempts
    allAttempts.forEach(att => {
      const entry = map.get(att.topic) || { topic: att.topic, subject: att.subject, total: 0, correct: 0, lastTime: 0 };
      entry.total += 1;
      if (att.isCorrect) entry.correct += 1;
      map.set(att.topic, entry);
    });

    const result: TopicPerformance[] = [];
    map.forEach(val => {
      const acc = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0;
      result.push({
        topic: val.topic,
        subject: val.subject,
        totalAttempts: val.total,
        correctAttempts: val.correct,
        incorrectAttempts: val.total - val.correct,
        accuracy: acc,
        isWeakTopic: val.total > 0 && acc < 75
      });
    });

    // Filter only topics with at least 1 attempt or all if none
    const testedOnly = result.filter(t => t.totalAttempts > 0);
    return (testedOnly.length > 0 ? testedOnly : result).sort((a, b) => a.accuracy - b.accuracy);
  }, [allAttempts, questions]);

  // Weakest and strongest topics
  const weakestTopics = useMemo(() => {
    return topicStats.filter(t => t.totalAttempts > 0 && t.accuracy < 75).slice(0, 4);
  }, [topicStats]);

  const strongestTopics = useMemo(() => {
    return [...topicStats].filter(t => t.totalAttempts > 0 && t.accuracy >= 75).reverse().slice(0, 3);
  }, [topicStats]);

  // Aggregate stats per Subject
  const subjectStats = useMemo(() => {
    const map = new Map<string, { subject: string; total: number; correct: number }>();
    allAttempts.forEach(att => {
      const entry = map.get(att.subject) || { subject: att.subject, total: 0, correct: 0 };
      entry.total += 1;
      if (att.isCorrect) entry.correct += 1;
      map.set(att.subject, entry);
    });

    return Array.from(map.values()).map(s => ({
      subject: s.subject,
      accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      total: s.total,
      correct: s.correct,
      incorrect: s.total - s.correct
    })).sort((a, b) => a.accuracy - b.accuracy);
  }, [allAttempts]);

  // Timeline data for Time Chart
  const timeSeriesData = useMemo(() => {
    return filteredHistory.map((sess, idx) => {
      const date = new Date(sess.timestamp);
      const dayLabel = `${date.getDate()}.${date.getMonth() + 1}.`;
      return {
        sessionName: `Test #${idx + 1} (${sess.dateFormatted || dayLabel})`,
        shortDate: dayLabel,
        accuracy: sess.accuracy,
        correct: sess.correctAnswers,
        total: sess.totalQuestions,
        subject: sess.subject === 'all' ? 'Všechny předměty' : sess.subject,
        timestamp: sess.timestamp
      };
    });
  }, [filteredHistory]);

  // Confidence distribution (Self-assessment)
  const confidenceData = useMemo(() => {
    let knowCorrect = 0;
    let knowIncorrect = 0; // Falešná jistota!
    let guessCorrect = 0;
    let guessIncorrect = 0;

    allAttempts.forEach(a => {
      if (a.confidence === 'know') {
        if (a.isCorrect) knowCorrect++;
        else knowIncorrect++;
      } else {
        if (a.isCorrect) guessCorrect++;
        else guessIncorrect++;
      }
    });

    return [
      { name: 'Pevné znalosti', value: knowCorrect, color: '#10b981' },
      { name: 'Falešná jistota (Chyba při jistotě)', value: knowIncorrect, color: '#ef4444' },
      { name: 'Šťastný tip', value: guessCorrect, color: '#3b82f6' },
      { name: 'Mezery ve znalostech', value: guessIncorrect, color: '#f59e0b' }
    ].filter(item => item.value > 0);
  }, [allAttempts]);

  // All available subjects for filter
  const allSubjects = useMemo(() => {
    return Array.from(new Set(questions.map(q => q.subject)));
  }, [questions]);

  // Readiness status
  const getReadinessBadge = (acc: number, total: number) => {
    if (total < 10) {
      return {
        text: 'Nedostatek dat pro predikci',
        desc: 'Absolvujte alespoň 15-20 otázek pro přesný odhad připravenosti.',
        color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
      };
    }
    if (acc >= 85) {
      return {
        text: 'Výborná připravenost na zkoušku ZOP A 🏅',
        desc: 'Dosahujete stabilně vysoké úspěšnosti nad požadovaný limit 75 %.',
        color: 'text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
      };
    }
    if (acc >= 75) {
      return {
        text: 'Připraven ke zkoušce (Limit splněn) 👍',
        desc: 'Úspěšnost odpovídá postupovému limitu. Zaměřte se ještě na slabé okruhy.',
        color: 'text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
      };
    }
    if (acc >= 60) {
      return {
        text: 'Vyžaduje zintenzivnění přípravy ⚠️',
        desc: 'Aktuální úspěšnost je pod hranicí 75 %. Doporučujeme dril slabých okruhů.',
        color: 'text-yellow-800 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800'
      };
    }
    return {
      text: 'Kritický stav – vysoká chybovost 🚨',
      desc: 'Výrazné mezery v základních předpisech a zákonných donucovacích prostředcích.',
      color: 'text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
    };
  };

  const readiness = getReadinessBadge(overallAccuracy, totalAnswered);

  const getBarColor = (acc: number) => {
    if (acc >= 80) return '#10b981'; // green
    if (acc >= 65) return '#3b82f6'; // blue
    if (acc >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto max-w-7xl mx-auto w-full p-2 md:p-4 pb-20">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Statistiky & Analýza slabých míst
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                Přehled úspěšnosti v čase, identifikace slabých tematických okruhů a predikce na zkoušku ZOP A.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                timeFilter === 'all' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Vše
            </button>
            <button
              onClick={() => setTimeFilter('30d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                timeFilter === '30d' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              30 dní
            </button>
            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                timeFilter === '7d' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              7 dní
            </button>
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Všechny předměty</option>
            {allSubjects.map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>

          {/* Backup / Restore controls */}
          <button
            onClick={handleExportBackup}
            title="Stáhnout kompletní zálohu profilu, XP, odznaků a historie do JSON"
            className="p-2 px-2.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zálohovat JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Nahrát zálohu profilu ze souboru JSON"
            className="p-2 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Obnovit</span>
          </button>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".json,application/json" 
            onChange={handleImportBackup} 
            className="hidden" 
          />

          {/* Action buttons */}
          {onLoadSampleData && (
            <button
              onClick={onLoadSampleData}
              title="Obnovit ukázková data pro testování grafů"
              className="p-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vzorová data</span>
            </button>
          )}

          {onClearHistory && history.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Opravdu chcete vymazat celou historii statistik?')) {
                  onClearHistory();
                }
              }}
              title="Vymazat historii testů"
              className="p-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/40 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Backup Notification Alert */}
      {backupMessage && (
        <div className={`p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-all shadow-sm ${
          backupMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
            : 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'
        }`}>
          {backupMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
          <span>{backupMessage.text}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Celková úspěšnost */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Celková úspěšnost</span>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl lg:text-4xl font-extrabold ${overallAccuracy >= 75 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {overallAccuracy}%
            </span>
            <span className="text-xs font-medium text-slate-400">
              {overallAccuracy >= 75 ? 'Splňuje limit' : 'Cíl je ≥ 75%'}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${overallAccuracy >= 75 ? 'bg-green-500' : 'bg-orange-500'}`}
              style={{ width: `${Math.min(overallAccuracy, 100)}%` }}
            />
          </div>
        </div>

        {/* Vyřešených otázek */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Odpovězeno</span>
            <BookOpen className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-extrabold text-slate-800 dark:text-slate-100">
              {totalAnswered}
            </span>
            <span className="text-xs font-medium text-slate-400">
              otázek celkem
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mt-3">
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {totalCorrect} správně
            </span>
            <span className="text-red-500 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> {totalAnswered - totalCorrect} chyb
            </span>
          </div>
        </div>

        {/* Dokončených testů */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Absolvováno testů</span>
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-extrabold text-slate-800 dark:text-slate-100">
              {totalSessions}
            </span>
            <span className="text-xs font-medium text-slate-400">
              zaznamenaných relací
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            {timeSeriesData.length > 1 ? (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Poslední skóre: {timeSeriesData[timeSeriesData.length - 1].accuracy}%
              </span>
            ) : (
              'Pravidelnost zvyšuje úspěch'
            )}
          </div>
        </div>

        {/* Nejslabší okruh (Weakest Spot Alert) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Největší slabina
            </span>
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          {weakestTopics.length > 0 ? (
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate" title={weakestTopics[0].topic}>
                {weakestTopics[0].topic}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  Úspěšnost: {weakestTopics[0].accuracy}% ({weakestTopics[0].incorrectAttempts} chyb)
                </span>
                {onStartTopicQuiz && (
                  <button
                    onClick={() => onStartTopicQuiz(weakestTopics[0].subject, weakestTopics[0].topic)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    Drilovat <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                Žádné kritické slabiny! 👏
              </p>
              <p className="text-xs text-slate-400 mt-1">Všechny okruhy zvládáte nad 75 %.</p>
            </div>
          )}
          <div className="text-[10px] text-slate-400 mt-3 truncate font-mono">
            {weakestTopics.length > 0 ? `Předmět: ${weakestTopics[0].subject}` : 'Skvělá práce'}
          </div>
        </div>
      </div>

      {/* Readiness Assessment Banner */}
      <div className={`p-4 md:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${readiness.color}`}>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-black/20 shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base leading-tight">
              {readiness.text}
            </h3>
            <p className="text-xs md:text-sm opacity-90 mt-0.5">
              {readiness.desc}
            </p>
          </div>
        </div>
        {weakestTopics.length > 0 && onStartTopicQuiz && (
          <button
            onClick={() => onStartTopicQuiz(weakestTopics[0].subject, weakestTopics[0].topic)}
            className="shrink-0 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            Procvičit nejslabší okruh ({weakestTopics[0].accuracy}%)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Charts Grid: 1. Success Over Time + 2. Weakest Topics Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Vývoj úspěšnosti v čase (Recharts AreaChart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Vývoj úspěšnosti v čase
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Procento správných odpovědí v jednotlivých testech a trend zlepšování
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              {timeSeriesData.length} testů
            </span>
          </div>

          <div className="h-72 w-full mt-2">
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                  <XAxis 
                    dataKey="shortDate" 
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    stroke="#cbd5e1"
                    className="dark:stroke-slate-700"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    stroke="#cbd5e1"
                    className="dark:stroke-slate-700"
                    unit="%"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: 'none', 
                      color: '#f8fafc',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                    }}
                    formatter={(val: number, name: string) => [`${val}%`, 'Úspěšnost testu']}
                    labelFormatter={(_, payload) => {
                      if (payload && payload[0]) {
                        const item = payload[0].payload;
                        return `${item.sessionName} • ${item.subject} (${item.correct}/${item.total} správně)`;
                      }
                      return '';
                    }}
                  />
                  <ReferenceLine 
                    y={75} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                    label={{ value: 'Limit ZOP A (75%)', position: 'insideTopRight', fill: '#10b981', fontSize: 11, fontWeight: 'bold' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#accuracyGradient)" 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <BookOpen className="w-12 h-12 stroke-1 mb-2 text-slate-300 dark:text-slate-700" />
                <p className="font-semibold text-sm">Zatím žádná data z testů</p>
                <p className="text-xs mt-1">Absolvujte první kvíz pro vykreslení časové osy.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <span>Výsledek testu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-green-500 inline-block"></span>
              <span className="text-green-600 dark:text-green-400 font-semibold">Zkušební limit 75 %</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Úspěšnost podle tematických okruhů (Nejslabší vs Nejsilnější) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-500" />
                Úspěšnost v tematických okruzích
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Okruhy seřazené od nejproblematičtějších po nejlépe zvládnuté
              </p>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            {topicStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topicStats}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    unit="%" 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="topic" 
                    width={130}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: 'none', 
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val: number, _, item) => [
                      `${val}% (${item.payload.correctAttempts}/${item.payload.totalAttempts} správně)`,
                      'Úspěšnost'
                    ]}
                    labelFormatter={(topic) => `Okruh: ${topic}`}
                  />
                  <ReferenceLine x={75} stroke="#10b981" strokeDasharray="3 3" />
                  <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                    {topicStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.accuracy)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Žádná data pro tematické okruhy
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> &lt; 50 % Kritické</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 50-64 % Slabé</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 65-79 % Dobré</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ≥ 80 % Výborné</span>
          </div>
        </div>
      </div>

      {/* Focus Drill: Nejslabší tematické okruhy & Doporučení pro studium */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Prioritní oblasti k procvičení (Identifikované slabiny)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tyto okruhy mají nejnižší úspěšnost a představují nejvyšší riziko neúspěchu u zkoušky ZOP A.
            </p>
          </div>
        </div>

        {weakestTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weakestTopics.map((topic, idx) => (
              <div 
                key={topic.topic} 
                className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between hover:border-red-300 dark:hover:border-red-800/80 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {topic.subject}
                    </span>
                    <span className="text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                      {topic.accuracy}% úspěšnost
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-2">
                    {topic.topic}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Zaznamenáno <strong>{topic.incorrectAttempts} chyb</strong> z {topic.totalAttempts} pokusů.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Doporučen intenzivní dril
                  </span>
                  {onStartTopicQuiz && (
                    <button
                      onClick={() => onStartTopicQuiz(topic.subject, topic.topic)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      Spustit test <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900/40 p-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <h3 className="font-bold text-green-800 dark:text-green-300">Všechny okruhy zvládnuty!</h3>
            <p className="text-xs text-green-700 dark:text-green-400/80 max-w-md mx-auto mt-1">
              Ve všech testovaných tematických okruzích jste dosáhli úspěšnosti 75 % nebo vyšší.
            </p>
          </div>
        )}
      </div>

      {/* Secondary Analysis Grid: 1. Subject Breakdown + 2. Confidence / Self-assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject Success Rate */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Úspěšnost podle předmětů
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Porovnání připravenosti v hlavních oborech výuky ZOP A
          </p>

          <div className="space-y-4 flex-1">
            {subjectStats.map(sub => (
              <div key={sub.subject} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{sub.subject}</span>
                    {onStartTopicQuiz && (
                      <button
                        onClick={() => onStartTopicQuiz(sub.subject)}
                        className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
                        title={`Procvičit předmět ${sub.subject}`}
                      >
                        <span>Procvičit</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">{sub.correct}/{sub.total} ot.</span>
                    <span className={`font-bold ${sub.accuracy >= 75 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {sub.accuracy}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${sub.accuracy >= 75 ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-orange-500'}`}
                    style={{ width: `${sub.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence & Self-Assessment Analysis (PieChart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
            <BrainCircuit className="w-5 h-5 text-purple-500" />
            Analýza jistoty a sebehodnocení
          </h2>
          <p className="text-xs text-slate-400 mb-2">
            Zjištění tzv. falešné jistoty (kritické pro příslušníky ve výkonu služby)
          </p>

          <div className="h-56 w-full">
            {confidenceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={confidenceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {confidenceData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: 'none', 
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(value: number, name: string) => [`${value} odpovědí`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Vyplňte test s hodnocením jistoty
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500" />
            Poslední absolvované testy
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Celkem záznamů: {filteredHistory.length}
          </span>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-mono text-[10px] border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Datum / Čas</th>
                  <th className="py-3 px-4">Předmět</th>
                  <th className="py-3 px-4">Počet otázek</th>
                  <th className="py-3 px-4">Správně</th>
                  <th className="py-3 px-4">Úspěšnost</th>
                  <th className="py-3 px-4 text-right">Hodnocení</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...filteredHistory].reverse().map((sess) => {
                  const date = new Date(sess.timestamp);
                  const isPass = sess.accuracy >= 75;
                  return (
                    <tr key={sess.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-200">
                        {sess.dateFormatted || `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium">
                          {sess.subject === 'all' ? 'Všechny předměty' : sess.subject}
                        </span>
                      </td>
                      <td className="py-3 px-4">{sess.totalQuestions}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {sess.correctAnswers} / {sess.totalQuestions}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={isPass ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                          {sess.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPass 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {isPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isPass ? 'PROSPĚL' : 'NEPROSPĚL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            Žádná historie k zobrazení pro zvolený filtr.
          </div>
        )}
      </div>

    </div>
  );
}
