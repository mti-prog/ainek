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
import db from "@/lib/db"

// ── GET /api/tenant/products ─────────────────────────────────────────────────
// Returns paginated products for a store.
// Query params: tenantId (required), category?, page?, limit?

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tenantId = searchParams.get("tenantId") ?? request.headers.get("x-tenant-id")
  const category = searchParams.get("category")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"))
  const offset = (page - 1) * limit

  if (!tenantId) {
    return apiError("tenantId required", 400, "TENANT_ID_REQUIRED")
  }

  const schemaName = getTenantSchemaName(tenantId)

  try {
    // Use direct DB connection — supabase-js can't query custom tenant schemas
    // because PostgREST only exposes whitelisted schemas.
    const products = await db.unsafe(
      `SELECT *, COUNT(*) OVER() AS _total
       FROM "${schemaName}".products
       WHERE is_active = TRUE
       ${category && category !== "all" ? `AND category = '${category.replace(/'/g, "''")}'` : ""}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`
    )

    const total = products.length > 0 ? parseInt(products[0]._total as string) : 0
    const rows = products.map(({ _total, ...p }) => p)

    return apiOk({ products: rows, total, page, limit })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logEvent({ event: "tenant.products.list_failed", level: "error", tenantId, message })
    return apiError("Failed to load products", 500, "PRODUCT_LIST_FAILED")
  }
}

// ── POST /api/tenant/products ────────────────────────────────────────────────
// Creates a new product. Requires store owner auth.

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
    // Use direct DB connection — supabase-js PostgREST can't write to
    // custom tenant schemas (store_*) that aren't in the exposed-schemas list.
    const [row] = await db`
      INSERT INTO ${db.unsafe(`"${schemaName}".products`)} (
        tenant_id, name, description, category, subcategory,
        brand, price, currency, sku, images, sizes, colors,
        is_active, is_virtual_try_on_enabled
      ) VALUES (
        ${tenant.id}::uuid,
        ${product.name},
        ${product.description ?? null},
        ${product.category ?? null},
        ${product.subcategory ?? null},
        ${product.brand ?? null},
        ${product.price},
        ${product.currency ?? "KGS"},
        ${product.sku ?? null},
        ${JSON.stringify(product.images ?? [])}::jsonb,
        ${JSON.stringify(product.sizes ?? [])}::jsonb,
        ${JSON.stringify(product.colors ?? [])}::jsonb,
        ${product.isActive ?? true},
        ${product.isVirtualTryOnEnabled ?? true}
      )
      RETURNING id
    `

    logEvent({
      event: "tenant.products.created",
      tenantId: tenant.id,
      ownerUserId: user.id,
      productId: row.id,
    })

    return apiOk({ productId: row.id }, 201)
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
