# Deployment

## Docker Compose

Set a unique POSTGRES_PASSWORD and the production frontend origin in CORS_ORIGINS, then run:

    docker compose up --build -d
    docker compose ps
    curl http://localhost:8080/health/ready

The API container serves the Vite build and REST API on port 8080. PostgreSQL data is kept in the backendquest_pgdata volume. For hosted production, use a managed PostgreSQL service and secret manager; set DATABASE_URL, DATABASE_SSL, CORS_ORIGINS, and DATABASE_POOL_MAX in the deployment environment. Do not use the Compose example password outside local development.

Migrations run before the API begins listening. Keep old and new application versions compatible with the migration during rolling deployments; use expand/contract changes for schema changes. Configure HTTPS at the hosting ingress or reverse proxy and set TRUST_PROXY=true only when requests arrive through a trusted proxy.

## Health and shutdown

Use /health/live for process liveness, /health/ready for PostgreSQL-backed readiness, and /metrics for Prometheus-compatible HTTP counts/durations and pool gauges. SIGTERM/SIGINT stops accepting requests, drains the HTTP server, and closes the connection pool.

## Current deployment assumptions

The repository supplies a single API/frontend container and PostgreSQL Compose service. It does not choose a cloud provider, provision managed database infrastructure, configure a domain/certificate, or set up provider-specific backups/monitoring. Guest identity is browser-local; account linking is needed for cross-device recovery.
