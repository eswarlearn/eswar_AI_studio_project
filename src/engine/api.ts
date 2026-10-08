import type { PlayerProfile, ArchitectureNode } from '../types/game';
import { readLegacySavedProfile, removeLegacySavedProfile } from './persistence';

const TOKEN_KEY = 'backend_quest_guest_token_v1';
const USERNAME_KEY = 'backend_quest_username_v1';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '');

type ApiEnvelope<T> = { success: boolean; data: T; error: null | { code: string; message: string }; requestId?: string };

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code: string) { super(message); }
}

export interface UserAccount {
  playerId: string;
  username: string | null;
  isGuest: boolean;
  profile: PlayerProfile;
}

function token(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function storeToken(value: string): void {
  try { localStorage.setItem(TOKEN_KEY, value); } catch { /* storage may be disabled */ }
}
export function getStoredUsername(): string | null {
  try { return localStorage.getItem(USERNAME_KEY); } catch { return null; }
}

async function request<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  const accessToken = token();
  if (auth && accessToken) headers.set('Authorization', 'Bearer ' + accessToken);
  let response: Response;
  try { response = await fetch(API_BASE_URL + path, { ...options, headers }); }
  catch { throw new ApiError('Cannot reach the game API. Check that the backend is running.', 0, 'API_UNAVAILABLE'); }
  const body = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || !body?.success) {
    throw new ApiError(body?.error?.message ?? 'The API request failed.', response.status, body?.error?.code ?? 'REQUEST_FAILED');
  }
  return body.data;
}

export async function login(username: string, password: string): Promise<{ profile: PlayerProfile; username: string; activeSession: ActiveSession | null }> {
  const result = await request<{ token: string; playerId: string; username: string; profile: PlayerProfile; activeSession: ActiveSession | null }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
    false
  );
  storeToken(result.token);
  try { localStorage.setItem(USERNAME_KEY, result.username); } catch {}
  return { profile: result.profile, username: result.username, activeSession: result.activeSession };
}

export async function register(username: string, password: string): Promise<{ profile: PlayerProfile; username: string }> {
  const legacyProfile = readLegacySavedProfile();
  const result = await request<{ token: string; playerId: string; username: string; profile: PlayerProfile }>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify({ username, password, legacyProfile: legacyProfile ?? undefined }) },
    false
  );
  storeToken(result.token);
  try { localStorage.setItem(USERNAME_KEY, result.username); } catch {}
  if (legacyProfile) removeLegacySavedProfile();
  return { profile: result.profile, username: result.username };
}

export function logout(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  } catch {}
}

export async function bootstrap(): Promise<{ profile: PlayerProfile; username: string | null; activeSession: ActiveSession | null }> {
  if (!token()) {
    const legacyProfile = readLegacySavedProfile();
    const created = await request<{ token: string; profile: PlayerProfile }>('/guest', { method: 'POST', body: JSON.stringify(legacyProfile ? { legacyProfile } : {}) }, false);
    storeToken(created.token);
    if (legacyProfile) removeLegacySavedProfile();
    return { profile: created.profile, username: null, activeSession: null };
  }
  try {
    const account = await request<UserAccount>('/auth/me');
    const activeSession = await request<ActiveSession | null>('/game/sessions/active');
    if (account.username) {
      try { localStorage.setItem(USERNAME_KEY, account.username); } catch {}
    }
    return { profile: account.profile, username: account.username, activeSession };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      logout();
      return bootstrap();
    }
    throw error;
  }
}

export interface ActiveSession {
  id: string;
  levelId: number;
  state: { nodes?: ArchitectureNode[]; trafficPattern?: 'constant' | 'spike' | 'retry-storm' } | null;
  updatedAt?: string;
}

export const createSession = (levelId: number) =>
  request<ActiveSession>('/game/sessions', { method: 'POST', body: JSON.stringify({ levelId }) });

export const saveSession = (sessionId: string, state: ActiveSession['state']) =>
  request<{ saved: boolean }>('/game/sessions/' + encodeURIComponent(sessionId), { method: 'PATCH', body: JSON.stringify({ state }) });

export const submitLevel = (sessionId: string, input: {
  levelId: number;
  nodes: ArchitectureNode[];
  trafficPattern: string;
  answers: Record<string, string>;
}) => request<{ profile: PlayerProfile; result: { stars: number; score: number; cost: number; latency: number } }>(
  '/game/sessions/' + encodeURIComponent(sessionId) + '/complete', { method: 'POST', body: JSON.stringify(input) }
);

export const submitIncident = (incidentId: string, actionIds: string[], rootCauseId: string, elapsedSeconds: number) =>
  request<{ profile: PlayerProfile; result: { stars: number; elapsed: number } }>(
    '/incidents/' + encodeURIComponent(incidentId) + '/complete',
    { method: 'POST', body: JSON.stringify({ actionIds, rootCauseId, elapsedSeconds }) }
  );

export const unlockSkillRequest = (skillId: string) =>
  request<PlayerProfile>('/player/skills/' + encodeURIComponent(skillId), { method: 'POST', body: '{}' });

export const resetProgressRequest = () =>
  request<PlayerProfile>('/player/progress', { method: 'DELETE' });
