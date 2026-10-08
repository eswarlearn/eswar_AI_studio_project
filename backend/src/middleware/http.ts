import { createHash, randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { findPlayerByToken } from '../database/repository.js';

declare global {
  namespace Express { interface Request { requestId: string; playerId?: string } }
}

const requestCounts = new Map<string, number>();
let requestDurationCount = 0;
let requestDurationSeconds = 0;

export function metricsText(poolState: { totalCount: number; idleCount: number; waitingCount: number }): string {
  const lines = [
    '# HELP backendquest_http_requests_total Completed HTTP requests.',
    '# TYPE backendquest_http_requests_total counter'
  ];
  for (const [key, count] of requestCounts) {
    const [method, status] = key.split('|');
    lines.push('backendquest_http_requests_total{method=\"' + method + '\",status=\"' + status + '\"} ' + count);
  }
  lines.push('# HELP backendquest_http_request_duration_seconds_sum Sum of completed HTTP request durations in seconds.');
  lines.push('# TYPE backendquest_http_request_duration_seconds_sum counter');
  lines.push('backendquest_http_request_duration_seconds_sum ' + requestDurationSeconds.toFixed(6));
  lines.push('# HELP backendquest_http_request_duration_seconds_count Number of completed HTTP requests.');
  lines.push('# TYPE backendquest_http_request_duration_seconds_count counter');
  lines.push('backendquest_http_request_duration_seconds_count ' + requestDurationCount);
  lines.push('# HELP backendquest_postgres_pool_connections Current PostgreSQL pool connection counts.');
  lines.push('# TYPE backendquest_postgres_pool_connections gauge');
  lines.push('backendquest_postgres_pool_connections{state=\"total\"} ' + poolState.totalCount);
  lines.push('backendquest_postgres_pool_connections{state=\"idle\"} ' + poolState.idleCount);
  lines.push('backendquest_postgres_pool_connections{state=\"waiting\"} ' + poolState.waitingCount);
  return lines.join('\n') + '\n';
}

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  req.requestId = randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  const started = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - started;
    const key = req.method + '|' + res.statusCode;
    requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1);
    requestDurationCount++;
    requestDurationSeconds += durationMs / 1000;
    console.log(JSON.stringify({ level: 'info', requestId: req.requestId, method: req.method, path: req.path, status: res.statusCode, durationMs }));
  });
  next();
}

export function rateLimit() {
  const counts = new Map<string, { count: number; reset: number }>();
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = req.ip ?? 'unknown';
    const current = counts.get(key);
    if (!current || current.reset < now) counts.set(key, { count: 1, reset: now + 60_000 });
    else current.count++;
    if ((counts.get(key)?.count ?? 0) > 240) {
      res.status(429).json({ success: false, data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests' }, requestId: req.requestId });
      return;
    }
    if (counts.size > 5000) for (const [entry, value] of counts) if (value.reset < now) counts.delete(entry);
    next();
  };
}

export async function requireGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authorization = req.header('authorization') ?? '';
  const match = /^Bearer ([A-Za-z0-9_-]{40,100})$/.exec(authorization);
  if (!match) {
    res.status(401).json({ success: false, data: null, error: { code: 'AUTH_REQUIRED', message: 'A guest token is required' }, requestId: req.requestId });
    return;
  }
  try {
    const hash = createHash('sha256').update(match[1]).digest();
    const playerId = await findPlayerByToken(hash);
    if (!playerId) {
      res.status(401).json({ success: false, data: null, error: { code: 'INVALID_GUEST_TOKEN', message: 'Guest token is not valid' }, requestId: req.requestId });
      return;
    }
    req.playerId = playerId;
    next();
  } catch (error) {
    next(error);
  }
}
