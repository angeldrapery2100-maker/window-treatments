// AAPP-parity pricing — default catalogs, constants and shared helpers.
//
// Values ported verbatim from the AAPP repo (see docs/aapp-pricing-spec.md):
//   • Luma tables:        AAPP/app-catalog.js SHADE_CATALOG_DEFAULTS (:1296-1422)
//   • Luma motor system:  AAPP/app-catalog.js SHADE_MOTOR_SYSTEMS_DEFAULTS (:1745-1764)
//   • Roman catalog:      AAPP/functions/index.js _HCR_CATALOG_DEFAULTS (:3500-3520)
//   • Drapery constants:  AAPP/functions/index.js _DPC_DC / _DPC_RIPPLE_PARAMS /
//                         _DPC_PRICING_DEFAULTS (:3716-3754)
//   • SOMFY tables:       AAPP/functions/index.js _SOMFY_PINCH_PLEAT /
//                         _SOMFY_RIPPLEFOLD / _SOMFY_ACCESSORIES_NET /
//                         _SOMFY_DEFAULTS (:2869-2962)
//
// Every engine accepts a DeepPartial config override merged over these
// defaults with mergeAappConfig (plain objects merge per key, arrays and
// primitives replace wholesale).

import type {
  DeepPartial,
  DraperyConfig,
  DraperyHardwareConfig,
  HandcraftedRomanConfig,
  LumaShadeConfig,
  SomfyTrackConfig,
  SpacingFoldParams,
} from "./types";

// ── Rounding helpers (spec §0.2) ────────────────────────────────────────────

/** Intermediate-amount rounding: 2 decimals. */
export function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

/** Final line-item rounding: whole dollars (non-finite → 0). Mirrors _spPriceInt. */
export function priceInt(x: number): number {
  return Number.isFinite(x) ? Math.round(x) : 0;
}

/** Half-yard ceiling (0 for non-finite / non-positive). Mirrors _dpcCeilHalfYd. */
export function ceilHalfYd(yards: number): number {
  const n = Number(yards);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.ceil(n * 2) / 2;
}

/** Ceiling to the next EVEN integer. Mirrors _dpcCeilingToEven. */
export function ceilToEven(x: number): number {
  const n = Math.ceil(x);
  return n % 2 === 1 ? n + 1 : n;
}

// ── Config merge ────────────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Merge a partial override over a default config. Plain objects merge
 *  recursively per key; arrays and primitives are replaced wholesale. */
export function mergeAappConfig<T>(defaults: T, override?: DeepPartial<T>): T {
  if (override === undefined || override === null) return defaults;
  if (isPlainObject(defaults) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...defaults };
    for (const key of Object.keys(override)) {
      const ov = (override as Record<string, unknown>)[key];
      if (ov === undefined) continue;
      const dv = (defaults as Record<string, unknown>)[key];
      out[key] =
        isPlainObject(dv) && isPlainObject(ov)
          ? mergeAappConfig(dv, ov as DeepPartial<typeof dv>)
          : ov;
    }
    return out as T;
  }
  return override as T;
}

// ── §1 Luma shade defaults ──────────────────────────────────────────────────

/** LUMA_MAX_WIDTH_IN — AAPP/app-catalog.js:575. */
export const LUMA_MAX_WIDTH_IN = 118;
export const LUMA_MAX_HEIGHT_IN = 120;

/** sqm = widthIn × (heightIn + 12) / 1550 — fixed in code (spec §1.2). */
export const LUMA_SQM_DIVISOR = 1550;
export const LUMA_SQM_HEIGHT_ADD_IN = 12;
export const INCH_TO_METER = 0.0254;

