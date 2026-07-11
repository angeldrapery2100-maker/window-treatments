// Draft-product preview tokens (store redesign P4 — blueprint §2.4).
//
// Lets an admin share "以客户视角预览" links for an INACTIVE (draft) product:
//   /store/<id>?preview=<token>
//
// Design:
//   token = HMAC-SHA256(secret, "product-preview:<productId>:<hourBucket>")
//           hex, truncated to 32 chars (128 bits)
//   - secret: the app's JWT secret (lib/auth.getAuthSecret — JWT_SECRET env,
//     fail-closed when unset), so no new secret to provision.
//   - hourBucket = floor(now / 1h). Verification accepts the CURRENT and the
//     PREVIOUS hour → a link stays valid for 1–2 hours, then dies on its own.
//   - Stateless: nothing stored, nothing to revoke; scope is a single product
//     id, so a leaked token can never open other drafts.
//   - Comparison is constant-time (crypto.timingSafeEqual).
//
// The token only ever widens READ access for one inactive product's detail
// page/API. Lists, search and related-product rails never honor it.

import { createHmac, timingSafeEqual } from 'crypto'
import { getAuthSecret } from './auth'

const TOKEN_LEN = 32 // hex chars = 128 bits

function hourBucket(offset = 0): number {
  return Math.floor(Date.now() / 3_600_000) + offset
}

function tokenFor(productId: string, bucket: number): string {
  return createHmac('sha256', getAuthSecret())
    .update(`product-preview:${productId}:${bucket}`)
    .digest('hex')
    .slice(0, TOKEN_LEN)
}

/** Mint a preview token for a product (valid this hour + the next check's
 *  previous-hour grace → practical lifetime 1–2 hours). */
export function createPreviewToken(productId: string): string {
  return tokenFor(productId, hourBucket())
}

/** Constant-time verification against the current and previous hour buckets.
 *  Returns false (never throws) on malformed input or a missing secret. */
export function verifyPreviewToken(productId: string, token: unknown): boolean {
  if (typeof token !== 'string' || token.length !== TOKEN_LEN || !/^[0-9a-f]+$/.test(token)) {
    return false
  }
  try {
    const supplied = Buffer.from(token, 'utf8')
    for (const offset of [0, -1]) {
      const expected = Buffer.from(tokenFor(productId, hourBucket(offset)), 'utf8')
      if (supplied.length === expected.length && timingSafeEqual(supplied, expected)) {
        return true
      }
    }
  } catch {
    // getAuthSecret throws when JWT_SECRET is unset — treat as invalid.
  }
  return false
}
