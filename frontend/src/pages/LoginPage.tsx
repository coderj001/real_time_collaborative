import { useState, FormEvent, CSSProperties } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listSessions } from '../api/sessions'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { auth, login } = useAuth()
  const navigate = useNavigate()

  // Already logged in — redirect
  if (auth) return <Navigate to="/sessions" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const authHeader = `Basic ${btoa(`${username}:${password}`)}`
    try {
      await listSessions(authHeader)
      login(username, password)
      navigate('/sessions')
    } catch {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 0.25rem', fontFamily: 'sans-serif', fontSize: '20px' }}>
          Collaborative Canvas
        </h2>
        <p style={{ margin: '0 0 1.5rem', fontSize: '13px', color: '#777', fontFamily: 'sans-serif' }}>
          Sign in to create or join a session
        </p>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && <p style={{ color: '#c62828', fontSize: '13px', margin: 0, fontFamily: 'sans-serif' }}>{error}</p>}
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

const pageStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: '#f5f5f5',
}

const cardStyle: CSSProperties = {
  background: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  width: '320px',
}

const inputStyle: CSSProperties = {
  padding: '8px 10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: 'sans-serif',
}

const btnStyle: CSSProperties = {
  padding: '9px',
  background: '#1a73e8',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'sans-serif',
}
