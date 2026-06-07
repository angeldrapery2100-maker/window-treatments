import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query, queryOne } from '@/lib/db'
import { ensureUsersTable, hashPassword } from '@/lib/auth'

// Constant-time string compare so that a wrong SETUP_TOKEN header can't be
// distinguished from a correct-length-but-wrong one by timing. Matters because
// this endpoint is unauthenticated by definition — a timing oracle against an
// attacker with a fast network path is the only guard between them and admin.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// POST: Bootstrap — create the first admin account if none exists.
// Once an admin exists, this endpoint is permanently locked.
//
// SECURITY: even before any admin exists, this endpoint must NOT be open to
// the public internet — otherwise whoever hits it first (including bots
// scanning for common admin-setup paths) becomes the permanent admin. We
// require a SETUP_TOKEN env var and a matching `x-setup-token` header. If
// SETUP_TOKEN is unset in the environment, the endpoint is disabled entirely
// (fail-closed), so a forgotten config never leaves bootstrap wide open.
export async function POST(request: Request) {
  try {
    // ── Gate: SETUP_TOKEN must be configured and supplied ──────────────
    const configuredToken = process.env.SETUP_TOKEN
    if (!configuredToken) {
      return NextResponse.json({
        success: false,
        error: 'Setup endpoint is disabled. Set the SETUP_TOKEN environment variable to enable one-time bootstrap.',
      }, { status: 403 })
    }
    const providedToken = request.headers.get('x-setup-token') || ''
    if (!safeEqual(providedToken, configuredToken)) {
      return NextResponse.json({ success: false, error: 'Invalid setup token' }, { status: 403 })
    }

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
  } catch (e) {
    return errorResponse('Could not set up the account. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
