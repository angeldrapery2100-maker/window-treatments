# AAPP `websiteInquiry` integration — deploy notes

Wires the website's AI chat **and** the "Request a Consultation" form into the
AAPP `websiteInquiry` Cloud Function. The backend then creates the customer
profile, round-robins the lead to a salesperson (SMS), returns a booking link
(shown as a "Book now" button), and texts the customer that link when they
consented. Commit `59829c1`.

## What's already in the code

- **AI chat**: a `submit_website_inquiry` tool the assistant calls after
  collecting name + phone (+ SMS consent). Available on both surfaces; the store
  stays order-first. The returned link renders as a booking button in the chat.
- **Consultation form** (`ConsultationWidget` → `/api/consultation`): after
  saving + emailing as before, it now *also* forwards the lead to AAPP
  (best-effort) and shows a "Book your appointment" button on success.
- Server-side only — the shared secret never reaches the browser.
- Customer-facing phone stays **626-451-9841**. (626-703-2929 is your private
  line the AAPP backend uses internally; it's never shown to customers.)

## Env vars to set in Vercel (Production + Preview)

| Variable | Required? | Value |
|---|---|---|
| `AAPP_WEBINTAKE_SECRET` | to enable the shared-secret guard (you said yes) | a random string, **identical** to the Firestore value below |
| `AAPP_WEBINTAKE_URL` | optional | only if the Cloud Function URL ever changes; defaults to the documented `us-central1-angel-drapery…/websiteInquiry` |

To enable the shared secret you must set it in **both** places, matching exactly:
1. Firestore: doc `aiConfig/webIntake` → field `secret` = `<random string>`.
2. Vercel env: `AAPP_WEBINTAKE_SECRET` = the same string. Redeploy.

If either is missing/mismatched the backend will reject the call. If you'd
rather not use the secret yet, leave BOTH unset — it still works over CORS,
just without the `x-ad-key` header. (You can set `AAPP_WEBINTAKE_SECRET` with
`vercel env add AAPP_WEBINTAKE_SECRET`, same flow as the Turnstile keys.)

## Behavior without the env var

- No `AAPP_WEBINTAKE_SECRET` → requests are sent without `x-ad-key` (fine unless
  you've turned on the Firestore secret, in which case they'd be rejected).
- The Cloud Function being down or slow (>10s) never breaks the chat or the
  form — the lead is still captured in the DB/email; only the auto-profile/SMS
  is skipped for that submission.

## Quick test (⚠️ creates a REAL lead + sends a REAL SMS)

```bash
curl -sS -X POST 'https://us-central1-angel-drapery.cloudfunctions.net/websiteInquiry' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Chat Test","phone":"6267032929","message":"chat integration test","intent":"triage","smsConsent":true,"source":"website_chat","website":""}'
```
Expect `{ok:true, link:"…appt.html?t=…", smsSent:true}`, an SMS to that number, a
new Website lead in AAPP, and a sales notification. Re-running with the same
number takes the "existing customer" path (appends a note, no duplicate) —
that's expected.

For an end-to-end product test, use the live chat: on the home page ask to book
a consultation, give a name + phone, agree to a text — the assistant should call
the tool once and show a "Book now" button. On the form, submit with a phone and
SMS box checked — the success screen should show the booking button.
