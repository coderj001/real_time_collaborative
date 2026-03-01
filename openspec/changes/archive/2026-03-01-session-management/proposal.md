# Proposal: Session Management

## Summary
Complete CRUD for sessions by adding delete and rename operations. Both are owner-only actions (only the user who created the session can delete or rename it).

## Problem
The sessions page is read-and-create only. Users have no way to clean up old sessions or fix a typo in a session name.

## Proposed Solution

### Delete Session
Add `DELETE /sessions/:id` backend route. Only the `createdBy` owner can delete. On deletion:
1. Remove the MongoDB document
2. Evict the session from `activeSessions` in-memory map on the backend so Yjs stops tracking it
3. Any currently-connected WebSocket clients will finish their connection but cannot reconnect (the existing `Session.exists()` guard at WS connection time already handles this)

Frontend: each session card on `SessionsPage` gets a DELETE button. Clicking shows an inline confirmation before sending the request. On success, remove the card from local state.

### Rename Session
Add `PATCH /sessions/:id` backend route with body `{ name }`. Only owner can rename. No live propagation — the updated name is visible the next time any user opens or refreshes the canvas.

Frontend: each session card gets an inline edit interaction — click the session name to make it editable (a small input), press Enter or blur to save, press Escape to cancel. Optimistically updates local state on success.

### Authorization Rule
Both routes check `session.createdBy === res.locals.username`. Non-owners receive `403 Forbidden`.

## Scope
- Backend: `DELETE /sessions/:id`, `PATCH /sessions/:id`
- Backend: evict from `activeSessions` map on delete
- Frontend API client: `deleteSession`, `renameSession` functions in `sessions.ts`
- Frontend UI: delete button + confirmation, inline rename on session cards

## What Does NOT Change
- Share-code join flow (guests can still join by code; they just can't delete/rename)
- Real-time canvas sync
- Session list fetching

## Success Criteria
- Owner can delete a session; it disappears from their list
- Deleted session's WebSocket path is inaccessible on reconnect
- Owner can rename a session; new name shown on next canvas open
- Non-owner cannot delete or rename (403 response)
- Delete requires explicit confirmation (no accidental deletion)
