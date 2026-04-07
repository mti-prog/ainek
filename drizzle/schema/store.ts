import {
  pgSchema,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core"

/**
 * Creates Drizzle table definitions for a specific tenant's store schema.
 * Each store gets its own PostgreSQL schema: store_{tenantId}
 *
 * Usage:
 *   const { products, orders, tryOnAnalytics } = createStoreSchema(tenantId)
 */
export function createStoreSchema(tenantId: string) {
  const schema = pgSchema(`store_${tenantId}`)

  const products = schema.table(
    "products",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      tenantId: uuid("tenant_id").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      category: varchar("category", { length: 100 }),          // tops | bottoms | dresses | shoes | accessories
      subcategory: varchar("subcategory", { length: 100 }),
      brand: varchar("brand", { length: 100 }),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      currency: varchar("currency", { length: 3 }).default("KGS"),
      sku: varchar("sku", { length: 100 }),
      images: jsonb("images").default([]),                     // [{ url, isPrimary, color }]
      sizes: jsonb("sizes").default([]),                       // [{ size, stockQty }]
      colors: jsonb("colors").default([]),                     // [{ name, hex, images }]
      isActive: boolean("is_active").default(true),
      isVirtualTryOnEnabled: boolean("is_virtual_try_on_enabled").default(true),
      tryOnCount: integer("try_on_count").default(0),
      viewCount: integer("view_count").default(0),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (t) => [
      index(`idx_products_${tenantId}_category`).on(t.category),
      index(`idx_products_${tenantId}_active`).on(t.isActive),
    ]
  )

  const orders = schema.table(
    "orders",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").notNull(),
      tenantId: uuid("tenant_id").notNull(),
      status: varchar("status", { length: 30 }).default("pending"),
      // pending | confirmed | shipped | delivered | cancelled | refunded
      items: jsonb("items").notNull(),                         // [{ productId, name, price, qty, size, color }]
      subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
      discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
      total: decimal("total", { precision: 10, scale: 2 }).notNull(),
      currency: varchar("currency", { length: 3 }).default("KGS"),
      paymentMethod: varchar("payment_method", { length: 30 }), // card | cash | mbank | optima
      paymentStatus: varchar("payment_status", { length: 20 }).default("pending"),
      deliveryAddress: jsonb("delivery_address"),
      deliveryMethod: varchar("delivery_method", { length: 30 }), // pickup | courier
      notes: text("notes"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (t) => [
      index(`idx_orders_${tenantId}_user`).on(t.userId),
      index(`idx_orders_${tenantId}_status`).on(t.status),
    ]
  )

  const tryOnAnalytics = schema.table(
    "try_on_analytics",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      productId: uuid("product_id"),
      userId: uuid("user_id"),
      sessionId: uuid("session_id"),                           // references public.try_on_sessions
      convertedToOrder: boolean("converted_to_order").default(false),
      orderId: uuid("order_id"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => [
      index(`idx_analytics_${tenantId}_product`).on(t.productId),
    ]
  )

  return { schema, products, orders, tryOnAnalytics }
}
