// packages/shared/src/pricing/validateFormula.ts

import { evaluateFormula } from "./evaluator";
import { FUNCTIONS } from "./functions";

/**
 * 校验 pricing formula 是否合法
 * - steps 是否是数组
 * - 每一步能否被 evaluate
 * - 不依赖未定义变量 / 函数
 */
export function validateFormula(
  steps: string[],
  allowedVariables: string[]
): { ok: true } | { ok: false; error: string } {
  if (!Array.isArray(steps)) {
    return { ok: false, error: "formula.steps must be an array" };
  }

  // 构造一个“假的 scope”，只用于校验
  const scope: Record<string, number> = {};

  for (const v of allowedVariables) {
    scope[v] = 1; // dummy value
  }

  try {
    for (const step of steps) {
      if (typeof step !== "string") {
        return {
          ok: false,
          error: `Invalid formula step (not string): ${String(step)}`,
        };
      }

      evaluateFormula(step, scope, {
        strict: true, // 👈 强校验模式
      });
    }
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || "Unknown formula error",
    };
  }

  return { ok: true };
}
