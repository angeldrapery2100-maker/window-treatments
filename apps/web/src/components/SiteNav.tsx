'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { m as motion, AnimatePresence } from 'framer-motion'

const ALL_NAV_ITEMS = [
  { name: 'Home',         href: '/' },
  { name: 'About',        href: '/about' },
  { name: 'Our Projects', href: '/gallery' },
  { name: 'Products',     href: '/products' },
  { name: 'Online Store', href: '/store' },
  { name: 'Contact',      href: '/contact' },
  // Traditional-Chinese locale entry point — kept last and unobtrusive.
  { name: '中文',          href: '/zh' },
]

interface SiteNavProps {
  activePage?: string
  brandName?: string
}

export default function SiteNav({ activePage, brandName }: SiteNavProps) {
  const [hoveredNav, setHoveredNav]           = useState<string | null>(null)
  const [menuOpen,   setMenuOpen]             = useState(false)
  const [onlineStoreEnabled, setOnlineStoreEnabled] = useState<boolean>(true)

  useEffect(() => {
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.online_store_enabled === false) {
          setOnlineStoreEnabled(false)
        }
      })
      .catch(() => {})
  }, [])

  const NAV_ITEMS = onlineStoreEnabled
    ? ALL_NAV_ITEMS
    : ALL_NAV_ITEMS.filter(item => item.name !== 'Online Store')

  return (
    <>
      {/* ── Brand — top-left.
           NOTE: this is a <span>, NOT an <h1>. SiteNav renders on every
           page, and each page should have exactly one semantic H1 that
           describes THAT page's content (the product, gallery, etc.) — not
           the brand. Repeating the brand as H1 sitewide dilutes per-page
           SEO and confuses screen readers. */}
      <div className="absolute top-5 left-4 md:top-8 md:left-8 z-50 max-w-[calc(100vw-5.5rem)] md:max-w-none">
        <Link href="/" onClick={() => setMenuOpen(false)} aria-label="Angel Drapery — home">
          <span className="block text-[13px] sm:text-base md:text-2xl lg:text-3xl font-light tracking-[0.16em] md:tracking-[0.2em] leading-tight text-white drop-shadow-lg cursor-pointer hover:text-gray-300 transition-colors">
            {brandName || 'ANGEL DRAPERY, INC'}
          </span>
        </Link>
      </div>

      {/* ── Desktop nav pills — top-right (hidden on mobile) ── */}
      <nav className="hidden md:block absolute top-8 right-8 z-20">
        <ul className="flex flex-wrap gap-3 justify-end">
          {NAV_ITEMS.map(item => (
            <li key={item.name}>
              <Link
                href={item.href}
                onMouseEnter={() => setHoveredNav(item.name)}
                onMouseLeave={() => setHoveredNav(null)}
                className={`block px-6 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 text-sm font-medium ${
                  item.name === activePage || hoveredNav === item.name
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-transparent text-white border-white/30 hover:bg-gray-800 hover:border-gray-800'
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Mobile hamburger button ── */}
      <button
        onClick={() => setMenuOpen(v => !v)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        className="md:hidden absolute top-4 right-4 z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-white/15 bg-black/20 backdrop-blur-sm"
      >
        <motion.span
          animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.25 }}
          className="block w-6 h-px bg-white origin-center"
        />
        <motion.span
          animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.2 }}
          className="block w-6 h-px bg-white origin-center"
        />
        <motion.span
          animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.25 }}
          className="block w-6 h-px bg-white origin-center"
        />
      </button>

      {/* ── Mobile full-screen overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed inset-0 z-40 bg-[#3d3d3d]/97 backdrop-blur-md flex flex-col"
          >
            {/* Nav items — centered vertically */}
            <nav className="flex flex-col items-start justify-center flex-1 px-6 sm:px-8 gap-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + i * 0.06 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block py-2.5 text-3xl sm:text-4xl font-light tracking-tight transition-colors ${
                      item.name === activePage
                        ? 'text-white'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Bottom strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-6 sm:px-8 pb-10 pt-6 border-t border-white/10"
            >
              <p className="text-white/25 text-xs tracking-widest uppercase">
                Angel Drapery, Inc &nbsp;·&nbsp; Custom Window Treatments Since 1984
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
