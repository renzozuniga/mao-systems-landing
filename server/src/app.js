import 'dotenv/config'
import express    from 'express'
import cors       from 'cors'
import helmet     from 'helmet'
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
import contactRouter from './routes/contact.js'

const app  = express()
const PORT = process.env.PORT || 5000

// Render terminates TLS in front of the app; trust that one hop so req.ip is
// the caller rather than Render's proxy.
app.set('trust proxy', 1)

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
// A real visitor sends the stepper once; this caps scripted floods that would
// otherwise burn the Resend quota and fill the inbox.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.CONTACT_RATE_LIMIT) || 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  // api.maosystems.io sits behind Cloudflare, so the visitor's address is in
  // cf-connecting-ip; fall back to req.ip for direct and local requests.
  keyGenerator: (req) => req.get('cf-connecting-ip') || ipKeyGenerator(req.ip),
  message: { message: 'Recibimos varios envíos desde tu conexión. Inténtalo en una hora o escríbenos a maosystems.dev@gmail.com.' },
})

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'mao-systems-api' }))
app.use('/api/contact', contactLimiter, contactRouter)

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
