import { NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { apiError, apiOk } from "@/lib/api"
import { createProductSchema, normalizeProductPayload } from "@/lib/catalog"
import {
  getOwnedTenantForUser,
  getTenantSchemaName,
  isTenantOnboardingReady,
} from "@/lib/tenant"
import { logEvent } from "@/lib/logging"

// ── GET /api/tenant/products ─────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tenantId = searchParams.get("tenantId") ?? request.headers.get("x-tenant-id")
  const category = searchParams.get("category")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"))
  const offset = (page - 1) * limit

  if (!tenantId) return apiError("tenantId required", 400, "TENANT_ID_REQUIRED")

  const schemaName = getTenantSchemaName(tenantId)

  try {
    // Use exec_sql RPC — works without exposing schema in PostgREST whitelist
    const sql = `
      SELECT id, tenant_id, name, description, category, subcategory,
             brand, price, currency, sku, images, sizes, colors,
             is_active, is_virtual_try_on_enabled, created_at, updated_at
      FROM "${schemaName}".products
      WHERE is_active = TRUE
      ${category && category !== "all" ? `AND category = '${category.replace(/'/g, "''")}'` : ""}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    const countSql = `SELECT COUNT(*)::int FROM "${schemaName}".products WHERE is_active = TRUE`

    const [{ data: rows, error: rowsErr }, { data: countData, error: countErr }] = await Promise.all([
      supabaseAdmin.rpc("exec_sql_json", { sql }),
      supabaseAdmin.rpc("exec_sql_json", { sql: countSql }),
    ])

    if (rowsErr || countErr) {
      throw new Error(rowsErr?.message ?? countErr?.message)
    }

    const products = Array.isArray(rows) ? rows : []
    const total = Array.isArray(countData) && countData[0] ? (countData[0].count as number) : 0

    return apiOk({ products, total, page, limit })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logEvent({ event: "tenant.products.list_failed", level: "error", tenantId, message })
    return apiError("Failed to load products", 500, "PRODUCT_LIST_FAILED")
  }
}

// ── POST /api/tenant/products ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const tenant = await getOwnedTenantForUser(user)
  if (!tenant) return apiError("Tenant not found", 403, "TENANT_NOT_FOUND")

  if (!isTenantOnboardingReady(tenant)) {
    return apiError(
      "Store setup is incomplete. Retry provisioning before adding products.",
      409,
      "TENANT_ONBOARDING_INCOMPLETE",
      { onboardingStatus: tenant.onboarding_status ?? "unknown" }
    )
  }

  const body = await request.json()
  const parsed = createProductSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, "INVALID_PRODUCT_PAYLOAD")
  }

  const schemaName = getTenantSchemaName(tenant.id)
  const product = normalizeProductPayload(parsed.data)

  try {
    // Use tenant_product_create RPC — a SECURITY DEFINER function that can
    // INSERT into any tenant schema without PostgREST schema exposure.
    // Requires running the migration SQL in Supabase SQL Editor once.
    const { data: productId, error } = await supabaseAdmin.rpc("tenant_product_create", {
      p_schema: schemaName,
      p_data: {
        tenant_id: tenant.id,
        name: product.name,
        description: product.description ?? null,
        category: product.category ?? null,
        subcategory: product.subcategory ?? null,
        brand: product.brand ?? null,
        price: product.price,
        currency: product.currency ?? "KGS",
        sku: product.sku ?? null,
        images: product.images ?? [],
        sizes: product.sizes ?? [],
        colors: product.colors ?? [],
        is_active: product.isActive ?? true,
        is_virtual_try_on_enabled: product.isVirtualTryOnEnabled ?? true,
      },
    })

    if (error) {
      // RPC function doesn't exist yet — guide the user
      if (error.message.includes("does not exist") || error.message.includes("Could not find")) {
        return apiError(
          "Run the SQL migration in Supabase SQL Editor. See /api/tenant/products-migration for the SQL.",
          500,
          "RPC_MISSING"
        )
      }
      throw new Error(error.message)
    }

    logEvent({
      event: "tenant.products.created",
      tenantId: tenant.id,
      ownerUserId: user.id,
      productId: productId as string,
    })

    return apiOk({ productId }, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logEvent({
      event: "tenant.products.create_failed",
      level: "error",
      tenantId: tenant.id,
      ownerUserId: user.id,
      message,
    })
    return apiError(`Failed to create product: ${message}`, 500, "PRODUCT_CREATE_FAILED")
  }
}
