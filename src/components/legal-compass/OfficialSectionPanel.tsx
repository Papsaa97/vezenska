import React, { useCallback, useMemo, useState } from 'react';
import { BookOpen, ExternalLink, Loader2, AlertTriangle, ScrollText } from 'lucide-react';
import type { LegalArticle } from '../../data/legalCompasData';
import { ESBIRKA_SNAPSHOTS } from '../../data/esbirka/snapshotManifest';
import { buildSnapshotSlug, expandSectionSpec, parseSbiratkaRef } from '../../utils/esbirka/eli';
import { loadSnapshot, type EsbirkaSnapshot } from '../../utils/esbirka/snapshot';
import { splitIntoSectionBlocks } from '../../utils/esbirka/reader';

/**
 * Úřední znění paragrafů, o kterých článek Paragrafového výkladu mluví.
 *
 * PROČ TO TU JE: text v článku je studijní přepis — zkrácený, se zvýrazněním
 * a s poznámkami pro zkoušku. Dřív se zobrazoval pod nadpisem „Doslovné znění
 * zákona“, což nebyla pravda: kontrola doslovnosti (`npm run check:legal`)
 * ukazuje, že u většiny článků se v úředním znění doslova najde jen menšina
 * vět. Místo mazání studijních textů, které mají svůj smysl, dostane čtenář
 * možnost postavit vedle nich skutečné znění a porovnat si to sám.
 *
 * Znění se stahuje až na kliknutí — soubor trestního řádu má přes 600 kB
 * a načítat ho každému, kdo si otevře libovolný článek, by bylo plýtvání.
 */
export default function OfficialSectionPanel({ article }: { article: LegalArticle }) {
  const [snapshot, setSnapshot] = useState<EsbirkaSnapshot | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const ref = parseSbiratkaRef(article.actNumber);
    if (!ref) return null;
    return ESBIRKA_SNAPSHOTS[buildSnapshotSlug(ref)] ?? null;
  }, [article.actNumber]);

  const wanted = useMemo(() => expandSectionSpec(article.section), [article.section]);

  const load = useCallback(() => {
    if (!summary || state === 'loading') return;
    setState('loading');
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
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ScrollText className="w-3.5 h-3.5 text-emerald-600" />
          Úřední znění
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          Pro tento předpis není staženo úřední znění — buď se ve Sbírce zákonů nevyhlašuje
          (vnitřní předpis VS ČR, mezinárodní dokument), nebo ho doplní příkaz{' '}
          <code>npm run sync:laws</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 print:hidden">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ScrollText className="w-3.5 h-3.5 text-emerald-600" />
          Úřední znění z e-Sbírky
        </span>
        <a
          href={summary.portalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {summary.citace} na e-Sbírce <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {state === 'idle' && (
        <button
          type="button"
          onClick={load}
          className="w-full p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors text-left"
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>
            <strong>Zobrazit doslovné znění {wanted.length > 0 ? wanted.join(', ') : 'předpisu'}</strong>{' '}
            podle e-Sbírky (znění č. {summary.cisloZneni} účinné od {summary.ucinnostOd}). Text výše je
            studijní přepis, ne citace zákona.
          </span>
        </button>
      )}

      {state === 'loading' && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Načítám úřední znění {summary.citace}…</span>
        </div>
      )}

      {state === 'error' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Úřední znění se nepodařilo načíst: {error}</span>
        </div>
      )}

      {state === 'ready' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-4">
          <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 font-semibold">
            Informativní znění č. {summary.cisloZneni} účinné od {summary.ucinnostOd}. Právně závazné je
            znění vyhlášené ve Sbírce zákonů.
          </p>

          {blocks.length === 0 ? (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              V úředním znění se nepodařilo najít ustanovení „{article.section}“. Otevřete prosím předpis
              na e-Sbírce odkazem výše.
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
