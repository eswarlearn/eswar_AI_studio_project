import { migrate } from './database/migrate.js';
import { pool } from './database/pool.js';

try {
  await migrate();
  console.log('Database migrations are up to date.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
