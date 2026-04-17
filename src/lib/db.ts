/**
 * Direct PostgreSQL connection via postgres.js.
 *
 * WHY: Supabase PostgREST (used by supabase-js) only exposes schemas that are
 * explicitly whitelisted in Supabase Dashboard → Settings → API → DB Schemas.
 * Custom tenant schemas (store_*) are never in that list, so any
 * supabaseAdmin.schema('store_xxx').from('products') call returns a 404.
 *
 * This client connects directly to Postgres and can access ANY schema.
 * Use it for all operations on tenant-specific schemas.
 */
import postgres from "postgres"

const connectionString = process.env.DATABASE_URL

if (!connectionString && process.env.NODE_ENV !== "test") {
  console.warn("[db] DATABASE_URL is not set — tenant schema operations will fail")
}

// Single shared connection pool (postgres.js handles pooling internally)
const db = postgres(connectionString ?? "", {
  ssl: "require",
  max: 5,                  // keep small for serverless
  idle_timeout: 20,        // seconds before idle connection closes
  connect_timeout: 10,     // seconds before giving up on connect
  prepare: false,          // required for Supabase transaction pooler
})

export default db
