import { IncidentScenario } from '../types/game';

export const INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: 'inc-db-meltdown',
    levelId: 24,
    title: 'SEV-1: Database Connection Pool Meltdown',
    severity: 'SEV1',
    description: 'Order API error rates spiked to 32%. P95 response times degraded from 45ms to 4.2 seconds. Primary PostgreSQL CPU is pegged at 98% with 980 of 1000 connections active.',
    timeLimitSeconds: 240,
    initialSymptoms: [
      { label: 'HTTP 500 / 504 Error Rate', value: '32.4%', severity: 'critical' },
      { label: 'P95 Order API Latency', value: '4,210 ms', severity: 'critical' },
      { label: 'PostgreSQL CPU Utilization', value: '98.5%', severity: 'critical' },
      { label: 'PostgreSQL Active Connections', value: '984 / 1000', severity: 'critical' },
      { label: 'Redis Cache Hit Rate', value: '12.1%', severity: 'warning' }
    ],
    logs: [
      { timestamp: '02:14:01', level: 'WARN', service: 'order-api-pod-3', message: 'HikariCP: Connection pool exhausted. Timeout after 3000ms.' },
      { timestamp: '02:14:03', level: 'ERROR', service: 'order-api-pod-1', message: 'POST /v1/orders failed: pq: remaining connection slots are reserved for non-replication superuser connections' },
      { timestamp: '02:14:05', level: 'ERROR', service: 'order-api-pod-2', message: 'HTTP 504 Gateway Timeout while awaiting response from postgres-primary.internal' },
      { timestamp: '02:14:08', level: 'INFO', service: 'postgres-primary', message: 'Slow query logged: SELECT * FROM products WHERE category = ? (duration: 3820ms, Seq Scan on products)' },
      { timestamp: '02:14:12', level: 'WARN', service: 'hpa-controller', message: 'Scaled order-api pods from 4 to 12 due to CPU threshold... Note: DB connections increased!' }
    ],
    traces: [
      {
        service: 'api-gateway',
        operation: 'POST /v1/orders',
        durationMs: 4210,
        status: 'error',
        children: [
          {
            service: 'order-api',
            operation: 'create_order_tx',
            durationMs: 4180,
            status: 'error',
            children: [
              {
                service: 'postgres-primary',
                operation: 'SELECT * FROM products (Seq Scan)',
                durationMs: 3890,
                status: 'error'
              }
            ]
          }
        ]
      }
    ],
    availableActions: [
      {
        id: 'act-scale-api',
        label: 'Scale Order API Pods (+10 Replicas)',
        description: 'Spin up 10 additional API servers to handle incoming traffic.',
        cost: 40,
        effect: 'scale-up',
        consequenceText: 'DISASTER! Adding more API pods opened 500 MORE connections to PostgreSQL, causing the database to crash completely!',
        isCorrectIntervention: false
      },
      {
        id: 'act-enable-cache',
        label: 'Enable Redis Cache-Aside & Query Deduplication',
        description: 'Route hot product category reads to in-memory Redis cluster with 60s TTL.',
        cost: 25,
        effect: 'enable-cache',
        consequenceText: 'SUCCESS! Redis absorbed 92% of repeated product queries. PostgreSQL connection pool freed up immediately, dropping DB CPU to 24%!',
        isCorrectIntervention: true
      },
      {
        id: 'act-rate-limit',
        label: 'Engage Edge Rate Limiting (Token Bucket)',
        description: 'Throttle runaway client retries at API Gateway to 2,000 req/s.',
        cost: 15,
        effect: 'rate-limit',
        consequenceText: 'HALT THE STORM! Rate limiting stopped client retry storms from pounding the database while recovery is underway.',
        isCorrectIntervention: true
      },
      {
        id: 'act-failover-db',
        label: 'Trigger Emergency DB Failover to Replica',
        description: 'Force promote read replica to primary.',
        cost: 50,
        effect: 'failover-db',
        consequenceText: 'FAILED: The replica was also suffering high replication lag due to the sequential scan; failover caused temporary split-brain.',
        isCorrectIntervention: false
      }
    ],
    rootCauseOptions: [
      {
        id: 'rc-1',
        text: 'Unindexed sequential table scans on products bypassed caching and saturated the PostgreSQL connection pool.',
        isCorrect: true,
        explanation: 'Exact! Missing indexes and a 12% cache hit rate forced every order to perform a 3.8-second table scan, holding connections open until pool exhaustion occurred.'
      },
      {
        id: 'rc-2',
        text: 'The physical SSD hard drive ran out of sector space.',
        isCorrect: false,
        explanation: 'Logs show CPU saturation and pool exhaustion, not disk capacity alerts.'
      },
      {
        id: 'rc-3',
        text: 'The API Gateway was hacked by a distributed DDoS botnet.',
        isCorrect: false,
        explanation: 'Traces pinpoint the delay inside PostgreSQL sequential scan, not gateway infiltration.'
      }
    ]
  },
  {
    id: 'inc-kafka-lag',
    levelId: 16,
    title: 'SEV-2: Kafka Consumer Lag & Poison Pill Backlog',
    severity: 'SEV2',
    description: 'Email and Notification delivery lag increased to 1,400,000 messages. Background workers are crashing repeatedly, stalling event processing.',
    timeLimitSeconds: 210,
    initialSymptoms: [
      { label: 'Kafka Consumer Lag', value: '1,420,000 msgs', severity: 'critical' },
      { label: 'Worker Process Restarts', value: '42 restarts / min', severity: 'critical' },
      { label: 'Email Dispatch Latency', value: '45 mins behind', severity: 'critical' },
      { label: 'Kafka Broker Throughput', value: 'Healthy (22K msg/s)', severity: 'warning' }
    ],
    logs: [
      { timestamp: '14:22:10', level: 'ERROR', service: 'notification-worker-group-1', message: 'Fatal: Unhandled JSON parsing syntax exception on message offset #9928172! Payload: "<malformed-xml>"' },
      { timestamp: '14:22:11', level: 'WARN', service: 'kafka-coordinator', message: 'Consumer notification-worker-2 heartbeat timed out. Triggering partition rebalance!' },
      { timestamp: '14:22:15', level: 'ERROR', service: 'notification-worker-group-1', message: 'Worker restarted, re-consumed offset #9928172, crashed again! CrashLoopBackOff initiated.' }
    ],
    traces: [
      {
        service: 'notification-worker',
        operation: 'poll_and_process_batch',
        durationMs: 12000,
        status: 'error',
        children: [
          {
            service: 'deserializer',
            operation: 'json_decode_message',
            durationMs: 2,
            status: 'error'
          }
        ]
      }
    ],
    availableActions: [
      {
        id: 'act-add-dlq',
        label: 'Route Poison Pill to Dead Letter Queue (DLQ)',
        description: 'Catch serialization errors, forward malformed payload to DLQ for offline inspection, and commit offset.',
        cost: 15,
        effect: 'rollback',
        consequenceText: 'SUCCESS! Unparsable message was quarantined into DLQ. Workers stopped crashing and cleared the 1.4M backlog in 90 seconds!',
        isCorrectIntervention: true
      },
      {
        id: 'act-add-partitions',
        label: 'Increase Kafka Partitions & Scale Workers (4 -> 16)',
        description: 'Increase topic partitions from 4 to 16 to parallelize throughput.',
        cost: 35,
        effect: 'add-partitions',
        consequenceText: 'PARTIAL RELIEF: 16 workers began parallel drain, but the crashing worker still needed DLQ protection.',
        isCorrectIntervention: true
      },
      {
        id: 'act-restart-workers',
        label: 'Blindly Restart All Workers without Code Fix',
        description: 'Send SIGKILL and restart worker deployment.',
        cost: 10,
        effect: 'restart-consumers',
        consequenceText: 'FAILED: Workers simply re-read the exact same bad offset #9928172 and crashed again immediately.',
        isCorrectIntervention: false
      }
    ],
    rootCauseOptions: [
      {
        id: 'rc-k1',
        text: 'A malformed payload created a poison pill that caused consumers to crash and re-consume the same offset in an endless loop.',
        isCorrect: true,
        explanation: 'Correct! Without a Dead Letter Queue (DLQ), a single malformed message will block an entire consumer partition forever.'
      },
      {
        id: 'rc-k2',
        text: 'The Kafka cluster ran out of TCP port allocations.',
        isCorrect: false,
        explanation: 'Kafka broker metrics are completely healthy; the failure was application-level message deserialization.'
      }
    ]
  }
];
