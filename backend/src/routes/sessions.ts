import { Router } from 'express'
import { nanoid } from 'nanoid'
import { randomUUID } from 'crypto'
import { Session } from '../models/Session'
import { basicAuth } from '../middleware/basicAuth'

const router = Router()

router.use(basicAuth)

// POST /sessions — create a new session
router.post('/', async (req, res) => {
  const { name } = req.body
  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }
  const session = new Session({
    _id: randomUUID(),
    name,
    shareCode: nanoid(6).toUpperCase(),
    createdBy: res.locals.username,
    snapshot: { objects: [] },
    lastSavedAt: new Date(),
  })
  await session.save()
  res.status(201).json({ id: session._id, shareCode: session.shareCode })
})

// POST /sessions/join — join by share code
router.post('/join', async (req, res) => {
  const { code } = req.body
  if (!code) {
    res.status(400).json({ error: 'code is required' })
    return
  }
  const session = await Session.findOne({ shareCode: code.toUpperCase() })
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  res.json({ id: session._id })
})

// GET /sessions/:id — get session metadata + snapshot
router.get('/:id', async (req, res) => {
  const session = await Session.findById(req.params.id)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  res.json({
    id: session._id,
    name: session.name,
    shareCode: session.shareCode,
    createdBy: session.createdBy,
    createdAt: session.createdAt,
    snapshot: session.snapshot,
    lastSavedAt: session.lastSavedAt,
  })
})

// GET /sessions — list sessions created by this user
router.get('/', async (req, res) => {
  const sessions = await Session.find(
    { createdBy: res.locals.username },
    { snapshot: 0 }
  ).sort({ createdAt: -1 })
  res.json(
    sessions.map((s) => ({
      id: s._id,
      name: s.name,
      shareCode: s.shareCode,
      createdAt: s.createdAt,
    }))
  )
})

export default router
