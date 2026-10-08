import React, { useState, useEffect } from 'react';
import { useGame } from '../../state/GameContext';
import { saveSession } from '../../engine/api';
import { LEVELS } from '../../data/levels';
import { INFRASTRUCTURE_COMPONENTS } from '../../data/components';
import { calculateSimulationMetrics } from '../../engine/simulator';
import { validateLevelArchitecture } from '../../engine/validation';
import { ArchitectureNode, Level } from '../../types/game';
import { ArchitectureCanvas } from '../canvas/ArchitectureCanvas';
import { MetricsDashboard } from '../simulation/MetricsDashboard';
import { LevelBriefing } from './LevelBriefing';
import { KnowledgeQuiz } from './KnowledgeQuiz';
import { LevelCompletionModal } from './LevelCompletionModal';
import { 
  CheckCircle2, XCircle, AlertCircle, HelpCircle, 
  ArrowRight, RotateCcw, BookOpen, Check, Play 
} from 'lucide-react';

export const LevelView: React.FC = () => {
  const { activeLevelId, activeSession, startLevel, completeLevel, setActiveView, apiError } = useGame();
  
  const level: Level = LEVELS.find(l => l.id === activeLevelId) || LEVELS[0];

  const [nodes, setNodes] = useState<ArchitectureNode[]>(() => {
    return activeSession?.levelId === level.id && activeSession.state?.nodes ? activeSession.state.nodes : (level.starterNodes ? JSON.parse(JSON.stringify(level.starterNodes)) : []);
  });
  const [trafficPattern, setTrafficPattern] = useState<'constant' | 'spike' | 'retry-storm'>('constant');
  const [showBriefing, setShowBriefing] = useState<boolean>(true);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [completionStats, setCompletionStats] = useState<{ stars: number; score: number }>({ stars: 0, score: 0 });

  // Restore saved session state after a refresh, or initialize a new attempt.
  useEffect(() => {
    setNodes(activeSession?.levelId === level.id && activeSession.state?.nodes ? activeSession.state.nodes : (level.starterNodes ? JSON.parse(JSON.stringify(level.starterNodes)) : []));
    setTrafficPattern(activeSession?.levelId === level.id && activeSession.state?.trafficPattern ? activeSession.state.trafficPattern : 'constant');
    setShowBriefing(true);
    setShowQuiz(false);
    setShowCompletionModal(false);
  }, [level.id, activeSession?.id]);

  useEffect(() => {
    if (!activeSession || activeSession.levelId !== level.id) return;
    const timer = window.setTimeout(() => {
      void saveSession(activeSession.id, { nodes, trafficPattern }).catch(() => undefined);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [activeSession?.id, level.id, nodes, trafficPattern]);

  // Compute live metrics
  const metrics = calculateSimulationMetrics(
    nodes,
    INFRASTRUCTURE_COMPONENTS,
    level.targetRps,
    trafficPattern
  );

  // Compute live validation against level win conditions
  const validation = validateLevelArchitecture(nodes, metrics, level.winConditions);

  const handleValidateAndSubmit = () => {
    if (validation.isComplete) {
      if (level.quiz && level.quiz.length > 0 && !showQuiz) {
        setShowQuiz(true);
      } else {
        void triggerVictory(validation.stars, validation.score, {});
      }
    }
  };

  const handleQuizComplete = (answers: Record<string, string>) => {
    setShowQuiz(false);
    void triggerVictory(validation.stars, validation.score, answers);
  };

  const triggerVictory = async (stars: number, score: number, answers: Record<string, string>) => {
    try {
      const result = await completeLevel({ levelId: level.id, nodes, trafficPattern, answers });
      setCompletionStats({ stars: result.stars, score: result.score });
      setShowCompletionModal(true);
    } catch { /* API error is shown by the game shell */ }
  };

  const handleResetLevel = () => {
    setNodes(level.starterNodes ? JSON.parse(JSON.stringify(level.starterNodes)) : []);
  };

  const handleNextLevel = () => {
    setShowCompletionModal(false);
    const nextLvl = LEVELS.find(l => l.id === level.id + 1);
    if (nextLvl) {
      startLevel(nextLvl.id);
    } else {
      setActiveView('worldmap');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {apiError && <div role="alert" className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-xs text-red-200">{apiError}</div>}
      {/* Level Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
            <span>LEVEL {level.id.toString().padStart(2, '0')}</span>
            <span className="text-slate-600">·</span>
            <span className="uppercase text-slate-400">{level.worldId}</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-semibold">+{level.rewards.xp} XP</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">{level.title}</h1>
          <p className="text-xs text-slate-400">{level.subtitle}</p>
        </div>

        {/* Level Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowBriefing(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showBriefing ? 'Hide Briefing' : 'Show Briefing'}</span>
          </button>
          <button
            onClick={handleResetLevel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            title="Reset starter architecture"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleValidateAndSubmit}
            disabled={!validation.isComplete}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95 ${
              validation.isComplete
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer ring-2 ring-emerald-500/50 animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{validation.isComplete ? 'Verify & Pass Level' : 'Conditions Unmet'}</span>
          </button>
        </div>
      </div>

      {/* Briefing Panel (toggleable) */}
      {showBriefing && (
        <LevelBriefing level={level} onDismiss={() => setShowBriefing(false)} />
      )}

      {/* Quiz Modal (if active) */}
      {showQuiz && level.quiz && (
        <KnowledgeQuiz questions={level.quiz} onComplete={handleQuizComplete} />
      )}

      {/* Telemetry Dashboard */}
      <MetricsDashboard
        metrics={metrics}
        targetRps={level.targetRps}
        trafficPattern={trafficPattern}
        onPatternChange={setTrafficPattern}
      />

      {/* Architecture Canvas */}
      <ArchitectureCanvas
        nodes={nodes}
        metrics={metrics}
        allowedComponents={level.allowedComponents}
        onNodesChange={setNodes}
      />

      {/* Real-time Validation Checklist & Guidance */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Production Readiness Checklist
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {validation.missingRequirements.length === 0 ? 'All 4 Conditions Met' : `${validation.missingRequirements.length} Criteria Remaining`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Target Throughput */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            {metrics.requestsPerSecond >= level.winConditions.minRps ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <div>
              <span className="text-slate-400 block text-[10px]">Min Throughput</span>
              <span className="font-mono text-slate-200">
                {metrics.requestsPerSecond} / {level.winConditions.minRps} req/s
              </span>
            </div>
          </div>

          {/* Max Latency */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            {metrics.latencyMs <= level.winConditions.maxLatencyMs ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <div>
              <span className="text-slate-400 block text-[10px]">Max Latency</span>
              <span className="font-mono text-slate-200">
                {metrics.latencyMs}ms &le; {level.winConditions.maxLatencyMs}ms
              </span>
            </div>
          </div>

          {/* Max Error Rate */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            {metrics.errorRate <= level.winConditions.maxErrorRate ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <div>
              <span className="text-slate-400 block text-[10px]">Error Rate</span>
              <span className="font-mono text-slate-200">
                {(metrics.errorRate * 100).toFixed(1)}% &le; {(level.winConditions.maxErrorRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Budget Limit (if applicable) */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            {(!level.winConditions.maxHourlyCost || metrics.hourlyCost <= level.winConditions.maxHourlyCost) ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <div>
              <span className="text-slate-400 block text-[10px]">Hourly Budget</span>
              <span className="font-mono text-slate-200">
                ${metrics.hourlyCost}/hr {level.winConditions.maxHourlyCost ? `&le; $${level.winConditions.maxHourlyCost}` : '(No limit)'}
              </span>
            </div>
          </div>
        </div>

        {/* Guidance / Missing feedback */}
        {validation.missingRequirements.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-amber-950/20 border border-amber-900/50 text-xs text-amber-200 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Next Architectural Steps:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              {validation.missingRequirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Level Completion Modal */}
      {showCompletionModal && (
        <LevelCompletionModal
          level={level}
          stars={completionStats.stars}
          score={completionStats.score}
          onNextLevel={handleNextLevel}
          onRetry={() => setShowCompletionModal(false)}
          onReturnToMap={() => {
            setShowCompletionModal(false);
            setActiveView('worldmap');
          }}
        />
      )}
    </div>
  );
};
