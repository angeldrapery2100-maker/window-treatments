'use client'

import Link from 'next/link'

const SECTIONS = [
  {
    href: '/admin/site-content',
    label: 'Site Content',
    desc: 'Edit homepage copy, hero, and page text',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  },
  {
    href: '/admin/gallery-videos',
    label: 'Gallery Videos',
    desc: 'Manage the videos shown in the gallery',
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.899L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
  },
  {
    href: '/admin/showcase-products',
    label: 'Showcase',
    desc: 'Curate featured products and collections',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    href: '/admin/installation-images',
    label: 'Installations',
    desc: 'Manage the "Our Installations" section images',
    icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

export default function WebsiteDashboard() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <h1 className="text-xl font-semibold text-gray-900">Website Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage the public site — content, images and videos</p>
        </div>
      </div>

      <div className="px-8 py-8">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Manage</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-3">
          {SECTIONS.map(item => (
            <Link key={item.href} href={item.href} className="group block bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-400 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-gray-700">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={item.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">{item.label}</h3>
                  <p className="text-[11px] text-gray-400 mt-1">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
