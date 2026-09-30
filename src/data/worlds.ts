import { World } from '../types/game';

export const WORLDS: World[] = [
  {
    id: 'foundations',
    order: 1,
    title: 'Foundations',
    tagline: 'Client-server model, HTTP/HTTPS, REST APIs, and network protocols.',
    iconName: 'Globe',
    levelIds: [1, 2, 3, 4],
    color: '#3B82F6' // Blue
  },
  {
    id: 'databases',
    order: 2,
    title: 'Databases & Caching',
    tagline: 'Persistent storage, ACID transactions, connection pools, and Redis cache-aside.',
    iconName: 'Database',
    levelIds: [5, 6, 7],
    color: '#06B6D4' // Cyan
  },
  {
    id: 'scaling',
    order: 3,
    title: 'Traffic & Scaling',
    tagline: 'Load balancing, horizontal scale, rate limiting, and surge protection.',
    iconName: 'TrendingUp',
    levelIds: [8, 9, 10],
    color: '#10B981' // Emerald
  },
  {
    id: 'containers',
    order: 4,
    title: 'Docker & Containers',
    tagline: 'Containerized workloads, port binding, environment isolation, and multi-container setups.',
    iconName: 'Box',
    levelIds: [11, 12],
    color: '#6366F1' // Indigo
  },
  {
    id: 'kubernetes',
    order: 5,
    title: 'Kubernetes Cluster',
    tagline: 'Pods, services, ingress routing, rolling updates, and self-healing orchestration.',
    iconName: 'Layers',
    levelIds: [13, 14],
    color: '#8B5CF6' // Violet
  },
  {
    id: 'messaging',
    order: 6,
    title: 'Event Streaming & Queues',
    tagline: 'Asynchronous workers, RabbitMQ routing, Kafka topics, partitions, and consumer lag.',
    iconName: 'Radio',
    levelIds: [15, 16],
    color: '#EC4899' // Pink
  },
  {
    id: 'microservices',
    order: 7,
    title: 'Microservices & Gateways',
    tagline: 'API Gateways, service boundaries, circuit breakers, and distributed transactions.',
    iconName: 'Network',
    levelIds: [17, 18],
    color: '#F59E0B' // Amber
  },
  {
    id: 'observability',
    order: 8,
    title: 'Observability & SRE',
    tagline: 'Golden signals, OpenTelemetry traces, structured logs, and latency percentiles.',
    iconName: 'Activity',
    levelIds: [19, 20],
    color: '#14B8A6' // Teal
  },
  {
    id: 'security',
    order: 9,
    title: 'Security & Edge Shield',
    tagline: 'Web Application Firewalls, DDoS absorption, zero-trust, and secret protection.',
    iconName: 'Shield',
    levelIds: [21, 22],
    color: '#EF4444' // Red
  },
  {
    id: 'fusion',
    order: 10,
    title: 'Production Boss Battles',
    tagline: 'High-concurrency fusion challenges combining all systems under real chaos conditions.',
    iconName: 'Flame',
    levelIds: [23, 24, 25],
    color: '#F97316', // Orange
    isFusion: true
  }
];
