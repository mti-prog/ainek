import type { User } from "@supabase/supabase-js"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { logEvent } from "@/lib/logging"
import { getCachedTenantSlug, setCachedTenantSlug } from "@/lib/redis/cache"

export const TENANT_ONBOARDING_READY = "ready"
export const TENANT_ONBOARDING_FAILED = "failed"

export type TenantOnboardingStatus =
  | "creating_profile"
  | "provisioning_store"
  | typeof TENANT_ONBOARDING_READY
  | typeof TENANT_ONBOARDING_FAILED

export interface OwnedTenant {
  id: string
  name: string
  slug: string
  email: string
  status: string
  plan: string
  try_on_used: number
  try_on_limit: number
  trial_ends_at?: string | null
  logo_url?: string | null
  phone?: string | null
  address?: string | null
  stripe_customer_id?: string | null
  onboarding_status?: TenantOnboardingStatus | null
  onboarding_error?: string | null
  owner_user_id?: string | null
}

const OWNED_TENANT_SELECT = `
  id,
  name,
  slug,
  email,
  phone,
  address,
  logo_url,
  status,
  plan,
  try_on_used,
  try_on_limit,
  trial_ends_at,
  stripe_customer_id,
  owner_user_id,
  onboarding_status,
  onboarding_error
`

export function getTenantSchemaName(tenantId: string) {
  return `store_${tenantId.replace(/-/g, "_")}`
}

export async function getOwnedTenantForUser(user: Pick<User, "id" | "email">) {
  const { data: ownerTenant } = await supabaseAdmin
    .from("tenants")
    .select(OWNED_TENANT_SELECT)
    .eq("owner_user_id", user.id)
    .single()

  if (ownerTenant) {
    return ownerTenant as OwnedTenant
  }

  if (!user.email) {
    return null
  }

  const { data: legacyTenant } = await supabaseAdmin
    .from("tenants")
    .select(OWNED_TENANT_SELECT)
    .eq("email", user.email)
    .is("owner_user_id", null)
    .single()

  if (!legacyTenant) {
    return null
  }

  await supabaseAdmin
    .from("tenants")
    .update({ owner_user_id: user.id })
    .eq("id", legacyTenant.id)

  logEvent({
    event: "tenant.owner_backfilled",
    tenantId: legacyTenant.id,
    ownerUserId: user.id,
  })

  return {
    ...(legacyTenant as OwnedTenant),
    owner_user_id: user.id,
  }
}

export async function getTenantBySlug(slug: string) {
  const cachedTenantId = await getCachedTenantSlug(slug)

  if (cachedTenantId) {
    const { data: cachedTenant } = await supabaseAdmin
      .from("tenants")
      .select(OWNED_TENANT_SELECT)
      .eq("id", cachedTenantId)
      .single()

    if (cachedTenant) {
      return cachedTenant as OwnedTenant
    }
  }

  const { data } = await supabaseAdmin
    .from("tenants")
    .select(OWNED_TENANT_SELECT)
    .eq("slug", slug)
    .single()

  if (data?.id) {
    await setCachedTenantSlug(slug, data.id)
  }

  return (data as OwnedTenant | null) ?? null
}

export async function isTenantProvisioned(tenantId: string) {
  const schemaName = getTenantSchemaName(tenantId)

  // Use direct DB connection to check information_schema — PostgREST can't
  // query custom schemas, but postgres.js can access any schema.
  try {
    // Lazy import to avoid circular deps and keep tenant.ts lightweight
    const db = (await import("@/lib/db")).default
    const [row] = await db`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = ${schemaName}
        AND table_name = 'products'
      ) AS exists
    `
    if (row?.exists === true) {
      return { ready: true, schemaName }
    }
  } catch {
    // DB unavailable — fall through to onboarding_status check
  }

  // Fallback: trust the onboarding_status flag set by provisionTenantSchema
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("onboarding_status")
    .eq("id", tenantId)
    .single()

  if (tenant?.onboarding_status === "ready") {
    return { ready: true, schemaName }
  }

  return { ready: false, schemaName, missingSchema: true }
}

export function isTenantOnboardingReady(tenant: Pick<OwnedTenant, "onboarding_status">) {
  return (tenant.onboarding_status ?? TENANT_ONBOARDING_READY) === TENANT_ONBOARDING_READY
}
