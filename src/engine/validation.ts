import { ArchitectureNode, ComponentId, LevelWinConditions, SimulationMetrics } from '../types/game';

export interface ValidationResult {
  isComplete: boolean;
  missingRequirements: string[];
  recommendations: string[];
  stars: number; // 1 to 3 stars
  score: number;
}

export function validateLevelArchitecture(
  nodes: ArchitectureNode[],
  metrics: SimulationMetrics,
  conditions: LevelWinConditions
): ValidationResult {
  const missingRequirements: string[] = [];
  const recommendations: string[] = [];

  // 1. Required Components Check
  const presentComponentIds = new Set(nodes.map(n => n.componentId));
  if (conditions.requiredComponents) {
    for (const requiredId of conditions.requiredComponents) {
      if (!presentComponentIds.has(requiredId)) {
        missingRequirements.push(`Missing component: ${formatComponentName(requiredId)}`);
        recommendations.push(`Drag a ${formatComponentName(requiredId)} from the component palette onto the canvas.`);
      }
    }
  }

  // 2. Forbidden Components Check
  if (conditions.forbiddenComponents) {
    for (const forbiddenId of conditions.forbiddenComponents) {
      if (presentComponentIds.has(forbiddenId)) {
        missingRequirements.push(`Disallowed component: ${formatComponentName(forbiddenId)} is not allowed in this challenge`);
      }
    }
  }

  // 3. Required Connection Topology Check
  if (conditions.requiredConnections && conditions.requiredConnections.length > 0) {
    // Map instanceId to componentId
    const instanceToComponent = new Map<string, ComponentId>();
    nodes.forEach(n => instanceToComponent.set(n.instanceId, n.componentId));

    // Gather all directed connection pairs [SourceComponentId, TargetComponentId]
    const activePairs: string[] = [];
    nodes.forEach(sourceNode => {
      if (sourceNode.connections) {
        sourceNode.connections.forEach(targetInstanceId => {
          const targetComponent = instanceToComponent.get(targetInstanceId);
          if (targetComponent) {
            activePairs.push(`${sourceNode.componentId}->${targetComponent}`);
          }
        });
      }
    });

    for (const [sourceReq, targetReq] of conditions.requiredConnections) {
      const pairKey = `${sourceReq}->${targetReq}`;
      if (!activePairs.includes(pairKey)) {
        missingRequirements.push(`Missing connection: ${formatComponentName(sourceReq)} must connect to ${formatComponentName(targetReq)}`);
        recommendations.push(`Click the output port on ${formatComponentName(sourceReq)} and drag a wire to ${formatComponentName(targetReq)}.`);
      }
    }
  }

  // 4. Performance Metrics Check
  if (metrics.requestsPerSecond < conditions.minRps) {
    missingRequirements.push(`Throughput too low: ${metrics.requestsPerSecond} req/s (Target: ${conditions.minRps} req/s)`);
    recommendations.push('Check that all nodes are connected and add load balancing or server replicas if bottlenecked.');
  }

  if (metrics.latencyMs > conditions.maxLatencyMs) {
    missingRequirements.push(`Latency exceeded: ${metrics.latencyMs}ms (Maximum allowed: ${conditions.maxLatencyMs}ms)`);
    recommendations.push('Introduce caching (Redis / CDN) or scale out compute to reduce queue delays.');
  }

  if (metrics.errorRate > conditions.maxErrorRate) {
    const errorPct = (metrics.errorRate * 100).toFixed(1);
    const maxPct = (conditions.maxErrorRate * 100).toFixed(1);
    missingRequirements.push(`Error rate too high: ${errorPct}% (Maximum: ${maxPct}%)`);
    recommendations.push('Investigate overloaded components and ensure servers have sufficient capacity.');
  }

  if (conditions.maxHourlyCost && metrics.hourlyCost > conditions.maxHourlyCost) {
    missingRequirements.push(`Cost over budget: $${metrics.hourlyCost}/hr (Budget limit: $${conditions.maxHourlyCost}/hr)`);
    recommendations.push('Remove unnecessary high-cost nodes or replace redundant servers with caching layers.');
  }

  // 5. Star & Scoring Calculation
  const isComplete = missingRequirements.length === 0 && metrics.isHealthy;
  let stars = 1;
  let score = 50;

  if (isComplete) {
    stars = 1;
    score = 100;

    // Bonus Star 2: Low Latency (<= 75% of max allowed)
    if (metrics.latencyMs <= conditions.maxLatencyMs * 0.75) {
      stars += 1;
      score += 50;
    }

    // Bonus Star 3: Zero or near-zero error rate (<0.5%) & Budget efficiency
    if (metrics.errorRate <= 0.005) {
      stars += 1;
      score += 50;
    }
    stars = Math.min(3, stars);
  }

  return {
    isComplete,
    missingRequirements,
    recommendations,
    stars,
    score
  };
}

function formatComponentName(id: ComponentId): string {
  const names: Record<ComponentId, string> = {
    client: 'Client App',
    dns: 'DNS Resolver',
    cdn: 'CDN',
    'load-balancer': 'Load Balancer',
    'api-gateway': 'API Gateway',
    server: 'API Server',
    'docker-container': 'Docker Container',
    'k8s-pod': 'Kubernetes Pod',
    redis: 'Redis',
    postgresql: 'PostgreSQL',
    mongodb: 'MongoDB',
    kafka: 'Kafka',
    rabbitmq: 'RabbitMQ',
    'telemetry-collector': 'Telemetry Collector',
    'waf-firewall': 'WAF Firewall',
    'worker-service': 'Worker Service',
    'nginx-reverse-proxy': 'Nginx Reverse Proxy',
    's3-storage': 'S3 Object Storage',
    'service-mesh': 'Service Mesh',
    'circuit-breaker': 'Circuit Breaker',
    'dead-letter-queue': 'Dead Letter Queue'
  };
  return names[id] || id;
}
