import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateIncident, evaluateLevel } from '../src/game/evaluate.js';
import { LEVELS } from '../../src/data/levels.js';

test('level completion is evaluated from the submitted architecture and quiz answers', () => {
  const level = LEVELS.find(item => item.id === 1)!;
  const nodes = [
    { instanceId: 'client', componentId: 'client', position: { x: 0, y: 0 }, connections: ['server'] },
    { instanceId: 'server', componentId: 'server', position: { x: 100, y: 0 }, connections: [] }
  ];
  const result = evaluateLevel({ levelId: 1, nodes, answers: { 'q1-1': 'opt1' } });
  assert.equal(result.achievementId, 'first_request');
  assert.ok(result.stars >= 1 && result.stars <= 3);
  const incorrect = evaluateLevel({ levelId: 1, nodes, answers: { 'q1-1': 'opt2' } });
  assert.equal(result.score - incorrect.score, 25);
});

test('level completion rejects components outside the level palette', () => {
  const nodes = [{ instanceId: 'client', componentId: 'client', position: { x: 0, y: 0 }, connections: ['redis'] },
    { instanceId: 'redis', componentId: 'redis', position: { x: 100, y: 0 }, connections: [] }];
  assert.throws(() => evaluateLevel({ levelId: 1, nodes, answers: { 'q1-1': 'opt1' } }), /INVALID_ARCHITECTURE/);
});

test('incident completion requires a valid mitigation and root cause', () => {
  const result = evaluateIncident({ incidentId: 'inc-db-meltdown', actionIds: ['act-enable-cache'], rootCauseId: 'rc-1', elapsedSeconds: 30 });
  assert.equal(result.stars, 3);
  assert.throws(() => evaluateIncident({ incidentId: 'inc-db-meltdown', actionIds: [], rootCauseId: 'rc-1', elapsedSeconds: 30 }), /INCIDENT_NOT_RESOLVED/);
});
