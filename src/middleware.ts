import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/auth/callback",
  "/_next",
  "/favicon.ico",
  "/api/webhooks",
]

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const hostname = request.headers.get("host") ?? ""
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ── 1. Resolve tenant slug ────────────────────────────────────────────────
  // Production: slug.ainek.kg → slug
  // Local dev: ?tenant=slug query param fallback
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "ainek.kg"
  let tenantSlug = ""

  if (hostname.endsWith(`.${appDomain}`)) {
    tenantSlug = hostname.replace(`.${appDomain}`, "")
  } else {
    tenantSlug = searchParams.get("tenant") ?? ""
  }

  // ── 2. Build response with injected headers ───────────────────────────────
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-tenant-slug", tenantSlug)

  // ── 3. Supabase session (needed for auth-protected route checks) ──────────
  const makeResponse = () => NextResponse.next({
    request: { headers: requestHeaders },
  })
  let response = makeResponse()

  let userId: string | null = null

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            response = makeResponse()
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      })

      // ⚡ Use getSession() here — reads from the cookie without a network
      // round-trip. getUser() (which verifies with the Supabase server) runs
      // in page/API handlers where we need full JWT validation.
      // Using getUser() in Edge middleware caused 504 GATEWAY_TIMEOUT because
      // every request was blocked on an outbound HTTP call to Supabase.
      const {
        data: { session },
      } = await supabase.auth.getSession()

      userId = session?.user?.id ?? null
    } catch {
      userId = null
    }
  }

  // ── 4. Protect /dashboard routes ─────────────────────────────────────────
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!userId) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("next", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── 5. Protect /account (user profile) routes ────────────────────────────
  if (pathname.startsWith("/account")) {
    if (!userId) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("next", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Pass tenant-id header if user is authenticated (populated later from DB)
  if (userId) {
    response.headers.set("x-user-id", userId)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Run middleware only on page routes and API routes that need tenant/auth.
     * Skip _next/static, _next/image, favicon, public files, and webhook routes
     * so the Edge function never gets invoked for static assets.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)|api/webhooks).*)",
  ],
}
