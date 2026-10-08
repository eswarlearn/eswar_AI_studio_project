# BACKEND QUEST — Full Backend Engineering Game
## AI Coding Assistant Master Specification

**Document version:** 1.0  
**Target stack:** React + TypeScript + Vite  
**Primary purpose:** Build an educational, progressively difficult backend-engineering simulation game that teaches backend development from fundamentals through distributed systems, cloud infrastructure, DevOps, microservices, observability, security, and production incident response.

---

# 1. Product Vision

Build a game called **Backend Quest**.

The game should feel like a professional cloud architecture console combined with a strategy/management game.

The player starts as a beginner who learns:

> HTTP → APIs → servers → databases → caching → containers → Kubernetes → messaging → microservices → cloud → infrastructure as code → CI/CD → observability → security → distributed systems → production engineering.

The player should NOT simply memorize definitions.

The game must progressively teach the player to:

1. Understand a concept.
2. Recognize where it belongs in an architecture.
3. Configure it.
4. Observe its behavior.
5. Understand its failure modes.
6. Combine it with other concepts.
7. Make engineering trade-offs.
8. Diagnose production incidents.
9. Operate a busy distributed backend under constraints.

The final stages should resemble a simplified combination of:

- Backend engineering interview problems
- System design exercises
- Cloud architecture challenges
- SRE/on-call incidents
- DevOps troubleshooting
- Distributed systems reasoning

The game should be educational first, but genuinely fun.

---

# 2. Core Design Principle

The difficulty curve must follow:

```text
Learn
  ↓
Recognize
  ↓
Build
  ↓
Configure
  ↓
Observe
  ↓
Debug
  ↓
Optimize
  ↓
Scale
  ↓
Recover
  ↓
Design
  ↓
Operate under pressure
```

Do NOT expose advanced complexity too early.

A beginner should be able to understand the first levels without knowing Kubernetes, Kafka, Docker, cloud providers, or distributed systems.

By the late game, however, the player should be forced to reason about interactions between many systems.

---

# 3. Game Style

Use a **professional cloud architecture + game mechanics** visual style.

Do NOT make it look like a children's game.

Visual inspiration:

- Modern cloud dashboards
- Developer tools
- Infrastructure diagrams
- Terminal panels
- Monitoring dashboards
- Strategy games
- Technical network maps

Use:

- Dark professional UI
- Strong contrast
- Blue/indigo as primary visual identity
- Secondary status colors for success/warning/error
- Clean cards
- Animated architecture diagrams
- Glowing data packets
- Traffic indicators
- Health indicators
- CPU/memory/network charts
- XP notifications
- Achievement animations
- World map/progression map

Avoid excessive neon/cyberpunk styling.

---

# 4. Technology Requirements

Use:

- React
- TypeScript
- Vite
- CSS or Tailwind CSS
- Framer Motion for animations where useful
- Lucide React for icons
- Recharts or another lightweight charting solution
- localStorage for initial persistence

Do not require a backend for the first version.

Architecture should make it possible to add a backend later for:

- User accounts
- Cloud saves
- Leaderboards
- Multiplayer
- Achievements
- Analytics

---

# 5. Game Architecture

Organize the frontend into clear modules.

Recommended structure:

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers/
│
├── components/
│   ├── architecture/
│   ├── game/
│   ├── dashboard/
│   ├── quiz/
│   ├── simulator/
│   ├── charts/
│   └── common/
│
├── data/
│   ├── worlds/
│   ├── levels/
│   ├── concepts/
│   ├── components/
│   ├── incidents/
│   └── achievements/
│
├── engine/
│   ├── simulation/
│   ├── traffic/
│   ├── scoring/
│   ├── validation/
│   ├── economy/
│   ├── incidents/
│   └── progression/
│
├── state/
│   ├── gameStore.ts
│   ├── simulationStore.ts
│   └── settingsStore.ts
│
├── types/
│   ├── level.ts
│   ├── architecture.ts
│   ├── simulation.ts
│   └── player.ts
│
├── utils/
└── main.tsx
```

Keep game rules separate from UI.

The simulation engine must not depend directly on React components.

---

# 6. Main Game Screens

Implement these screens.

## 6.1 Home

Show:

- Continue Journey
- Worlds
- Skill Tree
- Achievements
- Profile
- Settings
- Statistics

Example:

```text
BACKEND QUEST

Backend Engineer Journey
Level 27
XP 4,820 / 5,200

[ Continue ]

Worlds
✓ Foundations
✓ Databases
✓ Scaling
▶ Containers
🔒 Kubernetes
🔒 Messaging
🔒 Microservices
...
```

---

# 7. World Map

The world map shows the player's progression.

Each world is a node.

```text
FOUNDATIONS
     ↓
DATABASES
     ↓
SCALING
     ↓
CONTAINERS
     ↓
KUBERNETES
     ↓
MESSAGING
     ↓
MICROSERVICES
     ↓
DEVOPS
     ↓
OBSERVABILITY
     ↓
SECURITY
     ↓
DISTRIBUTED SYSTEMS
     ↓
PRODUCTION ENGINEERING
     ↓
ARCHITECTURE MASTERY
```

After the initial worlds, unlock **Fusion Worlds**.

Fusion Worlds combine multiple previously learned concepts.

---

# 8. Level Lifecycle

Every normal level should use the progressive learning loop.

```text
1. Concept Briefing
       ↓
2. Interactive Tutorial
       ↓
3. Architecture Puzzle
       ↓
4. Knowledge Trial
       ↓
5. Configuration Challenge
       ↓
6. Mini Simulation
       ↓
7. Reflection / Explanation
       ↓
8. XP + Achievements
       ↓
9. Unlock Next Level
```

Not every early level needs every stage.

Later levels should increasingly use all stages.

---

# 9. Architecture Puzzle Interaction

Architecture diagrams contain:

- Clients
- Servers
- Databases
- Queues
- Brokers
- Containers
- Pods
- Load balancers
- Gateways
- Caches
- Observability components
- Security components

Components should visually connect.

Example:

```text
[Client]
    │
    ▼
[ ? ]
    │
    ▼
[Server]
    │
    ▼
[PostgreSQL]
```

Tray:

```text
[Redis]
[Load Balancer]
[API Gateway]
[CDN]
```

The player can:

- Drag
- Drop
- Tap component
- Select slot
- Remove component
- Inspect component

Correct:

- Snap animation
- Wires connect
- Explanation appears
- XP notification
- Packet animation

Wrong:

- Slot shakes
- Short error feedback
- Lose a small amount of XP
- Explain why it is incorrect

Do not punish experimentation heavily in tutorial levels.

---

# 10. Live Architecture Visualization

Once the architecture is valid, animate packets.

Example:

```text
CLIENT
  ●
  │  blue packet
  ▼
