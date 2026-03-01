import { useState } from 'react'
import { Canvas } from './components/Canvas'
import { Toolbar } from './components/Toolbar'
import { useYjs } from './hooks/useYjs'

export default function App() {
  const [mode, setMode] = useState<'draw' | 'text'>('draw')

  // Phase 3 testing: read session/user from URL query params
  // e.g. http://localhost:3000?session=<id>&user=alice
  // Phase 5 will replace this with React Router
  const params = new URLSearchParams(window.location.search)
  const sessionId = params.get('session') ?? ''
  const username = params.get('user') ?? 'anonymous'

  const { doc, connected } = useYjs(sessionId, username)

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
      <Canvas doc={doc} mode={mode} />
    </div>
  )
}
