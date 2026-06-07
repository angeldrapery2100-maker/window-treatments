import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { createOrderForPaymentIntent } from '@/lib/createOrder'
import { consumePendingCheckout } from '@/lib/pendingCheckouts'
import { errorResponse } from '@/lib/apiError'

// POST: create a new order (primary path — called by the browser once the
// PaymentIntent has succeeded). The actual creation/verification logic lives in
// lib/createOrder.ts and is shared with the Stripe webhook fallback. Dedup by
// payment_intent_id makes calling this twice safe.
export async function POST(request: Request) {
  try {
    const body = await request.json() as any
    const { customer, items, notes, paymentIntentId, shipping, discount } = body

    const authUser = getUserFromRequest(request)

    const result = await createOrderForPaymentIntent({
      paymentIntentId,
      customer,
      items,
      notes,
      shipping,
      discount,
      userId: authUser?.id || null,
    })

    if (!result.ok) {
      // 409 keeps the previous shape (includes the existing order id).
      if (result.status === 409) {
        return NextResponse.json(
          { success: false, error: result.error, data: { orderId: result.existingOrderId } },
          { status: 409 }
        )
      }
      return NextResponse.json({ success: false, error: result.error }, { status: result.status })
    }

    // Saved checkout no longer needed (browser path won the race).
    await consumePendingCheckout(paymentIntentId).catch(() => {})

    return NextResponse.json({
      success: true,
      data: { orderId: result.orderId, orderNumber: result.orderNumber, createdAt: result.createdAt },
    })
  } catch (e) {
    return errorResponse(
      'Could not create your order. Please contact support with your payment reference.',
      500,
      e
    )
  }
}

export const dynamic = 'force-dynamic'
