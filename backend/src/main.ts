import { createServer } from 'node:http';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { pool } from './database/pool.js';

const server = createServer(await createApp());
server.listen(config.port, '0.0.0.0', () => console.log(JSON.stringify({ level: 'info', message: 'Backend Quest API listening', port: config.port })));

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(JSON.stringify({ level: 'info', message: 'Shutdown started', signal }));
  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();
  server.close(async error => {
    if (error) console.error(JSON.stringify({ level: 'error', message: 'HTTP shutdown error', error: error.message }));
    await pool.end();
    clearTimeout(forceExit);
    process.exit(error ? 1 : 0);
  });
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
