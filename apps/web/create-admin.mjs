import pg from 'pg'
import bcrypt from 'bcryptjs'

const client = new pg.Client('postgresql://haitongcao@localhost:5432/window_treatments')

async function main() {
  await client.connect()
  
  // Ensure role/is_active columns exist
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(32) NOT NULL DEFAULT 'customer'`).catch(() => {})
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true`).catch(() => {})
  
  const email    = 'ghost5566ac@gmail.com'
  const password = '12233445'
  const name     = 'Angel2100'
  const hash     = await bcrypt.hash(password, 12)

  // Check if ANY admin exists (update them); otherwise create new
  const existing = await client.query("SELECT id, email FROM users WHERE role = 'admin' LIMIT 1")

  if (existing.rows.length > 0) {
    const id = existing.rows[0].id
    await client.query(
      'UPDATE users SET email = $1, password_hash = $2, name = $3, role = $4, is_active = true, updated_at = NOW() WHERE id = $5',
      [email, hash, name, 'admin', id]
    )
    console.log('✓ 已更新管理员账号')
  } else {
    await client.query(
      'INSERT INTO users (email, password_hash, name, role, is_active) VALUES ($1, $2, $3, $4, true)',
      [email, hash, name, 'admin']
    )
    console.log('✓ 已创建新管理员账号')
  }

  console.log(`\n登录信息：`)
  console.log(`  邮箱：${email}`)
  console.log(`  密码：${password}`)
  console.log(`  名称：${name}`)
  console.log(`\n请前往 /admin/login 使用以上信息登录`)
  
  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
