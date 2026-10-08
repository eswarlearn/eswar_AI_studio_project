# Database

PostgreSQL is required. The application does not create databases or drop/recreate tables at startup. Create an empty database (or start the included Compose PostgreSQL service), set DATABASE_URL, and run npm run db:migrate. API startup also applies pending migrations.

Migrations are ordered SQL files under backend/migrations and tracked in schema_migrations. Each migration executes in a transaction and uses repeat-safe DDL. Never edit an already-applied migration; add a new numbered migration. Existing compatible data is retained.

The first migration creates guest identities, progress, level and incident results, skill and achievement unlocks, and game sessions. Foreign keys cascade only when a player is explicitly deleted; normal startup never deletes player data. Game reset is a user action that clears that guest's progression rows and preserves the identity.

No seed data is required: worlds, levels, quizzes, component definitions, and incidents are application content in src/data.

For backups, restore drills, TLS requirements, and point-in-time recovery, use the selected PostgreSQL provider's documented procedures.

Run API and database integration tests against an isolated disposable database with docker compose --profile integration run --build --rm integration-tests. The test profile does not reuse the development PostgreSQL volume.
