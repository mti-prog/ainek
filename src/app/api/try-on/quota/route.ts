import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data } = await supabaseAdmin
    .from("users")
    .select("daily_try_on_count, daily_try_on_reset")
    .eq("id", user.id)
    .single()

  if (!data) {
    return NextResponse.json({ userRemaining: 0, resetAt: null })
  }

  const today = new Date().toISOString().split("T")[0]
  const count =
    (data.daily_try_on_reset as string) < today ? 0 : (data.daily_try_on_count ?? 0)

  return NextResponse.json({
    userRemaining: Math.max(0, 5 - count),
    resetAt: today,
    used: count,
    limit: 5,
  })
}