LOAD BALANCER
 /          \
●            ●
API-1       API-2
 \          /
  ▼        ▼
      REDIS
        │
        ▼
   POSTGRES
```

Packet animation speed should reflect simulated latency.

Traffic volume should affect:

- Number of packets
- Queue sizes
- Server load
- Latency
- Error rates

---

# 11. Simulation Engine

The game needs a lightweight deterministic simulation engine.

Each simulation tick should calculate:

```text
traffic
capacity
latency
CPU
memory
connections
queue depth
error rate
availability
cost
```

Example:

```ts
type SimulationMetrics = {
  requestsPerSecond: number;
  latencyMs: number;
  errorRate: number;
  cpuPercent: number;
  memoryPercent: number;
  networkMbps: number;
  queueDepth: number;
  activeConnections: number;
  monthlyCost: number;
};
```

The simulation does NOT need to model real hardware.

It needs to teach useful engineering relationships.

---

# 12. Traffic Model

Traffic should become progressively harder.

Early:

```text
10 req/s
```

Intermediate:

```text
100 req/s
1,000 req/s
5,000 req/s
```

Advanced:

```text
10,000 req/s
50,000 req/s
100,000 req/s
```

End game:

```text
500,000 req/s
1,000,000+ req/s
```

Traffic patterns:

- Constant
- Gradual growth
- Spike
- Burst
- Periodic
- Random
- Flash crowd
- Regional spike
- Retry storm

---

# 13. Infrastructure Cost System

Introduce cost gradually.

Each component has a simulated cost.

Example:

```text
API Server       $10
Redis            $15
PostgreSQL       $25
Kafka            $30
Load Balancer    $12
Kubernetes       $20
CDN              $10
```

These are fictional game values.

Do NOT imply they are actual cloud provider prices.

Later levels give the player a budget.

Example:

```text
Budget: $200/hour

Current:
Servers:      $80
Redis:        $30
Database:     $40
Kafka:        $30

Total:        $180

Remaining:    $20
```

The player must balance:

```text
Performance
Reliability
Cost
Complexity
```

---

# 14. Resource Constraints

Advanced levels can impose:

- CPU limits
- Memory limits
- Connection limits
- Database connection limits
- Network bandwidth
- Kafka partition capacity
- Queue capacity
- Budget
- Maximum server count
- Maximum deployment time

This prevents brute-force solutions.

---

# 15. Scoring System

Every level calculates:

```text
Base XP
+ Correct Answers
+ Efficient Architecture
+ Low Cost
+ High Availability
+ Fast Resolution
+ Bonus Objectives
- Wrong Choices
- Downtime
- Excess Cost
- Unnecessary Components
```

Advanced incidents should additionally score:

```text
MTTR
Availability
Error budget
Cost efficiency
Root-cause accuracy
Recovery quality
```

Do not make the score purely about speed.

Correct reasoning should matter.

---

# 16. XP System

Example:

```text
Tutorial:             +5 XP
Correct answer:      +10 XP
Architecture solved: +25 XP
Simulation success:  +40 XP
Incident solved:     +50 XP
Perfect challenge:   +25 XP
```

Use progressive XP requirements.

---

# 17. Rank System

Ranks:

```text
C   Backend Beginner
B   Backend Builder
A   Backend Engineer
S   Senior Backend Engineer
S+  Distributed Systems Engineer
SS  Production Architect
SSS Backend Master
```

Rank should be based on demonstrated progression.

Do not make rank depend only on total XP.

Use:

- XP
- completed worlds
- skill coverage
- boss completions
- incident performance

---

# 18. Skill Tree

Skills:

```text
Backend Foundations
├── HTTP
├── Networking
├── APIs
├── Authentication
└── Error Handling

Databases
├── SQL
├── PostgreSQL
├── Transactions
├── Indexing
├── Replication
└── NoSQL

Scaling
├── Load Balancing
├── Caching
├── CDN
├── Autoscaling
└── Rate Limiting

Containers
├── Docker
├── Images
├── Networking
└── Compose

Kubernetes
├── Pods
├── Services
├── Deployments
├── Ingress
├── Scaling
└── Self Healing

Messaging
├── RabbitMQ
├── Kafka
├── Partitions
├── Consumer Groups
├── Retry
└── DLQ

Microservices
├── API Gateway
├── Service Discovery
├── gRPC
├── Events
├── Saga
└── Distributed Transactions

DevOps
├── Git
├── CI
├── CD
├── Terraform
├── Canary
└── Rollback

Observability
├── Logs
├── Metrics
├── Traces
├── OpenTelemetry
├── SLO
└── Alerting

Security
├── TLS
├── JWT
├── OAuth
├── RBAC
├── Secrets
└── Threat Modeling

Distributed Systems
├── CAP
├── Consistency
├── Consensus
├── Idempotency
├── Backpressure
└── Circuit Breakers
```

---

# 19. Achievement System

Examples:

```text
First Request
      Complete first API architecture

Cache Master
      Solve 5 cache optimization challenges

Container Captain
      Complete Docker world

Kafka Keeper
      Recover a Kafka consumer lag incident

Zero Downtime
      Complete a deployment without downtime

Incident Commander
      Resolve 10 production incidents

Cost Cutter
      Meet a performance target under budget

No Single Point
      Build a highly available architecture

Distributed Thinker
      Complete 10 distributed systems challenges

Production Ready
      Complete the Production Engineering world
