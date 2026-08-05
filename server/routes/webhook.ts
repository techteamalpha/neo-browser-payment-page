/**
 * POST /api/webhooks/cashfree
 *
 * Handles inbound Cashfree payment webhook events.
 *
 * Security rules:
 * - Raw request body is preserved BEFORE JSON parsing for signature verification
 * - Signature is verified using Cashfree.PGVerifyWebhookSignature
 * - Order status is verified server-side via Cashfree API (don't trust body alone)
 * - Idempotency: duplicate webhooks for the same order are detected and skipped
 * - All fulfillment (PAID status, license, hashed activation code) is done in one
 *   Supabase transaction sequence with atomic checks
 * - Email is sent AFTER the database commit
 * - Never trust the redirect from Cashfree's return_url as proof of payment
 */
import { Router, Request, Response } from 'express'
import { createHash } from 'crypto'
import { supabase } from '../lib/supabase.js'
import { verifyCashfreeWebhookSignature, fetchCashfreePayments } from '../lib/cashfree.js'
import {
  generateActivationCode,
  normalizeActivationCode,
  hashActivationCode,
  getCodeLast4,
} from '../lib/license.js'
import { sendPurchaseEmail } from '../lib/email.js'
import { logger } from '../lib/logger.js'

const router = Router()

// ─── POST /api/webhooks/cashfree ──────────────────────────────────────────────
// NOTE: This route uses express.raw() middleware registered in server/app.ts
// to preserve the raw body for signature verification.

