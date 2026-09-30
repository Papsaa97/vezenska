import { supabase } from '../lib/supabase';

/**
 * Upozornění do zařízení (Web Push).
 *
 * Tok: zápis do zvonečku → trigger `push_odeslat` (migrace 044) → `/api/push`
 * na Vercelu → push služba prohlížeče → `public/sw.js` zobrazí upozornění.
 * Tady je jen klientská část: povolení, přihlášení zařízení k odběru,
 * předvolby a odhlášení zařízení při odhlášení z účtu.
 */

/** Druhy upozornění — musí odpovídat CHECK na user_notifications.druh (044). */
export const PUSH_DRUHY = ['zprava', 'zminka', 'anketa', 'nastenka', 'celoskolni', 'zarazeni'] as const;
export type PushDruh = (typeof PUSH_DRUHY)[number];

export const PUSH_DRUH_POPIS: Record<PushDruh, string> = {
  zprava: 'Zprávy od správce',
  zminka: 'Označení v diskuzi třídy',
  anketa: 'Nové ankety ve třídě',
  nastenka: 'Hlášení, události a rozvrh na nástěnce třídy',
  celoskolni: 'Celoškolní oznámení',
  zarazeni: 'Žádosti a zařazení do třídy',
};

/**
 * Co zařízení umí:
 * - `ok`           prohlížeč upozornění podporuje,
 * - `ios-plocha`   iPhone/iPad: upozornění jdou jen z aplikace přidané na plochu,
 * - `nepodporovano` prohlížeč Web Push nemá.
 */
export type PushPodpora = 'ok' | 'ios-plocha' | 'nepodporovano';

function isIos(): boolean {
  const ua = navigator.userAgent;
  // iPadOS se hlásí jako Mac; odliší ho dotyková obrazovka.
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

export function pushPodpora(): PushPodpora {
  if (typeof window === 'undefined') return 'nepodporovano';
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (isIos() && !isStandalone()) return 'ios-plocha';
  return supported ? 'ok' : 'nepodporovano';
}

/** Registrace workera; `null`, když žádný neběží (např. vývojový server). */
async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration();
  if (!existing) return null;
  // `ready` počká, až bude worker aktivní (první návštěva).
  return navigator.serviceWorker.ready;
}

