import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and code required' }, { status: 400 })
    }

    const row = await queryOne(
      `SELECT id FROM email_verification_codes 
       WHERE email = LOWER($1) AND code = $2 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    )

    if (!row) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 400 })
    }

    // Mark as used
    await query(`UPDATE email_verification_codes SET used = true WHERE id = $1`, [row.id])

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
