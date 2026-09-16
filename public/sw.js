// Verzi si worker bere z query stringu vlastní adresy (/sw.js?v=…), kterou nastavuje
// src/registerServiceWorker.ts.
//
// PROČ NE Vite `define`: soubory v public/ se do buildu kopírují beze změny, žádné
// `define` se na ně nevztahuje. Zápis `__APP_VERSION__` tu dřív zůstával doslovně,
// takže verze byla natrvalo 'dev', název mezipaměti se nikdy nezměnil a úklid staré
// mezipaměti v události activate neměl co mazat — uživatel dostával starou verzi
// aplikace i po nasazení oprav.
const CACHE_PREFIX = 'vscr-akademie-';
const _version = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE_NAME = `${CACHE_PREFIX}${_version}`;

/**
 * Mezipaměť úplných znění předpisů z e-Sbírky — ZÁMĚRNĚ BEZ VERZE BUILDU.
 *
 * Soubory v /data/esbirka/ nejsou kód aplikace. Mění je jen `npm run sync:laws`,
 * tedy novela zákona, ne nasazení opravy tlačítka. Dokud ležely v mezipaměti
 * pojmenované podle verze buildu, mazala je událost `activate` při každém
 * nasazení: uživateli, který si v Právním kompasu stáhl 1,5 MB zákonů pro
 * cestu bez signálu, zmizely znění pod rukama a hlášení „Uloženo offline
 * (datum)“ dál tvrdilo, že je má — přitom se čtení offline rozpadlo.
 *
 * Verze v názvu (`-v1`) se zvedá jen při změně formátu ukládání, ne při
 * nasazení aplikace.
 */
const SNAPSHOT_CACHE_NAME = 'vscr-esbirka-v1';

/** Cesta, pod kterou leží stažená znění (viz src/utils/esbirka/snapshot.ts). */
const SNAPSHOT_PATH_PREFIX = '/data/esbirka/';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png'
];

/**
 * Smí se odpověď uložit do mezipaměti?
 *
 * Kromě stavu odpovědi odfiltruje HTML vrácené na požadavek, který HTML nečekal.
 * vercel.json přepisuje všechny neznámé cesty na /index.html, takže požadavek na
 * chunk smazané verze nevrátí 404, ale HTML se stavem 200. Uložit ho pod adresou
 * skriptu by mezipaměť otrávilo natrvalo — stránka by místo JavaScriptu dostávala
 * "<" a padala by dál i po nasazení opravy.
 */
function isCacheable(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic') return false;
  if (request.mode === 'navigate') return true;
  const contentType = response.headers.get('Content-Type') || '';
  return !contentType.includes('text/html');
}

/**
 * Předuloží základ aplikace pro offline režim.
 *
 * Každý soubor se řeší zvlášť: cache.addAll() zruší celou instalaci, když selže
 * jediný požadavek. Instalace teď probíhá při každém nasazení, takže jedna
 * nedostupná ikona nesmí uživateli zablokovat doručení nové verze — co se
 * nepředuloží, doplní se při prvním použití (viz fetch handler).
 */
async function precacheCoreAssets() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    CORE_ASSETS.map(async (asset) => {
      try {
        // cache: 'reload' obchází HTTP mezipaměť prohlížeče. Bez toho by si nová
        // verze mohla předuložit index.html té staré.
        const response = await fetch(new Request(asset, { cache: 'reload' }));
        if (response && response.status === 200) {
          await cache.put(asset, response);
        }
      } catch (error) {
        // Bez připojení nebo při chybě serveru se soubor prostě nepředuloží.
      }
    })
  );
}

// 1. Install event: Precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    precacheCoreAssets().then(() => {
      // První instalace (žádný předchozí worker) → převzít řízení hned, aby offline
      // režim fungoval bez obnovení stránky.
      //
      // AKTUALIZACE → počkat. Běžící stránka má načtené soubory staré verze a
      // aktivace nového workera je z mezipaměti smaže; při samovolném převzetí by
      // si stránka nedosáhla na vlastní chunky a rozpadla se uprostřed práce.
      // Worker proto zůstane ve stavu waiting, dokud uživatel aktualizaci
      // nepotvrdí — viz zpráva SKIP_WAITING níže.
      if (!self.registration.active) {
        return self.skipWaiting();
      }
      return undefined;
    })
  );
});

// 2. Activate event: Clean up old caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          // Mazat jen vlastní mezipaměti kódu aplikace, ne cizí na téže doméně
          // a ne stažená znění předpisů (SNAPSHOT_CACHE_NAME prefix nesdílí,
          // podmínka je tu pro čitelnost záměru).
          .filter(
            (name) =>
              name.startsWith(CACHE_PREFIX) &&
              name !== CACHE_NAME &&
              name !== SNAPSHOT_CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Fetch event: Stale-While-Revalidate for local static assets, Network-Only for APIs
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests and http/https schemes
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // NEVER intercept or cache external requests, API calls or Supabase endpoints
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co')
  ) {
    return;
  }

  // Úplná znění předpisů → vlastní neverzovaná mezipaměť, cache-first.
  //
  // Cache-first (a ne stale-while-revalidate jako u ostatních souborů) proto,
  // že jde o stovky kilobajtů na jeden předpis. Stahovat je na pozadí při
  // každém otevření zákona by na mobilních datech bylo bezohledné a novější
  // znění se přinese až nasazení s novým `sync:laws` — o tom, že se změnilo,
  // aplikace ví z manifestu, ne z mezipaměti.
  if (url.pathname.startsWith(SNAPSHOT_PATH_PREFIX)) {
    event.respondWith(
      caches.open(SNAPSHOT_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          // Znění je JSON; kontrola typu brání uložení index.html, které
          // vrací vercel.json na neznámou cestu (viz isCacheable).
          if (response && response.status === 200 && response.type === 'basic') {
            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.includes('json')) {
              await cache.put(request, response.clone());
            }
          }
          return response;
        } catch (error) {
          return new Response(
            JSON.stringify({ chyba: 'Znění není stažené a zařízení je bez připojení.' }),
            { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
          );
        }
      })
    );
    return;
  }

  // Navigation requests (HTML SPA fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isCacheable(request, response)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const indexFallback = await caches.match('/index.html');
          if (indexFallback) return indexFallback;
          const rootFallback = await caches.match('/');
          if (rootFallback) return rootFallback;
          return new Response('Jste v offline režimu. Připojte se k internetu nebo obnovte aplikaci.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // Static assets (JS, CSS, SVGs, Fonts, Images)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if found, while updating cache in background (Stale-While-Revalidate)
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (isCacheable(request, networkResponse)) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails, cachedResponse will be returned, or fallback 503 response
          return cachedResponse || new Response('', { status: 503, statusText: 'Service Unavailable' });
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
