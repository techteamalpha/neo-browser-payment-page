/**
 * License API routes — consumed by the Neo-Browser desktop app, NOT the web frontend.
 *
 * POST /api/licenses/activate    — bind license to a device
 * POST /api/licenses/validate    — verify and optionally rotate a device token
 * POST /api/licenses/deactivate  — release a license from its current device
 *
 * Security rules:
 * - All activation codes are verified with timing-safe HMAC comparison
 * - No raw activation codes, DB hashes, or full order data are returned
 * - Generic error codes are returned on failure to prevent oracle attacks
 * - All attempts are logged (with privacy-safe IP hashes) for abuse detection
 * - Device tokens (JWTs) are the only auth mechanism for validate/deactivate
 */
import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import {
  verifyActivationCode,
  normalizeActivationCode,
  hashIp,
  issueDeviceToken,
  verifyDeviceToken,
} from '../lib/license'
import { activationRateLimit } from '../lib/rateLimit'
import { logger } from '../lib/logger'

const router = Router()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress ?? 'unknown'
}

async function recordAttempt(
  licenseId: string | null,
  attemptedEmail: string | null,
  installationId: string | null,
  ip: string,
  result: string
): Promise<void> {
  await supabase.from('license_activation_attempts').insert({
    license_id: licenseId,
    attempted_email: attemptedEmail,
    installation_id: installationId,
    ip_hash: hashIp(ip),
    result,
  })
}

// Generic failure response — never reveals whether email/code exists
const GENERIC_FAILURE = {
  error: 'ACTIVATION_FAILED',
  message: 'Activation failed. Please check your email and activation code.',
} as const

// ─── Validation schemas ───────────────────────────────────────────────────────

const ActivateSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  activationCode: z.string().min(1).max(64),
  installationId: z.string().uuid({ message: 'installationId must be a valid UUID.' }),
  platform: z.enum(['win32', 'darwin', 'linux']).optional(),
  appVersion: z.string().max(32).optional(),
})

const ValidateSchema = z.object({
  licenseToken: z.string().min(1),
  installationId: z.string().uuid(),
  appVersion: z.string().max(32).optional(),
})

const DeactivateSchema = z.object({
  licenseToken: z.string().min(1),
  installationId: z.string().uuid(),
})

// ─── POST /api/licenses/activate ─────────────────────────────────────────────

router.post('/activate', activationRateLimit, async (req: Request, res: Response) => {
  const ip = getClientIp(req)
  const parse = ActivateSchema.safeParse(req.body)

  if (!parse.success) {
    const issues = (parse.error as { issues?: Array<{message:string}>; errors?: Array<{message:string}> }).issues
      ?? (parse.error as { errors?: Array<{message:string}> }).errors
      ?? []
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: issues[0]?.message ?? 'Invalid request.',
    })
  }

  const { email, activationCode, installationId, platform, appVersion } = parse.data
  const normalizedCode = normalizeActivationCode(activationCode)

  // Look up license by purchase_email (normalized input)
  // We join through orders to verify the order is PAID
  const { data: license, error: licenseError } = await supabase
    .from('licenses')
    .select('id, purchase_email, activation_code_hash, activation_status, installation_id, order_id')
    .eq('purchase_email', email)
    .maybeSingle()

  if (licenseError || !license) {
    await recordAttempt(null, email, installationId, ip, 'INVALID_CODE')
    return res.status(400).json(GENERIC_FAILURE)
  }

  // Early exit for non-UNACTIVATED statuses — before the orders DB lookup
  // ACTIVE licenses were already verified as paid when first created
  if (license.activation_status === 'ACTIVE') {
    if (license.installation_id === installationId) {
      // Idempotent re-activation — same device
      const codeValid = verifyActivationCode(normalizedCode, license.activation_code_hash)
      if (!codeValid) {
        await recordAttempt(license.id, email, installationId, ip, 'INVALID_CODE')
        return res.status(400).json(GENERIC_FAILURE)
      }
      const token = issueDeviceToken(license.id, installationId)
      await supabase
        .from('licenses')
        .update({ last_validated_at: new Date().toISOString() })
        .eq('id', license.id)
      await recordAttempt(license.id, email, installationId, ip, 'SUCCESS')
      return res.status(200).json({ status: 'ALREADY_ACTIVE', licenseToken: token })
    } else {
      // Different installation — always reject with 409
      await recordAttempt(license.id, email, installationId, ip, 'ALREADY_ACTIVATED')
      return res.status(409).json({
        error: 'ALREADY_ACTIVATED',
        message: 'This license is already activated on another device. Contact support to deactivate.',
      })
    }
  }

  // REVOKED, EXPIRED, DEACTIVATED — return generic failure before code check
  if (license.activation_status !== 'UNACTIVATED') {
    const result = license.activation_status === 'REVOKED' ? 'REVOKED' : 'INVALID_CODE'
    await recordAttempt(license.id, email, installationId, ip, result)
    return res.status(400).json(GENERIC_FAILURE)
  }

  // Verify the order is PAID (only needed for UNACTIVATED licenses)
  const { data: order } = await supabase
    .from('orders')
    .select('payment_status')
    .eq('id', license.order_id)
    .single()

  if (!order || order.payment_status !== 'PAID') {
    logger.warn('Activation attempted on unpaid order', { orderId: license.order_id })
    await recordAttempt(license.id, email, installationId, ip, 'INVALID_CODE')
    return res.status(400).json(GENERIC_FAILURE)
  }

  // Timing-safe activation code verification (only for UNACTIVATED licenses)
  const codeValid = verifyActivationCode(normalizedCode, license.activation_code_hash)
  if (!codeValid) {
    await recordAttempt(license.id, email, installationId, ip, 'INVALID_CODE')
    return res.status(400).json(GENERIC_FAILURE)
  }

  // Verify email matches license (belt-and-suspenders)
  if (license.purchase_email !== email) {
    await recordAttempt(license.id, email, installationId, ip, 'WRONG_EMAIL')
    return res.status(400).json(GENERIC_FAILURE)
  }
    // First-time activation — bind to this installation
    const { error: updateError } = await supabase
      .from('licenses')
      .update({
        activation_status: 'ACTIVE',
        installation_id: installationId,
        platform: platform ?? null,
        app_version: appVersion ?? null,
        activated_at: new Date().toISOString(),
      })
      .eq('id', license.id)
      .eq('activation_status', 'UNACTIVATED') // Atomic guard

    if (updateError) {
      logger.error('Failed to activate license', { licenseId: license.id, error: updateError.message })
      await recordAttempt(license.id, email, installationId, ip, 'ERROR')
      return res.status(500).json({ error: 'ACTIVATION_ERROR', message: 'Activation failed. Please try again.' })
    }

    const token = issueDeviceToken(license.id, installationId)
    await recordAttempt(license.id, email, installationId, ip, 'SUCCESS')

    logger.info('License activated successfully', { licenseId: license.id, platform })

    return res.status(200).json({
      status: 'ACTIVATED',
      licenseToken: token,
    })
})

