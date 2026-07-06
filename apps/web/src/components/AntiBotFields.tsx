'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

// Shared anti-bot fields for any form that POSTs to /api/consultation.
// The endpoint enforces: an empty honeypot (`company`), a minimum fill time
// (`formRenderedAt` → elapsedMs ≥ 3s), and — when Turnstile is configured — a
// valid Turnstile token (`cf-turnstile-response`). Every consultation form must
// render this, or the endpoint rejects it (403) once Turnstile is enabled.
//
// Turnstile is rendered EXPLICITLY (turnstile.render on mount, remove on
// unmount) rather than via the implicit `.cf-turnstile` auto-scan. The implicit
// mode only renders widgets present when api.js loads, so a widget added later
// — e.g. the floating consultation panel that mounts its form on open — never
// got a token and the form 403'd. Explicit render also lets us clean up (no
// "Cannot find Widget" console warnings) and clear the token on expiry.
//
// The solved token is written into a hidden <input name="cf-turnstile-response">
// so a plain `new FormData(form)` at submit time still picks it up — see
// readAntiBot().

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      remove: (id: string) => void
      reset: (id?: string) => void
    }
  }
}

// onReady(true) once a Turnstile token is available (or immediately when
// Turnstile isn't configured), onReady(false) if it expires/errors. Parents use
// this to disable submit until verification is ready, avoiding a race where an
// autofilled form is submitted before the token exists (→ 403).
export default function AntiBotFields({ onReady }: { onReady?: (ready: boolean) => void } = {}) {
  // Stamp the moment the form mounted (for the minimum-fill-time check).
  const [renderedAt] = useState(() => Date.now())
  const boxRef = useRef<HTMLDivElement>(null)
  const tokenRef = useRef<HTMLInputElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    // No Turnstile configured → nothing to verify, ready right away.
    if (!TURNSTILE_SITE_KEY) { onReady?.(true); return }
    let cancelled = false
    const setToken = (v: string) => {
      if (tokenRef.current) tokenRef.current.value = v
      onReady?.(!!v)
    }

    // Wait for api.js, then render this instance explicitly.
    const render = () => {
      if (cancelled || widgetIdRef.current) return
      const ts = window.turnstile
      if (!ts || !boxRef.current) { window.setTimeout(render, 150); return }
      widgetIdRef.current = ts.render(boxRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        callback: (t: string) => setToken(t),
        'error-callback': () => setToken(''),
        'expired-callback': () => setToken(''),
      })
    }
    render()

    return () => {
      cancelled = true
      const ts = window.turnstile
      if (ts && widgetIdRef.current) {
        try { ts.remove(widgetIdRef.current) } catch { /* already gone */ }
        widgetIdRef.current = null
      }
    }
  }, [])

  return (
    <>
      {TURNSTILE_SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      )}

      {/* Honeypot — invisible to humans; only bots fill it. Off-screen rather
          than display:none (some bots skip hidden fields). Do not remove. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="ab-company">Company</label>
        <input id="ab-company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <input type="hidden" name="formRenderedAt" defaultValue={String(renderedAt)} />
      {/* Turnstile writes the solved token here via its callback. */}
      <input type="hidden" name="cf-turnstile-response" ref={tokenRef} defaultValue="" />

      {/* Explicit-render target (NOT the implicit `.cf-turnstile` class). */}
      {TURNSTILE_SITE_KEY && <div ref={boxRef} />}
    </>
  )
}

/** Pull the anti-bot fields out of a submitted form's FormData for the POST body. */
export function readAntiBot(data: FormData): { company: string; elapsedMs: number; turnstileToken: string } {
  const rendered = Number(data.get('formRenderedAt'))
  return {
    company: (data.get('company') as string) || '',
    elapsedMs: Number.isFinite(rendered) && rendered > 0 ? Date.now() - rendered : 10000,
    turnstileToken: (data.get('cf-turnstile-response') as string) || '',
  }
}
