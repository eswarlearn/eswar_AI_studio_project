import { PlayerProfile } from '../types/game';
import { INITIAL_PLAYER_PROFILE } from './scoring';

const SAVE_STORAGE_KEY = 'backend_quest_save_v1';

export interface SaveGamePayload {
  version: number;
  updatedAt: string;
  profile: PlayerProfile;
}

export function loadSavedProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) {
      return { ...INITIAL_PLAYER_PROFILE };
    }
    const parsed: SaveGamePayload = JSON.parse(raw);
    if (!parsed || !parsed.profile) {
      return { ...INITIAL_PLAYER_PROFILE };
    }
    return {
      ...INITIAL_PLAYER_PROFILE,
      ...parsed.profile
    };
  } catch (err) {
    console.warn('Failed to parse saved game profile, resetting to defaults:', err);
    return { ...INITIAL_PLAYER_PROFILE };
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    const payload: SaveGamePayload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      profile
    };
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save game state to localStorage:', err);
  }
}

export function resetGameProgress(): PlayerProfile {
  try {
    localStorage.removeItem(SAVE_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
  }
  return { ...INITIAL_PLAYER_PROFILE };
}
