import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api"
import { logEvent } from "@/lib/logging"
import { getTenantSchemaName, isTenantProvisioned } from "@/lib/tenant"

interface CartItem {
  productId: string
  name: string
  price: number | string
  qty: number
  size?: string
  color?: string
  imageUrl?: string
}

const cartItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.union([z.number(), z.string()]),
  qty: z.number().int().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
  imageUrl: z.string().optional(),
})

const addToCartSchema = z.object({
  tenantId: z.string().uuid(),
  item: cartItemSchema,
})

const removeFromCartSchema = z.object({
  tenantId: z.string().uuid(),
  productId: z.string().min(1),
  size: z.string().optional(),
})

// ── GET /api/cart ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const tenantId = request.nextUrl.searchParams.get("tenantId")
  if (!tenantId) return apiError("tenantId required", 400, "TENANT_ID_REQUIRED")

  const { ready } = await isTenantProvisioned(tenantId)
  if (!ready) return apiOk({ items: [] })

  const { data } = await supabaseAdmin
    .from("carts")
    .select("items")
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .single()

  return apiOk({ items: data?.items ?? [] })
}

// ── POST /api/cart ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const parsed = addToCartSchema.safeParse(await request.json())
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, "INVALID_CART_PAYLOAD")
  }

  const { tenantId, item } = parsed.data

  // Fetch existing cart
  const { data: existing } = await supabaseAdmin
    .from("carts")
    .select("id, items")
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .single()

  const items: CartItem[] = existing?.items ?? []
  const idx = items.findIndex((i) => i.productId === item.productId && i.size === item.size)

  if (idx >= 0) {
    items[idx].qty += item.qty
  } else {
    items.push(item)
  }

  if (existing?.id) {
    await supabaseAdmin
      .from("carts")
      .update({ items, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
  } else {
    await supabaseAdmin
      .from("carts")
      .insert({ user_id: user.id, tenant_id: tenantId, items })
  }

  logEvent({
    event: "cart.updated",
    tenantId,
    userId: user.id,
    action: "add",
    productId: item.productId,
  })

  return apiOk({ ok: true })
}

// ── DELETE /api/cart ──────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const parsed = removeFromCartSchema.safeParse(await request.json())
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, "INVALID_CART_REMOVE_PAYLOAD")
  }

  const { tenantId, productId, size } = parsed.data

  const { data: existing } = await supabaseAdmin
    .from("carts")
    .select("id, items")
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .single()

  if (!existing) return apiOk({ ok: true })

  const items: CartItem[] = (existing.items as CartItem[]).filter(
    (i) => !(i.productId === productId && i.size === size)
  )

  await supabaseAdmin
    .from("carts")
    .update({ items })
    .eq("id", existing.id)

  logEvent({
    event: "cart.updated",
    tenantId,
    userId: user.id,
    action: "remove",
    productId,
  })

  return apiOk({ ok: true })
}
