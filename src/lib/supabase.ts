import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase Warning] Chybí nebo je prázdná proměnná VITE_SUPABASE_URL nebo VITE_SUPABASE_ANON_KEY. ' +
    'Zkontroluj soubor .env.local a nastavení v prostředí (např. Vercel).'
  );
}

/**
 * Klíč v sessionStorage: uživatel přišel z odkazu „Obnovit heslo“ v e-mailu.
 *
 * Odkaz vrací do aplikace s `type=recovery` v hashi adresy. Klient Supabase
 * ho při startu přečte, přihlásí uživatele a hash smaže — dřív, než se stihne
 * přihlásit posluchač v Reactu. Proto si to poznamenáme už tady, před
 * vytvořením klienta, a aplikace pak po přihlášení nabídne nastavení hesla.
 */
export const PASSWORD_RECOVERY_KEY = 'vscr_password_recovery';
if (typeof window !== 'undefined' && /(^|[#&?])type=recovery(&|$)/.test(window.location.hash)) {
  try {
    sessionStorage.setItem(PASSWORD_RECOVERY_KEY, '1');
  } catch {
    // Bez sessionStorage se nabídka nového hesla neukáže; heslo jde změnit
    // i později přes „Zapomenuté heslo“.
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
