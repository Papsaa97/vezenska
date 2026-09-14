import React, { useState, useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';
import { useDialog } from '../hooks/useDialog';
import { MIN_PASSWORD_LENGTH, translateAuthError, weakPasswordNotice } from '../constants/auth';
import CaptchaWidget, { isCaptchaConfigured, type CaptchaWidgetHandle } from './CaptchaWidget';
import {
  isBiometricsSupported,
  storeBrowserCredential,
  getStoredBrowserCredential,
  FingerprintIcon,
} from '../utils/biometrics';

// ─── Role badge helpers ───────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  velitel_tridy: 'Velitel třídy',
  lektor: 'Lektor',
  admin: 'Správce',
};

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  velitel_tridy: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  lektor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  admin: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

// ─── AuthModal ────────────────────────────────────────────────────────────────

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  /** Přihlášení prošlo, ale heslo nevyhovuje zpřísněným požadavkům serveru. */
  const [weakPasswordMsg, setWeakPasswordMsg] = useState<string | null>(null);
  /** Token z ověření proti robotům. Null, dokud uživatel výzvu nedokončí. */
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<CaptchaWidgetHandle>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    isBiometricsSupported().then((supported) => {
      setIsBiometricAvailable(supported);
    });
    // Zjistíme, zda jsou uloženy přihlašovací údaje v správci hesel
    getStoredBrowserCredential().then((cred) => {
      setHasSavedCredentials(!!cred?.email && !!cred?.password);
    }).catch(() => {
      setHasSavedCredentials(false);
    });
  }, []);

  // Escape, past na fokus a jeho návrat po zavření — viz hooks/useDialog.
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: true, onClose });

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowPasswordHint(false);
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    resetForm();
    setMode(newMode);
  };

  const handleBiometricSignIn = async () => {
    setErrorMsg(null);

    // Ochranu proti robotům musí projít i přihlášení biometrikou — Supabase
    // ji vyžaduje u volání, ne u způsobu, jakým uživatel zadal heslo.
    if (isCaptchaConfigured() && !captchaToken) {
      setErrorMsg('Nejprve prosím dokončete ověření, že nejste robot.');
      return;
    }

    setLoading(true);
    try {
      // Načteme uložené přihlašovací údaje z nativního správce hesel / klíčenky.
      // Prohlížeč (Safari / Chrome) zobrazí biometrické ověření automaticky jako součást
      // Credential Management API — není potřeba WebAuthn.
      const cred = await getStoredBrowserCredential();
      if (cred?.email && cred?.password) {
        setEmail(cred.email);
        setPassword(cred.password);
        const { error, signedIn } = await signIn(cred.email, cred.password, captchaToken ?? undefined);
        captchaRef.current?.reset();
        if (error && !signedIn) {
          setErrorMsg(translateAuthError(error));
        } else if (error) {
          // Přihlášení prošlo, jen heslo nevyhovuje. Dialog se záměrně nezavírá,
          // aby si uživatel upozornění stihl přečíst.
          setWeakPasswordMsg(weakPasswordNotice(error));
        } else {
          onClose();
        }
      } else {
        // Žádné uložené credentials — vyzveme k přihlášení heslem
        setErrorMsg('Nejprve se přihlaste e-mailem a heslem. Údaje budou uloženy do klíčenky pro příští přihlášení.');
        setHasSavedCredentials(false);
      }
    } catch (err) {
      console.debug('[AuthModal] Biometric login failed:', err);
      setErrorMsg('Přihlášení biometrikou se nezdařilo. Přihlaste se e-mailem a heslem.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Je-li ochrana proti robotům nastavená, bez tokenu by server formulář
    // odmítl s technickou hláškou. Lepší je říct rovnou, na co se čeká.
    if (isCaptchaConfigured() && !captchaToken) {
      setErrorMsg('Nejprve prosím dokončete ověření, že nejste robot.');
      return;
    }

    setLoading(true);

    if (mode === 'signin') {
      const { error, signedIn } = await signIn(email, password, captchaToken ?? undefined);
      // Token je jednorázový — server ho odesláním spotřebuje.
      captchaRef.current?.reset();
      if (error && !signedIn) {
        setErrorMsg(translateAuthError(error));
      } else {
        await storeBrowserCredential(email, password);
        if (error) {
          // Přihlášení prošlo, jen heslo nevyhovuje. Dialog se záměrně nezavírá,
          // aby si uživatel upozornění stihl přečíst.
          setWeakPasswordMsg(weakPasswordNotice(error));
        } else {
          onClose();
        }
      }
    } else {
      if (!fullName.trim()) {
        setErrorMsg('Zadej prosím celé jméno.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Zadaná hesla se neshodují. Zkontrolujte prosím obě pole.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName, captchaToken ?? undefined);
      captchaRef.current?.reset();
      if (error) {
        setErrorMsg(translateAuthError(error));
      } else {
        await storeBrowserCredential(email, password);
        setSuccessMsg('Registrace proběhla. Zkontroluj e-mail pro potvrzení účtu.');
      }
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Přihlášení do aplikace"
        tabIndex={-1}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Zavřít přihlášení"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Akademie VS ČR</h2>
              <p className="text-slate-400 text-xs">
                {mode === 'signin' ? 'Přihlásit se do systému' : 'Registrace nového účtu'}
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Přihlášení
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Registrace
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} method="post" autoComplete="on" className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor={`${fieldIds}-0`}>
                  Celé jméno *
                </label>
                <input
                  id={`${fieldIds}-0`}
                  type="text"
                  name="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jan Novák"
                  required
                  autoComplete="name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor={`${fieldIds}-1`}>
                E-mail *
              </label>
              <input
                id={`${fieldIds}-1`}
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Váš e-mail"
                required
                inputMode="email"
                autoComplete="username webauthn"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor={`${fieldIds}-3`}>
                  Heslo *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasswordHint((prev) => !prev)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Nápověda k heslu"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Nápověda</span>
                </button>
              </div>

              {showPasswordHint && (
                <div className="mb-2 p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-300 space-y-1 animate-in fade-in duration-200">
                  <div className="font-semibold text-white text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    Požadavky na heslo:
                  </div>
                  <p className="text-[11px] text-slate-400">• Minimální délka je {MIN_PASSWORD_LENGTH} znaků</p>
                  <p className="text-[11px] text-slate-400">• Doporučujeme kombinaci velkých a malých písmen a číslic</p>
                  <p className="text-[11px] text-slate-300 font-medium">• Musí obsahovat alespoň jeden speciální znak (např. <span className="font-mono">!@#$%^&*</span>)</p>
                  <p className="text-[11px] text-slate-400">• Heslo je bezpečně šifrováno v Supabase Auth</p>
                </div>
              )}

              <div className="relative">
                <input
                  id={`${fieldIds}-3`}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor={`${fieldIds}-2`}>
                  Potvrzení hesla *
                </label>
                <div className="relative">
                  <input
                    id={`${fieldIds}-2`}
                    type={showPassword ? 'text' : 'password'}
                    name="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Zadejte heslo znovu pro ověření"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Error / Success messages */}
            {/* Ověření proti robotům. Bez nastavených proměnných
                VITE_CAPTCHA_* se nevykreslí vůbec. */}
            <CaptchaWidget ref={captchaRef} onToken={setCaptchaToken} onError={setErrorMsg} />

            {errorMsg && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-300 leading-snug">{errorMsg}</p>
              </div>
            )}
            {weakPasswordMsg && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/40 rounded-xl px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-200 leading-snug">{weakPasswordMsg}</p>
              </div>
            )}
            {successMsg && (
              <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-300 leading-snug">{successMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Přihlásit se
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Vytvořit účet
                </>
              )}
            </button>

            {/* Biometric Quick Sign-in Button */}
            {mode === 'signin' && isBiometricAvailable && hasSavedCredentials && (
              <button
                type="button"
                onClick={handleBiometricSignIn}
                disabled={loading}
                className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <FingerprintIcon className="w-4 h-4 text-emerald-400" />
                <span>Přihlásit se biometrikou (Face ID / Otisk)</span>
              </button>
            )}
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── UserBadge (inline header widget) ────────────────────────────────────────

interface UserBadgeProps {
  onLoginClick: () => void;
}

export function UserBadge({ onLoginClick }: UserBadgeProps) {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
        <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
        <span className="text-xs text-slate-400">Načítám…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 hover:border-blue-400/60 text-blue-300 hover:text-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
      >
        <LogIn className="w-3.5 h-3.5" />
        Přihlásit se
      </button>
    );
  }

  const role: UserRole = profile?.role ?? 'student';
  const roleLabel = ROLE_LABELS[role] ?? role;
  const roleColor = ROLE_COLORS[role] ?? 'bg-slate-700/40 text-slate-300 border-slate-600';

  const displayName = profile?.full_name || user.email || 'Uživatel';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="flex items-center gap-2">
      {/* Avatar + name */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/70 border border-slate-700/60 rounded-xl">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[10px] shrink-0">
          {initials || '?'}
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-white text-[11px] font-semibold max-w-[120px] truncate" title={displayName}>
            {displayName}
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 w-fit ${roleColor}`}>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={() => signOut()}
        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
        title="Odhlásit se"
      >
        <LogIn className="w-3.5 h-3.5 rotate-180" />
      </button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

