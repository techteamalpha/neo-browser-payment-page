import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Globe, RefreshCw, Code2 } from 'lucide-react'
import BrowserMockup from '../components/BrowserMockup'

const previewCards = [
  {
    icon: Globe,
    title: 'Features',
    description: 'Explore direct web navigation, F5 refresh, and F12 developer tools.',
    href: '/features',
    accent: 'bg-[rgba(230,36,41,0.15)] text-[#E62429] border border-[rgba(230,36,41,0.3)]',
  },
  {
    icon: () => <span className="text-[#FFD700] text-2xl font-bold font-display">₹</span>,
    title: 'Pricing — ₹299',
    description: 'Simple one-time individual license. No recurring subscriptions.',
    href: '/pricing',
    accent: 'bg-[rgba(255,215,0,0.15)] text-[#FFD700] border border-[rgba(255,215,0,0.3)]',
  },
  {
    icon: () => <span className="text-[#60A5FA] text-2xl font-bold">🕸️</span>,
    title: 'Product Clarity',
    description: 'Learn exactly what Neo-Browser is and isn\'t before purchasing.',
    href: '/product-clarity',
    accent: 'bg-[rgba(0,71,187,0.2)] text-[#60A5FA] border border-[rgba(0,71,187,0.3)]',
  },
]

export default function HomePage() {
  useEffect(() => {
    document.title = 'Neo-Browser — Spider Edition | Desktop Web Access'
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">

          {/* Copy column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.4)] text-[#E62429] text-xs font-bold uppercase tracking-wider">
              <span>🕷️</span> SPIDER-MATRIX DESKTOP BROWSING
            </div>
            <h1 className="text-display-mobile md:text-display font-display font-extrabold text-white tracking-tight leading-tight">
              A high-speed browser for <span className="text-[#E62429]">direct web access.</span>
            </h1>
            <p className="text-body-lg text-[#94A3B8] leading-relaxed">
              Neo-Browser provides a distraction-free, ultra-fast environment for accessing websites.
              Built for speed, reliability, and direct utility without bloatware.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/pricing"
                className="btn-primary w-full sm:w-auto text-center py-3.5 px-8"
              >
                Buy Neo-Browser — ₹299
              </Link>
              <Link
                to="/features"
                className="btn-secondary w-full sm:w-auto text-center py-3.5 px-6"
              >
                View features
              </Link>
            </div>
          </div>

          {/* Browser mockup column */}
          <div className="md:col-span-7 mt-8 md:mt-0">
            <BrowserMockup />
          </div>
        </div>
      </section>

      {/* Quick feature highlights */}
      <section className="w-full bg-[#0B1120] border-y border-[rgba(230,36,41,0.25)] py-10 relative">
        <div className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Globe, text: 'Direct web navigation' },
              { icon: RefreshCw, text: 'F5 page refresh' },
              { icon: Code2, text: 'F12 developer tools' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-3 text-white bg-[#0F172A] border border-[rgba(230,36,41,0.2)] rounded-xl p-4 shadow-[0_0_15px_rgba(0,0,0,0.4)] hover:border-[#E62429] transition-all">
                <div className="w-10 h-10 rounded-lg bg-[rgba(230,36,41,0.15)] flex items-center justify-center">
                  <Icon size={20} className="text-[#E62429]" aria-hidden="true" />
                </div>
                <span className="text-label-sm font-semibold tracking-wide">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview cards */}
      <section
        className="w-full bg-[#080C14] py-section-padding-mobile md:py-section-padding-desktop border-b border-[rgba(230,36,41,0.2)]"
        aria-labelledby="preview-heading"
      >
        <div className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop">
          <h2 id="preview-heading" className="sr-only">Explore Neo-Browser</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {previewCards.map(({ icon: IconComp, title, description, href, accent }) => (
              <Link
                key={href}
                to={href}
                className="block group bg-[#0F172A] rounded-2xl p-6 border border-[rgba(230,36,41,0.25)] hover:border-[#E62429] transition-all duration-200 h-full flex flex-col focus-visible:ring-2 focus-visible:ring-[#E62429]"
              >
                <div className={`w-12 h-12 rounded-xl ${accent} flex items-center justify-center mb-4`} aria-hidden="true">
                  <IconComp size={22} />
                </div>
                <h3 className="text-title-lg font-display font-bold text-white mb-2 group-hover:text-[#E62429] transition-colors">{title}</h3>
                <p className="text-body-lg text-[#94A3B8] mb-6 flex-grow">{description}</p>
                <div className="flex items-center gap-1.5 text-[#E62429] text-label-sm font-bold tracking-wide uppercase group-hover:translate-x-1 transition-transform">
                  Learn more <ArrowRight size={16} aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop"
        aria-labelledby="how-heading"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E62429] bg-[rgba(230,36,41,0.15)] px-3 py-1 rounded-full border border-[rgba(230,36,41,0.3)]">
            🕸️ Simple Process
          </span>
          <h2 id="how-heading" className="text-headline-md md:text-headline-lg font-display font-extrabold text-white mt-3">
            Purchase, install, browse
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {[
            { step: '1', title: 'Choose your license', desc: 'Select an individual license from the pricing page.' },
            { step: '2', title: 'Complete secure checkout', desc: 'Pay ₹299 using Cashfree PG hosted checkout.' },
            { step: '3', title: 'Download and activate', desc: 'Receive instant download and activation code by email.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-center text-center gap-4 bg-[#0F172A] border border-[rgba(230,36,41,0.25)] p-8 rounded-2xl relative hover:border-[#E62429] transition-colors">
              <div
                className="w-12 h-12 rounded-full bg-[#E62429] text-white flex items-center justify-center font-display font-extrabold text-xl flex-shrink-0"
                aria-label={`Step ${step}`}
              >
                {step}
              </div>
              <h3 className="text-title-md font-bold text-white">{title}</h3>
              <p className="text-body-lg text-[#94A3B8]">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
