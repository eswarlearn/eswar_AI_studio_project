import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlayerProfile, Achievement } from '../types/game';
import { loadSavedProfile, savePlayerProfile, resetGameProgress } from '../engine/persistence';
import { calculatePlayerRank, calculateLevelFromXp } from '../engine/scoring';
import { WORLDS } from '../data/worlds';
import { ACHIEVEMENTS_CATALOG } from '../data/achievements';
import confetti from 'canvas-confetti';

export type GameView = 
  | 'home'
  | 'worldmap'
  | 'level'
  | 'incident'
  | 'skilltree'
  | 'concepts'
  | 'achievements'
  | 'sandbox';

interface ToastNotification {
  id: string;
  type: 'xp' | 'achievement' | 'level-up';
  title: string;
  subtitle: string;
}

interface GameContextType {
  profile: PlayerProfile;
  activeView: GameView;
  activeLevelId: number;
  activeIncidentId: string | null;
  toasts: ToastNotification[];
  setActiveView: (view: GameView) => void;
  startLevel: (levelId: number) => void;
  completeLevel: (levelId: number, stars: number, score: number, xpGained: number, achievementId?: string) => void;
  startIncident: (incidentId: string) => void;
  completeIncident: (incidentId: string, stars: number, xpGained: number) => void;
  unlockSkill: (skillId: string, xpCost: number) => boolean;
  dismissToast: (id: string) => void;
  resetAllProgress: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadSavedProfile());
  const [activeView, setActiveView] = useState<GameView>('home');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Automatically sync to localStorage on change
  useEffect(() => {
    savePlayerProfile(profile);
  }, [profile]);

  const addToast = (type: 'xp' | 'achievement' | 'level-up', title: string, subtitle: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, subtitle }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const startLevel = (levelId: number) => {
    setActiveLevelId(levelId);
    setActiveIncidentId(null);
    setActiveView('level');
  };

  const startIncident = (incidentId: string) => {
    setActiveIncidentId(incidentId);
    setActiveView('incident');
  };

  const completeLevel = (levelId: number, stars: number, score: number, xpGained: number, achievementId?: string) => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 }
      });
    } catch {
      // Ignore if confetti is disabled
    }

    setProfile(prev => {
      const newXp = prev.xp + xpGained;
      const rankInfo = calculatePlayerRank(newXp);
      const levelInfo = calculateLevelFromXp(newXp);
      
      const isNewCompletion = !prev.completedLevelIds.includes(levelId);
      const newCompletedLevels = isNewCompletion
        ? [...prev.completedLevelIds, levelId]
        : prev.completedLevelIds;

      // Check world unlocks
      const newUnlockedWorlds = [...prev.unlockedWorldIds];
      WORLDS.forEach(world => {
        if (!newUnlockedWorlds.includes(world.id)) {
          // World unlocks if previous world has at least 1 completed level
          const prevWorldIndex = WORLDS.findIndex(w => w.id === world.id) - 1;
          if (prevWorldIndex >= 0) {
            const prevWorld = WORLDS[prevWorldIndex];
            const hasDonePrev = prevWorld.levelIds.some(id => newCompletedLevels.includes(id));
            if (hasDonePrev) {
              newUnlockedWorlds.push(world.id);
            }
          }
        }
      });

      // Check achievements
      const newUnlockedAchievements = [...prev.unlockedAchievementIds];
      if (achievementId && !newUnlockedAchievements.includes(achievementId)) {
        newUnlockedAchievements.push(achievementId);
        const ach = ACHIEVEMENTS_CATALOG.find(a => a.id === achievementId);
        if (ach) {
          addToast('achievement', `Achievement: ${ach.title}`, ach.description);
        }
      }

      addToast('xp', `+${xpGained} XP Earned`, `Level ${levelId} Completed with ${stars} Stars!`);

      if (levelInfo.level > prev.level) {
        addToast('level-up', `Rank Level Up!`, `You reached Engineering Level ${levelInfo.level}`);
      }

      return {
        ...prev,
        xp: newXp,
        level: levelInfo.level,
        rank: rankInfo.rank,
        rankTitle: rankInfo.title,
        completedLevelIds: newCompletedLevels,
        unlockedWorldIds: newUnlockedWorlds,
        unlockedAchievementIds: newUnlockedAchievements,
        levelScores: {
          ...prev.levelScores,
          [levelId]: {
            stars: Math.max(stars, prev.levelScores[levelId]?.stars || 0),
            bestCost: prev.levelScores[levelId]?.bestCost ? Math.min(prev.levelScores[levelId].bestCost, score) : score,
            bestLatency: 0
          }
        }
      };
    });
  };

  const completeIncident = (incidentId: string, stars: number, xpGained: number) => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore
    }

    setProfile(prev => {
      const newXp = prev.xp + xpGained;
      const rankInfo = calculatePlayerRank(newXp);
      const levelInfo = calculateLevelFromXp(newXp);
      const newAch = [...prev.unlockedAchievementIds];

      if (!newAch.includes('incident_commander')) {
        newAch.push('incident_commander');
      }

      addToast('xp', `+${xpGained} XP Incident Resolved`, `Production outage stabilized with ${stars} stars!`);

      return {
        ...prev,
        xp: newXp,
        level: levelInfo.level,
        rank: rankInfo.rank,
        rankTitle: rankInfo.title,
        unlockedAchievementIds: newAch,
        incidentResolutions: {
          ...prev.incidentResolutions,
          [incidentId]: {
            stars,
            timeSpentSeconds: 0
          }
        }
      };
    });
  };

  const unlockSkill = (skillId: string, xpCost: number): boolean => {
    if (profile.unlockedSkillIds.includes(skillId)) return false;
    if (profile.xp < xpCost) return false;

    setProfile(prev => ({
      ...prev,
      unlockedSkillIds: [...prev.unlockedSkillIds, skillId]
    }));
    addToast('level-up', 'Skill Mastered', `Unlocked ${skillId.replace('skill-', '').toUpperCase()}`);
    return true;
  };

  const resetAllProgress = () => {
    const fresh = resetGameProgress();
    setProfile(fresh);
    setActiveView('home');
    setActiveLevelId(1);
    setActiveIncidentId(null);
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        activeView,
        activeLevelId,
        activeIncidentId,
        toasts,
        setActiveView,
        startLevel,
        completeLevel,
        startIncident,
        completeIncident,
        unlockSkill,
        dismissToast,
        resetAllProgress
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
