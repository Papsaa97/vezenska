import type { UserRole } from '../types';
import type { NavTab } from './navTabs';

/**
 * Obsah nápovědy (otazník v hlavičce).
 *
 * PRAVIDLA PRO ÚPRAVY: popisuj jen to, co aplikace opravdu dělá, a popisky
 * tlačítek piš přesně tak, jak jsou v rozhraní — student podle nich hledá.
 * Portál je studijní pomůcka akademie, ne oficiální systém VS ČR; tak o něm
 * také mluv. Když se změní chování (např. kdo smí měnit třídu), oprav i tuhle
 * nápovědu.
 */

export type HelpGroupId = 'zaciname' | 'trida' | 'studium' | 'ucet' | 'velitel' | 'lektor' | 'spravce' | 'otazky';

export interface HelpGroup {
  id: HelpGroupId;
  label: string;
}

export type HelpBlock =
  | { kind: 'p'; text: string }
  | { kind: 'tip'; text: string }
  | { kind: 'list' | 'steps'; title?: string; items: string[] };

export interface HelpSection {
  id: string;
  group: HelpGroupId;
  title: string;
  /** Jedna věta pod nadpisem — o čem kapitola je. */
  summary: string;
  blocks: HelpBlock[];
  /** Záložka, do které kapitola vede (tlačítko „Otevřít záložku …“). */
  tab?: NavTab;
}

export const HELP_GROUPS: HelpGroup[] = [
  { id: 'zaciname', label: 'Začínáme' },
  { id: 'trida', label: 'Moje třída' },
  { id: 'studium', label: 'Studium' },
  { id: 'ucet', label: 'Účet a nastavení' },
  { id: 'velitel', label: 'Pro velitele třídy' },
  { id: 'lektor', label: 'Pro lektory' },
  { id: 'spravce', label: 'Pro správce' },
  { id: 'otazky', label: 'Časté otázky' },
];

/** Které skupiny kapitol daná role uvidí. */
export function groupsForRole(role: UserRole): HelpGroupId[] {
  const common: HelpGroupId[] = ['zaciname', 'trida', 'studium', 'ucet'];
  switch (role) {
    case 'velitel_tridy':
      return [...common, 'velitel', 'otazky'];
    case 'lektor':
      return [...common, 'velitel', 'lektor', 'otazky'];
    case 'admin':
      return [...common, 'velitel', 'lektor', 'spravce', 'otazky'];
    default:
      return [...common, 'otazky'];
  }
}

export const HELP_SECTIONS: HelpSection[] = [];
