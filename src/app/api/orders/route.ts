import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { z } from "zod"

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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { tenantId, items, deliveryMethod, deliveryAddress, paymentMethod, notes } = parsed.data

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const total = subtotal // no discount for MVP

  const schemaName = `store_${tenantId.replace(/-/g, "_")}`

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
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }

  // Get tenant name for denormalized order_history
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("name")
    .eq("id", tenantId)
    .single()

  // Write to order_history (buyer-facing view)
  await supabaseAdmin.from("order_history").insert({
    user_id: user.id,
    tenant_id: tenantId,
    order_id: order.id,
    tenant_name: tenant?.name,
    total,
    currency: "KGS",
    status: "pending",
    items_count: items.reduce((s, i) => s + i.qty, 0),
  })

  // Clear cart
  await supabaseAdmin
    .from("carts")
    .update({ items: [] })
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)

  return NextResponse.json({ orderId: order.id }, { status: 201 })
}
