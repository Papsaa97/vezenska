import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import pkg from './package.json';
import { handleEsbirkaProxy } from './src/utils/esbirka/proxy';

/**
 * Identifikátor buildu. Mění se s každým nasazením a používá se jako klíč
 * mezipaměti Service Workeru (viz src/registerServiceWorker.ts a public/sw.js).
 *
 * PROČ NE package.json "version": to je natrvalo "0.0.0" a nikdo ho nezvyšuje,
 * takže by se klíč nikdy nezměnil a stará mezipaměť by uživateli zůstala napořád.
 *
 * Na Vercelu se vezme hash commitu — dvě nasazení téhož commitu tak dostanou
 * stejný klíč (stejný obsah = žádné zbytečné zneplatnění) a z klíče je poznat,
 * na jaké verzi uživatel běží. Mimo Vercel (lokální build, jiný hosting) se
 * použije čas buildu, který se také mění s každým během.
 */
function resolveBuildId(): string {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA;
  if (commit) return `${pkg.version}-${commit.slice(0, 12)}`;
  return `${pkg.version}-${Date.now().toString(36)}`;
}

/**
 * Vývojová obdoba serverless funkce `api/esbirka.ts`.
 *
 * Bez ní by most k e-Sbírce fungoval jen na nasazeném Vercelu a při `npm run dev`
 * by ověřování znění hlásilo nedostupnost. Obsluha je sdílená, takže se vývoj
 * a produkce nemohou rozejít.
 */
function esbirkaDevProxy(): Plugin {
  return {
    name: 'esbirka-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/esbirka', (req, res) => {
        const parsed = new URL(req.url || '/', 'http://localhost');
        handleEsbirkaProxy(parsed.searchParams)
          .then((result) => {
            res.statusCode = result.status;
            res.setHeader('Content-Type', result.contentType);
            res.setHeader('Cache-Control', result.cacheControl);
            res.end(result.body);
          })
          .catch((error: Error) => {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ chyba: error.message }));
          });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), esbirkaDevProxy()],
    define: {
      // POZOR: define NEPLATÍ pro soubory v public/ — ty se kopírují beze změny.
      // Service Worker proto verzi nedostane odsud, ale z query stringu vlastní
      // registrační URL (/sw.js?v=…), kterou nastavuje registerServiceWorker.ts.
      '__BUILD_ID__': JSON.stringify(resolveBuildId()),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/src/data/regulations/')) {
              return 'data-regulations';
            }
            if (id.includes('/src/data/fullLawTexts/')) {
              return 'data-regulations';
            }
            if (id.includes('/src/data/questions/')) {
              return 'data-questions';
            }
            if (id.includes('node_modules')) {
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('scheduler') ||
                id.includes('motion') ||
                id.includes('framer-motion')
              ) {
                return 'vendor-framework';
              }
              if (id.includes('recharts') || id.includes('d3-')) {
                return 'vendor-charts';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('@google/genai')) {
                return 'vendor-genai';
              }
              if (id.includes('@dnd-kit')) {
                return 'vendor-dnd';
              }
            }
          },
        },
      },
      // Vendor chunky (recharts, genai, supabase) jsou legitimně velké — nemá smysl hlásit warning
      chunkSizeWarningLimit: 1500,
    },
  };
});
