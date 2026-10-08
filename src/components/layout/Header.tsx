import React, { useState } from 'react';
import { useGame, GameView } from '../../state/GameContext';
import { Terminal, Shield, Award, Map, Cpu, BookOpen, Flame, RotateCcw, Skull, Crown, User, LogIn, LogOut } from 'lucide-react';
import { calculateLevelFromXp } from '../../engine/scoring';
import { AuthModal } from '../auth/AuthModal';

export const Header: React.FC = () => {
  const { profile, activeView, setActiveView, resetAllProgress, currentUser, logout } = useGame();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const levelInfo = calculateLevelFromXp(profile.xp);

  const navLinks: { view: GameView; label: string; icon: React.ReactNode }[] = [
    { view: 'home', label: 'Dashboard', icon: <Terminal className="w-4 h-4 text-blue-400" /> },
    { view: 'worldmap', label: 'Campaign', icon: <Map className="w-4 h-4 text-cyan-400" /> },
    { view: 'chaos-lab', label: 'Chaos Lab', icon: <Skull className="w-4 h-4 text-orange-400" /> },
    { view: 'senior-architect', label: 'Architect Studio', icon: <Crown className="w-4 h-4 text-yellow-400" /> },
    { view: 'incident', label: 'On-Call SEV-1', icon: <Flame className="w-4 h-4 text-red-400" /> },
    { view: 'sandbox', label: 'Sandbox Lab', icon: <Cpu className="w-4 h-4 text-emerald-400" /> },
    { view: 'skilltree', label: 'Skill Tree', icon: <Shield className="w-4 h-4 text-indigo-400" /> },
    { view: 'concepts', label: 'Reference', icon: <BookOpen className="w-4 h-4 text-purple-400" /> },
    { view: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4 text-amber-400" /> }
  ];

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:border-blue-400 transition-colors shadow-sm">
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
              Backend Quest
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <span>DevOps & Architecture Simulator</span>
            </div>
          </div>
        </button>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-2">
        {navLinks.map(link => {
          const isActive = activeView === link.view;
          return (
            <button
              key={link.view}
              onClick={() => setActiveView(link.view)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1-2 primary actions (Profile Telemetry & Reset) */}
      <div className="flex items-center gap-3">
        {/* XP and Rank Tracker */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Rank:</span>
              <span className="font-bold text-blue-400 font-mono tracking-wide">{profile.rank}</span>
              <span className="text-slate-500 hidden sm:inline">·</span>
              <span className="text-slate-200 font-medium hidden sm:inline text-[11px]">{profile.rankTitle}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono tabular-nums">
              <span>{profile.xp.toLocaleString()} XP</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-500">Lv {levelInfo.level}</span>
            </div>
          </div>
        </div>

        {/* User Account / Cloud Sync status */}
        {currentUser.username && !currentUser.isGuest ? (
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <User className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="font-semibold text-white max-w-[110px] truncate" title={`Logged in as ${currentUser.username}`}>
                {currentUser.username}
              </span>
            </div>
            <button
              onClick={() => {
                if (window.confirm(`Log out of ${currentUser.username}?`)) {
                  void logout();
                }
              }}
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:border-blue-400 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
            title="Sign in or register to save progress permanently"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

        {/* Reset Profile confirmation button */}
        <button
          onClick={() => {
            if (window.confirm('Reset all campaign progression and start fresh?')) {
              resetAllProgress();
            }
          }}
          title="Reset Progress"
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  );
};
