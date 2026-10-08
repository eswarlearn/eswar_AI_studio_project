# Architecture

## Runtime shape

React + Vite browser
  - renders static world, level, quiz, and component catalogs
  - simulates the live canvas for immediate feedback
  - calls REST API at /api/v1
        |
        v
Express API (Node.js)
  - guest token authentication and request validation
  - authoritative architecture/quiz/incident evaluation
  - progression and session services
  - request IDs, JSON logs, CORS, and rate limiting
  - PostgreSQL pool and versioned migrations
        |
        v
PostgreSQL

Game content remains in src/data. The server imports those same definitions and the deterministic simulation/validation engine, keeping API scoring aligned with the currently shipped campaign. Completion requests carry the player's architecture and selected quiz answers; the server recomputes metrics, checks win conditions, and grants rewards once per level or incident.

An existing version 1 browser save is imported once when its guest identity is first created; imported identifiers are filtered against shipped content and rank is recalculated from XP. GameContext owns UI state while loading and mutating persistent progress through src/engine/api.ts. A game session stores the active level plus the current canvas and traffic pattern, allowing refresh recovery.

## Persistence model

- players: guest identity and SHA-256 hash of the opaque bearer token.
- player_progress: XP, engineering level, rank.
- level_progress: one row per completed level, best stars/score/cost/latency.
- player_skills, player_achievements: unlocked catalog identifiers.
- incident_results: best incident result and elapsed time.
- game_sessions: active/completed/abandoned attempts and JSONB canvas state.
- schema_migrations: applied migration versions.

Worlds and level definitions are versioned application content rather than player-generated data, so the database does not duplicate them.

## Security and scaling limits

Guest bearer tokens are stored only in the browser and hashed in PostgreSQL. There are no passwords or account recovery flows. HTTPS is required in production. CORS uses an explicit origin allowlist. Rate limiting is per process and IP; use an edge/API gateway limit if multiple API replicas are deployed. Database connections are pooled, and API instances are otherwise stateless.
