# Tasks: Session Management

## Phase 1 — Backend Routes

- [x] Export `activeSessions` map from `backend/src/server.ts` so routes can reference it
- [x] Add `DELETE /sessions/:id` route: auth check, owner guard (403), delete from MongoDB, evict from activeSessions, close peer WebSockets, return 204
- [x] Add `PATCH /sessions/:id` route: validate name, auth check, owner guard (403), update MongoDB name field, return 200 with updated session

## Phase 2 — Frontend API Client

- [x] Add `deleteSession(id, authHeader)` to `frontend/src/api/sessions.ts`
- [x] Add `renameSession(id, name, authHeader)` to `frontend/src/api/sessions.ts`

## Phase 3 — Frontend UI

- [x] Add delete button with two-step inline confirmation to each session card in `SessionsPage`
- [x] Add inline rename interaction to each session card in `SessionsPage`
