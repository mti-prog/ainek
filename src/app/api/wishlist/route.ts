import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api"
import { logEvent } from "@/lib/logging"
import { getTenantSchemaName, isTenantProvisioned } from "@/lib/tenant"

const wishlistCreateSchema = z.object({
  tenantId: z.string().uuid(),
  productId: z.string().min(1),
})

const wishlistDeleteSchema = z.object({
  tenantId: z.string().uuid(),
  productId: z.string().min(1),
})

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const tenantId = request.nextUrl.searchParams.get("tenantId")

  if (tenantId) {
    const { ready } = await isTenantProvisioned(tenantId)
    if (!ready) {
      return apiOk({ items: [] })
    }
  }

  let query = supabaseAdmin
    .from("wishlists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (tenantId) query = query.eq("tenant_id", tenantId)

  const { data } = await query
  return apiOk({ items: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const parsed = wishlistCreateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, "INVALID_WISHLIST_PAYLOAD")
  }

  const { tenantId, productId } = parsed.data
  const { ready, missingSchema } = await isTenantProvisioned(tenantId)
  if (!ready) {
    return apiError(
      missingSchema ? "Store is still being provisioned" : "Store is unavailable",
      409,
      "TENANT_SCHEMA_UNAVAILABLE"
    )
  }

  const schemaName = getTenantSchemaName(tenantId)
  const { data: product } = await supabaseAdmin
    .schema(schemaName)
    .from("products")
    .select("id, is_active")
    .eq("id", productId)
    .eq("is_active", true)
    .single()

  if (!product) {
    return apiError("Product not available", 404, "PRODUCT_NOT_AVAILABLE")
  }

  const { error } = await supabaseAdmin
    .from("wishlists")
    .insert({ user_id: user.id, tenant_id: tenantId, product_id: productId })

  if (error?.code === "23505") {
    return apiOk({ ok: true, duplicate: true })
  }

  if (error) {
    return apiError(error.message, 500, "WISHLIST_CREATE_FAILED")
  }

  logEvent({
    event: "wishlist.updated",
    tenantId,
    userId: user.id,
    action: "add",
    productId,
  })

  return apiOk({ ok: true }, 201)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const parsed = wishlistDeleteSchema.safeParse(await request.json())
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, "INVALID_WISHLIST_REMOVE_PAYLOAD")
  }

  const { tenantId, productId } = parsed.data

  await supabaseAdmin
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .eq("product_id", productId)

  logEvent({
    event: "wishlist.updated",
    tenantId,
    userId: user.id,
    action: "remove",
    productId,
  })

  return apiOk({ ok: true })
}
