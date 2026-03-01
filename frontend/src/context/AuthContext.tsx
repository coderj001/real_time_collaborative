import { createContext, useContext, useState, ReactNode } from 'react'

export interface Auth {
  username: string
  authHeader: string
}

interface AuthContextValue {
  auth: Auth | null
  login: (username: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'canvas_auth'

function load(): Auth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(load)

  const login = (username: string, password: string) => {
    const authHeader = `Basic ${btoa(`${username}:${password}`)}`
    const a: Auth = { username, authHeader }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a))
    setAuth(a)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
