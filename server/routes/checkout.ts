/**
 * POST /api/checkout/create
 *
 * Creates a Cashfree payment order server-side and returns the
 * payment_session_id for the frontend to open Cashfree hosted checkout.
 *
 * Security rules:
 * - Price is read from server env — never from client input
 * - No Cashfree secrets are returned to the client
 * - Only paymentSessionId and orderId are returned (safe to expose)
 */
import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import { createCashfreeOrder } from '../lib/cashfree'
import { checkoutRateLimit } from '../lib/rateLimit'
import { logger } from '../lib/logger'

const router = Router()

// ─── Validation schema ────────────────────────────────────────────────────────

const CheckoutSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Please enter a valid email address.' }),
  phone: z
    .string()
    .trim()
    .regex(/^\+91[6-9]\d{9}$/, {
      message: 'Please enter a valid 10-digit Indian mobile number.',
    }),
  productId: z
    .string()
    .optional()
    .default('neo-browser-individual'),
  agreedToTerms: z
    .boolean()
    .refine((v) => v === true, {
      message: 'You must agree to the Terms, Privacy Policy, and Refund Policy.',
    }),
})

// ─── POST /api/checkout/create ────────────────────────────────────────────────

router.post('/create', checkoutRateLimit, async (req: Request, res: Response) => {
  // 1. Validate request body
  const parse = CheckoutSchema.safeParse(req.body)
  if (!parse.success) {
    // Zod v4 uses .issues; v3 uses .errors — support both
    const issues = (parse.error as { issues?: Array<{message:string}>; errors?: Array<{message:string}> }).issues
      ?? (parse.error as { errors?: Array<{message:string}> }).errors
      ?? []
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: issues[0]?.message ?? 'Invalid request.',
    })
  }

  const { email, phone, productId } = parse.data

  // 2. Authoritative price from server environment — never trust client
  const priceInr = parseFloat(process.env.NEO_BROWSER_PRICE_INR ?? '299')
  const configProductId = process.env.NEO_BROWSER_PRODUCT_ID ?? 'neo-browser-individual'

  if (productId !== configProductId) {
    return res.status(400).json({
      error: 'INVALID_PRODUCT',
      message: 'Unknown product.',
    })
  }

  const appUrl = process.env.VITE_APP_URL ?? `https://${req.hostname}`

  try {
    // 3. Generate a unique order ID
    const cashfreeOrderId = `neo_${uuidv4().replace(/-/g, '').slice(0, 20)}`

    // 4. Create a PENDING order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        cashfree_order_id: cashfreeOrderId,
        customer_email: email,
        customer_phone: phone, // stored server-side only; never returned to client
        product_id: configProductId,
        amount: priceInr,
        currency: 'INR',
        payment_status: 'PENDING',
      })
      .select('id, cashfree_order_id')
      .single()

    if (orderError || !order) {
      logger.error('Failed to create order in Supabase', {
        error: orderError?.message,
        code: orderError?.code,
      })
      return res.status(500).json({
        error: 'ORDER_CREATE_FAILED',
        message: 'Unable to create order. Please try again.',
      })
    }

    // 5. Create a Cashfree order server-side
    const returnUrl = `${appUrl}/checkout/success?order_id=${cashfreeOrderId}`
    const notifyUrl = `${appUrl}/api/webhooks/cashfree`

    const cfOrder = await createCashfreeOrder({
      cashfreeOrderId,
      amountInr: priceInr,
      customerEmail: email,
      customerPhone: phone,
      returnUrl,
      notifyUrl,
    })

    // 6. Update order record with Cashfree CF order ID
    await supabase
      .from('orders')
      .update({ cashfree_cf_order_id: cfOrder.cfOrderId })
      .eq('id', order.id)

    logger.info('Checkout order created', {
      orderId: order.id,
      cashfreeOrderId,
      env: process.env.CASHFREE_ENVIRONMENT,
    })

    // 7. Return ONLY safe data to the client
    // Never return: phone, email, price source, Cashfree secrets, internal IDs
    return res.status(200).json({
      paymentSessionId: cfOrder.paymentSessionId,
      orderId: cashfreeOrderId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Checkout creation error', { error: message })
    return res.status(500).json({
      error: 'CHECKOUT_FAILED',
      message: 'Checkout failed. Please try again.',
    })
  }
})

export default router
