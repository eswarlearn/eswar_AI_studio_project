import React from 'react';
import { useGame } from '../../state/GameContext';
import { ACHIEVEMENTS_CATALOG } from '../../data/achievements';
import { Award, CheckCircle2, Lock, Sparkles, Trophy, Zap, Globe, Database, Radio, Layers, ShieldCheck, Activity } from 'lucide-react';

export const AchievementList: React.FC = () => {
  const { profile } = useGame();

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Radio': return <Radio className="w-5 h-5 text-blue-400" />;
      case 'Globe': return <Globe className="w-5 h-5 text-cyan-400" />;
      case 'Database': return <Database className="w-5 h-5 text-emerald-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Layers': return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-red-400" />;
      case 'Activity': return <Activity className="w-5 h-5 text-pink-400" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-yellow-400" />;
      default: return <Award className="w-5 h-5 text-blue-400" />;
    }
  };

  const unlockedCount = profile.unlockedAchievementIds.length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <span>ENGINEERING RECOGNITION</span>
            <span className="text-slate-600">·</span>
            <span>{unlockedCount} of {ACHIEVEMENTS_CATALOG.length} Badges Unlocked</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Achievements & Distinctions</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Recognizing breakthroughs in system design, fault tolerance, and production firefighting.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-slate-300">
            {Math.round((unlockedCount / ACHIEVEMENTS_CATALOG.length) * 100)}% Complete
          </span>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {ACHIEVEMENTS_CATALOG.map(ach => {
          const isUnlocked = profile.unlockedAchievementIds.includes(ach.id);

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                isUnlocked
                  ? 'border-amber-500/40 bg-gradient-to-br from-slate-900 to-amber-950/20 text-slate-100 shadow-sm'
                  : 'border-slate-800/60 bg-slate-950/50 text-slate-500'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isUnlocked ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}>
                {isUnlocked ? getAchievementIcon(ach.icon) : <Lock className="w-4 h-4 text-slate-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-xs font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                    {ach.title}
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400 tabular-nums shrink-0">
                    +{ach.xpReward} XP
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                  {ach.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="uppercase text-slate-500">{ach.category}</span>
                  {isUnlocked && (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
