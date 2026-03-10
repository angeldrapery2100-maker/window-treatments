// packages/shared/src/pricing/engines/UnifiedPricingEngine.ts

import type { DimensionInput, PricingContext, PricingResult } from "./PricingEngine";
import { evaluateFormula } from "../evaluator";

/**
 * Unified Pricing Engine - 支持三种产品的完整计算规则
 *
 * 架构原则：
 * - 数据库公式层：只做纯数学运算（raw 值）
 * - 代码层：负责取整、倍率、商业规则
 */
export class UnifiedPricingEngine {
  static calculate(
    input: DimensionInput,
    context: PricingContext & { formula: any; options?: Record<string, string>; optionValues?: Record<string, Record<string, Record<string, number>>> }
  ): PricingResult {
    // 初始化 scope
    const scope: Record<string, any> = {
      window_width: input.width,
      window_height: input.height,
      ...(context.baseParams ?? {}),
    };

    // 注入选项值（lining、control 等）
    if (context.options && context.optionValues) {
      for (const optionKey of Object.keys(context.options)) {
        const selected = context.options[optionKey];
        const table = context.optionValues[optionKey];
        // 没有数值参数的选项（如 mounting、control_side）直接跳过
        if (!table || !table[selected]) continue;
        Object.assign(scope, table[selected]);
      }
    }

    // ===== Sheer 特殊逻辑（需要分支判断）=====
    if (context.productType === "sheer") {
      return this.calculateSheer(scope, context);
    }

    // ===== Drapery / Shade：执行数据库公式 =====
    if (!context.formula?.steps) {
      throw new Error("Missing formula.steps");
    }

    // 执行所有公式步骤
    for (const step of context.formula.steps) {
      evaluateFormula(step, scope);
    }

    // ===== 代码层规则 =====
    if (context.productType === "drapery") {
      return this.applyDraperyRules(scope, context);
    }

    if (context.productType === "shade") {
      return this.applyShadeRules(scope);
    }

    // 默认返回
    return {
      total: Math.round(scope.total_raw ?? scope.total ?? 0),
      breakdown: scope,
    };
  }

  /**
   * Drapery 代码层规则
   */
  private static applyDraperyRules(
    scope: Record<string, any>,
    context: PricingContext & { options?: Record<string, string> }
  ): PricingResult {
    const window_height = scope.window_height;
    const panel_count_raw = scope.panel_count_raw ?? 0;
    const fabric_cost_raw = scope.fabric_cost_raw ?? 0;
    const labor_per_panel = scope.labor_per_panel ?? 0;

    // 1. 向上取整
    const panel_count = Math.ceil(panel_count_raw);
    const fabric_yard = Math.ceil(scope.fabric_yard_raw ?? 0);

    // 2. 计算人工倍率
    let labor_multiplier = 1.0;

    // 2.1 高度倍率（向上取整）
    if (window_height >= 120) {
      const extra_height = window_height - 120;
      const extra_increments = Math.ceil(extra_height / 12);
      labor_multiplier = 1.5 + extra_increments * 0.1;
    }

    // 2.2 Stacking 倍率
    // 后台选项参数 stacking_divisor：如 one_way=1, center_open=2
    // panels_per_section = panel_count / stacking_divisor
    // 如果 panels_per_section > 5，人工费 × 1.5（与高度倍率叠加）
    const stacking_divisor = scope.stacking_divisor ?? 1;
    const panels_per_section = panel_count / stacking_divisor;
    let stacking_surcharge = 1.0;

    if (panels_per_section > 5) {
      stacking_surcharge = 1.5;
      labor_multiplier *= stacking_surcharge;
    }

    // 3. 最终人工费
    const labor_cost = panel_count * labor_per_panel * labor_multiplier;

    // 4. 最终总价
    const total = Math.round(fabric_cost_raw + labor_cost);

    // 5. 返回完整 breakdown
    return {
      total,
      breakdown: {
        ...scope,
        panel_count,
        fabric_yard,
        stacking_divisor,
        panels_per_section,
        stacking_surcharge,
        labor_multiplier,
        labor_cost,
        total,
      },
    };
  }

