/**
 * Tokenizer for pricing expressions
 *
 * Example:
 *   width * height + motor_price
 */

export type TokenType =
  | "number"
  | "identifier"
  | "operator"
  | "paren"
  | "comma";

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

const OPERATORS = ["+", "-", "*", "/", "?", ":", ">=", "<=", ">", "<", "==", "!="];

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Number literal
    if (/[0-9.]/.test(char)) {
      const start = i;
      let value = "";

      while (i < input.length && /[0-9.]/.test(input[i])) {
        value += input[i];
        i++;
      }

      tokens.push({
        type: "number",
        value,
        start,
        end: i,
      });
      continue;
    }

    // Identifier
    if (/[a-zA-Z_]/.test(char)) {
      const start = i;
      let value = "";

      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
        value += input[i];
        i++;
      }

      tokens.push({
        type: "identifier",
        value,
        start,
        end: i,
      });
      continue;
    }

    // Two-character operators
    const twoChar = input.slice(i, i + 2);
    if (OPERATORS.includes(twoChar)) {
      tokens.push({
        type: "operator",
        value: twoChar,
        start: i,
        end: i + 2,
      });
      i += 2;
      continue;
    }

    // Single-character operators
    if (OPERATORS.includes(char)) {
      tokens.push({
        type: "operator",
        value: char,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Parentheses
    if (char === "(" || char === ")") {
      tokens.push({
        type: "paren",
        value: char,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Comma
    if (char === ",") {
      tokens.push({
        type: "comma",
        value: char,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    throw new Error(`Unexpected character '${char}' at position ${i}`);
  }

  return tokens;
}
