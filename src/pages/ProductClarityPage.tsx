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
    document.title = 'Product Clarity — Neo-Browser Spider Edition'
  }, [])

  return (
    <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.4)] text-[#E62429] text-xs font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(230,36,41,0.3)]">
          <span>🕷️</span> Transparency & Scope
        </div>
        <h1 className="text-display-mobile md:text-headline-lg font-display font-extrabold text-white tracking-tight">
          Clear product <span className="text-[#E62429]">information.</span>
        </h1>
        <p className="text-body-lg text-[#94A3B8] leading-relaxed">
          Neo-Browser is described accurately according to its actual implemented desktop capabilities.
        </p>
      </div>

      {/* Two-column sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-16">
        {/* What it does */}
        <section
          className="bg-[#0F172A] border border-[rgba(16,185,129,0.3)] rounded-2xl p-8 hover:border-[#10B981] transition-all"
          aria-labelledby="does-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <CheckCircle size={22} className="text-[#10B981]" />
            </div>
            <h2 id="does-heading" className="text-title-lg font-display font-bold text-white">
              What Neo-Browser DOES
            </h2>
          </div>
          <ul className="space-y-4" role="list">
            {doesList.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle size={18} className="text-[#10B981] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-body-lg text-[#E2E8F0] font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What it does NOT claim */}
        <section
          className="bg-[#0F172A] border border-[rgba(230,36,41,0.3)] rounded-2xl p-8 hover:border-[#E62429] transition-all"
          aria-labelledby="does-not-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/30 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <XCircle size={22} className="text-[#E62429]" />
            </div>
            <h2 id="does-not-heading" className="text-title-lg font-display font-bold text-white">
              What Neo-Browser DOES NOT claim
            </h2>
          </div>
          <ul className="space-y-4" role="list">
            {doesNotList.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <XCircle size={18} className="text-[#E62429] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-body-lg text-[#E2E8F0] font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* CTA */}
      <div className="text-center border-t border-[rgba(230,36,41,0.2)] pt-12">
        <h2 className="text-headline-md font-display font-extrabold text-white mb-3">Have more questions?</h2>
        <p className="text-body-lg text-[#94A3B8] mb-6">Our FAQ covers common questions about Neo-Browser.</p>
        <Link to="/faq" className="btn-primary inline-flex gap-2 py-3.5 px-8 text-base">
          Read frequently asked questions <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
