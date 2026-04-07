import { NextRequest, NextResponse } from "next/server"
import { apiError, apiOk } from "@/lib/api"
import { getTenantBySlug } from "@/lib/tenant"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.toLowerCase().trim()

  if (!slug) {
    return apiError("slug required", 400, "SLUG_REQUIRED")
  }

  const tenant = await getTenantBySlug(slug)

  if (!tenant) {
    return apiError("Tenant not found", 404, "TENANT_NOT_FOUND")
  }

  return apiOk({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logo_url: tenant.logo_url ?? null,
    status: tenant.status,
    plan: tenant.plan,
    onboarding_status: tenant.onboarding_status ?? "ready",
  })
}
