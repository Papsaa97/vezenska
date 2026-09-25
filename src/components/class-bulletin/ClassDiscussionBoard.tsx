import React, { useCallback, useEffect, useId, useState } from 'react';
import {
  AtSign,
  BarChart3,
  EyeOff,
  Loader2,
  MessageSquare,
  Pin,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ClassMember, fetchClassMembers } from '../../utils/classMembership';
import {
  DiscussionPost,
  closePoll,
  createPost,
  deletePost,
  fetchDiscussion,
  moderatePost,
  votePoll,
} from '../../utils/classDiscussion';
import { MEMBERSHIP_CHANGED_EVENT } from './ClassMembershipGate';

interface ClassDiscussionBoardProps {
  className: string;
}

const MAX_TEXT = 2000;
const MAX_OPTIONS = 10;
const REFRESH_MS = 60_000;

const ROLE_LABEL: Record<string, string> = {
  velitel_tridy: 'Velitel',
  lektor: 'Lektor',
  admin: 'Správce',
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * Diskuze třídy na rozšířeném dashboardu.
 *
 * Členové píšou příspěvky, zakládají ankety a označují spolužáky (označený
 * dostane oznámení do zvonku). Velitel, jeho platný zástupce, lektor a správce
 * diskuzi moderují: připínají, skrývají a mažou. Oprávnění hlídá server
 * (migrace 039); klient jen skrývá tlačítka, která by stejně neprošla.
 */
export default function ClassDiscussionBoard({ className }: ClassDiscussionBoardProps) {
  const { profile } = useAuth();
  const ids = useId();

  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const [text, setText] = useState<string>('');
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const [pollEnabled, setPollEnabled] = useState<boolean>(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollUntil, setPollUntil] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetchDiscussion(className);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setError(null);
    setPosts(res.data ?? []);
  }, [className]);

  const loadMembers = useCallback(async () => {
    const res = await fetchClassMembers(className);
    if (!res.error) setMembers(res.data ?? []);
  }, [className]);

  useEffect(() => {
    setLoading(true);
    void load();
    void loadMembers();
  }, [load, loadMembers]);

  useEffect(() => {
    const handler = () => {
      void load();
      void loadMembers();
    };
    window.addEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, REFRESH_MS);
    return () => {
      window.removeEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
      window.clearInterval(timer);
    };
  }, [load, loadMembers]);

  const run = async (action: Promise<{ error: string | null }>): Promise<boolean> => {
    setBusy(true);
    const res = await action;
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return false;
    }
    setError(null);
    await load();
    return true;
  };

  const filledOptions = pollOptions.map((o) => o.trim()).filter((o) => o.length > 0);
  const canSubmit =
    !busy &&
    text.trim().length > 0 &&
    text.length <= MAX_TEXT &&
    (!pollEnabled || filledOptions.length >= 2);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const ok = await run(
      createPost(className, {
        text: text.trim(),
        mentionIds,
        pollOptions: pollEnabled ? filledOptions : null,
        pollUntil: pollEnabled && pollUntil ? new Date(pollUntil).toISOString() : null,
      })
    );
    if (ok) {
      setText('');
      setMentionIds([]);
      setPollEnabled(false);
      setPollOptions(['', '']);
      setPollUntil('');
    }
  };

  const mentionable = members.filter((m) => m.id !== profile?.id && !mentionIds.includes(m.id));
  const nameOf = (id: string) => members.find((m) => m.id === id)?.fullName ?? 'Člen třídy';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <span>Diskuze třídy</span>
        </h3>
        <button
          type="button"
          onClick={() => void load()}
          aria-label="Obnovit diskuzi"
          title="Obnovit diskuzi"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Nový příspěvek */}
      <form
        onSubmit={(e) => void submit(e)}
        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-2.5"
      >
        <label htmlFor={`${ids}-text`} className="sr-only">
          Nový příspěvek
        </label>
        <textarea
          id={`${ids}-text`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={MAX_TEXT}
          placeholder={pollEnabled ? 'Otázka ankety…' : 'Napište zprávu třídě…'}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
        />

        {mentionIds.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Označení členové">
            {mentionIds.map((id) => (
              <li
                key={id}
                className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300"
              >
                @{nameOf(id)}
                <button
                  type="button"
                  onClick={() => setMentionIds((prev) => prev.filter((x) => x !== id))}
                  aria-label={`Zrušit označení ${nameOf(id)}`}
                  className="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {pollEnabled && (
          <fieldset className="space-y-1.5">
            <legend className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Možnosti ankety</legend>
            {pollOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <label htmlFor={`${ids}-opt-${i}`} className="sr-only">
                  Možnost {i + 1}
                </label>
                <input
                  id={`${ids}-opt-${i}`}
                  value={opt}
                  maxLength={200}
                  onChange={(e) =>
                    setPollOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))
                  }
                  placeholder={`Možnost ${i + 1}`}
                  className="flex-1 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions((prev) => prev.filter((_, j) => j !== i))}
                    aria-label={`Odebrat možnost ${i + 1}`}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < MAX_OPTIONS && (
              <button
                type="button"
                onClick={() => setPollOptions((prev) => [...prev, ''])}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Přidat možnost
              </button>
            )}
            <label htmlFor={`${ids}-until`} className="block text-[11px] text-slate-600 dark:text-slate-300 pt-1">
              Konec hlasování (prázdné = do ukončení)
            </label>
            <input
              id={`${ids}-until`}
              type="datetime-local"
              value={pollUntil}
              onChange={(e) => setPollUntil(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </fieldset>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`${ids}-mention`} className="sr-only">
            Označit člena třídy
          </label>
          <span className="flex items-center gap-1 text-slate-400">
            <AtSign className="w-3.5 h-3.5" aria-hidden="true" />
            <select
              id={`${ids}-mention`}
              value=""
              disabled={mentionable.length === 0}
              onChange={(e) => {
                const id = e.target.value;
                if (id) setMentionIds((prev) => [...prev, id]);
              }}
              className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 disabled:opacity-50"
            >
              <option value="">Označit člena…</option>
              {mentionable.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </span>
          <button
            type="button"
            aria-pressed={pollEnabled}
            onClick={() => setPollEnabled((v) => !v)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              pollEnabled
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-600/10 text-indigo-700 dark:text-indigo-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Anketa
          </button>
          <span className="ml-auto text-[10px] text-slate-400">
            {text.length}/{MAX_TEXT}
          </span>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Zveřejnit
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Příspěvky */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Načítám diskuzi…
        </div>
      ) : posts.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Zatím tu nikdo nic nenapsal.</p>
      ) : (
        <ul className="space-y-2.5">
          {posts.map((post) => {
            const mine = post.authorId !== null && post.authorId === profile?.id;
            const canDelete = mine || post.canModerate;
            const roleLabel = post.authorRole ? ROLE_LABEL[post.authorRole] : undefined;
            return (
              <li
                key={post.id}
                className={`p-3 rounded-xl border space-y-2 ${
                  post.hidden
                    ? 'border-dashed border-slate-300 dark:border-slate-700 opacity-70'
                    : post.pinned
                      ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-900/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{post.authorName}</span>
                  {roleLabel && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                      {roleLabel}
                    </span>
                  )}
                  <span className="text-slate-400">{formatWhen(post.createdAt)}</span>
                  {post.pinned && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      <Pin className="w-3 h-3" />
                      Připnuto
                    </span>
                  )}
                  {post.hidden && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <EyeOff className="w-3 h-3" />
                      {post.canModerate ? 'Skryto — ostatní ho nevidí' : 'Skryl moderátor — vidíte ho jen vy'}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line break-words">{post.text}</p>

                {post.mentions.length > 0 && (
                  <p className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    {post.mentions.map((m) => (
                      <span key={m.id}>@{m.name}</span>
                    ))}
                  </p>
                )}

                {post.isPoll && (
                  <div className="space-y-1.5">
                    {post.options.map((opt) => {
                      const pct = post.totalVotes > 0 ? Math.round((opt.votes / post.totalVotes) * 100) : 0;
                      const chosen = post.myVote === opt.id;
                      const bar = (
                        <>
                          <span
                            className={`absolute inset-y-0 left-0 rounded-lg ${
                              chosen ? 'bg-blue-200 dark:bg-blue-800/60' : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                            style={{ width: `${pct}%` }}
                            aria-hidden="true"
                          />
                          <span className="relative flex justify-between gap-2">
                            <span className={chosen ? 'font-bold' : ''}>
                              {opt.text}
                              {chosen && ' ✓'}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {opt.votes} ({pct} %)
                            </span>
                          </span>
                        </>
                      );
                      const cls =
                        'relative w-full overflow-hidden text-left px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100';
                      return post.pollOpen ? (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={busy}
                          aria-pressed={chosen}
                          onClick={() => void run(votePoll(post.id, opt.id))}
                          className={`${cls} hover:border-blue-400 disabled:opacity-60 cursor-pointer`}
                        >
                          {bar}
                        </button>
                      ) : (
                        <div key={opt.id} className={cls}>
                          {bar}
                        </div>
                      );
                    })}
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Hlasů: {post.totalVotes}
                      {' · '}
                      {post.pollOpen
                        ? post.pollUntil
                          ? `hlasování končí ${formatWhen(post.pollUntil)}`
                          : 'hlasování běží, hlas lze změnit'
                        : 'hlasování skončilo'}
                    </p>
                  </div>
                )}

                {(post.canModerate || canDelete) && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {post.canModerate && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void run(moderatePost(post.id, !post.pinned, null))}
                          className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold disabled:opacity-50 cursor-pointer"
                        >
                          {post.pinned ? 'Odepnout' : 'Připnout'}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void run(moderatePost(post.id, null, !post.hidden))}
                          className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold disabled:opacity-50 cursor-pointer"
                        >
                          {post.hidden ? 'Zobrazit' : 'Skrýt'}
                        </button>
                      </>
                    )}
                    {post.isPoll && post.pollOpen && (mine || post.canModerate) && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void run(closePoll(post.id))}
                        className="px-2 py-1 rounded-lg bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold disabled:opacity-50 cursor-pointer"
                      >
                        Ukončit anketu
                      </button>
                    )}
                    {canDelete &&
                      (confirmDelete === post.id ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setConfirmDelete(null);
                              void run(deletePost(post.id));
                            }}
                            className="px-2 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold disabled:opacity-50 cursor-pointer"
                          >
                            Opravdu smazat
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 rounded-lg text-slate-500 text-[11px] font-bold cursor-pointer"
                          >
                            Zpět
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(post.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-[11px] font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Smazat
                        </button>
                      ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
