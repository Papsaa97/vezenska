import React, { useCallback, useEffect, useId, useState } from 'react';
import { Check, EyeOff, Loader2, RefreshCw } from 'lucide-react';
import { ChatReport, fetchReports, formatChatTime, resolveReport } from '../../utils/chat';

interface ReportsPanelProps {
  /** Počet otevřených nahlášení se změnil (číslo u tlačítka v hlavičce záložky). */
  onOpenCountChange: (count: number) => void;
}

/**
 * Nahlášené zprávy pro lektory a správce. Vidí jen samotnou nahlášenou
 * zprávu, ne zbytek konverzace. „Skrýt zprávu“ smaže její text všem,
 * „Ponechat“ nahlášení jen uzavře.
 */
export default function ReportsPanel({ onOpenCountChange }: ReportsPanelProps) {
  const resolvedId = useId();
  const [reports, setReports] = useState<ChatReport[]>([]);
  const [includeResolved, setIncludeResolved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchReports(includeResolved);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(null);
    const list = res.data ?? [];
    setReports(list);
    onOpenCountChange(list.filter((r) => !r.resolvedAt).length);
  }, [includeResolved, onOpenCountChange]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolve = async (report: ChatReport, hide: boolean) => {
    setBusyId(report.id);
    const res = await resolveReport(report.id, hide);
    setBusyId(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    await load();
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Nahlášené zprávy</h2>
        <div className="flex items-center gap-3">
          <label htmlFor={resolvedId} className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              id={resolvedId}
              type="checkbox"
              checked={includeResolved}
              onChange={(e) => setIncludeResolved(e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            I vyřízené
          </label>
          <button
            type="button"
            onClick={() => void load()}
            aria-label="Načíst znovu"
            title="Načíst znovu"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {loading && reports.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Načítám…
          </div>
        )}
        {!loading && reports.length === 0 && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Žádné nahlášené zprávy.</p>
        )}
        {reports.map((r) => (
          <article
            key={r.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2 bg-slate-50 dark:bg-slate-900/60"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {r.conversation} · {r.authorName} · {formatChatTime(r.messageAt)}
            </div>
            <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
              {r.text ? r.text : <em className="text-slate-500">Text zprávy už není uložený.</em>}
              {r.messageDeleted && r.text && (
                <span className="block text-xs text-slate-500 mt-1">Autor zprávu mezitím smazal; text je tu jen pro vás.</span>
              )}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Nahlásil(a) {r.reporterName}, {formatChatTime(r.createdAt)}: „{r.reason}“
            </p>
            {r.resolvedAt ? (
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Vyřízeno {formatChatTime(r.resolvedAt)}
                {r.resolverName ? ` (${r.resolverName})` : ''} — {r.messageHidden ? 'zpráva skryta' : 'zpráva ponechána'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void resolve(r, true)}
                  disabled={busyId !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-500 cursor-pointer disabled:opacity-50"
                >
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> Skrýt zprávu
                </button>
                <button
                  type="button"
                  onClick={() => void resolve(r, false)}
                  disabled={busyId !== null}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" /> Ponechat
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
