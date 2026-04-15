import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { apiError, apiOk } from "@/lib/api"
import { createProductSchema, normalizeProductPayload } from "@/lib/catalog"
import {
  getOwnedTenantForUser,
  getTenantSchemaName,
  isTenantOnboardingReady,
  isTenantProvisioned,
} from "@/lib/tenant"
import { logEvent } from "@/lib/logging"

// ── GET /api/tenant/products ─────────────────────────────────────────────────
// Returns paginated products for a store.
// Query params: tenantId (required), category?, page?, limit?

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tenantId =
    searchParams.get("tenantId") ?? request.headers.get("x-tenant-id")
  const category = searchParams.get("category")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"))
  const offset = (page - 1) * limit

  if (!tenantId) {
    return apiError("tenantId required", 400, "TENANT_ID_REQUIRED")
  }

  const { ready, schemaName, missingSchema } = await isTenantProvisioned(tenantId)
  if (!ready && missingSchema) {
    return apiError("Store is still being provisioned", 409, "TENANT_NOT_PROVISIONED")
  }

  let query = supabaseAdmin
    .schema(schemaName)
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  const { data, error, count } = await query

  if (error) {
    logEvent({
      event: "tenant.products.list_failed",
      level: "error",
      tenantId,
      message: error.message,
    })
    return apiError("Failed to load products", 500, "PRODUCT_LIST_FAILED")
  }

  return apiOk({
    products: data ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}

// ── POST /api/tenant/products ────────────────────────────────────────────────
// Creates a new product. Requires store owner auth.

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401, "UNAUTHORIZED")
  }

  const tenant = await getOwnedTenantForUser(user)

  if (!tenant) {
    return apiError("Tenant not found", 403, "TENANT_NOT_FOUND")
  }

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

  // onboarding_status === "ready" means provisioning completed successfully.
  // Skip the secondary isTenantProvisioned check to avoid PostgREST schema
  // exposure issues with custom tenant schemas.

  const schemaName = getTenantSchemaName(tenant.id)
  const product = normalizeProductPayload(parsed.data)

  const { data, error } = await supabaseAdmin
    .schema(schemaName)
    .from("products")
    .insert({
      tenant_id: tenant.id,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      sku: product.sku,
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      is_active: product.isActive,
      is_virtual_try_on_enabled: product.isVirtualTryOnEnabled,
    })
    .select("id")
    .single()

  if (error) {
    logEvent({
      event: "tenant.products.create_failed",
      level: "error",
      tenantId: tenant.id,
      ownerUserId: user.id,
      message: error.message,
    })
    return apiError("Failed to create product", 500, "PRODUCT_CREATE_FAILED")
  }

  logEvent({
    event: "tenant.products.created",
    tenantId: tenant.id,
    ownerUserId: user.id,
    productId: data.id,
  })

  return apiOk({ productId: data.id }, 201)
}
