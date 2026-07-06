'use client'

import Script from 'next/script'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

// Shared anti-bot fields for any form that POSTs to /api/consultation.
// The endpoint enforces: an empty honeypot (`company`), a minimum fill time
// (`formRenderedAt`), and — when Turnstile is configured — a valid, UNUSED
// Turnstile token (`cf-turnstile-response`). Every consultation form must render
// this, or the endpoint rejects it (403) once Turnstile is enabled.
//
// Turnstile is rendered EXPLICITLY (turnstile.render on mount, remove on
// unmount) rather than via the implicit `.cf-turnstile` auto-scan: the implicit
// mode only renders widgets present when api.js loads, so a widget added later
// (e.g. the floating consultation panel that mounts its form on open) never got
// a token and the form 403'd.
//
// Turnstile tokens are SINGLE-USE. After a submit the token is spent, so the
// parent must call the imperative reset() (see below) after every submit to get
// a fresh token — otherwise a second submit re-sends a used token and Cloudflare
// returns "timeout-or-duplicate" → 403 even though the widget still shows a tick.
//
// The solved token is written into a hidden <input name="cf-turnstile-response">
// so `new FormData(form)` at submit time still picks it up — see readAntiBot().

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

export interface AntiBotHandle {
  /** Discard the used token and fetch a fresh one. Call after each submit. */
  reset: () => void
}

// onReady(true) once a Turnstile token is available (or immediately when
// Turnstile isn't configured), onReady(false) while it's missing/expired/reset.
// Parents use this to disable submit until verification is ready — both to avoid
// submitting an autofilled form before the token exists, and to block re-submits
// during the brief window while a fresh token is being fetched.
const AntiBotFields = forwardRef<AntiBotHandle, { onReady?: (ready: boolean) => void }>(
  function AntiBotFields({ onReady }, ref) {
    // Stamp the moment the form mounted (for the minimum-fill-time check).
    const [renderedAt] = useState(() => Date.now())
    const boxRef = useRef<HTMLDivElement>(null)
    const tokenRef = useRef<HTMLInputElement>(null)
    const widgetIdRef = useRef<string | null>(null)

    const setToken = (v: string) => {
      if (tokenRef.current) tokenRef.current.value = v
      onReady?.(!!v)
    }

    useImperativeHandle(ref, () => ({
      reset: () => {
        const ts = window.turnstile
        if (ts && widgetIdRef.current) {
          setToken('') // disables submit until the new token arrives via callback
          try { ts.reset(widgetIdRef.current) } catch { /* widget gone */ }
        }
      },
    }))

    useEffect(() => {
      // No Turnstile configured → nothing to verify, ready right away.
      if (!TURNSTILE_SITE_KEY) { onReady?.(true); return }
      let cancelled = false

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