```

---

# 20. World 1 — Backend Foundations

Levels 1–20.

1. What is a client?
2. What is a server?
3. Request and response
4. HTTP methods
5. HTTP status codes
6. Ports
7. DNS
8. TCP basics
9. TLS
10. JSON
11. REST APIs
12. API routing
13. Middleware
14. Validation
15. Error handling
16. Logging
17. Health checks
18. Authentication
19. JWT
20. First production API

Traffic:

```text
1 → 5 → 10 → 25 → 50 req/s
```

---

# 21. World 2 — Databases

Levels 21–40.

21. Relational databases
22. PostgreSQL
23. Tables
24. Primary keys
25. Foreign keys
26. JOINs
27. Indexes
28. Query plans
29. Transactions
30. ACID
31. Isolation levels
32. Locks
33. Connection pooling
34. Replication
35. Read replicas
36. NoSQL
37. MongoDB concepts
38. Redis
39. Cache-aside
40. Cache invalidation challenge

---

# 22. World 3 — Traffic and Scaling

Levels 41–60.

41. Vertical scaling
42. Horizontal scaling
43. Load balancing
44. Round robin
45. Least connections
46. Health checks
47. Reverse proxy
48. API gateway
49. Rate limiting
50. Token bucket
51. Leaky bucket
52. Autoscaling
53. CDN
54. Connection limits
55. Traffic spikes
56. Retry storms
57. Backpressure
58. Circuit breaker
59. Graceful degradation
60. High-traffic challenge

---

# 23. World 4 — Docker and Containers

Levels 61–75.

61. Why containers?
62. Images
63. Dockerfile
64. Build context
65. Layers
66. Containers
67. Ports
68. Volumes
69. Networks
70. Environment variables
71. Health checks
72. Multi-container systems
73. Docker Compose
74. Container failure
75. Container production challenge

---

# 24. World 5 — Kubernetes

Levels 76–100.

76. Why Kubernetes?
77. Cluster
78. Node
79. Pod
80. Deployment
81. ReplicaSet
82. Service
83. ClusterIP
84. NodePort
85. LoadBalancer
86. Ingress
87. ConfigMap
88. Secrets
89. Resource requests
90. Resource limits
91. Liveness probe
92. Readiness probe
93. Rolling deployment
94. Rollback
95. Autoscaling
96. Self healing
97. Pod crash loop
98. Service failure
99. Kubernetes traffic challenge
100. Kubernetes production incident

---

# 25. World 6 — Message Queues and Event Systems

Levels 101–125.

101. Why asynchronous processing?
102. Queue
103. Producer
104. Consumer
105. RabbitMQ
106. Exchanges
107. Routing keys
108. Acknowledgements
109. Retry
110. Dead letter queues
111. Kafka introduction
112. Topics
113. Partitions
114. Producers
115. Consumers
116. Consumer groups
117. Offsets
118. Ordering
119. Replication
120. Consumer lag
121. Kafka scaling
122. Retry architecture
123. Event-driven architecture
124. Message processing failure
125. Messaging production incident

---

# 26. World 7 — Microservices

Levels 126–150.

126. Monolith
127. Modular monolith
128. Microservice boundaries
129. Service ownership
130. API Gateway
131. Service discovery
132. REST between services
133. gRPC
134. Protobuf
135. Timeouts
136. Retries
137. Circuit breakers
138. Distributed tracing
139. Event-driven services
140. Saga pattern
141. Outbox pattern
142. Idempotency
143. Distributed transactions
144. Data ownership
145. Service failure
146. Cascading failure
147. Microservice scaling
148. Service dependency map
149. Multi-service debugging
150. Microservices production challenge

---

# 27. World 8 — API Communication

Levels 151–170.

151. REST
152. GraphQL
153. gRPC
154. HTTP/2
155. HTTP/3 concepts
156. WebSockets
157. Webhooks
158. Polling
159. Long polling
160. SSE
161. API versioning
162. Pagination
163. Filtering
164. Sorting
165. Idempotency keys
166. API compatibility
167. Rate limits
168. API gateway policies
169. Communication strategy challenge
170. Multi-protocol architecture

---

# 28. World 9 — CI/CD and DevOps

Levels 171–195.

171. Git
172. Branching
173. Pull requests
174. Automated tests
175. Unit tests
176. Integration tests
177. Build pipeline
178. CI
179. Artifact creation
180. Container build
181. Registry
182. CD
183. Deployment strategies
184. Rolling deployments
185. Blue/green
186. Canary
187. Feature flags
188. Rollback
189. Migration safety
190. Database deployment
191. Release observability
192. Failed deployment
193. Rollback incident
194. Zero-downtime deployment
195. Release engineering challenge

---

# 29. World 10 — Terraform and Infrastructure as Code

Levels 196–215.

196. Infrastructure as Code
197. Terraform providers
198. Resources
199. Variables
200. Outputs
201. State
202. Modules
203. Dependencies
204. Plan
205. Apply
206. Drift
207. Remote state
208. Workspaces/environments
209. Infrastructure review
210. Safe changes
211. Destructive changes
212. Terraform failure
213. Multi-environment infrastructure
214. Cloud architecture challenge
215. Infrastructure production incident

---

# 30. World 11 — Observability

Levels 216–240.

216. Logs
217. Structured logs
218. Log levels
219. Metrics
220. Counters
221. Gauges
222. Histograms
223. Latency percentiles
224. Tracing
225. Distributed tracing
226. Correlation IDs
227. OpenTelemetry concepts
228. Dashboards
229. Alerts
230. Alert fatigue
231. SLIs
232. SLOs
233. SLAs
234. Error budgets
235. Golden signals
236. Incident timeline
237. Root cause analysis
238. Observability debugging
239. Multi-service incident
240. Observability boss

---

# 31. World 12 — Security

Levels 241–270.

241. Threat modeling
242. TLS
243. Secrets
244. Secret rotation
245. Password hashing
246. JWT
247. OAuth
248. Authentication vs authorization
249. RBAC
250. API authorization
251. CORS
252. CSRF
253. XSS
254. SQL injection
255. Input validation
256. Rate limiting
257. Secure headers
258. Encryption at rest
259. Encryption in transit
260. Key management concepts
261. Least privilege
262. Service identity
263. Network segmentation
264. Zero trust concepts
265. Credential leak incident
266. Unauthorized API incident
267. Security architecture
268. Secure deployment
269. Security production incident
270. Security boss

---

# 32. World 13 — Distributed Systems

Levels 271–305.

271. Why distributed systems?
272. CAP theorem
273. Consistency
274. Availability
275. Partition tolerance
276. Strong consistency
277. Eventual consistency
278. Leader/follower
279. Replication
280. Quorum concepts
281. Leader election
282. Distributed locks
283. Clock/time problems
284. Idempotency
285. Deduplication
286. Retries
287. Exponential backoff
288. Jitter
289. Retry storms
290. Circuit breakers
291. Bulkheads
292. Backpressure
293. Queue saturation
294. Load shedding
295. Graceful degradation
296. Failure domains
297. Disaster recovery
298. RPO
299. RTO
300. Multi-region systems
301. Regional failure
302. Network partition
303. Cascading failure
304. Distributed systems challenge
305. Distributed systems boss

---

# 33. World 14 — Production Engineering

Levels 306–340.

306. Capacity planning
307. Load testing
308. Performance budgets
309. Connection exhaustion
310. CPU saturation
311. Memory leak
312. Disk saturation
313. Network saturation
314. Database bottleneck
315. Cache stampede
316. Kafka backlog
317. RabbitMQ queue explosion
318. Kubernetes crash loop
319. Bad configuration
320. Bad deployment
321. Certificate expiration
322. Secret expiration
323. DNS failure
324. Dependency outage
325. Third-party API outage
326. Traffic spike
327. Retry storm
328. Cascading failure
329. Partial outage
330. Data corruption scenario
331. Recovery scenario
332. Backup restore
333. Disaster recovery
334. Multi-region failover
335. Incident command
336. Incident communication
337. Root cause analysis
338. Postmortem
339. Production simulation
340. Production Engineer certification

---

# 34. Fusion Worlds

After the primary worlds, create levels beyond 340 that deliberately combine multiple concepts.

The game should NOT end at 340.

Examples:

## Fusion Level 341 — The Busy E-Commerce Platform

Combine:

- CDN
- Load balancer
- API gateway
- Kubernetes
- Redis
- PostgreSQL
- Kafka
- Payment service
- Notification service
- Observability

Traffic:

```text
10,000 req/s
```

Incident:

```text
Payment latency increasing.
Kafka lag increasing.
Database CPU at 90%.
```

Player must determine the bottleneck.

---

## Fusion Level 342 — Flash Sale

Traffic:

```text
10K → 250K req/s
```

Player must use:

- CDN
- caching
- rate limiting
- queues
- autoscaling
- database protection

---

## Fusion Level 343 — Payment Failure

Player must reason about:

- idempotency
- retries
- queues
- transactions
- distributed consistency
- payment webhooks

---

## Fusion Level 344 — Kafka Apocalypse

Conditions:

- Producer traffic doubles
- Consumer crashes
- Lag increases
- Partitions become hot
- Retry queue grows

Player must diagnose:

- partitioning
- consumer capacity
- backpressure
- retry strategy

---

## Fusion Level 345 — Kubernetes Disaster

Conditions:

- Pods restart
- Readiness probes fail
- Deployment is unhealthy
- Database connections exhausted

Player must inspect:

- pod metrics
- events
- logs
- readiness
- connection pool
- deployment configuration

---

## Fusion Level 346 — Database Meltdown

Conditions:

- Slow query
- missing index
- connection pool exhaustion
- cache miss storm

Player must decide:

- optimize query
- add index
- increase pool
- cache
- scale database

---

## Fusion Level 347 — Bad Deployment

Player sees:

```text
Error rate: 0.2% → 17%
Latency: 100ms → 4s
```

Possible actions:

- rollback
- canary reduction
- disable feature flag
- inspect traces
- compare versions

---

## Fusion Level 348 — Regional Outage

One region fails.

Player must:

- detect outage
- shift traffic
- preserve consistency
- protect database
- restore services

---

## Fusion Level 349 — Cost Explosion

Performance is healthy but:

```text
Infrastructure cost:
$2K/day → $14K/day
```

Player must optimize architecture without breaking SLOs.

---

## Fusion Level 350 — Full Production Platform

Combine almost every world.

This is the first complete architecture challenge.

---

# 35. Infinite/Extended Challenge Mode

After the campaign, provide a procedural challenge mode.

Generate scenarios using combinations of:

- traffic
- failures
- architecture
- budget
- latency targets
- availability targets
- dependencies
- deployment state

Example:

```text
Traffic: 85,000 req/s
Budget: $500/hour
Availability target: 99.9%
Latency target: p95 < 250ms

