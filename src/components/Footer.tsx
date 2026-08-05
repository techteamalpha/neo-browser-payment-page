import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

const footerLinks = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/security', label: 'Security Disclosure' },
  { to: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-border w-full">
      <div className="w-full max-w-content mx-auto py-10 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-gutter">
        {/* Brand + description */}
        <div className="flex flex-col items-center md:items-start gap-1.5">
          <Link to="/" className="font-bold text-primary text-xl leading-none hover:opacity-80 transition-opacity">
            Neo-Browser
          </Link>
          <p className="text-label-sm text-text-muted text-center md:text-left max-w-xs">
            A general-purpose desktop browser for direct web access.
          </p>
          <p className="text-label-xs text-text-muted">
            © {currentYear} Neo-Browser. All rights reserved.
          </p>
        </div>

        {/* Footer links */}
        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {footerLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-label-sm text-text-muted hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-focus rounded"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
