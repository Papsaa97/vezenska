/**
 * Propojení předpisů v aplikaci se zněními z e-Sbírky.
 *
 * Odpovídá na dvě otázky, které si čtenář Právního kompasu klade:
 *   1. Mám u tohoto předpisu k dispozici úřední úplné znění, nebo jen výběr
 *      ustanovení sestavený pro výuku?
 *   2. Je to, co vidím, pořád aktuální — nevyšla mezitím novela?
 *
 * Na druhou otázku se odpovídá živým dotazem do e-Sbírky (přes `/api/esbirka`).
 * Když se dotaz nepovede, vrátí se stav „nedostupné“. Nikdy se netváří, že
 * ověření proběhlo — právě tím byla vadná původní verze, kde tlačítko
 * „Ověřit dle e-Sbírky“ jen znovu uložilo tatáž data a ohlásilo úspěch.
 */
import type { VscrRegulation } from '../../data/vscrRegulationsRegistry';
import { ESBIRKA_SNAPSHOTS } from '../../data/esbirka/snapshotManifest';
import { buildEli, buildPortalUrl, buildSnapshotSlug, parseSbiratkaRef } from './eli';
import { fetchHistory, pickCurrentVersion, EsbirkaError } from './client';
import type { EsbirkaSnapshotSummary } from './snapshot';

/** Co o předpisu víme z lokálně stažených dat. */
export interface RegulationSource {
  /** ELI, pokud je předpis ve Sbírce zákonů. Vnitřní předpisy ho nemají. */
  eli: string | null;
  /** Klíč staženého znění (`sb-1992-555`), pokud je předpis ve Sbírce. */
  slug: string | null;
  /** Metadata staženého úplného znění, pokud pro předpis existuje. */
  summary: EsbirkaSnapshotSummary | null;
  /** Odkaz na předpis na portálu e-Sbírky. */
  portalUrl: string | null;
}

export function resolveRegulationSource(reg: VscrRegulation): RegulationSource {
  const ref = parseSbiratkaRef(reg.code);
  if (!ref) {
    return { eli: null, slug: null, summary: null, portalUrl: reg.officialUrl || null };
  }
  const slug = buildSnapshotSlug(ref);
  const summary = ESBIRKA_SNAPSHOTS[slug] ?? null;
  return {
    eli: buildEli(ref),
    slug,
    summary,
    portalUrl: summary?.portalUrl ?? buildPortalUrl(ref),
  };
}

export type FreshnessState =
  /** Stažené znění odpovídá tomu, co e-Sbírka vede jako aktuální. */
  | 'aktualni'
  /** e-Sbírka vede novější znění, než jaké je v aplikaci. */
  | 'zastarale'
  /** Předpis ve Sbírce zákonů není (vnitřní předpis, mezinárodní dokument). */
  | 'mimo-sbirku'
  /** Předpis ve Sbírce je, ale aplikace k němu úplné znění staženo nemá. */
  | 'bez-zneni'
  /** e-Sbírku se nepodařilo zavolat. O aktuálnosti to neříká nic. */
  | 'nedostupne';

export interface FreshnessResult {
  stav: FreshnessState;
  /** Věta pro uživatele. Popisuje, co se zjistilo, ne co se doufá. */
  zprava: string;
  /** Znění, které má aplikace stažené. */
  vAplikaci?: { cisloZneni: number; ucinnostOd: string };
  /** Znění, které e-Sbírka právě vede jako účinné. */
  naEsbirce?: { cisloZneni: number; ucinnostOd: string; novely: string[] };
  portalUrl?: string;
  /** Kdy ověření proběhlo (ISO 8601). */
  overenoDne: string;
}

function formatDate(iso: string): string {
  const [rok, mesic, den] = iso.split('-');
  if (!rok || !mesic || !den) return iso;
  return `${Number(den)}. ${Number(mesic)}. ${rok}`;
}

/**
 * Zeptá se e-Sbírky, jaké znění předpisu je právě účinné, a porovná ho
 * se zněním staženým v aplikaci.
 */
