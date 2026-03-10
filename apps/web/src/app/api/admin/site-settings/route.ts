import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { recordSettingChange } from '@/lib/settingsHistory'
import { recordAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/auth'
import { SETTING_GROUPS } from '@/lib/settingGroups'

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)
  // Seed defaults for all known settings
  for (const group of Object.values(SETTING_GROUPS)) {
    for (const [key, meta] of Object.entries(group.settings)) {
      await query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
        [key, meta.defaultValue]
      )
    }
  }
}

// GET — read all settings with group metadata
export async function GET() {
  try {
    await ensureTable()
    const rows = await query<{ key: string; value: string }>('SELECT key, value FROM site_settings')
    const settings: Record<string, any> = {}
    for (const row of rows) {
      settings[row.key] = row.value === 'true' ? true : row.value === 'false' ? false : row.value
    }
    return NextResponse.json({
      success: true,
      data: settings,
      groups: SETTING_GROUPS,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PUT — update a setting (with history + audit)
export async function PUT(req: Request) {
  try {
    await ensureTable()
    let adminUser: any
    try { adminUser = requireAdmin(req) } catch {}

    const body = await req.json() as any
    const { key, value } = body
    if (!key) return NextResponse.json({ success: false, error: 'key required' }, { status: 400 })

    const newValue = String(value)

    // Get old value for history
    const existing = await queryOne<{ value: string }>('SELECT value FROM site_settings WHERE key = $1', [key])

    await query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, newValue]
    )

    // Record change history
    await recordSettingChange(key, existing?.value ?? null, newValue, adminUser?.email)
    if (adminUser) {
      await recordAudit({
        action: 'settings.updated',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'site_settings',
        target_id: key,
        before: { value: existing?.value ?? null },
        after: { value: newValue },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// GET /api/admin/site-settings/history?key=xxx  — see change log for a setting
// (This is handled via a separate route file)

export const dynamic = 'force-dynamic'
