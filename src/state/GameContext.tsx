import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { PlayerProfile } from '../types/game';
import { INITIAL_PLAYER_PROFILE } from '../engine/scoring';
import { ACHIEVEMENTS_CATALOG } from '../data/achievements';
import { ApiError, bootstrap, createSession, login as apiLogin, register as apiRegister, logout as apiLogout, resetProgressRequest, submitIncident, submitLevel, unlockSkillRequest, type ActiveSession } from '../engine/api';
import confetti from 'canvas-confetti';

export type GameView = 'home' | 'worldmap' | 'level' | 'incident' | 'skilltree' | 'concepts' | 'achievements' | 'sandbox' | 'chaos-lab' | 'senior-architect';
interface ToastNotification { id: string; type: 'xp' | 'achievement' | 'level-up'; title: string; subtitle: string; }

export interface UserState {
  username: string | null;
  isGuest: boolean;
}

interface GameContextType {
  profile: PlayerProfile; activeView: GameView; activeLevelId: number; activeIncidentId: string | null;
  activeSession: ActiveSession | null; isLoading: boolean; apiError: string | null; toasts: ToastNotification[];
  currentUser: UserState;
  guestBypassed: boolean;
  continueAsGuest: () => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveView: (view: GameView) => void; startLevel: (levelId: number) => Promise<void>; resumeSession: () => void;
  completeLevel: (input: { levelId: number; nodes: import('../types/game').ArchitectureNode[]; trafficPattern: string; answers: Record<string, string> }) => Promise<{ stars: number; score: number }>;
  startIncident: (incidentId: string) => void;
  completeIncident: (incidentId: string, actionIds: string[], rootCauseId: string, elapsedSeconds: number) => Promise<void>;
  unlockSkill: (skillId: string) => Promise<boolean>; dismissToast: (id: string) => void; resetAllProgress: () => Promise<void>;
  clearApiError: () => void;
}
const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PlayerProfile>(INITIAL_PLAYER_PROFILE);
  const [currentUser, setCurrentUser] = useState<UserState>({ username: null, isGuest: true });
  const [guestBypassed, setGuestBypassed] = useState(false);
  const [activeView, setActiveView] = useState<GameView>('home');
  const [activeLevelId, setActiveLevelId] = useState(1);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    let alive = true;
    bootstrap().then(result => {
      if (!alive) return;
      setProfile(result.profile);
      setActiveSession(result.activeSession);
      setCurrentUser({ username: result.username, isGuest: !result.username });
      if (result.activeSession) setActiveLevelId(result.activeSession.levelId);
    }).catch(error => {
      if (alive) setApiError(error instanceof Error ? error.message : 'Could not load saved game progress.');
    }).finally(() => { if (alive) setIsLoading(false); });
    return () => { alive = false; };
  }, []);

  const addToast = (type: ToastNotification['type'], title: string, subtitle: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(previous => [...previous, { id, type, title, subtitle }]);
    setTimeout(() => setToasts(previous => previous.filter(toast => toast.id !== id)), 4500);
  };
  const dismissToast = (id: string) => setToasts(previous => previous.filter(toast => toast.id !== id));
  const fail = (error: unknown) => setApiError(error instanceof ApiError ? error.message : 'The server could not save this action. Please try again.');

  const startLevel = async (levelId: number) => {
    try {
      const session = await createSession(levelId);
      setActiveSession(session);
      setActiveLevelId(levelId);
      setActiveIncidentId(null);
      setActiveView('level');
      setApiError(null);
    } catch (error) { fail(error); }
  };
  const startIncident = (incidentId: string) => {
    setActiveIncidentId(incidentId);
    setActiveView('incident');
  };
  const resumeSession = () => {
    if (!activeSession) return;
    setActiveLevelId(activeSession.levelId);
    setActiveIncidentId(null);
    setActiveView('level');
  };

  const completeLevel = async (input: { levelId: number; nodes: import('../types/game').ArchitectureNode[]; trafficPattern: string; answers: Record<string, string> }) => {
    if (!activeSession) throw new Error('No active game session. Start this level again.');
    try {
      const result = await submitLevel(activeSession.id, input);
      const priorAchievements = profile.unlockedAchievementIds;
      setProfile(result.profile);
      const gainedXp = Math.max(0, result.profile.xp - profile.xp);
      addToast('xp', gainedXp ? '+' + gainedXp + ' XP Earned' : 'Best result updated', 'Level ' + input.levelId + ' completed with ' + result.result.stars + ' stars.');
      for (const id of result.profile.unlockedAchievementIds) {
        if (!priorAchievements.includes(id)) {
          const achievement = ACHIEVEMENTS_CATALOG.find(item => item.id === id);
          if (achievement) addToast('achievement', 'Achievement: ' + achievement.title, achievement.description);
        }
      }
      const oldLevel = profile.level;
      if (result.profile.level > oldLevel) addToast('level-up', 'Engineering Level Up', 'You reached Engineering Level ' + result.profile.level);
      setActiveSession(null);
      setApiError(null);
      try { confetti({ particleCount: 80, spread: 60, origin: { y: 0.65 } }); } catch { /* optional visual effect */ }
      return result.result;
    } catch (error) { fail(error); throw error; }
  };

  const completeIncident = async (incidentId: string, actionIds: string[], rootCauseId: string, elapsedSeconds: number) => {
    try {
      const result = await submitIncident(incidentId, actionIds, rootCauseId, elapsedSeconds);
      const gainedXp = Math.max(0, result.profile.xp - profile.xp);
      setProfile(result.profile);
      addToast('xp', gainedXp ? '+' + gainedXp + ' XP Incident Resolved' : 'Incident result updated', 'Production outage stabilized with ' + result.result.stars + ' stars.');
      setApiError(null);
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch { /* optional visual effect */ }
    } catch (error) { fail(error); throw error; }
  };

  const unlockSkill = async (skillId: string): Promise<boolean> => {
    try {
      const next = await unlockSkillRequest(skillId);
      setProfile(next);
      setApiError(null);
      addToast('level-up', 'Skill Mastered', 'Unlocked ' + skillId.replace('skill-', '').toUpperCase());
      return true;
    } catch (error) { fail(error); return false; }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await apiLogin(username, password);
      setProfile(result.profile);
      setActiveSession(result.activeSession);
      if (result.activeSession) setActiveLevelId(result.activeSession.levelId);
      setCurrentUser({ username: result.username, isGuest: false });
      setGuestBypassed(false);
      setApiError(null);
      addToast('level-up', 'Welcome back, ' + result.username + '!', 'Progress and completed levels restored from database.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await apiRegister(username, password);
      setProfile(result.profile);
      setCurrentUser({ username: result.username, isGuest: false });
      setGuestBypassed(false);
      setApiError(null);
      addToast('level-up', 'Account Created: ' + result.username, 'Your profile and future game progress are now saved in PostgreSQL.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      apiLogout();
      const result = await bootstrap();
      setProfile(result.profile);
      setActiveSession(result.activeSession);
      setCurrentUser({ username: result.username, isGuest: !result.username });
      setGuestBypassed(false);
      setActiveView('home');
      setApiError(null);
      addToast('level-up', 'Logged Out', 'Switched to guest session.');
    } catch (error) {
      fail(error);
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = () => {
    setGuestBypassed(true);
    addToast('xp', 'Guest Mode', 'Temporary play without account persistence.');
  };

  const resetAllProgress = async () => {
    try {
      const fresh = await resetProgressRequest();
      setProfile(fresh);
      setActiveSession(null);
      setActiveLevelId(1);
      setActiveView('home');
      setApiError(null);
    } catch (error) { fail(error); }
  };

  return <GameContext.Provider value={{
    profile, activeView, activeLevelId, activeIncidentId, activeSession, isLoading, apiError, toasts,
    currentUser, guestBypassed, continueAsGuest, login, register, logout,
    setActiveView, startLevel, resumeSession, completeLevel, startIncident, completeIncident, unlockSkill,
    dismissToast, resetAllProgress, clearApiError: () => setApiError(null)
  }}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
