import React, { useCallback, useEffect, useId, useState } from 'react';
import { Check, HelpCircle, Loader2, School, UserCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDialog } from '../../hooks/useDialog';
import {
  ClassOverview,
  MyMembership,
  PendingAssignment,
  declareMissingClass,
  decideNomination,
  fetchClassOverview,
  fetchMyMembership,
  requestClass,
} from '../../utils/classMembership';

/**
 * Událost, kterou si posílají části aplikace po změně zařazení (odeslaná
 * žádost, přijatá nominace…), aby si nástěnka znovu načetla stav.
 */
export const MEMBERSHIP_CHANGED_EVENT = 'vscr:zarazeni-zmena';

export function announceMembershipChange(): void {
  window.dispatchEvent(new Event(MEMBERSHIP_CHANGED_EVENT));
}

const MISSING_CLASS = '__nevidim__';

/** Jak často se zařazení (a čekající nominace) načítá znovu. */
const MEMBERSHIP_REFRESH_MS = 60_000;

/**
 * Povinná volba třídy a potvrzení nominací od velitele.
 *
 * 1. Student bez třídy, bez poznámky a bez čekající žádosti dostane dialog,
 *    který nejde zavřít: vybere existující třídu (odejde žádost veliteli),
 *    nebo „Nevidím zde svou třídu“ a napíše, kam patří.
 * 2. Kdokoli s čekající nominací od velitele ji tu potvrdí, nebo odmítne.
 *
 * Když migrace 038 ještě neběžela, komponenta nic nezobrazí — aplikaci
 * kvůli tomu blokovat nejde.
 */
export default function ClassMembershipGate() {
  const { user, realRole, loading, refreshProfile } = useAuth();
  const [membership, setMembership] = useState<MyMembership | null>(null);
  const [classes, setClasses] = useState<ClassOverview[]>([]);

  const load = useCallback(async () => {
    if (!user) {
      setMembership(null);
      return;
    }
    const [m, c] = await Promise.all([fetchMyMembership(), fetchClassOverview()]);
    // Chyba (typicky chybějící migrace) = nic neblokovat.
    setMembership(m.error ? null : m.data);
    setClasses(c.data ?? []);
  }, [user]);

  useEffect(() => {
    if (!loading) void load();
  }, [loading, load]);

  // Nominaci pošle velitel z jiného zařízení kdykoli. Načtení jen při startu
  // znamenalo, že se dialog k potvrzení ukázal až po znovunačtení stránky;
  // proto se stav obnovuje i po návratu na kartu a každou minutu, ale jen
  // když je stránka vidět (stejně jako diskuze třídy a zvonek).
  useEffect(() => {
    if (loading) return;
    const handler = () => void load();
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    window.addEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
    document.addEventListener('visibilitychange', refreshIfVisible);
    const timer = window.setInterval(refreshIfVisible, MEMBERSHIP_REFRESH_MS);
    return () => {
      window.removeEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
      document.removeEventListener('visibilitychange', refreshIfVisible);
      window.clearInterval(timer);
    };
  }, [loading, load]);

  if (!user || loading || !membership) return null;

  const nomination = membership.pending.find((p) => p.kind === 'nominace');
  if (nomination && !membership.userClass) {
    return (
      <NominationDialog
        nomination={nomination}
        onDone={async () => {
          await refreshProfile();
          announceMembershipChange();
        }}
      />
    );
  }

  const needsChoice =
    realRole === 'student' &&
    !membership.userClass &&
    !membership.note &&
    !membership.pending.some((p) => p.kind === 'zadost');

  if (needsChoice) {
    return <ChooseClassDialog classes={classes} onDone={announceMembershipChange} />;
  }

  return null;
}

// ─── Volba třídy ─────────────────────────────────────────────────────────────

export function ChooseClassDialog({
  classes,
  onDone,
  onCancel,
}: {
  classes: ClassOverview[];
  onDone: () => void;
  /** Bez onCancel je dialog povinný a nejde zavřít. */
  onCancel?: () => void;
}) {
  const [choice, setChoice] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const ids = useId();
  const dialogRef = useDialog<HTMLDivElement>({
    isOpen: true,
    onClose: onCancel ?? (() => undefined),
    closeOnEscape: Boolean(onCancel) && !saving,
  });

  const missing = choice === MISSING_CLASS;
  const canSubmit = !saving && (missing ? note.trim().length >= 3 : choice !== '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    const res = missing ? await declareMissingClass(note.trim()) : await requestClass(choice);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${ids}-title`}
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 id={`${ids}-title`} className="text-lg font-black text-slate-900 dark:text-white">
                Zvolte svou třídu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Do třídy vás zařadí její velitel (nebo lektor) po schválení. Změnit ji potom může jen lektor nebo správce.
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Zavřít"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <fieldset className="space-y-2">
            <legend className="sr-only">Třída</legend>
            {classes.map((c) => (
              <label
                key={c.id}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                  choice === c.className
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name={`${ids}-class`}
                    value={c.className}
                    checked={choice === c.className}
                    onChange={() => setChoice(c.className)}
                  />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{c.className}</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
                  {c.commanderName ? `Velitel: ${c.commanderName}` : 'Velitel zatím nejmenován'}
                </span>
              </label>
            ))}

            <label
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                missing
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <input
                type="radio"
                name={`${ids}-class`}
                value={MISSING_CLASS}
                checked={missing}
                onChange={() => setChoice(MISSING_CLASS)}
              />
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Nevidím zde svou třídu</span>
            </label>
          </fieldset>

          {missing && (
            <div>
              <label htmlFor={`${ids}-note`} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Kam patříte? (povinné)
              </label>
              <textarea
                id={`${ids}-note`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
                rows={3}
                required
                placeholder="Např. ZOP A15, nástup 1. 10. — nebo „nový lektor, předmět Právo“"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Poznámku uvidí velitelé tříd, lektoři a správce, aby vás mohli zařadit.
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {missing ? 'Uložit poznámku' : 'Požádat o zařazení'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Potvrzení nominace ──────────────────────────────────────────────────────

function NominationDialog({
  nomination,
  onDone,
}: {
  nomination: PendingAssignment;
  onDone: () => Promise<void>;
}) {
  const [saving, setSaving] = useState<'accept' | 'decline' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ids = useId();
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: true, onClose: () => undefined, closeOnEscape: false });

  const decide = async (accept: boolean) => {
    setSaving(accept ? 'accept' : 'decline');
    setError(null);
    const res = await decideNomination(nomination.id, accept);
    if (res.error) {
      setSaving(null);
      setError(res.error);
      return;
    }
    await onDone();
    setSaving(null);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${ids}-title`}
        aria-describedby={`${ids}-desc`}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h2 id={`${ids}-title`} className="text-lg font-black text-slate-900 dark:text-white">
            Byli jste označeni ve třídě {nomination.className}
          </h2>
        </div>
        <p id={`${ids}-desc`} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {nomination.fromName ? `${nomination.fromName}, velitel třídy ${nomination.className},` : `Velitel třídy ${nomination.className}`}{' '}
          vás označil jako člena své třídy. Potvrdíte-li to, budete do třídy zařazeni. Pokud to nesedí, odmítněte to —
          zůstanete v seznamu nezařazených a velitel dostane oznámení.
        </p>
        {error && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void decide(true)}
            disabled={saving !== null}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Potvrdit
          </button>
          <button
            type="button"
            onClick={() => void decide(false)}
            disabled={saving !== null}
            className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-slate-100 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving === 'decline' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            Odmítnout
          </button>
        </div>
      </div>
    </div>
  );
}
