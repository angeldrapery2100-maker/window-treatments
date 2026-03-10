import { tokenize } from "./tokenizer";
import { parse } from "./parser";
import { evaluateExpression } from "./evaluator";

/**
 * Smoke test for pricing expression engine
 *
 * Expression:
 *   width * height + motor_price
 */

const expression = "width * height + motor_price";

// Step 1: tokenize
const tokens = tokenize(expression);
console.log("TOKENS:", tokens);

// Step 2: parse to AST
const ast = parse(tokens);
console.log("AST:", JSON.stringify(ast, null, 2));

// Step 3: evaluate
const result = evaluateExpression(ast.body, {
  variables: {
    width: 50,
    height: 80,
    motor_price: 300,
  },
});

console.log("RESULT:", result);
