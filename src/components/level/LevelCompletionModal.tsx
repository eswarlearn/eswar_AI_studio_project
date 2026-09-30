import React from 'react';
import { Level } from '../../types/game';
import { Star, Trophy, ArrowRight, RotateCcw, CheckCircle2, Award } from 'lucide-react';

interface LevelCompletionModalProps {
  level: Level;
  stars: number;
  score: number;
  onNextLevel: () => void;
  onRetry: () => void;
  onReturnToMap: () => void;
}

export const LevelCompletionModal: React.FC<LevelCompletionModalProps> = ({
  level,
  stars,
  score,
  onNextLevel,
  onRetry,
  onReturnToMap
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Victory Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <Trophy className="w-7 h-7" />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold mb-1">
            Challenge Accomplished
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {level.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Architecture verified against production constraints
          </p>

          {/* Star Rating */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <Star
                key={s}
                className={`w-7 h-7 transition-all ${
                  s <= stars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Score and Reward Bar */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">Architecture Score</span>
            <div className="text-lg font-bold font-mono text-slate-100 tabular-nums">
              {score} pts
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium">XP Reward</span>
            <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
              +{level.rewards.xp} XP
            </div>
          </div>
        </div>

        {/* Reflection & Key Takeaway */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Key Takeaway</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {level.reflection.takeaway}
          </p>
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Mental Model</span>
            <p className="text-xs text-slate-400 italic">
              {level.reflection.realWorldAnalogy}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onReturnToMap}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            World Map
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={onNextLevel}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
            >
              <span>Next Level</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
