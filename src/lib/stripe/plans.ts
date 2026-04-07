// Stripe bills in USD. KGS prices shown to users for display only.
// At ~90 KGS/USD: 2900 som ≈ $32, 5900 som ≈ $65

export const PLANS = {
  starter: {
    name: "Старт",
    priceUsd: 32,
    priceSom: 2900,
    tryOnLimit: 500,
    priceId: process.env.STRIPE_PRICE_ID_STARTER ?? "",
  },
  business: {
    name: "Бизнес",
    priceUsd: 65,
    priceSom: 5900,
    tryOnLimit: 2000,
    priceId: process.env.STRIPE_PRICE_ID_BUSINESS ?? "",
  },
} as const

export type PlanKey = keyof typeof PLANS
