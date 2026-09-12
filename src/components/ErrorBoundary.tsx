import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Zachytává neočekávané chyby v podstromu (např. výpadek spojení se Supabase),
 * aby aplikace nespadla na prázdnou bílou obrazovku, ale nabídla srozumitelný fallback.
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Neočekávaná chyba v aplikaci:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h2 className="text-lg font-bold text-white">Něco se pokazilo</h2>
            <p className="text-sm text-slate-400">
              Aplikaci se nepodařilo načíst nebo došlo k výpadku spojení se serverem (Supabase). Zkontrolujte prosím připojení k internetu a zkuste to znovu.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-blue-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              Zkusit znovu
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm transition-all cursor-pointer border border-slate-700/60 shadow-lg shadow-slate-900/40"
            >
              <RotateCcw className="w-4 h-4" />
              Obnovit celou stránku
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
