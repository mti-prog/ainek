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

if (!connectionString) {
  console.error(
    "[db] DATABASE_URL is not set. " +
    "Add it in Vercel → Project → Settings → Environment Variables. " +
    "Value: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?sslmode=require"
  )
}

/**
 * Direct PostgreSQL connection for custom tenant schema operations.
 *
 * Supabase PostgREST (supabase-js) only exposes whitelisted schemas.
 * Custom per-tenant schemas (store_*) aren't in that list, so we bypass
 * PostgREST and connect directly via postgres.js.
 *
 * ⚠️  DATABASE_URL must be set as an environment variable on Vercel.
 *    Local: .env.local  |  Production: Vercel → Settings → Env Vars
 */
const db = postgres(connectionString ?? "postgres://localhost/ainek", {
  ssl: connectionString?.includes("supabase.co") ? "require" : false,
  max: 3,               // small pool — Supabase free tier has 60-connection limit
  idle_timeout: 10,
  connect_timeout: 8,
  prepare: false,       // required for Supabase transaction pooler
  onnotice: () => {},   // suppress NOTICE messages
})

export default db
