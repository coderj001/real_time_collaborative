# Spec: Session Management

## Delete Session

### Backend
- `DELETE /sessions/:id` route exists and is protected by `basicAuth`
- Returns `404` if session does not exist
- Returns `403` if `session.createdBy !== authenticated username`
- Deletes the session document from MongoDB on success
- Evicts the session from the `activeSessions` in-memory map
- Closes all live WebSocket connections belonging to the deleted session
- Returns `204 No Content` on success

### Frontend
- Each session card on `SessionsPage` displays a delete button
- Deleting requires a two-step confirmation (button changes to confirm state before executing)
- On success, the session card is removed from the list without a full page reload
- On `403`, an error message is shown on the card
- On `404`, the card is removed (already deleted)

---

## Rename Session

### Backend
- `PATCH /sessions/:id` route exists and is protected by `basicAuth`
- Body must contain a non-empty `name` field → `400` otherwise
- Returns `404` if session does not exist
- Returns `403` if `session.createdBy !== authenticated username`
- Updates the `name` field in MongoDB
- Returns `200` with `{ id, name, shareCode, createdAt }`

### Frontend
- Each session card on `SessionsPage` provides a way to edit the session name inline
- Pressing Enter or blurring the input saves the new name
- Pressing Escape cancels the edit and restores the original name
- On success, the card updates to show the new name without a full page reload
- The updated name is shown on next canvas open (no live propagation to open canvases)

---

## Authorization
- Only the session creator (`createdBy`) may delete or rename a session
- Guests who joined via share code cannot delete or rename
