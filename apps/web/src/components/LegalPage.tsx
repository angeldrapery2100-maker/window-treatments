import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

/**
 * Shared shell for static legal pages (Privacy Policy, SMS Terms).
 * Dark header band so the white SiteNav stays legible (these pages have no
 * hero image), a readable max-width body, and a footer that cross-links the
 * legal pages — matching the rest of the site's look.
 */
export default function LegalPage({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-white">
      {/* Header band — dark, hosts the absolutely-positioned SiteNav */}
      <section className="relative w-full bg-[#3d3d3d] pt-28 pb-14 md:pt-32 md:pb-16">
        <SiteNav />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide text-white mb-3">{title}</h1>
          <p className="text-white/70 text-sm tracking-wide">{subtitle}</p>
        </div>
      </section>

      {/* Body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 text-gray-700">
        {children}
      </article>

      {/* Footer */}
      <SiteFooter />
    </main>
  )
}

/* ── Small presentational helpers, kept here so the page files read like content ── */

export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{heading}</h2>
      <div className="space-y-4 leading-relaxed">{children}</div>
    </section>
  )
}

export function LegalCallout({ children }: { children: React.ReactNode }) {
  return (
    <aside className="border-l-4 border-gray-900 bg-gray-50 p-5 my-6 leading-relaxed text-gray-800">
      {children}
    </aside>
  )
}
