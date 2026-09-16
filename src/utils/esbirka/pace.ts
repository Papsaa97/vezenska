/**
 * Omezení tempa dotazů na e-Sbírku.
 *
 * PROČ: synchronizace projde devět předpisů a u každého rekurzivně prochází
 * osnovu — jeden běh jsou stovky požadavků. Bez jakékoli prodlevy odcházely
 * tak rychle, jak to síť stihla. U veřejné služby státu je to nezdvořilé a po
 * registraci k Veřejnému API by to znamenalo překročit vlastní deklarované
 * kapacitní limity hned prvním během.
 *
 * Číslo tady a číslo v registračním formuláři musí sedět. Kdyby se tahle
 * konstanta měnila, patří změnit i `docs/esbirka-registrace.md`.
 */

/** Nejmenší odstup mezi dvěma požadavky. 200 ms = nejvýš 5 požadavků za sekundu. */
export const MIN_REQUEST_GAP_MS = 200;

/** Kdy se naposledy pustil požadavek. Sdílené napříč celým během procesu. */
let lastSlotAt = 0;

/**
 * Počká, až bude řada. Volá se těsně před odesláním požadavku.
 *
 * Fronta je jednoduchá a záměrně: požadavky ze synchronizace chodí sériově,
 * takže stačí hlídat odstup od posledního. V prohlížeči se nepoužívá — tam
 * jde o jednotky kliknutí, ne o dávku.
 */
export async function awaitRequestSlot(): Promise<void> {
  const now = Date.now();
  const earliest = lastSlotAt + MIN_REQUEST_GAP_MS;
  if (now < earliest) {
    await new Promise((resolve) => setTimeout(resolve, earliest - now));
    lastSlotAt = earliest;
  } else {
    lastSlotAt = now;
  }
}
