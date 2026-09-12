import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleRequest } from '@autonoma-ai/sdk';
import { autonomaConfig } from '../src/autonoma/handler';

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
) {
  try {
    let body = '';
    if (req.body) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    } else {
      body = await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk) =>
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        );
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        req.on('error', reject);
      });
    }

    const headers: Record<string, string> = {};
    for (const [key, val] of Object.entries(req.headers)) {
      if (typeof val === 'string') {
        headers[key.toLowerCase()] = val;
      } else if (Array.isArray(val)) {
        headers[key.toLowerCase()] = val[0] ?? '';
      }
    }

    const result = await handleRequest(autonomaConfig, { body, headers });
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.body));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });
  const res = await handleRequest(autonomaConfig, { body, headers });
  return new Response(JSON.stringify(res.body), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
