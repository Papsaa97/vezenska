import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MessageSquareWarning,
  Loader2,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Inbox,
  Monitor,
  User,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FEEDBACK_CATEGORY_COLORS, feedbackCategoryLabel } from './FeedbackModal';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeedbackStatus = 'new' | 'resolved';

export interface FeedbackItem {
  id: string;
  user_name: string;
  category: string;
  message: string;
  screen_context: string | null;
  status: FeedbackStatus;
  created_at: string;
}

type FilterValue = 'all' | 'new' | 'resolved';

// ─── Component ────────────────────────────────────────────────────────────────

interface FeedbackManagerProps {
  /** Zavolá se pokaždé, když se změní počet nevyřešených zpráv (status === 'new') */
  onNewCountChange?: (count: number) => void;
}

export default function FeedbackManager({ onNewCountChange }: FeedbackManagerProps = {}) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  /** Chyba načtení. Bez ní by se neúspěšný dotaz tvářil jako „žádná zpětná vazba". */
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        // Prázdný seznam je tvrzení „nic nepřišlo". Když dotaz selže, není to
        // pravda a správce by přišel o hlášení, aniž by tušil, že nějaká jsou.
        setLoadError(error.message);
        setItems([]);
      } else if (data) {
        setLoadError(null);
        setItems(data as FeedbackItem[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const newCount = useMemo(() => items.filter((i) => i.status === 'new').length, [items]);

  useEffect(() => {
    onNewCountChange?.(newCount);
  }, [newCount, onNewCountChange]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.status === filter);
  }, [items, filter]);

  const toggleStatus = async (item: FeedbackItem) => {
    const nextStatus: FeedbackStatus = item.status === 'new' ? 'resolved' : 'new';
    setUpdatingId(item.id);
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .update({ status: nextStatus })
        .eq('id', item.id)
        .select();

      if (error) {
        alert('Změna stavu selhala: ' + error.message);
      } else if (!data || data.length === 0) {
        alert(
          'Změnu stavu se nepodařilo uložit do databáze (žádný řádek nebyl aktualizován). Zkontrolujte oprávnění RLS pro UPDATE v Supabase.'
        );
      } else {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i)));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Neznámá chyba';
      alert('Chyba při změně stavu: ' + msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        alert('Smazání selhalo: ' + error.message);
      } else if (!data || data.length === 0) {
        alert(
          'Položku se nepodařilo smazat z databáze (žádný řádek nebyl odstraněn). V Supabase chybí RLS oprávnění pro DELETE na tabulce user_feedback.'
        );
      } else {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Neznámá chyba';
      alert('Chyba při mazání: ' + msg);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const formatDateTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('cs-CZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const filters: { value: FilterValue; label: string; count: number }[] = [
    { value: 'all', label: 'Vše', count: items.length },
    { value: 'new', label: 'Nové', count: newCount },
    { value: 'resolved', label: 'Vyřešené', count: items.length - newCount },
  ];

  return (
    <div className="space-y-5">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareWarning className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Zpětná vazba uživatelů
            {!loading && (
              <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                ({filteredItems.length} z {items.length})
              </span>
            )}
          </h3>
          <button
            type="button"
            onClick={fetchFeedback}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer disabled:opacity-50"
            title="Obnovit"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 w-fit">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === f.value
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f.label}
              <span className="text-[10px] font-bold opacity-70">({f.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-12">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          Načítám zprávy…
        </div>
      )}

      {/* Empty state */}
      {!loading && loadError && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-6 text-center rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/25 space-y-2"
        >
          <AlertTriangle className="w-9 h-9 text-red-500 mx-auto" />
          <div className="font-bold text-sm text-red-800 dark:text-red-200">
            Zpětnou vazbu se nepodařilo načíst
          </div>
          <p className="text-xs text-red-700 dark:text-red-300/90 max-w-md mx-auto leading-snug">
            Seznam níže je prázdný kvůli chybě, ne proto, že by žádná hlášení nebyla. Chyba: {loadError}
          </p>
          <button
            type="button"
            onClick={() => fetchFeedback()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Zkusit znovu
          </button>
        </div>
      )}

      {!loading && !loadError && filteredItems.length === 0 && (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 space-y-2">
          <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            {items.length === 0 ? 'Zatím nepřišla žádná zpětná vazba' : 'Žádná zpráva neodpovídá zvolenému filtru'}
          </div>
        </div>
      )}

      {/* List */}
      {!loading && filteredItems.length > 0 && (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isUpdating = updatingId === item.id;
            const isDeleting = deletingId === item.id;
            const isConfirming = confirmDeleteId === item.id;
            const catColor =
              FEEDBACK_CATEGORY_COLORS[item.category as keyof typeof FEEDBACK_CATEGORY_COLORS] ??
              FEEDBACK_CATEGORY_COLORS.other;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.status === 'new'
                    ? 'bg-white dark:bg-slate-800/60 border-indigo-200 dark:border-indigo-800/60 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catColor}`}>
                        {feedbackCategoryLabel(item.category)}
                      </span>
                      {item.status === 'new' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                          Nové
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          Vyřešeno
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <User className="w-3 h-3" />
                        {item.user_name}
                      </span>
                      <span className="text-xs text-slate-400">· {formatDateTime(item.created_at)}</span>
                    </div>

                    {/* Message */}
                    <div className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words pt-1">
                      {item.message}
                    </div>

                    {/* Screen context */}
                    {item.screen_context && (
                      <div className="flex items-start gap-1.5 text-xs text-slate-400 pt-1">
                        <Monitor className="w-3 h-3 mt-0.5 shrink-0" />
                        <span className="break-all">{item.screen_context}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-stretch gap-1.5 shrink-0">
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5 p-1 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800">
                        <span className="text-xs text-red-600 dark:text-red-400 font-semibold px-1">Smazat?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting}
                          className="px-2 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ano'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
                        >
                          Ne
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleStatus(item)}
                          disabled={isUpdating}
                          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 ${
                            item.status === 'new'
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : item.status === 'new' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          {item.status === 'new' ? 'Označit jako vyřešené' : 'Označit jako nové'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Smazat
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