Failures:
- Redis node unavailable
- Kafka consumer lag
- one Kubernetes node unhealthy
- third-party payment API slow
```

Generate a different scenario each run.

---

# 36. Production Incident System

Advanced levels must include an incident engine.

Incident structure:

```ts
type Incident = {
  id: string;
  title: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  initialSymptoms: Symptom[];
  hiddenCauses: Cause[];
  availableActions: Action[];
  timeLimitSeconds: number;
  budgetLimit?: number;
  successConditions: Condition[];
  failureConditions: Condition[];
};
```

Player should receive evidence gradually.

Do NOT reveal the root cause immediately.

---

# 37. Incident Dashboard

Show:

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 INCIDENT #087
 SEV-1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Time remaining: 04:32

ERROR RATE      18.4% 🔴
P95 LATENCY     4.8s 🔴
CPU             91%  🟠
MEMORY          76%
KAFKA LAG       1.8M 🔴
DB CONNECTIONS  98% 🔴

[Logs]
[Metrics]
[Traces]
[Architecture]
[Deployments]
[Events]

Possible Actions
[Scale API]
[Rollback]
[Enable Cache]
[Rate Limit]
[Restart Consumer]
[Increase Partitions]
[Failover DB]
```

---

# 38. Evidence-Based Debugging

Do not make incidents guesswork.

Every incident must provide clues.

Example:

```text
Metric:
DB CPU = 97%

Trace:
POST /orders
  API 40ms
  Payment 80ms
  DB 3800ms

Log:
connection pool exhausted
```

The player should be able to infer:

```text
Database connection exhaustion
```

---

# 39. Boss Mechanics

Bosses should combine concepts.

A boss should have multiple phases.

Example:

```text
PHASE 1
Traffic spike

PHASE 2
Database saturation

PHASE 3
Kafka backlog

PHASE 4
Bad deployment
```

Each phase changes the system.

Do not pause the world unnecessarily.

The player must adapt.

---

# 40. Time Pressure

Early game:

No timer.

Intermediate:

Optional timer.

Advanced:

Time pressure.

Boss:

Strict timer.

Example:

```text
5:00
4:59
4:58
...
```

The player should be able to pause during learning challenges but not during final boss simulations unless explicitly configured.

---

# 41. Failure Handling

Do not simply say:

> Wrong.

Instead:

```text
❌ That increased the problem.

Why?

Adding API servers does not fix a database connection bottleneck.

The API layer was waiting on PostgreSQL.

Try inspecting:
→ DB CPU
→ connection pool
→ query latency
```

Learning is more important than punishment.

---

# 42. Concept Cards

Every new technology gets a reusable concept card.

Example:

```text
KAFKA

Purpose:
Distributed event streaming.

Use when:
High-throughput asynchronous event processing.

Core concepts:
• Topics
• Partitions
• Producers
• Consumers
• Consumer groups
• Offsets

Watch out for:
• Consumer lag
• Hot partitions
• Ordering constraints
• Retry handling
```

---

# 43. Developer-Level Detail Requirements

For every major technology, teach:

