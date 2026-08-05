import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'

export default function AnnouncementStrip() {
  return (
    <div
      className="w-full bg-warning-bg border-b border-warning-border py-2 px-margin-mobile md:px-margin-desktop"
      role="complementary"
      aria-label="Product transparency notice"
    >
      <div className="flex items-center justify-center gap-2 text-center max-w-content mx-auto">
        <Info size={14} className="text-warning-text flex-shrink-0" aria-hidden="true" />
        <p className="text-xs text-warning-text">
          Neo-Browser is a general-purpose desktop browser. It is not represented as an exam-security or proctoring solution.{' '}
          <Link
            to="/product-clarity"
            className="font-semibold underline hover:no-underline focus-visible:ring-2 focus-visible:ring-focus rounded"
          >
            Read product details
          </Link>
        </p>
      </div>
    </div>
  )
}