export const LUMA_SHADE_DEFAULTS: LumaShadeConfig = {
  variants: {
    roller_shade: {
      maxWidth: LUMA_MAX_WIDTH_IN,
      maxHeight: LUMA_MAX_HEIGHT_IN,
      cassettes: [
        { key: "open_roll", label: "Open Roll", pricePerMeter: 0 },
        { key: "round_fabric", label: "Round + Fabric Wrap", pricePerMeter: 20 },
        { key: "square_fabric", label: "Square + Fabric Wrap", pricePerMeter: 28 },
      ],
    },
    dual_roller_shade: {
      maxWidth: LUMA_MAX_WIDTH_IN,
      maxHeight: LUMA_MAX_HEIGHT_IN,
      cassettes: [{ key: "5inch_square", label: '5" Square Cassette', pricePerMeter: 14 }],
    },
    zebra_shade: {
      maxWidth: LUMA_MAX_WIDTH_IN,
      maxHeight: LUMA_MAX_HEIGHT_IN,
      cassettes: [
        { key: "round", label: "Round Cassette", pricePerMeter: 16 },
        { key: "square", label: "Square Cassette", pricePerMeter: 14 },
      ],
    },
    sheer_shade: {
      maxWidth: LUMA_MAX_WIDTH_IN,
      maxHeight: LUMA_MAX_HEIGHT_IN,
      cassettes: [
        { key: "round", label: "Round Cassette", pricePerMeter: 16 },
        { key: "square", label: "Square Cassette", pricePerMeter: 14 },
      ],
    },
    dual_sheer_shade: {
      maxWidth: LUMA_MAX_WIDTH_IN,
      maxHeight: LUMA_MAX_HEIGHT_IN,
      cassettes: [{ key: "5inch_square", label: '5" Square Cassette', pricePerMeter: 14 }],
    },
    modern_roman_shade: {
      maxWidth: LUMA_MAX_WIDTH_IN,
      maxHeight: LUMA_MAX_HEIGHT_IN,
      cassettes: [{ key: "square", label: "Square Cassette", pricePerMeter: 14 }],
    },
  },
  // NOTE: "motorized" $500 is a legacy placeholder in AAPP — actual motorized
  // pricing goes through the motor system (motor netPrice etc.), spec §1.3.
  options: {
    plastic_chain: 0,
    stainless_chain: 15,
    cordless: 50,
    motorized: 500,
  },
  fabrics: {
    roller: [
      { code: "MB1", pricePerSqm: 95.36 }, { code: "MB2", pricePerSqm: 77.76 }, { code: "MB3", pricePerSqm: 95.36 },
      { code: "MB4", pricePerSqm: 88.34 }, { code: "MB5", pricePerSqm: 105.89 }, { code: "MB6", pricePerSqm: 81.27 },
      { code: "MB7", pricePerSqm: 100.98 }, { code: "MB8", pricePerSqm: 68.62 }, { code: "MB9", pricePerSqm: 100.98 },
      { code: "MB10", pricePerSqm: 81.27 }, { code: "MB11", pricePerSqm: 86.9 }, { code: "MB12", pricePerSqm: 72.85 },
      { code: "MB13", pricePerSqm: 100.98 }, { code: "MB14", pricePerSqm: 88.34 }, { code: "MB15", pricePerSqm: 70.74 },
      { code: "MB16", pricePerSqm: 77.76 }, { code: "MB17", pricePerSqm: 98.86 }, { code: "MB18", pricePerSqm: 103.77 },
      { code: "MB19", pricePerSqm: 81.27 }, { code: "MB20", pricePerSqm: 84.78 }, { code: "MB21", pricePerSqm: 81.27 },
      { code: "MB22", pricePerSqm: 81.27 },
      // MB23 & MB24 discontinued 2026-07 (vendor ceased sales).
      { code: "MB25", pricePerSqm: 102.38 }, { code: "MB26", pricePerSqm: 77.76 }, { code: "MB27", pricePerSqm: 67.23 },
      { code: "MB28", pricePerSqm: 70.74 }, { code: "MB29", pricePerSqm: 77.76 },
      { code: "ME1", pricePerSqm: 67.23 }, { code: "ME2", pricePerSqm: 67.09 }, { code: "ME3", pricePerSqm: 67.9 },
      { code: "ME4", pricePerSqm: 72.86 }, { code: "ME5", pricePerSqm: 81.27 }, { code: "ME6", pricePerSqm: 72.85 },
      { code: "ME7", pricePerSqm: 67.23 }, { code: "ME8", pricePerSqm: 60.21 }, { code: "ME9", pricePerSqm: 67.23 },
      { code: "ME10", pricePerSqm: 70.74 }, { code: "ME11", pricePerSqm: 77.76 }, { code: "ME12", pricePerSqm: 65.84 },
      { code: "ME13", pricePerSqm: 79.88 }, { code: "ME14", pricePerSqm: 67.23 }, { code: "ME15", pricePerSqm: 60.21 },
      { code: "ME16", pricePerSqm: 60.21 }, { code: "ME17", pricePerSqm: 86.22 }, { code: "ME18", pricePerSqm: 56.66 },
      { code: "ME19", pricePerSqm: 56.66 }, { code: "ME20", pricePerSqm: 56.66 }, { code: "ME21", pricePerSqm: 65.84 },
      { code: "ME22", pricePerSqm: 53.15 }, { code: "ME23", pricePerSqm: 65.84 }, { code: "ME24", pricePerSqm: 56.66 },
      { code: "ME25", pricePerSqm: 63.72 }, { code: "ME26", pricePerSqm: 60.21 }, { code: "ME27", pricePerSqm: 56.66 },
      { code: "MF1", pricePerSqm: 88.33 }, { code: "MF2", pricePerSqm: 88.34 }, { code: "MF3", pricePerSqm: 88.34 },
      { code: "MS1", pricePerSqm: 96.75 }, { code: "MS2", pricePerSqm: 84.78 }, { code: "MS3", pricePerSqm: 105.89 },
      { code: "MS4", pricePerSqm: 95.36 }, { code: "MS5", pricePerSqm: 81.27 }, { code: "MS6", pricePerSqm: 70.74 },
      { code: "MS7", pricePerSqm: 70.74 }, { code: "MS8", pricePerSqm: 105.89 }, { code: "MS9", pricePerSqm: 74.25 },
      { code: "MS10", pricePerSqm: 62.28 }, { code: "MS11", pricePerSqm: 56.66 }, { code: "MS12", pricePerSqm: 53.14 },
      { code: "MS13", pricePerSqm: 81.27 }, { code: "MS14", pricePerSqm: 77.76 }, { code: "MS15", pricePerSqm: 60.21 },
      { code: "MS16", pricePerSqm: 88.34 }, { code: "MS17", pricePerSqm: 63.72 }, { code: "MS18", pricePerSqm: 77.76 },
      { code: "MS19", pricePerSqm: 70.74 }, { code: "MS20", pricePerSqm: 88.34 }, { code: "MS21", pricePerSqm: 84.78 },
      { code: "MS22", pricePerSqm: 70.74 }, { code: "MS23", pricePerSqm: 72.85 }, { code: "MS24", pricePerSqm: 82.71 },
      { code: "MS25", pricePerSqm: 72.85 }, { code: "MS26", pricePerSqm: 77.76 },
    ],
    zebra: [
      { code: "DB1", pricePerSqm: 107.42 }, { code: "DB2", pricePerSqm: 124.63 }, { code: "DB3", pricePerSqm: 107.41 },
      { code: "DB4", pricePerSqm: 107.42 }, { code: "DB5", pricePerSqm: 103.12 }, { code: "DB6", pricePerSqm: 120.34 },
      { code: "DB7", pricePerSqm: 120.34 }, { code: "DB8", pricePerSqm: 139.2 }, { code: "DB9", pricePerSqm: 120.34 },
      { code: "DB10", pricePerSqm: 159.0 }, { code: "DB11", pricePerSqm: 107.42 }, { code: "DB12", pricePerSqm: 120.34 },
      { code: "DB13", pricePerSqm: 107.42 }, { code: "DB14", pricePerSqm: 111.71 }, { code: "DB15", pricePerSqm: 197.67 },
      { code: "DB16", pricePerSqm: 118.58 }, { code: "DB17", pricePerSqm: 107.42 }, { code: "DB18", pricePerSqm: 120.34 },
      { code: "DB19", pricePerSqm: 120.34 }, { code: "DB20", pricePerSqm: 107.42 }, { code: "DB21", pricePerSqm: 120.34 },
      { code: "DB22", pricePerSqm: 107.42 }, { code: "DB23", pricePerSqm: 107.42 },
      { code: "DE1", pricePerSqm: 90.2 }, { code: "DE2", pricePerSqm: 94.55 }, { code: "DE3", pricePerSqm: 107.41 },
      { code: "DE4", pricePerSqm: 107.42 }, { code: "DE5", pricePerSqm: 116.0 }, { code: "DE6", pricePerSqm: 73.04 },
      { code: "DE7", pricePerSqm: 73.04 }, { code: "DE8", pricePerSqm: 77.33 }, { code: "DE9", pricePerSqm: 73.04 },
      { code: "DE10", pricePerSqm: 103.12 }, { code: "DE11", pricePerSqm: 73.04 }, { code: "DE12", pricePerSqm: 85.97 },
      { code: "DE13", pricePerSqm: 90.25 }, { code: "DE14", pricePerSqm: 73.04 }, { code: "DE15", pricePerSqm: 98.83 },
      { code: "DE16", pricePerSqm: 98.83 }, { code: "DE17", pricePerSqm: 90.25 }, { code: "DE18", pricePerSqm: 94.55 },
      { code: "DE19", pricePerSqm: 124.63 }, { code: "DE20", pricePerSqm: 84.2 }, { code: "DE21", pricePerSqm: 90.25 },
      { code: "DE22", pricePerSqm: 81.62 }, { code: "DE23", pricePerSqm: 85.97 },
      { code: "DF1", pricePerSqm: 107.42 }, { code: "DF2", pricePerSqm: 116.0 }, { code: "DF3", pricePerSqm: 118.58 },
      { code: "DF4", pricePerSqm: 118.58 }, { code: "DF5", pricePerSqm: 118.58 }, { code: "DF6", pricePerSqm: 141.79 },
      { code: "DF7", pricePerSqm: 141.79 },
    ],
    sheer: [
      { code: "E1", pricePerSqm: 94.9 }, { code: "E2", pricePerSqm: 87.89 }, { code: "E3", pricePerSqm: 137.12 },
      { code: "E5", pricePerSqm: 137.12 }, { code: "E6", pricePerSqm: 116.01 }, { code: "E7", pricePerSqm: 133.61 },
      { code: "E8", pricePerSqm: 123.03 }, { code: "E9", pricePerSqm: 80.83 }, { code: "E11", pricePerSqm: 87.84 },
      { code: "EB4", pricePerSqm: 126.59 }, { code: "EB10", pricePerSqm: 118.12 }, { code: "EB12", pricePerSqm: 105.48 },
      { code: "N1", pricePerSqm: 84.38 }, { code: "N2", pricePerSqm: 94.91 }, { code: "NB3", pricePerSqm: 116.01 },
    ],
    roman: [
      { code: "PE1", pricePerSqm: 84.36 }, { code: "PE2", pricePerSqm: 84.36 }, { code: "PE3", pricePerSqm: 84.36 },
      { code: "PE4", pricePerSqm: 81.24 }, { code: "PE5", pricePerSqm: 81.24 }, { code: "PE6", pricePerSqm: 90.64 },
      { code: "PE7", pricePerSqm: 105.0 }, { code: "PE8", pricePerSqm: 68.76 }, { code: "PE9", pricePerSqm: 78.12 },
      { code: "PE10", pricePerSqm: 105.0 },
      { code: "PB1", pricePerSqm: 101.24 }, { code: "PB2", pricePerSqm: 110.0 }, { code: "PB3", pricePerSqm: 120.64 },
      { code: "PB4", pricePerSqm: 97.52 }, { code: "PB5", pricePerSqm: 97.52 }, { code: "PB6", pricePerSqm: 105.0 },
      { code: "PB7", pricePerSqm: 97.52 }, { code: "PB8", pricePerSqm: 97.52 }, { code: "PB9", pricePerSqm: 97.52 },
      { code: "PB10", pricePerSqm: 105.0 }, { code: "PB11", pricePerSqm: 97.52 },
    ],
  },
  // SHADE_MOTOR_SYSTEMS_DEFAULTS.luma — motor netPrice 0 is a factory
  // placeholder; the real sell price is admin-maintained (spec §1.3).
  motorSystem: {
    motors: [{ key: "luma_rechargeable", label: "Luma Rechargeable Motor", netPrice: 0 }],
    remotes: [
      { key: "remote_2ch", label: "2-Channel Remote", netPrice: 50 },
      { key: "remote_6ch", label: "6-Channel Remote", netPrice: 80 },
      { key: "remote_15ch", label: "15-Channel Remote", netPrice: 120 },
    ],
    hubs: [{ key: "matter_hub", label: "Matter Hub", netPrice: 150 }],
    accessories: [{ key: "solar_panel", label: "Solar Panel", netPrice: 80 }],
  },
};

