import { Token } from "./tokenizer";
import {
  ProgramNode,
  ExpressionNode,
  BinaryExpressionNode,
  LiteralNode,
  IdentifierNode,
} from "./ast";

export function parse(tokens: Token[]): ProgramNode {
  let current = 0;

  function parseExpression(): ExpressionNode {
    return parseAdditive();
  }

  function parseAdditive(): ExpressionNode {
    let node = parseMultiplicative();

    while (match("+") || match("-")) {
      const operator = previous().value;
      const right = parseMultiplicative();
      node = {
        type: "BinaryExpression",
        operator,
        left: node,
        right,
        start: node.start,
        end: right.end,
      } as BinaryExpressionNode;
    }

    return node;
  }

  function parseMultiplicative(): ExpressionNode {
    let node = parsePrimary();

    while (match("*") || match("/")) {
      const operator = previous().value;
      const right = parsePrimary();
      node = {
        type: "BinaryExpression",
        operator,
        left: node,
        right,
        start: node.start,
        end: right.end,
      } as BinaryExpressionNode;
    }

    return node;
  }

  function parsePrimary(): ExpressionNode {
    if (match("number")) {
      return {
        type: "Literal",
        value: Number(previous().value),
        start: previous().start,
        end: previous().end,
      } as LiteralNode;
    }

    if (match("identifier")) {
      return {
        type: "Identifier",
        name: previous().value,
        start: previous().start,
        end: previous().end,
      } as IdentifierNode;
    }

    throw new Error(`Unexpected token: ${peek().value}`);
  }

  function match(type: string): boolean {
    if (check(type)) {
      advance();
      return true;
    }
    return false;
  }

  function check(type: string): boolean {
    if (isAtEnd()) return false;
    return peek().type === type || peek().value === type;
  }

  function advance(): Token {
    if (!isAtEnd()) current++;
    return previous();
  }

  function isAtEnd(): boolean {
    return current >= tokens.length;
  }

  function peek(): Token {
    return tokens[current];
  }

  function previous(): Token {
    return tokens[current - 1];
  }

  const body = parseExpression();

  return {
    type: "Program",
    body,
  };
}
