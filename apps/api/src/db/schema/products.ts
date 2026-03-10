import {
  pgTable,
  uuid,
  varchar,
  numeric,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { productTypes } from "./product-types";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  productTypeId: uuid("product_type_id")
    .notNull()
    .references(() => productTypes.id),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  defaultConfig: jsonb("default_config"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
