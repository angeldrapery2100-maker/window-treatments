// ─────────────────────────────────────────────────────────────────────────────
// Category Blueprints — the single registry behind the 5-category store system
// (docs/STORE-REDESIGN-BLUEPRINT.md §2.1). Each blueprint pins, for one store
// category:
//   - productTypeSlug: the product_types row the product is created under
//   - engine:          which AAPP pricing engine (params.aapp_engine) it uses,
//                      or null for fixed-price items (accessory rides the
//                      base_price > 0 path in calcServerTotals — NO engine)
//   - defaultParams:   default_config.params seeded at creation
//   - optionScaffold:  engine-keyed option skeletons (option NAMES are the
//                      keys the AAPP adapter reads — docs/aapp-engine-wiring.md;
//                      value lists start empty and are filled by the admin)
//   - templateKey:     which storefront template renders the product page
//                      (products.template_key column; store/[id] dispatch)
//   - acceptanceSamples: known-good pricing cases from docs/aapp-pricing-spec.md
//                      §7, used by the wizard/editor to verify a configured
//                      product still matches AAPP (P4 wires the auto-compare)
//
// Admin-facing labels/descriptions may be bilingual; anything that gets STORED
// on the product (option names, display labels, values) is English-only.
//
// IMPORTANT: this file only describes defaults for NEWLY created products.
// It must never be used to rewrite existing products — in particular the
// drapery_sheer entry carries the AAPP sheer engine params (spec §3.4) as the
// mechanism for new products, but existing sheer products stay on the legacy
// 3.5x model until the P3 migration is price-verified against AAPP.
// ─────────────────────────────────────────────────────────────────────────────

export type CategoryKey =
  | 'drapery_fabric'
  | 'drapery_sheer'
  | 'hardware'
  | 'luma_shade'
  | 'accessory'

export type ProductTypeSlug = 'drapery' | 'sheer' | 'hardware' | 'shade' | 'accessory'
export type EngineKey = 'drapery' | 'drapery_hardware' | 'luma_shade' | null
export type TemplateKey = 'drapery' | 'sheer' | 'hardware' | 'luma' | 'accessory'

export interface OptionScaffold {
  id: string
  name: string           // engine key — the AAPP adapter reads options by this name
  type: 'select'
  display_label: string  // customer-facing, English only
  values: Array<{ id: string; value: string; label: string; params: Record<string, any>; sort_order: number }>
}

export interface AcceptanceSample {
  /** Short admin-facing label, e.g. "D1 — 100×96 split, $30/yd" */
  label: string
  width: number
  height?: number
  /** Option selections keyed by option name (values are AAPP keys). */
  options: Record<string, string>
  /** Numeric params the sample assumes on the SELECTED option value or the
   *  product params (e.g. fabric_price_per_yard, hw_base_price). The runner
   *  injects these when the product's own config doesn't carry them. */
  sampleParams: Record<string, number>
  /** Expected AAPP unit price (pure product price, install/tax excluded). */
  expectedTotal: number
}

export interface CategoryBlueprint {
  key: CategoryKey
  productTypeSlug: ProductTypeSlug
  engine: EngineKey
  templateKey: TemplateKey
  /** Card title in the creation wizard (English / 中文). */
  label: string
  /** One-line pitch shown on the wizard card. */
  tagline: string
  /** Example products, shown as fine print on the wizard card. */
  examples: string
  /** Emoji icon for the wizard card (placeholder until real sample photos). */
  icon: string
  /** default_config.params seeded at creation. */
  defaultParams: Record<string, any>
  /** default_config.options seeded at creation (value lists start empty). */
  optionScaffold: OptionScaffold[]
  acceptanceSamples: AcceptanceSample[]
}

const opt = (name: string, displayLabel: string): OptionScaffold => ({
  id: name,
  name,
  type: 'select',
  display_label: displayLabel,
  values: [],
})

