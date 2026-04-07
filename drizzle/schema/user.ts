import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core"
import { tenants, users } from "./main"

// ─── Carts ───────────────────────────────────────────────────────────────────
// One cart per user per store. Items stored as JSONB:
// [{ productId, name, price, qty, size, color, imageUrl }]

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    items: jsonb("items").default([]),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.userId, t.tenantId)]
)

// ─── Wishlists ────────────────────────────────────────────────────────────────

export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id)
      .notNull(),
    productId: uuid("product_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.userId, t.tenantId, t.productId)]
)

// ─── Addresses ────────────────────────────────────────────────────────────────

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  label: varchar("label", { length: 50 }),                     // Home | Work | Other
  city: varchar("city", { length: 100 }),
  street: text("street"),
  apartment: varchar("apartment", { length: 50 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// ─── Order history (denormalized for fast buyer view) ─────────────────────────

export const orderHistory = pgTable("order_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  orderId: uuid("order_id").notNull(),                         // references store schema order
  tenantName: varchar("tenant_name", { length: 255 }),
  total: decimal("total", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("KGS"),
  status: varchar("status", { length: 30 }),
  itemsCount: integer("items_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})
