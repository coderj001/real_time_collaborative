import { useState, FormEvent } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listSessions } from '../api/sessions'
import { register } from '../api/auth'
import { panel, btnPrimary, inputField, errorText, C, glowGreen, ANIM_SLIDE_IN } from '../styles/theme'

type Mode = 'login' | 'register'

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { auth, login } = useAuth()
  const navigate = useNavigate()

  // Already logged in — redirect
  if (auth) return <Navigate to="/sessions" replace />

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(username, password)
      }
      const authHeader = `Basic ${btoa(`${username}:${password}`)}`
      await listSessions(authHeader)
      login(username, password)
      navigate('/sessions')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (mode === 'register') {
        setError(msg || 'Registration failed')
      } else {
        setError('Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  const isRegister = mode === 'register'

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.black }}>
      <div style={{ ...panel, width: '340px', animation: ANIM_SLIDE_IN }}>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '12px', textShadow: glowGreen }}>
          COLLAB CANVAS
        </h2>
        <p style={{ margin: '0 0 1.5rem', fontSize: '7px', color: C.greenDim }}>
          {isRegister ? 'CHOOSE YOUR CALLSIGN' : 'INSERT COIN TO CONTINUE'}
        </p>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            placeholder="USERNAME"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            style={{ ...inputField, width: '100%', caretColor: C.green }}
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ ...inputField, width: '100%', caretColor: C.green }}
          />
          {error && <p style={errorText}>{error}</p>}
          <button type="submit" disabled={loading} className="retro-btn" style={{ ...btnPrimary, width: '100%', fontSize: '9px' }}>
            {loading
              ? (isRegister ? 'CREATING...' : 'LOADING...')
              : (isRegister ? 'INSERT COIN' : 'PRESS START')}
          </button>
        </form>
        <p style={{ margin: '16px 0 0', fontSize: '7px', color: C.greenDim, textAlign: 'center' }}>
          {isRegister ? (
            <>Already have an account?{' '}
              <span
                onClick={() => switchMode('login')}
                style={{ color: C.cyan, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign in
              </span>
            </>
          ) : (
            <>New here?{' '}
              <span
                onClick={() => switchMode('register')}
                style={{ color: C.cyan, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Create an account
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
