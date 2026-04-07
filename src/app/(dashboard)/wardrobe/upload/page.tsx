"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, X } from "lucide-react"

const CATEGORIES = ["tops", "bottoms", "dresses", "shoes", "accessories"]

export default function UploadProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "tops",
    brand: "",
    price: "",
    sku: "",
    isVirtualTryOnEnabled: true,
  })

  function update(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    let imageUrl: string | undefined

    // Upload image to Supabase Storage via presigned URL endpoint
    if (imageFile) {
      const formData = new FormData()
      formData.append("file", imageFile)
      const uploadRes = await fetch("/api/tenant/upload-image", {
        method: "POST",
        body: formData,
      })
      if (uploadRes.ok) {
        const { url } = await uploadRes.json()
        imageUrl = url
      }
    }

    const res = await fetch("/api/tenant/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        images: imageUrl ? [{ url: imageUrl, isPrimary: true }] : [],
      }),
    })

    if (res.ok) {
      router.push("/dashboard/wardrobe")
    } else {
      const data = await res.json()
      setError(data.error ?? "Ошибка сохранения")
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-6">Добавить товар</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image upload */}
        <div>
          <label className="block text-sm text-white/60 mb-2">Фото товара</label>
          {imagePreview ? (
            <div className="relative w-32 h-40 rounded-xl overflow-hidden border border-white/20">
              <Image
                src={imagePreview}
                alt=""
                fill
                sizes="128px"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => { setImagePreview(null); setImageFile(null) }}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-40 rounded-xl border border-dashed border-white/20 cursor-pointer hover:border-violet-500 transition bg-white/5">
              <Upload size={20} className="text-white/30 mb-1" />
              <span className="text-white/30 text-xs">Загрузить</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <Field label="Название" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className={inputCls}
            placeholder="Белая футболка оверсайз"
          />
        </Field>

        <Field label="Категория">
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Цена (сом)" required>
          <input
            type="number"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            required
            min="0"
            step="0.01"
            className={inputCls}
            placeholder="1500"
          />
        </Field>

        <Field label="Бренд">
          <input
            type="text"
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
            className={inputCls}
            placeholder="Zara"
          />
        </Field>

        <Field label="Артикул (SKU)">
          <input
            type="text"
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            className={inputCls}
            placeholder="ZR-001"
          />
        </Field>

        <Field label="Описание">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            className={inputCls}
            placeholder="Мягкая хлопковая ткань..."
          />
        </Field>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isVirtualTryOnEnabled}
            onChange={(e) => update("isVirtualTryOnEnabled", e.target.checked)}
            className="w-4 h-4 rounded accent-violet-500"
          />
          <span className="text-white/70 text-sm">Включить виртуальную примерку</span>
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl bg-white/10 text-white hover:bg-white/15 transition"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Сохраняем..." : "Добавить товар"}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-violet-500"

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1">
        {label}{required && <span className="text-violet-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
