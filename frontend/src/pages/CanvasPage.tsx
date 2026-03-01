import { useState, useEffect, CSSProperties } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas } from '../components/Canvas'
import { CursorLayer } from '../components/CursorLayer'
import { Toolbar } from '../components/Toolbar'
import { useYjs } from '../hooks/useYjs'
import { useAwareness, RemoteUser } from '../hooks/useAwareness'
import { useAuth } from '../context/AuthContext'
import { getSession } from '../api/sessions'
import { userColor } from '../utils/colors'

export function CanvasPage() {
  const { id: sessionId = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { auth } = useAuth()

  const [mode, setMode] = useState<'draw' | 'text'>('draw')
  const [shareCode, setShareCode] = useState<string | null>(null)
  const [sessionName, setSessionName] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)

  const username = auth?.username ?? 'anonymous'
  const color = userColor(username)

  const { doc, provider, connected } = useYjs(sessionId, username)
  const { remoteStates, setLocalCursor } = useAwareness(provider, username, color)

  // Task 5.4: fetch share code + session name
  useEffect(() => {
    if (!auth || !sessionId) return
    getSession(sessionId, auth.authHeader)
      .then(s => {
        setShareCode(s.shareCode)
        setSessionName(s.name)
      })
      .catch(() => {})
  }, [sessionId, auth])

  const copyCode = () => {
    if (!shareCode) return
    navigator.clipboard.writeText(shareCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top bar: toolbar + share code + back button */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd', background: '#fafafa' }}>
        <Toolbar mode={mode} onModeChange={setMode} />
        <div style={{ flex: 1 }} />
        {/* Task 5.4: share code display */}
        {shareCode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 10px' }}>
            <span style={{ fontSize: '11px', color: '#777', fontFamily: 'sans-serif' }}>Share code:</span>
            <code style={{
              background: '#f0f0f0',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '2px',
            }}>
              {shareCode}
            </code>
            <button onClick={copyCode} style={topBtnStyle}>
              {codeCopied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        )}
        <button onClick={() => navigate('/sessions')} style={{ ...topBtnStyle, marginRight: '8px' }}>
          ← Sessions
        </button>
      </div>

      {/* Status bar: connection + session name + presence bar (task 5.5) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 10px',
        fontSize: '12px',
        background: '#fafafa',
        borderBottom: '1px solid #eee',
        gap: '8px',
        fontFamily: 'sans-serif',
      }}>
        <span style={{ color: connected ? '#2d7d32' : '#e65100' }}>
          {connected ? '● Connected' : '○ Connecting…'}
        </span>
        {sessionName && <span style={{ color: '#555' }}>· {sessionName}</span>}
        <div style={{ flex: 1 }} />
        {/* Task 5.5: presence bar */}
        <PresenceBar localUser={{ name: username, color }} remoteStates={remoteStates} />
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Canvas doc={doc} mode={mode} onCursorMove={setLocalCursor} />
        <CursorLayer remoteStates={remoteStates} />
      </div>
    </div>
  )
}

// Task 5.5: presence chips for all connected users
function PresenceBar({
  localUser,
  remoteStates,
}: {
  localUser: { name: string; color: string }
  remoteStates: Map<number, RemoteUser>
}) {
  const all = [
    { ...localUser, isLocal: true },
    ...Array.from(remoteStates.values()).map(s => ({ ...s.user, isLocal: false })),
  ]

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {all.map((u, i) => (
        <div
          key={i}
          title={u.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: u.color,
            color: '#fff',
            borderRadius: '12px',
            padding: '2px 8px 2px 3px',
            fontSize: '11px',
            fontWeight: 600,
            fontFamily: 'sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {u.name[0]?.toUpperCase()}
          </div>
          {u.name}
          {u.isLocal && <span style={{ opacity: 0.7, fontSize: '10px' }}>(you)</span>}
        </div>
      ))}
    </div>
  )
}

const topBtnStyle: CSSProperties = {
  padding: '3px 8px',
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '11px',
  fontFamily: 'sans-serif',
}
