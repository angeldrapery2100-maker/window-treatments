import { NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { query } from '@/lib/db'
import { listMeasuredWindows } from '@/lib/windowMeasurements'

// Reverse feed for the internal GPT assistant (Eddie 2026-07-19): AAPP's
// chatgptAction proxies here (action `website_measurements`) so Eddie can see
// a customer's self-measured window sheet BEFORE the in-home visit.
//
// Auth reuses the EXISTING webExport shared secret in the reverse direction:
// the CF reads aiConfig/webExport.secret and sends it as x-ad-key; we compare
// against AAPP_WEBEXPORT_SECRET. Fail-closed when unset. Lookup is by the
// customer's account email and/or phone — guest (anon-cookie) sheets are not
// reachable by identity, by design.

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status })
}

const digits10 = (v: string) => v.replace(/\D+/g, '').slice(-10)

export async function GET(request: Request) {
  try {
    const secret = process.env.AAPP_WEBEXPORT_SECRET
    if (!secret) return bad('export secret not configured', 503)
    if (request.headers.get('x-ad-key') !== secret) return bad('bad key', 403)

    const ip = getClientIp(request)
    const limit = await rateLimit('measure', ip, { max: 60, windowSeconds: 600 })
    if (!limit.allowed) return bad('rate limited', 429)

    const { searchParams } = new URL(request.url)
    const email = String(searchParams.get('email') || '').trim().toLowerCase()
    const phone = digits10(String(searchParams.get('phone') || ''))
    if (!email && phone.length < 7) return bad('email or phone (>=7 digits) required')

    const conds: string[] = []
    const args: any[] = []
    if (email) {
      args.push(email)
      conds.push(`LOWER(email) = $${args.length}`)
    }
    if (phone.length >= 7) {
      args.push('%' + phone)
      conds.push(`regexp_replace(phone, '\\D', '', 'g') LIKE $${args.length}`)
    }
    const users = await query<{ id: string; email: string; name: string; phone: string }>(
      `SELECT id, email, name, phone FROM users WHERE ${conds.join(' OR ')} LIMIT 5`,
      args
    )
    if (users.length === 0) {
      return NextResponse.json({ ok: true, customers: [], note: 'No website account matches. Guest sheets (no account) are not searchable.' })
    }

    const customers = []
    for (const u of users) {
      const windows = await listMeasuredWindows({ userId: u.id, anonId: null })
      customers.push({
        email: u.email,
        name: u.name || null,
        phone: u.phone || null,
        window_count: windows.length,
        windows: windows.map((w) => ({
          location: w.label,
          opening: w.kind,
          product: w.product,
          config: w.config,
          dims_in: w.dims,
          reference_result: w.result,
          updated_at: w.updated_at,
        })),
      })
    }
    return NextResponse.json({
      ok: true,
      customers,
      note: 'Customer self-measured, reference-grade (single-point W/H; depth is a coarse choice). A/B/C/D = wall space left/right, gaps to ceiling/floor, inches.',
    })
  } catch (e) {
    console.error('[aapp/measurement-sheet] error:', e)
    return bad('internal', 500)
  }
}

export const dynamic = 'force-dynamic'
