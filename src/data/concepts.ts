import { ConceptCard } from '../types/game';

export const CONCEPTS_CATALOG: ConceptCard[] = [
  {
    id: 'concept-http',
    title: 'HTTP & The Request-Response Cycle',
    category: 'Foundations',
    purpose: 'Standard application protocol for distributed, collaborative, hypermedia information systems.',
    whenToUse: [
      'Synchronous client-to-server request workflows',
      'CRUD APIs exposing resources',
      'Web browser and mobile app communication'
    ],
    whenNotToUse: [
      'Bidirectional high-frequency streaming (prefer WebSockets or gRPC streaming)',
      'Heavy asynchronous background workloads (prefer message brokers)'
    ],
    coreMechanisms: [
      'Stateless request headers and HTTP status codes (2xx, 3xx, 4xx, 5xx)',
      'Standard methods: GET (idempotent read), POST (create), PUT (replace), PATCH (partial), DELETE',
      'Persistent connections via TCP keep-alive and HTTP/2 multiplexing'
    ],
    failureModes: [
      'Head-of-line blocking in HTTP/1.1',
      'Connection exhaustion if clients fail to close sockets',
      'Timeout cascades when upstream services stall'
    ],
    tradeoffs: 'Universal interoperability and human-readable text payloads vs higher serialization overhead compared to binary protocols like Protobuf.',
    alternatives: ['gRPC', 'WebSockets', 'GraphQL', 'AMQP']
  },
  {
    id: 'concept-load-balancer',
    title: 'Load Balancing (L4 / L7)',
    purpose: 'Distributes incoming network traffic across a group of backend servers to maximize throughput and minimize latency.',
    category: 'Scaling',
    whenToUse: [
      'When traffic exceeds the capacity of a single server machine',
      'To eliminate single points of failure (high availability)',
      'To enable zero-downtime rolling software deployments'
    ],
    whenNotToUse: [
      'Simple static websites hosted on serverless edges',
      'Direct peer-to-peer computing models'
    ],
    coreMechanisms: [
      'Layer 4 (Transport): Balances TCP/UDP packets by IP and port without reading application data',
      'Layer 7 (Application): Inspects HTTP headers, cookies, and URLs for smart content-based routing',
      'Algorithms: Round Robin, Least Connections, IP Hash, Weighted Response Time',
      'Active health checking: Automatically evicts unhealthy or crashing instances'
    ],
    failureModes: [
      'Single Point of Failure (SPOF) if the load balancer itself is unclustered',
      'Zombie routing if health-check endpoints report 200 OK while internal logic is hung',
      'Thundering herd if all backend servers reboot concurrently'
    ],
    tradeoffs: 'Enables horizontal scaling and seamless rolling upgrades, but introduces an extra network hop and adds session affinity complexity.',
    alternatives: ['DNS Round Robin', 'Anycast Routing', 'Client-side Load Balancing (Envoy)']
  },
  {
    id: 'concept-caching',
    title: 'In-Memory Caching (Redis / Memcached)',
    category: 'Databases',
    purpose: 'Stores high-frequency read data directly in RAM to achieve sub-millisecond responses and shield persistent databases.',
    whenToUse: [
      'Read-heavy workloads with high read-to-write ratios (80/20 rule)',
      'Session storage and user authentication tokens',
      'Rate-limiting counters and real-time leaderboards'
    ],
    whenNotToUse: [
      'Financial ledgers where zero data loss and strict durability are mandatory without write-behind sync',
      'Frequently mutated data where cache invalidation costs exceed query costs'
    ],
    coreMechanisms: [
      'Cache-Aside (Lazy Loading): Application queries cache first; on miss, loads from DB and writes to cache',
      'Write-Through / Write-Back: Cache intercepts writes and updates underlying storage',
      'Eviction Policies: LRU (Least Recently Used), LFU, TTL expiration'
    ],
    failureModes: [
      'Cache Stampede (Dog-piling): Key expires and thousands of concurrent requests all hit the DB at once',
      'Cache Penetration: Requests for non-existent keys bypass cache and hammer database',
      'Stale Data: Serving expired information due to missed invalidation hooks'
    ],
    tradeoffs: 'Drastic latency reduction (<2ms) and 10x database load relief vs cache invalidation headaches and potential memory cost.',
    alternatives: ['Application memory cache', 'CDN Edge Caching', 'Database Read Replicas']
  },
  {
    id: 'concept-kafka',
    title: 'Apache Kafka & Event Streaming',
    category: 'Messaging',
    purpose: 'Distributed, partitioned, replicated commit log service providing high-throughput publish-subscribe messaging.',
    whenToUse: [
      'High-throughput event ingestion (>10,000 events/second)',
      'Event Sourcing and audit log architectures',
      'Decoupled microservice event streams with multiple independent consumers'
    ],
    whenNotToUse: [
      'Simple job queues with complex per-message routing rules (prefer RabbitMQ)',
      'Low-volume monolithic task dispatching'
    ],
    coreMechanisms: [
      'Topics divided into Partitions for parallel consumption',
      'Consumer Groups: Workers cooperatively read assigned partitions maintaining offset pointers',
      'Retention-based persistence: Messages remain on disk for days regardless of whether they have been read'
    ],
    failureModes: [
      'Consumer Lag: Processing rate drops below production rate, causing delayed processing',
      'Hot Partitions: Skewed partition keys sending 90% of traffic to a single worker',
      'Rebalance Storms: Unstable consumers trigger frequent partition reassignments'
    ],
    tradeoffs: 'Extreme write performance, durability, and replayability vs higher operational complexity and ordering limited to individual partitions.',
    alternatives: ['RabbitMQ', 'AWS SQS / SNS', 'Google Cloud Pub/Sub', 'Apache Pulsar']
  },
  {
    id: 'concept-kubernetes',
    title: 'Kubernetes Container Orchestration',
    category: 'DevOps & Containers',
    purpose: 'Automates deployment, scaling, management, and self-healing of containerized applications across host clusters.',
    whenToUse: [
      'Managing multiple microservices across hybrid or cloud infrastructure',
      'Requiring declarative autoscaling (HPA) and automated rollbacks',
      'Standardizing development, staging, and production environments'
    ],
    whenNotToUse: [
      'Simple single-server applications with steady traffic (prefer Docker Compose or PaaS)',
      'Small teams without dedicated platform/DevOps engineering bandwidth'
    ],
    coreMechanisms: [
      'Control Plane: API Server, etcd, Scheduler, Controller Manager',
      'Workloads: Pods, Deployments, StatefulSets, DaemonSets',
      'Networking: ClusterIP, NodePort, Ingress, CNI Plugins',
      'Probes: Liveness (restarts crashed pods), Readiness (delays routing until warmed up)'
    ],
    failureModes: [
      'CrashLoopBackOff: Container fails to start or crashes immediately on launch',
      'OOMKilled: Process exceeds pod memory limit and gets terminated by Linux cgroups',
      'Ingress misconfiguration routing traffic to empty endpoints'
    ],
    tradeoffs: 'World-standard elasticity, vendor-neutral cloud portability, and declarative resilience vs significant steep learning curve and control plane cost.',
    alternatives: ['Docker Swarm', 'AWS ECS', 'Nomad', 'Cloud Run / Serverless']
  },
  {
    id: 'concept-opentelemetry',
    title: 'Observability & OpenTelemetry (OTel)',
    category: 'Observability',
    purpose: 'Vendor-agnostic telemetry framework providing APIs, SDKs, and tooling to generate and collect traces, metrics, and logs.',
    whenToUse: [
      'Microservice environments where debugging requires cross-service context',
      'Monitoring SLA/SLO compliance with P95 and P99 latency precision',
      'Root-cause analysis of distributed transaction delays'
    ],
    whenNotToUse: [
      'Trivial single-file scripts or static web pages'
    ],
    coreMechanisms: [
      'Distributed Traces: Trace ID propagated via W3C TraceContext headers across HTTP/gRPC boundaries',
      'Metrics: Counters, Gauges, and Histograms for rate and percentile tracking',
      'Structured Logging: JSON logs enriched with trace_id and span_id for instant correlation'
    ],
    failureModes: [
      'Telemetry overhead: Collecting 100% of traces at 50,000 req/s saturating collector network bandwidth (requires sampling)',
      'Unsampled traces missing rare error anomalies'
    ],
    tradeoffs: 'Empirical debugging and instant bottleneck isolation vs slight agent memory and network bandwidth consumption.',
    alternatives: ['Prometheus + Grafana', 'Datadog', 'New Relic', 'Jaeger']
  }
];
