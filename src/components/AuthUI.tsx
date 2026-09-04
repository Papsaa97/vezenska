import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';

// ─── Role badge helpers ───────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  lektor: 'Lektor',
  admin: 'Správce',
};

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  lektor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  admin: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

// ─── AuthModal ────────────────────────────────────────────────────────────────

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(translateError(error.message));
      } else {
        onClose();
      }
    } else {
      if (!fullName.trim()) {
        setErrorMsg('Zadej prosím celé jméno.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setErrorMsg(translateError(error.message));
      } else {
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Celé jméno
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jan Novák"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan.novak@vezenstvi.cz"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Heslo
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
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

            {/* Error / Success messages */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-300 leading-snug">{errorMsg}</p>
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
  const { profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
        <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
        <span className="text-xs text-slate-400">Načítám…</span>
      </div>
    );
  }

  if (!profile) {
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

  const roleLabel = ROLE_LABELS[profile.role] ?? profile.role;
  const roleColor = ROLE_COLORS[profile.role] ?? 'bg-slate-700/40 text-slate-300 border-slate-600';

  const initials = (profile.full_name ?? profile.email)
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
          <span className="text-white text-[11px] font-semibold max-w-[100px] truncate">
            {profile.full_name ?? profile.email}
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

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Nesprávný e-mail nebo heslo.';
  if (msg.includes('Email not confirmed')) return 'E-mail ještě nebyl ověřen. Zkontroluj schránku.';
  if (msg.includes('User already registered')) return 'Účet s tímto e-mailem již existuje.';
  if (msg.includes('Password should be at least')) return 'Heslo musí mít alespoň 6 znaků.';
  if (msg.includes('rate limit')) return 'Příliš mnoho pokusů. Zkus to za chvíli.';
  return msg;
}
