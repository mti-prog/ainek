import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api"
import { logEvent } from "@/lib/logging"
import { getTenantBySlug, getTenantSchemaName, isTenantProvisioned } from "@/lib/tenant"

const orderSchema = z.object({
  tenantId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    qty: z.number().int().positive(),
    size: z.string().optional(),
    color: z.string().optional(),
  })).min(1),
  deliveryMethod: z.enum(["pickup", "courier"]),
  deliveryAddress: z.object({
    city: z.string(),
    street: z.string(),
    apartment: z.string().optional(),
  }).optional(),
  paymentMethod: z.enum(["cash", "card", "mbank", "optima"]).default("cash"),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const body = await request.json()
  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, "INVALID_ORDER_PAYLOAD")
  }

  const { tenantId, items, deliveryMethod, deliveryAddress, paymentMethod, notes } = parsed.data
  const { ready, missingSchema } = await isTenantProvisioned(tenantId)

  if (!ready) {
    return apiError(
      missingSchema ? "Store is still being provisioned" : "Store is unavailable",
      409,
      "TENANT_SCHEMA_UNAVAILABLE"
    )
  }

  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id, name, status, onboarding_status")
    .eq("id", tenantId)
    .single()

  if (!tenant) {
    return apiError("Tenant not found", 404, "TENANT_NOT_FOUND")
  }

  if (tenant.onboarding_status && tenant.onboarding_status !== "ready") {
    return apiError("Store setup is incomplete", 409, "TENANT_ONBOARDING_INCOMPLETE")
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const total = subtotal // no discount for MVP

  const schemaName = getTenantSchemaName(tenantId)

  // Create order in store schema
  const { data: order, error } = await supabaseAdmin
    .schema(schemaName)
    .from("orders")
    .insert({
      user_id: user.id,
      tenant_id: tenantId,
      items,
      subtotal,
      total,
      currency: "KGS",
      payment_method: paymentMethod,
      delivery_method: deliveryMethod,
      delivery_address: deliveryAddress,
      notes,
    })
    .select("id")
    .single()

  if (error || !order) {
    logEvent({
      event: "orders.create_failed",
      level: "error",
      tenantId,
      userId: user.id,
      message: error?.message ?? "Order insert failed",
    })
    return apiError("Failed to create order", 500, "ORDER_CREATE_FAILED")
  }

  // Write to order_history (buyer-facing view)
  const { error: historyError } = await supabaseAdmin.from("order_history").insert({
    user_id: user.id,
    tenant_id: tenantId,
    order_id: order.id,
    tenant_name: tenant?.name,
    total,
    currency: "KGS",
    status: "pending",
    items_count: items.reduce((s, i) => s + i.qty, 0),
  })

  if (historyError) {
    // Order exists in store schema but buyer can't see it — log and alert, don't fail the request
    logEvent({
      event: "orders.history_sync_failed",
      level: "error",
      tenantId,
      userId: user.id,
      orderId: order.id,
      message: historyError.message,
    })
  }

  // Clear cart
  await supabaseAdmin
    .from("carts")
    .update({ items: [] })
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)

  logEvent({
    event: "orders.created",
    tenantId,
    userId: user.id,
    orderId: order.id,
    total,
  })

  return apiOk({ orderId: order.id }, 201)
}
