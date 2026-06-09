'use client'

import { useState } from 'react'
import { buildConfigUrl, type SharedConfig } from './configLink'

// "Copy configuration link" button — shared across all product types.
export default function CopyConfigLink({ productId, config }: { productId: string; config: SharedConfig }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const url = buildConfigUrl(productId, config)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard API blocked (e.g. insecure context) — fall back to prompt.
      try { window.prompt('Copy this link:', url) } catch { /* noop */ }
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="w-full mt-2 py-2.5 border border-gray-300 text-gray-600 text-xs font-medium tracking-widest uppercase rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Link copied
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          Copy configuration link
        </>
      )}
    </button>
  )
}
