import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)))

    let sql = `SELECT * FROM settings_history WHERE 1=1`
    const params: any[] = []
    if (key) { sql += ` AND setting_key = $1`; params.push(key) }
    sql += ` ORDER BY changed_at DESC LIMIT $${params.length + 1}`
    params.push(limit)

    const history = await query(sql, params)
    return NextResponse.json({ success: true, data: history })
  } catch (e: any) {
    if (e.message?.includes('does not exist')) {
      return NextResponse.json({ success: true, data: [] })
    }
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
