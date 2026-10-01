import React, { useEffect, useId, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { CHAT_ROLE_LABEL, ChatPerson, fetchPeople } from '../../utils/chat';

interface PeoplePickerProps {
  selected: ChatPerson[];
  onToggle: (person: ChatPerson) => void;
  /** Lidé, kteří se nenabízejí (např. už jsou ve skupině). */
  excludeIds?: string[];
}

/**
 * Výběr lidí, kterým lze psát. Seznam vrací server (jen zařazení studenti
 * a velitelé, lektoři a správci, bez e-mailů); spolužáci jsou nahoře.
 */
export default function PeoplePicker({ selected, onToggle, excludeIds = [] }: PeoplePickerProps) {
  const searchId = useId();
  const [search, setSearch] = useState<string>('');
  const [people, setPeople] = useState<ChatPerson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // Krátké zdržení, ať se neposílá dotaz po každém písmenu.
    const timer = window.setTimeout(() => {
      void fetchPeople(search).then((res) => {
        if (!active) return;
        setLoading(false);
        if (res.error) {
          setError(res.error);
          return;
        }
        setError(null);
        setPeople(res.data ?? []);
      });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  const selectedIds = new Set(selected.map((p) => p.id));
  const excluded = new Set(excludeIds);
  const visible = people.filter((p) => !excluded.has(p.id));

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={searchId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
          Hledat podle jména nebo třídy
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLoading(true);
            }}
            placeholder="např. Novák nebo ZOP A11"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Vybráno: <strong>{selected.map((p) => p.name).join(', ')}</strong>
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-2 p-3 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Načítám…
          </div>
        )}
        {!loading && visible.length === 0 && !error && (
          <p className="p-3 text-sm text-slate-500 dark:text-slate-400">Nikdo takový tu není.</p>
        )}
        {!loading &&
          visible.map((p) => {
            const checked = selectedIds.has(p.id);
            return (
              <label
                key={p.id}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer text-sm ${
                  checked ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(p)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="flex-1 min-w-0">
                  <span className="block font-medium text-slate-900 dark:text-slate-100 truncate">{p.name}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {[p.role ? CHAT_ROLE_LABEL[p.role] ?? p.role : null, p.className].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </label>
            );
          })}
      </div>
    </div>
  );
}
