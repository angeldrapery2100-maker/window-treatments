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
        a: 'For free in-home measurement and installation, we serve the greater San Gabriel Valley and Los Angeles area — Temple City, Pasadena, Arcadia, San Marino, San Gabriel, Alhambra, and nearby. For larger projects we often travel further — call to ask about your specific location. A curated selection of our in-house products (drapery, roman shades, and the Luma collection) can also be ordered online with instant configurator pricing, shipped to the continental United States and Canada.',
      },
      {
        q: 'How do I get started?',
        a: `Call or text ${PRIMARY_PHONE}, or send a message through our contact page. We'll schedule a free in-home consultation and measurement at a time that works for you.`,
      },
      {
        q: 'Do you offer payment plans like Affirm or Klarna?',
        a: 'Not currently — card payment only for now. If that changes we\'ll update this page.',
      },
    ],
  },
  {
    label: 'Products & Materials',
    faqs: [
      {
        q: 'Are you an authorized Hunter Douglas dealer?',
        a: 'Yes — plus Sundance, JC, and Lutron Palladiom. Those brand-name lines are quoted through a free consultation rather than online. Our own products — handcrafted drapery, handcrafted roman shades, and the Luma collection (roller, zebra, sheer, and dual shades) — are made in our own workroom and priced instantly in our online configurator.',
      },
      {
        q: 'How many fabric options are there for custom drapery and roman shades?',
        a: 'Our handcrafted roman shades come in 6 styles — flat, slouch, soft, front fold, reverse fold, and hobbled. Our online store keeps the fabric selection intentionally curated — each listed product has its own page with a focused set of colors and a custom-size configurator. For our full fabric range across drapery and roman shades, book a free in-home consultation and we\'ll bring the complete collection to you.',
      },
      {
        q: 'Can I order free fabric swatches before committing?',
        a: 'Yes — order up to 10 free fabric swatches online, you only pay shipping ($2.99 standard, 5–8 days, or $9.99 expedited, 2–3 days). It\'s the easiest way to see and feel a fabric in your own home before ordering a full custom piece.',
      },
      {
        q: 'Can you retrofit motorization onto shades or drapery I already own?',
        a: 'Often, yes — many roller shades and drapery tracks can be fitted with Somfy motors, and some existing Hunter Douglas products may accept PowerView upgrades depending on the model. We assess this during the free consultation. See our smart shades page for details on HomeKit, Google Home, and Matter compatibility.',
      },
      {
        q: 'Do you make custom drapery in-house, or is it outsourced?',
        a: 'In-house. Our own workroom has hand-sewn custom drapery since 1984 — we measure, fabricate, and install with our own team rather than outsourcing production.',
      },
      {
        q: 'What about bay windows, arches, or other unusual window shapes?',
        a: 'Bay windows, corner windows, arches and other special shapes, and French doors are handled through a free in-home consultation rather than the online configurator — these need an expert eye, not a standard measurement.',
      },
    ],
  },
  {
    label: 'Process & Timeline',
    faqs: [
      {
        q: 'How long does an order take from measurement to installation?',
        a: 'Online store orders typically ship within about 2 weeks of order confirmation, though it can vary by product and fabric availability. For local in-home projects, we give you a specific timeline estimate as part of your quote, once we know exactly what you\'re ordering and whether installation is included.',
      },
      {
        q: 'How long does installation itself take?',
        a: 'A typical room is usually done in under an hour per window. Whole-home projects, or ones with motorization and smart-home setup, usually take a day, and we walk you through the controls before we leave.',
      },
      {
        q: 'What happens if my walls or windows aren\'t perfectly square?',
        a: 'Very common in older homes across the San Gabriel Valley. This is why we measure in person rather than relying on your own numbers — see our measuring guide for how we account for this during fabrication.',
      },
      {
        q: 'How do I check the status of an existing order?',
        a: 'Use our order tracking page with your order number and email — no account needed. For anything beyond tracking (changes, issues, refunds), reach out directly and a real person will help.',
      },
      {
        q: 'Can I change or cancel my order after I place it?',
        a: 'Production typically begins about 48 hours after you place your order — within that window, contact us and we can make changes. If you cancel within that 48-hour window, the card processor\'s transaction fee is deducted from your refund. Once production has started, reach out right away and we\'ll see what\'s still possible.',
      },
      {
        q: 'Why does my drapery arrive with wrinkles or creases?',
        a: 'It\'s normal. Before shipping, we hang and steam each panel smooth, then fold it along its natural pleats to fit the box — that folding is what creates the crease lines. They typically relax once the drapery has been hanging for a bit, and a garment steamer speeds that up. Linen-blend fabrics tend to show creasing a bit more visibly than others; a light steam or iron helps.',
      },
    ],
  },
  {
    label: 'Warranty & Policies',
    faqs: [
      {
        q: 'What warranty comes with my installation?',
        a: 'Our installation workmanship is covered by a three-year warranty — if anything we installed needs attention, we come back and fix it at no charge. Our own Luma shades also carry a product warranty of their own: five years on roller, sheer, dual roller and dual sheer shades, and three years on zebra and modern roman shades. Motors and hardware from other brands carry their manufacturer warranties (Hunter Douglas, Somfy, Lutron), and we handle that process on your behalf. Full details are on our warranty page.',
      },
      {
        q: 'My Luma shade is out of warranty — do I have to pay full price to replace it?',
        a: 'No. Once the product warranty ends, the same window can be re-shaded with any Luma product at 50% off the current list price — same window, same size, original purchaser, one replacement per window. The half-price covers the shade itself; installation, shipping and sales tax are separate.',
      },
      {
        q: 'I ordered online and installed it myself — is it still covered?',
        a: 'Yes, the product warranty is the same. Because we didn\'t install it, service is handled by shipping rather than a service visit: we send replacement parts, or arrange for the shade to come back to our workroom for repair, and we cover shipping both ways within the warranty period. On-site service isn\'t included outside our installation service area.',
      },
      {
        q: 'What if I measured wrong and the piece doesn\'t fit?',
        a: 'We can remake or adjust it — you\'d just cover return shipping both ways. It\'s a manageable fix, but ordering free swatches first and measuring carefully (or booking the free in-home measurement) is the easiest way to skip that extra cost and wait entirely.',
      },
      {
        q: 'What if there\'s a manufacturing defect or quality problem?',
        a: 'Let us know within 14 days of delivery. If it\'s a genuine quality or manufacturing issue (not a measurement error), we\'ll remake the item or have it shipped back for repair, and we cover the cost.',
      },
      {
        q: 'I\'m installing my hardware myself and a part arrived damaged — what do I do?',
        a: 'Let us know right away, whether you notice it on arrival or while installing — we\'ll ship you a replacement part.',
      },
      {
        q: 'What are your showroom hours?',
        a: `${BUSINESS_HOURS}. Showroom visits are by appointment only — call or submit our contact form to schedule a time.`,
      },
      {
        q: 'Who do I call if something goes wrong with a Sundance or JC product?',
        a: 'Us. Sundance warrants its products to you directly and JC Window Fashions warrants through us as the retailer, but either way the practical answer is the same — call Angel Drapery and we handle the manufacturer claim on your behalf. Our own three-year installation warranty covers the service visit, the labor and the measuring, which neither manufacturer covers.',
      },
      {
        q: 'How long do Sundance and JC products take to make?',
        a: 'Sundance roller shades and wood blinds are made in Arcadia and typically take 3–4 weeks. JC woven wood shades and Cambridge shutters are imported and typically take 5–8 weeks. Those are production times, not installation dates — we confirm the install date once the workshop schedule is set.',
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
