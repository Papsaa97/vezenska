import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  Sun, 
  Moon, 
  BookOpen, 
  Sparkles, 
  Scale, 
  GraduationCap 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthWallProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function AuthWall({ isDarkMode, toggleDarkMode }: AuthWallProps) {
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
      }
    } else {
      if (!fullName.trim()) {
        setErrorMsg('Zadejte prosím své celé jméno a příjmení.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setErrorMsg(translateError(error.message));
      } else {
        setSuccessMsg('Registrace proběhla úspěšně! Zkontrolujte svůj e-mail pro potvrzení účtu, nebo se přihlaste.');
      }
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-[100dvh] w-full flex flex-col justify-between transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'
    }`}>
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20 border border-blue-400/30">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-sm sm:text-base">
                AKADEMIE VS ČR
              </span>
              <span className="text-amber-400 font-bold text-[10px] px-2 py-0.5 bg-amber-400/10 rounded-full border border-amber-400/30 tracking-wider">
                ZOP A
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Výukový & zkušební systém Vězeňské služby ČR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Zabezpečený přístup</span>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer border border-slate-800 hover:border-slate-700"
            title={isDarkMode ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
            aria-label="Přepnout motiv"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Presentation Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Základní odborná příprava • Zkušební obor A</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Vstup do portálu <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                  Akademie VS ČR
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Komplexní interaktivní platforma pro přípravu na zkoušky ZOP A, procvičování zkušebních testů, právní kompas a taktické scénáře pro příslušníky a zaměstnance Vězeňské služby České republiky.
              </p>
            </motion.div>

            {/* Feature Highlights Cards */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
            >
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">9 studijních předmětů</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Oficiální testové sady, zkouškový simulátor i 3D Leitner kartičky.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">AI Asistent zkoušek</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Vyhodnocování kapitánských zadání, písemek a cvičných odpovědí.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Právní kompas</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Plná znění zákonů 555/1992, 169/1999, 293/1993 a NGŘ.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Digitální knihovna</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Studijní texty, metodické pomůcky a příručky Akademie VS ČR.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Login / Register Form Card */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              {/* Subtle top card glow */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400" />

              {/* Form Title & Icon */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {mode === 'signin' ? 'Přihlášení do systému' : 'Registrace nového účtu'}
                  </h3>
                  <p className="text-slate-400 text-xs">
                    {mode === 'signin' 
                      ? 'Zadejte své přihlašovací údaje' 
                      : 'Vytvořte si profil pro přístup k portálu'}
                  </p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-1 bg-slate-800/80 p-1 rounded-xl mb-6 border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'signin'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Přihlášení
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'signup'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  Registrace
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Jméno a příjmení
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="nstržm. Jan Novák"
                        required
                        className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                      />
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mailová adresa
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jmeno@vscr.cz nebo osobní e-mail"
                      required
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
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
                      placeholder="Minimálně 6 znaků"
                      required
                      minLength={6}
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer p-1"
                      aria-label={showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Alerts */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300 leading-snug">{errorMsg}</p>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-emerald-300 leading-snug">{successMsg}</p>
                  </motion.div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : mode === 'signin' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      Přihlásit se do portálu
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Zaregistrovat účet
                    </>
                  )}
                </button>
              </form>

              {/* Bottom switcher helper */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
                {mode === 'signin' ? (
                  <p className="text-xs text-slate-400">
                    Nemáte ještě svůj účet?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 cursor-pointer"
                    >
                      Zaregistrujte se
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Již máte vytvořený účet?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 cursor-pointer"
                    >
                      Přihlaste se
                    </button>
                  </p>
                )}
              </div>
            </motion.div>

            {/* Security note */}
            <p className="text-[11px] text-slate-500 text-center mt-4">
              Portál je určen výhradně pro služební a studijní účely Akademie VS ČR.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/60 bg-slate-950/40 px-4 py-4 text-center text-xs text-slate-500">
        <p>Vězeňská služba České republiky • Akademie VS ČR Stráž pod Ralskem</p>
      </footer>
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Nesprávný e-mail nebo heslo.';
  if (msg.includes('Email not confirmed')) return 'E-mail ještě nebyl ověřen. Zkontrolujte prosím svou schránku.';
  if (msg.includes('User already registered')) return 'Účet s tímto e-mailem již existuje.';
  if (msg.includes('Password should be at least')) return 'Heslo musí mít alespoň 6 znaků.';
  if (msg.includes('rate limit')) return 'Příliš mnoho pokusů. Zkuste to prosím za chvíli.';
  return msg;
}
