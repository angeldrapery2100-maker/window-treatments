'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { getCartCount } from '@/lib/cart'

interface ProductLayoutProps {
  children: ReactNode
  productName?: string
}

export default function ProductLayout({ children, productName }: ProductLayoutProps) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const update = () => setCartCount(getCartCount())
    update()
    window.addEventListener('cart-updated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('cart-updated', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  const navigation = [
    { name: 'Home',         href: '/' },
    { name: 'About',        href: '/about' },
    { name: 'Our Projects', href: '/gallery' },
    { name: 'Products',     href: '/products' },
    { name: 'Online Store', href: '/store' },
    { name: 'Contact',      href: '/contact' },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* 导航栏 */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <span className="text-lg md:text-xl font-light tracking-[0.2em] text-gray-900 hover:text-gray-600 transition-colors">
                ANGEL DRAPERY, INC
              </span>
            </Link>
            <nav>
              <ul className="flex flex-wrap gap-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onMouseEnter={() => setHoveredNav(item.name)}
                      onMouseLeave={() => setHoveredNav(null)}
                      className={`block px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        hoveredNav === item.name || item.name === 'Online Store'
                          ? 'bg-[#3d3d3d] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {children}

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
        {/* Account */}
        <Link href="/store/account"
          className="w-12 h-12 bg-white text-gray-600 border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </Link>
        {/* Cart */}
        <Link href="/store/cart"
          className="w-14 h-14 bg-[#3d3d3d] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-700 hover:scale-110 transition-all duration-200 relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex gap-6">
              <a href="#" className="text-red-600 hover:text-red-700 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="text-orange-500 hover:text-orange-600 transition-colors">
                <span className="text-xl font-bold">Etsy</span>
              </a>
              <a href="#" className="text-gray-900 hover:text-gray-700 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              <a href="#" className="text-blue-700 hover:text-blue-800 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
            <p className="text-sm text-gray-400">©2025 by Angel Drapery</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
