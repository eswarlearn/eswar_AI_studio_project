CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY,
  guest_token_hash BYTEA NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_progress (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  rank TEXT NOT NULL DEFAULT 'C',
  rank_title TEXT NOT NULL DEFAULT 'Backend Beginner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS level_progress (
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL CHECK (level_id > 0),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  best_stars SMALLINT NOT NULL CHECK (best_stars BETWEEN 1 AND 3),
  best_score INTEGER NOT NULL DEFAULT 0 CHECK (best_score >= 0),
  best_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (best_cost >= 0),
  best_latency INTEGER NOT NULL DEFAULT 0 CHECK (best_latency >= 0),
  PRIMARY KEY (player_id, level_id)
);
CREATE INDEX IF NOT EXISTS level_progress_recent_idx ON level_progress(player_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS player_skills (
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, skill_id)
);

CREATE TABLE IF NOT EXISTS player_achievements (
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS incident_results (
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  incident_id TEXT NOT NULL,
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 3),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, incident_id)
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL CHECK (level_id > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS game_sessions_player_active_idx ON game_sessions(player_id, updated_at DESC) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS schema_migrations (
  version BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
