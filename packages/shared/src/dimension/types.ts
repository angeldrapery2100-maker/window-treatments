/**
 * =========================
 * Normalized Dimension
 * =========================
 * Pricing engine ONLY uses this structure
 */
export interface NormalizedDimension {
  width: number;   // inch, already includes fraction
  height: number;  // inch, already includes fraction
}

/**
 * =========================
 * Drapery / Sheer Input
 * =========================
 */
export type HeightFractionDrapery = 0 | 0.25 | 0.5 | 0.75;

export interface DraperyDimensionInput {
  widthInt: number;            // 12–360
  heightInt: number;           // 20–360
  heightFraction: HeightFractionDrapery;
}

/**
 * =========================
 * Shade Input
 * =========================
 */
export type FractionShade =
  | 0
  | 0.125
  | 0.25
  | 0.375
  | 0.5
  | 0.625
  | 0.75
  | 0.875;

export interface ShadeDimensionInput {
  widthInt: number;            // 15–96
  widthFraction: FractionShade;
  heightInt: number;           // 15–138
  heightFraction: FractionShade;
}
