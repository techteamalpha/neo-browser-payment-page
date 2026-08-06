import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PricingCard from '../components/PricingCard'

export default function PricingPage() {
  useEffect(() => {
    document.title = 'Pricing — Neo-Browser Spider Edition'
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.4)] text-[#E62429] text-xs font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(230,36,41,0.3)]">
            <span>🕷️</span> Simple One-Time Pricing
          </div>
          <h1 className="text-display-mobile md:text-headline-lg font-display font-extrabold text-white tracking-tight">
            Simple pricing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E62429] via-[#FF5257] to-[#FFD700]">Neo-Browser.</span>
          </h1>
          <p className="text-body-lg text-[#94A3B8] leading-relaxed">
            Choose an individual license for ₹299 and receive instant download & activation code via email.
          </p>
        </div>

        {/* Pricing card */}
        <PricingCard />

        {/* Policy links */}
        <p className="text-center text-label-sm text-[#94A3B8] mt-8">
          By purchasing you agree to our{' '}
          <Link to="/terms" className="underline hover:text-[#E62429] text-white font-semibold focus-visible:ring-2 focus-visible:ring-[#E62429] rounded">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-[#E62429] text-white font-semibold focus-visible:ring-2 focus-visible:ring-[#E62429] rounded">
            Privacy Policy
          </Link>.
        </p>
      </section>
    </>
  )
}
