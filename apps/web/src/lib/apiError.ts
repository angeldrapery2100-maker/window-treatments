import { NextResponse } from 'next/server'

/**
 * Standard error response helper.
 *
 * Returns a GENERIC message to the client (never raw exception text, which can
 * leak DB column names, SQL fragments, or stack details) while logging the real
 * error server-side. Use this instead of `error: e.message` in catch blocks.
 */
export function errorResponse(
  clientMessage: string,
  status = 500,
  serverError?: unknown
): NextResponse {
  if (serverError !== undefined) {
    console.error(`[api] ${clientMessage} (status ${status}):`, serverError)
  }
  return NextResponse.json({ success: false, error: clientMessage }, { status })
}
