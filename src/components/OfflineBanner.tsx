import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2, CloudOff, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNetworkStatus } from '../registerServiceWorker';

export default function OfflineBanner() {
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
            className="bg-amber-600 dark:bg-amber-700 text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-between shadow-md z-50 border-b border-amber-500/50"
          >
            <div className="flex items-center gap-2 mx-auto max-w-7xl">
              <WifiOff className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />
              <span>
                <strong>Offline režim aktivní:</strong> Aplikace je plně dostupná offline (všechny předpisy, paragrafy, testy i kartičky jsou uloženy v zařízení).
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
