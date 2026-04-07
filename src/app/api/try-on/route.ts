import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { generateTryOn } from "@/lib/gemini/try-on"
import { getCachedTryOn, setCachedTryOn, hashPhoto } from "@/lib/redis/cache"

const USER_DAILY_LIMIT = 5
const AI_COST_USD = 0.0670

export async function POST(request: NextRequest) {
  // ── 1. Auth ───────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
  } = body

  if (!imageBase64) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 })
  }

  const effectiveTenantId =
    tenantId ?? request.headers.get("x-tenant-id") ?? null

  // ── 3. User daily quota ───────────────────────────────────────────────────
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select("daily_try_on_count, daily_try_on_reset")
    .eq("id", userId)
    .single()

  if (userError || !userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
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
    return NextResponse.json(
      { error: "Daily limit reached", limit: USER_DAILY_LIMIT, resetAt: today },
      { status: 429 }
    )
  }

  // ── 4. Tenant monthly quota ───────────────────────────────────────────────
  if (effectiveTenantId) {
    const { data: tenantData } = await supabaseAdmin
      .from("tenants")
      .select("try_on_used, try_on_limit, status")
      .eq("id", effectiveTenantId)
      .single()

    if (tenantData) {
      if (tenantData.status === "suspended") {
        return NextResponse.json(
          { error: "Store subscription is suspended" },
          { status: 402 }
        )
      }
      if ((tenantData.try_on_used ?? 0) >= (tenantData.try_on_limit ?? 50)) {
        // Record overage — don't hard-block (allows billing to catch up)
        await supabaseAdmin
          .from("tenants")
          .update({ overage_count: (tenantData as { overage_count?: number }).overage_count ?? 0 + 1 })
          .eq("id", effectiveTenantId)
          // For strict block, uncomment:
          // return NextResponse.json({ error: "Store monthly limit reached" }, { status: 429 })
      }
    }
  }

  // ── 5. Redis cache lookup ─────────────────────────────────────────────────
  const photoHash = hashPhoto(imageBase64)
  const cacheKey = productId ?? clothingName ?? "unknown"
  const cached = await getCachedTryOn(cacheKey, photoHash)

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

    return NextResponse.json({ generatedImage: cached, cached: true })
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
    console.error("Gemini try-on error:", err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: "Failed to generate try-on", details: msg },
      { status: 500 }
    )
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

  // ── 9. Cache result ───────────────────────────────────────────────────────
  await setCachedTryOn(cacheKey, photoHash, result.imageBase64)

  return NextResponse.json({
    generatedImage: result.imageBase64,
    cached: false,
    sessionId: session?.id ?? null,
    text: result.textResponse,
  })
}
