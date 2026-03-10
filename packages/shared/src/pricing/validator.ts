// packages/shared/src/pricing/validator.ts

const FORBIDDEN_PATTERNS = [
  /\bceil\s*\(/i,
  /\bfloor\s*\(/i,
  /\bround\s*\(/i,
  /\bmin\s*\(/i,
  /\bmax\s*\(/i,
  /\bMath\./,
];

/**
 * 校验 pricing formula 是否安全、可执行
 */
export function validateFormula(
  steps: string[],
  allowedVariables: string[]
): { ok: true } | { ok: false; error: string } {
  const defined = new Set<string>(allowedVariables);

  for (const step of steps) {
    // 1️⃣ 必须是 a = expression
    const match = step.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    if (!match) {
      return {
        ok: false,
        error: `Invalid formula syntax:\n${step}`,
      };
    }

    const [, lhs, rhs] = match;

    // 2️⃣ 禁止函数调用
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(rhs)) {
        return {
          ok: false,
          error:
            `Formula contains function call, which is not allowed:\n` +
            `${step}\n` +
            `👉 请把取整 / min / max 移到代码层`,
        };
      }
    }

    // 3️⃣ 提取 RHS 中的变量
    const tokens = rhs.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) ?? [];

    for (const token of tokens) {
      // 忽略 true / false
      if (token === "true" || token === "false") continue;

      if (!defined.has(token)) {
        return {
          ok: false,
          error:
            `Missing variable "${token}".\n` +
            `Formula step:\n${step}\n` +
            `👉 请在 variables / baseParams / optionValues 中提供`,
        };
      }
    }

    // 4️⃣ lhs 变量注册为已定义
    defined.add(lhs);
  }

  return { ok: true };
}