```text
What is it?
Why does it exist?
What problem does it solve?
When should you use it?
When should you NOT use it?
How does it work?
What are its main components?
What are common failure modes?
How does it scale?
How does it affect latency?
How does it affect cost?
How does it interact with other components?
What alternatives exist?
```

This is a critical requirement.

The game should teach engineering judgment, not tool names.

---

# 44. Backend Technologies to Include

Include at minimum:

## Languages / Backend

- Go
- Node.js concepts
- Java/Spring concepts

The game does not need to teach full programming syntax.

Focus on backend architecture.

## APIs

- REST
- GraphQL
- gRPC
- WebSockets
- Webhooks
- SSE
- polling

## Databases

- PostgreSQL
- MySQL concepts
- MongoDB
- Redis

## Messaging

- Kafka
- RabbitMQ
- Pub/Sub concepts
- queues
- topics
- partitions
- consumer groups
- DLQ

## Infrastructure

- Docker
- Docker Compose
- Kubernetes
- Terraform

## DevOps

- Git
- CI/CD
- registries
- deployment strategies
- rollback
- feature flags

## Cloud concepts

- Compute
- Storage
- Networking
- Load balancers
- DNS
- CDN
- managed databases
- queues
- object storage

Do not require a real cloud account.

---

# 45. Missing/Important Backend Concepts to Include

Also include:

- DNS
- TCP/IP
- TLS
- HTTP/1.1
- HTTP/2
- HTTP/3 concepts
- reverse proxy
- API gateway
- service discovery
- connection pooling
- database indexing
- query planning
- transactions
- isolation levels
- replication
- sharding
- caching
- cache invalidation
- cache stampede
- rate limiting
- backpressure
- retries
- exponential backoff
- jitter
- circuit breakers
- bulkheads
- graceful degradation
- idempotency
- distributed locks
- leader election
- CAP theorem
- consistency models
- eventual consistency
- SLI
- SLO
- SLA
- RPO
- RTO
- disaster recovery
- zero-downtime deployments
- canary deployments
- blue/green deployments
- secrets
- OAuth
- RBAC
- least privilege
- threat modeling
- observability
- OpenTelemetry
- structured logging
- metrics
- tracing

---

# 46. Level Data Model

Levels should be data-driven.

Example:

```ts
type Level = {
  id: number;
  worldId: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  concepts: string[];

  briefing: {
    title: string;
    explanation: string;
    examples?: string[];
  };

  puzzle?: {
    nodes: NodeDefinition[];
    slots: SlotDefinition[];
    allowedComponents: string[];
    correctArchitecture: string[];
  };

  questions?: Question[];

  simulation?: SimulationConfig;

  incident?: Incident;

  rewards: {
    xp: number;
    achievements?: string[];
  };

  unlocks: string[];
};
```

Do not hardcode individual level logic into React components.

---

# 47. Component Model

Every infrastructure component should have metadata.

Example:

```ts
type InfrastructureComponent = {
  id: string;
  name: string;
  category: string;
  description: string;

  capacity: {
    requestsPerSecond?: number;
    connections?: number;
    throughput?: number;
  };

  effects: {
    latency?: number;
    reliability?: number;
    cacheHitRate?: number;
  };

  cost: number;

  failureModes: string[];

  dependencies: string[];
};
```

---

# 48. Architecture Graph

Represent the player's system as a graph.

```ts
type ArchitectureNode = {
  id: string;
  componentId: string;
  config: Record<string, unknown>;
};

type ArchitectureEdge = {
  from: string;
  to: string;
  protocol?: string;
  trafficMultiplier?: number;
};
```

This graph feeds the simulation engine.

---

# 49. Simulation Rules

Examples:

### Load Balancer

Without LB:

```text
Server capacity = 100 req/s
Traffic = 180 req/s

Result:
Overload
```

With two servers:

```text
Server 1 = 90
Server 2 = 90

Result:
Healthy
```

### Redis

Without cache:

```text
1000 DB requests/s
```

With 80% cache hit rate:

```text
200 DB requests/s
```

### Queue

If:

```text
Producer = 1000 msg/s
Consumer = 500 msg/s
```

then:

```text
queue growth = 500 msg/s
```

### Kubernetes

If:

```text
1 pod capacity = 100 req/s
traffic = 450 req/s
replicas = 3
```

then:

```text
capacity = 300 req/s
```

The game should show overload.

---

# 50. Difficulty Scaling

Difficulty should increase through:

## Stage 1

One concept.

```text
Client → Server
```

## Stage 2

Two concepts.

```text
Client → Load Balancer → Server
```

## Stage 3

Multiple components.

```text
Client
 ↓
LB
 ↓
API
 ↓
Redis
 ↓
DB
```

## Stage 4

Configuration.

```text
replicas = ?
cache TTL = ?
connections = ?
```

## Stage 5

Optimization.

```text
Meet:
p95 < 200ms
Cost < $200/hour
```

## Stage 6

Failure.

```text
Redis fails.
```

## Stage 7

Multiple failures.

```text
Redis fails
+
traffic spike
+
DB saturation
```

## Stage 8

Production incident.

## Stage 9

Architecture design.

## Stage 10

Full-system boss.

---

# 51. Traffic Progression

Traffic should increase across worlds.

Approximate progression:

```text
World 1:        1–50 req/s
World 2:        50–500 req/s
World 3:        500–10K req/s
World 4:        1K–20K req/s
World 5:        5K–50K req/s
World 6:        10K–100K events/s
World 7:        20K–200K req/s
World 8:        50K–300K req/s
World 9:        50K–500K req/s
World 10+:      100K–1M+ req/s
Fusion worlds:  dynamic
```

Use game abstractions rather than claiming these are universal real-world limits.

---

# 52. Busy Running Traffic Mode

This is the central advanced gameplay mode.

The player sees a continuously running system.

Example:

```text
REQUESTS
████████████████████ 72K/s

LATENCY
p50  80ms
p95  220ms
p99  1.4s

ERRORS
████░░░░░░ 4.1%

CPU
API-1 72%
API-2 81%
API-3 95%

DATABASE
CPU 87%
Connections 920/1000

KAFKA
Lag 240K

REDIS
Hit Rate 91%
```

The player must continuously manage the platform.

Actions:

- Add replicas
- Remove replicas
- Configure autoscaling
- Change routing
- Enable caching
- Increase partitions
- Add consumers
- Rate-limit traffic
- Fail over
- Roll back
- Deploy
- Change resource limits

---

# 53. Decision Tradeoffs

Every major action should have consequences.

Example:

### Increase replicas

