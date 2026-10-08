import { randomBytes, createHash, randomUUID } from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import path from 'node:path';
import { config } from './config/env.js';
import { pool } from './database/pool.js';
import { migrate } from './database/migrate.js';
import * as repo from './database/repository.js';
import { requestContext, rateLimit, requireGuest, metricsText } from './middleware/http.js';
import { evaluateIncident, evaluateLevel } from './game/evaluate.js';
import { LEVELS } from '../../src/data/levels.js';
import { WORLDS } from '../../src/data/worlds.js';

export async function createApp() {
  await migrate();
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', process.env.TRUST_PROXY === 'true');
  app.use(requestContext);
  app.use(cors({ origin(origin, callback) {
    if (!origin || config.corsOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) callback(null, true);
    else callback(new Error('CORS_ORIGIN_NOT_ALLOWED'));
  }, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'], maxAge: 600 }));
  app.use(express.json({ limit: '256kb', strict: true }));
  app.use('/api', rateLimit());

  app.get('/metrics', (_req, res) => res.type('text/plain; version=0.0.4').send(metricsText(pool)));
  app.get('/health/live', (_req, res) => res.json({ success: true, data: { status: 'alive' }, error: null }));
  app.get('/health/ready', async (_req, res, next) => {
    try { await pool.query('SELECT 1'); res.json({ success: true, data: { status: 'ready' }, error: null }); }
    catch (error) { next(error); }
  });

  const api = express.Router();
  api.post('/auth/register', async (req, res, next) => {
    try {
      const { username, password, legacyProfile } = req.body || {};
      if (!username || typeof username !== 'string') throw new Error('INVALID_USERNAME');
      if (!password || typeof password !== 'string') throw new Error('PASSWORD_TOO_SHORT');
      const token = randomBytes(32).toString('base64url');
      const tokenHash = createHash('sha256').update(token).digest();
      const user = await repo.registerUser(username, password, tokenHash, legacyProfile);
      const profile = await repo.getProfile(user.playerId);
      res.status(201).json({
        success: true,
        data: { token, playerId: user.playerId, username: user.username, profile },
        error: null,
        requestId: req.requestId
      });
    } catch (error) { next(error); }
  });

  api.post('/auth/login', async (req, res, next) => {
    try {
      const { username, password } = req.body || {};
      if (!username || typeof username !== 'string' || !password || typeof password !== 'string') throw new Error('INVALID_CREDENTIALS');
      const token = randomBytes(32).toString('base64url');
      const tokenHash = createHash('sha256').update(token).digest();
      const user = await repo.loginUser(username, password, tokenHash);
      const profile = await repo.getProfile(user.playerId);
      const sessionResult = await pool.query("SELECT id,level_id,state,updated_at FROM game_sessions WHERE player_id=$1 AND status='active' ORDER BY updated_at DESC LIMIT 1", [user.playerId]);
      const activeSessionRow = sessionResult.rows[0];
      const activeSession = activeSessionRow ? { id: activeSessionRow.id, levelId: Number(activeSessionRow.level_id), state: activeSessionRow.state, updatedAt: activeSessionRow.updated_at } : null;
      res.json({
        success: true,
        data: { token, playerId: user.playerId, username: user.username, profile, activeSession },
        error: null,
        requestId: req.requestId
      });
    } catch (error) { next(error); }
  });

  api.post('/guest', async (req, res, next) => {
    try {
      if (req.body && (typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).some(key => key !== 'legacyProfile'))) throw new Error('INVALID_REQUEST');
      const legacyProfile = req.body?.legacyProfile;
      if (legacyProfile !== undefined && (!legacyProfile || typeof legacyProfile !== 'object' || Array.isArray(legacyProfile))) throw new Error('INVALID_LEGACY_PROFILE');
      const token = randomBytes(32).toString('base64url');
      const playerId = await repo.createGuest(createHash('sha256').update(token).digest(), legacyProfile);
      res.status(201).json({ success: true, data: { token, playerId, profile: await repo.getProfile(playerId) }, error: null, requestId: req.requestId });
    } catch (error) { next(error); }
  });
  api.get('/worlds', (_req, res) => res.json({ success: true, data: WORLDS, error: null, requestId: _req.requestId }));
  api.get('/levels', (req, res) => {
    const worldId = req.query.worldId;
    res.json({ success: true, data: LEVELS.filter(level => !worldId || level.worldId === worldId), error: null, requestId: req.requestId });
  });

  api.use(requireGuest);
  api.get('/auth/me', async (req, res, next) => {
    try {
      const account = await repo.getPlayerAccount(req.playerId!);
      const profile = await repo.getProfile(req.playerId!);
      res.json({ success: true, data: { playerId: account.id, username: account.username, isGuest: !account.username, profile }, error: null, requestId: req.requestId });
    } catch (error) { next(error); }
  });
  api.get('/player/profile', async (req, res, next) => {
    try { res.json({ success: true, data: await repo.getProfile(req.playerId!), error: null, requestId: req.requestId }); }
    catch (error) { next(error); }
  });
  api.delete('/player/progress', async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("UPDATE game_sessions SET status='abandoned',updated_at=now() WHERE player_id=$1 AND status='active'", [req.playerId]);
      await client.query('DELETE FROM level_progress WHERE player_id=$1', [req.playerId]);
      await client.query('DELETE FROM player_achievements WHERE player_id=$1', [req.playerId]);
      await client.query('DELETE FROM player_skills WHERE player_id=$1 AND skill_id <> $2', [req.playerId, 'skill-http']);
      await client.query('DELETE FROM incident_results WHERE player_id=$1', [req.playerId]);
      await client.query("UPDATE player_progress SET xp=0,level=1,rank='C',rank_title='Backend Beginner',updated_at=now() WHERE player_id=$1", [req.playerId]);
      await client.query('COMMIT');
      res.json({ success: true, data: await repo.getProfile(req.playerId!), error: null, requestId: req.requestId });
    } catch (error) {
      await client.query('ROLLBACK'); next(error);
    } finally { client.release(); }
  });
  api.post('/player/skills/:skillId', async (req, res, next) => {
    try { res.json({ success: true, data: await repo.unlockSkill(req.playerId!, req.params.skillId), error: null, requestId: req.requestId }); }
    catch (error) { next(error); }
  });
  api.post('/game/sessions', async (req, res, next) => {
    try {
      const levelId = Number(req.body?.levelId);
      if (!Number.isInteger(levelId) || levelId < 1) throw new Error('INVALID_REQUEST');
      res.status(201).json({ success: true, data: await repo.createSession(req.playerId!, levelId), error: null, requestId: req.requestId });
    } catch (error) { next(error); }
  });
  api.patch('/game/sessions/:sessionId', async (req, res, next) => {
    try {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.sessionId)) throw new Error('INVALID_ID');
      if (!req.body || typeof req.body !== 'object' || !req.body.state || typeof req.body.state !== 'object' || JSON.stringify(req.body.state).length > 100_000) throw new Error('INVALID_SESSION_STATE');
      await repo.updateSession(req.playerId!, req.params.sessionId, req.body.state);
      res.json({ success: true, data: { saved: true }, error: null, requestId: req.requestId });
    } catch (error) { next(error); }
  });
  api.get('/game/sessions/active', async (req, res, next) => {
    try {
      const result = await pool.query("SELECT id,level_id,state,updated_at FROM game_sessions WHERE player_id=$1 AND status='active' ORDER BY updated_at DESC LIMIT 1", [req.playerId]);
      const row = result.rows[0];
      res.json({ success: true, data: row ? { id: row.id, levelId: Number(row.level_id), state: row.state, updatedAt: row.updated_at } : null, error: null, requestId: req.requestId });
    } catch (error) { next(error); }
  });
  api.post('/game/sessions/:sessionId/complete', async (req, res, next) => {
    try {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.sessionId)) throw new Error('INVALID_ID');
      const levelId = Number(req.body?.levelId);
      if (!Number.isInteger(levelId) || levelId < 1) throw new Error('INVALID_REQUEST');
      await repo.assertActiveSession(req.playerId!, req.params.sessionId, levelId);
      const result = evaluateLevel({ levelId, nodes: req.body?.nodes, trafficPattern: req.body?.trafficPattern, answers: req.body?.answers });
      const profile = await repo.completeLevel(req.playerId!, levelId, result.stars, result.score, result.cost, result.latency, result.achievementId);
      await repo.finishSession(req.playerId!, req.params.sessionId, levelId);
      res.json({ success: true, data: { profile, result }, error: null, requestId: req.requestId });
    } catch (error) { next(error); }
  });
  api.post('/incidents/:incidentId/complete', async (req, res, next) => {
    try {
      const result = evaluateIncident({ incidentId: req.params.incidentId, actionIds: req.body?.actionIds, rootCauseId: req.body?.rootCauseId, elapsedSeconds: req.body?.elapsedSeconds });
      const profile = await repo.completeIncident(req.playerId!, req.params.incidentId, result.stars, result.elapsed, 500);
      res.json({ success: true, data: { profile, result }, error: null, requestId: req.requestId });
    } catch (error) { next(error); }
  });

  app.use('/api/v1', api);
  app.use('/api/v1', (req, res) => res.status(404).json({ success: false, data: null, error: { code: 'ROUTE_NOT_FOUND', message: 'API route does not exist' }, requestId: req.requestId }));
  if (process.env.NODE_ENV === 'production') {
    const dist = path.resolve(config.frontendDist);
    app.use(express.static(dist, { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
    const message = error instanceof Error ? error.message : 'INTERNAL_ERROR';
    if (error instanceof SyntaxError && 'status' in error) {
      res.status(400).json({ success: false, data: null, error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON' }, requestId: req.requestId });
      return;
    }
    if (error instanceof Error && 'type' in error && (error as Error & { type?: string }).type === 'entity.too.large') {
      res.status(413).json({ success: false, data: null, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds the allowed size' }, requestId: req.requestId });
      return;
    }
    const statusByCode: Record<string, number> = {
      PLAYER_PROGRESS_MISSING: 404, LEVEL_NOT_FOUND: 404, INCIDENT_NOT_FOUND: 404, SESSION_NOT_FOUND: 404,
      SKILL_NOT_FOUND: 404, SKILL_ALREADY_UNLOCKED: 409, LEVEL_CONDITIONS_UNMET: 422,
      QUIZ_ANSWERS_REQUIRED: 422, INVALID_QUIZ_ANSWERS: 422, INCIDENT_NOT_RESOLVED: 422,
      INVALID_ARCHITECTURE: 400, INVALID_REQUEST: 400, INVALID_ID: 400, CORS_ORIGIN_NOT_ALLOWED: 403, INVALID_TRAFFIC_PATTERN: 400, INVALID_LEGACY_PROFILE: 400, INVALID_SESSION_STATE: 400,
      INVALID_INCIDENT_ACTIONS: 400, INVALID_ELAPSED_TIME: 400, INSUFFICIENT_XP: 409, WORLD_LOCKED: 403,
      SKILL_PREREQUISITES_MISSING: 409,
      INVALID_CREDENTIALS: 401, USERNAME_ALREADY_TAKEN: 409, INVALID_USERNAME: 400, INVALID_USERNAME_FORMAT: 400,
      PASSWORD_TOO_SHORT: 400, PLAYER_NOT_FOUND: 404
    };
    const status = statusByCode[message] ?? 500;
    if (status === 500) console.error(JSON.stringify({ level: 'error', requestId: req.requestId, message: 'Unhandled API error', detail: message }));
    res.status(status).json({ success: false, data: null, error: { code: status === 500 ? 'INTERNAL_ERROR' : message, message: status === 500 ? 'The request could not be completed' : message.replaceAll('_', ' ').toLowerCase() }, requestId: req.requestId ?? randomUUID() });
  });
  return app;
}
