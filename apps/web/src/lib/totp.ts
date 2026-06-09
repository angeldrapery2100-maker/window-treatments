// Minimal RFC 6238 TOTP (time-based one-time password) using Node crypto only —
// no third-party dependency. Compatible with Google Authenticator, Authy, 1Password, etc.

import crypto from 'crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

// ── Base32 (RFC 4648, no padding) ────────────────────────────────────────────
export function generateBase32Secret(bytes = 20): string {
  const buf = crypto.randomBytes(bytes)
  let bits = ''
  for (const b of buf) bits += b.toString(2).padStart(8, '0')
  let out = ''
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)]
  }
  return out
}

function base32Decode(secret: string): Buffer {
  const clean = secret.replace(/=+$/,'').replace(/\s/g, '').toUpperCase()
  let bits = ''
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch)
    if (idx === -1) continue
    bits += idx.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2))
  }
  return Buffer.from(bytes)
}

// ── TOTP ─────────────────────────────────────────────────────────────────────
function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8)
  // 64-bit counter, big-endian
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0)
  buf.writeUInt32BE(counter % 0x100000000, 4)
  const hmac = crypto.createHmac('sha1', secret).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff)
  return (code % 1_000_000).toString().padStart(6, '0')
}

/**
 * Verify a 6-digit TOTP code with a ±1 step (±30s) tolerance for clock skew.
 * Uses timing-safe comparison.
 */
export function verifyTotp(secret: string, token: string, stepSeconds = 30): boolean {
  const t = (token || '').replace(/\s/g, '')
  if (!/^\d{6}$/.test(t)) return false
  const key = base32Decode(secret)
  if (key.length === 0) return false
  const counter = Math.floor(Date.now() / 1000 / stepSeconds)
  for (let w = -1; w <= 1; w++) {
    const expected = hotp(key, counter + w)
    try {
      if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(t))) return true
    } catch { /* length mismatch — not equal */ }
  }
  return false
}

/** otpauth:// URI for manual entry / QR in an authenticator app. */
export function buildOtpauthUri(secret: string, account: string, issuer = 'Angel Drapery'): string {
  const label = encodeURIComponent(`${issuer}:${account}`)
  const params = new URLSearchParams({ secret, issuer, algorithm: 'SHA1', digits: '6', period: '30' })
  return `otpauth://totp/${label}?${params.toString()}`
}
