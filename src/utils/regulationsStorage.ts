import { VscrRegulation, VSCR_REGULATIONS_REGISTRY } from '../data/vscrRegulationsRegistry';

const STORAGE_KEY = 'vscr_custom_regulations';
const OFFLINE_STATUS_KEY = 'vscr_offline_downloaded_at';

/**
 * Klíč, do kterého se dřív zapisovala druhá kopie všech předpisů.
 *
 * Nikdo ji nikdy nečetl — `getStoredRegulations()` čte STORAGE_KEY, který
 * v localStorage leží stejně dlouho. Kopie tedy jen zabírala místo ve kvótě
 * (u plné databáze předpisů stovky kilobajtů, a localStorage má typicky 5 MB),
 * čímž mohla shodit ukládání koncepty a postupu. Zápis je odstraněn a klíč se
 * při prvním použití modulu jednorázově uklidí.
 */
const LEGACY_OFFLINE_CACHE_KEY = 'vscr_offline_regulations_cache';

/** Jednorázový úklid mrtvého klíče ze starších verzí aplikace. */
export function purgeLegacyOfflineCache(): void {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(LEGACY_OFFLINE_CACHE_KEY) !== null) {
      localStorage.removeItem(LEGACY_OFFLINE_CACHE_KEY);
    }
  } catch {
    // Zaplněná nebo zakázaná localStorage — úklid není kritický.
  }
}

/**
 * Předpisy, které lektor dřív upravil nebo přidal jen v tomto prohlížeči.
 *
 * Úpravy předpisů se ukládaly do localStorage, přestože tlačítko slibovalo
 * „Uložit do databáze". Kolegové ani studenti je proto nikdy neviděli. Teď jdou
 * do společné tabulky content_blocks (druh 'regulation'); tahle funkce jen
 * najde staré místní úpravy, aby je lektor mohl jedním tlačítkem nahrát.
 */
export function readLegacyLocalRegulations(): VscrRegulation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((r): r is VscrRegulation => !!r && typeof r === 'object' && 'id' in r && 'code' in r)
      : [];
  } catch {
    return [];
  }
}

/** Po úspěšném nahrání do databáze se místní kopie uklidí. */
export function clearLegacyLocalRegulations(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Zakázaná localStorage — nevadí, nabídka nahrání se jen ukáže znovu.
  }
}

/** Je to předpis dodávaný s aplikací (lze ho vrátit na výchozí znění)? */
export function isDefaultRegulation(regulationId: string): boolean {
  return VSCR_REGULATIONS_REGISTRY.some((reg) => reg.id === regulationId);
}

/**
 * Zaznamená, kdy se naposled stahovala znění předpisů do zařízení.
 *
 * Samotná znění ukládá Service Worker do mezipaměti `vscr-esbirka-v1`
 * (viz src/utils/esbirka/offline.ts) — tahle funkce si jen poznamená datum
 * pro popisek v rozhraní. Dřív navíc zapisovala celou druhou kopii předpisů
 * do klíče, který nikdo nečetl; viz LEGACY_OFFLINE_CACHE_KEY.
 */
export function recordOfflineDownload(count: number): { success: boolean; count: number; timestamp: string } {
  if (typeof window === 'undefined') return { success: false, count: 0, timestamp: '' };

  try {
    const now = new Date().toLocaleString('cs-CZ');
    localStorage.setItem(OFFLINE_STATUS_KEY, now);
    return { success: true, count, timestamp: now };
  } catch (e) {
    console.error('Datum stažení pro offline se nepodařilo uložit:', e);
    return { success: false, count: 0, timestamp: '' };
  }
}

/** Kdy naposled uživatel spustil stahování znění (jen popisek, ne důkaz). */
export function getOfflineStatus(): { isDownloaded: boolean; downloadedAt: string | null } {
  if (typeof window === 'undefined') return { isDownloaded: false, downloadedAt: null };

  try {
    const downloadedAt = localStorage.getItem(OFFLINE_STATUS_KEY);
    return {
      isDownloaded: !!downloadedAt,
      downloadedAt
    };
  } catch {
    return { isDownloaded: false, downloadedAt: null };
  }
}

/** Stáhne předaný seznam předpisů jako soubor JSON (záloha). */
export function exportRegulationsToJSON(regs: VscrRegulation[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(regs, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `vscr_predpisy_databaze_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Přečte předpisy ze záložního souboru JSON. Nic neukládá — uložení do
 * databáze obstará volající, aby mohl hlásit, co opravdu prošlo.
 */
export function parseRegulationsJSON(
  jsonString: string
): { success: boolean; items: VscrRegulation[]; message: string } {
  try {
    const parsed: unknown = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, items: [], message: 'Neplatný formát: soubor musí obsahovat pole předpisů.' };
    }
    const valid = parsed.filter(
      (item): item is VscrRegulation =>
        !!item && typeof item === 'object' && 'id' in item && 'title' in item && 'code' in item
    );
    if (valid.length === 0) {
      return { success: false, items: [], message: 'Nebyly nalezeny žádné platné předpisy se správnou strukturou.' };
    }
    return { success: true, items: valid, message: '' };
  } catch (e) {
    return { success: false, items: [], message: 'Chyba při čtení JSON souboru: ' + (e as Error).message };
  }
}
