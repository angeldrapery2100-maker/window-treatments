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
    return NextResponse.json({ success: true, data: settings }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    // If table doesn't exist yet, return safe defaults
    return NextResponse.json({ success: true, data: { online_store_enabled: false } })
  }
}
