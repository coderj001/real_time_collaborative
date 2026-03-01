import { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { SessionsPage } from './pages/SessionsPage'
import { CanvasPage } from './pages/CanvasPage'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/sessions"
        element={<ProtectedRoute><SessionsPage /></ProtectedRoute>}
      />
      <Route
        path="/canvas/:id"
        element={<ProtectedRoute><CanvasPage /></ProtectedRoute>}
      />
    </Routes>
  )
}
