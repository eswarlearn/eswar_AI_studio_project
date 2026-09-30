import React from 'react';
import { Level } from '../../types/game';
import { BookOpen, Target, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface LevelBriefingProps {
  level: Level;
  onDismiss: () => void;
}

export const LevelBriefing: React.FC<LevelBriefingProps> = ({ level, onDismiss }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
            <span>LEVEL {level.id}</span>
            <span className="text-slate-600">·</span>
            <span className="uppercase text-slate-400">{level.worldId}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{level.title}</h2>
          <p className="text-sm text-slate-400">{level.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400">Reward</span>
            <div className="text-sm font-bold font-mono text-amber-400">+{level.rewards.xp} XP</div>
          </div>
          <button
            onClick={onDismiss}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
          >
            <span>Enter Architecture Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: Scenario & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Concept Briefing */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Concept Briefing</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            {level.briefing.conceptIntro}
          </p>

          <div className="mt-1">
            <span className="text-xs font-semibold text-slate-400 block mb-1.5">Production Scenario</span>
            <p className="text-xs text-slate-400 leading-relaxed italic bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
              "{level.briefing.realWorldScenario}"
            </p>
          </div>
        </div>

        {/* Level Objectives & Win Conditions */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Mission Objectives</span>
          </div>

          <div className="space-y-2">
            {level.briefing.objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>

          {/* Deep dive tradeoffs */}
          {level.briefing.deepDive && (
            <div className="mt-1 p-3 bg-blue-950/20 border border-blue-900/40 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-blue-300 block">Engineering Tradeoff</span>
              <p className="text-slate-400 leading-relaxed">
                {level.briefing.deepDive.tradeoffs}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
