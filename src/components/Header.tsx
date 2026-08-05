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
    <header className="bg-surface border-b border-border shadow-sm sticky top-0 z-50 w-full">
      {/* Skip navigation */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="flex justify-between items-center h-16 w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Logo / Wordmark */}
        <Link
          to="/"
          className="font-bold text-primary text-xl leading-none focus-visible:ring-2 focus-visible:ring-focus rounded"
          aria-label="Neo-Browser — Home"
        >
          Neo-Browser
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="hidden md:flex gap-2 items-center">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-label-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-focus ${
                  isActive
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-secondary hover:text-primary hover:bg-surface-container-low'
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
            Download Now
          </Link>

          {/* Mobile menu button */}
          <button
            ref={btnRef}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-on-surface hover:text-primary hover:bg-surface-container-low rounded transition-colors focus-visible:ring-2 focus-visible:ring-focus"
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
          className="md:hidden bg-surface border-t border-border absolute top-16 left-0 w-full z-40 shadow-md"
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
                  `px-4 py-3 rounded text-body-lg font-medium transition-colors min-h-[44px] flex items-center ${
                    isActive
                      ? 'text-primary bg-surface-container-low font-semibold'
                      : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/pricing"
              className="btn-primary mt-2 w-full"
            >
              Download Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
