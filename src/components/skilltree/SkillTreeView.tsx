import React from 'react';
import { useGame } from '../../state/GameContext';
import { SKILL_TREE_NODES } from '../../data/skillTree';
import { Shield, CheckCircle2, Lock, Zap, Award } from 'lucide-react';

export const SkillTreeView: React.FC = () => {
  const { profile, unlockSkill } = useGame();

  const categories = [
    'Foundations', 'Databases', 'Scaling', 'Containers', 
    'Messaging', 'Microservices', 'Observability', 'Security', 'Mastery'
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Skill Tree Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <span>ENGINEERING MASTERY</span>
            <span className="text-slate-600">·</span>
            <span>{profile.unlockedSkillIds.length} of {SKILL_TREE_NODES.length} Skills Mastered</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Backend Engineering Skill Tree</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Unlock competencies across the distributed systems stack as your XP grows.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400">Total Career XP:</span>
          <span className="text-sm font-bold font-mono text-amber-400 tabular-nums">
            {profile.xp.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-6">
        {categories.map(category => {
          const skillsInCategory = SKILL_TREE_NODES.filter(s => s.category === category);
          if (skillsInCategory.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {category}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {skillsInCategory.map(skill => {
                  const isUnlocked = profile.unlockedSkillIds.includes(skill.id);
                  const canUnlock = !isUnlocked && profile.xp >= skill.xpRequired;

                  return (
                    <div
                      key={skill.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isUnlocked
                          ? 'border-indigo-900/60 bg-indigo-950/15 text-slate-200 shadow-sm'
                          : canUnlock
                          ? 'border-blue-500/60 bg-slate-900 text-slate-300 hover:border-blue-400 ring-1 ring-blue-500/30'
                          : 'border-slate-800/60 bg-slate-950/50 text-slate-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-xs font-bold text-white tracking-tight">{skill.title}</h4>
                          {isUnlocked ? (
                            <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mastered</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                              <Lock className="w-3 h-3" />
                              <span>{skill.xpRequired} XP</span>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                          {skill.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">
                          {skill.category}
                        </span>

                        {!isUnlocked && (
                          <button
                            onClick={() => unlockSkill(skill.id, skill.xpRequired)}
                            disabled={!canUnlock}
                            className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                              canUnlock
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm active:scale-95'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {canUnlock ? 'Claim Skill' : 'XP Required'}
                          </button>
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
