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
 * a výsledná adresa vždy míří na `ESBIRKA_API_ROOT`.
 */
import {
  buildUpstreamUrl,
  ESBIRKA_API_ROOT,
  EsbirkaError,
  type EsbirkaEndpoint,
  type EsbirkaQuery,
} from './client';

const ALLOWED_ENDPOINTS: readonly EsbirkaEndpoint[] = [
  'id',
  'detail-zneni',
  'historie',
  'dalsi-informace',
  'odkazy-ke-stazeni',
  'obsah',
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

  let upstream: string;
  try {
    upstream = buildUpstreamUrl(parsed);
  } catch (error) {
    return fail(400, (error as EsbirkaError).message);
  }

  // Pojistka pro případ budoucí úpravy skládání adresy: ven se pouští
  // výhradně dotaz mířící na kořen API e-Sbírky.
  if (!upstream.startsWith(`${ESBIRKA_API_ROOT}/`)) {
    return fail(500, 'Sestavená adresa nemíří na e-Sbírku.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(upstream, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    const body = await response.text();
    return {
      status: response.status,
      body,
      contentType: response.headers.get('content-type') || 'application/json; charset=utf-8',
      cacheControl: response.ok
        ? 'public, max-age=3600, stale-while-revalidate=86400'
        : 'no-store',
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
