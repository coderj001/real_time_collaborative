# Design: Real-Time Collaborative Canvas

## System Architecture

```
Browser (User A)                Browser (User B)
┌─────────────────────┐         ┌─────────────────────┐
│  React App          │         │  React App          │
│  ┌───────────────┐  │         │  ┌───────────────┐  │
│  │  fabric.js    │  │         │  │  fabric.js    │  │
│  │  Canvas       │  │         │  │  Canvas       │  │
│  └──────┬────────┘  │         │  └──────┬────────┘  │
│         │ sync      │         │         │ sync      │
│  ┌──────▼────────┐  │         │  ┌──────▼────────┐  │
│  │  yjs Y.Doc    │  │         │  │  yjs Y.Doc    │  │
│  │  Y.Map objs   │  │         │  │  Y.Map objs   │  │
│  │  Awareness    │  │         │  │  Awareness    │  │
│  └──────┬────────┘  │         │  └──────┬────────┘  │
└─────────┼───────────┘         └─────────┼───────────┘
          │ WebSocket                      │ WebSocket
          └─────────────┐   ┌─────────────┘
                        ▼   ▼
              ┌──────────────────────┐
              │  Node.js Backend     │
              │  ┌────────────────┐  │
              │  │ y-websocket    │  │
              │  │ server         │  │
              │  └───────┬────────┘  │
              │          │           │
              │  ┌───────▼────────┐  │
              │  │ Express REST   │  │
              │  │ /sessions CRUD │  │
              │  │ basic auth     │  │
              │  └───────┬────────┘  │
              └──────────┼───────────┘
                         │
              ┌──────────┴───────────┐
              │                      │
         ┌────▼────┐           ┌─────▼────┐
         │  Redis  │           │ MongoDB  │
         │ session │           │snapshots │
         │ metadata│           │          │
         └─────────┘           └──────────┘
```

## Data Models

### Session (MongoDB)
```json
{
  "_id": "uuid-v4",
  "name": "My Whiteboard",
  "shareCode": "ABC123",
  "createdBy": "username",
  "createdAt": "ISO timestamp",
  "snapshot": { "objects": [] },
  "lastSavedAt": "ISO timestamp"
}
```

### Redis Keys
- `session:<id>:active` — TTL-based marker for active sessions
- `session:<id>:users` — Set of currently connected usernames

### yjs Y.Doc Structure
```
Y.Doc
  └── Y.Map "objects"          ← canvas objects, keyed by object ID
        └── "obj-uuid": {
              type: "path" | "textbox",
              ...fabric serialized props
            }
  └── Awareness                ← per-client cursor state
        └── clientId: {
              user: { name, color },
              cursor: { x, y }
            }
```

## yjs ↔ fabric.js Binding

```
User draws on canvas
      │
      ▼
fabric "object:added" / "object:modified" event
      │
      ├─ isRemoteUpdate? → skip (prevent echo loop)
      │
      ▼
serialize object to JSON
      │
      ▼
yDoc.transact(() => objectsMap.set(obj.id, json))
      │
      ▼ (yjs broadcasts delta via y-websocket to all peers)
      │
Remote peers receive Y.Map update
      │
      ▼
set isRemoteUpdate = true
update/add fabric object on canvas from new JSON
set isRemoteUpdate = false
```

## Presence / Cursor Protocol

- yjs Awareness API propagates cursor positions automatically
- On `mousemove`: update `awareness.setLocalState({ user, cursor: {x, y} })`
- On `awareness.on('change')`: render/update cursor overlays for all remote users
- Cursor overlay: SVG/HTML layer on top of canvas, not part of fabric canvas
- Each user assigned a color on join (from a fixed palette)

## Session Flow

```
Create:  POST /sessions          → { id, shareCode }
Join:    POST /sessions/join     → { id } (body: { code })
Load:    GET  /sessions/:id      → session metadata + snapshot
List:    GET  /sessions          → user's sessions

WebSocket: ws://backend/yjs/:sessionId
```

## Persistence Strategy

- **On join**: load Y.Doc from MongoDB snapshot, then apply any in-memory Redis state
- **Periodic save**: every 60s if session is active, snapshot Y.Doc → MongoDB
- **On last user leaves**: final snapshot save to MongoDB, clear Redis keys

## Auth

- HTTP Basic Auth middleware on all REST endpoints
- Username/password stored in environment variables (prototype simplicity)
- No auth on WebSocket (session ID acts as implicit token for prototype)

## Repo Structure

```
real-time-collaborative/
├── podman-compose.yml
├── frontend/
│   ├── Containerfile
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── Canvas.tsx          ← fabric.js + yjs binding
│       │   ├── CursorLayer.tsx     ← awareness cursor overlay
│       │   ├── Toolbar.tsx         ← draw/text mode switch
│       │   └── SessionList.tsx     ← create/join/list sessions
│       ├── hooks/
│       │   ├── useYjs.ts           ← Y.Doc + WebSocket provider
│       │   └── useAwareness.ts     ← cursor presence
│       └── api/
│           └── sessions.ts         ← REST client
└── backend/
    ├── Containerfile
    ├── package.json
    └── src/
        ├── server.ts               ← Express + y-websocket setup
        ├── routes/
        │   └── sessions.ts         ← CRUD endpoints
        ├── middleware/
        │   └── basicAuth.ts        ← username/password guard
        └── persistence/
            ├── redis.ts            ← session metadata ops
            └── mongodb.ts          ← snapshot save/load
```
