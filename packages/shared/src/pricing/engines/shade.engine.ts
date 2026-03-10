// packages/shared/src/pricing/engines/shade.engine.ts

import { PricingEngine, PricingResult } from "./PricingEngine";
import { roundUp } from "../functions";

export class ShadePricingEngine implements PricingEngine {
  calculate(
    input: { width: number; height: number },
    context: any
  ): PricingResult {
    const {
      baseParams,
      options,
      optionValues,
    } = context;

    const width = input.width;
    const height = input.height;

    // 面积（示例逻辑）
    const area = Math.max(1, (width * height) / 1550);

    const fabricPrice = area * baseParams.fabric_unit_price;

    const topTreatment =
      optionValues.top_treatment?.[options.top_treatment] ?? 0;

    const control =
      optionValues.control?.[options.control] ?? 0;

    const total = roundUp(fabricPrice + topTreatment + control);

    return {
      total,
      breakdown: {
        fabric: roundUp(fabricPrice),
        hardware: roundUp(topTreatment),
        control: roundUp(control),
      },
    };
  }
}
