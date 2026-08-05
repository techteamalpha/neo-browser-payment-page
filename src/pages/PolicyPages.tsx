import { useEffect } from 'react'

interface PolicySection {
  heading: string
  content: string
}

interface PolicyPageTemplateProps {
  title: string
  lastUpdated: string
  intro: string
  sections: PolicySection[]
  legalNotice?: string
}

export function PolicyPageTemplate({ title, lastUpdated, intro, sections, legalNotice }: PolicyPageTemplateProps) {
  return (
    <div className="w-full max-w-content mx-auto px-margin-mobile md:px-margin-desktop py-section-padding-mobile md:py-section-padding-desktop">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-display-mobile md:text-headline-lg font-bold text-on-surface tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-label-sm text-text-muted">Last updated: {lastUpdated}</p>
          {intro && <p className="text-body-lg text-secondary mt-4">{intro}</p>}
        </header>

        {legalNotice && (
          <div
            role="note"
            className="mb-8 p-4 bg-warning-bg border border-warning-border rounded-lg"
          >
            <p className="text-label-sm text-warning-text font-medium">{legalNotice}</p>
          </div>
        )}

        <div className="space-y-10">
          {sections.map((s, i) => (
            <section key={i} className="policy-section" aria-labelledby={`section-${i}`}>
              <h2 id={`section-${i}`} className="text-title-lg font-semibold text-on-surface mb-4">
                {s.heading}
              </h2>
              <div className="text-body-lg text-secondary whitespace-pre-line">
                {s.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Privacy Policy ───────────────────────────────────────────────────────────
export function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy — Neo-Browser'
  }, [])

  return (
    <PolicyPageTemplate
      title="Privacy Policy"
      lastUpdated="[Date — review before launch]"
      intro="This policy describes how Neo-Browser handles information related to your use of the website and product."
      legalNotice="⚠ This is a template. All sections must be reviewed by qualified legal counsel before accepting payments or publishing."
      sections={[
        {
          heading: 'Information collected',
          content:
            'When you purchase a license, we collect the information required to process your order, including your email address. We do not directly collect or store raw payment card data. Payment processing is handled by a third-party provider.',
        },
        {
          heading: 'How information is used',
          content:
            'Your email address is used to deliver purchase confirmations, license instructions, and download access. We do not sell, rent, or share your personal information with third parties for marketing purposes.',
        },
        {
          heading: 'Payment processing',
          content:
            'Payments are processed by [payment provider]. We do not receive or store your full card details. The payment provider\'s privacy policy applies to information you provide during checkout.',
        },
        {
          heading: 'Data retention',
          content:
            'Order and contact records are retained for [retention period — to be specified]. You may request deletion of your data by contacting us at [support email].',
        },
        {
          heading: 'User rights',
          content:
            'Depending on your jurisdiction, you may have the right to access, correct, or delete personal data we hold about you. Contact [support email] to exercise these rights.',
        },
        {
          heading: 'Contact information',
          content:
            'For privacy-related questions, contact: [support email].',
        },
      ]}
    />
  )
}

// ─── Terms of Service ─────────────────────────────────────────────────────────
export function TermsPage() {
  useEffect(() => {
    document.title = 'Terms of Service — Neo-Browser'
  }, [])

  return (
    <PolicyPageTemplate
      title="Terms of Service"
      lastUpdated="[Date — review before launch]"
      intro="By purchasing or using Neo-Browser, you agree to these terms. Read them carefully before purchasing."
      legalNotice="⚠ This is a template. All sections must be reviewed by qualified legal counsel before accepting payments or publishing."
      sections={[
        {
          heading: 'Product license',
          content:
            'Upon purchasing a Neo-Browser Individual license, you receive a non-exclusive, non-transferable license to install and use Neo-Browser on one device for personal use. The license does not permit redistribution, reverse engineering, or commercial resale.',
        },
        {
          heading: 'Acceptable use',
          content:
            'Neo-Browser is a general-purpose desktop browser. You agree to use it only for lawful purposes and in accordance with applicable laws and regulations.',
        },
        {
          heading: 'Payments',
          content:
            'All purchases are processed through [payment provider]. Prices are listed in Indian Rupees (₹) unless otherwise stated. [Tax treatment — specify whether prices include or exclude applicable taxes].',
        },
        {
          heading: 'Refunds',
          content:
            'Refund eligibility and conditions are governed by the published Refund Policy. [Refund Policy link]. Contact [support email] to initiate a refund request.',
        },
        {
          heading: 'Disclaimers',
          content:
            'Neo-Browser is provided "as is" without warranties of any kind, express or implied. We do not warrant that the software will be error-free or uninterrupted.',
        },
        {
          heading: 'Limitation of liability',
          content:
            'To the maximum extent permitted by applicable law, Neo-Browser\'s total liability for any claim arising from your use of the product is limited to the amount you paid for the license.',
        },
        {
          heading: 'Contact',
          content:
            'For questions about these terms, contact: [support email].',
        },
      ]}
    />
  )
}

// ─── Security Disclosure ──────────────────────────────────────────────────────
export function SecurityPage() {
  useEffect(() => {
    document.title = 'Security Disclosure — Neo-Browser'
  }, [])

  return (
    <PolicyPageTemplate
      title="Security Disclosure"
      lastUpdated="[Date — review before launch]"
      intro="We take security issues seriously. If you believe you have found a vulnerability in Neo-Browser, please follow the process below."
      legalNotice="⚠ This is a template. Review with qualified legal counsel before publishing."
      sections={[
        {
          heading: 'Reporting a vulnerability',
          content:
            'If you discover a potential security issue, please report it responsibly by emailing [security email]. Do not disclose the issue publicly until we have had a reasonable opportunity to investigate and respond.',
        },
        {
          heading: 'Reporting email',
          content:
            'Security reports should be sent to: [security email]\n\nPlease include a clear description of the issue, steps to reproduce it, and any relevant technical details.',
        },
        {
          heading: 'Responsible disclosure process',
          content:
            '1. Submit your report to [security email].\n2. We will acknowledge receipt within [X business days — to be specified].\n3. We will investigate and keep you informed of progress.\n4. Once resolved, we will coordinate public disclosure with you where appropriate.',
        },
        {
          heading: 'Legal safe harbor',
          content:
            '[Legal safe harbor statement — to be completed with qualified legal counsel. This section should clarify that good-faith security research conducted in accordance with this policy will not result in legal action against the reporter.]',
        },
      ]}
    />
  )
}
