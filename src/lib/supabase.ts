import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase Warning] Chybí nebo je prázdná proměnná VITE_SUPABASE_URL nebo VITE_SUPABASE_ANON_KEY. ' +
    'Zkontroluj soubor .env.local a nastavení v prostředí (např. Vercel).'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
