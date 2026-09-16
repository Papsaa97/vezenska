/**
 * Klient veřejného REST API e-Sbírky (https://e-sbirka.gov.cz/restful-api).
 *
 * PROČ PŘES VLASTNÍ PROXY: e-Sbírka posílá `Access-Control-Allow-Origin`
 * výhradně pro `https://e-sbirka.gov.cz`. Volání přímo z prohlížeče proto
 * skončí na CORS, ať je server sebevíc veřejný. Ze serveru (sync skript,
 * serverless funkce `api/esbirka.ts`) žádné omezení není. Modul si proto sám
 * vybere dopravu: v Node jde přímo, v prohlížeči na `/api/esbirka`.
 */
import { awaitRequestSlot } from './pace.js';
import type {
  EsbirkaContents,
  EsbirkaDownloadLinks,
  EsbirkaErrorBody,
  EsbirkaHistory,
  EsbirkaVersionDetail,
} from './types';

/** Kořen veřejného API e-Sbírky. Bez lomítka na konci. */
export const ESBIRKA_API_ROOT = 'https://e-sbirka.gov.cz/sbr-externi';

/** Cesta k vlastní proxy, přes kterou volá prohlížeč. */
export const ESBIRKA_PROXY_PATH = '/api/esbirka';

/** Endpointy, které aplikace používá. Proxy pouští jen tenhle seznam. */
export type EsbirkaEndpoint =
  | 'id'
  | 'detail-zneni'
  | 'historie'
  | 'dalsi-informace'
  | 'odkazy-ke-stazeni'
  | 'obsah'
  /** Požádá o vygenerování úředního souboru. Vrací id, ne samotný soubor. */
  | 'stahni';

export interface EsbirkaQuery {
  endpoint: EsbirkaEndpoint;
  /** ELI předpisu, např. `/eli/cz/sb/1992/555`. */
  eli?: string;
  /** Číselné id dokumentu — používá `detail-zneni`. */
  dokumentId?: number;
  /** Id nadřazeného uzlu osnovy — používá `obsah` pro načtení potomků. */
  uzel?: string;
  /** Formát úředního souboru — používá `stahni`. */
  format?: 'PDF' | 'DOCX';
}

/** Chyba volání API. Nese HTTP stav, aby volající poznal výpadek od 404. */
export class EsbirkaError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'EsbirkaError';
    this.status = status;
  }
}

/**
 * Sestaví adresu na e-Sbírce pro daný dotaz.
 *
 * Sdílí ji klient v Node i proxy — díky tomu nemůže vzniknout stav, kdy proxy
 * pouští jinou množinu adres, než jakou klient umí zavolat.
 */
export function buildUpstreamUrl(query: EsbirkaQuery, apiRoot: string = ESBIRKA_API_ROOT): string {
  const docs = `${apiRoot}/dokumenty-sbirky`;

  if (query.endpoint === 'stahni') {
    if (!Number.isFinite(query.dokumentId)) {
      throw new EsbirkaError('stahni vyžaduje číselné dokumentId', 400);
    }
    if (query.format !== 'PDF' && query.format !== 'DOCX') {
      throw new EsbirkaError('stahni vyžaduje formát PDF nebo DOCX', 400);
    }
    return `${apiRoot}/stahni/informativni-zneni/${query.dokumentId}/${query.format}`;
  }

  if (query.endpoint === 'detail-zneni') {
    if (!Number.isFinite(query.dokumentId)) {
      throw new EsbirkaError('detail-zneni vyžaduje číselné dokumentId', 400);
    }
    return `${docs}/${query.dokumentId}/detail-zneni`;
  }

  const eli = (query.eli || '').trim();
  if (!eli.startsWith('/')) {
    throw new EsbirkaError(`Neplatné ELI: "${eli}" (musí začínat lomítkem)`, 400);
  }
  const encoded = encodeURIComponent(eli);

  if (query.endpoint === 'obsah' && query.uzel) {
    if (!/^\d+$/.test(query.uzel)) {
      throw new EsbirkaError(`Neplatné id uzlu osnovy: "${query.uzel}"`, 400);
    }
    return `${docs}/${encoded}/obsah/${query.uzel}`;
  }

  return `${docs}/${encoded}/${query.endpoint}`;
}

/** Adresa na vlastní proxy pro tentýž dotaz. */
function buildProxyUrl(query: EsbirkaQuery): string {
  const params = new URLSearchParams({ endpoint: query.endpoint });
  if (query.eli) params.set('eli', query.eli);
  if (query.dokumentId !== undefined) params.set('dokumentId', String(query.dokumentId));
  if (query.uzel) params.set('uzel', query.uzel);
  if (query.format) params.set('format', query.format);
  return `${ESBIRKA_PROXY_PATH}?${params.toString()}`;
}

/** V prohlížeči se musí jít přes proxy, na serveru se jde přímo. */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Přihlašovací údaje pro přímá volání ze serveru (skripty, proxy).
 *
 * Tenhle modul si je sám z prostředí NEČTE — běží i v prohlížeči a žádné
 * tajemství se do něj nesmí dostat. Serverový kód je nastaví jednou při
 * startu přes `configureServerCredentials()`; větev pro prohlížeč je nikdy
 * nepoužije, protože ta jde přes `/api/esbirka`, kde klíč doplní až proxy.
 */
let serverCredentials: { apiRoot: string; headers: Record<string, string> } | null = null;

export function configureServerCredentials(
  credentials: { apiRoot: string; headers: Record<string, string> } | null
): void {
  if (isBrowser()) {
    throw new EsbirkaError('Přihlašovací údaje k e-Sbírce nepatří do prohlížeče.', 500);
  }
  serverCredentials = credentials;
}

