/**
 * License utilities — SERVER ONLY.
 *
 * Handles:
 * - Cryptographically secure activation code generation (128+ bits entropy)
 * - HMAC-SHA256 hashing and timing-safe verification
 * - JWT device license token issuance and verification
 *
 * Raw activation codes are NEVER stored anywhere — only the HMAC hash.
 * The raw code is sent once via email and not recoverable from the database.
 */
import { createHmac, createHash, timingSafeEqual, randomBytes } from 'crypto'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { logger } from './logger.js'

// ─── Activation code generation ───────────────────────────────────────────────

// 32-character alphabet excluding ambiguous chars: O/0, I/1, L
const CODE_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // 31 chars
// Each char = log2(31) ≈ 4.95 bits. 26 chars ≈ 128.7 bits > 128-bit requirement.
const CODE_LENGTH = 26

/**
 * Generates a cryptographically random activation code with 128+ bits of entropy.
 * Uses rejection sampling to ensure uniform distribution.
 * Format: NEO-XXXXXX-XXXXXX-XXXXXX-XXXXXX (26 random chars in 4 groups of 6, plus NEO- prefix)
 */
export function generateActivationCode(): string {
  const chars: string[] = []
  // Generate extra bytes to account for rejection sampling
  // Charset length = 31. Rejection threshold = floor(256 / 31) * 31 = 248.
  // Acceptance rate = 248/256 ≈ 96.9%. For 26 chars, need ~27 bytes on average.
  // Generate 64 bytes for a comfortable buffer.
  let buf = randomBytes(64)
  let bufIdx = 0

  while (chars.length < CODE_LENGTH) {
    // Refill buffer if exhausted (very unlikely)
    if (bufIdx >= buf.length) {
      buf = randomBytes(64)
      bufIdx = 0
    }
    const byte = buf[bufIdx++]
    // Rejection sampling: discard values >= 248 to avoid modulo bias
    const threshold = Math.floor(256 / CODE_CHARSET.length) * CODE_CHARSET.length // 248
    if (byte >= threshold) continue
    chars.push(CODE_CHARSET[byte % CODE_CHARSET.length])
  }

  // Format: NEO-XXXXXX-XXXXXX-XXXXXX-XXXXXX
  const c = chars.join('')
  return `NEO-${c.slice(0, 6)}-${c.slice(6, 12)}-${c.slice(12, 18)}-${c.slice(18, 26)}`
}

/**
 * Normalize activation code input before hashing or comparing.
 * Strips whitespace, converts to uppercase, removes dashes.
 */
export function normalizeActivationCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[-\s]/g, '')
}

/**
 * Returns the last 4 characters of the normalized code for support display.
 * Only the last 4 chars are stored in plaintext for support lookups.
 */
export function getCodeLast4(normalizedCode: string): string {
  return normalizedCode.slice(-4)
}

/**
 * HMAC-SHA256 hash of the normalized activation code.
 * Uses ACTIVATION_CODE_SECRET as the key.
 * The raw code is not recoverable from this hash.
 */
export function hashActivationCode(normalizedCode: string): string {
  const secret = process.env.ACTIVATION_CODE_SECRET
  if (!secret) throw new Error('Missing ACTIVATION_CODE_SECRET environment variable.')
  return createHmac('sha256', secret).update(normalizedCode).digest('hex')
}

/**
 * Timing-safe comparison of a submitted activation code against a stored hash.
 * Returns true only if the hashes match.
 */
export function verifyActivationCode(submittedCode: string, storedHash: string): boolean {
  try {
    const normalizedInput = normalizeActivationCode(submittedCode)
    const inputHash = hashActivationCode(normalizedInput)
    // Both buffers must be the same length for timingSafeEqual
    const a = Buffer.from(inputHash, 'hex')
    const b = Buffer.from(storedHash, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

// ─── Privacy-safe IP hashing ──────────────────────────────────────────────────

/** One-way SHA-256 hash of an IP address. Used in audit logs only. */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

// ─── JWT device license tokens ────────────────────────────────────────────────

export interface DeviceTokenPayload {
  sub: string         // licenseId (UUID)
  iid: string         // installationId
  typ: 'device-license-v1'
  jti: string         // unique token ID (for future revocation tracking)
  iat: number
  exp: number
}

const TOKEN_EXPIRY_DAYS = parseInt(process.env.LICENSE_TOKEN_EXPIRY_DAYS ?? '7', 10)

function getTokenSecret(): string {
  const secret = process.env.LICENSE_TOKEN_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('LICENSE_TOKEN_SECRET must be set and at least 32 characters long.')
  }
  return secret
}

/**
 * Issues a signed JWT device license token.
 * Payload contains only: licenseId, installationId, type, jti, iat, exp.
 * No email, activation code, payment data, or Cashfree IDs are included.
 */
export function issueDeviceToken(licenseId: string, installationId: string): string {
  const payload: Omit<DeviceTokenPayload, 'iat' | 'exp'> = {
    sub: licenseId,
    iid: installationId,
    typ: 'device-license-v1',
    jti: uuidv4(),
  }
  return jwt.sign(payload, getTokenSecret(), {
    expiresIn: `${TOKEN_EXPIRY_DAYS}d`,
    algorithm: 'HS256',
  })
}

/**
 * Verifies a device license token.
 * Returns the decoded payload if valid, or null if expired/invalid.
 */
export function verifyDeviceToken(token: string): DeviceTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getTokenSecret(), {
      algorithms: ['HS256'],
    }) as DeviceTokenPayload

    if (decoded.typ !== 'device-license-v1') return null
    return decoded
  } catch (err) {
    logger.debug('Device token verification failed', {
      reason: err instanceof Error ? err.message : 'unknown',
    })
    return null
  }
}
