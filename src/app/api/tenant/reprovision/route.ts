import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { provisionTenantSchema } from "@/lib/supabase/provision-tenant"
import { apiError, apiOk } from "@/lib/api"
import { logEvent } from "@/lib/logging"
import { getOwnedTenantForUser } from "@/lib/tenant"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401, "UNAUTHORIZED")
  }

  const tenant = await getOwnedTenantForUser(user)

  if (!tenant) {
    return apiError("Tenant not found", 404, "TENANT_NOT_FOUND")
  }

  await supabaseAdmin
    .from("tenants")
    .update({
      onboarding_status: "provisioning_store",
      onboarding_error: null,
    })
    .eq("id", tenant.id)

  try {
    await provisionTenantSchema(tenant.id)

    // Mark as ready — provisioning sets the onboarding_status flag which is
    // the authoritative signal that the schema exists. The isTenantProvisioned
    // function uses this as its source of truth when exec_sql_bool is unavailable.
    await supabaseAdmin
      .from("tenants")
      .update({
        onboarding_status: "ready",
        onboarding_error: null,
      })
      .eq("id", tenant.id)

    logEvent({ event: "tenant.reprovision.completed", tenantId: tenant.id })

    return apiOk({ ok: true, onboardingStatus: "ready" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provisioning failed"

    await supabaseAdmin
      .from("tenants")
      .update({
        onboarding_status: "failed",
        onboarding_error: message,
      })
      .eq("id", tenant.id)

    logEvent({
      event: "tenant.reprovision.failed",
      level: "error",
      tenantId: tenant.id,
      message,
    })

    return apiError(message, 500, "TENANT_REPROVISION_FAILED")
  }
}
