'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── Navigation, split into two independent admin areas ──────────────
// "Website" manages the public marketing site (content, images, videos).
// "Store" manages e-commerce (products, orders, shipping, etc.).
// Each area gets its own dashboard and its own sidebar; you switch
// between them from the area switcher or the /admin landing page.

const WEBSITE_NAV = [
  { href: '/admin/site-content', label: 'Site Content', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  { href: '/admin/gallery-videos', label: 'Gallery Videos', icon: 'M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.899L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z' },
  { href: '/admin/showcase-products', label: 'Showcase', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/admin/installation-images', label: 'Installations', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z' },
]

const STORE_NAV = [
  { href: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { href: '/admin/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/admin/shipments', label: 'Shipments', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
  { href: '/admin/discount-codes', label: 'Discounts', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
  { href: '/admin/support', label: 'Support', icon: 'M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
]

const SYSTEM_NAV = [
  { href: '/admin/accounts', label: 'Accounts', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
]

type Area = 'website' | 'store'

const AREAS: Record<Area, { label: string; dashboard: string; nav: typeof WEBSITE_NAV }> = {
  website: { label: 'Website', dashboard: '/admin/website', nav: WEBSITE_NAV },
  store:   { label: 'Store',   dashboard: '/admin/store',   nav: STORE_NAV },
}

// Map any admin path to its area. Defaults to "website" for shared/system
// pages (e.g. Accounts) so the sidebar always has a sensible context.
function areaForPath(pathname: string): Area {
  const storePrefixes = ['/admin/store', '/admin/products', '/admin/orders', '/admin/shipments', '/admin/discount-codes', '/admin/support', '/admin/reviews']
  if (storePrefixes.some(p => pathname === p || pathname.startsWith(p + '/'))) return 'store'
  return 'website'
}

function NavItem({ item, pathname }: { item: typeof WEBSITE_NAV[0]; pathname: string }) {
  const active = pathname === item.href || pathname.startsWith(item.href + '/')
  return (
    <Link href={item.href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
        active
          ? 'bg-[#3d3d3d] text-white font-medium'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d={item.icon} />
      </svg>
      {item.label}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Sign out: revokes this token server-side (jti -> blocklist) and clears the
  // cookie, then hard-redirects to the login page (full reload drops any
  // client-side admin state).
  const handleSignOut = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch { /* still redirect */ }
    window.location.href = '/admin/login'
  }

  // Full-width pages (no sidebar): the area chooser landing, plus print /
  // work-order views and the login page.
  const fullWidthPaths = ['/admin/orders/shipping/', '/admin/orders/work-order/', '/admin/login']
  const isChooser = pathname === '/admin'
  const isFullWidth = isChooser || fullWidthPaths.some(p => pathname.startsWith(p))

  if (isFullWidth) return <>{children}</>

  const area = areaForPath(pathname)
  const current = AREAS[area]
  const other: Area = area === 'website' ? 'store' : 'website'
  const otherArea = AREAS[other]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/admin" className="block">
            <h1 className="text-sm font-bold text-gray-900 tracking-tight">ANGEL DRAPERY</h1>
            <p className="text-[10px] text-gray-400 mt-0.5 tracking-wide">ADMIN</p>
          </Link>
        </div>

        {/* Area badge + switch to the other area */}
        <div className="px-3 pt-4">
          <div className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-widest">{current.label}</span>
            <Link href={otherArea.dashboard} className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1">
              {otherArea.label}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          <div>
            <Link href={current.dashboard}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                pathname === current.dashboard
                  ? 'bg-[#3d3d3d] text-white font-medium'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Dashboard
            </Link>
          </div>

          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{current.label}</p>
            <div className="space-y-0.5">
              {current.nav.map(item => <NavItem key={item.href} item={item} pathname={pathname} />)}
            </div>
          </div>

          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">System</p>
            <div className="space-y-0.5">
              {SYSTEM_NAV.map(item => <NavItem key={item.href} item={item} pathname={pathname} />)}
            </div>
          </div>
        </nav>

        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
          <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-[12px] text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Site
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
