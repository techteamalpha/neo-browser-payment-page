/**
 * Structured logger for the Neo-Browser API server.
 * Automatically redacts known sensitive fields before output.
 * Never logs secrets, activation codes, raw bodies, or payment credentials.
 */

const REDACTED = '[REDACTED]'

const SENSITIVE_KEYS = new Set([
  'password', 'secret', 'key', 'token', 'authorization',
  'activationCode', 'activation_code', 'activation_code_hash',
  'cashfree_client_secret', 'x-client-secret',
  'resend_api_key', 'resend', 'apiKey', 'api_key',
  'supabase_service_role_key', 'service_role',
  'license_token_secret', 'activation_code_secret',
  'rawBody', 'raw_body',
  'customer_phone', // phone stored server-side only, not logged
])

function redact(obj: unknown, depth = 0): unknown {
  if (depth > 5) return obj
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map((v) => redact(v, depth + 1))

  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    result[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? REDACTED : redact(v, depth + 1)
  }
  return result
}

function formatMessage(level: string, message: string, meta?: unknown): string {
  const ts = new Date().toISOString()
  const safeMetadata = meta ? redact(meta) : undefined
  const base = { ts, level, message }
  return JSON.stringify(safeMetadata ? { ...base, ...safeMetadata } : base)
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(formatMessage('info', message, meta))
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(formatMessage('warn', message, meta))
  },
  error(message: string, meta?: Record<string, unknown>): void {
    console.error(formatMessage('error', message, meta))
  },
  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', message, meta))
    }
  },
}
