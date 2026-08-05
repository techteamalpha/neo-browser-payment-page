/**
 * Rate limiting configuration.
 *
 * Uses express-rate-limit with an in-memory store.
 * NOTE: On stateless serverless platforms (Vercel), each function instance
 * has its own memory. Rate limits reset on cold starts and are not shared
 * across instances. For strict rate limiting in production, replace the
 * default store with a Redis-backed store (e.g., Upstash Redis via
 * rate-limit-redis). This implementation is suitable for initial deployment.
 */
import rateLimit from 'express-rate-limit'

/**
 * Checkout creation rate limit:
 * - 5 requests per IP per minute
 * - Prevents automated checkout spam
 */
export const checkoutRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many checkout attempts. Please wait a minute and try again.',
  },
  skip: () => process.env.NODE_ENV === 'test',
})

/**
 * License activation rate limit:
 * - 10 attempts per IP per 15 minutes
 * - Prevents brute-force activation code guessing
 */
export const activationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many activation attempts. Please wait and try again.',
  },
  skip: () => process.env.NODE_ENV === 'test',
})

/**
 * General API rate limit:
 * - 100 requests per IP per minute
 */
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many requests. Please slow down.',
  },
  skip: () => process.env.NODE_ENV === 'test',
})
