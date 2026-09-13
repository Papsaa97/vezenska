import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleRequest } from '@autonoma-ai/sdk';
import { createAutonomaConfig } from '../src/autonoma/handler';
import { isAutonomaEnabled, missingAutonomaEnv, readEnv } from '../src/autonoma/env';

export { QuizQuestionsFactory } from '../src/autonoma/factories/quizQuestions';
export { UserFeedbackFactory } from '../src/autonoma/factories/userFeedback';

const MAX_BODY_BYTES = 1_000_000;

async function readRawBody(req: IncomingMessage & { body?: unknown }): Promise<string> {
  if (typeof req.body === 'string') {
    return req.body;
  }
  if (req.body && typeof req.body === 'object') {
    return JSON.stringify(req.body);
  }
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buf.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body too large'));
        return;
      }
      chunks.push(buf);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

function normalizeHeaders(raw: IncomingMessage['headers']): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === 'string') {
      headers[key.toLowerCase()] = val;
    } else if (Array.isArray(val)) {
      headers[key.toLowerCase()] = val[0] ?? '';
    }
  }
  return headers;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

/**
 * Autonoma testovací endpoint.
 *
 * Zakládá a maže reálné řádky v Supabase (quiz_questions, user_feedback), takže
 * je ve výchozím stavu VYPNUTÝ. Zapíná se jen výslovným AUTONOMA_ENABLED=true
 * spolu s kompletní konfigurací v proměnných prostředí — typicky v preview
 * prostředí, nikdy v produkci. Dokud není zapnutý, tváří se jako neexistující
 * (404), aby o sobě nedával vědět.
 *
 * Ověřování podpisu i přihlášení řeší SDK z hodnot v createAutonomaConfig();
 * tenhle modul žádné tajemství nezná ani neobsahuje.
 */
export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
) {
  if (!isAutonomaEnabled()) {
    if (readEnv('AUTONOMA_ENABLED') === 'true') {
      console.error(
        `[Autonoma] AUTONOMA_ENABLED=true, ale chybí proměnné: ${missingAutonomaEnv().join(', ')}`
      );
    }
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const rawBody = await readRawBody(req);
    const result = await handleRequest(createAutonomaConfig(), {
      body: rawBody,
      headers: normalizeHeaders(req.headers),
    });
    sendJson(res, result.status, result.body);
  } catch (err: unknown) {
    // Detail chyby zůstává v serverovém logu; klientovi nevracíme nic, co by
    // prozradilo konfiguraci nebo názvy proměnných.
    console.error('[Autonoma] Handler error:', err);
    sendJson(res, 500, { error: 'Internal Server Error' });
  }
}
