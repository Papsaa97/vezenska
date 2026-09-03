import { UserRank, Badge } from '../types';

export const VSCR_RANKS: UserRank[] = [
  {
    level: 1,
    name: 'Čekatel ZOP A',
    shortTitle: 'čekatel',
    category: 'podpraporcici',
    minXp: 0,
    maxXp: 150,
    stars: 0,
    color: 'text-slate-400',
    badgeBg: 'bg-slate-700/60 border-slate-600',
    description: 'Nástupní služební pozice uchazeče v základní odborné přípravě ZOP A na Akademii VS ČR.'
  },
  {
    level: 2,
    name: 'Rotný',
    shortTitle: 'rtn.',
    category: 'podpraporcici',
    minXp: 150,
    maxXp: 450,
    stars: 1,
    color: 'text-slate-300',
    badgeBg: 'bg-slate-800/80 border-slate-600',
    description: '1 stříbrná trojcípá hvězda. Příslušník ve zkušební době s osvojenými základy vězeňské služby.'
  },
  {
    level: 3,
    name: 'Strážmistr',
    shortTitle: 'strm.',
    category: 'podpraporcici',
    minXp: 450,
    maxXp: 900,
    stars: 2,
    color: 'text-sky-300',
    badgeBg: 'bg-sky-950/60 border-sky-800',
    description: '2 stříbrné trojcípé hvězdy. Samostatný výkon strážní a dozorčí služby ve věznici.'
  },
  {
    level: 4,
    name: 'Nadstrážmistr',
    shortTitle: 'nstrm.',
    category: 'podpraporcici',
    minXp: 900,
    maxXp: 1600,
    stars: 3,
    color: 'text-teal-300',
    badgeBg: 'bg-teal-950/60 border-teal-800',
    description: '3 stříbrné trojcípé hvězdy. Zkušený dozorce, eskortní a strážní služba.'
  },
  {
    level: 5,
    name: 'Podpraporčík',
    shortTitle: 'pprap.',
    category: 'praporcici',
    minXp: 1600,
    maxXp: 2600,
    stars: 1,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/60 border-emerald-800',
    description: '1 stříbrná trojcípá hvězda se stříbrnou lemovkou (kolejničkou). Samostatný dozorce oddělení.'
  },
  {
    level: 6,
    name: 'Praporčík',
    shortTitle: 'prap.',
    category: 'praporcici',
    minXp: 2600,
    maxXp: 4000,
    stars: 2,
    color: 'text-emerald-300',
    badgeBg: 'bg-emerald-950/70 border-emerald-700',
    description: '2 stříbrné trojcípé hvězdy se stříbrnou kolejničkou. Zástupce velitele směny / vrchní dozorce.'
  },
  {
    level: 7,
    name: 'Nadpraporčík',
    shortTitle: 'nprap.',
    category: 'praporcici',
    minXp: 4000,
    maxXp: 5800,
    stars: 3,
    color: 'text-cyan-300',
    badgeBg: 'bg-cyan-950/60 border-cyan-800',
    description: '3 stříbrné trojcípé hvězdy se stříbrnou kolejničkou. Velitel eskorty, instruktor výcviku.'
  },
  {
    level: 8,
    name: 'Vrchní praporčík',
    shortTitle: 'vprap.',
    category: 'praporcici',
    minXp: 5800,
    maxXp: 8000,
    stars: 4,
    color: 'text-blue-300',
    badgeBg: 'bg-blue-950/70 border-blue-700',
    description: '4 stříbrné trojcípé hvězdy se stříbrnou kolejničkou. Nejvyšší praporčická hodnost, velitel směny.'
  },
  {
    level: 9,
    name: 'Podporučík',
    shortTitle: 'ppor.',
    category: 'dustojnici',
    minXp: 8000,
    maxXp: 11500,
    stars: 1,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/50 border-amber-800',
    description: '1 zlatá pěticípá hvězda. Důstojnický stupeň. Samostatný vychovatel, referent režimu.'
  },
  {
    level: 10,
    name: 'Poručík',
    shortTitle: 'por.',
    category: 'dustojnici',
    minXp: 11500,
    maxXp: 16000,
    stars: 2,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/60 border-amber-700',
    description: '2 zlaté pěticípé hvězdy. Speciální pedagog, právní a bezpečnostní rada věznice.'
  },
  {
    level: 11,
    name: 'Nadporučík',
    shortTitle: 'npor.',
    category: 'dustojnici',
    minXp: 16000,
    maxXp: 22000,
    stars: 3,
    color: 'text-amber-300',
    badgeBg: 'bg-amber-950/70 border-amber-600',
    description: '3 zlaté pěticípé hvězdy. Zástupce vedoucího oddělení, lektor Akademie VS ČR.'
  },
  {
    level: 12,
    name: 'Kapitán',
    shortTitle: 'kpt.',
    category: 'dustojnici',
    minXp: 22000,
    maxXp: 30000,
    stars: 4,
    color: 'text-yellow-400',
    badgeBg: 'bg-yellow-950/60 border-yellow-700',
    description: '4 zlaté pěticípé hvězdy. Vedoucí oddělení výkonu vazby a trestu, zkušební komisař.'
  },
  {
    level: 13,
    name: 'Major',
    shortTitle: 'mjr.',
    category: 'vyssi_dustojnici',
    minXp: 30000,
    maxXp: 41000,
    stars: 1,
    color: 'text-yellow-300',
    badgeBg: 'bg-yellow-950/80 border-yellow-600',
    description: '1 zlatá pěticípá hvězda se zlatou lemovkou (kolejničkou). Vrchní komisař, vedoucí odboru.'
  },
  {
    level: 14,
    name: 'Podplukovník',
    shortTitle: 'pplk.',
    category: 'vyssi_dustojnici',
    minXp: 41000,
    maxXp: 55000,
    stars: 2,
    color: 'text-amber-200',
    badgeBg: 'bg-amber-950/80 border-amber-500',
    description: '2 zlaté pěticípé hvězdy se zlatou kolejničkou. Zástupce ředitele věznice / ředitel odboru GŘ.'
  },
  {
    level: 15,
    name: 'Plukovník',
    shortTitle: 'plk.',
    category: 'vyssi_dustojnici',
    minXp: 55000,
    maxXp: 75000,
    stars: 3,
    color: 'text-amber-200',
    badgeBg: 'bg-amber-900/80 border-amber-400',
    description: '3 zlaté pěticípé hvězdy se zlatou kolejničkou. Ředitel věznice / ředitel Akademie VS ČR.'
  },
  {
    level: 16,
    name: 'Brigádní generál',
    shortTitle: 'brig. gen.',
    category: 'generalita',
    minXp: 75000,
    maxXp: 999999,
    stars: 1,
    color: 'text-yellow-100',
    badgeBg: 'bg-gradient-to-r from-amber-950 to-yellow-900 border-yellow-400',
    description: '1 zlatá generálská hvězda se zlatou lipovou ratolestí. Generální ředitel Vězeňské služby ČR.'
  }
];

