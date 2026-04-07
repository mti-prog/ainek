import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { apiError, apiOk } from "@/lib/api"
import { getTenantBySlug } from "@/lib/tenant"

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401, "UNAUTHORIZED")
  }

  const { data } = await supabaseAdmin
    .from("users")
    .select("daily_try_on_count, daily_try_on_reset")
    .eq("id", user.id)
    .single()

  if (!data) {
    return apiOk({ userRemaining: 0, resetAt: null, tenant: null })
  }

  const today = new Date().toISOString().split("T")[0]
  const count =
    (data.daily_try_on_reset as string) < today ? 0 : (data.daily_try_on_count ?? 0)

  const url = new URL(request.url)
  const tenantId = url.searchParams.get("tenantId")
  const tenantSlug = url.searchParams.get("tenantSlug")
  let tenant: Record<string, unknown> | null = null

  const resolvedTenantId =
    tenantId ?? (tenantSlug ? (await getTenantBySlug(tenantSlug))?.id ?? null : null)

  if (resolvedTenantId) {
    const { data: tenantData } = await supabaseAdmin
      .from("tenants")
      .select("id, status, plan, try_on_used, try_on_limit, onboarding_status")
      .eq("id", resolvedTenantId)
      .single()

    if (tenantData) {
      tenant = {
        id: tenantData.id,
        status: tenantData.status,
        plan: tenantData.plan,
        used: tenantData.try_on_used ?? 0,
        limit: tenantData.try_on_limit ?? 0,
        onboardingStatus: tenantData.onboarding_status ?? "ready",
      }
    }
  }

  return apiOk({
    userRemaining: Math.max(0, 5 - count),
    resetAt: today,
    used: count,
    limit: 5,
    tenant,
  })
}
