// packages/shared/src/pricing/rounding.ts

/**
 * 所有“商业取整规则”集中在这里
 * DB 永远只算 raw
 */

export type RoundingContext = {
  productType: "drapery" | "sheer" | "shade";
};

export function applyRounding(
  scope: Record<string, number>,
  ctx: RoundingContext
) {
  const rounded: Record<string, number> = {};

  /** ---------- Drapery / Sheer ---------- */
  if (ctx.productType === "drapery" || ctx.productType === "sheer") {
    if (scope.panel_count_raw !== undefined) {
      rounded.panel_count = Math.ceil(scope.panel_count_raw);
    }

    if (scope.fabric_yard_raw !== undefined) {
      rounded.fabric_yard = Math.ceil(scope.fabric_yard_raw);
    }

    if (scope.sheer_yard_raw !== undefined) {
      rounded.sheer_yard = Math.ceil(scope.sheer_yard_raw);
    }
  }

  /** ---------- Shade ---------- */
  if (ctx.productType === "shade") {
    if (scope.area_raw !== undefined) {
      rounded.billable_area = Math.max(1, Math.ceil(scope.area_raw));
    }
  }

  return {
    ...scope,
    ...rounded,
  };
}
