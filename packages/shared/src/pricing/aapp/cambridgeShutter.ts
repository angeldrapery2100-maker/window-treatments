// AAPP-parity pricing engine — JC Cambridge Shutter (jc_cambridge_shutter).
//
// Ported 1:1 from AAPP `app-catalog.js` csCalcShutterPrice (and verified
// against the server mirror `functions/index.js` _priceJcCambridgeShutter,
// whose calibration doc PHASE-C-3 shows 4/4 zero drift). Recon write-up:
// docs/AAPP-recon-shutter-pricing-drapery-size-2026-07-19.md.
//
// Model: subtotal = round( (area×rate + Σ psf×area + Σ ea) × qty , 2dp )
//   area = billingW × billingH / 144  (sq ft)
//   billing size in window_size mode = raw window measurement + frame adds
//   (AAPP quote UI default +3" each side; french-door styles use the finished
//   panel size directly).
//
// NOTES ON INTENTIONAL PARITY QUIRKS (do not "fix"):
// - `minAreaSqFt: 9.0` exists in AAPP's defaults but is applied NOWHERE
//   (client & server verified 2026-07-19). Eddie confirmed: keep NOT applying.
// - AAPP's quote UI seeds tiltControl='hidden_tilt_rod' as the DEFAULT, which
//   carries +$0.50/sqft — the calculator itself only charges when the field is
//   set. Callers that mimic the AAPP UI default should pass 'hidden_tilt_rod'.
// - Install is NOT part of the subtotal: flat $20/unit since the 2026-07-16
//   flat-fee migration (calcProductInstallAmount with all size adders zeroed).
//
// Rates source of truth = AAPP `library.cambridgeShutter.pricingRates` when
// the admin has customized it, else these inline defaults (identical fallback
// chain to AAPP's _csResolvePricing). The website receives live rates via the
// AAPP library sync feed; pass them as `ratesTable`. The snapshot below equals
// AAPP's inline CS_SHUTTER_PRICING_DEFAULTS as of 2026-07-19.

export interface CambridgeShutterRatesTable {
  rates: {
    poly_vinyl: number
    hardwood: number
    paulownia: number
    basswood_paint: number
    basswood_stain: number
  }
  defaultRate: number
  /** Defined in AAPP but never applied — kept for feed-shape parity only. */
  minAreaSqFt?: number
  options_psf: Record<string, number>
  options_ea: Record<string, number>
}

export const CAMBRIDGE_SHUTTER_DEFAULT_RATES: CambridgeShutterRatesTable = {
  rates: {
    poly_vinyl: 20.5,
    hardwood: 20.5,
    paulownia: 21.5,
    basswood_paint: 21.9,
    basswood_stain: 25.5,
  },
  defaultRate: 21.9,
  minAreaSqFt: 9.0,
  options_psf: {
    bay_post: 2.0,
    buildout_lt1: 1.0,
    buildout_1_3: 2.0,
    corner_divider_rail: 0.5,
    corner_post: 2.0,
    double_hung: 2.5,
    fixed_louvers: 1.0,
    hidden_hinge: 1.0,
    hidden_tilt: 0.5,
    integrated_tilt: 2.0,
    liberty_arch: 1.0,
    raised_panel: 2.0,
    sill_cap: 2.0,
    solid_panel: 2.0,
    seamless_frame_corner: 5.0,
  },
  options_ea: {
    bifold_bypass_track: 240,
    custom_frame: 216,
    custom_paint: 228,
    custom_stain: 252,
    french_door_cut_out: 192,
    knob: 6,
    lock: 18,
    rake: 192,
    specialty_shapes: 228,
  },
}

// Style → automatic upgrades (mirror of CS_STYLE_UPGRADES).
export const CAMBRIDGE_STYLE_UPGRADES: Record<string, { psf: string[]; ea: string[] }> = {
  bay_window: { psf: ['bay_post'], ea: [] },
  bi_fold: { psf: [], ea: ['bifold_bypass_track'] },
  by_pass_closed: { psf: [], ea: ['bifold_bypass_track'] },
  by_pass_open: { psf: [], ea: ['bifold_bypass_track'] },
  corner_window: { psf: ['corner_post'], ea: [] },
  double_hung: { psf: ['double_hung'], ea: [] },
  skylight: { psf: ['sill_cap'], ea: [] },
  specialty_shape: { psf: [], ea: ['specialty_shapes'] },
}

/** Flat install fee per unit (AAPP 2026-07-16 migration; excluded from subtotal). */
export const CAMBRIDGE_SHUTTER_INSTALL_PER_UNIT = 20

export type CambridgeShutterMaterial = 'basswood' | 'hardwood' | 'poly_vinyl' | 'paulownia'

export interface CambridgeShutterConfig {
  materialId: CambridgeShutterMaterial
  /**
   * basswood splits its base rate by color type; the 14 standard stains are
   * basswood-only. Ignored for other materials. Defaults to 'paint'.
   */
  colorType?: 'paint' | 'stain'
  /** FINISHED (billing) size in inches — see billingSizeFromWindow(). */
  widthIn: number
  heightIn: number
  styleId?: string
  panelSpecialty?: 'no' | 'liberty_arch' | 'raised_panel' | 'solid_panel'
  tiltControl?: 'standard_tilt_rod' | 'hidden_tilt_rod' | 'offset_tilt_rod' | 'invisible_tilt'
  doubleHungEnabled?: boolean
  dividerRailEnabled?: boolean
  buildoutType?: 'none' | 'lt1' | '1_3'
  knobEnabled?: boolean
  lockEnabled?: boolean
  frenchCutOutEnabled?: boolean
  customFinishType?: 'none' | 'custom_paint' | 'custom_stain'
  quantity?: number
}

