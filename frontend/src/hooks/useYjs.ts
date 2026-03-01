import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export function useYjs(sessionId: string, username: string) {
  const [doc] = useState(() => new Y.Doc())
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!sessionId) return

    const wsBase = (import.meta as any).env?.VITE_WS_URL ?? 'ws://localhost:4000'
    const p = new WebsocketProvider(`${wsBase}/yjs`, sessionId, doc, {
      params: { user: username },
    })

    setProvider(p)
    p.on('status', ({ status }: { status: string }) => {
      setConnected(status === 'connected')
    })

    return () => {
      p.destroy()
      setProvider(null)
      setConnected(false)
    }
  }, [doc, sessionId, username])

  return { doc, provider, connected }
}
