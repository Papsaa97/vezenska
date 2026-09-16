/**
 * Převody mezi označením předpisu v aplikaci a identifikátory e-Sbírky.
 *
 * e-Sbírka adresuje předpisy evropským identifikátorem ELI ve tvaru
 * `/eli/cz/sb/{rok}/{číslo}`. Tentýž tvar API přijímá i zkráceně jako
 * `/sb/{rok}/{číslo}` a říká mu „staleUrl“ (trvalá adresa). Když se za něj
 * připojí datum, adresuje konkrétní historické znění.
 */

export interface SbiratkaRef {
  /** Číslo předpisu ve Sbírce, např. 555. */
  cislo: number;
  /** Ročník, např. 1992. */
  rok: number;
}

/**
 * Vytáhne číslo a ročník předpisu z lidského označení.
 *
 * Zvládne tvary, které jsou v registru: „Zákon č. 555/1992 Sb.“,
 * „Vyhláška MS č. 345/1999 Sb.“ i holé „169/1999 Sb.“. Vnitřní předpisy
 * (NGŘ) ve Sbírce nejsou, pro ty vrací null — a je to tak správně, nemá
 * smysl je na e-Sbírce hledat.
 */
export function parseSbiratkaRef(code: string): SbiratkaRef | null {
  const match = code.match(/(\d{1,4})\s*\/\s*(\d{4})\s*Sb\./i);
  if (!match) return null;
  const cislo = Number.parseInt(match[1], 10);
  const rok = Number.parseInt(match[2], 10);
  if (!Number.isFinite(cislo) || !Number.isFinite(rok)) return null;
  return { cislo, rok };
}

/** Sestaví ELI identifikátor, kterým se předpis adresuje v API. */
export function buildEli(ref: SbiratkaRef): string {
  return `/eli/cz/sb/${ref.rok}/${ref.cislo}`;
}

/**
 * Klíč pro soubory se staženým zněním (`public/data/esbirka/sb-1992-555.json`).
 * Záměrně neobsahuje lomítka ani diakritiku, aby šel použít jako název souboru.
 */
export function buildSnapshotSlug(ref: SbiratkaRef): string {
  return `sb-${ref.rok}-${ref.cislo}`;
}

/** Adresa předpisu na veřejném portálu e-Sbírky. */
export function buildPortalUrl(ref: SbiratkaRef, ucinnostOd?: string): string {
  const base = `https://e-sbirka.gov.cz/sb/${ref.rok}/${ref.cislo}`;
  return ucinnostOd ? `${base}/${ucinnostOd}?zalozka=text` : `${base}?zalozka=text`;
}

/**
 * Adresa hotového souboru v souborové službě e-Sbírky.
 *
 * POZOR NA DVOUKROKOVOST: stažení úředního souboru NENÍ jedna adresa. Nejdřív
 * se o soubor požádá (endpoint `stahni`), což vrátí `id` požadavku, a teprve
 * tohle `id` ukazuje na hotový soubor. Dřívější verze aplikace dávala do
 * odkazu rovnou adresu pro požádání — uživateli se tak místo zákona otevřel
 * kus JSONu `{"pozadavekId":…,"stavPozadavku":"OK"}`.
 *
 * Na tuhle adresu se odkazuje přímo z prohlížeče (navigace, ne fetch), takže
 * se jí netýká omezení CORS. Přístupový klíč se sem nepřidává a přidávat nesmí.
 */
export function buildFileUrl(fileId: string): string {
  return `https://e-sbirka.gov.cz/souborove-sluzby/soubory/${encodeURIComponent(fileId)}`;
}

/**
 * Normalizuje označení paragrafu na tvar `§ 17` nebo `§ 25a`.
 *
 * Používá se při porovnávání osnovy z e-Sbírky s výběrem ustanovení
 * v aplikaci, kde se totéž číslo píše s různými mezerami.
 */
export function normalizeSectionLabel(raw: string): string | null {
  const match = raw.match(/§\s*(\d+[a-z]*)/i);
  if (!match) return null;
  return `§ ${match[1].toLowerCase()}`;
}

/**
 * Vytáhne všechna čísla paragrafů, na která se text odvolává.
 *
 * Záměrně nerozlišuje odkazy na jiné předpisy — volající si je odfiltruje sám
 * podle kontextu (viz `collectOwnSections` v kontrole integrity).
 */
export function collectSectionLabels(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(/§\s*(\d+[a-z]*)/gi)) {
    found.add(`§ ${match[1].toLowerCase()}`);
  }
  return [...found];
}

/**
 * Rozgeneruje označení ustanovení na jednotlivé paragrafy.
 *
 * Zvládne jednotlivé „§ 17“, rozsah „§ 1 – § 5“ i výčet „§ 7, § 8, § 12“.
 * Rozsah se rozvine jen mezi čísly bez písmenného dodatku — u „§ 4a“ není
 * z označení poznat, co do rozsahu patří, a hádat by znamenalo vymýšlet si.
 */
export function expandSectionSpec(spec: string): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  const add = (label: string) => {
    if (seen.has(label)) return;
    seen.add(label);
    result.push(label);
  };

  const rangePattern = /§\s*(\d+)\s*[–—-]\s*(?:§\s*)?(\d+)\b/g;
  const consumed: Array<[number, number]> = [];
  for (const match of spec.matchAll(rangePattern)) {
    const from = Number.parseInt(match[1], 10);
    const to = Number.parseInt(match[2], 10);
    if (Number.isFinite(from) && Number.isFinite(to) && to >= from && to - from <= 200) {
      for (let i = from; i <= to; i += 1) add(`§ ${i}`);
      consumed.push([match.index, match.index + match[0].length]);
    }
  }

  for (const match of spec.matchAll(/§\s*(\d+[a-z]*)/gi)) {
    const inRange = consumed.some(([start, end]) => match.index >= start && match.index < end);
    if (!inRange) add(`§ ${match[1].toLowerCase()}`);
  }

  return result;
}
