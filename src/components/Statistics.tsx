import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  BookOpen,
  ListChecks,
  Calendar,
  BarChart3,
  Compass,
  ArrowRight,
  BrainCircuit,
  Trash2,
  Loader2,
  Clock,
  GraduationCap,
  Rocket
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Question, QuizSessionRecord, TopicPerformance } from '../types';
import { PASS_PERCENT, DISTINCTION_PERCENT } from '../constants/grading';
import { NAV_TAB_LABELS } from '../data/navTabs';
import ConfirmDialog from './common/ConfirmDialog';

interface StatisticsProps {
  questions: Question[];
  history: QuizSessionRecord[];
  isLoading?: boolean;
  onStartTopicQuiz?: (subject: string, topic?: string) => void;
  onClearHistory?: () => void;
  onStartQuiz?: () => void;
  onStartScenario?: () => void;
}

/**
 * Prahy pro slovní odhad připravenosti. Hranice úspěšnosti testu je
 * PASS_PERCENT z constants/grading; „výborná“ a „varovná“ hladina jsou
 * jen pro tento přehled, proto zůstávají lokální.
 */
const READY_PERCENT = 85;
const WARNING_PERCENT = 60;
/** Pod tolik odpovědí je odhad připravenosti jen šum. */
const MIN_ANSWERS_FOR_READINESS = 10;

type TimeFilter = 'all' | '7d' | '30d';

const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: 'all', label: 'Vše' },
  { id: '30d', label: '30 dní' },
  { id: '7d', label: '7 dní' },
];

/**
 * Záznam testu po uplatnění filtru předmětu. `partial` znamená, že ze
 * smíšeného testu zůstala jen část otázek a skóre je přepočítané — pro
 * takový výřez nedává verdikt Prospěl/Neprospěl smysl.
 */
type FilteredSession = QuizSessionRecord & { partial: boolean };

const NO_DATA_TEXT = 'Zatím nemáme data pro tento výběr';

/** Kolik odpovědí musí okruh mít, aby se ukázal mezi nejlépe zvládnutými. */
const MIN_ATTEMPTS_FOR_STRENGTH = 3;

/**
 * Verdikt Prospěl/Neprospěl patří jen Zkoušce nanečisto — jen ta má pevný
 * rozsah a hranici. U cvičného testu o pěti otázkách by zněl jako hodnocení
 * zkoušky, a proto se tam ukazuje jen, jestli je výsledek nad hranicí.
 */
const EXAM_SESSION_SUBJECT = 'Závěrečná zkouška ZOP A';

/** Tvar slova podle českého počítání (1 otázka / 2 otázky / 5 otázek). */
function pluralWordCz(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one;
  if (count >= 2 && count <= 4) return few;
  return many;
}

function pluralCz(count: number, one: string, few: string, many: string): string {
  return `${count} ${pluralWordCz(count, one, few, many)}`;
}

