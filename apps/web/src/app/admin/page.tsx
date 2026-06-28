'use client'

import Link from 'next/link'

const handleSignOut = async () => {
  try { await fetch('/api/auth/logout', { method: 'POST' }) } catch { /* still redirect */ }
  window.location.href = '/admin/login'
}

const CARDS = [
  {
    href: '/admin/website',
    title: 'Website',
    desc: 'Manage the public site — content, images, gallery videos and installations.',
    icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    href: '/admin/store',
    title: 'Store',
    desc: 'Manage e-commerce — products, orders, shipments, discounts and reviews.',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
]

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight">ANGEL DRAPERY</h1>
            <p className="text-[10px] text-gray-400 mt-0.5 tracking-wide">ADMIN</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">View Site</Link>
            <button onClick={handleSignOut} className="text-[12px] text-gray-400 hover:text-red-600 transition-colors">Sign Out</button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose an area to manage</h2>
        <p className="text-sm text-gray-400 mb-8">The website and the online store are managed separately.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          {CARDS.map(card => (
            <Link key={card.href} href={card.href}
              className="group block bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-900 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-lg bg-gray-900 text-white flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d={card.icon} />
                </svg>
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
