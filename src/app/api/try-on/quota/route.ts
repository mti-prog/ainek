import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { apiError, apiOk } from "@/lib/api"
import { getTenantBySlug } from "@/lib/tenant"

const USER_LIFETIME_LIMIT = 3

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401, "UNAUTHORIZED")
  }

  // Read atomic counter from user_tryon_counts — persists across refreshes
  const { data: countRow } = await supabaseAdmin
    .from("user_tryon_counts")
    .select("tryon_count")
    .eq("user_id", user.id)
    .single()

  const used = countRow?.tryon_count ?? 0
  const remaining = Math.max(0, USER_LIFETIME_LIMIT - used)

  const url = new URL(request.url)
  const tenantId = url.searchParams.get("tenantId")
  const tenantSlug = url.searchParams.get("tenantSlug")

  const resolvedTenantId =
    tenantId ?? (tenantSlug ? (await getTenantBySlug(tenantSlug))?.id ?? null : null)

  let tenant: Record<string, unknown> | null = null
  if (resolvedTenantId) {
    const { data: tenantData } = await supabaseAdmin
      .from("tenants")
      .select("id, status, plan, try_on_used, try_on_limit")
      .eq("id", resolvedTenantId)
      .single()

    if (tenantData) {
      tenant = {
        id: tenantData.id,
        status: tenantData.status,
        plan: tenantData.plan,
        used: tenantData.try_on_used ?? 0,
        limit: tenantData.try_on_limit ?? 0,
      }
    }
  }

  return apiOk({
    used,
    limit: USER_LIFETIME_LIMIT,
    remaining,
    unlimited: false,
    tenant,
  })
}