// ─── POST /api/licenses/validate ─────────────────────────────────────────────

router.post('/validate', async (req: Request, res: Response) => {
  const parse = ValidateSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ valid: false, error: 'INVALID_REQUEST' })
  }

  const { licenseToken, installationId, appVersion } = parse.data

  // Verify JWT signature, expiry, and type
  const payload = verifyDeviceToken(licenseToken)
  if (!payload) {
    return res.status(401).json({ valid: false, error: 'INVALID_TOKEN' })
  }

  // Verify installation ID matches token claim
  if (payload.iid !== installationId) {
    return res.status(401).json({ valid: false, error: 'INSTALLATION_MISMATCH' })
  }

  // Verify license in DB is still ACTIVE
  const { data: license } = await supabase
    .from('licenses')
    .select('id, activation_status, installation_id')
    .eq('id', payload.sub)
    .single()

  if (!license || license.activation_status !== 'ACTIVE' || license.installation_id !== installationId) {
    return res.status(401).json({ valid: false, error: 'LICENSE_INACTIVE' })
  }

  // Update last_validated_at and rotate token
  await supabase
    .from('licenses')
    .update({
      last_validated_at: new Date().toISOString(),
      app_version: appVersion ?? undefined,
    })
    .eq('id', license.id)

  const newToken = issueDeviceToken(license.id, installationId)

  return res.status(200).json({ valid: true, licenseToken: newToken })
})

// ─── POST /api/licenses/deactivate ───────────────────────────────────────────

router.post('/deactivate', async (req: Request, res: Response) => {
  const parse = DeactivateSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: 'INVALID_REQUEST' })
  }

  const { licenseToken, installationId } = parse.data
  const ip = getClientIp(req)

  // Verify device token
  const payload = verifyDeviceToken(licenseToken)
  if (!payload || payload.iid !== installationId) {
    return res.status(401).json({ error: 'INVALID_TOKEN' })
  }

  // Verify license in DB
  const { data: license } = await supabase
    .from('licenses')
    .select('id, activation_status, installation_id')
    .eq('id', payload.sub)
    .single()

  if (!license || license.installation_id !== installationId) {
    return res.status(401).json({ error: 'INSTALLATION_MISMATCH' })
  }

  if (license.activation_status !== 'ACTIVE') {
    return res.status(400).json({ error: 'NOT_ACTIVE' })
  }

  // Deactivate
  const { error: updateError } = await supabase
    .from('licenses')
    .update({
      activation_status: 'DEACTIVATED',
      installation_id: null,
      deactivated_at: new Date().toISOString(),
    })
    .eq('id', license.id)
    .eq('activation_status', 'ACTIVE')

  if (updateError) {
    logger.error('License deactivation failed', { licenseId: license.id, error: updateError.message })
    return res.status(500).json({ error: 'DEACTIVATION_FAILED' })
  }

  await recordAttempt(license.id, null, installationId, ip, 'SUCCESS')
  logger.info('License deactivated', { licenseId: license.id })

  return res.status(200).json({ status: 'DEACTIVATED' })
})

export default router
