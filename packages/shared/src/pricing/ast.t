/**
 * AST node definitions for pricing expressions
 *
 * Example expression:
 *   base_price * width * height + motor_price
 */

/* =========================
 * Node Base
 * ========================= */

export interface ASTNodeBase {
  type: string;
  start: number;
  end: number;
}

/* =========================
 * Literal Nodes
 * ========================= */

export interface NumberLiteralNode extends ASTNodeBase {
  type: "NumberLiteral";
  value: number;
}

export interface StringLiteralNode extends ASTNodeBase {
  type: "StringLiteral";
  value: string;
}

export type LiteralNode = NumberLiteralNode | StringLiteralNode;

/* =========================
 * Identifier
 * ========================= */

export interface IdentifierNode extends ASTNodeBase {
  type: "Identifier";
  name: string;
}

/* =========================
 * Unary Expression
 * ========================= */

export interface UnaryExpressionNode extends ASTNodeBase {
  type: "UnaryExpression";
  operator: "-" | "+";
  argument: ExpressionNode;
}

/* =========================
 * Binary Expression
 * ========================= */

export interface BinaryExpressionNode extends ASTNodeBase {
  type: "BinaryExpression";
  operator:
    | "+"
    | "-"
    | "*"
    | "/"
    | "%"
    | ">"
    | ">="
    | "<"
    | "<="
    | "=="
    | "!=";
  left: ExpressionNode;
  right: ExpressionNode;
}

/* =========================
 * Function Call
 * ========================= */

export interface CallExpressionNode extends ASTNodeBase {
  type: "CallExpression";
  callee: string;
  arguments: ExpressionNode[];
}

/* =========================
 * Conditional (ternary)
 * ========================= */

export interface ConditionalExpressionNode extends ASTNodeBase {
  type: "ConditionalExpression";
  test: ExpressionNode;
  consequent: ExpressionNode;
  alternate: ExpressionNode;
}

/* =========================
 * Expression Union
 * ========================= */

export type ExpressionNode =
  | LiteralNode
  | IdentifierNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | CallExpressionNode
  | ConditionalExpressionNode;

/* =========================
 * Program Root
 * ========================= */

export interface ProgramNode {
  type: "Program";
  body: ExpressionNode;
}
