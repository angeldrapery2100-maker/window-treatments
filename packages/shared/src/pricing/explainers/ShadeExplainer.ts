// packages/shared/src/pricing/explainers/ShadeExplainer.ts

export type ExplainLine = {
  key: string;
  en: string;
  zh: string;
  value: number | string;
};

function n(v: unknown): number | undefined {
  return typeof v === "number" && !Number.isNaN(v) ? v : undefined;
}

function money(v: number): number {
  return Math.round(v);
}

/**
 * Shade 报价解释器（中英双语）
 */
export function explainShade(scope: Record<string, unknown>): ExplainLine[] {
  const windowWidth = n(scope.window_width) ?? 0;
  const windowHeight = n(scope.window_height) ?? 0;
  
  const areaSqmRaw = n(scope.area_sqm_raw) ?? 0;
  const areaSqm = n(scope.area_sqm) ?? Math.max(1, areaSqmRaw);
  const fabricUnitPrice = n(scope.fabric_unit_price) ?? 0;
  const fabricCost = n(scope.fabric_cost) ?? areaSqm * fabricUnitPrice;
  
  const windowWidthM = n(scope.window_width_m) ?? (windowWidth * 2.54) / 100;
  const hardwareUnitPrice = n(scope.hardware_unit_price) ?? 0;
  const hardwareCost = n(scope.hardware_cost) ?? windowWidthM * hardwareUnitPrice;
  
  const controlPrice = n(scope.control_price) ?? n(scope.control_cost) ?? 0;
  const total = n(scope.total) ?? money(fabricCost + hardwareCost + controlPrice);

  return [
    {
      key: "window_size",
      en: "Window size (W × H, inches)",
      zh: "窗户尺寸（宽×高，英寸）",
      value: `${windowWidth} × ${windowHeight}`,
    },
    {
      key: "area_sqm_raw",
      en: "Area (raw, square meters)",
      zh: "面积（未取整，平方米）",
      value: areaSqmRaw.toFixed(3),
    },
    {
      key: "area_sqm",
      en: "Billable area (≥1㎡)",
      zh: "计费面积（≥1平方米）",
      value: areaSqm.toFixed(3),
    },
    {
      key: "fabric_unit_price",
      en: "Fabric price ($/㎡)",
      zh: "面料单价（美元/平方米）",
      value: fabricUnitPrice,
    },
    {
      key: "fabric_cost",
      en: "Fabric subtotal ($)",
      zh: "面料小计（美元）",
      value: money(fabricCost),
    },
    {
      key: "window_width_m",
      en: "Window width (meters)",
      zh: "窗户宽度（米）",
      value: windowWidthM.toFixed(3),
    },
    {
      key: "hardware_unit_price",
      en: "Hardware price ($/meter)",
      zh: "五金单价（美元/米）",
      value: hardwareUnitPrice,
    },
    {
      key: "hardware_cost",
      en: "Hardware subtotal ($)",
      zh: "五金小计（美元）",
      value: money(hardwareCost),
    },
    {
      key: "control_price",
      en: "Control price ($)",
      zh: "控制器价格（美元）",
      value: controlPrice,
    },
    {
      key: "total",
      en: "Total ($)",
      zh: "总价（美元）",
      value: money(total),
    },
  ];
}
