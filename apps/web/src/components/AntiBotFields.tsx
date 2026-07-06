'use client'

import Script from 'next/script'
import { useState } from 'react'

// Shared anti-bot fields for any form that POSTs to /api/consultation.
// The endpoint enforces: an empty honeypot (`company`), a minimum fill time
// (`formRenderedAt` → elapsedMs ≥ 3s), and — when TURNSTILE is configured — a
// valid Turnstile token (`cf-turnstile-response`). Every consultation form must
// render this, or the endpoint rejects it (403) once Turnstile is enabled.
//
// All values ride in the form's own fields, so a plain `new FormData(form)` at
// submit time picks them up — see readAntiBot() below.

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export default function AntiBotFields() {
  // Stamp the moment the form mounted (for the minimum-fill-time check).
  const [renderedAt] = useState(() => Date.now())

  return (
    <>
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
          strategy="afterInteractive"
        />
      )}

      {/* Honeypot — invisible to humans; only bots fill it. Off-screen rather
          than display:none (some bots skip hidden fields). Do not remove. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="ab-company">Company</label>
        <input id="ab-company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <input type="hidden" name="formRenderedAt" defaultValue={String(renderedAt)} />

      {/* Turnstile — injects a hidden "cf-turnstile-response" input into the
          surrounding form. Rendered only when a site key is configured. */}
      {TURNSTILE_SITE_KEY && (
        <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />
      )}
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
