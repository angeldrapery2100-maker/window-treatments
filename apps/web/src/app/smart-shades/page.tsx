import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import FooterSocial from '@/components/FooterSocial'
import { COPYRIGHT, PRIMARY_PHONE } from '@/lib/site'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Smart Motorized Shades | HomeKit, Google Home, Matter',
  description:
    'Smart motorized shades that work with Apple HomeKit, Google Home, Matter, and Home Assistant. Somfy and Hunter Douglas PowerView motorization, installed in the San Gabriel Valley since 1984.',
  alternates: { canonical: '/smart-shades' },
}

const platforms = [
  { name: 'Apple HomeKit', desc: 'Control shades from the Home app, Siri, and HomeKit scenes and automations.' },
  { name: 'Google Home', desc: 'Voice control with Google Assistant and routines across your Google devices.' },
  { name: 'Matter', desc: 'The cross-platform standard — Matter-enabled shades work across ecosystems without lock-in.' },
  { name: 'Home Assistant', desc: 'Full local control and deep automation for households that run their own hub.' },
]

const scenes = [
  {
    title: 'Morning rise',
    desc: 'Bedroom shades lift gradually at your wake-up time — daylight instead of an alarm. Weekends can run on a later schedule automatically.',
  },
  {
    title: 'Sunset privacy',
    desc: 'Street-facing shades close on their own as the sun goes down, tracking actual sunset time through the seasons rather than a fixed clock.',
  },
  {
    title: 'Movie mode',
    desc: 'One command darkens the living room: blackout shades down, sheers closed — paired with your lights if you like.',
  },
  {
    title: 'Away simulation',
    desc: 'While you travel, shades open and close on a natural-looking schedule so the house reads as occupied.',
  },
]

