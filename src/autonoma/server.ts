import http from 'node:http';
import { autonomaNodeHandler } from './handler';

const PORT = parseInt(process.env.AUTONOMA_PORT || '3000', 10);

export function startAutonomaServer(port = PORT): http.Server {
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
      await autonomaNodeHandler(req, res);
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
