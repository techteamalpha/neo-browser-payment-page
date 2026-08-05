/**
 * Frontend checkout utilities.
 *
 * createCheckoutSession: calls the server to create a Cashfree order.
 * initCashfreeCheckout: loads the Cashfree JS SDK and opens hosted checkout.
 *
 * Security rules:
 * - No Cashfree secrets are used here
 * - The server returns only paymentSessionId and orderId (safe to expose)
 * - Payment verification happens server-side via webhook, never from this file
 * - Never mark any order as paid from client code
 */

export interface CheckoutSessionResponse {
  paymentSessionId: string
  orderId: string
}

/**
 * Creates a checkout session by calling POST /api/checkout/create.
 * Returns safe session data (paymentSessionId, orderId) for the frontend.
 */
export async function createCheckoutSession(
  email: string,
  phone: string,
  productId = 'neo-browser-individual'
): Promise<CheckoutSessionResponse> {
  const response = await fetch('/api/checkout/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, phone, productId, agreedToTerms: true }),
  })

  if (!response.ok) {
    let message = 'Checkout failed. Please try again.'
    try {
      const data = await response.json()
      if (data?.message) message = data.message
    } catch { /* use default */ }
    throw new Error(message)
  }

  const data = await response.json()

  if (!data?.paymentSessionId || !data?.orderId) {
    throw new Error('Invalid response from checkout service. Please try again.')
  }

  return { paymentSessionId: data.paymentSessionId, orderId: data.orderId }
}

/**
 * Dynamically loads the Cashfree JS SDK and opens the hosted checkout.
 * Uses payment_session_id from the server — no raw payment credentials.
 *
 * The return_url is set server-side. The client only provides the session.
 * After payment, Cashfree redirects to /checkout/success?order_id=<id>.
 *
 * NOTE: Do NOT use the redirect as proof of payment.
 *       Payment is only confirmed after webhook verification.
 */
export async function initCashfreeCheckout(
  paymentSessionId: string,
  orderId: string
): Promise<void> {
  const mode = (import.meta.env.VITE_CASHFREE_ENV as 'sandbox' | 'production') ?? 'sandbox'

  // Dynamically import the Cashfree browser SDK (only loaded when needed)
  const { load } = await import('@cashfreepayments/cashfree-js')
  const cashfree = await load({ mode })

  await cashfree.checkout({
    paymentSessionId,
    returnUrl: `${window.location.origin}/checkout/success?order_id=${orderId}`,
  })
}
