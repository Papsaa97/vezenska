import type { HandlerConfig } from '@autonoma-ai/sdk';
import { createNodeHandler } from '@autonoma-ai/server-node';
import { factories } from './factories';
import { getTestRunnerCredentials } from './client';
import { requireEnv } from './env';

/**
 * Složí konfiguraci Autonoma handleru z proměnných prostředí.
 *
 * Volá se líně — všechna tajemství se čtou teprve při prvním požadavku, takže
 * import tohoto modulu (a tím i vite.config.ts) nikdy nespadne na chybějící
 * konfiguraci. Žádná hodnota nemá záložní default; chybí-li proměnná,
 * requireEnv vyhodí výjimku a handler vrátí chybu místo toho, aby běžel
 * s tajemstvím zapsaným v repozitáři.
 */
export function createAutonomaConfig(): HandlerConfig {
  return {
    scopeField: 'id',
    sharedSecret: requireEnv('AUTONOMA_SHARED_SECRET'),
    signingSecret: requireEnv('AUTONOMA_SIGNING_SECRET'),
    factories,
    auth: async (_user, _ctx) => ({
      credentials: getTestRunnerCredentials(),
    }),
  };
}

type NodeHandler = ReturnType<typeof createNodeHandler>;

let cachedHandler: NodeHandler | null = null;

/** Vrátí (a zapamatuje si) Node handler. První volání přečte konfiguraci z prostředí. */
export function getAutonomaNodeHandler(): NodeHandler {
  if (!cachedHandler) {
    cachedHandler = createNodeHandler(createAutonomaConfig());
  }
  return cachedHandler;
}
