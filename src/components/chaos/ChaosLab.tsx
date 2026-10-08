import React, { useState } from 'react';
import { ArchitectureNode, ComponentId } from '../../types/game';
import { INFRASTRUCTURE_COMPONENTS } from '../../data/components';
import { calculateSimulationMetrics } from '../../engine/simulator';
import { ArchitectureCanvas } from '../canvas/ArchitectureCanvas';
import { MetricsDashboard } from '../simulation/MetricsDashboard';
import { 
  Flame, Skull, Zap, AlertTriangle, ShieldCheck, 
  RotateCcw, Sliders, Activity, Terminal, ShieldAlert, Cpu
} from 'lucide-react';

export const ChaosLab: React.FC = () => {
  const [nodes, setNodes] = useState<ArchitectureNode[]>([
    {
      instanceId: 'client-1',
      componentId: 'client',
      label: 'Global Web Clients',
      position: { x: 50, y: 180 },
      connections: ['waf-1'],
      protocol: 'HTTPS'
    },
    {
      instanceId: 'waf-1',
      componentId: 'waf-firewall',
      label: 'Cloudflare WAF',
      position: { x: 230, y: 180 },
      connections: ['nginx-1'],
      protocol: 'HTTPS'
    },
    {
      instanceId: 'nginx-1',
      componentId: 'nginx-reverse-proxy',
      label: 'Nginx Ingress Proxy',
      position: { x: 410, y: 180 },
      connections: ['pod-1', 'pod-2'],
      protocol: 'HTTP/2'
    },
    {
      instanceId: 'pod-1',
      componentId: 'k8s-pod',
      label: 'Order API Pod #1',
      position: { x: 590, y: 110 },
      connections: ['redis-1', 'pg-1'],
      protocol: 'gRPC'
    },
    {
      instanceId: 'pod-2',
      componentId: 'k8s-pod',
      label: 'Order API Pod #2',
      position: { x: 590, y: 250 },
      connections: ['redis-1', 'pg-1'],
      protocol: 'gRPC'
    },
    {
      instanceId: 'redis-1',
      componentId: 'redis',
      label: 'Redis Cache-Aside',
      position: { x: 780, y: 110 },
      connections: [],
      cacheConfig: { strategy: 'cache-aside', ttlSeconds: 300, evictionPolicy: 'LRU' }
    },
    {
      instanceId: 'pg-1',
      componentId: 'postgresql',
      label: 'PostgreSQL Primary',
      position: { x: 780, y: 250 },
      connections: [],
      databaseConfig: { indexes: ['order_id', 'user_id'], connectionPoolSize: 50, readReplicas: 2 }
    }
  ]);

  const [targetRps, setTargetRps] = useState<number>(5000);
  const [trafficPattern, setTrafficPattern] = useState<'constant' | 'spike' | 'retry-storm'>('constant');
  const [activeChaos, setActiveChaos] = useState<string[]>([]);
  const [logs, setLogs] = useState<{ id: string; time: string; text: string; level: 'warn' | 'error' | 'ok' }[]>([
    { id: '1', time: '21:50:00', text: 'Chaos Lab Initialized. Base telemetry active.', level: 'ok' },
    { id: '2', time: '21:50:01', text: 'Ready for traffic injection and chaos monkey stress testing.', level: 'ok' }
  ]);

  const toggleChaos = (chaosKey: string, label: string) => {
    setActiveChaos(prev => {
      const isCurrentlyActive = prev.includes(chaosKey);
      const now = new Date().toLocaleTimeString();
      if (isCurrentlyActive) {
        setLogs(l => [{ id: Math.random().toString(), time: now, text: `Deactivated chaos: ${label}. System stabilizing.`, level: 'ok' }, ...l.slice(0, 8)]);
        return prev.filter(k => k !== chaosKey);
      } else {
        setLogs(l => [{ id: Math.random().toString(), time: now, text: `INJECTED CHAOS: ${label}! Measuring blast radius...`, level: 'error' }, ...l.slice(0, 8)]);
        return [...prev, chaosKey];
      }
    });
  };

  const metrics = calculateSimulationMetrics(
    nodes,
    INFRASTRUCTURE_COMPONENTS,
    targetRps,
    trafficPattern,
    activeChaos
  );

  const allComponentIds = Object.keys(INFRASTRUCTURE_COMPONENTS) as ComponentId[];

  const presets = [
    { name: 'Normal Browse (2K RPS)', rps: 2000, pattern: 'constant' as const },
    { name: 'Black Friday Rush (25K RPS)', rps: 25000, pattern: 'spike' as const },
    { name: 'Microservice Retry Storm (60K RPS)', rps: 60000, pattern: 'retry-storm' as const }
  ];

  const chaosOptions = [
    { id: 'kill-api', label: 'Kill API Pod', desc: 'Simulates sudden OOMKill or node hardware crash', icon: <Skull className="w-3.5 h-3.5 text-red-400" /> },
    { id: 'flush-cache', label: 'Flush Redis Cache', desc: 'Triggers Cache Stampede & Thundering Herd onto DB', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
    { id: 'db-latency', label: 'Inject 450ms DB Lock', desc: 'Simulates unindexed sequential table scan lock', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'poison-pill', label: 'Inject Poison Pill', desc: 'Sends unparseable message into queue (tests DLQ)', icon: <Zap className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'ddos-flood', label: 'Layer 7 DDoS Flood', desc: 'Adds +35K RPS volumetric botnet attack (tests WAF)', icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> },
    { id: 'network-partition', label: 'Simulate Network Partition', desc: 'Cuts cross-region pipe (tests Circuit Breaker)', icon: <Activity className="w-3.5 h-3.5 text-cyan-400" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-5">
      {/* Top Raid / Chaos Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="bg-orange-950/80 border border-orange-800/80 text-orange-300 font-bold px-2 py-0.5 rounded">
                CHAOS LAB & TRAFFIC RAID
              </span>
              <span className="text-slate-400">CLASH OF STACKS SIMULATOR</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">Production Stress Testing & Chaos Engineering</h1>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Inject real-world production incidents, load spikes, and network partitions into your architecture base. Test if your defenses (WAF, Caches, Circuit Breakers, DLQs) can keep your system operational.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          {presets.map(p => (
            <button
              key={p.name}
              onClick={() => {
                setTargetRps(p.rps);
                setTrafficPattern(p.pattern);
              }}
              className="px-2.5 py-1.5 text-xs font-mono bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded text-slate-200 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chaos Monkey Controller Panel */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Skull className="w-4 h-4 text-red-400" />
            <span>Chaos Monkey Injections ({activeChaos.length} Active)</span>
          </div>
          {activeChaos.length > 0 && (
            <button
              onClick={() => setActiveChaos([])}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Chaos</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {chaosOptions.map(opt => {
            const isActive = activeChaos.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleChaos(opt.id, opt.label)}
                className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-1.5 ${
                  isActive
                    ? 'bg-red-950/80 border-red-500 shadow-md shadow-red-500/20 text-white'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    {opt.icon}
                    <span>{opt.label}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-400 animate-ping' : 'bg-slate-600'}`} />
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Telemetry Dashboard */}
      <MetricsDashboard
        metrics={metrics}
        targetRps={targetRps}
        trafficPattern={trafficPattern}
        onPatternChange={setTrafficPattern}
        onTargetRpsChange={setTargetRps}
      />

      {/* Main Interactive Architecture Canvas */}
      <div className="h-[520px]">
        <ArchitectureCanvas
          nodes={nodes}
          metrics={metrics}
          allowedComponents={allComponentIds}
          onNodesChange={setNodes}
        />
      </div>

      {/* Live Event Stream / Incident Telemetry Terminal */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-green-400" />
            <span>Chaos SRE Telemetry Log Stream</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Auto-refreshing (Real-time)</span>
        </div>
        <div className="flex flex-col gap-1 font-mono text-xs">
          {logs.map(log => (
            <div key={log.id} className="flex items-center gap-3">
              <span className="text-slate-500 text-[11px]">{log.time}</span>
              <span className={log.level === 'error' ? 'text-red-400 font-bold' : log.level === 'warn' ? 'text-amber-400' : 'text-slate-300'}>
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
