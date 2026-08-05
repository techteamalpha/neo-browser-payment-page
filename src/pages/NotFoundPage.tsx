import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Home, ArrowRight } from 'lucide-react'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found — Neo-Browser'
  }, [])

  return (
    <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      <div className="max-w-lg mx-auto text-center">
        <div
          className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-8"
          aria-hidden="true"
        >
          <Globe size={40} className="text-primary opacity-40" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">404 — Not Found</p>
        <h1 className="text-display-mobile font-bold text-on-surface mb-4 tracking-tight">
          Page not found.
        </h1>
        <p className="text-body-lg text-secondary mb-10">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary gap-2 w-full sm:w-auto">
            <Home size={16} aria-hidden="true" />
            Back to home
          </Link>
          <Link to="/pricing" className="btn-secondary gap-2 w-full sm:w-auto">
            View pricing <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
