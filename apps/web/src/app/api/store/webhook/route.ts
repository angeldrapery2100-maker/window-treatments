// Stripe webhook — fallback order creation.
//
// Stripe calls this on payment_intent.succeeded. If the browser already created
// the order via /api/store/orders (the normal path), createOrderForPaymentIntent
// dedupes by payment_intent_id and we simply acknowledge. If the browser never
// got there, we rebuild the order from the checkout payload saved at
// PaymentIntent-creation time. This prevents "customer paid but no order exists".
//
// SETUP (required for this to work):
//   1. Stripe Dashboard → Developers → Webhooks → Add endpoint
//        URL:    https://angel-drapery.com/api/store/webhook
//        Events: payment_intent.succeeded
//   2. Copy the endpoint's "Signing secret" (whsec_...) into Vercel env as
//        STRIPE_WEBHOOK_SECRET   (Production + Preview), then redeploy.

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getPendingCheckout, consumePendingCheckout } from '@/lib/pendingCheckouts'
import { createOrderForPaymentIntent } from '@/lib/createOrder'

// Raw body is required for signature verification, so keep this on Node runtime
// and never cache.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set — cannot verify events')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature') || ''
  const rawBody = await request.text()

  let event: any
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as any
    try {
      const payload = await getPendingCheckout(pi.id)
      if (!payload) {
        // No saved checkout — e.g. a PI created outside our flow, or one whose
        // checkout row was already consumed. Nothing to do.
        console.warn('[webhook] no pending checkout for PI', pi.id)
        return NextResponse.json({ received: true })
      }

      const result = await createOrderForPaymentIntent({
        paymentIntentId: pi.id,
        customer: payload.customer,
        items: payload.items,
        shipping: payload.shipping,
        discount: payload.discount,
        notes: payload.notes,
        userId: payload.userId ?? null,
      })

      if (result.ok) {
        console.log('[webhook] created fallback order', result.orderNumber, 'for PI', pi.id)
        await consumePendingCheckout(pi.id).catch(() => {})
      } else if (result.status === 409) {
        // Browser already created the order — expected, not an error.
        await consumePendingCheckout(pi.id).catch(() => {})
      } else {
        // Permanent failure (e.g. verification/total mismatch). Log loudly for
        // staff follow-up; ack with 200 so Stripe doesn't retry forever.
        console.error('[webhook] could not create order for PI', pi.id, '-', result.error)
      }
    } catch (e) {
      // Unexpected (likely transient, e.g. DB). Return 500 so Stripe retries.
      console.error('[webhook] handler error for PI', pi.id, '-', e)
      return NextResponse.json({ error: 'handler error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
