interface PageHeroProps {
  eyebrow?: string
  heading: string
  description?: string
  centered?: boolean
}

export default function PageHero({ eyebrow, heading, description, centered = true }: PageHeroProps) {
  return (
    <section className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop relative">
      <div className={`${centered ? 'text-center max-w-3xl mx-auto' : ''} space-y-4`}>
        {eyebrow && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.4)] text-[#E62429] text-xs font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(230,36,41,0.3)]">
            <span>🕷️</span> {eyebrow}
          </div>
        )}
        <h1 className="text-display-mobile md:text-headline-lg font-display font-extrabold text-white tracking-tight leading-tight">
          {heading}
        </h1>
        {description && (
          <p className="text-body-lg text-[#94A3B8] max-w-2xl mx-auto pt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
