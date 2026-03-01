# Design: Session Management

## Architecture Overview

Both operations (delete, rename) follow the same REST pattern: owner-only mutation routes added to `backend/src/routes/sessions.ts`, with a `403` guard comparing `session.createdBy` to `res.locals.username`.

---

## Backend: Delete Session

### Route
```
DELETE /sessions/:id
```

### Logic
1. `basicAuth` already applied to all session routes
2. `Session.findById(id)` — 404 if not found
3. `session.createdBy !== res.locals.username` → 403
4. `Session.findByIdAndDelete(id)`
5. Evict from `activeSessions` map (imported from `server.ts`) — stops periodic saves
6. Close all live WebSocket peers for this session (prevents stale in-memory doc)
7. Return `204 No Content`

### activeSessions Sharing
`activeSessions` is currently a `Map` defined and used in `server.ts`. Routes need access for eviction.

**Solution**: Export `activeSessions` from `server.ts` and import in `routes/sessions.ts`.

```ts
// server.ts
export const activeSessions = new Map<string, { peers: Set<WebSocket>; ydoc: Y.Doc | null }>()

// routes/sessions.ts
import { activeSessions } from '../server'
```

On delete: close each peer WebSocket in the set, then `activeSessions.delete(id)`.

---

## Backend: Rename Session

### Route
```
PATCH /sessions/:id
Body: { name: string }
```

### Logic
1. Validate `name` present and non-empty → 400
2. `Session.findById(id)` — 404 if not found
3. `session.createdBy !== res.locals.username` → 403
4. `Session.findByIdAndUpdate(id, { name }, { new: true })`
5. Return `200 { id, name, shareCode, createdAt }`

---

## Frontend: API Client

Two new functions in `frontend/src/api/sessions.ts`:

```ts
deleteSession(id, authHeader) → DELETE /sessions/:id → void
renameSession(id, name, authHeader) → PATCH /sessions/:id → Session
```

---

## Frontend: SessionsPage UI

### Delete Flow
Each session card gets a small `[DEL]` button (retro-btn, red-ish style).

Two-click confirm pattern (no modal):
- First click: button text changes to `"SURE?"` and a `[YES]` button appears inline
- Click `[YES]`: calls `deleteSession`, removes card from local state
- Click elsewhere / 3s timeout: reverts to `[DEL]`

### Rename Flow
Inline edit on the session name text:
- Session name rendered as a `<span>` with a small `[REN]` button next to it
- Click `[REN]`: replaces span with `<input>` pre-filled with current name
- `Enter` or blur: calls `renameSession`, updates local state with new name
- `Escape`: cancels, reverts to span

Both interactions are local state — no route changes, no new components.

---

## Error Handling
- Delete fails: show error message in card, revert to normal state
- Rename fails: show error, revert to original name
- 403: show `"NOT YOUR SESSION"` error text
- 404: remove card from list (already gone)

---

## No Changes To
- Yjs document structure
- WebSocket handshake or awareness
- Share-code join flow
- Other session routes (create, list, get, join)