export interface CambridgeShutterLine {
  label: string
  perSqft?: number
  amount?: number
  flat?: number
}

export interface CambridgeShutterPriceResult {
  /** Product subtotal for ALL units, install excluded (AAPP parity). */
  subtotal: number
  areaSqFt: number
  rate: number
  baseAmount: number
  lines: CambridgeShutterLine[]
  qty: number
  matRateKey: string
  installAmount: number
}

/** AAPP window_size mode: billing size = raw window measurement + frame adds (default +3"/+3"). */
export function billingSizeFromWindow(
  rawWidthIn: number,
  rawHeightIn: number,
  frameAddW = 3,
  frameAddH = 3
): { widthIn: number; heightIn: number } {
  return { widthIn: (rawWidthIn || 0) + (frameAddW || 0), heightIn: (rawHeightIn || 0) + (frameAddH || 0) }
}

export function priceCambridgeShutter(
  cfg: CambridgeShutterConfig,
  ratesTable: CambridgeShutterRatesTable = CAMBRIDGE_SHUTTER_DEFAULT_RATES
): CambridgeShutterPriceResult | null {
  const pW = Number(cfg.widthIn) || 0
  const pH = Number(cfg.heightIn) || 0
  if (!pW || !pH || !cfg.materialId) return null

  const PT = ratesTable

  let rate: number
  let matRateKey: string
  if (cfg.materialId === 'basswood') {
    const stain = cfg.colorType === 'stain'
    rate = stain ? (PT.rates.basswood_stain ?? 25.5) : (PT.rates.basswood_paint ?? 21.9)
    matRateKey = stain ? 'basswood_stain' : 'basswood_paint'
  } else {
    rate = PT.rates[cfg.materialId] ?? PT.defaultRate ?? 21.9
    matRateKey = cfg.materialId
  }

  const area = (pW * pH) / 144
  let sub = area * rate
  const lines: CambridgeShutterLine[] = []
  const psf = PT.options_psf || {}
  const ea = PT.options_ea || {}

  const addPsfLine = (label: string, psfKey: string, condition: boolean) => {
    if (!condition) return
    const r2 = psf[psfKey] || 0
    if (!r2) return
    sub += area * r2
    lines.push({ label, perSqft: r2, amount: area * r2 })
  }
  const addEaLine = (label: string, eaKey: string) => {
    const amt = ea[eaKey] || 0
    if (!amt) return
    sub += amt
    lines.push({ label, flat: amt })
  }

  const sp = cfg.panelSpecialty || 'no'
  addPsfLine('Liberty Arch', 'liberty_arch', sp === 'liberty_arch')
  addPsfLine('Raised Panel', 'raised_panel', sp === 'raised_panel')
  addPsfLine('Solid Panel', 'solid_panel', sp === 'solid_panel')

  const ti = cfg.tiltControl || ''
  addPsfLine('Hidden Tilt Rod', 'hidden_tilt', ti === 'hidden_tilt_rod')
  addPsfLine('Invisible/Integrated Tilt', 'integrated_tilt', ti === 'invisible_tilt')

  // AAPP guard: style double_hung already auto-adds the PSF — never double up.
  addPsfLine('Double Hung', 'double_hung', !!cfg.doubleHungEnabled && cfg.styleId !== 'double_hung')
  addPsfLine('Corner Divider Rail', 'corner_divider_rail', !!cfg.dividerRailEnabled)

  const bo = cfg.buildoutType || 'none'
  addPsfLine('Buildout < 1"', 'buildout_lt1', bo === 'lt1')
  addPsfLine('Buildout 1–3"', 'buildout_1_3', bo === '1_3')

  const styleUp = CAMBRIDGE_STYLE_UPGRADES[cfg.styleId || '']
  if (styleUp) {
    const psfLabels: Record<string, string> = {
      bay_post: 'Bay Post',
      corner_post: 'Corner Post',
      double_hung: 'Double Hung',
      sill_cap: 'Sill Cap',
      fixed_louvers: 'Fixed Louvers',
      hidden_hinge: 'Hidden Hinge',
      seamless_frame_corner: 'Seamless Frame Corner',
    }
    for (const k of styleUp.psf) addPsfLine(psfLabels[k] || k, k, true)
    const eaLabels: Record<string, string> = {
      bifold_bypass_track: 'Bi-Fold/By-Pass Track',
      specialty_shapes: 'Specialty Shapes',
      custom_frame: 'Custom Frame',
      rake: 'Rake',
    }
    for (const k of styleUp.ea) addEaLine(eaLabels[k] || k, k)
  }

  if (cfg.knobEnabled) addEaLine('Knob', 'knob')
  if (cfg.lockEnabled) addEaLine('Lock', 'lock')
  if (cfg.frenchCutOutEnabled) addEaLine('French Door Cut-Out', 'french_door_cut_out')
  const cft = cfg.customFinishType || 'none'
  if (cft === 'custom_paint') addEaLine('Custom Paint', 'custom_paint')
  if (cft === 'custom_stain') addEaLine('Custom Stain', 'custom_stain')

  const qty = Math.max(Math.trunc(Number(cfg.quantity) || 1), 1)
  const baseAmount = area * rate
  const total = Math.round(sub * qty * 100) / 100

  return {
    subtotal: total,
    areaSqFt: Math.round(area * 100) / 100,
    rate,
    baseAmount: Math.round(baseAmount * 100) / 100,
    lines,
    qty,
    matRateKey,
    installAmount: CAMBRIDGE_SHUTTER_INSTALL_PER_UNIT * qty,
  }
}
