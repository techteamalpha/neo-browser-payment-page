import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, Home, Mail } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    document.title = 'Payment Submitted — Neo-Browser'
  }, [])

  return (
    <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      <div className="max-w-lg mx-auto text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6" aria-hidden="true">
          <Clock size={36} className="text-primary" />
        </div>

        <h1 className="text-display-mobile font-bold text-on-surface mb-4 tracking-tight">
          Payment submitted.
        </h1>

        <div className="text-left bg-surface border border-border rounded-xl p-6 mb-8 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold text-lg flex-shrink-0">1</span>
            <p className="text-body-lg text-secondary">
              Your payment has been submitted to Cashfree for verification.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold text-lg flex-shrink-0">2</span>
            <p className="text-body-lg text-secondary">
              Once payment is confirmed by our server, your unique activation code will be sent to your email.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-bold text-lg flex-shrink-0">3</span>
            <p className="text-body-lg text-secondary">
              This typically happens within a few minutes. Check your spam folder if you don't receive it.
            </p>
          </div>
        </div>

        {/* Important note: do NOT promise success based on redirect */}
        <div className="bg-surface-container-low border border-border rounded-lg px-5 py-4 text-sm text-secondary mb-8 text-left">
          <p className="flex items-start gap-2">
            <Mail size={16} className="text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Check your inbox</strong> — your activation code will arrive by email after payment verification.
              This page does not confirm payment success.
            </span>
          </p>
        </div>

        {orderId && (
          <p className="text-xs text-text-muted mb-6">
            Reference: <code className="font-mono bg-surface-container-low px-1.5 py-0.5 rounded">{orderId}</code>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-secondary gap-2 w-full sm:w-auto">
            <Home size={16} aria-hidden="true" />
            Back to home
          </Link>
          <a
            href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@neobrowser.app'}${orderId ? `?subject=Order%20${orderId}` : ''}`}
            className="btn-secondary gap-2 w-full sm:w-auto"
          >
            <Mail size={16} aria-hidden="true" />
            Contact support
          </a>
        </div>
      </div>
    </div>
  )
}
