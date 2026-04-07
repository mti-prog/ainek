import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe/client"
import { apiError, apiOk } from "@/lib/api"
import { getOwnedTenantForUser } from "@/lib/tenant"

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const tenant = await getOwnedTenantForUser(user)

  const customerId = tenant?.stripe_customer_id
  if (!customerId) {
    return apiError("No billing account found", 404, "BILLING_ACCOUNT_NOT_FOUND")
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard/settings`,
  })

  return apiOk({ url: session.url })
}
