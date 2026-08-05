import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PricingCard from '../components/PricingCard'

export default function PricingPage() {
  useEffect(() => {
    document.title = 'Pricing — Neo-Browser'
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-display-mobile md:text-headline-lg font-bold text-text mb-4 tracking-tight">
            Simple pricing for Neo-Browser.
          </h1>
          <p className="text-body-lg text-text-muted">
            Choose an individual license and receive download and activation instructions after verified payment.
          </p>
        </div>

        {/* Pricing card */}
        <PricingCard />

        {/* Policy links */}
        <p className="text-center text-label-sm text-text-muted mt-8">
          By purchasing you agree to our{' '}
          <Link to="/terms" className="underline hover:no-underline text-primary focus-visible:ring-2 focus-visible:ring-focus rounded">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:no-underline text-primary focus-visible:ring-2 focus-visible:ring-focus rounded">
            Privacy Policy
          </Link>.
        </p>
      </section>
    </>
  )
}
