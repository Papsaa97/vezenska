import React, { useState } from 'react';
import { AlertTriangle, Home, MessageSquareWarning, RefreshCw } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useAuth } from '../context/AuthContext';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /**
   * `app` — poslední záchrana kolem celé aplikace. `view` — jedna záložka;
   * hlavička, navigace i tlačítko zpětné vazby nad ní zůstanou funkční.
   */
  scope?: 'app' | 'view';
  /** Jen pro `view`: přechod na záložku, která s chybou nesouvisí. */
  onLeave?: () => void;
  /** Název obrazovky, který se přiloží k hlášení chyby. */
  screenLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/** Klíč, pod kterým si App pamatuje otevřenou záložku (viz getInitialTab). */
const ACTIVE_TAB_KEY = 'vscr_active_tab';

/**
 * Obnoví stránku tak, aby se otevřela nástěnka, ne záložka, která spadla.
 *
 * Záložka se pamatuje v adrese (#statistics) i v localStorage. Prosté
 * `location.reload()` proto otevřelo znovu tutéž záložku, ta spadla znovu
 * a uživatel obnovoval pořád dokola bez možnosti odejít — přesně to se stalo
 * se Statistikami.
 */
function reloadToDashboard(): void {
  try {
    localStorage.removeItem(ACTIVE_TAB_KEY);
  } catch {
    // Bez přístupu k úložišti stačí vyčistit adresu.
  }
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  window.location.reload();
}

/**
 * Tlačítko „Nahlásit chybu“ přímo na chybové obrazovce.
 *
 * Text chyby dřív radil „nahlaste ji přes tlačítko zpětné vazby“ — jenže to
 * tlačítko leželo v hlavičce, kterou pád aplikace smazal spolu se vším
 * ostatním. Hlášení teď s sebou nese i text chyby, takže se nemusí opisovat.
 */
function ReportErrorButton({ context }: { context: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // Zpětnou vazbu smí odeslat jen přihlášený uživatel (politika INSERT).
  if (!user) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold text-sm transition-all cursor-pointer dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <MessageSquareWarning className="w-4 h-4" />
        Nahlásit chybu
      </button>
      {open && <FeedbackModal onClose={() => setOpen(false)} screenContext={context} />}
    </>
  );
}

/**
 * Zachytává neočekávané chyby v podstromu, aby aplikace nespadla na prázdnou
 * bílou obrazovku, ale nabídla srozumitelný fallback.
 *
 * TŘI VĚCI, KTERÉ TU BYLY ŠPATNĚ:
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
 *
 * 3. Jediná hranice obalovala celou aplikaci, takže pád jedné záložky smazal
 *    i hlavičku a navigaci. Záložky mají teď vlastní hranici (`scope="view"`)
 *    a celoaplikační zůstává jen jako poslední záchrana.
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
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { scope = 'app', onLeave, screenLabel } = this.props;
    const isView = scope === 'view';
    const detail = this.state.error?.message?.trim();
    const reportContext = `${screenLabel ?? 'Aplikace'} — chyba: ${detail || 'neznámá'}`;

    return (
      <div
        role="alert"
        className={`w-full flex flex-col items-center justify-center gap-4 px-4 text-center text-slate-900 dark:text-slate-100 ${
          isView ? 'flex-1 py-16' : 'min-h-[100dvh] bg-white dark:bg-slate-950'
        }`}
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
            tím nemažou. Zkuste to znovu, případně {isView ? 'přejděte na jinou záložku' : 'otevřete nástěnku'}.
            Pokud se chyba vrací, nahlaste ji prosím — text chyby se k hlášení přiloží sám.
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
            onClick={isView && onLeave ? onLeave : reloadToDashboard}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-bold text-sm transition-all cursor-pointer dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <Home className="w-4 h-4" />
            {isView && onLeave ? 'Přejít na nástěnku' : 'Otevřít nástěnku'}
          </button>
          <ReportErrorButton context={reportContext} />
        </div>
      </div>
    );
  }
}
