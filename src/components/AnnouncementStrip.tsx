import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function AnnouncementStrip() {
  return (
    <div
      className="w-full bg-[#18140B] border-b border-[rgba(255,215,0,0.3)] py-2.5 px-margin-mobile md:px-margin-desktop relative z-10"
      role="complementary"
      aria-label="Product transparency notice"
    >
      <div className="flex items-center justify-center gap-2 text-center max-w-content mx-auto">
        <ShieldAlert size={16} className="text-[#FFD700] flex-shrink-0 animate-pulse" aria-hidden="true" />
        <p className="text-xs text-[#E2E8F0] tracking-wide">
          <span className="font-bold text-[#FFD700] uppercase mr-1">🕸️ Spider-Sense Notice:</span>
          Neo-Browser is a general-purpose desktop browser. It is not an exam-security or proctoring solution.{' '}
          <Link
            to="/product-clarity"
            className="font-bold underline hover:text-[#FFD700] text-[#E62429] focus-visible:ring-2 focus-visible:ring-[#E62429] rounded"
          >
            Read product clarity
          </Link>
        </p>
      </div>
    </div>
  )
}