// ── §2 Handcrafted roman defaults (_HCR_CATALOG_DEFAULTS) ──────────────────

/** Shared lining $/yd (library.draperyPricingCatalog.main.liningOptions). */
export const LINING_PRICE_PER_YARD: Record<"NO" | "LF" | "BO", number> = {
  NO: 0,
  LF: 6,
  BO: 8,
};

export const HANDCRAFTED_ROMAN_DEFAULTS: HandcraftedRomanConfig = {
  styles: [
    { key: "flat", label: "Flat", laborPerSqFt: 12.5, heightMult: 1.0 },
    { key: "slouch", label: "Slouch", laborPerSqFt: 12.5, heightMult: 1.0 },
    { key: "soft", label: "Soft", laborPerSqFt: 12.5, heightMult: 1.0 },
    { key: "front_fold", label: "Front Fold", laborPerSqFt: 13.5, heightMult: 1.0 },
    { key: "reverse_fold", label: "Reverse Fold", laborPerSqFt: 13.5, heightMult: 1.0 },
    { key: "hobbled", label: "Hobbled", laborPerSqFt: 15.0, heightMult: 1.5 },
  ],
  fullnessAddIn: 6,
  hemAllowanceIn: 20,
  laborMarkup: 2.0,
  optionsMarkup: 1.5,
  coverage: {
    outer: { widthAddIn: 5, heightAddIn: 6 },
    inner: { widthAddIn: 0, heightAddIn: 0 },
  },
  valance: { pricePerFoot: 10 },
  extraOptions: [],
  liningPricePerYard: LINING_PRICE_PER_YARD,
  motorSystems: { luma: LUMA_SHADE_DEFAULTS.motorSystem },
};

