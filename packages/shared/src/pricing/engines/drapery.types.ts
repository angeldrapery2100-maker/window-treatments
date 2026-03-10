import { NormalizedDimension } from "../../dimension/types";

/**
 * =========================
 * Drapery Pricing Inputs
 * =========================
 * 这些值 = 后台新建产品时输入 / 选项决定
 */
export interface DraperyPricingInput {
  dimension: NormalizedDimension;

  // base parameters
  fabricStandardWidth: number; // e.g. 55
  fullnessMultiplier: number;  // e.g. 3
  extraHeightAllowance: number; // e.g. 30

  // product-defined values
  fabricUnitPrice: number; // 员工输入
  liningPricePerYard: number; // 来自 NO / LF / BO
  laborPerPanel: number; // 来自 NO / LF / BO

  // flags / conditions
  hasLargePanelSurcharge: boolean;
}
