import { useState } from 'react'
import { Lock } from 'lucide-react'
import CheckoutModal from './CheckoutModal'

export default function PricingCard() {
  const [modalOpen, setModalOpen] = useState(false)

  const benefits = [
    { icon: '✓', text: 'Individual license — single device' },
    { icon: '✉', text: 'Activation code emailed after verified payment' },
    { icon: '◎', text: 'Email support' },
  ]

  return (
    <>
      <div className="bg-surface border border-border shadow-sm rounded-lg p-8 w-full max-w-md flex flex-col relative overflow-hidden mx-auto">
        {/* Accent top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" aria-hidden="true" />

        <div className="mb-6">
          <h2 className="text-title-lg font-semibold text-text mb-3">Neo-Browser Individual</h2>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-5xl font-bold text-text tracking-tight">₹299</span>
          </div>
          <p className="text-label-sm text-text-muted uppercase tracking-wide font-medium">
            One-time license payment
          </p>
        </div>

        <hr className="border-border mb-6" />

        <ul className="flex flex-col gap-4 mb-8 flex-grow" aria-label="Plan benefits">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-primary font-bold flex-shrink-0 mt-0.5" aria-hidden="true">{b.icon}</span>
              <span className="text-body-lg text-text">{b.text}</span>
            </li>
          ))}
        </ul>

        {/* CTA — opens checkout modal */}
        <button
          id="checkout-btn"
          onClick={() => setModalOpen(true)}
          className="btn-primary w-full gap-2"
        >
          <Lock size={16} aria-hidden="true" />
          Purchase Neo-Browser — ₹299
        </button>

        <p className="text-center text-label-sm text-text-muted mt-4 flex items-center justify-center gap-1">
          <Lock size={13} aria-hidden="true" />
          Secure payment via Cashfree
        </p>

        <p className="text-center text-xs text-text-muted mt-2">
          Already purchased?{' '}
          <a
            href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@neobrowser.app'}`}
            className="underline hover:no-underline text-primary"
          >
            Contact support
          </a>
        </p>
      </div>

      <CheckoutModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
