import type { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  large?: boolean
}

export default function FeatureCard({ icon: Icon, title, description, large = false }: FeatureCardProps) {
  return (
    <div
      className={`card p-8 flex flex-col justify-between hover:shadow-sm transition-shadow duration-200 ${large ? 'md:col-span-8' : 'md:col-span-4'}`}
    >
      <div
        className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center mb-6"
        aria-hidden="true"
      >
        <Icon size={22} className="text-primary" />
      </div>
      <div>
        <h3 className="text-headline-md font-bold text-on-surface mb-2">{title}</h3>
        <p className="text-body-lg text-on-surface-variant">{description}</p>
      </div>
    </div>
  )
}
