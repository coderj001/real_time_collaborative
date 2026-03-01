import type { WebSocket } from 'ws'
import type * as Y from 'yjs'

// Shared in-memory map of active Yjs sessions.
// Extracted to avoid circular dependency between server.ts and routes/sessions.ts.
export const activeSessions = new Map<string, { peers: Set<WebSocket>; ydoc: Y.Doc | null }>()
