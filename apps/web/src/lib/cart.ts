// Cart utility - localStorage based cart management

export interface CartItemOption {
  name: string         // option key e.g. "fabric_color"
  displayLabel: string // display label e.g. "Fabric Color"
  value: string        // selected value code e.g. "natural"
  valueLabel: string   // selected value display e.g. "Natural"
}

export interface CartItem {
  id: string             // unique cart item id
  productId: string
  productName: string
  productType: string    // drapery | sheer | shade | hardware
  mainImageUrl: string | null
  width?: number
  height?: number
  heightFraction?: string
  widthFraction?: string
  options: CartItemOption[]
  quantity: number
  unitPrice: number      // calculated price per unit
  addedAt: number        // timestamp
  // Free fabric swatch line: $0, no dimensions, max MAX_SWATCHES_PER_ORDER per
  // order. Server re-verifies (orderPricing) — the flag alone never sets price.
  isSwatch?: boolean
}

/** Free fabric swatches allowed per order (enforced client- AND server-side). */
export const MAX_SWATCHES_PER_ORDER = 10

export interface Cart {
  items: CartItem[]
  discountCode?: string
  discountType?: 'percent' | 'fixed'
  discountPercent?: number  // kept for backward compat, stores discount_value
}

const CART_KEY = 'store_cart'

export function getCart(): Cart {
  if (typeof window === 'undefined') return { items: [] }
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : { items: [] }
  } catch {
    return { items: [] }
  }
}

export function saveCart(cart: Cart) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  // Dispatch custom event for cart count updates
  window.dispatchEvent(new CustomEvent('cart-updated'))
  // Logged-in users: mirror the change to the server (debounced, best-effort).
  // Single hook covering every mutation — add/update/remove/discount/clear all
  // funnel through saveCart.
  scheduleCartPush()
}

export function addToCart(item: Omit<CartItem, 'id' | 'addedAt'>) {
  const cart = getCart()
  const newItem: CartItem = {
    ...item,
    id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    addedAt: Date.now(),
  }
  cart.items.push(newItem)
  saveCart(cart)
  return newItem.id
}

export function getSwatchCount(): number {
  return getCart().items.filter(i => i.isSwatch).reduce((sum, i) => sum + i.quantity, 0)
}

/**
 * Add a free fabric swatch for a product+fabric combination.
 * Returns: 'added' | 'duplicate' (same swatch already in cart) | 'limit'
 * (MAX_SWATCHES_PER_ORDER reached).
 */
export function addSwatchToCart(input: {
  productId: string
  productName: string
  mainImageUrl: string | null
  fabricOption: CartItemOption | null
}): 'added' | 'duplicate' | 'limit' {
  const cart = getCart()
  const fabricValue = input.fabricOption?.value || ''
  const dup = cart.items.some(i =>
    i.isSwatch && i.productId === input.productId &&
    (i.options.find(o => o.name === input.fabricOption?.name)?.value || '') === fabricValue
  )
  if (dup) return 'duplicate'
  if (getSwatchCount() >= MAX_SWATCHES_PER_ORDER) return 'limit'
  const options: CartItemOption[] = [
    // Display marker — shows up in cart / order / work-order option lists.
    { name: 'item_kind', displayLabel: 'Item', value: 'swatch', valueLabel: 'Free Fabric Swatch' },
    ...(input.fabricOption ? [input.fabricOption] : []),
  ]
  addToCart({
    productId: input.productId,
    productName: input.productName,
    productType: 'swatch',
    mainImageUrl: input.mainImageUrl,
    options,
    quantity: 1,
    unitPrice: 0,
    isSwatch: true,
  })
  return 'added'
}

export function updateCartItemQuantity(itemId: string, quantity: number) {
  const cart = getCart()
  const item = cart.items.find(i => i.id === itemId)
  if (item) {
    item.quantity = Math.max(1, Math.min(99, quantity))
    saveCart(cart)
  }
}

export function removeCartItem(itemId: string) {
  const cart = getCart()
  cart.items = cart.items.filter(i => i.id !== itemId)
  saveCart(cart)
}

export function clearCart() {
  saveCart({ items: [] })
}

export function getCartCount(): number {
  return getCart().items.reduce((sum, i) => sum + i.quantity, 0)
}

export function getCartSubtotal(): number {
  return getCart().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
}

export function applyDiscount(code: string, percent: number) {
  const cart = getCart()
  cart.discountCode = code
  cart.discountPercent = percent
  saveCart(cart)
}

export function removeDiscount() {
  const cart = getCart()
  delete cart.discountCode
  delete cart.discountPercent
  saveCart(cart)
}

// ─────────────────────────────────────────────────────────────────────────────
// Cross-device sync (logged-in users only)
//
// Design: localStorage stays the instant local cache (UI never waits on the
// network). For a signed-in user the server `carts` row is the source of truth,
// merged once at login and mirrored on every later change (fire-and-forget).
// Guests are untouched — nothing is sent to the server. See /api/store/cart.
// ─────────────────────────────────────────────────────────────────────────────

