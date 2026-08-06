import { useState } from 'react'
import { Lock, Zap, Shield, Mail } from 'lucide-react'
import CheckoutModal from './CheckoutModal'

export default function PricingCard() {
  const [modalOpen, setModalOpen] = useState(false)

  const benefits = [
    { icon: Zap, text: 'Spider-Suit Individual License — single device' },
    { icon: Mail, text: 'Instant activation code emailed upon payment' },
    { icon: Shield, text: 'Priority Email & Technical Support' },
  ]

  return (
    <>
      <div className="bg-[#0F172A]/95 border border-[rgba(230,36,41,0.35)] shadow-[0_0_35px_rgba(230,36,41,0.25)] rounded-2xl p-8 w-full max-w-md flex flex-col relative overflow-hidden mx-auto backdrop-blur-xl group hover:border-[#E62429] transition-all duration-300">
        {/* Accent top border glow */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#E62429] via-[#FFD700] to-[#0047BB]" aria-hidden="true" />

        {/* Spider Emblem Badge */}
        <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.4)] text-[#E62429] text-xs font-bold uppercase tracking-wider mb-4">
          <span>🕷️</span> Spider-Neo Individual License
        </div>

        <div className="mb-6">
          <h2 className="text-headline-md font-display font-extrabold text-white mb-2">
            Neo-Browser — ₹299
          </h2>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E62429] via-[#FF4D52] to-[#FFD700] drop-shadow-[0_0_15px_rgba(230,36,41,0.6)]">
              ₹299
            </span>
            <span className="text-label-sm text-[#94A3B8]">/ lifetime</span>
          </div>
          <p className="text-xs text-[#94A3B8] uppercase tracking-widest font-semibold mt-1">
            One-time license • No monthly fees
          </p>
        </div>

        <hr className="border-[rgba(230,36,41,0.2)] mb-6" />

        <ul className="flex flex-col gap-4 mb-8 flex-grow" aria-label="Plan benefits">
          {benefits.map(({ icon: IconComp, text }, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.3)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconComp size={13} className="text-[#E62429]" aria-hidden="true" />
              </div>
              <span className="text-body-lg text-white font-medium">{text}</span>
            </li>
          ))}
        </ul>

        {/* CTA — opens checkout modal */}
        <button
          id="checkout-btn"
          onClick={() => setModalOpen(true)}
          className="btn-primary w-full gap-2 text-base py-3.5"
        >
          <Lock size={18} aria-hidden="true" />
          Purchase Neo-Browser — ₹299
        </button>

        <p className="text-center text-label-sm text-[#94A3B8] mt-4 flex items-center justify-center gap-1.5">
          <Lock size={13} className="text-[#E62429]" aria-hidden="true" />
          Encrypted payment via Cashfree PG
        </p>

        <p className="text-center text-xs text-[#94A3B8] mt-2">
          Questions?{' '}
          <a
            href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@neobrowser.app'}`}
            className="underline hover:text-[#E62429] text-white font-semibold transition-colors"
          >
            Contact support
          </a>
        </p>
      </div>

      <CheckoutModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
