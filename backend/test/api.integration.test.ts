import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from '../src/app.js';
import { migrate } from '../src/database/migrate.js';
import { pool } from '../src/database/pool.js';

let server: Server;
let baseUrl: string;

const call = async (path: string, method = 'GET', data?: unknown, token?: string) => {
  const response = await fetch(baseUrl + path, {
    method,
    headers: {
      ...(data === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: data === undefined ? undefined : JSON.stringify(data)
  });
  return { status: response.status, body: await response.json() as { success: boolean; data: any; error: any } };
};

after(async () => {
  if (server?.listening) await new Promise<void>(resolve => server.close(() => resolve()));
  await pool.end();
});

test('REST and PostgreSQL preserve progression, constraints, and repeat-safe migrations', async () => {
  const app = await createApp();
  server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve());
    server.once('error', reject);
  });
  const address = server.address() as AddressInfo;
  baseUrl = 'http://127.0.0.1:' + address.port;

  assert.equal((await call('/health/ready')).body.data.status, 'ready');
  assert.equal((await call('/api/v1/player/profile')).status, 401);

  const guest = await call('/api/v1/guest', 'POST', {});
  assert.equal(guest.status, 201);
  const token = guest.body.data.token as string;
  const guestId = guest.body.data.playerId as string;
  assert.equal(guest.body.data.profile.xp, 0);

  assert.equal((await call('/api/v1/game/sessions', 'POST', { levelId: 25 }, token)).status, 403);
  const session = await call('/api/v1/game/sessions', 'POST', { levelId: 1 }, token);
  assert.equal(session.status, 201);
  const sessionId = session.body.data.id as string;

  const nodes = [
    { instanceId: 'client', componentId: 'client', position: { x: 0, y: 0 }, connections: ['server'] },
    { instanceId: 'server', componentId: 'server', position: { x: 100, y: 0 }, connections: [] }
  ];
  assert.equal((await call('/api/v1/game/sessions/' + sessionId, 'PATCH', { state: { nodes, trafficPattern: 'constant' } }, token)).status, 200);
  const resumed = await call('/api/v1/game/sessions/active', 'GET', undefined, token);
  assert.equal(resumed.body.data.state.nodes.length, 2);

  const completion = await call('/api/v1/game/sessions/' + sessionId + '/complete', 'POST', {
    levelId: 1, nodes, trafficPattern: 'constant', answers: { 'q1-1': 'opt1' }
  }, token);
  assert.equal(completion.status, 200);
  assert.equal(completion.body.data.profile.xp, 100);
  assert.deepEqual(completion.body.data.profile.completedLevelIds, [1]);
  assert.equal((await call('/api/v1/game/sessions/active', 'GET', undefined, token)).body.data, null);

  const repeatSession = await call('/api/v1/game/sessions', 'POST', { levelId: 1 }, token);
  const repeated = await call('/api/v1/game/sessions/' + repeatSession.body.data.id + '/complete', 'POST', {
    levelId: 1, nodes, trafficPattern: 'constant', answers: { 'q1-1': 'opt1' }
  }, token);
  assert.equal(repeated.body.data.profile.xp, 100);

  const incident = await call('/api/v1/incidents/inc-db-meltdown/complete', 'POST', {
    actionIds: ['act-enable-cache'], rootCauseId: 'rc-1', elapsedSeconds: 30
  }, token);
  assert.equal(incident.status, 200);
  assert.equal(incident.body.data.profile.xp, 600);

  await assert.rejects(pool.query('UPDATE player_progress SET xp=-1 WHERE player_id=$1', [guestId]));
  await assert.rejects(pool.query('INSERT INTO level_progress(player_id,level_id,best_stars) VALUES($1,1,4)', [guestId]));

  await migrate();
  const migration = await pool.query('SELECT version FROM schema_migrations');
  const persisted = await pool.query('SELECT xp FROM player_progress WHERE player_id=$1', [guestId]);
  assert.ok(migration.rowCount >= 2);
  assert.equal(Number(persisted.rows[0].xp), 600);

  // Test User Registration, Level Completion, and Re-login Persistence
  const reg = await call('/api/v1/auth/register', 'POST', { username: 'test_engineer_99', password: 'safe_password_123' });
  assert.equal(reg.status, 201);
  const userToken = reg.body.data.token as string;
  assert.equal(reg.body.data.username, 'test_engineer_99');

  const me = await call('/api/v1/auth/me', 'GET', undefined, userToken);
  assert.equal(me.status, 200);
  assert.equal(me.body.data.username, 'test_engineer_99');
  assert.equal(me.body.data.isGuest, false);

  const userSession = await call('/api/v1/game/sessions', 'POST', { levelId: 1 }, userToken);
  assert.equal(userSession.status, 201);
  const userCompletion = await call('/api/v1/game/sessions/' + userSession.body.data.id + '/complete', 'POST', {
    levelId: 1, nodes, trafficPattern: 'constant', answers: { 'q1-1': 'opt1' }
  }, userToken);
  assert.equal(userCompletion.status, 200);
  assert.deepEqual(userCompletion.body.data.profile.completedLevelIds, [1]);

  // Log in again from another "device/restart"
  const loginRes = await call('/api/v1/auth/login', 'POST', { username: 'test_engineer_99', password: 'safe_password_123' });
  assert.equal(loginRes.status, 200);
  assert.deepEqual(loginRes.body.data.profile.completedLevelIds, [1]);
  assert.equal(loginRes.body.data.profile.xp, 100);

  const metrics = await fetch(baseUrl + '/metrics');
  const metricsText = await metrics.text();
  assert.match(metricsText, /backendquest_http_requests_total/);
  assert.match(metricsText, /backendquest_postgres_pool_connections/);
});
