import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthWall from './AuthWall';

interface ProtectedRouteProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  children: React.ReactNode;
}

/**
 * AuthGuard wrapper: dokud probíhá ověřování Supabase session, zobrazí decentní spinner.
 * Pokud session neexistuje, rovnou vykreslí AuthWall místo chráněného obsahu
 * (zamezení "zábleskům" chráněného obsahu před přesměrováním nepřihlášeným uživatelům).
 */
export default function ProtectedRoute({ isDarkMode, toggleDarkMode, children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className={`min-h-[100dvh] w-full flex flex-col items-center justify-center transition-colors ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/25 border border-blue-400/30 animate-pulse">
              V
            </div>
            <div className="absolute -inset-2 border-2 border-blue-500/20 border-t-blue-500 rounded-3xl animate-spin" />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-white tracking-wide">AKADEMIE VS ČR</div>
            <div className="text-xs text-slate-400 mt-1">Ověřování přihlášení…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthWall isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
  }

  return <>{children}</>;
}
