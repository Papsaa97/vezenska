/**
 * Serverless funkce `/api/push` — doručení upozornění do zařízení (Web Push).
 *
 * GET  vrátí veřejný klíč VAPID, se kterým se prohlížeč přihlásí k odběru.
 *      Klíč je veřejný z definice; aplikace si ho bere odsud, aby stačilo
 *      nastavit ho na jednom místě (Vercel) a nemusel se znovu sestavovat
 *      klientský balík.
 * POST volá jen databáze (trigger `push_odeslat`, migrace 044) přes pg_net.
 *      Tělo nese seznam zpráv i s odběry příjemců, takže funkce nepotřebuje
 *      klíč service_role a do databáze nic nečte.
 *
 * Proměnné prostředí (Vercel → Settings → Environment Variables), žádná
 * s prefixem VITE_ — ty by skončily v prohlížeči:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  pár klíčů (`npx web-push generate-vapid-keys`)
 *   PUSH_WEBHOOK_SECRET                  tajemství z Vaultu (viz 044)
 * Zařízení, která push služba už nezná, se odhlásí přes RPC
 * `push_odebrat_neplatne` s veřejnými VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
 */
import { timingSafeEqual } from 'node:crypto';
import webpush from 'web-push';

/** Totéž omezení jako `_push_adresa_je_platna` v migraci 044. */
const PUSH_ENDPOINT =
  /^https:\/\/(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.notify\.windows\.com|web\.push\.apple\.com|[a-z0-9.-]+\.push\.apple\.com)\//;

/** Kontakt pro push služby (povinný u VAPID); stačí adresa aplikace. */
const VAPID_SUBJECT = 'https://akademie-vscr.app';

/** Jak dlouho push služba drží zprávu pro vypnuté zařízení. */
const TTL_SECONDS = 3 * 24 * 60 * 60;

interface VercelLikeRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface VercelLikeResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
}

interface PushZprava {
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
  tag: string;
  url: string;
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function send(res: VercelLikeResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function header(req: VercelLikeRequest, name: string): string {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

/** Porovnání tajemství v konstantním čase. */
function secretMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max;
}

/** Vezme jen zprávy ve správném tvaru a na povolenou push službu. */
function parseZpravy(body: unknown): PushZprava[] {
  const parsed: unknown = typeof body === 'string' ? JSON.parse(body) : body;
  if (!parsed || typeof parsed !== 'object') return [];
  const list = (parsed as { zpravy?: unknown }).zpravy;
  if (!Array.isArray(list)) return [];
  return list.filter((item): item is PushZprava => {
    if (!item || typeof item !== 'object') return false;
    const z = item as Record<string, unknown>;
    return (
      isText(z.endpoint, 1000) && PUSH_ENDPOINT.test(z.endpoint) &&
      isText(z.p256dh, 200) && isText(z.auth, 100) &&
      isText(z.title, 400) && isText(z.body, 600) &&
      isText(z.tag, 100) && isText(z.url, 200) && z.url.startsWith('/')
    );
  });
}

/** Odhlásí zařízení, která push služba zná jako neexistující. */
async function removeGone(endpoints: string[], secret: string): Promise<void> {
  const url = readEnv('VITE_SUPABASE_URL');
  const anonKey = readEnv('VITE_SUPABASE_ANON_KEY');
  if (!url || !anonKey || endpoints.length === 0) return;
  try {
    await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/push_odebrat_neplatne`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ p_tajemstvi: secret, p_endpointy: endpoints }),
    });
  } catch {
    // Úklid se zopakuje při další zprávě na stejné zařízení.
  }
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse): Promise<void> {
  const publicKey = readEnv('VAPID_PUBLIC_KEY');
  const privateKey = readEnv('VAPID_PRIVATE_KEY');
  const secret = readEnv('PUSH_WEBHOOK_SECRET');

  if (req.method === 'GET' || req.method === 'HEAD') {
    if (!publicKey || !privateKey || !secret) {
      send(res, 503, { chyba: 'Upozornění do zařízení nejsou na serveru nastavená.' });
      return;
    }
    send(res, 200, { publicKey });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    send(res, 405, { chyba: 'Povolena je metoda GET nebo POST.' });
    return;
  }

  if (!publicKey || !privateKey || !secret) {
    send(res, 503, { chyba: 'Upozornění do zařízení nejsou na serveru nastavená.' });
    return;
  }

  const auth = header(req, 'authorization');
  if (!auth.startsWith('Bearer ') || !secretMatches(auth.slice(7), secret)) {
    send(res, 401, { chyba: 'Neoprávněný požadavek.' });
    return;
  }

  let zpravy: PushZprava[];
  try {
    zpravy = parseZpravy(req.body).slice(0, 500);
  } catch {
    send(res, 400, { chyba: 'Tělo požadavku není platný JSON.' });
    return;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, publicKey, privateKey);

  const gone: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    zpravy.map(async (z) => {
      try {
        await webpush.sendNotification(
          { endpoint: z.endpoint, keys: { p256dh: z.p256dh, auth: z.auth } },
          JSON.stringify({ title: z.title, body: z.body, tag: z.tag, url: z.url }),
          { TTL: TTL_SECONDS, urgency: 'normal', timeout: 10_000 }
        );
        sent += 1;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) gone.push(z.endpoint);
        else failed += 1;
      }
    })
  );

  await removeGone(gone, secret);
  send(res, 200, { odeslano: sent, neplatne: gone.length, chyby: failed });
}
