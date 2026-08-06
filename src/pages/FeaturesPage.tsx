import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, RefreshCw, Code2, Layout, Monitor, PackageOpen, ArrowRight } from 'lucide-react'
import BrowserMockup from '../components/BrowserMockup'


export default function FeaturesPage() {
  useEffect(() => {
    document.title = 'Features — Neo-Browser Spider Edition'
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.4)] text-[#E62429] text-xs font-bold uppercase tracking-widest">
            <span>🕷️</span> Spider-Matrix Capabilities
          </div>
          <h1 className="text-display-mobile md:text-headline-lg font-display font-extrabold text-white tracking-tight leading-tight">
            Everything you need for <span className="text-[#E62429]">direct web browsing.</span>
          </h1>
          <p className="text-body-lg text-[#94A3B8] max-w-2xl mx-auto pt-2 leading-relaxed">
            A focused set of desktop browser capabilities built for speed, direct navigation, and developer utility.
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
          <div className="md:col-span-8 bg-[#0F172A] border border-[rgba(230,36,41,0.25)] rounded-2xl p-8 flex flex-col justify-between hover:border-[#E62429] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.3)] flex items-center justify-center mb-6" aria-hidden="true">
              <Globe size={24} className="text-[#E62429]" />
            </div>
            <div>
              <h3 className="text-headline-md font-display font-extrabold text-white mb-2">Go to any website</h3>
              <p className="text-body-lg text-[#94A3B8] leading-relaxed">
                Type any web address (like google.com or placement.skct.edu.in) into the address bar, press Enter, and the page opens immediately.
              </p>
            </div>
          </div>
          <div className="md:col-span-4 bg-[#0F172A] border border-[rgba(230,36,41,0.25)] rounded-2xl p-8 flex flex-col justify-between hover:border-[#E62429] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.3)] flex items-center justify-center mb-6" aria-hidden="true">
              <RefreshCw size={24} className="text-[#E62429]" />
            </div>
            <div>
              <h3 className="text-headline-md font-display font-extrabold text-white mb-2">Instant page refresh</h3>
              <p className="text-body-lg text-[#94A3B8] leading-relaxed">Press F5 to reload the current webpage instantly at any time.</p>
            </div>
          </div>

          {/* Row 2: three equal cards */}
          <div className="md:col-span-4 bg-[#0F172A] border border-[rgba(230,36,41,0.25)] rounded-2xl p-8 flex flex-col justify-between hover:border-[#E62429] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.3)] flex items-center justify-center mb-6" aria-hidden="true">
              <Code2 size={24} className="text-[#E62429]" />
            </div>
            <div>
              <h3 className="text-headline-md font-display font-extrabold text-white mb-2">Developer shortcuts</h3>
              <p className="text-body-lg text-[#94A3B8] leading-relaxed">Press F12 or Ctrl+Shift+I to open developer tools instantly.</p>
            </div>
          </div>
          <div className="md:col-span-4 bg-[#0F172A] border border-[rgba(230,36,41,0.25)] rounded-2xl p-8 flex flex-col justify-between hover:border-[#E62429] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.3)] flex items-center justify-center mb-6" aria-hidden="true">
              <Layout size={24} className="text-[#E62429]" />
            </div>
            <div>
              <h3 className="text-headline-md font-display font-extrabold text-white mb-2">Clean browser interface</h3>
              <p className="text-body-lg text-[#94A3B8] leading-relaxed">A straightforward layout with all browsing controls easy to reach without clutter.</p>
            </div>
          </div>
          <div className="md:col-span-4 bg-[#0F172A] border border-[rgba(230,36,41,0.25)] rounded-2xl p-8 flex flex-col justify-between hover:border-[#E62429] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.3)] flex items-center justify-center mb-6" aria-hidden="true">
              <Monitor size={24} className="text-[#E62429]" />
            </div>
            <div>
              <h3 className="text-headline-md font-display font-extrabold text-white mb-2">Desktop-focused</h3>
              <p className="text-body-lg text-[#94A3B8] leading-relaxed">Designed and optimized for Windows desktop environments.</p>
            </div>
          </div>

          {/* Row 3: full-width installation card */}
          <div className="md:col-span-12 bg-[#0F172A] border border-[rgba(230,36,41,0.25)] rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-[#E62429] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.3)] flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <PackageOpen size={24} className="text-[#E62429]" />
            </div>
            <div>
              <h3 className="text-headline-md font-display font-extrabold text-white mb-2">Simple to install</h3>
              <p className="text-body-lg text-[#94A3B8] leading-relaxed">
                Run the installer and Neo-Browser is ready to use immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-[#0B1120] border-t border-[rgba(230,36,41,0.25)] py-section-padding-mobile md:py-section-padding-desktop">
        <div className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h2 className="text-headline-md font-display font-extrabold text-white mb-4">Ready to purchase?</h2>
          <p className="text-body-lg text-[#94A3B8] mb-8">Get your individual license for ₹299 today.</p>
          <Link to="/pricing" className="btn-primary gap-2 inline-flex text-base py-3.5 px-8">
            View pricing — ₹299 <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
