import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import { PRIMARY_PHONE, BUSINESS_HOURS } from '@/lib/site'

// SEO/GEO audit (2026-07-05) flagged the lack of a site-wide FAQ page as a
// content gap — both for ranking on question-style searches and because
// FAQPage-structured Q&A is exactly the content shape AI answer engines
// (ChatGPT, Perplexity, Google AI Overviews) tend to quote directly.
// Scope: general company questions. Product-specific FAQ (smart shades /
// automation) stays on /smart-shades to avoid duplicating that content here.

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about custom drapery, roman shades, and Hunter Douglas window treatments from Angel Drapery — pricing, timelines, measuring, warranty, and our service area.',
  alternates: { canonical: '/faq' },
}

const categories = [
  {
    label: 'Getting Started',
    faqs: [
      {
        q: 'How much do custom window treatments cost?',
        a: 'Cost depends on the product, fabric, size, and any motorization — there\'s no single price list because every piece is made to your specific windows. We give you a transparent, itemized quote during your free in-home consultation before you commit to anything.',
      },
      {
        q: 'Is the in-home consultation and measurement really free?',
        a: 'Yes, with no obligation to purchase. We come to your home, measure every window ourselves, and bring fabric and material samples so you can see them in your actual light before deciding on anything.',
      },
      {
        q: 'What areas do you serve?',
        a: 'We\'re based in Temple City and serve the greater San Gabriel Valley and Los Angeles area, including Pasadena, Arcadia, San Marino, San Gabriel, and Alhambra. For larger projects we often travel further — call to ask about your specific location.',
      },
      {
        q: 'How do I get started?',
        a: `Call or text ${PRIMARY_PHONE}, or send a message through our contact page. We'll schedule a free in-home consultation and measurement at a time that works for you.`,
      },
    ],
  },
  {
    label: 'Products & Materials',
    faqs: [
      {
        q: 'Are you an authorized Hunter Douglas dealer?',
        a: 'Yes. We carry the full Hunter Douglas lineup — shades, blinds, shutters, and sheers & shadings — alongside our own handcrafted drapery and Luma Collection products, all made or fitted to your exact measurements.',
      },
      {
        q: 'How many fabric options are there for custom drapery and roman shades?',
        a: 'Our handcrafted roman shades alone come in 6 distinctive styles and 3,000+ fabric options. Custom drapery draws from thousands of fabrics across our workroom partners. We narrow this down together during your consultation based on your style and room.',
      },
      {
        q: 'Can you retrofit motorization onto shades or drapery I already own?',
        a: 'Often, yes — many roller shades and drapery tracks can be fitted with Somfy motors, and some existing Hunter Douglas products may accept PowerView upgrades depending on the model. We assess this during the free consultation. See our smart shades page for details on HomeKit, Google Home, and Matter compatibility.',
      },
      {
        q: 'Do you make custom drapery in-house, or is it outsourced?',
        a: 'In-house. Our own workroom has hand-sewn custom drapery since 1984 — we measure, fabricate, and install with our own team rather than outsourcing production.',
      },
    ],
  },
  {
    label: 'Process & Timeline',
    faqs: [
      {
        q: 'How long does an order take from measurement to installation?',
        a: 'It varies by product and fabric availability — handcrafted drapery and motorized systems generally take longer than in-stock shade lines. We give you a specific timeline estimate as part of your quote, once we know exactly what you\'re ordering.',
      },
      {
        q: 'How long does installation itself take?',
        a: 'A typical room is usually done in under an hour per window. Whole-home projects, or ones with motorization and smart-home setup, usually take a day, and we walk you through the controls before we leave.',
      },
      {
        q: 'What happens if my walls or windows aren\'t perfectly square?',
        a: 'Very common in older homes across the San Gabriel Valley. This is why we measure in person rather than relying on your own numbers — see our measuring guide for how we account for this during fabrication.',
      },
    ],
  },
  {
    label: 'Warranty & Policies',
    faqs: [
      {
        q: 'What warranty comes with my installation?',
        a: 'Our installation workmanship is covered by a three-year warranty — if anything we installed needs attention, we come back and fix it at no charge. Motors and hardware also carry their manufacturer warranties (Hunter Douglas, Somfy, Lutron), and we handle the manufacturer warranty process on your behalf if anything comes up.',
      },
      {
        q: 'Can I return or cancel a custom order?',
        a: 'Because every piece is cut and fabricated specifically to your window measurements, custom orders can\'t be resold or restocked once production begins — this is standard across the custom window treatment industry. We walk through every measurement, fabric, and option in detail before you approve an order, precisely so there are no surprises. Ask us about our specific order-change and cancellation window during your consultation.',
      },
      {
        q: 'What are your showroom hours?',
        a: `${BUSINESS_HOURS}. Showroom visits are by appointment only — call or submit our contact form to schedule a time.`,
      },
    ],
  },
]

const allFaqs = categories.flatMap((c) => c.faqs)

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allFaqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── 1. HERO ── */}
      <section className="relative w-full bg-[#12141C]">
        <SiteNav activePage="" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-40 md:pt-48 pb-20 md:pb-24">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Help Center
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white leading-[1.08] max-w-3xl">
            Frequently Asked Questions
          </h1>
          <p className="text-white/50 text-sm md:text-base leading-relaxed mt-6 max-w-xl">
            Answers to the questions we hear most, from pricing and timelines to warranty and our
            service area. Have something more specific?{' '}
            <Link href="/contact" className="underline hover:text-white">
              Send us a note
            </Link>{' '}
            or call {PRIMARY_PHONE}.
          </p>
        </div>
      </section>

      {/* ── 2. FAQ CATEGORIES ── */}
      {categories.map((cat, ci) => (
        <section key={cat.label} className={`w-full py-20 md:py-24 ${ci % 2 === 0 ? 'bg-white' : 'bg-[#F7F5F2]'}`}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
              {cat.label}
            </span>
            <div className="max-w-3xl space-y-8 mt-8">
              {cat.faqs.map((f) => (
                <div key={f.q} className="flex gap-4">
                  <div className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-1" />
                  <div>
                    <h2 className="text-base font-semibold text-[#12141C] mb-2 tracking-tight">{f.q}</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── 3. CROSS-LINKS ── */}
      <section className="w-full bg-white py-14 border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row gap-6 justify-center text-center">
            <Link href="/how-to-measure" className="text-sm font-medium text-[#4DB6E8] hover:underline">
              Read our measuring guide →
            </Link>
            <Link href="/smart-shades" className="text-sm font-medium text-[#4DB6E8] hover:underline">
              Smart shade &amp; automation FAQ →
            </Link>
            <Link href="/service-areas" className="text-sm font-medium text-[#4DB6E8] hover:underline">
              See all service areas →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. CTA ── */}
      <section className="w-full bg-[#12141C] py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Still Have Questions?
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-white mb-6">
            Let's talk about your windows.
          </h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-md mx-auto">
            Book a free in-home consultation — no obligation, no charge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`tel:${PRIMARY_PHONE}`}>
              <button className="px-10 py-4 bg-white text-[#12141C] text-sm font-medium tracking-[0.15em] uppercase hover:bg-gray-100 transition-colors rounded-full">
                Call {PRIMARY_PHONE}
              </button>
            </a>
            <Link href="/contact">
              <button className="px-10 py-4 border border-white/20 text-white text-sm font-medium tracking-[0.15em] uppercase hover:bg-white/10 transition-colors rounded-full">
                Request a Consultation
              </button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
