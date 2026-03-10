import { Pool } from 'pg'

// Lazy-init pool to avoid errors during build
let _pool: Pool | null = null

function getPool(): Pool {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  }
  return _pool
}

const pool = new Proxy({} as Pool, {
  get(_, prop) {
    const realPool = getPool()
    const val = (realPool as any)[prop]
    if (typeof val === 'function') return val.bind(realPool)
    return val
  }
})

export default pool

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const client = await getPool().connect()
  try {
    const result = await client.query(sql, params)
    return result.rows
  } finally {
    client.release()
  }
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
