import React, { useEffect, useId, useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { supabase, PASSWORD_RECOVERY_KEY } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { passwordProblem, translateAuthError } from '../constants/auth';
import { useDialog } from '../hooks/useDialog';

function readRecoveryFlag(): boolean {
  try {
    return sessionStorage.getItem(PASSWORD_RECOVERY_KEY) === '1';
  } catch {
    return false;
  }
}

function clearRecoveryFlag(): void {
  try {
    sessionStorage.removeItem(PASSWORD_RECOVERY_KEY);
  } catch {
    // Nic — příznak zanikne se zavřením karty.
  }
}

/**
 * Nastavení nového hesla po návratu z odkazu „Obnovit heslo“.
 *
 * Odkaz z e-mailu uživatele rovnou přihlásí, heslo ale zůstává staré
 * (zapomenuté). Bez tohoto okna by se uživatel sice dostal dovnitř, ale
 * příště by se zase nepřihlásil.
 */
export default function PasswordRecoveryModal() {
  const { user } = useAuth();
  const [isRecovery, setIsRecovery] = useState<boolean>(readRecoveryFlag);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const titleId = useId();
  const passwordId = useId();
  const confirmId = useId();

  // Záloha pro případ, že klient ohlásí obnovu až po připojení posluchače.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const close = () => {
    clearRecoveryFlag();
    setIsRecovery(false);
  };

  const isOpen = isRecovery && user !== null;
  const dialogRef = useDialog<HTMLDivElement>({ isOpen, onClose: close, closeOnEscape: !saving });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Zadaná hesla se neshodují.');
      return;
    }
    const weak = passwordProblem(password);
    if (weak) {
      setError(weak);
      return;
    }
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(translateAuthError(updateError));
      return;
    }
    clearRecoveryFlag();
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <h2 id={titleId} className="text-base font-bold text-slate-900 dark:text-white">
            {done ? 'Heslo je změněné' : 'Nastavte si nové heslo'}
          </h2>
        </div>

        {done ? (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Příště se přihlásíte novým heslem. Jste přihlášeni, můžete pokračovat.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold"
              >
                Pokračovat
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Přišli jste z odkazu pro obnovu hesla. Zadejte nové heslo, jinak se příště nepřihlásíte.
            </p>
            <div>
              <label htmlFor={passwordId} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nové heslo
              </label>
              <input
                id={passwordId}
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor={confirmId} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nové heslo znovu
              </label>
              <input
                id={confirmId}
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
              />
            </div>
            {error && (
              <p role="alert" className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={close}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold"
              >
                Teď ne
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-bold flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Uložit heslo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
