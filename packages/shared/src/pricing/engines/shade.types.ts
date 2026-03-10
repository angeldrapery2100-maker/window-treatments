import { NormalizedDimension } from "../../dimension/types";

/**
 * =========================
 * Shade Pricing Input
 * =========================
 */
export interface ShadePricingInput {
  dimension: NormalizedDimension;

  quantity: number;

  // Selected option values (predefined by staff)
  fabricUnitPrice: number;        // from FabricCode
  topTreatmentPricePerInch: number;
  controlPricePerUnit: number;
}
