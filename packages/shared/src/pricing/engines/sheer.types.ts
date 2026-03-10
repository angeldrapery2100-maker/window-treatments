import { NormalizedDimension } from "../../dimension/types";

/**
 * =========================
 * Sheer Pricing Inputs
 * =========================
 */
export interface SheerPricingInput {
  dimension: NormalizedDimension;

  // base parameters
  fabricStandardWidth: number; // e.g. 36
  fullnessMultiplier: number;  // e.g. 3.5
  extraHeightAllowance: number; // e.g. 30

  // product-defined values
  sheerUnitPrice: number; // 员工输入
  laborPerPanel: number;  // 员工输入
}
