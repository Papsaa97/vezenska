/**
 * Předstažení úplných znění pro čtení bez připojení.
 *
 * Service Worker (`public/sw.js`) ukládá každou úspěšnou odpověď ze stejné
 * domény, která není HTML ani `/api/`. Stačí tedy soubory se zněními jednou
 * vyžádat a zůstanou v mezipaměti zařízení. Žádná zvláštní obsluha v workeru
 * proto není potřeba.
 *
 * POZOR NA ŽIVOTNOST: mezipaměť je pojmenovaná podle verze buildu, takže po
 * nasazení nové verze aplikace se stará smaže a znění je nutné stáhnout znovu.
 * Hlášení pro uživatele to říká nahlas — slibovat trvalou offline kopii by bylo
 * nepoctivé.
 */
import { ESBIRKA_SNAPSHOTS } from '../../data/esbirka/snapshotManifest';
import { SNAPSHOT_BASE_PATH } from './snapshot';

export interface PrefetchResult {
  /** Kolik znění se podařilo stáhnout. */
  ulozeno: number;
  /** Kolik znění selhalo. */
  selhalo: number;
  /** Celková velikost stažených souborů v bajtech. */
  bajtu: number;
  /** Kdy stahování doběhlo. */
  dokoncenoDne: string;
}

/**
 * Stáhne všechna dostupná znění, aby je Service Worker uložil do mezipaměti.
 * Průběh hlásí přes `onProgress`, aby šlo ukázat, kde stahování je.
 */
export async function prefetchAllSnapshots(
  onProgress?: (hotovo: number, celkem: number) => void
): Promise<PrefetchResult> {
  const slugs = Object.keys(ESBIRKA_SNAPSHOTS);
  let ulozeno = 0;
  let selhalo = 0;
  let bajtu = 0;

  for (let i = 0; i < slugs.length; i += 1) {
    try {
      const response = await fetch(`${SNAPSHOT_BASE_PATH}/${slugs[i]}.json`, {
        headers: { Accept: 'application/json' },
      });
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('json')) {
        selhalo += 1;
      } else {
        // Tělo se musí přečíst celé, jinak Service Worker nemá co uložit.
        bajtu += (await response.arrayBuffer()).byteLength;
        ulozeno += 1;
      }
    } catch {
      selhalo += 1;
    }
    onProgress?.(i + 1, slugs.length);
  }

  return {
    ulozeno,
    selhalo,
    bajtu,
    dokoncenoDne: new Date().toISOString(),
  };
}

/** Velikost v megabajtech s jedním desetinným místem. */
export function formatMegabytes(bajtu: number): string {
  return `${(bajtu / (1024 * 1024)).toFixed(1)} MB`;
}
