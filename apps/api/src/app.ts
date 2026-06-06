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

  // CORS: explicit allow-list instead of reflecting any Origin.
  // Set ALLOWED_ORIGINS (comma-separated) in production, e.g.
  //   ALLOWED_ORIGINS=https://angeldrapery.com,https://www.angeldrapery.com
  // Falls back to localhost dev origins when unset.
  const allowedOrigins = (process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : ["http://localhost:3000", "http://127.0.0.1:3000"]);

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow same-origin / non-browser requests (no Origin header).
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  });

  await pricingRoutes(app);

  return app;
}