/** Odběr tohoto zařízení v prohlížeči, pokud existuje. */
export async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await registration();
  return reg ? reg.pushManager.getSubscription() : null;
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = (value + '='.repeat((4 - (value.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function sameBytes(a: ArrayBuffer | null, b: Uint8Array): boolean {
  if (!a) return false;
  const view = new Uint8Array(a);
  return view.length === b.length && view.every((byte, i) => byte === b[i]);
}

/** Krátký popis zařízení, aby se v databázi daly odběry rozeznat. */
function deviceLabel(): string {
  const ua = navigator.userAgent;
  const os = /CrOS/.test(ua)
    ? 'Chromebook'
    : /Android/.test(ua)
      ? 'Android'
      : isIos()
        ? 'iPhone/iPad'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Mac/.test(ua)
            ? 'Mac'
            : /Linux/.test(ua)
              ? 'Linux'
              : 'Zařízení';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Firefox\//.test(ua)
      ? 'Firefox'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Safari\//.test(ua)
          ? 'Safari'
          : 'prohlížeč';
  return `${os} · ${browser}`;
}

async function saveSubscription(sub: PushSubscription): Promise<string | null> {
  const json = sub.toJSON();
  const { error } = await supabase.rpc('push_ulozit_odber', {
    p_endpoint: sub.endpoint,
    p_p256dh: json.keys?.p256dh ?? '',
    p_auth: json.keys?.auth ?? '',
    p_zarizeni: deviceLabel(),
  });
  if (!error) return null;
  if (/push_ulozit_odber/.test(error.message)) {
    return 'Databáze upozornění do zařízení zatím nezná (chybí migrace 044).';
  }
  return `Zařízení se nepodařilo uložit: ${error.message}`;
}

/** Veřejný klíč VAPID ze serveru, nebo chybová hláška. */
async function fetchPublicKey(): Promise<{ key: string } | { error: string }> {
  try {
    const res = await fetch('/api/push', { headers: { Accept: 'application/json' } });
    const type = res.headers.get('Content-Type') ?? '';
    if (!type.includes('json')) {
      return { error: 'Upozornění do zařízení tady nefungují — server je nemá (jen na akademie-vscr.app).' };
    }
    const body = (await res.json()) as { publicKey?: string; chyba?: string };
    if (!res.ok || !body.publicKey) {
      return { error: body.chyba ?? 'Upozornění do zařízení nejsou na serveru nastavená.' };
    }
    return { key: body.publicKey };
  } catch {
    return { error: 'Server se nepodařilo zastihnout. Zkontrolujte připojení.' };
  }
}

/**
 * Zapne upozornění v tomto zařízení. Vrací chybovou hlášku, nebo `null`.
 * Musí se volat z kliknutí uživatele — prohlížeče jinak žádost o povolení
 * potichu zahodí.
 */
export async function zapnoutUpozorneni(): Promise<string | null> {
  const podpora = pushPodpora();
  if (podpora === 'ios-plocha') {
    return 'Na iPhonu a iPadu nejdřív přidejte aplikaci na plochu (Sdílet → Přidat na plochu) a otevřete ji odtamtud.';
  }
  if (podpora === 'nepodporovano') return 'Tento prohlížeč upozornění do zařízení nepodporuje.';

  const reg = await registration();
  if (!reg) return 'Aplikace ještě není nainstalovaná v prohlížeči. Obnovte prosím stránku a zkuste to znovu.';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return 'Upozornění jsou v prohlížeči zablokovaná. Povolte je u adresy akademie-vscr.app v nastavení webu (ikona vlevo od adresy).';
  }

  const publicKey = await fetchPublicKey();
  if ('error' in publicKey) return publicKey.error;

  const key = base64UrlToBytes(publicKey.key);
  let sub = await reg.pushManager.getSubscription();
  // Odběr vytvořený se starým klíčem VAPID (po výměně klíčů na serveru)
  // by push služba odmítala — zrušit a přihlásit znovu.
  if (sub && !sameBytes(sub.options.applicationServerKey, key)) {
    await sub.unsubscribe().catch(() => false);
    sub = null;
  }
  try {
    sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `Prohlížeč odběr odmítl: ${message}`;
  }
  return saveSubscription(sub);
}

/** Vypne upozornění v tomto zařízení (ostatní zařízení účtu zůstanou). */
export async function vypnoutUpozorneni(): Promise<string | null> {
  const sub = await currentSubscription();
  if (!sub) return null;
  const { error } = await supabase.rpc('push_zrusit_odber', { p_endpoint: sub.endpoint });
  await sub.unsubscribe().catch(() => false);
  return error ? `Odběr se nepodařilo zrušit na serveru: ${error.message}` : null;
}

/**
 * Po přihlášení: je-li zařízení přihlášené k odběru, obnoví záznam na
 * serveru a přiřadí ho aktuálnímu účtu. Chyby jen polyká — nejde o akci
 * uživatele.
 */
export async function obnovitOdberZarizeni(): Promise<boolean> {
  if (pushPodpora() !== 'ok' || Notification.permission !== 'granted') return false;
  const sub = await currentSubscription().catch(() => null);
  if (!sub) return false;
  return (await saveSubscription(sub)) === null;
}

/**
 * Při odhlášení z účtu: zařízení přestane dostávat upozornění odhlášeného
 * uživatele. Na sdíleném počítači by jinak další člověk viděl cizí zprávy.
 * Volat ještě PŘED supabase.auth.signOut() — funkce potřebuje přihlášení.
 */
export async function odhlasitZarizeni(): Promise<void> {
  try {
    if (pushPodpora() !== 'ok') return;
    const sub = await currentSubscription();
    if (!sub) return;
    await supabase.rpc('push_zrusit_odber', { p_endpoint: sub.endpoint });
    await sub.unsubscribe();
  } catch {
    // Odhlášení z účtu nesmí selhat kvůli upozorněním.
  }
}

export async function nacistVypnuteDruhy(): Promise<PushDruh[]> {
  const { data, error } = await supabase.rpc('push_nacist_predvolby');
  if (error || !Array.isArray(data)) return [];
  return (data as unknown[]).filter((d): d is PushDruh => PUSH_DRUHY.includes(d as PushDruh));
}

export async function ulozitVypnuteDruhy(vypnute: PushDruh[]): Promise<string | null> {
  const { error } = await supabase.rpc('push_ulozit_predvolby', { p_vypnute: vypnute });
  return error ? `Nastavení se nepodařilo uložit: ${error.message}` : null;
}

/**
 * Klepnutí na upozornění, když je aplikace už otevřená: worker pošle adresu
 * a aplikace přepne záložku přes #kotvu (stejně jako šipky v hlavičce, včetně
 * dotazu, zda opustit rozepsaný test). Stránka se znovu nenačítá.
 */
export function installPushClickHandler(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
    const data = event.data as { type?: unknown; url?: unknown } | null;
    if (!data || data.type !== 'OPEN_URL' || typeof data.url !== 'string') return;
    let target: URL;
    try {
      target = new URL(data.url, window.location.origin);
    } catch {
      return;
    }
    if (target.origin !== window.location.origin) return;
    if (target.hash && target.hash !== window.location.hash) {
      window.location.hash = target.hash;
    }
  });
}
