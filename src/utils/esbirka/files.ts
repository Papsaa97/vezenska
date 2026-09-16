/**
 * Stahování oficiálních souborů z e-Sbírky (informativní znění v PDF/DOCX/ZIP).
 *
 * POUZE PRO SERVER. Souborová služba e-Sbírky neposílá CORS hlavičky pro cizí
 * domény, takže z prohlížeče se zavolat nedá; používá to synchronizační skript
 * (`npm run sync:laws`), který běží v Node.
 *
 * Postup má dva kroky, protože generování souboru může chvíli trvat:
 *   1. požádá se o dokument a přijde `pozadavekId` + stav,
 *   2. jakmile je stav `OK`, stáhne se soubor podle vráceného `id`.
 */
import { EsbirkaError } from './client';
import { awaitRequestSlot } from './pace';
import { buildAuthHeaders, readServerConfig } from './serverConfig';

/** Kořen souborové služby e-Sbírky. */
export const ESBIRKA_FILES_ROOT = 'https://e-sbirka.gov.cz/souborove-sluzby';

/** Kořen služby, která generuje soubory se zněním. */
export const ESBIRKA_EXPORT_ROOT = 'https://e-sbirka.gov.cz/sbr-externi/stahni';

export type EsbirkaFileFormat = 'PDF' | 'DOCX' | 'ZIP';

interface DocumentRequestResponse {
  pozadavekId: string;
  id?: string;
  stavPozadavku: 'OK' | 'PROBIHA' | 'CHYBA' | string;
  nazevDokumentu?: string;
}

interface DocumentRequestStatus {
  stav: 'OK' | 'PROBIHA' | 'CHYBA' | string;
  id?: string;
}

async function getJson<T>(url: string, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await awaitRequestSlot();
    const response = await fetch(url, {
      headers: buildAuthHeaders(readServerConfig()),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new EsbirkaError(`${url} vrátilo HTTP ${response.status}`, response.status);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Stáhne oficiální soubor daného znění.
 *
 * `dokumentId` je číselné id znění z endpointu `id` nebo `detail-zneni`.
 * Vrací binární obsah souboru a jeho úřední název (např.
 * `Sb_1992_555_2026-01-01_IZ.docx`), který nese ročník, číslo i datum účinnosti.
 */
export async function downloadOfficialDocument(
  dokumentId: number,
  format: EsbirkaFileFormat,
  options: { timeoutMs?: number; maxAttempts?: number } = {}
): Promise<{ data: Uint8Array; nazev: string }> {
  const timeoutMs = options.timeoutMs ?? 30000;
  const maxAttempts = options.maxAttempts ?? 15;

  const request = await getJson<DocumentRequestResponse>(
    `${ESBIRKA_EXPORT_ROOT}/informativni-zneni/${dokumentId}/${format}`,
    timeoutMs
  );

  let fileId = request.stavPozadavku === 'OK' ? request.id : undefined;

  // Když se soubor teprve generuje, počká se na dokončení požadavku.
  for (let attempt = 0; !fileId && attempt < maxAttempts; attempt += 1) {
    await sleep(1000);
    const status = await getJson<DocumentRequestStatus>(
      `${ESBIRKA_FILES_ROOT}/verejne-pozadavky-dokumenty/pozadavky/${request.pozadavekId}`,
      timeoutMs
    );
    if (status.stav === 'CHYBA') {
      throw new EsbirkaError(`e-Sbírka hlásí chybu při generování souboru ${format}.`, 502);
    }
    if (status.stav === 'OK' && status.id) fileId = status.id;
  }

  if (!fileId) {
    throw new EsbirkaError(
      `Soubor ${format} se nepodařilo získat ani po ${maxAttempts} pokusech.`,
      504
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await awaitRequestSlot();
    const response = await fetch(`${ESBIRKA_FILES_ROOT}/soubory/${fileId}`, {
      headers: buildAuthHeaders(readServerConfig()),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new EsbirkaError(`Stažení souboru vrátilo HTTP ${response.status}`, response.status);
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      throw new EsbirkaError('Souborová služba vrátila místo souboru chybovou odpověď.', 502);
    }
    return {
      data: new Uint8Array(await response.arrayBuffer()),
      nazev: request.nazevDokumentu || `${dokumentId}.${format.toLowerCase()}`,
    };
  } finally {
    clearTimeout(timer);
  }
}