Pros:
- More capacity

Cons:
- More cost
- More database connections
- Potential downstream overload

### Enable aggressive retries

Pros:
- Temporary resilience

Cons:
- Can create retry storms

### Add caching

Pros:
- Lower DB load

Cons:
- Stale data
- Cache invalidation complexity

### Increase Kafka partitions

Pros:
- More parallelism

Cons:
- Ordering complexity
- Rebalancing considerations

The game should teach these tradeoffs.

---

# 54. Architecture Quality Evaluation

Evaluate:

```text
Correctness
Scalability
Reliability
Security
Observability
Cost
Complexity
Maintainability
```

Do not simply tell the player the best answer.

Explain the tradeoff.

---

# 55. Game Feedback

Use immediate feedback.

Example:

```text
+25 XP
CACHE ENABLED

DB load:
82% → 31%

Reason:
80% of requests are cacheable.

Tradeoff:
Data may become stale.
```

---

# 56. Tutorial Design

First-time players should have guided interactions.

Use:

- Highlighted buttons
- Animated arrows
- Short instructions
- Tooltips
- Interactive hints

Avoid long walls of text.

Use progressive disclosure.

---

# 57. Learning Mode vs Challenge Mode

Every major concept can eventually be played in:

### Learning Mode

Unlimited time.

Hints enabled.

Detailed explanations.

### Challenge Mode

Timer.

Limited hints.

Budget.

Scoring.

### Boss Mode

No direct hints.

Multiple interacting failures.

Incident score.

---

# 58. Hint System

Hints should have levels.

```text
Hint 1:
Look at the database.

Hint 2:
The database CPU is high.

Hint 3:
Your API is making too many DB requests.

Hint 4:
Consider caching.
```

Each hint reduces bonus XP slightly.

---

# 59. Explanation System

After every challenge show:

```text
What happened?

Why it happened?

What fixed it?

What could have gone wrong?

Where is this used in real systems?

Related concepts:
→ Cache
→ Database
→ Load
→ Latency
```

---

# 60. Final Boss — Production Apocalypse

Create a large multi-stage final scenario.

Initial architecture:

```text
                    USERS
                      │
                      ▼
                     CDN
                      │
                      ▼
                LOAD BALANCER
                      │
             ┌────────┴────────┐
             ▼                 ▼
          API #1             API #2
             │                 │
             └───────┬─────────┘
                     ▼
                API GATEWAY
               /     |      \
              ▼      ▼       ▼
           Auth    Orders   Payments
              │       │       │
              └───────┼───────┘
                      ▼
                    Kafka
                /     |      \
             Email  Billing  Analytics
                      │
                      ▼
                 PostgreSQL
                   /     \
              Primary    Replica
                      │
                    Redis
```

Initial traffic:

```text
100K req/s
```

Then incidents begin.

### Phase 1 — Traffic Spike

```text
100K → 300K req/s
```

### Phase 2 — Cache Failure

Redis begins failing.

### Phase 3 — Database Saturation

DB reaches 98% CPU.

### Phase 4 — Kafka Consumer Failure

Consumer lag increases.

### Phase 5 — Bad Deployment

Error rate jumps.

### Phase 6 — Third-party Payment API slowdown

Retries begin.

### Phase 7 — Cascading failure

All systems become unstable.

### Phase 8 — Recovery

Player must stabilize the platform.

### Phase 9 — Postmortem

Player identifies:

- Trigger
- Root cause
- Contributing factors
- Detection gap
- Recovery actions
- Preventive actions

---

# 61. Final Boss Scoring

Score:

```text
Incident response       25%
Architecture decisions  20%
Recovery speed          15%
Availability             15%
Cost                     10%
Root cause analysis      10%
Prevention                5%
```

Do not expose the exact formula if it harms gameplay.

Final report:

```text
PRODUCTION ENGINEERING REPORT

Availability: 99.72%
Peak traffic handled: 310K req/s
Peak latency: 3.2s
Final latency: 180ms
Total downtime: 21 sec
Cost efficiency: Good
Root cause identified: Yes
Recovery completed: Yes

Unlocked:
🏆 Production Engineer
🏆 Incident Commander
🏆 Distributed Systems Engineer
```

---

# 62. Persistence

Save:

```text
player level
completed levels
XP
world unlocks
skill tree
achievements
best scores
settings
tutorial completion
```

Use localStorage initially.

Version the save structure.

Example:

```ts
type SaveGame = {
  version: number;
  player: PlayerState;
  completedLevels: number[];
  achievements: string[];
  skillProgress: Record<string, number>;
};
```

Include migration logic for future versions.

---

# 63. Accessibility

Support:

- Keyboard navigation
- Focus states
- Reduced motion
- Color-safe status indicators
- Tooltips
- Screen-reader-friendly labels
- Pause controls
- Adjustable simulation speed where appropriate

Never use color alone to indicate state.

---

# 64. Responsive Design

Desktop-first because architecture simulation needs space.

Also support:

- Tablet
- Smaller laptop

Mobile should provide a simplified interaction mode.

Do not make the desktop architecture canvas unusable on mobile.

---

# 65. Performance Requirements

The game should remain responsive with:

- 100+ architecture nodes
- Hundreds of visual packets
- Multiple animated metrics
- Real-time charts

Do not create one React state update for every packet.

Use:

- requestAnimationFrame where appropriate
- simulation ticks
- memoized components
- batched state updates
- derived metrics

---

# 66. Simulation Determinism

Allow seeded simulations.

Example:

```ts
runSimulation({
  seed: 12345
});
```

This allows:

- Replay
- Debugging
- Testing
- Same challenge reproduction

---

# 67. Testing Requirements

Write unit tests for:

- Traffic calculation
- Capacity calculation
- Cost calculation
- Scoring
- XP
- Level unlocking
- Incident conditions
- Failure propagation
- Save/load
- Architecture validation

Do not rely only on UI tests.

---

# 68. Content Architecture

Keep all level content outside UI components.

Example:

```text
data/
  worlds/
    foundations.ts
    databases.ts
    scaling.ts
    containers.ts
    kubernetes.ts
    messaging.ts
    microservices.ts
    devops.ts
    terraform.ts
    observability.ts
    security.ts
    distributedSystems.ts
    production.ts
    fusion.ts
```

This allows new levels to be added without rewriting the game engine.

---

# 69. Component Library

Create reusable components:

