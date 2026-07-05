// AAPP-parity pricing types.
//
// Ported 1:1 from the company's internal AAPP quote builder
// (authoritative source: AAPP/functions/index.js server `_price*` functions).
// See docs/aapp-pricing-spec.md for the full formula spec.
//
// Every engine returns a product-only price (installation fees, visit fees,
// tax, discounts and deposits are all EXCLUDED — spec §0.3 / §6).

/** Uniform result shape for all four AAPP pricing engines. */
export interface AappPriceResult {
  /** Final line-item price. Integer dollars for Luma/roman/drapery/hardware
   *  (`priceInt`), 2-decimal dollars for the SOMFY track (spec §4.2). */
  total: number;
  /** Flat key → value map of intermediate calculation values. */
  breakdown: Record<string, number | string>;
}

/** Recursive partial used for config overrides. Arrays are replaced wholesale. */
export type DeepPartial<T> = T extends (infer U)[]
  ? U[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

// ────────────────────────────────────────────────────────────────────────────
// §1 Luma shades (roller / zebra / sheer / dual / modern roman)
// ────────────────────────────────────────────────────────────────────────────

export type LumaVariantKey =
  | "roller_shade"
  | "dual_roller_shade"
  | "zebra_shade"
  | "sheer_shade"
  | "dual_sheer_shade"
  | "modern_roman_shade";

export type LumaFabricTableKey = "roller" | "zebra" | "sheer" | "roman";

export interface LumaFabricRow {
  /** Fabric FAMILY code (prefix before the dash, e.g. "ME8" for "ME8-005"). */
  code: string;
  pricePerSqm: number;
}

export interface LumaCassette {
  key: string;
  pricePerMeter: number;
  label?: string;
}

export interface LumaVariantConfig {
  maxWidth: number;
  maxHeight: number;
  cassettes: LumaCassette[];
}

export interface MotorSystemItem {
  key: string;
  netPrice: number;
  label?: string;
}

/** Motor system shape shared by Luma shades and handcrafted roman shades
 *  (mirrors library.shadeMotorSystems[systemKey]). */
export interface MotorSystem {
  motors: MotorSystemItem[];
  remotes: MotorSystemItem[];
  hubs: MotorSystemItem[];
  accessories: MotorSystemItem[];
}

export interface LumaShadeConfig {
  variants: Record<LumaVariantKey, LumaVariantConfig>;
  /** Control-option surcharge in dollars (plastic_chain 0 / stainless_chain 15 / cordless 50). */
  options: Record<string, number>;
  fabrics: Record<LumaFabricTableKey, LumaFabricRow[]>;
  /** Luma motor system (used when option === "motorized"). */
  motorSystem: MotorSystem;
}

export type LumaControlOption =
  | "plastic_chain"
  | "stainless_chain"
  | "cordless"
  | "motorized";

export interface LumaShadeInput {
  variant: LumaVariantKey;
  /** Finished width in inches (inside mount: inner measurement as-is;
   *  outside mount: outer measurement + user coverage add — spec §1.1). */
  widthIn: number;
  /** Finished height in inches. */
  heightIn: number;
  /** Full fabric code (e.g. "ME8-005") for single-slot variants. */
  fabricFullCode?: string;
  /** Front/back codes for dual variants. */
  frontFabricFullCode?: string;
  backFabricFullCode?: string;
  /** Cassette key from the variant's cassette list. Omit for none ($0). */
  cassette?: string;
  option?: LumaControlOption | string;
  /** Motorized only — defaults to the first configured motor. */
  motorKey?: string;
  /** Motorized only — remote is charged once per remote-owner window. */
  remoteKey?: string;
  /** Set false on windows that SHARE a remote owned by another window. Default true. */
  remoteOwner?: boolean;
  hubKey?: string;
  accessoryKeys?: string[];
  config?: DeepPartial<LumaShadeConfig>;
}

// ────────────────────────────────────────────────────────────────────────────
// §2 Handcrafted roman shade
// ────────────────────────────────────────────────────────────────────────────

export type LiningType = "NO" | "LF" | "BO";
export type RomanMount = "inner" | "outer";

export interface RomanStyle {
  key: string;
  laborPerSqFt: number;
  heightMult: number;
  label?: string;
}

export interface RomanExtraOption {
  key: string;
  netPrice: number;
  label?: string;
}

export interface HandcraftedRomanConfig {
  styles: RomanStyle[];
  fullnessAddIn: number;
  hemAllowanceIn: number;
  laborMarkup: number;
  optionsMarkup: number;
  coverage: Record<RomanMount, { widthAddIn: number; heightAddIn: number }>;
  valance: { pricePerFoot: number };
  extraOptions: RomanExtraOption[];
  /** Shared with drapery: NO 0 / LF 6 / BO 8 $/yd. */
  liningPricePerYard: Record<LiningType, number>;
  /** Motor systems by key (default: { luma }). All items priced at raw netPrice. */
  motorSystems: Record<string, MotorSystem>;
}

export interface RomanFabricInput {
  pricePerYard?: number;
  /** Fabric bolt width, default 54". */
  widthNormalizedIn?: number;
  manualPriceOverride?: number;
  manualWidthOverride?: number;
  hasPattern?: boolean;
  patternRepeatIn?: number;
}

export interface RomanControlInput {
  type?: "manual" | "motorized";
  /** Default "luma". */
  motorSystemKey?: string;
  motorKey?: string;
  remoteKey?: string;
  /** Remote charged only on the owner window. Default true when remoteKey set. */
  remoteOwner?: boolean;
  hubKey?: string;
  accessoryKeys?: string[];
}

export interface HandcraftedRomanInput {
  mount: RomanMount;
  /** RAW measured width/height in inches (coverage add applied per mount). */
  widthIn: number;
  heightIn: number;
  /** Per-order coverage overrides (outer defaults +5 / +6). */
  coverageWidthAddIn?: number;
  coverageHeightAddIn?: number;
  /** flat / slouch / soft / front_fold / reverse_fold / hobbled. Unknown → first style (AAPP parity). */
  styleKey?: string;
  fabric: RomanFabricInput;
  lining?: { type?: LiningType; yardsOverride?: number };
  control?: RomanControlInput;
  valance?: { enabled?: boolean };
  extraOptionKeys?: string[];
  config?: DeepPartial<HandcraftedRomanConfig>;
}

// ────────────────────────────────────────────────────────────────────────────
// §4.1 Drapery hardware (rods / tracks)
// ────────────────────────────────────────────────────────────────────────────

export interface HardwareProfile {
  /** New price model: base price at the minimum billable width… */
  basePriceAtMinWidth?: number;
  /** …plus per-foot beyond the minimum. */
  addPricePerFoot?: number;
  /** Minimum billable width in inches (default 48 → 4 ft). */
  minBillableWidthIn?: number;
  /** Legacy price model: flat $ per billed foot (used only when the new
   *  model's fields are absent/zero). */
  pricePerFoot?: number;
  label?: string;
}

export interface DraperyHardwareConfig {
  /** Keyed by profileKey (AAPP: library.draperyHardwareCatalog.subtypes).
   *  Factory defaults are empty — prices are admin-maintained data. */
  profiles: Record<string, HardwareProfile>;
  finials: Record<string, { price: number; label?: string }>;
  accessories: Record<string, { price: number; label?: string }>;
}

export interface DraperyHardwareInput {
  profileKey: string;
  /** Rod/track length in inches (1-dimensional product). */
  lengthIn: number;
  leftFinialKey?: string;
  rightFinialKey?: string;
  accessorySelections?: { key: string; count: number }[];
  config?: DeepPartial<DraperyHardwareConfig>;
}

// ────────────────────────────────────────────────────────────────────────────
// §4.2 SOMFY motorized track
// ────────────────────────────────────────────────────────────────────────────

export interface SomfyPinchPleatRow {
  w: number;
  split: number;
  side: number;
}

export interface SomfyRipplefoldRow {
  w: number;
  s80: number;
  o80: number;
  s100: number;
  o100: number;
  s120: number;
  o120: number;
}

export interface SomfyMotor {
  id: string;
  /** Already a SELL price — no factor/markup applied. */
  sellPrice: number;
  name?: string;
}

export interface SomfyTrackConfig {
  trackFactor: number;
  trackMarkup: number;
  accessoryMarkup: number;
  motors: SomfyMotor[];
  pinchPleatTable: SomfyPinchPleatRow[];
  ripplefoldTable: SomfyRipplefoldRow[];
  /** Accessory id → NET price (sell = net × accessoryMarkup). */
  accessoriesNet: Record<string, number>;
}

export interface SomfyTrackInput {
  trackType: "pinch_pleat" | "ripplefold";
  /** Track length in inches. Widths beyond the last table row use the last row. */
  widthIn: number;
  /** split (center-open, default) or side (one-way). */
  openType?: "split" | "side";
  /** Ripplefold fullness column. Default "100". */
  fullness?: "80" | "100" | "120";
  motorId?: string;
  /** Double-layer track: track+motor unit ×2. */
  doubleLayer?: boolean;
  accessories?: { id: string; qty?: number }[];
  config?: DeepPartial<SomfyTrackConfig>;
}

// ────────────────────────────────────────────────────────────────────────────
// §3 Handcrafted drapery
// ────────────────────────────────────────────────────────────────────────────

export type DraperyStyleFamily = "pleated" | "ripple";
export type DraperyOperation = "split" | "single_left" | "single_right";
export type DraperyOrientationMode = "auto" | "railroaded" | "vertical";

export interface SpacingFoldParams {
  spacingMin: number;
  spacingTarget: number;
  spacingMax: number;
  /** Pleat allowance (PA) range in inches. */
  paMin: number;
  paMax: number;
}

export interface RippleSystemParams {
  pulley: number;
  button: number;
  c: number;
  baseAdd: number;
}

export interface DraperyConfig {
  /** Spacing-first solver params per layer kind × fold count. */
  spacingFirst: {
    fabric: { fold2: SpacingFoldParams; fold3: SpacingFoldParams };
    sheer: { fold2: SpacingFoldParams; fold3: SpacingFoldParams };
  };
  /** Bottom-hem allowance added to finished height → cutDrop. Default 16". */
  hemAllowanceIn: number;
  rippleSystems: Record<string, RippleSystemParams>;
  /** Main-layer lining price + labor tier: NO $0/$30, LF $6/$36, BO $8/$38. */
  liningOptions: Record<LiningType, { liningPricePerYard: number; laborPerPanel: number }>;
  /** Sheer labor $/panel-width. Default $26. */
  sheerLaborPerPanel: number;
  banding: {
    laborPerFoot: number;
    styles: Record<string, { pricePerYard: number; name?: string }>;
  };
}

export interface DraperyLayerInput {
  enabled: boolean;
  pricePerYard?: number;
  /** Fabric bolt width. Default 55". */
  widthNormalizedIn?: number;
  manualPriceOverride?: number;
  manualWidthOverride?: number;
  orientationMode?: DraperyOrientationMode;
  /** Main layer only. Default "NO". */
  liningType?: LiningType;
  /** Ripple return-to-wall depth for this layer (falls back to input.returnIn). */
  returnIn?: number;
}

export interface DraperyBandingInput {
  enabled: boolean;
  countPerPanel: 1 | 2;
  styleKey?: string;
  pricePerYardOverride?: number;
}

export interface DraperyBundledHardwareInput {
  enabled: boolean;
  profileKey: string;
  leftFinialKey?: string;
  rightFinialKey?: string;
  accessorySelections?: { key: string; count: number }[];
}

export interface HandcraftedDraperyInput {
  /** FINISHED panel size in inches (spec §3.1 — pricing consumes finalSize only). */
  finishedWidthIn: number;
  finishedHeightIn: number;
  composition?: "fabric_only" | "sheer_only" | "fabric_plus_sheer";
  styleFamily: DraperyStyleFamily;
  /** pleated: 2fold_pinch / 3fold_pinch (+tailored variants);
   *  ripple: cn_6cm / cn_7cm / us_60 / us_80 / us_100 / us_120. */
  styleKey: string;
  operation: DraperyOperation;
  /** Ripple return-to-wall depth added to per-side track length. */
  returnIn?: number;
  layers: { main?: DraperyLayerInput; sheer?: DraperyLayerInput };
  /** Bundled hardware — priced via priceDraperyHardware with lengthIn = finishedWidthIn. */
  hardware?: DraperyBundledHardwareInput;
  banding?: DraperyBandingInput;
  config?: DeepPartial<DraperyConfig>;
  /** Catalog for the bundled hardware sub-call. */
  hardwareConfig?: DeepPartial<DraperyHardwareConfig>;
}
