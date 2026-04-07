"use client"

import { useState } from "react"
import { ShoppingBag } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number | string
  imageUrl?: string
}

interface Props {
  product: Product
  tenantId: string
}

export default function AddToCartButton({ product, tenantId }: Props) {
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleAdd() {
    setLoading(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          item: {
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            qty: 1,
          },
        }),
      })
      if (res.ok) {
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="w-full py-3 rounded-xl bg-white/10 text-white hover:bg-white/15 transition flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <ShoppingBag size={18} />
      {added ? "Добавлено!" : loading ? "..." : "В корзину"}
    </button>
  )
}
