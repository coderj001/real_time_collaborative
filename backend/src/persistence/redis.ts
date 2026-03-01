import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = new Redis(REDIS_URL)

redis.on('connect', () => console.log('Redis connected'))
redis.on('error', (err) => console.error('Redis error:', err))

export async function markSessionActive(sessionId: string): Promise<void> {
  await redis.set(`session:${sessionId}:active`, '1', 'EX', 3600)
}

export async function addUserToSession(sessionId: string, username: string): Promise<void> {
  await redis.sadd(`session:${sessionId}:users`, username)
  await markSessionActive(sessionId)
}

export async function removeUserFromSession(sessionId: string, username: string): Promise<number> {
  await redis.srem(`session:${sessionId}:users`, username)
  const count = await redis.scard(`session:${sessionId}:users`)
  return count
}

export async function getSessionUserCount(sessionId: string): Promise<number> {
  return redis.scard(`session:${sessionId}:users`)
}
