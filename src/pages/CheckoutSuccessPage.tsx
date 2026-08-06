import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, Home, Mail } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    document.title = 'Payment Submitted — Neo-Browser Spider Edition'
  }, [])

  return (
    <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      <div className="max-w-lg mx-auto text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.4)] flex items-center justify-center mx-auto mb-6" aria-hidden="true">
          <Clock size={36} className="text-[#E62429]" />
        </div>

        <h1 className="text-display-mobile font-display font-extrabold text-white mb-4 tracking-tight">
          Payment Submitted.
        </h1>

        <div className="text-left bg-[#0F172A] border border-[rgba(230,36,41,0.3)] rounded-2xl p-6 mb-8 space-y-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#E62429] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <p className="text-body-lg text-[#E2E8F0]">
              Your payment has been submitted to Cashfree for verification.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#E62429] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <p className="text-body-lg text-[#E2E8F0]">
              Once payment is confirmed by our server, your unique activation code will be emailed immediately.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#E62429] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <p className="text-body-lg text-[#E2E8F0]">
              This typically happens within a few minutes. Check your spam folder if you don't receive it.
            </p>
          </div>
        </div>

        {/* Important note */}
        <div className="bg-[#1E1B13] border border-[rgba(255,215,0,0.3)] rounded-xl px-5 py-4 text-sm text-[#E2E8F0] mb-8 text-left">
          <p className="flex items-start gap-2.5">
            <Mail size={18} className="text-[#FFD700] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong className="text-[#FFD700]">Check your inbox</strong> — your activation code will arrive by email after payment verification.
            </span>
          </p>
        </div>

        {orderId && (
          <p className="text-xs text-[#94A3B8] mb-6">
            Reference: <code className="font-mono bg-[#0F172A] border border-[rgba(230,36,41,0.25)] px-2 py-1 rounded text-white">{orderId}</code>
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
