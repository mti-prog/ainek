import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { apiError, apiOk } from "@/lib/api"
import { getOwnedTenantForUser, getTenantSchemaName, isTenantOnboardingReady } from "@/lib/tenant"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const tenant = await getOwnedTenantForUser(user)

  if (!tenant) return apiError("Forbidden", 403, "TENANT_NOT_FOUND")
  if (!isTenantOnboardingReady(tenant)) {
    return apiError("Store setup is incomplete", 409, "TENANT_ONBOARDING_INCOMPLETE")
  }

  const body = await request.json().catch(() => null)
    ?? Object.fromEntries(new URLSearchParams(await request.text()))

  const status = body.status
  const validStatuses = ["confirmed", "shipped", "delivered", "cancelled", "refunded"]

  if (!validStatuses.includes(status)) {
    return apiError("Invalid status", 400, "INVALID_ORDER_STATUS")
  }

  const schemaName = getTenantSchemaName(tenant.id)

  const { error } = await supabaseAdmin
    .schema(schemaName)
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", tenant.id)

  if (error) return apiError(error.message, 500, "ORDER_STATUS_UPDATE_FAILED")

  // Update denormalized order_history for buyer visibility
  await supabaseAdmin
    .from("order_history")
    .update({ status })
    .eq("order_id", id)
    .eq("tenant_id", tenant.id)

  return apiOk({ ok: true })
}
