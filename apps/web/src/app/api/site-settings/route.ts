import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Public endpoint — returns site feature flags (no auth required)
export async function GET() {
  try {
    const rows = await query<{ key: string; value: string }>('SELECT key, value FROM site_settings')
    const settings: Record<string, any> = {}
    for (const row of rows) {
      settings[row.key] = row.value === 'true' ? true : row.value === 'false' ? false : row.value
    }
    // Cache at Vercel's edge for 5 min; serve stale for up to 1 h while
    // revalidating in the background. Site settings change rarely — the
    // only flag consumers use is `online_store_enabled` for nav toggling,
    // and a 5-min delay on that is fine. Before this, `no-store` meant
    // every SiteNav hydration hit Postgres, which caused Google Rich
    // Results Test to report `/api/site-settings` as a failed resource
    // (Googlebot's per-page fetch budget was blown on cold DB round-trips).
    return NextResponse.json({ success: true, data: settings }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
    })
  } catch {
    // If table doesn't exist yet, return safe defaults
    return NextResponse.json({ success: true, data: { online_store_enabled: false } })
  }
}
