// create-admin.mjs — create or reset the admin account.
//
// Credentials are read from environment variables (NEVER hard-code them here —
// this file is committed to git, so a hard-coded password leaks into history).
//
// Usage:
//   DATABASE_URL=postgres://...  ADMIN_EMAIL=you@example.com  ADMIN_PASSWORD='a-strong-password' \
//     node apps/web/create-admin.mjs
//
// Notes:
//   - DATABASE_URL: defaults to the local dev DB if unset.
//   - ADMIN_PASSWORD: required; must be at least 10 characters.
//   - If an admin already exists it is updated; otherwise a new one is created.

import pg from 'pg'
import bcrypt from 'bcryptjs'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/window_treatments'
const email    = process.env.ADMIN_EMAIL || ''
const password = process.env.ADMIN_PASSWORD || ''
const name     = process.env.ADMIN_NAME || 'Admin'

function fail(msg) {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

if (!email)             fail('Set ADMIN_EMAIL (e.g. ADMIN_EMAIL=you@example.com)')
if (!password)          fail('Set ADMIN_PASSWORD (e.g. ADMIN_PASSWORD=\'your-strong-password\')')
if (password.length < 10) fail('ADMIN_PASSWORD must be at least 10 characters — pick a strong one.')

const client = new pg.Client({
  connectionString: DATABASE_URL,
  // Most hosted Postgres (Neon/Supabase/Vercel) need SSL; local doesn't care.
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
})

async function main() {
  await client.connect()

  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(32) NOT NULL DEFAULT 'customer'`).catch(() => {})
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true`).catch(() => {})

  const hash = await bcrypt.hash(password, 12)
  const existing = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1")

  if (existing.rows.length > 0) {
    await client.query(
      'UPDATE users SET email = $1, password_hash = $2, name = $3, role = $4, is_active = true, updated_at = NOW() WHERE id = $5',
      [email, hash, name, 'admin', existing.rows[0].id]
    )
    console.log('✓ Admin account updated')
  } else {
    await client.query(
      'INSERT INTO users (email, password_hash, name, role, is_active) VALUES ($1, $2, $3, $4, true)',
      [email, hash, name, 'admin']
    )
    console.log('✓ Admin account created')
  }

  // Never print the password.
  console.log(`  email: ${email}`)
  console.log(`  name:  ${name}`)
  console.log('\nSign in at /admin/login with the email above and the password you provided.')

  await client.end()
}

main().catch((e) => { console.error(e); process.exit(1) })