/** Default roman fabric bolt width when the catalog snapshot has none. */
export const ROMAN_DEFAULT_FABRIC_WIDTH_IN = 54;

// ── §3 Handcrafted drapery defaults (_DPC_DC / _DPC_RIPPLE_PARAMS /
//        _DPC_PRICING_DEFAULTS) ─────────────────────────────────────────────

/** Fixed per-panel allowance (side hems + overlaps) — hard-coded 13" in AAPP. */
export const DRAPERY_FIXED_ALLOWANCE_IN = 13;
/** Lining is always vertical-seamed at a fixed 55" bolt width. */
export const DRAPERY_LINING_WIDTH_IN = 55;
/** No-lining / sheer labor widths are computed against a 50" reference width. */
export const DRAPERY_LABOR_REF_WIDTH_IN = 50;
/** Default face-fabric bolt width when the layer snapshot has none. */
export const DRAPERY_DEFAULT_FABRIC_WIDTH_IN = 55;
/** Banding length allowance per piece: finishedHeight + 6". */
export const DRAPERY_BANDING_LENGTH_ADD_IN = 6;

const SPACING_FOLD2: SpacingFoldParams = {
  spacingMin: 4.0,
  spacingTarget: 4.375,
  spacingMax: 4.75,
  paMin: 5.0,
  paMax: 7.0,
};

