import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * Handles Supabase email confirmation links of the form:
 *   /auth/confirm?token_hash=...&type=signup&next=/dashboard
 *
 * Supabase sometimes generates this format instead of the PKCE /auth/callback?code=...
 * depending on the email template configuration.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") ?? "signup"
  const next = searchParams.get("next") ?? ""

  if (token_hash) {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery" | "email" | "invite" | "magiclink" | "email_change",
    })

    if (!error && data.user) {
      // Explicit next path
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Auto-detect role: owner → /dashboard, buyer → /stores
      const { data: tenant } = await supabaseAdmin
        .from("tenants")
        .select("id")
        .eq("owner_user_id", data.user.id)
        .maybeSingle()

      const destination = tenant ? "/dashboard" : "/stores"
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=email_confirm_failed`)
}