router.post('/', async (req: Request, res: Response) => {
  const signature = req.headers['x-webhook-signature'] as string | undefined
  const timestamp = req.headers['x-webhook-timestamp'] as string | undefined
  const webhookVersion = req.headers['x-webhook-version'] as string | undefined

  // 1. Validate required headers
  if (!signature || !timestamp) {
    logger.warn('Cashfree webhook missing required headers', {
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
    })
    return res.status(400).json({ error: 'MISSING_HEADERS' })
  }

  // 2. Get raw body (set by express.raw() middleware in app.ts)
  const rawBody = req.body instanceof Buffer
    ? req.body.toString('utf8')
    : typeof req.body === 'string'
    ? req.body
    : JSON.stringify(req.body)

  // 3. Verify Cashfree webhook signature using raw body
  const isValid = verifyCashfreeWebhookSignature(signature, rawBody, timestamp)
  if (!isValid) {
    logger.warn('Cashfree webhook signature verification failed', {
      webhookVersion,
      timestamp,
    })
    return res.status(400).json({ error: 'INVALID_SIGNATURE' })
  }

  // 4. Parse webhook payload
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    logger.error('Failed to parse Cashfree webhook payload as JSON')
    return res.status(400).json({ error: 'INVALID_PAYLOAD' })
  }

  const eventType = String(
    (payload.type as string) ?? (payload.event_type as string) ?? ''
  )
  const payloadHash = createHash('sha256').update(rawBody).digest('hex')

  // 5. Extract order information from webhook
  // Cashfree webhook v2 structure: { data: { order: { order_id }, payment: { ... } } }
  const data = payload.data as Record<string, unknown> | undefined
  const orderData = data?.order as Record<string, unknown> | undefined
  const paymentData = data?.payment as Record<string, unknown> | undefined

  const cashfreeOrderId = String(orderData?.order_id ?? payload.order_id ?? '')

  if (!cashfreeOrderId) {
    logger.warn('Cashfree webhook missing order_id', { eventType })
    return res.status(400).json({ error: 'MISSING_ORDER_ID' })
  }

  // 6. Build an idempotency key combining order ID, event type, and payload hash
  const idempotencyKey = `${cashfreeOrderId}::${eventType}::${payloadHash.slice(0, 16)}`

  // 7. Check idempotency — skip if already processed
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id, processing_status')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle()

  if (existingEvent) {
    logger.info('Duplicate webhook event — skipping', {
      cashfreeOrderId,
      idempotencyKey,
      previousStatus: existingEvent.processing_status,
    })
    // Record the skip
    await supabase.from('webhook_events').insert({
      provider: 'cashfree',
      idempotency_key: `${idempotencyKey}::dup_${Date.now()}`,
      event_type: eventType,
      payload_hash: payloadHash,
      processing_status: 'SKIPPED',
      processed_at: new Date().toISOString(),
    })
    return res.status(200).json({ status: 'ALREADY_PROCESSED' })
  }

  // 8. Record webhook event as being processed (insert now, update on completion)
  const { data: webhookRecord, error: webhookInsertError } = await supabase
    .from('webhook_events')
    .insert({
      provider: 'cashfree',
      idempotency_key: idempotencyKey,
      event_type: eventType,
      payload_hash: payloadHash,
      processing_status: 'FAILED', // will be updated to PROCESSED on success
      processed_at: null,
    })
    .select('id')
    .single()

  if (webhookInsertError) {
    // Could be a race condition — another instance processed this simultaneously
    logger.warn('Webhook insert conflict — possible race', {
      cashfreeOrderId,
      error: webhookInsertError.message,
    })
    return res.status(200).json({ status: 'RACE_HANDLED' })
  }

  // 9. Only process payment success events
  const isPaymentSuccess =
    eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
    eventType === 'PAYMENT_SUCCESS' ||
    String(paymentData?.payment_status ?? '').toUpperCase() === 'SUCCESS'

  if (!isPaymentSuccess) {
    logger.info('Cashfree webhook: non-payment-success event, skipping fulfillment', {
      cashfreeOrderId,
      eventType,
    })
    await supabase
      .from('webhook_events')
      .update({ processing_status: 'SKIPPED', processed_at: new Date().toISOString() })
      .eq('id', webhookRecord.id)
    return res.status(200).json({ status: 'NON_PAYMENT_EVENT' })
  }

  // 10. Server-side payment status verification (don't rely on webhook body alone)
  let isPaid = false
  let paymentId: string | null = null
  let cfPaymentStatus = 'UNKNOWN'

  try {
    const verification = await fetchCashfreePayments(cashfreeOrderId)
    isPaid = verification.isPaid
    paymentId = verification.paymentId
    cfPaymentStatus = verification.cfStatus
  } catch (err) {
    logger.error('Failed to verify payment status with Cashfree API', {
      cashfreeOrderId,
      error: err instanceof Error ? err.message : String(err),
    })
    // Don't fail silently — return error so Cashfree retries
    return res.status(500).json({ error: 'PAYMENT_VERIFICATION_FAILED' })
  }

  if (!isPaid) {
    logger.warn('Cashfree webhook: payment not confirmed by server-side check', {
      cashfreeOrderId,
      cfPaymentStatus,
    })
    await supabase
      .from('webhook_events')
      .update({ processing_status: 'SKIPPED', processed_at: new Date().toISOString() })
      .eq('id', webhookRecord.id)
    return res.status(200).json({ status: 'PAYMENT_NOT_CONFIRMED' })
  }

  // 11. Find the matching order in Supabase
  const { data: order, error: orderFetchError } = await supabase
    .from('orders')
    .select('id, payment_status, customer_email, cashfree_order_id')
    .eq('cashfree_order_id', cashfreeOrderId)
    .single()

  if (orderFetchError || !order) {
    logger.error('Order not found for Cashfree webhook', { cashfreeOrderId })
    return res.status(404).json({ error: 'ORDER_NOT_FOUND' })
  }

  // 12. Idempotency check at the order level — only transition PENDING → PAID once
  if (order.payment_status === 'PAID') {
    logger.info('Order already PAID — skipping duplicate fulfillment', {
      cashfreeOrderId,
      orderId: order.id,
    })
    await supabase
      .from('webhook_events')
      .update({ processing_status: 'SKIPPED', processed_at: new Date().toISOString() })
      .eq('id', webhookRecord.id)
    return res.status(200).json({ status: 'ALREADY_FULFILLED' })
  }

  // 13. Generate activation code (128+ bit entropy, rejection-sampled)
  const rawActivationCode = generateActivationCode()
  const normalizedCode = normalizeActivationCode(rawActivationCode)
  const codeHash = hashActivationCode(normalizedCode)
  const codeLast4 = getCodeLast4(normalizedCode)

  // 14. Mark order PAID and create license atomically
  // We use sequential Supabase calls with checks. For strict ACID atomicity,
  // consider a Supabase DB function/RPC in future iterations.
  const { error: orderUpdateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'PAID',
      cashfree_payment_status: cfPaymentStatus,
      payment_reference: paymentId,
      paid_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .eq('payment_status', 'PENDING') // Atomic guard — only update if still PENDING

  if (orderUpdateError) {
    // Another webhook instance may have already updated this — re-check
    const { data: recheckOrder } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('id', order.id)
      .single()

    if (recheckOrder?.payment_status === 'PAID') {
      logger.info('Order already PAID (race condition) — skipping', { cashfreeOrderId })
      return res.status(200).json({ status: 'RACE_HANDLED' })
    }

    logger.error('Failed to update order to PAID', {
      cashfreeOrderId,
      error: orderUpdateError.message,
    })
    return res.status(500).json({ error: 'ORDER_UPDATE_FAILED' })
  }

  // 15. Create exactly one license with hashed activation code
  const { error: licenseError } = await supabase.from('licenses').insert({
    order_id: order.id,
    purchase_email: order.customer_email,
    activation_code_hash: codeHash,
    activation_code_last4: codeLast4,
    activation_status: 'UNACTIVATED',
  })

  if (licenseError) {
    logger.error('Failed to create license', {
      orderId: order.id,
      error: licenseError.message,
      code: licenseError.code,
    })
    // If unique constraint violation — license already exists (race)
    if (licenseError.code === '23505') {
      logger.info('License already exists (race condition) — OK', { orderId: order.id })
    } else {
      return res.status(500).json({ error: 'LICENSE_CREATE_FAILED' })
    }
  }

  // 16. Mark webhook event as PROCESSED
  await supabase
    .from('webhook_events')
    .update({ processing_status: 'PROCESSED', processed_at: new Date().toISOString() })
    .eq('id', webhookRecord.id)

  logger.info('Order fulfilled and license created', {
    orderId: order.id,
    cashfreeOrderId,
    codeLast4,
  })

  // 17. Send purchase email with the raw activation code
  // This happens AFTER the DB commit.
  // If email fails, we log it but still return 200 to Cashfree (DB is already committed).
  // TODO: Add an email retry queue for production resilience.
  const emailResult = await sendPurchaseEmail(
    order.customer_email,
    rawActivationCode,
    cashfreeOrderId
  )

  if (!emailResult.success) {
    logger.error('Purchase email delivery failed — code stored, manual resend required', {
      orderId: order.id,
      error: emailResult.error,
    })
    // In production: enqueue for retry. For now, log and continue.
  }

  return res.status(200).json({ status: 'FULFILLED' })
})

export default router
