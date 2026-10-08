import pg from 'pg';
import { config } from '../config/env.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: config.databasePoolMax,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined
});

pool.on('error', error => {
  console.error(JSON.stringify({ level: 'error', message: 'Idle PostgreSQL client error', error: error.message }));
});
