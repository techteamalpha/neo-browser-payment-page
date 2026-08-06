import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { XCircle, Home, ArrowLeft } from 'lucide-react'

export default function CheckoutCancelledPage() {
  useEffect(() => {
    document.title = 'Checkout Not Completed — Neo-Browser Spider Edition'
  }, [])

  return (
    <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      <div className="max-w-lg mx-auto text-center bg-[#0F172A] border border-[rgba(230,36,41,0.3)] rounded-2xl p-8">
        <XCircle size={56} className="text-[#E62429] mx-auto mb-6" aria-hidden="true" />
        <h1 className="text-display-mobile font-display font-extrabold text-white mb-4 tracking-tight">
          Checkout Not Completed.
        </h1>
        <p className="text-body-lg text-[#94A3B8] mb-8 leading-relaxed">
          No payment was charged. You can return to pricing and try again when you are ready.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/pricing" className="btn-primary gap-2 w-full sm:w-auto py-3.5 px-6">
            <ArrowLeft size={18} aria-hidden="true" />
            Return to pricing — ₹299
          </Link>
          <Link to="/" className="btn-secondary gap-2 w-full sm:w-auto py-3.5 px-6">
            <Home size={18} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
