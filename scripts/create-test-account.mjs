// create-test-account.mjs — create a SEPARATE test admin account.
//
// Unlike create-admin.mjs (which manages the single primary admin), this
// upserts an extra admin row by email, so your real admin account is left
// untouched. Safe to run repeatedly — it just resets the test account.
//
// Usage:
//   node scripts/create-test-account.mjs
//   (set DATABASE_URL to target a non-local DB; defaults to local dev DB)
//
// These are throwaway TEST credentials — fine to keep in git. Do NOT reuse
// this pattern for real accounts.

import pg from 'pg'
import bcrypt from 'bcryptjs'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/window_treatments'

const TEST_EMAIL    = 'tester@angel-drapery.com'
const TEST_PASSWORD = 'TestPass2026!'
const TEST_NAME     = 'Test Admin'

const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
})

async function main() {
  await client.connect()

  // Make sure the columns the auth layer expects exist (no-op if already there).
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(32) NOT NULL DEFAULT 'customer'`).catch(() => {})
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true`).catch(() => {})

  const hash = await bcrypt.hash(TEST_PASSWORD, 12)

  // Upsert by email — does not touch any other admin row.
  const existing = await client.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [TEST_EMAIL])

  if (existing.rows.length > 0) {
    await client.query(
      'UPDATE users SET password_hash = $1, name = $2, role = $3, is_active = true, updated_at = NOW() WHERE id = $4',
      [hash, TEST_NAME, 'admin', existing.rows[0].id]
    )
    console.log('✓ Test admin account reset')
  } else {
    await client.query(
      'INSERT INTO users (email, password_hash, name, role, is_active) VALUES ($1, $2, $3, $4, true)',
      [TEST_EMAIL, hash, TEST_NAME, 'admin']
    )
    console.log('✓ Test admin account created')
  }

  console.log(`  email:    ${TEST_EMAIL}`)
  console.log(`  password: ${TEST_PASSWORD}`)
  console.log('\nSign in at /admin/login with the credentials above.')

  await client.end()
}

main().catch((e) => { console.error('\n✗', e.message, '\n'); process.exit(1) })
