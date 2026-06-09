// Manage the signed-in admin's own two-factor authentication.
//   POST { action: 'setup'  }                  → generate a pending secret + otpauth URI
//   POST { action: 'enable', code }            → verify code, activate 2FA
//   POST { action: 'disable', code }           → verify code, turn 2FA off
//   GET                                        → current status { enabled }

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { recordAudit } from '@/lib/audit'
import { generateBase32Secret, verifyTotp, buildOtpauthUri } from '@/lib/totp'
import { getTotp, setPendingSecret, activateTotp, disableTotp } from '@/lib/twoFactor'

export async function GET(request: Request) {
  let user
  try { user = requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const status = await getTotp(user.id)
  return NextResponse.json({ success: true, data: { enabled: status.enabled } })
}

export async function POST(request: Request) {
  let user
  try { user = requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json().catch(() => ({})) as any
  const action = body.action

  if (action === 'setup') {
    const secret = generateBase32Secret()
    await setPendingSecret(user.id, secret)
    return NextResponse.json({
      success: true,
      data: { secret, otpauth: buildOtpauthUri(secret, user.email) },
    })
  }

  if (action === 'enable') {
    const status = await getTotp(user.id)
    if (!status.pending) {
      return NextResponse.json({ success: false, error: 'Start setup first.' }, { status: 400 })
    }
    if (!verifyTotp(status.pending, String(body.code || ''))) {
      return NextResponse.json({ success: false, error: 'That code is incorrect. Check your authenticator and try again.' }, { status: 400 })
    }
    await activateTotp(user.id, status.pending)
    await recordAudit({ action: 'account.updated', actor_id: user.id, actor_email: user.email, target_type: 'user', target_id: user.id, after: { totp_enabled: true } }).catch(() => {})
    return NextResponse.json({ success: true })
  }

  if (action === 'disable') {
    const status = await getTotp(user.id)
    if (!status.enabled) return NextResponse.json({ success: true })
    // Require a valid current code to disable (prevents a hijacked session from
    // silently removing 2FA).
    if (!status.secret || !verifyTotp(status.secret, String(body.code || ''))) {
      return NextResponse.json({ success: false, error: 'Enter a current 6-digit code to disable two-factor.' }, { status: 400 })
    }
    await disableTotp(user.id)
    await recordAudit({ action: 'account.updated', actor_id: user.id, actor_email: user.email, target_type: 'user', target_id: user.id, after: { totp_enabled: false } }).catch(() => {})
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
}

export const dynamic = 'force-dynamic'
