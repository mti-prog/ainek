import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PLANS, type PlanKey } from "@/lib/stripe/plans"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Stripe webhook signature error:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const tenantId = session.metadata?.tenant_id
      const plan = session.metadata?.plan as PlanKey

      if (!tenantId || !plan || !PLANS[plan]) break

      const planData = PLANS[plan]
      const subscriptionId = session.subscription as string

      await supabaseAdmin.from("subscriptions").insert({
        tenant_id: tenantId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: session.customer as string,
        plan,
        status: "active",
        price_usd: planData.priceUsd,
      })

      await supabaseAdmin
        .from("tenants")
        .update({
          plan,
          status: "active",
          try_on_limit: planData.tryOnLimit,
        })
        .eq("id", tenantId)

      break
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
      const subscriptionId = typeof invoice.subscription === "string"
        ? invoice.subscription
        : (invoice.subscription as Stripe.Subscription | null)?.id

      if (!subscriptionId) break

      // Reset monthly try-on counter on successful renewal
      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("tenant_id, plan")
        .eq("stripe_subscription_id", subscriptionId)
        .single()

      if (sub) {
        await supabaseAdmin
          .from("tenants")
          .update({
            try_on_used: 0,
            overage_count: 0,
            status: "active",
          })
          .eq("id", sub.tenant_id)

        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "active" })
          .eq("stripe_subscription_id", subscriptionId)
      }

      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
      const subscriptionId = typeof invoice.subscription === "string"
        ? invoice.subscription
        : (invoice.subscription as Stripe.Subscription | null)?.id

      if (!subscriptionId) break

      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("tenant_id")
        .eq("stripe_subscription_id", subscriptionId)
        .single()

      if (sub) {
        await supabaseAdmin
          .from("tenants")
          .update({ status: "suspended" })
          .eq("id", sub.tenant_id)

        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId)
      }

      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription

      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("tenant_id")
        .eq("stripe_subscription_id", subscription.id)
        .single()

      if (sub) {
        await supabaseAdmin
          .from("tenants")
          .update({ plan: "starter", status: "trial", try_on_limit: 50 })
          .eq("id", sub.tenant_id)

        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id)
      }

      break
    }
  }

  return NextResponse.json({ received: true })
}
