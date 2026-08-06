import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Home, ArrowRight } from 'lucide-react'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found — Neo-Browser Spider Edition'
  }, [])

  return (
    <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      <div className="max-w-lg mx-auto text-center bg-[#0F172A] border border-[rgba(230,36,41,0.3)] rounded-2xl p-8">
        <div
          className="w-20 h-20 rounded-2xl bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.4)] flex items-center justify-center mx-auto mb-6"
          aria-hidden="true"
        >
          <Globe size={40} className="text-[#E62429]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#E62429] bg-[rgba(230,36,41,0.15)] px-3 py-1 rounded-full border border-[rgba(230,36,41,0.3)] inline-block mb-3">
          🕷️ 404 — SPIDER MATRIX NOT FOUND
        </p>
        <h1 className="text-display-mobile font-display font-extrabold text-white mb-4 tracking-tight">
          Page Not Found.
        </h1>
        <p className="text-body-lg text-[#94A3B8] mb-8 leading-relaxed">
          The web coordinate you are looking for does not exist in this spider matrix.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary gap-2 w-full sm:w-auto py-3.5 px-6">
            <Home size={18} aria-hidden="true" />
            Back to home
          </Link>
          <Link to="/pricing" className="btn-secondary gap-2 w-full sm:w-auto py-3.5 px-6">
            View pricing — ₹299 <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
