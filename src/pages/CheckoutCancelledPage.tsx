import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { XCircle, Home, ArrowLeft } from 'lucide-react'

export default function CheckoutCancelledPage() {
  useEffect(() => {
    document.title = 'Checkout Not Completed — Neo-Browser'
  }, [])

  return (
    <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      <div className="max-w-lg mx-auto text-center">
        <XCircle size={56} className="text-outline mx-auto mb-6" aria-hidden="true" />
        <h1 className="text-display-mobile font-bold text-on-surface mb-4 tracking-tight">
          Checkout was not completed.
        </h1>
        <p className="text-body-lg text-secondary mb-8">
          No payment was completed. You can return to pricing and try again when ready.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/pricing" className="btn-primary gap-2 w-full sm:w-auto">
            <ArrowLeft size={16} aria-hidden="true" />
            Return to pricing
          </Link>
          <Link to="/" className="btn-secondary gap-2 w-full sm:w-auto">
            <Home size={16} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
