// packages/shared/src/pricing/explainers/SheerExplainer.ts

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
 * Sheer 报价解释器（中英双语）
 */
export function explainSheer(scope: Record<string, unknown>): ExplainLine[] {
  const windowWidth = n(scope.window_width) ?? 0;
  const windowHeight = n(scope.window_height) ?? 0;
  const sheerFabricWidth = n(scope.sheer_fabric_width) ?? 0;
  const sheerUnitPrice = n(scope.sheer_unit_price) ?? 0;
  const laborPerPanel = n(scope.labor_per_panel) ?? 0;
  const laborMultiplier = n(scope.labor_multiplier) ?? 1.0;
  
  const laborPanelCountRaw = n(scope.labor_panel_count_raw) ?? 0;
  const laborPanelCount = n(scope.labor_panel_count) ?? Math.ceil(laborPanelCountRaw);
  const laborCost = n(scope.labor_cost) ?? 0;
  
  const sheerPanelRaw = n(scope.sheer_panel_raw) ?? 0;
  const sheerPanel = n(scope.sheer_panel) ?? 0;
  const sheerYard = n(scope.sheer_yard) ?? 0;
  const fabricCost = n(scope.fabric_cost) ?? 0;
  const total = n(scope.total) ?? 0;
  
  const calculationMethod = String(scope.calculation_method ?? "");
  const stackingOption = String(scope.stacking_option ?? "");

  const lines: ExplainLine[] = [
    {
      key: "window_size",
      en: "Window size (W × H, inches)",
      zh: "窗户尺寸（宽×高，英寸）",
      value: `${windowWidth} × ${windowHeight}`,
    },
    {
      key: "sheer_fabric_width",
      en: "Sheer fabric width (inches)",
      zh: "纱帘幅宽（英寸）",
      value: sheerFabricWidth,
    },
    {
      key: "calculation_method",
      en: "Calculation method",
      zh: "计算方式",
      value: calculationMethod === "extra_wide_horizontal" 
        ? "Extra wide - Horizontal / 超宽纱 - 横做"
        : calculationMethod === "extra_wide_vertical"
        ? "Extra wide - Vertical / 超宽纱 - 竖拼"
        : "Normal / 普通纱",
    },
    {
      key: "labor_panel_count_raw",
      en: "Labor panel count (raw)",
      zh: "人工片数（未取整）",
      value: laborPanelCountRaw,
    },
    {
      key: "labor_panel_count",
      en: "Labor panel count (rounded up)",
      zh: "人工片数（向上取整）",
      value: laborPanelCount,
    },
    {
      key: "labor_per_panel",
      en: "Labor per panel ($/panel)",
      zh: "每片人工（美元/片）",
      value: laborPerPanel,
    },
    {
      key: "labor_multiplier",
      en: "Labor multiplier",
      zh: "人工倍率",
      value: laborMultiplier,
    },
    {
      key: "labor_cost",
      en: "Labor subtotal ($)",
      zh: "人工小计（美元）",
      value: money(laborCost),
    },
  ];

  // 如果有 sheer_panel_raw（普通纱或竖拼）
  if (sheerPanelRaw > 0) {
    lines.push({
      key: "sheer_panel_raw",
      en: "Sheer panel count (raw)",
      zh: "纱片数（未取整）",
      value: sheerPanelRaw,
    });
    lines.push({
      key: "sheer_panel",
      en: "Sheer panel count (rounded)",
      zh: "纱片数（取整后）",
      value: sheerPanel,
    });
  }

  lines.push(
    {
      key: "sheer_yard",
      en: "Sheer yardage (yards)",
      zh: "纱用量（码）",
      value: sheerYard,
    },
    {
      key: "sheer_unit_price",
      en: "Sheer unit price ($/yard)",
      zh: "纱单价（美元/码）",
      value: sheerUnitPrice,
    },
    {
      key: "fabric_cost",
      en: "Sheer fabric subtotal ($)",
      zh: "纱料小计（美元）",
      value: money(fabricCost),
    },
    {
      key: "stacking_option",
      en: "Stacking option (record only)",
      zh: "开合方式（仅记录）",
      value: stackingOption || "N/A",
    },
    {
      key: "total",
      en: "Total ($)",
      zh: "总价（美元）",
      value: money(total),
    }
  );

  return lines;
}
