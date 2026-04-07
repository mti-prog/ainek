"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface CartItem {
  productId: string
  name: string
  price: number | string
  qty: number
  size?: string
  color?: string
  imageUrl?: string
}

type Step = "cart" | "address" | "payment" | "confirm"

const DELIVERY_METHODS = [
  { value: "pickup", label: "Самовывоз", description: "Забрать из магазина" },
  { value: "courier", label: "Курьер", description: "Доставка по городу" },
]

const PAYMENT_METHODS = [
  { value: "cash", label: "Наличные" },
  { value: "card", label: "Банковская карта" },
  { value: "mbank", label: "MBank" },
  { value: "optima", label: "Optima" },
]

function CheckoutContent({ slug }: { slug: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenantId = searchParams.get("tenantId") ?? ""

  const [step, setStep] = useState<Step>("cart")
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "courier">("pickup")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mbank" | "optima">("cash")
  const [address, setAddress] = useState({ city: "Бишкек", street: "", apartment: "" })
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (!tenantId) return
    fetch(`/api/cart?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? [])
        setLoading(false)
      })
  }, [tenantId])

  const subtotal = items.reduce(
    (s, i) => s + Number(i.price) * i.qty,
    0
  )

  async function handleQuantityChange(idx: number, delta: number) {
    const updated = [...items]
    updated[idx].qty = Math.max(1, updated[idx].qty + delta)
    setItems(updated)
    // sync to server
    if (delta < 0) {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, productId: updated[idx].productId, size: updated[idx].size }),
      })
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, item: updated[idx] }),
      })
    }
  }

  async function handleRemove(idx: number) {
    const item = items[idx]
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, productId: item.productId, size: item.size }),
    })
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handlePlaceOrder() {
    setSubmitting(true)
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: Number(i.price),
          qty: i.qty,
          size: i.size,
          color: i.color,
        })),
        deliveryMethod,
        deliveryAddress: deliveryMethod === "courier" ? address : undefined,
        paymentMethod,
        notes: notes || undefined,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      alert(data.error ?? "Ошибка оформления заказа")
      setSubmitting(false)
      return
    }

    setOrderId(data.orderId)
    setStep("confirm")
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Заказ оформлен!</h1>
        <p className="text-white/60 mb-2">Номер заказа:</p>
        <p className="text-violet-400 font-mono text-sm mb-8">{orderId}</p>
        <p className="text-white/50 text-sm mb-8">
          Мы свяжемся с вами для подтверждения доставки.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(`/store/${slug}`)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition"
          >
            Продолжить покупки
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {(["cart", "address", "payment"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                s === step
                  ? "bg-violet-600 text-white"
                  : steps.indexOf(step) > steps.indexOf(s)
                  ? "bg-green-500/30 text-green-400"
                  : "bg-white/10 text-white/40"
              }`}
            >
              {i + 1}
            </div>
            <span className={s === step ? "text-white" : "text-white/40"}>
              {s === "cart" ? "Корзина" : s === "address" ? "Доставка" : "Оплата"}
            </span>
            {i < 2 && <span className="text-white/20 mx-1">›</span>}
          </div>
        ))}
      </div>

      {/* Cart step */}
      {step === "cart" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Ваша корзина</h2>
          {items.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <p className="text-lg mb-4">Корзина пуста</p>
              <button
                onClick={() => router.push(`/store/${slug}`)}
                className="text-violet-400 hover:underline text-sm"
              >
                Перейти в каталог
              </button>
            </div>
          ) : (
            <>
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-20 rounded-lg bg-white/10 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    {item.size && (
                      <p className="text-white/40 text-sm">Размер: {item.size}</p>
                    )}
                    <p className="text-violet-400 font-semibold mt-1">
                      {Number(item.price).toLocaleString("ru-RU")} сом
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleRemove(idx)}
                      className="text-white/30 hover:text-red-400 transition text-xs"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-2 mt-auto">
                      <button
                        onClick={() => handleQuantityChange(idx, -1)}
                        className="w-6 h-6 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition"
                      >
                        −
                      </button>
                      <span className="text-white text-sm w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => handleQuantityChange(idx, 1)}
                        className="w-6 h-6 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="text-white/60">Итого</span>
                <span className="text-xl font-bold text-white">
                  {subtotal.toLocaleString("ru-RU")} сом
                </span>
              </div>

              <button
                onClick={() => setStep("address")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition"
              >
                Далее — доставка
              </button>
            </>
          )}
        </div>
      )}

      {/* Address step */}
      {step === "address" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white mb-4">Способ доставки</h2>
          <div className="space-y-3">
            {DELIVERY_METHODS.map((m) => (
              <label
                key={m.value}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
                  deliveryMethod === m.value
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={m.value}
                  checked={deliveryMethod === m.value}
                  onChange={() => setDeliveryMethod(m.value as "pickup" | "courier")}
                  className="accent-violet-500"
                />
                <div>
                  <p className="text-white font-medium">{m.label}</p>
                  <p className="text-white/40 text-sm">{m.description}</p>
                </div>
              </label>
            ))}
          </div>

          {deliveryMethod === "courier" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Улица и дом</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                  placeholder="ул. Чуй 123"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Квартира / офис</label>
                <input
                  type="text"
                  value={address.apartment}
                  onChange={(e) => setAddress((a) => ({ ...a, apartment: e.target.value }))}
                  placeholder="кв. 45"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("cart")}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white hover:border-white/40 transition"
            >
              Назад
            </button>
            <button
              onClick={() => setStep("payment")}
              disabled={deliveryMethod === "courier" && !address.street}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              Далее — оплата
            </button>
          </div>
        </div>
      )}

      {/* Payment step */}
      {step === "payment" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white mb-4">Способ оплаты</h2>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.value}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === m.value
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={m.value}
                  checked={paymentMethod === m.value}
                  onChange={() => setPaymentMethod(m.value as typeof paymentMethod)}
                  className="accent-violet-500"
                />
                <span className="text-white text-sm font-medium">{m.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Комментарий к заказу</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Пожелания по доставке, размеру и т.д."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          {/* Order summary */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <p className="text-white/60 text-sm">Итого {items.reduce((s, i) => s + i.qty, 0)} товара(ов)</p>
            <div className="flex justify-between">
              <span className="text-white/60">Сумма</span>
              <span className="text-white font-semibold">{subtotal.toLocaleString("ru-RU")} сом</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Доставка</span>
              <span className="text-white/60 text-sm">{deliveryMethod === "pickup" ? "Бесплатно" : "Уточняется"}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("address")}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white hover:border-white/40 transition"
            >
              Назад
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? "Оформляем..." : "Оформить заказ"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const steps: Step[] = ["cart", "address", "payment", "confirm"]

interface Props {
  params: Promise<{ slug: string }>
}

export default function CheckoutPage({ params }: Props) {
  const [slug, setSlug] = useState("")

  useEffect(() => {
    params.then((p) => setSlug(p.slug))
  }, [params])

  if (!slug) return null

  return (
    <Suspense>
      <CheckoutContent slug={slug} />
    </Suspense>
  )
}
