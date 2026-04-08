import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { generateTryOn, generateOutfitTryOn } from "@/lib/gemini/try-on"
import { getCachedTryOn, setCachedTryOn, hashPhoto } from "@/lib/redis/cache"
import { apiError, apiOk } from "@/lib/api"
import { getTenantBySlug, isTenantProvisioned } from "@/lib/tenant"
import { logEvent } from "@/lib/logging"

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
    // ── Multi-item outfit mode ──────────────────────────────────────────────
    clothingItems,     // Array<{ productId, name, imageUrl? }> — outfit studio mode
  } = body

  if (!imageBase64) {
    return apiError("No image provided", 400, "IMAGE_REQUIRED")
  }

  // Determine mode: outfit (multi-item) vs single item
  const isOutfitMode = Array.isArray(clothingItems) && clothingItems.length > 0

  let effectiveTenantId = tenantId ?? null

  if (!effectiveTenantId) {
    const resolvedSlug = tenantSlug ?? request.headers.get("x-tenant-slug")
    if (resolvedSlug) {
      const tenant = await getTenantBySlug(resolvedSlug)
      effectiveTenantId = tenant?.id ?? null
    }
  }

  // ── 3. Tenant monthly quota ───────────────────────────────────────────────
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

  // ── 4. Redis cache lookup ─────────────────────────────────────────────────
  const photoHash = hashPhoto(imageBase64)
  // Cache key: for outfit mode = sorted product IDs joined; for single = productId
  const cacheKey = isOutfitMode
    ? clothingItems.map((i: { productId?: string }) => i.productId).filter(Boolean).sort().join("+") || null
    : productId ?? null
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

  // ── 5. Generate via Gemini ────────────────────────────────────────────────
  let result: { imageBase64: string; textResponse: string | null }
  try {
    if (isOutfitMode) {
      // Multi-item outfit: fetch product images server-side and convert to base64
      const outfitItems = await Promise.all(
        clothingItems.map(async (item: { name: string; imageUrl?: string; productId?: string }) => {
          let imageBase64: string | undefined
          if (item.imageUrl && item.imageUrl.startsWith("http")) {
            try {
              const imgRes = await fetch(item.imageUrl)
              const arrayBuffer = await imgRes.arrayBuffer()
              const b64 = Buffer.from(arrayBuffer).toString("base64")
              const mime = imgRes.headers.get("content-type") ?? "image/jpeg"
              imageBase64 = `data:${mime};base64,${b64}`
            } catch {
              // no image — will fall back to text description
            }
          }
          return { name: item.name, imageBase64 }
        })
      )
      result = await generateOutfitTryOn(imageBase64, outfitItems)
    } else {
      result = await generateTryOn({
        userPhotoBase64: imageBase64,
        clothingName: clothingName ?? "clothing item",
        clothingImageBase64: clothingImageUrl,
      })
    }
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

  // ── 6. Log try_on_sessions ────────────────────────────────────────────────
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

  // ── 7. Increment tenant usage ─────────────────────────────────────────────
  if (effectiveTenantId) {
    await supabaseAdmin.rpc("increment_tenant_try_on_used", {
      p_tenant_id: effectiveTenantId,
    })
  }

  // ── 8. Cache result (only when we have a stable product ID) ──────────────
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
