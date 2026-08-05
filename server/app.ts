/**
 * Express application — Neo-Browser API server.
 *
 * This module exports the configured Express app WITHOUT calling app.listen().
 * - For local dev: server/index.ts calls app.listen()
 * - For Vercel: api/index.ts exports this app as a serverless function
 */
import express from 'express'
import cors from 'cors'
import { generalRateLimit } from './lib/rateLimit'
import { logger } from './lib/logger'
import checkoutRouter from './routes/checkout'
import webhookRouter from './routes/webhook'
import licensesRouter from './routes/licenses'

const app = express()

// ─── CORS ─────────────────────────────────────────────────────────────────────

const allowedOrigins = [
  process.env.VITE_APP_URL,
  'http://localhost:5173', // Vite dev server
  'http://localhost:3001', // Express dev server
].filter(Boolean) as string[]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., desktop app, Postman, curl)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error(`CORS: Origin ${origin} not allowed.`))
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
)

// ─── Security headers ─────────────────────────────────────────────────────────

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Cache-Control', 'no-store')
  next()
})

// ─── Cashfree webhook route — MUST use raw body parser ───────────────────────
// This route is registered BEFORE express.json() to preserve the raw body
// bytes required for Cashfree webhook signature verification.
// Modifying the body in ANY way before verification will cause all webhooks to fail.

app.post(
  '/api/webhooks/cashfree',
  express.raw({ type: '*/*', limit: '1mb' }),
  webhookRouter
)

// ─── JSON body parser for all other routes ────────────────────────────────────

app.use(express.json({ limit: '100kb' }))

// ─── General rate limiting ────────────────────────────────────────────────────

app.use('/api', generalRateLimit)

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/checkout', checkoutRouter)
app.use('/api/webhooks/cashfree', webhookRouter)
app.use('/api/licenses', licensesRouter)

// ─── 404 handler ──────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Endpoint not found.' })
})

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled server error', { error: err.message, stack: err.stack })
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred.',
  })
})

export default app