function formatDurationCs(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours} h ${minutes} min`;
  if (minutes > 0) return `${minutes} min`;
  return `${totalSeconds} s`;
}

/**
 * Popisek osy Y u grafu okruhů. Recharts dlouhý název zalomí do více řádků,
 * které pak lezou přes sousední sloupce; zkrácený popisek se vejde na řádek
 * a celý název je v bublině po najetí.
 */
function shortenAxisLabel(label: string): string {
  const MAX = 26;
  return label.length > MAX ? `${label.slice(0, MAX - 1).trimEnd()}…` : label;
}

function formatShortDateCs(date: Date): string {
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
}

function formatDateTimeCs(date: Date): string {
  return `${date.toLocaleDateString('cs-CZ')} ${date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Tmavý režim se přepíná třídou `dark` na <html> (App.tsx). Recharts kreslí
 * do SVG s inline barvami, takže Tailwindové `dark:` varianty na tooltip
 * ani mřížku nedosáhnou — barvy se musí zvolit v JS.
 */
function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

interface ChartPalette {
  tooltip: React.CSSProperties;
  grid: string;
  axis: string;
  tick: string;
  dotStroke: string;
}

function getChartPalette(isDark: boolean): ChartPalette {
  return {
    tooltip: {
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      borderRadius: '12px',
      color: isDark ? '#f1f5f9' : '#0f172a',
      fontSize: '12px',
      boxShadow: isDark ? '0 8px 16px -4px rgba(0,0,0,0.5)' : '0 8px 16px -4px rgba(15,23,42,0.12)',
    },
    grid: isDark ? '#1e293b' : '#e2e8f0',
    axis: isDark ? '#334155' : '#cbd5e1',
    tick: isDark ? '#94a3b8' : '#64748b',
    dotStroke: isDark ? '#0f172a' : '#ffffff',
  };
}

const KPI_CARD_CLASS =
  'bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between';
const KPI_LABEL_CLASS = 'text-sm font-medium text-slate-500 dark:text-slate-400';
const KPI_VALUE_CLASS = 'text-2xl font-bold text-slate-900 dark:text-white tabular-nums';
const PANEL_CLASS = 'bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col';

export default function Statistics({
  questions,
  history,
  isLoading = false,
  onStartTopicQuiz,
  onClearHistory,
  onStartQuiz,
  onStartScenario
}: StatisticsProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const isDark = useIsDarkMode();
  const palette = useMemo(() => getChartPalette(isDark), [isDark]);

  /**
   * Předmět a okruh odpovědi se berou z aktuální banky otázek, ne ze záznamu.
   * Starší záznamy nesou názvy z dřívějších verzí banky („taktika“,
   * „Bezpečnostní služba“, okruh = název předmětu…), které v aplikaci už
   * neexistují a ve statistikách vypadaly jako nesmysl. Odpověď na otázku,
   * která v bance zůstala, se přepíše na její současný předmět a okruh.
   */
  const bankIndex = useMemo(() => {
    const byId = new Map<string, { subject: string; topic: string }>();
    const subjects = new Set<string>();
    const topicKeys = new Set<string>();
    questions.forEach(q => {
      const topic = q.topic || 'Základní okruh';
      byId.set(q.id, { subject: q.subject, topic });
      subjects.add(q.subject);
      topicKeys.add(`${q.subject}\u0000${topic}`);
    });
    return { byId, subjects, topicKeys };
  }, [questions]);

  // Filter history based on time and subject
  const filteredHistory = useMemo((): FilteredSession[] => {
    let list: FilteredSession[] = history.map(item => ({
      ...item,
      partial: false,
      attempts: item.attempts.map(a => {
        const current = bankIndex.byId.get(a.questionId);
        return current ? { ...a, subject: current.subject, topic: current.topic } : a;
      }),
    }));

    const now = Date.now();
    if (timeFilter === '7d') {
      list = list.filter(item => now - item.timestamp <= 7 * 24 * 3600 * 1000);
    } else if (timeFilter === '30d') {
      list = list.filter(item => now - item.timestamp <= 30 * 24 * 3600 * 1000);
    }

    // Filtr předmětu se uplatňuje na jednotlivé odpovědi, ne jen na celé testy.
    // Dřív prošel smíšený test (a každý test „Všechny předměty“, i bez jediné
    // otázky z vybraného předmětu) celý, takže se do úspěšnosti, slabých okruhů
    // i grafů započítaly odpovědi z úplně jiných předmětů. Test, ze kterého do
    // předmětu patří jen část otázek, se proto zúží na tu část a jeho skóre se
    // přepočítá; test bez jediné takové otázky ze seznamu vypadne.
    if (selectedSubjectFilter !== 'all') {
      list = list.flatMap((item): FilteredSession[] => {
        // Starší záznamy bez jednotlivých odpovědí jde posoudit jen podle předmětu testu.
        if (item.attempts.length === 0) {
          return item.subject === selectedSubjectFilter ? [item] : [];
        }
        const matching = item.attempts.filter(a => a.subject === selectedSubjectFilter);
        if (matching.length === 0) return [];
        if (matching.length === item.attempts.length) return [item];

        const correct = matching.filter(a => a.isCorrect).length;
        const share = matching.length / item.attempts.length;
        return [{
          ...item,
          partial: true,
          attempts: matching,
          totalQuestions: matching.length,
          correctAnswers: correct,
          accuracy: Math.round((correct / matching.length) * 100),
          // Čas se po otázkách neměří; podíl podle počtu otázek je nejlepší odhad.
          timeSpentSeconds: item.timeSpentSeconds !== undefined ? Math.round(item.timeSpentSeconds * share) : undefined,
          correctInLimit: undefined,
          correctAfterLimit: undefined,
        }];
      });
    }

    return list.sort((a, b) => a.timestamp - b.timestamp);
  }, [history, timeFilter, selectedSubjectFilter, bankIndex]);

  // Aggregate all question attempts from filtered history
  const allAttempts = useMemo(() => {
    return filteredHistory.flatMap(sess => sess.attempts);
  }, [filteredHistory]);

  // Calculate Overall KPIs
  const totalAnswered = allAttempts.length;
  const totalCorrect = allAttempts.filter(a => a.isCorrect).length;
  const overallAccuracy: number | null = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;
  // Prázdná relace (bez jediné odpovědi ani otázky) není absolvovaný test.
  // Starší záznamy bez jednotlivých odpovědí mají aspoň počet otázek, ty zůstávají.
  const totalSessions = useMemo(
    () => filteredHistory.filter(sess => sess.attempts.length > 0 || sess.totalQuestions > 0).length,
    [filteredHistory]
  );
  const totalTimeSpentSeconds = useMemo(
    () => filteredHistory.reduce((sum, sess) => sum + (sess.timeSpentSeconds || 0), 0),
    [filteredHistory]
  );

  // Aggregate stats per topic — jen okruhy, ve kterých padla aspoň jedna
  // odpověď. Netestovaný okruh dřív dostal 0 % a vypadal jako „kritický“.
  const topicStats: TopicPerformance[] = useMemo(() => {
    const map = new Map<string, { topic: string; subject: string; total: number; correct: number }>();

    // Klíčem je předmět + okruh: stejně pojmenovaný okruh (např. „Program zacházení“)
    // je v Pedagogice i Penologii a dřív se oba slily do jednoho řádku.
    allAttempts.forEach(att => {
      const t = att.topic || 'Základní okruh';
      const key = `${att.subject}\u0000${t}`;
      // Okruh, který v současné bance není, se do přehledu okruhů nepočítá.
      if (!bankIndex.topicKeys.has(key)) return;
      const entry = map.get(key) || { topic: t, subject: att.subject, total: 0, correct: 0 };
      entry.total += 1;
      if (att.isCorrect) entry.correct += 1;
      map.set(key, entry);
    });

    const result: TopicPerformance[] = [];
    map.forEach(val => {
      const acc = Math.round((val.correct / val.total) * 100);
      result.push({
        topic: val.topic,
        subject: val.subject,
        totalAttempts: val.total,
        correctAttempts: val.correct,
        incorrectAttempts: val.total - val.correct,
        accuracy: acc,
        isWeakTopic: acc < PASS_PERCENT
      });
    });

    return result.sort((a, b) => a.accuracy - b.accuracy);
  }, [allAttempts, bankIndex]);

  /** Kolik okruhů z banky se v tomto výběru vůbec neobjevilo. */
  const untestedTopicCount = useMemo(() => {
    const tested = new Set(topicStats.map(t => `${t.subject}\u0000${t.topic}`));
    const all = new Set<string>();
    questions
      .filter(q => selectedSubjectFilter === 'all' || q.subject === selectedSubjectFilter)
      .forEach(q => all.add(`${q.subject}\u0000${q.topic || 'Základní okruh'}`));
    let count = 0;
    all.forEach(key => { if (!tested.has(key)) count += 1; });
    return count;
  }, [questions, topicStats, selectedSubjectFilter]);

  // Weakest and strongest topics
  const weakestTopics = useMemo(() => {
    return topicStats.filter(t => t.isWeakTopic).slice(0, 4);
  }, [topicStats]);

  const strongestTopics = useMemo(() => {
    // Okruh s jedinou správnou odpovědí (1 z 1 = 100 %) není „zvládnutý“ —
    // mezi nejlepší se dostane až s aspoň MIN_ATTEMPTS_FOR_STRENGTH odpověďmi.
    return [...topicStats]
      .filter(t => !t.isWeakTopic && t.totalAttempts >= MIN_ATTEMPTS_FOR_STRENGTH)
      .reverse()
      .slice(0, 3);
  }, [topicStats]);

  /**
   * Data sloupcového grafu. Popisek osy Y nese předmět jen tehdy, když se
   * některý název okruhu opakuje ve více předmětech — jinak by jen zabíral místo.
   */
  const { topicChartData, topicChartHeight } = useMemo(() => {
    const names = topicStats.map(t => t.topic);
    const hasDuplicateNames = new Set(names).size !== names.length;
    const data = topicStats.map(t => ({
      ...t,
      label: hasDuplicateNames ? `${t.subject} · ${t.topic}` : t.topic,
    }));
    // ~28 px na okruh, aby se popisky nepřekrývaly; minimum 18 rem (288 px).
    const height = Math.max(288, topicStats.length * 28 + 40);
    return { topicChartData: data, topicChartHeight: height };
  }, [topicStats]);

  // Aggregate stats per Subject
  const subjectStats = useMemo(() => {
    const map = new Map<string, { subject: string; total: number; correct: number }>();
    allAttempts.forEach(att => {
      // Předmět z dřívější verze banky nemá v přehledu předmětů co dělat.
      if (!bankIndex.subjects.has(att.subject)) return;
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
  }, [allAttempts, bankIndex]);

  // Timeline data for Time Chart
  const timeSeriesData = useMemo(() => {
    return filteredHistory.map((sess, idx) => {
      const date = new Date(sess.timestamp);
      const dayLabel = formatShortDateCs(date);
      return {
        sessionName: `Test č. ${idx + 1} (${sess.dateFormatted || dayLabel})`,
        shortDate: dayLabel,
        accuracy: sess.accuracy,
        correct: sess.correctAnswers,
        total: sess.totalQuestions,
        subject: sess.subject === 'all' ? 'Všechny předměty' : sess.subject,
        timestamp: sess.timestamp
      };
    });
  }, [filteredHistory]);

  /**
   * Rozpad podle vlastní jistoty.
   *
   * Cvičný test nabízí TŘI úrovně (vím / tipuju / nevím) — dřív je graf
   * sléval na dvě a odpověď označenou „nevím“, která náhodou vyšla, vykázal
   * jako „šťastný tip“. Do grafu se navíc počítaly i pokusy z ostré zkoušky,
   * kde se na jistotu nikdo neptal, takže každá chyba ve zkoušce vypadala
   * jako falešná jistota.
   *
   * Do rozpadu proto jdou jen pokusy, u kterých jistota opravdu zadaná byla.
   */
  const { confidenceData, confidenceAttemptCount } = useMemo(() => {
    const tally = {
      know: { correct: 0, incorrect: 0 },
      guess: { correct: 0, incorrect: 0 },
      dont_know: { correct: 0, incorrect: 0 },
    };

    let counted = 0;
    allAttempts.forEach(a => {
      const level = a.confidence;
      if (level !== 'know' && level !== 'guess' && level !== 'dont_know') return;
      counted += 1;
      if (a.isCorrect) tally[level].correct += 1;
      else tally[level].incorrect += 1;
    });

    const data = [
      { name: 'Pevná znalost (označeno jako jisté, správně)', value: tally.know.correct, color: '#10b981' },
      { name: 'Falešná jistota (označeno jako jisté, chybně)', value: tally.know.incorrect, color: '#ef4444' },
      { name: 'Šťastný tip (označeno jako tip, správně)', value: tally.guess.correct, color: '#3b82f6' },
      { name: 'Neúspěšný tip (označeno jako tip, chybně)', value: tally.guess.incorrect, color: '#f59e0b' },
      { name: 'Náhoda při „nevím“ (správně)', value: tally.dont_know.correct, color: '#8b5cf6' },
      { name: 'Mezera ve znalostech („nevím“, chybně)', value: tally.dont_know.incorrect, color: '#64748b' },
    ].filter(item => item.value > 0);

    return { confidenceData: data, confidenceAttemptCount: counted };
  }, [allAttempts]);

  // All available subjects for filter
  const allSubjects = useMemo(() => {
    return Array.from(new Set(questions.map(q => q.subject)));
  }, [questions]);

  // Readiness status
  const getReadinessBadge = (acc: number | null, total: number) => {
    if (acc === null) {
      return {
        text: NO_DATA_TEXT,
        desc: 'Ve zvoleném období a předmětu není zaznamenaná žádná odpověď.',
        color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
      };
    }
    if (total < MIN_ANSWERS_FOR_READINESS) {
      return {
        text: 'Zatím málo odpovědí pro odhad',
        desc: `Pro odhad připravenosti je potřeba alespoň ${MIN_ANSWERS_FOR_READINESS} odpovědí, zatím ${pluralWordCz(total, 'je', 'jsou', 'je')} ${pluralCz(total, 'odpověď', 'odpovědi', 'odpovědí')}. Čím víc otázek, tím spolehlivější odhad.`,
        color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
      };
    }
    if (acc >= READY_PERCENT) {
      return {
        text: 'Výborná připravenost',
        desc: `Úspěšnost je stabilně nad hranicí ${PASS_PERCENT} %.`,
        color: 'text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
      };
    }
    if (acc >= PASS_PERCENT) {
      return {
        text: 'Nad hranicí úspěšnosti',
        desc: `Úspěšnost je na hranici ${PASS_PERCENT} % nebo těsně nad ní. Ještě zbývá dotáhnout slabé okruhy.`,
        color: 'text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
      };
    }
    if (acc >= WARNING_PERCENT) {
      return {
        text: 'Pod hranicí úspěšnosti',
        desc: `Aktuální úspěšnost je pod hranicí ${PASS_PERCENT} %. Doporučeno procvičit slabé okruhy.`,
        color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
      };
    }
    return {
      text: 'Vysoká chybovost',
      desc: `Úspěšnost je hluboko pod hranicí ${PASS_PERCENT} %. Začněte u okruhů s nejnižší úspěšností níže.`,
      color: 'text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
    };
  };

  const readiness = getReadinessBadge(overallAccuracy, totalAnswered);

  /** Barva sloupce: hranicí mezi slabým a zvládnutým je PASS_PERCENT. */
  const getBarColor = (acc: number) => {
    if (acc >= DISTINCTION_PERCENT) return '#10b981'; // emerald – výborné
    if (acc >= PASS_PERCENT) return '#3b82f6'; // blue – nad hranicí
    if (acc >= 50) return '#f59e0b'; // amber – slabé
    return '#ef4444'; // red – kritické
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" aria-hidden="true" />
        <span className="text-sm font-medium">Načítám statistiky…</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-xl mx-auto w-full p-4 text-center">
        <div className="w-full bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <BarChart3 className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Zatím žádná data k zobrazení
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
            Úspěšnost v čase a přehled slabých okruhů se zde zobrazí po dokončení prvního testu.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full sm:w-auto">
            {onStartQuiz && (
              <button
                type="button"
                onClick={onStartQuiz}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                Spustit první test
              </button>
            )}
            {onStartScenario && (
              <button
                type="button"
                onClick={onStartScenario}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Rocket className="w-4 h-4" aria-hidden="true" />
                Vyzkoušet scénář
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const hasAnyData = totalAnswered > 0 || filteredHistory.length > 0;

  return (
    <div className="w-full flex flex-col gap-5 pb-8">

      {/* Záhlaví */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <BarChart3 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{NAV_TAB_LABELS.statistics}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Úspěšnost v čase, slabé okruhy a přehled absolvovaných testů.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              aria-label="Filtr předmětu"
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Všechny předměty</option>
              {allSubjects.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>

            {onClearHistory && (
              <button
                type="button"
                onClick={() => setConfirmClearHistory(true)}
                aria-label="Vymazat historii testů"
                title="Vymazat historii testů"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Časový filtr */}
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Období">
        {TIME_FILTERS.map(({ id, label }) => {
          const isActive = timeFilter === id;
          return (
            <button
              type="button"
              key={id}
              aria-pressed={isActive}
              onClick={() => setTimeFilter(id)}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* KPI karty */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Celková úspěšnost */}
        <div className={KPI_CARD_CLASS}>
          <div className="flex items-center justify-between mb-2">
            <span className={KPI_LABEL_CLASS}>Celková úspěšnost</span>
            <Target className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`${KPI_VALUE_CLASS} ${
              overallAccuracy === null
                ? ''
                : overallAccuracy >= PASS_PERCENT
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'
            }`}>
              {overallAccuracy === null ? '–' : `${overallAccuracy} %`}
            </span>
            <span className="text-xs text-slate-400">
              {overallAccuracy === null
                ? 'bez dat'
                : overallAccuracy >= PASS_PERCENT
                  ? 'nad hranicí'
                  : `hranice ${PASS_PERCENT} %`}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                overallAccuracy !== null && overallAccuracy >= PASS_PERCENT ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(overallAccuracy ?? 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Odpovězeno */}
        <div className={KPI_CARD_CLASS}>
          <div className="flex items-center justify-between mb-2">
            <span className={KPI_LABEL_CLASS}>Odpovězeno</span>
            <BookOpen className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={KPI_VALUE_CLASS}>{totalAnswered}</span>
            <span className="text-xs text-slate-400">
              {pluralWordCz(totalAnswered, 'otázka', 'otázky', 'otázek')}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-3">
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> {totalCorrect} správně
            </span>
            <span className="text-red-500 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> {pluralCz(totalAnswered - totalCorrect, 'chyba', 'chyby', 'chyb')}
            </span>
          </div>
        </div>

        {/* Absolvováno testů */}
        <div className={KPI_CARD_CLASS}>
          <div className="flex items-center justify-between mb-2">
            <span className={KPI_LABEL_CLASS}>Absolvováno testů</span>
            <ListChecks className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={KPI_VALUE_CLASS}>{totalSessions}</span>
            <span className="text-xs text-slate-400">
              {pluralWordCz(totalSessions, 'test', 'testy', 'testů')}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            {timeSeriesData.length > 0
              ? `Poslední výsledek: ${timeSeriesData[timeSeriesData.length - 1].accuracy} %`
              : NO_DATA_TEXT}
          </div>
        </div>

        {/* Čas v testech */}
        <div className={KPI_CARD_CLASS}>
          <div className="flex items-center justify-between mb-2">
            <span className={KPI_LABEL_CLASS}>Čas v testech</span>
            <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={KPI_VALUE_CLASS}>
              {totalTimeSpentSeconds > 0 ? formatDurationCs(totalTimeSpentSeconds) : '–'}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Součet času ve vybraných testech
          </div>
        </div>

        {/* Nejslabší okruh */}
        <div className={`${KPI_CARD_CLASS} col-span-2 md:col-span-1`}>
          <div className="flex items-center justify-between mb-2">
            <span className={KPI_LABEL_CLASS}>Nejslabší okruh</span>
            <AlertTriangle className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          {weakestTopics.length > 0 ? (
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white truncate" title={weakestTopics[0].topic}>
                {weakestTopics[0].topic}
              </p>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  {weakestTopics[0].accuracy} % ({pluralCz(weakestTopics[0].incorrectAttempts, 'chyba', 'chyby', 'chyb')})
                </span>
                {onStartTopicQuiz && (
                  <button
                    type="button"
                    onClick={() => onStartTopicQuiz(weakestTopics[0].subject, weakestTopics[0].topic)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Procvičit <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {topicStats.length > 0
                ? `Žádný testovaný okruh není pod ${PASS_PERCENT} %.`
                : NO_DATA_TEXT}
            </p>
          )}
          <div className="text-xs text-slate-400 mt-3 truncate">
            {weakestTopics.length > 0 ? weakestTopics[0].subject : ' '}
          </div>
        </div>
      </div>

      {/* Odhad připravenosti */}
      <div className={`p-4 md:p-5 rounded-2xl border flex items-center gap-3.5 ${readiness.color}`}>
        <div className="p-2.5 rounded-xl bg-white/70 dark:bg-black/20 shrink-0">
          <BrainCircuit className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-bold text-sm md:text-base leading-tight">
            {readiness.text}
          </h2>
          <p className="text-xs md:text-sm opacity-90 mt-0.5">
            {readiness.desc}
          </p>
        </div>
      </div>

      {/* Grafy: vývoj v čase + okruhy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Graf 1: Vývoj úspěšnosti v čase */}
        <div className={PANEL_CLASS}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" aria-hidden="true" />
                Vývoj úspěšnosti v čase
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Procento správných odpovědí v jednotlivých testech
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg shrink-0">
              {pluralCz(timeSeriesData.length, 'test', 'testy', 'testů')}
            </span>
          </div>

          <div className="h-72 w-full mt-2">
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fontSize: 11, fill: palette.tick }}
                    stroke={palette.axis}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: palette.tick }}
                    stroke={palette.axis}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={palette.tooltip}
                    formatter={(val) => [`${val ?? 0} %`, 'Úspěšnost testu']}
                    labelFormatter={(_, payload) => {
                      if (payload && payload[0]) {
                        const item = payload[0].payload;
                        return `${item.sessionName} · ${item.subject} (${item.correct}/${item.total} správně)`;
                      }
                      return '';
                    }}
                  />
                  <ReferenceLine
                    y={PASS_PERCENT}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{ value: `Hranice úspěšnosti (${PASS_PERCENT} %)`, position: 'insideTopRight', fill: '#10b981', fontSize: 11, fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#accuracyGradient)"
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: palette.dotStroke }}
                    activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: palette.dotStroke }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 dark:text-slate-400">
                <BookOpen className="w-10 h-10 stroke-1 mb-2 text-slate-300 dark:text-slate-700" aria-hidden="true" />
                <p className="font-semibold text-sm">{NO_DATA_TEXT}</p>
                <p className="text-xs mt-1">Zkuste jiné období nebo předmět.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" aria-hidden="true"></span>
              <span>Výsledek testu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-green-500 inline-block" aria-hidden="true"></span>
              <span className="text-green-600 dark:text-green-400 font-semibold">Hranice úspěšnosti ({PASS_PERCENT} %)</span>
            </div>
          </div>
        </div>

        {/* Graf 2: Úspěšnost podle tematických okruhů */}
        <div className={PANEL_CLASS}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-500" aria-hidden="true" />
                Úspěšnost v tematických okruzích
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Testované okruhy seřazené od nejslabšího po nejlépe zvládnutý
              </p>
            </div>
            {untestedTopicCount > 0 && (
              <span
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg shrink-0"
                title="Okruhy z banky otázek, na které v tomto výběru nepadla žádná odpověď"
              >
                {untestedTopicCount} netestováno
              </span>
            )}
          </div>

          <div className="w-full mt-2" style={{ height: topicStats.length > 0 ? `${topicChartHeight}px` : '18rem' }}>
            {topicStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topicChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={palette.grid} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: palette.tick }}
                    stroke={palette.axis}
                    unit="%"
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={170}
                    tick={{ fontSize: 11, fill: palette.tick }}
                    tickFormatter={shortenAxisLabel}
                    stroke={palette.axis}
                    interval={0}
                  />
                  <Tooltip
                    contentStyle={palette.tooltip}
                    formatter={(val, _name, item) => {
                      const payload = (item as { payload?: { correctAttempts?: number; totalAttempts?: number } })?.payload;
                      return [
                        `${val ?? 0} % (${payload?.correctAttempts ?? 0}/${payload?.totalAttempts ?? 0} správně)`,
                        'Úspěšnost'
                      ];
                    }}
                    labelFormatter={(label) => `Okruh: ${label}`}
                  />
                  <ReferenceLine x={PASS_PERCENT} stroke="#10b981" strokeDasharray="3 3" />
                  <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                    {topicChartData.map((entry) => (
                      <Cell key={`${entry.subject}-${entry.topic}`} fill={getBarColor(entry.accuracy)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                {NO_DATA_TEXT}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" aria-hidden="true"></span> pod 50 % kritické</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" aria-hidden="true"></span> 50–{PASS_PERCENT - 1} % slabé</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" aria-hidden="true"></span> {PASS_PERCENT}–{DISTINCTION_PERCENT - 1} % nad hranicí</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span> od {DISTINCTION_PERCENT} % výborné</span>
          </div>
        </div>
      </div>

      {/* Nejslabší okruhy k procvičení */}
      <div className={PANEL_CLASS}>
        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
            Okruhy k procvičení
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Nejslabší okruhy ve zvoleném výběru — testované okruhy s úspěšností pod {PASS_PERCENT} %.
          </p>
        </div>

        {weakestTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weakestTopics.map((topic) => (
              <div
                key={`${topic.subject}-${topic.topic}`}
                className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 truncate" title={topic.subject}>
                      {topic.subject}
                    </span>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 shrink-0">
                      {topic.accuracy} %
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
                    {topic.topic}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {pluralCz(topic.incorrectAttempts, 'chyba', 'chyby', 'chyb')} z {pluralCz(topic.totalAttempts, 'pokusu', 'pokusů', 'pokusů')}.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Doporučeno procvičit
                  </span>
                  {onStartTopicQuiz && (
                    <button
                      type="button"
                      onClick={() => onStartTopicQuiz(topic.subject, topic.topic)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Spustit test <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 px-6">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {topicStats.length > 0
                ? `Žádný testovaný okruh není pod ${PASS_PERCENT} %.`
                : NO_DATA_TEXT}
            </p>
            {topicStats.length > 0 && untestedTopicCount > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {pluralCz(untestedTopicCount, 'okruh', 'okruhy', 'okruhů')} z banky zatím {pluralWordCz(untestedTopicCount, 'nebyl testován', 'nebyly testovány', 'nebylo testováno')}.
              </p>
            )}
          </div>
        )}

        {/* Nejlépe zvládnuté okruhy.
            `strongestTopics` se dosud počítalo a nikde nezobrazovalo — přehled
            tak ukazoval jen slabiny a nebylo z něj poznat, co už je hotové. */}
        {strongestTopics.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              Nejlépe zvládnuté okruhy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {strongestTopics.map((topic) => (
                <div
                  key={`${topic.subject}-${topic.topic}`}
                  className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 truncate" title={topic.subject}>
                      {topic.subject}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                      {topic.accuracy} %
                    </span>
                  </div>
                  <p
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2"
                    title={topic.topic}
                  >
                    {topic.topic}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {topic.correctAttempts} z {topic.totalAttempts} správně
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Předměty + jistota */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Úspěšnost podle předmětů */}
        <div className={PANEL_CLASS}>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-blue-500" aria-hidden="true" />
            Úspěšnost podle předmětů
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Porovnání úspěšnosti v jednotlivých předmětech
          </p>

          {subjectStats.length > 0 ? (
            <div className="space-y-4 flex-1">
              {subjectStats.map(sub => (
                <div key={sub.subject} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{sub.subject}</span>
                      {onStartTopicQuiz && (
                        <button
                          type="button"
                          onClick={() => onStartTopicQuiz(sub.subject)}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5 shrink-0"
                          title={`Procvičit předmět ${sub.subject}`}
                        >
                          <span>Procvičit</span>
                          <ArrowRight className="w-2.5 h-2.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 tabular-nums">{sub.correct}/{sub.total} ot.</span>
                      <span className={`font-bold tabular-nums ${sub.accuracy >= PASS_PERCENT ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {sub.accuracy} %
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${sub.accuracy >= PASS_PERCENT ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${sub.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 min-h-32 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
              {NO_DATA_TEXT}
            </div>
          )}
        </div>

        {/* Jistota a sebehodnocení */}
        <div className={PANEL_CLASS}>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <BrainCircuit className="w-5 h-5 text-blue-500" aria-hidden="true" />
            Jistota a sebehodnocení
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Odhaluje falešnou jistotu: odpovědi označené jako jisté, které byly chybně.
            {' '}Počítá se z {pluralCz(confidenceAttemptCount, 'odpovědi', 'odpovědí', 'odpovědí')} v cvičných
            testech, u kterých byla označena jistota — ostrá zkouška se na ni neptá, takže do rozpadu nevstupuje.
          </p>

          <div className="h-48 w-full">
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
                    {confidenceData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={palette.tooltip}
                    formatter={(value, name) => [
                      pluralCz(typeof value === 'number' ? value : 0, 'odpověď', 'odpovědi', 'odpovědí'),
                      name ?? ''
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-slate-500 dark:text-slate-400 text-sm px-4">
                {hasAnyData
                  ? 'V tomto výběru není žádná odpověď s označenou jistotou.'
                  : NO_DATA_TEXT}
              </div>
            )}
          </div>
          {/* Popisky pod grafem, ne v něm: legenda Recharts se do výšky grafu
              nevešla a její řádky se kreslily přes prstenec. */}
          {confidenceData.length > 0 && (
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {confidenceData.map((entry) => (
                <li key={entry.name} className="flex items-start gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: entry.color }} aria-hidden="true" />
                  <span className="min-w-0">
                    {entry.name}{' '}
                    <span className="text-slate-400 dark:text-slate-500">({entry.value})</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Historie testů */}
      <div className={PANEL_CLASS}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500" aria-hidden="true" />
            Absolvované testy
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {pluralCz(filteredHistory.length, 'záznam', 'záznamy', 'záznamů')}
          </span>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th scope="col" className="py-3 px-4 font-semibold">Datum a čas</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Předmět</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Otázek</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Správně</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Úspěšnost</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-right">Hodnocení</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...filteredHistory].reverse().map((sess) => {
                  const date = new Date(sess.timestamp);
                  const isPass = sess.accuracy >= PASS_PERCENT;
                  return (
                    <tr key={sess.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {sess.dateFormatted || formatDateTimeCs(date)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium">
                          {sess.subject === 'all' ? 'Všechny předměty' : sess.subject}
                        </span>
                        {sess.partial && (
                          <span className="ml-1.5 text-slate-400" title="Ze smíšeného testu se počítají jen otázky vybraného předmětu">
                            (výřez)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 tabular-nums">{sess.totalQuestions}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {sess.correctAnswers} / {sess.totalQuestions}
                      </td>
                      <td className="py-3 px-4 font-bold tabular-nums">
                        <span className={isPass ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                          {sess.accuracy} %
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {sess.partial ? (
                          <span className="text-xs text-slate-400" title="Verdikt se dává jen za celý test">
                            –
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isPass
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {isPass ? <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> : <XCircle className="w-3 h-3" aria-hidden="true" />}
                            {sess.subject === EXAM_SESSION_SUBJECT
                              ? (isPass ? 'Prospěl' : 'Neprospěl')
                              : (isPass ? 'Hranice splněna' : 'Pod hranicí')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
            {NO_DATA_TEXT}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmClearHistory}
        tone="danger"
        title="Vymazat celou historii testů?"
        description={
          <>
            {/* Text musí odpovídat tomu, co handleClearHistory v App opravdu dělá:
                výsledky testů i historii pexesa maže v zařízení i na serveru
                (pexeso od migrace 042) a splněných scénářů a drilů se nedotkne.
                Jiné zařízení si pexeso drží v úložišti a při sloučení po
                přihlášení ho serveru vrátí — proto to tu stojí výslovně. */}
            Smaže se <strong>{pluralCz(history.length, 'záznam', 'záznamy', 'záznamů')}</strong> o absolvovaných testech
            i historie pexesa, a to i ze serveru. Pexeso uložené na jiném vašem zařízení se
            může po přihlášení na něm vrátit. Přijdete tím o statistiky a XP z testů
            a pexesa; splněné scénáře a drily zůstávají. Vrátit to zpět nelze.
          </>
        }
        confirmLabel="Vymazat historii"
        onConfirm={() => {
          onClearHistory?.();
          setConfirmClearHistory(false);
        }}
        onCancel={() => setConfirmClearHistory(false)}
      />
    </div>
  );
}
