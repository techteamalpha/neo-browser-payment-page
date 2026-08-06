import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <div className="space-y-3" role="list">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        const panelId = `faq-panel-${i}`
        const headerId = `faq-header-${i}`

        return (
          <div
            key={i}
            role="listitem"
            className={`bg-[#0F172A] border rounded-xl overflow-hidden transition-all duration-200 ${
              isOpen
                ? 'border-[#E62429] shadow-[0_0_25px_rgba(230,36,41,0.25)]'
                : 'border-[rgba(230,36,41,0.25)] hover:border-[#E62429]'
            }`}
          >
            <h3>
              <button
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#E62429] focus-visible:ring-inset focus:outline-none group"
              >
                <span className="text-title-md font-bold text-white group-hover:text-[#E62429] transition-colors">
                  {item.question}
                </span>
                <ChevronDown
                  size={20}
                  className={`faq-chevron flex-shrink-0 text-[#E62429] transition-transform duration-200 ${isOpen ? 'rotate-180 drop-shadow-[0_0_8px_#E62429]' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
            >
              <div className="px-6 pb-6 faq-content">
                <p className="text-body-lg text-[#94A3B8] leading-relaxed">{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
