import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { autonomaVitePlugin } from './src/autonoma/vitePlugin';
import pkg from './package.json';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), autonomaVitePlugin()],
    define: {
      // Injektováno do sw.js i do aplikace — umožňuje dynamický cache name v Service Workeru
      '__APP_VERSION__': JSON.stringify(pkg.version),
      '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
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
