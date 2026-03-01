import { useState, useEffect, FormEvent, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listSessions, createSession, joinSession, deleteSession, renameSession, Session } from '../api/sessions'
import { panel, sectionLabel, btnPrimary, btnSecondary, btnSmall, inputField, shareCodeBox, errorText, hudBar, C, glowGreen } from '../styles/theme'

export function SessionsPage() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [newName, setNewName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)

  // Per-card state: confirmingDelete (id), renaming (id), renameValue, cardError (id → msg)
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [cardError, setCardError] = useState<Record<string, string>>({})

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

  const handleDelete = async (id: string) => {
    if (!auth) return
    try {
      await deleteSession(id, auth.authHeader)
      setSessions(prev => prev.filter(s => s.id !== id))
      setConfirmingDelete(null)
    } catch (err: unknown) {
      const status = err instanceof Error ? err.message : ''
      setCardError(prev => ({
        ...prev,
        [id]: status === '403' ? 'NOT YOUR SESSION' : 'DELETE FAILED',
      }))
      setConfirmingDelete(null)
    }
  }

  const startRename = (s: Session, e: React.MouseEvent) => {
    e.stopPropagation()
    setRenamingId(s.id)
    setRenameValue(s.name)
    setCardError(prev => ({ ...prev, [s.id]: '' }))
  }

  const commitRename = async (id: string) => {
    if (!auth || !renameValue.trim()) {
      setRenamingId(null)
      return
    }
    try {
      const updated = await renameSession(id, renameValue.trim(), auth.authHeader)
      setSessions(prev => prev.map(s => s.id === id ? { ...s, name: updated.name } : s))
    } catch (err: unknown) {
      const status = err instanceof Error ? err.message : ''
      setCardError(prev => ({
        ...prev,
        [id]: status === '403' ? 'NOT YOUR SESSION' : 'RENAME FAILED',
      }))
    } finally {
      setRenamingId(null)
    }
  }

  const onRenameKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') { e.preventDefault(); commitRename(id) }
    if (e.key === 'Escape') { setRenamingId(null) }
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ ...hudBar, justifyContent: 'space-between', marginBottom: '28px', border: `2px solid ${C.green}` }}>
        <h2 style={{ margin: 0, fontSize: '14px', textShadow: glowGreen }}>SESSIONS</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '7px', color: C.greenDim }}>Hi, {auth?.username}</span>
          <button onClick={logout} className="retro-btn" style={btnSmall}>LOG OUT</button>
        </div>
      </div>

      {error && <p style={{ ...errorText, marginBottom: '16px' }}>{error}</p>}

      {/* Create new session */}
      <div style={{ ...panel, marginBottom: '24px' }}>
        <h3 style={sectionLabel}>Create a new session</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px' }}>
          <input
            placeholder="SESSION NAME..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{ ...inputField, flex: 1 }}
          />
          <button type="submit" disabled={creating} className="retro-btn" style={btnPrimary}>
            {creating ? 'CREATING...' : '+ NEW GAME'}
          </button>
        </form>
      </div>

      {/* Join by code */}
      <div style={{ ...panel, marginBottom: '24px' }}>
        <h3 style={sectionLabel}>Join by share code</h3>
        <form onSubmit={handleJoin} style={{ display: 'flex', gap: '8px' }}>
          <input
            placeholder="ENTER CODE (EG. ABC123)"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            style={{ ...inputField, flex: 1, letterSpacing: '2px', textTransform: 'uppercase' }}
          />
          <button type="submit" disabled={joining} className="retro-btn" style={btnSecondary}>
            {joining ? 'JOINING...' : 'JOIN'}
          </button>
        </form>
      </div>

      {/* Session list */}
      <div style={{ ...panel, marginBottom: '24px' }}>
        <h3 style={sectionLabel}>Your sessions</h3>
        {sessions.length === 0 ? (
          <p style={{ ...errorText, color: C.green }}>NO SESSIONS FOUND.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.map(s => (
              <li
                key={s.id}
                onClick={() => renamingId !== s.id && navigate(`/canvas/${s.id}`)}
                className="session-card"
                style={{
                  background: C.black,
                  border: `2px solid ${C.borderDim}`,
                  padding: '14px 16px',
                  cursor: renamingId === s.id ? 'default' : 'pointer',
                }}
              >
                {/* Name row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {renamingId === s.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => commitRename(s.id)}
                      onKeyDown={e => onRenameKeyDown(e, s.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ ...inputField, flex: 1, fontSize: '10px', fontWeight: 700, padding: '3px 6px' }}
                    />
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: '10px', flex: 1 }}>{s.name}</span>
                  )}

                  {/* Rename button */}
                  {renamingId !== s.id && (
                    <button
                      onClick={e => startRename(s, e)}
                      className="retro-btn"
                      style={{ ...btnSmall, fontSize: '7px' }}
                    >
                      REN
                    </button>
                  )}

                  {/* Delete / confirm buttons */}
                  {confirmingDelete === s.id ? (
                    <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="retro-btn"
                        style={{ ...btnSmall, color: C.red, borderColor: C.red, fontSize: '7px' }}
                      >
                        YES
                      </button>
                      <button
                        onClick={() => setConfirmingDelete(null)}
                        className="retro-btn"
                        style={{ ...btnSmall, fontSize: '7px' }}
                      >
                        NO
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmingDelete(s.id) }}
                      className="retro-btn"
                      style={{ ...btnSmall, color: C.red, borderColor: C.red, fontSize: '7px' }}
                    >
                      {confirmingDelete === s.id ? 'SURE?' : 'DEL'}
                    </button>
                  )}
                </div>

                {/* Code + date row */}
                <div style={{ fontSize: '8px', color: C.greenDim, display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ color: C.greenDim }}>CODE:</span>
                  <code style={shareCodeBox}>{s.shareCode}</code>
                  {s.createdAt && <span>{new Date(s.createdAt).toLocaleDateString()}</span>}
                </div>

                {/* Per-card error */}
                {cardError[s.id] && (
                  <p style={{ ...errorText, marginTop: '6px' }}>{cardError[s.id]}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
