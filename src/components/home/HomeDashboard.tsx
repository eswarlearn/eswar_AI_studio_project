import React from 'react';
import { useGame } from '../../state/GameContext';
import { WORLDS } from '../../data/worlds';
import { LEVELS } from '../../data/levels';
import { ACHIEVEMENTS_CATALOG } from '../../data/achievements';
import { calculateLevelFromXp, RANK_TIERS } from '../../engine/scoring';
import { 
  Play, Map, Flame, Cpu, Shield, Award, BookOpen, 
  CheckCircle2, ArrowRight, Activity, Terminal, Star, Sparkles, Skull, Crown 
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const { profile, setActiveView, startLevel, startIncident, activeSession, resumeSession } = useGame();
  const levelInfo = calculateLevelFromXp(profile.xp);

  // Find next uncompleted level
  const nextLevel = LEVELS.find(l => !profile.completedLevelIds.includes(l.id)) || LEVELS[0];

  // Current rank tier details
  const currentTier = RANK_TIERS.find(r => r.rank === profile.rank) || RANK_TIERS[0];
  const nextTierIndex = RANK_TIERS.findIndex(r => r.rank === profile.rank) + 1;
  const nextTier = nextTierIndex < RANK_TIERS.length ? RANK_TIERS[nextTierIndex] : null;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Hero Progression Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <Terminal className="w-4 h-4" />
              <span>BACKEND ENGINEERING CAREER PLATFORM</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Interactive Cloud Architecture</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Master System Design, Distributed Systems & Incident Response
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Design real microservice topologies, observe traffic simulations, balance latency and cost budgets, and take command of high-pressure on-call outages.
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                onClick={() => activeSession ? resumeSession() : void startLevel(nextLevel.id)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{activeSession ? 'Resume: Level ' + activeSession.levelId : 'Continue: Level ' + nextLevel.id + ' (' + nextLevel.title + ')'}</span>
              </button>

              <button
                onClick={() => setActiveView('worldmap')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              >
                <Map className="w-4 h-4 text-cyan-400" />
                <span>World Map</span>
              </button>

              <button
                onClick={() => setActiveView('chaos-lab')}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-950/40 hover:bg-orange-900/60 text-orange-200 text-xs font-medium rounded-lg border border-orange-900/60 transition-colors"
              >
                <Skull className="w-4 h-4 text-orange-400" />
                <span>Chaos Lab (Raids)</span>
              </button>

              <button
                onClick={() => setActiveView('senior-architect')}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 text-xs font-medium rounded-lg border border-indigo-900/60 transition-colors"
              >
                <Crown className="w-4 h-4 text-yellow-400" />
                <span>Architect Studio</span>
              </button>

              <button
                onClick={() => startIncident('inc-db-meltdown')}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-200 text-xs font-medium rounded-lg border border-red-900/60 transition-colors"
              >
                <Flame className="w-4 h-4 text-red-400" />
                <span>SEV-1 Outage</span>
              </button>
            </div>
          </div>

          {/* Player Engineering Rank Card */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-5 min-w-[260px] flex flex-col justify-between shadow-xl shrink-0">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Engineer Rating
                </span>
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded shadow-sm"
                  style={{
                    backgroundColor: `${currentTier.badgeColor}20`,
                    color: currentTier.badgeColor,
                    borderColor: `${currentTier.badgeColor}50`
                  }}
                >
                  RANK {profile.rank}
                </span>
              </div>

              <div className="text-lg font-bold text-white mb-0.5">{profile.rankTitle}</div>
              <div className="text-xs text-slate-400 font-mono">
                Level {levelInfo.level} · {profile.xp.toLocaleString()} XP
              </div>
            </div>

            {/* Rank Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1.5">
                <span>Progress to {nextTier ? nextTier.rank : 'MAX'}</span>
                <span>{nextTier ? `${profile.xp} / ${nextTier.minXp} XP` : 'Certified Master'}</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{
                    width: nextTier
                      ? `${Math.min(100, (profile.xp / nextTier.minXp) * 100)}%`
                      : '100%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Levels Mastered</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {profile.completedLevelIds.length}
            <span className="text-xs text-slate-500 font-normal ml-1">/ {LEVELS.length}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Outages Stabilized</span>
          </div>
          <div className="text-2xl font-bold font-mono text-orange-300 tabular-nums">
            {Object.keys(profile.incidentResolutions).length}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Skills Mastered</span>
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300 tabular-nums">
            {profile.unlockedSkillIds.length}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Badges Earned</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
            {profile.unlockedAchievementIds.length}
          </div>
        </div>
      </div>

      {/* World Progression Cards */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          World Progression Track
        </h2>
        <button
          onClick={() => setActiveView('worldmap')}
          className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
        >
          <span>View Full World Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {WORLDS.slice(0, 6).map(world => {
          const isUnlocked = profile.unlockedWorldIds.includes(world.id);
          const worldLevels = LEVELS.filter(l => world.levelIds.includes(l.id));
          const completedCount = worldLevels.filter(l => profile.completedLevelIds.includes(l.id)).length;

          return (
            <div
              key={world.id}
              onClick={() => isUnlocked && setActiveView('worldmap')}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'border-slate-800 bg-slate-900/90 hover:border-slate-700 cursor-pointer shadow-sm'
                  : 'border-slate-800/40 bg-slate-950/40 opacity-50 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-500">
                    World 0{world.order}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {completedCount} / {worldLevels.length}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{world.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {world.tagline}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-500">
                  {worldLevels.length} Challenge Levels
                </span>
                {isUnlocked ? (
                  <span className="text-blue-400 flex items-center gap-1 font-mono">
                    <span>Enter</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="text-slate-600 font-mono">Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
