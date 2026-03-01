# Tasks: Real-Time Collaborative Canvas

## Phase 1 — Infra & Project Scaffolding
> Goal: Empty but runnable project with all services wired up via podman-compose.

- [x] 1.1 Create monorepo structure (frontend/, backend/, podman-compose.yml)
- [x] 1.2 Write podman-compose.yml with frontend, backend, redis, mongodb services
- [x] 1.3 Scaffold backend: Node.js + TypeScript + Express (package.json, tsconfig, Containerfile)
- [x] 1.4 Scaffold frontend: React + TypeScript + Vite (package.json, tsconfig, Containerfile)
- [x] 1.5 Add basic health-check endpoint (GET /health) to backend
- [x] 1.6 Verify all containers start and frontend can reach backend

---

## Phase 2 — Backend Core
> Goal: Sessions REST API + y-websocket server + basic auth + Redis + MongoDB connected.

- [x] 2.1 Connect Redis client (ioredis) and MongoDB client (mongoose)
- [x] 2.2 Define Session mongoose model
- [x] 2.3 Implement basic auth middleware
- [x] 2.4 Implement session routes: POST /sessions, POST /sessions/join, GET /sessions/:id, GET /sessions
- [x] 2.5 Set up y-websocket server on ws://backend/yjs/:sessionId
- [x] 2.6 Implement snapshot load-on-connect (load Y.Doc from MongoDB on first peer join)
- [x] 2.7 Implement periodic snapshot save (every 60s) and on-empty save

---

## Phase 3 — Frontend Canvas + yjs Binding
> Goal: Single user can draw and text on canvas; state persists in yjs Y.Doc.

- [x] 3.1 Install and configure yjs + y-websocket provider + fabric.js
- [x] 3.2 Create useYjs hook: initialize Y.Doc, connect WebSocket provider to backend
- [x] 3.3 Create Canvas component: initialize fabric.Canvas, wire draw mode (PencilBrush)
- [x] 3.4 Implement yjs ↔ fabric binding: object:added/modified → Y.Map, Y.Map observe → canvas
- [x] 3.5 Add isRemoteUpdate guard to prevent echo loops
- [x] 3.6 Create Toolbar component: toggle between Draw and Text modes
- [x] 3.7 Implement Text mode: fabric IText/Textbox, synced via Y.Map

---

## Phase 4 — Cursor Presence
> Goal: Multiple users see each other's cursors with name + color labels.

- [ ] 4.1 Create useAwareness hook: wrap yjs Awareness, expose local state setter + remote states
- [ ] 4.2 On canvas mousemove, update awareness cursor position
- [ ] 4.3 Assign each user a color from a fixed palette on session join
- [ ] 4.4 Create CursorLayer component: render remote cursors as SVG/HTML overlay
- [ ] 4.5 Show user name label next to each remote cursor
- [ ] 4.6 Remove cursor when user disconnects (awareness cleanup)

---

## Phase 5 — Session UI + Auth
> Goal: Full user-facing flow: login → create/join session → collaborate.

- [ ] 5.1 Create login screen with username/password form (sets Basic Auth header for all requests)
- [ ] 5.2 Create SessionList component: list user's sessions, create new session button
- [ ] 5.3 Create join-by-code UI (enter share code → redirect to canvas)
- [ ] 5.4 Show session share code on canvas page (for inviting others)
- [ ] 5.5 Show presence bar: avatar/name chips for all currently connected users
- [ ] 5.6 Wire React Router: / (login) → /sessions (list) → /canvas/:id (board)

---

## Phase 6 — Polish & Validation
> Goal: End-to-end verified, edge cases handled, ready to demo.

- [ ] 6.1 Test multi-user sync: open two browser tabs, verify real-time draw sync
- [ ] 6.2 Test cursor presence: verify cursors appear/disappear correctly
- [ ] 6.3 Test persistence: reload page, verify canvas state restored from MongoDB
- [ ] 6.4 Add .env.example files for both frontend and backend
- [ ] 6.5 Write README with setup instructions (podman-compose up, env vars, usage)
