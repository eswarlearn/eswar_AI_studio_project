import { PlayerProfile, PlayerRank } from '../types/game';

export interface RankInfo {
  rank: PlayerRank;
  title: string;
  minXp: number;
  nextRankXp: number;
  badgeColor: string;
}

export const RANK_TIERS: RankInfo[] = [
  { rank: 'C', title: 'Backend Beginner', minXp: 0, nextRankXp: 500, badgeColor: '#94A3B8' },
  { rank: 'B', title: 'Backend Builder', minXp: 500, nextRankXp: 1200, badgeColor: '#38BDF8' },
  { rank: 'A', title: 'Backend Engineer', minXp: 1200, nextRankXp: 2200, badgeColor: '#34D399' },
  { rank: 'S', title: 'Senior Backend Engineer', minXp: 2200, nextRankXp: 3500, badgeColor: '#818CF8' },
  { rank: 'S+', title: 'Distributed Systems Engineer', minXp: 3500, nextRankXp: 5000, badgeColor: '#C084FC' },
  { rank: 'SS', title: 'Production Architect', minXp: 5000, nextRankXp: 7000, badgeColor: '#FB923C' },
  { rank: 'SSS', title: 'Backend Master', minXp: 7000, nextRankXp: 10000, badgeColor: '#F43F5E' }
];

export function calculatePlayerRank(xp: number): RankInfo {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (xp >= RANK_TIERS[i].minXp) {
      return RANK_TIERS[i];
    }
  }
  return RANK_TIERS[0];
}

export function calculateLevelFromXp(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number } {
  // Each player level requires 250 XP
  const xpPerLevel = 250;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const currentLevelXp = xp % xpPerLevel;
  return {
    level,
    currentLevelXp,
    nextLevelXp: xpPerLevel
  };
}

export const INITIAL_PLAYER_PROFILE: PlayerProfile = {
  level: 1,
  xp: 0,
  rank: 'C',
  rankTitle: 'Backend Beginner',
  completedLevelIds: [],
  unlockedWorldIds: ['foundations'],
  unlockedSkillIds: ['skill-http'],
  unlockedAchievementIds: [],
  incidentResolutions: {},
  levelScores: {}
};
