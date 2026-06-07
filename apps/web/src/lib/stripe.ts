import Stripe from 'stripe'

// Sanitize the key: env values pasted into dashboards often pick up a trailing
// newline/space or surrounding quotes. Any such character makes the
// Authorization header invalid — with the old Node http client that surfaced
// as a misleading StripeConnectionError; with the fetch client it's a
// TypeError("Invalid character in header content"). Trim + strip quotes.
const STRIPE_KEY = (process.env.STRIPE_SECRET_KEY || '')
  .trim()
  .replace(/^["']|["']$/g, '')

// httpClient: the SDK's default Node http client wrapped header errors as
// generic connection failures in the Vercel runtime; the fetch-based client
// (native fetch/undici) is the reliable choice in serverless environments.
export const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2025-01-27.acacia' as any,
  httpClient: Stripe.createFetchHttpClient(),
  maxNetworkRetries: 2,
})
