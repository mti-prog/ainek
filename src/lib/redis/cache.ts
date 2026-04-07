import { Redis } from "@upstash/redis"
import { createHash } from "crypto"

// Lazily initialised — safe when env vars are not yet set during build
let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    _redis = Redis.fromEnv()
  }
  return _redis
}

/**
 * Generates a short deterministic hash from the first 2000 chars of a photo
 * (base64 or URL). Balances collision-resistance vs. speed.
 */
export function hashPhoto(photo: string): string {
  return createHash("sha256")
    .update(photo.slice(0, 2000))
    .digest("hex")
    .slice(0, 16)
}

const CACHE_TTL_SECONDS = 86400 // 24 hours

export async function getCachedTryOn(
  productId: string,
  photoHash: string
): Promise<string | null> {
  try {
    const key = `tryon:${productId}:${photoHash}`
    return await getRedis().get<string>(key)
  } catch {
    return null // Redis failure is non-fatal — fall through to generation
  }
}

export async function setCachedTryOn(
  productId: string,
  photoHash: string,
  resultUrl: string
): Promise<void> {
  try {
    const key = `tryon:${productId}:${photoHash}`
    await getRedis().setex(key, CACHE_TTL_SECONDS, resultUrl)
  } catch {
    // Non-fatal
  }
}

export async function getCachedTenantSlug(slug: string): Promise<string | null> {
  try {
    return await getRedis().get<string>(`tenant:slug:${slug}`)
  } catch {
    return null
  }
}

export async function setCachedTenantSlug(
  slug: string,
  tenantId: string
): Promise<void> {
  try {
    await getRedis().setex(`tenant:slug:${slug}`, 3600, tenantId) // 1h TTL
  } catch {
    // Non-fatal
  }
}
