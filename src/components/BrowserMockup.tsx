import { Globe } from 'lucide-react'

export default function BrowserMockup() {
  return (
    <div className="card overflow-hidden flex flex-col h-[400px] md:h-[480px] shadow-sm">
      {/* Browser chrome / toolbar */}
      <div className="bg-surface-container-low border-b border-border h-12 flex items-center px-4 gap-4 flex-shrink-0">
        {/* Traffic lights */}
        <div className="flex gap-2" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
        </div>
        {/* Address bar */}
        <div className="flex-grow bg-surface border border-border rounded h-8 flex items-center px-3 gap-2 text-text-muted max-w-2xl">
          <Globe size={14} className="flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-mono truncate">https://example.com</span>
        </div>
      </div>

      {/* Browser content area */}
      <div className="flex-grow bg-surface-bright flex flex-col items-center justify-center gap-4 relative">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #005c55 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />
        <div className="z-10 flex flex-col items-center gap-3 text-center px-8">
          <Globe size={48} className="text-primary opacity-20" aria-hidden="true" />
          <p className="font-semibold text-on-surface-variant text-lg">Ready to browse</p>
          <p className="text-body-lg text-secondary max-w-sm">
            Enter a URL above to begin navigating the web directly.
          </p>
        </div>

        {/* Status bar */}
        <div className="absolute bottom-0 left-0 w-full h-7 bg-surface-container-low border-t border-border flex items-center px-3">
          <span className="text-xs text-text-muted font-mono">Status: Ready</span>
        </div>
      </div>
    </div>
  )
}
