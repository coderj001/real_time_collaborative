const API_BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:4000'

export interface Session {
  id: string
  name: string
  shareCode: string
  createdAt?: string
}

function hdrs(authHeader: string) {
  return { 'Content-Type': 'application/json', Authorization: authHeader }
}

async function req<T>(url: string, opts: RequestInit): Promise<T> {
  const res = await fetch(url, opts)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export const listSessions = (authHeader: string) =>
  req<Session[]>(`${API_BASE}/sessions`, { headers: hdrs(authHeader) })

export const createSession = (name: string, authHeader: string) =>
  req<{ id: string; shareCode: string }>(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: hdrs(authHeader),
    body: JSON.stringify({ name }),
  })

export const joinSession = (code: string, authHeader: string) =>
  req<{ id: string }>(`${API_BASE}/sessions/join`, {
    method: 'POST',
    headers: hdrs(authHeader),
    body: JSON.stringify({ code }),
  })

export const getSession = (id: string, authHeader: string) =>
  req<Session>(`${API_BASE}/sessions/${id}`, { headers: hdrs(authHeader) })

export const deleteSession = (id: string, authHeader: string) =>
  fetch(`${API_BASE}/sessions/${id}`, { method: 'DELETE', headers: hdrs(authHeader) })
    .then(res => { if (!res.ok) throw new Error(`${res.status}`) })

export const renameSession = (id: string, name: string, authHeader: string) =>
  req<Session>(`${API_BASE}/sessions/${id}`, {
    method: 'PATCH',
    headers: hdrs(authHeader),
    body: JSON.stringify({ name }),
  })
