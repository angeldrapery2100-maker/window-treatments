// apps/api/src/routes/pricing.ts

import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { pricingConfigs } from "../db/schema/pricing.js";
import { productTypes } from "../db/schema/product-types.js";
import { and, eq } from "drizzle-orm";

import { UnifiedPricingEngine } from "@window-treatments/shared/pricing/engines";
import { explainDrapery, explainSheer, explainShade, type ExplainLine } from "@window-treatments/shared/pricing/explainers";

type ProductType = "drapery" | "sheer" | "shade";

type CalculateBody = {
  productType: ProductType;
  pricingVersion?: number;
  input: { width: number; height: number };
  baseParams?: Record<string, number>;
  options?: Record<string, string>;
  optionValues?: Record<string, Record<string, Record<string, number>>>;
};

export async function pricingRoutes(app: FastifyInstance) {
  /**
   * GET /pricing/config/:slug
   */
  app.get("/pricing/config/:slug", async (request) => {
    const { slug } = request.params as { slug: string };

    const rows = await db
      .select({
        id: pricingConfigs.id,
        version: pricingConfigs.version,
        formula: pricingConfigs.formula,
        variables: pricingConfigs.variables,
        isActive: pricingConfigs.isActive,
      })
      .from(pricingConfigs)
      .innerJoin(productTypes, eq(pricingConfigs.productTypeId, productTypes.id))
      .where(and(eq(productTypes.slug, slug), eq(pricingConfigs.isActive, true)));

    return { slug, count: rows.length, data: rows };
  });

  /**
   * POST /pricing/calculate
   */
  app.post("/pricing/calculate", async (request, reply) => {
    const body = request.body as CalculateBody;

    // 验证输入
    if (!body?.productType) {
      return reply.code(400).send({ error: "Missing productType" });
    }
    if (
      !body?.input ||
      typeof body.input.width !== "number" ||
      typeof body.input.height !== "number"
    ) {
      return reply
        .code(400)
        .send({ error: "Invalid input. Expect input: { width:number, height:number }" });
    }

    // 1️⃣ 查找 product type
    const [productTypeRow] = await db
      .select()
      .from(productTypes)
      .where(eq(productTypes.slug, body.productType));

    if (!productTypeRow) {
      return reply.code(400).send({ error: "Invalid productType" });
    }

    // 2️⃣ 查找 pricing config（支持 version 或 active）
    const pricingWhere = body.pricingVersion
      ? and(
          eq(pricingConfigs.productTypeId, productTypeRow.id),
          eq(pricingConfigs.version, body.pricingVersion)
        )
      : and(
          eq(pricingConfigs.productTypeId, productTypeRow.id),
          eq(pricingConfigs.isActive, true)
        );

    const [pricingConfig] = await db
      .select()
      .from(pricingConfigs)
      .where(pricingWhere);

    if (!pricingConfig) {
      return reply.code(400).send({ error: "No active pricing config" });
    }

    // 3️⃣ 解析 optionValues（扁平化注入）
    const resolvedOptionValues: Record<string, number> = {};
    if (body.options && body.optionValues) {
      for (const [optionKey, selectedValue] of Object.entries(body.options)) {
        const optionConfig = body.optionValues[optionKey];
        if (!optionConfig) {
          return reply.code(400).send({
            error: `Missing optionValues for option: ${optionKey}`,
          });
        }

        const selectedConfig = optionConfig[selectedValue];
        if (!selectedConfig) {
          return reply.code(400).send({
            error: `Invalid option value "${selectedValue}" for option "${optionKey}"`,
          });
        }

        Object.assign(resolvedOptionValues, selectedConfig);
      }
    }

    // 4️⃣ 调用统一计算引擎
    try {
      const result = UnifiedPricingEngine.calculate(body.input, {
        productType: body.productType,
        baseParams: {
          ...(pricingConfig.variables as Record<string, number>),
          ...(body.baseParams ?? {}),
          ...resolvedOptionValues,
        },
        options: body.options ?? {},
        optionValues: body.optionValues ?? {},
        formula: pricingConfig.formula,
      });

      // 5️⃣ 生成 explain（中英双语）
      let explain: ExplainLine[];
      if (body.productType === "drapery") {
        explain = explainDrapery(result.breakdown as any);
      } else if (body.productType === "sheer") {
        explain = explainSheer(result.breakdown as any);
      } else if (body.productType === "shade") {
        explain = explainShade(result.breakdown as any);
      } else {
        explain = [];
      }

      return { ok: true, result, explain };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return reply.code(400).send({
        error: "Calculation failed",
        details: msg,
      });
    }
  });
}
