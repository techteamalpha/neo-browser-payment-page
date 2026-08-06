import { useEffect } from 'react'
import FAQAccordion from '../components/FAQAccordion'
import type { FAQItem } from '../components/FAQAccordion'

const faqItems: FAQItem[] = [
  {
    question: 'Is Neo-Browser an exam lockdown or proctoring browser?',
    answer:
      'No. Neo-Browser is a general-purpose desktop browser and does not claim to offer exam-security, proctoring, anti-cheating, or device-enforcement controls.',
  },
  {
    question: 'What can I do with Neo-Browser?',
    answer:
      'You can enter website addresses, browse directly, refresh pages with F5, and access developer tools using supported shortcuts (F12 or Ctrl+Shift+I).',
  },
  {
    question: 'What happens after I pay?',
    answer:
      'After payment is successfully verified, applicable download and license instructions are sent by email.',
  },
  {
    question: 'Which operating systems are supported?',
    answer:
      '[Supported operating systems] — This information will be updated when confirmed, tested, and released platforms are finalized.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'Refer to the published Refund Policy for eligibility and conditions.',
  },
  {
    question: 'How can I get support?',
    answer:
      'Contact support through the contact page or email [support email].',
  },
]

export default function FAQPage() {
  useEffect(() => {
    document.title = 'FAQ — Neo-Browser Spider Edition'
  }, [])

  return (
    <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.4)] text-[#E62429] text-xs font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(230,36,41,0.3)]">
          <span>🕷️</span> Support Knowledge Base
        </div>
        <h1 className="text-display-mobile md:text-headline-lg font-display font-extrabold text-white tracking-tight">
          Frequently asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E62429] via-[#FF5257] to-[#60A5FA]">questions.</span>
        </h1>
        <p className="text-body-lg text-[#94A3B8] leading-relaxed">
          Common questions about Neo-Browser, licensing, and support.
        </p>
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto">
        <FAQAccordion items={faqItems} />
      </div>
    </div>
  )
}
