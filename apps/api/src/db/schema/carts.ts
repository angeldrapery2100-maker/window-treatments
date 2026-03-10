import {
  pgTable,
  uuid,
  varchar,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { products } from "./products";
import { productTypes } from "./product-types";

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").references(() => customers.id),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => carts.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  productTypeId: uuid("product_type_id")
    .notNull()
    .references(() => productTypes.id),
  configuration: jsonb("configuration").notNull(),
  pricingResult: jsonb("pricing_result").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
