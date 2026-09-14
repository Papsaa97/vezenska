import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2, CloudOff, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNetworkStatus } from '../registerServiceWorker';

interface OfflineBannerProps {
  /** Počet dokončených testů čekajících ve frontě na odeslání (viz utils/quizResultQueue). */
  pendingResultCount?: number;
}

export default function OfflineBanner({ pendingResultCount = 0 }: OfflineBannerProps) {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowOnlineToast(true);
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <>
      {/* Offline Mode Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="alert"
            aria-live="assertive"
            className="bg-amber-600 dark:bg-amber-700 text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-between shadow-md z-50 border-b border-amber-500/50"
          >
            <div className="flex items-center gap-2 mx-auto max-w-7xl">
              <WifiOff className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />
              <span>
                <strong>Offline režim aktivní:</strong> Studijní obsah (předpisy, paragrafy, testy i kartičky) máte uložený v zařízení a funguje dál.
                {pendingResultCount > 0
                  ? ` Dokončené testy (${pendingResultCount}) se uloží do vašeho účtu, jakmile se připojíte — nezavírejte prosím aplikaci.`
                  : ' Dokončené testy se do vašeho účtu uloží po obnovení připojení.'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Čekající výsledky testů — i online, pokud se odeslání nedaří (Z-16) */}
      <AnimatePresence>
        {isOnline && pendingResultCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="status"
            aria-live="polite"
            className="bg-sky-700 dark:bg-sky-800 text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-between shadow-md z-50 border-b border-sky-500/50"
          >
            <div className="flex items-center gap-2 mx-auto max-w-7xl">
              <CloudOff className="w-4 h-4 shrink-0 text-sky-200" />
              <span>
                <strong>Čeká na uložení:</strong>{' '}
                {pendingResultCount === 1
                  ? '1 dokončený test se zatím nepodařilo uložit do vašeho účtu. Zkusíme to znovu automaticky.'
                  : `${pendingResultCount} dokončených testů se zatím nepodařilo uložit do vašeho účtu. Zkusíme to znovu automaticky.`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Restored Toast */}
      <AnimatePresence>
        {showOnlineToast && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            role="status"
            aria-live="polite"
            className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold border border-emerald-500"
          >
            <Wifi className="w-4 h-4 text-emerald-200" />
            <span>Připojení k internetu obnoveno</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
