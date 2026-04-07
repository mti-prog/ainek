import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { generateTryOn } from "@/lib/gemini/try-on"
import { getCachedTryOn, setCachedTryOn, hashPhoto } from "@/lib/redis/cache"
import { apiError, apiOk } from "@/lib/api"
import { getTenantBySlug, isTenantProvisioned } from "@/lib/tenant"
import { logEvent } from "@/lib/logging"

const USER_DAILY_LIMIT = 5
const AI_COST_USD = 0.0670

export async function POST(request: NextRequest) {
  // ── 1. Auth ───────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401, "UNAUTHORIZED")
  }

  const userId = user.id

  // ── 2. Parse body ─────────────────────────────────────────────────────────
  const body = await request.json()
  const {
    imageBase64,       // user's photo
    clothingName,
    clothingImageUrl,
    productId,         // UUID from store catalog (for cache key)
    tenantId,          // passed from client or from middleware header
    tenantSlug,
  } = body

  if (!imageBase64) {
    return apiError("No image provided", 400, "IMAGE_REQUIRED")
  }

  let effectiveTenantId = tenantId ?? null

  if (!effectiveTenantId) {
    const resolvedSlug = tenantSlug ?? request.headers.get("x-tenant-slug")
    if (resolvedSlug) {
      const tenant = await getTenantBySlug(resolvedSlug)
      effectiveTenantId = tenant?.id ?? null
    }
  }

  // ── 3. User daily quota ───────────────────────────────────────────────────
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select("daily_try_on_count, daily_try_on_reset")
    .eq("id", userId)
    .single()

  if (userError || !userData) {
    return apiError("User not found", 404, "USER_PROFILE_NOT_FOUND")
  }

  const today = new Date().toISOString().split("T")[0]

  let dailyCount = userData.daily_try_on_count ?? 0
  if ((userData.daily_try_on_reset as string) < today) {
    // Reset counter for new day
    await supabaseAdmin
      .from("users")
      .update({ daily_try_on_count: 0, daily_try_on_reset: today })
      .eq("id", userId)
    dailyCount = 0
  }

  if (dailyCount >= USER_DAILY_LIMIT) {
    return apiError(
      "Daily limit reached",
      429,
      "USER_DAILY_LIMIT_REACHED",
      { limit: USER_DAILY_LIMIT, resetAt: today }
    )
  }

  // ── 4. Tenant monthly quota ───────────────────────────────────────────────
  if (effectiveTenantId) {
    const { ready, missingSchema } = await isTenantProvisioned(effectiveTenantId)
    if (!ready && missingSchema) {
      return apiError(
        "Store setup is incomplete. Please try again later.",
        409,
        "TENANT_NOT_PROVISIONED"
      )
    }

    const { data: tenantData } = await supabaseAdmin
      .from("tenants")
      .select("try_on_used, try_on_limit, overage_count, status, onboarding_status")
      .eq("id", effectiveTenantId)
      .single()

    if (tenantData) {
      if (tenantData.onboarding_status && tenantData.onboarding_status !== "ready") {
        return apiError(
          "Store setup is incomplete. Please try again later.",
          409,
          "TENANT_ONBOARDING_INCOMPLETE"
        )
      }
      if (tenantData.status === "suspended") {
        return apiError("Store subscription is suspended", 402, "TENANT_SUSPENDED")
      }
      if ((tenantData.try_on_used ?? 0) >= (tenantData.try_on_limit ?? 50)) {
        const nextOverageCount = (tenantData.overage_count ?? 0) + 1
        await supabaseAdmin
          .from("tenants")
          .update({ overage_count: nextOverageCount })
          .eq("id", effectiveTenantId)

        logEvent({
          event: "try_on.tenant_overage_recorded",
          tenantId: effectiveTenantId,
          overageCount: nextOverageCount,
        })

        return apiError(
          "Monthly try-on limit reached. Please upgrade your plan.",
          402,
          "TENANT_QUOTA_EXCEEDED",
          { used: tenantData.try_on_used, limit: tenantData.try_on_limit }
        )
      }
    }
  }

  // ── 5. Redis cache lookup ─────────────────────────────────────────────────
  const photoHash = hashPhoto(imageBase64)
  // Only cache when we have a stable product ID — never use free-text or "unknown" as key
  const cacheKey = productId ?? null
  const cached = cacheKey ? await getCachedTryOn(cacheKey, photoHash) : null

  if (cached) {
    // Log session as cache hit (no cost, no quota increment)
    await supabaseAdmin.from("try_on_sessions").insert({
      user_id: userId,
      tenant_id: effectiveTenantId,
      product_id: productId ?? null,
      user_photo_url: "cached",
      result_image_url: cached,
      is_cached: true,
      cost_usd: "0.0000",
      status: "done",
    })

    logEvent({
      event: "try_on.cache_hit",
      tenantId: effectiveTenantId,
      userId,
      productId: productId ?? null,
    })

    return apiOk({ generatedImage: cached, cached: true })
  }

  // ── 6. Generate via Gemini ────────────────────────────────────────────────
  let result: { imageBase64: string; textResponse: string | null }
  try {
    result = await generateTryOn({
      userPhotoBase64: imageBase64,
      clothingName: clothingName ?? "clothing item",
      clothingImageBase64: clothingImageUrl,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logEvent({
      event: "try_on.generation_failed",
      level: "error",
      tenantId: effectiveTenantId,
      userId,
      productId: productId ?? null,
      message: msg,
    })
    return apiError("Failed to generate try-on", 500, "TRY_ON_GENERATION_FAILED", { message: msg })
  }

  // ── 7. Log try_on_sessions ────────────────────────────────────────────────
  const { data: session } = await supabaseAdmin
    .from("try_on_sessions")
    .insert({
      user_id: userId,
      tenant_id: effectiveTenantId,
      product_id: productId ?? null,
      user_photo_url: "private",              // don't store user photos for privacy
      result_image_url: result.imageBase64,   // store as base64 for MVP; move to Storage later
      is_cached: false,
      cost_usd: AI_COST_USD.toString(),
      status: "done",
    })
    .select("id")
    .single()

  // ── 8. Increment counters ─────────────────────────────────────────────────
  await supabaseAdmin
    .from("users")
    .update({ daily_try_on_count: dailyCount + 1 })
    .eq("id", userId)

  if (effectiveTenantId) {
    await supabaseAdmin.rpc("increment_tenant_try_on_used", {
      p_tenant_id: effectiveTenantId,
    })
  }

  // ── 9. Cache result (only when we have a stable product ID) ──────────────
  if (cacheKey) {
    await setCachedTryOn(cacheKey, photoHash, result.imageBase64)
  }

  logEvent({
    event: "try_on.generated",
    tenantId: effectiveTenantId,
    userId,
    productId: productId ?? null,
    sessionId: session?.id ?? null,
  })

  return apiOk({
    generatedImage: result.imageBase64,
    cached: false,
    sessionId: session?.id ?? null,
    text: result.textResponse,
  })
}