  /**
   * Sheer 完整计算逻辑（包含分支）
   */
  private static calculateSheer(
    scope: Record<string, any>,
    context: PricingContext & { options?: Record<string, string> }
  ): PricingResult {
    const window_width = scope.window_width;
    const window_height = scope.window_height;
    const sheer_fabric_width = scope.sheer_fabric_width ?? 55; // 默认 55"
    const sheer_unit_price = scope.sheer_unit_price ?? 0;
    const labor_per_panel = scope.labor_per_panel ?? 0;

    // ===== 1. Labor（固定按 50" 幅宽计算）=====
    const labor_panel_count_raw = (window_width * 3.5) / 50;
    const labor_panel_count = Math.ceil(labor_panel_count_raw);

    // 计算人工倍率（向上取整）
    let labor_multiplier = 1.0;
    if (window_height >= 120) {
      const extra_height = window_height - 120;
      const extra_increments = Math.ceil(extra_height / 12);
      labor_multiplier = 1.5 + extra_increments * 0.1;
    }

    const labor_cost = labor_panel_count * labor_per_panel * labor_multiplier;

    // ===== 2. Sheer 用量（根据幅宽分类）=====
    let sheer_yard = 0;
    let sheer_panel_raw = 0;
    let sheer_panel = 0;
    let calculation_method = "";

    if (sheer_fabric_width >= 110) {
      // 超宽纱（≥110"）
      const threshold_height = sheer_fabric_width - 16;

      if (window_height < threshold_height) {
        // 横做
        calculation_method = "extra_wide_horizontal";
        sheer_yard = Math.ceil((window_width * 3.5) / 36);
      } else {
        // 竖拼（二舍三进）
        calculation_method = "extra_wide_vertical";
        sheer_panel_raw = (window_width * 3.5) / sheer_fabric_width;
        sheer_panel = this.roundTwoSheThreeJin(sheer_panel_raw);
        sheer_yard = Math.ceil((sheer_panel * (window_height + 20)) / 36);
      }
    } else {
      // 普通纱（50-60"）
      calculation_method = "normal";
      sheer_panel_raw = (window_width * 3.5) / sheer_fabric_width;
      sheer_panel = Math.ceil(sheer_panel_raw);
      sheer_yard = Math.ceil((sheer_panel * (window_height + 20)) / 36);
    }

    // ===== 3. 总价 =====
    const fabric_cost = sheer_yard * sheer_unit_price;
    const total = Math.round(labor_cost + fabric_cost);

    // ===== 4. 返回 breakdown =====
    return {
      total,
      breakdown: {
        window_width,
        window_height,
        sheer_fabric_width,
        sheer_unit_price,
        labor_per_panel,
        labor_panel_count_raw,
        labor_panel_count,
        labor_multiplier,
        labor_cost,
        sheer_panel_raw,
        sheer_panel,
        sheer_yard,
        fabric_cost,
        total,
        calculation_method,
        stacking_option: context.options?.stacking_option ?? "", // 仅记录
      },
    };
  }

  /**
   * Shade 代码层规则
   */
  private static applyShadeRules(scope: Record<string, any>): PricingResult {
    // 1. 面积（最小 1 平方米）
    const area_sqm_raw = scope.area_sqm_raw ?? 0;
    const area_sqm = Math.max(1, area_sqm_raw);

    // 2. 五金件、控制器直接取值
    const fabric_cost = area_sqm * (scope.fabric_unit_price ?? 0);
    const hardware_cost = scope.hardware_cost ?? 0;
    const control_cost = scope.control_cost ?? scope.control_price ?? 0;

    // 3. 总价
    const total = Math.round(fabric_cost + hardware_cost + control_cost);

    return {
      total,
      breakdown: {
        ...scope,
        area_sqm,
        fabric_cost,
        hardware_cost,
        control_cost,
        total,
      },
    };
  }

  /**
   * 二舍三进取整
   */
  private static roundTwoSheThreeJin(value: number): number {
    const integer = Math.floor(value);
    const decimal = value - integer;
    return decimal < 0.3 ? integer : integer + 1;
  }
}
