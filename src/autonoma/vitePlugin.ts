import type { Plugin } from 'vite';
import { getAutonomaNodeHandler } from './handler';
import { isAutonomaEnabled, missingAutonomaEnv, readEnv } from './env';

/**
 * Namountuje Autonoma testovací endpoint na /api/autonoma — ale jen ve vývojovém
 * serveru a jen tehdy, je-li integrace výslovně zapnutá přes AUTONOMA_ENABLED=true
 * a plně nakonfigurovaná z prostředí.
 *
 * Endpoint zakládá a maže reálné řádky v Supabase, takže musí být vypnutý, dokud
 * ho někdo vědomě nezapne. Dřív se mountoval vždy a tajemství si bral z natvrdo
 * zapsaných hodnot v repozitáři.
 */
export function autonomaVitePlugin(): Plugin {
  return {
    name: 'autonoma-sdk-plugin',
    configureServer(server) {
      if (!isAutonomaEnabled()) {
        if (readEnv('AUTONOMA_ENABLED') === 'true') {
          server.config.logger.warn(
            `[Autonoma] AUTONOMA_ENABLED=true, ale chybí: ${missingAutonomaEnv().join(', ')}. ` +
              'Endpoint /api/autonoma nebyl namountován.'
          );
        }
        return;
      }

      server.config.logger.info('[Autonoma] Testovací endpoint namountován na /api/autonoma');

      server.middlewares.use('/api/autonoma', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        let handler: ReturnType<typeof getAutonomaNodeHandler>;
        try {
          handler = getAutonomaNodeHandler();
        } catch (err: unknown) {
          console.error('[Autonoma] Konfigurace selhala:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Autonoma integration is not configured' }));
          return;
        }

        handler(req, res).catch((err: unknown) => {
          console.error('[Autonoma] Middleware error:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      });
    },
  };
}
