// create-admin.mjs — create or reset the admin account.
//
// Credentials come from environment variables, or — if those are unset — you
// are prompted interactively (the password is hidden as you type). NEVER
// hard-code credentials here: this file is committed to git, so anything
// hard-coded leaks into history.
//
// Usage (non-interactive):
//   DATABASE_URL=postgres://...  ADMIN_EMAIL=you@example.com  ADMIN_PASSWORD='a-strong-password' \
//     node apps/web/create-admin.mjs
//
// Usage (interactive — just run it and answer the prompts):
//   node apps/web/create-admin.mjs
//
// Notes:
//   - DATABASE_URL: defaults to the local dev DB if unset.
//   - ADMIN_PASSWORD: required; must be at least 10 characters.
//   - If an admin already exists it is updated; otherwise a new one is created.

import pg from 'pg'
import bcrypt from 'bcryptjs'
import readline from 'node:readline'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/window_treatments'
const name         = process.env.ADMIN_NAME || 'Admin'

function fail(msg) {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

// Prompt for a line of visible input (e.g. email).
function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()) }))
}

// Prompt for a hidden line (password): characters are not echoed to the screen.
function promptHidden(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    const onData = (char) => {
      const c = char.toString()
      if (c === '\n' || c === '\r' || c === '') process.stdin.removeListener('data', onData)
    }
    process.stdout.write(question)
    // Mask each keystroke with nothing (no asterisks) for simplicity.
    rl._writeToOutput = () => {}
    process.stdin.on('data', onData)
    rl.question('', answer => { rl.close(); process.stdout.write('\n'); resolve(answer.trim()) })
  })
}

// Resolve credentials: env vars win; otherwise prompt interactively.
let email    = process.env.ADMIN_EMAIL || ''
let password = process.env.ADMIN_PASSWORD || ''

if (!email)    email    = await prompt('Admin email: ')
if (!password) password = await promptHidden('New password (hidden, min 10 chars): ')

if (!email)               fail('Email is required.')
if (!password)            fail('Password is required.')
if (password.length < 10) fail('Password must be at least 10 characters — pick a strong one.')

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
