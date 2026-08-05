import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, RefreshCw, Code2, Layout, Monitor, PackageOpen, ArrowRight } from 'lucide-react'
import BrowserMockup from '../components/BrowserMockup'


export default function FeaturesPage() {
  useEffect(() => {
    document.title = 'Features — Neo-Browser'
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Neo-Browser Features</p>
          <h1 className="text-display-mobile md:text-headline-lg font-bold text-on-surface tracking-tight">
            Everything you need for straightforward browsing.
          </h1>
          <p className="text-body-lg text-secondary max-w-2xl mx-auto pt-2">
            A focused set of browser features for direct web access.
          </p>
        </div>
      </section>

      {/* Browser mockup section */}
      <section className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop pb-12" aria-label="Browser interface preview">
        <BrowserMockup />
      </section>

      {/* Bento grid features */}
      <section
        className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop"
        aria-labelledby="features-grid-heading"
      >
        <h2 id="features-grid-heading" className="sr-only">Feature details</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Row 1: Large (8) + Small (4) */}
          <div className="md:col-span-8 bg-surface-bright border border-border rounded-xl p-8 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center mb-6" aria-hidden="true">
              <Globe size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-on-surface mb-2">Go to any website</h3>
              <p className="text-body-lg text-on-surface-variant">
                Type any web address (like google.com) into the address bar, press Enter, and the page opens immediately.
              </p>
            </div>
          </div>
          <div className="md:col-span-4 bg-surface-bright border border-border rounded-xl p-8 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center mb-6" aria-hidden="true">
              <RefreshCw size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-on-surface mb-2">Instant page refresh</h3>
              <p className="text-body-lg text-on-surface-variant">Press F5 to reload the current webpage instantly at any time.</p>
            </div>
          </div>

          {/* Row 2: three equal cards */}
          <div className="md:col-span-4 bg-surface-bright border border-border rounded-xl p-8 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center mb-6" aria-hidden="true">
              <Code2 size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-on-surface mb-2">Developer shortcuts</h3>
              <p className="text-body-lg text-on-surface-variant">Press F12 or Ctrl+Shift+I to open developer tools. These shortcuts work when developer tools are supported.</p>
            </div>
          </div>
          <div className="md:col-span-4 bg-surface-bright border border-border rounded-xl p-8 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center mb-6" aria-hidden="true">
              <Layout size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-on-surface mb-2">Clean browser interface</h3>
              <p className="text-body-lg text-on-surface-variant">A straightforward layout with all browsing controls easy to reach, without distracting clutter.</p>
            </div>
          </div>
          <div className="md:col-span-4 bg-surface-bright border border-border rounded-xl p-8 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center mb-6" aria-hidden="true">
              <Monitor size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-on-surface mb-2">Desktop-focused experience</h3>
              <p className="text-body-lg text-on-surface-variant">Designed and tested for supported Windows desktop environments.</p>
            </div>
          </div>

          {/* Row 3: full-width installation card */}
          <div className="md:col-span-12 bg-surface-bright border border-border rounded-xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <PackageOpen size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-on-surface mb-2">Simple to install</h3>
              <p className="text-body-lg text-on-surface-variant">
                Run the installer and Neo-Browser is ready to use. No complex setup required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-surface-container-low border-t border-border py-section-padding-mobile md:py-section-padding-desktop">
        <div className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h2 className="text-headline-md font-bold text-on-surface mb-4">Ready to purchase?</h2>
          <p className="text-body-lg text-secondary mb-8">Choose a license and get started today.</p>
          <Link to="/pricing" className="btn-primary gap-2 inline-flex">
            View pricing <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
