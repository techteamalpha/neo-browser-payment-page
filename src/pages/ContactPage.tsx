import { useEffect, useState } from 'react'
import { Mail, User, Hash, MessageSquare, FileText, SendHorizonal, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

type FormState = 'idle' | 'loading' | 'success' | 'error'

interface FormData {
  name: string
  email: string
  orderId: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [data, setData] = useState<FormData>({
    name: '',
    email: '',
    orderId: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    document.title = 'Contact Support — Neo-Browser'
  }, [])

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!data.name.trim()) e.name = 'Name is required.'
    if (!data.email.trim()) e.email = 'Email is required.'
    else if (!validateEmail(data.email)) e.email = 'Enter a valid email address.'
    if (!data.subject.trim()) e.subject = 'Subject is required.'
    if (!data.message.trim()) e.message = 'Message is required.'
    else if (data.message.trim().length < 10) e.message = 'Message must be at least 10 characters.'
    return e
  }

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setData((d) => ({ ...d, [field]: e.target.value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Focus first error
      const firstErrField = Object.keys(errs)[0]
      document.getElementById(`field-${firstErrField}`)?.focus()
      return
    }

    setFormState('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Submission failed.')
      setFormState('success')
    } catch {
      setFormState('error')
      setErrorMessage('Your message could not be sent. Please try again or email us directly.')
    }
  }

  const labelClass = 'block text-label-sm font-semibold text-white mb-1.5'
  const inputClass = (err?: string) =>
    `w-full border rounded-lg px-4 py-3 text-body-lg text-white bg-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#E62429] transition-all ${
      err ? 'border-error focus:ring-error' : 'border-[rgba(230,36,41,0.3)] hover:border-[#E62429]'
    }`

  if (formState === 'success') {
    return (
      <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
        <div className="max-w-lg mx-auto text-center bg-[#0F172A] border border-[rgba(230,36,41,0.3)] rounded-2xl p-8 shadow-[0_0_30px_rgba(230,36,41,0.2)]">
          <CheckCircle size={48} className="text-[#10B981] mx-auto mb-6" aria-hidden="true" />
          <h1 className="text-headline-md font-display font-extrabold text-white mb-3">Message Sent</h1>
          <p className="text-body-lg text-[#94A3B8]">
            Thank you for reaching out. We will review your message and respond to your email promptly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      <div className="max-w-2xl mx-auto">
        {/* Heading */}
        <div className="mb-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.4)] text-[#E62429] text-xs font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(230,36,41,0.3)]">
            <span>🕷️</span> Support Center
          </div>
          <h1 className="text-display-mobile md:text-headline-lg font-display font-extrabold text-white tracking-tight">
            Contact <span className="text-[#E62429]">Neo-Browser Support.</span>
          </h1>
          <p className="text-body-lg text-[#94A3B8] leading-relaxed">
            Use the form below to get in touch with our team directly.
          </p>
        </div>

        {/* Contact form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-[#0F172A] border border-[rgba(230,36,41,0.3)] rounded-2xl p-8 space-y-6"
          aria-label="Contact support form"
        >
          {/* Name */}
          <div>
            <label htmlFor="field-name" className={labelClass}>
              <User size={14} className="inline mr-1.5 -mt-0.5 text-[#E62429]" aria-hidden="true" />
              Name
            </label>
            <input
              id="field-name"
              type="text"
              autoComplete="name"
              required
              value={data.name}
              onChange={handleChange('name')}
              placeholder="Your full name"
              aria-describedby={errors.name ? 'err-name' : undefined}
              aria-invalid={!!errors.name}
              className={inputClass(errors.name)}
            />
            {errors.name && (
              <p id="err-name" role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                <AlertCircle size={12} aria-hidden="true" /> {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="field-email" className={labelClass}>
              <Mail size={14} className="inline mr-1.5 -mt-0.5 text-[#E62429]" aria-hidden="true" />
              Email
            </label>
            <input
              id="field-email"
              type="email"
              autoComplete="email"
              required
              value={data.email}
              onChange={handleChange('email')}
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
          </div>

          {/* Order ID (optional) */}
          <div>
            <label htmlFor="field-orderId" className={labelClass}>
              <Hash size={14} className="inline mr-1.5 -mt-0.5 text-[#E62429]" aria-hidden="true" />
              Order ID{' '}
              <span className="font-normal text-[#94A3B8]">(optional)</span>
            </label>
            <input
              id="field-orderId"
              type="text"
              value={data.orderId}
              onChange={handleChange('orderId')}
              placeholder="e.g. ORD-12345"
              className={inputClass()}
            />
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="field-subject" className={labelClass}>
              <FileText size={14} className="inline mr-1.5 -mt-0.5 text-[#E62429]" aria-hidden="true" />
              Subject
            </label>
            <input
              id="field-subject"
              type="text"
              required
              value={data.subject}
              onChange={handleChange('subject')}
              placeholder="Brief description of your issue"
              aria-describedby={errors.subject ? 'err-subject' : undefined}
              aria-invalid={!!errors.subject}
              className={inputClass(errors.subject)}
            />
            {errors.subject && (
              <p id="err-subject" role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                <AlertCircle size={12} aria-hidden="true" /> {errors.subject}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="field-message" className={labelClass}>
              <MessageSquare size={14} className="inline mr-1.5 -mt-0.5 text-[#E62429]" aria-hidden="true" />
              Message
            </label>
            <textarea
              id="field-message"
              required
              rows={5}
              value={data.message}
              onChange={handleChange('message')}
              placeholder="Describe your issue or question…"
              aria-describedby={errors.message ? 'err-message' : undefined}
              aria-invalid={!!errors.message}
              className={`${inputClass(errors.message)} resize-y`}
            />
            {errors.message && (
              <p id="err-message" role="alert" className="mt-1.5 text-xs text-error flex items-center gap-1">
                <AlertCircle size={12} aria-hidden="true" /> {errors.message}
              </p>
            )}
          </div>

          {/* Global error */}
          {formState === 'error' && (
            <div role="alert" className="flex items-start gap-2 p-3 bg-red-950/80 border border-red-500/50 text-red-200 rounded-lg text-label-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
              <p>{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={formState === 'loading'}
            className="btn-primary w-full gap-2 text-base py-3.5"
            aria-busy={formState === 'loading'}
          >
            {formState === 'loading' ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Sending message…
              </>
            ) : (
              <>
                <SendHorizonal size={18} aria-hidden="true" />
                Send message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
