import { useCallback, useEffect, useRef, useState } from 'react'
import { WebsocketProvider } from 'y-websocket'

export interface RemoteUser {
  user: { name: string; color: string }
  cursor: { x: number; y: number } | null
}

export function useAwareness(
  provider: WebsocketProvider | null,
  username: string,
  color: string
) {
  const [remoteStates, setRemoteStates] = useState<Map<number, RemoteUser>>(new Map())
  // Stable ref so setLocalCursor doesn't need to be recreated when provider changes
  const providerRef = useRef(provider)
  providerRef.current = provider

  useEffect(() => {
    if (!provider) return

    const awareness = provider.awareness

    // Set our local identity (task 4.3 — color assigned by caller)
    awareness.setLocalState({ user: { name: username, color }, cursor: null })

    const onChange = () => {
      const next = new Map<number, RemoteUser>()
      awareness.getStates().forEach((state: any, clientId: number) => {
        if (clientId === awareness.clientID) return // skip self
        if (state?.user) next.set(clientId, state as RemoteUser)
      })
      setRemoteStates(new Map(next))
    }

    awareness.on('change', onChange)

    return () => {
      // Task 4.6: clear local state on disconnect — peers remove our cursor
      awareness.setLocalState(null)
      awareness.off('change', onChange)
    }
  }, [provider, username, color])

  // Stable callback — safe to pass as prop without triggering canvas re-renders
  const setLocalCursor = useCallback((cursor: { x: number; y: number } | null) => {
    const awareness = providerRef.current?.awareness
    if (!awareness) return
    const current = awareness.getLocalState() ?? {}
    awareness.setLocalState({ ...current, cursor })
  }, [])

  return { remoteStates, setLocalCursor }
}
