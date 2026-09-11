import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, PlusSquare, Zap, WifiOff, Maximize2, Smartphone } from 'lucide-react';

const STORAGE_KEY_FIRST_VISIT_SEEN = 'vscr_pwa_first_visit_seen';
const STORAGE_KEY_DISMISSED = 'vscr_pwa_dismissed';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const matchesDisplayMode = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return matchesDisplayMode || iosStandalone;
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || isIPadOS;
}

function safeGetFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function safeSetFlag(key: string): void {
  try {
    localStorage.setItem(key, 'true');
  } catch {
    // localStorage can be unavailable (private mode, quota) — ignore, non-critical.
  }
}

export default function PWAInstallPrompt() {
  const [isStandalone] = useState<boolean>(isRunningStandalone);
  const [isIOS] = useState<boolean>(detectIOS);
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hasSeenPrompt, setHasSeenPrompt] = useState<boolean>(
    () => safeGetFlag(STORAGE_KEY_FIRST_VISIT_SEEN) || safeGetFlag(STORAGE_KEY_DISMISSED)
  );
  const [readyToShow, setReadyToShow] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowIOSGuide(false);
      safeSetFlag(STORAGE_KEY_FIRST_VISIT_SEEN);
      safeSetFlag(STORAGE_KEY_DISMISSED);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  useEffect(() => {
    if (isStandalone || installed) return;
    const timer = setTimeout(() => setReadyToShow(true), 2500);
    return () => clearTimeout(timer);
  }, [isStandalone, installed]);

  const markSeen = useCallback(() => {
    safeSetFlag(STORAGE_KEY_FIRST_VISIT_SEEN);
    setHasSeenPrompt(true);
  }, []);

  const dismiss = useCallback(() => {
    safeSetFlag(STORAGE_KEY_DISMISSED);
    markSeen();
    setShowIOSGuide(false);
  }, [markSeen]);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } catch {
        // Prompt can reject if dismissed via browser UI edge cases — ignore, we still clean up below.
      }
      setDeferredPrompt(null);
      markSeen();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  }, [deferredPrompt, isIOS, markSeen]);

  if (isStandalone || installed) return null;

  const canInstall = !!deferredPrompt || isIOS;
  if (!canInstall) return null;

  const showFirstVisitModal = readyToShow && !hasSeenPrompt && !showIOSGuide;
  const showFab = hasSeenPrompt && !showIOSGuide;

  return (
    <>
      {/* First-visit modal */}
      <AnimatePresence>
        {showFirstVisitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white dark:bg-slate-900 shadow-2xl shadow-black/40 overflow-hidden"
            >
              <button
                onClick={dismiss}
                aria-label="Zavřít"
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="px-6 pt-8 pb-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/10 mb-4">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h2 id="pwa-install-title" className="text-lg font-black text-slate-900 dark:text-white">
                  Nainstalujte si Akademii VS ČR
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  Přidejte aplikaci na plochu a získejte plnohodnotný zážitek.
                </p>

                <ul className="mt-5 space-y-2.5 text-left">
                  <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <span className="shrink-0 w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                    Celoobrazovkový režim bez adresního řádku a lišt
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <span className="shrink-0 w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Zap className="w-4 h-4" />
                    </span>
                    Okamžité a rychlejší načítání aplikace
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <span className="shrink-0 w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <WifiOff className="w-4 h-4" />
                    </span>
                    Plný přístup ke studiu i bez připojení k internetu
                  </li>
                </ul>

                {isIOS && !deferredPrompt ? (
                  <div className="mt-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 p-4 text-left">
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">Jak nainstalovat na iPhone/iPad:</p>
                    <ol className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                        Klepněte na ikonu <Share className="w-3.5 h-3.5 inline mx-0.5" strokeWidth={2.5} /> <strong>Sdílet</strong> v liště Safari
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                        Vyberte <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" strokeWidth={2.5} /> <strong>Přidat na plochu</strong>
                      </li>
                    </ol>
                    <button
                      onClick={dismiss}
                      className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-500/25 active:scale-[0.98] transition-transform"
                    >
                      Rozumím
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Nainstalovat do zařízení
                    </button>
                    <button
                      onClick={dismiss}
                      className="w-full py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold text-xs transition-colors"
                    >
                      Později
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS instructions modal, reachable from the corner FAB */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xs rounded-3xl border border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-5"
            >
              <button
                onClick={() => setShowIOSGuide(false)}
                aria-label="Zavřít"
                className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm font-black text-slate-900 dark:text-white mb-3 pr-6">Instalace na iPhone/iPad</p>
              <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                  Klepněte na ikonu <Share className="w-3.5 h-3.5 inline mx-0.5" strokeWidth={2.5} /> <strong>Sdílet</strong> v liště Safari
                </li>
                <li className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                  Vyberte <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" strokeWidth={2.5} /> <strong>Přidat na plochu</strong>
                </li>
              </ol>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner floating install pill — subsequent visits */}
      <AnimatePresence>
        {showFab && (
          <motion.button
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleInstallClick}
            aria-label="Instalovat aplikaci"
            title="Instalovat aplikaci"
            className="group fixed bottom-20 md:bottom-6 right-4 z-40 no-print flex items-center gap-2 rounded-full bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-lg shadow-black/20 border border-white/10 dark:border-slate-900/10 backdrop-blur-xl pl-3 pr-3 py-3 md:pr-4 hover:shadow-xl transition-shadow"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold opacity-0 group-hover:max-w-[10rem] group-hover:opacity-100 group-focus-visible:max-w-[10rem] group-focus-visible:opacity-100 transition-all duration-300">
              Instalovat aplikaci
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
