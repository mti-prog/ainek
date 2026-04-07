"use client"

import { useState } from "react"
import { PLANS } from "@/lib/stripe/plans"

interface Tenant {
  id: string
  plan: string
  status: string
  try_on_used: number
  try_on_limit: number
  trial_ends_at?: string | null
}

type Subscription = {
  plan: string
  status: string
  price_usd: string
  current_period_end?: string | null
} | null

interface Props {
  tenant: Tenant
  subscription: Subscription
}

export default function BillingSection({ tenant, subscription }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function subscribe(plan: "starter" | "business") {
    setLoading(plan)
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(null)
  }

  async function openPortal() {
    setLoading("portal")
    const res = await fetch("/api/stripe/portal", { method: "POST" })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(null)
  }

  return (
    <section className="p-6 rounded-xl bg-white/5 border border-white/10">
      <h2 className="text-white font-semibold mb-4">Подписка</h2>

      {/* Current status */}
      <div className="mb-6 p-3 rounded-lg bg-white/5 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-white/40">Тариф</span>
          <span className="text-white capitalize">{tenant.plan}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Статус</span>
          <span className={`${tenant.status === "active" ? "text-green-400" : tenant.status === "trial" ? "text-yellow-400" : "text-red-400"}`}>
            {tenant.status === "trial" ? "Пробный" : tenant.status === "active" ? "Активна" : tenant.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Примерки</span>
          <span className="text-white">{tenant.try_on_used} / {tenant.try_on_limit}</span>
        </div>
        {subscription?.current_period_end && (
          <div className="flex justify-between">
            <span className="text-white/40">Следующее списание</span>
            <span className="text-white">
              {new Date(subscription.current_period_end).toLocaleDateString("ru-RU")}
            </span>
          </div>
        )}
      </div>

      {/* Plan cards */}
      {!subscription && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {(["starter", "business"] as const).map((key) => {
            const p = PLANS[key]
            return (
              <div key={key} className="p-4 rounded-xl border border-white/20 hover:border-violet-500/50 transition">
                <p className="text-white font-medium">{p.name}</p>
                <p className="text-2xl font-bold text-white mt-1">{p.priceSom.toLocaleString()} <span className="text-sm font-normal text-white/40">сом/мес</span></p>
                <p className="text-white/40 text-xs mt-1">{p.tryOnLimit} примерок/мес</p>
                <button
                  onClick={() => subscribe(key)}
                  disabled={loading !== null}
                  className="w-full mt-4 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-500 transition disabled:opacity-50"
                >
                  {loading === key ? "..." : "Подключить"}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Manage billing portal */}
      {subscription && (
        <button
          onClick={openPortal}
          disabled={loading !== null}
          className="w-full py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition disabled:opacity-50"
        >
          {loading === "portal" ? "Открываем..." : "Управление подпиской"}
        </button>
      )}
    </section>
  )
}
