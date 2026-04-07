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
  let response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: requestHeaders },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — required to keep auth tokens alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── 4. Protect /dashboard routes ─────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("next", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── 5. Protect /account (user profile) routes ────────────────────────────
  if (pathname.startsWith("/account")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("next", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Pass tenant-id header if user is authenticated (populated later from DB)
  if (user) {
    response.headers.set("x-user-id", user.id)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and images.
     * Stripe webhooks bypass auth checks (verified by signature instead).
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)",
  ],
}
