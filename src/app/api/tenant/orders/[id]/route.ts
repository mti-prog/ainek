import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id")
    .eq("email", user.email!)
    .single()

  if (!tenant) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json().catch(() => null)
    ?? Object.fromEntries(new URLSearchParams(await request.text()))

  const status = body.status
  const validStatuses = ["confirmed", "shipped", "delivered", "cancelled", "refunded"]

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const schemaName = `store_${tenant.id.replace(/-/g, "_")}`

  const { error } = await supabaseAdmin
    .schema(schemaName)
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", tenant.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update denormalized order_history for buyer visibility
  await supabaseAdmin
    .from("order_history")
    .update({ status })
    .eq("order_id", id)
    .eq("tenant_id", tenant.id)

  return NextResponse.json({ ok: true })
}
