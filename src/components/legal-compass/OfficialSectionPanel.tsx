import React, { useCallback, useMemo, useState } from 'react';
import { BookOpen, ExternalLink, Loader2, AlertTriangle, ScrollText, RotateCcw } from 'lucide-react';
import type { LegalArticle } from '../../data/legalCompasData';
import { ESBIRKA_SNAPSHOTS } from '../../data/esbirka/snapshotManifest';
import { buildSnapshotSlug, expandSectionSpec, parseSbiratkaRef } from '../../utils/esbirka/eli';
import { loadSnapshot, type EsbirkaSnapshot } from '../../utils/esbirka/snapshot';
import type { EsbirkaSnapshotSummary } from '../../utils/esbirka/snapshot';
import { splitIntoSectionBlocks } from '../../utils/esbirka/reader';
import { formatIsoDate } from './legalCompassLabels';

/** Metadata staženého znění předpisu, ke kterému článek patří, nebo null. */
export function findArticleSnapshot(actNumber: string): EsbirkaSnapshotSummary | null {
  const ref = parseSbiratkaRef(actNumber);
  if (!ref) return null;
  return ESBIRKA_SNAPSHOTS[buildSnapshotSlug(ref)] ?? null;
}

/** Nadpis bloku — obyčejný, ne verzálkový štítek. */
const HEADING =
  'text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5';

/**
 * Informativní znění paragrafů, o kterých článek Paragrafového výkladu mluví.
 *
 * PROČ TO TU JE: text v článku je studijní přepis — zkrácený, se zvýrazněním
 * a s poznámkami pro zkoušku. Dřív se zobrazoval pod nadpisem „Doslovné znění
 * zákona“, což nebyla pravda: kontrola doslovnosti (`npm run check:legal`)
 * ukazuje, že u většiny článků se ve znění z e-Sbírky doslova najde jen
 * menšina vět. Místo mazání studijních textů, které mají svůj smysl, dostane
 * čtenář možnost postavit vedle nich znění z e-Sbírky a porovnat si to sám.
 *
 * Znění se stahuje až na kliknutí — soubor trestního řádu má přes 600 kB
 * a načítat ho každému, kdo si otevře libovolný článek, by bylo plýtvání.
 */
export default function OfficialSectionPanel({ article }: { article: LegalArticle }) {
  const [snapshot, setSnapshot] = useState<EsbirkaSnapshot | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => findArticleSnapshot(article.actNumber), [article.actNumber]);

  const wanted = useMemo(() => expandSectionSpec(article.section), [article.section]);

  const load = useCallback(() => {
    if (!summary || state === 'loading') return;
    setState('loading');
    setError(null);
    loadSnapshot(summary.slug)
      .then((data) => {
        setSnapshot(data);
        setState('ready');
      })
      .catch((err: Error) => {
        setError(err.message);
        setState('error');
      });
  }, [summary, state]);

  const blocks = useMemo(() => {
    if (!snapshot) return [];
    const wantedSet = new Set(wanted);
    return splitIntoSectionBlocks(snapshot.text).filter(
      (block) => block.label && wantedSet.has(block.label.toLowerCase())
    );
  }, [snapshot, wanted]);

  if (!summary) {
    return (
      <div className="space-y-2 print:hidden">
        <h3 className={HEADING}>
          <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
          Informativní znění (e-Sbírka)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          Pro tento předpis znění z e-Sbírky v aplikaci není — ve Sbírce zákonů se nevyhlašuje
          (vnitřní předpis VS ČR, mezinárodní dokument) nebo ho aplikace zatím nemá staženo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 print:hidden">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className={HEADING}>
          <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
          Informativní znění (e-Sbírka)
        </h3>
        <a
          href={summary.portalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {summary.citace} na e-Sbírce <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>

      {state === 'idle' && (
        <button
          type="button"
          onClick={load}
          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
        >
          <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            <strong>Zobrazit znění {wanted.length > 0 ? wanted.join(', ') : 'předpisu'}</strong>{' '}
            podle e-Sbírky (znění č. {summary.cisloZneni} účinné od {formatIsoDate(summary.ucinnostOd)}).
            Text výše je studijní přepis, ne citace zákona.
          </span>
        </button>
      )}

      {state === 'loading' && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>Načítám znění {summary.citace} z e-Sbírky…</span>
        </div>
      )}

      {state === 'error' && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2 flex-wrap"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="flex-1 min-w-0">Znění se nepodařilo načíst: {error}</span>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 font-semibold hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Zkusit znovu
          </button>
        </div>
      )}

      {state === 'ready' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
          <p className="text-[0.6875rem] text-slate-600 dark:text-slate-400 font-semibold">
            Informativní znění č. {summary.cisloZneni} účinné od {formatIsoDate(summary.ucinnostOd)}.
            Právně závazné je znění vyhlášené ve Sbírce zákonů.
          </p>

          {blocks.length === 0 ? (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Ve znění z e-Sbírky se nepodařilo najít ustanovení „{article.section}“. Otevřete prosím
              předpis na e-Sbírce odkazem výše.
            </p>
          ) : (
            blocks.map((block) => (
              <section key={block.key} className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {block.label}
                  {block.heading && (
                    <span className="font-semibold text-slate-600 dark:text-slate-300"> — {block.heading}</span>
                  )}
                </h4>
                <div className="whitespace-pre-wrap text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                  {block.body}
                </div>
              </section>
            ))
          )}
        </div>
      )}
    </div>
  );
}
