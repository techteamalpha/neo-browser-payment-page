import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/product-clarity', label: 'Product Clarity' },
  { to: '/faq', label: 'FAQ' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  // Escape key closes menu
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileOpen])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header className="bg-[#080C14]/90 backdrop-blur-md border-b border-[rgba(230,36,41,0.25)] shadow-[0_4px_25px_rgba(230,36,41,0.15)] sticky top-0 z-50 w-full">
      {/* Skip navigation */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="flex justify-between items-center h-16 w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Logo / Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 font-display font-extrabold text-[#E62429] text-xl tracking-wider hover:scale-[1.03] transition-transform focus-visible:ring-2 focus-visible:ring-[#E62429] rounded"
          aria-label="Neo-Browser — Home"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E62429] to-[#0047BB] flex items-center justify-center text-white text-lg shadow-[0_0_15px_rgba(230,36,41,0.5)]">
            🕸️
          </span>
          <span className="bg-gradient-to-r from-[#E62429] via-[#FF5257] to-[#60A5FA] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(230,36,41,0.5)]">
            Neo-Browser
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="hidden md:flex gap-1 items-center bg-[#0F172A]/80 border border-[rgba(230,36,41,0.2)] rounded-full px-3 py-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-full text-label-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#E62429] ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-[#E62429] to-[#0047BB] shadow-[0_0_12px_rgba(230,36,41,0.5)]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(230,36,41,0.15)]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/pricing"
            className="hidden md:inline-flex btn-primary"
          >
            Get Neo-Browser
          </Link>

          {/* Mobile menu button */}
          <button
            ref={btnRef}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white hover:text-[#E62429] hover:bg-[rgba(230,36,41,0.15)] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#E62429]"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="md:hidden bg-[#0F172A] border-t border-[rgba(230,36,41,0.25)] absolute top-16 left-0 w-full z-40 shadow-2xl"
          role="dialog"
          aria-label="Mobile navigation"
          aria-modal="true"
        >
          <nav className="flex flex-col p-4 gap-1" aria-label="Mobile navigation">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-body-lg font-medium transition-colors min-h-[44px] flex items-center ${
                    isActive
                      ? 'text-white bg-[#E62429] font-bold shadow-[0_0_15px_rgba(230,36,41,0.4)]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(230,36,41,0.15)]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/pricing"
              className="btn-primary mt-3 w-full"
            >
              Get Neo-Browser — ₹299
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
