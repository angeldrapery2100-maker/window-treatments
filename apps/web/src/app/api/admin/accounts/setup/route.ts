import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { ensureUsersTable, hashPassword } from '@/lib/auth'

// POST: Bootstrap — create the first admin account if none exists
// Once an admin exists, this endpoint is permanently locked
export async function POST(request: Request) {
  try {
    await ensureUsersTable()

    // Check if any admin already exists
    const existingAdmin = await queryOne("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    if (existingAdmin) {
      return NextResponse.json({ success: false, error: 'Admin account already exists. Use the admin panel to manage accounts.' }, { status: 403 })
    }

    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: 'name, email, and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await queryOne('SELECT id, role FROM users WHERE LOWER(email) = LOWER($1)', [email])

    if (existing) {
      // Promote existing user to admin
      await query("UPDATE users SET role = 'admin', is_active = true, updated_at = NOW() WHERE id = $1", [existing.id])
      return NextResponse.json({ success: true, message: `Existing account ${email} promoted to admin` })
    }

    // Create new admin account
    const hash = await hashPassword(password)
    await queryOne(
      `INSERT INTO users (email, password_hash, name, role, is_active) VALUES (LOWER($1), $2, $3, 'admin', true) RETURNING id`,
      [email, hash, name]
    )

    return NextResponse.json({ success: true, message: `Admin account created: ${email}` })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