const SPACING_FOLD3: SpacingFoldParams = {
  spacingMin: 4.0,
  spacingTarget: 4.375,
  spacingMax: 4.75,
  paMin: 6.25,
  paMax: 9.0,
};

export const DRAPERY_DEFAULTS: DraperyConfig = {
  spacingFirst: {
    fabric: { fold2: { ...SPACING_FOLD2 }, fold3: { ...SPACING_FOLD3 } },
    sheer: { fold2: { ...SPACING_FOLD2 }, fold3: { ...SPACING_FOLD3 } },
  },
  hemAllowanceIn: 16,
  rippleSystems: {
    cn_6cm: { pulley: 2.3622, button: 4.9213, c: 3.0, baseAdd: 7 },
    cn_7cm: { pulley: 2.76, button: 5.7087, c: 3.0, baseAdd: 7 },
    us_60: { pulley: 2.625, button: 4.25, c: 3.0, baseAdd: 7 },
    us_80: { pulley: 2.375, button: 4.25, c: 3.0, baseAdd: 7 },
    us_100: { pulley: 2.125, button: 4.25, c: 3.0, baseAdd: 7 },
    us_120: { pulley: 1.875, button: 4.25, c: 3.0, baseAdd: 7 },
  },
  liningOptions: {
    NO: { liningPricePerYard: 0, laborPerPanel: 30 },
    LF: { liningPricePerYard: 6, laborPerPanel: 36 },
    BO: { liningPricePerYard: 8, laborPerPanel: 38 },
  },
  sheerLaborPerPanel: 26,
  banding: {
    laborPerFoot: 10,
    styles: {
      banding_std: { name: "Standard Banding", pricePerYard: 15 },
      banding_prem: { name: "Premium Banding", pricePerYard: 25 },
    },
  },
};

