# Handoff — consultation form / Turnstile / AAPP intake

Repo: `window-treatments-web` (angel-drapery.com) · Branch: `main` (all pushed) ·
Date: 2026-07-06. Written for whoever picks this up next.

## One-line status

Everything is built and mostly working. The **only open blocker** is a Cloudflare
Turnstile bug on the consultation forms: the server rejects submits with
`missing-token` even though the widget shows a success tick. A fix is in place
(`f77957e`) but **needs to be deployed and verified** on production.

## What works (confirmed via testing + Vercel logs)

- Consultation form submit reaches the server (past honeypot, timing, rate-limit).
- **Email** notification is delivered (Resend works).
- DB row is written (`consultation_requests`).
- **AAPP `websiteInquiry`** Cloud Function works and returns a booking link — verified
  by curl returning `{"ok":true,"link":"…appt.html?t=…"}`. The shared-secret
  (`x-ad-key`) was **turned OFF** (the `aiConfig/webIntake.secret` Firestore field was
  deleted) because the Vercel value ↔ Firestore value never matched; the CF now
  accepts calls over CORS. `AAPP_WEBINTAKE_SECRET` in Vercel is now dead weight
  (harmless — CF ignores the header when no Firestore secret is set).
- All other work this session (cart sync, AI after-sales tools, admin support view,
  AAPP chat tool) is done, tsc-clean, unit-tested, and deployed.

## The blocker: Turnstile `missing-token` 403

**Symptom:** on all three consultation forms (floating `ConsultationWidget`, `/contact`
`ContactClient`, homepage `HomeClient`), submit returns HTTP 403 and the Vercel log
shows `[consultation] Turnstile verification failed: missing-token`. The Turnstile
widget itself renders and shows "成功!/Success", but the token that reaches the server
is empty. Reproduces on desktop AND mobile Safari.

**Confirmed root cause:** `window.turnstile.render()` (explicit render) does NOT put a
usable `cf-turnstile-response` value into the form's `FormData` at submit time. So
`readAntiBot()` read an empty token → server sees `missing-token` → 403.

Why explicit render at all? The floating `ConsultationWidget` mounts its form only when
the panel opens, and Turnstile's IMPLICIT auto-scan (`.cf-turnstile` class) only renders
widgets present at api.js load, so the on-open widget never rendered → also `missing-token`.
So neither pure-implicit nor the explicit+hidden-input approach worked via FormData.

## Fix currently in place (needs deploy + verify) — commit `f77957e`

Stop trusting FormData for the token. `AntiBotFields` now exposes
`getToken() → window.turnstile.getResponse(widgetId)`, and all three forms send that
value as `body.turnstileToken`. This is the standard, reliable way to read an explicit
Turnstile token. It should resolve `missing-token`.

**To verify:**
1. `git push origin main` (already pushed as of writing) and confirm the **Production**
   deployment on `angel-drapery.com` is `Ready` (not just a `*.vercel.app` preview).
2. Hard-refresh the page (Cmd+Shift+R) to drop cached JS.
3. Submit the form. Watch `vercel logs`:
   - No `[consultation] Turnstile verification failed` → token now arrives; expect a
     200, an email, an AAPP lead, and a "Book now" button.

## If it STILL says missing-token after deploying `f77957e`

Check, in order:
1. **Is the new bundle actually live?** In the browser, view source / network for
   `/api/consultation`'s page chunk and confirm `getResponse` is in it. Production alias
   may lag behind the latest deployment — promote it in Vercel if needed.
2. **Add a temporary client log**: in each form's submit, `console.log('tstoken', antiBotRef.current?.getToken())` to confirm the client actually has a non-empty token at submit.
3. **Turnstile widget id / timing**: `getResponse(widgetId)` needs the exact id returned
   by `render()`. Confirm `widgetIdRef.current` is set and the callback (`onReady(true)`)
   fired before submit (the submit button is gated on it, so it should have).
4. **Hostname allowlist**: confirm the Turnstile widget's Hostname config in the Cloudflare
   dashboard includes `angel-drapery.com` (a mismatch makes the SERVER verify fail while the
   client still shows a tick — but the error would be `hostname-mismatch`, not `missing-token`,
   so this is unlikely given the exact error, but worth a 10-second check).
5. **Server env**: `TURNSTILE_SECRET_KEY` must be the secret **paired with**
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (same widget). If they're from different widgets, verify
   always fails — but again the error would differ. One earlier submit DID pass Turnstile
   (delivered an email), so the pair is almost certainly correct.

## Nuclear option if Turnstile keeps fighting

The consultation endpoint already has honeypot + minimum-fill-time + rate-limit (3/hr/IP)
+ a conservative spam heuristic. If Turnstile can't be made reliable quickly, you can
**disable it without code changes**: unset `TURNSTILE_SECRET_KEY` in Vercel and redeploy —
`verifyTurnstile()` skips when the secret is absent (see `apps/web/src/lib/turnstile.ts`),
and the forms already skip the widget when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset. That
immediately unblocks all leads; re-enable Turnstile once the widget integration is sorted.

## Key files

- `apps/web/src/components/AntiBotFields.tsx` — shared honeypot + fill-time + Turnstile
  (explicit render, `reset()`, `getToken()`). **This is the file most likely still at issue.**
- `apps/web/src/app/api/consultation/route.ts` — server: honeypot, timing (`MIN_FILL_MS=800`),
  rate-limit (3/hr), `verifyTurnstile`, spam score, DB insert, AAPP call, email.
- `apps/web/src/lib/turnstile.ts` — server-side siteverify (skips when no secret).
- `apps/web/src/lib/aappIntake.ts` — server POST to the CF (`AAPP_WEBINTAKE_SECRET` optional).
- Forms posting to `/api/consultation`: `components/ConsultationWidget.tsx`,
  `app/contact/ContactClient.tsx`, `app/HomeClient.tsx`, plus `store/whole-home` (its own route).

## Flow (submit → lead)

form submit → POST `/api/consultation` → honeypot? timing≥800ms? rate-limit? →
`verifyTurnstile(turnstileToken)` (403 on fail) → spam score → INSERT
`consultation_requests` → `submitWebsiteInquiry()` → AAPP CF (profile + sales SMS +
booking link) → Resend email → 200 `{success, bookingLink?}` → widget shows "Book now".

## Commit trail (this session, newest first)

- `f77957e` read token via turnstile.getResponse() at submit  ← current best fix
- `bbaf7ea` use Turnstile's own response field (didn't fix; FormData still empty)
- `a32bd73` reset widget after each submit (single-use tokens)
- `78296e7` gate submit on readiness + scrollable mobile sheet
- `2e2c0d6` relax min-fill 3s→800ms (autofill false-positive drops)
- `206a824` explicit render for the on-open panel
- `b5ace66` add Turnstile+honeypot to /contact + homepage forms (they were 403'ing)
- `59829c1` route AI chat + form into AAPP websiteInquiry
- `5341b9e` cart sync + AI after-sales/change/cancel
