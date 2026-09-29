/**
 * Jednotná šířka obsahu všech záložek. Každá záložka dřív nesla vlastní
 * `max-w-*` (od 4xl po 7xl), takže Poznávačka byla úzká a Administrativa
 * přes celou obrazovku. Šířku teď určují jen tyhle dvě konstanty, použité
 * v App.tsx; komponenty záložek vlastní strop nemají a vyplní, co dostanou.
 * Široký obsah (tabulky) se posouvá uvnitř, ne přes okraj stránky.
 *
 * Třídy jsou vypsané celé, ne skládané z proměnné: Tailwind hledá názvy
 * tříd ve zdrojovém textu a složený řetězec by nenašel.
 */

/** Kontejner záložky, která se posouvá celá (většina záložek). */
export const PAGE_CONTAINER = 'w-full max-w-6xl mx-auto print:max-w-none';

/**
 * Kontejner záložky s vlastním posouváním panelů (test, kartičky, poznávačka).
 * Na mobilu se chová, jako by tam nebyl (`contents`), aby se nezměnilo
 * skládání pod sebe; od `md` drží stejnou šířku jako ostatní záložky.
 */
export const PAGE_CONTAINER_FILL =
  'contents md:flex md:flex-row md:gap-6 md:w-full md:max-w-6xl md:mx-auto md:h-full md:min-h-0 print:contents';
