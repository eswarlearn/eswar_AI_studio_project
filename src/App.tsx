import React from 'react';
import { GameProvider, useGame } from './state/GameContext';
import { Header } from './components/layout/Header';
import { HomeDashboard } from './components/home/HomeDashboard';
import { WorldMap } from './components/worldmap/WorldMap';
import { LevelView } from './components/level/LevelView';
import { IncidentCommander } from './components/incident/IncidentCommander';
import { ArchitectureSandbox } from './components/sandbox/ArchitectureSandbox';
import { ChaosLab } from './components/chaos/ChaosLab';
import { SeniorArchitectStudio } from './components/architect/SeniorArchitectStudio';
import { SkillTreeView } from './components/skilltree/SkillTreeView';
import { ConceptDirectory } from './components/concepts/ConceptDirectory';
import { AchievementList } from './components/achievements/AchievementList';
import { AuthPage } from './components/auth/AuthPage';
import { Zap, Award, Sparkles, X, Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, toasts, dismissToast, isLoading, apiError, clearApiError, currentUser, guestBypassed } = useGame();

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeDashboard />;
      case 'worldmap':
        return <WorldMap />;
      case 'level':
        return <LevelView />;
      case 'incident':
        return <IncidentCommander />;
      case 'sandbox':
        return <ArchitectureSandbox />;
      case 'chaos-lab':
        return <ChaosLab />;
      case 'senior-architect':
        return <SeniorArchitectStudio />;
      case 'skilltree':
        return <SkillTreeView />;
      case 'concepts':
        return <ConceptDirectory />;
      case 'achievements':
        return <AchievementList />;
      default:
        return <HomeDashboard />;
    }
  };

  // Loading state while checking database token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <h2 className="text-base font-bold text-white tracking-tight">Connecting to Backend Quest</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to PostgreSQL and loading your saved progress...</p>
      </div>
    );
  }

  // Auth Gate: Require login or account registration before opening the game UI
  if (!currentUser.username && !guestBypassed) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30">
      {/* 3-Zone Clean Header */}
      <Header />

      {/* Main Game Surface */}
      {apiError && <div role="alert" className="mx-auto mt-3 w-[min(96%,72rem)] rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-xs text-red-200 flex justify-between gap-4"><span>{apiError}</span><button onClick={clearApiError} className="text-red-300 hover:text-white">Dismiss</button></div>}
      <main className="flex-1 pb-16 pt-4">
        {renderActiveView()}
      </main>

      {/* Floating Notification Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-200"
          >
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
              {toast.type === 'achievement' ? (
                <Award className="w-4 h-4 text-amber-400" />
              ) : toast.type === 'level-up' ? (
                <Sparkles className="w-4 h-4 text-indigo-400" />
              ) : (
                <Zap className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{toast.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{toast.subtitle}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainContent />
    </GameProvider>
  );
}
