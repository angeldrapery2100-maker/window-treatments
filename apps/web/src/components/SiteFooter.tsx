'use client'

import Link from 'next/link'
import FooterSocial from '@/components/FooterSocial'
import { COPYRIGHT, PRIMARY_PHONE, BUSINESS_ADDRESS, BUSINESS_HOURS } from '@/lib/site'

// Unified site footer (audit: 各页页脚不一致). One component, two tones.
// Renders contact info (phone / address / hours), quick links, social icons,
// and copyright. Social URLs are optional — DB-configured pages pass them
// through; static pages fall back to FooterSocial's own defaults.
interface Props {
  /** Dark variant for pages with dark backgrounds (e.g. gallery). */
  dark?: boolean
  youtube?: string
  etsy?: string
  tiktok?: string
  instagram?: string
  /** Override copyright line (DB-configured pages pass footer.copyright). */
  copyright?: string
}

export default function SiteFooter({ dark, youtube, etsy, tiktok, instagram, copyright }: Props) {
  const muted = dark ? 'text-white/50' : 'text-gray-600'
  const strong = dark ? 'text-white/80' : 'text-gray-900'
  const divider = dark ? 'border-white/10' : 'border-gray-200'

  return (
    <footer className={`w-full border-t ${divider} py-10 ${dark ? 'bg-[#3d3d3d]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 text-center">
          {/* Contact block */}
          <div className={`text-sm leading-relaxed ${muted}`}>
            <a href={`tel:${PRIMARY_PHONE.replace(/-/g, '')}`} className={`font-medium ${strong} hover:underline`}>
              {PRIMARY_PHONE}
            </a>
            <span className="mx-2">·</span>
            <span>{BUSINESS_ADDRESS}</span>
            <div className="mt-1">{BUSINESS_HOURS}</div>
          </div>

          {/* Quick links */}
          <nav className={`flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.14em] ${muted}`}>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/how-to-measure" className="hover:underline">How to Measure</Link>
            <Link href="/faq" className="hover:underline">FAQ</Link>
            <Link href="/service-areas" className="hover:underline">Service Areas</Link>
            <Link href="/store/track" className="hover:underline">Track Order</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </nav>

          <FooterSocial youtube={youtube} etsy={etsy} tiktok={tiktok} instagram={instagram} />

          <div className={`text-sm ${muted}`}>{copyright || COPYRIGHT}</div>
        </div>
      </div>
    </footer>
  )
}
