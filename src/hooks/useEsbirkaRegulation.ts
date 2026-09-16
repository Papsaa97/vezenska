/**
 * Stav jednoho předpisu vůči e-Sbírce pro potřeby rozhraní.
 *
 * Drží dvě nezávislé věci:
 *   - stažené úplné znění (načítá se ze souboru až na vyžádání),
 *   - výsledek živého ověření aktuálnosti proti API e-Sbírky.
 *
 * Obojí umí selhat a obojí to přiznává — komponenta dostane stav chyby,
 * ne tiché ticho ani falešný úspěch.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { VscrRegulation } from '../data/vscrRegulationsRegistry';
import { loadSnapshot, type EsbirkaSnapshot } from '../utils/esbirka/snapshot';
import {
  checkRegulationFreshness,
  resolveRegulationSource,
  type FreshnessResult,
  type RegulationSource,
} from '../utils/esbirka/status';

export type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export interface EsbirkaRegulationState {
  source: RegulationSource;
  /** Je pro předpis k dispozici úřední úplné znění? */
  maUplneZneni: boolean;
  snapshot: EsbirkaSnapshot | null;
  snapshotState: LoadState;
  snapshotError: string | null;
  /** Vyžádá stažení úplného znění. Opakované volání nic nezkazí. */
  nacistUplneZneni: () => void;
  freshness: FreshnessResult | null;
  freshnessState: LoadState;
  /** Spustí živé ověření proti e-Sbírce. */
  overitAktualnost: () => void;
}

export function useEsbirkaRegulation(
  regulation: VscrRegulation | null
): EsbirkaRegulationState {
  const source = useMemo(
    () =>
      regulation
        ? resolveRegulationSource(regulation)
        : { eli: null, slug: null, summary: null, portalUrl: null },
    [regulation]
  );

  const [snapshot, setSnapshot] = useState<EsbirkaSnapshot | null>(null);
  const [snapshotState, setSnapshotState] = useState<LoadState>('idle');
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [freshness, setFreshness] = useState<FreshnessResult | null>(null);
  const [freshnessState, setFreshnessState] = useState<LoadState>('idle');

  // Odpověď na předchozí předpis nesmí přepsat stav toho, co je zrovna otevřené.
  const activeSlug = useRef<string | null>(null);

  useEffect(() => {
    activeSlug.current = source.slug;
    setSnapshot(null);
    setSnapshotState('idle');
    setSnapshotError(null);
    setFreshness(null);
    setFreshnessState('idle');
  }, [source.slug]);

  const nacistUplneZneni = useCallback(() => {
    const slug = source.slug;
    if (!slug || !source.summary) return;
    setSnapshotState((prev) => (prev === 'loading' || prev === 'ready' ? prev : 'loading'));
    loadSnapshot(slug)
      .then((data) => {
        if (activeSlug.current !== slug) return;
        setSnapshot(data);
        setSnapshotState('ready');
        setSnapshotError(null);
      })
      .catch((error: Error) => {
        if (activeSlug.current !== slug) return;
        setSnapshotState('error');
        setSnapshotError(error.message);
      });
  }, [source.slug, source.summary]);

  const overitAktualnost = useCallback(() => {
    if (!regulation) return;
    const slug = source.slug;
    setFreshnessState('loading');
    checkRegulationFreshness(regulation)
      .then((result) => {
        if (activeSlug.current !== slug) return;
        setFreshness(result);
        setFreshnessState('ready');
      })
      .catch((error: Error) => {
        if (activeSlug.current !== slug) return;
        setFreshness({
          stav: 'nedostupne',
          zprava: `Ověření selhalo: ${error.message}`,
          overenoDne: new Date().toISOString(),
        });
        setFreshnessState('ready');
      });
  }, [regulation, source.slug]);

  return {
    source,
    maUplneZneni: source.summary !== null,
    snapshot,
    snapshotState,
    snapshotError,
    nacistUplneZneni,
    freshness,
    freshnessState,
    overitAktualnost,
  };
}
