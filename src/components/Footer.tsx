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
    <footer className="bg-[#080C14] border-t border-[rgba(230,36,41,0.25)] w-full relative z-10">
      <div className="w-full max-w-content mx-auto py-12 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-gutter">
        {/* Brand + description */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-[#E62429] text-xl leading-none hover:opacity-90 transition-opacity">
            <span className="text-lg">🕷️</span>
            <span className="bg-gradient-to-r from-[#E62429] to-[#FF5257] bg-clip-text text-transparent">
              Neo-Browser
            </span>
          </Link>
          <p className="text-label-sm text-[#94A3B8] text-center md:text-left max-w-xs">
            A high-speed, general-purpose desktop browser for direct web access.
          </p>
          <p className="text-label-xs text-[#64748B]">
            © {currentYear} Neo-Browser. All rights reserved.
          </p>
        </div>

        {/* Footer links */}
        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {footerLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-label-sm text-[#94A3B8] hover:text-[#E62429] transition-colors focus-visible:ring-2 focus-visible:ring-[#E62429] rounded px-2 py-1 hover:bg-[rgba(230,36,41,0.1)]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
