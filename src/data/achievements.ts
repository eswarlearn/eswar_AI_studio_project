import { Achievement } from '../types/game';

export const ACHIEVEMENTS_CATALOG: Achievement[] = [
  {
    id: 'first_request',
    title: 'First Request',
    description: 'Establish your first working client-to-server HTTP connection.',
    icon: 'Radio',
    xpReward: 100,
    category: 'architecture'
  },
  {
    id: 'edge_master',
    title: 'Edge Master',
    description: 'Deploy a CDN edge cache to shield origin servers from global latency.',
    icon: 'Globe',
    xpReward: 150,
    category: 'scaling'
  },
  {
    id: 'database_keeper',
    title: 'Data Custodian',
    description: 'Provision persistent ACID storage with PostgreSQL.',
    icon: 'Database',
    xpReward: 180,
    category: 'architecture'
  },
  {
    id: 'cache_master',
    title: 'Cache Master',
    description: 'Shield database and slash P95 latency with Redis cache-aside.',
    icon: 'Zap',
    xpReward: 200,
    category: 'scaling'
  },
  {
    id: 'no_single_point',
    title: 'No Single Point of Failure',
    description: 'Deploy horizontal load balancing across multiple active server nodes.',
    icon: 'Shuffle',
    xpReward: 250,
    category: 'scaling'
  },
  {
    id: 'cost_cutter',
    title: 'Frugal Architect',
    description: 'Meet demanding 1,000 req/s throughput under strict budget constraints.',
    icon: 'DollarSign',
    xpReward: 300,
    category: 'scaling'
  },
  {
    id: 'container_captain',
    title: 'Container Captain',
    description: 'Package microservices into standardized Docker container runtimes.',
    icon: 'Box',
    xpReward: 300,
    category: 'architecture'
  },
  {
    id: 'k8s_master',
    title: 'Kubernetes Commander',
    description: 'Deploy self-healing pod replicas with Ingress and service discovery.',
    icon: 'Layers',
    xpReward: 400,
    category: 'architecture'
  },
  {
    id: 'zero_downtime',
    title: 'Zero Downtime',
    description: 'Execute a rolling update with 0 dropped packets during peak load.',
    icon: 'CheckCircle2',
    xpReward: 450,
    category: 'mastery'
  },
  {
    id: 'kafka_keeper',
    title: 'Kafka Streamer',
    description: 'Stream 2,500+ events/sec through partitioned event logs.',
    icon: 'Activity',
    xpReward: 500,
    category: 'architecture'
  },
  {
    id: 'distributed_thinker',
    title: 'Distributed Thinker',
    description: 'Implement circuit breakers to prevent catastrophic cascading failure.',
    icon: 'Cpu',
    xpReward: 550,
    category: 'mastery'
  },
  {
    id: 'observability_boss',
    title: 'Observability Specialist',
    description: 'Capture distributed traces with OpenTelemetry and enforce SLOs.',
    icon: 'Eye',
    xpReward: 600,
    category: 'mastery'
  },
  {
    id: 'security_sentinel',
    title: 'Security Sentinel',
    description: 'Deploy WAF edge inspection and rate limiting to repel cyber threats.',
    icon: 'ShieldCheck',
    xpReward: 650,
    category: 'architecture'
  },
  {
    id: 'flash_sale_hero',
    title: 'Flash Sale Hero',
    description: 'Conquer the 15,000 req/s Black Friday traffic surge.',
    icon: 'Sparkles',
    xpReward: 1000,
    category: 'mastery'
  },
  {
    id: 'incident_commander',
    title: 'Incident Commander',
    description: 'Diagnose and resolve a SEV-1 production database meltdown under pressure.',
    icon: 'AlertTriangle',
    xpReward: 1200,
    category: 'incident'
  },
  {
    id: 'backend_master',
    title: 'Backend Master',
    description: 'Conquer the Production Apocalypse and earn the SSS Master certification.',
    icon: 'Trophy',
    xpReward: 2000,
    category: 'mastery'
  }
];