export async function checkRegulationFreshness(
  reg: VscrRegulation,
  options: { signal?: AbortSignal } = {}
): Promise<FreshnessResult> {
  const overenoDne = new Date().toISOString();
  const source = resolveRegulationSource(reg);

  if (!source.eli) {
    return {
      stav: 'mimo-sbirku',
      zprava:
        'Vnitřní předpis Vězeňské služby ani mezinárodní dokument se ve Sbírce zákonů ' +
        'nevyhlašuje — e-Sbírka o něm žádné znění nevede. Aktuálnost ověřuje gestor předpisu.',
      overenoDne,
    };
  }

  let current;
  try {
    const history = await fetchHistory(source.eli, { signal: options.signal });
    current = pickCurrentVersion(history);
  } catch (error) {
    const detail = error instanceof EsbirkaError ? error.message : (error as Error).message;
    return {
      stav: 'nedostupne',
      zprava: `Ověření proti e-Sbírce se nepodařilo provést (${detail}). Zobrazené znění tím není potvrzené ani vyvrácené.`,
      portalUrl: source.portalUrl ?? undefined,
      overenoDne,
    };
  }

  if (!current) {
    return {
      stav: 'nedostupne',
      zprava: 'e-Sbírka k tomuto předpisu nevrátila žádné znění.',
      portalUrl: source.portalUrl ?? undefined,
      overenoDne,
    };
  }

  const naEsbirce = {
    cisloZneni: current.cisloZneni,
    ucinnostOd: current.datumUcinnostiZneniOd,
    novely: current.novely.map((n) => n.kodDokumentuSbirky),
  };

  if (!source.summary) {
    return {
      stav: 'bez-zneni',
      zprava:
        `e-Sbírka vede jako účinné znění č. ${naEsbirce.cisloZneni} od ${formatDate(naEsbirce.ucinnostOd)}. ` +
        'Aplikace k tomuto předpisu úplné znění stažené nemá — zobrazuje jen výběr ustanovení pro výuku. ' +
        'Úplné znění doplní příkaz npm run sync:laws.',
      naEsbirce,
      portalUrl: source.portalUrl ?? undefined,
      overenoDne,
    };
  }

  const vAplikaci = {
    cisloZneni: source.summary.cisloZneni,
    ucinnostOd: source.summary.ucinnostOd,
  };

  const jeStejne =
    vAplikaci.cisloZneni === naEsbirce.cisloZneni && vAplikaci.ucinnostOd === naEsbirce.ucinnostOd;

  if (jeStejne) {
    return {
      stav: 'aktualni',
      zprava:
        `Ověřeno: aplikace zobrazuje znění č. ${vAplikaci.cisloZneni} účinné od ` +
        `${formatDate(vAplikaci.ucinnostOd)} a e-Sbírka vede jako účinné totéž znění.`,
      vAplikaci,
      naEsbirce,
      portalUrl: source.portalUrl ?? undefined,
      overenoDne,
    };
  }

  return {
    stav: 'zastarale',
    zprava:
      `Pozor: aplikace má znění č. ${vAplikaci.cisloZneni} od ${formatDate(vAplikaci.ucinnostOd)}, ` +
      `ale e-Sbírka vede jako účinné znění č. ${naEsbirce.cisloZneni} od ${formatDate(naEsbirce.ucinnostOd)}` +
      `${naEsbirce.novely.length > 0 ? ` (novely: ${naEsbirce.novely.join(', ')})` : ''}. ` +
      'Stažené znění je zastaralé — aktualizuje ho příkaz npm run sync:laws.',
    vAplikaci,
    naEsbirce,
    portalUrl: source.portalUrl ?? undefined,
    overenoDne,
  };
}

/** Krátký popisek stavu pro odznak v rozhraní. */
export function freshnessLabel(stav: FreshnessState): string {
  switch (stav) {
    case 'aktualni':
      return 'Ověřeno podle e-Sbírky';
    case 'zastarale':
      return 'e-Sbírka vede novější znění';
    case 'mimo-sbirku':
      return 'Mimo Sbírku zákonů';
    case 'bez-zneni':
      return 'Úplné znění není staženo';
    default:
      return 'e-Sbírka nedostupná';
  }
}
