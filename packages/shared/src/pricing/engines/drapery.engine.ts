import { DraperyPricingInput } from "./drapery.types";
import { PricingResult } from "../types";

/**
 * Drapery Pricing Engine
 */
export function calculateDraperyPrice(
  input: DraperyPricingInput
): PricingResult {
  const {
    dimension,
    fabricStandardWidth,
    fullnessMultiplier,
    extraHeightAllowance,
    fabricUnitPrice,
    liningPricePerYard,
    laborPerPanel,
    hasLargePanelSurcharge,
  } = input;

  // 1. panel count
  const rawPanelCount =
    (dimension.width * fullnessMultiplier) / fabricStandardWidth;

  const decimal = rawPanelCount - Math.floor(rawPanelCount);
  const panelCount =
    decimal < 0.3 ? Math.floor(rawPanelCount) : Math.ceil(rawPanelCount);

  // 2. fabric yard (inch → yard)
  const fabricInch =
    panelCount * (dimension.height + extraHeightAllowance);
  const fabricYard = Math.ceil(fabricInch / 36);

  // 3. labor multiplier (height surcharge)
  let laborMultiplier = 1;
  if (dimension.height > 120) {
    laborMultiplier = 1.5 + (dimension.height - 120) / 120;
  }

  // 4. large panel surcharge
  let finalLaborPerPanel = laborPerPanel * laborMultiplier;
  if (hasLargePanelSurcharge) {
    finalLaborPerPanel *= 1.5;
  }

  // 5. pricing
  const fabricCost =
    fabricYard * (fabricUnitPrice + liningPricePerYard);
  const laborCost = panelCount * finalLaborPerPanel;

  const subtotal = fabricCost + laborCost;

  return {
    subtotal,
    breakdown: [
      {
        key: "fabric",
        label: "Fabric + Lining",
        amount: fabricCost,
      },
      {
        key: "labor",
        label: "Labor",
        amount: laborCost,
      },
    ],
  };
}
