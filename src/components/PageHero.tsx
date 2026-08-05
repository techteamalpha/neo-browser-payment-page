interface PageHeroProps {
  eyebrow?: string
  heading: string
  description?: string
  centered?: boolean
}

export default function PageHero({ eyebrow, heading, description, centered = true }: PageHeroProps) {
  return (
    <section className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      <div className={`${centered ? 'text-center max-w-3xl mx-auto' : ''} space-y-4`}>
        {eyebrow && (
          <p className="text-title-md text-primary font-semibold tracking-wide uppercase text-sm">
            {eyebrow}
          </p>
        )}
        <h1 className="text-display-mobile md:text-headline-lg font-bold text-on-surface tracking-tight">
          {heading}
        </h1>
        {description && (
          <p className="text-body-lg text-secondary max-w-2xl mx-auto pt-2">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
