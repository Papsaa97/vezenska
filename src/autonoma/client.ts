import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from './env';

let cachedClient: SupabaseClient | null = null;
let cachedUserId: string | null = null;

/**
 * Index signature je tu proto, že HandlerConfig.auth v @autonoma-ai/sdk očekává
 * `credentials: Record<string, string>`.
 */
export type TestRunnerCredentials = Record<string, string> & {
  email: string;
  password: string;
};

/**
 * Přihlašovací údaje testovacího účtu.
 *
 * Čtou se líně až při prvním volání — nikoli na úrovni modulu. Tenhle soubor je
 * nepřímo importovaný z vite.config.ts (přes vitePlugin), takže výjimka na úrovni
 * modulu by rozbila `npm run dev` i `npm run build` každému, kdo Autonoma
 * proměnné nastavené nemá.
 */
export function getTestRunnerCredentials(): TestRunnerCredentials {
  return {
    email: requireEnv('AUTONOMA_TEST_EMAIL'),
    password: requireEnv('AUTONOMA_TEST_PASSWORD'),
  };
}

export async function getAdminSupabaseClient(): Promise<SupabaseClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const client = createClient(requireEnv('VITE_SUPABASE_URL'), requireEnv('VITE_SUPABASE_ANON_KEY'));
  const { email, password } = getTestRunnerCredentials();
  const authRes = await client.auth.signInWithPassword({ email, password });

  if (authRes.error) {
    throw new Error(`[Autonoma] Supabase auth failed: ${authRes.error.message}`);
  }

  cachedUserId = authRes.data.user.id;
  cachedClient = client;
  return client;
}

export async function getTestUserId(): Promise<string> {
  if (cachedUserId) {
    return cachedUserId;
  }
  await getAdminSupabaseClient();
  return cachedUserId!;
}
