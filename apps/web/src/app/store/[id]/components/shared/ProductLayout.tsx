'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { getCartCount } from '@/lib/cart'
import FooterSocial from '@/components/FooterSocial'
import { COPYRIGHT } from '@/lib/site'

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
            <FooterSocial />
            <p className="text-sm text-gray-400">{COPYRIGHT}</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
