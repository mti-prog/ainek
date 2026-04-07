import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { provisionTenantSchema } from "@/lib/supabase/provision-tenant"
import { apiError, apiOk } from "@/lib/api"
import { logEvent } from "@/lib/logging"
import { z } from "zod"

const schema = z.object({
  storeName: z.string().min(2).max(255),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, "INVALID_REGISTRATION_PAYLOAD")
  }

  const { storeName, slug, email, password } = parsed.data
  logEvent({ event: "tenant.register.requested", slug, email })

  // 1. Check slug availability
  const { data: existing } = await supabaseAdmin
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .single()

  if (existing) {
    return apiError("Slug already taken", 409, "SLUG_TAKEN")
  }

  // 2. Create Supabase auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    logEvent({
      event: "tenant.register.auth_failed",
      level: "error",
      slug,
      email,
      message: authError?.message ?? "Unknown auth error",
    })
    return apiError(
      authError?.message ?? "Failed to create user",
      400,
      "AUTH_USER_CREATE_FAILED"
    )
  }

  const userId = authData.user.id

  // 3. Create tenant row
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from("tenants")
    .insert({
      name: storeName,
      slug,
      email,
      owner_user_id: userId,
      status: "trial",
      plan: "starter",
      onboarding_status: "creating_profile",
      onboarding_error: null,
      try_on_limit: 50,
      trial_ends_at: trialEndsAt,
    })
    .select("id")
    .single()

  if (tenantError || !tenant) {
    // Rollback: delete the auth user
    await supabaseAdmin.auth.admin.deleteUser(userId)
    logEvent({
      event: "tenant.register.tenant_failed",
      level: "error",
      slug,
      email,
      ownerUserId: userId,
      message: tenantError?.message ?? "Unknown tenant insert error",
    })
    return apiError(
      tenantError?.message ?? "Failed to create tenant",
      500,
      "TENANT_CREATE_FAILED"
    )
  }

  // 4. Create user profile row
  const { error: profileError } = await supabaseAdmin.from("users").insert({
    id: userId,
    email,
    tenant_id: tenant.id,
  })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId)
    await supabaseAdmin.from("tenants").delete().eq("id", tenant.id)
    logEvent({
      event: "tenant.register.profile_failed",
      level: "error",
      tenantId: tenant.id,
      ownerUserId: userId,
      message: profileError.message,
    })
    return apiError(profileError.message, 500, "OWNER_PROFILE_CREATE_FAILED")
  }

  await supabaseAdmin
    .from("tenants")
    .update({
      onboarding_status: "provisioning_store",
      onboarding_error: null,
    })
    .eq("id", tenant.id)

  // 5. Provision the store's dedicated schema
  try {
    await provisionTenantSchema(tenant.id)
    await supabaseAdmin
      .from("tenants")
      .update({
        onboarding_status: "ready",
        onboarding_error: null,
      })
      .eq("id", tenant.id)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Schema provisioning failed"
    await supabaseAdmin
      .from("tenants")
      .update({
        onboarding_status: "failed",
        onboarding_error: message,
      })
      .eq("id", tenant.id)

    logEvent({
      event: "tenant.register.provisioning_failed",
      level: "error",
      tenantId: tenant.id,
      ownerUserId: userId,
      message,
    })

    return apiOk(
      {
        tenantId: tenant.id,
        onboardingStatus: "failed",
        warning: "Store created, but provisioning needs retry.",
      },
      202
    )
  }

  logEvent({
    event: "tenant.register.completed",
    tenantId: tenant.id,
    ownerUserId: userId,
  })

  return apiOk(
    {
      tenantId: tenant.id,
      onboardingStatus: "ready",
    },
    201
  )
}
