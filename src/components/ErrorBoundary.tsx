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
 * Zachytává neočekávané chyby v podstromu, aby aplikace nespadla na prázdnou
 * bílou obrazovku, ale nabídla srozumitelný fallback.
 *
 * DVĚ VĚCI, KTERÉ TU BYLY ŠPATNĚ:
 *
 * 1. Text sváděl vinu na internet: „došlo k výpadku spojení se serverem
 *    (Supabase). Zkontrolujte připojení k internetu.“ Sem se ale dostane
 *    KAŽDÁ neodchycená výjimka při vykreslování — typicky chyba v kódu nebo
 *    ve datech. Uživatel pak zkoumal wi-fi u vady, se kterou síť nemá nic
 *    společného. Navíc výpadek Supabase řeší vlastní hlášení (OfflineBanner),
 *    sem nevede.
 *
 * 2. Barvy byly natvrdo tmavé (`bg-slate-950 text-slate-100`), bez ohledu na
 *    zvolený motiv. Ve světlém režimu tedy chyba vždy přišla jako černá
 *    obrazovka. Teď se drží motivu jako zbytek aplikace.
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
      const detail = this.state.error?.message?.trim();

      return (
        <div
          role="alert"
          className="min-h-[100dvh] w-full flex flex-col items-center justify-center gap-4 bg-white px-4 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center dark:bg-rose-500/10 dark:border-rose-500/30">
            <AlertTriangle className="w-7 h-7 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Tuhle část aplikace se nepodařilo zobrazit
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Jde o chybu v aplikaci, ne o vaše připojení. Uložený postup ani data v prohlížeči se
              tím nemažou. Zkuste obrazovku načíst znovu — pokud se chyba vrací, nahlaste ji prosím
              přes tlačítko zpětné vazby.
            </p>
            {detail && (
              <p className="pt-1 font-mono text-[11px] break-words text-slate-400 dark:text-slate-500">
                {detail}
              </p>
            )}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-bold text-sm transition-all cursor-pointer dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
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
