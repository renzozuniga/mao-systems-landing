import 'dotenv/config'
import express    from 'express'
import cors       from 'cors'
import helmet     from 'helmet'
import contactRouter from './routes/contact.js'

const app  = express()
const PORT = process.env.PORT || 5000

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  'https://maosystems.io',
  'https://www.maosystems.io',
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, Render health checks, server-to-server)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  methods: ['GET', 'POST'],
  credentials: false,
}))

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '16kb' }))

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'mao-systems-api' }))
app.use('/api/contact', contactRouter)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }))

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message)
  res.status(500).json({ message: 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🟢  MAO Systems API running on port ${PORT}`)
  console.log(`    Environment : ${process.env.NODE_ENV || 'development'}`)
  console.log(`    Health check: http://localhost:${PORT}/health\n`)
})
