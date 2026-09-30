import React from 'react';
import { useGame } from '../../state/GameContext';
import { WORLDS } from '../../data/worlds';
import { LEVELS } from '../../data/levels';
import { 
  Globe, Database, TrendingUp, Box, Layers, Radio, Network, 
  Activity, Shield, Flame, Lock, CheckCircle2, Star, ArrowRight, Play 
} from 'lucide-react';

export const WorldMap: React.FC = () => {
  const { profile, startLevel, startIncident } = useGame();

  const getWorldIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Globe': return <Globe className={className} />;
      case 'Database': return <Database className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Box': return <Box className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Radio': return <Radio className={className} />;
      case 'Network': return <Network className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Flame': return <Flame className={className} />;
      default: return <Globe className={className} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Campaign Progression Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
            <span>ENGINEERING CAMPAIGN</span>
            <span className="text-slate-600">·</span>
            <span>{profile.completedLevelIds.length} of {LEVELS.length} Levels Conquered</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Backend Architecture World Map</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Progress through fundamentals to distributed systems, cloud scaling, and production incidents.
          </p>
        </div>

        {/* Quick Launch Next Available Level */}
        <div>
          {(() => {
            const nextLevel = LEVELS.find(lvl => !profile.completedLevelIds.includes(lvl.id));
            if (nextLevel) {
              return (
                <button
                  onClick={() => startLevel(nextLevel.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95 whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Continue: Level {nextLevel.id} ({nextLevel.title})</span>
                </button>
              );
            }
            return (
              <span className="text-xs font-mono text-emerald-400 font-bold">
                ✓ ALL LEVELS CONQUERED!
              </span>
            );
          })()}
        </div>
      </div>

      {/* World Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WORLDS.map((world, index) => {
          const isUnlocked = profile.unlockedWorldIds.includes(world.id);
          const worldLevels = LEVELS.filter(l => world.levelIds.includes(l.id));
          const completedCount = worldLevels.filter(l => profile.completedLevelIds.includes(l.id)).length;
          const isFinished = worldLevels.length > 0 && completedCount === worldLevels.length;

          return (
            <div
              key={world.id}
              className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                !isUnlocked
                  ? 'border-slate-800/50 bg-slate-950/40 opacity-55'
                  : world.isFusion
                  ? 'border-orange-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/20 shadow-lg'
                  : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 shadow-md'
              }`}
            >
              {/* World Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm"
                      style={{
                        backgroundColor: `${world.color}15`,
                        borderColor: `${world.color}40`,
                        color: world.color
                      }}
                    >
                      {getWorldIcon(world.iconName)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        World 0{world.order} {world.isFusion ? '· Fusion Challenge' : ''}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight">{world.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isUnlocked ? (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    ) : isFinished ? (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mastered</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {completedCount} / {worldLevels.length} Complete
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {world.tagline}
                </p>
              </div>

              {/* Levels in this World */}
              <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                {worldLevels.map(lvl => {
                  const isLevelDone = profile.completedLevelIds.includes(lvl.id);
                  const isCurrent = !isLevelDone && isUnlocked;
                  const levelScore = profile.levelScores[lvl.id];

                  return (
                    <div
                      key={lvl.id}
                      onClick={() => {
                        if (isUnlocked) {
                          if (lvl.id === 24) {
                            startIncident('inc-db-meltdown');
                          } else {
                            startLevel(lvl.id);
                          }
                        }
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                        !isUnlocked
                          ? 'border-transparent text-slate-600 cursor-not-allowed'
                          : isLevelDone
                          ? 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 cursor-pointer'
                          : 'border-blue-900/60 bg-blue-950/20 text-white hover:border-blue-500 cursor-pointer ring-1 ring-blue-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-slate-500 text-[11px] shrink-0">
                          {lvl.id.toString().padStart(2, '0')}.
                        </span>
                        <span className="font-medium truncate">{lvl.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isLevelDone ? (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map(s => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= (levelScore?.stars || 1) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        ) : isUnlocked ? (
                          <span className="text-[10px] font-mono text-blue-400 flex items-center gap-1">
                            <span>Play</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        ) : (
                          <Lock className="w-3 h-3 text-slate-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
