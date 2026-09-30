import React, { useState, useEffect } from 'react';
import { ArchitectureNode, ComponentId } from '../../types/game';
import { INFRASTRUCTURE_COMPONENTS } from '../../data/components';
import { calculateSimulationMetrics } from '../../engine/simulator';
import { ArchitectureCanvas } from '../canvas/ArchitectureCanvas';
import { MetricsDashboard } from '../simulation/MetricsDashboard';
import { Cpu, Sliders, Sparkles, RefreshCw, Flame, AlertTriangle } from 'lucide-react';

export const ArchitectureSandbox: React.FC = () => {
  const [nodes, setNodes] = useState<ArchitectureNode[]>([
    {
      instanceId: 'client-1',
      componentId: 'client',
      label: 'Public Clients',
      position: { x: 60, y: 180 },
      connections: ['lb-1']
    },
    {
      instanceId: 'lb-1',
      componentId: 'load-balancer',
      label: 'Ingress LB',
      position: { x: 260, y: 180 },
      connections: ['srv-1', 'srv-2']
    },
    {
      instanceId: 'srv-1',
      componentId: 'server',
      label: 'API Server #1',
      position: { x: 460, y: 120 },
      connections: ['db-1', 'redis-1']
    },
    {
      instanceId: 'srv-2',
      componentId: 'server',
      label: 'API Server #2',
      position: { x: 460, y: 240 },
      connections: ['db-1', 'redis-1']
    },
    {
      instanceId: 'redis-1',
      componentId: 'redis',
      label: 'Redis Cache',
      position: { x: 680, y: 120 },
      connections: []
    },
    {
      instanceId: 'db-1',
      componentId: 'postgresql',
      label: 'PostgreSQL Primary',
      position: { x: 680, y: 240 },
      connections: []
    }
  ]);

  const [targetRps, setTargetRps] = useState<number>(500);
  const [trafficPattern, setTrafficPattern] = useState<'constant' | 'spike' | 'retry-storm'>('constant');

  const metrics = calculateSimulationMetrics(
    nodes,
    INFRASTRUCTURE_COMPONENTS,
    targetRps,
    trafficPattern
  );

  const allComponentIds = Object.keys(INFRASTRUCTURE_COMPONENTS) as ComponentId[];

  // Interview Presets
  const loadPreset = (name: 'url-shortener' | 'ecommerce' | 'event-stream') => {
    if (name === 'url-shortener') {
      setTargetRps(2000);
      setNodes([
        { instanceId: 'c1', componentId: 'client', label: '100M Web Users', position: { x: 50, y: 180 }, connections: ['cdn1'] },
        { instanceId: 'cdn1', componentId: 'cdn', label: 'Cloudflare CDN', position: { x: 230, y: 180 }, connections: ['gw1'] },
        { instanceId: 'gw1', componentId: 'api-gateway', label: 'API Gateway', position: { x: 410, y: 180 }, connections: ['pod1'] },
        { instanceId: 'pod1', componentId: 'k8s-pod', label: 'Shortener Pods', position: { x: 590, y: 180 }, connections: ['redis1', 'pg1'] },
        { instanceId: 'redis1', componentId: 'redis', label: 'Redis 95% Cache', position: { x: 770, y: 110 }, connections: [] },
        { instanceId: 'pg1', componentId: 'postgresql', label: 'PostgreSQL Relational DB', position: { x: 770, y: 250 }, connections: [] }
      ]);
    } else if (name === 'ecommerce') {
      setTargetRps(5000);
      setNodes([
        { instanceId: 'c1', componentId: 'client', label: 'Shoppers', position: { x: 50, y: 180 }, connections: ['waf1'] },
        { instanceId: 'waf1', componentId: 'waf-firewall', label: 'WAF & DDoS Shield', position: { x: 220, y: 180 }, connections: ['lb1'] },
        { instanceId: 'lb1', componentId: 'load-balancer', label: 'Load Balancer', position: { x: 390, y: 180 }, connections: ['pod1'] },
        { instanceId: 'pod1', componentId: 'k8s-pod', label: 'Checkout Fleet', position: { x: 560, y: 180 }, connections: ['k1', 'redis1'] },
        { instanceId: 'redis1', componentId: 'redis', label: 'Inventory Cache', position: { x: 730, y: 110 }, connections: [] },
        { instanceId: 'k1', componentId: 'kafka', label: 'Order Event Stream', position: { x: 730, y: 250 }, connections: ['w1'] },
        { instanceId: 'w1', componentId: 'worker-service', label: 'Payment Worker', position: { x: 900, y: 250 }, connections: ['pg1'] },
        { instanceId: 'pg1', componentId: 'postgresql', label: 'Ledger DB', position: { x: 1070, y: 250 }, connections: [] }
      ]);
    } else if (name === 'event-stream') {
      setTargetRps(10000);
      setNodes([
        { instanceId: 'c1', componentId: 'client', label: 'IoT Fleet', position: { x: 50, y: 180 }, connections: ['lb1'] },
        { instanceId: 'lb1', componentId: 'load-balancer', label: 'Ingress LB', position: { x: 230, y: 180 }, connections: ['srv1'] },
        { instanceId: 'srv1', componentId: 'docker-container', label: 'Ingest Container', position: { x: 420, y: 180 }, connections: ['k1'] },
        { instanceId: 'k1', componentId: 'kafka', label: 'Kafka 32 Partitions', position: { x: 610, y: 180 }, connections: ['w1', 'w2'] },
        { instanceId: 'w1', componentId: 'worker-service', label: 'Analytics Worker', position: { x: 800, y: 120 }, connections: ['mg1'] },
        { instanceId: 'w2', componentId: 'worker-service', label: 'Notification Worker', position: { x: 800, y: 250 }, connections: [] },
        { instanceId: 'mg1', componentId: 'mongodb', label: 'Telemetry DB', position: { x: 980, y: 120 }, connections: [] }
      ]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <span>UNCONSTRAINED ARCHITECTURE LAB</span>
            <span className="text-slate-600">·</span>
            <span>System Design Sandbox</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Design Sandbox & Interview Simulator</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Test any architecture against customizable traffic volumes from 10 to 100,000 req/s.
          </p>
        </div>

        {/* System Design Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-mono mr-1">Presets:</span>
          <button
            onClick={() => loadPreset('url-shortener')}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            URL Shortener
          </button>
          <button
            onClick={() => loadPreset('ecommerce')}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            E-Commerce
          </button>
          <button
            onClick={() => loadPreset('event-stream')}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            Event Streaming
          </button>
        </div>
      </div>

      {/* Traffic Injection Slider Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sliders className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Traffic Ingress Generator</span>
            <span className="text-[11px] text-slate-400">Drag to stress test your architecture capacity</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-md">
          <input
            type="range"
            min="50"
            max="15000"
            step="50"
            value={targetRps}
            onChange={(e) => setTargetRps(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-sm font-bold font-mono text-blue-400 tabular-nums shrink-0 min-w-24 text-right">
            {targetRps.toLocaleString()} req/s
          </span>
        </div>
      </div>

      {/* Telemetry Dashboard */}
      <MetricsDashboard
        metrics={metrics}
        targetRps={targetRps}
        trafficPattern={trafficPattern}
        onPatternChange={setTrafficPattern}
        onTargetRpsChange={setTargetRps}
      />

      {/* Interactive Canvas */}
      <ArchitectureCanvas
        nodes={nodes}
        metrics={metrics}
        allowedComponents={allComponentIds}
        onNodesChange={setNodes}
      />
    </div>
  );
};
