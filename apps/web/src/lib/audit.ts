// apps/web/src/lib/audit.ts
// Audit log helper — call recordAudit() from any admin route to log operations

import { query } from '@/lib/db'

export type AuditAction =
  | 'order.status_changed'
  | 'order.notes_updated'
  | 'order.cancelled'
  | 'order.refunded'
  | 'order.partial_refund'
  | 'shipping.label_voided'
  | 'product.created'
  | 'product.updated'
  | 'product.status_changed'
  | 'product.deleted'
  | 'discount.created'
  | 'discount.updated'
  | 'discount.deleted'
  | 'discount.bulk_deactivated'
  | 'content.updated'
  | 'content.published'
  | 'content.unpublished'
  | 'content.version_restored'
  | 'settings.updated'
  | 'gallery.updated'
  | 'gallery.published'
  | 'gallery.unpublished'
  | 'account.created'
  | 'account.updated'
  | 'account.deactivated'
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.force_logout'
  | 'installation_image.created'
  | 'installation_image.updated'
  | 'installation_image.deleted'
  | 'support.updated'
  | 'review.moderated'

export interface AuditEntry {
  action: AuditAction
  actor_id?: string | null   // admin user ID
  actor_email?: string | null
  target_type?: string | null  // 'order', 'product', etc.
  target_id?: string | null
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
  ip?: string | null
  note?: string | null
}

async function ensureAuditTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      action      varchar(64)  NOT NULL,
      actor_id    uuid,
      actor_email varchar(256),
      target_type varchar(64),
      target_id   varchar(256),
      before      jsonb,
      after       jsonb,
      ip          varchar(64),
      note        text,
      created_at  timestamptz DEFAULT now()
    )
  `)
  // Index for fast lookups
  await query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs(action)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_target      ON audit_logs(target_type, target_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_actor       ON audit_logs(actor_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON audit_logs(created_at DESC)`)
}

let tableReady = false

export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    if (!tableReady) {
      await ensureAuditTable()
      tableReady = true
    }
    await query(
      `INSERT INTO audit_logs (action, actor_id, actor_email, target_type, target_id, before, after, ip, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        entry.action,
        entry.actor_id ?? null,
        entry.actor_email ?? null,
        entry.target_type ?? null,
        entry.target_id ?? null,
        entry.before ? JSON.stringify(entry.before) : null,
        entry.after  ? JSON.stringify(entry.after)  : null,
        entry.ip ?? null,
        entry.note ?? null,
      ]
    )
  } catch (err) {
    // Audit failures must never break the main operation
    console.error('[audit] write failed:', err)
  }
}
