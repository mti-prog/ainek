import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tenantId = request.nextUrl.searchParams.get("tenantId")

  let query = supabaseAdmin
    .from("wishlists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (tenantId) query = query.eq("tenant_id", tenantId)

  const { data } = await query
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { tenantId, productId } = await request.json()

  const { error } = await supabaseAdmin
    .from("wishlists")
    .insert({ user_id: user.id, tenant_id: tenantId, product_id: productId })

  if (error?.code === "23505") {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  return NextResponse.json({ ok: !error }, { status: error ? 500 : 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { tenantId, productId } = await request.json()

  await supabaseAdmin
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .eq("product_id", productId)

  return NextResponse.json({ ok: true })
}
