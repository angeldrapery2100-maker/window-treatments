'use client'

import Script from 'next/script'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

// Shared anti-bot fields for any form that POSTs to /api/consultation.
// The endpoint enforces: an empty honeypot (`company`), a minimum fill time
// (`formRenderedAt`), and — when Turnstile is configured — a valid, UNUSED
// Turnstile token (`cf-turnstile-response`). Every consultation form must render
// this, or the endpoint rejects it (403) once Turnstile is enabled.
//
// Turnstile is rendered EXPLICITLY (turnstile.render on mount, remove on unmount)
// because the implicit `.cf-turnstile` auto-scan only renders widgets present
// when api.js loads — so a widget added later (e.g. the floating consultation
// panel that mounts its form on open) never rendered and the form 403'd.
//
// IMPORTANT: turnstile.render() injects its OWN hidden <input
// name="cf-turnstile-response"> inside the widget container and keeps it in sync
// with the current token. We rely on THAT single input (read via FormData at
// submit) — we must NOT also render our own same-named input, or FormData reads
// the wrong (empty) one → "missing-token" 403. The callback is used only to
// track readiness (enable submit) and reset() clears the token for the next try
// (tokens are single-use).

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      remove: (id: string) => void
      reset: (id?: string) => void
      getResponse?: (id?: string) => string | undefined
    }
  }
}

export interface AntiBotHandle {
  /** Discard the used token and fetch a fresh one. Call after each submit. */
  reset: () => void
  /** Current Turnstile token read straight from the widget (source of truth). */
  getToken: () => string
}

const AntiBotFields = forwardRef<AntiBotHandle, { onReady?: (ready: boolean) => void }>(
  function AntiBotFields({ onReady }, ref) {
    // Stamp the moment the form mounted (for the minimum-fill-time check).
    const [renderedAt] = useState(() => Date.now())
    const boxRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)

    useImperativeHandle(ref, () => ({
      reset: () => {
        const ts = window.turnstile
        if (ts && widgetIdRef.current) {
          onReady?.(false) // block submit until the fresh token arrives
          try { ts.reset(widgetIdRef.current) } catch { /* widget gone */ }
        }
      },
      getToken: () => {
        // Read straight from the widget — the reliable source of truth. Relying
        // on FormData/hidden inputs proved flaky (missing-token 403s).
        if (!TURNSTILE_SITE_KEY) return ''
        try { return window.turnstile?.getResponse?.(widgetIdRef.current ?? undefined) || '' }
        catch { return '' }
      },
    }))

    useEffect(() => {
      // No Turnstile configured → nothing to verify, ready right away.
      if (!TURNSTILE_SITE_KEY) { onReady?.(true); return }
      let cancelled = false

      // Wait for api.js, then render this instance explicitly. Turnstile injects
      // and maintains its own hidden cf-turnstile-response input inside boxRef.
      const render = () => {
        if (cancelled || widgetIdRef.current) return
        const ts = window.turnstile
        if (!ts || !boxRef.current) { window.setTimeout(render, 150); return }
        widgetIdRef.current = ts.render(boxRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'light',
          callback: () => onReady?.(true),
          'error-callback': () => onReady?.(false),
          'expired-callback': () => onReady?.(false),
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

        {/* Turnstile renders here AND injects its own hidden cf-turnstile-response
            input that FormData reads at submit. */}
        {TURNSTILE_SITE_KEY && <div ref={boxRef} />}
      </>
    )
  }
)

export default AntiBotFields

/** Pull the anti-bot fields out of a submitted form's FormData for the POST body. */
export function readAntiBot(data: FormData): { company: string; elapsedMs: number; turnstileToken: string } {
  const rendered = Number(data.get('formRenderedAt'))
  return {
    company: (data.get('company') as string) || '',
    elapsedMs: Number.isFinite(rendered) && rendered > 0 ? Date.now() - rendered : 10000,
    turnstileToken: (data.get('cf-turnstile-response') as string) || '',
  }
}
