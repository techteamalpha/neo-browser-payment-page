/**
 * Email abstraction layer — SERVER ONLY.
 *
 * Uses Resend as the current provider.
 * The provider can be swapped without changing checkout or licensing logic —
 * only this file and the RESEND_API_KEY env var need to change.
 *
 * IMPORTANT:
 * - The EMAIL_FROM domain must be verified in the Resend dashboard.
 * - Gmail addresses (@gmail.com) CANNOT be used as FROM without domain verification.
 * - For testing, use Resend's default: onboarding@resend.dev
 * - The activation code is included in the email and is NOT stored raw anywhere else.
 */
import { Resend } from 'resend'
import { logger } from './logger.js'

// ─── Provider initialization ──────────────────────────────────────────────────

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('Missing RESEND_API_KEY environment variable.')
  return new Resend(apiKey)
}

// ─── Email content ────────────────────────────────────────────────────────────

function getPurchaseEmailHtml(activationCode: string): string {
  const supportEmail = process.env.SUPPORT_EMAIL ?? 'support@example.com'
  const appName = 'Neo-Browser'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your ${appName} Activation Code</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f7faf8; margin: 0; padding: 0; color: #181c1c; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .header { background: #005c55; padding: 32px 40px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .body { padding: 36px 40px; }
    .body p { margin: 0 0 16px; line-height: 1.6; color: #334155; font-size: 15px; }
    .code-box { background: #f0fdf8; border: 2px solid #005c55; border-radius: 8px; padding: 20px 24px; margin: 24px 0; text-align: center; }
    .code-box .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 8px; }
    .code-box .code { font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 700; color: #005c55; letter-spacing: 0.15em; word-break: break-all; }
    .steps { background: #f8fafc; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .steps h3 { font-size: 14px; font-weight: 700; margin: 0 0 12px; color: #0f172a; }
    .steps ol { margin: 0; padding-left: 20px; }
    .steps li { margin-bottom: 8px; color: #475569; font-size: 14px; line-height: 1.5; }
    .security-note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 14px 18px; font-size: 13px; color: #78350f; margin: 20px 0; }
    .footer { border-top: 1px solid #e2e8f0; padding: 24px 40px; background: #f8fafc; }
    .footer p { margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.6; }
    .footer a { color: #005c55; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${appName} — Activation Code</h1>
    </div>
    <div class="body">
      <p>Thank you for your purchase. Your payment has been received and verified.</p>
      <p>Below is your unique activation code for <strong>${appName} Individual</strong>. Keep it safe — it activates one device.</p>

      <div class="code-box">
        <div class="label">Your Activation Code</div>
        <div class="code">${activationCode}</div>
      </div>

      <div class="steps">
        <h3>How to activate Neo-Browser:</h3>
        <ol>
          <li>Install or open <strong>${appName}</strong> on your computer.</li>
          <li>Enter the <strong>same email address</strong> you used during purchase.</li>
          <li>Enter the activation code above exactly as shown.</li>
          <li>The code activates one device and becomes bound to it on first use.</li>
        </ol>
      </div>

      <div class="security-note">
        🔒 <strong>Do not share this activation code.</strong> Once entered, it is permanently linked to the first device used for activation. If you need help, contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.
      </div>

      <p>If you have any questions about your purchase or need technical help, please email us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
    </div>
    <div class="footer">
      <p>
        This email was sent because you purchased a license for ${appName}.<br />
        ${appName} is a general-purpose desktop browser. It is not a proctoring or exam-security product.<br />
        Questions? <a href="mailto:${supportEmail}">${supportEmail}</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

function getPurchaseEmailText(activationCode: string): string {
  const supportEmail = process.env.SUPPORT_EMAIL ?? 'support@example.com'
  return `NEO-BROWSER — YOUR ACTIVATION CODE
=====================================

Thank you for your purchase. Your payment has been received and verified.

ACTIVATION CODE
---------------
${activationCode}

HOW TO ACTIVATE
---------------
1. Install or open Neo-Browser on your computer.
2. Enter the same email address you used during purchase.
3. Enter the activation code above exactly as shown.
4. The code activates one device and becomes bound to it on first use.

SECURITY NOTE
-------------
Do not share this activation code. Once activated, it is permanently
linked to the first device used for activation.

SUPPORT
-------
If you have questions or need help: ${supportEmail}

---
Neo-Browser is a general-purpose desktop browser.
It is not a proctoring or exam-security product.
`
}

// ─── Email provider abstraction ───────────────────────────────────────────────

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Sends the purchase confirmation email containing the raw activation code.
 *
 * The activation code is sent ONCE here. It is not stored raw anywhere.
 * If this fails, the caller must log the failure and retry — do not regenerate the code.
 */
export async function sendPurchaseEmail(
  toEmail: string,
  activationCode: string,
  orderId: string
): Promise<SendEmailResult> {
  const from = process.env.EMAIL_FROM
  const supportEmail = process.env.SUPPORT_EMAIL ?? 'support@example.com'

  if (!from) {
    throw new Error('Missing EMAIL_FROM environment variable.')
  }

  logger.info('Sending purchase email', {
    orderId,
    recipientDomain: toEmail.split('@')[1], // log domain only, never full email
  })

  try {
    const resend = getResend()
    const result = await resend.emails.send({
      from,
      to: [toEmail],
      subject: 'Your Neo-Browser activation code',
      html: getPurchaseEmailHtml(activationCode),
      text: getPurchaseEmailText(activationCode),
      replyTo: supportEmail,
    })

    if (result.error) {
      logger.error('Resend returned an error', {
        orderId,
        error: result.error.message ?? String(result.error),
      })
      return { success: false, error: result.error.message ?? 'Email provider error' }
    }

    logger.info('Purchase email sent successfully', {
      orderId,
      messageId: result.data?.id,
    })

    return { success: true, messageId: result.data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Failed to send purchase email', { orderId, error: message })
    return { success: false, error: message }
  }
}
