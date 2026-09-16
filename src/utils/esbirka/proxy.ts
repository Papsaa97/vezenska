/**
 * Serverová část mostu k e-Sbírce.
 *
 * Prohlížeč na e-Sbírku přímo nedosáhne (CORS hlavičku posílá jen pro vlastní
 * doménu), takže dotazy jdou přes stejnou doménu jako aplikace. Tenhle modul
 * obsluhu píše jen jednou a používají ji obě nasazení:
 *   - `api/esbirka.ts` — serverless funkce na Vercelu,
 *   - `vite.config.ts` — middleware vývojového serveru.
 *
 * BEZPEČNOST: proxy nesmí být otevřené relé. Adresa se nikdy neskládá
 * z toho, co přijde v požadavku; ze vstupu se berou jen ověřené kousky
 * (endpoint z pevného výčtu, ELI podle regulárního výrazu, id jen číslice)
 * a výsledná adresa vždy míří na kořen API ze serverového nastavení.
 *
 * PŘÍSTUPOVÝ KLÍČ: když je nastavený (`ESBIRKA_API_KEY`), přidá ho proxy do
 * hlavičky `esel-api-access-key`. Je to jediné místo, kde se klíč do požadavku
 * dostane — klientský kód o něm neví a v odpovědi se nikdy nevrací.
 */
// Přípona `.js` je tu nutná, ne kosmetická — tenhle modul se dostane do
// serverless funkce, která běží jako ESM a nesbaluje se. Viz api/esbirka.ts.
import {
  buildUpstreamUrl,
  EsbirkaError,
  type EsbirkaEndpoint,
  type EsbirkaQuery,
} from './client.js';
import { buildAuthHeaders, readServerConfig } from './serverConfig.js';

const ALLOWED_ENDPOINTS: readonly EsbirkaEndpoint[] = [
  'id',
  'detail-zneni',
  'historie',
  'dalsi-informace',
  'odkazy-ke-stazeni',
  'obsah',
  'stahni',
];

/**
 * Povolený tvar ELI: `/eli/cz/sb/{rok}/{číslo}` nebo zkráceně `/sb/{rok}/{číslo}`,
 * volitelně s datem znění. Nic jiného se na e-Sbírku neodešle.
 */
const ELI_PATTERN = /^\/(?:eli\/cz\/)?sb\/\d{4}\/\d{1,4}(?:\/\d{4}-\d{2}-\d{2})?$/;

export interface ProxyResult {
  status: number;
  body: string;
  contentType: string;
  /** Hodnota hlavičky Cache-Control pro odpověď. */
  cacheControl: string;
}

function fail(status: number, message: string): ProxyResult {
  return {
    status,
    body: JSON.stringify({ chyba: message }),
    contentType: 'application/json; charset=utf-8',
    cacheControl: 'no-store',
  };
}

/** Ověří vstup a složí z něj dotaz na e-Sbírku. Vrací null pro neplatný vstup. */
function parseQuery(params: URLSearchParams): EsbirkaQuery | ProxyResult {
  const endpoint = params.get('endpoint') as EsbirkaEndpoint | null;
  if (!endpoint || !ALLOWED_ENDPOINTS.includes(endpoint)) {
    return fail(400, `Neznámý endpoint. Povolené jsou: ${ALLOWED_ENDPOINTS.join(', ')}.`);
  }

  if (endpoint === 'stahni') {
    const raw = params.get('dokumentId') || '';
    if (!/^\d{1,12}$/.test(raw)) {
      return fail(400, 'stahni vyžaduje parametr dokumentId (jen číslice).');
    }
    const format = params.get('format');
    if (format !== 'PDF' && format !== 'DOCX') {
      return fail(400, 'stahni vyžaduje parametr format s hodnotou PDF nebo DOCX.');
    }
    return { endpoint, dokumentId: Number.parseInt(raw, 10), format };
  }

  if (endpoint === 'detail-zneni') {
    const raw = params.get('dokumentId') || '';
    if (!/^\d{1,12}$/.test(raw)) {
      return fail(400, 'detail-zneni vyžaduje parametr dokumentId (jen číslice).');
    }
    return { endpoint, dokumentId: Number.parseInt(raw, 10) };
  }

  const eli = params.get('eli') || '';
  if (!ELI_PATTERN.test(eli)) {
    return fail(400, 'Parametr eli musí mít tvar /eli/cz/sb/{rok}/{číslo}.');
  }

  const uzel = params.get('uzel') || undefined;
  if (uzel !== undefined && !/^\d{1,20}$/.test(uzel)) {
    return fail(400, 'Parametr uzel smí obsahovat jen číslice.');
  }

  return { endpoint, eli, uzel };
}

function isProxyResult(value: EsbirkaQuery | ProxyResult): value is ProxyResult {
  return 'status' in value;
}

/**
 * Vyřídí jeden požadavek na `/api/esbirka`.
 *
 * Odpověď se nechává ukládat do mezipaměti na hodinu: znění předpisů se mění
 * řádově jednou za měsíce, zato dotazů na ně přijde při každém otevření
 * Právního kompasu několik.
 */
export async function handleEsbirkaProxy(
  params: URLSearchParams,
  timeoutMs = 15000
): Promise<ProxyResult> {
  const parsed = parseQuery(params);
  if (isProxyResult(parsed)) return parsed;

  const config = readServerConfig();

  let upstream: string;
  try {
    upstream = buildUpstreamUrl(parsed, config.apiRoot);
  } catch (error) {
    return fail(400, (error as EsbirkaError).message);
  }

  // Pojistka pro případ budoucí úpravy skládání adresy: ven se pouští výhradně
  // dotaz mířící na nastavený kořen, a ten musí být na doméně gov.cz. Kdyby
  // někdo `ESBIRKA_API_ROOT` přepsal na cizí adresu, poslal by se tam
  // i přístupový klíč — proto ta druhá podmínka.
  if (!upstream.startsWith(`${config.apiRoot}/`) || !/^https:\/\/[a-z0-9.-]+\.gov\.cz(\/|$)/.test(config.apiRoot)) {
    return fail(500, 'Kořen API e-Sbírky je nastavený na nepovolenou adresu.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(upstream, {
      headers: buildAuthHeaders(config),
      signal: controller.signal,
    });
    const body = await response.text();
    return {
      status: response.status,
      body,
      contentType: response.headers.get('content-type') || 'application/json; charset=utf-8',
      // Odpověď klíč neobsahuje (posílá se jen v požadavku směrem k e-Sbírce),
      // takže ji lze ukládat do sdílené mezipaměti. Požadavek na vygenerování
      // souboru se ale cachovat nesmí — vrací jednorázové id.
      cacheControl: !response.ok
        ? 'no-store'
        : parsed.endpoint === 'stahni'
          ? 'no-store'
          : 'public, max-age=3600, stale-while-revalidate=86400',
    };
  } catch (error) {
    const reason =
      error instanceof DOMException && error.name === 'AbortError'
        ? `e-Sbírka neodpověděla do ${timeoutMs} ms.`
        : `Spojení s e-Sbírkou selhalo: ${(error as Error).message}`;
    return fail(502, reason);
  } finally {
    clearTimeout(timer);
  }
}
