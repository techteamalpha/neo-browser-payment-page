/**
 * Vercel serverless function entry point.
 *
 * Vercel's Node.js runtime treats a default-exported Express app as a
 * request handler for serverless functions. All /api/* routes are
 * rewired here via vercel.json.
 *
 * The webhook route uses express.raw() (registered in server/app.ts before
 * express.json()) so the raw body is preserved for Cashfree signature verification.
 */
import app from '../server/app.js'

export default app
