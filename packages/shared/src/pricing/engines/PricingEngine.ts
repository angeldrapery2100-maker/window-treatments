// packages/shared/src/pricing/engines/PricingEngine.ts

export interface DimensionInput {
  width: number;   // 已处理小数（例如 120.75）
  height: number;  // 已处理小数
}

export interface PricingContext {
  productType: "drapery" | "sheer" | "shade";

  // 员工在后台配置的基础参数
  baseParams: Record<string, number>;

  // 选项框（如下拉选）
  options: Record<string, string>;

  // 每个 option 对应的数值表
  optionValues: Record<string, Record<string, Record<string, number>>>;
}

export interface PricingResult {
  total: number;            // ✅ 最终价（整数）
  breakdown: Record<string, number | string>; // 用于后台解释
}

export interface PricingEngine {
  calculate(
    input: DimensionInput,
    context: PricingContext
  ): PricingResult;
}
