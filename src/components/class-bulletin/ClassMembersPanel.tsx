import React, { useCallback, useEffect, useId, useState } from 'react';
import { Crown, Loader2, Shield, UserCog, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ClassMember,
  appointDeputy,
  cancelDeputy,
  fetchClassMembers,
  handOverCommand,
} from '../../utils/classMembership';
import { MEMBERSHIP_CHANGED_EVENT, announceMembershipChange } from './ClassMembershipGate';

interface ClassMembersPanelProps {
  className: string;
}

type OpenForm = { memberId: string; kind: 'deputy' | 'handover' } | null;

/**
 * Členové třídy na rozšířeném dashboardu.
 *
 * Seznam vydá server jen členům třídy, lektorům a správcům (clenove_tridy()).
 * Velitel tu navíc určuje dočasného zástupce a může funkci předat — předání
 * vyžaduje odůvodnění, které pak lektoři vidí v historii.
 */
export default function ClassMembersPanel({ className }: ClassMembersPanelProps) {
  const { profile, refreshProfile } = useAuth();
  const isStaff = profile?.role === 'lektor' || profile?.role === 'admin';
  const isCommander =
    profile?.role === 'velitel_tridy' &&
    (profile.user_class || '').trim().toLowerCase() === className.trim().toLowerCase();

  const [members, setMembers] = useState<ClassMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<OpenForm>(null);
  const [until, setUntil] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const ids = useId();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchClassMembers(className);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(null);
    setMembers(res.data ?? []);
  }, [className]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
    return () => window.removeEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
  }, [load]);

  const finish = async (res: { error: string | null }, refresh = false) => {
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(null);
    setOpen(null);
    setUntil('');
    setReason('');
    if (refresh) await refreshProfile();
    announceMembershipChange();
  };

  const toggleForm = (memberId: string, kind: 'deputy' | 'handover') => {
    setOpen((prev) => (prev?.memberId === memberId && prev.kind === kind ? null : { memberId, kind }));
    setError(null);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-500" />
        <span>Členové třídy</span>
        {!loading && <span className="text-xs font-semibold text-slate-400">({members.length})</span>}
      </h3>

      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Načítám členy…
        </div>
      ) : members.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Do třídy zatím nikdo není zařazen.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {members.map((m) => {
            const isCmd = m.role === 'velitel_tridy';
            const formOpen = open?.memberId === m.id ? open.kind : null;
            const canManageThis = isCommander && !isCmd;
            return (
              <li
                key={m.id}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                        {m.fullName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{m.fullName}</span>
                  </span>
                  {isCmd && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center gap-1 shrink-0">
                      <Crown className="w-3 h-3" />
                      Velitel
                    </span>
                  )}
                  {m.isDeputy && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-1 shrink-0">
                      <Shield className="w-3 h-3" />
                      Zástupce
                    </span>
                  )}
                </div>

                {(canManageThis || (isStaff && m.isDeputy)) && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.isDeputy ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setBusy(true);
                          void cancelDeputy(className).then((r) => finish(r));
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 disabled:opacity-50 cursor-pointer"
                      >
                        Ukončit zástupcování
                      </button>
                    ) : (
                      canManageThis && (
                        <button
                          type="button"
                          aria-expanded={formOpen === 'deputy'}
                          onClick={() => toggleForm(m.id, 'deputy')}
                          className="px-2 py-1 rounded-lg bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold cursor-pointer"
                        >
                          Určit zástupcem
                        </button>
                      )
                    )}
                    {canManageThis && (
                      <button
                        type="button"
                        aria-expanded={formOpen === 'handover'}
                        onClick={() => toggleForm(m.id, 'handover')}
                        className="px-2 py-1 rounded-lg bg-purple-600/10 text-purple-700 dark:text-purple-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <UserCog className="w-3 h-3" />
                        Předat funkci
                      </button>
                    )}
                  </div>
                )}

                {formOpen === 'deputy' && (
                  <form
                    className="space-y-1.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setBusy(true);
                      void appointDeputy(m.id, until ? new Date(until).toISOString() : null).then((r) => finish(r));
                    }}
                  >
                    <label htmlFor={`${ids}-until-${m.id}`} className="block text-[11px] text-slate-600 dark:text-slate-300">
                      Zastupuje do (prázdné = do odvolání)
                    </label>
                    <input
                      id={`${ids}-until-${m.id}`}
                      type="datetime-local"
                      value={until}
                      onChange={(e) => setUntil(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-bold cursor-pointer"
                    >
                      Potvrdit zástupce
                    </button>
                  </form>
                )}

                {formOpen === 'handover' && (
                  <form
                    className="space-y-1.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setBusy(true);
                      void handOverCommand(m.id, reason.trim()).then((r) => finish(r, true));
                    }}
                  >
                    <label htmlFor={`${ids}-reason-${m.id}`} className="block text-[11px] text-slate-600 dark:text-slate-300">
                      Odůvodnění předání (povinné, uvidí ho lektoři)
                    </label>
                    <textarea
                      id={`${ids}-reason-${m.id}`}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      maxLength={500}
                      required
                      minLength={10}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Po předání budete ve třídě jako student a {m.fullName} převezme velení.
                    </p>
                    <button
                      type="submit"
                      disabled={busy || reason.trim().length < 10}
                      className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-[11px] font-bold cursor-pointer"
                    >
                      Předat funkci velitele
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
