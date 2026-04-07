"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export default function OrderStatusButton({
  orderId,
  status,
  label,
  danger,
}: {
  orderId: string
  status: string
  label: string
  danger?: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  async function updateStatus() {
    setError("")

    const response = await fetch(`/api/tenant/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setError(data?.error ?? "Не удалось обновить статус")
      return
    }

    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={updateStatus}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-50 ${
          danger ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-white/10 text-white/70 hover:bg-white/15"
        }`}
      >
        {isPending ? "..." : label}
      </button>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  )
}
