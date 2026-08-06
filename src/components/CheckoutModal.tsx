import { useState, useEffect, useRef } from 'react'
import { X, Lock, Loader2, AlertCircle, Mail, Phone, CheckSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { createCheckoutSession, initCashfreeCheckout } from '../lib/checkout'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

type ModalStep = 'form' | 'loading' | 'redirecting' | 'error'

// Validate Indian mobile number: 10 digits starting with 6-9, optional +91 prefix
function validatePhone(phone: string): string | null {
  const cleaned = phone.replace(/\s/g, '')
  if (/^\+91[6-9]\d{9}$/.test(cleaned)) return cleaned
  if (/^[6-9]\d{9}$/.test(cleaned)) return `+91${cleaned}`
  return null
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<ModalStep>('form')
  const isSubmitting = step === 'loading' || step === 'redirecting'
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; phone?: string; agreed?: string; form?: string }>({})
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50)
      setStep('form')
      setErrors({})
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && step === 'form') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, step, onClose])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  function validate(): boolean {
    const errs: typeof errors = {}

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.'
    }

    const normalizedPhone = validatePhone(phone)
    if (!normalizedPhone) {
      errs.phone = 'Enter a valid 10-digit Indian mobile number (e.g. 98765 43210).'
    }

    if (!agreed) {
      errs.agreed = 'You must agree to continue.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const normalizedPhone = validatePhone(phone)!
    setStep('loading')
    setErrors({})

    try {
      const { paymentSessionId, orderId } = await createCheckoutSession(
        email.trim().toLowerCase(),
        normalizedPhone
      )

      setStep('redirecting')
      await initCashfreeCheckout(paymentSessionId, orderId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setStep('error')
      setErrors({ form: message })
    }
  }

  const labelClass = 'block text-label-sm font-semibold text-white mb-1.5'
  const inputClass = (err?: string) =>
    `w-full border rounded-lg px-4 py-3 text-body-lg text-white bg-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#E62429] transition-all ${err ? 'border-error' : 'border-[rgba(230,36,41,0.3)] hover:border-[#E62429]'}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={step === 'form' ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-auto bg-[#0B1120] rounded-2xl border border-[rgba(230,36,41,0.4)] overflow-hidden z-10"
      >
        {/* Accent bar */}
        <div className="h-1.5 w-full bg-[#E62429]" aria-hidden="true" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 id="checkout-modal-title" className="text-title-lg font-display font-extrabold text-white flex items-center gap-2">
            <span>🕷️</span> Complete your purchase
          </h2>
          {step === 'form' && (
            <button
              onClick={onClose}
              aria-label="Close checkout"
              className="text-[#94A3B8] hover:text-white hover:bg-[rgba(230,36,41,0.2)] transition-colors p-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-[#E62429]"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Price summary */}
        <div className="mx-6 mb-4 bg-[#0F172A] border border-[rgba(230,36,41,0.25)] rounded-xl px-4 py-3 flex items-center justify-between shadow-inner">
          <div>
            <p className="text-label-sm font-bold text-white">Neo-Browser Individual</p>
            <p className="text-xs text-[#94A3B8]">One-time license · Single device</p>
          </div>
          <p className="text-2xl font-display font-extrabold text-[#E62429]">₹299</p>
        </div>

        {/* Loading state */}
        {(step === 'loading' || step === 'redirecting') && (
          <div className="px-6 pb-8 flex flex-col items-center gap-4 text-center">
            <Loader2 size={40} className="animate-spin text-[#E62429]" aria-hidden="true" />
            <div>
              <p className="font-bold text-white text-lg">
                {step === 'redirecting' ? 'Opening secure checkout…' : 'Preparing checkout…'}
              </p>
              <p className="text-label-sm text-[#94A3B8] mt-1">
                You will be redirected to Cashfree's secure payment page.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        {(step === 'form' || step === 'error') && (
          <form onSubmit={handleSubmit} noValidate className="px-6 pb-6 space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="checkout-email" className={labelClass}>
                <Mail size={14} className="inline mr-1.5 -mt-0.5 text-[#E62429]" aria-hidden="true" />
                Email address
              </label>
              <input
                id="checkout-email"
                ref={firstInputRef}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
                placeholder="you@example.com"
                aria-describedby={errors.email ? 'err-email' : undefined}
                aria-invalid={!!errors.email}
                className={inputClass(errors.email)}
              />
              {errors.email && (
                <p id="err-email" role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden="true" /> {errors.email}
                </p>
              )}
              <p className="mt-1 text-xs text-[#94A3B8]">
                Your activation code will be emailed here after payment verification.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="checkout-phone" className={labelClass}>
                <Phone size={14} className="inline mr-1.5 -mt-0.5 text-[#E62429]" aria-hidden="true" />
                Mobile number
              </label>
              <div className="flex">
                <span className="flex items-center px-3 bg-[#0F172A] border border-r-0 border-[rgba(230,36,41,0.3)] rounded-l-lg text-[#94A3B8] text-sm font-semibold select-none">
                  +91
                </span>
                <input
                  id="checkout-phone"
                  type="tel"
                  autoComplete="tel-national"
                  required
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })) }}
                  placeholder="98765 43210"
                  maxLength={12}
                  aria-describedby={errors.phone ? 'err-phone' : 'phone-hint'}
                  aria-invalid={!!errors.phone}
                  className={`flex-grow border rounded-r-lg px-4 py-3 text-body-lg text-white bg-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#E62429] transition-all ${errors.phone ? 'border-error' : 'border-[rgba(230,36,41,0.3)] hover:border-[#E62429]'}`}
                />
              </div>
              {errors.phone ? (
                <p id="err-phone" role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden="true" /> {errors.phone}
                </p>
              ) : (
                <p id="phone-hint" className="mt-1 text-xs text-[#94A3B8]">
                  Collected for payment processing by Cashfree only. Not stored in marketing lists.
                </p>
              )}
            </div>

            {/* Agreement checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    id="checkout-agree"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: undefined })) }}
                    className="sr-only"
                    aria-describedby={errors.agreed ? 'err-agreed' : undefined}
                    aria-invalid={!!errors.agreed}
                  />
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${agreed ? 'bg-[#E62429] border-[#E62429]' : errors.agreed ? 'border-error' : 'border-[rgba(230,36,41,0.4)] group-hover:border-[#E62429]'}`}>
                    {agreed && <CheckSquare size={14} className="text-white" aria-hidden="true" />}
                  </div>
                </div>
                <span className="text-sm text-[#E2E8F0] leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-[#E62429] font-semibold underline hover:text-[#FF5257]">Terms of Service</Link>,{' '}
                  <Link to="/privacy" target="_blank" className="text-[#E62429] font-semibold underline hover:text-[#FF5257]">Privacy Policy</Link>, and{' '}
                  Refund Policy.
                </span>
              </label>
              {errors.agreed && (
                <p id="err-agreed" role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden="true" /> {errors.agreed}
                </p>
              )}
            </div>

            {/* Form-level error */}
            {errors.form && (
              <div role="alert" className="flex items-start gap-2 p-3 bg-red-950/80 border border-red-500/50 text-red-200 rounded-lg text-label-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
                <div>
                  <p>{errors.form}</p>
                  <button type="submit" className="font-semibold underline mt-1 hover:no-underline text-white">
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full gap-2 text-base py-3"
              disabled={isSubmitting}
            >
              <Lock size={16} aria-hidden="true" />
              Continue to secure checkout — ₹299
            </button>

            <p className="text-center text-xs text-[#94A3B8]">
              <Lock size={11} className="inline mr-1 text-[#E62429]" aria-hidden="true" />
              Secure payment via Cashfree. Your card details are never shared with us.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
