/**
 * Nastavení ochrany proti robotům (Supabase Auth → CAPTCHA).
 *
 * Odděleno od komponenty záměrně: na tohle nastavení se ptá i překlad chybových
 * hlášek v constants/auth, který nemá důvod tahat do sebe React.
 */

export type CaptchaProvider = 'hcaptcha' | 'turnstile';

export interface CaptchaConfig {
  provider: CaptchaProvider;
  siteKey: string;
}

export const CAPTCHA_SCRIPT_URL: Record<CaptchaProvider, string> = {
  hcaptcha: 'https://js.hcaptcha.com/1/api.js?render=explicit',
  turnstile: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
};

/** Jméno globální proměnné, pod kterou se skript poskytovatele zpřístupní. */
export const CAPTCHA_GLOBAL_NAME: Record<CaptchaProvider, string> = {
  hcaptcha: 'hcaptcha',
  turnstile: 'turnstile',
};

/**
 * Přečte nastavení z proměnných prostředí. Vrací null, pokud chybí nebo
 * nedávají smysl — pak se ověření nezobrazí a aplikace se chová jako dřív.
 *
 * Bere `env` jako parametr záměrně: `import.meta.env` existuje jen uvnitř
 * Vite, takže přímé čtení by tuhle rozhodovací logiku vyřadilo z testování.
 * Přitom právě ona ručí za to, že je změna bez nastavení neškodná.
 */
export function resolveCaptchaConfig(env: Record<string, unknown> | undefined): CaptchaConfig | null {
  const provider = String(env?.VITE_CAPTCHA_PROVIDER ?? '').trim().toLowerCase();
  const siteKey = String(env?.VITE_CAPTCHA_SITEKEY ?? '').trim();
  if (provider !== 'hcaptcha' && provider !== 'turnstile') return null;
  if (!siteKey) return null;
  return { provider, siteKey };
}

export function currentCaptchaConfig(): CaptchaConfig | null {
  return resolveCaptchaConfig(import.meta.env as unknown as Record<string, unknown> | undefined);
}

/**
 * Je ochrana proti robotům v této sestavě nastavená?
 *
 * Musí odpovídat nastavení v Supabase. Když je ochrana zapnutá tam a tady ne,
 * server přihlášení odmítne — a uživatel se bez pomoci nedozví proč, protože
 * na obrazovce žádné ověření není. Právě tenhle rozpor pojmenovává
 * translateAuthError v constants/auth.
 */
export function isCaptchaConfigured(): boolean {
  return currentCaptchaConfig() !== null;
}
