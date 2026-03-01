import { useState } from 'react'
import { Canvas } from './components/Canvas'
import { CursorLayer } from './components/CursorLayer'
import { Toolbar } from './components/Toolbar'
import { useYjs } from './hooks/useYjs'
import { useAwareness } from './hooks/useAwareness'
import { userColor } from './utils/colors'

export default function App() {
  const [mode, setMode] = useState<'draw' | 'text'>('draw')

  // Phase 3/4 testing: read session/user from URL query params
  // Phase 5 will replace this with React Router
  const params = new URLSearchParams(window.location.search)
  const sessionId = params.get('session') ?? ''
  const username = params.get('user') ?? 'anonymous'
  const color = userColor(username)

  const { doc, provider, connected } = useYjs(sessionId, username)
  const { remoteStates, setLocalCursor } = useAwareness(provider, username, color)

  if (!sessionId) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h2>Collaborative Canvas</h2>
        <p>
          Open a session by adding query params to the URL:
          <br />
          <code>?session=&lt;session-id&gt;&amp;user=&lt;your-name&gt;</code>
        </p>
        <p style={{ color: '#888', fontSize: '14px' }}>
          Create a session first via <code>POST /sessions</code>, then use the returned ID here.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Toolbar mode={mode} onModeChange={setMode} />
      <div style={{ padding: '2px 10px', fontSize: '12px', color: connected ? '#2d7d32' : '#e65100', background: '#fafafa', borderBottom: '1px solid #eee' }}>
        {connected ? '● Connected' : '○ Connecting…'} · session: {sessionId} · user: {username}
      </div>
      {/* position:relative so CursorLayer can be absolute-positioned on top */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Canvas doc={doc} mode={mode} onCursorMove={setLocalCursor} />
        <CursorLayer remoteStates={remoteStates} />
      </div>
    </div>
  )
}
