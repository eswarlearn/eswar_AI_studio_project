# REST API v1

Base path: /api/v1. Responses use { "success": boolean, "data": ..., "error": ... , "requestId": "..." }. Errors never include SQL details. Authenticated calls pass Authorization: Bearer <guest-token>.

| Method | Path | Auth | Purpose |
|---|---|---:|---|
| POST | /guest | No | Create a guest and return its bearer token/profile |
| GET | /worlds | No | List shipped worlds |
| GET | /levels?worldId=... | No | List shipped levels |
| GET | /player/profile | Yes | Load progression and best results |
| DELETE | /player/progress | Yes | Reset the current guest's progress |
| POST | /player/skills/:skillId | Yes | Unlock a skill after XP/prerequisite checks |
| POST | /game/sessions | Yes | Start a session with { "levelId": 1 } |
| GET | /game/sessions/active | Yes | Restore latest active session |
| PATCH | /game/sessions/:sessionId | Yes | Save current canvas and traffic state |
| POST | /game/sessions/:sessionId/complete | Yes | Validate architecture and quiz, persist result |
| POST | /incidents/:incidentId/complete | Yes | Validate interventions/root cause and persist result |

Health endpoints are GET /health/live and GET /health/ready. GET /metrics exposes Prometheus-compatible HTTP request counts/durations and PostgreSQL pool gauges. Level completion accepts { levelId, nodes, trafficPattern, answers }. For quiz levels, answers maps question IDs to selected option IDs. Incident completion accepts { actionIds, rootCauseId, elapsedSeconds }.

Common errors include AUTH_REQUIRED (401), LEVEL_NOT_FOUND (404), WORLD_LOCKED (403), malformed payloads (400), unmet game conditions (422), and insufficient XP/prerequisites (409). Every response includes a request ID in both the JSON body and X-Request-Id header.
