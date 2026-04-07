import Stripe from "stripe"

let _stripe: Stripe | null = null

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) {
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_placeholder", {
        apiVersion: "2025-06-30.basil",
      })
    }
    const value = (_stripe as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === "function" ? value.bind(_stripe) : value
  },
})
