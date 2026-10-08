import React, { useState } from 'react';
import { ArchitectureNode, ComponentId } from '../../types/game';
import { INFRASTRUCTURE_COMPONENTS } from '../../data/components';
import { calculateSimulationMetrics } from '../../engine/simulator';
import { ArchitectureCanvas } from '../canvas/ArchitectureCanvas';
import { MetricsDashboard } from '../simulation/MetricsDashboard';
import { 
  Award, CheckCircle2, AlertTriangle, ShieldCheck, 
  Sparkles, DollarSign, Activity, Lock, Database, Layers, ArrowRight
} from 'lucide-react';

interface ArchitectScenario {
  id: string;
  title: string;
  tagline: string;
  targetRps: number;
  slaLatencyMs: number;
  maxBudgetHourly: number;
  description: string;
  requirements: string[];
}

export const SeniorArchitectStudio: React.FC = () => {
  const scenarios: ArchitectScenario[] = [
    {
      id: 'uber-dispatch',
      title: 'Global Ride-Sharing Dispatch',
      tagline: 'High write concurrency, persistent streaming & geospatial matching',
      targetRps: 20000,
      slaLatencyMs: 80,
      maxBudgetHourly: 250,
      description: 'Design the backend infrastructure for 100 million riders and drivers. Continuous GPS telemetry streams in over WebSockets, rides must be dispatched in under 100ms, and transactions must be recorded without data loss.',
      requirements: [
        'Must handle 20,000+ RPS sustained without dropping connections',
        'Persistent bi-directional stream (WebSocket or gRPC) for live driver locations',
        'In-memory cache layer (Redis) for sub-5ms geospatial queries',
        'Asynchronous event stream (Kafka) to decouple ride dispatch from billing',
        'ACID relational storage (PostgreSQL) for ledger payments'
      ]
    },
    {
      id: 'black-friday-flash',
      title: 'Black Friday E-Commerce Checkout',
      tagline: 'Surge protection, inventory reservation & zero overselling',
      targetRps: 45000,
      slaLatencyMs: 120,
      maxBudgetHourly: 400,
      description: 'A global flash sale drops 50,000 requests per second at midnight. You must guard against bot scraping, cache product catalog reads at the edge, and queue checkouts so the database is never saturated.',
      requirements: [
        'Must absorb 45,000+ RPS peak traffic',
        'WAF & Edge CDN to filter bot attacks and absorb 80% of static read traffic',
        'Cache-aside strategy with short TTL for stock inventory',
        'Circuit Breaker to fail fast if payment gateways encounter latency',
        'Dead Letter Queue to quarantine corrupt orders without stalling checkout'
      ]
    },
    {
      id: 'collab-canvas',
      title: 'Real-Time Collaborative Document Canvas',
      tagline: 'Global low latency, state synchronization & snapshot persistence',
      targetRps: 15000,
      slaLatencyMs: 50,
      maxBudgetHourly: 200,
      description: 'Thousands of users edit shared canvas documents simultaneously. Edits must propagate under 50ms, while background snapshots are archived periodically into cloud object storage.',
      requirements: [
        'Sub-50ms P95 latency for document synchronization',
        'WebSocket or HTTP/2 multiplexed streams for instant event dispatch',
        'S3 Object Storage for immutable snapshot backups',
        'Worker fleet to compress and archive document revisions asynchronously'
      ]
    }
  ];

  const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarios[0].id);
  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  const [nodes, setNodes] = useState<ArchitectureNode[]>([
    {
      instanceId: 'client-1',
      componentId: 'client',
      label: 'Global Mobile Apps',
      position: { x: 50, y: 180 },
      connections: ['cdn-1'],
      protocol: 'HTTPS'
    },
    {
      instanceId: 'cdn-1',
      componentId: 'cdn',
      label: 'Global Edge CDN',
      position: { x: 230, y: 180 },
      connections: ['gw-1'],
      protocol: 'HTTPS'
    },
    {
      instanceId: 'gw-1',
      componentId: 'api-gateway',
      label: 'API Gateway & Auth',
      position: { x: 410, y: 180 },
      connections: ['srv-1'],
      protocol: 'gRPC'
    },
    {
      instanceId: 'srv-1',
      componentId: 'k8s-pod',
      label: 'Core Dispatch Pod',
      position: { x: 600, y: 180 },
      connections: ['redis-1', 'kafka-1'],
      protocol: 'gRPC'
    },
    {
      instanceId: 'redis-1',
      componentId: 'redis',
      label: 'Redis Geo Cache',
      position: { x: 790, y: 110 },
      connections: [],
      cacheConfig: { strategy: 'cache-aside', ttlSeconds: 120, evictionPolicy: 'LRU' }
    },
    {
      instanceId: 'kafka-1',
      componentId: 'kafka',
      label: 'Event Commit Log',
      position: { x: 790, y: 250 },
      connections: ['worker-1'],
      queueConfig: { partitions: 16, consumerGroup: 'billing-group', hasDeadLetterQueue: true }
    },
    {
      instanceId: 'worker-1',
      componentId: 'worker-service',
      label: 'Billing Consumer',
      position: { x: 970, y: 250 },
      connections: ['pg-1']
    },
    {
      instanceId: 'pg-1',
      componentId: 'postgresql',
      label: 'Postgres Ledger DB',
      position: { x: 1150, y: 250 },
      connections: [],
      databaseConfig: { indexes: ['account_id', 'created_at'], connectionPoolSize: 60, readReplicas: 2 }
    }
  ]);

  const metrics = calculateSimulationMetrics(
    nodes,
    INFRASTRUCTURE_COMPONENTS,
    activeScenario.targetRps,
    'constant'
  );

  const allComponentIds = Object.keys(INFRASTRUCTURE_COMPONENTS) as ComponentId[];

  // Senior Architecture Scoring Algorithm across 5 Pillars
  const evaluateArchitecture = () => {
    let scalability = 50;
    let reliability = 50;
    let costEfficiency = 70;
    let consistency = 60;
    let security = 50;
    const feedback: string[] = [];

    // Scalability checks
    const hasLB = nodes.some(n => n.componentId === 'load-balancer' || n.componentId === 'api-gateway' || n.componentId === 'nginx-reverse-proxy');
    const hasCDN = nodes.some(n => n.componentId === 'cdn');
    const hasRedis = nodes.some(n => n.componentId === 'redis');
    const hasKafka = nodes.some(n => n.componentId === 'kafka');
    const hasWorkers = nodes.some(n => n.componentId === 'worker-service');

    if (hasLB) scalability += 15;
    if (hasCDN) scalability += 15;
    if (hasRedis) scalability += 15;
    if (hasKafka && hasWorkers) scalability += 15;

    // Reliability & Resilience
    const hasCircuitBreaker = nodes.some(n => n.componentId === 'circuit-breaker');
    const hasDLQ = nodes.some(n => n.componentId === 'dead-letter-queue') || nodes.some(n => n.queueConfig?.hasDeadLetterQueue);
    const hasServiceMesh = nodes.some(n => n.componentId === 'service-mesh');

    if (metrics.errorRate < 0.01) reliability += 20;
    if (hasCircuitBreaker) reliability += 15;
    if (hasDLQ) reliability += 15;
    if (hasServiceMesh) reliability += 10;

    // Security
    const hasWAF = nodes.some(n => n.componentId === 'waf-firewall');
    const hasGateway = nodes.some(n => n.componentId === 'api-gateway');
    if (hasWAF) security += 25;
    if (hasGateway) security += 15;
    if (hasServiceMesh) security += 15;

    // Consistency & Data
    const hasDB = nodes.some(n => n.componentId === 'postgresql' || n.componentId === 'mongodb');
    const pgNode = nodes.find(n => n.componentId === 'postgresql');
    if (hasDB) consistency += 15;
    if (pgNode?.databaseConfig?.indexes && pgNode.databaseConfig.indexes.length > 0) consistency += 15;
    if (pgNode?.databaseConfig?.readReplicas && pgNode.databaseConfig.readReplicas > 1) consistency += 10;

    // Cost
    if (metrics.hourlyCost > activeScenario.maxBudgetHourly) {
      costEfficiency -= Math.min(40, Math.round((metrics.hourlyCost - activeScenario.maxBudgetHourly) / 5));
      feedback.push(`Over budget: Hourly burn ($${metrics.hourlyCost}/hr) exceeds limit of $${activeScenario.maxBudgetHourly}/hr.`);
    } else {
      costEfficiency += 20;
    }

    if (metrics.latencyMs > activeScenario.slaLatencyMs) {
      feedback.push(`SLA Latency breached: P50 latency (${metrics.latencyMs}ms) exceeds target (${activeScenario.slaLatencyMs}ms). Add caching or reverse proxy.`);
    }

    if (!hasWAF) {
      feedback.push('Missing Edge WAF: System is vulnerable to volumetric Layer 7 bot attacks.');
    }

    if (hasKafka && !hasDLQ) {
      feedback.push('Missing Dead Letter Queue: Poison pill messages could trigger CrashLoopBackOff on consumer workers.');
    }

    const totalScore = Math.min(100, Math.round((scalability + reliability + costEfficiency + consistency + security) / 5));

    return {
      totalScore,
      scalability: Math.min(100, scalability),
      reliability: Math.min(100, reliability),
      costEfficiency: Math.max(0, Math.min(100, costEfficiency)),
      consistency: Math.min(100, consistency),
      security: Math.min(100, security),
      feedback
    };
  };

  const evaluation = evaluateArchitecture();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-5">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 font-bold px-2 py-0.5 rounded">
                SENIOR ARCHITECT STUDIO
              </span>
              <span className="text-slate-400">OPEN-ENDED PRODUCTION DESIGN</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">Enterprise System Design Evaluator</h1>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              There is no single correct textbook diagram. Design a production architecture that balances scalability, reliability, cost, data consistency, and security against business requirements.
            </p>
          </div>
        </div>

        {/* Scenario Switcher */}
        <div className="flex flex-wrap gap-2">
          {scenarios.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveScenarioId(s.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                activeScenarioId === s.id
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Brief & Objectives */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{activeScenario.title}</span>
            <span className="text-xs text-slate-400 font-normal">({activeScenario.tagline})</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">{activeScenario.description}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {activeScenario.requirements.map((req, idx) => (
              <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                ✓ {req}
              </span>
            ))}
          </div>
        </div>

        {/* SLA & Budget Targets */}
        <div className="flex sm:flex-col justify-end gap-2 shrink-0 text-xs font-mono">
          <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800">
            <span className="text-slate-400">Target Scale: </span>
            <span className="text-white font-bold">{activeScenario.targetRps.toLocaleString()} req/s</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800">
            <span className="text-slate-400">Max Latency SLA: </span>
            <span className="text-cyan-400 font-bold">&lt; {activeScenario.slaLatencyMs}ms</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800">
            <span className="text-slate-400">Budget Limit: </span>
            <span className="text-emerald-400 font-bold">&lt; ${activeScenario.maxBudgetHourly}/hr</span>
          </div>
        </div>
      </div>

      {/* 5-Pillar Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Architecture Score</span>
          <div className="text-2xl font-black font-mono text-blue-400 my-1">{evaluation.totalScore}<span className="text-xs text-slate-500 font-normal">/100</span></div>
          <span className="text-[10px] text-slate-500">Overall composite</span>
        </div>

        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400"><Layers className="w-3 h-3 text-cyan-400" /><span>Scalability</span></div>
          <div className="text-xl font-bold font-mono text-cyan-300 my-1">{evaluation.scalability}%</div>
          <div className="w-full bg-slate-800 h-1 rounded"><div className="bg-cyan-400 h-full rounded" style={{ width: `${evaluation.scalability}%` }} /></div>
        </div>

        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400"><Activity className="w-3 h-3 text-emerald-400" /><span>Reliability</span></div>
          <div className="text-xl font-bold font-mono text-emerald-300 my-1">{evaluation.reliability}%</div>
          <div className="w-full bg-slate-800 h-1 rounded"><div className="bg-emerald-400 h-full rounded" style={{ width: `${evaluation.reliability}%` }} /></div>
        </div>

        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400"><DollarSign className="w-3 h-3 text-green-400" /><span>Cost Efficiency</span></div>
          <div className="text-xl font-bold font-mono text-green-300 my-1">{evaluation.costEfficiency}%</div>
          <div className="w-full bg-slate-800 h-1 rounded"><div className="bg-green-400 h-full rounded" style={{ width: `${evaluation.costEfficiency}%` }} /></div>
        </div>

        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400"><Database className="w-3 h-3 text-purple-400" /><span>Consistency</span></div>
          <div className="text-xl font-bold font-mono text-purple-300 my-1">{evaluation.consistency}%</div>
          <div className="w-full bg-slate-800 h-1 rounded"><div className="bg-purple-400 h-full rounded" style={{ width: `${evaluation.consistency}%` }} /></div>
        </div>

        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400"><Lock className="w-3 h-3 text-amber-400" /><span>Zero Trust / WAF</span></div>
          <div className="text-xl font-bold font-mono text-amber-300 my-1">{evaluation.security}%</div>
          <div className="w-full bg-slate-800 h-1 rounded"><div className="bg-amber-400 h-full rounded" style={{ width: `${evaluation.security}%` }} /></div>
        </div>
      </div>

      {/* Metrics Bar */}
      <MetricsDashboard
        metrics={metrics}
        targetRps={activeScenario.targetRps}
        trafficPattern="constant"
        onPatternChange={() => {}}
      />

      {/* Canvas */}
      <div className="h-[520px]">
        <ArchitectureCanvas
          nodes={nodes}
          metrics={metrics}
          allowedComponents={allComponentIds}
          onNodesChange={setNodes}
        />
      </div>

      {/* Evaluator Trade-Off Feedback */}
      {evaluation.feedback.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-4">
          <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Architect Review & Trade-Off Critiques</span>
          </h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/90 font-mono">
            {evaluation.feedback.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
