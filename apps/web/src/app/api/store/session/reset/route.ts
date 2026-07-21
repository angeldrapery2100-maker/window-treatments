import { NextResponse } from 'next/server'
import { ANON_COOKIE } from '@/lib/homeProjects'

// Forget this browser's anonymous identity (W6 follow-up, 2026-07-21).
//
// The ad_anon cookie is httpOnly (JS cannot read or delete it) and lives ~a
// year. It keys the browser-persisted layer: measurement sheet, home
// project, lead events. On a shared computer — or in isolation testing —
// there was no way to drop it short of DevTools. This endpoint expires the
// cookie; the next request mints a fresh random id, so the browser starts
// with a clean sheet/project.
//
// No auth on purpose: it only clears the CALLER's own cookie (same trust
// level as logout) and destroys nothing server-side — old rows just become
// unreachable orphans.
//
// GET is provided so a tester can simply navigate to
//   /api/store/session/reset
// in the address bar; the widget/sessionStorage still needs a normal
// clear + reload afterwards (that part is plain JS).

function reset() {
  const res = NextResponse.json(
    { success: true, note: 'Anonymous identity cleared — reload the page to start fresh (sessionStorage is separate; clear it client-side).' },
    { headers: { 'Cache-Control': 'private, no-store' } }
  )
  res.cookies.set(ANON_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  })
  return res
}

export async function POST() {
  return reset()
}

export async function GET() {
  return reset()
}

export const dynamic = 'force-dynamic'
