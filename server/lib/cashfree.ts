/**
 * Cashfree Payment Gateway SDK wrapper — SERVER ONLY.
 *
 * Uses cashfree-pg v6 which has a class-based API:
 *   - `Cashfree` is a class (not a static object)
 *   - `CFEnvironment` is the environment enum
 *   - Methods are instance methods on `new Cashfree(...)`
 *
 * Credentials are read from environment variables only.
 * No Cashfree secret is ever returned to the browser.
 */
import { Cashfree, CFEnvironment } from 'cashfree-pg'
import { logger } from './logger'

let _client: InstanceType<typeof Cashfree> | null = null

function getClient(): InstanceType<typeof Cashfree> {
  if (_client) return _client

  const clientId = process.env.CASHFREE_CLIENT_ID
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET
  const cfEnv = process.env.CASHFREE_ENVIRONMENT ?? 'sandbox'

  if (!clientId || !clientSecret) {
    throw new Error('Missing CASHFREE_CLIENT_ID or CASHFREE_CLIENT_SECRET environment variables.')
  }

  const environment = cfEnv === 'production'
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX

  _client = new Cashfree(environment, clientId, clientSecret)
  return _client
}

// v6 SDK sets version internally on the Cashfree instance — not passed per call

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateOrderParams {
  cashfreeOrderId: string   // our generated order ID: neo_<uuid>
  amountInr: number         // full rupees, e.g. 299
  customerEmail: string
  customerPhone: string     // E.164 format, e.g. +919876543210
  returnUrl: string         // /checkout/success?order_id={order_id}
  notifyUrl: string         // /api/webhooks/cashfree
}

export interface CashfreeOrderResult {
  cfOrderId: string
  paymentSessionId: string
  status: string
}

// ─── Create a Cashfree PG order (server-side only) ───────────────────────────

export async function createCashfreeOrder(
  params: CreateOrderParams
): Promise<CashfreeOrderResult> {
  const cf = getClient()
  const { cashfreeOrderId, amountInr, customerEmail, customerPhone, returnUrl, notifyUrl } = params

  // Cashfree API expects 10-digit phone without country code or spaces
  const cfPhone = customerPhone.replace(/^\+91/, '').replace(/\D/g, '')

  const orderRequest = {
    order_id: cashfreeOrderId,
    order_amount: amountInr,
    order_currency: 'INR',
    customer_details: {
      customer_id: `cust_${cashfreeOrderId}`,
      customer_email: customerEmail,
      customer_phone: cfPhone,
    },
    order_meta: {
      return_url: returnUrl,
      notify_url: notifyUrl,
    },
  }

  logger.info('Creating Cashfree order', {
    cashfreeOrderId,
    amountInr,
    env: process.env.CASHFREE_ENVIRONMENT ?? 'sandbox',
  })

  let cfResponse: Awaited<ReturnType<typeof cf.PGCreateOrder>>
  try {
    cfResponse = await cf.PGCreateOrder(orderRequest)
  } catch (err: unknown) {
    const axErr = err as { response?: { status?: number; data?: unknown }; message?: string }
    logger.error('Cashfree PGCreateOrder error', {
      cashfreeOrderId,
      httpStatus: axErr.response?.status,
      details: JSON.stringify(axErr.response?.data ?? axErr.message),
    })
    throw err
  }

  const response = cfResponse
  const data = response.data as Record<string, unknown>

  if (!data || !data.payment_session_id) {
    logger.error('Cashfree order creation failed — no payment_session_id', {
      cashfreeOrderId,
      status: response.status,
    })
    throw new Error('Cashfree order creation failed: no payment_session_id returned.')
  }

  return {
    cfOrderId: String(data.cf_order_id ?? ''),
    paymentSessionId: String(data.payment_session_id),
    status: String(data.order_status ?? 'ACTIVE'),
  }
}

// ─── Verify webhook signature ─────────────────────────────────────────────────

export function verifyCashfreeWebhookSignature(
  signature: string,
  rawBody: string,
  timestamp: string
): boolean {
  const cf = getClient()
  try {
    // v6: PGVerifyWebhookSignature(signature, rawBody, timestamp)
    const result = cf.PGVerifyWebhookSignature(signature, rawBody, timestamp)
    return result === true
  } catch {
    return false
  }
}

// ─── Fetch order payments from Cashfree (server verification) ─────────────────

export async function fetchCashfreePayments(
  cashfreeOrderId: string
): Promise<{ isPaid: boolean; paymentId: string | null; cfStatus: string }> {
  const cf = getClient()
  try {
    const response = await cf.PGOrderFetchPayments(cashfreeOrderId)
    const payments = response.data as Array<Record<string, unknown>>

    if (!Array.isArray(payments) || payments.length === 0) {
      return { isPaid: false, paymentId: null, cfStatus: 'NO_PAYMENTS' }
    }

    const successPayment = payments.find(
      (p) => p.payment_status === 'SUCCESS'
    )

    if (successPayment) {
      return {
        isPaid: true,
        paymentId: String(successPayment.cf_payment_id ?? ''),
        cfStatus: 'SUCCESS',
      }
    }

    const latestStatus = String(payments[0]?.payment_status ?? 'UNKNOWN')
    return { isPaid: false, paymentId: null, cfStatus: latestStatus }
  } catch (err) {
    logger.error('Failed to fetch Cashfree payments', {
      cashfreeOrderId,
      error: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}
