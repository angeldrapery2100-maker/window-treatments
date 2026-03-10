// packages/shared/src/pricing/explainers/DraperyExplainer.ts

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
 * Drapery 报价解释器（中英双语）
 */
export function explainDrapery(scope: Record<string, unknown>): ExplainLine[] {
  const windowWidth = n(scope.window_width) ?? 0;
  const windowHeight = n(scope.window_height) ?? 0;
  const fullness = n(scope.fullness_multiplier);
  const stdWidth = n(scope.fabric_standard_width);
  const extraH = n(scope.extra_height_allowance);
  const fabricUnit = n(scope.fabric_unit_price) ?? 0;
  const liningPerYd = n(scope.lining_price_per_yard) ?? 0;
  const laborPerPanel = n(scope.labor_per_panel) ?? 0;
  const laborMultiplier = n(scope.labor_multiplier) ?? 1.0;
  
  const panelRaw = n(scope.panel_count_raw) ?? 0;
  const panelCount = n(scope.panel_count) ?? Math.ceil(panelRaw);
  const fabricYardRaw = n(scope.fabric_yard_raw) ?? 0;
  const fabricYard = n(scope.fabric_yard) ?? Math.ceil(fabricYardRaw);
  
  const fabricCostRaw = n(scope.fabric_cost_raw) ?? fabricYard * (fabricUnit + liningPerYd);
  const laborCost = n(scope.labor_cost) ?? panelCount * laborPerPanel * laborMultiplier;
  const total = n(scope.total) ?? money(fabricCostRaw + laborCost);

  return [
    {
      key: "window_size",
      en: "Window size (W × H, inches)",
      zh: "窗户尺寸（宽×高，英寸）",
      value: `${windowWidth} × ${windowHeight}`,
    },
    {
      key: "fullness",
      en: "Fullness multiplier",
      zh: "褶皱倍数",
      value: fullness ?? "N/A",
    },
    {
      key: "fabric_standard_width",
      en: "Fabric standard width (inches)",
      zh: "布幅宽（英寸）",
      value: stdWidth ?? "N/A",
    },
    {
      key: "extra_height_allowance",
      en: "Extra height allowance (inches)",
      zh: "额外加高（英寸）",
      value: extraH ?? "N/A",
    },
    {
      key: "panel_count_raw",
      en: "Panel count (raw)",
      zh: "片数（未取整）",
      value: panelRaw,
    },
    {
      key: "panel_count",
      en: "Panel count (rounded up)",
      zh: "片数（向上取整）",
      value: panelCount,
    },
    {
      key: "fabric_yard_raw",
      en: "Fabric yardage (raw)",
      zh: "用布码数（未取整）",
      value: fabricYardRaw,
    },
    {
      key: "fabric_yard",
      en: "Fabric yardage (rounded up)",
      zh: "用布码数（向上取整）",
      value: fabricYard,
    },
    {
      key: "fabric_unit_price",
      en: "Fabric unit price ($/yard)",
      zh: "布单价（美元/码）",
      value: fabricUnit,
    },
    {
      key: "lining_price_per_yard",
      en: "Lining price ($/yard)",
      zh: "里布单价（美元/码）",
      value: liningPerYd,
    },
    {
      key: "labor_per_panel",
      en: "Labor per panel ($/panel)",
      zh: "每片人工（美元/片）",
      value: laborPerPanel,
    },
    {
      key: "stacking_divisor",
      en: "Stacking divisor",
      zh: "Stacking 除数",
      value: n(scope.stacking_divisor) ?? 1,
    },
    {
      key: "panels_per_section",
      en: "Panels per section",
      zh: "每组片数",
      value: n(scope.panels_per_section) ?? panelCount,
    },
    {
      key: "stacking_surcharge",
      en: "Stacking surcharge (>5 panels = ×1.5)",
      zh: "Stacking 附加费（>5片=×1.5）",
      value: n(scope.stacking_surcharge) ?? 1.0,
    },
    {
      key: "labor_multiplier",
      en: "Labor multiplier (height × stacking)",
      zh: "人工倍率（高度 × stacking）",
      value: laborMultiplier,
    },
    {
      key: "fabric_cost",
      en: "Fabric + lining subtotal ($)",
      zh: "布+里布小计（美元）",
      value: money(fabricCostRaw),
    },
    {
      key: "labor_cost",
      en: "Labor subtotal ($)",
      zh: "人工小计（美元）",
      value: money(laborCost),
    },
    {
      key: "total",
      en: "Total ($)",
      zh: "总价（美元）",
      value: money(total),
    },
  ];
}
