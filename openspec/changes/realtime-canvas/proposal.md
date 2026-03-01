# Real-Time Collaborative Canvas/Whiteboard

## Summary
A collaborative whiteboard system inspired by Figma/Miro, where multiple users can draw and write text simultaneously within shared sessions. Conflict resolution is handled automatically via CRDTs (yjs), and cursor presence gives users live awareness of collaborators.

## Goals
- Users can create or join a canvas session via a share code
- Multiple users (2-5) can draw freehand and add text simultaneously
- Changes sync in real-time with no perceptible lag (optimistic UI)
- Cursor positions are visible to all collaborators with user name/color labels
- Sessions persist to MongoDB; active state is fast-retrieved from Redis
- Local dev runs via podman-compose

## Non-Goals
- Undo/redo (deferred)
- Complex auth (basic HTTP auth only)
- Scale beyond ~5 concurrent users per session (prototype)
- Shapes, connectors, images (initial scope: draw + text only, extensible)

## Stack
- **Frontend**: React + fabric.js + yjs (Y.Map) + y-websocket provider
- **Backend**: Node.js + Express + y-websocket server
- **Presence**: yjs Awareness API (cursor positions)
- **Persistence**: MongoDB (snapshots) + Redis (room/session metadata)
- **Infra**: Podman + podman-compose

## Architecture Decision
- Unit of collaboration: Session (created/joined by share code)
- Conflict resolution: Pure CRDT, LWW per object property
- Transport: y-websocket (handles CRDT sync natively)
- Auth: Basic auth middleware (username + password in header)
- No undo/redo at this stage
