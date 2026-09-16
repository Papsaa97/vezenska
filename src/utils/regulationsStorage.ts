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
 * Loads all regulations (defaults merged with user-created or edited ones).
 */
export function getStoredRegulations(): VscrRegulation[] {
  if (typeof window === 'undefined') return VSCR_REGULATIONS_REGISTRY;

  try {
    const customData = localStorage.getItem(STORAGE_KEY);
    const customRegs: VscrRegulation[] = customData ? JSON.parse(customData) : [];

    // Merge: custom regs override defaults with same ID, or append if new
    const registryMap = new Map<string, VscrRegulation>();
    
    // First fill with default registry
    VSCR_REGULATIONS_REGISTRY.forEach(reg => {
      registryMap.set(reg.id, reg);
    });

    // Then overwrite/add with custom items
    customRegs.forEach(custom => {
      registryMap.set(custom.id, custom);
    });

    return Array.from(registryMap.values());
  } catch (e) {
    console.error('Failed to load regulations from storage:', e);
    return VSCR_REGULATIONS_REGISTRY;
  }
}

/** Je to předpis dodávaný s aplikací (lze ho vrátit na výchozí znění)? */
export function isDefaultRegulation(regulationId: string): boolean {
  return VSCR_REGULATIONS_REGISTRY.some((reg) => reg.id === regulationId);
}

/**
 * Saves or updates a regulation in local storage.
 */
export function saveRegulationToStorage(regulation: VscrRegulation): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const customData = localStorage.getItem(STORAGE_KEY);
    const customRegs: VscrRegulation[] = customData ? JSON.parse(customData) : [];

    const existingIndex = customRegs.findIndex(r => r.id === regulation.id);
    if (existingIndex >= 0) {
      customRegs[existingIndex] = regulation;
    } else {
      customRegs.push(regulation);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customRegs));
    return true;
  } catch (e) {
    console.error('Failed to save regulation:', e);
    return false;
  }
}

/**
 * Deletes a custom regulation or resets an edited default back to initial state.
 */
export function deleteRegulationFromStorage(regulationId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const customData = localStorage.getItem(STORAGE_KEY);
    if (!customData) return true;

    const customRegs: VscrRegulation[] = JSON.parse(customData);
    const filtered = customRegs.filter(r => r.id !== regulationId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete regulation:', e);
    return false;
  }
}

/**
 * Zaznamená, kdy se naposled stahovala znění předpisů do zařízení.
 *
 * Samotná znění ukládá Service Worker do mezipaměti `vscr-esbirka-v1`
 * (viz src/utils/esbirka/offline.ts) — tahle funkce si jen poznamená datum
 * pro popisek v rozhraní. Dřív navíc zapisovala celou druhou kopii předpisů
 * do klíče, který nikdo nečetl; viz LEGACY_OFFLINE_CACHE_KEY.
 */
export function recordOfflineDownload(): { success: boolean; count: number; timestamp: string } {
  if (typeof window === 'undefined') return { success: false, count: 0, timestamp: '' };

  try {
    const now = new Date().toLocaleString('cs-CZ');
    localStorage.setItem(OFFLINE_STATUS_KEY, now);
    return { success: true, count: getStoredRegulations().length, timestamp: now };
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

/**
 * Exports all current regulations into a downloadable JSON file.
 */
export function exportRegulationsToJSON(): void {
  const regs = getStoredRegulations();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(regs, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `vscr_predpisy_databaze_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Imports regulations from a JSON file content string.
 */
export function importRegulationsFromJSON(jsonString: string): { success: boolean; count: number; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, message: 'Neplatný formát: soubor musí obsahovat pole předpisů.' };
    }

    // Validate structure of first few items
    const valid = parsed.filter(item => item.id && item.title && item.code);
    if (valid.length === 0) {
      return { success: false, count: 0, message: 'Nebyly nalezeny žádné platné předpisy se správnou strukturou.' };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    return { success: true, count: valid.length, message: `Úspěšně naimportováno ${valid.length} předpisů.` };
  } catch (e) {
    return { success: false, count: 0, message: 'Chyba při čtení JSON souboru: ' + (e as Error).message };
  }
}
