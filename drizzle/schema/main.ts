import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  timestamp,
  date,
} from "drizzle-orm/pg-core"

// ─── Tenants (store accounts) ────────────────────────────────────────────────

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  ownerUserId: uuid("owner_user_id"),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }).default("Bishkek"),
  country: varchar("country", { length: 10 }).default("KG"),
  logoUrl: text("logo_url"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  status: varchar("status", { length: 20 }).default("trial"),   // trial | active | suspended
  plan: varchar("plan", { length: 20 }).default("starter"),     // starter | business | premium
  onboardingStatus: varchar("onboarding_status", { length: 32 }).default("creating_profile"),
  onboardingError: text("onboarding_error"),
  tryOnLimit: integer("try_on_limit").default(50),              // included try-ons/month (50 for trial)
  tryOnUsed: integer("try_on_used").default(0),                 // used this month
  overageCount: integer("overage_count").default(0),            // try-ons over limit this period
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  plan: varchar("plan", { length: 20 }).notNull(),              // starter | business | premium
  status: varchar("status", { length: 20 }).notNull(),          // active | cancelled | past_due
  priceUsd: decimal("price_usd", { precision: 10, scale: 2 }).notNull(),
  billingCycle: varchar("billing_cycle", { length: 10 }).default("monthly"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// ─── Users (buyers) ───────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),                                  // matches auth.users.id
  tenantId: uuid("tenant_id").references(() => tenants.id),    // store they registered through
  email: varchar("email", { length: 255 }).unique().notNull(),
  fullName: varchar("full_name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatar_url"),
  preferredLanguage: varchar("preferred_language", { length: 5 }).default("ru"),
  dailyTryOnCount: integer("daily_try_on_count").default(0),
  dailyTryOnReset: date("daily_try_on_reset").defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// ─── Try-on sessions ──────────────────────────────────────────────────────────

export const tryOnSessions = pgTable("try_on_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  productId: uuid("product_id"),                               // references store schema product
  userPhotoUrl: text("user_photo_url").notNull(),
  resultImageUrl: text("result_image_url"),
  isCached: boolean("is_cached").default(false),
  aiModel: varchar("ai_model", { length: 50 }).default("gemini-2.0-flash"),
  costUsd: decimal("cost_usd", { precision: 10, scale: 4 }).default("0.0670"),
  status: varchar("status", { length: 20 }).default("processing"), // processing | done | failed
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})
