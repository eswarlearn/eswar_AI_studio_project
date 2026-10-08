ALTER TABLE players ALTER COLUMN guest_token_hash DROP NOT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS password_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS players_username_lower_idx ON players (LOWER(username)) WHERE username IS NOT NULL;
