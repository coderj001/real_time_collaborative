import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User'

export async function basicAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="canvas"')
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const encoded = authHeader.slice('Basic '.length)
  const decoded = Buffer.from(encoded, 'base64').toString('utf8')
  const colonIdx = decoded.indexOf(':')
  const username = decoded.slice(0, colonIdx)
  const password = decoded.slice(colonIdx + 1)

  try {
    const user = await User.findOne({ username })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.setHeader('WWW-Authenticate', 'Basic realm="canvas"')
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    res.locals.username = username
    next()
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
