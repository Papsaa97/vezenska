/**
 * Hranice úspěšnosti testu — jediné místo, kde se nastavuje.
 *
 * Dřív výsledek testu psal „Dobře (Prospěl)“ už od 60 %, zatímco statistiky
 * a jejich čára „Limit ZOP A“ počítaly s 75 %. Student tak viděl „prospěl“
 * a o obrazovku dál „neprospěl“ za tentýž výkon.
 */
export const PASS_PERCENT = 75;

/** Hranice pro „Výborně (Prospěl s vyznamenáním)“. */
export const DISTINCTION_PERCENT = 90;

/**
 * Od jaké úspěšnosti test přináší XP a počítá se do odznaků. Pod ní se test
 * uloží do historie a statistik, ale odklikáním náhodných odpovědí se už
 * nedají nahrabat body ani série.
 */
export const MIN_XP_PERCENT = 50;
