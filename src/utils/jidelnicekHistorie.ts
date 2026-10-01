import { supabase } from '../lib/supabase';
import { Jidelnicek } from '../data/jidelnicek';
import { normalizeJidelnicek } from './contentLibrary';

/**
 * Historie změn jídelníčku (migrace 051).
 *
 * Tabulku plní trigger v databázi při každém uložení — aplikace ji jen čte.
 * Proto se jménu autora dá věřit: nejde ho podvrhnout ani obejít zápisem
 * mimo aplikaci.
 */
export type JidelnicekAkce = 'vlozeni' | 'uprava' | 'smazani';

export interface JidelnicekZmena {
  id: number;
  zmeneno: string;
  autorJmeno: string;
  autorRole: string | null;
  akce: JidelnicekAkce;
  /** Jídelníček před změnou (null u prvního vyplnění). */
  pred: Jidelnicek | null;
  /** Jídelníček po změně (null, když ho lektor smazal). */
  po: Jidelnicek | null;
  /** Po změně byl jídelníček odebraný (náhrobek). */
  poOdebrano: boolean;
}

interface HistorieRow {
  id: number;
  zmeneno: string;
  autor_jmeno: string;
  autor_role: string | null;
  akce: string;
  pred: unknown;
  po: unknown;
}

function stav(value: unknown): { payload: Jidelnicek | null; odebrano: boolean } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { payload: null, odebrano: false };
  const raw = value as Record<string, unknown>;
  return { payload: normalizeJidelnicek(raw.payload), odebrano: raw.is_deleted === true };
}

function akce(value: string): JidelnicekAkce {
  return value === 'vlozeni' || value === 'smazani' ? value : 'uprava';
}

export interface HistorieResult {
  zmeny: JidelnicekZmena[];
  error: string | null;
}

/** Posledních `limit` změn jídelníčku, nejnovější první. */
export async function fetchJidelnicekHistorie(blockId: string, limit = 30): Promise<HistorieResult> {
  try {
    const { data, error } = await supabase
      .from('jidelnicek_historie')
      .select('id, zmeneno, autor_jmeno, autor_role, akce, pred, po')
      .eq('block_id', blockId)
      .order('id', { ascending: false })
      .limit(limit);
    if (error) return { zmeny: [], error: `Historii změn se nepodařilo načíst (${error.message}).` };
    const zmeny = ((data ?? []) as HistorieRow[]).map((row) => {
      const pred = stav(row.pred);
      const po = stav(row.po);
      return {
        id: row.id,
        zmeneno: row.zmeneno,
        autorJmeno: row.autor_jmeno,
        autorRole: row.autor_role,
        akce: akce(row.akce),
        pred: pred.payload,
        po: po.payload,
        poOdebrano: po.odebrano,
      };
    });
    return { zmeny, error: null };
  } catch (err) {
    return {
      zmeny: [],
      error: `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`,
    };
  }
}

/** Které části jídelníčku se změnou liší — pro stručný popis v historii. */
export function coSeZmenilo(pred: Jidelnicek | null, po: Jidelnicek | null): string[] {
  if (!po) return [];
  if (!pred) return ['vyplněno poprvé'];
  const zmeny: string[] = [];
  if (pred.weekLabel.trim() !== po.weekLabel.trim()) zmeny.push('týden');
  const predDny = new Map(pred.days.map((d) => [d.day, d.meals.trim()]));
  const poDny = new Map(po.days.map((d) => [d.day, d.meals.trim()]));
  const dny = new Set([...predDny.keys(), ...poDny.keys()]);
  for (const den of dny) {
    if ((predDny.get(den) ?? '') !== (poDny.get(den) ?? '')) zmeny.push(den.toLowerCase());
  }
  if (pred.note.trim() !== po.note.trim()) zmeny.push('poznámka');
  return zmeny;
}
