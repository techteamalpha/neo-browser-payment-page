/**
 * Local development server entry point.
 * Starts the Express app listening on PORT (default: 3001).
 * This file is NOT used by Vercel — see api/index.ts for the serverless entry.
 *
 * NOTE: dotenv is loaded via the --env-file flag in package.json scripts,
 * OR via the tsx --require preload. Do NOT rely on import order here.
 */
import * as dotenv from 'dotenv'
// Load before anything else — dotenv.config is synchronous and safe here
// because tsx evaluates top-level code before module body.
// If env vars are missing, the lazy supabase/cashfree clients will throw
// with a clear message when first used (not at import time).
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

import app from './app'


const PORT = parseInt(process.env.PORT ?? '3001', 10)

app.listen(PORT, () => {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'info',
    message: `Neo-Browser API server running`,
    port: PORT,
    env: process.env.CASHFREE_ENVIRONMENT ?? 'sandbox',
  }))
})
