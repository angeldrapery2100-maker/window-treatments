// packages/shared/src/pricing/evaluator.ts

/**
 * 执行单条公式：
 * 例子：
 *   panel_count_raw = window_width * fullness_multiplier / fabric_standard_width
 *
 * 规则：
 * - 不允许函数调用（ceil / min / max 等）
 * - 只允许变量 + 运算符
 */
export function evaluateFormula(
  step: string,
  scope: Record<string, number>
) {
  const [lhs, rhs] = step.split("=").map((s) => s.trim());

  if (!lhs || !rhs) {
    throw new Error(`Invalid formula step: ${step}`);
  }

  // ❌ 禁止函数调用（安全 & 可控）
  if (/[a-zA-Z_]+\s*\(/.test(rhs)) {
    throw new Error(
      `Formula contains function call, which is not allowed:\n${step}\n👉 请把取整 / min / max 移到代码层`
    );
  }

  let result: number;

  try {
    const fn = new Function(
      ...Object.keys(scope),
      `"use strict"; return (${rhs});`
    );

    result = fn(...Object.values(scope));
  } catch (err: any) {
    throw new Error(
      `Failed to evaluate formula: ${step}\n${err.message}`
    );
  }

  if (typeof result !== "number" || Number.isNaN(result)) {
    throw new Error(`Formula result is not a number: ${step}`);
  }

  scope[lhs] = result;
}
