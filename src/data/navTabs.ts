/**
 * Názvy záložek — JEDEN zdroj pravdy pro celou aplikaci.
 *
 * PROČ TO TU JE: tentýž modul se dřív jmenoval jinak v každém rozhraní.
 * „Kompas zákonů“ v popisku záložky, „Předpisy & § Kompas“ v nabídce
 * v hlavičce, „Předpisy & §“ v mobilní nabídce a „Předpisy & Paragrafy“
 * ve zkratce v manifestu PWA. Student pak marně hledal v hlavičce to, co mu
 * aplikace jinde pojmenovala jinak. Podobně „Administrativa & ETŘ“ versus
 * „Administrativa“ a „Odznaky & Úrovně“ versus „Odznaky“.
 *
 * NÁZEV vs. POPISEK: `NAV_TAB_LABELS` je jméno modulu — je ve všech nabídkách
 * stejné. `NAV_TAB_HINTS` je doplňující věta pod ním; ta se smí lišit délkou
 * podle místa, ale nesmí sloužit jako druhé jméno.
 */

export type NavTab =
  | 'dashboard'
  | 'subjects'
  | 'quiz'
  | 'assistant'
  | 'compass'
  | 'admin'
  | 'ethics'
  | 'scenarios'
  | 'weapons'
  | 'flashcards'
  | 'matching'
  | 'badges'
  | 'statistics'
  | 'library'
  | 'content-manager';

export const NAV_TAB_LABELS: Record<NavTab, string> = {
  dashboard: 'Nástěnka',
  subjects: 'Předměty',
  quiz: 'Zkouška',
  assistant: 'AI Asistent',
  compass: 'Kompas zákonů',
  admin: 'Administrativa & ETŘ',
  ethics: 'Profesní etika',
  scenarios: 'Taktické scénáře',
  weapons: 'Zbraně & Střelba',
  flashcards: 'Kartičky',
  matching: 'Poznávačka',
  badges: 'Odznaky & Úrovně',
  statistics: 'Statistiky',
  library: 'Knihovna',
  'content-manager': 'Správa obsahu',
};

/** Krátké zkratky pro nejtěsnější místa (spodní lišta na telefonu). */
export const NAV_TAB_SHORT_LABELS: Record<NavTab, string> = {
  dashboard: 'Nástěnka',
  subjects: 'Předměty',
  quiz: 'Zkouška',
  assistant: 'Asistent',
  compass: 'Kompas',
  admin: 'Administrativa',
  ethics: 'Etika',
  scenarios: 'Scénáře',
  weapons: 'Zbraně',
  flashcards: 'Kartičky',
  matching: 'Poznávačka',
  badges: 'Odznaky',
  statistics: 'Statistiky',
  library: 'Knihovna',
  'content-manager': 'Správa obsahu',
};

export const VALID_TABS: NavTab[] = Object.keys(NAV_TAB_LABELS) as NavTab[];

/** Je to platný klíč záložky (např. z adresy nebo z localStorage)? */
export function isNavTab(value: string): value is NavTab {
  return Object.prototype.hasOwnProperty.call(NAV_TAB_LABELS, value);
}
