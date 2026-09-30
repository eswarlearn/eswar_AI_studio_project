import { SkillNode } from '../types/game';

export const SKILL_TREE_NODES: SkillNode[] = [
  // Foundations
  {
    id: 'skill-http',
    title: 'HTTP & REST APIs',
    category: 'Foundations',
    description: 'Stateless request-response protocol, status codes, headers, and REST resource design.',
    xpRequired: 0,
    prerequisites: [],
    isUnlocked: true
  },
  {
    id: 'skill-dns',
    title: 'DNS & Global Routing',
    category: 'Foundations',
    description: 'Domain resolution, TTL caching, Geo-DNS, and latency-based IP routing.',
    xpRequired: 100,
    prerequisites: ['skill-http'],
    isUnlocked: false
  },
  {
    id: 'skill-cdn',
    title: 'Edge CDN Caching',
    category: 'Foundations',
    description: 'Edge caching, origin shielding, cache invalidation, and static asset distribution.',
    xpRequired: 200,
    prerequisites: ['skill-dns'],
    isUnlocked: false
  },
  // Databases
  {
    id: 'skill-sql',
    title: 'Relational SQL & ACID',
    category: 'Databases',
    description: 'PostgreSQL, foreign keys, schema normalization, and ACID transaction isolation.',
    xpRequired: 300,
    prerequisites: ['skill-http'],
    isUnlocked: false
  },
  {
    id: 'skill-redis',
    title: 'In-Memory Redis Caching',
    category: 'Databases',
    description: 'Sub-millisecond key-value lookups, cache-aside pattern, and stampede prevention.',
    xpRequired: 450,
    prerequisites: ['skill-sql'],
    isUnlocked: false
  },
  {
    id: 'skill-nosql',
    title: 'Document & NoSQL Storage',
    category: 'Databases',
    description: 'MongoDB document models, JSON schemas, and horizontal sharding.',
    xpRequired: 600,
    prerequisites: ['skill-sql'],
    isUnlocked: false
  },
  // Scaling
  {
    id: 'skill-lb',
    title: 'Load Balancing & L4/L7',
    category: 'Scaling',
    description: 'Round-robin, least-connections, TLS termination, and health check probes.',
    xpRequired: 700,
    prerequisites: ['skill-http'],
    isUnlocked: false
  },
  {
    id: 'skill-rate-limiting',
    title: 'Rate Limiting & Token Bucket',
    category: 'Scaling',
    description: 'Protecting backend resources against abusive scripts, scrapers, and volumetric bursts.',
    xpRequired: 850,
    prerequisites: ['skill-lb'],
    isUnlocked: false
  },
  // Containers & K8s
  {
    id: 'skill-docker',
    title: 'Docker Containerization',
    category: 'Containers',
    description: 'Image layers, Dockerfile optimization, isolated namespaces, and cgroups.',
    xpRequired: 950,
    prerequisites: ['skill-http'],
    isUnlocked: false
  },
  {
    id: 'skill-k8s',
    title: 'Kubernetes Orchestration',
    category: 'Containers',
    description: 'Pods, services, ingress controllers, rolling deployments, and self-healing.',
    xpRequired: 1200,
    prerequisites: ['skill-docker', 'skill-lb'],
    isUnlocked: false
  },
  // Messaging
  {
    id: 'skill-queues',
    title: 'RabbitMQ Message Queues',
    category: 'Messaging',
    description: 'Point-to-point task queues, worker decoupling, exchanges, and dead-lettering.',
    xpRequired: 1400,
    prerequisites: ['skill-k8s'],
    isUnlocked: false
  },
  {
    id: 'skill-kafka',
    title: 'Apache Kafka Event Streams',
    category: 'Messaging',
    description: 'Partitioned commit logs, consumer groups, offset tracking, and stream processing.',
    xpRequired: 1700,
    prerequisites: ['skill-queues'],
    isUnlocked: false
  },
  // Microservices & Resilience
  {
    id: 'skill-api-gateway',
    title: 'API Gateway Architecture',
    category: 'Microservices',
    description: 'Unified ingress facade, token authentication, routing policies, and request aggregation.',
    xpRequired: 1900,
    prerequisites: ['skill-k8s'],
    isUnlocked: false
  },
  {
    id: 'skill-circuit-breaker',
    title: 'Circuit Breakers & Resilience',
    category: 'Microservices',
    description: 'Fail-fast mechanisms, timeouts, exponential backoff with jitter, and bulkheads.',
    xpRequired: 2200,
    prerequisites: ['skill-api-gateway'],
    isUnlocked: false
  },
  // Observability & Security
  {
    id: 'skill-opentelemetry',
    title: 'Distributed Tracing & SRE',
    category: 'Observability',
    description: 'OpenTelemetry collector, context propagation, flamegraphs, and Golden Signals.',
    xpRequired: 2500,
    prerequisites: ['skill-api-gateway'],
    isUnlocked: false
  },
  {
    id: 'skill-security',
    title: 'WAF & Zero Trust Security',
    category: 'Security',
    description: 'Perimeter packet inspection, OWASP mitigation, JWT cryptographic verification, and mTLS.',
    xpRequired: 2800,
    prerequisites: ['skill-api-gateway'],
    isUnlocked: false
  },
  // Production Mastery
  {
    id: 'skill-production',
    title: 'Production Incident Mastery',
    category: 'Mastery',
    description: 'On-call firefighting, root-cause diagnosis under pressure, postmortems, and SLO defense.',
    xpRequired: 3500,
    prerequisites: ['skill-circuit-breaker', 'skill-opentelemetry', 'skill-security', 'skill-kafka'],
    isUnlocked: false
  }
];