```text
ArchitectureCanvas
ArchitectureNode
ConnectionLine
ComponentTray
ComponentCard
PacketAnimation
MetricCard
TrafficGraph
SystemHealth
IncidentPanel
QuizCard
BriefingPanel
HintPanel
XPToast
AchievementToast
SkillTree
WorldMap
LevelCard
BossPanel
CostPanel
ResourcePanel
Timeline
LogViewer
TraceViewer
```

---

# 70. Visual States

Components must have states:

```text
idle
selected
hover
connecting
healthy
warning
degraded
failed
recovering
locked
unlocked
```

Use animations to communicate state changes.

---

# 71. Architecture Canvas

The canvas is one of the most important UI elements.

Requirements:

- Pan
- Zoom
- Grid
- Snap-to-grid
- Connections
- Component labels
- Status indicators
- Traffic animation
- Selection
- Delete
- Inspect
- Highlight affected dependencies

Do not require a complicated diagramming library unless necessary.

---

# 72. Command/Action System

Advanced players should have an action panel.

Example:

```text
ACTIONS

Infrastructure
[+ Replica]
[- Replica]

Traffic
[Rate Limit]
[Route Traffic]

Cache
[Enable]
[Flush]

Kafka
[Add Consumer]
[Add Partition]

Deployment
[Deploy]
[Rollback]

Database
[Failover]
[Scale]
```

Every action must have consequences.

---

# 73. Logs

Provide simplified structured logs.

Example:

```text
12:04:31 ERROR payment-service
database connection timeout

12:04:32 WARN order-service
retry attempt 3

12:04:33 ERROR order-service
payment dependency unavailable
```

Players can filter by:

- service
- level
- time

---

# 74. Metrics

Provide:

- CPU
- memory
- latency
- throughput
- error rate
- connections
- queue depth
- Kafka lag
- cache hit rate
- database utilization
- network throughput
- cost

---

# 75. Traces

Show request waterfall:

```text
POST /orders

API Gateway       10ms
Auth               8ms
Order Service     40ms
Payment Service  820ms
Database          20ms

TOTAL             898ms
```

Players should learn to identify slow dependencies.

---

# 76. Production Decision Examples

The game should repeatedly teach questions such as:

> Should we scale the API or database?

> Should we cache this data?

> Should this operation be synchronous or asynchronous?

> Should we use REST or gRPC?

> Should this event go through Kafka or RabbitMQ?

> Should we retry?

> Should we fail fast?

> Should we use a circuit breaker?

> Should we use strong consistency?

> Should we add replicas?

> Should we partition the database?

> Should we use a queue?

> Should we deploy gradually?

These decisions are more important than memorizing product names.

---

# 77. Anti-Pattern Lessons

Include challenges where common "obvious" fixes make things worse.

Examples:

### Retry storm

```text
Service fails
→ 10 clients retry
→ each retry retries again
→ traffic multiplies
```

### Cache stampede

```text
Cache expires
→ 10,000 requests hit DB
→ DB overloaded
```

### Cascading failure

```text
Payment slow
→ Order waits
→ API connections exhausted
→ API fails
→ clients retry
→ system collapses
```

### Database scaling mistake

Adding more API servers increases database load and makes the problem worse.

The player should discover this through simulation.

---

# 78. Realistic Engineering Principles

The game should repeatedly reinforce:

- Measure before changing.
- Understand the bottleneck.
- Scale the constrained resource.
- Protect dependencies.
- Avoid unnecessary retries.
- Prefer graceful degradation.
- Make operations idempotent.
- Design for failure.
- Observe the system.
- Automate repeatable operations.
- Minimize blast radius.
- Deploy incrementally.
- Keep rollback possible.
- Balance reliability and cost.

---

# 79. Do Not Teach Vendor Lock-in

Cloud concepts should be provider-neutral.

Use generic names:

```text
Object Storage
Managed Database
Managed Kubernetes
Message Queue
Load Balancer
DNS
CDN
```

Optionally show examples:

```text
AWS
GCP
Azure
```

but do not make the game depend on one cloud provider.

---

# 80. Beginner Experience

The first 10 levels must be extremely approachable.

The player should feel:

> "I understand what is happening."

not:

> "I need to already be a backend engineer to play this."

Each early level should introduce only one or two new ideas.

---

# 81. Advanced Experience

From approximately Level 100 onward, start combining concepts.

From Level 200 onward, expect engineering judgment.

From Level 300 onward, simulate production.

After Level 340, use Fusion Worlds and procedural challenges.

---

# 82. No Hard End

The campaign has a major final boss but the game continues.

Post-campaign modes:

```text
Endless Production
Architecture Challenge
Incident Generator
Optimization Challenge
Cost Challenge
Speed Challenge
Zero Downtime Challenge
Chaos Mode
Interview Mode
System Design Mode
```

---

# 83. Interview Mode

Generate architecture questions.

Example:

> Design a URL shortener for 100M users.

Player must build:

```text
Client
→ API
→ Load Balancer
→ API Servers
→ Cache
→ Database
```

Then answer:

- How do you scale?
- What happens if Redis fails?
- What database indexing is needed?
- How do you handle duplicate IDs?

---

# 84. System Design Mode

Give:

```text
Requirements
Traffic
Latency target
Availability target
Budget
```

Player designs architecture.

Example:

```text
Users: 100M
Traffic: 50K req/s
p95: <200ms
Availability: 99.9%
Budget: $1000/hour
```

Evaluate the architecture across:

- correctness
- scaling
- reliability
- cost
- complexity

---

# 85. Chaos Mode

Randomly inject failures.

Possible failures:

```text
pod crash
node failure
Redis unavailable
DB replica lag
Kafka consumer crash
network latency
packet loss
DNS delay
certificate expiration
third-party outage
traffic spike
bad deployment
memory leak
disk full
```

Player must keep the system alive.

---

# 86. First Implementation Milestone

Do NOT attempt all 350+ levels in the first coding iteration.

Build the engine first with approximately 10 representative levels:

1. First request
2. Load balancer
3. Redis cache
4. Docker
5. Kubernetes
6. Kafka
7. WebSockets
8. CI/CD
9. Security
10. Observability

Then prove that the data-driven engine can support additional worlds.

After the engine works, expand content.

---

# 87. MVP Requirements

MVP must contain:

- Home screen
- World map
- Level screen
- Architecture canvas
- Component tray
- Drag/drop
- Correct/wrong validation
- XP
- Level unlocks
- Briefing
- Quiz
- Simulation
- Basic traffic animation
- Basic metrics
- localStorage save
- 10 polished levels
- Final mini-boss

The MVP should feel complete.

---

# 88. Phase 2

Add:

