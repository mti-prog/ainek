import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") ?? "signup"
  const next = searchParams.get("next") ?? ""

  const supabase = await createSupabaseServerClient()
  let userId: string | null = null

  // ── PKCE flow: code exchange ──────────────────────────────────────────────
  if (code) {
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) userId = data.user.id
  }

  // ── Token hash flow (old email format) ────────────────────────────────────
  if (!userId && token_hash) {
    const { error, data } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery" | "email" | "invite" | "magiclink" | "email_change",
    })
    if (!error && data.user) userId = data.user.id
  }

  if (userId) {
    if (next) return NextResponse.redirect(`${origin}${next}`)

    // Detect role: owner → /dashboard, buyer → /stores
    const { data: tenant } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("owner_user_id", userId)
      .maybeSingle()

    const destination = tenant ? "/dashboard" : "/stores"
    return NextResponse.redirect(`${origin}${destination}`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
