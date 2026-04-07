import { supabaseAdmin } from "./admin"

/**
 * Creates a dedicated PostgreSQL schema for a new store tenant.
 * Called once during store onboarding after the tenant row is inserted.
 *
 * Creates: store_{tenantId}.products, .orders, .try_on_analytics
 */
export async function provisionTenantSchema(tenantId: string): Promise<void> {
  const schemaName = `store_${tenantId.replace(/-/g, "_")}`

  const sql = `
    -- Create isolated schema for this store
    CREATE SCHEMA IF NOT EXISTS "${schemaName}";

    -- Products / wardrobe catalog
    CREATE TABLE IF NOT EXISTS "${schemaName}".products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      subcategory VARCHAR(100),
      brand VARCHAR(100),
      price DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'KGS',
      sku VARCHAR(100),
      images JSONB DEFAULT '[]',
      sizes JSONB DEFAULT '[]',
      colors JSONB DEFAULT '[]',
      is_active BOOLEAN DEFAULT TRUE,
      is_virtual_try_on_enabled BOOLEAN DEFAULT TRUE,
      try_on_count INT DEFAULT 0,
      view_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS "${schemaName}".orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      tenant_id UUID NOT NULL,
      status VARCHAR(30) DEFAULT 'pending',
      items JSONB NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      discount DECIMAL(10,2) DEFAULT 0,
      total DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'KGS',
      payment_method VARCHAR(30),
      payment_status VARCHAR(20) DEFAULT 'pending',
      delivery_address JSONB,
      delivery_method VARCHAR(30),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Try-on analytics (conversion tracking)
    CREATE TABLE IF NOT EXISTS "${schemaName}".try_on_analytics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID,
      user_id UUID,
      session_id UUID,
      converted_to_order BOOLEAN DEFAULT FALSE,
      order_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS "idx_${schemaName}_products_category"
      ON "${schemaName}".products(category);
    CREATE INDEX IF NOT EXISTS "idx_${schemaName}_products_active"
      ON "${schemaName}".products(is_active);
    CREATE INDEX IF NOT EXISTS "idx_${schemaName}_orders_user"
      ON "${schemaName}".orders(user_id);
    CREATE INDEX IF NOT EXISTS "idx_${schemaName}_orders_status"
      ON "${schemaName}".orders(status);
    CREATE INDEX IF NOT EXISTS "idx_${schemaName}_analytics_product"
      ON "${schemaName}".try_on_analytics(product_id);
  `

  const { error } = await supabaseAdmin.rpc("exec_sql", { sql })
  if (error) {
    throw new Error(`Failed to provision tenant schema: ${error.message}`)
  }
}

/**
 * Drops the tenant schema. Used when a store account is permanently deleted.
 */
export async function deprovisionTenantSchema(tenantId: string): Promise<void> {
  const schemaName = `store_${tenantId.replace(/-/g, "_")}`
  const { error } = await supabaseAdmin.rpc("exec_sql", {
    sql: `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;`,
  })
  if (error) {
    throw new Error(`Failed to drop tenant schema: ${error.message}`)
  }
}