export const RAW_BADGES: Omit<Badge, 'isUnlocked' | 'progressPercent' | 'currentValue' | 'targetValue' | 'unlockedAt'>[] = [
  // --- KVÍZY A TESTY ---
  {
    id: 'badge-quiz-1',
    title: 'První krok do služby',
    description: 'Dokonči svůj 1. test nebo kvíz v aplikaci.',
    category: 'quiz',
    tier: 'bronze',
    iconName: 'Award',
    xpReward: 50,
    requirement: { type: 'quiz_count', target: 1 }
  },
  {
    id: 'badge-quiz-5',
    title: 'Zkušební dril',
    description: 'Dokonči úspěšně celkem 5 cvičných testů.',
    category: 'quiz',
    tier: 'silver',
    iconName: 'GraduationCap',
    xpReward: 150,
    requirement: { type: 'quiz_count', target: 5 }
  },
  {
    id: 'badge-quiz-15',
    title: 'Ostrá příprava ZOP',
    description: 'Absolvuj alespoň 15 testů a ukaž pevnou vůli k atestaci.',
    category: 'quiz',
    tier: 'gold',
    iconName: 'ShieldCheck',
    xpReward: 350,
    requirement: { type: 'quiz_count', target: 15 }
  },
  {
    id: 'badge-perfect-10',
    title: 'Bezchybný protokol',
    description: 'Dosáhni 100 % úspěšnosti v testu s minimálně 10 otázkami.',
    category: 'quiz',
    tier: 'gold',
    iconName: 'Sparkles',
    xpReward: 250,
    requirement: { type: 'quiz_perfect', target: 1 }
  },
  {
    id: 'badge-correct-50',
    title: 'Znalostní základ',
    description: 'Odpověz celkem na 50 otázek správně napříč všemi testy.',
    category: 'quiz',
    tier: 'bronze',
    iconName: 'CheckCircle2',
    xpReward: 150,
    requirement: { type: 'questions_correct', target: 50 }
  },
  {
    id: 'badge-correct-200',
    title: 'Knihovna předpisů',
    description: 'Odpověz celkem na 200 otázek správně a prokaž hluboké znalosti.',
    category: 'quiz',
    tier: 'gold',
    iconName: 'BookOpenCheck',
    xpReward: 450,
    requirement: { type: 'questions_correct', target: 200 }
  },
  {
    id: 'badge-all-subjects',
    title: 'Všeuměl Akademie',
    description: 'Vyzkoušej si test alespoň jednou ze všech 9 předmětů ZOP A.',
    category: 'quiz',
    tier: 'platinum',
    iconName: 'Layers',
    xpReward: 350,
    requirement: { type: 'all_subjects', target: 9 }
  },

  // --- PŘEDMĚTOVÁ MISTROVSTVÍ ---
  {
    id: 'badge-master-pravo',
    title: 'Právní expert',
    description: 'Dosáhni alespoň 90 % úspěšnosti v testu z předmětu Právo.',
    category: 'subjects',
    tier: 'silver',
    iconName: 'Scale',
    xpReward: 200,
    requirement: { type: 'subject_mastery', target: 90, subject: 'Právo' }
  },
  {
    id: 'badge-master-bezpecnost',
    title: 'Strážní velitel',
    description: 'Dosáhni alespoň 90 % úspěšnosti v testu z Bezpečnostní služby.',
    category: 'subjects',
    tier: 'silver',
    iconName: 'Shield',
    xpReward: 200,
    requirement: { type: 'subject_mastery', target: 90, subject: 'Bezpečnostní služba' }
  },
  {
    id: 'badge-master-penologie',
    title: 'Mistr penologie',
    description: 'Dosáhni alespoň 90 % úspěšnosti v testu z předmětu Penologie.',
    category: 'subjects',
    tier: 'silver',
    iconName: 'Building2',
    xpReward: 200,
    requirement: { type: 'subject_mastery', target: 90, subject: 'Penologie' }
  },
  {
    id: 'badge-master-sluzebni',
    title: 'Taktický instruktor',
    description: 'Dosáhni alespoň 90 % v testu ze Služební přípravy (DP a zbraně).',
    category: 'subjects',
    tier: 'silver',
    iconName: 'Crosshair',
    xpReward: 200,
    requirement: { type: 'subject_mastery', target: 90, subject: 'Služební příprava' }
  },
  {
    id: 'badge-master-psychologie',
    title: 'Krizový vyjednavač',
    description: 'Dosáhni alespoň 90 % v testu z Psychologie.',
    category: 'subjects',
    tier: 'silver',
    iconName: 'Brain',
    xpReward: 200,
    requirement: { type: 'subject_mastery', target: 90, subject: 'Psychologie' }
  },
  {
    id: 'badge-master-zdravoveda',
    title: 'Bojový záchranář TCCC',
    description: 'Dosáhni alespoň 90 % v testu ze Zdravovědy a první pomoci.',
    category: 'subjects',
    tier: 'silver',
    iconName: 'HeartPulse',
    xpReward: 200,
    requirement: { type: 'subject_mastery', target: 90, subject: 'Zdravověda a první pomoc' }
  },
  {
    id: 'badge-master-pedagogika',
    title: 'Etopedický specialista',
    description: 'Dosáhni alespoň 90 % v testu z předmětu Pedagogika.',
    category: 'subjects',
    tier: 'silver',
    iconName: 'GraduationCap',
    xpReward: 200,
    requirement: { type: 'subject_mastery', target: 90, subject: 'Pedagogika' }
  },
  {
    id: 'badge-master-administrativa',
    title: 'Spisový archivář ETŘ',
    description: 'Dosáhni alespoň 90 % v testu z Vězeňské administrativy.',
    category: 'subjects',
    tier: 'silver',
    iconName: 'FileText',
    xpReward: 200,
    requirement: { type: 'subject_mastery', target: 90, subject: 'Vězeňská administrativa' }
  },
  {
    id: 'badge-master-etika',
    title: 'Strážce etického kodexu',
    description: 'Dosáhni alespoň 90 % v testu z předmětu Profesní etika.',
    category: 'subjects',
    tier: 'silver',
    iconName: 'HeartHandshake',
    xpReward: 200,
    requirement: { type: 'subject_mastery', target: 90, subject: 'Profesní etika' }
  },

  // --- POZNÁVAČKA & PEXESO ---
  {
    id: 'badge-match-first',
    title: 'Bystré oko',
    description: 'Dokonči svoji 1. kategorii v interaktivní Poznávačce / Pexesu.',
    category: 'matching',
    tier: 'bronze',
    iconName: 'LayoutGrid',
    xpReward: 75,
    requirement: { type: 'matching_count', target: 1 }
  },
  {
    id: 'badge-match-flawless',
    title: 'Bez jediného zaváhání',
    description: 'Dokonči hru v Poznávačce bez jediné chybné volby.',
    category: 'matching',
    tier: 'silver',
    iconName: 'Zap',
    xpReward: 150,
    requirement: { type: 'matching_flawless', target: 1 }
  },
  {
    id: 'badge-match-speed',
    title: 'Bleskový reflex',
    description: 'Dokonči kategorii v Poznávačce za méně než 25 sekund.',
    category: 'matching',
    tier: 'gold',
    iconName: 'Timer',
    xpReward: 200,
    requirement: { type: 'matching_speed', target: 25 }
  },
  {
    id: 'badge-match-master',
    title: 'Absolutní přehled',
    description: 'Spoj všechny pojmy a dokonči všech 8 kategorií v Poznávačce.',
    category: 'matching',
    tier: 'diamond',
    iconName: 'Trophy',
    xpReward: 400,
    requirement: { type: 'matching_all_categories', target: 8 }
  },

  // --- VYTRVALOST, SÉRIE A XP ---
  {
    id: 'badge-streak-3',
    title: 'Denní hlídka',
    description: 'Vrať se k výcviku a studiu alespoň 3 dny v řadě.',
    category: 'streaks',
    tier: 'silver',
    iconName: 'Flame',
    xpReward: 150,
    requirement: { type: 'streak_days', target: 3 }
  },
  {
    id: 'badge-streak-7',
    title: 'Železná kázeň',
    description: 'Udrž studijní sérii po dobu 7 po sobě jdoucích dnů.',
    category: 'streaks',
    tier: 'gold',
    iconName: 'Medal',
    xpReward: 400,
    requirement: { type: 'streak_days', target: 7 }
  },
  {
    id: 'badge-xp-1000',
    title: 'Zasvěcený kadet',
    description: 'Nasbírej celkem 1 000 zkušenostních bodů (XP).',
    category: 'streaks',
    tier: 'bronze',
    iconName: 'Star',
    xpReward: 100,
    requirement: { type: 'total_xp', target: 1000 }
  },
  {
    id: 'badge-xp-5000',
    title: 'Elitní důstojník',
    description: 'Dosáhni hranice 5 000 XP a postoup mezi veterány sboru.',
    category: 'streaks',
    tier: 'platinum',
    iconName: 'Crown',
    xpReward: 500,
    requirement: { type: 'total_xp', target: 5000 }
  }
];
