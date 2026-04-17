"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"

interface CartItem {
  productId: string
  name: string
  price: number | string
  qty: number
  size?: string
  color?: string
  imageUrl?: string
}

function CartContent({ slug }: { slug: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenantIdParam = searchParams.get("tenantId") ?? ""

  const [tenantId, setTenantId] = useState(tenantIdParam)
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Resolve tenantId from slug if not in URL params
  useEffect(() => {
    if (tenantIdParam) { setTenantId(tenantIdParam); return }
    fetch(`/api/tenant/info?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => { if (d.id) setTenantId(d.id) })
      .catch(() => {})
  }, [slug, tenantIdParam])

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    fetch(`/api/cart?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [tenantId])

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.qty, 0)

  async function updateQty(idx: number, newQty: number) {
    if (newQty < 1) {
      await removeItem(idx)
      return
    }
    const updated = [...items]
    const old = updated[idx]
    updated[idx] = { ...old, qty: newQty }
    setItems(updated)
    // replace item: delete + re-add
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, productId: old.productId, size: old.size }),
    })
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, item: { ...old, qty: newQty } }),
    })
  }

  async function removeItem(idx: number) {
    const item = items[idx]
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, productId: item.productId, size: item.size }),
    })
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Корзина</h1>
        <Link href={`/${slug}`} className="text-sm text-violet-400 hover:underline">
          Продолжить покупки
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 6m12-6l2 6m-10-6h6" />
            </svg>
          </div>
          <p className="text-white/40 mb-6">Корзина пуста</p>
          <Link
            href={`/${slug}`}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition inline-block"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={`${item.productId}-${item.size}-${idx}`}
              className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              {item.imageUrl ? (
                <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-16 h-20 rounded-lg bg-white/10 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{item.name}</p>
                {item.size && (
                  <p className="text-white/40 text-xs mt-0.5">Размер: {item.size}</p>
                )}
                {item.color && (
                  <p className="text-white/40 text-xs">Цвет: {item.color}</p>
                )}
                <p className="text-violet-400 font-semibold mt-2">
                  {Number(item.price).toLocaleString("ru-RU")} сом
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button
                  onClick={() => removeItem(idx)}
                  className="text-white/30 hover:text-red-400 transition text-xs leading-none"
                  aria-label="Удалить"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => updateQty(idx, item.qty - 1)}
                    className="w-7 h-7 rounded-full bg-white/10 text-white hover:bg-white/20 transition flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-white text-sm w-5 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQty(idx, item.qty + 1)}
                    className="w-7 h-7 rounded-full bg-white/10 text-white hover:bg-white/20 transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-white/50 text-xs">
                  = {(Number(item.price) * item.qty).toLocaleString("ru-RU")} сом
                </p>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="border-t border-white/10 pt-4 flex justify-between items-center">
            <div>
              <p className="text-white/50 text-sm">{items.reduce((s, i) => s + i.qty, 0)} товара(ов)</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-sm">Итого</p>
              <p className="text-2xl font-bold text-white">{subtotal.toLocaleString("ru-RU")} сом</p>
            </div>
          </div>

          <button
            onClick={() =>
              router.push(`/${slug}/checkout?tenantId=${tenantId}`)
            }
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition"
          >
            Оформить заказ
          </button>
        </div>
      )}
    </div>
  )
}

interface Props {
  params: Promise<{ slug: string }>
}

export default function CartPage({ params }: Props) {
  const [slug, setSlug] = useState("")

  useEffect(() => {
    params.then((p) => setSlug(p.slug))
  }, [params])

  if (!slug) return null

  return (
    <Suspense>
      <CartContent slug={slug} />
    </Suspense>
  )
}
