import express from 'express'
import cors from 'cors'
import http from 'http'

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})

export { server }
