// packages/shared/src/pricing/engines/DraperyPricingEngine.ts

import type {
  DimensionInput,
  PricingContext,
  PricingResult,
} from "./PricingEngine";

import { evaluateFormula } from "../evaluator";

export class DraperyPricingEngine {
  static calculate(
    input: DimensionInput,
    context: PricingContext
  ): PricingResult {

    const formulaSteps = context.formula?.steps;

    if (!Array.isArray(formulaSteps)) {
      throw new Error("Invalid formula.steps for drapery");
    }

    const scope: Record<string, number> = {
      // 尺寸
      window_width: input.width,
      window_height: input.height,

      // 基础变量（来自 DB）
      ...(context.variables ?? {}),

      // 前端 / 后台传入的 baseParams
      ...(context.baseParams ?? {}),
    };

    const total = evaluateFormula(formulaSteps, scope);

    return {
      total,
      breakdown: {
        total,
      },
    };
  }
}
