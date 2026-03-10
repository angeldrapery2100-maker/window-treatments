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
}

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
