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
      className={`bg-[#0F172A] border border-[rgba(230,36,41,0.25)] rounded-2xl p-8 flex flex-col justify-between hover:border-[#E62429] hover:shadow-[0_0_30px_rgba(230,36,41,0.3)] transition-all duration-300 ${large ? 'md:col-span-8' : 'md:col-span-4'}`}
    >
      <div
        className="w-12 h-12 rounded-xl bg-[rgba(230,36,41,0.15)] border border-[rgba(230,36,41,0.3)] flex items-center justify-center mb-6 shadow-md"
        aria-hidden="true"
      >
        <Icon size={24} className="text-[#E62429] drop-shadow-[0_0_8px_#E62429]" />
      </div>
      <div>
        <h3 className="text-headline-md font-display font-extrabold text-white mb-2">{title}</h3>
        <p className="text-body-lg text-[#94A3B8] leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
