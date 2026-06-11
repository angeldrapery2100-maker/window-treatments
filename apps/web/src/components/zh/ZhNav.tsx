import Link from 'next/link'

// Traditional-Chinese nav for the /zh subtree. Server-rendered — the pill
// hover states are pure CSS, so no client JS is needed. Visually matches
// SiteNav (white pills on the dark hero), but stays a small standalone
// component so the English nav remains untouched.

const ZH_NAV_ITEMS = [
  { name: '首頁',     href: '/zh' },
  { name: '關於我們', href: '/zh/about' },
  { name: '聯繫我們', href: '/zh/contact' },
]

interface ZhNavProps {
  /** href of the active page, e.g. '/zh/about' */
  activeHref?: string
  /** English-equivalent page for the "EN" language switch, e.g. '/about' */
  enHref?: string
}

export default function ZhNav({ activeHref, enHref = '/' }: ZhNavProps) {
  return (
    <>
      {/* Brand — top-left (span, not h1; each page owns its own H1) */}
      <div className="absolute top-5 left-4 md:top-8 md:left-8 z-50 max-w-[calc(100vw-1rem)]">
        <Link href="/zh" aria-label="天使窗簾 — 首頁">
          <span className="block text-base sm:text-lg md:text-2xl lg:text-3xl font-light tracking-[0.16em] md:tracking-[0.2em] leading-tight text-white drop-shadow-lg cursor-pointer hover:text-gray-300 transition-colors">
            天使窗簾
          </span>
          <span className="block text-[9px] md:text-[11px] tracking-[0.3em] text-white/60 uppercase mt-0.5">
            Angel Drapery, Inc
          </span>
        </Link>
      </div>

      {/* Nav pills — top-right; compact enough to stay visible on mobile */}
      <nav className="absolute top-4 right-3 md:top-8 md:right-8 z-20">
        <ul className="flex flex-wrap gap-2 md:gap-3 justify-end">
          {ZH_NAV_ITEMS.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-3.5 py-1.5 md:px-6 md:py-2 rounded-full border backdrop-blur-sm transition-all duration-300 text-xs md:text-sm font-medium ${
                  item.href === activeHref
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-transparent text-white border-white/30 hover:bg-gray-800 hover:border-gray-800'
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={enHref}
              aria-label="Switch to English"
              className="block px-3.5 py-1.5 md:px-6 md:py-2 rounded-full border border-white/30 bg-transparent text-white/80 backdrop-blur-sm transition-all duration-300 text-xs md:text-sm font-medium tracking-widest hover:bg-gray-800 hover:border-gray-800 hover:text-white"
            >
              EN
            </Link>
          </li>
        </ul>
      </nav>
    </>
  )
}
