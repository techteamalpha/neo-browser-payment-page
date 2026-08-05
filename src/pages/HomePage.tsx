import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Globe, RefreshCw, Code2 } from 'lucide-react'
import BrowserMockup from '../components/BrowserMockup'

const previewCards = [
  {
    icon: Globe,
    title: 'Features',
    description: 'Explore direct navigation and developer tools.',
    href: '/features',
    accent: 'bg-primary-container text-on-primary-container',
  },
  {
    icon: () => <span className="text-on-surface-variant text-xl">₹</span>,
    title: 'Pricing',
    description: 'Simple individual licensing.',
    href: '/pricing',
    accent: 'bg-surface-container text-on-surface-variant',
  },
  {
    icon: () => <span className="text-on-surface-variant text-xl">◎</span>,
    title: 'Product Clarity',
    description: 'What Neo-Browser is and isn\'t.',
    href: '/product-clarity',
    accent: 'bg-surface-container text-on-surface-variant',
  },
]

export default function HomePage() {
  useEffect(() => {
    document.title = 'Neo-Browser — A simple desktop browser for direct web access'
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">

          {/* Copy column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              FOCUSED DESKTOP BROWSING
            </p>
            <h1 className="text-display-mobile md:text-display font-bold text-on-surface tracking-tight">
              A simple desktop browser for direct web access.
            </h1>
            <p className="text-body-lg text-secondary">
              Neo-Browser provides a straightforward, distraction-light environment for accessing websites.
              Built for utility and reliability without unnecessary features.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/pricing"
                className="btn-primary w-full sm:w-auto text-center"
              >
                Buy Neo-Browser — ₹299
              </Link>
              <Link
                to="/features"
                className="btn-secondary w-full sm:w-auto text-center"
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
      <section className="w-full bg-surface-container-low border-t border-border py-10">
        <div className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Globe, text: 'Direct web navigation' },
              { icon: RefreshCw, text: 'F5 page refresh' },
              { icon: Code2, text: 'F12 developer tools' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-3 text-secondary">
                <Icon size={18} className="text-primary flex-shrink-0" aria-hidden="true" />
                <span className="text-label-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview cards */}
      <section
        className="w-full bg-surface-container-low pb-section-padding-mobile md:pb-section-padding-desktop border-b border-border"
        aria-labelledby="preview-heading"
      >
        <div className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop">
          <h2 id="preview-heading" className="sr-only">Explore Neo-Browser</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {previewCards.map(({ icon: IconComp, title, description, href, accent }) => (
              <Link
                key={href}
                to={href}
                className="block group bg-surface rounded-xl p-6 border border-border hover:shadow-sm transition-all h-full flex flex-col focus-visible:ring-2 focus-visible:ring-focus"
              >
                <div className={`w-12 h-12 rounded-lg ${accent} flex items-center justify-center mb-4`} aria-hidden="true">
                  <IconComp size={22} />
                </div>
                <h3 className="text-title-lg font-semibold text-on-surface mb-2">{title}</h3>
                <p className="text-body-lg text-secondary mb-6 flex-grow">{description}</p>
                <div className="flex items-center gap-1 text-primary text-label-sm font-medium group-hover:underline">
                  Learn more <ArrowRight size={14} aria-hidden="true" />
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
        <h2 id="how-heading" className="text-headline-md font-bold text-on-surface text-center mb-12">
          Purchase, install, browse
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {[
            { step: '1', title: 'Choose your license', desc: 'Select an individual license from the pricing page.' },
            { step: '2', title: 'Complete secure checkout', desc: 'Pay using the supported payment provider hosted checkout.' },
            { step: '3', title: 'Download and activate', desc: 'Receive download and license instructions by email after payment is verified.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-center text-center gap-4">
              <div
                className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-title-md flex-shrink-0"
                aria-label={`Step ${step}`}
              >
                {step}
              </div>
              <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
              <p className="text-body-lg text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
