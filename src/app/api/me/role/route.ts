import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// GET /api/me/role
// Returns { role: "owner" | "buyer" } based on whether the user owns a tenant
export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ role: "guest" }, { status: 401 })
  }

  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle()

  return NextResponse.json({ role: tenant ? "owner" : "buyer" })
}
