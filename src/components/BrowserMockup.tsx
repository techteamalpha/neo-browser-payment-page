import { Globe, ShieldCheck } from 'lucide-react'

export default function BrowserMockup() {
  return (
    <div className="card overflow-hidden flex flex-col h-[400px] md:h-[480px] border border-[rgba(230,36,41,0.35)] relative group bg-[#0F172A]">
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#E62429]" aria-hidden="true" />

      {/* Browser chrome / toolbar */}
      <div className="bg-[#0B1120] border-b border-[rgba(230,36,41,0.25)] h-12 flex items-center px-4 gap-4 flex-shrink-0">
        {/* Traffic lights */}
        <div className="flex gap-2" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-[#E62429]" />
          <div className="w-3 h-3 rounded-full bg-[#FFD700]" />
          <div className="w-3 h-3 rounded-full bg-[#0047BB]" />
        </div>
        {/* Address bar */}
        <div className="flex-grow bg-[#0F172A] border border-[rgba(230,36,41,0.3)] rounded-lg h-8 flex items-center px-3 gap-2 text-[#94A3B8] max-w-2xl">
          <ShieldCheck size={14} className="text-[#E62429] flex-shrink-0" aria-hidden="true" />
          <span className="text-xs font-mono text-white tracking-wide truncate">https://placement.skct.edu.in</span>
        </div>
      </div>

      {/* Browser content area */}
      <div className="flex-grow bg-[#090D16] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <div className="z-10 flex flex-col items-center gap-3 text-center px-8 max-w-md">
          <div className="w-20 h-20 rounded-full bg-[#0F172A] border border-[rgba(230,36,41,0.4)] flex items-center justify-center mb-1">
            <Globe size={40} className="text-[#E62429]" aria-hidden="true" />
          </div>
          <h3 className="font-display font-extrabold text-white text-xl tracking-wider">
            SPIDER MATRIX READY
          </h3>
          <p className="text-body-lg text-[#94A3B8]">
            Direct, distraction-free desktop web browsing powered by Neo-Browser.
          </p>
        </div>

        {/* Status bar */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-[#0B1120] border-t border-[rgba(230,36,41,0.2)] flex items-center justify-between px-4">
          <span className="text-xs text-[#E62429] font-mono font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E62429]" />
            Spider-Sense: Web Active
          </span>
          <span className="text-[11px] text-[#94A3B8] font-mono">F5 Refresh • F12 DevTools</span>
        </div>
      </div>
    </div>
  )
}
