# Smoke-test plan — cart sync + AI after-sales/change/cancel

Target: production (`https://angel-drapery.com`) after deploying `main`
(commits `db3e70e` persona/knowledge + `5341b9e` cart-sync/AI-aftersales).
Runner: an agent (e.g. Codex) with browser access and, optionally, a shell for
curl / DB queries. Do the tests in order — later ones depend on earlier setup.

Mark each check ✅ pass / ❌ fail with a one-line note. Report a summary at the end.

---

## 0. Preconditions & test data

- **Deploy is live.** In Vercel, the latest `main` deployment shows "Ready".
  Quick sanity: `curl -s -o /dev/null -w "%{http_code}" https://angel-drapery.com/` → `200`.
- **Assistant key present.** The AI assistant needs `ANTHROPIC_API_KEY` in Vercel.
  If it's missing, `POST /api/store/assistant` returns `{"success":false,"error":"assistant_unavailable"}`
  and the widget shows a fallback message — note that and SKIP the AI suites (D–H) rather than failing them.
- **A test customer account.** Register one at `/store/account` (email + 6-digit
  code + password). Record the email/password. Call it **Customer T**.
- **At least one order owned by Customer T.** If none exists, place a small test
  order while signed in as Customer T (any product → checkout). Record its
  **order number** (`AD######-XXXX`) and the **shipping ZIP** used. Call it **Order O**.
  - Recently-placed orders are inside the 48-hour change/cancel window — good for the "in-window" tests.
- Two browsers (or one normal + one incognito) to simulate two devices.
- Order-number format is `AD` + 6 digits + `-` + 4 alphanumerics, e.g. `AD250705-9ABC`.

---

## A. Cart cross-device sync

