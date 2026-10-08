import React, { useState, useEffect } from 'react';
import { useGame } from '../../state/GameContext';
import { INCIDENT_SCENARIOS } from '../../data/incidents';
import { IncidentAction, IncidentScenario } from '../../types/game';
import { 
  AlertTriangle, Clock, Activity, Terminal, ShieldAlert, 
  CheckCircle2, XCircle, ArrowRight, Play, RotateCcw, FileText, Check 
} from 'lucide-react';

export const IncidentCommander: React.FC = () => {
  const { activeIncidentId, completeIncident, setActiveView, apiError } = useGame();
  
  // Default to first scenario if none selected
  const scenario: IncidentScenario = 
    INCIDENT_SCENARIOS.find(s => s.id === activeIncidentId) || INCIDENT_SCENARIOS[0];

  const [timeLeft, setTimeLeft] = useState<number>(scenario.timeLimitSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [executedActionIds, setExecutedActionIds] = useState<string[]>([]);
  const [actionFeedbacks, setActionFeedbacks] = useState<{ id: string; text: string; isCorrect: boolean }[]>([]);
  const [activeTab, setActiveTab] = useState<'symptoms' | 'logs' | 'traces' | 'postmortem'>('symptoms');
  const [selectedRootCauseId, setSelectedRootCauseId] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<string>('ALL');

  // Countdown timer
  useEffect(() => {
    if (!isRunning || isResolved) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, isResolved]);

  // Execute remediation action
  const handleExecuteAction = (action: IncidentAction) => {
    if (executedActionIds.includes(action.id)) return;

    setExecutedActionIds(prev => [...prev, action.id]);
    setActionFeedbacks(prev => [
      { id: action.id, text: action.consequenceText, isCorrect: action.isCorrectIntervention },
      ...prev
    ]);

    // Check if player executed the necessary correct intervention
    const allCorrectActionIds = scenario.availableActions.filter(a => a.isCorrectIntervention).map(a => a.id);
    const updatedExecuted = [...executedActionIds, action.id];
    const hasExecutedRequired = allCorrectActionIds.some(id => updatedExecuted.includes(id));

    if (hasExecutedRequired) {
      setActiveTab('postmortem');
    }
  };

  // Submit Postmortem diagnosis
  const handleSubmitPostmortem = () => {
    if (!selectedRootCauseId) return;
    const selected = scenario.rootCauseOptions.find(o => o.id === selectedRootCauseId);
    if (selected?.isCorrect) {
      setIsRunning(false);
      const elapsedSeconds = scenario.timeLimitSeconds - timeLeft;
      void completeIncident(scenario.id, executedActionIds, selectedRootCauseId, elapsedSeconds).then(() => setIsResolved(true)).catch(() => undefined);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const filteredLogs = scenario.logs.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.level === logFilter;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {apiError && <div role="alert" className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-xs text-red-200">{apiError}</div>}
      {/* Top Incident Banner */}
      <div className="bg-red-950/40 border border-red-900/80 rounded-xl p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="bg-red-900/60 text-red-200 font-bold px-2 py-0.5 rounded">
                {scenario.severity}
              </span>
              <span className="text-red-400">INCIDENT RESPONSE ROOM</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">{scenario.title}</h1>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">{scenario.description}</p>
          </div>
        </div>

        {/* Time Remaining Clock */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 bg-slate-950/80 rounded-lg border border-red-900/40 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>Time to SLO Breach</span>
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-slate-100'}`}>
            {timeFormatted}
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tabs (Symptoms, Logs, Traces, Postmortem) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'symptoms'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Live Symptoms
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Structured Logs ({scenario.logs.length})
            </button>
            <button
              onClick={() => setActiveTab('traces')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'traces'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Distributed Traces
            </button>
            <button
              onClick={() => setActiveTab('postmortem')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'postmortem'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Root Cause Diagnosis</span>
            </button>
          </div>

          {/* Tab 1: Symptoms */}
          {activeTab === 'symptoms' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scenario.initialSymptoms.map((sym, i) => (
                  <div key={i} className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{sym.label}</span>
                    <span className={`text-sm font-bold font-mono tabular-nums ${
                      sym.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {sym.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feed of Action Feedback */}
              <div className="mt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Intervention Event Stream
                </span>
                {actionFeedbacks.length === 0 ? (
                  <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs text-slate-500 text-center">
                    No remediation interventions triggered yet. Review logs and traces, then apply an action from the right panel.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {actionFeedbacks.map((fb, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs leading-relaxed ${
                          fb.isCorrect
                            ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                            : 'bg-red-950/30 border-red-800/60 text-red-200'
                        }`}
                      >
                        <div className="font-semibold mb-0.5">
                          {fb.isCorrect ? '✅ Effective Intervention' : '❌ Counter-Productive Action'}
                        </div>
                        {fb.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Structured Logs */}
          {activeTab === 'logs' && (
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 pb-2">
                <span className="text-slate-500">Filter Level:</span>
                {(['ALL', 'ERROR', 'WARN', 'INFO'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      logFilter === lvl ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-2 max-h-72 overflow-y-auto">
                {filteredLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-slate-500 tabular-nums shrink-0">{log.timestamp}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                      log.level === 'ERROR' ? 'bg-red-950 text-red-400 border border-red-800' :
                      log.level === 'WARN' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-cyan-400 shrink-0">[{log.service}]</span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Distributed Traces */}
          {activeTab === 'traces' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400">
                Request trace waterfall captured by OpenTelemetry. Notice where milliseconds turn into seconds:
              </p>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2.5">
                {scenario.traces.map((trace, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{trace.service}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{trace.operation}</span>
                      </div>
                      <span className="font-mono text-red-400 font-bold tabular-nums">{trace.durationMs}ms</span>
                    </div>

                    {trace.children?.map((child, ci) => (
                      <div key={ci} className="pl-4 border-l-2 border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-300">{child.service}</span>
                            <span className="text-slate-400 font-mono text-[11px]">{child.operation}</span>
                          </div>
                          <span className="font-mono text-red-400 font-bold tabular-nums">{child.durationMs}ms</span>
                        </div>

                        {child.children?.map((leaf, li) => (
                          <div key={li} className="pl-4 border-l-2 border-red-500/60">
                            <div className="flex items-center justify-between text-xs p-2 bg-red-950/20 border border-red-900/50 rounded">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                <span className="font-bold text-red-300">{leaf.service}</span>
                                <span className="text-slate-400 font-mono text-[11px]">{leaf.operation}</span>
                              </div>
                              <span className="font-mono text-red-400 font-bold tabular-nums">{leaf.durationMs}ms (BOTTLENECK)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Postmortem Diagnosis */}
          {activeTab === 'postmortem' && (
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-amber-950/20 border border-amber-800/60 rounded-lg text-xs text-amber-200">
                Remediation applied! Now conduct the postmortem: select the verified root cause to complete the incident.
              </div>

              <div className="space-y-2">
                {scenario.rootCauseOptions.map(opt => {
                  const isSelected = selectedRootCauseId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedRootCauseId(opt.id)}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs leading-relaxed transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-950/30 text-white ring-1 ring-blue-500'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                        isSelected ? 'border-blue-400 bg-blue-600' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {selectedRootCauseId && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSubmitPostmortem}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
                  >
                    <span>Finalize Incident Postmortem</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Available Remediation Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Intervention Deck
            </span>
            <span className="text-xs text-slate-500 font-mono">Action Cost</span>
          </div>

          <p className="text-xs text-slate-400">
            Choose carefully: improper interventions will exacerbate database and compute bottlenecks.
          </p>

          <div className="space-y-3">
            {scenario.availableActions.map(action => {
              const isExecuted = executedActionIds.includes(action.id);
              return (
                <button
                  key={action.id}
                  onClick={() => handleExecuteAction(action)}
                  disabled={isExecuted || isResolved}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex flex-col gap-1.5 ${
                    isExecuted
                      ? 'border-slate-800 bg-slate-950/40 opacity-50 cursor-not-allowed text-slate-500'
                      : 'border-slate-800 hover:border-blue-500/80 bg-slate-950/80 hover:bg-slate-900 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{action.label}</span>
                    <span className="text-[11px] font-mono text-amber-400 tabular-nums">${action.cost}/hr</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {action.description}
                  </p>
                  {isExecuted && (
                    <span className="text-[10px] text-blue-400 font-mono mt-1">
                      ✓ Intervention Deployed
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Complete View Navigation */}
          {isResolved && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800 rounded-lg text-center space-y-2 mt-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">Incident Mitigated!</div>
              <p className="text-xs text-slate-300">
                Target SLO protected. Incident Commander badge awarded.
              </p>
              <button
                onClick={() => setActiveView('worldmap')}
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Return to World Map
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
