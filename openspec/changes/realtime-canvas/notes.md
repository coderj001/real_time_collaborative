# Architecture Notes: Real-Time Collaborative Canvas

## yjs Sync: Client-Server, Not P2P

The current implementation uses a **centralized client-server** architecture via `y-websocket`. It is **not peer-to-peer**.

### How it works

```
Client A ──┐
Client B ──┼──→ y-websocket server (backend) ──→ MongoDB (snapshots)
Client C ──┘
```

All clients connect to the central backend WebSocket server (`ws://backend/yjs/:sessionId`). The server:
- Relays yjs updates between all connected peers
- Loads snapshots from MongoDB on first peer join (`bindState`)
- Saves snapshots to MongoDB periodically (every 60s) and on last peer disconnect (`writeState`)

### Why not P2P (y-webrtc)?

yjs supports a `y-webrtc` provider for true P2P sync:

```
Client A ──────── signaling server ──────── Client B
         └──────── direct WebRTC data channel ──────┘
```

With `y-webrtc`, clients negotiate a direct connection via a signaling server and sync updates peer-to-peer without a relay.

### Trade-offs

| | Current (y-websocket) | P2P (y-webrtc) |
|---|---|---|
| Server dependency | Required for relay | Only signaling needed |
| Persistence | Server-side (MongoDB) | Client must handle |
| Reliability | Stable, server controls | NAT traversal can fail |
| Scalability | Server is bottleneck | Scales without relay |
| Auth/access control | Easy (server enforces) | Hard to enforce |

### Why centralized is the right choice here

This app requires:
- **Auth** — server enforces Basic Auth before accepting WS connections
- **Session validation** — server checks session exists in MongoDB before allowing join
- **Server-side persistence** — snapshots saved to MongoDB via `setPersistence`

These concerns are much harder (or impossible) to implement cleanly in a P2P model. The centralized `y-websocket` approach is appropriate for this use case.
