import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react'

const doesList = [
  'Supports direct website navigation.',
  'Supports page refresh using F5.',
  'Supports F12 and Ctrl+Shift+I developer-tool shortcuts when available.',
  'Provides a clean desktop browser interface.',
]

const doesNotList = [
  'It is not a proctoring system.',
  'It is not an exam lockdown browser.',
  'It does not enforce assessments.',
  'It does not claim to block other applications.',
  'It does not claim to prevent cheating.',
]

export default function ProductClarityPage() {
  useEffect(() => {
    document.title = 'Product Clarity — Neo-Browser'
  }, [])

  return (
    <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h1 className="text-display-mobile md:text-headline-lg font-bold text-on-surface tracking-tight mb-4">
          Clear product information.
        </h1>
        <p className="text-body-lg text-secondary">
          Neo-Browser is described according to its implemented capabilities.
        </p>
      </div>

      {/* Two-column sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-16">
        {/* What it does */}
        <section
          className="card p-8"
          aria-labelledby="does-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <CheckCircle size={20} className="text-success" />
            </div>
            <h2 id="does-heading" className="text-title-lg font-semibold text-on-surface">
              What Neo-Browser does
            </h2>
          </div>
          <ul className="space-y-4" role="list">
            {doesList.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle size={18} className="text-success flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-body-lg text-on-surface">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What it does NOT claim */}
        <section
          className="card p-8 bg-surface"
          aria-labelledby="does-not-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <XCircle size={20} className="text-error" />
            </div>
            <h2 id="does-not-heading" className="text-title-lg font-semibold text-on-surface">
              What Neo-Browser does not claim to do
            </h2>
          </div>
          <ul className="space-y-4" role="list">
            {doesNotList.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <XCircle size={18} className="text-error flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-body-lg text-on-surface">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* CTA */}
      <div className="text-center border-t border-border pt-12">
        <h2 className="text-headline-md font-bold text-on-surface mb-3">Have more questions?</h2>
        <p className="text-body-lg text-secondary mb-6">Our FAQ covers common questions about Neo-Browser.</p>
        <Link to="/faq" className="btn-primary inline-flex gap-2">
          Read frequently asked questions <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
