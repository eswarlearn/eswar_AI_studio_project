import { ComponentId, InfrastructureComponent } from '../types/game';

export const INFRASTRUCTURE_COMPONENTS: Record<ComponentId, InfrastructureComponent> = {
  client: {
    id: 'client',
    name: 'Client App',
    category: 'client',
    description: 'Browser or mobile frontend application initiating HTTP/gRPC requests.',
    baseCost: 0,
    baseCapacity: 1000000,
    baseLatency: 0,
    failureModes: ['Client connection timeouts', 'Retries creating thunder herds'],
    tradeoffs: {
      pros: ['No infrastructure host cost for frontend runtime'],
      cons: ['Unpredictable spikes in demand and network latency variations']
    },
    supportedProtocols: ['HTTP/1.1', 'HTTP/2', 'HTTPS', 'WSS']
  },
  dns: {
    id: 'dns',
    name: 'DNS Resolver',
    category: 'network',
    description: 'Translates domain names to IP addresses with Geo-routing and health-checking.',
    baseCost: 5,
    baseCapacity: 100000,
    baseLatency: 12,
    failureModes: ['DNS cache poisoning', 'TTL stale routing during incident failover'],
    tradeoffs: {
      pros: ['Enables multi-region routing and global traffic distribution'],
      cons: ['Slow propagation when changing records during an outage']
    },
    supportedProtocols: ['UDP/53', 'DoH']
  },
  cdn: {
    id: 'cdn',
    name: 'Content Delivery Network',
    category: 'network',
    description: 'Edge cache network that serves static assets and cached API responses globally close to users.',
    baseCost: 15,
    baseCapacity: 50000,
    baseLatency: 8,
    failureModes: ['Cache stampede on purge', 'Serving stale sensitive responses'],
    tradeoffs: {
      pros: ['Absorbs up to 90% of read traffic before reaching origin servers', 'Drastically cuts P95 latency'],
      cons: ['Cache invalidation lag', 'Origin shielding configuration overhead']
    },
    supportedProtocols: ['HTTP/2', 'HTTP/3', 'HTTPS']
  },
  'load-balancer': {
    id: 'load-balancer',
    name: 'Load Balancer (L4/L7)',
    category: 'network',
    description: 'Distributes incoming traffic across healthy backend instances using Round-Robin or Least-Connections.',
    baseCost: 20,
    baseCapacity: 25000,
    baseLatency: 5,
    failureModes: ['Single point of failure if unclustered', 'Zombie routing to dead instances if healthchecks fail'],
    tradeoffs: {
      pros: ['Horizontal scalability', 'SSL termination', 'Zero-downtime rolling deploys'],
      cons: ['Additional network hop', 'Session stickiness complexity']
    },
    supportedProtocols: ['TCP', 'HTTP/1.1', 'HTTP/2']
  },
  'api-gateway': {
    id: 'api-gateway',
    name: 'API Gateway',
    category: 'network',
    description: 'Central entry point handling auth verification, rate limiting, request validation, and routing to microservices.',
    baseCost: 25,
    baseCapacity: 15000,
    baseLatency: 10,
    failureModes: ['Gateway bottleneck under intense CPU crypto hashing', 'Cascading timeouts if upstream hangs'],
    tradeoffs: {
      pros: ['Centralized authentication, rate-limiting, and telemetry', 'Shields internal microservices'],
      cons: ['Potential choke point', 'Increased blast radius if gateway crashes']
    },
    supportedProtocols: ['REST', 'gRPC', 'GraphQL']
  },
  server: {
    id: 'server',
    name: 'API Server',
    category: 'compute',
    description: 'Stateless application server handling business logic, data validation, and database queries.',
    baseCost: 20,
    baseCapacity: 100, // 100 req/s per single instance
    baseLatency: 35,
    failureModes: ['CPU saturation on heavy computations', 'Thread/Connection pool exhaustion'],
    tradeoffs: {
      pros: ['Stateless design allows rapid horizontal scaling'],
      cons: ['Cold starts and resource limits if not autoscaled properly']
    },
    supportedProtocols: ['HTTP/1.1', 'HTTP/2', 'TCP']
  },
  'docker-container': {
    id: 'docker-container',
    name: 'Docker Container',
    category: 'compute',
    description: 'Isolated application container with packaged dependencies, reproducible builds, and isolated filesystem.',
    baseCost: 15,
    baseCapacity: 150,
    baseLatency: 25,
    failureModes: ['OOMKilled when memory limit is exceeded', 'Port binding conflicts'],
    tradeoffs: {
      pros: ['Environment parity from dev to prod', 'Fast startup times (<1s)'],
      cons: ['Requires container registry, image vulnerability scanning, and lifecycle governance']
    },
    supportedProtocols: ['HTTP', 'gRPC']
  },
  'k8s-pod': {
    id: 'k8s-pod',
    name: 'Kubernetes Pod Replica',
    category: 'compute',
    description: 'Orchestrated container workload with self-healing, rolling updates, readiness probes, and HPA autoscaling.',
    baseCost: 28,
    baseCapacity: 250,
    baseLatency: 20,
    failureModes: ['CrashLoopBackOff', 'Failed readiness probe removing pod from service pool'],
    tradeoffs: {
      pros: ['Declarative autoscaling', 'Automated rollbacks', 'Self-healing restarts'],
      cons: ['Kubernetes cluster control plane overhead and configuration complexity']
    },
    supportedProtocols: ['ClusterIP', 'Ingress', 'gRPC']
  },
  redis: {
    id: 'redis',
    name: 'Redis In-Memory Cache',
    category: 'storage',
    description: 'Sub-millisecond key-value in-memory data store for caching, sessions, and fast distributed counters.',
    baseCost: 25,
    baseCapacity: 30000,
    baseLatency: 2,
    failureModes: ['Cache stampede on eviction', 'Memory exhaustion if eviction policy is misconfigured'],
    tradeoffs: {
      pros: ['Cuts database load by 80-95%', 'Ultra-low latency (<2ms)'],
      cons: ['Eventual consistency / stale data risk', 'Cache invalidation challenges']
    },
    supportedProtocols: ['RESP', 'TCP']
  },
  postgresql: {
    id: 'postgresql',
    name: 'PostgreSQL Relational DB',
    category: 'storage',
    description: 'ACID-compliant relational database for structured transactions, indexes, and relational integrity.',
    baseCost: 40,
    baseCapacity: 250, // 250 direct queries/s before connection saturation
    baseLatency: 40,
    failureModes: ['Connection pool starvation', 'Unindexed table scans causing 100% CPU lockups'],
    tradeoffs: {
      pros: ['Strong consistency', 'Complex JOIN queries', 'ACID transactions'],
      cons: ['Harder to scale writes horizontally', 'Vulnerable to connection exhaustion under sudden spikes']
    },
    supportedProtocols: ['PostgreSQL Wire', 'SQL']
  },
  mongodb: {
    id: 'mongodb',
    name: 'MongoDB Document DB',
    category: 'storage',
    description: 'Flexible JSON schema document database designed for fast horizontal sharding and polymorphic data.',
    baseCost: 35,
    baseCapacity: 400,
    baseLatency: 30,
    failureModes: ['Unbounded array document growth', 'Write lock contention on un-sharded clusters'],
    tradeoffs: {
      pros: ['Dynamic schema', 'Easy horizontal sharding out of the box'],
      cons: ['Multi-document transaction overhead', 'Higher disk memory footprint']
    },
    supportedProtocols: ['Mongo Wire', 'TCP']
  },
  kafka: {
    id: 'kafka',
    name: 'Apache Kafka Event Stream',
    category: 'messaging',
    description: 'High-throughput distributed append-only commit log for decoupled event publishing and real-time streaming.',
    baseCost: 45,
    baseCapacity: 40000,
    baseLatency: 8,
    failureModes: ['Consumer lag accumulation when consumers are slower than producers', 'Hot partitions'],
    tradeoffs: {
      pros: ['Absorbs gigantic bursts', 'Event replayability', 'Extreme write throughput with partitioning'],
      cons: ['Requires offset management, consumer group monitoring, and ZooKeeper/KRaft cluster care']
    },
    supportedProtocols: ['Kafka Protocol', 'TCP']
  },
  rabbitmq: {
    id: 'rabbitmq',
    name: 'RabbitMQ Message Broker',
    category: 'messaging',
    description: 'AMQP message broker with flexible exchanges, routing keys, priority queues, and dead-lettering.',
    baseCost: 30,
    baseCapacity: 12000,
    baseLatency: 6,
    failureModes: ['Queue memory backpressure blocking publishers', 'Unacknowledged message leaks'],
    tradeoffs: {
      pros: ['Rich routing topologies (Direct, Topic, Fanout, Headers)', 'Guaranteed acknowledgements & DLQ'],
      cons: ['Messages deleted after ack (no log replay like Kafka)']
    },
    supportedProtocols: ['AMQP 0-9-1', 'MQTT']
  },
  'telemetry-collector': {
    id: 'telemetry-collector',
    name: 'OpenTelemetry Collector',
    category: 'observability',
    description: 'Ingests, samples, filters, and exports distributed traces, metrics, and structured logs to monitoring backends.',
    baseCost: 18,
    baseCapacity: 50000,
    baseLatency: 1,
    failureModes: ['Collector memory buffer drops spans during network partitions'],
    tradeoffs: {
      pros: ['Deep visibility into P95/P99 latency bottlenecks across all microservices'],
      cons: ['Slight agent memory and network bandwidth overhead']
    },
    supportedProtocols: ['OTLP/gRPC', 'OTLP/HTTP']
  },
  'waf-firewall': {
    id: 'waf-firewall',
    name: 'WAF & DDoS Shield',
    category: 'security',
    description: 'Web Application Firewall filtering malicious requests, SQL injection attempts, bots, and rate limiting IP floods.',
    baseCost: 22,
    baseCapacity: 30000,
    baseLatency: 4,
    failureModes: ['False positives blocking legitimate payment webhook traffic'],
    tradeoffs: {
      pros: ['Blocks OWASP Top 10 vulnerabilities and volumetric DDoS before hitting servers'],
      cons: ['Rule tuning and inspection latency']
    },
    supportedProtocols: ['HTTPS']
  },
  'worker-service': {
    id: 'worker-service',
    name: 'Async Background Worker',
    category: 'compute',
    description: 'Asynchronously consumes events from queues, processes emails, invoices, video transcode, and batch jobs.',
    baseCost: 20,
    baseCapacity: 200,
    baseLatency: 15,
    failureModes: ['Poison pill messages causing endless crash retries without Dead Letter Queue'],
    tradeoffs: {
      pros: ['Decouples heavy computation from user request latency'],
      cons: ['Requires idempotent job handlers to tolerate at-least-once delivery']
    },
    supportedProtocols: ['AMQP', 'Kafka Wire']
  }
};
