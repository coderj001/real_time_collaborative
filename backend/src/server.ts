import express from 'express'
import cors from 'cors'
import http from 'http'
import * as Y from 'yjs'
import { WebSocketServer, WebSocket } from 'ws'
// y-websocket v2 server utilities
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { setupWSConnection, setPersistence, setContentInitializor } = require('y-websocket/bin/utils')
import { connectMongo } from './persistence/mongodb'
import { redis, addUserToSession, removeUserFromSession } from './persistence/redis'
import { Session } from './models/Session'
import sessionRoutes from './routes/sessions'

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/sessions', sessionRoutes)

// --- y-websocket persistence ---
// bindState: load snapshot from MongoDB into Y.Doc on first peer join
// writeState: save Y.Doc snapshot to MongoDB (called by y-websocket on last peer leave)

setPersistence({
  bindState: async (docName: string, ydoc: Y.Doc) => {
    const session = await Session.findById(docName)
    if (!session?.snapshot?.objects?.length) return

    const objectsMap = ydoc.getMap<unknown>('objects')
    Y.transact(ydoc, () => {
      for (const obj of session.snapshot.objects as Array<Record<string, unknown>>) {
        if (obj.id) objectsMap.set(obj.id as string, obj)
      }
    })
    console.log(`Loaded snapshot for session ${docName} (${session.snapshot.objects.length} objects)`)
  },

  writeState: async (docName: string, ydoc: Y.Doc) => {
    const objectsMap = ydoc.getMap<unknown>('objects')
    const objects = Array.from(objectsMap.values())
    const result = await Session.findByIdAndUpdate(
      docName,
      { snapshot: { objects }, lastSavedAt: new Date() },
      { new: true }
    )
    if (!result) {
      console.warn(`writeState: session ${docName} not found, snapshot not saved`)
      return
    }
    console.log(`Saved snapshot for session ${docName} (${objects.length} objects)`)
  },
})

// --- Periodic snapshot save every 60s ---
// Track active sessions + their docs for periodic saving
const activeSessions = new Map<string, { peers: Set<WebSocket>; ydoc: Y.Doc | null }>()

setInterval(async () => {
  for (const [sessionId, { peers, ydoc }] of activeSessions.entries()) {
    if (peers.size > 0 && ydoc) {
      const objectsMap = ydoc.getMap<unknown>('objects')
      const objects = Array.from(objectsMap.values())
      await Session.findByIdAndUpdate(sessionId, {
        snapshot: { objects },
        lastSavedAt: new Date(),
      }).catch((err: Error) => console.error(`Periodic save failed for ${sessionId}:`, err))
    }
  }
}, 60_000)

// --- y-websocket WebSocket server ---
const wss = new WebSocketServer({ noServer: true })

wss.on('connection', async (ws: WebSocket, req: http.IncomingMessage) => {
  const match = req.url?.match(/^\/yjs\/([^/?]+)/)
  if (!match) {
    ws.close()
    return
  }
  const sessionId = match[1]

  // Reject connections for sessions that don't exist in MongoDB
  const sessionExists = await Session.exists({ _id: sessionId })
  if (!sessionExists) {
    console.warn(`WS rejected: session ${sessionId} not found in DB`)
    ws.close(1008, 'Session not found')
    return
  }

  if (!activeSessions.has(sessionId)) {
    activeSessions.set(sessionId, { peers: new Set(), ydoc: null })
  }
  const entry = activeSessions.get(sessionId)!
  entry.peers.add(ws)

  // Use query param or header for username (no WS auth in prototype)
  const url = new URL(req.url ?? '/', `http://localhost`)
  const username = url.searchParams.get('user') ?? 'anonymous'
  await addUserToSession(sessionId, username)

  ws.on('close', async () => {
    entry.peers.delete(ws)
    const remaining = await removeUserFromSession(sessionId, username)
    if (remaining === 0) {
      activeSessions.delete(sessionId)
      await redis.del(`session:${sessionId}:users`)
    }
  })

  // setupWSConnection handles y-protocol, awareness, and persistence hooks
  setupWSConnection(ws, req, { docName: sessionId, gc: true })

  // Capture ydoc reference after setup (y-websocket stores it internally)
  // We grab it on next tick after setupWSConnection initialises it
  setImmediate(() => {
    // y-websocket v2 exposes docs map; access defensively
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { docs } = require('y-websocket/bin/utils')
      entry.ydoc = docs.get(sessionId) ?? null
    } catch {
      // ignore if internal API unavailable
    }
  })
})

server.on('upgrade', (req, socket, head) => {
  const url = req.url ?? ''
  if (url.startsWith('/yjs/')) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req)
    })
  } else {
    socket.destroy()
  }
})

const PORT = process.env.PORT || 4000

connectMongo().then(() => {
  server.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`)
  })
})

export { server }
