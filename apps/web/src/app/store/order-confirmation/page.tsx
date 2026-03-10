'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-light tracking-wide text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-sm text-gray-500 mb-6">Thank you for your order. We will contact you shortly to confirm details and arrange payment.</p>

          {orderNumber && (
            <div className="bg-gray-50 rounded-lg px-6 py-4 mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order Number</p>
              <p className="text-lg font-mono font-bold text-gray-900 tracking-wider">{orderNumber}</p>
            </div>
          )}

          <div className="text-left bg-gray-50 rounded-lg px-6 py-4 mb-6 space-y-2 text-sm text-gray-600">
            <p className="font-medium text-gray-800 mb-2">What happens next?</p>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3d3d3d] text-white text-xs flex items-center justify-center">1</span>
              <p>We will review your order and verify the specifications.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3d3d3d] text-white text-xs flex items-center justify-center">2</span>
              <p>Our team will reach out via email or phone to confirm details.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3d3d3d] text-white text-xs flex items-center justify-center">3</span>
              <p>We will arrange payment and begin production.</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/store"
              className="block w-full py-3 bg-[#3d3d3d] text-white text-sm font-medium tracking-widest uppercase hover:bg-gray-700 transition-colors rounded">
              Continue Shopping
            </Link>
            <Link href="/"
              className="block text-center text-xs text-gray-400 hover:text-gray-600 underline underline-offset-4">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
