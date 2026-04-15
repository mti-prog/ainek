import { NextRequest, NextResponse } from "next/server"

/**
 * Lightweight middleware — zero network calls, zero Supabase SDK usage.
 *
 * Why: `supabase.auth.getUser()` and even `getSession()` can trigger outbound
 * HTTP requests (token refresh) on the Vercel Edge Runtime, causing
 * 504 GATEWAY_TIMEOUT. This middleware only reads cookies locally.
 *
 * Security: Page and API route handlers call `createSupabaseServerClient()`
 * and `supabase.auth.getUser()` (which validates the JWT with the Supabase
 * server). Middleware is only a first-pass guard / redirect layer.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""

// Derive the project ref from the Supabase URL, e.g.
// https://ouwmondqrngwrxtsmetd.supabase.co → ouwmondqrngwrxtsmetd
function getProjectRef(): string {
  try {
    const host = new URL(SUPABASE_URL).hostname       // ouwmondqrngwrxtsmetd.supabase.co
    return host.split(".")[0]                          // ouwmondqrngwrxtsmetd
  } catch {
    return ""
  }
}

/**
 * Returns true if a Supabase session cookie exists and is non-empty.
 * Supabase SSR stores the session as `sb-<ref>-auth-token` (or chunked
 * as `sb-<ref>-auth-token.0`, `.1`, …).
 * We don't verify the JWT — page/API handlers do that with getUser().
 */
function hasSessionCookie(request: NextRequest): boolean {
  const ref = getProjectRef()
  if (!ref) return false

  const cookieName = `sb-${ref}-auth-token`

  // Check the base cookie or any chunk (.0 suffix)
  const base = request.cookies.get(cookieName)
  if (base?.value) return true

  const chunk0 = request.cookies.get(`${cookieName}.0`)
  if (chunk0?.value) return true

  return false
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const hostname = request.headers.get("host") ?? ""

  // ── 1. Resolve tenant slug (subdomain or ?tenant= param) ─────────────────
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "ainek.kg"
  let tenantSlug = ""

  if (hostname.endsWith(`.${appDomain}`)) {
    tenantSlug = hostname.replace(`.${appDomain}`, "")
  } else {
    tenantSlug = searchParams.get("tenant") ?? ""
  }

  // ── 2. Build forwarded request headers ───────────────────────────────────
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-tenant-slug", tenantSlug)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // ── 3. Auth-protect /dashboard ────────────────────────────────────────────
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!hasSessionCookie(request)) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("next", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── 4. Auth-protect /account ──────────────────────────────────────────────
  if (pathname.startsWith("/account")) {
    if (!hasSessionCookie(request)) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("next", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Skip all static assets, images, and webhooks — middleware only
    // needs to run on page and API routes.
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)|api/webhooks).*)",
  ],
}
