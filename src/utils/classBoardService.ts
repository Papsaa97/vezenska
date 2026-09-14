import { supabase } from '../lib/supabase';

// ─── Výsledky operací ────────────────────────────────────────────────────────
//
// Nástěnka je SDÍLENÝ obsah — rozvrh, služby a ústrojová kázeň, které velitel
// třídy píše pro ostatní. Když zápis do databáze selže, data skončí jen
// v localStorage autora a nikdo další je neuvidí. Dřív o tom volající nevěděl
// nic: funkce chybu zalogovaly do konzole a vrátily uložený objekt, jako by se
// operace povedla. Proto každá operace hlásí, jestli se dostala na server.

export interface PersistResult<T> {
  /** Uložená položka. Vrací se i při neúspěchu — lokální kopie existuje vždy. */
  item: T;
  /** True = změna dorazila do databáze. False = uloženo jen v tomto zařízení. */
  persisted: boolean;
  /** Popis chyby pro uživatele, nebo null při úspěchu. */
  error: string | null;
}

export interface DeleteResult {
  /** True = smazáno i v databázi. False = zmizelo jen z tohoto zařízení. */
  persisted: boolean;
  error: string | null;
}

export interface FetchResult<T> {
  items: T[];
  /**
   * Odkud data pocházejí.
   *
   * 'server' — čerstvá data z databáze.
   * 'local'  — záložní kopie ze zařízení. Buď se nepodařilo spojit se serverem
   *            (pak je vyplněno `error`), nebo databáze zatím nic neobsahuje
   *            a použila se výchozí sada (pak je `error` null).
   */
  source: 'server' | 'local';
  error: string | null;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type DutyType = 'pankrac' | 'recepce' | 'strelby' | 'zkouska' | 'jine';

export interface DutyRosterItem {
  id: string;
  type: DutyType;
  title: string;              // např. "Výpomoc VV Praha - Pankrác", "Služba na recepci Akademie"
  date: string;               // např. "2026-09-18" nebo "18. 9. 2026"
  time?: string;              // např. "06:30 – 15:30"
  location?: string;          // např. "Vazební věznice Pankrác (hlavní brána)"
  attendees?: string;         // např. "Novák, Dvořák, Svoboda, Černý"
  uniform?: string;           // např. "PS II, vysoká služební obuv, služební průkaz"
  notes?: string;             // např. "Sraz před vchodem Akademie v 06:15, odjezd služebním mikrobusem"
}

export interface DayUniformItem {
  day: string;            // 'Pondělí' | 'Úterý' | 'Středa' | 'Čtvrtek' | 'Pátek' nebo libovolný den
  outfit: string;         // např. "PS II, čepice"
  hasWorkout?: boolean;   // volba Cvičení / Tělocvik
  workoutNote?: string;   // doplňující poznámka k věcem na cvičení
}

export interface UniformGuidance {
  days?: DayUniformItem[];
  notes?: string;         // poznámka velitele třídy
  updatedBy?: string;
  updatedAt?: string;
  // Zpětná kompatibilita pro starší záznamy:
  today?: string;
  tomorrow?: string;
  dayAfterTomorrow?: string;
}

export const CZECH_WEEK_DAYS = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek'];

export function getTodayCzechName(): string {
  const czechDays = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
  const dayIdx = new Date().getDay();
  return czechDays[dayIdx] || 'Pondělí';
}

export function getDefaultUniformDays(): DayUniformItem[] {
  return [
    { day: 'Pondělí', outfit: 'PS II', hasWorkout: false },
    { day: 'Úterý', outfit: 'PS II', hasWorkout: false },
    { day: 'Středa', outfit: 'PS II', hasWorkout: false },
    { day: 'Čtvrtek', outfit: 'PS II', hasWorkout: false },
    { day: 'Pátek', outfit: 'PS II', hasWorkout: false },
  ];
}

export function normalizeUniformDays(guidance?: UniformGuidance): DayUniformItem[] {
  if (!guidance) return getDefaultUniformDays();
  if (Array.isArray(guidance.days)) {
    return guidance.days;
  }
  const result: DayUniformItem[] = [];
  if (guidance.today) {
    result.push({ day: 'Pondělí', outfit: guidance.today, hasWorkout: false });
  }
  if (guidance.tomorrow) {
    const isWorkout =
      guidance.tomorrow.toLowerCase().includes('tělocvik') ||
      guidance.tomorrow.toLowerCase().includes('cvičení') ||
      guidance.tomorrow.toLowerCase().includes('sebeobran');
    result.push({
      day: 'Úterý',
      outfit: isWorkout ? 'PS II' : guidance.tomorrow,
      hasWorkout: isWorkout,
      workoutNote: isWorkout ? 'Věci na cvičení do tělocvičny s sebou' : undefined,
    });
  }
  if (guidance.dayAfterTomorrow) {
    result.push({ day: 'Středa', outfit: guidance.dayAfterTomorrow, hasWorkout: false });
  }

  const existingDays = result.map((x) => x.day);
  for (const d of CZECH_WEEK_DAYS) {
    if (!existingDays.includes(d)) {
      result.push({ day: d, outfit: 'PS II', hasWorkout: false });
    }
  }
  return result;
}

export interface UpcomingUniformInfo {
  targetDayLabel: string;
  item?: DayUniformItem;
  hasWorkout?: boolean;
}

export function getUpcomingUniformInfo(guidance?: UniformGuidance): UpcomingUniformInfo {
  const days = normalizeUniformDays(guidance);
  if (!days || days.length === 0) {
    return { targetDayLabel: 'Ústroj' };
  }

  const czechDays = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
  const dayIdx = new Date().getDay();
  const tomorrowIdx = (dayIdx + 1) % 7;
  const tomorrowName = czechDays[tomorrowIdx];
  const todayName = czechDays[dayIdx];

  const tomorrowItem = days.find((d) => d.day.toLowerCase() === tomorrowName.toLowerCase());
  if (tomorrowItem) {
    return {
      targetDayLabel: `Zítra (${tomorrowItem.day})`,
      item: tomorrowItem,
      hasWorkout: !!tomorrowItem.hasWorkout,
    };
  }

  const todayItem = days.find((d) => d.day.toLowerCase() === todayName.toLowerCase());
  if (todayItem) {
    return {
      targetDayLabel: `Dnes (${todayItem.day})`,
      item: todayItem,
      hasWorkout: !!todayItem.hasWorkout,
    };
  }

  return {
    targetDayLabel: days[0].day,
    item: days[0],
    hasWorkout: !!days[0].hasWorkout,
  };
}

export interface CourseCountdownInfo {
  status: 'upcoming' | 'in_progress' | 'completed' | 'unset';
  formattedPeriod?: string;          // např. "1. 9. 2026 – 18. 12. 2026"
  headline: string;                  // např. "Do ukončení kurzu zbývá", "Do zahájení zbývá", "Kurz ukončen"
  remainingText: string;             // např. "3 měsíce, 1 týden, 2 dny"
  totalDaysRemaining?: number;
  progressPercent?: number;          // 0 až 100
  elapsedText?: string;              // např. "4. týden z 16"
}

function formatDateCz(isoDate: string): string {
  try {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parseInt(parts[2], 10)}. ${parseInt(parts[1], 10)}. ${parts[0]}`;
    }
    const d = new Date(isoDate);
    return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
  } catch {
    return isoDate;
  }
}

function pluralCz(count: number, one: string, few: string, many: string): string {
  if (count === 1) return `${count} ${one}`;
  if (count >= 2 && count <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
}

export function formatRemainingTime(daysCount: number): string {
  if (daysCount <= 0) return '0 dní';
  const months = Math.floor(daysCount / 30);
  const remainingAfterMonths = daysCount % 30;
  const weeks = Math.floor(remainingAfterMonths / 7);
  const days = remainingAfterMonths % 7;

  const parts: string[] = [];
  if (months > 0) {
    parts.push(pluralCz(months, 'měsíc', 'měsíce', 'měsíců'));
  }
  if (weeks > 0) {
    parts.push(pluralCz(weeks, 'týden', 'týdny', 'týdnů'));
  }
  if (days > 0 || parts.length === 0) {
    parts.push(pluralCz(days, 'den', 'dny', 'dní'));
  }

  return parts.join(', ');
}

export function getCourseCountdown(
  startDateStr?: string | null,
  endDateStr?: string | null
): CourseCountdownInfo {
  if (!endDateStr && !startDateStr) {
    return {
      status: 'unset',
      headline: 'Termín kurzu',
      remainingText: 'Termín nestanoven',
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let start: Date | null = null;
  let end: Date | null = null;

  if (startDateStr) {
    const sParts = startDateStr.split('-').map(Number);
    if (sParts.length === 3) {
      start = new Date(sParts[0], sParts[1] - 1, sParts[2]);
    } else {
      start = new Date(startDateStr);
    }
  }

  if (endDateStr) {
    const eParts = endDateStr.split('-').map(Number);
    if (eParts.length === 3) {
      end = new Date(eParts[0], eParts[1] - 1, eParts[2]);
    } else {
      end = new Date(endDateStr);
    }
  }

  const formattedPeriod =
    startDateStr && endDateStr
      ? `${formatDateCz(startDateStr)} – ${formatDateCz(endDateStr)}`
      : endDateStr
      ? `Konec: ${formatDateCz(endDateStr)}`
      : `Od: ${formatDateCz(startDateStr!)}`;

  if (!start && end) {
    const diffMs = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return {
        status: 'completed',
        formattedPeriod,
        headline: 'Stav kurzu',
        remainingText: 'Kurz úspěšně ukončen',
        totalDaysRemaining: 0,
        progressPercent: 100,
      };
    }
    return {
      status: 'in_progress',
      formattedPeriod,
      headline: 'Do ukončení kurzu zbývá',
      remainingText: formatRemainingTime(diffDays),
      totalDaysRemaining: diffDays,
    };
  }

  if (start && !end) {
    const diffMs = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      return {
        status: 'upcoming',
        formattedPeriod,
        headline: 'Do zahájení kurzu zbývá',
        remainingText: formatRemainingTime(diffDays),
        totalDaysRemaining: diffDays,
        progressPercent: 0,
      };
    }
    return {
      status: 'in_progress',
      formattedPeriod,
      headline: 'Stav kurzu',
      remainingText: 'Kurz probíhá',
    };
  }

  if (start && end) {
    const totalDurationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (elapsedDays < 0) {
      const daysUntilStart = Math.abs(elapsedDays);
      return {
        status: 'upcoming',
        formattedPeriod,
        headline: 'Do zahájení kurzu zbývá',
        remainingText: formatRemainingTime(daysUntilStart),
        totalDaysRemaining: daysUntilStart,
        progressPercent: 0,
      };
    }

    if (remainingDays < 0) {
      return {
        status: 'completed',
        formattedPeriod,
        headline: 'Stav kurzu',
        remainingText: 'Kurz úspěšně ukončen',
        totalDaysRemaining: 0,
        progressPercent: 100,
        elapsedText: '100 % dokončeno',
      };
    }

    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDurationDays) * 100)));
    const totalWeeks = Math.max(1, Math.round(totalDurationDays / 7));
    const currentWeek = Math.min(totalWeeks, Math.max(1, Math.ceil(elapsedDays / 7)));

    return {
      status: 'in_progress',
      formattedPeriod,
      headline: 'Do ukončení kurzu zbývá',
      remainingText: formatRemainingTime(remainingDays),
      totalDaysRemaining: remainingDays,
      progressPercent,
      elapsedText: `${currentWeek}. týden z ${totalWeeks}`,
    };
  }

  return {
    status: 'unset',
    headline: 'Termín kurzu',
    remainingText: 'Termín nestanoven',
  };
}

export interface LinkedMaterialItem {
  id: string;
  title: string;
  url: string;
  subject?: string;
  sizeLabel?: string;
}

export interface ClassSection {
  id: string;
  type: 'event' | 'duty' | 'uniform' | 'links' | 'notice' | 'custom';
  title: string;
  content: string;
  date?: string;
  badge?: string;
  badgeColor?: string;
}

export interface ClassBoardItem {
  id: string;
  className: string;
  courseStartDate?: string | null;
  courseEndDate?: string | null;
  scheduleUrl?: string | null;
  scheduleStoragePath?: string | null;
  infoText: string;
  dutyRoster?: DutyRosterItem[];
  uniformGuidance?: UniformGuidance;
  linkedMaterials?: LinkedMaterialItem[];
  sections?: ClassSection[];
  updatedAt: string;
  createdAt?: string;
  updatedBy?: string | null;
}

export interface GlobalAnnouncement {
  id: string;
  title: string;
  content: string;
  badge?: string;             // např. "CELOŠKOLNÍ ROZKAZ", "REŽIM AKADEMIE", "DŮLEŽITÉ"
  date: string;
  author: string;             // např. "Vedení Akademie VS ČR"
  priority?: 'normal' | 'high' | 'urgent';
  updatedAt: string;
}

export type ClassBoardInput = Omit<ClassBoardItem, 'id' | 'updatedAt'> & {
  id?: string;
};

// ─── Constants & Seed Data ───────────────────────────────────────────────────

const STORAGE_KEY = 'vscr_class_boards';
const GLOBAL_ANNOUNCEMENTS_KEY = 'vscr_global_announcements';
const MY_CLASS_KEY = 'vscr_my_class';
const HIDDEN_CLASSES_KEY = 'vscr_hidden_classes';
const BUCKET_NAME = 'studijni-materialy';
const FOLDER_NAME = 'rozvrhy';

/**
 * Počáteční celoškolní hlášení (platná pro všechny třídy a posluchače).
 */
export const INITIAL_GLOBAL_ANNOUNCEMENTS: GlobalAnnouncement[] = [
  {
    id: 'global-announcement-1',
    title: 'Mimořádné bezpečnostní hlášení velitele Akademie VS ČR',
    content: `Vzhledem k plánovaným prověrkám fyzické zdatnosti a střelecké přípravy platí v celém areálu Akademie VS ČR přísný zákaz opuštění ubytovacích prostor bez vědomí dozorčího po 21:30.
Dále se připomíná všem posluchačům povinnost nosit služební průkaz viditelně na oděvu nebo v pouzdře dle Nařízení generálního ředitele.`,
    badge: 'CELOŠKOLNÍ ROZKAZ',
    date: '14. 9. 2026',
    author: 'Velitel výcviku plk. Mgr. Horák',
    priority: 'urgent',
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'global-announcement-2',
    title: 'Výdej stravy a provoz školní jídelny',
    content: `Od pondělí 15. 9. 2026 je posunut výdej obědů pro třídy Základní odborné přípravy:
• ZOP A11 a ZOP B04: 11:30 – 12:15
• ZOP K02 a ostatní kurzy: 12:15 – 13:00
Prosíme o dodržování časových oken pro zamezení front u výdejních pultů.`,
    badge: 'REŽIM AKADEMIE',
    date: '12. 9. 2026',
    author: 'Hospodářská správa Akademie',
    priority: 'normal',
    updatedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

/**
 * Počáteční realistická data pro jednotlivé třídy ZOP.
 */
export const INITIAL_CLASS_BOARDS: ClassBoardItem[] = [
  {
    id: 'zop-a11',
    className: 'ZOP A11',
    courseStartDate: '2026-09-01',
    courseEndDate: '2026-12-18',
    scheduleUrl: null,
    infoText: `• Pondělí 15. 9. 2026: Změna učebny – Penologie přesunuta do posluchárny B2 (2. patro).
• Středa 17. 9. 2026: Střelby posunuty na 13:00 (Střelnice Akademie, plná polní výstroj a chrániče sluchu).
• Pátek 19. 9. 2026: Průběžný test z Právní přípravy (Zákon č. 555/1992 Sb. a donucovací prostředky).
• Upozornění: Odevzdání seminárních prací z Profesní etiky do pátku 12:00 lektorovi.`,
    dutyRoster: [
      {
        id: 'duty-a11-1',
        type: 'pankrac',
        title: 'Výpomoc VV Praha - Pankrác (Eskortní oddělení)',
        date: '22. 9. 2026',
        time: '06:30 – 15:30',
        location: 'Vazební věznice Praha - Pankrác (hlavní vchod)',
        attendees: 'stržm. Novák, stržm. Dvořák, stržm. Kovář, stržm. Svoboda (4 posluchači)',
        uniform: 'Pracovní stejnokroj PS II, vysoká taktická obuv, taktický opasek, služební průkaz',
        notes: 'Sraz před vchodem Akademie v 06:00, odjezd služebním mikrobusem. Poučení velitele eskorty na místě.',
      },
      {
        id: 'duty-a11-2',
        type: 'recepce',
        title: 'Služba na recepci a vchodu Akademie VS ČR',
        date: '19. 9. 2026',
        time: '06:00 – 18:00 (denní směna)',
        location: 'Recepce Akademie VS ČR (hlavní brána)',
        attendees: 'stržm. Černý, stržm. Veselý',
        uniform: 'Služební stejnokroj, vázanka, služební odznak, čistá obuv',
        notes: 'Evidence návštěv, klíčové hospodářství, součinnost s dozorčím Akademie.',
      },
    ],
    uniformGuidance: {
      days: [
        { day: 'Pondělí', outfit: 'PS II, čepice', hasWorkout: false },
        { day: 'Úterý', outfit: 'PS II', hasWorkout: true, workoutNote: 'Věci na sebeobranu do tělocvičny s sebou' },
        { day: 'Středa', outfit: 'PS II (učebna)', hasWorkout: false },
        { day: 'Čtvrtek', outfit: 'PS II', hasWorkout: true, workoutNote: 'Kondiční příprava / tělocvik' },
        { day: 'Pátek', outfit: 'PS II', hasWorkout: false },
      ],
      notes: 'Přezůvky do tělocvičny a čistý ručník s sebou.',
      updatedBy: 'Velitel třídy prap. Novotný',
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    linkedMaterials: [
      {
        id: 'mat-1',
        title: 'Právní rámec donucovacích prostředků – Zákon č. 555/1992 Sb.',
        url: '#',
        subject: 'Právo',
        sizeLabel: '2.4 MB (PDF)',
      },
      {
        id: 'mat-2',
        title: 'Bezpečnostní postupy při eskortách vězněných osob',
        url: '#',
        subject: 'Taktika',
        sizeLabel: '4.1 MB (PDF)',
      },
      {
        id: 'mat-3',
        title: 'Střelecká příprava – rozborka a sborka CZ 75 B',
        url: '#',
        subject: 'Zbraně',
        sizeLabel: '1.8 MB (DOCX)',
      },
    ],
    sections: [
      {
        id: 'sec-a11-1',
        type: 'notice',
        title: 'Příprava na prověrku z Penologie',
        content: 'Lektor mjr. PhDr. Mareček upozorňuje, že otázky k diferenciaci odsouzených budou vycházet ze Zákona č. 169/1999 Sb. Materiály jsou dostupné v Knihovně.',
        date: '16. 9. 2026',
        badge: 'ZKOUŠKA',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      },
    ],
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'zop-b04',
    className: 'ZOP B04',
    courseStartDate: '2026-08-17',
    courseEndDate: '2026-11-27',
    scheduleUrl: null,
    infoText: `• Úterý 16. 9. 2026: Praktický výcvik sebeobrany a eskortní činnosti v tělocvičně od 08:30.
• Čtvrtek 18. 9. 2026: Exkurze a praktická stáž na eskortním oddělení (sraz před hlavní budovou v 07:45).
• Lékařské prohlídky pro skupinu 2 proběhnou ve čtvrtek od 10:30 na zdravotnickém středisku.
• Studijní materiály k předmětu Bezpečnostní služba naleznete v sekci Knihovna.`,
    dutyRoster: [
      {
        id: 'duty-b04-1',
        type: 'recepce',
        title: 'Služba na recepci Akademie VS ČR (Noční směna)',
        date: '21. 9. 2026',
        time: '18:00 – 06:00',
        location: 'Recepce Akademie VS ČR',
        attendees: 'stržm. Král, stržm. Procházka',
        uniform: 'Pracovní stejnokroj PS II, reflexní vesta pro noční kontrolu obvodu',
        notes: 'Noční uzávěra areálu ve 22:00, kontrola osvětlení a vjezdové brány.',
      },
    ],
    uniformGuidance: {
      days: [
        { day: 'Pondělí', outfit: 'PS II, blůza', hasWorkout: false },
        { day: 'Úterý', outfit: 'PS II', hasWorkout: true, workoutNote: 'Praktický výcvik sebeobrany od 08:30' },
        { day: 'Středa', outfit: 'PS II', hasWorkout: false },
        { day: 'Čtvrtek', outfit: 'PS II + taktický opasek', hasWorkout: false },
        { day: 'Pátek', outfit: 'PS II', hasWorkout: false },
      ],
      notes: 'Ráno sraz v 07:45, kontrola odznaků a služebních průkazů.',
      updatedBy: 'Velitel třídy prap. Bartoš',
      updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    linkedMaterials: [
      {
        id: 'mat-b4-1',
        title: 'Manipulace s pouty a donucovacími prostředky',
        url: '#',
        subject: 'Taktika',
        sizeLabel: '3.2 MB (PDF)',
      },
    ],
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'zop-k02',
    className: 'ZOP K02',
    courseStartDate: '2026-10-01',
    courseEndDate: '2027-01-29',
    scheduleUrl: null,
    infoText: `• Zahájení kurzu: Uvítání vedením Akademie a instruktáž BOZP v hlavní aule.
• Vyzvednutí studijních průkazů a klíčů od šatních skříněk u hospodáře do 15:00.
• Rozvrh na nadcházející 2 týdny bude zveřejněn po schválení velitelem výcviku.`,
    dutyRoster: [],
    uniformGuidance: {
      days: [
        { day: 'Pondělí', outfit: 'Služební stejnokroj (slavnostní zahájení)', hasWorkout: false },
        { day: 'Úterý', outfit: 'PS II', hasWorkout: false },
        { day: 'Středa', outfit: 'PS II', hasWorkout: true, workoutNote: 'Základní tělesná příprava do tělocvičny' },
        { day: 'Čtvrtek', outfit: 'PS II', hasWorkout: false },
        { day: 'Pátek', outfit: 'PS II', hasWorkout: false },
      ],
      notes: 'V pondělí včasný příchod na slavnostní zahájení v aule.',
      updatedBy: 'Velitel třídy npor. Sedlák',
      updatedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    updatedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

// ─── Local Storage & Preference Helpers ───────────────────────────────────────

export function getMyClass(): string {
  if (typeof window === 'undefined') return 'ZOP A11';
  return localStorage.getItem(MY_CLASS_KEY) || 'ZOP A11';
}

export function setMyClass(className: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MY_CLASS_KEY, className.trim());
}

export function getHiddenClassIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HIDDEN_CLASSES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleHideClass(classId: string): string[] {
  if (typeof window === 'undefined') return [];
  const current = getHiddenClassIds();
  const next = current.includes(classId)
    ? current.filter((id) => id !== classId)
    : [...current, classId];
  try {
    localStorage.setItem(HIDDEN_CLASSES_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn('[ClassBoard] Chyba při ukládání skrytých tříd:', err);
  }
  return next;
}

function loadLocalBoards(): ClassBoardItem[] {
  if (typeof window === 'undefined') return INITIAL_CLASS_BOARDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CLASS_BOARDS));
      return INITIAL_CLASS_BOARDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let hasMigration = false;
      const migrated = (parsed as ClassBoardItem[]).map((item) => {
        const seed = INITIAL_CLASS_BOARDS.find((s) => s.id === item.id);
        if (item.courseStartDate === undefined && seed?.courseStartDate) {
          item.courseStartDate = seed.courseStartDate;
          item.courseEndDate = seed.courseEndDate;
          hasMigration = true;
        }
        if (item.uniformGuidance && !Array.isArray(item.uniformGuidance.days)) {
          if (seed?.uniformGuidance?.days) {
            item.uniformGuidance.days = seed.uniformGuidance.days;
            item.uniformGuidance.notes = seed.uniformGuidance.notes;
          } else {
            item.uniformGuidance.days = normalizeUniformDays(item.uniformGuidance);
          }
          hasMigration = true;
        }
        return item;
      });
      if (hasMigration) {
        saveLocalBoards(migrated);
      }
      return migrated;
    }
    return INITIAL_CLASS_BOARDS;
  } catch (err) {
    console.warn('[ClassBoard] Chyba při čtení z localStorage, použity výchozí třídy:', err);
    return INITIAL_CLASS_BOARDS;
  }
}

function saveLocalBoards(items: ClassBoardItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('[ClassBoard] Chyba při ukládání do localStorage:', err);
  }
}

// ─── Global Announcements ─────────────────────────────────────────────────────

export function loadLocalGlobalAnnouncements(): GlobalAnnouncement[] {
  if (typeof window === 'undefined') return INITIAL_GLOBAL_ANNOUNCEMENTS;
  try {
    const raw = localStorage.getItem(GLOBAL_ANNOUNCEMENTS_KEY);
    if (!raw) {
      localStorage.setItem(GLOBAL_ANNOUNCEMENTS_KEY, JSON.stringify(INITIAL_GLOBAL_ANNOUNCEMENTS));
      return INITIAL_GLOBAL_ANNOUNCEMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as GlobalAnnouncement[];
    }
    return INITIAL_GLOBAL_ANNOUNCEMENTS;
  } catch {
    return INITIAL_GLOBAL_ANNOUNCEMENTS;
  }
}

export function saveLocalGlobalAnnouncements(items: GlobalAnnouncement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GLOBAL_ANNOUNCEMENTS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('[ClassBoard] Chyba při ukládání celoškolních hlášení:', err);
  }
}

export async function fetchGlobalAnnouncements(): Promise<FetchResult<GlobalAnnouncement>> {
  try {
    const { data, error } = await supabase
      .from('global_announcements')
      .select('*')
      .order('updated_at', { ascending: false });

    // Chyba a prázdný výsledek se dřív řešily stejně, takže nešlo poznat
    // nedostupný server od databáze, ve které opravdu nic není.
    if (error) {
      return {
        items: loadLocalGlobalAnnouncements(),
        source: 'local',
        error: `Hlášení se nepodařilo načíst ze serveru (${error.message}).`,
      };
    }

    if (!data || data.length === 0) {
      return { items: loadLocalGlobalAnnouncements(), source: 'local', error: null };
    }

    const items = (data as Array<{
      id: string;
      title: string;
      content: string;
      badge?: string;
      date: string;
      author: string;
      priority?: 'normal' | 'high' | 'urgent';
      updated_at: string;
    }>).map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      badge: row.badge,
      date: row.date,
      author: row.author,
      priority: row.priority,
      updatedAt: row.updated_at,
    }));

    saveLocalGlobalAnnouncements(items);
    return { items, source: 'server', error: null };
  } catch (err) {
    return {
      items: loadLocalGlobalAnnouncements(),
      source: 'local',
      error: `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`,
    };
  }
}

export async function saveGlobalAnnouncement(
  item: Omit<GlobalAnnouncement, 'id' | 'updatedAt'> & { id?: string }
): Promise<PersistResult<GlobalAnnouncement>> {
  const now = new Date().toISOString();
  const id = item.id || `announcement-${Date.now()}`;
  const record: GlobalAnnouncement = {
    ...item,
    id,
    updatedAt: now,
  };

  // POZOR: klient Supabase chybu databáze NEVYHAZUJE, vrací ji v `error`.
  // Dokud se `error` nečetl, neozval se ani tenhle catch — selhání zápisu bylo
  // úplně neviditelné a celoškolní hlášení zůstalo jen v prohlížeči autora.
  let persistError: string | null = null;
  try {
    const { error } = await supabase.from('global_announcements').upsert(
      {
        id: record.id,
        title: record.title,
        content: record.content,
        badge: record.badge,
        date: record.date,
        author: record.author,
        priority: record.priority,
        updated_at: record.updatedAt,
      },
      { onConflict: 'id' }
    );
    if (error) {
      persistError = `Hlášení se nepodařilo uložit na server (${error.message}).`;
    }
  } catch (err) {
    persistError = `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`;
  }

  const current = loadLocalGlobalAnnouncements();
  const idx = current.findIndex((x) => x.id === id);
  let next: GlobalAnnouncement[];
  if (idx !== -1) {
    next = [...current];
    next[idx] = record;
  } else {
    next = [record, ...current];
  }
  saveLocalGlobalAnnouncements(next);
  return { item: record, persisted: persistError === null, error: persistError };
}

export async function deleteGlobalAnnouncement(id: string): Promise<DeleteResult> {
  let persistError: string | null = null;
  try {
    const { error } = await supabase.from('global_announcements').delete().eq('id', id);
    if (error) {
      persistError = `Hlášení se nepodařilo smazat na serveru (${error.message}).`;
    }
  } catch (err) {
    persistError = `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`;
  }

  const current = loadLocalGlobalAnnouncements();
  const next = current.filter((x) => x.id !== id);
  saveLocalGlobalAnnouncements(next);

  return { persisted: persistError === null, error: persistError };
}

// ─── Class Board Service ──────────────────────────────────────────────────────

interface SupabaseClassBoardRow {
  id: string;
  class_name: string;
  course_start_date?: string | null;
  course_end_date?: string | null;
  schedule_url: string | null;
  schedule_storage_path?: string | null;
  info_text: string;
  duty_roster?: DutyRosterItem[];
  uniform_guidance?: UniformGuidance;
  linked_materials?: LinkedMaterialItem[];
  sections?: ClassSection[];
  updated_at: string;
  created_at: string;
  updated_by?: string | null;
}

function mapRowToItem(row: SupabaseClassBoardRow): ClassBoardItem {
  let uniformGuidance = row.uniform_guidance;
  if (uniformGuidance && !Array.isArray(uniformGuidance.days)) {
    uniformGuidance = {
      ...uniformGuidance,
      days: normalizeUniformDays(uniformGuidance),
    };
  }

  return {
    id: row.id,
    className: row.class_name,
    courseStartDate: row.course_start_date ?? null,
    courseEndDate: row.course_end_date ?? null,
    scheduleUrl: row.schedule_url,
    scheduleStoragePath: row.schedule_storage_path,
    infoText: row.info_text,
    dutyRoster: row.duty_roster ?? [],
    uniformGuidance,
    linkedMaterials: row.linked_materials ?? [],
    sections: row.sections ?? [],
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    updatedBy: row.updated_by,
  };
}

/**
 * Načte všechny třídy z databáze Supabase nebo localStorage.
 */
export async function fetchClassBoards(): Promise<FetchResult<ClassBoardItem>> {
  try {
    const { data, error } = await supabase
      .from('class_boards')
      .select('*')
      .order('class_name', { ascending: true });

    if (error) {
      return {
        items: loadLocalBoards(),
        source: 'local',
        error: `Třídy se nepodařilo načíst ze serveru (${error.message}).`,
      };
    }

    if (data && data.length > 0) {
      const items = (data as SupabaseClassBoardRow[]).map(mapRowToItem);
      saveLocalBoards(items);
      return { items, source: 'server', error: null };
    }

    // Prázdná databáze není chyba — použije se výchozí sada tříd (INITIAL_CLASS_BOARDS).
    return { items: loadLocalBoards(), source: 'local', error: null };
  } catch (err) {
    return {
      items: loadLocalBoards(),
      source: 'local',
      error: `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`,
    };
  }
}

/**
 * Uloží (vytvoří nebo aktualizuje) kartu třídy.
 */
export async function saveClassBoard(
  input: ClassBoardInput,
  userEmail?: string | null
): Promise<PersistResult<ClassBoardItem>> {
  const now = new Date().toISOString();
  const id = input.id || `class-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const itemToSave: ClassBoardItem = {
    id,
    className: input.className.trim(),
    courseStartDate: input.courseStartDate ?? null,
    courseEndDate: input.courseEndDate ?? null,
    scheduleUrl: input.scheduleUrl || null,
    scheduleStoragePath: input.scheduleStoragePath || null,
    infoText: input.infoText.trim(),
    dutyRoster: input.dutyRoster ?? [],
    uniformGuidance: input.uniformGuidance,
    linkedMaterials: input.linkedMaterials ?? [],
    sections: input.sections ?? [],
    updatedAt: now,
    createdAt: input.createdAt || now,
    updatedBy: userEmail || input.updatedBy || null,
  };

  let persistError: string | null = null;
  try {
    const rowPayload = {
      id: itemToSave.id,
      class_name: itemToSave.className,
      course_start_date: itemToSave.courseStartDate,
      course_end_date: itemToSave.courseEndDate,
      schedule_url: itemToSave.scheduleUrl,
      schedule_storage_path: itemToSave.scheduleStoragePath,
      info_text: itemToSave.infoText,
      duty_roster: itemToSave.dutyRoster,
      uniform_guidance: itemToSave.uniformGuidance,
      linked_materials: itemToSave.linkedMaterials,
      sections: itemToSave.sections,
      updated_at: itemToSave.updatedAt,
      created_at: itemToSave.createdAt,
      updated_by: itemToSave.updatedBy,
    };

    const { error } = await supabase
      .from('class_boards')
      .upsert(rowPayload, { onConflict: 'id' });

    if (error) {
      persistError = `Změnu se nepodařilo uložit na server (${error.message}).`;
    }
  } catch (err) {
    persistError = `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`;
  }

  const localItems = loadLocalBoards();
  const existingIdx = localItems.findIndex((x) => x.id === itemToSave.id);
  let updatedLocal: ClassBoardItem[];
  if (existingIdx !== -1) {
    updatedLocal = [...localItems];
    updatedLocal[existingIdx] = itemToSave;
  } else {
    updatedLocal = [itemToSave, ...localItems];
  }
  saveLocalBoards(updatedLocal);

  return { item: itemToSave, persisted: persistError === null, error: persistError };
}

/**
 * Smaže kartu třídy podle ID.
 */
export async function deleteClassBoard(id: string): Promise<DeleteResult> {
  // Dřív vracela natvrdo `true` bez ohledu na to, co řekla databáze — volající
  // tedy nemohl poznat, že třída zmizela jen z tohoto zařízení a ostatním
  // zůstala na nástěnce dál.
  let persistError: string | null = null;
  try {
    const { error } = await supabase.from('class_boards').delete().eq('id', id);
    if (error) {
      persistError = `Třídu se nepodařilo smazat na serveru (${error.message}).`;
    }
  } catch (err) {
    persistError = `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`;
  }

  const localItems = loadLocalBoards();
  const filtered = localItems.filter((x) => x.id !== id);
  saveLocalBoards(filtered);

  return { persisted: persistError === null, error: persistError };
}

/**
 * Bezpečně nahraje soubor rozvrhu do Supabase Storage bucketu 'studijni-materialy/rozvrhy/'.
 */
export async function uploadScheduleImage(
  file: File,
  className: string
): Promise<{ publicUrl: string; storagePath: string }> {
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMime.includes(file.type)) {
    throw new Error('Nepodporovaný typ souboru. Povoleno: JPG, PNG nebo WebP.');
  }

  const safeClassName = className
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const storagePath = `${FOLDER_NAME}/${safeClassName}_${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Nahrání obrázku do úložiště selhalo: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  if (!urlData?.publicUrl) {
    throw new Error('Nepodařilo se vygenerovat veřejnou URL nahraného rozvrhu.');
  }

  return {
    publicUrl: urlData.publicUrl,
    storagePath,
  };
}