/**
 * Hláška o nezdařeném volání.
 *
 * Záleží na tom, kdo chybu vrátil: `chyby` posílá e-Sbírka, `chyba` vlastní
 * proxy. Když nepřijde ani jedno a stav je 5xx, selhal most na naší straně —
 * svádět to na e-Sbírku by poslalo hledání poruchy špatným směrem (přesně to
 * se stalo, když serverless funkce padala na chybějící příponu v importu).
 */
function describeError(status: number, body: string, viaProxy: boolean): string {
  try {
    const parsed = JSON.parse(body) as EsbirkaErrorBody;
    const first = parsed.chyby?.[0];
    if (first?.popis) return `${first.kod ? `${first.kod}: ` : ''}${first.popis}`;
    if (parsed.chyba) return parsed.chyba;
  } catch {
    // Odpověď nebyla JSON — rozhodne stav níže.
  }
  if (viaProxy && status >= 500) {
    return `most k e-Sbírce na /api/esbirka selhal se stavem HTTP ${status}`;
  }
  return `e-Sbírka odpověděla stavem HTTP ${status}`;
}

export interface EsbirkaRequestOptions {
  /** Časový strop jednoho volání v milisekundách. */
  timeoutMs?: number;
  signal?: AbortSignal;
}

/** Jedno volání API. Vrací syrový text odpovědi. */
export async function fetchEsbirkaRaw(
  query: EsbirkaQuery,
  options: EsbirkaRequestOptions = {}
): Promise<string> {
  const viaProxy = isBrowser();
  const url = viaProxy
    ? buildProxyUrl(query)
    : buildUpstreamUrl(query, serverCredentials?.apiRoot);
  const timeoutMs = options.timeoutMs ?? 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onAbort);

  try {
    // Tempo se drží jen u přímých volání ze serveru — tam chodí dávky stovek
    // požadavků. V prohlížeči jde o jednotlivá kliknutí, brzdit je nemá smysl.
    if (!viaProxy) await awaitRequestSlot();

    const response = await fetch(url, {
      // Klíč se přidává jen u přímých volání ze serveru. V prohlížeči se jde
      // přes vlastní proxy a ta si hlavičku doplní sama — do klientského
      // kódu se tajemství nedostane.
      headers: viaProxy ? { Accept: 'application/json' } : (serverCredentials?.headers ?? { Accept: 'application/json' }),
      signal: controller.signal,
    });
    const body = await response.text();
    if (!response.ok) {
      throw new EsbirkaError(describeError(response.status, body, viaProxy), response.status);
    }
    return body;
  } catch (error) {
    if (error instanceof EsbirkaError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new EsbirkaError(`e-Sbírka neodpověděla do ${timeoutMs} ms`, 504);
    }
    throw new EsbirkaError(`Spojení s e-Sbírkou selhalo: ${(error as Error).message}`, 0);
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}

async function fetchEsbirkaJson<T>(
  query: EsbirkaQuery,
  options?: EsbirkaRequestOptions
): Promise<T> {
  const body = await fetchEsbirkaRaw(query, options);
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new EsbirkaError('e-Sbírka vrátila odpověď, která není JSON', 502);
  }
}

/**
 * Číselné id dokumentu pro dané ELI.
 *
 * Endpoint vrací holé číslo v těle odpovědi, ne JSON objekt.
 */
export async function fetchDocumentId(
  eli: string,
  options?: EsbirkaRequestOptions
): Promise<number> {
  const body = (await fetchEsbirkaRaw({ endpoint: 'id', eli }, options)).trim();
  const id = Number.parseInt(body, 10);
  if (!Number.isFinite(id)) {
    throw new EsbirkaError(`Endpoint id vrátil nečíselnou hodnotu: "${body}"`, 502);
  }
  return id;
}

/** Metadata znění (název, citace, datum účinnosti, druh předpisu). */
export function fetchVersionDetail(
  dokumentId: number,
  options?: EsbirkaRequestOptions
): Promise<EsbirkaVersionDetail> {
  return fetchEsbirkaJson<EsbirkaVersionDetail>({ endpoint: 'detail-zneni', dokumentId }, options);
}

/** Historie znění: aktuální, minulá i budoucí, včetně novel. */
export function fetchHistory(
  eli: string,
  options?: EsbirkaRequestOptions
): Promise<EsbirkaHistory> {
  return fetchEsbirkaJson<EsbirkaHistory>({ endpoint: 'historie', eli }, options);
}

/** Osnova předpisu. Bez `uzel` vrátí kořen, s ním potomky daného uzlu. */
export function fetchContents(
  eli: string,
  uzel?: string,
  options?: EsbirkaRequestOptions
): Promise<EsbirkaContents> {
  return fetchEsbirkaJson<EsbirkaContents>({ endpoint: 'obsah', eli, uzel }, options);
}

/** Odkazy na oficiální PDF, DOCX a ZIP daného znění. */
export function fetchDownloadLinks(
  eli: string,
  options?: EsbirkaRequestOptions
): Promise<EsbirkaDownloadLinks> {
  return fetchEsbirkaJson<EsbirkaDownloadLinks>({ endpoint: 'odkazy-ke-stazeni', eli }, options);
}

/** Aktuálně účinné znění z historie. Fallback na první položku. */
export function pickCurrentVersion(history: EsbirkaHistory) {
  return history.historie.find((v) => v.typZneni === 'AKTUALNI') ?? history.historie[0] ?? null;
}
