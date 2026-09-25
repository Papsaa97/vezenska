import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Clock, Loader2, RefreshCw, Search, Shield, UserPlus, Users, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/auth';
import type { UserRole } from '../../types/auth';
import {
  AssignmentRow,
  ClassOverview,
  appointCommander,
  assignClass,
  cancelNomination,
  decideRequest,
  dismissCommander,
  fetchAssignmentList,
  formatWaitingTime,
  nominateToMyClass,
} from '../../utils/classMembership';
import { MEMBERSHIP_CHANGED_EVENT, announceMembershipChange } from './ClassMembershipGate';

interface ClassAssignmentPanelProps {
  classes: ClassOverview[];
}

/**
 * Seznam nezařazených a správa zařazení.
 *
 * Velitel třídy vidí jen nezařazené studenty (jméno, poznámka, doba
 * v seznamu), může je označit pro svou třídu a rozhoduje o žádostech do ní.
 * Lektor a správce vidí všechny účty, přiřazují třídy a jmenují velitele.
 * Co kdo smí, rozhoduje server (migrace 038); tlačítka jen kopírují jeho pravidla.
 */
export default function ClassAssignmentPanel({ classes }: ClassAssignmentPanelProps) {
  const { profile } = useAuth();
  const isStaff = profile?.role === 'lektor' || profile?.role === 'admin';
  const myClass = (profile?.user_class || '').trim();
  const isCommander = profile?.role === 'velitel_tridy' && myClass.length > 0;

  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [showAssigned, setShowAssigned] = useState<boolean>(false);
  const [targetClass, setTargetClass] = useState<Record<string, string>>({});
  const [now, setNow] = useState<Date>(() => new Date());

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchAssignmentList();
    setLoading(false);
    setNow(new Date());
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(null);
    setRows(res.data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
    return () => window.removeEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
  }, [load]);

  const run = async (id: string, action: () => Promise<{ error: string | null }>) => {
    setBusyId(id);
    const res = await action();
    setBusyId(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(null);
    announceMembershipChange();
  };

  const sameClass = (a: string | null, b: string) =>
    (a || '').trim().toLowerCase() === b.trim().toLowerCase();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (!showAssigned && r.userClass) return false;
      if (!q) return true;
      return (
        r.fullName.toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.note || '').toLowerCase().includes(q) ||
        (r.userClass || '').toLowerCase().includes(q)
      );
    });
  }, [rows, query, showAssigned]);

  const unassignedCount = rows.filter((r) => !r.userClass).length;
  const requestsForMe = rows.filter(
    (r) => r.requestId && r.requestClass && (isStaff || sameClass(r.requestClass, myClass))
  ).length;

  return (
    <section className="no-print bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Zařazení do tříd
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isStaff
              ? `Nezařazených: ${unassignedCount}. Čekajících žádostí: ${requestsForMe}. Třídu komukoli změníte a velitele jmenujete tady.`
              : `Nezařazených: ${unassignedCount}. Žádostí do ${myClass}: ${requestsForMe}. Označený člověk musí zařazení sám potvrdit.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="self-start px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Obnovit
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Hledat podle jména nebo poznámky"
            placeholder="Hledat podle jména nebo poznámky…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        {isStaff && (
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={showAssigned} onChange={(e) => setShowAssigned(e.target.checked)} />
            Zobrazit i zařazené
          </label>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {!loading && filtered.length === 0 && !error && (
        <p className="text-center text-xs text-slate-400 italic py-6">
          {showAssigned ? 'Nikdo neodpovídá hledání.' : 'Všichni jsou zařazení — seznam je prázdný.'}
        </p>
      )}

      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {filtered.map((r) => {
          const busy = busyId === r.id;
          const nominatedByMe = isCommander && (r.nominatedClasses || '').split(', ').some((c) => sameClass(c, myClass));
          const canDecideRequest = r.requestId && r.requestClass && (isStaff || sameClass(r.requestClass, myClass));
          const selected = targetClass[r.id] ?? r.requestClass ?? r.userClass ?? '';
          return (
            <li key={r.id} className="py-3 flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{r.fullName}</span>
                  {isStaff && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {ROLE_LABELS[r.role as UserRole] ?? r.role}
                    </span>
                  )}
                  {r.userClass ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {r.userClass}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      v seznamu {formatWaitingTime(r.unassignedSince, now)}
                    </span>
                  )}
                </div>
                {r.email && <div className="text-[11px] text-slate-500 dark:text-slate-400">{r.email}</div>}
                {r.note && (
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">Poznámka:</span> {r.note}
                  </div>
                )}
                {r.requestClass && (
                  <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
                    Žádá o zařazení do {r.requestClass}
                  </div>
                )}
                {r.nominatedClasses && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    Označen(a) do {r.nominatedClasses} — čeká na potvrzení
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {canDecideRequest && r.requestId && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void run(r.id, () => decideRequest(r.requestId as string, true))}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Schválit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void run(r.id, () => decideRequest(r.requestId as string, false))}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Odmítnout
                    </button>
                  </>
                )}

                {isCommander && !r.userClass && !r.requestId && (
                  nominatedByMe ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void run(r.id, () => cancelNomination(r.id))}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      Zrušit označení
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void run(r.id, () => nominateToMyClass(r.id))}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Označit do {myClass}
                    </button>
                  )
                )}

                {isStaff && (
                  <>
                    <select
                      value={selected}
                      onChange={(e) => setTargetClass((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      aria-label={`Třída pro ${r.fullName}`}
                      className="px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">— bez třídy —</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.className}>
                          {c.className}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={busy || sameClass(r.userClass, selected)}
                      onClick={() => void run(r.id, () => assignClass(r.id, selected || null))}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                    >
                      Přiřadit
                    </button>
                    {r.role === 'velitel_tridy' ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void run(r.id, () => dismissCommander(r.id))}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                      >
                        Odvolat velitele
                      </button>
                    ) : (
                      r.role === 'student' && (
                        <button
                          type="button"
                          disabled={busy || !selected}
                          title={selected ? undefined : 'Nejdřív vyberte třídu'}
                          onClick={() => void run(r.id, () => appointCommander(r.id, selected))}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Jmenovat velitelem
                        </button>
                      )
                    )}
                  </>
                )}
                {busy && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
