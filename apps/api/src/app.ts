// apps/api/src/app.ts
import Fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";

import { pricingRoutes } from "./routes/pricing.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(sensible);

  // ✅ 允许前端(3000)调用后端(3001)
  await app.register(cors, {
    origin: true, // 开发期直接放开
    credentials: true,
  });

  await pricingRoutes(app);

  return app;
}
