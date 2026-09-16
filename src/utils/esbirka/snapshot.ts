/**
 * Stažená (offline) znění předpisů z e-Sbírky.
 *
 * PROČ TO NENÍ V BUNDLU: úplná znění všech sledovaných předpisů dají dohromady
 * přes 1,5 MB textu — trestní řád sám má přes 600 kB. Kdyby se importovala
 * jako TypeScript moduly, platil by je při načtení aplikace každý, i kdo
 * Právní kompas nikdy neotevře. Leží proto v `public/data/esbirka/` jako
 * samostatné soubory JSON a stahují se až ve chvíli, kdy je čtenář chce.
 *
 * Service Worker (`public/sw.js`) si je ukládá do mezipaměti jako každou jinou
 * odpověď, takže jednou otevřené znění je dostupné i offline. Tlačítko
 * „Stáhnout pro offline“ tohohle využívá a znění si vyžádá dopředu.
 */

/**
 * Lehká metadata jednoho staženého znění.
 *
 * Tohle je jediná část, která se dostane do bundlu (přes generovaný
 * `src/data/esbirka/snapshotManifest.ts`) — aplikace tak ví, co má k dispozici
 * a jak je to staré, aniž by musela stahovat samotné texty.
 */
export interface EsbirkaSnapshotSummary {
  /** Klíč a zároveň název souboru, např. `sb-1992-555`. */
  slug: string;
  /** ELI identifikátor, např. `/eli/cz/sb/1992/555`. */
  eli: string;
  /** Citace předpisu podle e-Sbírky, např. `555/1992 Sb.`. */
  citace: string;
  /** Úřední název předpisu. */
  nazev: string;
  /** Číselné id znění v e-Sbírce. */
  dokumentId: number;
  /** Pořadové číslo znění; roste s každou novelou. */
  cisloZneni: number;
  /** Datum účinnosti staženého znění, tvar `RRRR-MM-DD`. */
  ucinnostOd: string;
  /** Novely, kterými toto znění vzniklo. */
  novely: string[];
  /** Odkaz na znění na portálu e-Sbírky. */
  portalUrl: string;
  /** Přímý odkaz na oficiální PDF téhož znění. */
  pdfUrl: string;
  /** Kdy skript znění stáhl (ISO 8601). */
  stazenoDne: string;
  /** Délka textu ve znacích. */
  pocetZnaku: number;
  /** Paragrafy předpisu v pořadí, normalizovaně (`§ 1`, `§ 4a`, …). */
  paragrafy: string[];
}

/** Položka osnovy předpisu tak, jak ji vrací e-Sbírka. */
export interface EsbirkaOutlineItem {
  /** Označení, např. `§ 17`, `HLAVA DRUHÁ`, `Příloha č. 1`. */
  oznaceni: string;
  nazev?: string;
  /** Rozsah u nadřazených uzlů, např. `§ 5 — § 21b`. */
  rozsah?: string;
  /** Zanoření v osnově (0 = nejvyšší úroveň). */
  uroven: number;
  fragmentId: number;
}

/** Úplné znění jednoho předpisu stažené z e-Sbírky. */
export interface EsbirkaSnapshot extends EsbirkaSnapshotSummary {
  osnova: EsbirkaOutlineItem[];
  /** Doslovný text informativního znění převedený z úředního DOCX. */
  text: string;
}

/** Kde leží stažená znění. Musí odpovídat výstupu `npm run sync:laws`. */
export const SNAPSHOT_BASE_PATH = '/data/esbirka';

const cache = new Map<string, Promise<EsbirkaSnapshot>>();

/**
 * Načte úplné znění předpisu. Opakované volání pro tentýž předpis
 * nespustí druhé stahování — rozpracovaný slib se sdílí.
 */
export function loadSnapshot(slug: string): Promise<EsbirkaSnapshot> {
  const cached = cache.get(slug);
  if (cached) return cached;

  const pending = (async () => {
    const response = await fetch(`${SNAPSHOT_BASE_PATH}/${slug}.json`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Znění „${slug}" se nepodařilo načíst (HTTP ${response.status}).`);
    }
    const contentType = response.headers.get('content-type') || '';
    // Přepis neznámých cest na index.html (viz vercel.json) vrátí na chybějící
    // soubor HTML se stavem 200. Bez téhle kontroly by se to projevilo až pádem
    // JSON.parse s nicneříkající hláškou.
    if (!contentType.includes('json')) {
      throw new Error(`Znění „${slug}" není na serveru k dispozici.`);
    }
    return (await response.json()) as EsbirkaSnapshot;
  })();

  // Neúspěch se z mezipaměti vyhodí, aby šlo zkusit znovu.
  pending.catch(() => cache.delete(slug));
  cache.set(slug, pending);
  return pending;
}

/** Vrátí znění, pokud už je načtené, jinak null. Nikdy nespustí stahování. */
export function peekSnapshot(slug: string): Promise<EsbirkaSnapshot> | null {
  return cache.get(slug) ?? null;
}

/**
 * Najde v osnově položky, které jsou paragrafy, a vrátí je v pořadí předpisu.
 * Nadpisy hlav a dílů se vynechají — ty paragrafy jen seskupují.
 */
export function outlineSections(osnova: EsbirkaOutlineItem[]): EsbirkaOutlineItem[] {
  return osnova.filter((item) => /^§\s*\d/.test(item.oznaceni));
}
