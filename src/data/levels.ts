import { Level } from '../types/game';

export const LEVELS: Level[] = [
  {
    id: 1,
    worldId: 'foundations',
    title: 'The First Request',
    subtitle: 'The fundamental client-server handshake',
    difficulty: 1,
    concepts: ['client', 'server', 'http-request', 'http-response'],
    targetRps: 20,
    briefing: {
      title: 'Connecting Client to Server',
      conceptIntro: 'Every backend journey starts with a simple premise: a client (browser, mobile app, CLI) initiates a request, and a server listening on a socket processes it and returns a response.',
      realWorldScenario: 'You are launching a personal blog. When visitors open your URL, their browser sends an HTTP GET request to your API server running in a cloud VM.',
      objectives: [
        'Place a Client component on the canvas',
        'Place an API Server component on the canvas',
        'Connect the Client to the API Server',
        'Maintain healthy 20 req/s throughput with <100ms latency'
      ],
      deepDive: {
        whyItMatters: 'Stateless HTTP requests allow servers to serve requests independently without maintaining memory-heavy persistent client state between visits.',
        tradeoffs: 'Direct client-to-server connections work for low traffic, but leave the server exposed without a buffer or load distributor.',
        keyMetrics: ['Throughput (req/s)', 'P95 Latency (ms)', 'Error Rate (%)']
      }
    },
    allowedComponents: ['client', 'server'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Web Client',
        position: { x: 120, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 15,
      maxLatencyMs: 120,
      maxErrorRate: 0.01,
      requiredComponents: ['client', 'server'],
      requiredConnections: [['client', 'server']]
    },
    quiz: [
      {
        id: 'q1-1',
        prompt: 'What happens when a client sends an HTTP request to a server?',
        category: 'HTTP Basics',
        options: [
          {
            id: 'opt1',
            text: 'The server executes business logic, queries data if needed, and returns an HTTP status code and response payload.',
            isCorrect: true,
            explanation: 'Correct! The request-response cycle completes when the server sends headers, status (e.g. 200 OK), and body back to the socket.'
          },
          {
            id: 'opt2',
            text: 'The client directly writes raw records to the server memory chips.',
            isCorrect: false,
            explanation: 'Clients never have direct hardware memory access; communication occurs via high-level application protocols (HTTP/TCP).'
          },
          {
            id: 'opt3',
            text: 'The server immediately terminates the client process permanently.',
            isCorrect: false,
            explanation: 'Servers respond to requests; they do not terminate client operating system processes.'
          }
        ]
      }
    ],
    reflection: {
      summary: 'You established your very first operational request-response pipeline!',
      takeaway: 'All modern backend engineering builds upon this foundation: clients dispatch intent, and servers validate and fulfill that intent.',
      realWorldAnalogy: 'Like placing an order at a coffee shop counter: customer asks, barista prepares, coffee is handed back.'
    },
    rewards: {
      xp: 100,
      achievementId: 'first_request'
    }
  },
  {
    id: 2,
    worldId: 'foundations',
    title: 'DNS Resolution',
    subtitle: 'Translating human names to IP addresses',
    difficulty: 1,
    concepts: ['dns', 'ip-routing', 'domain-names'],
    targetRps: 50,
    briefing: {
      title: 'The Internet Phonebook',
      conceptIntro: 'Computers do not natively route requests via human domain names like "api.myapp.com"; they require IP addresses. A DNS resolver translates domain names before the client reaches the destination server.',
      realWorldScenario: 'Your app launched under a custom domain name. Traffic is growing to 50 req/s, and clients need rapid IP resolution.',
      objectives: [
        'Route the Client through the DNS Resolver',
        'Connect DNS Resolver to the API Server',
        'Verify resolution latency stays under 100ms'
      ]
    },
    allowedComponents: ['client', 'dns', 'server'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Client',
        position: { x: 100, y: 220 },
        connections: []
      },
      {
        instanceId: 'server-1',
        componentId: 'server',
        label: 'API Server',
        position: { x: 550, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 45,
      maxLatencyMs: 120,
      maxErrorRate: 0.02,
      requiredComponents: ['client', 'dns', 'server'],
      requiredConnections: [['client', 'dns'], ['dns', 'server']]
    },
    quiz: [
      {
        id: 'q2-1',
        prompt: 'Why do DNS records use TTL (Time-To-Live)?',
        category: 'Networking',
        options: [
          {
            id: 'opt1',
            text: 'To tell intermediate resolvers and clients how long to cache the IP mapping before querying the authoritative nameserver again.',
            isCorrect: true,
            explanation: 'TTL balances DNS query traffic with the ability to quickly shift traffic to new server IPs during migrations or outages.'
          },
          {
            id: 'opt2',
            text: 'To automatically delete the API server code after 60 seconds.',
            isCorrect: false,
            explanation: 'TTL only dictates DNS caching durations, not server lifespan.'
          }
        ]
      }
    ],
    reflection: {
      summary: 'DNS layer connected! Your domain is resolving effortlessly.',
      takeaway: 'DNS enables flexible routing and failover by changing IP pointers without requiring client code changes.',
      realWorldAnalogy: 'Like looking up a friend in your phone contacts: you remember the name "Alice", but the network dials the phone number.'
    },
    rewards: {
      xp: 120
    }
  },
  {
    id: 3,
    worldId: 'foundations',
    title: 'Content Delivery Network (CDN)',
    subtitle: 'Absorbing traffic at the edge',
    difficulty: 2,
    concepts: ['cdn', 'edge-computing', 'caching', 'latency'],
    targetRps: 150,
    briefing: {
      title: 'Shielding Origins with Edge Caching',
      conceptIntro: 'When users from all around the world hit your origin server, physical distance adds latency (speed of light in fiber). A CDN places proxy servers at the edge close to end users, serving cached assets and API responses instantly.',
      realWorldScenario: 'A global product launch drove 150 req/s. Your lone origin server is starting to sweat. Placing a CDN in front reduces load by up to 70%.',
      objectives: [
        'Place a CDN between the Client and the API Server',
        'Connect Client -> CDN -> API Server',
        'Observe dramatic drop in average latency'
      ]
    },
    allowedComponents: ['client', 'cdn', 'server'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Global Clients',
        position: { x: 100, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 130,
      maxLatencyMs: 65,
      maxErrorRate: 0.01,
      requiredComponents: ['client', 'cdn', 'server'],
      requiredConnections: [['client', 'cdn'], ['cdn', 'server']]
    },
    reflection: {
      summary: 'CDN edge activated! Static latency plummeted under 50ms.',
      takeaway: 'The best request is the one that never hits your origin database or compute servers.',
      realWorldAnalogy: 'Like local neighborhood warehouses storing popular items so you do not wait for a truck from the other side of the planet.'
    },
    rewards: {
      xp: 150,
      achievementId: 'edge_master'
    }
  },
  {
    id: 4,
    worldId: 'foundations',
    title: 'The RESTful API Gateway',
    subtitle: 'Request validation, routing, and centralized auth',
    difficulty: 2,
    concepts: ['api-gateway', 'rest', 'middleware', 'auth'],
    targetRps: 200,
    briefing: {
      title: 'Gatekeeping the Backend',
      conceptIntro: 'Exposing individual backend servers directly to the public internet creates a security and management headache. An API Gateway acts as a reverse proxy that inspects incoming requests, validates tokens, and routes traffic cleanly.',
      realWorldScenario: 'Your engineering team needs to enforce authentication and rate limiting on all incoming client requests before they touch internal server business logic.',
      objectives: [
        'Assemble: Client -> API Gateway -> API Server',
        'Handle 200 req/s smoothly with centralized gateway ingress'
      ]
    },
    allowedComponents: ['client', 'api-gateway', 'server'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Client Mobile App',
        position: { x: 100, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 180,
      maxLatencyMs: 80,
      maxErrorRate: 0.01,
      requiredComponents: ['client', 'api-gateway', 'server'],
      requiredConnections: [['client', 'api-gateway'], ['api-gateway', 'server']]
    },
    reflection: {
      summary: 'Centralized API Gateway deployed and securing backend traffic.',
      takeaway: 'Gateways decouple public API contracts from internal microservice implementations.',
      realWorldAnalogy: 'Like the reception desk and security checkpoint in an office building.'
    },
    rewards: {
      xp: 160
    }
  },
  {
    id: 5,
    worldId: 'databases',
    title: 'Persistent Storage with PostgreSQL',
    subtitle: 'ACID guarantees and relational integrity',
    difficulty: 2,
    concepts: ['postgresql', 'persistence', 'acid', 'sql'],
    targetRps: 80,
    briefing: {
      title: 'Stateless Servers, Stateful Database',
      conceptIntro: 'Servers should be stateless so they can be restarted or scaled at will. Permanent user data—accounts, purchases, documents—must reside in a persistent database with ACID transactional guarantees.',
      realWorldScenario: 'Your app needs to store user signups and transaction records. If a server reboots, user data must remain completely safe on disk.',
      objectives: [
        'Connect Client to API Server',
        'Connect API Server to PostgreSQL Database',
        'Handle 80 persistent transactional operations per second'
      ]
    },
    allowedComponents: ['client', 'server', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Web Client',
        position: { x: 100, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 70,
      maxLatencyMs: 140,
      maxErrorRate: 0.02,
      requiredComponents: ['client', 'server', 'postgresql'],
      requiredConnections: [['client', 'server'], ['server', 'postgresql']]
    },
    quiz: [
      {
        id: 'q5-1',
        prompt: 'What does the "A" in ACID database transactions stand for?',
        category: 'Databases',
        options: [
          {
            id: 'opt1',
            text: 'Atomicity: all operations in a transaction succeed completely, or none of them take effect (all-or-nothing).',
            isCorrect: true,
            explanation: 'Atomicity prevents partial writes (e.g. money deducted from Account A but never deposited into Account B).'
          },
          {
            id: 'opt2',
            text: 'Asynchronous: queries are sent without waiting for disk writes.',
            isCorrect: false,
            explanation: 'ACID stands for Atomicity, Consistency, Isolation, Durability.'
          }
        ]
      }
    ],
    reflection: {
      summary: 'Relational database online with ACID transactional safety.',
      takeaway: 'Separating stateless compute from stateful storage is the cardinal rule of cloud scalability.',
      realWorldAnalogy: 'Like a ledger vault in a bank: bank tellers can change shifts, but the vault remains immutable.'
    },
    rewards: {
      xp: 180,
      achievementId: 'database_keeper'
    }
  },
  {
    id: 6,
    worldId: 'databases',
    title: 'The In-Memory Cache: Redis',
    subtitle: 'Cache-aside pattern and sub-millisecond lookups',
    difficulty: 2,
    concepts: ['redis', 'caching', 'cache-aside', 'latency-reduction'],
    targetRps: 300,
    briefing: {
      title: 'Shielding the Database with Redis',
      conceptIntro: 'Disks are orders of magnitude slower than RAM. When thousands of users request the same hot data (e.g. popular product profiles), repeatedly querying PostgreSQL will saturate disk I/O and lock tables. Redis stores key-value data directly in RAM.',
      realWorldScenario: 'Your user base spiked to 300 req/s. PostgreSQL is bottlenecking under repetitive read queries. Introducing Redis cache-aside handles 85% of reads in <2ms.',
      objectives: [
        'Assemble Client -> API Server',
        'Connect API Server to Redis (for hot reads) AND PostgreSQL (for persistent writes)',
        'Achieve <60ms average latency under 300 req/s'
      ]
    },
    allowedComponents: ['client', 'server', 'redis', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Clients',
        position: { x: 100, y: 220 },
        connections: []
      },
      {
        instanceId: 'server-1',
        componentId: 'server',
        label: 'API Server',
        position: { x: 340, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 260,
      maxLatencyMs: 65,
      maxErrorRate: 0.02,
      requiredComponents: ['client', 'server', 'redis', 'postgresql'],
      requiredConnections: [['client', 'server'], ['server', 'redis'], ['server', 'postgresql']]
    },
    reflection: {
      summary: 'Redis cache-aside successfully absorbed repetitive queries!',
      takeaway: 'Always remember: with caching comes cache invalidation complexity and potential stale data trade-offs.',
      realWorldAnalogy: 'Like keeping a scratchpad on your desk with the day\'s common answers instead of walking to the filing cabinet room every minute.'
    },
    rewards: {
      xp: 220,
      achievementId: 'cache_master'
    }
  },
  {
    id: 7,
    worldId: 'databases',
    title: 'Document Storage with MongoDB',
    subtitle: 'Dynamic JSON schemas and polymorphic records',
    difficulty: 3,
    concepts: ['mongodb', 'nosql', 'json-documents', 'sharding'],
    targetRps: 250,
    briefing: {
      title: 'When Rigid Tables Are Not Enough',
      conceptIntro: 'Some domain models have highly dynamic, nested attributes (e.g. IoT telemetry events, catalog items with hundreds of varying specs). A document database like MongoDB stores rich JSON-like documents natively.',
      realWorldScenario: 'You are ingesting IoT sensor readings with fluctuating sensor payloads from 250 devices simultaneously.',
      objectives: [
        'Connect Client -> API Server -> MongoDB',
        'Maintain high write throughput without schema migration friction'
      ]
    },
    allowedComponents: ['client', 'server', 'mongodb', 'redis'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'IoT Devices',
        position: { x: 100, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 220,
      maxLatencyMs: 90,
      maxErrorRate: 0.02,
      requiredComponents: ['client', 'server', 'mongodb'],
      requiredConnections: [['client', 'server'], ['server', 'mongodb']]
    },
    reflection: {
      summary: 'Document store operational for high-speed flexible JSON payloads.',
      takeaway: 'Pick the right database for the job: Relational for structured transactional consistency; Document for polymorphic or nested hierarchical structures.',
      realWorldAnalogy: 'Like storing folders with varied loose documents vs. a rigid ledger book with fixed printed columns.'
    },
    rewards: {
      xp: 200
    }
  },
  {
    id: 8,
    worldId: 'scaling',
    title: 'Horizontal Scaling with Load Balancing',
    subtitle: 'No single point of failure',
    difficulty: 3,
    concepts: ['load-balancer', 'horizontal-scaling', 'high-availability'],
    targetRps: 500,
    briefing: {
      title: 'Distributing the Weight',
      conceptIntro: 'Vertical scaling (buying a bigger machine) eventually hits physical limits and prohibitive costs. Horizontal scaling (adding more identical servers) lets you scale infinitely. A Load Balancer distributes requests using algorithms like Round Robin or Least Connections.',
      realWorldScenario: 'Traffic surged to 500 req/s. A single server can only handle 100 req/s before CPU melts. Deploy a Load Balancer and multiple API servers to conquer the surge.',
      objectives: [
        'Connect Client to Load Balancer',
        'Deploy multiple API Server instances behind the Load Balancer',
        'Connect servers to PostgreSQL',
        'Scale capacity to absorb 500 req/s with 0% dropped packets'
      ]
    },
    allowedComponents: ['client', 'load-balancer', 'server', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Traffic Surge',
        position: { x: 80, y: 240 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 450,
      maxLatencyMs: 110,
      maxErrorRate: 0.02,
      requiredComponents: ['client', 'load-balancer', 'server', 'postgresql'],
      requiredConnections: [['client', 'load-balancer'], ['load-balancer', 'server'], ['server', 'postgresql']]
    },
    reflection: {
      summary: 'Horizontal scale achieved! The cluster effortlessly balances 500 req/s.',
      takeaway: 'Stateless servers paired with load balancers eliminate single points of failure (SPOF) and enable seamless maintenance.',
      realWorldAnalogy: 'Like opening 4 cashier lanes during rush hour rather than expecting 1 cashier to ring up items 4 times faster.'
    },
    rewards: {
      xp: 280,
      achievementId: 'no_single_point'
    }
  },
  {
    id: 9,
    worldId: 'scaling',
    title: 'Surge Defense: Rate Limiting & WAF',
    subtitle: 'Preventing brute-force exhaustion and runaway scripts',
    difficulty: 3,
    concepts: ['waf-firewall', 'rate-limiting', 'ddos', 'security'],
    targetRps: 600,
    briefing: {
      title: 'Shielding Compute from Bad Actors',
      conceptIntro: 'Without rate limiting and edge firewalls, a rogue scraper or malicious actor can flood your servers with thousands of fake requests, starving real customers of resources.',
      realWorldScenario: 'A scraper bot launched a burst of 600 req/s. Put a WAF / DDoS Shield at the network frontier to inspect and throttle traffic before it reaches your load balancer.',
      objectives: [
        'Client -> WAF Firewall -> Load Balancer -> Servers -> PostgreSQL',
        'Filter suspicious traffic and maintain smooth operations'
      ]
    },
    allowedComponents: ['client', 'waf-firewall', 'load-balancer', 'server', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Public Internet Traffic',
        position: { x: 80, y: 240 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 550,
      maxLatencyMs: 120,
      maxErrorRate: 0.02,
      requiredComponents: ['client', 'waf-firewall', 'load-balancer', 'server'],
      requiredConnections: [['client', 'waf-firewall'], ['waf-firewall', 'load-balancer']]
    },
    reflection: {
      summary: 'Edge protection verified. Malicious spikes are filtered before compute layers.',
      takeaway: 'Security and scaling are two sides of the same coin: rate-limiting protects availability as much as firewalls protect integrity.',
      realWorldAnalogy: 'Like a nightclub bouncer checking IDs and pacing the line outside so the venue inside does not become dangerously overcrowded.'
    },
    rewards: {
      xp: 300
    }
  },
  {
    id: 10,
    worldId: 'scaling',
    title: 'Cost-Optimized Scale Engine',
    subtitle: 'Balancing performance budgets and infrastructure cost',
    difficulty: 3,
    concepts: ['cost-optimization', 'budget', 'latency-budget', 'capacity-planning'],
    targetRps: 1000,
    briefing: {
      title: 'Engineering is the Art of Tradeoffs',
      conceptIntro: 'Anyone can build a fast backend by burning infinite money. A true engineer meets latency SLOs while keeping cloud bills disciplined.',
      realWorldScenario: 'Handle 1,000 req/s with P95 latency < 90ms, but your hourly infrastructure budget is strictly capped at $150/hour.',
      objectives: [
        'Design a high-throughput architecture for 1,000 req/s',
        'Use Redis caching and CDN to avoid deploying dozens of expensive raw servers',
        'Keep total hourly infrastructure cost under $150'
      ]
    },
    allowedComponents: ['client', 'cdn', 'load-balancer', 'server', 'redis', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: '1,000 Users/s',
        position: { x: 80, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 900,
      maxLatencyMs: 85,
      maxErrorRate: 0.02,
      maxHourlyCost: 150,
      requiredComponents: ['client', 'cdn', 'load-balancer', 'redis']
    },
    reflection: {
      summary: 'Target met under budget! High performance without wasteful over-provisioning.',
      takeaway: 'A CDN and Redis in-memory cache often cost 10x less than provisioning dozens of extra raw compute servers to handle repetitive load.',
      realWorldAnalogy: 'Insulating your house well instead of running the furnace at full blast all winter long.'
    },
    rewards: {
      xp: 350,
      achievementId: 'cost_cutter'
    }
  },
  {
    id: 11,
    worldId: 'containers',
    title: 'Dockerizing the Backend',
    subtitle: 'Immutable artifacts and environment parity',
    difficulty: 2,
    concepts: ['docker-container', 'containers', 'dockerfile', 'isolation'],
    targetRps: 300,
    briefing: {
      title: '"It works on my machine" is dead',
      conceptIntro: 'Containers package application code, runtime (Node, Go, Python), system tools, and libraries into a single lightweight immutable image. Wherever Docker runs, your app runs identically.',
      realWorldScenario: 'Replace bare metal server VMs with lightweight Docker containers for fast boot times and consistent deployments.',
      objectives: [
        'Connect Client -> Load Balancer -> Docker Containers -> Database',
        'Observe faster response times and isolated compute'
      ]
    },
    allowedComponents: ['client', 'load-balancer', 'docker-container', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Client Traffic',
        position: { x: 100, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 270,
      maxLatencyMs: 95,
      maxErrorRate: 0.02,
      requiredComponents: ['client', 'load-balancer', 'docker-container'],
      requiredConnections: [['client', 'load-balancer'], ['load-balancer', 'docker-container']]
    },
    reflection: {
      summary: 'Docker containers spinning up with standardized execution environments.',
      takeaway: 'Containers provide process-level isolation on top of the host Linux kernel without hypervisor OS virtualization overhead.',
      realWorldAnalogy: 'Like intermodal shipping containers that fit identically on trains, trucks, and cargo ships worldwide.'
    },
    rewards: {
      xp: 300,
      achievementId: 'container_captain'
    }
  },
  {
    id: 12,
    worldId: 'containers',
    title: 'Multi-Container Compose Stack',
    subtitle: 'Container networking and multi-service orchestration',
    difficulty: 3,
    concepts: ['docker-container', 'docker-compose', 'bridge-network', 'service-linking'],
    targetRps: 500,
    briefing: {
      title: 'Composing the Full Microstack',
      conceptIntro: 'Real systems rarely consist of just one container. Docker Compose defines multi-container stacks—linking web apps, caching layers, and database containers on private virtual bridge networks.',
      realWorldScenario: 'Assemble a complete containerized stack: Load Balancer, Dockerized APIs, Redis cache container, and PostgreSQL container.',
      objectives: [
        'Wire Client -> Load Balancer -> Docker Containers',
        'Wire Containers to both Redis and PostgreSQL containers',
        'Maintain 500 req/s with low latency'
      ]
    },
    allowedComponents: ['client', 'load-balancer', 'docker-container', 'redis', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Clients',
        position: { x: 80, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 450,
      maxLatencyMs: 80,
      maxErrorRate: 0.02,
      requiredComponents: ['client', 'load-balancer', 'docker-container', 'redis', 'postgresql']
    },
    reflection: {
      summary: 'Complete multi-container local stack orchestrated flawlessly.',
      takeaway: 'Internal container networks keep databases inaccessible from the public internet while allowing authorized backend containers to communicate freely.',
      realWorldAnalogy: 'A secure office floor where internal team members talk face-to-face, but guests must enter through the lobby desk.'
    },
    rewards: {
      xp: 350
    }
  },
  {
    id: 13,
    worldId: 'kubernetes',
    title: 'Kubernetes Pod Fleet',
    subtitle: 'Declarative orchestration, self-healing, and service discovery',
    difficulty: 3,
    concepts: ['k8s-pod', 'kubernetes', 'replica-set', 'clusterip', 'ingress'],
    targetRps: 800,
    briefing: {
      title: 'Enter the Container Orchestrator',
      conceptIntro: 'When you manage dozens or hundreds of containers across multiple physical machines, you need Kubernetes. K8s monitors pod health, auto-replaces failed pods, and balances traffic via Services and Ingress controllers.',
      realWorldScenario: 'Deploy Kubernetes Pod Replicas behind a cluster Ingress / Load Balancer. If one pod crashes, the cluster control plane instantly redirects traffic to healthy replicas.',
      objectives: [
        'Deploy Client -> Load Balancer / Ingress',
        'Distribute traffic across Kubernetes Pod Replicas',
        'Connect Pods to persistent PostgreSQL and Redis',
        'Handle 800 req/s with self-healing resiliency'
      ]
    },
    allowedComponents: ['client', 'load-balancer', 'k8s-pod', 'redis', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Enterprise Clients',
        position: { x: 80, y: 240 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 720,
      maxLatencyMs: 90,
      maxErrorRate: 0.02,
      requiredComponents: ['client', 'load-balancer', 'k8s-pod'],
      requiredConnections: [['client', 'load-balancer'], ['load-balancer', 'k8s-pod']]
    },
    reflection: {
      summary: 'Kubernetes cluster active! Pod replicas handling dynamic scheduling.',
      takeaway: 'Kubernetes moves infrastructure management from imperative manual commands to declarative desired-state reconciliation loops.',
      realWorldAnalogy: 'Like an airport flight controller orchestrating gates, runways, and baggage handlers automatically.'
    },
    rewards: {
      xp: 400,
      achievementId: 'k8s_master'
    }
  },
  {
    id: 14,
    worldId: 'kubernetes',
    title: 'Zero-Downtime Rolling Updates',
    subtitle: 'Readiness probes, canary deployments, and graceful rollbacks',
    difficulty: 4,
    concepts: ['rolling-update', 'readiness-probe', 'zero-downtime', 'canary'],
    targetRps: 1200,
    briefing: {
      title: 'Upgrading the Plane While in Mid-Flight',
      conceptIntro: 'Deploying a new release must never drop active customer requests. Kubernetes readiness probes ensure new pods are completely initialized before routing user traffic to them, gradually retiring old pods one-by-one.',
      realWorldScenario: 'You are deploying a major release during peak 1,200 req/s traffic. Protect database connections with Redis and ensure zero downtime.',
      objectives: [
        'Architect high-capacity K8s cluster: CDN -> Ingress -> K8s Pods -> Redis + PostgreSQL',
        'Sustain 1,200 req/s with error rate < 1%'
      ]
    },
    allowedComponents: ['client', 'cdn', 'load-balancer', 'k8s-pod', 'redis', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: '1.2K req/s Ingress',
        position: { x: 70, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 1100,
      maxLatencyMs: 70,
      maxErrorRate: 0.01,
      requiredComponents: ['client', 'cdn', 'load-balancer', 'k8s-pod', 'redis']
    },
    reflection: {
      summary: 'Zero-downtime deployment accomplished during peak load!',
      takeaway: 'Readiness and liveness probes are essential guards against serving errors from cold or hung processes.',
      realWorldAnalogy: 'Like replacing train cars on the track without bringing the train to a halt.'
    },
    rewards: {
      xp: 450,
      achievementId: 'zero_downtime'
    }
  },
  {
    id: 15,
    worldId: 'messaging',
    title: 'Async Processing with RabbitMQ',
    subtitle: 'Decoupling heavy tasks with message queues',
    difficulty: 3,
    concepts: ['rabbitmq', 'message-queue', 'async-processing', 'worker-service'],
    targetRps: 400,
    briefing: {
      title: 'Do Not Make Users Wait for Slow Work',
      conceptIntro: 'When a user clicks "Place Order", generating PDF invoices and sending emails takes 2-5 seconds. If the API server does this synchronously, the user waits and HTTP connections freeze. Instead, push an event into RabbitMQ and return 202 Accepted immediately. Async background workers process the queue.',
      realWorldScenario: 'Order checkout latency is frustrating users. Move heavy email, PDF, and payment notifications to RabbitMQ and background worker services.',
      objectives: [
        'Client -> API Server -> RabbitMQ -> Worker Service',
        'API Server also records the order into PostgreSQL',
        'Drop user-facing latency below 45ms'
      ]
    },
    allowedComponents: ['client', 'server', 'rabbitmq', 'worker-service', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Checkout Clients',
        position: { x: 80, y: 240 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 350,
      maxLatencyMs: 50,
      maxErrorRate: 0.02,
      requiredComponents: ['client', 'server', 'rabbitmq', 'worker-service', 'postgresql'],
      requiredConnections: [['server', 'rabbitmq'], ['rabbitmq', 'worker-service']]
    },
    reflection: {
      summary: 'Asynchronous decoupling complete! Order response latency plummeted.',
      takeaway: 'Queues smooth out traffic spikes (load leveling) by allowing consumers to process jobs at their own sustainable pace.',
      realWorldAnalogy: 'Like getting a buzzer at a busy burger restaurant: you take your seat immediately and get called when your meal is ready.'
    },
    rewards: {
      xp: 420
    }
  },
  {
    id: 16,
    worldId: 'messaging',
    title: 'Event Streaming with Apache Kafka',
    subtitle: 'Distributed commit logs, partitions, and high-throughput streaming',
    difficulty: 4,
    concepts: ['kafka', 'event-streaming', 'partitions', 'consumer-groups'],
    targetRps: 2500,
    briefing: {
      title: 'The Backbone of Modern Event Architecture',
      conceptIntro: 'While RabbitMQ handles discrete point-to-point task queues, Apache Kafka is an immutable distributed event log. Kafka scales to millions of events per second through partition parallelism, allowing multiple independent consumer groups (Fraud, Billing, Analytics) to read the same stream without interfering.',
      realWorldScenario: 'You are streaming 2,500 real-time events/sec from payments, telemetry, and activity logs. Stream through Kafka to multiple downstream worker processors.',
      objectives: [
        'Client -> API Server -> Kafka',
        'Connect Kafka to multiple Worker Services and PostgreSQL',
        'Handle 2,500 events/s with zero dropped records'
      ]
    },
    allowedComponents: ['client', 'load-balancer', 'server', 'kafka', 'worker-service', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Event Ingestion',
        position: { x: 70, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 2200,
      maxLatencyMs: 75,
      maxErrorRate: 0.02,
      requiredComponents: ['client', 'kafka', 'worker-service']
    },
    reflection: {
      summary: 'Apache Kafka streaming at scale with partitioned consumer groups!',
      takeaway: 'Kafka stores events for replayability and audit trails, turning real-time state changes into a historical source of truth.',
      realWorldAnalogy: 'Like an indelible recording tape that multiple journalists can transcribe at their own speeds.'
    },
    rewards: {
      xp: 500,
      achievementId: 'kafka_keeper'
    }
  },
  {
    id: 17,
    worldId: 'microservices',
    title: 'Microservices with API Gateway',
    subtitle: 'Service decomposition and single point of ingress',
    difficulty: 4,
    concepts: ['api-gateway', 'microservices', 'service-boundaries', 'grpc'],
    targetRps: 1500,
    briefing: {
      title: 'Breaking the Monolith',
      conceptIntro: 'As engineering teams scale, a single monolithic codebase creates deployment bottlenecks and team collisions. Microservices break domains into independent services (Auth, Catalog, Orders). An API Gateway exposes a unified public facade while routing to distinct internal services.',
      realWorldScenario: 'Split public ingress through an API Gateway routing to containerized microservices backed by dedicated caches and databases.',
      objectives: [
        'Assemble: Client -> API Gateway -> K8s Pods / Containers -> Redis + Postgres',
        'Ensure the gateway validates and balances 1,500 req/s'
      ]
    },
    allowedComponents: ['client', 'api-gateway', 'k8s-pod', 'redis', 'postgresql', 'kafka'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Public Mobile Apps',
        position: { x: 80, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 1350,
      maxLatencyMs: 65,
      maxErrorRate: 0.01,
      requiredComponents: ['client', 'api-gateway', 'k8s-pod', 'redis', 'postgresql']
    },
    reflection: {
      summary: 'Microservice architecture structured with an API Gateway facade.',
      takeaway: 'Each microservice should ideally own its own data store to prevent tight coupling at the database schema layer.',
      realWorldAnalogy: 'Like specialized departments in a hospital (cardiology, radiology, triage) coordinated through a central receptionist.'
    },
    rewards: {
      xp: 480
    }
  },
  {
    id: 18,
    worldId: 'microservices',
    title: 'Circuit Breakers & Cascading Outage Defense',
    subtitle: 'Failing fast and graceful degradation under pressure',
    difficulty: 4,
    concepts: ['circuit-breaker', 'cascading-failure', 'graceful-degradation', 'timeouts'],
    targetRps: 2000,
    briefing: {
      title: 'Stopping the Domino Effect',
      conceptIntro: 'When a downstream dependency (like a third-party payment partner) stalls or takes 15 seconds to reply, upstream API servers keep connections open waiting for it. Soon, all server worker threads are exhausted, and your entire app goes down. A Circuit Breaker trips open, fails fast or serves fallback responses, saving the rest of your system.',
      realWorldScenario: 'Downstream payment partner is experiencing intermittent slow queries. Use a resilient architecture with Redis fallback and async Kafka buffering to survive the storm.',
      objectives: [
        'Architect: Client -> Gateway -> Pods -> Redis + Kafka + Postgres',
        'Maintain system availability above 99% despite downstream latency'
      ]
    },
    allowedComponents: ['client', 'api-gateway', 'k8s-pod', 'redis', 'postgresql', 'kafka'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Surge Ingress',
        position: { x: 70, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 1800,
      maxLatencyMs: 60,
      maxErrorRate: 0.015,
      requiredComponents: ['client', 'api-gateway', 'k8s-pod', 'redis', 'kafka']
    },
    reflection: {
      summary: 'Resilience patterns prevented catastrophic cascading failure!',
      takeaway: 'Fail fast: it is better to return an instant fallback response or cached recommendation than keep a user hanging until a gateway timeout.',
      realWorldAnalogy: 'Electrical circuit breakers tripping in your house to prevent a short-circuit from burning down the entire electrical grid.'
    },
    rewards: {
      xp: 520,
      achievementId: 'distributed_thinker'
    }
  },
  {
    id: 19,
    worldId: 'observability',
    title: 'Distributed Tracing with OpenTelemetry',
    subtitle: 'Pinpointing microsecond latency bottlenecks across services',
    difficulty: 4,
    concepts: ['telemetry-collector', 'opentelemetry', 'distributed-tracing', 'p99-latency'],
    targetRps: 1800,
    briefing: {
      title: 'You Cannot Fix What You Cannot See',
      conceptIntro: 'In a distributed microservices mesh, a single user request might touch 6 different services, 2 queues, and 3 databases. When P99 latency spikes to 4 seconds, traditional logs cannot show where the delay occurred. OpenTelemetry propagates trace IDs across network hops, generating flamegraphs of every span.',
      realWorldScenario: 'Connect an OpenTelemetry Collector to your API servers and databases to monitor P95/P99 latency percentiles and catch bottlenecks before customers complain.',
      objectives: [
        'Place Telemetry Collector in the architecture',
        'Connect API Pods to Telemetry Collector',
        'Verify full trace capture and keep P95 latency < 75ms'
      ]
    },
    allowedComponents: ['client', 'load-balancer', 'k8s-pod', 'telemetry-collector', 'redis', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Clients',
        position: { x: 70, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 1600,
      maxLatencyMs: 75,
      maxErrorRate: 0.01,
      requiredComponents: ['client', 'k8s-pod', 'telemetry-collector', 'redis']
    },
    reflection: {
      summary: 'OpenTelemetry collector streaming real-time traces and golden signals!',
      takeaway: 'Distributed traces transform guessing into empirical evidence during outages.',
      realWorldAnalogy: 'Like an MRI scan showing the exact blood vessel where a blockage is occurring.'
    },
    rewards: {
      xp: 550,
      achievementId: 'observability_boss'
    }
  },
  {
    id: 20,
    worldId: 'observability',
    title: 'The Four Golden Signals & SLOs',
    subtitle: 'Latency, Traffic, Errors, and Saturation monitoring',
    difficulty: 4,
    concepts: ['golden-signals', 'sli', 'slo', 'error-budget'],
    targetRps: 3000,
    briefing: {
      title: 'Site Reliability Engineering at Scale',
      conceptIntro: 'Google SRE defines the Four Golden Signals of monitoring: Latency (time to serve), Traffic (demand/req/s), Errors (rate of failed requests), and Saturation (how full your compute/memory/disk is). Your Service Level Objective (SLO) requires 99.9% availability.',
      realWorldScenario: 'Run a high-traffic production system of 3,000 req/s while preserving your Error Budget (<0.1% errors).',
      objectives: [
        'Deploy CDN -> Ingress -> K8s Pods -> Redis + Kafka + Postgres',
        'Connect Telemetry Collector to monitor health metrics',
        'Sustain 3,000 req/s with error rate < 0.005'
      ]
    },
    allowedComponents: ['client', 'cdn', 'load-balancer', 'k8s-pod', 'telemetry-collector', 'redis', 'postgresql', 'kafka'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: '3,000 req/s Traffic',
        position: { x: 60, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 2700,
      maxLatencyMs: 60,
      maxErrorRate: 0.008,
      requiredComponents: ['client', 'cdn', 'load-balancer', 'k8s-pod', 'telemetry-collector', 'redis']
    },
    reflection: {
      summary: 'Production SLO upheld with flying colors across all four golden signals.',
      takeaway: 'Error budgets allow engineering teams to balance rapid product innovation with strict uptime commitments.',
      realWorldAnalogy: 'Like an airline flight monitoring dashboard tracking airspeed, altitude, fuel burn, and engine pressure.'
    },
    rewards: {
      xp: 600
    }
  },
  {
    id: 21,
    worldId: 'security',
    title: 'Zero Trust & WAF Security Perimeter',
    subtitle: 'Filtering OWASP Top 10 exploits and DDoS amplification',
    difficulty: 4,
    concepts: ['waf-firewall', 'security', 'zero-trust', 'sql-injection', 'ddos'],
    targetRps: 4000,
    briefing: {
      title: 'Hardening the Frontier',
      conceptIntro: 'Public APIs are constantly probed by vulnerability scanners, automated credential stuffing scripts, and volumetric DDoS attacks. A Web Application Firewall (WAF) inspects payload signatures at the edge, terminating malicious traffic before internal networks are reached.',
      realWorldScenario: 'An aggressive botnet launched 4,000 req/s containing SQL injection attempts. Place a WAF and CDN at the perimeter to inspect packets.',
      objectives: [
        'Wire Client -> WAF Firewall -> CDN -> Load Balancer -> K8s Pods -> Postgres',
        'Absorb 4,000 req/s cleanly without leaking errors to users'
      ]
    },
    allowedComponents: ['client', 'waf-firewall', 'cdn', 'load-balancer', 'k8s-pod', 'redis', 'postgresql'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Public Ingress (with Attacks)',
        position: { x: 60, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 3600,
      maxLatencyMs: 65,
      maxErrorRate: 0.01,
      requiredComponents: ['client', 'waf-firewall', 'cdn', 'load-balancer', 'k8s-pod'],
      requiredConnections: [['client', 'waf-firewall'], ['waf-firewall', 'cdn']]
    },
    reflection: {
      summary: 'Attack vectors neutralized at the perimeter layer.',
      takeaway: 'Defense in depth: never rely on application code alone to defend against volumetric and network-level threats.',
      realWorldAnalogy: 'Like airport security checkpoints screening luggage before passengers can board the airplane.'
    },
    rewards: {
      xp: 650,
      achievementId: 'security_sentinel'
    }
  },
  {
    id: 22,
    worldId: 'security',
    title: 'Least Privilege & Identity Protection',
    subtitle: 'Securing the data plane and token authorization',
    difficulty: 4,
    concepts: ['api-gateway', 'jwt', 'rbac', 'least-privilege'],
    targetRps: 5000,
    briefing: {
      title: 'The Fortress Architecture',
      conceptIntro: 'Principle of Least Privilege: every service, token, and database user must only possess the minimal permissions required to do its job. An API Gateway validates cryptographic signatures (JWT/mTLS) and rejects unauthorized calls in microseconds.',
      realWorldScenario: 'Architect a 5,000 req/s production environment with an API Gateway, WAF, Redis token session cache, and multi-tier databases.',
      objectives: [
        'Build complete secure gateway architecture',
        'Sustain 5,000 req/s with average latency < 55ms'
      ]
    },
    allowedComponents: ['client', 'waf-firewall', 'api-gateway', 'cdn', 'k8s-pod', 'redis', 'postgresql', 'kafka'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: '5,000 req/s Enterprise Traffic',
        position: { x: 50, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 4500,
      maxLatencyMs: 55,
      maxErrorRate: 0.01,
      requiredComponents: ['client', 'waf-firewall', 'api-gateway', 'k8s-pod', 'redis']
    },
    reflection: {
      summary: 'Enterprise identity and token validation perimeter deployed.',
      takeaway: 'Zero trust means "never trust, always verify" — both at the edge and between internal microservices.',
      realWorldAnalogy: 'A keycard system where entering the building does not grant access to the high-security server room without a second biometric scan.'
    },
    rewards: {
      xp: 700
    }
  },
  {
    id: 23,
    worldId: 'fusion',
    title: 'Fusion Boss: Flash Sale Megastorm',
    subtitle: 'Combining CDN, Ingress, Pods, Redis, Kafka, and Postgres under 15,000 req/s',
    difficulty: 5,
    concepts: ['flash-sale', 'backpressure', 'cache-shield', 'event-streaming', 'high-concurrency'],
    targetRps: 15000,
    briefing: {
      title: 'The Black Friday Flash Sale',
      conceptIntro: 'At 12:00:00, 15,000 shoppers hit the checkout button simultaneously. If raw requests hit PostgreSQL, connection pools will explode in 3 seconds. You must combine every system learned: CDN for static shield, WAF for rate abuse, K8s Pods for scale, Redis for inventory counters, and Kafka for async order processing.',
      realWorldScenario: 'You are lead architect for an e-commerce giant during a record-breaking drop. Failure is not an option.',
      objectives: [
        'Assemble a complete multi-tier enterprise architecture',
        'Handle 15,000 req/s burst traffic',
        'Keep error rate below 1% and P95 latency below 65ms'
      ]
    },
    allowedComponents: ['client', 'waf-firewall', 'cdn', 'load-balancer', 'k8s-pod', 'redis', 'postgresql', 'kafka', 'worker-service', 'telemetry-collector'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: '15,000 Shoppers/s',
        position: { x: 50, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 13500,
      maxLatencyMs: 65,
      maxErrorRate: 0.01,
      requiredComponents: ['client', 'cdn', 'load-balancer', 'k8s-pod', 'redis', 'kafka', 'worker-service', 'postgresql']
    },
    reflection: {
      summary: 'Flash sale survived without a single dropped order or database crash!',
      takeaway: 'By buffering order checkout into Kafka and shielding reads with Redis and CDN, the database stayed safe at 40% CPU despite 15,000 req/s.',
      realWorldAnalogy: 'Like holding back a reservoir flood with a modern dam system and spillway canals instead of letting the riverbank wash away.'
    },
    rewards: {
      xp: 1000,
      achievementId: 'flash_sale_hero'
    }
  },
  {
    id: 24,
    worldId: 'fusion',
    title: 'SEV-1 On-Call Incident: Database Meltdown',
    subtitle: 'Diagnostic investigation, evidence-based mitigation, and postmortem',
    difficulty: 5,
    concepts: ['incident-response', 'on-call', 'sev-1', 'postmortem', 'connection-pool'],
    targetRps: 5000,
    briefing: {
      title: 'PAGERDUTY ALARM: Error rate 28% and rising',
      conceptIntro: 'It is 2:14 AM. The primary database CPU is pegged at 98%, customer checkout is failing, and API servers are timing out. Adding more API servers made the problem worse because it flooded PostgreSQL with 500 more connections! You must inspect logs, analyze distributed traces, find the real root cause, and deploy the right fix under time pressure.',
      realWorldScenario: 'An unindexed query coupled with missing cache is causing a connection pool starvation storm. Use the Incident Command panel to diagnose and recover.',
      objectives: [
        'Review symptoms, logs, and distributed traces in the Incident Command room',
        'Identify the actual root cause',
        'Execute targeted remediation actions before your error budget drains',
        'Conduct a successful postmortem'
      ]
    },
    allowedComponents: ['client', 'cdn', 'load-balancer', 'k8s-pod', 'redis', 'postgresql', 'telemetry-collector'],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: '5,000 req/s User Traffic',
        position: { x: 60, y: 220 },
        connections: []
      },
      {
        instanceId: 'lb-1',
        componentId: 'load-balancer',
        label: 'Ingress LB',
        position: { x: 260, y: 220 },
        connections: ['pod-1', 'pod-2']
      },
      {
        instanceId: 'pod-1',
        componentId: 'k8s-pod',
        label: 'Order API Pod 1',
        position: { x: 460, y: 150 },
        connections: ['db-1']
      },
      {
        instanceId: 'pod-2',
        componentId: 'k8s-pod',
        label: 'Order API Pod 2',
        position: { x: 460, y: 290 },
        connections: ['db-1']
      },
      {
        instanceId: 'db-1',
        componentId: 'postgresql',
        label: 'PostgreSQL Primary (OVERLOADED)',
        position: { x: 680, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 4500,
      maxLatencyMs: 70,
      maxErrorRate: 0.01,
      requiredComponents: ['client', 'load-balancer', 'k8s-pod', 'redis', 'postgresql']
    },
    reflection: {
      summary: 'SEV-1 incident resolved and postmortem completed!',
      takeaway: 'Never blindly scale upstream compute when the downstream database is saturated. Always introduce caching or rate limiting first.',
      realWorldAnalogy: 'If the drain in a sink is clogged, turning on more faucets will only flood the room faster.'
    },
    rewards: {
      xp: 1200,
      achievementId: 'incident_commander'
    }
  },
  {
    id: 25,
    worldId: 'fusion',
    title: 'Ultimate Boss: Production Apocalypse',
    subtitle: 'The master distributed systems gauntlet under 25,000 req/s',
    difficulty: 5,
    concepts: ['production-engineering', 'multi-region', 'chaos-engineering', 'mastery'],
    targetRps: 25000,
    briefing: {
      title: 'The Final Certification: Production Architect',
      conceptIntro: 'This is the comprehensive test of your backend engineering career. 25,000 req/s across global clients, database write bottlenecks, edge surges, and telemetry monitoring. You have access to every component in the catalog. Design the resilient, cost-disciplined, highly available master platform.',
      realWorldScenario: 'A global tier-1 enterprise platform supporting millions of concurrent users. Bring together WAF, CDN, API Gateway, Kubernetes, Redis, Kafka, Workers, and Observability.',
      objectives: [
        'Build the ultimate architecture using best practices',
        'Handle 25,000 req/s with <50ms P95 latency',
        'Achieve < 0.5% error rate and maintain budget discipline',
        'Earn the title of Backend Master'
      ]
    },
    allowedComponents: [
      'client', 'dns', 'waf-firewall', 'cdn', 'api-gateway', 'load-balancer',
      'k8s-pod', 'redis', 'postgresql', 'kafka', 'worker-service', 'telemetry-collector'
    ],
    starterNodes: [
      {
        instanceId: 'client-1',
        componentId: 'client',
        label: 'Global Users (25,000 req/s)',
        position: { x: 50, y: 220 },
        connections: []
      }
    ],
    winConditions: {
      minRps: 22500,
      maxLatencyMs: 50,
      maxErrorRate: 0.005,
      requiredComponents: ['client', 'waf-firewall', 'cdn', 'api-gateway', 'k8s-pod', 'redis', 'kafka', 'worker-service', 'postgresql', 'telemetry-collector']
    },
    reflection: {
      summary: 'PRODUCTION ARCHITECT CERTIFIED! You have mastered the full backend engineering discipline.',
      takeaway: 'From your first single client-to-server request up to distributed event streams and resilient edge shields, you have learned to reason about architecture, trade-offs, and systems.',
      realWorldAnalogy: 'From building a single campfire to constructing a nuclear power grid.'
    },
    rewards: {
      xp: 2000,
      achievementId: 'backend_master'
    }
  }
];
