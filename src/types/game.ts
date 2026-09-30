export type ComponentCategory = 'client' | 'compute' | 'storage' | 'network' | 'messaging' | 'observability' | 'security';

export type ComponentId = 
  | 'client'
  | 'dns'
  | 'cdn'
  | 'load-balancer'
  | 'api-gateway'
  | 'server'
  | 'docker-container'
  | 'k8s-pod'
  | 'redis'
  | 'postgresql'
  | 'mongodb'
  | 'kafka'
  | 'rabbitmq'
  | 'telemetry-collector'
  | 'waf-firewall'
  | 'worker-service';

export interface InfrastructureComponent {
  id: ComponentId;
  name: string;
  category: ComponentCategory;
  description: string;
  baseCost: number; // hourly cost in $
  baseCapacity: number; // req/s per instance
  baseLatency: number; // baseline ms latency added
  failureModes: string[];
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  supportedProtocols: string[];
}

export interface ArchitectureNode {
  instanceId: string;
  componentId: ComponentId;
  label?: string;
  position: { x: number; y: number };
  connections: string[]; // target instanceIds
  config?: {
    replicas?: number;
    cacheTtlSeconds?: number;
    maxConnections?: number;
    timeoutMs?: number;
    rateLimitRps?: number;
    healthCheckInterval?: number;
    partitions?: number;
  };
}

export interface SimulationMetrics {
  requestsPerSecond: number;
  targetRps: number;
  latencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate: number; // 0 to 1
  cpuPercent: number;
  memoryPercent: number;
  activeConnections: number;
  maxConnections: number;
  queueDepth: number;
  cacheHitRate: number; // 0 to 1
  hourlyCost: number;
  isHealthy: boolean;
  statusMessage: string;
  bottleneckNodeId?: string;
  nodeMetrics: Record<string, {
    cpu: number;
    memory: number;
    latency: number;
    rps: number;
    isOverloaded: boolean;
  }>;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  category: string;
}

export interface LevelWinConditions {
  minRps: number;
  maxLatencyMs: number;
  maxErrorRate: number; // e.g. 0.02 = 2%
  maxHourlyCost?: number;
  requiredComponents?: ComponentId[];
  requiredConnections?: [ComponentId, ComponentId][];
  forbiddenComponents?: ComponentId[];
}

export interface LevelBriefing {
  title: string;
  conceptIntro: string;
  realWorldScenario: string;
  objectives: string[];
  deepDive?: {
    whyItMatters: string;
    tradeoffs: string;
    keyMetrics: string[];
  };
}

export interface Level {
  id: number;
  worldId: string;
  title: string;
  subtitle: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  concepts: string[];
  briefing: LevelBriefing;
  allowedComponents: ComponentId[];
  starterNodes?: ArchitectureNode[];
  targetRps: number;
  winConditions: LevelWinConditions;
  quiz?: QuizQuestion[];
  reflection: {
    summary: string;
    takeaway: string;
    realWorldAnalogy: string;
  };
  rewards: {
    xp: number;
    achievementId?: string;
  };
}

export interface World {
  id: string;
  order: number;
  title: string;
  tagline: string;
  iconName: string;
  levelIds: number[];
  color: string;
  isFusion?: boolean;
}

export type IncidentSeverity = 'SEV1' | 'SEV2' | 'SEV3';

export interface IncidentLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  service: string;
  message: string;
}

export interface DistributedTraceSpan {
  service: string;
  operation: string;
  durationMs: number;
  status: 'ok' | 'error';
  children?: DistributedTraceSpan[];
}

export interface IncidentAction {
  id: string;
  label: string;
  description: string;
  cost: number;
  effect: 'scale-up' | 'rollback' | 'enable-cache' | 'rate-limit' | 'restart-consumers' | 'failover-db' | 'add-partitions';
  consequenceText: string;
  isCorrectIntervention: boolean;
}

export interface IncidentScenario {
  id: string;
  levelId: number;
  title: string;
  severity: IncidentSeverity;
  description: string;
  timeLimitSeconds: number;
  initialSymptoms: {
    label: string;
    value: string;
    severity: 'warning' | 'critical';
  }[];
  logs: IncidentLog[];
  traces: DistributedTraceSpan[];
  availableActions: IncidentAction[];
  rootCauseOptions: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'architecture' | 'scaling' | 'incident' | 'mastery';
  unlockedAt?: string;
}

export interface SkillNode {
  id: string;
  title: string;
  category: string;
  description: string;
  xpRequired: number;
  prerequisites: string[];
  isUnlocked: boolean;
}

export type PlayerRank = 'C' | 'B' | 'A' | 'S' | 'S+' | 'SS' | 'SSS';

export interface PlayerProfile {
  level: number;
  xp: number;
  rank: PlayerRank;
  rankTitle: string;
  completedLevelIds: number[];
  unlockedWorldIds: string[];
  unlockedSkillIds: string[];
  unlockedAchievementIds: string[];
  incidentResolutions: Record<string, {
    stars: number;
    timeSpentSeconds: number;
  }>;
  levelScores: Record<number, {
    stars: number;
    bestCost: number;
    bestLatency: number;
  }>;
}

export interface ConceptCard {
  id: string;
  title: string;
  category: string;
  purpose: string;
  whenToUse: string[];
  whenNotToUse: string[];
  coreMechanisms: string[];
  failureModes: string[];
  tradeoffs: string;
  alternatives: string[];
}
