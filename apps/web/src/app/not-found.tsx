import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#3d3d3d] flex flex-col">
      {/* Nav */}
      <nav className="w-full px-6 sm:px-10 py-5 flex items-center justify-between">
        <Link href="/" className="text-white text-lg tracking-[0.2em] font-light">
          ANGEL DRAPERY, INC
        </Link>
        <div className="hidden md:flex gap-3">
          {[
            { name: 'Home', href: '/' },
            { name: 'About', href: '/about' },
            { name: 'Gallery', href: '/gallery' },
            { name: 'Products', href: '/products' },
            { name: 'Online Store', href: '/store' },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="px-4 py-1.5 rounded-full border border-white/30 text-white/80 text-sm hover:bg-white/10 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-white/30 text-[120px] sm:text-[180px] font-extralight leading-none mb-4">404</p>
        <h1 className="text-white text-2xl sm:text-3xl font-light mb-3">Page Not Found</h1>
        <p className="text-white/50 text-sm sm:text-base max-w-md mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-6 py-2.5 bg-white text-gray-900 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/products"
            className="px-6 py-2.5 border border-white/30 text-white text-sm rounded-full hover:bg-white/10 transition-colors"
          >
            View Products
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-white/20 text-xs">&copy; {new Date().getFullYear()} Angel Drapery, Inc.</p>
      </div>
    </div>
  )
}
