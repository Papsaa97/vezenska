/**
 * Předstažení úplných znění pro čtení bez připojení.
 *
 * Service Worker (`public/sw.js`) zachytává požadavky na `/data/esbirka/` a
 * ukládá je do VLASTNÍ mezipaměti `vscr-esbirka-v1`. Stačí tedy soubory se
 * zněními jednou vyžádat a zůstanou v zařízení.
 *
 * ŽIVOTNOST: mezipaměť znění záměrně nenese verzi buildu, takže ji úklid při
 * nasazení nové verze aplikace nemaže. Dřív ji mazal — uživatel si stáhl 1,5 MB
 * zákonů, a po první opravě nasazené do produkce mu zmizely, přičemž odznak
 * „Uloženo offline (datum)“ dál tvrdil, že je má. Odznak se proto navíc neptá
 * localStorage, ale rovnou mezipaměti (viz `countCachedSnapshots`).
 */
import { ESBIRKA_SNAPSHOTS } from '../../data/esbirka/snapshotManifest';
import { SNAPSHOT_BASE_PATH } from './snapshot';

/**
 * Název mezipaměti se zněními. MUSÍ souhlasit s `SNAPSHOT_CACHE_NAME`
 * v `public/sw.js`.
 *
 * Duplikát je tu nutný: soubory v `public/` neprocházejí překladem, takže si
 * worker nemůže nic importovat a tahle strana si nemůže naimportovat jeho.
 */
export const SNAPSHOT_CACHE_NAME = 'vscr-esbirka-v1';

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

/** Kolik znění je skutečně v mezipaměti zařízení. */
export interface CachedSnapshotCount {
  /** Kolik znění je uloženo. */
  ulozeno: number;
  /** Kolik znění aplikace celkem nabízí. */
  celkem: number;
  /**
   * Dá se to vůbec zjistit? Cache Storage API není v Safari v privátním
   * režimu ani v starších prohlížečích k dispozici. `false` neznamená
   * „nic uloženo“, znamená „nevím“ — a tak se to má i hlásit.
   */
  zjistitelne: boolean;
}

/**
 * Zjistí, kolik stažených znění zařízení opravdu drží.
 *
 * Odznak offline stavu se dřív opíral jen o časový údaj v localStorage. Ten
 * přežil i smazání dat webu nebo úklid mezipaměti prohlížečem, takže aplikace
 * tvrdila „Uloženo offline“ nad prázdnou mezipamětí. Tohle se ptá zdroje.
 */
export async function countCachedSnapshots(): Promise<CachedSnapshotCount> {
  const slugs = Object.keys(ESBIRKA_SNAPSHOTS);
  const celkem = slugs.length;

  if (typeof caches === 'undefined') {
    return { ulozeno: 0, celkem, zjistitelne: false };
  }

  try {
    const otevrena = await caches.has(SNAPSHOT_CACHE_NAME);
    if (!otevrena) return { ulozeno: 0, celkem, zjistitelne: true };

    const cache = await caches.open(SNAPSHOT_CACHE_NAME);
    const nalezeno = await Promise.all(
      slugs.map(async (slug) => {
        const hit = await cache.match(`${SNAPSHOT_BASE_PATH}/${slug}.json`);
        return hit ? 1 : 0;
      })
    );
    return {
      ulozeno: nalezeno.reduce((soucet: number, kus) => soucet + kus, 0),
      celkem,
      zjistitelne: true,
    };
  } catch {
    return { ulozeno: 0, celkem, zjistitelne: false };
  }
}
