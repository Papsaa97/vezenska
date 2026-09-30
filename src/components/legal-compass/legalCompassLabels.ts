import type { LegalArticle } from '../../data/legalCompasData';
import type { VscrRegulation } from '../../data/vscrRegulationsRegistry';

/**
 * Popisky a drobné formátovací pomůcky Kompasu zákonů.
 *
 * Jeden zdroj pravdy pro názvy typů předpisů a kategorií Paragrafového
 * výkladu: dřív měl filtr v registru vlastní řetězce s emoji, editor jinou
 * sadu popisků v `<option>` a kontrola dat vypisovala surové klíče
 * (`ngr_33_2019`). Když se popisek změnil na jednom místě, ostatní zůstala.
 */

/** Popisky typů předpisů (filtr registru, editor, odznaky). */
export const REGULATION_TYPE_LABELS: Record<VscrRegulation['type'], string> = {
  zakon: 'Zákony (Sb.)',
  vyhlaska: 'Vyhlášky MS ČR',
  ngr: 'Nařízení GŘ (NGŘ)',
  instrukce: 'Instrukce a justiční stráž',
  ustava_mezinarodni: 'Mezinárodní a CPT',
};

/** Pořadí typů předpisů ve filtru a v editoru. */
export const REGULATION_TYPE_ORDER: VscrRegulation['type'][] = [
  'zakon',
  'vyhlaska',
  'ngr',
  'instrukce',
  'ustava_mezinarodni',
];

/** Popisky kategorií Paragrafového výkladu (filtr, kontrola dat). */
export const LEGAL_CATEGORY_LABELS: Record<LegalArticle['category'], string> = {
  '555_1992': '555/1992 (VS a JS)',
  '169_1999': '169/1999 (Výkon trestu)',
  '293_1993': '293/1993 (Výkon vazby)',
  '361_2003': '361/2003 (Služební poměr)',
  ustava_lzps: 'Ústava a Listina',
  trestni_pravo: 'Trestní právo (TZ/TrŘ)',
  zsm_mladez: 'Mládež (ZSM)',
  mezinarodni_cpt: 'CPT a Pravidla OSN',
  ngr_33_2019: 'NGŘ 33/2019 (Strážní)',
  justicni_straz: 'Justiční stráž (MS 8/2022)',
  ngr_16_2022: 'NGŘ 16/2022 (MÚ)',
  ngr_24_2022: 'NGŘ 24/2022 (Prevence)',
  poutani: 'Poutání (DP1–DP3)',
  vstupy_vjezdy: 'Vstupy a vjezdy',
  poradova_sluzebni: 'Pořadová a zdvořilost',
};

/** Pořadí kategorií ve filtru Paragrafového výkladu. */
export const LEGAL_CATEGORY_ORDER: LegalArticle['category'][] = [
  '555_1992',
  '169_1999',
  '293_1993',
  '361_2003',
  'ustava_lzps',
  'trestni_pravo',
  'zsm_mladez',
  'mezinarodni_cpt',
  'ngr_33_2019',
  'justicni_straz',
  'ngr_16_2022',
  'ngr_24_2022',
  'poutani',
  'vstupy_vjezdy',
  'poradova_sluzebni',
];

/** Popisek kategorie; neznámý klíč (např. z importu) vrátí beze změny. */
export function legalCategoryLabel(key: string): string {
  return (LEGAL_CATEGORY_LABELS as Record<string, string | undefined>)[key] ?? key;
}

/** Datum `RRRR-MM-DD` (případně s časem za ním) v české podobě. */
export function formatIsoDate(iso: string): string {
  const [rok, mesic, den] = iso.slice(0, 10).split('-');
  if (!rok || !mesic || !den) return iso;
  return `${Number(den)}. ${Number(mesic)}. ${rok}`;
}

/** České množné číslo: 1 položka, 2 položky, 5 položek. */
export function pluralCz(count: number, one: string, few: string, many: string): string {
  if (count === 1) return `${count} ${one}`;
  if (count >= 2 && count <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
}
