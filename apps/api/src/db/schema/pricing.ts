import {
  pgTable,
  uuid,
  integer,
  boolean,
  jsonb,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { productTypes } from "./product-types";

export const pricingConfigs = pgTable(
  "pricing_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productTypeId: uuid("product_type_id")
      .notNull()
      .references(() => productTypes.id),
    version: integer("version").notNull(),
    formula: jsonb("formula").notNull(),
    variables: jsonb("variables").notNull(),
    lookupTables: jsonb("lookup_tables"),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_pricing_type_version").on(table.productTypeId, table.version),
  ]
);