// ── §4.1 Drapery hardware defaults ──────────────────────────────────────────

/** Factory catalog ships with NO prices — profiles/finials/accessories are
 *  admin-maintained data (AAPP app-catalog.js:1532-1596, all defaults $0).
 *  Callers must supply the real catalog via the config override. */
export const DRAPERY_HARDWARE_DEFAULTS: DraperyHardwareConfig = {
  profiles: {},
  finials: {},
  accessories: {},
};

/** Default minimum billable width for the new price model (4 ft). */
export const HARDWARE_DEFAULT_MIN_BILLABLE_WIDTH_IN = 48;

// ── §4.2 SOMFY motorized track defaults ─────────────────────────────────────

export const SOMFY_PINCH_PLEAT = [
  { w: 48, split: 604, side: 564 }, { w: 60, split: 672, side: 628 },
  { w: 72, split: 720, side: 684 }, { w: 84, split: 772, side: 732 },
  { w: 96, split: 832, side: 792 }, { w: 108, split: 896, side: 852 },
  { w: 120, split: 1008, side: 968 }, { w: 132, split: 1064, side: 1024 },
  { w: 144, split: 1136, side: 1096 }, { w: 156, split: 1188, side: 1148 },
  { w: 168, split: 1256, side: 1220 }, { w: 180, split: 1316, side: 1276 },
  { w: 192, split: 1424, side: 1388 }, { w: 204, split: 1496, side: 1456 },
  { w: 216, split: 1552, side: 1512 }, { w: 228, split: 1676, side: 1632 },
  { w: 240, split: 1744, side: 1704 }, { w: 252, split: 1800, side: 1760 },
  { w: 264, split: 1856, side: 1820 }, { w: 276, split: 1924, side: 1884 },
  { w: 288, split: 2000, side: 1960 }, { w: 300, split: 2056, side: 2016 },
  { w: 312, split: 2120, side: 2080 }, { w: 324, split: 2152, side: 2112 },
  { w: 336, split: 2224, side: 2184 }, { w: 348, split: 2280, side: 2240 },
  { w: 360, split: 2356, side: 2320 }, { w: 372, split: 2408, side: 2368 },
  { w: 384, split: 2468, side: 2432 }, { w: 396, split: 2524, side: 2480 },
  { w: 408, split: 2596, side: 2560 }, { w: 420, split: 2636, side: 2592 },
  { w: 432, split: 2688, side: 2652 },
];

