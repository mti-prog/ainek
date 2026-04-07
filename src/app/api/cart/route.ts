import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

interface CartItem {
  productId: string
  name: string
  price: number | string
  qty: number
  size?: string
  color?: string
  imageUrl?: string
}

// ── GET /api/cart ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tenantId = request.nextUrl.searchParams.get("tenantId")
  if (!tenantId) return NextResponse.json({ error: "tenantId required" }, { status: 400 })

  const { data } = await supabaseAdmin
    .from("carts")
    .select("items")
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .single()

  return NextResponse.json({ items: data?.items ?? [] })
}

// ── POST /api/cart ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { tenantId, item } = await request.json() as { tenantId: string; item: CartItem }

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

  return NextResponse.json({ ok: true })
}

// ── DELETE /api/cart ──────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { tenantId, productId, size } = await request.json()

  const { data: existing } = await supabaseAdmin
    .from("carts")
    .select("id, items")
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .single()

  if (!existing) return NextResponse.json({ ok: true })

  const items: CartItem[] = (existing.items as CartItem[]).filter(
    (i) => !(i.productId === productId && i.size === size)
  )

  await supabaseAdmin
    .from("carts")
    .update({ items })
    .eq("id", existing.id)

  return NextResponse.json({ ok: true })
}
