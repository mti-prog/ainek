"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    storeName: "",
    slug: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    if (key === "storeName") {
      const auto = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
      setForm((f) => ({ ...f, slug: auto }))
      setSlugAvailable(null)
    }
  }

  async function checkSlug() {
    if (!form.slug) return
    const res = await fetch(`/api/tenant/check-slug?slug=${form.slug}`)
    const data = await res.json()
    setSlugAvailable(data.available)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/tenant/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Ошибка регистрации")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Ainek</h1>
        <p className="text-white/60">Подключите ваш магазин к платформе</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Название магазина</label>
          <input
            type="text"
            value={form.storeName}
            onChange={(e) => update("storeName", e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
            placeholder="Terranova Bishkek"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">
            URL магазина:{" "}
            <span className="text-violet-400">
              {form.slug || "..."}.ainek.kg
            </span>
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            onBlur={checkSlug}
            required
            pattern="[a-z0-9-]+"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
            placeholder="terranova"
          />
          {slugAvailable === true && (
            <p className="text-green-400 text-xs mt-1">Доступно</p>
          )}
          {slugAvailable === false && (
            <p className="text-red-400 text-xs mt-1">Уже занято</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
            placeholder="owner@store.com"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Пароль</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || slugAvailable === false}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Регистрируем..." : "Создать магазин бесплатно"}
        </button>
      </form>

      <p className="text-white/40 text-xs text-center mt-4">
        14 дней бесплатно · 50 примерок · Без карты
      </p>

      <p className="text-center text-white/50 text-sm mt-4">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-violet-400 hover:underline">
          Войти
        </Link>
      </p>
    </div>
  )
}
