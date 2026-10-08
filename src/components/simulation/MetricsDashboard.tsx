import React from 'react';
import { SimulationMetrics } from '../../types/game';
import { Activity, Zap, DollarSign, AlertTriangle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface MetricsDashboardProps {
  metrics: SimulationMetrics;
  targetRps: number;
  trafficPattern: 'constant' | 'spike' | 'retry-storm';
  onPatternChange: (pattern: 'constant' | 'spike' | 'retry-storm') => void;
  onTargetRpsChange?: (rps: number) => void;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  targetRps,
  trafficPattern,
  onPatternChange,
  onTargetRpsChange
}) => {
  const isHighLatency = metrics.latencyMs > 150;
  const isErrorAlert = metrics.errorRate > 0.05;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-4">
      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Throughput */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">Throughput</span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-100">
            {metrics.requestsPerSecond.toLocaleString()}
            <span className="text-xs text-slate-400 font-normal ml-1">req/s</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Target: {metrics.targetRps.toLocaleString()}
          </div>
        </div>

        {/* P95 Latency */}
        <div className={`p-3 bg-slate-950/60 rounded-lg border ${isHighLatency ? 'border-amber-500/50' : 'border-slate-800/80'}`}>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Zap className={`w-3.5 h-3.5 ${isHighLatency ? 'text-amber-400' : 'text-cyan-400'}`} />
            <span className="font-medium">P95 Latency</span>
          </div>
          <div className={`text-lg font-bold font-mono tabular-nums ${isHighLatency ? 'text-amber-300' : 'text-slate-100'}`}>
            {metrics.p95LatencyMs}
            <span className="text-xs text-slate-400 font-normal ml-1">ms</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            P50: {metrics.latencyMs}ms · P99: {metrics.p99LatencyMs}ms
          </div>
        </div>

        {/* Error Rate */}
        <div className={`p-3 bg-slate-950/60 rounded-lg border ${isErrorAlert ? 'border-red-500/60 bg-red-950/10' : 'border-slate-800/80'}`}>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <AlertTriangle className={`w-3.5 h-3.5 ${isErrorAlert ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="font-medium">Error Rate</span>
          </div>
          <div className={`text-lg font-bold font-mono tabular-nums ${isErrorAlert ? 'text-red-400' : 'text-emerald-300'}`}>
            {(metrics.errorRate * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {metrics.errorRate === 0 ? '0 dropped packets' : 'Dropped under load'}
          </div>
        </div>

        {/* CPU Saturation */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">Compute Load</span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-100">
            {metrics.cpuPercent}%
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full transition-all ${
                metrics.cpuPercent > 85 ? 'bg-red-500' : metrics.cpuPercent > 60 ? 'bg-amber-400' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, metrics.cpuPercent)}%` }}
            />
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Cache Shield</span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-100">
            {Math.round(metrics.cacheHitRate * 100)}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {metrics.cacheHitRate > 0 ? 'Absorbed by Redis/CDN' : 'No cache layer'}
          </div>
        </div>

        {/* Hourly Cost & Profit */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-green-400" />
            <span className="font-medium">Economics</span>
          </div>
          <div className={`text-lg font-bold font-mono tabular-nums ${metrics.netProfitPerHour >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {metrics.netProfitPerHour >= 0 ? `+$${metrics.netProfitPerHour}` : `-$${Math.abs(metrics.netProfitPerHour)}`}
            <span className="text-xs text-slate-400 font-normal ml-1">/hr</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Rev: ${metrics.revenuePerHour} · Cost: ${metrics.hourlyCost}
          </div>
        </div>
      </div>

      {/* SRE Reliability Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-slate-950/70 rounded-lg border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Target SLO:</span>
            <span className="font-bold text-cyan-400">99.9%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Current Availability:</span>
            <span className={`font-bold ${metrics.sloCompliance >= 99.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {metrics.sloCompliance}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Error Budget:</span>
            <span className={`font-bold ${metrics.errorBudgetPercent > 50 ? 'text-emerald-400' : metrics.errorBudgetPercent > 10 ? 'text-amber-400' : 'text-red-400'}`}>
              {metrics.errorBudgetPercent}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Latency Percentiles:</span>
          <span>P50: <strong className="text-white">{metrics.p50LatencyMs || Math.round(metrics.latencyMs * 0.85)}ms</strong></span>
          <span>P95: <strong className="text-amber-300">{metrics.p95LatencyMs}ms</strong></span>
          <span>P99: <strong className="text-red-400">{metrics.p99LatencyMs}ms</strong></span>
        </div>
      </div>

      {/* Traffic Control & Educational Status Message */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
        {/* Status Message */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="shrink-0">
            {metrics.isHealthy ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : isErrorAlert ? (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <p className="text-xs font-mono text-slate-300 truncate">
            {metrics.statusMessage}
          </p>
        </div>

        {/* Traffic Pattern Selector */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 shrink-0">
          <span className="text-[11px] text-slate-400 px-2 font-mono">Load Pattern:</span>
          {(['constant', 'spike', 'retry-storm'] as const).map(pattern => (
            <button
              key={pattern}
              onClick={() => onPatternChange(pattern)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors capitalize ${
                trafficPattern === pattern
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {pattern.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
