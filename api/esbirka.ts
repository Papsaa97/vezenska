/**
 * Serverless funkce `/api/esbirka` — most mezi aplikací a veřejným REST API
 * e-Sbírky (https://e-sbirka.gov.cz/restful-api).
 *
 * Existuje proto, že e-Sbírka posílá `Access-Control-Allow-Origin` jen pro
 * vlastní doménu. Prohlížeč by se tedy k API nedostal, i když je veřejné.
 * Vlastní logika je v `src/utils/esbirka/proxy.ts`, aby ji sdílel i vývojový
 * server (`vite.config.ts`) a nemohly se rozejít.
 *
 * Pozor na nasazení: tohle je jediná serverová část aplikace. Na statickém
 * hostingu (např. `render.yaml`) funkce neběží a `/api/esbirka` vrátí HTML.
 * Klient s tím počítá — ověřování proti e-Sbírce se v takovém případě označí
 * za nedostupné, nikdy se netváří jako úspěšné.
 */
import { handleEsbirkaProxy } from '../src/utils/esbirka/proxy';

/** Minimální tvar požadavku, který Vercel Node runtime předává. */
interface VercelLikeRequest {
  url?: string;
  method?: string;
}

/** Minimální tvar odpovědi, který Vercel Node runtime předává. */
interface VercelLikeResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
}

export default async function handler(
  req: VercelLikeRequest,
  res: VercelLikeResponse
): Promise<void> {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ chyba: 'Povolena je jen metoda GET.' }));
    return;
  }

  // `req.url` je relativní cesta i s dotazem; základ je jen pro parser URL.
  const parsed = new URL(req.url || '/api/esbirka', 'http://localhost');
  const result = await handleEsbirkaProxy(parsed.searchParams);

  res.statusCode = result.status;
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Cache-Control', result.cacheControl);
  res.end(result.body);
}
