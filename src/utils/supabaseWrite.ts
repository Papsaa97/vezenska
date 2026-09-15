/**
 * Vyhodnocení zápisů do Supabase.
 *
 * PROČ TENHLE SOUBOR EXISTUJE
 *
 * PostgREST u `UPDATE` a `DELETE`, které RLS politika nepustí k žádnému řádku,
 * NEVRACÍ chybu. Postgres takový příkaz nepovažuje za selhání — politika jen
 * odfiltruje řádky, které smí volající vidět, a příkaz korektně změní nula
 * řádků. Odpověď je HTTP 200 a `error` je `null`.
 *
 * Kód, který kontroluje jen `error`, proto ohlásí úspěch i tehdy, když se do
 * databáze nezapsalo vůbec nic. Uživatel vidí „Uloženo“, po obnovení stránky
 * je ale změna beze stopy pryč — přesně ten příznak, kvůli kterému tenhle
 * soubor vznikl („nejde mi aktualizovat nic z databáze“).
 *
 * Rozlišovat úspěch od zamítnutí jde jedině tak, že se zápis zakončí
 * `.select()` a spočítají se vrácené řádky. Na to slouží `writeFailure()`.
 *
 * INSERT a UPSERT tuhle past nemají: porušení `WITH CHECK` je u nich skutečná
 * chyba (SQLSTATE 42501), kterou klient vrátí v `error`.
 */

/** Tvar odpovědi klienta Supabase u zápisu zakončeného `.select()`. */
export interface SupabaseWriteResponse {
  data: unknown[] | null;
  error: { message: string } | null;
}

/**
 * Vysvětlení pro případ, kdy zápis proběhl bez chyby, ale nezměnil žádný řádek.
 * Nejčastější příčinou je role účtu v `public.profiles`, kterou vyžadují RLS
 * politiky — viz `supabase/016_diagnostika_zapisu.sql`.
 */
export const RLS_REJECTION_HINT =
  'Databáze změnu odmítla (nezměnil se žádný řádek). Obvyklá příčina: role vašeho ' +
  'účtu v tabulce public.profiles nestačí na to, co vyžaduje RLS politika — ' +
  'správcovské rozhraní z VITE_ADMIN_EMAILS roli v databázi nenahrazuje. ' +
  'Diagnostiku i opravu má supabase/016_diagnostika_zapisu.sql.';

/**
 * Vrátí chybovou hlášku, pokud se zápis nezdařil, jinak `null`.
 *
 * Očekává výsledek `UPDATE`/`DELETE` zakončeného `.select()`. Bez `.select()`
 * je `data` vždy `null` a funkce by hlásila zamítnutí i u úspěšného zápisu.
 *
 * @param action Popis akce v 1. pádě, třeba „Otázku“ — vloží se do hlášky.
 */
export function writeFailure(action: string, response: SupabaseWriteResponse): string | null {
  if (response.error) {
    return `${action} se nepodařilo uložit: ${response.error.message}`;
  }
  if (!response.data || response.data.length === 0) {
    return `${action} se nepodařilo uložit. ${RLS_REJECTION_HINT}`;
  }
  return null;
}