- Databases world
- Scaling world
- Docker world
- Kubernetes world
- Messaging world
- Cost system
- Skill tree
- Achievements
- More simulations
- Incident dashboard

---

# 89. Phase 3

Add:

- Microservices
- gRPC
- GraphQL
- WebSockets
- Webhooks
- CI/CD
- Terraform
- Observability
- Security
- Distributed systems

---

# 90. Phase 4

Add:

- Production incidents
- Multi-service simulations
- Boss fights
- Chaos mode
- System design mode
- Interview mode
- Procedural challenges
- Fusion worlds

---

# 91. Phase 5

Optional:

- Backend account system
- Cloud save
- Leaderboards
- Daily challenges
- Community challenges
- Multiplayer architecture battles

---

# 92. AI Coding Assistant Instructions

When implementing this project:

1. Do not build a static mockup.
2. Build reusable systems.
3. Keep content data-driven.
4. Separate UI from simulation logic.
5. Use TypeScript strictly.
6. Avoid `any` unless absolutely unavoidable.
7. Use reusable components.
8. Keep game state centralized.
9. Keep simulation deterministic where possible.
10. Add tests for game rules.
11. Build mobile-safe UI.
12. Prefer maintainable code over clever code.
13. Do not hardcode level-specific behavior into generic components.
14. Do not create fake functionality that looks interactive but does nothing.
15. Every button shown in the UI should perform a meaningful action.
16. Every level should have a clear success condition.
17. Every wrong action should provide educational feedback.
18. Every major system should be extensible.

---

# 93. Coding Order

The AI coding assistant should implement in this order:

```text
1. Project setup
2. Type system
3. Game state
4. Save/load
5. Level data model
6. Component data model
7. Architecture graph
8. Canvas
9. Drag/drop
10. Validation engine
11. XP/progression
12. World map
13. Quiz engine
14. Simulation engine
15. Traffic engine
16. Metrics
17. Cost engine
18. Incident engine
19. Skill tree
20. Achievements
21. Boss engine
22. First 10 levels
23. Testing
24. Polish
```

Do not start by generating hundreds of screens.

---

# 94. Definition of Done

The project is successful when a new level can be created primarily by adding data like:

```ts
const level = {
  id: 401,
  title: "Kafka Consumer Meltdown",
  concepts: [
    "kafka",
    "consumer-groups",
    "lag",
    "backpressure"
  ],
  ...
};
```

without modifying the main React architecture.

That is a key architectural requirement.

---

# 95. Final Product Experience

A new player should be able to start at:

```text
LEVEL 1
"What happens when you type a URL?"
```

and eventually reach:

```text
LEVEL 350+
"Your global production platform is failing.
You have 5 minutes.
Find the bottleneck.
Control the traffic.
Protect the database.
Recover the messaging system.
Rollback the bad deployment.
Stay under budget.
Maintain the SLO.
Then write the postmortem."
```

The player should finish the journey with an intuitive understanding of how backend systems fit together.

The goal is not to turn the player into a memorization machine.

The goal is to teach them to **think like a backend engineer operating a real system**.

---

# 96. Initial Level Design Examples

## Level 1 — First Request

Architecture:

```text
Client → Server
```

Teach:

- client
- server
- request
- response

Challenge:

Player connects the client to the server.

Success:

Packet travels.

---

## Level 2 — Database

```text
Client → Server → PostgreSQL
```

Teach:

- persistence
- database
- query

---

## Level 3 — HTTP

Player selects:

```text
GET
POST
PUT
DELETE
```

and matches them to scenarios.

---

## Level 4 — Ports

Player must expose:

```text
Server : 8080
Database : 5432
```

---

## Level 5 — Load Balancer

```text
Client
  ↓
Load Balancer
  ↓       ↓
API-1   API-2
```

Traffic animation shows round robin.

---

## Level 6 — Redis

```text
Client
 ↓
API
 ↓
Redis
 ↓
Database
```

Show cache hit/miss.

---

## Level 7 — Docker

Player creates:

```text
Dockerfile
→ Image
→ Container
→ Running API
```

---

## Level 8 — Kubernetes

```text
Cluster
 ├── Pod
 ├── Pod
 └── Pod
```

Player adds a Service.

---

## Level 9 — Kafka

```text
Order Service
     ↓
   Kafka
   /   \
Email  Payment
```

---

## Level 10 — Observability

Player connects:

```text
Services
   ↓
Telemetry
   ↓
Metrics + Logs + Traces
   ↓
Dashboard
```

---

# 97. Important Product Rule

The game must teach **relationships between concepts**.

For example:

Do not teach:

> Redis = cache.

Teach:

> Redis reduces repeated database work, which can reduce latency and database load, but introduces cache invalidation and consistency considerations.

Do not teach:

> Kafka = message queue.

Teach:

> Kafka provides distributed event streaming where partitioning enables parallelism, while ordering and consumer-lag behavior create design tradeoffs.

Do not teach:

> Kubernetes = containers.

Teach:

> Kubernetes orchestrates containerized workloads and provides scheduling, service discovery, health management, scaling, and self-healing mechanisms.

This principle applies to every technology.

---

# 98. Quality Bar

Before considering a level complete, verify:

```text
[ ] Concept is understandable
[ ] Player interacts with the concept
[ ] Architecture has visual feedback
[ ] Simulation has meaningful consequences
[ ] Wrong choices teach something
[ ] Correct choice has explanation
[ ] Difficulty is appropriate
[ ] XP is awarded
[ ] Progress is saved
[ ] Next level unlocks
[ ] No dead UI controls
[ ] No console errors
[ ] Mobile layout does not break
```

---

# 99. Final Instruction to the Coding Assistant

Build Backend Quest as a **real interactive educational simulation**, not a slideshow and not a collection of disconnected quizzes.

Start small, prove the engine, then expand.

The core loop is:

```text
LEARN
  ↓
BUILD
  ↓
RUN
  ↓
OBSERVE
  ↓
BREAK
  ↓
DEBUG
  ↓
OPTIMIZE
  ↓
SCALE
  ↓
RECOVER
  ↓
MASTER
```

Every world should introduce new backend knowledge.

Every later world should reuse earlier knowledge.

Every boss should combine systems.

Every advanced challenge should increase traffic, constraints, failures, and architectural complexity.

The final experience should make the player feel like they progressed from:

```text
Beginner
    ↓
Backend Developer
    ↓
Senior Backend Developer
    ↓
Distributed Systems Engineer
    ↓
Production Engineer
    ↓
System Architect
```

while remaining fun, visually engaging, interactive, and replayable.
