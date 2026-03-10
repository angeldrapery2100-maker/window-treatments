// packages/shared/src/pricing/functions/index.ts

/**
 * 向上取整
 */
export function roundUp(value: number): number {
  return Math.ceil(value);
}

/**
 * 2舍3进
 * decimal < 0.3 → 舍
 * decimal >= 0.3 → 进
 */
export function roundTwoSheThreeJin(value: number): number {
  const integer = Math.floor(value);
  const decimal = value - integer;
  return decimal < 0.3 ? integer : integer + 1;
}

/**
 * 最终价格取整（统一用）
 */
export function roundFinalPrice(value: number): number {
  return Math.round(value);
}
