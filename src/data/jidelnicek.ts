/**
 * Jídelníček na nástěnce. Vyplňuje ho lektor nebo správce v aplikaci
 * (content_blocks, druh 'jidelnicek', migrace 040); repozitář drží jen
 * prázdnou výchozí podobu.
 */
export interface JidelnicekDen {
  /** Název dne, např. „Pondělí“. */
  day: string;
  /** Co se ten den vaří — volný text, jídlo na řádek. */
  meals: string;
}

export interface Jidelnicek {
  id: string;
  /** Např. „29. 9. – 3. 10. 2026“. */
  weekLabel: string;
  /** Poznámka pod jídelníčkem (výdej, alergeny, změny). */
  note: string;
  days: JidelnicekDen[];
}

export const JIDELNICEK_ID = 'aktualni';

export const DNY_V_TYDNU = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'] as const;

export const EMPTY_JIDELNICEK: Jidelnicek = {
  id: JIDELNICEK_ID,
  weekLabel: '',
  note: '',
  days: DNY_V_TYDNU.slice(0, 5).map((day) => ({ day, meals: '' })),
};

/** Modulová konstanta — useEditableContent potřebuje stabilní referenci. */
export const DEFAULT_JIDELNICEK: Jidelnicek[] = [EMPTY_JIDELNICEK];