export const SOMFY_RIPPLEFOLD = [
  { w: 48, s80: 668, o80: 632, s100: 688, o100: 656, s120: 716, o120: 676 },
  { w: 60, s80: 752, o80: 708, s100: 772, o100: 736, s120: 808, o120: 768 },
  { w: 72, s80: 816, o80: 780, s100: 848, o100: 816, s120: 884, o120: 848 },
  { w: 84, s80: 888, o80: 848, s100: 920, o100: 884, s120: 968, o120: 924 },
  { w: 96, s80: 960, o80: 920, s100: 1004, o100: 964, s120: 1048, o120: 1008 },
  { w: 108, s80: 1040, o80: 1000, s100: 1088, o100: 1048, s120: 1144, o120: 1100 },
  { w: 120, s80: 1168, o80: 1128, s100: 1220, o100: 1184, s120: 1280, o120: 1244 },
  { w: 132, s80: 1244, o80: 1200, s100: 1296, o100: 1264, s120: 1368, o120: 1324 },
  { w: 144, s80: 1328, o80: 1292, s100: 1396, o100: 1360, s120: 1464, o120: 1424 },
  { w: 156, s80: 1404, o80: 1360, s100: 1472, o100: 1432, s120: 1548, o120: 1504 },
  { w: 168, s80: 1484, o80: 1448, s100: 1564, o100: 1524, s120: 1644, o120: 1604 },
  { w: 180, s80: 1560, o80: 1520, s100: 1640, o100: 1600, s120: 1728, o120: 1688 },
  { w: 192, s80: 1684, o80: 1648, s100: 1776, o100: 1736, s120: 1864, o120: 1824 },
  { w: 204, s80: 1772, o80: 1728, s100: 1860, o100: 1824, s120: 1964, o120: 1920 },
  { w: 216, s80: 1844, o80: 1808, s100: 1944, o100: 1908, s120: 2048, o120: 2008 },
  { w: 228, s80: 1984, o80: 1940, s100: 2084, o100: 2048, s120: 2196, o120: 2156 },
  { w: 240, s80: 2064, o80: 2028, s100: 2176, o100: 2140, s120: 2292, o120: 2256 },
  { w: 252, s80: 2144, o80: 2096, s100: 2256, o100: 2216, s120: 2380, o120: 2336 },
  { w: 264, s80: 2212, o80: 2176, s100: 2336, o100: 2300, s120: 2464, o120: 2424 },
  { w: 276, s80: 2304, o80: 2256, s100: 2424, o100: 2388, s120: 2560, o120: 2516 },
  { w: 288, s80: 2388, o80: 2348, s100: 2520, o100: 2484, s120: 2656, o120: 2624 },
  { w: 300, s80: 2464, o80: 2420, s100: 2596, o100: 2560, s120: 2744, o120: 2704 },
  { w: 312, s80: 2544, o80: 2504, s100: 2688, o100: 2652, s120: 2832, o120: 2800 },
  { w: 324, s80: 2592, o80: 2548, s100: 2736, o100: 2704, s120: 2896, o120: 2852 },
  { w: 336, s80: 2676, o80: 2636, s100: 2832, o100: 2796, s120: 2992, o120: 2956 },
  { w: 348, s80: 2752, o80: 2704, s100: 2912, o100: 2872, s120: 3080, o120: 3036 },
  { w: 360, s80: 2844, o80: 2800, s100: 3012, o100: 2976, s120: 3180, o120: 3140 },
  { w: 372, s80: 2912, o80: 2868, s100: 3084, o100: 3044, s120: 3264, o120: 3216 },
  { w: 384, s80: 2988, o80: 2948, s100: 3168, o100: 3132, s120: 3348, o120: 3312 },
  { w: 396, s80: 3056, o80: 3012, s100: 3240, o100: 3200, s120: 3432, o120: 3388 },
  { w: 408, s80: 3148, o80: 3108, s100: 3340, o100: 3300, s120: 3532, o120: 3492 },
  { w: 420, s80: 3204, o80: 3160, s100: 3396, o100: 3360, s120: 3600, o120: 3556 },
  { w: 432, s80: 3272, o80: 3232, s100: 3476, o100: 3440, s120: 3680, o120: 3640 },
];

/** Accessory id → NET price (sell = net × accessoryMarkup, default ×1.5). */
export const SOMFY_ACCESSORIES_NET: Record<string, number> = {
  charger_45: 283,
  battery_45: 940,
  transformer_24v: 45,
  pde_5: 740,
  pde_10: 1113,
  pde_15: 1442,
  pde_20: 1718,
  situo1_rts: 56,
  situo5_rts: 73,
  situo5v_rts: 111,
  telis16_rts: 251,
  smoove1_rts: 75,
  smoove4_rts: 93,
  decoflex5_rts: 100,
  urtsi2: 399,
  ysia1_z: 60,
  ysia5_z: 79,
  ysia5v_z: 115,
  decoflex4_z: 153,
  smartplug_z: 42,
  tahoma_hub: 185,
  tahoma_eth: 28,
};

export const SOMFY_TRACK_DEFAULTS: SomfyTrackConfig = {
  trackFactor: 0.29,
  trackMarkup: 2.2,
  accessoryMarkup: 1.5,
  motors: [
    { id: "glydea35", name: "Glydea® ULTRA 35 Motor RTS", sellPrice: 1640 },
    { id: "glydea60", name: "Glydea® ULTRA 60 Motor RTS", sellPrice: 1920 },
    { id: "irismo45", name: "Irismo™ 45 WireFree RTS", sellPrice: 1670 },
    { id: "irismo35", name: "Irismo™ 35 (Mini DC) DCT", sellPrice: 1640 },
  ],
  pinchPleatTable: SOMFY_PINCH_PLEAT,
  ripplefoldTable: SOMFY_RIPPLEFOLD,
  accessoriesNet: SOMFY_ACCESSORIES_NET,
};
