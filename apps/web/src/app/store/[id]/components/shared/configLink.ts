// Serialize a product configuration to/from the URL so a shopper can share or
// bookmark a fully-configured product (dimensions + options) and have it
// restored on open. Pure helpers — safe to call from client effects.
//
// URL shape:  /store/<id>?w=60&h=84&hf=1/2&wf=1/4&qty=2&o_<optionName>=<value>

export interface SharedConfig {
  width?: string
  height?: string
  widthFraction?: string
  heightFraction?: string
  quantity?: number
  options: Record<string, string>
}

export function parseConfigFromUrl(): SharedConfig {
  const out: SharedConfig = { options: {} }
  if (typeof window === 'undefined') return out
  const p = new URLSearchParams(window.location.search)
  const w = p.get('w');  if (w && /^\d{1,3}$/.test(w)) out.width = w
  const h = p.get('h');  if (h && /^\d{1,3}$/.test(h)) out.height = h
  const wf = p.get('wf'); if (wf) out.widthFraction = wf
  const hf = p.get('hf'); if (hf) out.heightFraction = hf
  const qty = p.get('qty'); if (qty && /^\d{1,2}$/.test(qty)) out.quantity = Math.max(1, Math.min(99, parseInt(qty, 10)))
  p.forEach((val, key) => {
    if (key.startsWith('o_')) out.options[decodeURIComponent(key.slice(2))] = val
  })
  return out
}

export function buildConfigUrl(productId: string, cfg: SharedConfig): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://angel-drapery.com'
  const p = new URLSearchParams()
  if (cfg.width)  p.set('w', String(cfg.width))
  if (cfg.height) p.set('h', String(cfg.height))
  if (cfg.widthFraction  && cfg.widthFraction  !== '0') p.set('wf', cfg.widthFraction)
  if (cfg.heightFraction && cfg.heightFraction !== '0') p.set('hf', cfg.heightFraction)
  if (cfg.quantity && cfg.quantity > 1) p.set('qty', String(cfg.quantity))
  for (const [k, v] of Object.entries(cfg.options || {})) {
    if (v) p.set('o_' + encodeURIComponent(k), v)
  }
  const qs = p.toString()
  return `${origin}/store/${productId}${qs ? '?' + qs : ''}`
}
