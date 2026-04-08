import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? ""

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // If explicit next is provided, use it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Detect role: owner → /dashboard, buyer → /stores
      const { data: tenant } = await supabaseAdmin
        .from("tenants")
        .select("id")
        .eq("owner_user_id", data.user.id)
        .maybeSingle()

      const destination = tenant ? "/dashboard" : "/stores"
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