// null = unknown (not yet checked this page load). Set eagerly by the app on
// login/logout, or resolved lazily via /api/auth/me on the first push.
let syncLoggedIn: boolean | null = null

/** App calls this the moment auth state is known (login success / logout). */
export function setCartLoggedIn(value: boolean) {
  syncLoggedIn = value
}

async function isLoggedInForSync(): Promise<boolean> {
  if (syncLoggedIn !== null) return syncLoggedIn
  try {
    const r = await fetch('/api/auth/me')
    const d = await r.json()
    syncLoggedIn = !!(d?.success && d?.data?.user)
  } catch {
    syncLoggedIn = false
  }
  return syncLoggedIn
}

let pushTimer: ReturnType<typeof setTimeout> | null = null

/** Debounced, best-effort push of the whole cart to the server. No-op for guests. */
export function scheduleCartPush() {
  if (typeof window === 'undefined') return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => { void pushCartNow() }, 600)
}

async function pushCartNow(): Promise<void> {
  if (!(await isLoggedInForSync())) return
  try {
    await fetch('/api/store/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getCart()),
    })
  } catch {
    /* best-effort — the next mutation or next login will re-sync */
  }
}

/**
 * Merge two carts (decision 1A: union, dedupe by product+options, take the
 * LARGER quantity). Swatch lines are capped so the total free-swatch count
 * never exceeds MAX_SWATCHES_PER_ORDER — extra swatches are trimmed.
 * Returns the merged cart plus whether any swatches were trimmed (for a toast).
 */
export function mergeCarts(local: Cart, server: Cart): { cart: Cart; swatchesTrimmed: boolean } {
  const keyOf = (i: CartItem) =>
    JSON.stringify([
      i.productId,
      !!i.isSwatch,
      i.options.map(o => `${o.name}=${o.value}`).sort(),
      i.width ?? '', i.height ?? '', i.widthFraction ?? '', i.heightFraction ?? '',
    ])

  const map = new Map<string, CartItem>()
  // Server first so a local line with the same key keeps the local id but the
  // quantity ends up as the max of the two.
  for (const src of [server.items || [], local.items || []]) {
    for (const it of src) {
      const k = keyOf(it)
      const existing = map.get(k)
      if (!existing) map.set(k, { ...it })
      else existing.quantity = Math.max(existing.quantity, it.quantity)
    }
  }

  // Enforce the free-swatch cap on the merged total.
  let swatchTotal = 0
  let swatchesTrimmed = false
  const items: CartItem[] = []
  for (const it of map.values()) {
    if (!it.isSwatch) { items.push(it); continue }
    if (swatchTotal >= MAX_SWATCHES_PER_ORDER) { swatchesTrimmed = true; continue }
    const remaining = MAX_SWATCHES_PER_ORDER - swatchTotal
    if (it.quantity > remaining) { it.quantity = remaining; swatchesTrimmed = true }
    swatchTotal += it.quantity
    items.push(it)
  }

  // Discount: keep whichever cart has one (local takes precedence).
  const withDiscount = local.discountCode ? local : (server.discountCode ? server : null)
  return {
    cart: {
      items,
      discountCode: withDiscount?.discountCode,
      discountType: withDiscount?.discountType,
      discountPercent: withDiscount?.discountPercent,
    },
    swatchesTrimmed,
  }
}

/**
 * Call right after a successful login. Merges the local (guest) cart with the
 * server cart, writes the result locally, and pushes it back to the server so
 * both sides agree. Returns whether any swatches were trimmed by the 10-cap.
 */
export async function mergeCartOnLogin(): Promise<{ swatchesTrimmed: boolean }> {
  setCartLoggedIn(true)
  let serverCart: Cart = { items: [] }
  try {
    const r = await fetch('/api/store/cart')
    const d = await r.json()
    if (d?.success && d?.data?.cart) serverCart = d.data.cart as Cart
  } catch {
    /* offline / server hiccup — fall back to just the local cart */
  }
  const { cart, swatchesTrimmed } = mergeCarts(getCart(), serverCart)
  saveCart(cart) // writes localStorage + schedules the debounced push
  // Also push immediately so the server is consistent right now (not in 600ms).
  try {
    await fetch('/api/store/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cart),
    })
  } catch { /* debounced push will retry */ }
  return { swatchesTrimmed }
}

/**
 * Call on store pages when the user is logged in. If the local cart is empty
 * (new browser / new device), pull the server cart so it shows up. Does not
 * overwrite a non-empty local cart — login-time merge already reconciled that.
 */
export async function hydrateCartFromServerIfEmpty(): Promise<void> {
  if (typeof window === 'undefined') return
  if (getCart().items.length > 0) return
  try {
    const r = await fetch('/api/store/cart')
    const d = await r.json()
    if (d?.success && d?.data?.cart?.items?.length) {
      setCartLoggedIn(true)
      saveCart(d.data.cart as Cart)
    }
  } catch {
    /* best-effort */
  }
}
