import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import type { PoolClient } from 'pg';
import { pool } from './pool.js';
import { INITIAL_PLAYER_PROFILE } from '../../../src/engine/scoring.js';
import { calculateLevelFromXp, calculatePlayerRank } from '../../../src/engine/scoring.js';
import { WORLDS } from '../../../src/data/worlds.js';
import { LEVELS } from '../../../src/data/levels.js';
import { SKILL_TREE_NODES } from '../../../src/data/skillTree.js';
import { ACHIEVEMENTS_CATALOG } from '../../../src/data/achievements.js';
import { INCIDENT_SCENARIOS } from '../../../src/data/incidents.js';
import type { PlayerProfile } from '../../../src/types/game.js';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = scryptSync(password, salt, 64);
  return timingSafeEqual(keyBuffer, derivedKey);
}

export async function registerUser(username: string, passwordPlain: string, tokenHash: Buffer, legacyProfile?: unknown): Promise<{ playerId: string; username: string }> {
  const cleanUsername = username.trim();
  if (cleanUsername.length < 3 || cleanUsername.length > 30) throw new Error('INVALID_USERNAME');
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) throw new Error('INVALID_USERNAME_FORMAT');
  if (!passwordPlain || passwordPlain.length < 4) throw new Error('PASSWORD_TOO_SHORT');

  const existing = await pool.query('SELECT 1 FROM players WHERE LOWER(username) = LOWER($1)', [cleanUsername]);
  if (existing.rowCount) throw new Error('USERNAME_ALREADY_TAKEN');

  const passwordHash = hashPassword(passwordPlain);
  const client = await pool.connect();
  const id = randomUUID();
  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO players(id, username, password_hash, guest_token_hash) VALUES($1, $2, $3, $4)', [id, cleanUsername, passwordHash, tokenHash]);
    await client.query('INSERT INTO player_progress(player_id) VALUES($1)', [id]);
    await client.query('INSERT INTO player_skills(player_id, skill_id) VALUES($1, $2)', [id, 'skill-http']);
    if (legacyProfile && typeof legacyProfile === 'object') await importLegacyProfile(client, id, legacyProfile as Record<string, unknown>);
    await client.query('COMMIT');
    return { playerId: id, username: cleanUsername };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function loginUser(username: string, passwordPlain: string, newTokenHash: Buffer): Promise<{ playerId: string; username: string }> {
  const cleanUsername = username.trim();
  const result = await pool.query('SELECT id, username, password_hash FROM players WHERE LOWER(username) = LOWER($1)', [cleanUsername]);
  const row = result.rows[0];
  if (!row || !row.password_hash) throw new Error('INVALID_CREDENTIALS');

  const valid = verifyPassword(passwordPlain, row.password_hash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  await pool.query('UPDATE players SET guest_token_hash = $2, updated_at = now() WHERE id = $1', [row.id, newTokenHash]);
  return { playerId: row.id, username: row.username };
}

export async function getPlayerAccount(playerId: string): Promise<{ id: string; username: string | null }> {
  const result = await pool.query('SELECT id, username FROM players WHERE id = $1', [playerId]);
  const row = result.rows[0];
  if (!row) throw new Error('PLAYER_NOT_FOUND');
  return { id: row.id, username: row.username ?? null };
}

export async function createGuest(tokenHash: Buffer, legacyProfile?: unknown): Promise<string> {
  const client = await pool.connect();
  const id = randomUUID();
  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO players(id, guest_token_hash) VALUES($1, $2)', [id, tokenHash]);
    await client.query('INSERT INTO player_progress(player_id) VALUES($1)', [id]);
    await client.query('INSERT INTO player_skills(player_id, skill_id) VALUES($1, $2)', [id, 'skill-http']);
    if (legacyProfile && typeof legacyProfile === 'object') await importLegacyProfile(client, id, legacyProfile as Record<string, unknown>);
    await client.query('COMMIT');
    return id;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}


async function importLegacyProfile(client: PoolClient, playerId: string, legacy: Record<string, unknown>): Promise<void> {
  const safeInt = (value: unknown, min: number, max: number, fallback = 0): number =>
    typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max ? value : fallback;
  const xp = safeInt(legacy.xp, 0, 1_000_000);
  const rank = calculatePlayerRank(xp);
  const level = calculateLevelFromXp(xp);
  await client.query('UPDATE player_progress SET xp=$2,level=$3,rank=$4,rank_title=$5,updated_at=now() WHERE player_id=$1',
    [playerId, xp, level.level, rank.rank, rank.title]);

  const knownLevelIds = new Set(LEVELS.map(item => item.id));
  const completions = Array.isArray(legacy.completedLevelIds)
    ? [...new Set(legacy.completedLevelIds.map(value => safeInt(value, 1, 10000)).filter(value => knownLevelIds.has(value)))]
    : [];
  const scores = legacy.levelScores && typeof legacy.levelScores === 'object' ? legacy.levelScores as Record<string, unknown> : {};
  for (const levelId of completions) {
    const saved = scores[String(levelId)] && typeof scores[String(levelId)] === 'object' ? scores[String(levelId)] as Record<string, unknown> : {};
    await client.query(
      'INSERT INTO level_progress(player_id,level_id,best_stars,best_score,best_cost,best_latency) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING',
      [playerId, levelId, safeInt(saved.stars, 1, 3, 1), safeInt(saved.bestScore ?? saved.bestCost, 0, 1_000_000), 0, safeInt(saved.bestLatency, 0, 1_000_000)]
    );
  }

  const knownAchievements = new Set(ACHIEVEMENTS_CATALOG.map(item => item.id));
  const achievements = Array.isArray(legacy.unlockedAchievementIds) ? legacy.unlockedAchievementIds : [];
  for (const achievementId of achievements) if (typeof achievementId === 'string' && knownAchievements.has(achievementId)) {
    await client.query('INSERT INTO player_achievements(player_id,achievement_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [playerId, achievementId]);
  }

  const knownIncidents = new Set(INCIDENT_SCENARIOS.map(item => item.id));
  const incidents = legacy.incidentResolutions && typeof legacy.incidentResolutions === 'object' ? legacy.incidentResolutions as Record<string, unknown> : {};
  for (const [incidentId, raw] of Object.entries(incidents)) {
    if (!knownIncidents.has(incidentId) || !raw || typeof raw !== 'object') continue;
    const result = raw as Record<string, unknown>;
    await client.query('INSERT INTO incident_results(player_id,incident_id,stars,time_spent_seconds) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',
      [playerId, incidentId, safeInt(result.stars, 1, 3, 1), safeInt(result.timeSpentSeconds, 0, 86400)]);
  }

  const requested = new Set(Array.isArray(legacy.unlockedSkillIds) ? legacy.unlockedSkillIds.filter((value): value is string => typeof value === 'string') : []);
  const unlocked = new Set<string>(['skill-http']);
  let changed = true;
  while (changed) {
    changed = false;
    for (const skill of SKILL_TREE_NODES) {
      if (requested.has(skill.id) && !unlocked.has(skill.id) && skill.xpRequired <= xp && skill.prerequisites.every(id => unlocked.has(id))) {
        unlocked.add(skill.id);
        await client.query('INSERT INTO player_skills(player_id,skill_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [playerId, skill.id]);
        changed = true;
      }
    }
  }
}

export async function findPlayerByToken(tokenHash: Buffer): Promise<string | null> {
  const result = await pool.query('SELECT id FROM players WHERE guest_token_hash = $1', [tokenHash]);
  return result.rows[0]?.id ?? null;
}

export async function getProfile(playerId: string): Promise<PlayerProfile> {
  const [progress, completed, skills, achievements, incidents] = await Promise.all([
    pool.query('SELECT xp, level, rank, rank_title FROM player_progress WHERE player_id = $1', [playerId]),
    pool.query('SELECT level_id, best_stars, best_score, best_cost, best_latency FROM level_progress WHERE player_id = $1', [playerId]),
    pool.query('SELECT skill_id FROM player_skills WHERE player_id = $1 ORDER BY unlocked_at', [playerId]),
    pool.query('SELECT achievement_id FROM player_achievements WHERE player_id = $1 ORDER BY unlocked_at', [playerId]),
    pool.query('SELECT incident_id, stars, time_spent_seconds FROM incident_results WHERE player_id = $1', [playerId])
  ]);
  if (!progress.rowCount) throw new Error('PLAYER_PROGRESS_MISSING');
  const completedLevelIds = completed.rows.map(row => Number(row.level_id));
  const unlockedWorldIds = WORLDS.filter((world, index) => index === 0 || WORLDS[index - 1].levelIds.some(id => completedLevelIds.includes(id))).map(world => world.id);
  const levelScores: PlayerProfile['levelScores'] = {};
  for (const row of completed.rows) {
    levelScores[Number(row.level_id)] = {
      stars: Number(row.best_stars),
      bestCost: Number(row.best_cost),
      bestLatency: Number(row.best_latency)
    };
  }
  const incidentResolutions: PlayerProfile['incidentResolutions'] = {};
  for (const row of incidents.rows) incidentResolutions[row.incident_id] = { stars: Number(row.stars), timeSpentSeconds: Number(row.time_spent_seconds) };
  const row = progress.rows[0];
  return {
    ...INITIAL_PLAYER_PROFILE,
    level: Number(row.level),
    xp: Number(row.xp),
    rank: row.rank,
    rankTitle: row.rank_title,
    completedLevelIds,
    unlockedWorldIds,
    unlockedSkillIds: skills.rows.map(item => item.skill_id),
    unlockedAchievementIds: achievements.rows.map(item => item.achievement_id),
    incidentResolutions,
    levelScores
  };
}

export async function completeLevel(playerId: string, levelId: number, stars: number, score: number, cost: number, latency: number, achievementId?: string): Promise<PlayerProfile> {
  const level = LEVELS.find(item => item.id === levelId);
  if (!level) throw new Error('LEVEL_NOT_FOUND');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO level_progress(player_id, level_id, best_stars, best_score, best_cost, best_latency)
       VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(player_id,level_id) DO NOTHING RETURNING level_id`,
      [playerId, levelId, stars, score, cost, latency]
    );
    if (!inserted.rowCount) {
      await client.query(
        `UPDATE level_progress SET completed_at=now(), best_stars=GREATEST(best_stars,$3),
         best_score=GREATEST(best_score,$4), best_cost=CASE WHEN best_cost=0 THEN $5 ELSE LEAST(best_cost,$5) END,
         best_latency=CASE WHEN best_latency=0 THEN $6 ELSE LEAST(best_latency,$6) END
         WHERE player_id=$1 AND level_id=$2`, [playerId, levelId, stars, score, cost, latency]
      );
    }
    if (inserted.rowCount) {
      const xp = level.rewards.xp;
      const rank = calculatePlayerRank((await currentXp(client, playerId)) + xp);
      const playerLevel = calculateLevelFromXp((await currentXp(client, playerId)) + xp);
      await client.query('UPDATE player_progress SET xp=xp+$2, level=$3, rank=$4, rank_title=$5, updated_at=now() WHERE player_id=$1',
        [playerId, xp, playerLevel.level, rank.rank, rank.title]);
      if (achievementId) await client.query('INSERT INTO player_achievements(player_id, achievement_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [playerId, achievementId]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return getProfile(playerId);
}

async function currentXp(client: PoolClient, playerId: string): Promise<number> {
  const result = await client.query('SELECT xp FROM player_progress WHERE player_id=$1 FOR UPDATE', [playerId]);
  return Number(result.rows[0]?.xp ?? 0);
}

export async function completeIncident(playerId: string, incidentId: string, stars: number, seconds: number, xp: number): Promise<PlayerProfile> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO incident_results(player_id,incident_id,stars,time_spent_seconds) VALUES($1,$2,$3,$4)
       ON CONFLICT(player_id,incident_id) DO NOTHING RETURNING incident_id`, [playerId, incidentId, stars, seconds]
    );
    if (!inserted.rowCount) {
      await client.query('UPDATE incident_results SET stars=GREATEST(stars,$3),time_spent_seconds=LEAST(time_spent_seconds,$4),completed_at=now() WHERE player_id=$1 AND incident_id=$2', [playerId, incidentId, stars, seconds]);
    }
    if (inserted.rowCount) {
      const before = await currentXp(client, playerId);
      const rank = calculatePlayerRank(before + xp);
      const lvl = calculateLevelFromXp(before + xp);
      await client.query('UPDATE player_progress SET xp=xp+$2, level=$3, rank=$4, rank_title=$5, updated_at=now() WHERE player_id=$1', [playerId, xp, lvl.level, rank.rank, rank.title]);
    }
    await client.query('INSERT INTO player_achievements(player_id,achievement_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [playerId, 'incident_commander']);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return getProfile(playerId);
}

export async function unlockSkill(playerId: string, skillId: string): Promise<PlayerProfile> {
  const skill = SKILL_TREE_NODES.find(item => item.id === skillId);
  if (!skill) throw new Error('SKILL_NOT_FOUND');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT xp FROM player_progress WHERE player_id=$1 FOR UPDATE', [playerId]);
    const unlocked = await client.query('SELECT skill_id FROM player_skills WHERE player_id=$1', [playerId]);
    const ids = new Set(unlocked.rows.map(row => row.skill_id));
    if (ids.has(skillId)) throw new Error('SKILL_ALREADY_UNLOCKED');
    if (Number(current.rows[0]?.xp ?? 0) < skill.xpRequired) throw new Error('INSUFFICIENT_XP');
    if (skill.prerequisites.some(id => !ids.has(id))) throw new Error('SKILL_PREREQUISITES_MISSING');
    await client.query('INSERT INTO player_skills(player_id, skill_id) VALUES($1,$2)', [playerId, skillId]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return getProfile(playerId);
}

export async function createSession(playerId: string, levelId: number): Promise<{ id: string; levelId: number; state: unknown }> {
  const level = LEVELS.find(item => item.id === levelId);
  if (!level) throw new Error('LEVEL_NOT_FOUND');
  if (!(await getProfile(playerId)).unlockedWorldIds.includes(level.worldId)) throw new Error('WORLD_LOCKED');
  const client = await pool.connect();
  let result;
  try {
    await client.query('BEGIN');
    await client.query("UPDATE game_sessions SET status='abandoned',updated_at=now() WHERE player_id=$1 AND status='active'", [playerId]);
    result = await client.query('INSERT INTO game_sessions(id,player_id,level_id) VALUES($1,$2,$3) RETURNING id,level_id,state', [randomUUID(), playerId, levelId]);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  return { id: result.rows[0].id, levelId: Number(result.rows[0].level_id), state: result.rows[0].state };
}

export async function assertActiveSession(playerId: string, sessionId: string, levelId: number): Promise<void> {
  const result = await pool.query("SELECT 1 FROM game_sessions WHERE id=$1 AND player_id=$2 AND level_id=$3 AND status='active'", [sessionId, playerId, levelId]);
  if (!result.rowCount) throw new Error('SESSION_NOT_FOUND');
}

export async function updateSession(playerId: string, sessionId: string, state: unknown): Promise<void> {
  const result = await pool.query("UPDATE game_sessions SET state=$3::jsonb,updated_at=now() WHERE id=$1 AND player_id=$2 AND status='active'", [sessionId, playerId, JSON.stringify(state)]);
  if (!result.rowCount) throw new Error('SESSION_NOT_FOUND');
}

export async function finishSession(playerId: string, sessionId: string, levelId: number): Promise<void> {
  const result = await pool.query("UPDATE game_sessions SET status='completed',completed_at=now(),updated_at=now() WHERE id=$1 AND player_id=$2 AND level_id=$3 AND status='active'", [sessionId, playerId, levelId]);
  if (!result.rowCount) throw new Error('SESSION_NOT_FOUND');
}

export async function abandonSession(playerId: string, sessionId: string): Promise<void> {
  await pool.query("UPDATE game_sessions SET status='abandoned',updated_at=now() WHERE id=$1 AND player_id=$2 AND status='active'", [sessionId, playerId]);
}
