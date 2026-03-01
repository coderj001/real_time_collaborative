import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas } from '../components/Canvas'
import { CursorLayer } from '../components/CursorLayer'
import { Toolbar } from '../components/Toolbar'
import { useYjs } from '../hooks/useYjs'
import { useAwareness, RemoteUser } from '../hooks/useAwareness'
import { useAuth } from '../context/AuthContext'
import { getSession } from '../api/sessions'
import { userColor } from '../utils/colors'
import { hudBar, btnSmall, shareCodeBox, presenceChip, C, glowGreen, ANIM_BLINK } from '../styles/theme'

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: C.black }}>
      {/* Top bar: toolbar + share code + back button */}
      <div style={{ ...hudBar, justifyContent: 'space-between' }}>
        <Toolbar mode={mode} onModeChange={setMode} />
        <div style={{ flex: 1 }} />
        {shareCode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '7px', color: C.greenDim }}>SHARE CODE:</span>
            <code style={shareCodeBox}>{shareCode}</code>
            <button onClick={copyCode} className="retro-btn" style={btnSmall}>
              {codeCopied ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        )}
        <button onClick={() => navigate('/sessions')} className="retro-btn" style={btnSmall}>
          {'< SESSIONS'}
        </button>
      </div>

      {/* Status bar */}
      <div style={{
        ...hudBar,
        borderTop: 'none',
        borderBottom: `1px solid ${C.borderDim}`,
        fontSize: '8px',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={connected
            ? { color: C.green, textShadow: glowGreen }
            : { color: C.amber, animation: ANIM_BLINK }
          }>
            {connected ? '● ONLINE' : '○ SYNC...'}
          </span>
          {sessionName && <span style={{ color: C.greenDim }}>· {sessionName}</span>}
        </div>
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
          style={{ ...presenceChip, borderColor: u.color }}
        >
          <div style={{
            width: '14px',
            height: '14px',
            background: u.color,
            color: C.black,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '7px',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {u.name[0]?.toUpperCase()}
          </div>
          <span style={{ color: u.color }}>{u.name}</span>
          {u.isLocal && <span style={{ color: C.greenDim, fontSize: '7px', animation: ANIM_BLINK }}>(you)</span>}
        </div>
      ))}
    </div>
  )
}
