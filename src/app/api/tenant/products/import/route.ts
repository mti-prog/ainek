import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { apiError, apiOk } from "@/lib/api"
import {
  getOwnedTenantForUser,
  getTenantSchemaName,
  isTenantOnboardingReady,
} from "@/lib/tenant"
import { logEvent } from "@/lib/logging"
import { normalizeImportedProduct } from "@/lib/catalog"
import { z } from "zod"

const DEMO_SOURCE = "dummyjson-fashion"
const DEMO_CATEGORY_URLS = [
  "https://dummyjson.com/products/category/tops?limit=0",
  "https://dummyjson.com/products/category/mens-shirts?limit=0",
  "https://dummyjson.com/products/category/womens-dresses?limit=0",
  "https://dummyjson.com/products/category/mens-shoes?limit=0",
  "https://dummyjson.com/products/category/womens-shoes?limit=0",
  "https://dummyjson.com/products/category/sunglasses?limit=0",
]

const importRequestSchema = z.object({
  products: z.array(z.record(z.string(), z.unknown())).optional(),
  source: z.enum([DEMO_SOURCE]).optional(),
})

async function loadDemoProducts() {
  const responses = await Promise.all(
    DEMO_CATEGORY_URLS.map(async (url) => {
      const response = await fetch(url, { cache: "no-store" })
      if (!response.ok) {
        throw new Error(`Demo source request failed: ${response.status}`)
      }

      const data = await response.json()
      return Array.isArray(data?.products) ? data.products : []
    })
  )

  const seen = new Set<string>()

  return responses
    .flat()
    .filter((product) => {
      const key = String(product?.id ?? `${product?.title}-${product?.category}`)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((product) => ({
      title: product.title,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: product.price,
      currency: "USD",
      sku: product.sku ?? `dummyjson-${product.id}`,
      stock: product.stock,
      images: Array.isArray(product.images) ? product.images : [],
      thumbnail: product.thumbnail,
      isVirtualTryOnEnabled: true,
      is_active: true,
    }))
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const tenant = await getOwnedTenantForUser(user)
  if (!tenant) return apiError("Tenant not found", 403, "TENANT_NOT_FOUND")

  if (!isTenantOnboardingReady(tenant)) {
    return apiError(
      "Store setup is incomplete. Retry provisioning before importing products.",
      409,
      "TENANT_ONBOARDING_INCOMPLETE",
      { onboardingStatus: tenant.onboarding_status ?? "unknown" }
    )
  }

  const body = importRequestSchema.safeParse(await request.json())
  if (!body.success) {
    return apiError(body.error.issues[0].message, 400, "INVALID_IMPORT_PAYLOAD")
  }

  const rawProducts = body.data.source === DEMO_SOURCE
    ? await loadDemoProducts()
    : (body.data.products ?? [])

  if (rawProducts.length === 0) {
    return apiError("No products provided for import", 400, "IMPORT_PRODUCTS_REQUIRED")
  }

  const schemaName = getTenantSchemaName(tenant.id)
  const errors: string[] = []
  let imported = 0

  for (let index = 0; index < rawProducts.length; index++) {
    try {
      const product = normalizeImportedProduct(rawProducts[index])
      const { error } = await supabaseAdmin.rpc("tenant_product_create", {
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
        if (error.message.includes("does not exist") || error.message.includes("Could not find")) {
          return apiError(
            "Run the SQL migration in Supabase SQL Editor. See /api/tenant/products-migration for the SQL.",
            500,
            "RPC_MISSING"
          )
        }

        throw new Error(error.message)
      }

      imported++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`Item ${index + 1}: ${message}`)
    }
  }

  logEvent({
    event: "tenant.products.imported",
    tenantId: tenant.id,
    ownerUserId: user.id,
    imported,
    failed: errors.length,
    source: body.data.source ?? "json",
  })

  return apiOk({
    imported,
    failed: errors.length,
    total: rawProducts.length,
    errors,
  }, imported > 0 ? 201 : 400)
}
