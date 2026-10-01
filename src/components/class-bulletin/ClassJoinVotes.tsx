import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, ThumbsDown, ThumbsUp, UserPlus } from 'lucide-react';
import {
  JoinVote,
  describeVoteTally,
  fetchJoinVotes,
  isMissingVotingFeature,
  voteOnJoinRequest,
} from '../../utils/classMembership';
import { MEMBERSHIP_CHANGED_EVENT, announceMembershipChange } from './ClassMembershipGate';

interface ClassJoinVotesProps {
  className: string;
}

const sameClass = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });

/**
 * Žádosti o vstup do třídy, o kterých mohou hlasovat její členové.
 *
 * Přijato je, jakmile pro hlasuje víc než polovina členů z okamžiku podání
 * žádosti; velitel ji dál může schválit sám v panelu „Zařazení“. Kdo smí
 * hlasovat a kdy je rozhodnuto, počítá server (migrace 053). Bez žádostí
 * (nebo bez migrace) se blok vůbec nezobrazí.
 */
export default function ClassJoinVotes({ className }: ClassJoinVotesProps) {
  const [votes, setVotes] = useState<JoinVote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetchJoinVotes();
    if (res.error) {
      // Migrace ještě neběžela: nic neukazovat, žádosti vyřizuje velitel.
      setError(isMissingVotingFeature(res.error) ? null : res.error);
      setVotes([]);
      return;
    }
    setError(null);
    setVotes((res.data ?? []).filter((v) => sameClass(v.className, className)));
  }, [className]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
    return () => window.removeEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
  }, [load]);

  const vote = async (v: JoinVote, inFavour: boolean) => {
    setBusyId(v.requestId);
    setNotice(null);
    const res = await voteOnJoinRequest(v.requestId, inFavour);
    setBusyId(null);
    if (res.error) {
      setError(res.error);
      await load();
      return;
    }
    setError(null);
    if (res.data === 'prijato') setNotice(`${v.applicantName} je hlasováním přijat(a) do třídy.`);
    else if (res.data === 'odmitnuto') setNotice(`Žádost ${v.applicantName} je hlasováním zamítnuta.`);
    announceMembershipChange();
  };

  if (votes.length === 0 && !error && !notice) return null;

  return (
    <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-blue-500" />
        <span>Žádosti o vstup do třídy</span>
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Žadatel je přijat, jakmile pro hlasuje víc než polovina členů třídy, nebo když žádost schválí velitel.
        Hlasovat mohou ti, kdo byli ve třídě už při podání žádosti; hlas jde do rozhodnutí změnit.
      </p>

      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-xs text-emerald-700 dark:text-emerald-400">
          {notice}
        </p>
      )}

      <ul className="space-y-2">
        {votes.map((v) => {
          const busy = busyId === v.requestId;
          const progress = v.needed > 0 ? Math.min(100, Math.round((v.votesFor / v.needed) * 100)) : 0;
          return (
            <li
              key={v.requestId}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{v.applicantName}</span>
                <span className="text-[0.6875rem] text-slate-400">žádost {formatDate(v.createdAt)}</span>
              </div>

              {v.votingPossible ? (
                <>
                  <div
                    className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
                    role="progressbar"
                    aria-label={`Hlasy pro přijetí ${v.applicantName}`}
                    aria-valuemin={0}
                    aria-valuemax={v.needed}
                    aria-valuenow={v.votesFor}
                  >
                    <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{describeVoteTally(v)}</p>
                </>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Třída měla při podání žádosti méně než 3 členy, proto se nehlasuje. O žádosti rozhodne velitel nebo lektor.
                </p>
              )}

              {(v.namesFor || v.namesAgainst) && (
                <div className="text-[0.6875rem] text-slate-500 dark:text-slate-400 space-y-0.5">
                  {v.namesFor && <div>Pro: {v.namesFor}</div>}
                  {v.namesAgainst && <div>Proti: {v.namesAgainst}</div>}
                </div>
              )}

              {v.canVote ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy || v.myVote === true}
                    aria-pressed={v.myVote === true}
                    onClick={() => void vote(v, true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-default ${
                      v.myVote === true
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600/20 disabled:opacity-50'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Pro přijetí
                  </button>
                  <button
                    type="button"
                    disabled={busy || v.myVote === false}
                    aria-pressed={v.myVote === false}
                    onClick={() => void vote(v, false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer disabled:cursor-default ${
                      v.myVote === false
                        ? 'bg-slate-700 text-white dark:bg-slate-600'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    Proti
                  </button>
                  {busy && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  {v.myVote !== null && !busy && (
                    <span className="text-[0.6875rem] text-slate-400">
                      Hlasovali jste {v.myVote ? 'pro' : 'proti'}; hlas můžete změnit.
                    </span>
                  )}
                </div>
              ) : (
                v.votingPossible && (
                  <p className="text-[0.6875rem] text-slate-400">
                    Hlasovat mohou jen ti, kdo byli členy třídy už při podání žádosti.
                  </p>
                )
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Stav hlasování o vlastní žádosti — pro nezařazeného žadatele.
 * Ukazuje jen počty; kdo jak hlasoval, žadatel nevidí (server jména nevydá).
 */
export function MyJoinRequestProgress({ className }: ClassJoinVotesProps) {
  const [vote, setVote] = useState<JoinVote | null>(null);

  const load = useCallback(async () => {
    const res = await fetchJoinVotes();
    setVote((res.data ?? []).find((v) => sameClass(v.className, className)) ?? null);
  }, [className]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
    return () => window.removeEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
  }, [load]);

  if (!vote || !vote.votingPossible) return null;
  return (
    <p className="text-xs text-slate-500 dark:text-slate-400">
      O přijetí mohou hlasovat i členové třídy. {describeVoteTally(vote)}.
    </p>
  );
}
