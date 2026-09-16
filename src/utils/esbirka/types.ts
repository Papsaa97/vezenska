/**
 * Datové tvary veřejného REST API e-Sbírky (https://e-sbirka.gov.cz/restful-api).
 *
 * Pojmenování polí je české, protože takové je vrací server — přejmenovávat je
 * na anglické by jen přidalo vrstvu, ve které se dá udělat chyba, a znesnadnilo
 * porovnání s odpovědí, kterou vrátí `curl`.
 */

/** Jedno znění předpisu v historii (aktuální, minulé nebo budoucí). */
export interface EsbirkaHistoryEntry {
  /** Datum účinnosti znění, tvar `RRRR-MM-DD`. */
  datumUcinnostiZneniOd: string;
  datumUcinnostiZneniDo?: string;
  datumCasVyhlaseni?: string;
  /** Trvalá adresa právě tohoto znění, např. `/sb/1992/555/2026-01-01`. */
  staleUrl: string;
  typZneni: 'AKTUALNI' | 'MINULE' | 'BUDOUCI' | string;
  /** Pořadové číslo znění. Roste s každou novelou. */
  cisloZneni: number;
  novely: Array<{ staleUrl?: string; kodDokumentuSbirky: string }>;
}

export interface EsbirkaHistory {
  historie: EsbirkaHistoryEntry[];
}

/** Metadata jednoho znění (endpoint `detail-zneni`). */
export interface EsbirkaVersionDetail {
  dokumentId: number;
  rocnik: number;
  sbirkaNazev: string;
  sbirkaKod: string;
  datumUcinnostiZneniOd: string;
  nazev: string;
  nazevCitace?: string;
  cisloPredpisu: string;
  kodPodtypu: string;
  jeVyhlaseneZneni: boolean;
  citace: string;
  datumCasVyhlaseni?: string;
}

/** Položka obsahu (osnovy) předpisu — paragraf, hlava, díl, příloha… */
export interface EsbirkaContentItem {
  /** Označení ustanovení, např. `§ 17` nebo `HLAVA DRUHÁ`. */
  oznaceniUstanoveni?: string;
  /** Nadpis ustanovení, pokud ho předpis má. */
  nazev?: string;
  /** Rozsah u nadřazených uzlů, např. `§ 5 — § 21b`. */
  rozsah?: string;
  /** Začátek textu ustanovení. API ho zkracuje na 256 znaků. */
  textUstanoveni?: string;
  fragmentId: number;
  id: string;
  maPotomky: boolean;
}

export interface EsbirkaContents {
  polozkyObsahu: EsbirkaContentItem[];
}

/** Odkazy ke stažení oficiálních souborů (endpoint `odkazy-ke-stazeni`). */
export interface EsbirkaDownloadLinks {
  informativniZneni?: {
    odkazPdf?: { dokumentId: number };
    odkazDoc?: { dokumentId: number };
    odkazZip?: { dokumentId: number };
  };
  overeneZneni?: {
    kodDokumentuSbirky?: string;
    cisloCastky?: string;
    rokCastky?: number;
    odkazPdf?: { dokumentId: number };
  };
}

/** Chybová odpověď API. Server ji vrací i s HTTP 400. */
export interface EsbirkaErrorBody {
  chyby?: Array<{ kod?: string; popis?: string; datumCasChyby?: string }>;
}
