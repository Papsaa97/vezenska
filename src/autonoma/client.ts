import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  'https://ecpcnexkushttwakznwm.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcGNuZXhrdXNodHR3YWt6bndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDU3NDAsImV4cCI6MjEwNDEyMTc0MH0.9VxgRPsGiEgnQIZ8y9k4As44UNrAjevGjmD59Rpeio0';

export const TEST_ADMIN_EMAIL = 'autonoma_test_runner@vs.test';
export const TEST_ADMIN_PASSWORD = 'AutonomaTestPassword123!';

let cachedClient: SupabaseClient | null = null;
let cachedUserId: string | null = null;

export async function getAdminSupabaseClient(): Promise<SupabaseClient> {
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

export async function getTestUserId(): Promise<string> {
  if (cachedUserId) {
    return cachedUserId;
  }
  await getAdminSupabaseClient();
  return cachedUserId!;
}
