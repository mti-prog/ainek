"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface WishlistItem {
  id: string
  tenant_id: string
  product_id: string
  created_at: string
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? [])
        setLoading(false)
      })
  }, [])

  async function removeItem(tenantId: string, productId: string) {
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, productId }),
    })
    setItems((prev) =>
      prev.filter(
        (i) => !(i.tenant_id === tenantId && i.product_id === productId)
      )
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Избранное</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <p className="text-white/40">Список избранного пуст</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div>
                <p className="text-white/40 text-xs mb-0.5">ID товара</p>
                <p className="text-white font-mono text-sm">{item.product_id.slice(0, 16)}…</p>
                <p className="text-white/30 text-xs mt-1">
                  {new Date(item.created_at).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => removeItem(item.tenant_id, item.product_id)}
                  className="text-white/30 hover:text-red-400 transition text-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
