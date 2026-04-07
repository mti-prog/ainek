import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe/client"
import { PLANS, type PlanKey } from "@/lib/stripe/plans"
import { apiError, apiOk } from "@/lib/api"
import { getOwnedTenantForUser } from "@/lib/tenant"

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const { plan } = await request.json() as { plan: PlanKey }

  if (!PLANS[plan]) {
    return apiError("Invalid plan", 400, "INVALID_PLAN")
  }

  const tenant = await getOwnedTenantForUser(user)

  if (!tenant) return apiError("Tenant not found", 404, "TENANT_NOT_FOUND")

  const planData = PLANS[plan]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  // Retrieve or create Stripe customer
  let customerId = (tenant as { stripe_customer_id?: string }).stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: tenant.name,
      metadata: { tenant_id: tenant.id },
    })
    customerId = customer.id

    await supabaseAdmin
      .from("tenants")
      .update({ stripe_customer_id: customerId })
      .eq("id", tenant.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: planData.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/settings?billing=success`,
    cancel_url: `${appUrl}/dashboard/settings?billing=cancelled`,
    metadata: { tenant_id: tenant.id, plan },
  })

  return apiOk({ url: session.url })
}
