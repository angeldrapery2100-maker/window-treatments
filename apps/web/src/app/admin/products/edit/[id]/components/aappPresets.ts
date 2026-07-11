// ─────────────────────────────────────────────────────────────────────────────
// Shared AAPP drapery engine presets for the admin product editor.
//
// Single source of truth for the engine option keys/labels rendered by BOTH
// ParamsConfig (款式勾选 auto-sync) and OptionsManager (fixed pick-list).
// The persisted truth is the product option's `values` array — these constants
// only define which keys exist and their built-in labels.
//
// Engine keys: packages/shared/src/pricing/aapp/adapter.ts and
// docs/aapp-engine-wiring.md §3. Do NOT invent new keys here — the pricing
// engine only understands these exact strings.
// ─────────────────────────────────────────────────────────────────────────────

export const AAPP_STYLE_ORDER = ['2fold_pinch', '3fold_pinch', 'cn_6cm', 'cn_7cm', 'us_60', 'us_80', 'us_100', 'us_120'] as const

export const AAPP_STYLE_LABELS: Record<string, string> = {
  '2fold_pinch': '2-Fold Pinch Pleat',
  '3fold_pinch': '3-Fold Pinch Pleat',
  cn_6cm: 'Ripplefold 6cm (CN)',
  cn_7cm: 'Ripplefold 7cm (CN)',
  us_60: 'Ripplefold 60% (US)',
  us_80: 'Ripplefold 80% (US)',
  us_100: 'Ripplefold 100% (US)',
  us_120: 'Ripplefold 120% (US)',
}

export const AAPP_STYLE_ZH: Record<string, string> = {
  '2fold_pinch': '两褶',
  '3fold_pinch': '三褶',
  cn_6cm: '蛇形帘 6cm (国标)',
  cn_7cm: '蛇形帘 7cm (国标)',
  us_60: '蛇形帘 60% (美标)',
  us_80: '蛇形帘 80% (美标)',
  us_100: '蛇形帘 100% (美标)',
  us_120: '蛇形帘 120% (美标)',
}

export const AAPP_LINING_ORDER = ['NO', 'LF', 'BO'] as const
export const AAPP_LINING_LABELS: Record<string, string> = {
  NO: 'No Lining',
  LF: 'Light Filtering Lining',
  BO: 'Blackout Lining',
}
// Engine built-in tiers (packages/shared/src/pricing/aapp/constants.ts liningOptions)
export const AAPP_LINING_TIERS = [
  { key: 'NO', zh: '无衬', fabric: 0, labor: 30 },
  { key: 'LF', zh: '遮光衬', fabric: 6, labor: 36 },
  { key: 'BO', zh: '全遮光衬', fabric: 8, labor: 38 },
]

export const AAPP_OPERATION_ORDER = ['split', 'single_left', 'single_right'] as const
export const AAPP_OPERATION_LABELS: Record<string, string> = {
  split: 'Split (Pair)',
  single_left: 'Single Panel — Left',
  single_right: 'Single Panel — Right',
}
export const AAPP_OPERATION_ZH: Record<string, string> = {
  split: '对开',
  single_left: '单开（左）',
  single_right: '单开（右）',
}

/**
 * Map a hand-typed pleat/style string to an engine style key, or null when
 * unrecognizable. Used by the one-click `pleat_style` → `style` migration.
 *
 * Recognized examples:
 *   "2 Fold Pinch" / "2 Fold Tailored" / "2fold_pinch"  → 2fold_pinch
 *   "3 Fold Pinch Pleated"                              → 3fold_pinch
 *   "Ripplefold 6cm" / "CN 6cm"                         → cn_6cm
 *   "Ripplefold 80%" / "US 80"                          → us_80
 */
export function normalizePleatStyleValue(raw: unknown): string | null {
  const s = String(raw ?? '').trim().toLowerCase()
  if (!s) return null
  if ((AAPP_STYLE_ORDER as readonly string[]).includes(s)) return s
  const c = s.replace(/[\s\-_./()]+/g, '')
  if (c.startsWith('2fold') || c.startsWith('twofold') || c.startsWith('doublepinch')) return '2fold_pinch'
  if (c.startsWith('3fold') || c.startsWith('threefold') || c.startsWith('triplepinch')) return '3fold_pinch'
  if (c.includes('6cm')) return 'cn_6cm'
  if (c.includes('7cm')) return 'cn_7cm'
  if (/ripple|wave|snake|蛇形|^us/.test(c)) {
    if (c.includes('120')) return 'us_120'
    if (c.includes('100')) return 'us_100'
    if (c.includes('80')) return 'us_80'
    if (c.includes('60')) return 'us_60'
  }
  return null
}
