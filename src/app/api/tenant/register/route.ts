import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { provisionTenantSchema } from "@/lib/supabase/provision-tenant"
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
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { storeName, slug, email, password } = parsed.data

  // 1. Check slug availability
  const { data: existing } = await supabaseAdmin
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .single()

  if (existing) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 })
  }

  // 2. Create Supabase auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Failed to create user" },
      { status: 400 }
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
      status: "trial",
      plan: "starter",
      try_on_limit: 50,
      trial_ends_at: trialEndsAt,
    })
    .select("id")
    .single()

  if (tenantError || !tenant) {
    // Rollback: delete the auth user
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return NextResponse.json(
      { error: tenantError?.message ?? "Failed to create tenant" },
      { status: 500 }
    )
  }

  // 4. Create user profile row
  await supabaseAdmin.from("users").insert({
    id: userId,
    email,
    tenant_id: tenant.id,
  })

  // 5. Provision the store's dedicated schema
  try {
    await provisionTenantSchema(tenant.id)
  } catch (err) {
    console.error("Schema provisioning failed:", err)
    // Non-fatal for MVP — schema can be re-provisioned manually
  }

  return NextResponse.json({ tenantId: tenant.id }, { status: 201 })
}
