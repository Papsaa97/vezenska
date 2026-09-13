import http from 'node:http';
import { getAutonomaNodeHandler } from './handler';
import { isAutonomaEnabled, missingAutonomaEnv } from './env';

const PORT = parseInt(process.env.AUTONOMA_PORT || '3000', 10);

export function startAutonomaServer(port = PORT): http.Server {
  if (!isAutonomaEnabled()) {
    throw new Error(
      '[Autonoma] Server se nespustil. Nastav AUTONOMA_ENABLED=true a chybějící proměnné: ' +
        (missingAutonomaEnv().join(', ') || '(žádné)')
    );
  }

  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === '/api/autonoma' || req.url === '/api/autonoma/') {
      await getAutonomaNodeHandler()(req, res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(port, () => {
    console.log(`[Autonoma] Server running at http://localhost:${port}/api/autonoma`);
  });

  return server;
}

if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  startAutonomaServer();
}
