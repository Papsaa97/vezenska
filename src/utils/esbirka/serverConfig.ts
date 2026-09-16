/**
 * Serverové nastavení přístupu k e-Sbírce (kořen API a přístupový klíč).
 *
 * POUZE PRO SERVER. Tenhle modul čte proměnné prostředí a nesmí se dostat do
 * klientského balíku. Importuje ho jen serverless funkce přes `proxy.ts`,
 * vývojový middleware ve `vite.config.ts` a skripty běžící v Node.
 *
 * PROČ TO NENÍ POTŘEBA DNES: aplikace volá `https://e-sbirka.gov.cz/sbr-externi`,
 * což je backend veřejného portálu a klíč nevyžaduje (ověřeno měřením — bez
 * jakékoli hlavičky vrací HTTP 200). Dokumentované Veřejné API e-Sbírky ale
 * běží na jiném hostu, `https://api.e-sbirka.gov.cz`, a bez klíče vrací HTTP 401
 * s kódem `NEPLATNY_API_KLIC`. Klíč přiděluje Ministerstvo vnitra po registraci
 * (postup je v `docs/esbirka-registrace.md`).
 *
 * Až klíč přijde, nemusí se nic přepisovat — stačí vyplnit dvě proměnné
 * prostředí. Bez nich se aplikace chová přesně jako dosud.
 */

/** Kořen, na který se volá, když se nic nenastaví. Backend veřejného portálu. */
export const DEFAULT_API_ROOT = 'https://e-sbirka.gov.cz/sbr-externi';

/** Kořen dokumentovaného Veřejného API. Použitelný až s přiděleným klíčem. */
export const PUBLIC_API_ROOT = 'https://api.e-sbirka.gov.cz';

/**
 * Název hlavičky, ve které e-Sbírka očekává přístupový klíč.
 *
 * Schválně konstanta, ne proměnná prostředí: název je daný dokumentací
 * (OpenAPI 3.0 e-Sbírky, `securitySchemes.ApiKey.name`) a ověřený měřením —
 * query parametr ani `Authorization: Bearer` server nepřijímá. Kdyby šlo
 * jméno hlavičky nastavit zvenčí, přibyl by jen způsob, jak klíč poslat
 * pod cizím jménem někam, kam nemá.
 */
export const API_KEY_HEADER = 'esel-api-access-key';

export interface EsbirkaServerConfig {
  /** Kořen API, na který se posílají dotazy. */
  apiRoot: string;
  /** Přístupový klíč, nebo null, když žádný nastavený není. */
  apiKey: string | null;
}

/** Přečte proměnnou prostředí tak, aby to nespadlo tam, kde `process` není. */
function readEnv(name: string): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const value = env?.[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

/**
 * Sestaví nastavení z prostředí.
 *
 * `ESBIRKA_API_ROOT` — kořen API. Nevyplněno = backend portálu (dnešní stav).
 * `ESBIRKA_API_KEY`  — přístupový klíč od Ministerstva vnitra. Nepovinný.
 *
 * Ani jedna proměnná nemá prefix `VITE_`, a to je podstatné: všechno s tímhle
 * prefixem Vite vkládá do veřejného klientského balíku, odkud si to může
 * přečíst kdokoli. Klíč tam nesmí nikdy skončit.
 */
export function readServerConfig(): EsbirkaServerConfig {
  return {
    apiRoot: readEnv('ESBIRKA_API_ROOT') ?? DEFAULT_API_ROOT,
    apiKey: readEnv('ESBIRKA_API_KEY') ?? null,
  };
}

/** Hlavičky pro volání e-Sbírky. Bez nastaveného klíče vrátí jen `Accept`. */
export function buildAuthHeaders(config: EsbirkaServerConfig): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (config.apiKey) headers[API_KEY_HEADER] = config.apiKey;
  return headers;
}

/**
 * Popis nastavení pro výpis do logu. Klíč se NIKDY nevypisuje celý —
 * jen jestli je vyplněný a jak je dlouhý, ať jde poznat překlep bez toho,
 * aby se tajemství objevilo ve výpisu běhu CI nebo v logu funkce.
 */
export function describeServerConfig(config: EsbirkaServerConfig): string {
  const klic = config.apiKey ? `nastaven (${config.apiKey.length} znaků)` : 'nenastaven';
  return `kořen API: ${config.apiRoot}, přístupový klíč: ${klic}`;
}
