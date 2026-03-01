import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User'

const router = Router()

// POST /auth/register — public, no auth required
router.post('/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' })
    return
  }

  const existing = await User.findOne({ username })
  if (existing) {
    res.status(409).json({ error: 'Username already taken' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await new User({ username, passwordHash }).save()
  res.status(201).json({ username })
})

export default router
