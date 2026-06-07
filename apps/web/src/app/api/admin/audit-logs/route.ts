import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query, queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const action      = searchParams.get('action')
    const target_type = searchParams.get('target_type')
    const target_id   = searchParams.get('target_id')
    const actor_email = searchParams.get('actor_email')
    const page        = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit       = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)))

    let sql = `SELECT * FROM audit_logs WHERE 1=1`
    const params: any[] = []
    let idx = 1

    if (action)      { sql += ` AND action = $${idx++}`;      params.push(action) }
    if (target_type) { sql += ` AND target_type = $${idx++}`; params.push(target_type) }
    if (target_id)   { sql += ` AND target_id = $${idx++}`;   params.push(target_id) }
    if (actor_email) { sql += ` AND actor_email ILIKE $${idx++}`; params.push(`%${actor_email}%`) }

    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) AS cnt')
    const countRow = await queryOne<{ cnt: string }>(countSql, params)
    const total = parseInt(countRow?.cnt ?? '0', 10)

    sql += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`
    params.push(limit, (page - 1) * limit)

    const logs = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (e: any) {
    if (e.message?.includes('does not exist')) {
      return NextResponse.json({ success: true, data: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } })
    }
    return errorResponse('Could not load audit logs.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
