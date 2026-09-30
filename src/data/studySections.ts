/**
 * Textové bloky studijních záložek (Profesní etika, Vězeňská administrativa).
 *
 * Jeden tvar pro všechny: nadpis, úvod, seznam položek a závěr. Rozvržení na
 * obrazovce ale zůstává v komponentě — výchozí blok se podle svého id vykreslí
 * přesně tak, jak vypadal, dokud byl text natvrdo v JSX. Lektor tak mění
 * obsah, ne vzhled, a student bez úprav vidí totéž co dřív.
 *
 * Lektor a správce bloky upravují přes překryv content_blocks (druh
 * 'study_section', migrace 042). Tady je jejich výchozí podoba.
 *
 * FORMÁTOVÁNÍ: v textech se smí jen **tučně** a *kurzíva* (viz RichText.tsx).
 * Dřív tu bylo HTML vkládané přes dangerouslySetInnerHTML; u obsahu, který
 * může psát kdokoli s rolí lektora, by to byla díra pro vložení skriptu.
 */

/** Podzáložka, do které blok patří. */
export type StudySectionArea =
  | 'pojmy'
  | 'kodex'
  | 'protikorupce'
  | 'evp'
  | 'etr'
  | 'vis'
  | 'styl';

export const STUDY_SECTION_AREAS: StudySectionArea[] = ['pojmy', 'kodex', 'protikorupce', 'evp', 'etr', 'vis', 'styl'];

export interface StudySectionItem {
  /** Krátké označení — číslo článku, římská číslice, štítek, oddělení. */
  label: string;
  /** Nadpis položky. */
  title: string;
  /** Hlavní text. Víc odstavců či odrážek se odděluje novým řádkem. */
  text: string;
  /** Doplněk — aplikační význam, opatření, vysvětlivka. */
  note: string;
  /** Pravděpodobnost 1–5 (jen katalog korupčních rizik). */
  probability?: number;
  /** Dopad 1–5 (jen katalog korupčních rizik). */
  impact?: number;
}

export interface StudySection {
  id: string;
  area: StudySectionArea;
  title: string;
  /** Drobný řádek nad nadpisem nebo štítek vedle něj. */
  kicker: string;
  intro: string;
  items: StudySectionItem[];
  outro: string;
}

/**
 * Které části bloku formulář nabídne a jak je pojmenuje.
 *
 * Výchozí bloky nepoužívají všechna pole — třeba u kontaktů protikorupčních
 * linek znamená „text“ e-mail. Obecné popisky by lektora mátly, proto každý
 * výchozí blok říká, co jeho pole znamenají. Pole bez popisku se ve formuláři
 * nezobrazí (a zůstane, jak bylo).
 */
export interface StudySectionFields {
  /** Popisek nadpisu; `titleHidden` říká, že se studentům nezobrazuje. */
  title: string;
  titleHidden?: boolean;
  kicker?: string;
  intro?: string;
  outro?: string;
  itemsLegend: string;
  item: {
    label?: string;
    title?: string;
    text?: string;
    note?: string;
    /** Nabídnout pravděpodobnost a dopad (1–5). */
    rating?: boolean;
  };
}

/** Popisky pro blok, který lektor přidal sám — vykreslí se obecným rozvržením. */
export const GENERIC_SECTION_FIELDS: StudySectionFields = {
  title: 'Nadpis bloku',
  intro: 'Úvodní text',
  outro: 'Závěrečná poznámka',
  itemsLegend: 'Body',
  item: {
    title: 'Nadpis bodu',
    text: 'Text bodu (každý řádek = nový odstavec)',
    note: 'Doplňující poznámka',
  },
};

/** Prázdná položka — výchozí hodnoty volitelných polí, ať se nemusí opakovat. */
export function sectionItem(fields: Partial<StudySectionItem>): StudySectionItem {
  return { label: '', title: '', text: '', note: '', ...fields };
}
