import Stripe from 'stripe'

// httpClient: the SDK's default Node http client was consistently throwing
// StripeConnectionError ("An error occurred with our connection to Stripe")
// for ALL API calls (tax calculations, payment intents) in the Vercel
// serverless runtime, while plain fetch (Shippo, etc.) worked fine. The
// fetch-based client uses the platform's native fetch (undici) and is the
// reliable choice in serverless environments.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
  httpClient: Stripe.createFetchHttpClient(),
  maxNetworkRetries: 2,
})
