import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const migrations = [
  { version: 1, name: '001_initial_schema.sql', file: '001_initial_schema.sql' },
  { version: 2, name: '002_user_auth.sql', file: '002_user_auth.sql' }
];

export async function migrate(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [821943070]);
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version BIGINT PRIMARY KEY, name TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    for (const migration of migrations) {
      const done = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', [migration.version]);
      if (done.rowCount) continue;
      const filename = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../migrations', migration.file);
      const sql = await readFile(filename, 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations(version, name) VALUES ($1, $2)', [migration.version, migration.name]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    try { await client.query('SELECT pg_advisory_unlock($1)', [821943070]); } catch { /* connection may already be unhealthy */ }
    client.release();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  migrate().then(() => pool.end()).catch(async error => {
    console.error(JSON.stringify({ level: 'error', message: 'Migration failed', error: error.message }));
    await pool.end();
    process.exitCode = 1;
  });
}
