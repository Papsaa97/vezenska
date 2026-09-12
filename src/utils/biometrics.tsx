import React from 'react';

/**
 * Pomocné funkce pro biometrické ověřování (WebAuthn / Face ID / Touch ID / otisk prstu)
 * a integraci s nativním Credential Management API prohlížeče.
 */

const STORAGE_KEY_BIOMETRIC_USER = 'vscr_biometric_user';

/**
 * Ověří, zda zařízení podporuje platformní biometrický autentizátor (Face ID, Touch ID, Windows Hello, Android otisk).
 */
export async function isBiometricsSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return Boolean(isAvailable);
    }
  } catch (err) {
    console.debug('[Biometrics] Chyba při zjišťování podpory biometrie:', err);
  }
  return false;
}

/**
 * Vyvolá nativní dialog biometrického ověření na zařízení (Face ID / Touch ID / otisk).
 */
export async function authenticateWithBiometrics(userName: string = 'Uživatel VS ČR'): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Vytvoříme lokální výzvu vyžadující biometrické ověření uživatele
    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Akademie VS ČR',
          id: window.location.hostname || 'localhost',
        },
        user: {
          id: userId,
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false,
        },
        timeout: 60000,
      },
    });

    return Boolean(credential);
  } catch (err) {
    console.debug('[Biometrics] Ověření biometrie bylo přerušeno nebo selhalo:', err);
    return false;
  }
}

/**
 * Uloží přihlašovací údaje do správce hesel prohlížeče (Klíčenka iCloud / Google Password Manager),
 * pokud to prohlížeč podporuje.
 */
export async function storeBrowserCredential(email: string, password: string): Promise<void> {
  if (typeof window === 'undefined') return;

  // Uložíme si informaci o e-mailu pro rychlé předvyplnění / biometriku
  setSavedBiometricUser(email);

  if ('PasswordCredential' in window && navigator.credentials?.store) {
    try {
      const PasswordCred = (window as unknown as { PasswordCredential: new (init: { id: string; password: string; name: string }) => unknown }).PasswordCredential;
      if (PasswordCred) {
        const cred = new PasswordCred({
          id: email,
          password: password,
          name: email,
        });
        await (navigator.credentials.store as (cred: unknown) => Promise<unknown>)(cred);
      }
    } catch (e) {
      console.debug('[Biometrics] PasswordCredential store nebylo dokončeno:', e);
    }
  }
}

/**
 * Získá uložené přihlašovací údaje z nativního správce hesel.
 */
export async function getStoredBrowserCredential(): Promise<{ email: string; password?: string } | null> {
  if (typeof window === 'undefined' || !navigator.credentials?.get) {
    return null;
  }

  try {
    const cred = await (navigator.credentials.get as (options?: unknown) => Promise<unknown>)({
      password: true,
      mediation: 'optional',
    });

    if (cred && typeof cred === 'object' && 'id' in cred && typeof (cred as { id: unknown }).id === 'string') {
      const typedCred = cred as { id: string; password?: unknown };
      return {
        email: typedCred.id,
        password: typeof typedCred.password === 'string' ? typedCred.password : undefined,
      };
    }
  } catch (e) {
    console.debug('[Biometrics] Načtení z PasswordCredential selhalo:', e);
  }

  return null;
}

export function getSavedBiometricUser(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_BIOMETRIC_USER);
}

export function setSavedBiometricUser(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_BIOMETRIC_USER, email);
}

export function clearSavedBiometricUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_BIOMETRIC_USER);
}

/**
 * SVG ikona otisku prstu (Fingerprint) pro biometrické přihlašování.
 */
export function FingerprintIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
      <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
      <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
      <path d="M2 12a10 10 0 0 1 18-6" />
      <path d="M2 16h.01" />
      <path d="M21.8 16c.2-2 .131-5.354 0-6" />
      <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
      <path d="M8.65 22c.21-.66.45-1.32.57-2" />
      <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
    </svg>
  );
}
