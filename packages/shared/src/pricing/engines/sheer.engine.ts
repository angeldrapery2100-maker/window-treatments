// packages/shared/src/pricing/engines/sheer.engine.ts

import { PricingEngine, PricingResult } from "./PricingEngine";
import { roundUp } from "../functions";

export class SheerPricingEngine implements PricingEngine {
  calculate(
    input: { width: number; height: number },
    context: any
  ): PricingResult {
    const { baseParams } = context;

    const width = input.width;
    const height = input.height;

    const fullness = baseParams.fullness_multiplier; // 3.5
    const standardWidth = baseParams.fabric_standard_width; // 36
    const extraHeight = baseParams.extra_height_allowance; // 30

    // panel count
    const panelCount = Math.round((width * fullness) / standardWidth);

    // fabric yard
    let sheerYard: number;
    if (height <= 100) {
      sheerYard = (width * fullness) / standardWidth;
    } else {
      sheerYard = (panelCount / 2) * (height + extraHeight) / 36;
    }

    const fabric = sheerYard * baseParams.sheer_unit_price;
    const labor = panelCount * baseParams.labor_per_panel;

    const total = roundUp(fabric + labor);

    return {
      total,
      breakdown: {
        fabric: roundUp(fabric),
        labor: roundUp(labor),
      },
    };
  }
}
