import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { defineFactory, handleRequest, type HandlerConfig } from '@autonoma-ai/sdk';
import { z } from 'zod';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  'https://ecpcnexkushttwakznwm.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcGNuZXhrdXNodHR3YWt6bndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDU3NDAsImV4cCI6MjEwNDEyMTc0MH0.9VxgRPsGiEgnQIZ8y9k4As44UNrAjevGjmD59Rpeio0';

const TEST_ADMIN_EMAIL = 'autonoma_test_runner@vs.test';
const TEST_ADMIN_PASSWORD = 'AutonomaTestPassword123!';

let cachedClient: SupabaseClient | null = null;
let cachedUserId: string | null = null;

async function getAdminSupabaseClient(): Promise<SupabaseClient> {
  if (cachedClient) {
    return cachedClient;
  }
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const authRes = await client.auth.signInWithPassword({
    email: TEST_ADMIN_EMAIL,
    password: TEST_ADMIN_PASSWORD,
  });
  if (authRes.error) {
    throw new Error(`[Autonoma] Supabase auth failed: ${authRes.error.message}`);
  }
  cachedUserId = authRes.data.user.id;
  cachedClient = client;
  return client;
}

async function getTestUserId(): Promise<string> {
  if (cachedUserId) {
    return cachedUserId;
  }
  await getAdminSupabaseClient();
  return cachedUserId!;
}

export const QuizQuestionsFactory = defineFactory({
  inputSchema: z.object({
    subject: z.string(),
    question: z.string(),
    options: z.array(z.string()),
    correct_index: z.number(),
    explanation: z.string().optional().default(''),
  }),
  refSchema: z.object({
    id: z.string(),
    subject: z.string(),
    question: z.string(),
    options: z.array(z.string()),
    correct_index: z.number(),
    explanation: z.string(),
  }),
  create: async (data, ctx) => {
    const sb = await getAdminSupabaseClient();
    let questionText = data.question;
    if (!questionText.includes(ctx.testRunId) && !questionText.includes(ctx.testRunId.slice(0, 8))) {
      questionText = `${data.question} [${ctx.testRunId.slice(0, 8)}]`;
    }
    const payload = {
      subject: data.subject,
      question: questionText,
      options: data.options,
      correct_index: data.correct_index,
      explanation: data.explanation || '',
    };
    const res = await sb.from('quiz_questions').insert([payload]).select().single();
    if (res.error || !res.data) {
      throw new Error(`Failed to create quiz_question: ${res.error?.message ?? 'Unknown error'}`);
    }
    const row = res.data as {
      id: string;
      subject: string;
      question: string;
      options: string[];
      correct_index: number;
      explanation: string;
    };
    return {
      id: String(row.id),
      subject: String(row.subject),
      question: String(row.question),
      options: Array.isArray(row.options) ? row.options : data.options,
      correct_index: Number(row.correct_index),
      explanation: String(row.explanation || ''),
    };
  },
  teardown: async (record, _ctx) => {
    const sb = await getAdminSupabaseClient();
    const res = await sb.from('quiz_questions').delete().eq('id', record.id);
    if (res.error) {
      console.warn(`[Autonoma] Teardown quiz_question ${record.id} warning:`, res.error.message);
    }
  },
});

export const UserFeedbackFactory = defineFactory({
  inputSchema: z.object({
    user_name: z.string(),
    category: z.string(),
    message: z.string(),
    screen_context: z.string().nullable().optional().default(null),
    status: z.string().optional().default('new'),
    user_id: z.string().nullable().optional().default(null),
  }),
  refSchema: z.object({
    id: z.string(),
    user_name: z.string(),
    category: z.string(),
    message: z.string(),
    screen_context: z.string().nullable(),
    status: z.string(),
  }),
  create: async (data, _ctx) => {
    const sb = await getAdminSupabaseClient();
    const userId = data.user_id ?? (await getTestUserId());
    const payload = {
      user_id: userId,
      user_name: data.user_name,
      category: data.category,
      message: data.message,
      screen_context: data.screen_context ?? null,
      status: data.status || 'new',
    };
    const res = await sb.from('user_feedback').insert([payload]).select().single();
    if (res.error || !res.data) {
      throw new Error(`Failed to create user_feedback: ${res.error?.message ?? 'Unknown error'}`);
    }
    const row = res.data as {
      id: string;
      user_name: string;
      category: string;
      message: string;
      screen_context: string | null;
      status: string;
    };
    return {
      id: String(row.id),
      user_name: String(row.user_name),
      category: String(row.category),
      message: String(row.message),
      screen_context: row.screen_context ? String(row.screen_context) : null,
      status: String(row.status || 'new'),
    };
  },
  teardown: async (record, _ctx) => {
    const sb = await getAdminSupabaseClient();
    const res = await sb.from('user_feedback').delete().eq('id', record.id);
    if (res.error) {
      console.warn(`[Autonoma] Teardown user_feedback ${record.id} warning:`, res.error.message);
    }
  },
});

const sharedSecret =
  process.env.AUTONOMA_SHARED_SECRET ||
  '3cac9b35f2109abafba2f0b16e56f3598a8bb322af65e34d3328fc5c1aea7c12';

let signingSecret =
  process.env.AUTONOMA_SIGNING_SECRET ||
  '8f9b7c6d5e4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c';

if (signingSecret === sharedSecret) {
  signingSecret = '8f9b7c6d5e4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c';
}

const autonomaConfig: HandlerConfig = {
  scopeField: 'id',
  sharedSecret,
  signingSecret,
  factories: {
    quiz_questions: QuizQuestionsFactory,
    user_feedback: UserFeedbackFactory,
  },
  auth: async (_user, _ctx) => {
    return {
      credentials: {
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
      },
    };
  },
};

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

export const config = {
  api: {
    bodyParser: false,
  },
};
