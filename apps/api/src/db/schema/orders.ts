import {
  pgTable,
  uuid,
  varchar,
  integer,
  numeric,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { products } from "./products";
import { productTypes } from "./product-types";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  status: varchar("status", { length: 32 }).notNull().default("placed"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  billingAddress: jsonb("billing_address"),
  paymentRef: varchar("payment_ref", { length: 256 }),
  placedAt: timestamp("placed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  productTypeId: uuid("product_type_id")
    .notNull()
    .references(() => productTypes.id),
  configurationSnapshot: jsonb("configuration_snapshot").notNull(),
  pricingSnapshot: jsonb("pricing_snapshot").notNull(),
  productTypeSnapshot: jsonb("product_type_snapshot").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
});
