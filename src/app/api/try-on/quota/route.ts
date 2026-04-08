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

  const today = new Date().toISOString().split("T")[0]

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
    userRemaining: null,
    resetAt: today,
    used: null,
    limit: null,
    unlimited: true,
    tenant,
  })
}
