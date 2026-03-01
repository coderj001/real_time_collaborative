# Real-Time Collaborative Canvas

A real-time collaborative whiteboard where multiple users can draw and type on a shared canvas simultaneously. Changes sync instantly across all connected clients using **yjs** CRDTs over WebSocket.

## Features

- **Real-time sync** — draw and type; all peers see changes instantly
- **Cursor presence** — see other users' cursors with name labels
- **Persistent sessions** — canvas state saved to MongoDB; restored on reconnect
- **Session sharing** — invite others via a 6-character share code
- **Auth** — HTTP Basic Auth guards all REST endpoints

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Canvas | fabric.js v5 |
| Real-time | yjs (CRDT), y-websocket |
| Routing | react-router-dom v6 |
| Backend | Node.js, Express, TypeScript |
| Persistence | MongoDB (snapshots), Redis (active sessions) |
| Infrastructure | podman-compose |

## Quick Start

### Prerequisites

- [Podman](https://podman.io/) + [podman-compose](https://github.com/containers/podman-compose)
- Or Docker + docker-compose (drop-in compatible)

### 1. Clone and configure

```bash
git clone <repo-url>
cd real_time_collaborative
```

Copy and edit the env files (optional — defaults work out of the box):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Start all services

```bash
podman-compose up --build
```

This starts:
- **Frontend** at http://localhost:3000
- **Backend** at http://localhost:4000
- **MongoDB** at localhost:27017
- **Redis** at localhost:6379

### 3. Open the app

Navigate to **http://localhost:3000** and sign in with the default credentials:

| Username | Password |
|---|---|
| `admin` | `password` |

## Usage

1. **Sign in** with your username and password
2. **Create a session** — give it a name; you're taken straight to the canvas
3. **Invite others** — share the 6-character code shown in the top bar
4. **Join a session** — enter a share code on the sessions page
5. **Draw** — use the Draw tool (pencil) or Text tool (click to place text)
6. **Collaborate** — open the same session in another tab or browser to see real-time sync

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | HTTP + WebSocket server port |
| `MONGODB_URL` | `mongodb://localhost:27017/realtime-canvas` | MongoDB connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `AUTH_USERNAME` | `admin` | Single-user auth username |
| `AUTH_PASSWORD` | `password` | Single-user auth password |
| `AUTH_USERS` | — | Multi-user auth: `user1:pass1,user2:pass2` |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | Backend REST API base URL |
| `VITE_WS_URL` | `ws://localhost:4000` | Backend WebSocket base URL |
| `VITE_BACKEND_URL` | `http://localhost:4000` | Backend URL for Vite dev proxy |

## Project Structure

```
real_time_collaborative/
├── podman-compose.yml
├── frontend/
│   ├── Containerfile
│   ├── .env.example
│   └── src/
│       ├── api/sessions.ts         # REST client
│       ├── context/AuthContext.tsx # Auth state + localStorage
│       ├── pages/
│       │   ├── LoginPage.tsx       # Sign-in screen
│       │   ├── SessionsPage.tsx    # Create / join / list sessions
│       │   └── CanvasPage.tsx      # Canvas + presence + share code
│       ├── components/
│       │   ├── Canvas.tsx          # fabric.js + yjs binding
│       │   ├── CursorLayer.tsx     # Remote cursor overlay
│       │   └── Toolbar.tsx         # Draw / text mode switch
│       └── hooks/
│           ├── useYjs.ts           # Y.Doc + WebSocket provider
│           └── useAwareness.ts     # Cursor presence (yjs Awareness)
└── backend/
    ├── Containerfile
    ├── .env.example
    └── src/
        ├── server.ts               # Express + y-websocket setup
        ├── routes/sessions.ts      # REST CRUD endpoints
        ├── middleware/basicAuth.ts # Auth guard
        └── persistence/
            ├── mongodb.ts          # Snapshot save/load
            └── redis.ts            # Active session tracking
```

## API Reference

All endpoints require HTTP Basic Auth.

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/sessions` | `{ name }` | Create a session → `{ id, shareCode }` |
| `POST` | `/sessions/join` | `{ code }` | Join by share code → `{ id }` |
| `GET` | `/sessions` | — | List your sessions |
| `GET` | `/sessions/:id` | — | Get session metadata |
| `GET` | `/health` | — | Health check (no auth) |

**WebSocket:** `ws://backend/yjs/:sessionId` — yjs sync channel (no auth required)

## Stopping

```bash
podman-compose down
```

To also remove the MongoDB volume (clears all session data):

```bash
podman-compose down -v
```