const faqs = [
  {
    q: 'Do smart shades work without internet?',
    a: 'Yes. Remotes and wall keypads talk directly to the motors, so daily control works even if your Wi-Fi is down. App control and voice assistants need your home network; some platforms (like Home Assistant, and HomeKit over a local hub) keep automations running locally without cloud access.',
  },
  {
    q: 'What happens during a power outage?',
    a: 'Battery-powered and rechargeable motors keep working through an outage. Hardwired motors pause until power returns, and shades simply stay where they are — many models also allow gentle manual operation. Nothing needs reprogramming afterward.',
  },
  {
    q: 'Can you retrofit my existing shades or drapery?',
    a: 'Often, yes. Many roller shades and drapery tracks can be fitted with Somfy motors, and existing Hunter Douglas products may accept PowerView upgrades depending on the model. We assess this during the free in-home consultation.',
  },
  {
    q: 'How long does installation take?',
    a: 'A typical room is done in under an hour per window, including motor pairing and app setup. Whole-home projects with hub configuration and scene programming usually take a day, and we walk you through the controls before we leave.',
  },
  {
    q: 'What warranty do I get?',
    a: 'Our installation workmanship is covered by a 3-year warranty. The motors themselves carry their manufacturer warranties from Somfy or Hunter Douglas, and we handle the warranty process on your behalf if anything comes up.',
  },
  {
    q: 'Which platform should I choose?',
    a: 'Usually the one you already use. iPhone household? HomeKit. Google speakers everywhere? Google Home. If you want maximum flexibility or run your own server, Home Assistant or Matter-enabled motors keep every option open. We help you match the motor system to your setup.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function SmartShadesPage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── 1. HERO ── */}
      <section className="relative w-full bg-[#12141C]">
        <SiteNav activePage="Products" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-40 md:pt-48 pb-20 md:pb-24">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Motorization &amp; Automation
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white leading-[1.08] max-w-3xl">
            Smart Shades That Work With Your Home
          </h1>
          <p className="text-white/50 text-sm md:text-base leading-relaxed mt-6 max-w-xl">
            Motorized shades and drapery that connect to Apple HomeKit, Google Home, Matter, and
            Home Assistant — designed, installed, and configured by one local team.
          </p>
        </div>
      </section>

      {/* ── 2. PLATFORMS ── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
            Works With
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-12">
            Your platform, not ours.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((p) => (
              <div key={p.name} className="bg-[#F7F5F2] rounded-2xl p-7">
                <div className="w-8 h-1 rounded-full bg-[#4DB6E8]/40 mb-5" />
                <h3 className="text-base font-semibold text-[#12141C] mb-2 tracking-tight">{p.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. MOTORIZATION OPTIONS ── */}
      <section className="w-full bg-[#F7F5F2] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
            Motorization Options
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-12">
            Two proven motor systems.
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 md:p-10">
              <h3 className="text-xl font-semibold text-[#12141C] tracking-tight mb-4">Somfy</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                The motorization standard for custom drapery tracks and roller shades, and our usual
                choice when motorizing treatments sewn in our own workroom.
              </p>
              <div className="space-y-4">
                {[
                  { t: 'Wire-free options', d: 'Battery and rechargeable motors — no electrician needed for most windows.' },
                  { t: 'Drapery and shade motors', d: 'Covers motorized curtain tracks as well as roller and roman shades.' },
                  { t: 'Remotes and wall switches', d: 'Handheld remotes, wall-mounted controls, and app control via a hub.' },
                ].map((f) => (
                  <div key={f.t} className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-1" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#12141C] mb-0.5 tracking-tight">{f.t}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 md:p-10">
              <h3 className="text-xl font-semibold text-[#12141C] tracking-tight mb-4">Hunter Douglas PowerView</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Hunter Douglas’s own automation system, built into their shades at the factory — the
                natural choice for Duette, Silhouette, and the rest of the line.
              </p>
              <div className="space-y-4">
                {[
                  { t: 'Rechargeable battery wands', d: 'Integrated rechargeable power with no visible wiring on most products.' },
                  { t: 'Pebble remotes and keypads', d: 'Dedicated remotes plus surface-mount wall keypads for shared spaces.' },
                  { t: 'Native app and scenes', d: 'The PowerView app handles scheduling, scenes, and platform integrations.' },
                ].map((f) => (
                  <div key={f.t} className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-1" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#12141C] mb-0.5 tracking-tight">{f.t}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-8 max-w-2xl">
            Which one fits depends on the treatment: custom workroom pieces usually pair with Somfy,
            Hunter Douglas products with PowerView. Both can live in the same home and the same app
            through Matter or a hub.
          </p>
        </div>
      </section>

      {/* ── 4. SCENES ── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
            Everyday Automation
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-12">
            Scenes you'll actually use.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {scenes.map((s) => (
              <div key={s.title} className="border border-gray-100 rounded-2xl p-7">
                <div className="w-8 h-1 rounded-full bg-[#4DB6E8]/40 mb-5" />
                <h3 className="text-base font-semibold text-[#12141C] mb-2 tracking-tight">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. ENERGY ── */}
      <section className="w-full bg-[#F7F5F2] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
              Energy &amp; Comfort
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-6">
              Shades that pull their weight.
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-2xl">
              Cellular (honeycomb) shades trap air in their pockets, adding an insulating layer at the
              window — one of the least efficient surfaces in any home. In a San Gabriel Valley summer,
              lowering them on west-facing glass during the afternoon helps reduce solar heat gain;
              in winter, the same air pockets help slow heat loss.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
              Automation makes the benefit consistent: shades can close against the afternoon sun
              whether or not anyone is home. Window coverings like these support the energy-efficiency
              goals behind California’s Title 24 building standards by reducing the load on heating and
              cooling — a practical complement to efficient windows and HVAC.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ ── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
            Common Questions
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-12">
            Smart shade FAQ
          </h2>
          <div className="max-w-3xl space-y-8">
            {faqs.map((f) => (
              <div key={f.q} className="flex gap-4">
                <div className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-1" />
                <div>
                  <h3 className="text-base font-semibold text-[#12141C] mb-2 tracking-tight">{f.q}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA ── */}
      <section className="w-full bg-[#12141C] py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Get Started
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-white mb-6">
            See it work in your own home.
          </h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-md mx-auto">
            Book a free in-home consultation — we'll bring motor samples, check your windows and
            Wi-Fi setup, and recommend the right system for your platform.
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

      {/* ── FOOTER ── */}
      <footer className="w-full bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <FooterSocial />
            <div className="text-center text-sm text-gray-600">{COPYRIGHT}</div>
          </div>
        </div>
      </footer>
    </main>
  )
}
