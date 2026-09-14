import { useState, useEffect, useSyncExternalStore } from 'react';

/**
 * URL Service Workeru včetně verze buildu.
 *
 * Verze se předává v query stringu záměrně. Soubor public/sw.js neprochází
 * překladem (Vite `define` se na public/ nevztahuje), takže si verzi do sebe
 * vložit nemůže — přečte si ji z vlastní adresy přes `self.location`.
 *
 * Změna adresy má i druhý, podstatnější účinek: prohlížeč porovnává skript
 * workeru bajt po bajtu. Obsah public/sw.js je mezi nasazeními stejný, takže
 * bez měnící se adresy by prohlížeč nikdy nezjistil, že má instalovat nový
 * worker — a stará mezipaměť by uživateli zůstala i po nasazení oprav.
 */
const SW_URL = `/sw.js?v=${encodeURIComponent(__BUILD_ID__)}`;

/** Jak často se u běžící aplikace ptáme serveru, jestli nevyšla nová verze. */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/** Nejkratší odstup mezi kontrolami vyvolanými návratem do aplikace. */
const UPDATE_CHECK_THROTTLE_MS = 15 * 60 * 1000;

/** Pojistka pro případ, že by nový worker po SKIP_WAITING řízení nepřevzal. */
const CONTROLLER_CHANGE_TIMEOUT_MS = 5000;

// ─── Stav čekající aktualizace ────────────────────────────────────────────────
//
// registerServiceWorker() běží ještě před vykreslením Reactu, takže si čekajícího
// workera drží modul a komponenty se na něj přihlašují přes useServiceWorkerUpdate().

let waitingWorker: ServiceWorker | null = null;
const waitingListeners = new Set<() => void>();

function setWaitingWorker(worker: ServiceWorker | null): void {
  if (waitingWorker === worker) return;
  waitingWorker = worker;
  waitingListeners.forEach((notify) => notify());
}

function subscribeToWaitingWorker(notify: () => void): () => void {
  waitingListeners.add(notify);
  return () => {
    waitingListeners.delete(notify);
  };
}

function hasWaitingUpdate(): boolean {
  return waitingWorker !== null;
}

/**
 * Sleduje instalující se workera a ohlásí ho, jakmile dokončí instalaci.
 *
 * Podmínka `navigator.serviceWorker.controller` odlišuje aktualizaci od první
 * instalace: bez controlleru jde o první návštěvu, kde se nic nabízet nemá —
 * aplikace se jen uložila pro offline použití.
 */
function trackInstallingWorker(worker: ServiceWorker | null): void {
  if (!worker) return;
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      setWaitingWorker(worker);
    }
  });
}

let reloading = false;

function reloadOnce(): void {
  if (reloading) return;
  reloading = true;
  window.location.reload();
}

/**
 * Převezme čekající aktualizaci: požádá nového workera, ať nečeká, a po předání
 * řízení stránku obnoví.
 *
 * Obnovení je nutné — nový worker po aktivaci smaže mezipaměť staré verze, takže
 * běžící stránka by si od té chvíle nedokázala došáhnout na své vlastní chunky.
 */
export function applyServiceWorkerUpdate(): void {
  const worker = waitingWorker;
  if (!worker) {
    reloadOnce();
    return;
  }

  navigator.serviceWorker.addEventListener('controllerchange', reloadOnce, { once: true });
  worker.postMessage({ type: 'SKIP_WAITING' });

  // Kdyby se zpráva ztratila, tlačítko nesmí zůstat bez reakce. Obnovení stránky
  // je bezpečné i tak: nanejvýš se znovu načte stará verze a nabídka se objeví.
  window.setTimeout(reloadOnce, CONTROLLER_CHANGE_TIMEOUT_MS);
}

let registrationStarted = false;

/**
 * Registruje Service Worker pro offline režim PWA.
 *
 * Opakované volání nic nedělá — jinak by přibývaly další intervaly kontroly
 * aktualizací a posluchači událostí.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (registrationStarted) return;
  registrationStarted = true;

  const start = () => {
    navigator.serviceWorker
      .register(SW_URL)
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.debug('[PWA] Service Worker zaregistrován:', registration.scope, __BUILD_ID__);
        }

        // Nová verze mohla instalaci dokončit dřív, než se rozběhl React.
        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
        }
        trackInstallingWorker(registration.installing);

        registration.addEventListener('updatefound', () => {
          trackInstallingWorker(registration.installing);
        });

        // Prohlížeč hlídá nové verze hlavně při navigaci. Nainstalovaná PWA ale
        // může běžet dny bez jediné navigace, takže se ptáme i sami.
        let lastCheck = Date.now();
        const checkForUpdate = () => {
          lastCheck = Date.now();
          registration.update().catch(() => {
            // Bez připojení kontrola selže; není co hlásit, zkusí se zas příště.
          });
        };

        window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState !== 'visible') return;
          if (Date.now() - lastCheck < UPDATE_CHECK_THROTTLE_MS) return;
          checkForUpdate();
        });
      })
      .catch((error) => {
        console.error('[PWA] Chyba při registraci Service Workeru:', error);
      });
  };

  // Registrace počká na dokončené načtení stránky, ale pokud už proběhlo,
  // událost load se znovu nespustí a čekat na ni by znamenalo neregistrovat vůbec.
  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start, { once: true });
  }
}

/**
 * Hlásí, že je připravená nová verze aplikace a čeká na potvrzení uživatelem.
 *
 * Nasazení se uživateli nevnucuje: nový worker zůstává ve stavu `waiting`,
 * dokud nepotvrdí. Kdyby převzal řízení sám, běžící stránce by pod rukama
 * zmizely soubory staré verze.
 */
export function useServiceWorkerUpdate(): { updateReady: boolean; applyUpdate: () => void } {
  const updateReady = useSyncExternalStore(
    subscribeToWaitingWorker,
    hasWaitingUpdate,
    () => false
  );

  return { updateReady, applyUpdate: applyServiceWorkerUpdate };
}

/**
 * React hook to track online / offline network connectivity state.
 */
export function useNetworkStatus(): { isOnline: boolean; wasOffline: boolean } {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
  });
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
