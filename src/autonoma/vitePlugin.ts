import type { Plugin } from 'vite';
import { autonomaNodeHandler } from './handler';

export function autonomaVitePlugin(): Plugin {
  return {
    name: 'autonoma-sdk-plugin',
    configureServer(server) {
      server.middlewares.use('/api/autonoma', (req, res, next) => {
        if (req.method === 'POST') {
          autonomaNodeHandler(req, res).catch((err: unknown) => {
            console.error('[Autonoma] Middleware error:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Internal server error' }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}
