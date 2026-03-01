import { useState, useEffect, FormEvent, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listSessions, createSession, joinSession, Session } from '../api/sessions'

export function SessionsPage() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [newName, setNewName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!auth) return
    listSessions(auth.authHeader)
      .then(setSessions)
      .catch(() => setError('Failed to load sessions'))
  }, [auth])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!auth || !newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const s = await createSession(newName.trim(), auth.authHeader)
      navigate(`/canvas/${s.id}`)
    } catch {
      setError('Failed to create session')
      setCreating(false)
    }
  }

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault()
    if (!auth || !joinCode.trim()) return
    setJoining(true)
    setError('')
    try {
      const s = await joinSession(joinCode.trim(), auth.authHeader)
      navigate(`/canvas/${s.id}`)
    } catch {
      setError('Session not found — check the share code')
      setJoining(false)
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>My Sessions</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#555' }}>Hi, {auth?.username}</span>
          <button onClick={logout} style={smallBtnStyle}>Log out</button>
        </div>
      </div>

      {error && (
        <p style={{ color: '#c62828', fontSize: '13px', margin: '0 0 1rem' }}>{error}</p>
      )}

      {/* Create new session (task 5.2) */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Create a new session</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px' }}>
          <input
            placeholder="Session name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="submit" disabled={creating} style={primaryBtnStyle}>
            {creating ? 'Creating…' : '+ Create'}
          </button>
        </form>
      </div>

      {/* Join by code (task 5.3) */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Join by share code</h3>
        <form onSubmit={handleJoin} style={{ display: 'flex', gap: '8px' }}>
          <input
            placeholder="Enter code (e.g. ABC123)"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase' }}
          />
          <button type="submit" disabled={joining} style={secondaryBtnStyle}>
            {joining ? 'Joining…' : 'Join'}
          </button>
        </form>
      </div>

      {/* Session list (task 5.2) */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Your sessions</h3>
        {sessions.length === 0 ? (
          <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
            No sessions yet. Create one above.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.map(s => (
              <li
                key={s.id}
                onClick={() => navigate(`/canvas/${s.id}`)}
                style={sessionCardStyle}
              >
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{s.name}</div>
                <div style={{ fontSize: '12px', color: '#888', display: 'flex', gap: '12px', marginTop: '3px' }}>
                  <span>
                    Code:{' '}
                    <code style={{ background: '#f0f0f0', padding: '1px 5px', borderRadius: '3px', letterSpacing: '1px' }}>
                      {s.shareCode}
                    </code>
                  </span>
                  {s.createdAt && <span>{new Date(s.createdAt).toLocaleDateString()}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const sectionStyle: CSSProperties = {
  marginBottom: '1.75rem',
}

const sectionTitleStyle: CSSProperties = {
  margin: '0 0 0.75rem',
  fontSize: '13px',
  fontWeight: 600,
  color: '#444',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const inputStyle: CSSProperties = {
  padding: '8px 10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: 'sans-serif',
}

const primaryBtnStyle: CSSProperties = {
  padding: '8px 14px',
  background: '#1a73e8',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
  whiteSpace: 'nowrap',
  fontFamily: 'sans-serif',
}

const secondaryBtnStyle: CSSProperties = {
  ...primaryBtnStyle,
  background: '#fff',
  color: '#1a73e8',
  border: '1px solid #1a73e8',
}

const smallBtnStyle: CSSProperties = {
  padding: '5px 10px',
  background: 'transparent',
  color: '#555',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  fontFamily: 'sans-serif',
}

const sessionCardStyle: CSSProperties = {
  padding: '12px 14px',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  cursor: 'pointer',
  background: '#fff',
}
