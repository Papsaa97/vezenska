/**
 * Čtení proměnných prostředí pro Autonoma integraci.
 *
 * ZÁSADA: v tomto modulu ani nikde v src/autonoma/ nesmí být žádná záložní
 * ("fallback") hodnota s reálným tajemstvím. Dřívější verze obsahovala natvrdo
 * zapsané heslo testovacího účtu a HMAC tajemství — kdokoli s přístupem k
 * repozitáři (nebo k jeho historii) se tím mohl přihlásit do produkční databáze.
 * Chybí-li konfigurace, integrace se NESMÍ spustit v degradovaném režimu;
 * musí selhat nahlas, nebo se vůbec nenamountovat.
 */

/** Názvy proměnných, bez kterých Autonoma endpoint nemůže fungovat. */
export const REQUIRED_AUTONOMA_ENV = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'AUTONOMA_TEST_EMAIL',
  'AUTONOMA_TEST_PASSWORD',
  'AUTONOMA_SHARED_SECRET',
  'AUTONOMA_SIGNING_SECRET',
] as const;

export type AutonomaEnvName = (typeof REQUIRED_AUTONOMA_ENV)[number];

/** Vrátí hodnotu proměnné, nebo undefined, je-li nenastavená či prázdná. */
export function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/** Vrátí hodnotu proměnné, nebo vyhodí výjimku. Volej vždy líně (lazy), nikdy na úrovni modulu. */
export function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(
      `[Autonoma] Chybí proměnná prostředí ${name}. Autonoma integrace je vypnutá. ` +
        `Nastav všechny z: ${REQUIRED_AUTONOMA_ENV.join(', ')} (viz .env.example).`
    );
  }
  return value;
}

/** Seznam chybějících povinných proměnných. Prázdné pole = plně nakonfigurováno. */
export function missingAutonomaEnv(): AutonomaEnvName[] {
  return REQUIRED_AUTONOMA_ENV.filter((name) => !readEnv(name));
}

/** True, pokud je Autonoma integrace plně nakonfigurovaná z prostředí. */
export function isAutonomaConfigured(): boolean {
  return missingAutonomaEnv().length === 0;
}

/**
 * True, pokud je Autonoma endpoint výslovně povolen.
 *
 * Endpoint vytváří a maže reálné řádky v databázi, takže v produkci musí být
 * vypnutý. Zapíná se jen výslovným `AUTONOMA_ENABLED=true` (typicky v preview
 * prostředí nebo lokálně), nikdy implicitně.
 */
export function isAutonomaEnabled(): boolean {
  return readEnv('AUTONOMA_ENABLED') === 'true' && isAutonomaConfigured();
}
