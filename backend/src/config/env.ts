import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function integer(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return parsed;
}

export const config = {
  port: integer('PORT', 8080, 1, 65535),
  databaseUrl: required('DATABASE_URL'),
  databasePoolMax: integer('DATABASE_POOL_MAX', 20, 1, 100),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map(v => v.trim()).filter(Boolean),
  frontendDist: process.env.FRONTEND_DIST ?? 'dist',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  isProduction: process.env.NODE_ENV === 'production'
};
