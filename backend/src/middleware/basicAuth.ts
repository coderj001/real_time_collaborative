import { Request, Response, NextFunction } from 'express'

// Prototype auth: supports two env var formats:
//   AUTH_USERNAME + AUTH_PASSWORD  (compose-friendly, single user)
//   AUTH_USERS=alice:secret,bob:hunter2  (multi-user)
function loadUsers(): Map<string, string> {
   const map = new Map<string, string>()
   const single = process.env.AUTH_USERNAME
   const singlePass = process.env.AUTH_PASSWORD
   if (single && singlePass) {
      map.set(single, singlePass)
   }
   const raw = process.env.AUTH_USERS
   if (raw) {
      for (const entry of raw.split(',')) {
         const [user, pass] = entry.trim().split(':')
         if (user && pass) map.set(user, pass)
      }
   }
   if (map.size === 0) map.set('admin', 'admin')
   return map
}

const users = loadUsers()

export function basicAuth(req: Request, res: Response, next: NextFunction): void {
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

   if (users.get(username) !== password) {
      res.setHeader('WWW-Authenticate', 'Basic realm="canvas"')
      res.status(401).json({ error: 'Unauthorized' })
      return
   }

   res.locals.username = username
   next()
}
