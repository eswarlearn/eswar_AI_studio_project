# Backend Quest

Backend Quest is a React + TypeScript learning game backed by an Express API and PostgreSQL. Existing backend_quest_save_v1 local saves are imported once into the new guest profile when available. The browser renders the game and runs the live architecture preview; the API validates submitted level architectures, calculates completion results, manages progression, and stores player state.

## Local development

Requirements: Node.js 22+, npm, and PostgreSQL 15+ (or Docker Compose).

1. Copy .env.example to .env and set DATABASE_URL for a database you can use. The database itself must exist before the API starts.
2. Install dependencies with npm install.
3. Run migrations with npm run db:migrate (the API also applies pending migrations on startup).
4. Start the API with npm run dev:api.
5. In another terminal, start Vite with npm run dev.
6. Open http://localhost:3000. Vite proxies /api to VITE_API_PROXY_TARGET.

For a local PostgreSQL container, run docker compose up -d postgres, then use the compose database URL with host localhost and port 5432. Compose provisions a persistent named volume and creates the database on its first start.

## Production

Build and run the Docker stack with docker compose up --build -d. Set a strong POSTGRES_PASSWORD and a comma-separated CORS_ORIGINS value for the actual browser origin before deployment. The API serves the built frontend and API on port 8080. Use managed PostgreSQL for hosted environments by setting DATABASE_URL; enable DATABASE_SSL=true where the provider requires TLS and its certificate chain is trusted by the runtime.

The API runs versioned migrations at startup and exposes GET /health/live and GET /health/ready. Back up PostgreSQL using the hosting provider's supported backup process before deployments.

## Player saves

A guest player is created automatically. The server returns an opaque, random bearer token; the browser stores it locally and uses it for future API calls. Progress survives refreshes and server restarts. Guest tokens are browser-local, so they do not provide cross-device recovery. Account registration/linking is a future feature.

Current player progression and game session state live in PostgreSQL. World and level definitions remain static TypeScript content so a release can update the game curriculum without content tables. There is no leaderboard or multiplayer mode.

## Scripts

- npm run dev — Vite development server.
- npm run dev:api — API server with TypeScript execution.
- npm run db:migrate — apply pending versioned migrations.
- npm run build — production frontend build.
- npm run lint — TypeScript check.
- npm test — game rule unit tests.
- docker compose --profile integration run --build --rm integration-tests — API/PostgreSQL integration tests against a separate disposable database.

See ARCHITECTURE.md, DATABASE.md, API.md, and DEPLOYMENT.md for implementation and operations details.