export const CATEGORY_BLUEPRINTS: Record<CategoryKey, CategoryBlueprint> = {
  // ── ① Drapery 布帘 — 2D custom (width×height → pleat solver) ───────────────
  drapery_fabric: {
    key: 'drapery_fabric',
    productTypeSlug: 'drapery',
    engine: 'drapery',
    templateKey: 'drapery',
    label: 'Drapery / 布帘',
    tagline: 'Custom fabric drapery — pleat solver pricing, longest decision chain',
    examples: 'Pinch pleat linen · Ripplefold velvet · Blackout bedroom drapery',
    icon: '🪡',
    defaultParams: { aapp_engine: 'drapery' },
    // style/lining/operation values are auto-synced by the admin 计算参数 tab
    // (ParamsConfig.syncAappDraperyOptions); fabric colors added by the admin.
    optionScaffold: [
      opt('style', 'Pleat Style'),
      opt('fabric_color', 'Fabric Color'),
      opt('lining', 'Lining'),
      opt('operation', 'Operation'),
    ],
    acceptanceSamples: [
      {
        label: 'D1 — 100×96 split, 2-fold pinch, no lining, $30/yd 55"',
        width: 100,
        height: 96,
        options: { style: '2fold_pinch', operation: 'split', lining: 'NO' },
        sampleParams: { aapp_fabric_price_per_yard: 30, aapp_fabric_width_in: 55 },
        expectedTotal: 660,
      },
    ],
  },

  // ── ② Sheer 纱帘 — same drapery engine, sheer-only composition ─────────────
  // MECHANISM ONLY for new products: existing sheer products keep the legacy
  // 3.5x model until the P3 migration is price-verified with Eddie in AAPP.
  drapery_sheer: {
    key: 'drapery_sheer',
    productTypeSlug: 'sheer',
    engine: 'drapery',
    templateKey: 'sheer',
    label: 'Sheer / 纱帘',
    tagline: 'Light-filtering sheers — drapery engine, sheer-only layer (AAPP spec §3.4)',
    examples: 'White voile · Linen sheer · Day-night layering sheer',
    icon: '☁️',
    defaultParams: { aapp_engine: 'drapery', aapp_composition: 'sheer_only' },
    // Styles limited to pleated + ripplefold per blueprint; values are added
    // by the admin (sheer_price_per_yard rides the fabric option values).
    optionScaffold: [
      opt('style', 'Pleat Style'),
      opt('fabric_color', 'Fabric Color'),
      opt('operation', 'Operation'),
    ],
    acceptanceSamples: [],
  },

  // ── ③ Hardware 杆/轨 — 1D (length): base price + per-foot ──────────────────
  hardware: {
    key: 'hardware',
    productTypeSlug: 'hardware',
    engine: 'drapery_hardware',
    templateKey: 'hardware',
    label: 'Hardware / 杆轨',
    tagline: 'Rods & tracks — priced by length (base price + per-foot over minimum)',
    examples: '1.5" metal rod · Ceiling track · SOMFY motorized track',
    icon: '🛠️',
    defaultParams: { aapp_engine: 'drapery_hardware' },
    // rod values carry hw_base_price / hw_add_per_foot / hw_min_width_in
    // (or legacy hw_price_per_foot); finial values carry finial_price.
    optionScaffold: [
      opt('rod', 'Rod'),
      opt('finial', 'Finial'),
      opt('color', 'Color'),
    ],
    acceptanceSamples: [
      {
        label: 'H1 — 100" rod, $120 base @ 48", +$18/ft',
        width: 100,
        options: {},
        sampleParams: { hw_base_price: 120, hw_add_per_foot: 18, hw_min_width_in: 48 },
        expectedTotal: 210,
      },
    ],
  },

  // ── ④ Luma Shade — table lookup ($/sqm + cassette $/m + control) ───────────
  luma_shade: {
    key: 'luma_shade',
    productTypeSlug: 'shade',
    engine: 'luma_shade',
    templateKey: 'luma',
    label: 'Luma Shade / 卷帘',
    tagline: 'Roller / zebra / honeycomb shades — fabric $/sqm tables + smart controls',
    examples: 'Roller shade · Zebra shade · Motorized dual shade',
    icon: '🎛️',
    defaultParams: { aapp_engine: 'luma_shade', aapp_variant: 'roller_shade' },
    // Option values are AAPP keys: fabric_code (ME8/MB2/DB8…), cassette
    // (open_roll/round_fabric/…), control (plastic_chain/cordless/motorized…).
    optionScaffold: [
      opt('fabric_code', 'Fabric'),
      opt('cassette', 'Cassette'),
      opt('control', 'Control'),
    ],
    acceptanceSamples: [
      {
        label: 'L1 — 60×72 roller, ME8, round fabric cassette, plastic chain',
        width: 60,
        height: 72,
        options: { fabric_code: 'ME8', cassette: 'round_fabric', control: 'plastic_chain' },
        sampleParams: {},
        expectedTotal: 226,
      },
    ],
  },

  // ── ⑤ Accessory 配件 — fixed-price SKU, NO engine ──────────────────────────
  // Pricing = products.base_price (must be > 0). Rides the existing
  // base_price>0 path in calcServerTotals (min-floor + 5× cap);
  // computeServerUnitPrice is never called for it. stock_qty works as-is.
  accessory: {
    key: 'accessory',
    productTypeSlug: 'accessory',
    engine: null,
    templateKey: 'accessory',
    label: 'Accessory / 配件',
    tagline: 'Fixed-price add-ons — pick a variant, set quantity, done',
    examples: 'Remote control · Smart hub · Tiebacks · Drapery hooks',
    icon: '🎀',
    defaultParams: {},
    optionScaffold: [opt('variant', 'Variant')],
    acceptanceSamples: [],
  },
}

export const CATEGORY_ORDER: CategoryKey[] = [
  'drapery_fabric',
  'drapery_sheer',
  'hardware',
  'luma_shade',
  'accessory',
]

/** All storefront template keys the dispatch layer understands. */
export const TEMPLATE_KEYS: TemplateKey[] = ['drapery', 'sheer', 'hardware', 'luma', 'accessory']

export function getBlueprint(key: string | null | undefined): CategoryBlueprint | null {
  if (!key) return null
  return (CATEGORY_BLUEPRINTS as Record<string, CategoryBlueprint>)[key] ?? null
}

/** Blueprint whose product type matches — used to default template_key for
 *  legacy products edited without one. First match in CATEGORY_ORDER wins. */
export function blueprintForProductType(slug: string): CategoryBlueprint | null {
  for (const k of CATEGORY_ORDER) {
    if (CATEGORY_BLUEPRINTS[k].productTypeSlug === slug) return CATEGORY_BLUEPRINTS[k]
  }
  return null
}
