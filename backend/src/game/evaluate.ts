import { LEVELS } from '../../../src/data/levels.js';
import { INCIDENT_SCENARIOS } from '../../../src/data/incidents.js';
import { INFRASTRUCTURE_COMPONENTS } from '../../../src/data/components.js';
import { calculateSimulationMetrics } from '../../../src/engine/simulator.js';
import { validateLevelArchitecture } from '../../../src/engine/validation.js';
import type { ArchitectureNode, ComponentId } from '../../../src/types/game.js';

export function evaluateLevel(input: {
  levelId: number;
  nodes: unknown;
  trafficPattern?: unknown;
  answers?: unknown;
}): { stars: number; score: number; cost: number; latency: number; achievementId?: string } {
  const level = LEVELS.find(item => item.id === input.levelId);
  if (!level) throw new Error('LEVEL_NOT_FOUND');
  if (!Array.isArray(input.nodes) || input.nodes.length > 100) throw new Error('INVALID_ARCHITECTURE');
  const allowed = new Set(level.allowedComponents);
  const nodes = input.nodes as ArchitectureNode[];
  const instanceIds = new Set<string>();
  for (const node of nodes) {
    if (!node || typeof node.instanceId !== 'string' || node.instanceId.length > 80 || instanceIds.has(node.instanceId)) throw new Error('INVALID_ARCHITECTURE');
    if (!allowed.has(node.componentId as ComponentId) || !Array.isArray(node.connections) || node.connections.length > 100) throw new Error('INVALID_ARCHITECTURE');
    instanceIds.add(node.instanceId);
    const x = node.position?.x;
    const y = node.position?.y;
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 10000 || Math.abs(y) > 10000) throw new Error('INVALID_ARCHITECTURE');
  }
  for (const node of nodes) if (node.connections.some(target => !nodes.some(item => item.instanceId === target))) throw new Error('INVALID_ARCHITECTURE');

  if (input.trafficPattern !== undefined && !['constant', 'spike', 'retry-storm'].includes(String(input.trafficPattern))) throw new Error('INVALID_TRAFFIC_PATTERN');
  const pattern = input.trafficPattern === 'spike' || input.trafficPattern === 'retry-storm' ? input.trafficPattern : 'constant';
  const metrics = calculateSimulationMetrics(nodes, INFRASTRUCTURE_COMPONENTS, level.targetRps, pattern);
  const result = validateLevelArchitecture(nodes, metrics, level.winConditions);
  if (!result.isComplete) throw new Error('LEVEL_CONDITIONS_UNMET');

  let correctAnswers = 0;
  if (level.quiz?.length) {
    if (!input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers)) throw new Error('QUIZ_ANSWERS_REQUIRED');
    const answers = input.answers as Record<string, unknown>;
    for (const question of level.quiz) {
      const chosen = answers[question.id];
      if (typeof chosen !== 'string' || !question.options.some(option => option.id === chosen)) throw new Error('INVALID_QUIZ_ANSWERS');
      if (question.options.find(option => option.id === chosen)?.isCorrect) correctAnswers++;
    }
  }
  return {
    stars: result.stars,
    score: result.score + correctAnswers * 25,
    cost: metrics.hourlyCost,
    latency: metrics.latencyMs,
    achievementId: level.rewards.achievementId
  };
}

export function evaluateIncident(input: {
  incidentId: string;
  actionIds: unknown;
  rootCauseId: unknown;
  elapsedSeconds: unknown;
}): { stars: number; elapsed: number } {
  const incident = INCIDENT_SCENARIOS.find(item => item.id === input.incidentId);
  if (!incident) throw new Error('INCIDENT_NOT_FOUND');
  if (!Array.isArray(input.actionIds) || input.actionIds.length > incident.availableActions.length) throw new Error('INVALID_INCIDENT_ACTIONS');
  const actionIds = new Set(input.actionIds);
  if ([...actionIds].some(id => typeof id !== 'string' || !incident.availableActions.some(action => action.id === id))) throw new Error('INVALID_INCIDENT_ACTIONS');
  const hasIntervention = incident.availableActions.some(action => action.isCorrectIntervention && actionIds.has(action.id));
  const rootCause = incident.rootCauseOptions.find(option => option.id === input.rootCauseId);
  if (!hasIntervention || !rootCause?.isCorrect) throw new Error('INCIDENT_NOT_RESOLVED');
  const elapsed = Number(input.elapsedSeconds);
  if (!Number.isInteger(elapsed) || elapsed < 0 || elapsed > incident.timeLimitSeconds + 3600) throw new Error('INVALID_ELAPSED_TIME');
  const stars = elapsed <= incident.timeLimitSeconds * 0.25 ? 3 : elapsed <= incident.timeLimitSeconds * 0.65 ? 2 : 1;
  return { stars, elapsed };
}