**A1 — Guest cart is local-only.**
1. In a fresh incognito window (not logged in), open a product page, add an item to cart.
2. Open DevTools → Network. Confirm NO `PUT /api/store/cart` request fired (guests don't sync).
   ✅ if no cart PUT; the item still appears in `/store/cart`.

**A2 — Login merges + pushes.**
1. Still in that window with the guest item in cart, go to `/store/account`, log in as Customer T.
2. Watch Network: expect `GET /api/store/cart` then `PUT /api/store/cart` around login.
   ✅ if both fire and login succeeds.

**A3 — Cross-device visibility (the core feature).**
1. In a SECOND browser, log in as Customer T. Open `/store/cart`.
2. ✅ the item added in A1 shows up here (pulled from the server cart).

**A4 — Mutations mirror to server.**
1. In browser 2, change the item quantity (e.g. 1 → 3) on `/store/cart`.
2. Watch Network: a debounced `PUT /api/store/cart` fires (~0.6s after the change).
3. Reload `/store/cart` in browser 1 (still logged in). ✅ quantity shows 3.

**A5 — Merge takes the LARGER quantity (decision 1A).**
1. Browser 1 logged in: set the item quantity to 5, wait for the PUT.
2. Browser 2: log out (`/store/account` → sign out), then as a guest set the SAME
   product/options to quantity 2 in local cart, then log back in as Customer T.
3. ✅ after login the quantity is **5** (max), not 7 (not summed).

**A6 — Logout does NOT clear the local cart (decision 2A).**
1. Logged in with items in cart → sign out on `/store/account`.
2. Open `/store/cart`. ✅ the items are still there (kept as a guest cart).

**A7 — Swatch cap at 10.**
1. As Customer T, add many free swatches so the server cart has several; in another
   browser as guest add more swatches, then log in.
2. ✅ total swatches in the merged cart never exceeds 10; if trimming happened, an
   alert appears: "Some free fabric swatches were removed…".

**API shortcut (optional, deterministic):** while logged in (copy the
`auth_token` cookie), `PUT /api/store/cart` with a JSON body
`{"items":[...],"discountCode":null}` returns `{"success":true}`, and a
subsequent `GET /api/store/cart` returns the same items. A `PUT`/`GET` WITHOUT the
cookie returns HTTP 401.

---

## B. AI assistant persona (main vs store)

**B1 — Store surface.** Open any `/store/...` page, open the chat widget.
✅ welcome copy is the store version ("measuring… ordering… your order"); a quick
prompt "I need to change or cancel my order" is present.

**B2 — Main surface.** Open the home page `/` (NOT under `/store`), open the widget.
✅ welcome copy is the main-site version ("about our company… find the right
product"); quick prompts include "Tell me about Angel Drapery".

**B3 — Language mirroring.** Send a message in 中文. ✅ the reply is in 中文.

**B4 — No invented prices.** Ask "how much is a blackout roller shade for a 40x60
window?" ✅ it declines to quote a number and points to the product-page configurator.

---

## C. AI order help — signed-in customer

**C1 — Order lookup without asking for a number.**
1. Signed in as Customer T (same browser), open the store chat.
2. Say: "I want to change the size on my order."
3. ✅ the assistant lists / references Order O (it called `lookup_my_orders` using the
   session — it should NOT ask you to type an order number), and asks which order / what to change.

**C2 — Submit a change request.**
1. Continue: give a new size (e.g. "change the width to 42 inches").
2. The assistant confirms and says it submitted the request.
3. ✅ Verify in admin (suite G) that an `order_change` ticket appeared for Order O with
   the requested change recorded.

---

## D. AI order help — guest (order number + ZIP)

**D1 — Guest verification success.**
1. In an incognito window (NOT logged in), open the store chat.
2. Say "I need to cancel my order." It should ask for the order number and shipping ZIP.
3. Provide Order O's number and correct ZIP.
4. ✅ it confirms it found the order and continues.

**D2 — Cancellation requires explicit confirmation + no auto-refund (decision 4A).**
1. Continue from D1. Before creating anything, the assistant MUST restate the specific
   order and that cancelling refunds the amount **minus the card-processing fee**, and ask
   you to confirm.
2. Reply "yes, cancel it."
3. ✅ it says the request was **submitted / a person will follow up** — it must NOT claim
   the refund is instant, and must NOT state a specific refund amount or fee number.
4. ✅ Verify in admin (suite G) an `order_cancel` ticket exists for Order O.

**D3 — No premature ticket.** If in D1 you DON'T confirm (say "actually, never mind"),
✅ no `order_cancel` ticket is created.

---

## E. Guest verification — abuse resistance

**E1 — Wrong ZIP → generic failure.**
1. Incognito chat: give Order O's real number but a WRONG ZIP.
2. ✅ the assistant says it couldn't find a matching order for that number and ZIP and
   offers the phone number. It must NOT reveal that the order number was right / only the
   ZIP was wrong (no enumeration signal).

**E2 — Made-up order number → same generic failure.**
1. Give a fake but well-formed number like `AD250101-ZZZZ` with any ZIP.
2. ✅ same generic "couldn't find a matching order" response — indistinguishable from E1.

---

## F. 48-hour window

**F1 — In-window request records `window_ok = true`.** Order O is recent, so the
change/cancel tickets from C/D should show as in-window (no "Past 48h window" badge in admin).
✅ confirm in suite G.

**F2 — Past-window path (optional / needs an old order).** If an order older than 48h
owned by Customer T exists, ask to change/cancel it. ✅ the assistant says the request has
been passed to a person (not self-serviceable), and the admin ticket shows the amber
"Past 48h window" badge with `window_ok = false`. (This path is also covered by the unit
tests, so it's optional to reproduce live.)

---

## G. Admin — /admin/support AI view

Sign in to `/admin` as the admin, open **Support**.

**G1 — Source tabs.** ✅ there are three tabs: All / Web form / AI assistant, each with a count.
**G2 — AI tab filters.** Click **AI assistant**. ✅ only AI-submitted tickets show (each with a 🤖 marker);
   the ones created in C/D appear here.
**G3 — Type badges.** ✅ change requests show a "Change request" badge, cancellations a
   "Cancel request" badge; after-sales tickets show none/after-sales.
**G4 — Requested changes panel.** Expand the C2 change ticket. ✅ the "Requested changes"
   panel lists the field(s) the customer asked to change (e.g. width: 42).
**G5 — Cancel → refund helper.** Expand the D2 cancel ticket. ✅ a red "Cancellation request"
   box appears with an "Open order to refund →" link (Plan B: staff refund manually; nothing
   auto-charged).
**G6 — Merchant email.** ✅ an email arrived at the merchant address (`admin@angel-drapery.com`
   / `ORDER_NOTIFY_EMAIL`) with a "🤖 AI assistant — …" subject for the C/D submissions.
   (Skip if Resend isn't configured in this environment.)

**API shortcut:** as admin (with cookie), `GET /api/admin/support?source=ai_assistant`
returns `{success:true, data:{tickets:[...], sourceCounts:{...}}}` and every ticket has
`source:"ai_assistant"`.

---

## H. Security — server-side re-verification (important)

**H1 — Cart endpoints reject guests.** `curl` (no cookie):
`GET https://angel-drapery.com/api/store/cart` → HTTP 401;
`PUT …/api/store/cart` (any body) → HTTP 401. ✅

**H2 — submit re-verifies ownership.** This is enforced server-side: even if a client
tried to submit a ticket for an order it doesn't own, `submit_service_request` re-checks
(session user owns it, OR order number + ZIP match) and returns `not_authorized` otherwise.
Optional check: in the guest chat, provide Order O's number with a wrong ZIP and then push
to "cancel anyway" — ✅ no ticket is created (it can't verify, so it can't submit).

---

## I. Regression — existing flows still work

**I1 — Web-form support unchanged.** At `/store/track`, submit an after-sales request the
old way (order number + email). ✅ it still works and appears under the **Web form** tab in
admin with no 🤖 marker.
**I2 — Normal checkout.** Add an item and reach checkout. ✅ pricing/checkout still work
(cart sync must not interfere with the existing price-validation on `/store/cart`).
**I3 — Swatch limit shows as 10.** On a product page, ✅ swatch messaging reflects "up to
10 per order" (consistency of the WIP change across cart, pricing, and assistant knowledge).

---

## Sign-off

- Suites A, B, C, D, E, G, H, I all ✅ → ship-ready.
- Note any ❌ with the request/response or screenshot.
- If the assistant is unavailable (no API key), record that A / B / G-web / I still pass and
  the AI suites (C–H) are blocked on configuring `ANTHROPIC_API_KEY`.
